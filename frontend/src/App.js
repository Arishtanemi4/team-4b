import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Menu, Users, Briefcase, LogOut } from "lucide-react";

import TeamView from "./pages/TeamView";
import PortfolioManagerView from "./pages/PortfolioManagerView";
import LoginPage from "./pages/LoginPage";
import "./App.css";

// --- Sidebar Component ---
function Sidebar({ isOpen, toggleSidebar, onLogout }) {
  return (
    <aside className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}>
      <div className="sidebar-header">
        <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle Menu">
          <Menu size={24} />
        </button>
        <span className="brand-text">Pulse Console</span>
      </div>
      
      <nav className="sidebar-nav" style={{ flex: 1 }}>
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"} 
          end
        >
          <Users size={20} />
          <span className="link-text">Team View</span>
        </NavLink>
        
        <NavLink 
          to="/portfolio" 
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          <Briefcase size={20} />
          <span className="link-text">Portfolio Manager</span>
        </NavLink>
      </nav>

      {/* Logout Button at the bottom of the sidebar */}
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
  // State for sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State for authentication (Set to false by default to show login screen)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {/* If the user is NOT logged in, only show the Login Page */}
      {!isAuthenticated ? (
        <Routes>
          {/* Pass the handleLogin function to the LoginPage so it can update this state */}
          <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
        </Routes>
      ) : (
        /* If the user IS logged in, show the main app layout */
        <div className="app-container">
          
          {/* Sidebar on the left */}
          <Sidebar 
            isOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar} 
            onLogout={handleLogout} 
          />
          
          {/* Main Content Area on the right */}
          <main className="main-content">
            <div className="main-padding">
              <Routes>
                <Route path="/" element={<TeamView />} />
                <Route path="/portfolio" element={<PortfolioManagerView />} />
                {/* Catch-all route to redirect back to home if they type a weird URL */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
          
        </div>
      )}
    </Router>
  );
}

