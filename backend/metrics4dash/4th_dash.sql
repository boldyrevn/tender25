select * from tender_wide_table_v1 twtv

-- число поставшиков выполнившее n кол-во оферт для данного заказчика (1!!!)

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
    AND twt."ИНН заказчика" = '7703800010'
    --AND {date_from} < "Окончание КС"
  	--AND {date_to} > "Окончание КС"
    GROUP BY twt."ИНН заказчика", twt."ИНН победителя КС"
) AS temp_table
GROUP BY temp_table.cnt_unique_contracts;

-- среднее кол-во конкурентов в сессии (2!!!)

SELECT
  ROUND(AVG(competitors_count), 2) AS "Среднее количество конкурентов в сессии"
FROM (
  SELECT
    tender_wide_table_v1."Id КС",
    COUNT(DISTINCT "ИНН участников") - 1 AS competitors_count
  FROM
    tender_wide_table_v1
  where 1 = 1
  --AND {date_from} < "Окончание КС"
  --AND {date_to} > "Окончание КС"
  GROUP BY
    tender_wide_table_v1."Id КС"
) AS competitors_per_session;

-- кол-во конкурентов в сессииях по конкретному поставщику (2!!!)

SELECT
  ROUND(AVG(competitors_count), 2) AS "Среднее количество конкурентов в сессии для поставщика"
FROM (
  SELECT
    s."Id КС",
    COUNT(DISTINCT t."ИНН участников") - 1 AS competitors_count
  FROM
    tender_wide_table_v1 s
  JOIN
    tender_wide_table_v1 t
    ON s."Id КС" = t."Id КС"
  WHERE
    s."ИНН участников" = {customer_inn}
    AND {date_from} < s."Окончание КС"
    AND {date_to} > s."Окончание КС"
  GROUP BY
    s."Id КС"
  HAVING
    COUNT(DISTINCT t."ИНН участников") > 1
) AS competitors_per_session;

-- ДОЛЯ НА РЫНКЕ ПО КАТЕГОРИЯМ САМЫМ ПОПУЛЯРНЫМ КАТЕГОРЯМ ДЛЯ ЗАКАЗЧИКА (3!!!)

SELECT
  "Наименование КПГЗ",
  ROUND(
    COUNT(DISTINCT CASE WHEN "ИНН участников" = {customer_inn} AND "ИНН участников" = "ИНН победителя КС" THEN "Id КС" END) * 100 /
    COUNT(DISTINCT "Id КС"),
    2
  ) AS "Доля на рынке по категориям КПГЗ, %"
FROM
  tender_wide_table_v1
WHERE
  1 = 1
  AND {date_from} < "Окончание КС"
  AND {date_to} > "Окончание КС"
GROUP BY
  "Наименование КПГЗ"
order by "Доля на рынке по категориям КПГЗ, %" desc
limit 10

-- в рарезе региона поставщика (3!!!)

'''
то есть приходит в поле filtered: "город поставщика"
'''

SELECT
  "Наименование КПГЗ",
  ROUND(
    COUNT(DISTINCT CASE WHEN "ИНН участников" = {customer_inn} AND "ИНН участников" = "ИНН победителя КС" THEN "Id КС" END) * 100 /
    COUNT(DISTINCT "Id КС"),
    2
  ) AS "Доля на рынке по категориям КПГЗ в рамках региона, %"
FROM
  tender_wide_table_v1
WHERE
  1 = 1
  AND {date_from} < "Окончание КС"
  AND {date_to} > "Окончание КС"
  AND "город поставщика" = (
    SELECT "город поставщика"
    FROM tender_wide_table_v1
    WHERE "ИНН участников" = {customer_inn}
    LIMIT 1
  )
GROUP BY
  "Наименование КПГЗ"
ORDER BY
  "Доля на рынке по категориям КПГЗ в рамках региона, %" DESC
LIMIT 10;

-- Частота встречаемости конкретных конкурентов (ТОП-5 главных соперников) (4!!!)
-- не настраиваемая метрика, только страндартная фильтрация по периоду

SELECT
  REGEXP_REPLACE(t2."Участники КС - поставщики", '^ИНН:\d+\s+', '') AS competitor_name,
  COUNT(DISTINCT t1."Id КС") AS encounter_count
FROM
  tender_wide_table_v1 t1
JOIN
  tender_wide_table_v1 t2
  ON t1."ИНН участников" = t2."ИНН участников"
WHERE
  1 = 1
  AND t1."ИНН участников" != {customer_inn}
  AND {date_from} < "Окончание КС"
  AND {date_to} > "Окончание КС"
  AND t1."Id КС" IN (
    SELECT "Id КС"
    FROM tender_wide_table_v1
    WHERE "ИНН участников" = {customer_inn}
  )
GROUP BY
  t2."Участники КС - поставщики"
ORDER BY
  encounter_count DESC
LIMIT 5;