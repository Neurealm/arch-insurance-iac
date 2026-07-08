import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Bot, PlayCircle, CheckCircle2, Activity, Clock, DollarSign, Search, Sparkles,
  ServerCog, Database, ScanSearch, Wrench, ShieldCheck, Network, HardDrive, PiggyBank,
  CloudUpload, Lock, FileEdit, ListChecks, Layers, Cog, ShieldAlert,
  Boxes, PowerOff, AlertTriangle, Users, KeyRound, Timer, FileText, Plug,
} from "lucide-react";

type Cat = "All Agents" | "Provisioning & Build" | "Operations & Monitoring" | "Optimization" | "Compliance & Governance" | "Security & Risk";

type Agent = {
  name: string;
  cat: Exclude<Cat, "All Agents">;
  icon: any;
  color: string;
  bg: string;
  desc: string;
  metrics: { l: string; v: string; cls?: string }[];
};

const agents: Agent[] = [
  {
    name: "Provisioning Validator", cat: "Provisioning & Build",
    icon: ServerCog, color: "text-blue-600", bg: "bg-blue-50",
    desc: "Validates server, network, and storage provisioning against standards and policies before activation.",
    metrics: [
      { l: "Tasks Executed (7D)",   v: "842" },
      { l: "Issues Prevented (7D)", v: "312" },
      { l: "Time Saved (7D)",       v: "126 hrs" },
    ],
  },
  {
    name: "Capacity Optimizer", cat: "Optimization",
    icon: Database, color: "text-violet-600", bg: "bg-violet-50",
    desc: "Analyzes utilization trends and recommends or executes capacity optimization actions.",
    metrics: [
      { l: "Tasks Executed (7D)",  v: "621" },
      { l: "Optimizations (7D)",   v: "148" },
      { l: "Cost Savings (MTD)",   v: "$112K" },
    ],
  },
  {
    name: "Drift Detector", cat: "Operations & Monitoring",
    icon: ScanSearch, color: "text-amber-600", bg: "bg-amber-50",
    desc: "Continuously detects configuration drift across compute, storage, and network layers.",
    metrics: [
      { l: "Scans (7D)",         v: "2,731" },
      { l: "Drift Findings (7D)",v: "286" },
      { l: "Auto-Remediated (7D)",v: "183" },
    ],
  },
  {
    name: "Auto-Remediator", cat: "Operations & Monitoring",
    icon: Wrench, color: "text-emerald-600", bg: "bg-emerald-50",
    desc: "Automatically remediates common infrastructure issues based on policies and best practices.",
    metrics: [
      { l: "Actions Taken (7D)", v: "964" },
      { l: "Success Rate (7D)",  v: "98.9%", cls: "text-emerald-600" },
      { l: "Time Saved (7D)",    v: "241 hrs" },
    ],
  },
  {
    name: "Compliance Guardian", cat: "Compliance & Governance",
    icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50",
    desc: "Ensures infrastructure compliance with policies, baselines, and regulatory requirements.",
    metrics: [
      { l: "Checks (7D)",          v: "1,923" },
      { l: "Violations Found (7D)",v: "74" },
      { l: "Auto-Fixed (7D)",      v: "62" },
    ],
  },
  {
    name: "Network Watcher", cat: "Operations & Monitoring",
    icon: Network, color: "text-violet-600", bg: "bg-violet-50",
    desc: "Monitors network health, performance, and configurations; detects and resolves anomalies.",
    metrics: [
      { l: "Events Processed (7D)",  v: "4,112" },
      { l: "Incidents Resolved (7D)",v: "93" },
      { l: "Time Saved (7D)",        v: "87 hrs" },
    ],
  },
  {
    name: "Storage Guardian", cat: "Operations & Monitoring",
    icon: HardDrive, color: "text-emerald-600", bg: "bg-emerald-50",
    desc: "Monitors storage health, capacity, and performance; predicts and prevents storage issues.",
    metrics: [
      { l: "Checks (7D)",         v: "1,784" },
      { l: "Issues Resolved (7D)",v: "119" },
      { l: "Time Saved (7D)",     v: "96 hrs" },
    ],
  },
  {
    name: "Cost Sentinel", cat: "Optimization",
    icon: PiggyBank, color: "text-emerald-600", bg: "bg-emerald-50",
    desc: "Identifies cost anomalies and rightsizes resources to optimize spend.",
    metrics: [
      { l: "Analyses (7D)",         v: "684" },
      { l: "Savings Identified (MTD)",v: "$98K" },
      { l: "Resources Optimized (7D)",v: "73" },
    ],
  },
  {
    name: "Backup Assurance", cat: "Operations & Monitoring",
    icon: CloudUpload, color: "text-blue-600", bg: "bg-blue-50",
    desc: "Validates backup jobs, retention compliance, and recovery readiness.",
    metrics: [
      { l: "Jobs Validated (7D)",  v: "2,356" },
      { l: "Failures Detected (7D)",v: "41" },
      { l: "Issues Resolved (7D)", v: "39" },
    ],
  },
  {
    name: "Security Sentinel", cat: "Security & Risk",
    icon: Lock, color: "text-red-600", bg: "bg-red-50",
    desc: "Detects security misconfigurations, vulnerabilities, and risky exposures; auto-remediates when possible.",
    metrics: [
      { l: "Findings (7D)",   v: "214" },
      { l: "Remediated (7D)", v: "162" },
      { l: "Risk Reduced (7D)",v: "92%", cls: "text-emerald-600" },
    ],
  },
  {
    name: "Change Coordinator", cat: "Compliance & Governance",
    icon: FileEdit, color: "text-violet-600", bg: "bg-violet-50",
    desc: "Orchestrates changes, enforces approvals, and validates successful implementation.",
    metrics: [
      { l: "Changes Processed (7D)",v: "128" },
      { l: "Approvals (7D)",        v: "127" },
      { l: "Success Rate (7D)",     v: "100%", cls: "text-emerald-600" },
    ],
  },
];

