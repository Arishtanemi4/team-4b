import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { AlertTriangle, TrendingUp, Users, BrainCircuit, ShieldAlert } from 'lucide-react';

// --- Mock Data derived from Synthetic CSV trends ---
const timeSeriesData = [
  { time: 'Day 1 (End)', wellbeing: 65, cognitiveLoad: 45, collaboration: 70 },
  { time: 'Day 2 (Start)', wellbeing: 72, cognitiveLoad: 50, collaboration: 75 },
  { time: 'Day 2 (Mid)', wellbeing: 58, cognitiveLoad: 75, collaboration: 60 },
  { time: 'Day 2 (End)', wellbeing: 62, cognitiveLoad: 68, collaboration: 65 },
];

const teamCharacteristicsData = [
  { subject: 'Wellbeing', TeamA: 80, TeamB: 60, fullMark: 100 },
  { subject: 'Capability', TeamA: 75, TeamB: 85, fullMark: 100 },
  { subject: 'Collaboration', TeamA: 90, TeamB: 65, fullMark: 100 },
  { subject: 'Safety', TeamA: 85, TeamB: 55, fullMark: 100 },
  { subject: 'Productivity', TeamA: 88, TeamB: 70, fullMark: 100 },
];

const alerts = [
  { id: 1, team: "Team B", issue: "High Cognitive Load", detail: "Spiked 25% since start of Day 2", severity: "high" },
  { id: 2, team: "Team C", issue: "Low Psychological Safety", detail: "Below 50 threshold; interventions recommended", severity: "medium" }
];

// --- Sub-components ---
const KpiCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
      <span className={`text-xs mt-2 inline-block ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last check
      </span>
    </div>
    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
      <Icon size={24} />
    </div>
  </div>
);

// --- Main Dashboard Component ---
export default function HCDDashboard() {
  const [activePersona, setActivePersona] = useState('Portfolio Manager');

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Header */}
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projecting Success HCD Engine</h1>
          <p className="text-gray-500 mt-1">Challenge 4: Behavioral & Sentiment Tracking</p>
        </div>
        <select 
          className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={activePersona}
          onChange={(e) => setActivePersona(e.target.value)}
        >
          <option>Portfolio Manager</option>
          <option>Capability Support</option>
          <option>Team View</option>
        </select>
      </header>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Avg Team Wellbeing" value="68 / 100" icon={Users} trend={-4} />
        <KpiCard title="Peak Cognitive Load" value="75 / 100" icon={BrainCircuit} trend={12} />
        <KpiCard title="Psychological Safety" value="82 / 100" icon={ShieldAlert} trend={2} />
        <KpiCard title="Active Risk Alerts" value="2" icon={AlertTriangle} trend={0} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Trend Analysis (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Hackathon Sentiment Trends</h2>
            <span className="text-sm bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full">Aggregated Data</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="time" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="wellbeing" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Wellbeing" />
                <Line type="monotone" dataKey="cognitiveLoad" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} name="Cognitive Load" />
                <Line type="monotone" dataKey="collaboration" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Collaboration" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Team Profiling & Alerts (1/3 width) */}
        <div className="space-y-8">
          
          {/* Radar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Team Characteristics Overlay</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={teamCharacteristicsData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Team A" dataKey="TeamA" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                  <Radar name="Team B" dataKey="TeamB" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.4} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Intervention Alerts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="mr-2 text-amber-500" size={20} />
              Intervention Insights
            </h2>
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${alert.severity === 'high' ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'}`}>
                  <div className="flex justify-between items-start">
                    <h4 className={`font-bold text-sm ${alert.severity === 'high' ? 'text-red-800' : 'text-amber-800'}`}>
                      {alert.team}: {alert.issue}
                    </h4>
                  </div>
                  <p className={`text-xs mt-1 ${alert.severity === 'high' ? 'text-red-600' : 'text-amber-600'}`}>
                    {alert.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}