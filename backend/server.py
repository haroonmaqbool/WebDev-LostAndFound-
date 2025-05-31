from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.getenv('DB_NAME', 'lost_and_found_db')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class ItemType(str, Enum):
    LOST = "lost"
    FOUND = "found"

class ItemStatus(str, Enum):
    ACTIVE = "active"
    CLAIMED = "claimed"
    RESOLVED = "resolved"

class ItemUrgency(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ItemCondition(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"

class Item(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: ItemType
    title: str
    description: str
    location: str
    category: str
    image: Optional[str] = None
    date: datetime = Field(default_factory=datetime.utcnow)
    status: ItemStatus = ItemStatus.ACTIVE
    contact: str
    urgency: Optional[ItemUrgency] = None  # For lost items
    reward: Optional[float] = None  # For lost items
    condition: Optional[ItemCondition] = None  # For found items

class ItemCreate(BaseModel):
    type: ItemType
    title: str
    description: str
    location: str
    category: str
    image: Optional[str] = None
    contact: str
    urgency: Optional[ItemUrgency] = None
    reward: Optional[float] = None
    condition: Optional[ItemCondition] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/items", response_model=Item)
async def create_item(input: ItemCreate):
    item_dict = input.dict()
    item_obj = Item(**item_dict)
    _ = await db.items.insert_one(item_obj.dict())
    return item_obj

@api_router.get("/items", response_model=List[Item])
async def get_items(type: Optional[ItemType] = None):
    query = {}
    if type:
        query["type"] = type
    items = await db.items.find(query).sort("date", -1).to_list(1000)
    return [Item(**item) for item in items]

@api_router.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: str):
    item = await db.items.find_one({"id": item_id})
    if item:
        return Item(**item)
    return {"error": "Item not found"}

@api_router.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: str, input: ItemCreate):
    item_dict = input.dict()
    await db.items.update_one(
        {"id": item_id},
        {"$set": item_dict}
    )
    updated_item = await db.items.find_one({"id": item_id})
    return Item(**updated_item)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
