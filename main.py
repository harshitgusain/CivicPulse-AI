import os
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import uvicorn
import random
import datetime

app = FastAPI(title="CivicPulse AI Backend")

# --- DATABASE CONFIGURATION (NUCLEAR BYPASS) ---
# Zero variables, zero parsing. Direct raw connection string.
MONGO_URI = "mongodb+srv://Harshit:Arshit%40151024@civicpluscluster.djxnyrd.mongodb.net/?retryWrites=true&w=majority&appName=CivicPlusCluster"

# Initialize MongoDB Client
client = MongoClient(MONGO_URI)
db = client["CivicPulseDB"]
collection = db["issue_reports"]
# -----------------------------------------------

# THE CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Changed to wildcard to guarantee zero browser blocks
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def calculate_severity(threat_class, confidence):
    weights = {
        "Broken Road": 85, "Deep Pothole": 70, "Traffic Jam": 50, 
        "Garbage Accumulation": 40, "Helmet Violation": 30
    }
    base_score = weights.get(threat_class, 50)
    modifier = (confidence - 0.5) * 20 
    final_score = base_score + modifier
    
    if final_score >= 75: return "HIGH", "#ef4444", "#4c0519"
    elif final_score >= 50: return "MEDIUM", "#f97316", "#7c2d12"
    else: return "LOW", "#eab308", "#713f12"

@app.post("/detect")
async def detect_hazards(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    threatType: str = Form(...), 
    severity: str = Form(...)    
):
    print(f"Processing {threatType} at [{latitude}, {longitude}]")
    
    # Mock Detection Logic
    possible_threats = ["Broken Road", "Deep Pothole", "Traffic Jam", "Garbage Accumulation", "Helmet Violation"]
    detected_items = random.sample(possible_threats, 2)
    
    detections = []
    for item in detected_items:
        conf = round(random.uniform(0.65, 0.98), 2)
        sev, f_col, b_col = calculate_severity(item, conf)
        detections.append({"class": item, "confidence": conf, "severity": sev, "fillColor": f_col, "borderColor": b_col})
        
    # SAVE TO MONGODB
    report_document = {
        "category": threatType,
        "user_severity": severity,
        "location": {"lat": latitude, "lng": longitude},
        "detections": detections,
        "status": "Pending Verification",
        "created_at": datetime.datetime.utcnow()
    }
    
    collection.insert_one(report_document)
    print("Database sync: Success")
        
    return {"status": "success", "detections": detections}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=10000)