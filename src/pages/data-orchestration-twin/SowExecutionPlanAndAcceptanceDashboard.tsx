import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, BadgeCheck, CheckCircle2, ChevronRight,
  ClipboardCheck, Clock, Code2, Cpu, Database, Download, FileCheck2, Filter,
  Flag, GitBranch, Layers, ListChecks, Play, RefreshCw, Rocket, Search, Settings2,
  Shield, ShieldCheck, Sparkles, Target, Timer, TrendingDown, TrendingUp,
  Users, Workflow, X, Zap, Gauge as GaugeIcon, Boxes, Route,
} from "lucide-react";

type Tone = "blue"|"emerald"|"amber"|"rose"|"violet"|"teal"|"orange"|"slate";
const T: Record<Tone,{text:string;bg:string;ring:string;dot:string;border:string;stroke:string;bar:string;soft:string}> = {
  blue:    { text:"text-blue-700",    bg:"bg-blue-50",    ring:"ring-blue-200",    dot:"bg-blue-500",    border:"border-blue-200",    stroke:"#3b82f6", bar:"bg-blue-500",    soft:"bg-blue-100/60" },
  emerald: { text:"text-emerald-700", bg:"bg-emerald-50", ring:"ring-emerald-200", dot:"bg-emerald-500", border:"border-emerald-200", stroke:"#10b981", bar:"bg-emerald-500", soft:"bg-emerald-100/60" },
  amber:   { text:"text-amber-700",   bg:"bg-amber-50",   ring:"ring-amber-200",   dot:"bg-amber-500",   border:"border-amber-200",   stroke:"#f59e0b", bar:"bg-amber-500",   soft:"bg-amber-100/60" },
  rose:    { text:"text-rose-700",    bg:"bg-rose-50",    ring:"ring-rose-200",    dot:"bg-rose-500",    border:"border-rose-200",    stroke:"#f43f5e", bar:"bg-rose-500",    soft:"bg-rose-100/60" },
  violet:  { text:"text-violet-700",  bg:"bg-violet-50",  ring:"ring-violet-200",  dot:"bg-violet-500",  border:"border-violet-200",  stroke:"#8b5cf6", bar:"bg-violet-500",  soft:"bg-violet-100/60" },
  teal:    { text:"text-teal-700",    bg:"bg-teal-50",    ring:"ring-teal-200",    dot:"bg-teal-500",    border:"border-teal-200",    stroke:"#14b8a6", bar:"bg-teal-500",    soft:"bg-teal-100/60" },
  orange:  { text:"text-orange-700",  bg:"bg-orange-50",  ring:"ring-orange-200",  dot:"bg-orange-500",  border:"border-orange-200",  stroke:"#f97316", bar:"bg-orange-500",  soft:"bg-orange-100/60" },
  slate:   { text:"text-slate-700",   bg:"bg-slate-50",   ring:"ring-slate-200",   dot:"bg-slate-500",   border:"border-slate-200",   stroke:"#64748b", bar:"bg-slate-500",   soft:"bg-slate-100/60" },
};

/* ============== KPIs ============== */
const kpis:{label:string;value:string;sub:string;tone:Tone;icon:any;spark:number[];trend:string}[] = [
  { label:"Overall Program Progress", value:"68%",   sub:"On Track · ↑ 8% vs prior 7D",  tone:"emerald", icon:GaugeIcon,    spark:[52,55,58,60,63,66,68],  trend:"+8%" },
  { label:"Milestones Completed",     value:"11/16", sub:"↑ 2 vs prior 7D",              tone:"blue",    icon:Flag,         spark:[7,8,9,10,10,11,11],     trend:"+2" },
  { label:"Acceptance Criteria Met",  value:"24/34", sub:"71% · ↑ 6 vs prior 7D",        tone:"emerald", icon:ClipboardCheck,spark:[14,16,18,20,22,23,24], trend:"+6" },
  { label:"Open Engineering Backlog", value:"42",    sub:"↓ 8 vs prior 7D",              tone:"orange",  icon:ListChecks,   spark:[62,58,54,52,48,46,42],  trend:"-8" },
  { label:"Critical Dependencies",    value:"7",     sub:"↑ 1 vs prior 7D",              tone:"amber",   icon:GitBranch,    spark:[5,5,6,6,6,7,7],         trend:"+1" },
  { label:"Program Risk Score",       value:"0.86",  sub:"Good · ↑ 6% vs prior 7D",      tone:"violet",  icon:Shield,       spark:[0.78,0.80,0.82,0.83,0.84,0.85,0.86], trend:"+6%" },
  { label:"Planned Production",       value:"Jun 30",sub:"76 days remaining",            tone:"teal",    icon:Rocket,       spark:[92,88,84,82,80,78,76],  trend:"On Plan" },
  { label:"Executive Health",         value:"On Track", sub:"Confidence 0.91",           tone:"emerald", icon:BadgeCheck,   spark:[0.82,0.85,0.87,0.88,0.89,0.90,0.91], trend:"+0.09" },
];

