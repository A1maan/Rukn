# app/routes/predict.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PredictInput(BaseModel):
    text: str
    consent: bool = False
    region_code: str | None = None

@router.post("/predict")
def predict(payload: PredictInput):
    # No DB, just echo
    return {"ok": True, "echo": payload.model_dump()}
