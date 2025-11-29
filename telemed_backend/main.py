from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, doctors, appointments, video, chat

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers (clean imports)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(video.router)
app.include_router(chat.router)

@app.get("/")
def home():
    return {"message": "Backend running successfully 🚀"}
