from pydantic import BaseModel
from typing import Optional, Union
from datetime import datetime, timedelta, timezone
from enum import Enum

def suck_smthng(what: str):
    print(f'i do love to suck {what}!')

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


class DiffBaseCostRequest(BaseModel):
    Interval: Interval
    Supplier: Optional[str] = None

class DiffBaseCost(BaseModel):
    id_ks: str
    ds_mean: float
    ks_mean: float

class DiffBaseCostResponse(BaseModel):
    diff: list[DiffBaseCost]


class AmountResultSessionRequest(BaseModel):
    Interval: Interval
    Supplier: Optional[str] = None

class AmountResultSession(BaseModel):
    id_ks: str
    amt: float

class AmountResultSessionResponse(BaseModel):
    diff: list[AmountResultSession]


class AmountResultAggRequest(BaseModel):
    Interval: Interval
    Supplier: Optional[str] = None
    AggBy: AggByType

class AmountResultAggResponse(BaseModel):
    amt: float


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


class GraphType(Enum):
    DiffBaseCost = 'diff_base_cost'
    AmountResultSession = 'amount_result_session'
    AmountResultAgg = 'amount_result_agg'
    ParticipationResult = 'participation_result'
    ParticipationResultAgg = 'participatino_result_agg'
    CategoryHighDemand = 'category_high_demand'
    Category = 'category'


class Graph(BaseModel):
    type: GraphType
    graph: Union[
        DiffBaseCostRequest,
        AmountResultSessionRequest,
        AmountResultAggRequest,
        ParticipationResultsRequest,
        ParticipationResultAggRequest,
        CategoryHighDemandRequest,
        CategoryRequest
    ]

class DashboardSchema(BaseModel):
    name: str
    interval: Interval
    date_from: datetime
    date_to: datetime
    graphs: list[Graph]
class VictoryStatRequest(BaseModel):
    Interval: Interval
    Supplier: str

class VictoryStat(BaseModel):
    offer_cnt: int
    supplier_cnt: int
class VictoryStatResponse(BaseModel):
    victory_stat_base: list[VictoryStat]

class CompetitorsInCSRequest(BaseModel):
    Interval: Interval

class CompetitorsInCSResponse(BaseModel):
    cnt_competitors: int