const categories: { name: Cat; icon: any; color: string }[] = [
  { name: "All Agents",              icon: Bot,         color: "text-blue-600" },
  { name: "Provisioning & Build",    icon: ServerCog,   color: "text-blue-600" },
  { name: "Operations & Monitoring", icon: Activity,    color: "text-emerald-600" },
  { name: "Optimization",            icon: Sparkles,    color: "text-violet-600" },
  { name: "Compliance & Governance", icon: ShieldCheck, color: "text-amber-600" },
  { name: "Security & Risk",         icon: ShieldAlert, color: "text-red-600" },
];

const kpis = [
  { icon: Bot,         label: "Total Digital Coworkers", value: "11",    sub: "Active Agents",          color: "text-blue-600",    bg: "bg-blue-50" },
  { icon: PlayCircle,  label: "Automations Executed (7D)", value: "4,892",sub: "+18.7% vs last 7 days",  color: "text-violet-600",  bg: "bg-violet-50",   subCls: "text-emerald-600" },
  { icon: CheckCircle2,label: "Success Rate (7D)",       value: "98.6%", sub: "+1.2% vs last 7 days",   color: "text-emerald-600", bg: "bg-emerald-50",  subCls: "text-emerald-600" },
  { icon: Activity,    label: "Issues Resolved (7D)",    value: "1,248", sub: "+14.3% vs last 7 days",  color: "text-amber-600",   bg: "bg-amber-50",    subCls: "text-emerald-600" },
  { icon: Clock,       label: "Avg. Time Saved per Action", value: "15.2 min", sub: "+9.8% vs last 7 days", color: "text-blue-600", bg: "bg-blue-50",     subCls: "text-emerald-600" },
  { icon: DollarSign,  label: "Cost Savings (MTD)",      value: "$412K", sub: "+16.5% vs last month",   color: "text-emerald-600", bg: "bg-emerald-50",  subCls: "text-emerald-600" },
];

const counts: Record<Cat, number> = {
  "All Agents": agents.length,
  "Provisioning & Build": agents.filter(a => a.cat === "Provisioning & Build").length,
  "Operations & Monitoring": agents.filter(a => a.cat === "Operations & Monitoring").length,
  "Optimization": agents.filter(a => a.cat === "Optimization").length,
  "Compliance & Governance": agents.filter(a => a.cat === "Compliance & Governance").length,
  "Security & Risk": agents.filter(a => a.cat === "Security & Risk").length,
};

const automationImpact = [
  { l: "Issues Resolved",      v: "12,842" },
  { l: "Hours Saved",          v: "18,742" },
  { l: "Cost Savings",         v: "$3.28M" },
  { l: "Automations Executed", v: "245,731" },
  { l: "Success Rate",         v: "98.6%", cls: "text-emerald-600 font-bold" },
];

const recent = [
  { t: "10:15 AM", e: "Auto-Remediator fixed high CPU on APP-WEB-23",       s: "Success" },
  { t: "10:12 AM", e: "Provisioning Validator approved build for DB-CL-17", s: "Success" },
  { t: "10:09 AM", e: "Drift Detector remediated 5 configuration drift items", s: "Success" },
  { t: "10:05 AM", e: "Capacity Optimizer rightsized 8 VMs",                s: "Success" },
  { t: "10:02 AM", e: "Backup Assurance resolved failed backup job",        s: "Success" },
];

