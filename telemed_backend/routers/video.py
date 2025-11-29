from fastapi import APIRouter

router = APIRouter(prefix="/video", tags=["Video Call"])

@router.post("/start")
def start_video_call(data: dict):
    return {
        "status": "success",
        "room_id": "room123",
        "doctor": data.get("doctor", "Unknown")
    }
