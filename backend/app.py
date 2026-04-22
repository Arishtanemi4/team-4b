# backend/app.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.auth import process_authentication

# Import all portfolio manager functions
from services.portfolio_manager import (
    need_support,
    team_trend,
    avg_health,
    del_conf,
    send_support,
    status_heatmap,
    perf_outlook,
    alert
)

app = FastAPI(title="Hackathon Auth API")

# --- CORS Configuration Block ---
app.add_middleware(
    CORSMiddleware,
    # In production, replace "*" with your actual frontend URL, e.g., ["http://localhost:3000"]
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  # This is what allows the OPTIONS, POST, GET, etc.
    allow_headers=["*"],  # This allows the Content-Type: application/json header
)

# --- Authentication Logic ---
class AuthRequest(BaseModel):
    team_number: str
    password_hash: str

@app.post("/authenticate")
async def authenticate_team(request: AuthRequest):
    """
    Endpoint to authenticate a team via a POST request JSON body.
    """
    auth_result = process_authentication(request.team_number, request.password_hash)
    
    return {
        "message": "Authentication processed successfully",
        "data": auth_result
    }

# --- Portfolio Dashboard GET APIs ---

@app.get("/portfolio/need-support", tags=["Portfolio Dashboard"])
async def get_need_support():
    """Returns the number of teams with low behaviour health."""
    return need_support()


@app.get("/portfolio/team-trend", tags=["Portfolio Dashboard"])
async def get_team_trend():
    """Returns teams whose overall score dropped meaningfully."""
    return team_trend()


@app.get("/portfolio/avg-health", tags=["Portfolio Dashboard"])
async def get_avg_health():
    """Returns portfolio-wide average behaviour health."""
    return avg_health()


@app.get("/portfolio/del-conf", tags=["Portfolio Dashboard"])
async def get_del_conf():
    """Returns portfolio-wide average delivery confidence."""
    return del_conf()


@app.get("/portfolio/send-support", tags=["Portfolio Dashboard"])
async def get_send_support(top_n: int = Query(5, description="Number of top teams to return")):
    """Returns teams most in need of intervention, with specific issues."""
    return send_support(top_n=top_n)


@app.get("/portfolio/status-heatmap", tags=["Portfolio Dashboard"])
async def get_status_heatmap():
    """Returns a grid of teams × key behavioural metrics."""
    return status_heatmap()


@app.get("/portfolio/perf-outlook", tags=["Portfolio Dashboard"])
async def get_perf_outlook():
    """Returns 2D scatter data of behaviour health vs delivery confidence."""
    return perf_outlook()


@app.get("/portfolio/alerts", tags=["Portfolio Dashboard"])
async def get_alerts(top_n: int = Query(10, description="Number of top alerts to return")):
    """Returns notable events across the portfolio (drops, recoveries, red flags)."""
    return alert(top_n=top_n)