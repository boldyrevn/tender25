from datetime import timedelta, datetime, timezone
from fastapi import FastAPI, Depends
from typing import Annotated
from db import DataRepository
from model import *

app = FastAPI()

pgclient = DataRepository(
    host="185.170.153.129",
    port="5432",
    user="tender",
    password="tenderpass",
    db="tenderdb"
)
def get_pg():
    return pgclient

@app.post('/participation')
def participation(params: ParticipationResultsRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_participation(params)

@app.post('/participation/aggby')
def participation_aggby(params: ParticipationResultAggRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_participation_agg(params)
