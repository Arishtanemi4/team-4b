from fastapi import FastAPI, Query, Path, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json
import os
import requests
from services.auth import process_authentication

from services.call_llm_api import check_api_keys, get_analytics_insights as get_api_insights
from services.call_llama3 import check_ollama_running, check_llama3_available, get_analytics_insights as get_llama_insights
from fastapi.responses import StreamingResponse

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

# --- Helper to map string IDs like "4B" to integer IDs like 17 ---
def resolve_team_id(team_param: str) -> int:
    """
    Converts a string parameter (e.g., '4B') to its corresponding integer 
    team_anon_number (17) by looking it up in users.csv.
    If an integer is passed directly, it uses that integer.
    """
    # 1. Try to parse as integer directly (in case the frontend sends "17")
    try:
        return int(team_param)
    except ValueError:
        pass # It's a string like '4B', continue to lookup

    # 2. Look up the team string in users.csv
    try:
        users_df = pd.read_csv("users.csv")
        match = users_df[users_df["team_number"] == team_param]
        if not match.empty:
            val = match.iloc[0]["team_anon_number"]
            if pd.notna(val):
                return int(val)
    except Exception as e:
        print(f"Error resolving team ID from users.csv: {e}")
        
    raise HTTPException(status_code=400, detail=f"Could not map team identifier: {team_param}")


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
# Notice we changed the type hint to `team_id: str` so FastAPI accepts "4B", 
# and then we pass it through `resolve_team_id()`

@app.get("/team/{team_id}/wellbeing", tags=["Team Dashboard"])
async def get_team_wellbeing(team_id: str = Path(..., description="The ID or string identifier of the team")):
    real_id = resolve_team_id(team_id)
    return wellbeing(real_id)

@app.get("/team/{team_id}/team-access", tags=["Team Dashboard"])
async def get_team_access(team_id: str = Path(..., description="The ID or string identifier of the team")):
    real_id = resolve_team_id(team_id)
    return team_access(real_id)

@app.get("/team/{team_id}/cognitive-load", tags=["Team Dashboard"])
async def get_team_cognitive_load(team_id: str = Path(..., description="The ID or string identifier of the team")):
    real_id = resolve_team_id(team_id)
    return cognitive_load(real_id)

@app.get("/team/{team_id}/strengths-gaps", tags=["Team Dashboard"])
async def get_team_strengths_gaps(team_id: str = Path(..., description="The ID or string identifier of the team")):
    real_id = resolve_team_id(team_id)
    return strengths_gaps(real_id)

@app.get("/team/{team_id}/mood-tracker", tags=["Team Dashboard"])
async def get_team_mood_tracker(team_id: str = Path(..., description="The ID or string identifier of the team")):
    real_id = resolve_team_id(team_id)
    return mood_tracker(real_id)

@app.get("/team/{team_id}/solution-strength", tags=["Team Dashboard"])
async def get_team_solution_strength(team_id: str = Path(..., description="The ID or string identifier of the team")):
    real_id = resolve_team_id(team_id)
    return solution_strength(real_id)


# --- AI INSIGHTS STREAMING ENDPOINT ---

async def ai_insights_stream():
    """Stream AI insights based on portfolio data"""
    
    # Fetch all portfolio data
    portfolio_data = {}
    try:
        portfolio_data = {
            "need_support": need_support(),
            "team_trend": team_trend(),
            "avg_health": avg_health(),
            "del_conf": del_conf(),
            "send_support": send_support(top_n=5),
            "status_heatmap": status_heatmap(),
            "perf_outlook": perf_outlook(),
            "alerts": alert(top_n=10),
        }
    except Exception as e:
        portfolio_data = {"error": str(e)}
    
    # Format portfolio data for prompt
    portfolio_summary = f"""
Portfolio Manager Dashboard Data:
==============================
Teams Needing Support: {portfolio_data.get('need_support')}
Teams Trending Down: {portfolio_data.get('team_trend')}
Avg Behaviour Health: {portfolio_data.get('avg_health')}
Avg Delivery Confidence: {portfolio_data.get('del_conf')}
Teams Requiring Support: {json.dumps(portfolio_data.get('send_support', [])[:2])}
Team Status Overview: {json.dumps(portfolio_data.get('status_heatmap', {}), default=str)[:500]}
Performance Outlook: {json.dumps(portfolio_data.get('perf_outlook', {}), default=str)[:500]}
Active Alerts: {len(portfolio_data.get('alerts', []))} alerts detected
Alert Summary: {json.dumps([{'team': a.get('team_label'), 'severity': a.get('severity'), 'message': a.get('message')} for a in portfolio_data.get('alerts', [])[:3]])}
"""

    prompt = f"""{portfolio_summary}

Based on the above portfolio manager data, provide comprehensive insights:
1. Executive summary of portfolio health status
2. Critical areas requiring immediate attention
3. Teams showing strong performance
4. Key risks and their mitigation strategies
5. Top 3 action items for the portfolio manager

Keep insights focused, actionable, and data-driven."""

    # Step 1: Try LLM APIs
    try:
        available_apis = check_api_keys()
        if available_apis:
            print(f"Using LLM API: {list(available_apis.keys())}")
            insights = get_api_insights(prompt)
            if insights:
                for chunk in insights:
                    yield chunk
                return
    except Exception as e:
        print(f"LLM API failed: {e}")
    
    # Step 2: Try local Llama3
    try:
        if check_ollama_running() and check_llama3_available():
            print("Using local Llama3")
            insights = get_llama_insights(prompt)
            if insights:
                for chunk in insights:
                    yield chunk
                return
    except Exception as e:
        print(f"Llama3 failed: {e}")
    
    # Step 3: Fallback to text file
    print("Falling back to text file")
    try:
        text_file_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "..",
            "frontend",
            "public",
            "ai_insights.txt"
        )
        
        if os.path.exists(text_file_path):
            with open(text_file_path, 'r') as f:
                content = f.read()
                for char in content:
                    yield char
        else:
            yield f"Analytics file not found at {text_file_path}"
    except Exception as e:
        yield f"Error: {str(e)}"

@app.get("/api/analytics/insights")
async def get_analytics_insights():
    """Endpoint to stream AI-generated portfolio insights"""
    return StreamingResponse(
        ai_insights_stream(),
        media_type="text/plain"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)