const outcomes = [
  { icon: CheckCircle2, color: "text-blue-600",    bg: "bg-blue-50",    v: "12,842",  l: "Issues Resolved" },
  { icon: Clock,        color: "text-violet-600",  bg: "bg-violet-50",  v: "18,742",  l: "Hours Saved" },
  { icon: DollarSign,   color: "text-emerald-600", bg: "bg-emerald-50", v: "$3.28M",  l: "Cost Savings" },
  { icon: Layers,       color: "text-amber-600",   bg: "bg-amber-50",   v: "245,731", l: "Automations Executed" },
  { icon: Cog,          color: "text-blue-600",    bg: "bg-blue-50",    v: "98.6%",   l: "Success Rate" },
];

const governance = [
  { l: "Policies Enforced",     v: "156" },
  { l: "Approvals Required",    v: "342" },
  { l: "Approvals Auto-Granted",v: "1,842" },
  { l: "Pending Approvals",     v: "6" },
];

export default function CoworkersInfra() {
  const nav = useNavigate();
  const [activeCat, setActiveCat] = useState<Cat>("All Agents");
  const [query, setQuery] = useState("");

  const filtered = agents.filter(
    (a) => (activeCat === "All Agents" || a.cat === activeCat) &&
           (query === "" || a.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <AppShell>
      <main className="flex-1 px-6 py-5 bg-slate-50/50 animate-fade-in min-w-0">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            DIGITAL COWORKER – <span className="text-slate-700">INFRASTRUCTURE AUTOMATION CONSOLE</span>
          </h1>
          <p className="text-sm italic text-slate-600 mt-1">
            Intelligent agents that manage, automate, and optimize infrastructure operations across hybrid environments.
          </p>
        </div>

        {/* WWH */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {[
            { tone: "blue", title: "WHAT", subtitle: "What this dashboard shows", items: [
              "The Infrastructure Automation Console — the system where digital coworkers (AI agents) execute operational tasks and optimize infrastructure at scale.",
            ]},
            { tone: "green", title: "WHY", subtitle: "Why it matters", items: [
              "Manual infrastructure operations do not scale across hybrid environments. Digital coworkers deliver speed, consistency, and reliability while reducing operational cost and risk.",
            ]},
            { tone: "purple", title: "HOW", subtitle: "How we deliver it", items: [
              "Agents for: Provisioning validation, Capacity optimization, Drift detection, Auto-remediation",
              "Real-time execution logs",
              "Policy-driven automation with approvals",
              "Measurable outcomes (issues resolved, time saved)",
            ]},
          ].map((c) => {
            const tones: any = {
              blue:   { bg: "bg-blue-50",    border: "border-l-blue-500",    title: "text-blue-700",    icon: "text-blue-600" },
              green:  { bg: "bg-emerald-50", border: "border-l-emerald-500", title: "text-emerald-700", icon: "text-emerald-600" },
              purple: { bg: "bg-violet-50",  border: "border-l-violet-500",  title: "text-violet-700",  icon: "text-violet-600" },
            };
            const t = tones[c.tone];
            return (
              <div key={c.title} className={`rounded-xl border border-slate-200 border-l-4 ${t.border} ${t.bg} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className={`h-5 w-5 ${t.icon}`} />
                  <span className={`font-bold text-sm ${t.title}`}>{c.title}</span>
                  <span className="text-xs text-slate-600">– {c.subtitle}</span>
                </div>
                <ul className="text-[12px] text-slate-700 space-y-1 list-disc list-inside leading-relaxed">
                  {c.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Sidebar + KPIs + cards */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
          {/* Library / sidebar */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="p-4 border-b border-slate-100">
                <div className="text-sm font-bold text-slate-900">Digital Coworker Library</div>
                <div className="text-[11px] text-slate-500 mt-0.5">All Infrastructure Automation Agents</div>
              </div>
              <div className="p-2">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const active = c.name === activeCat;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setActiveCat(c.name)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] mb-0.5 ${active ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "text-blue-600" : c.color}`} />
                      <span className="flex-1 text-left">{c.name}</span>
                      <span className={`text-[10px] font-semibold ${active ? "text-blue-700" : "text-slate-500"}`}>{counts[c.name]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-3">Filters</div>
              {["Category", "Environment", "Status", "Impact"].map((f) => (
                <div key={f} className="mb-2">
                  <div className="text-[11px] font-semibold text-slate-600 mb-1">{f}</div>
                  <select className="w-full text-[11px] border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700">
                    <option>All</option>
                  </select>
                </div>
              ))}
              <button onClick={() => setActiveCat("All Agents")} className="text-[11px] text-blue-600 font-semibold mt-1">Clear All</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-3">Automation Impact (All Time)</div>
              <div className="space-y-2">
                {automationImpact.map((m) => (
                  <div key={m.l} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">{m.l}</span>
                    <span className={`font-semibold text-slate-900 ${m.cls ?? ""}`}>{m.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right column */}
          <div>
            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              {kpis.map((k) => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className={`h-9 w-9 rounded-lg ${k.bg} ${k.color} grid place-items-center shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-medium text-slate-500 truncate">{k.label}</div>
                        <div className="text-xl font-bold text-slate-900 leading-tight">{k.value}</div>
                      </div>
                    </div>
                    <div className={`mt-1 text-[10px] ${(k as any).subCls ?? "text-slate-500"}`}>{k.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search agents..."
                  className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <select className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700">
                <option>Sort by: Most Impact</option>
              </select>
            </div>

            {/* Agent cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
              {filtered.map((a) => {
                const Icon = a.icon;
                return (
                  <article key={a.name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg ${a.bg} ${a.color} grid place-items-center shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">{a.name}</h3>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">Active</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{a.cat}</div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-3 leading-snug">{a.desc}</p>

                    <div className="mt-3 space-y-1.5 text-[11px]">
                      {a.metrics.map((m) => (
                        <div key={m.l} className="flex items-center justify-between">
                          <span className="text-slate-600">{m.l}</span>
                          <span className={`font-bold text-slate-900 ${m.cls ?? ""}`}>{m.v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                      <button className="flex-1 text-xs font-semibold border border-slate-200 text-slate-700 rounded-lg py-1.5 hover:bg-slate-50">View Details</button>
                      <button onClick={() => nav("/coworkers/deploy")} className="flex-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5">
                        Deploy
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Bottom panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
              {/* Recent activity */}
              <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-900 mb-3">Recent Automation Activity</div>
                <div className="space-y-2">
                  {recent.map((r, i) => (
                    <div key={i} className="grid grid-cols-12 items-start gap-2 text-[11px] border-b border-slate-50 pb-1.5 last:border-0">
                      <div className="col-span-3 text-slate-500">{r.t}</div>
                      <div className="col-span-7 text-slate-700">{r.e}</div>
                      <div className="col-span-2 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3 w-3" /> {r.s}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automation outcomes */}
              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-900 mb-3">Automation Outcomes (30 Days)</div>
                <div className="grid grid-cols-5 gap-2">
                  {outcomes.map((o) => {
                    const Icon = o.icon;
                    return (
                      <div key={o.l} className="text-center">
                        <div className={`mx-auto h-10 w-10 rounded-lg ${o.bg} ${o.color} grid place-items-center mb-1`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-extrabold text-slate-900 leading-tight">{o.v}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">{o.l}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Governance */}
              <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-900 mb-3">Automation Governance</div>
                <div className="space-y-2">
                  {governance.map((g) => (
                    <div key={g.l} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">{g.l}</span>
                      <span className="font-bold text-slate-900">{g.v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="relative h-20 w-20 shrink-0">
                    <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(214 32% 91%)" strokeWidth="4" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="4" strokeDasharray={`${84.2 * 0.879} 999`} />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(217 91% 60%)" strokeWidth="4" strokeDasharray={`${15.3 * 0.879} 999`} strokeDashoffset={`-${84.2 * 0.879}`} />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(262 83% 58%)" strokeWidth="4" strokeDasharray={`${0.5 * 0.879} 999`} strokeDashoffset={`-${(84.2 + 15.3) * 0.879}`} />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="text-center">
                        <div className="text-[10px] font-extrabold text-slate-900 leading-tight">245,731</div>
                        <div className="text-[8px] text-slate-500">Total Executions</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-[10px] flex-1">
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-500" /><span className="flex-1 text-slate-600">Auto-Executed</span><span className="font-semibold">84.2%</span></div>
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-blue-500" /><span className="flex-1 text-slate-600">Approved</span><span className="font-semibold">15.3%</span></div>
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-violet-500" /><span className="flex-1 text-slate-600">Manual</span><span className="font-semibold">0.5%</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span className="text-[12px] text-slate-700">
                Digital coworkers work 24x7 to keep your infrastructure secure, compliant, optimized, and always ready.
              </span>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
