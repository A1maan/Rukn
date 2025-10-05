from typing import Dict

# Mock model — replace later with your real ML model
class SimpleModel:
    def predict(self, text: str) -> Dict:
        t = text.lower()
        urgency = 2 if any(w in t for w in ["urgent", "help", "now"]) else 1
        sentiment = "neg" if any(w in t for w in ["sad", "angry", "upset"]) else "neu"
        return dict(urgency=urgency, sentiment=sentiment, categories=["general"], confidence=0.7)

model = SimpleModel()
