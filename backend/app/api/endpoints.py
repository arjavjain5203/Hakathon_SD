from fastapi import APIRouter, HTTPException
import uuid

from app.models.schemas import UserCreate, ExpenseCreate
from app.services.splitter_service import splitter

router = APIRouter()

@router.post("/users", status_code=201)
def create_user(user: UserCreate):
    try:
        user_id = user.user_id or str(uuid.uuid4())
        return splitter.add_user(user_id=user_id, name=user.name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})

@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: str):
    try:
        splitter.delete_user(user_id)
        return {"ok": True}
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"error": str(e)})

@router.get("/users")
def get_users():
    return splitter.get_users()

@router.post("/expenses", status_code=201)
def add_expense(expense: ExpenseCreate):
    try:
        expense_id = expense.expense_id or str(uuid.uuid4())
        return splitter.add_expense(
            expense_id=expense_id,
            description=expense.description,
            total_amount=expense.total_amount,
            paid_by=expense.paid_by,
            participants=expense.participants
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})

@router.get("/expenses")
def get_expenses():
    return splitter.get_expenses()

@router.get("/balances")
def get_balances():
    return splitter.get_balances()
