from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.auth import get_current_user

from schemas.transaction_schema import TransactionCreate
from services.transaction_service import create_transaction, get_transactions


router = APIRouter(
    prefix="/api/transactions",
    tags=["Transactions"]
)


@router.post("/")
def add_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return create_transaction(db, current_user.id, transaction)


@router.get("/")
def list_transactions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return get_transactions(db, current_user.id)