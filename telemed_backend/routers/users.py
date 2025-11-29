from fastapi import APIRouter
from database import db

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/")
async def get_users():
    users = await db["users"].find().to_list(100)
    return users

@router.post("/")
async def create_user(user: dict):
    result = await db["users"].insert_one(user)
    return {"id": str(result.inserted_id)}
