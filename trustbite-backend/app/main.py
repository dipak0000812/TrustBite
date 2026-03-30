from fastapi import FastAPI

app = FastAPI(title="TrustBite API")

@app.get("/")
def root():
    return {"message": "TrustBite backend running"}