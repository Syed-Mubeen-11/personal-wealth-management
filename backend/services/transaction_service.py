from models.transaction_model import Transaction
from sqlalchemy.orm import Session
from sqlalchemy import desc


def create_transaction(db, user_id, data):

    transaction = Transaction(
        user_id=user_id,
        symbol=data.symbol,
        type=data.type,
        quantity=data.quantity,
        price=data.price,
        fees=data.fees
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


def get_transactions(db: Session, user_id: int):
    return db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).order_by(desc(Transaction.id)).all()