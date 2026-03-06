from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.transactions import Transaction
from app.schemas.transactions import TransactionCreate, TransactionResponse
from app.models.user import User
from app.core.auth import get_current_user
from app.models.investments import Investment

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


#  Create Transaction
@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    #  1. Check if investment exists and belongs to user
    investment = db.query(Investment).filter(
        Investment.id == transaction.investment_id,
        Investment.user_id == current_user.id
    ).first()

    if not investment:
        raise HTTPException(
            status_code=404,
            detail="Investment not found or does not belong to user"
        )

    #  2. Create transaction
    new_transaction = Transaction(
        user_id=current_user.id,
        investment_id=transaction.investment_id,
        symbol=investment.symbol, #or symbol=investments.symbol
        type=transaction.type,
        quantity=transaction.quantity,
        price=transaction.price,
        fees=transaction.fees
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction
#  Get User Transactions
@router.get("/", response_model=list[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).all()


#  Delete Transaction
@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted"}

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction.symbol = transaction_data.symbol
    transaction.type = transaction_data.type
    transaction.quantity = transaction_data.quantity
    transaction.price = transaction_data.price
    transaction.fees = transaction_data.fees

    db.commit()
    db.refresh(transaction)
    return transaction