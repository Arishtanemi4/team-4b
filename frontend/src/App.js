import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

import TeamView from "./pages/TeamView";
import PortfolioManagerView from "./pages/PortfolioManagerView";
import "./App.css";

function NavBar() {
  return (
    <nav className="app-nav">
      <NavLink 
        to="/" 
        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} 
        end
      >
        Team View
      </NavLink>
      <NavLink 
        to="/portfolio" 
        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
      >
        Portfolio Manager
      </NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-page">
        <NavBar />
        
        {/* The Routes handle which page to display */}
        <Routes>
          <Route path="/" element={<TeamView />} />
          <Route path="/portfolio" element={<PortfolioManagerView />} />
        </Routes>
      </div>
    </Router>
  );
}