from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from db import DataRepository
from model import *

import json

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

@app.post('/diff_base_cost', response_model=DiffBaseCostResponse)
def participation(params: DiffBaseCostRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_diff_the_base_cost(params)

@app.post('/amount/aggby', response_model=AmountResultAggResponse)
def participation(params: AmountResultAggRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_amount_agg(params)

@app.post('/amount/sessions', response_model=AmountResultSessionResponse)
def participation(params: AmountResultSessionRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_amount_sessions(params)

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

@app.post('/dashboard')
def dashboard(params: DashboardSchema, db: Annotated[DataRepository, Depends(get_pg)]):
    id = db.create_dashboard_schema(params.name, params.model_dump_json())
    cfg = {
        "host":"185.170.153.129",
        "port":"5432",
        "user":"tender",
        "password":"tenderpass",
        "db":"tenderdb"
    }
    print(id)

@app.post('/victory-stat', response_model=VictoryStatResponse)
def victory_stat(params: VictoryStatRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_victory_stat(params)

@app.post('/competitors', response_model=CompetitorsInCSResponse)
def competitors(params: CompetitorsInCSRequest, db: Annotated[DataRepository, Depends(get_pg)]):
    return db.get_competitors(params)

# @app.post('/popular_category', response_model=PopularCategoryResponse)
# def popular_category(params: PopularCategoryRequest, db: Annotated[DataRepository, Depends(get_pg)]):
#     return db.get_popular_category(params)
