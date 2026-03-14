from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def root(): 
    return {"message": "Test OK"}

@app.post("/dev/market-refresh")
def test(): 
    return {"status": "BE Dev 1 working"}
