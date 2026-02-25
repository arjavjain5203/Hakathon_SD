from pydantic import BaseModel, Field
from typing import List, Optional

class UserCreate(BaseModel):
    user_id: Optional[str] = None
    name: str

class ExpenseCreate(BaseModel):
    expense_id: Optional[str] = None
    description: str
    total_amount: float = Field(gt=0, description="The total amount must be greater than zero")
    paid_by: str
    participants: List[str]

class BalanceStatement(BaseModel):
    statement: str
    person_in_debt_name: str
    person_owed_name: str
    amount: float
