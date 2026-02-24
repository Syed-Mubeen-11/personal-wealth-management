import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# 1. Load the hidden variables from the .env file
load_dotenv()

# 2. Fetch the URL securely (without typing the password in the code)
DATABASE_URL = os.getenv("DATABASE_URL")

# 3. Safety check to ensure the URL was found
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing! Please check your .env file.")

# 4. Standard PostgreSQL connection setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()