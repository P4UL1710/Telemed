from fastapi import APIRouter

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("/")
def get_doctors():
    return [
        {"id": 1, "name": "Dr. Sharma", "speciality": "Cardiologist"},
        {"id": 2, "name": "Dr. Gupta", "speciality": "Dermatologist"},
    ]

@router.post("/consult")
def consult(data: dict):
    return {"status": "success", "consult_with": data}
