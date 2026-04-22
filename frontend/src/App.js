import React from "react";
import { Smile, Meh, Frown, CheckCircle2, AlertCircle } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

import MetricCard from "./components/MetricCard";
import ActionColumn from "./components/ActionColumn";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";

// Import your new stylesheet
import "./App.css";

const moodData = [
  { value: 60 }, { value: 55 }, { value: 68 },
  { value: 66 }, { value: 74 }, { value: 70 },
];
const stressData = [
  { value: 40 }, { value: 35 }, { value: 42 },
  { value: 30 }, { value: 45 }, { value: 32 },
];

export default function App() {
  return (
    <div className="app-page">
      <div className="app-inner">
        <div className="app-banner">Team Pulse &amp; Performance</div>

        <div className="app-grid3">
          <MetricCard title="Wellbeing" icon={<Smile size={56} color="#22c55e" />} value="Good" />
          <MetricCard title="Team Access" icon={<Meh size={56} color="#eab308" />} value="58" subtitle="Needs support" />
          <MetricCard title="Cognitive Load" icon={<Frown size={56} color="#ef4444" />} value="82" subtitle="Rising" />
        </div>

        <div className="app-grid3">
          <Card>
            <CardHeader><CardTitle>Team Strengths &amp; Gaps</CardTitle></CardHeader>
            <CardContent>
              <div className="section-mb">
                <h3 className="section-heading">We're Great At:</h3>
                <div className="list-container">
                  <div className="list-item"><CheckCircle2 color="#22c55e" /> Collaboration</div>
                  <div className="list-item"><CheckCircle2 color="#22c55e" /> Skills &amp; Capability</div>
                </div>
              </div>
              <div>
                <h3 className="section-heading">We Can Improve:</h3>
                <div className="list-container text-red">
                  <div className="list-item"><AlertCircle /> Psychological Safety</div>
                  <div className="list-item"><AlertCircle /> Managing Workload</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Team Mood Tracker</CardTitle></CardHeader>
            <CardContent>
              <div className="section-mb">
                <p className="section-heading" style={{ fontWeight: 500 }}>How We're Feeling</p>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodData}><Line dataKey="value" strokeWidth={3} dot={false} /></LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="section-heading" style={{ fontWeight: 500 }}>Our Stress Level</p>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stressData}><Line dataKey="value" strokeWidth={3} dot={false} stroke="#ef4444" /></LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>How Strong Is Our Solution?</CardTitle></CardHeader>
            <CardContent className="text-center">
              <div className="emoji-large">🎯</div>
              <Button>Strong &amp; Innovative</Button>
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
    </div>
  );
}