from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.db import db   # your MongoDB connection
from google_calendar import create_meet_event
import datetime

router = APIRouter(prefix="/appointments", tags=["Appointments"])

# 📌 Appointment Schema
class Appointment(BaseModel):
    patient_name: str
    doctor_name: str
    date: datetime.datetime
    reason: str

# 📌 Normal appointment (without Meet link, keeps old functionality)
@router.post("/")
async def create_appointment(appointment: Appointment):
    result = await db["appointments"].insert_one(appointment.dict())
    return {"id": str(result.inserted_id), "message": "Appointment created successfully ✅"}

# 📌 Appointment with Google Meet integration
@router.post("/with_meet")
async def create_appointment_with_meet(appointment: Appointment):
    # Save in DB first
    result = await db["appointments"].insert_one(appointment.dict())

    try:
        # Create Meet link (1 hour duration)
        start_time = appointment.date.isoformat()
        end_time = (appointment.date + datetime.timedelta(hours=1)).isoformat()

        meet_link = create_meet_event(
            summary=f"Consultation: {appointment.patient_name} with {appointment.doctor_name}",
            start_time=start_time,
            end_time=end_time,
            attendees=[]  # you can pass emails later if needed
        )

        # Update DB with Meet link
        await db["appointments"].update_one(
            {"_id": result.inserted_id},
            {"$set": {"meet_link": meet_link}}
        )

        return {
            "id": str(result.inserted_id),
            "meet_link": meet_link,
            "message": "Appointment with Google Meet created successfully ✅"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google Meet creation failed: {str(e)}")
