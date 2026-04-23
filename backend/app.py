# backend/app.py
from fastapi import FastAPI, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.auth import process_authentication

# Import all portfolio manager functions
from services.portfolio_manager import (
    need_support, team_trend, avg_health,
    del_conf, send_support, status_heatmap,
    perf_outlook, alert
)

# Import all team view functions
from services.team_view import (
    wellbeing, team_access, cognitive_load,
    strengths_gaps, mood_tracker, solution_strength
)

app = FastAPI(title="Hackathon Auth API")

# --- CORS Configuration Block ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# --- Authentication Logic ---
class AuthRequest(BaseModel):
    team_number: str
    password_hash: str

@app.post("/authenticate")
async def authenticate_team(request: AuthRequest):
    auth_result = process_authentication(request.team_number, request.password_hash)
    return {
        "message": "Authentication processed successfully",
        "data": auth_result
    }

# --- Portfolio Dashboard GET APIs ---
@app.get("/portfolio/need-support", tags=["Portfolio Dashboard"])
async def get_need_support():
    return need_support()

@app.get("/portfolio/team-trend", tags=["Portfolio Dashboard"])
async def get_team_trend():
    return team_trend()

@app.get("/portfolio/avg-health", tags=["Portfolio Dashboard"])
async def get_avg_health():
    return avg_health()

@app.get("/portfolio/del-conf", tags=["Portfolio Dashboard"])
async def get_del_conf():
    return del_conf()

@app.get("/portfolio/send-support", tags=["Portfolio Dashboard"])
async def get_send_support(top_n: int = Query(5, description="Number of top teams to return")):
    return send_support(top_n=top_n)

@app.get("/portfolio/status-heatmap", tags=["Portfolio Dashboard"])
async def get_status_heatmap():
    return status_heatmap()

@app.get("/portfolio/perf-outlook", tags=["Portfolio Dashboard"])
async def get_perf_outlook():
    return perf_outlook()

@app.get("/portfolio/alerts", tags=["Portfolio Dashboard"])
async def get_alerts(top_n: int = Query(10, description="Number of top alerts to return")):
    return alert(top_n=top_n)

# --- Team View Dashboard GET APIs ---

@app.get("/team/{team_id}/wellbeing", tags=["Team Dashboard"])
async def get_team_wellbeing(team_id: int = Path(..., description="The ID of the team")):
    return wellbeing(team_id)

@app.get("/team/{team_id}/team-access", tags=["Team Dashboard"])
async def get_team_access(team_id: int = Path(..., description="The ID of the team")):
    return team_access(team_id)

@app.get("/team/{team_id}/cognitive-load", tags=["Team Dashboard"])
async def get_team_cognitive_load(team_id: int = Path(..., description="The ID of the team")):
    return cognitive_load(team_id)

@app.get("/team/{team_id}/strengths-gaps", tags=["Team Dashboard"])
async def get_team_strengths_gaps(team_id: int = Path(..., description="The ID of the team")):
    return strengths_gaps(team_id)

@app.get("/team/{team_id}/mood-tracker", tags=["Team Dashboard"])
async def get_team_mood_tracker(team_id: int = Path(..., description="The ID of the team")):
    return mood_tracker(team_id)

@app.get("/team/{team_id}/solution-strength", tags=["Team Dashboard"])
async def get_team_solution_strength(team_id: int = Path(..., description="The ID of the team")):
    return solution_strength(team_id)