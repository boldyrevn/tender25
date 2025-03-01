import requests
from typing import Union, Optional
from cards import ByClauseValue
from pydantic import BaseModel


class CreateCard(BaseModel):
    class DataSetQuery(BaseModel):
        database: int
        type: str = "native"
        native: dict

    name: str
    visualization_settings: dict = dict()
    dataset_query: DataSetQuery
    display: str
    description: Optional[str] = None
    visualization_settings: dict
    dashboard_id: int

class Client:
    host: str
    api_key: str

    def __init__(self, host, api_key):
        self.host = host
        self.api_key = api_key

    def contract_counts(self, by: ByClauseValue, dashboard_id: int):
        payload = CreateCard(
            dataset_query=CreateCard.DataSetQuery(
                database=2,
                native={
                    "query": f"select * from tenderfixed"
                }
            ),
            display="table",
            dashboard_id=dashboard_id,
            name="ацкая дрочильня"
        )

        headers = {"X-API-KEY": self.api_key}
        print(payload.model_dump_json())
        response = requests.post(f"http://{self.host}/api/card", json=payload.model_dump(), headers=headers)
        print(response.status_code)
        print(response.content.decode())

    def regions_percantage(
            self, 
            ks_id: Optional[str ]= None, 
            inn_winner: Optional[str] = None, 
            inn_customer: Optional[str] = None, 
            law: Optional[str] = None
        ):
        q = """
            SELECT
            "Регион победителя КС",
            SUM("Конечная цена КС (победителя в КС)") / (SELECT SUM("Конечная цена КС (победителя в КС)") FROM tender_wide_table_v1) * 100 AS "Доля региона"
            FROM
            tender_wide_table_v1
            WHERE
            1 = 1 
        """
        if ks_id is not None:
            q += f'AND "Id КС" = {ks_id}\n'
        if inn_winner is not None:
            q += f'AND "ИНН победителя КС" = {inn_winner}\n'
        if inn_customer is not None:
            q += f'AND "ИНН заказчика" = {inn_customer}\n'
        if law is not None:
            q += f'AND "Закон-основание" = {law}\n'

        q += 'GROUP BY "Регион победителя КС"'

        payload = CreateCard(
            dataset_query=CreateCard.DataSetQuery(
                database=2,
                native={
                    "query": q
                }
            ),
            display="pie",
            dashboard_id=3,
            name="хачу пиццы",
            visualization_settings={
                "table.cell_column": "Доля региона",
                "pie.percent_visibility": "legend",
                "pie.slice_threshold": 0.1,
                "pie.show_total": False
            },
        )

        headers = {"X-API-KEY": self.api_key}
        response = requests.post(f"http://{self.host}/api/card", json=payload.model_dump(), headers=headers)
        print(response.status_code)

cli = Client("185.170.153.129:3000", "mb_wtxb4qzhTgSVNwrcduz58ceoB86FK1Kt2yKaVh9K6PQ=")
cli.regions_percantage(ks_id='9393122')

