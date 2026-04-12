from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.planner import generate_itinerary
from services.budget import check_and_adjust_budget

router = APIRouter()

class ItineraryRequest(BaseModel):
    budget: int
    days: int
    interests: List[str]
    feedback: Optional[str] = ""

@router.post("/generate")
def create_itinerary(request: ItineraryRequest):
    if request.budget <= 0 or request.days <= 0:
        raise HTTPException(status_code=400, detail="Budget and days must be positive integers.")
        
    itinerary_data = generate_itinerary(
        budget=request.budget,
        days=request.days,
        interests=request.interests,
        feedback=request.feedback
    )
    
    if "error" in itinerary_data:
        raise HTTPException(status_code=500, detail=itinerary_data["error"])
        
    final_data = check_and_adjust_budget(itinerary_data, request.budget)
    
    return final_data

class AlternativeRequest(BaseModel):
    remaining_budget: int
    interests: List[str]
    current_places: List[str] = []

from services.planner import generate_alternatives

@router.post("/alternatives")
def get_alternatives(request: AlternativeRequest):
    if request.remaining_budget <= 0:
        return {"alternatives": []}
    
    alts_data = generate_alternatives(
        budget=request.remaining_budget,
        interests=request.interests,
        current_places=request.current_places
    )
    
    if "error" in alts_data:
        raise HTTPException(status_code=500, detail=alts_data["error"])
        
    return alts_data
