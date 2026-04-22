# backend/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.auth import process_authentication

app = FastAPI(title="Hackathon Auth API")


# --- Add this CORS configuration block ---
app.add_middleware(
    CORSMiddleware,
    # In production, replace "*" with your actual frontend URL, e.g., ["http://localhost:3000"]
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  # This is what allows the OPTIONS, POST, GET, etc.
    allow_headers=["*"],  # This allows the Content-Type: application/json header
)

# 1. Define the expected structure of the incoming JSON body
class AuthRequest(BaseModel):
    team_number: str
    password_hash: str

@app.post("/authenticate")
async def authenticate_team(request: AuthRequest):
    """
    Endpoint to authenticate a team via a POST request JSON body.
    """
    
    # 2. Extract the data from the request object and pass it to the service
    auth_result = process_authentication(request.team_number, request.password_hash)
    
    return {
        "message": "Authentication processed successfully",
        "data": auth_result
    }