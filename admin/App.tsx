/**
 * ArthMitra — Admin Analytics Dashboard
 * React 18.3 + Vite 5.2 + Tailwind 3.4
 */

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import axios from 'axios';

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

const COLORS = ['#0F4C81', '#2BB673', '#FF9800', '#E53935', '#7C4DFF', '#E91E63'];

interface DashData {
  total_users: number;
  active_today: number;
  scams_blocked: number;
  schemes_matched: number;
  avg_literacy_score: number;
  top_languages: { lang: string; count: number }[];
  agent_distribution: Record<string, number>;
}

const AGENT_LABELS: Record<string, string> = {
  scam_guardian: 'Scam Guardian',
  benefits_navigator: 'Benefits Nav',
  literacy_agent: 'Literacy',
  behavioural_coach: 'Coach',
};

export default function App() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/admin/dashboard`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">₹</div>
        <p className="text-slate-500">Loading ArthMitra Admin...</p>
      </div>
    </div>
  );

  const agentData = data
    ? Object.entries(data.agent_distribution).map(([k, v]) => ({
        name: AGENT_LABELS[k] ?? k,
        value: Math.round(v * 100),
      }))
    : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-[#0F4C81] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">₹</div>
          <div>
            <h1 className="font-bold text-lg leading-none">ArthMitra Admin</h1>
            <p className="text-white/60 text-xs mt-0.5">Nomura KakushIN 2026 — Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/70">Live</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Users', value: data?.total_users.toLocaleString(), color: '#0F4C81', bg: '#E3F2FD' },
            { label: 'Active Today', value: data?.active_today, color: '#2BB673', bg: '#E8F5E9' },
            { label: 'Scams Blocked', value: data?.scams_blocked, color: '#E53935', bg: '#FFEBEE' },
            { label: 'Schemes Matched', value: data?.schemes_matched, color: '#FF9800', bg: '#FFF3E0' },
            { label: 'Avg Literacy', value: `${data?.avg_literacy_score}/100`, color: '#7C4DFF', bg: '#F3E5F5' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <p className="text-xs text-slate-400 font-medium">{kpi.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: kpi.color }}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Language distribution bar chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-700 mb-4">Users by Language</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.top_languages ?? []} barSize={32}>
                <XAxis dataKey="lang" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(data?.top_languages ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Agent distribution pie chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-700 mb-4">Agent Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={agentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} ${value}%`}>
                  {agentData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7 Agent status table */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-4">7-Agent Status</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b">
                  <th className="text-left py-2 font-medium">Agent</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Calls Today</th>
                  <th className="text-left py-2 font-medium">Model</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Master Orchestrator', status: 'active', calls: 366, model: 'claude-haiku' },
                  { name: 'Context Agent', status: 'active', calls: 142, model: 'claude-haiku' },
                  { name: 'Literacy Agent', status: 'active', calls: 89, model: 'claude-haiku' },
                  { name: 'Behavioural Coach', status: 'active', calls: 67, model: 'claude-haiku' },
                  { name: 'Scam Guardian', status: 'active', calls: 23, model: 'claude-sonnet' },
                  { name: 'Benefits Navigator', status: 'active', calls: 45, model: 'claude-haiku' },
                  { name: 'Accessibility Agent', status: 'active', calls: 12, model: 'claude-haiku' },
                ].map(agent => (
                  <tr key={agent.name} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-700">{agent.name}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-green-600 text-xs font-medium">Active</span>
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{agent.calls.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        agent.model === 'claude-sonnet'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>{agent.model}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance footer */}
        <div className="text-center text-xs text-slate-400 pb-4">
          ArthMitra v1.0.0 • SEBI IA Compliant • DPDP Act 2023 • RBI Digital Lending Guidelines 2022 • Nomura KakushIN 2026
        </div>
      </main>
    </div>
  );
}