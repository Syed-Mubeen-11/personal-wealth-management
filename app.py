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

# Run app
if __name__ == '__main__':
    init_db()  # Ensure DB and table exist before running
    app.run(debug=True)