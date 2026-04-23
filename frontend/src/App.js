import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Menu, Users, Briefcase, LogOut, BarChart3 } from "lucide-react";

import TeamView from "./pages/TeamView";
import PortfolioManagerView from "./pages/PortfolioManagerView";
import SurveyComparison from "./pages/SurveyComparison";
import LoginPage from "./pages/LoginPage";
import "./App.css";

// --- Sidebar Component ---
function Sidebar({ isOpen, toggleSidebar, onLogout, userRole }) {
  return (
    <aside className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}>
      <div className="sidebar-header">
        <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle Menu">
          <Menu size={24} />
        </button>
        <span className="brand-text">Pulse Console</span>
      </div>
      
      <nav className="sidebar-nav" style={{ flex: 1 }}>
        {/* Members see TeamView */}
        {userRole === "member" && (
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"} 
            end
          >
            <Users size={20} />
            <span className="link-text">Team View</span>
          </NavLink>
        )}
        
        {/* Managers see PortfolioManagerView and SurveyComparison */}
        {userRole === "manager" && (
          <>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              end
            >
              <Briefcase size={20} />
              <span className="link-text">Portfolio Manager</span>
            </NavLink>
            <NavLink 
              to="/survey-comparison" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            >
              <BarChart3 size={20} />
              <span className="link-text">Survey Comparison</span>
            </NavLink>
          </>
        )}
      </nav>

      <div style={{ padding: "16px 0", borderTop: "1px solid #334155" }}>
        <button 
          onClick={onLogout}
          className="sidebar-link" 
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
        >
          <LogOut size={20} color="#ef4444" />
          <span className="link-text" style={{ color: "#ef4444" }}>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

// --- Main App Component ---
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State for authentication, team ID, and user role
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = localStorage.getItem("isAuthenticated");
    return stored ? JSON.parse(stored) : false;
  });
  const [currentTeamId, setCurrentTeamId] = useState(() => {
    const stored = localStorage.getItem("currentTeamId");
    return stored ? JSON.parse(stored) : null;
  });
  const [userRole, setUserRole] = useState(() => {
    const stored = localStorage.getItem("userRole");
    return stored ? JSON.parse(stored) : null;
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Update handleLogin to accept both team_anon_number (can be null for managers) and role
  const handleLogin = (teamAnonNumber, role) => {
    setCurrentTeamId(teamAnonNumber);  // Will be null for managers, integer for members
    setUserRole(role);
    setIsAuthenticated(true);
    
    // Persist to localStorage
    localStorage.setItem("currentTeamId", JSON.stringify(teamAnonNumber));
    localStorage.setItem("userRole", JSON.stringify(role));
    localStorage.setItem("isAuthenticated", JSON.stringify(true));
  };

  const handleLogout = () => {
    setCurrentTeamId(null);
    setUserRole(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem("currentTeamId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <div className="app-container">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} onLogout={handleLogout} userRole={userRole} />
          <main className="main-content">
            <div className="main-padding">
              <Routes>
                {/* Role-based routing: members see TeamView, managers see PortfolioManagerView & SurveyComparison */}
                {userRole === "member" ? (
                  <>
                    <Route path="/" element={<TeamView teamId={currentTeamId} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </>
                ) : userRole === "manager" ? (
                  <>
                    <Route path="/" element={<PortfolioManagerView />} />
                    <Route path="/survey-comparison" element={<SurveyComparison />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </>
                ) : (
                  <>
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </>
                )}
              </Routes>
            </div>
          </main>
        </div>
      )}
    </Router>
  );
}