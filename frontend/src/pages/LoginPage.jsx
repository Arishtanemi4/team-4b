import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import "../App.css";


export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
    
    // Call the function passed from App.js to change the auth state!
    if (onLogin) onLogin(); 
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-title">Welcome Back</div>
          <div className="login-subtitle">Enter your credentials to access the console</div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          
          {/* Email Input */}
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                className="custom-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
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
              />
            </div>
          </div>

          <Button type="submit" className="login-btn">
            Log In
          </Button>
        </form>
      </div>
    </div>
  );
}