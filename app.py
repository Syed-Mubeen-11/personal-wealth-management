from flask import Flask, render_template, request, redirect, url_for
import sqlite3
import os

app = Flask(__name__)

DB_NAME = "users.db"

# Initialize database and table
def init_db():
    # If database does not exist, it will be created
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def create_transactions_table():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            symbol TEXT,
            type TEXT,
            quantity REAL,
            price REAL,
            fees REAL,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()
create_transactions_table()

@app.route('/add_transaction', methods=['POST'])
def add_transaction():
    user_id = request.form['user_id']
    symbol = request.form['symbol']
    type = request.form['type']
    quantity = request.form['quantity']
    price = request.form['price']
    fees = request.form['fees']

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO transactions 
        (user_id, symbol, type, quantity, price, fees)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, symbol, type, quantity, price, fees))

    conn.commit()
    conn.close()

    return "Transaction Added Successfully"

@app.route('/add_transaction_form')
def add_transaction_form():
    return render_template('add_transaction.html')

@app.route('/view_transactions/<int:user_id>')
def view_transactions(user_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
        SELECT id, symbol, type, quantity, price, fees, executed_at
        FROM transactions
        WHERE user_id = ?
    ''', (user_id,))

    transactions = cursor.fetchall()
    conn.close()

    return render_template('view_transactions.html', transactions=transactions)

@app.route('/delete_transaction/<int:transaction_id>')
def delete_transaction(transaction_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('DELETE FROM transactions WHERE id = ?', (transaction_id,))

    conn.commit()
    conn.close()

    return "Transaction Deleted Successfully"

@app.route('/edit_transaction/<int:transaction_id>')
def edit_transaction(transaction_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM transactions WHERE id = ?', (transaction_id,))
    transaction = cursor.fetchone()

    conn.close()

    return render_template('edit_transaction.html', transaction=transaction)

@app.route('/update_transaction/<int:transaction_id>', methods=['POST'])
def update_transaction(transaction_id):
    symbol = request.form['symbol']
    type = request.form['type']
    quantity = request.form['quantity']
    price = request.form['price']
    fees = request.form['fees']

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE transactions
        SET symbol = ?, type = ?, quantity = ?, price = ?, fees = ?
        WHERE id = ?
    ''', (symbol, type, quantity, price, fees, transaction_id))

    conn.commit()
    conn.close()

    return "Transaction Updated Successfully"

@app.route('/all_transactions')
def all_transactions():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
        SELECT id, user_id, symbol, type, quantity, price, fees, executed_at
        FROM transactions
    ''')

    transactions = cursor.fetchall()
    conn.close()

    return render_template('view_transactions.html', transactions=transactions)

# Home page
@app.route('/')
def home():
    return render_template('index.html')

# Register route
@app.route('/register', methods=['POST'])
def register():
    name = request.form['name']
    email = request.form['email']
    password = request.form['password']

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                       (name, email, password))
        conn.commit()
    except sqlite3.OperationalError as e:
        print("Database error:", e)
        return "Database error! Please check console."
    finally:
        conn.close()

    # Redirect to users table
    return redirect(url_for('users'))

# Login page
@app.route('/login')
def login_page():
    return render_template('login.html')

# Handle login form
@app.route('/login', methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        # Login successful, redirect to users page (or home)
        return redirect(url_for('users'))
    else:
        # Login failed, show error on login page
        return render_template('login.html', error="Invalid email or password")

# View all registered users
@app.route('/users')
def users():
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email FROM users")
        users_data = cursor.fetchall()
    except sqlite3.OperationalError as e:
        print("Database error:", e)
        users_data = []
    finally:
        conn.close()

    return render_template('users.html', users=users_data)

@app.route('/check_tables')
def check_tables():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    conn.close()
    return str(tables)

# Run app
if __name__ == '__main__':
    init_db()  # Ensure DB and table exist before running
    app.run(debug=True)