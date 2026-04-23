import React, { useState } from "react";
import { Lock, User, Loader2 } from "lucide-react";

export default function LoginPage({ onLogin }) {
  const [teamNumber, setTeamNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team_number: teamNumber,
          password_hash: password, // Note: In a production app, ensure this is handled securely
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Extract role from the response (required for all users)
        const userRole = data?.data?.role;
        
        if (!userRole) {
          setError("Authentication failed: Missing role information.");
          return;
        }
        
        // Extract team_anon_number only for members (managers don't need it)
        let teamAnonNumber = null;
        if (userRole === "member") {
          teamAnonNumber = data?.data?.team_anon_number;
          if (teamAnonNumber === null || teamAnonNumber === undefined) {
            setError("Authentication failed: Missing team ID for member account.");
            return;
          }
        }
        
        // Pass team_anon_number (can be null for managers) and role to App.js
        onLogin(teamAnonNumber, userRole);
      } else {
        // Backend rejected the login
        setError(data.message || "Invalid team number or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container flex items-center justify-center min-h-screen" style={{ backgroundColor: "#0f172a" }}>
      <div 
        style={{ 
          backgroundColor: "#1e293b", 
          padding: "2.5rem", 
          borderRadius: "12px", 
          width: "100%", 
          maxWidth: "400px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ color: "#f8fafc", fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>Pulse Console</h1>
          <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>Sign in to view your team's dashboard</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "0.75rem", borderRadius: "6px", marginBottom: "1.5rem", fontSize: "0.875rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              Team Number
            </label>
            <div style={{ position: "relative" }}>
              <User size={18} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={teamNumber}
                onChange={(e) => setTeamNumber(e.target.value)}
                placeholder="e.g., 1A"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  color: "#f8fafc",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  color: "#f8fafc",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}