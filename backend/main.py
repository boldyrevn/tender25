from datetime import timedelta, datetime, timezone
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from db import DataRepository
from model import *

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

pgclient = DataRepository(
    host="185.170.153.129",
    port="5432",
    user="tender",
    password="tenderpass",
    db="tenderdb"
)
def get_pg():
    return pgclient

@app.post('/diff_base_cost')
def participation(params: DiffBaseCostRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_diff_the_base_cost(params)

@app.post('/amount/aggby')
def participation(params: AmountResultAggRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_amount_agg(params)

@app.post('/participation', response_model=ParticipationResultResponse)
def participation(params: ParticipationResultsRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_participation(params)

@app.post('/participation/aggby', response_model=ParticipationResultAggResponse)
def participation_aggby(params: ParticipationResultAggRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_participation_agg(params)

@app.post('/category/high-demand', response_model=CategoryHighDemandResponse)
def category_high_demand(params: CategoryHighDemandRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_category_high_demand(params)

@app.post('/category', response_model=CategoryResponse)
def category(params: CategoryRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_category_highest(params)
