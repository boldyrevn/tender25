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
    Supplier: Optional[str] = None

class ParticipationResultResponse(BaseModel):
    won: int
    lose: int
    won_perc: float


class ParticipationResultAggRequest(BaseModel):
    Interval: Interval
    Supplier: str = None
    AggBy: AggByType

class ParticipationResultAggResponse(BaseModel):
    won: list[dict]
    lose: list[dict]
    won_perc: list[dict]

