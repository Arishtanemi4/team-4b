import React, { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, ArrowRight, Bell, Sparkles, X, Loader2, ChevronDown } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, ZAxis, Cell, Tooltip } from "recharts";
import "../App.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function AISidebar({ isOpen, onClose }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setContent("");
      
      fetch("${process.env.REACT_APP_API_URL}/api/analytics/insights")
        .then(async (res) => {
          if (!res.ok) throw new Error("Backend not available");
          
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const text = decoder.decode(value);
            setContent(prev => prev + text);
            setLoading(false);
          }
        })
        .catch(() => {
          fetch("/ai_insights.txt")
            .then(res => res.text())
            .then(text => {
              let index = 0;
              const interval = setInterval(() => {
                if (index < text.length) {
                  setContent(prev => prev + text[index]);
                  index++;
                } else {
                  clearInterval(interval);
                  setLoading(false);
                }
              }, 20);
            })
            .catch(err => {
              setContent("Error loading analytics insights");
              setLoading(false);
              console.error(err);
            });
        });
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={onClose}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "400px",
          height: "100vh",
          backgroundColor: "#1e293b",
          boxShadow: "-2px 0 8px rgba(0, 0, 0, 0.3)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: "20px",
          borderBottom: "1px solid #334155",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={20} color="#3b82f6" />
            <h2 style={{ color: "#f8fafc", fontSize: "18px", fontWeight: "bold", margin: 0 }}>
              AI Insights
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          color: "#e2e8f0",
          fontSize: "14px",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}>
          {loading && <Loader2 className="animate-spin" size={20} />}
          {content}
        </div>
      </div>
    </>
  );
}

