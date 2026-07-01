import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Search, Bell, HelpCircle, ChevronDown, Bot,
  AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Download,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

const TABS = ["Domain Scorecard", "Confidence Heatmap", "Missing Data", "Validation Queue", "Evidence Quality", "Assumptions", "History"];

function ProgressPill({ label, value, color = "#22c55e" }: { label: string; value: string; color?: string }) {
  const num = parseInt(value);
  return (
    <div className="flex flex-col gap-0.5 border-l border-border pl-3">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="w-20 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${num}%`, background: color }} />
        </div>
        <span className="text-[13px] font-bold" style={{ color }}>{value}</span>
      </div>
    </div>
  );
}

const DOMAINS = [
  { name: "Application Overview", completeness: 85, confidence: 82, trend: 8, trendDir: "up", verified: "May 11, 2026", quality: "High", status: "Good" },
  { name: "Architecture", completeness: 72, confidence: 74, trend: 5, trendDir: "up", verified: "May 10, 2026", quality: "High", status: "Good" },
  { name: "Infrastructure", completeness: 64, confidence: 69, trend: 3, trendDir: "up", verified: "May 09, 2026", quality: "Medium", status: "Fair" },
  { name: "Cloud", completeness: 58, confidence: 61, trend: 6, trendDir: "up", verified: "May 08, 2026", quality: "Medium", status: "Fair" },
  { name: "Identity & Access", completeness: 40, confidence: 45, trend: 2, trendDir: "up", verified: "May 07, 2026", quality: "Low", status: "Poor" },
  { name: "Cybersecurity", completeness: 55, confidence: 57, trend: -2, trendDir: "down", verified: "May 07, 2026", quality: "Medium", status: "Fair" },
  { name: "Observability", completeness: 60, confidence: 66, trend: 4, trendDir: "up", verified: "May 10, 2026", quality: "Medium", status: "Fair" },
  { name: "Support & Operations", completeness: 78, confidence: 80, trend: 7, trendDir: "up", verified: "May 11, 2026", quality: "High", status: "Good" },
  { name: "Data & Integrations", completeness: 50, confidence: 52, trend: 1, trendDir: "up", verified: "May 06, 2026", quality: "Low", status: "Fair" },
];

const MISSING = [
  { item: "Identity provider architecture", domain: "Identity & Access", impact: "High", priority: "High" },
  { item: "Network segmentation diagrams", domain: "Infrastructure", impact: "High", priority: "High" },
  { item: "DR runbook", domain: "Resilience", impact: "High", priority: "High" },
  { item: "Privileged access model", domain: "Identity & Access", impact: "Medium", priority: "Medium" },
  { item: "Monitoring alert catalog", domain: "Observability", impact: "Medium", priority: "Medium" },
];

const VALIDATION = [
  { item: "Cloud inventory (AWS)", requestedBy: "Lisa Chen", evidence: "Account export", priority: "High" },
  { item: "Security tool list", requestedBy: "Alex Morgan", evidence: "Tool inventory", priority: "High" },
  { item: "SLA definitions", requestedBy: "Mark Davis", evidence: "SLA document", priority: "Medium" },
  { item: "Backup strategy details", requestedBy: "Priya Nair", evidence: "Backup runbook", priority: "Medium" },
  { item: "Data retention policy", requestedBy: "Rachel Smith", evidence: "Policy document", priority: "Low" },
];

const HEATMAP = [
  { label: "High Completeness", high: 18, medium: 6, low: 2 },
  { label: "Medium Completeness", high: 11, medium: 9, low: 5 },
  { label: "Low Completeness", high: 4, medium: 3, low: 7 },
];

function QualityBadge({ v }: { v: string }) {
  return (
    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded",
      v === "High" ? "bg-emerald-100 text-emerald-700" : v === "Medium" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
    )}>{v}</span>
  );
}

function StatusBadge({ v }: { v: string }) {
  return (
    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded",
      v === "Good" ? "bg-emerald-100 text-emerald-700" : v === "Fair" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
    )}>{v}</span>
  );
}

