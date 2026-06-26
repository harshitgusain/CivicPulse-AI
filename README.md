# CivicPulse AI: Geospatial Threat Tracking Node

## 🚀 Live Demo
* **Frontend Application:** [CivicPulse AI on Vercel](https://civic-pulse-ai-lyh6.vercel.app/)
* **Backend API:** `https://civicpulse-ai-bdf1.onrender.com`

---

## 📖 Overview: What is CivicPulse AI?
**CivicPulse AI** is a full-stack, AI-driven geospatial tracking platform designed to bridge the gap between citizens and municipal authorities. It allows users to pinpoint, categorize, and report civic infrastructure hazards—such as deep potholes, broken roads, traffic congestion, and safety violations—using image evidence and exact GPS coordinates. 

The system autonomously analyzes the uploaded evidence, calculates a risk-weighted severity score, and instantly syncs the telemetry data to a centralized cloud database for municipal review.

## 💡 The Motivation: Why We Built It
Urban infrastructure degrades faster than municipalities can track it. Traditional reporting methods are slow, manual, and often lack precise location data or visual proof. 

CivicPulse AI was built to solve this by automating the triage process. By providing a decentralized node for citizens to report issues, the platform:
1. **Removes the Friction:** One-click reporting with exact geospatial tagging.
2. **Prioritizes Danger:** The custom algorithm weights threats (e.g., a "Deep Pothole" with high confidence scores higher than "Garbage Accumulation") to ensure critical infrastructure failures are flagged immediately.
3. **Creates Actionable Data:** Municipalities get a heat-mapped dashboard of real-time issues rather than a backlog of text complaints.

---

## ✨ Key Features
* **Interactive Geospatial Mapping:** Integrated Leaflet and CARTO dark-mode maps for precise coordinate targeting (Latitude/Longitude).
* **Automated Severity Algorithm:** A weighted scoring system that evaluates the threat class and detection confidence to assign a visual severity matrix (LOW, MEDIUM, HIGH).
* **Evidence Payload Pipeline:** Secure image upload and staging system for visual verification of hazards.
* **Real-Time Telemetry Logs:** A built-in terminal UI on the frontend provides users with real-time feedback on pipeline execution, database syncing, and server status.
* **CORS-Secured Decoupled Architecture:** A strictly configured FastAPI backend that only accepts payloads from the verified Vercel frontend edge network.

---

## 🛠️ System Architecture & Tech Stack

### Frontend (Client Node)
* **Framework:** React / Next.js
* **Styling:** Tailwind CSS (Dark theme UI with telemetry console)
* **Mapping:** Leaflet (`react-leaflet`)
* **Deployment:** Vercel Edge Network

### Backend (Processing API)
* **Framework:** FastAPI (Python)
* **Server:** Uvicorn
* **Middleware:** Starlette CORS Middleware (Strict origin enforcement)
* **Deployment:** Render Cloud Service

### Database (Data Persistence)
* **System:** MongoDB Atlas (NoSQL)
* **Driver:** PyMongo
* **Security:** URL-encoded connection strings with IP access lists.

---

### 💻 Local Setup & Installation

### 1. Clone the Repository

**git clone [https://github.com/harshitgusain/CivicPulse-AI.git](https://github.com/harshitgusain/CivicPulse-AI.git)
cd CivicPulse-AI

### 2. Backend Setup
# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn pymongo python-multipart

# Run the local server
uvicorn main:app --reload --host 127.0.0.1 --port 8000

### 3. Frontend Setup
cd frontend

# Install Node modules
npm install

# Start the development server
npm run dev

### Future Scope
# 1. Computer Vision Integration: Replacing the randomized mock detection logic with a trained YOLO (You Only Look Once) object detection model to autonomously scan uploaded images for hazards.

# 2. Big Data Analytics: Implementing Apache Spark to analy**ze historical hazard data and predict seasonal infrastructure degradation trends.

# 3. Municipal Dashboard: A dedicated portal for city officials to update the status of reports from "Pending" to "Resolved."

### Architected and Engineered by Harshit Singh Gusain.
