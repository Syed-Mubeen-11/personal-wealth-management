from simulation_engine import calculate_future_value
import json
from flask import Flask, render_template, request, redirect, url_for
import sqlite3
import os
from services.recommendation_service import generate_recommendation
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

app = Flask(__name__)

DB_NAME = "users.db"

# Initialize database and table
def init_db():
    # If database does not exist, it will be created
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # Create table if not exists
    cursor.execute("""
CREATE TABLE IF NOT EXISTS simulations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    scenario_name TEXT,
    assumptions TEXT,
    results TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
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

def create_simulations_table():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS simulations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        goal_id INTEGER,
        scenario_name TEXT,
        assumptions TEXT,
        results TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

@app.route('/add_transaction', methods=['GET', 'POST'])
def add_transaction():
    if request.method == 'POST':
        user_id = request.form['user_id']
        symbol = request.form['symbol']
        type = request.form['type']
        quantity = request.form['quantity']
        price = request.form['price']
        fees = request.form['fees']   # ✅ new

        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO transactions (user_id, symbol, type, quantity, price, fees)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, symbol, type, quantity, price, fees))

        conn.commit()
        conn.close()

        return redirect('/view_transactions')

    return render_template('add_transaction.html')

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

@app.route('/delete_users/<int:users_id>')
def delete_users(users_id):

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM users WHERE id = ?", (users_id,))

    conn.commit()
    conn.close()

    return redirect('/users')

@app.route('/check_tables')
def check_tables():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    conn.close()
    return str(tables)

@app.route('/simulate', methods=['POST'])
def simulate():

    # 1. Get input
    data = request.get_json()
    monthly = float(data['monthly_contribution'])
    rate = float(data['annual_return'])
    years = int(data['years'])

    # 2. Call your logic
    result = calculate_future_value(monthly, rate, years)

    # 3. SAVE TO DB (PUT YOUR CODE HERE 👇)
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO simulations (user_id, scenario_name, assumptions, results)
    VALUES (?, ?, ?, ?)
    """, (
        1,
        "Base Case",
    json.dumps({"monthly":1000,"rate":10,"years":2}),
      json.dumps(result)
    ))
        

    conn.commit()
    conn.close()

    # 4. Return result
    return {"result": result}

@app.route("/recommendation")
def recommendation():
    import sqlite3
    import json

    result = generate_recommendation(1)

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO simulations (user_id, scenario_name, assumptions, results)
    VALUES (?, ?, ?, ?)
    """, (
        1,
        "Recommendation",
        json.dumps({"risk": result["risk"]}),
        json.dumps(result)
    ))

    conn.commit()
    conn.close()

    return result

@app.route("/view_recommendations")
def view_recommendations():
    import sqlite3

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM simulations")
    data = cursor.fetchall()

    conn.close()

    return str(data)

@app.route("/rebalance")
def rebalance():
    return {
        "message": "Based on your allocation, reduce bonds and increase stocks.",
        "status": "Rebalance suggestion generated"
    }

@app.route('/test')
def test():
    result = calculate_future_value(1000, 10, 2)
    return {"result": result}

# Run app
print("TEST START")
print(calculate_future_value(1000,10,2,))
if __name__ == '__main__':
    init_db()  # Ensure DB and table exist before running
    app.run(debug=True)
