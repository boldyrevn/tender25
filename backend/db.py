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

    def get_diff_the_base_cost(self, params: DiffBaseCostRequest) -> DiffBaseCostResponse:
        query = """
        SELECT 
            "Id КС",
            "Процент проседания цены",
            AVG("Процент проседания цены") OVER (PARTITION BY "ИНН победителя КС") AS "Средний процент проседания цены по победителю"
        FROM 
            (
            SELECT
                "Id КС",
                "ИНН победителя КС",
                AVG((t."Конечная цена КС (победителя в КС)" - t."Начальная цена КС") / t."Начальная цена КС") * (-100) AS "Процент проседания цены"
            FROM
                tender_wide_table_v1 AS t
            WHERE 1 = 1
            AND t."ИНН победителя КС" LIKE %s
            AND %s < "Окончание КС"
            AND %s > "Окончание КС"
            GROUP BY
                "Id КС", "ИНН победителя КС"
        )
        """

        with self.client.cursor() as cur:
            cur.execute(q, (*params.Interval.get_standart(),))
            result = cur.fetchall()
            return DiffBaseCostResponse(
                top=[DiffBaseCostResponse(
                    id_ks=row[0],
                    ds_mean=row[1],
                    ks_mean=row[2]
                ) for row in result]
            )


    def get_amount_agg(self, params: AmountResultAggRequest) -> AmountResultAggResponse:
        query = """
        SELECT
            SUM(t."Конечная цена КС (победителя в КС)") as "Оборот за период"
        FROM tender_wide_table_v1 as t
            WHERE 1=1
            AND t."ИНН победителя КС" LIKE %s
            AND %s < "Окончание КС"
            AND %s > "Окончание КС"
        GROUP BY
            {group_by}
        ORDER BY
            {order_by}
        """

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

        query = query. \
            replace("{group_by}", groupby_map[params.AggBy]). \
            replace("{order_by}", orderby_map[params.AggBy])

        with self.client.cursor() as cur:
            cur.execute(query, (params.Supplier, *params.Interval.get_standart()))
            result = cur.fetchone()            
            amt = result[0]
            return AmountResultAggResponse(amt=amt)


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
