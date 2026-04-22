import React from "react";
import { Smile, Meh, Frown, CheckCircle2, AlertCircle } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

import MetricCard from "./components/MetricCard";
import ActionColumn from "./components/ActionColumn";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";

const moodData = [
  { value: 60 }, { value: 55 }, { value: 68 },
  { value: 66 }, { value: 74 }, { value: 70 },
];
const stressData = [
  { value: 40 }, { value: 35 }, { value: 42 },
  { value: 30 }, { value: 45 }, { value: 32 },
];

const s = {
  page: { minHeight: "100vh", backgroundColor: "#f1f5f9", padding: "24px", fontFamily: "'Segoe UI', sans-serif" },
  inner: { maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" },
  banner: { backgroundColor: "#1e3a8a", color: "white", textAlign: "center", padding: "16px", borderRadius: "16px", fontSize: "2rem", fontWeight: "bold" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
  sectionTitle: { textAlign: "center", fontSize: "1.75rem", fontWeight: "600" },
};

export default function App() {
  return (
    <div style={s.page}>
      <div style={s.inner}>
        <div style={s.banner}>Team Pulse &amp; Performance</div>

        <div style={s.grid3}>
          <MetricCard title="Wellbeing" icon={<Smile size={56} color="#22c55e" />} value="Good" />
          <MetricCard title="Team Access" icon={<Meh size={56} color="#eab308" />} value="58" subtitle="Needs support" />
          <MetricCard title="Cognitive Load" icon={<Frown size={56} color="#ef4444" />} value="82" subtitle="Rising" />
        </div>

        <div style={s.grid3}>
          <Card>
            <CardHeader><CardTitle>Team Strengths &amp; Gaps</CardTitle></CardHeader>
            <CardContent>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>We're Great At:</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle2 color="#22c55e" /> Collaboration</div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}><CheckCircle2 color="#22c55e" /> Skills &amp; Capability</div>
                </div>
              </div>
              <div>
                <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>We Can Improve:</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#dc2626" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}><AlertCircle /> Psychological Safety</div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}><AlertCircle /> Managing Workload</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Team Mood Tracker</CardTitle></CardHeader>
            <CardContent>
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontWeight: "500", marginBottom: "8px" }}>How We're Feeling</p>
                <div style={{ height: "96px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodData}><Line dataKey="value" strokeWidth={3} dot={false} /></LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p style={{ fontWeight: "500", marginBottom: "8px" }}>Our Stress Level</p>
                <div style={{ height: "96px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stressData}><Line dataKey="value" strokeWidth={3} dot={false} stroke="#ef4444" /></LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>How Strong Is Our Solution?</CardTitle></CardHeader>
            <CardContent style={{ textAlign: "center" }}>
              <div style={{ fontSize: "4rem", margin: "16px 0" }}>🎯</div>
              <Button>Strong &amp; Innovative</Button>
            </CardContent>
          </Card>
        </div>

        <div style={s.sectionTitle}>Take Action!</div>

        <div style={s.grid3}>
          <ActionColumn title="Strengthen Teamwork" color="#16a34a" items={["Improve our communication style.", "Encourage quieter voices."]} />
          <ActionColumn title="Ease the Load" color="#f97316" items={["Drop low-priority tasks.", "Redistribute ownership."]} />
          <ActionColumn title="Boost Our Solution" color="#ef4444" items={["Test our idea with a user."]} />
        </div>
      </div>
    </div>
  );
}