from models.transaction_model import Transaction


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


def get_transactions(db, user_id):

    return db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).all()