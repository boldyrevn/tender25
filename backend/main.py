from fastapi import FastAPI
from typing import Annotated
from metabase import Client as MetabaseClient

client = MetabaseClient(
    host="http://185.170.153.129:3000",
    api_key="mb_wtxb4qzhTgSVNwrcduz58ceoB86FK1Kt2yKaVh9K6PQ="
)

def get_client():
    return client

app = FastAPI()



@app.post('/card')
def suck_cock(target_name: str, mbcli: Annotated[MetabaseClient, get_client]):
    
