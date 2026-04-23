import React, { useState, useEffect } from "react";
import { Smile, Meh, Frown, CheckCircle2, AlertCircle, Loader2, Sparkles, X } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

import MetricCard from "../components/MetricCard";
import ActionColumn from "../components/ActionColumn";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const getIcon = (smileyStatus, size = 56) => {
  if (smileyStatus === "happy") return <Smile size={size} color="#22c55e" />;
  if (smileyStatus === "neutral") return <Meh size={size} color="#eab308" />;
  if (smileyStatus === "sad") return <Frown size={size} color="#ef4444" />;
  return <Meh size={size} color="#94a3b8" />;
};

function AISidebar({ isOpen, onClose }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setContent("");
      
      fetch("/analytics_ai.txt")
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
          setContent("Error loading analytics AI insights");
          setLoading(false);
          console.error(err);
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

export default function TeamView({ teamId }) {
  const [data, setData] = useState({
    wellbeing: null,
    teamAccess: null,
    cognitiveLoad: null,
    strengthsGaps: null,
    moodTracker: null,
    solutionStrength: null,
  });
  
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!teamId) return;

    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [wb, ta, cl, sg, mt, ss] = await Promise.all([
          fetch(`${baseUrl}/team/${teamId}/wellbeing`).then(res => res.json()),
          fetch(`${baseUrl}/team/${teamId}/team-access`).then(res => res.json()),
          fetch(`${baseUrl}/team/${teamId}/cognitive-load`).then(res => res.json()),
          fetch(`${baseUrl}/team/${teamId}/strengths-gaps`).then(res => res.json()),
          fetch(`${baseUrl}/team/${teamId}/mood-tracker`).then(res => res.json()),
          fetch(`${baseUrl}/team/${teamId}/solution-strength`).then(res => res.json())
        ]);

        setData({
          wellbeing: wb,
          teamAccess: ta,
          cognitiveLoad: cl,
          strengthsGaps: sg,
          moodTracker: mt,
          solutionStrength: ss,
        });
      } catch (error) {
        console.error("Failed to fetch team data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [teamId]);

  if (loading) {
    return (
      <div className="app-inner flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin mr-2" size={32} /> Loading Team Pulse...
      </div>
    );
  }

  return (
    <div className="app-inner" style={{ position: "relative" }}>
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
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
        onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
      >
        <Sparkles size={18} />
        AI Insights
      </button>

      <div className="app-banner">Team Pulse &amp; Performance</div>

      <div className="app-grid3">
        <MetricCard 
          title="Wellbeing" 
          icon={getIcon(data.wellbeing?.smiley)} 
          value={data.wellbeing?.label || "N/A"} 
        />
        <MetricCard 
          title="Team Access" 
          icon={getIcon(data.teamAccess?.smiley)} 
          value={data.teamAccess?.value || "N/A"} 
          subtitle={data.teamAccess?.status || "Loading..."} 
        />
        <MetricCard 
          title="Cognitive Load" 
          icon={getIcon(data.cognitiveLoad?.smiley)} 
          value={data.cognitiveLoad?.value || "N/A"} 
          subtitle={data.cognitiveLoad?.trend || "Loading..."} 
        />
      </div>

      <div className="app-grid3">
        <Card>
          <CardHeader><CardTitle>Team Strengths &amp; Gaps</CardTitle></CardHeader>
          <CardContent>
            <div className="section-mb">
              <h3 className="section-heading">We're Great At:</h3>
              <div className="list-container">
                {data.strengthsGaps?.strengths?.map((strength, index) => (
                  <div key={index} className="list-item">
                    <CheckCircle2 color="#22c55e" /> {strength.display}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="section-heading">We Can Improve:</h3>
              <div className="list-container text-red">
                {data.strengthsGaps?.gaps?.map((gap, index) => (
                  <div key={index} className="list-item">
                    <AlertCircle /> {gap.display}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Team Mood Tracker</CardTitle></CardHeader>
          <CardContent>
            <div className="section-mb">
              <p className="section-heading" style={{ fontWeight: 500 }}>
                {data.moodTracker?.feeling?.label || "How We're Feeling"}
              </p>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.moodTracker?.feeling?.points || []}>
                    <Line dataKey="value" strokeWidth={3} dot={false} stroke="#22c55e" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="section-heading" style={{ fontWeight: 500 }}>
                {data.moodTracker?.stress?.label || "Our Stress Level"}
              </p>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.moodTracker?.stress?.points || []}>
                    <Line dataKey="value" strokeWidth={3} dot={false} stroke="#ef4444" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>How Strong Is Our Solution?</CardTitle></CardHeader>
          <CardContent className="text-center">
            <div className="emoji-large">🎯</div>
            <Button>
              {data.solutionStrength?.label || "Evaluating..."}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="app-section-title">Take Action!</div>

      <div className="app-grid3">
        <ActionColumn title="Strengthen Teamwork" color="#16a34a" items={["Improve our communication style.", "Encourage quieter voices."]} />
        <ActionColumn title="Ease the Load" color="#f97316" items={["Drop low-priority tasks.", "Redistribute ownership."]} />
        <ActionColumn title="Boost Our Solution" color="#ef4444" items={["Test our idea with a user."]} />
      </div>

      <AISidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}