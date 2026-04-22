import React, { useState } from "react";
import { Users, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import "../App.css";

export default function LoginPage({ onLogin }) {
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setIsLoading(true);

    try {
      const url = "http://127.0.0.1:8000/authenticate";
      
      // We now pass the data in the body as a JSON string, matching your curl -d payload
      const response = await fetch(url, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          team_number: teamName,
          password_hash: password
        })
      });

      if (response.ok) {
        const data = await response.json(); 
        console.log("Authentication successful:", data);
        
        // Tell App.js we are logged in!
        if (onLogin) onLogin(); 
      } else {
        // The server responded, but with an error status (e.g., 401 Unauthorized)
        setError("Invalid team name or password.");
      }
    } catch (err) {
      // The request failed entirely (e.g., server is offline or CORS issue)
      console.error("Network error:", err);
      setError("Could not connect to the server. Is the API running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-title">Welcome Back</div>
          <div className="login-subtitle">Enter your team credentials to access the console</div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          
          {/* Team Name Input */}
          <div className="input-group">
            <label className="input-label" htmlFor="teamName">Team Name / Number</label>
            <div className="input-wrapper">
              <Users className="input-icon" size={18} />
              <input
                id="teamName"
                type="text"
                className="custom-input"
                placeholder="e.g. 99A"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="input-group">
            <label className="input-label" htmlFor="password">Password Hash</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                className="custom-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div style={{ color: "#ef4444", fontSize: "0.85rem", textAlign: "center", fontWeight: "500", marginTop: "4px" }}>
              {error}
            </div>
          )}

          <Button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Log In"}
          </Button>
        </form>
      </div>
    </div>
  );
}