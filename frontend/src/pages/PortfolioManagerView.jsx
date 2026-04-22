import React from "react";
import { ArrowDown, ArrowUp, ArrowRight, Bell } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, ZAxis, Cell } from "recharts";
import "../App.css";

// --- Mock Data ---
const heatmapData = [
  { team: "Team Alpha",   scores: ["bg-green", "bg-green", "bg-green", "bg-green", "bg-green", "bg-red", "bg-green"] },
  { team: "Team Beta",    scores: ["bg-yellow", "bg-green", "bg-red", "bg-green", "bg-yellow", "bg-green", "bg-red"] },
  { team: "Team Gamma",   scores: ["bg-red", "bg-yellow", "bg-yellow", "bg-red", "bg-green", "bg-yellow", "bg-green"] },
  { team: "Team Delta",   scores: ["bg-green", "bg-red", "bg-green", "bg-yellow", "bg-green", "bg-red", "bg-red"] },
  { team: "Team Epsilon", scores: ["bg-green", "bg-yellow", "bg-green", "bg-green", "bg-green", "bg-yellow", "bg-green"] },
];

const scatterData = [
  { x: 30, y: 75, name: "", color: "#ef4444" },
  { x: 80, y: 80, name: "Delta", color: "#f59e0b" },
  { x: 60, y: 45, name: "", color: "#1e3a8a" },
  { x: 65, y: 55, name: "", color: "#ef4444" },
  { x: 55, y: 25, name: "", color: "#1e3a8a" },
  { x: 45, y: 20, name: "", color: "#4ade80" },
  { x: 85, y: 35, name: "Beta", color: "#ef4444" },
  { x: 75, y: 65, name: "", color: "#115e59" },
];

export default function PortfolioManagerView() {
  return (
    <div className="app-inner" style={{ backgroundColor: "#e2e8f0", padding: "16px", borderRadius: "8px" }}>
      
      {/* Top Banner */}
      <div className="portfolio-header">
        <div style={{ width: "40px" }}></div> {/* Spacer */}
        <div>HCD Portfolio Action Console</div>
        <div className="portfolio-header-dots">
          <div className="header-dot"></div>
          <div className="header-dot"></div>
          <div className="header-dot"></div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* KPIs */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-title">Teams Needing Support</div>
            <div className="kpi-value" style={{ color: "#ef4444" }}>
              3 <ArrowDown size={32} strokeWidth={3} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-title">Teams Trending Down</div>
            <div className="kpi-value" style={{ color: "#f59e0b" }}>
              2 <ArrowDown size={32} strokeWidth={3} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-title">Avg Behaviour Health</div>
            <div className="kpi-value" style={{ color: "#f59e0b" }}>
              68 <ArrowRight size={32} strokeWidth={3} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-title">Avg Delivery Confidence</div>
            <div className="kpi-value" style={{ color: "#22c55e" }}>
              72 <ArrowUp size={32} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-main-grid">
          
          {/* Left Column */}
          <div className="dash-panel">
            <div className="dash-panel-header">Send Support Now</div>
            <table className="support-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Priority</th>
                  <th>Issue</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Team Gamma</td>
                  <td><span className="badge-high">High</span></td>
                  <td>Low Psychological Safety</td>
                  <td></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Team Delta</td>
                  <td><span className="badge-med">Med</span></td>
                  <td>High Cognitive Load</td>
                  <td></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Team Beta</td>
                  <td><span className="badge-high">High</span></td>
                  <td>Access Problems</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Middle Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="dash-panel">
              <div className="dash-panel-header">Team Status Heatmap</div>
              <div className="heatmap-container">
                <div className="heatmap-grid">
                  <div></div> {/* Empty top-left cell */}
                  <div className="heatmap-header-cell">Wellbeing</div>
                  <div className="heatmap-header-cell">Access</div>
                  <div className="heatmap-header-cell">Productivity</div>
                  <div className="heatmap-header-cell">Capacity</div>
                  <div className="heatmap-header-cell">Collab.</div>
                  <div className="heatmap-header-cell">Safety</div>
                  <div className="heatmap-header-cell">Cog. Load</div>
                  
                  {heatmapData.map((row, i) => (
                    <React.Fragment key={i}>
                      <div className="heatmap-row-label">{row.team}</div>
                      {row.scores.map((colorClass, j) => (
                        <div key={j} className={`heatmap-cell ${colorClass}`}></div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="dash-panel">
              <div className="dash-panel-header">Alert Summary</div>
              <div className="alerts-list">
                <div className="alert-item">
                  <Bell color="#4ade80" fill="#4ade80" size={20} />
                  <div><strong>Team Gamma:</strong> Low Psychological Safety – <em>Send Facilitator</em></div>
                </div>
                <div className="alert-item">
                  <Bell color="#ef4444" fill="#ef4444" size={20} />
                  <div><strong>Team Delta:</strong> High Cognitive Load – <em>Provide Guidance</em></div>
                </div>
                <div className="alert-item">
                  <Bell color="#f59e0b" fill="#f59e0b" size={20} />
                  <div><strong>Team Beta:</strong> Access Problems – <em>Unblock Resources</em></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="dash-panel">
            <div className="dash-panel-header">Performance Outlook</div>
            <div className="scatter-wrapper">
              
              {/* CSS Background Quadrants to match design exactly */}
              <div className="quadrant-bg">
                <div className="quad-tl"></div>
                <div className="quad-tr"></div>
                <div className="quad-bl"></div>
                <div className="quad-br"></div>
              </div>

              {/* Labels overlay */}
              <div className="quadrant-label lbl-tl">Front<br/>Runners</div>
              <div className="quadrant-label lbl-tr">High Risk<br/>Zone</div>
              <div className="quadrant-label lbl-bl">Potential,<br/>Needs Support</div>

              <ResponsiveContainer width="100%" height="100%" style={{ zIndex: 10, position: "relative" }}>
                <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis type="number" dataKey="x" name="Behaviour Health" domain={[0, 100]} hide />
                  <YAxis type="number" dataKey="y" name="Delivery Confidence" domain={[0, 100]} hide />
                  <ZAxis type="number" range={[100, 100]} />
                  <Scatter data={scatterData} isAnimationActive={false}>
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              
              {/* Custom Axes Labels for visual match */}
              <div style={{ position: "absolute", bottom: "5px", left: "0", width: "100%", textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                Behaviour Health
              </div>
              <div style={{ position: "absolute", left: "-35px", top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: "0.85rem", fontWeight: 600, color: "#334155", whiteSpace: "nowrap" }}>
                Delivery Confidence
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}