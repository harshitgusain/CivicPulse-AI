# config/database.py
import urllib.parse
from motor.motor_asyncio import AsyncIOMotorClient

# 1. Put your raw password string here (special characters are totally fine now!)
raw_password = "Arshit@151024" 

# 2. Automatically format it so MongoDB can safely read it over the wire
safe_password = urllib.parse.quote_plus(raw_password)

# 3. Construct the secure connection string dynamically
MONGO_URI = f"mongodb+srv://Harshit:{safe_password}@civicpluscluster.djxnyrd.mongodb.net/?appName=CivicPulseCluster"

client = AsyncIOMotorClient(MONGO_URI)
db = client.CivicPulseDB

# Database Collection Hook
reports_collection = db.issue_reports

async def init_spatial_indexes():
    """
    Creates a 2dsphere spatial index on our location coordinates.
    Essential for processing radius-based distance calculations.
    """
    try:
        # Create an index on the "location" field inside our documents
        await reports_collection.create_index([("location", "2dsphere")])
        print("🚀 Success: Geospatial 2dsphere index successfully built in MongoDB Atlas Cloud!")
    except Exception as e:
        print(f"❌ Database Indexing Error: {e}")