import React, { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, ArrowRight, Bell } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, ZAxis, Cell } from "recharts";
import "../App.css";

// Update this to match your FastAPI server address & port
const API_BASE_URL = "http://localhost:8000"; 

export default function PortfolioManagerView() {
  // --- State Hooks for API Data ---
  const [kpis, setKpis] = useState({
    needSupport: null,
    teamTrend: null,
    avgHealth: null,
    delConf: null
  });
  
  const [supportTeams, setSupportTeams] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          needSupportRes,
          teamTrendRes,
          avgHealthRes,
          delConfRes,
          sendSupportRes,
          heatmapRes,
          perfOutlookRes,
          alertsRes
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/portfolio/need-support`),
          fetch(`${API_BASE_URL}/portfolio/team-trend`),
          fetch(`${API_BASE_URL}/portfolio/avg-health`),
          fetch(`${API_BASE_URL}/portfolio/del-conf`),
          fetch(`${API_BASE_URL}/portfolio/send-support?top_n=5`),
          fetch(`${API_BASE_URL}/portfolio/status-heatmap`),
          fetch(`${API_BASE_URL}/portfolio/perf-outlook`),
          fetch(`${API_BASE_URL}/portfolio/alerts?top_n=10`)
        ]);

        setKpis({
          needSupport: await needSupportRes.json(),
          teamTrend: await teamTrendRes.json(),
          avgHealth: await avgHealthRes.json(),
          delConf: await delConfRes.json()
        });

        setSupportTeams(await sendSupportRes.json());
        setHeatmapData(await heatmapRes.json());
        setScatterData(await perfOutlookRes.json());
        setAlerts(await alertsRes.json());

      } catch (error) {
        console.error("Error fetching portfolio dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Helper Functions ---
  
  // Safely extracts a display value from an object to prevent React crashes
  const safeKpiRender = (kpiData) => {
    if (kpiData === null || kpiData === undefined) return "--";
    if (typeof kpiData === "object") {
      // Looks for standard keys your backend might use for the main number
      return kpiData.count ?? kpiData.score ?? kpiData.value ?? kpiData.average ?? "?";
    }
    return kpiData; // If it's already just a primitive number/string
  };

  const getBadgeClass = (priority) => {
    if (!priority) return "badge-med";
    const lowerPriority = String(priority).toLowerCase();
    if (lowerPriority === "high") return "badge-high";
    if (lowerPriority === "low") return "badge-low"; 
    return "badge-med";
  };

  const getBellColor = (level) => {
    if (!level) return "#f59e0b"; 
    const lowerLevel = String(level).toLowerCase();
    if (lowerLevel === "high") return "#ef4444"; 
    if (lowerLevel === "low") return "#4ade80";  
    return "#f59e0b"; 
  };

  // --- Loading State UI ---
  if (isLoading) {
    return (
      <div className="app-inner" style={{ backgroundColor: "#e2e8f0", padding: "16px", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "600px" }}>
        <h2>Loading Portfolio Data...</h2>
      </div>
    );
  }

  // --- Main Dashboard UI ---
  return (
    <div className="app-inner" style={{ backgroundColor: "#e2e8f0", padding: "16px", borderRadius: "8px" }}>
      
      {/* Top Banner */}
      <div className="portfolio-header">
        <div style={{ width: "40px" }}></div> 
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
              {safeKpiRender(kpis.needSupport)} <ArrowDown size={32} strokeWidth={3} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-title">Teams Trending Down</div>
            <div className="kpi-value" style={{ color: "#f59e0b" }}>
              {safeKpiRender(kpis.teamTrend)} <ArrowDown size={32} strokeWidth={3} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-title">Avg Behaviour Health</div>
            <div className="kpi-value" style={{ color: "#f59e0b" }}>
              {safeKpiRender(kpis.avgHealth)} <ArrowRight size={32} strokeWidth={3} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-title">Avg Delivery Confidence</div>
            <div className="kpi-value" style={{ color: "#22c55e" }}>
              {safeKpiRender(kpis.delConf)} <ArrowUp size={32} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-main-grid">
          
          {/* Left Column: Support Teams */}
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
                {Array.isArray(supportTeams) ? (
                  supportTeams.length > 0 ? (
                    supportTeams.map((item, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 600 }}>{item.team || item.team_name || "Unknown"}</td>
                        <td><span className={getBadgeClass(item.priority)}>{item.priority || "Med"}</span></td>
                        <td>{item.issue || "N/A"}</td>
                        <td>{item.action || ""}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" style={{ textAlign: "center", padding: "1rem" }}>No support interventions required.</td></tr>
                  )
                ) : (
                  <tr><td colSpan="4" style={{ textAlign: "center", padding: "1rem", color: "red" }}>Data format error: Expected a list of teams.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Middle Column: Heatmap & Alerts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Heatmap Panel */}
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
                  
                  {Array.isArray(heatmapData) ? (
                    heatmapData.length > 0 ? (
                      heatmapData.map((row, i) => (
                        <React.Fragment key={i}>
                          <div className="heatmap-row-label">{row.team || `Team ${i + 1}`}</div>
                          {Array.isArray(row.scores) ? (
                            row.scores.map((colorClass, j) => (
                              <div key={j} className={`heatmap-cell ${colorClass}`}></div>
                            ))
                          ) : (
                            <div style={{ gridColumn: "span 7", fontSize: "0.8rem", color: "red" }}>Invalid score data</div>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <div style={{ gridColumn: "1 / -1", padding: "1rem", textAlign: "center" }}>No heatmap data available.</div>
                    )
                  ) : (
                    <div style={{ gridColumn: "1 / -1", padding: "1rem", color: "red", textAlign: "center" }}>
                      Data format error: Expected an array for heatmap.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts Panel */}
            <div className="dash-panel">
              <div className="dash-panel-header">Alert Summary</div>
              <div className="alerts-list">
                {Array.isArray(alerts) ? (
                  alerts.length > 0 ? (
                    alerts.map((alert, index) => {
                      const bellColor = getBellColor(alert.level);
                      return (
                        <div className="alert-item" key={index}>
                          <Bell color={bellColor} fill={bellColor} size={20} />
                          <div>
                            <strong>{alert.team || "System"}:</strong> {alert.issue || "Alert"} – <em>{alert.action || "Please review"}</em>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: "1rem", color: "#64748b" }}>No active alerts.</div>
                  )
                ) : (
                  <div style={{ padding: "1rem", color: "red" }}>Data format error: Expected an array of alerts.</div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Scatter Chart */}
          <div className="dash-panel">
            <div className="dash-panel-header">Performance Outlook</div>
            <div className="scatter-wrapper">
              
              <div className="quadrant-bg">
                <div className="quad-tl"></div>
                <div className="quad-tr"></div>
                <div className="quad-bl"></div>
                <div className="quad-br"></div>
              </div>

              <div className="quadrant-label lbl-tl">Front<br/>Runners</div>
              <div className="quadrant-label lbl-tr">High Risk<br/>Zone</div>
              <div className="quadrant-label lbl-bl">Potential,<br/>Needs Support</div>

              {Array.isArray(scatterData) && scatterData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" style={{ zIndex: 10, position: "relative" }}>
                  <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <XAxis type="number" dataKey="x" name="Behaviour Health" domain={[0, 100]} hide />
                    <YAxis type="number" dataKey="y" name="Delivery Confidence" domain={[0, 100]} hide />
                    <ZAxis type="number" range={[100, 100]} />
                    <Scatter data={scatterData} isAnimationActive={false}>
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "#1e3a8a"} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ zIndex: 10, position: "relative", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                   {Array.isArray(scatterData) ? "No chart data available." : <span style={{color: "red"}}>Data format error.</span>}
                </div>
              )}
              
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