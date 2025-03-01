from pydantic import BaseModel
from enum import Enum

class ByClauseValue(Enum):
    month = 'month'
    year = 'year'
    customer_city = 'cutomer_city'

class ContractsCountParams(BaseModel):
    by: ByClauseValue