/* ============== Lifecycle stages ============== */
const stages:{n:number;title:string;sub:string;status:"COMPLETE"|"IN PROGRESS"|"PLANNED";pct:number;dates:string;icon:any;tone:Tone}[] = [
  { n:1, title:"Current State Discovery",     sub:"Inventory · architecture · workflows",       status:"COMPLETE",    pct:100, dates:"Apr 10 – Apr 18", icon:Search,      tone:"emerald" },
  { n:2, title:"Data Readiness Assessment",   sub:"Quality · schema · freshness · hydration",   status:"COMPLETE",    pct:100, dates:"Apr 19 – Apr 28", icon:Database,    tone:"emerald" },
  { n:3, title:"Architecture Validation",     sub:"Reference · security · performance",         status:"IN PROGRESS", pct: 75, dates:"Apr 29 – May 15", icon:Settings2,   tone:"blue" },
  { n:4, title:"Failure Analysis & Root Cause",sub:"Gap · dependencies · operational risk",     status:"IN PROGRESS", pct: 60, dates:"May 10 – May 23", icon:AlertTriangle,tone:"violet" },
  { n:5, title:"Solution Design & Blueprint", sub:"Canonical · hydration · graph · query",      status:"PLANNED",     pct:  0, dates:"May 24 – Jun 6",  icon:Layers,      tone:"orange" },
  { n:6, title:"Engineering Delivery",        sub:"Config · validation · automation · docs",    status:"PLANNED",     pct:  0, dates:"Jun 7 – Jun 25",  icon:Code2,       tone:"blue" },
  { n:7, title:"Acceptance & Handoff",        sub:"Operational · executive · production ready", status:"PLANNED",     pct:  0, dates:"Jun 26 – Jun 30", icon:Flag,        tone:"rose" },
];

/* ============== Acceptance categories ============== */
const acceptance:{cat:string;met:number;total:number;pct:number;tone:Tone}[] = [
  { cat:"Functional Requirements",  met: 8, total:10, pct:80, tone:"emerald" },
  { cat:"Data Quality & Readiness", met: 6, total: 8, pct:75, tone:"blue" },
  { cat:"Architecture & Design",    met: 5, total: 6, pct:83, tone:"emerald" },
  { cat:"Performance & Scalability",met: 3, total: 5, pct:60, tone:"amber" },
  { cat:"Security & Compliance",    met: 2, total: 3, pct:67, tone:"blue" },
  { cat:"Operations & Support",     met: 0, total: 2, pct: 0, tone:"slate" },
];
const acceptSummary = [
  { l:"Met",         n:24, pct:71, tone:"emerald" as Tone },
  { l:"Partially",   n: 6, pct:18, tone:"blue" as Tone },
  { l:"Not Met",     n: 2, pct: 6, tone:"amber" as Tone },
  { l:"Not Started", n: 2, pct: 6, tone:"slate" as Tone },
];

/* ============== Dependencies ============== */
const deps = [
  { name:"PANW API Access",       owner:"PANW",         impact:"High",   status:"At Risk",    tone:"rose" },
  { name:"VPN Log Availability",  owner:"Network Eng",  impact:"High",   status:"In Progress",tone:"amber" },
  { name:"DNS Logs Retention",    owner:"Sec Ops",      impact:"Medium", status:"On Track",   tone:"emerald" },
  { name:"CloudTrail Access",     owner:"Cloud Eng",    impact:"Medium", status:"On Track",   tone:"emerald" },
  { name:"Identity Mapping Src",  owner:"IAM Team",     impact:"High",   status:"At Risk",    tone:"rose" },
  { name:"Topology Source Truth", owner:"NetOps Eng",   impact:"Medium", status:"In Progress",tone:"amber" },
  { name:"Storage Capacity",      owner:"Platform Eng", impact:"Low",    status:"On Track",   tone:"emerald" },
];

/* ============== Workstreams ============== */
const workstreams = [
  { ws:"Current State Documentation", status:"Complete",    prog:100, owner:"NetOps Eng",   vel: 18, conf:0.96, risk:"Low",    acc:100 },
  { ws:"Data Readiness Assessment",   status:"Complete",    prog:100, owner:"Data Eng",     vel: 22, conf:0.94, risk:"Low",    acc:100 },
  { ws:"Architecture Validation",     status:"In Progress", prog: 75, owner:"Solutions Arch",vel: 26, conf:0.88, risk:"Med",    acc: 72 },
  { ws:"Failure Analysis & Root Cause",status:"In Progress",prog: 60, owner:"Sec Ops",      vel: 14, conf:0.82, risk:"Med",    acc: 58 },
  { ws:"Solution Design & Blueprint", status:"Planned",     prog:  0, owner:"Solutions Arch",vel:  0, conf:0.78, risk:"Med",    acc:  0 },
  { ws:"Backlog Execution",           status:"Planned",     prog:  0, owner:"Engineering",  vel:  0, conf:0.80, risk:"High",   acc:  0 },
  { ws:"Acceptance & Handoff",        status:"Planned",     prog:  0, owner:"Program Mgmt", vel:  0, conf:0.85, risk:"Low",    acc:  0 },
];

