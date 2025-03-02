import psycopg2
import psycopg2.extras
import psycopg2.pool

from model import *

class DataRepository:
    def __init__(self, host: str, port: str, user: str, password: str, db: str):
        self.client = psycopg2.connect(
            user=user, 
            port=port, 
            host=host, 
            password=password,
            database=db
        )

    def get_participation(self, params: ParticipationResultsRequest) -> ParticipationResultResponse:
        q_count_won = """
SELECT
  COUNT(DISTINCT "Id КС")
FROM
  tender_wide_table_v1
WHERE
  1 = 1
  AND "ИНН участников" = %s
  AND "ИНН участников" = "ИНН победителя КС"
  AND %s < "Окончание КС"
  AND %s > "Окончание КС"
"""

        q_count_lose = """
SELECT
  COUNT(DISTINCT "Id КС")
FROM
  tender_wide_table_v1
WHERE
  1 = 1 
  AND "ИНН участников" = %s
  AND "ИНН участников" != "ИНН победителя КС"
  AND %s < "Окончание КС"
  AND %s > "Окончание КС"
"""
        q_perc_won = """
SELECT
  Round((COUNT(DISTINCT CASE WHEN "ИНН участников" = "ИНН победителя КС" THEN "Id КС" END) * 100.0) / 
  COUNT(DISTINCT "Id КС"), 2) AS "Процент выигранных КС"
FROM
  tender_wide_table_v1
WHERE
  1 = 1
  AND "ИНН участников" = %s
  AND %s < "Окончание КС"
  AND %s > "Окончание КС"
"""
        with self.client.cursor() as cur:
            cur.execute(q_count_won, (params.Supplier, *params.Interval.get_standart()))
            won = cur.fetchone()[0]

            cur.execute(q_count_lose, (params.Supplier, *params.Interval.get_standart()))
            lose = cur.fetchone()[0]

            cur.execute(q_perc_won, (params.Supplier, *params.Interval.get_standart()))
            won_perc = cur.fetchone()[0]
            return ParticipationResultResponse(won=won, lose=lose, won_perc=won_perc)


    def get_participation_agg(self, params: ParticipationResultAggRequest) -> ParticipationResultResponse:
        q_template = """
SELECT
  {extract}
  {aggregation}
FROM
  tender_wide_table_v1
WHERE
  1 = 1
  AND "ИНН участников" = %s
  AND %s < "Окончание КС"
  AND %s > "Окончание КС"
GROUP BY
  {group_by}
ORDER BY
  {order_by}
"""
        extract_map = {
            AggByType.Month: """
  EXTRACT(YEAR FROM "Окончание КС") AS "Год",
  EXTRACT(MONTH FROM "Окончание КС") AS "Месяц",
""",
            AggByType.Quarter: """
  EXTRACT(YEAR FROM "Окончание КС") AS "Год",
  EXTRACT(QUARTER FROM "Окончание КС") AS "Квартал",
""",
            AggByType.Year: """
  EXTRACT(YEAR FROM "Окончание КС") AS "Год",
"""
        }

        groupby_map = {
            AggByType.Month: """
  EXTRACT(YEAR FROM "Окончание КС"),
  EXTRACT(MONTH FROM "Окончание КС")
""",
            AggByType.Quarter: """
  EXTRACT(YEAR FROM "Окончание КС"),
  EXTRACT(QUARTER FROM "Окончание КС")
""",
            AggByType.Year: """
  EXTRACT(YEAR FROM "Окончание КС")
"""
        }

        orderby_map = {
            AggByType.Month: """
  "Год", "Месяц";
""",
            AggByType.Quarter: """
  "Год", "Квартал";
""",
            AggByType.Year: """
  "Год";
"""
        }

        q_template = q_template. \
            replace("{extract}", extract_map[params.AggBy]). \
            replace("{group_by}", groupby_map[params.AggBy]). \
            replace("{order_by}", orderby_map[params.AggBy])
        
        q_won = q_template. \
            replace("{aggregation}", """
  COUNT(DISTINCT CASE WHEN "ИНН участников" = "ИНН победителя КС" THEN "Id КС" END) AS "Количество выигранных КС"
""")
        
        q_lose = q_template. \
            replace("{aggregation}", """
  COUNT(DISTINCT CASE WHEN "ИНН участников" != "ИНН победителя КС" THEN "Id КС" END) AS "Количество проигранных КС"
""")
        
        q_won_perc = q_template. \
            replace("{aggregation}", """
  ROUND(
    (COUNT(DISTINCT CASE WHEN "ИНН участников" = "ИНН победителя КС" THEN "Id КС" END) * 100.0) / 
    COUNT(DISTINCT "Id КС"), 
    2
  ) AS "Процент выигранных КС"
""")
        
        with self.client.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(q_won, (params.Supplier, *params.Interval.get_standart()))
            won = cur.fetchall()

            cur.execute(q_lose, (params.Supplier, *params.Interval.get_standart()))
            lose = cur.fetchall()

            cur.execute(q_won_perc, (params.Supplier, *params.Interval.get_standart()))
            won_perc = cur.fetchall()

            return ParticipationResultAggResponse(
                won=[dict(row) for row in won],
                lose=[dict(row) for row in lose],
                won_perc=[dict(row) for row in won_perc]
            )


    def get_category_high_demand(self, params: CategoryHighDemandRequest) -> CategoryHighDemandResponse:
        q = """
select 
	t2."Наименование КПГЗ",
	count(*)/count(distinct t2."ИНН участников") as "Коэффицент спроса"
from (
	select distinct
		t."Id КС",
		t."ID СТЕ",
		t."Код КПГЗ",
		t."Наименование КПГЗ",
		t."ИНН участников"
	from tender_wide_table_v1 as t
	where 1=1
	and t."Окончание КС" > %s
	and t."Окончание КС" < %s
) as t2
group by t2."Наименование КПГЗ"
order by "Коэффицент спроса" DESC
limit 5;
"""
        with self.client.cursor() as cur:
            cur.execute(q, (*params.Interval.get_standart(),))
            result = cur.fetchall()
            return CategoryHighDemandResponse(
                top=[CategoryDemand(
                    category_name=row[0],
                    demand_factor=row[1]
                ) for row in result]
            )


    def get_category_highest(self, params: CategoryRequest) -> CategoryResponse:
        q_high_demand = """
select 
	t2."Наименование КПГЗ",
	count(*) as "Коэффицент спроса"
from (
	select distinct
		t."Id КС",
		t."ID СТЕ",
		t."Наименование КПГЗ"
	from tender_wide_table_v1 as t
	where 1=1
	and t."Окончание КС" > %s
	and t."Окончание КС" < %s
) as t2
group by t2."Наименование КПГЗ"
order by "Коэффицент спроса" DESC
limit 5;
"""

        q_high_wins = """
select 
	t."Наименование КПГЗ",
	count(distinct t."ИНН победителя КС") as "Количество выигранных сессий"
from tender_wide_table_v1 as t
where 1=1
and t."ИНН участников" like %s
and t."Окончание КС" > %s
and t."Окончание КС" < %s
group by "Наименование КПГЗ"
order by "Количество выигранных сессий" DESC
limit 5;
"""

        q_high_concurrency = """
select 
	t."Наименование КПГЗ",
	count(distinct t."ИНН участников") as "Категории с наибольшим соперничеством"
from tender_wide_table_v1 as t
where 1=1
and t."Id КС" in (select distinct "Id КС" from tender_wide_table_v1 as t where "ИНН участников" like %s)
and t."Окончание КС" > %s
and t."Окончание КС" < %s
group by "Наименование КПГЗ"
order by "Категории с наибольшим соперничеством" DESC
limit 5;
"""

        with self.client.cursor() as cur:
            cur.execute(q_high_demand, (*params.Interval.get_standart(),))
            high_demand = cur.fetchall()

            cur.execute(q_high_wins, (params.supplier, *params.Interval.get_standart(),))
            high_wins = cur.fetchall()

            cur.execute(q_high_concurrency, (params.supplier, *params.Interval.get_standart(),))
            high_concurrency = cur.fetchall()

            return CategoryResponse(
                highest_demand=[Category(
                    category_name=row[0],
                    value_type="Коэффициент спроса",
                    value=row[1]
                ) for row in high_demand],
                highest_wins=[Category(
                    category_name=row[0],
                    value_type="Количество выигранных сессий",
                    value=row[1]
                ) for row in high_wins],
                highest_concurrency=[Category(
                    category_name=row[0],
                    value_type="Количество соперников",
                    value=row[1]
                ) for row in high_concurrency]
            )

    def get_victory_stat(self, params: VictoryStatRequest) -> VictoryStatResponse:
        q_v_stat = """
SELECT 
    temp_table.cnt_unique_contracts AS число_выполненных_оферт, 
    COUNT(*) AS "число_заказчиков"
FROM (
    SELECT 
        twt."ИНН заказчика", 
        twt."ИНН победителя КС", 
        COUNT(DISTINCT twt."ИНН победителя КС" || twt."Id КС") AS cnt_unique_contracts
    FROM tender_wide_table_v1 AS twt 
    WHERE 1=1
    AND twt."ИНН заказчика" = %s
    AND %s < "Окончание КС"
  	AND %s > "Окончание КС"
    GROUP BY twt."ИНН заказчика", twt."ИНН победителя КС"
) AS temp_table
GROUP BY temp_table.cnt_unique_contracts;
"""

        with self.client.cursor() as cur:
            cur.execute(q_v_stat, (params.Supplier, *params.Interval.get_standart()))
            victory_stat_base = cur.fetchall()

            return ParticipationResultAggResponse(
                victory_stat_base=[dict(row) for row in victory_stat_base],
            )