function PriorityBadge({ v }: { v: string }) {
  return (
    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded",
      v === "High" ? "bg-rose-100 text-rose-700" : v === "Medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
    )}>{v}</span>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[10px] font-semibold w-8">{value}%</span>
    </div>
  );
}

const PIE_DATA = [
  { name: "Validated", value: 152, color: "#10b981" },
  { name: "Assumed", value: 38, color: "#f59e0b" },
  { name: "Missing", value: 33, color: "#ef4444" },
];

export default function DiscoveryConfidenceDemo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <AppShell>
      <div className="flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        {/* HEADER */}
        <div className="bg-white border-b border-border px-5 py-2.5 flex items-center gap-3 shrink-0 flex-wrap">
          <div className="min-w-0 mr-2">
            <h1 className="text-[15px] font-bold leading-tight">Discovery Confidence &amp; Completeness</h1>
            <p className="text-[10px] text-muted-foreground">Assess completeness, confidence, and data quality across all discovery domains</p>
          </div>
          <div className="flex items-center gap-0 flex-wrap flex-1">
            {[["Customer","Waters Corp"],["Application","Claims Processing Platform"],["AOCP Phase","Discovery"]].map(([k,v]) => (
              <div key={k} className="border-l border-border pl-3 pr-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="font-semibold text-[11px]">{v}</div>
              </div>
            ))}
            <ProgressPill label="Overall Completeness" value="68%" />
            <ProgressPill label="Overall Confidence" value="72%" />
            <div className="border-l border-border pl-3 pr-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Last Updated</div>
              <div className="font-semibold text-[11px]">May 12, 2026</div>
            </div>
            <div className="border-l border-border pl-3 flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">SJ</div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Owner</div>
                <div className="font-semibold text-[11px] flex items-center gap-0.5">Sarah Johnson <ChevronDown className="h-2.5 w-2.5" /></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="h-7 w-7 rounded-lg border flex items-center justify-center hover:bg-accent"><Search className="h-3.5 w-3.5 text-muted-foreground" /></button>
            <button className="h-7 w-7 rounded-lg border flex items-center justify-center hover:bg-accent relative">
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">12</span>
            </button>
            <button className="h-7 w-7 rounded-lg border flex items-center justify-center hover:bg-accent"><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /></button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold hover:bg-accent"><Download className="h-3.5 w-3.5" /> Export</button>
          </div>
        </div>

        {/* KPI MEGA STRIP */}
        <div className="bg-white border-b border-border px-5 py-2 shrink-0">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Overall Completeness", value: "68%", sub: "+6% vs last review", color: "#10b981", ring: true },
              { label: "Overall Confidence", value: "72%", sub: "+4% vs last review", color: "#3b82f6", ring: true },
              { label: "Validated Data", value: "152", sub: "of 223 data points", icon: "✓", color: "#10b981" },
              { label: "Assumed Data", value: "38", sub: "of 223 data points", icon: "⚠", color: "#f59e0b" },
              { label: "Missing Data", value: "33", sub: "of 223 data points", icon: "⊘", color: "#ef4444" },
              { label: "Conflicting Evidence", value: "7", sub: "Requires review", icon: "≠", color: "#8b5cf6" },
            ].map((k) => (
              <div key={k.label} className="rounded-lg border border-border bg-white px-3 py-2 flex items-center gap-2.5">
                {k.ring ? (
                  <div className="relative h-10 w-10 shrink-0">
                    <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke={k.color} strokeWidth="3"
                        strokeDasharray={`${parseInt(k.value) * 0.879} 87.9`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color: k.color }}>{k.value}</div>
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center text-[16px] shrink-0 bg-slate-50" style={{ color: k.color }}>{k.icon}</div>
                )}
                <div>
                  <div className="text-[14px] font-bold leading-none" style={{ color: k.ring ? undefined : k.color }}>{k.ring ? "" : k.value}</div>
                  <div className="text-[9px] font-bold text-muted-foreground leading-tight">{k.label}</div>
                  <div className="text-[9px] text-muted-foreground">{k.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUB-TABS */}
        <div className="bg-white border-b border-border px-5 flex gap-0 shrink-0">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)}
              className={cn("px-4 py-2.5 text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap",
                activeTab === i ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Domain Scorecard */}
            <div className="rounded-xl border bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Discovery Domain Scorecard</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 border-b border-border">
                    <tr>
                      {["Domain","Completeness","Confidence","Trend (vs last review)","Last Verified","Evidence Quality","Status"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DOMAINS.map((d) => (
                      <tr key={d.name} className="border-b border-border hover:bg-slate-50">
                        <td className="px-3 py-2 font-semibold">{d.name}</td>
                        <td className="px-3 py-2"><ProgressBar value={d.completeness} color="#10b981" /></td>
                        <td className="px-3 py-2"><ProgressBar value={d.confidence} color="#3b82f6" /></td>
                        <td className="px-3 py-2">
                          <span className={cn("flex items-center gap-0.5 font-semibold text-[10px]",
                            d.trendDir === "up" ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {d.trendDir === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {d.trendDir === "up" ? "▲" : "▼"} {Math.abs(d.trend)}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{d.verified}</td>
                        <td className="px-3 py-2"><QualityBadge v={d.quality} /></td>
                        <td className="px-3 py-2"><StatusBadge v={d.status} /></td>
                      </tr>
                    ))}
                    <tr className="border-b border-border bg-slate-50 font-bold">
                      <td className="px-3 py-2">Overall</td>
                      <td className="px-3 py-2"><ProgressBar value={68} color="#10b981" /></td>
                      <td className="px-3 py-2"><ProgressBar value={72} color="#3b82f6" /></td>
                      <td className="px-3 py-2"><span className="flex items-center gap-0.5 font-semibold text-[10px] text-emerald-600"><TrendingUp className="h-3 w-3" />▲ 6%</span></td>
                      <td className="px-3 py-2 text-muted-foreground">May 12, 2026</td>
                      <td className="px-3 py-2">—</td>
                      <td className="px-3 py-2"><StatusBadge v="Fair" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Heatmap + Data Quality side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-white p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Confidence Heatmap</span>
                  <span className="text-[10px] text-muted-foreground cursor-pointer">ⓘ</span>
                </div>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr>
                      <th className="pb-2 text-left font-semibold text-muted-foreground text-[10px]" />
                      {["High","Medium","Low"].map(h => (
                        <th key={h} className="pb-2 text-center font-semibold text-muted-foreground text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HEATMAP.map((row) => (
                      <tr key={row.label}>
                        <td className="py-2 pr-4 font-semibold text-muted-foreground text-[10px] whitespace-nowrap">{row.label}</td>
                        <td className="py-2 px-2 text-center">
                          <div className="mx-auto h-9 w-14 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-[14px] flex items-center justify-center">{row.high}</div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="mx-auto h-9 w-14 rounded-lg bg-amber-50 text-amber-600 font-bold text-[14px] flex items-center justify-center">{row.medium}</div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="mx-auto h-9 w-14 rounded-lg bg-rose-50 text-rose-600 font-bold text-[14px] flex items-center justify-center">{row.low}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex gap-4 mt-3 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />High Confidence</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />Medium Confidence</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400 inline-block" />Low Confidence</span>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Data Quality Breakdown</div>
                <div className="flex items-center gap-4">
                  <div className="relative h-36 w-36 shrink-0">
                    <ResponsiveContainer width="100%" height={144}>
                      <PieChart>
                        <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                          {PIE_DATA.map((d) => <Cell key={d.name} fill={d.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[16px] font-bold">223</span>
                      <span className="text-[8px] text-muted-foreground">Total Data Points</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {PIE_DATA.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-[11px]">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="flex-1 font-semibold">{d.value}</span>
                        <span className="text-muted-foreground">{d.name} ({Math.round(d.value / 223 * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Missing Data + Validation Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-white overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Top Missing Data (33)</span>
                </div>
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 border-b border-border">
                    <tr>
                      {["Item","Domain","Impact","Priority"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MISSING.map((m) => (
                      <tr key={m.item} className="border-b border-border hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium">{m.item}</td>
                        <td className="px-3 py-2 text-muted-foreground">{m.domain}</td>
                        <td className="px-3 py-2"><PriorityBadge v={m.impact} /></td>
                        <td className="px-3 py-2"><PriorityBadge v={m.priority} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-2 border-t border-border">
                  <button className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1">View all missing data →</button>
                </div>
              </div>

              <div className="rounded-xl border bg-white overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Validation Queue (12)</span>
                </div>
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 border-b border-border">
                    <tr>
                      {["Item","Requested By","Evidence Needed","Priority"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {VALIDATION.map((v) => (
                      <tr key={v.item} className="border-b border-border hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium">{v.item}</td>
                        <td className="px-3 py-2 text-muted-foreground">{v.requestedBy}</td>
                        <td className="px-3 py-2 text-muted-foreground">{v.evidence}</td>
                        <td className="px-3 py-2"><PriorityBadge v={v.priority} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-2 border-t border-border">
                  <button className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1">View full validation queue →</button>
                </div>
              </div>
            </div>
          </main>

          {/* NOVA PANEL */}
          <aside className="w-72 border-l border-border bg-white overflow-y-auto shrink-0">
            <div className="p-3 border-b border-border bg-gradient-to-r from-violet-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-violet-600 text-white grid place-items-center"><Bot className="h-3.5 w-3.5" /></div>
                <span className="text-[12px] font-bold text-violet-700">NOVA Digital Coworker</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Insights &amp; Recommendations</div>
            </div>
            <div className="p-3 space-y-2.5">
              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-blue-50 grid place-items-center"><span className="text-[9px]">💡</span></div>
                  <span className="text-[11px] font-bold">Key Insight</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Identity &amp; Access and Cybersecurity domains have the lowest confidence and should be prioritized to reduce delivery risk.</p>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">View Insight Details</button>
              </div>
              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-rose-50 grid place-items-center"><AlertTriangle className="h-2.5 w-2.5 text-rose-500" /></div>
                  <span className="text-[11px] font-bold">Recommended Focus Areas</span>
                </div>
                <ol className="text-[10px] text-muted-foreground space-y-0.5 ml-2">
                  <li>1. Capture identity provider architecture</li>
                  <li>2. Validate network segmentation</li>
                  <li>3. Collect DR and backup runbooks</li>
                </ol>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">Create Discovery Tasks</button>
              </div>
              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-amber-50 grid place-items-center"><AlertTriangle className="h-2.5 w-2.5 text-amber-500" /></div>
                  <span className="text-[11px] font-bold">Weak Evidence Detected</span>
                </div>
                <p className="text-[10px] text-muted-foreground">7 items are supported by low-confidence sources or conflicting evidence.</p>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">Review Weak Evidence</button>
              </div>
              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-emerald-50 grid place-items-center"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" /></div>
                  <span className="text-[11px] font-bold">Next Best Actions</span>
                </div>
                <div className="space-y-0.5">
                  {["Upload missing evidence (33)","Address validation queue (12)","Review conflicting evidence (7)"].map((a) => (
                    <div key={a} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />{a}
                    </div>
                  ))}
                </div>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">View All Actions</button>
              </div>
            </div>
            <div className="p-3 border-t border-border">
              <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700">
                <Bot className="h-3.5 w-3.5" /> Ask NOVA a Question
              </button>
            </div>
          </aside>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-border bg-white px-5 py-2.5 flex items-center gap-3 shrink-0">
          <button onClick={() => navigate("/crm-demo")} className="px-4 py-1.5 rounded-lg border text-[11px] font-semibold hover:bg-accent">← Back to CRM</button>
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border text-[11px] font-semibold hover:bg-accent"><Download className="h-3.5 w-3.5" /> Export Report</button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700">
            Proceed to Application Intelligence →
          </button>
        </div>
      </div>
    </AppShell>
  );
}
