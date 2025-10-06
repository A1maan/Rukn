# backend/app/main.py
"""
Rukn - NCMH Mental Health Feedback Analysis Backend
Loads MARBERT models from local models/ folder
"""

import json
import os
from typing import List
from pathlib import Path

import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# -------------------------
# Configuration
# -------------------------
BASE_DIR = Path(__file__).parent.parent
URGENCY_MODEL_DIR = BASE_DIR / "models" / "urgency_model"
EMOTION_MODEL_DIR = BASE_DIR / "models" / "emotion_model"
MAX_LEN = 256
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# -------------------------
# Model Definitions
# -------------------------
class UrgencyMARBERT(nn.Module):
    def __init__(self, model_name, num_classes, dropout=0.2):
        super().__init__()
        self.encoder = AutoModel.from_pretrained(model_name)
        hidden = self.encoder.config.hidden_size
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(hidden, num_classes)
    
    def forward(self, input_ids, attention_mask, token_type_ids=None):
        out = self.encoder(input_ids=input_ids, attention_mask=attention_mask, token_type_ids=token_type_ids)
        cls = out.last_hidden_state[:, 0, :]
        cls = self.dropout(cls)
        return self.classifier(cls)

class EmotionMARBERT(nn.Module):
    def __init__(self, model_name, num_classes, dropout=0.2):
        super().__init__()
        self.encoder = AutoModel.from_pretrained(model_name)
        hidden = self.encoder.config.hidden_size
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(hidden, num_classes)
    
    def forward(self, input_ids, attention_mask, token_type_ids=None):
        out = self.encoder(input_ids=input_ids, attention_mask=attention_mask, token_type_ids=token_type_ids)
        cls = out.last_hidden_state[:, 0, :]
        cls = self.dropout(cls)
        return self.classifier(cls)

# -------------------------
# Load Urgency Model
# -------------------------
print(f"Loading urgency model from {URGENCY_MODEL_DIR}...")

with open(URGENCY_MODEL_DIR / "inference_meta.json", "r", encoding="utf-8") as f:
    urgency_meta = json.load(f)

urgency_labels = urgency_meta["urgency_labels"]
temperature_urg = urgency_meta["temperature"]
tau_high = urgency_meta["tau_high"]
num_urgency = len(urgency_labels)

urgency_tokenizer = AutoTokenizer.from_pretrained(str(URGENCY_MODEL_DIR))
urgency_model = UrgencyMARBERT("UBC-NLP/MARBERT", num_urgency, dropout=0.2)
urgency_checkpoint = torch.load(URGENCY_MODEL_DIR / "best_urgency.pt", map_location=DEVICE)
urgency_model.load_state_dict(urgency_checkpoint["model"])
urgency_model.to(DEVICE)
urgency_model.eval()

print(f"✅ Urgency model loaded: {urgency_labels}")

# -------------------------
# Load Emotion Model
# -------------------------
print(f"Loading emotion model from {EMOTION_MODEL_DIR}...")

with open(EMOTION_MODEL_DIR / "emotion_meta.json", "r", encoding="utf-8") as f:
    emotion_meta = json.load(f)

emotion_labels = emotion_meta["emotion_labels"]
temperature_emo = emotion_meta["temperature"]
num_emotions = len(emotion_labels)

emotion_tokenizer = AutoTokenizer.from_pretrained(str(EMOTION_MODEL_DIR))
emotion_model = EmotionMARBERT("UBC-NLP/MARBERT", num_emotions, dropout=0.2)
emotion_checkpoint = torch.load(EMOTION_MODEL_DIR / "best_emotion.pt", map_location=DEVICE)
emotion_model.load_state_dict(emotion_checkpoint["model"])
emotion_model.to(DEVICE)
emotion_model.eval()

print(f"✅ Emotion model loaded: {emotion_labels}")
print(f"Using device: {DEVICE}")

softmax = nn.Softmax(dim=-1)

# -------------------------
# Crisis Keywords
# -------------------------
CRISIS_TERMS = {
    "انتحار", "أنتحر", "أؤذي نفسي", "اذي نفسي", "أذى", 
    "kill myself", "suicide", "self harm", 
    "تهديد", "خطر", "خطير", "ساعدوني", "عاجل"
}

def has_crisis(text: str) -> bool:
    return any(term in text.lower() for term in CRISIS_TERMS)

# -------------------------
# API Models
# -------------------------
class FeedbackRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)

class PredictionResult(BaseModel):
    urgency: str
    confidence: float
    emotion: str
    emotion_confidence: float
    reasons: List[str]

# -------------------------
# FastAPI App
# -------------------------
app = FastAPI(
    title="Rukn - NCMH Feedback Analysis API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Rukn API - Mental Health Feedback Analysis",
        "status": "running",
        "device": DEVICE,
        "urgency_labels": urgency_labels,
        "emotion_labels": emotion_labels
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "urgency_model_loaded": True,
        "emotion_model_loaded": True,
        "device": DEVICE
    }

@app.post("/analyze", response_model=PredictionResult)
def analyze_feedback(request: FeedbackRequest):
    """
    Analyze Arabic mental health feedback text
    """
    try:
        text = request.text.strip()
        
        if not text:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # ===== URGENCY =====
        enc_urg = urgency_tokenizer(
            text,
            padding=True,
            truncation=True,
            max_length=MAX_LEN,
            return_tensors="pt"
        )
        
        with torch.no_grad():
            logits_urg = urgency_model(
                enc_urg["input_ids"].to(DEVICE),
                enc_urg["attention_mask"].to(DEVICE),
                enc_urg.get("token_type_ids").to(DEVICE) if "token_type_ids" in enc_urg else None
            )
            probs_urg = softmax(logits_urg / temperature_urg).cpu().numpy()[0]
        
        high_idx = urgency_labels.index("high") if "high" in urgency_labels else 0
        p_high = float(probs_urg[high_idx])
        
        reasons = []
        if p_high >= tau_high:
            pred_idx = high_idx
            reasons.append("calibrated_high")
        else:
            idxs = [i for i in range(num_urgency) if i != high_idx]
            pred_idx = idxs[probs_urg[idxs].argmax()]
            reasons.append("calibrated_non_high")
        
        urgency = urgency_labels[pred_idx]
        confidence_urg = float(probs_urg[pred_idx])
        
        # Crisis override
        if has_crisis(text):
            urgency = "high"
            reasons.append("crisis_override")
        
        # ===== EMOTION =====
        enc_emo = emotion_tokenizer(
            text,
            padding=True,
            truncation=True,
            max_length=MAX_LEN,
            return_tensors="pt"
        )
        
        with torch.no_grad():
            logits_emo = emotion_model(
                enc_emo["input_ids"].to(DEVICE),
                enc_emo["attention_mask"].to(DEVICE),
                enc_emo.get("token_type_ids").to(DEVICE) if "token_type_ids" in enc_emo else None
            )
            probs_emo = softmax(logits_emo / temperature_emo).cpu().numpy()[0]
        
        emotion_idx = probs_emo.argmax()
        emotion = emotion_labels[emotion_idx]
        emotion_confidence = float(probs_emo[emotion_idx])
        
        return PredictionResult(
            urgency=urgency,
            confidence=round(confidence_urg, 4),
            emotion=emotion,
            emotion_confidence=round(emotion_confidence, 4),
            reasons=reasons
        )
    
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)