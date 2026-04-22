# backend/app.py
from fastapi import FastAPI, Query
from services.auth import process_authentication

app = FastAPI(title="Hackathon Auth API")

@app.get("/authenticate")
async def authenticate_team(
    team_number: str = Query(..., description="The team's assigned number (e.g., 99A)"),
    password_hash: str = Query(..., description="The raw password hash string")
):
    """
    Endpoint to authenticate a team via plaintext query parameters.
    """
    
    # Call the service layer to handle the database check
    auth_result = process_authentication(team_number, password_hash)
    
    return {
        "message": "Authentication processed successfully",
        "data": auth_result
    }