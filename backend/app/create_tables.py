from .database import engine, Base 
from .goals import models 
Base.metadata.create_all(bind=engine) 
print("? Tables created successfully in the database!") 
