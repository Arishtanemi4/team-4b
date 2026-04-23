import React, { useState, useEffect } from "react";
import { Smile, Meh, Frown, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

import MetricCard from "../components/MetricCard";
import ActionColumn from "../components/ActionColumn";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

// Helper to map backend "smiley" string to actual Icons and Colors
const getIcon = (smileyStatus, size = 56) => {
  if (smileyStatus === "happy") return <Smile size={size} color="#22c55e" />;
  if (smileyStatus === "neutral") return <Meh size={size} color="#eab308" />;
  if (smileyStatus === "sad") return <Frown size={size} color="#ef4444" />;
  return <Meh size={size} color="#94a3b8" />; // fallback
};

export default function TeamView() {
  const [data, setData] = useState({
    wellbeing: null,
    teamAccess: null,
    cognitiveLoad: null,
    strengthsGaps: null,
    moodTracker: null,
    solutionStrength: null,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with dynamic team ID from your Auth context or LocalStorage
    const teamId = 1; 
    
    // Defaulting to standard local FastAPI port, ensure this matches your setup
    const baseUrl = "http://localhost:8000"; 

    const fetchDashboardData = async () => {
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
  }, []);

  if (loading) {
    return (
      <div className="app-inner flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin mr-2" size={32} /> Loading Team Pulse...
      </div>
    );
  }

  return (
    <div className="app-inner">
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
            {/* The background color of the button could also be mapped to data.solutionStrength?.band if desired */}
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
    </div>
  );
}