function AlertsByTeam({ alerts }) {
  const [expandedTeams, setExpandedTeams] = useState({});

  const groupedAlerts = alerts.reduce((acc, alert) => {
    const team = alert.team_label || "System";
    if (!acc[team]) {
      acc[team] = [];
    }
    acc[team].push(alert);
    return acc;
  }, {});

  const getBellColor = (severity) => {
    if (!severity) return "#f59e0b";
    const lowerLevel = String(severity).toLowerCase();
    if (lowerLevel === "critical") return "#ef4444";
    if (lowerLevel === "info") return "#4ade80";
    return "#f59e0b";
  };

  const toggleTeam = (team) => {
    setExpandedTeams(prev => ({
      ...prev,
      [team]: !prev[team]
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {Object.keys(groupedAlerts).length > 0 ? (
        Object.entries(groupedAlerts).map(([team, teamAlerts]) => (
          <div key={team} style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            <button
              onClick={() => toggleTeam(team)}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontWeight: "600",
                color: "#1e293b",
                textAlign: "left",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              <span>{team} ({teamAlerts.length})</span>
              <ChevronDown
                size={18}
                style={{
                  transform: expandedTeams[team] ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s"
                }}
              />
            </button>

            {expandedTeams[team] && (
              <div style={{
                padding: "12px 16px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                {teamAlerts.map((alert, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <Bell color={getBellColor(alert.severity)} fill={getBellColor(alert.severity)} size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: "#1e293b", fontSize: "13px" }}>{alert.metric || "Alert"}</strong>
                      <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "12px" }}>
                        {alert.message || "Please review"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <div style={{ padding: "1rem", color: "#64748b", textAlign: "center" }}>No active alerts.</div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: "#1e293b",
        border: "1px solid #3b82f6",
        borderRadius: "6px",
        padding: "8px 12px",
        color: "#e2e8f0"
      }}>
        <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "600", color: "#3b82f6" }}>
          {data.team_label}
        </p>
        <p style={{ margin: "0", fontSize: "12px", color: "#cbd5e1" }}>
          Behaviour: {data.x}
        </p>
        <p style={{ margin: "0", fontSize: "12px", color: "#cbd5e1" }}>
          Delivery: {data.y}
        </p>
      </div>
    );
  }
  return null;
};

export default function PortfolioManagerView() {
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [heatmapOpen, setHeatmapOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

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
        
        const heatmapRaw = await heatmapRes.json();
        setHeatmapData(heatmapRaw.teams || []);
        
        const perfOutlookRaw = await perfOutlookRes.json();
        const mappedScatter = (perfOutlookRaw.points || []).map(p => ({
          x: p.behaviour_health,
          y: p.delivery_confidence,
          color: p.quadrant === 'front_runner' ? '#22c55e' :
                 p.quadrant === 'high_risk' ? '#ef4444' :
                 p.quadrant === 'potential' ? '#f59e0b' : '#3b82f6',
          team_label: p.team_label,
          quadrant: p.quadrant
        }));
        setScatterData(mappedScatter);
        
        setAlerts(await alertsRes.json());

      } catch (error) {
        console.error("Error fetching portfolio dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const safeKpiRender = (kpiData) => {
    if (kpiData === null || kpiData === undefined) return "--";
    if (typeof kpiData === "object") {
      return kpiData.count ?? kpiData.score ?? kpiData.value ?? kpiData.average ?? "?";
    }
    return kpiData; 
  };

  const getBadgeClass = (priority) => {
    if (!priority) return "badge-med";
    const lowerPriority = String(priority).toLowerCase();
    if (lowerPriority === "high") return "badge-high";
    if (lowerPriority === "low") return "badge-low"; 
    return "badge-med";
  };

  const getBandColor = (band) => {
    if (band === 'green') return '#22c55e';
    if (band === 'amber') return '#f59e0b';
    if (band === 'red') return '#ef4444';
    return '#cbd5e1';
  };

  if (isLoading) {
    return (
      <div className="app-inner" style={{ backgroundColor: "#e2e8f0", padding: "16px", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "600px" }}>
        <h2>Loading Portfolio Data...</h2>
      </div>
    );
  }

  return (
    <div className="app-inner" style={{ backgroundColor: "#e2e8f0", padding: "16px", borderRadius: "8px", position: "relative" }}>
      
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "#3b82f6",
          border: "none",
          cursor: "pointer",
          color: "#ffffff",
          padding: "10px 16px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
          fontWeight: "600",
          transition: "background 0.3s",
          zIndex: 10,
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
        onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
      >
        <Sparkles size={18} />
        AI Insights
      </button>

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

        <div className="dashboard-main-grid">
          
          <div className="dash-panel">
            <div className="dash-panel-header">Send Support Now</div>
            <table className="support-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Team</th>
                  <th style={{ textAlign: "center" }}>Priority</th>
                  <th style={{ textAlign: "left" }}>Issue</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(supportTeams) ? (
                  supportTeams.length > 0 ? (
                    supportTeams.map((item, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 600, textAlign: "left" }}>{item.team_label || item.team || "Unknown"}</td>
                        <td style={{ textAlign: "center" }}><span className={getBadgeClass(item.priority)}>{item.priority || "Med"}</span></td>
                        <td style={{ textAlign: "left" }}>{item.issue || "N/A"}</td>
                        <td style={{ textAlign: "center" }}>{item.action || ""}</td>
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

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div className="dash-panel">
              <div className="dash-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Team Status Heatmap</span>
                <button
                  onClick={() => setHeatmapOpen(!heatmapOpen)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: "4px 8px",
                  }}
                >
                  {heatmapOpen ? "▼ Hide" : "▶ Show"}
                </button>
              </div>
              {heatmapOpen && (
                <div className="heatmap-container">
                  <div className="heatmap-grid">
                    <div></div>
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
                            <div className="heatmap-row-label">{row.team_label || `Team ${row.team}`}</div>
                            {Array.isArray(row.cells) ? (
                              row.cells.map((cell, j) => (
                                <div key={j} className="heatmap-cell" style={{ backgroundColor: getBandColor(cell.band) }}></div>
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
              )}
            </div>

            <div className="dash-panel">
              <div className="dash-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Alert Summary</span>
                <button
                  onClick={() => setAlertsOpen(!alertsOpen)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: "4px 8px",
                  }}
                >
                  {alertsOpen ? "▼ Hide" : "▶ Show"}
                </button>
              </div>
              {alertsOpen && (
                <div style={{ padding: "12px 0" }}>
                  {Array.isArray(alerts) ? (
                    alerts.length > 0 ? (
                      <AlertsByTeam alerts={alerts} />
                    ) : (
                      <div style={{ padding: "1rem", color: "#64748b" }}>No active alerts.</div>
                    )
                  ) : (
                    <div style={{ padding: "1rem", color: "red" }}>Data format error: Expected an array of alerts.</div>
                  )}
                </div>
              )}
            </div>

          </div>

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
              <div className="quadrant-label lbl-br">Low Priority</div>

              {Array.isArray(scatterData) && scatterData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" style={{ zIndex: 10, position: "relative" }}>
                  <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 60 }}>
                    <XAxis type="number" dataKey="x" name="Behaviour Health" domain={[0, 100]} hide />
                    <YAxis type="number" dataKey="y" name="Delivery Confidence" domain={[0, 100]} hide />
                    <ZAxis type="number" range={[100, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter data={scatterData} isAnimationActive={false}>
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "#1e3a8a" } />
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
              <div style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: "0.85rem", fontWeight: 600, color: "#334155", whiteSpace: "nowrap", transformOrigin: "left center" }}>
                Delivery Confidence
              </div>
            </div>
          </div>

        </div>
      </div>

      <AISidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}