/* ============== Milestone cards ============== */
const milestones = [
  { m:"M1", t:"Current State Documentation", target:"Apr 18, 2026", status:"Complete",    tone:"emerald", acc:"5/5" },
  { m:"M2", t:"Data Readiness Report",       target:"Apr 28, 2026", status:"Complete",    tone:"emerald", acc:"6/6" },
  { m:"M3", t:"Architecture Validation",     target:"May 15, 2026", status:"In Progress", tone:"blue",    acc:"4/6" },
  { m:"M4", t:"Failure Analysis Report",     target:"May 23, 2026", status:"In Progress", tone:"blue",    acc:"3/5" },
  { m:"M5", t:"Solution Design",             target:"Jun 6, 2026",  status:"Planned",     tone:"amber",   acc:"0/6" },
  { m:"M6", t:"Backlog Execution Complete",  target:"Jun 25, 2026", status:"Planned",     tone:"amber",   acc:"0/4" },
  { m:"M7", t:"Acceptance & Handoff",        target:"Jun 30, 2026", status:"Planned",     tone:"amber",   acc:"0/2" },
];

/* ============== Acceptance criteria detail ============== */
const acRows = [
  { id:"AC-001", crit:"Entity Completeness",     cat:"Data Quality", target:"≥ 95%",  actual:"97.2%",  status:"Met" },
  { id:"AC-002", crit:"Relationship Coverage",   cat:"Data Model",   target:"≥ 90%",  actual:"91.5%",  status:"Met" },
  { id:"AC-003", crit:"Query Performance (P95)", cat:"Performance",  target:"≤ 2s",   actual:"1.42s",  status:"Met" },
  { id:"AC-004", crit:"Data Freshness",          cat:"Data Quality", target:"≤ 5 min",actual:"2.7 min",status:"Met" },
  { id:"AC-005", crit:"Hydration Confidence",    cat:"Data Quality", target:"≥ 0.85", actual:"0.91",   status:"Met" },
  { id:"AC-006", crit:"Lineage Traceability",    cat:"Governance",   target:"100%",   actual:"100%",   status:"Met" },
  { id:"AC-007", crit:"Security Compliance",     cat:"Security",     target:"Pass",   actual:"Pass",   status:"Met" },
  { id:"AC-008", crit:"Backlog Execution",       cat:"Delivery",     target:"≥ 90%",  actual:"88%",    status:"Partial" },
];

/* ============== Production readiness gates ============== */
const gates:{q:string;pass:boolean;score:string}[] = [
  { q:"Engineering Complete?",    pass:true,  score:"93%" },
  { q:"Performance Validated?",   pass:true,  score:"P95 1.4s" },
  { q:"Security Passed?",         pass:true,  score:"0 critical" },
  { q:"Data Quality Passed?",     pass:true,  score:"97.2%" },
  { q:"AI Ready?",                pass:false, score:"84% · 3 gaps" },
  { q:"Operational Signoff?",     pass:false, score:"Pending M6" },
  { q:"Customer Accepted?",       pass:false, score:"Scheduled Jun 28" },
];

/* ============== Utilities ============== */
const Spark = ({data,color}:{data:number[];color:string}) => {
  const w=90,h=26,min=Math.min(...data),max=Math.max(...data);
  const pts = data.map((v,i)=>{const x=(i/(data.length-1))*w;const y=h-((v-min)/((max-min)||1))*h;return `${x},${y}`;}).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth={1.5}/></svg>;
};

const Donut = ({slices, center}:{slices:{n:number;tone:Tone}[]; center:string}) => {
  const R=60,cx=80,cy=80,C=2*Math.PI*R;
  const total=slices.reduce((a,b)=>a+b.n,0);
  let acc=0;
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={20}/>
      {slices.map((s,i)=>{
        const frac=s.n/total; const dash=`${frac*C} ${C}`; const offset=-acc*C; acc+=frac;
        return <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={T[s.tone].stroke} strokeWidth={20}
          strokeDasharray={dash} strokeDashoffset={offset} transform={`rotate(-90 ${cx} ${cy})`}/>;
      })}
      <text x={cx} y={cy-4} textAnchor="middle" className="fill-slate-900" style={{fontSize:22,fontWeight:700}}>{total}</text>
      <text x={cx} y={cy+12} textAnchor="middle" className="fill-slate-500" style={{fontSize:9}}>{center}</text>
    </svg>
  );
};

const Gauge = ({v,label}:{v:number;label:string}) => {
  // Coordinate system: 200×140 viewBox, arc center at (100,100), radius 72, stroke 14.
  // Single-tone arc chosen by threshold — prevents gradient color bleed at partial fills.
  const cx = 100, cy = 100, r = 72;
  const pct = Math.min(100, Math.max(0, v));
  const a = Math.PI * (1 - pct / 100);
  const x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
  const large = 0; // arc is always ≤180° for 0–100%; long-arc flag must stay 0
  const color = pct >= 67 ? "#10b981" : pct >= 34 ? "#f59e0b" : "#f43f5e";
  return (
    <svg width={200} height={140} viewBox="0 0 200 140" className="block">
      {/* Track */}
      <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} stroke="#e2e8f0" strokeWidth={14} fill="none" strokeLinecap="round" />
      {/* Value arc — solid color, no gradient overlap */}
      <path d={`M ${cx - r},${cy} A ${r},${r} 0 ${large},1 ${x},${y}`} stroke={color} strokeWidth={14} fill="none" strokeLinecap="round" />
      {/* Value — centered inside the arc bowl */}
      <text x={cx} y={cy - 14} textAnchor="middle" dominantBaseline="middle" className="fill-slate-900" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>{pct}%</text>
      {/* Label — below the baseline with breathing room */}
      <text x={cx} y={cy + 28} textAnchor="middle" dominantBaseline="middle" className="fill-slate-500" style={{ fontSize: 11, fontWeight: 500 }}>{label}</text>
    </svg>
  );
};

