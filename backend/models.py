from enum import Enum
from pydantic import BaseModel
from datetime import datetime, timedelta

class CardType(str, Enum):
    ContractsCount = 'contracts_count'

class CardRequest(BaseModel):
    name: str
    description: str
    type: CardType
    parameters: dict

class DashboardRequest(BaseModel):
    name: str
    starts_from: datetime
    interval: timedelta
    cards: list[CardRequest]

c = CardRequest.model_validate(c)
print(c)