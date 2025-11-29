from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Appointment(BaseModel):
    patient_id: str
    doctor_id: str
    date: datetime
    reason: Optional[str] = None