/* ============== Gantt ============== */
const gantt = [
  { name:"Current State Documentation", start: 0, len: 8, tone:"emerald" as Tone },
  { name:"Data Readiness Assessment",   start: 8, len: 9, tone:"emerald" as Tone },
  { name:"Architecture Validation",     start:17, len:15, tone:"blue" as Tone },
  { name:"Failure Analysis",            start:28, len:14, tone:"blue" as Tone },
  { name:"Solution Design",             start:42, len:14, tone:"amber" as Tone },
  { name:"Backlog Execution",           start:56, len:18, tone:"amber" as Tone },
  { name:"Acceptance & Handoff",        start:74, len: 8, tone:"amber" as Tone },
];

/* ================================================================ */
export default function SowExecutionPlanAndAcceptanceDashboard() {
  const [drawer, setDrawer] = useState<null | {title:string; kind:string}>(null);
  const [tab, setTab] = useState<"Overview"|"Engineering"|"Telemetry"|"Simulation"|"Dependencies">("Overview");
  const [selectedWs, setSelectedWs] = useState(workstreams[2]);
  const [sliders, setSliders] = useState({velocity:70, capacity:60, risk:45, accept:75});

  const openDrawer = (title:string, kind="KPI") => { setDrawer({title,kind}); setTab("Overview"); };

  const forecastDate = useMemo(()=>{
    const base = 76;
    const shift = Math.round((sliders.risk-45)*0.4 - (sliders.velocity-70)*0.3 - (sliders.capacity-60)*0.25 + (75-sliders.accept)*0.2);
    const days = Math.max(30, base + shift);
    return { days, label:`Jun ${Math.min(30, 30 - Math.min(0, days-76)) + Math.max(0, days-76)} 2026` };
  },[sliders]);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="px-8 pt-8 pb-4 border-b border-slate-200 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 grid place-items-center shadow-sm">
                <Flag className="h-5 w-5 text-white"/>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[26px] font-bold text-slate-900 tracking-tight leading-tight">SOW Execution Plan &amp; Acceptance Dashboard</h1>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold">In Progress</span>
                </div>
                <p className="text-[13px] text-slate-600 mt-1 max-w-3xl">
                  Engineering execution, governance, milestones, and production acceptance across the Data Orchestration implementation.
                </p>
              </div>
            </div>
            <p className="text-[11.5px] text-slate-500 max-w-4xl">
              Every deliverable is validated against objective engineering acceptance criteria, operational outcomes, and production readiness before customer handoff.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right text-[10.5px] text-slate-500 mr-2">
              <div>Last Updated</div>
              <div className="text-slate-700 font-medium">May 12, 2026 10:32 AM</div>
            </div>
            <button className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] flex items-center gap-1.5"><Filter className="h-3.5 w-3.5"/>Filters</button>
            <button className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] flex items-center gap-1.5"><Clock className="h-3.5 w-3.5"/>Full Engagement</button>
            <button className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5"/>Executive View</button>
            <button className="h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[12px] flex items-center gap-1.5"><Download className="h-3.5 w-3.5"/>Export Report</button>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="px-8 py-5">
        <div className="grid grid-cols-8 gap-3">
          {kpis.map(k=>{
            const t=T[k.tone]; const Icon=k.icon;
            return (
              <button key={k.label} onClick={()=>openDrawer(k.label,"KPI")}
                className="text-left rounded-xl border border-slate-200 bg-white p-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className={`h-7 w-7 rounded-lg ${t.bg} grid place-items-center`}><Icon className={`h-3.5 w-3.5 ${t.text}`}/></div>
                  <span className={`text-[9.5px] font-semibold ${t.text}`}>{k.trend}</span>
                </div>
                <div className="text-[10.5px] text-slate-500 font-medium leading-tight">{k.label}</div>
                <div className="text-[20px] font-bold text-slate-900 mt-0.5 leading-none">{k.value}</div>
                <div className="text-[10px] text-slate-500 mt-1">{k.sub}</div>
                <div className="mt-1.5"><Spark data={k.spark} color={t.stroke}/></div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Lifecycle */}
      <section className="px-8 pb-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-bold text-slate-900">Engineering Delivery Lifecycle</h3>
              <p className="text-[11px] text-slate-500">Signature program pipeline — discovery through production handoff.</p>
            </div>
            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Activity className="h-3 w-3 animate-pulse text-emerald-500"/> Live · deliverables flowing</span>
          </div>
          <div className="grid grid-cols-7 gap-2 relative">
            {stages.map((s,i)=>{
              const t=T[s.tone]; const Icon=s.icon;
              return (
                <button key={s.n} onClick={()=>openDrawer(s.title,"Stage")}
                  className={`relative rounded-xl border ${t.border} ${t.bg} p-3 text-left hover:shadow-md transition-all`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-8 w-8 rounded-full bg-white grid place-items-center border ${t.border}`}>
                      <Icon className={`h-4 w-4 ${t.text}`}/>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Phase {s.n}</span>
                  </div>
                  <div className="text-[12px] font-bold text-slate-900 leading-tight">{s.title}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">{s.sub}</div>
                  <div className={`mt-2 text-[9px] font-bold ${t.text}`}>{s.status}</div>
                  <div className="text-[9.5px] text-slate-500">{s.dates}</div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-white/70 overflow-hidden">
                    <div className={`h-full ${t.bar}`} style={{width:`${s.pct}%`}}/>
                  </div>
                  <div className={`text-[10px] font-bold mt-1 ${t.text}`}>{s.pct}%</div>
                  {i<stages.length-1 && <ChevronRight className="absolute -right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 bg-white rounded-full"/>}
                  <span className={`absolute bottom-1 right-2 h-1.5 w-1.5 rounded-full ${t.dot} animate-pulse`}/>
                </button>
              );
            })}
          </div>
          {/* Rollup bar */}
          <div className="mt-4 h-2.5 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500" style={{width:"28.5%"}}/>
            <div className="bg-blue-500" style={{width:"28.5%"}}/>
            <div className="bg-amber-500" style={{width:"43%"}}/>
          </div>
          <div className="flex items-center gap-4 text-[10px] mt-2 text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Completed (2)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"/>In Progress (2)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"/>Planned (3)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300"/>Not Started (0)</span>
          </div>
        </div>
      </section>

      {/* Acceptance + Dependencies + Milestones */}
      <section className="px-8 pb-5">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[13px] font-bold text-slate-900 mb-3">Acceptance Criteria Summary</h3>
            <div className="flex items-center gap-4">
              <Donut slices={acceptSummary.map(s=>({n:s.n,tone:s.tone}))} center="Total Criteria"/>
              <div className="flex-1 space-y-1.5">
                {acceptSummary.map(s=>(
                  <div key={s.l} className="flex items-center gap-2 text-[11px]">
                    <span className={`h-2 w-2 rounded-full ${T[s.tone].dot}`}/>
                    <span className="flex-1 text-slate-600">{s.l}</span>
                    <span className="text-slate-900 font-semibold">{s.n}</span>
                    <span className="text-slate-400 w-10 text-right">({s.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Acceptance by Category</div>
              {acceptance.map(a=>(
                <div key={a.cat} className="flex items-center gap-2 text-[10.5px]">
                  <span className="w-40 text-slate-700 truncate">{a.cat}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${T[a.tone].bar}`} style={{width:`${a.pct}%`}}/>
                  </div>
                  <span className="text-slate-500 w-10 text-right">{a.met}/{a.total}</span>
                  <span className={`font-semibold w-8 text-right ${T[a.tone].text}`}>{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-slate-900">Dependencies &amp; Risks</h3>
              <button className="text-[10px] text-blue-600 font-semibold">View All →</button>
            </div>
            <table className="w-full text-[11px]">
              <thead className="text-slate-500">
                <tr>{["Dependency","Owner","Impact","Status"].map(h=><th key={h} className="text-left font-semibold py-1.5">{h}</th>)}</tr>
              </thead>
              <tbody>
                {deps.map(d=>(
                  <tr key={d.name} onClick={()=>openDrawer(d.name,"Dependency")} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <td className="py-1.5 text-slate-900 font-medium">{d.name}</td>
                    <td className="py-1.5 text-slate-600">{d.owner}</td>
                    <td className={`py-1.5 font-semibold ${d.impact==="High"?"text-rose-600":d.impact==="Medium"?"text-amber-600":"text-emerald-600"}`}>{d.impact}</td>
                    <td className="py-1.5"><span className={`px-1.5 py-0.5 rounded ${T[d.tone as Tone].bg} ${T[d.tone as Tone].text} font-semibold text-[10px]`}>{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[13px] font-bold text-slate-900 mb-3">Program Readiness</h3>
            <div className="grid place-items-center"><Gauge v={68} label="On Track"/></div>
            <div className="mt-3 space-y-1.5 text-[10.5px]">
              {[
                ["Engineering",  86, "emerald"],
                ["Operational",  62, "blue"],
                ["Customer",     58, "amber"],
                ["AI Readiness", 74, "violet"],
                ["Production",   68, "teal"],
              ].map(([l,v,tn]:any)=>(
                <div key={l}>
                  <div className="flex justify-between"><span className="text-slate-600">{l}</span><span className="text-slate-900 font-semibold">{v}%</span></div>
                  <div className="h-1.5 rounded-full bg-slate-100 mt-0.5"><div className={`h-full rounded-full ${T[tn as Tone].bar}`} style={{width:`${v}%`}}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workstreams + Milestones + Gantt */}
      <section className="px-8 pb-5">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5 rounded-xl border border-slate-200 bg-white">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2"><Workflow className="h-4 w-4 text-blue-600"/>Engineering Workstream Status</h3>
              <span className="text-[10px] text-slate-400">7 workstreams</span>
            </div>
            <table className="w-full text-[11px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>{["Workstream","Status","Progress","Owner","Vel","Conf","Risk","Acc"].map(h=><th key={h} className="text-left font-semibold px-3 py-2">{h}</th>)}</tr>
              </thead>
              <tbody>
                {workstreams.map(w=>{
                  const stTone = w.status==="Complete"?"emerald":w.status==="In Progress"?"blue":"amber";
                  return (
                    <tr key={w.ws} onClick={()=>{setSelectedWs(w); openDrawer(w.ws,"Workstream");}}
                      className={`border-t border-slate-100 hover:bg-slate-50 cursor-pointer ${selectedWs.ws===w.ws?"bg-blue-50/40":""}`}>
                      <td className="px-3 py-2 text-slate-900 font-medium">{w.ws}</td>
                      <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded ${T[stTone].bg} ${T[stTone].text} text-[10px] font-semibold`}>{w.status}</span></td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${T[stTone].bar}`} style={{width:`${w.prog}%`}}/></div>
                          <span className="text-slate-600 text-[10px]">{w.prog}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{w.owner}</td>
                      <td className="px-3 py-2 text-slate-700">{w.vel}</td>
                      <td className="px-3 py-2 text-emerald-600 font-semibold">{w.conf.toFixed(2)}</td>
                      <td className="px-3 py-2 text-slate-600">{w.risk}</td>
                      <td className="px-3 py-2 text-slate-900 font-semibold">{w.acc}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="col-span-4 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[13px] font-bold text-slate-900 mb-3 flex items-center gap-2"><Flag className="h-4 w-4 text-rose-500"/>SOW Milestones &amp; Deliverables</h3>
            <div className="space-y-1.5">
              {milestones.map(m=>(
                <div key={m.m} onClick={()=>openDrawer(m.t,"Milestone")}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer px-2.5 py-2">
                  <span className={`w-8 text-[10px] font-bold ${T[m.tone as Tone].text}`}>{m.m}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11.5px] text-slate-900 font-semibold truncate">{m.t}</div>
                    <div className="text-[10px] text-slate-500">Target · {m.target}</div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded ${T[m.tone as Tone].bg} ${T[m.tone as Tone].text} text-[10px] font-semibold`}>{m.status}</span>
                  <span className="text-[10px] text-slate-600 w-8 text-right font-mono">{m.acc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[13px] font-bold text-slate-900 mb-3">Engagement Timeline</h3>
            <div className="space-y-1.5">
              {gantt.map(g=>(
                <div key={g.name} className="text-[10px]">
                  <div className="text-slate-600 mb-0.5 truncate">{g.name}</div>
                  <div className="relative h-3 rounded-full bg-slate-100">
                    <div className={`absolute top-0 h-full rounded-full ${T[g.tone].bar} opacity-90`}
                      style={{left:`${(g.start/82)*100}%`, width:`${(g.len/82)*100}%`}}/>
                    <span className="absolute right-0 -top-4 text-[9px] text-slate-400">
                      { g.start<28 ? "Apr" : g.start<58 ? "May" : "Jun" }
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-[9px] text-slate-400 pt-2 mt-2 border-t border-slate-100">
                <span>Apr</span><span>May</span><span>Jun</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acceptance criteria detail table */}
      <section className="px-8 pb-5">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-emerald-600"/>Acceptance Criteria Details (Sample)</h3>
            <button className="text-[10px] text-blue-600 font-semibold">View All Acceptance Criteria →</button>
          </div>
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>{["ID","Criteria","Category","Target","Actual","Status"].map(h=><th key={h} className="text-left font-semibold px-3 py-2">{h}</th>)}</tr>
            </thead>
            <tbody>
              {acRows.map(r=>(
                <tr key={r.id} onClick={()=>openDrawer(r.crit,"Acceptance")} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <td className="px-3 py-2 font-mono text-slate-500">{r.id}</td>
                  <td className="px-3 py-2 text-slate-900 font-medium">{r.crit}</td>
                  <td className="px-3 py-2 text-slate-600">{r.cat}</td>
                  <td className="px-3 py-2 text-slate-600">{r.target}</td>
                  <td className="px-3 py-2 text-slate-800 font-semibold">{r.actual}</td>
                  <td className="px-3 py-2">
                    {r.status==="Met" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10px]"><CheckCircle2 className="h-3 w-3"/>Met</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold text-[10px]">Partially Met</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Engineering Transparency Zone */}
      <section className="px-8 py-6 bg-slate-50/60 border-t border-slate-200">
        <div className="mb-4">
          <div className="text-[10.5px] uppercase tracking-wider text-blue-600 font-bold">Engineering Transparency Zone</div>
          <h2 className="text-[20px] font-bold text-slate-900">How the Engineering Delivery Program Executes</h2>
          <p className="text-[12px] text-slate-500">Objective acceptance, measurable outcomes, and production-grade governance — end to end.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
          <h3 className="text-[13px] font-bold text-slate-900 mb-3">Engineering Delivery Pipeline</h3>
          <div className="flex items-center gap-1 overflow-x-auto">
            {["Discovery","Architecture","Schema","Hydration","Canonical Model","Relationships","Performance","Validation","Acceptance","Production"].map((s,i,a)=>(
              <div key={s} className="flex items-center gap-1 shrink-0">
                <div className="rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-2.5 py-2 text-center min-w-[110px]">
                  <div className="text-[9px] text-slate-400 font-semibold">{String(i+1).padStart(2,"0")}</div>
                  <div className="text-[10.5px] font-semibold text-slate-800 leading-tight">{s}</div>
                </div>
                {i<a.length-1 && <div className="w-3 h-px bg-slate-300 relative"><span className="absolute -top-1 right-0 h-2 w-2 bg-blue-500 rounded-full animate-pulse"/></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Production readiness decision engine */}
          <div className="col-span-5 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[13px] font-bold text-slate-900 mb-3 flex items-center gap-2"><Rocket className="h-4 w-4 text-teal-600"/>Production Readiness Decision Engine</h3>
            <div className="space-y-1.5">
              {gates.map((g,i)=>(
                <div key={g.q} className={`flex items-center gap-2 rounded-lg border p-2 ${g.pass?"border-emerald-200 bg-emerald-50/40":"border-amber-200 bg-amber-50/40"}`}>
                  <div className={`h-6 w-6 rounded-full grid place-items-center ${g.pass?"bg-emerald-500":"bg-amber-500"}`}>
                    {g.pass ? <CheckCircle2 className="h-3.5 w-3.5 text-white"/> : <AlertTriangle className="h-3.5 w-3.5 text-white"/>}
                  </div>
                  <span className="text-[11px] text-slate-500 w-4 font-mono">{i+1}</span>
                  <span className="flex-1 text-[11.5px] text-slate-800 font-semibold">{g.q}</span>
                  <span className={`text-[10.5px] font-semibold ${g.pass?"text-emerald-700":"text-amber-700"}`}>{g.score}</span>
                </div>
              ))}
              <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 py-2 text-[11.5px] flex items-center justify-between mt-2">
                <span className="font-semibold">Production Release</span>
                <span className="text-white/90">Blocked · 3 gates pending</span>
              </div>
            </div>
          </div>

          {/* Live Delivery Simulation (dark) */}
          <div className="col-span-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 p-4 font-mono">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[12px] font-bold text-slate-100">Live Delivery Simulation</h3>
              <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>LIVE</span>
            </div>
            <div className="space-y-1 text-[10px]">
              {[
                ["stories.commit",    "S24.10 · 26 stories"],
                ["tasks.execute",     "142 tasks in flight"],
                ["validation.run",    "test.pass=99.2%"],
                ["automation.apply",  "coverage=92%"],
                ["defects.detect",    "open=3 · closed=41"],
                ["capacity.utilize",  "engineers=8 · 78%"],
                ["critical.path",     "Architecture → Hydration"],
                ["acceptance.gate",   "AC-008 partial · P95 review"],
                ["forecast.compute",  "prod ready · Jun 30"],
              ].map(([k,v],i)=>(
                <div key={i} className="flex gap-2">
                  <span className="text-slate-500">{String(i+1).padStart(2,"0")}</span>
                  <span className="text-blue-300 w-32 shrink-0">{k}</span>
                  <span className="text-slate-200 truncate">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5 text-[9.5px]">
              {[["Velocity","142"],["Throughput","2.6/d"],["Automation","92%"],["Test Pass","99.2%"],["Defects","3"],["Capacity","78%"],["Lead","4.1d"],["Forecast","Jun 30"]].map(([l,v])=>(
                <div key={l} className="rounded bg-slate-900 border border-slate-800 p-1.5">
                  <div className="text-slate-500">{l}</div>
                  <div className="text-emerald-400 font-semibold">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Workstream Dependency Engine */}
          <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[13px] font-bold text-slate-900 mb-3 flex items-center gap-2"><GitBranch className="h-4 w-4 text-violet-600"/>Workstream Dependencies</h3>
            <div className="space-y-1.5">
              {["Architecture","Source Registry","Schema Discovery","Hydration","Canonical Model","Relationships","Query Layer","Performance","AI Readiness","Operational Acceptance"].map((d,i,a)=>(
                <div key={d} className="flex items-center gap-2 text-[10.5px]">
                  <span className="w-5 text-slate-400 font-mono">{i+1}</span>
                  <span className={`flex-1 truncate ${i<4?"text-slate-900 font-semibold":"text-slate-600"}`}>{d}</span>
                  {i<a.length-1 && <ArrowRight className="h-3 w-3 text-slate-300"/>}
                  <span className={`h-1.5 w-1.5 rounded-full ${i<2?"bg-emerald-500":i<5?"bg-blue-500":"bg-amber-500"} animate-pulse`}/>
                </div>
              ))}
              <div className="text-[10px] text-slate-500 pt-2 mt-2 border-t border-slate-100">
                <span className="text-rose-600 font-semibold">Critical path:</span> Architecture → Hydration → Canonical
              </div>
            </div>
          </div>
        </div>

        {/* Bottom widgets */}
        <div className="grid grid-cols-6 gap-3 mt-4">
          {[
            { l:"Program Velocity",       v:"142 pts", s:"↑ 12% MoM", tone:"emerald", i:Zap },
            { l:"Engineering Capacity",   v:"78%",     s:"8 engineers", tone:"blue",    i:Users },
            { l:"Acceptance Trend",       v:"+6/wk",   s:"7-day",     tone:"teal",    i:TrendingUp },
            { l:"Risk Burndown",          v:"-4",      s:"7-day",     tone:"violet",  i:TrendingDown },
            { l:"Technical Debt",         v:"1,240 pts",s:"↓ 4%",     tone:"amber",   i:Boxes },
            { l:"Recent Deliveries",      v:"11",      s:"Milestones", tone:"emerald", i:FileCheck2 },
          ].map(w=>{
            const t=T[w.tone as Tone]; const Icon=w.i;
            return (
              <div key={w.l} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className={`h-6 w-6 rounded-md ${t.bg} grid place-items-center mb-1.5`}><Icon className={`h-3 w-3 ${t.text}`}/></div>
                <div className="text-[10px] text-slate-500">{w.l}</div>
                <div className="text-[16px] font-bold text-slate-900 leading-tight">{w.v}</div>
                <div className={`text-[9.5px] font-semibold ${t.text}`}>{w.s}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/40" onClick={()=>setDrawer(null)}/>
          <div className="absolute right-0 top-0 bottom-0 w-[560px] bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between bg-gradient-to-b from-slate-50 to-white">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">{drawer.kind}</div>
                <h3 className="text-[16px] font-bold text-slate-900">{drawer.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Program engineering · decomposable inspection</p>
              </div>
              <button onClick={()=>setDrawer(null)} className="h-8 w-8 grid place-items-center rounded-md hover:bg-slate-100"><X className="h-4 w-4 text-slate-500"/></button>
            </div>
            <div className="flex border-b border-slate-200 px-3">
              {(["Overview","Engineering","Telemetry","Simulation","Dependencies"] as const).map(x=>(
                <button key={x} onClick={()=>setTab(x)}
                  className={`px-3 py-2 text-[11px] font-semibold border-b-2 -mb-px transition ${tab===x?"border-blue-600 text-blue-700":"border-transparent text-slate-500 hover:text-slate-800"}`}>{x}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-5 text-[12px] text-slate-700 space-y-3">
              {tab==="Overview" && (
                <>
                  <p>Executive summary of the deliverable, operational importance, stakeholders, milestones, and success criteria. This item is validated against objective engineering acceptance criteria before customer handoff.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["Stakeholders","Bright · Delivery Lead · Engineering"],
                      ["Operational Importance","Primary"],
                      ["Milestones","M3 · M4"],
                      ["Confidence","0.88"],
                      ["Business Value","$1.4M / yr"],
                      ["Success Criteria","6 objective gates"],
                    ].map(([k,v])=>(
                      <div key={k} className="rounded-md border border-slate-200 p-2">
                        <div className="text-[10px] text-slate-500">{k}</div>
                        <div className="text-slate-900 font-semibold">{v}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {tab==="Engineering" && (
                <div className="space-y-2">
                  {["Program governance","Engineering workflow","Validation framework","Acceptance engine","Dependency management","Quality gates","Production readiness","Automation","Documentation","Knowledge transfer"].map((s,i)=>(
                    <div key={s} className="flex items-center gap-3 rounded-md border border-slate-200 p-2">
                      <div className="h-6 w-6 rounded bg-blue-50 text-blue-700 grid place-items-center text-[10px] font-bold">{i+1}</div>
                      <div className="flex-1 text-[12px] text-slate-800 font-semibold">{s}</div>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                    </div>
                  ))}
                </div>
              )}
              {tab==="Telemetry" && (
                <div className="grid grid-cols-2 gap-2">
                  {[["Velocity","142 pts"],["Story Throughput","2.6/day"],["Automation %","92%"],["Validation Pass","99.2%"],["Engineering Capacity","78%"],["Burn-down","-4/wk"],["Lead Time","4.1d"],["Cycle Time","2.3d"],["Defect Density","0.4/kloc"],["Acceptance Latency","1.8d"],["Utilization","78%"],["Forecast","Jun 30"]].map(([k,v])=>(
                    <div key={k} className="rounded-md border border-slate-200 p-2 flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">{k}</span>
                      <span className="text-slate-900 font-mono font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab==="Simulation" && (
                <div className="space-y-3">
                  {([
                    ["Velocity","velocity"],["Engineering Capacity","capacity"],["Risk","risk"],["Acceptance Threshold","accept"],
                  ] as const).map(([label,key])=>(
                    <div key={key}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600">{label}</span>
                        <span className="text-slate-900 font-semibold">{(sliders as any)[key]}</span>
                      </div>
                      <input type="range" min={0} max={100} value={(sliders as any)[key]}
                        onChange={e=>setSliders(s=>({...s,[key]:Number(e.target.value)}))} className="w-full accent-blue-600"/>
                    </div>
                  ))}
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-[11px]">
                    <div className="flex justify-between"><span className="text-blue-700 font-semibold">Forecast Days to Prod</span><span className="text-blue-900 font-bold">{forecastDate.days}d</span></div>
                    <div className="flex justify-between mt-1"><span className="text-blue-700">Production Readiness</span><span className="text-blue-900 font-semibold">{Math.min(100, Math.max(30, sliders.velocity*0.6 + sliders.capacity*0.3 - sliders.risk*0.2)).toFixed(0)}%</span></div>
                    <div className="flex justify-between mt-1"><span className="text-blue-700">Critical Path</span><span className="text-blue-900 font-semibold">{sliders.risk>60?"Hydration slippage":"Architecture → Hydration"}</span></div>
                  </div>
                </div>
              )}
              {tab==="Dependencies" && (
                <div className="space-y-1.5">
                  {["Source Registry","Schema Discovery","Hydration","Canonical Model","Relationship Builder","Performance Lab","Knowledge Graph","AI Readiness","Operational Handoff","Customer Acceptance"].map((d,i)=>(
                    <div key={d} className="flex items-center gap-2 text-[11px] border border-slate-200 rounded-md p-2">
                      <Route className="h-3.5 w-3.5 text-slate-400"/>
                      <span className="flex-1 text-slate-800">{d}</span>
                      <span className={`text-[10px] font-semibold ${i%3===0?"text-rose-600":i%3===1?"text-amber-600":"text-emerald-600"}`}>
                        {i%3===0?"At Risk":i%3===1?"Watch":"Healthy"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
