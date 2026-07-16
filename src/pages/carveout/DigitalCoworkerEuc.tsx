import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Bot, CheckCircle2, Target, Clock, Users, ShieldCheck, AlertTriangle,
  Search, Grid3x3, List, ChevronDown, Settings, Lock, Network, BarChart3, Zap,
  Wrench, HeartPulse, UserCog, Monitor, Truck, LineChart as LineChartIcon, Shield, PieChart as PieChartIcon,
} from "lucide-react";

const kpis: KPI[] = [
  { label: "Active Digital Coworkers", value: "16", sub: "Running Now", icon: Bot, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Automations Executed (Today)", value: "2,842", sub: "↑ 24% vs yesterday", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Issues Resolved (Today)", value: "1,976", sub: "↑ 28% vs yesterday", subColor: "text-emerald-600", icon: Target, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Time Saved (Today)", value: "612 hrs", sub: "↑ 20% vs yesterday", subColor: "text-emerald-600", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Users Impacted (Today)", value: "4,310", sub: "↑ 18% vs yesterday", subColor: "text-emerald-600", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Success Rate (7 Days)", value: "98.7%", sub: "Target: > 95%", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Actions Awaiting Approval", value: "18", sub: "Requires Review", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
];

type Coworker = {
  name: string;
  category: string;
  catColor: string;
  catIcon: any;
  catBg: string;
  desc: string;
  outcome: string;
  impact: "High" | "Medium" | "Low";
  auto: string;
  rate: string;
};

const coworkers: Coworker[] = [
  { name: "Provisioning Validator", category: "Device Provisioning", catColor: "text-blue-600", catBg: "bg-blue-100", catIcon: Bot, desc: "Validates device orders, configurations, and imaging before shipment and deployment.", outcome: "Ensures error-free provisioning and reduces rework by 90%.", impact: "High", auto: "482", rate: "99.2%" },
  { name: "Patch Compliance Enforcer", category: "Security & Compliance", catColor: "text-emerald-600", catBg: "bg-emerald-100", catIcon: ShieldCheck, desc: "Monitors patch status and enforces compliance across all endpoints automatically.", outcome: "Improves security posture and reduces vulnerability risk by 85%.", impact: "High", auto: "614", rate: "98.6%" },
  { name: "Drift Remediation Agent", category: "Configuration & Drift", catColor: "text-violet-600", catBg: "bg-violet-100", catIcon: Settings, desc: "Detects configuration drift and remediates deviations to maintain standard state.", outcome: "Maintains consistency, secure configurations and reduces downtime by 70%.", impact: "High", auto: "356", rate: "97.8%" },
  { name: "Self-Healing Agent", category: "User Experience", catColor: "text-amber-600", catBg: "bg-amber-100", catIcon: HeartPulse, desc: "Automatically detects and resolves common endpoint and application issues.", outcome: "Improves user productivity and reduces tickets by 60%.", impact: "High", auto: "708", rate: "98.9%" },
  { name: "Identity Cutover Coordinator", category: "Identity & Access", catColor: "text-blue-600", catBg: "bg-blue-100", catIcon: Lock, desc: "Orchestrates domain migration, MFA re-enrollment, and access validation.", outcome: "Ensures secure access for all users on Day 1 with zero access gaps.", impact: "High", auto: "222", rate: "99.1%" },
  { name: "VDI Access Manager", category: "VDI & Continuity", catColor: "text-blue-600", catBg: "bg-blue-100", catIcon: Monitor, desc: "Provisions and manages VDI access for users without physical devices.", outcome: "Ensures business continuity and zero productivity loss.", impact: "High", auto: "198", rate: "98.3%" },
  { name: "Logistics Orchestrator", category: "Logistics & Field Ops", catColor: "text-amber-600", catBg: "bg-amber-100", catIcon: Truck, desc: "Tracks shipments, coordinates field techs, and monitors site readiness.", outcome: "Delivers on-time, complete installations across all sites.", impact: "Medium", auto: "144", rate: "97.6%" },
  { name: "Experience Optimizer", category: "User Experience", catColor: "text-violet-600", catBg: "bg-violet-100", catIcon: BarChart3, desc: "Monitors performance metrics and optimizes app, device, and network experience.", outcome: "Improves user experience scores and boosts productivity.", impact: "High", auto: "324", rate: "98.0%" },
  { name: "Security Guard", category: "Security & Compliance", catColor: "text-emerald-600", catBg: "bg-emerald-100", catIcon: Shield, desc: "Detects threats, enforces policies, and remediates security risks in real time.", outcome: "Reduces security incidents and strengthens compliance posture.", impact: "High", auto: "276", rate: "98.8%" },
  { name: "EUC Insights Analyst", category: "Analytics & Insights", catColor: "text-violet-600", catBg: "bg-violet-100", catIcon: PieChartIcon, desc: "Analyzes EUC data to provide actionable insights and predict issues.", outcome: "Enables proactive decisions and continuous improvement.", impact: "Medium", auto: "118", rate: "96.9%" },
];

const categories = [
  { l: "All Coworkers", n: 16, icon: Bot, active: true },
  { l: "Device Provisioning", n: 4, icon: Bot },
  { l: "Security & Compliance", n: 3, icon: ShieldCheck },
  { l: "Configuration & Drift", n: 3, icon: Settings },
  { l: "Identity & Access", n: 2, icon: Lock },
  { l: "User Experience", n: 2, icon: HeartPulse },
  { l: "VDI & Continuity", n: 1, icon: Monitor },
  { l: "Logistics & Field Ops", n: 1, icon: Truck },
];

const deployStatus = [
  { l: "Active", n: 16, color: "text-emerald-600", check: true },
  { l: "Paused", n: 0, color: "text-slate-500" },
  { l: "Draft", n: 0, color: "text-slate-500" },
];

const impactLevels = [
  { l: "High", n: 8, color: "text-red-600" },
  { l: "Medium", n: 6, color: "text-amber-600" },
  { l: "Low", n: 2, color: "text-emerald-600" },
];

const footer = [
  { icon: ShieldCheck, c: "text-emerald-600", t: "Purpose-Built for EUC Separation", s: "Built for your Day 1 readiness and post-separation success." },
  { icon: Lock, c: "text-blue-600", t: "Secure & Governed", s: "Policy-driven automation with approval workflows and audit trails." },
  { icon: Network, c: "text-violet-600", t: "Works With Your Ecosystem", s: "Integrates with Microsoft, VMware, Intune, ServiceNow, and more." },
  { icon: BarChart3, c: "text-amber-600", t: "Measurable Outcomes", s: "Real-time visibility into impact, savings, and performance." },
  { icon: Zap, c: "text-amber-500", t: "Always Learning", s: "Continuously improves from every action to drive better outcomes." },
];

const outcomes: Outcome[] = [];

function ImpactPill({ level }: { level: "High" | "Medium" | "Low" }) {
  const map = { High: "text-red-600", Medium: "text-amber-600", Low: "text-emerald-600" };
  return <span className={`text-xs font-bold ${map[level]}`}>{level}</span>;
}

function CoworkerCard({ c }: { c: Coworker }) {
  const I = c.catIcon;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <div className={`h-9 w-9 rounded-lg ${c.catBg} ${c.catColor} grid place-items-center shrink-0`}>
          <I className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> ACTIVE
        </span>
      </div>
      <div className="font-bold text-sm text-slate-900 leading-tight">{c.name}</div>
      <div className={`text-[10px] font-semibold ${c.catColor} mb-2`}>{c.category}</div>
      <div className="text-[11px] text-slate-600 leading-snug mb-2">{c.desc}</div>
      <div className="text-[10px] text-slate-500 font-semibold">Business Outcome:</div>
      <div className="text-[11px] text-slate-700 leading-snug mb-2 flex-1">{c.outcome}</div>
      <div className="grid grid-cols-3 gap-1 py-2 border-t border-slate-100 text-center">
        <div>
          <div className="text-[9px] text-slate-500">Impact</div>
          <ImpactPill level={c.impact} />
        </div>
        <div>
          <div className="text-[9px] text-slate-500">Automations (7D)</div>
          <div className="text-xs font-bold">{c.auto}</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-500">Success Rate</div>
          <div className="text-xs font-bold">{c.rate}</div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <a className="text-[11px] text-blue-600 font-semibold cursor-pointer">View Details →</a>
        <button className="inline-flex items-center gap-1 text-[11px] border border-slate-200 rounded-md px-2 py-1 hover:bg-slate-50">
          Actions <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default function DigitalCoworkerEuc() {
  return (
    <DashShell
      title="DIGITAL COWORKER MARKETPLACE — EUC SEPARATION EDITION"
      subtitle="Agentic digital coworkers purpose-built to execute, automate, and optimize End User Compute operations for a successful Day 1 separation."
      wwh={{
        what: [
          "A curated marketplace of Digital Coworkers built for EUC separation",
          "Each coworker automates critical tasks across the EUC lifecycle",
          "Purpose-built for Day 1 readiness and post-separation operations",
          "Outcomes, coverage, and performance for each coworker",
          "Choose, deploy, and scale coworkers for your environment",
        ],
        why: [
          "Delivers speed, consistency, and scale during a high-risk separation",
          "Reduces manual effort and operational cost",
          "Improves user experience and Day 1 readiness",
          "Enables proactive remediation and self-healing operations",
          "Digital workforce that works 24/7 across your environment",
        ],
        how: [
          "Pre-built, enterprise-grade agentic coworkers with specialized skills",
          "Secure integration with your tools, systems, and data",
          "Policy-driven automation with approval guardrails",
          "Continuous learning and improvement from every action",
          "Measurable outcomes with full transparency and auditability",
        ],
      }}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4 -mt-2">
        <div className="flex-1 min-w-[240px] flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="flex-1 text-xs outline-none bg-transparent" placeholder="Search digital coworkers..." />
        </div>
        <button className="inline-flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white">
          Category <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <div className="inline-flex items-center gap-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
          <span className="text-slate-500 mr-1">View</span>
          <button className="p-1 rounded bg-slate-100"><Grid3x3 className="h-3.5 w-3.5" /></button>
          <button className="p-1 rounded"><List className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Body: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4 mb-4">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Categories</div>
            <ul className="space-y-1">
              {categories.map((c) => {
                const I = c.icon;
                return (
                  <li key={c.l} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-md cursor-pointer ${c.active ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}>
                    <I className="h-3.5 w-3.5" />
                    <span className="flex-1">{c.l}</span>
                    <span className="text-[10px] text-slate-500">{c.n}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Deployment Status</div>
            <ul className="space-y-1.5 text-xs">
              {deployStatus.map((d) => (
                <li key={d.l} className="flex items-center gap-2">
                  <span className={`h-3.5 w-3.5 rounded-sm border ${d.check ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}>
                    {d.check && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </span>
                  <span className="flex-1">{d.l}</span>
                  <span className="text-slate-500">{d.n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Impact Level</div>
            <ul className="space-y-1.5 text-xs">
              {impactLevels.map((d) => (
                <li key={d.l} className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-sm border border-slate-300" />
                  <span className={`flex-1 font-semibold ${d.color}`}>{d.l}</span>
                  <span className="text-slate-500">{d.n}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-slate-900">16 Digital Coworkers</div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Sort by:</span>
              <button className="inline-flex items-center gap-1 border border-slate-200 rounded-md px-2 py-1 bg-white">
                Business Impact <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            {coworkers.map((c) => <CoworkerCard key={c.name} c={c} />)}
          </div>
        </div>
      </div>

      {/* Footer Pillars */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        {footer.map((f) => {
          const I = f.icon;
          return (
            <div key={f.t} className="flex items-start gap-2">
              <I className={`h-5 w-5 ${f.c} shrink-0 mt-0.5`} />
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">{f.t}</div>
                <div className="text-[11px] text-slate-600 leading-snug mt-0.5">{f.s}</div>
              </div>
            </div>
          );
        })}
      </div>
    </DashShell>
  );
}
