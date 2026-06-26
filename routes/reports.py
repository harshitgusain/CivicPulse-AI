# routes/reports.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from config.database import reports_collection
from core.detector import civic_detector
from models.schemas import CivicIssueModel, LocationGeoJSON
from datetime import datetime

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

@router.post("/upload")
async def upload_report(
    longitude: float = Form(..., description="GPS Longitude coordinate"),
    latitude: float = Form(..., description="GPS Latitude coordinate"),
    file: UploadFile = File(...)
):
    """
    DAY 4 FULL INTEGRATION: Intercepts file + location data, executes YOLOv11 
    inference verification, and logs the unified report securely to MongoDB Atlas.
    """
    # 1. Validate file format type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image format.")
    
    try:
        # 2. Read raw binary stream from the upload body
        file_bytes = await file.read()
        
        # 3. Fire the YOLOv11 AI detection pass
        primary_category, detections_list = await civic_detector.detect_hazards(file_bytes)
        
        # 4. Construct structural GeoJSON Location model
        geo_location = LocationGeoJSON(
            type="Point",
            coordinates=[longitude, latitude] # GeoJSON format always holds [lng, lat]
        )
        
        # 5. Assemble the document schema matching our DB blueprint
        new_report = CivicIssueModel(
            category=primary_category,
            detections=detections_list,
            location=geo_location,
            upvotes=1,
            verified_users=[],
            status="Pending Verification",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # 6. Convert Pydantic data matrix to a standard Python dictionary for MongoDB
        report_dict = new_report.dict(by_alias=True, exclude_none=True)
        
        # 7. Write directly to the live cloud database cluster
        result = await reports_collection.insert_one(report_dict)
        
        # 8. Return comprehensive confirmation schema back to client browser
        return {
            "status": "Success",
            "message": "Civic report securely processed, verified, and logged.",
            "inserted_id": str(result.inserted_id),
            "classification": {
                "category_assigned": primary_category,
                "objects_found": detections_list
            },
            "coordinates_logged": [longitude, latitude]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline Processing Failure: {str(e)}")
    
@router.get("/nearby")
async def get_nearby_reports(
    longitude: float,
    latitude: float,
    radius_meters: float = 5000.0
):
    """
    DAY 5 GEOSPATIAL SEARCH: Queries MongoDB Atlas using the 2dsphere index 
    to fetch all hazard logs within a custom radius of the user's coordinates.
    """
    try:
        # 1. Construct the MongoDB geospatial proximity query using legacy coordinate pairs
        query = {
            "location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [longitude, latitude] # GeoJSON standard holds [lng, lat]
                    },
                    "$maxDistance": radius_meters # Distance limit constraint in meters
                }
            }
        }
        
        # 2. Execute the find query against the live cloud cluster and cap at 100 results
        cursor = reports_collection.find(query).limit(100)
        nearby_alerts = []
        
        # 3. Asynchronously iterate through documents and normalize BSON ObjectIds
        async for document in cursor:
            document["_id"] = str(document["_id"])
            nearby_alerts.append(document)
            
        # 4. Return the fully populated structural payload to the client browser
        return {
            "status": "Success",
            "search_origin": [longitude, latitude],
            "radius_queried_meters": radius_meters,
            "total_found": len(nearby_alerts),
            "alerts": nearby_alerts
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geospatial Query Failure: {str(e)}")