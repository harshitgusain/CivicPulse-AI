# core/detector.py
import io
from PIL import Image
from ultralytics import YOLO

class CivicDetector:
    def __init__(self):
        """
        Initializes our Object Detection Framework.
        We use 'yolo11n.pt' (nano) for lightning-fast inference.
        """
        # FIX: Changed "yolov11n.pt" to "yolo11n.pt" to trigger the official auto-download
        self.model = YOLO("yolo11n.pt")
        
        # Mapping generic COCO classes to our custom Civic Categories for testing
        self.class_mapping = {
            "pothole": "Road Damage",
            "garbage": "Sanitation Issue",
            "car": "Traffic Obstruction",
            "person": "Pedestrian Safety Hazard"
        }

    async def detect_hazards(self, file_bytes: bytes):
        """
        Processes raw incoming image streams, runs detection, and returns structured data.
        """
        # Convert raw binary incoming stream into an image object that YOLO understands
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        
        # Run inference with a baseline confidence threshold of 25%
        results = self.model.predict(source=image, conf=0.25, verbose=False)
        
        detections_list = []
        primary_category = "General Civic Issue"
        
        if len(results) > 0:
            boxes = results[0].boxes
            for box in boxes:
                # Extract class index ID and match it to its string label
                class_id = int(box.cls[0].item())
                label = self.model.names[class_id]
                confidence = float(box.conf[0].item())
                
                # Check if it hits our tracking scope
                detected_object = label
                if label in self.class_mapping:
                    primary_category = self.class_mapping[label]
                
                detections_list.append({
                    "detected_object": detected_object,
                    "confidence": round(confidence, 3)
                })
        
        # If multiple objects are found, the first one acts as the dominant label
        return primary_category, detections_list

# Instantiate a single reusable instance of the detector (Singleton pattern)
civic_detector = CivicDetector()