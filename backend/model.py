from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta, timezone
from enum import Enum

class Interval(BaseModel):
    days: int = 0
    weeks: int = 0
    months: int = 0

    def get_standart(self) -> tuple[datetime, datetime]:
        date_to = datetime.now(timezone.utc)
        interval = timedelta(
        days=self.days+self.months*30, 
            weeks=self.weeks
        )
        date_from = date_to - interval
        return date_from, date_to
    

class AggByType(Enum):
    Month = 'Month'
    Quarter = 'Quarter'
    Year = 'Year'


class ParticipationResultsRequest(BaseModel):
    Interval: Interval
    Supplier: str

class ParticipationResultResponse(BaseModel):
    won: int
    lose: int
    won_perc: float


class ParticipationResultAggRequest(BaseModel):
    Interval: Interval
    Supplier: str
    AggBy: AggByType

class ParticipationResultAggResponse(BaseModel):
    won: list[dict]
    lose: list[dict]
    won_perc: list[dict]


class CategoryHighDemandRequest(BaseModel):
    Interval: Interval

class CategoryDemand(BaseModel):
    category_name: str
    demand_factor: float

class CategoryHighDemandResponse(BaseModel):
    top: list[CategoryDemand]


class CategoryRequest(BaseModel):
    Interval: Interval
    supplier: str

class Category(BaseModel):
    category_name: str
    value_type: str
    value: int

class CategoryResponse(BaseModel):
    highest_demand: list[Category]
    highest_concurrency: list[Category]
    highest_wins: list[Category]

class VictoryStatRequest(BaseModel):
    Interval: Interval
    Supplier: str

class VictoryStat(BaseModel):
    offer_cnt: int
    supplier_cnt: int
class VictoryStatResponse(BaseModel):
    victory_stat_base: list[VictoryStat]


