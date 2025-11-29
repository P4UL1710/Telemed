from fastapi import APIRouter, WebSocket

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.websocket("/{room_id}")
async def chat_room(websocket: WebSocket, room_id: str):
    await websocket.accept()
    await websocket.send_text(f"✅ Connected to chat room: {room_id}")
    while True:
        msg = await websocket.receive_text()
        await websocket.send_text(f"You said: {msg}")
