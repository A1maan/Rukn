from fastapi import FastAPI
from .routes.predict import router as predict_router

app = FastAPI(title="RUKN Backend")

@app.get("/health")
def health():
    return {"status": "ok"}

# Include routes
app.include_router(predict_router)
