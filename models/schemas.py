# models/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class LocationGeoJSON(BaseModel):
    type: str = "Point"
    coordinates: List[float] = Field(..., description="Must be exactly: [longitude, latitude]")

class IssueDetection(BaseModel):
    detected_object: str
    confidence: float

class CivicIssueModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    category: str = Field(..., description="e.g., Pothole, Garbage Pile, Broken Light")
    detections: List[IssueDetection] = []
    location: LocationGeoJSON
    upvotes: int = 1
    verified_users: List[str] = []  # Store user IDs or IPs to prevent double upvoting
    status: str = "Pending Verification"  # Pending Verification, Verified, In Progress, Resolved
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)