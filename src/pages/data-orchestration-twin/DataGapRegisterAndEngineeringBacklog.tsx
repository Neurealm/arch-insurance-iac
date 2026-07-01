import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, BadgeCheck, Bug, CheckCircle2, ChevronRight,
  ClipboardList, Clock, Cpu, Database, Download, Filter, GitBranch, Layers,
  ListChecks, RefreshCw, Search, Settings2, Shield, Sparkles, Timer, TrendingDown,
  TrendingUp, Users, Workflow, X, Zap, Target, GaugeCircle, Boxes, Wrench,
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
  { label:"Total Open Gaps",         value:"128",    sub:"↑ 8 vs prior 7D",   tone:"blue",    icon:ClipboardList, spark:[102,108,114,118,120,124,128], trend:"+8" },
  { label:"Critical Gaps",           value:"18",     sub:"↑ 3 vs prior 7D",   tone:"rose",    icon:AlertTriangle, spark:[12,13,14,15,16,17,18], trend:"+3" },
  { label:"High Impact",             value:"42",     sub:"↑ 5 vs prior 7D",   tone:"orange",  icon:TrendingUp,    spark:[33,35,37,38,40,41,42], trend:"+5" },
  { label:"Active Backlog Items",    value:"96",     sub:"↑ 12 vs prior 7D",  tone:"emerald", icon:ListChecks,    spark:[78,82,85,88,90,93,96], trend:"+12" },
  { label:"Est. Engineering Effort", value:"342",    sub:"Story points",      tone:"violet",  icon:Wrench,        spark:[280,290,305,315,325,335,342], trend:"pts" },
  { label:"SLA Breaches (7D)",       value:"7",      sub:"↑ 2 vs prior 7D",   tone:"rose",    icon:Timer,         spark:[3,4,4,5,6,6,7], trend:"+2" },
  { label:"MTTR (Gap Resolution)",   value:"3.2d",   sub:"↓ 0.4 vs prior 7D", tone:"teal",    icon:RefreshCw,     spark:[4.1,3.9,3.7,3.6,3.5,3.4,3.2], trend:"-0.4" },
  { label:"Backlog Health",          value:"72%",    sub:"Healthy",           tone:"emerald", icon:GaugeCircle,   spark:[64,66,68,69,70,71,72], trend:"+8%" },
];

/* ============== Categories (donut) ============== */
const categories:{label:string;n:number;tone:Tone}[] = [
  { label:"Missing Fields",         n:28, tone:"blue" },
  { label:"Weak Identifiers",       n:20, tone:"violet" },
  { label:"Slow Queries",           n:18, tone:"amber" },
  { label:"Unmapped Relationships", n:16, tone:"orange" },
  { label:"Schema Drift",           n:12, tone:"emerald" },
  { label:"Hydration Failures",     n:10, tone:"teal" },
  { label:"Missing API Access",     n: 8, tone:"rose" },
  { label:"Stale Sources",          n: 7, tone:"slate" },
  { label:"Topology Gaps",          n: 5, tone:"blue" },
  { label:"Performance Tuning",     n: 4, tone:"violet" },
];
const totalGaps = categories.reduce((a,b)=>a+b.n,0);

/* ============== Impact bars ============== */
const impact:{label:string;n:number;pct:number;tone:Tone}[] = [
  { label:"Critical", n:18, pct:14.1, tone:"rose" },
  { label:"High",     n:42, pct:32.8, tone:"orange" },
  { label:"Medium",   n:38, pct:29.7, tone:"amber" },
  { label:"Low",      n:22, pct:17.2, tone:"emerald" },
  { label:"Info",     n: 8, pct: 6.2, tone:"slate" },
];

/* ============== Trend (line) ============== */
const trend = {
  labels:["Apr 13","Apr 20","Apr 27","May 4","May 11"],
  total:   [122,132,128,120,118],
  fresh:   [ 44, 52, 46, 42, 41],
  resolved:[ 18, 22, 26, 28, 32],
};

/* ============== Top gap sources ============== */
const sources = [
  { name:"PANW Firewall", open:24, crit:4, trend:"up",   owner:"NetOps Eng" },
  { name:"PANW Panorama", open:16, crit:3, trend:"up",   owner:"NetOps Eng" },
  { name:"Okta",          open:12, crit:2, trend:"flat", owner:"Identity Eng" },
  { name:"AWS CloudTrail",open:10, crit:1, trend:"down", owner:"Cloud Eng" },
  { name:"DNS Logs",      open: 9, crit:1, trend:"down", owner:"Platform Eng" },
  { name:"VPN Logs",      open: 8, crit:1, trend:"flat", owner:"NetOps Eng" },
  { name:"K8s Events",    open: 7, crit:1, trend:"up",   owner:"Platform Eng" },
  { name:"NetFlow",       open: 6, crit:1, trend:"down", owner:"NetOps Eng" },
  { name:"ServiceNow",    open: 5, crit:0, trend:"flat", owner:"Integrations Eng" },
  { name:"Azure AD",      open: 5, crit:0, trend:"down", owner:"Identity Eng" },
];

/* ============== Pipeline stages ============== */
const pipeline:{n:number;title:string;sub:string;icon:any;tone:Tone}[] = [
  { n:1, title:"Detect Gap",          sub:"Quality, schema, perf, relationships", icon:Search,       tone:"blue" },
  { n:2, title:"Classify & Enrich",   sub:"Category, impact, source, reason",     icon:Layers,       tone:"violet" },
  { n:3, title:"Triage & Prioritize", sub:"Impact, effort, SLA, dependencies",    icon:Target,       tone:"orange" },
  { n:4, title:"Create Backlog Item", sub:"Jira / ADO / Internal backlog",        icon:ClipboardList,tone:"emerald" },
  { n:5, title:"Assign & Plan",       sub:"Owner, sprint, target date",           icon:Users,        tone:"teal" },
  { n:6, title:"Track Resolution",    sub:"Status, validation, closure",          icon:Activity,     tone:"amber" },
  { n:7, title:"Verify & Close",      sub:"Re-run checks, confirm fix",           icon:BadgeCheck,   tone:"rose" },
];

/* ============== Backlog rows ============== */
type Row = {
  id:string; title:string; cat:string; source:string; impact:"Critical"|"High"|"Medium"|"Low";
  prio:"P0"|"P1"|"P2"|"P3"; effort:number; owner:string; sprint:string; target:string;
  status:"In Progress"|"To Do"|"Backlog"|"Done"; conf:number; op:number;
};
const rows: Row[] = [
  { id:"GAP-1021", title:"Missing source IP field in firewall traffic logs",   cat:"Missing Fields",         source:"PANW Firewall", impact:"Critical", prio:"P0", effort: 8, owner:"NetOps Eng",     sprint:"S24.10", target:"May 19, 2025", status:"In Progress", conf:0.18, op:0.24 },
  { id:"GAP-1017", title:"Interface mapping missing for VPN logs",              cat:"Unmapped Relationships", source:"VPN Logs",      impact:"High",     prio:"P1", effort: 5, owner:"Data Eng",       sprint:"S24.10", target:"May 22, 2025", status:"To Do",       conf:0.12, op:0.18 },
  { id:"GAP-1014", title:"Slow query: Top talkers dashboard",                   cat:"Slow Queries",           source:"NetFlow",       impact:"High",     prio:"P1", effort:13, owner:"Platform Eng",   sprint:"S24.10", target:"May 26, 2025", status:"In Progress", conf:0.08, op:0.22 },
  { id:"GAP-1009", title:"Weak identifier: user_id not unique",                 cat:"Weak Identifiers",       source:"Okta",          impact:"High",     prio:"P1", effort: 8, owner:"Identity Eng",   sprint:"S24.10", target:"May 21, 2025", status:"To Do",       conf:0.22, op:0.16 },
  { id:"GAP-1003", title:"Schema drift in DNS logs",                            cat:"Schema Drift",           source:"DNS Logs",      impact:"Medium",   prio:"P2", effort: 5, owner:"Data Eng",       sprint:"S24.11", target:"May 28, 2025", status:"To Do",       conf:0.10, op:0.12 },
  { id:"GAP-0998", title:"Hydration failure: device location",                  cat:"Hydration Failures",     source:"PANW Panorama", impact:"Medium",   prio:"P2", effort: 3, owner:"Data Eng",       sprint:"S24.10", target:"May 20, 2025", status:"In Progress", conf:0.14, op:0.10 },
  { id:"GAP-0995", title:"Missing API access to SaaS App",                      cat:"Missing API Access",     source:"SaaS App",      impact:"Medium",   prio:"P2", effort: 8, owner:"Integrations Eng",sprint:"S24.11", target:"May 30, 2025", status:"To Do",       conf:0.09, op:0.14 },
  { id:"GAP-0987", title:"Stale source: Threat Intel feed",                     cat:"Stale Sources",          source:"Threat Intel",  impact:"Low",      prio:"P3", effort: 2, owner:"SecOps Eng",     sprint:"S24.12", target:"Jun 2, 2025",  status:"Backlog",     conf:0.06, op:0.08 },
  { id:"GAP-0982", title:"Topology gap: Cloud region mapping",                  cat:"Topology Gaps",          source:"AWS CloudTrail",impact:"Low",      prio:"P3", effort: 3, owner:"Cloud Eng",      sprint:"S24.12", target:"Jun 3, 2025",  status:"Backlog",     conf:0.05, op:0.10 },
  { id:"GAP-0975", title:"Query performance tuning",                            cat:"Performance Tuning",     source:"Multiple",      impact:"Medium",   prio:"P2", effort: 8, owner:"Platform Eng",   sprint:"S24.11", target:"May 29, 2025", status:"In Progress", conf:0.11, op:0.15 },
];

/* ============== Prioritization inputs ============== */
const prioInputs:{label:string;w:number;tone:Tone}[] = [
  { label:"Business Impact",   w:22, tone:"blue" },
  { label:"Operational Risk",  w:18, tone:"rose" },
  { label:"AI Impact",         w:15, tone:"violet" },
  { label:"Technical Debt",    w:10, tone:"orange" },
  { label:"Engineering Effort",w:12, tone:"amber" },
  { label:"Confidence Loss",   w: 9, tone:"teal" },
  { label:"Cost",              w: 6, tone:"slate" },
  { label:"Dependencies",      w: 8, tone:"emerald" },
];

/* ============== Activity feed ============== */
const activity:{when:string;kind:string;text:string;tone:Tone}[] = [
  { when:"10:32 AM", kind:"New Gap",      text:"GAP-1024 detected · Missing tenant_id in Okta stream",   tone:"blue" },
  { when:"10:21 AM", kind:"Assigned",     text:"GAP-1021 → NetOps Eng · Sprint S24.10",                  tone:"violet" },
  { when:"10:14 AM", kind:"Priority Δ",   text:"GAP-1014 promoted P2 → P1 (SLO breach)",                 tone:"orange" },
  { when:"09:48 AM", kind:"Resolved",     text:"GAP-0942 · Weak identifier in Okta closed",              tone:"emerald" },
  { when:"09:32 AM", kind:"Backlog Item", text:"GAP-1017 story created · 5 pts",                         tone:"blue" },
  { when:"09:15 AM", kind:"SLA Breach",   text:"GAP-0961 exceeded 5d target · escalated",                tone:"rose" },
  { when:"08:52 AM", kind:"Validated",    text:"GAP-0910 · schema fix validated in stage",               tone:"teal" },
  { when:"08:15 AM", kind:"Status",       text:"GAP-0998 → In Progress",                                 tone:"amber" },
];

/* ============== Improvement loop stages ============== */
const loop = ["Detect","Analyze","Prioritize","Implement","Validate","Measure","Improve","Monitor"];

/* ============== Utility ============== */
const Spark = ({data,color}:{data:number[];color:string}) => {
  const w=90,h=26,min=Math.min(...data),max=Math.max(...data);
  const pts = data.map((v,i)=>{
    const x=(i/(data.length-1))*w;
    const y=h-((v-min)/((max-min)||1))*h;
    return `${x},${y}`;
  }).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth={1.5}/></svg>;
};

/* ============== Donut ============== */
const Donut = () => {
  const R=68, cx=90, cy=90, C=2*Math.PI*R;
  let acc=0;
  return (
    <svg width={180} height={180} viewBox="0 0 180 180">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={22}/>
      {categories.map((c,i)=>{
        const frac=c.n/totalGaps;
        const dash=`${frac*C} ${C}`;
        const offset=-acc*C;
        acc+=frac;
        return <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={T[c.tone].stroke} strokeWidth={22}
          strokeDasharray={dash} strokeDashoffset={offset} transform={`rotate(-90 ${cx} ${cy})`} />;
      })}
      <text x={cx} y={cy-4} textAnchor="middle" className="fill-slate-900" style={{fontSize:22,fontWeight:700}}>{totalGaps}</text>
      <text x={cx} y={cy+14} textAnchor="middle" className="fill-slate-500" style={{fontSize:10}}>Total Gaps</text>
    </svg>
  );
};

/* ============== Trend chart ============== */
const TrendChart = () => {
  const w=420,h=180,pad=28;
  const max=Math.max(...trend.total,...trend.fresh,...trend.resolved)*1.1;
  const xs=(i:number)=>pad+(i/(trend.labels.length-1))*(w-pad*2);
  const ys=(v:number)=>h-pad-(v/max)*(h-pad*2);
  const line=(arr:number[])=>arr.map((v,i)=>`${i===0?"M":"L"}${xs(i)},${ys(v)}`).join(" ");
  return (
    <svg width={w} height={h} className="w-full">
      {[0,40,80,120,160].map((v,i)=>(
        <g key={i}>
          <line x1={pad} x2={w-pad} y1={ys(v)} y2={ys(v)} stroke="#f1f5f9"/>
          <text x={4} y={ys(v)+3} className="fill-slate-400" style={{fontSize:9}}>{v}</text>
        </g>
      ))}
      <path d={line(trend.total)}    stroke="#3b82f6" strokeWidth={2} fill="none"/>
      <path d={line(trend.fresh)}    stroke="#f59e0b" strokeWidth={2} fill="none"/>
      <path d={line(trend.resolved)} stroke="#10b981" strokeWidth={2} fill="none"/>
      {trend.labels.map((l,i)=>(
        <text key={i} x={xs(i)} y={h-8} textAnchor="middle" className="fill-slate-500" style={{fontSize:10}}>{l}</text>
      ))}
    </svg>
  );
};

/* ============== Gauge ============== */
const Gauge = ({v}:{v:number}) => {
  const cx=90,cy=90,r=70;
  const a=Math.PI*(1-v/100);
  const x=cx+r*Math.cos(a), y=cy-r*Math.sin(a);
  const large=v>50?1:0;
  return (
    <svg width={180} height={110} viewBox="0 0 180 110">
      <path d={`M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}`} stroke="#e2e8f0" strokeWidth={14} fill="none" strokeLinecap="round"/>
      <path d={`M ${cx-r},${cy} A ${r},${r} 0 ${large},1 ${x},${y}`} stroke="url(#gaugeGrad)" strokeWidth={14} fill="none" strokeLinecap="round"/>
      <defs>
        <linearGradient id="gaugeGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="60%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#f43f5e"/>
        </linearGradient>
      </defs>
      <text x={cx} y={cy-6} textAnchor="middle" className="fill-slate-900" style={{fontSize:28,fontWeight:700}}>{v}%</text>
      <text x={cx} y={cy+12} textAnchor="middle" className="fill-slate-500" style={{fontSize:10}}>Healthy</text>
    </svg>
  );
};

/* ================================================================ */
export default function DataGapRegisterAndEngineeringBacklog() {
  const [drawer, setDrawer] = useState<null | {title:string; kind:string}>(null);
  const [selected, setSelected] = useState<Row>(rows[0]);
  const [tab, setTab] = useState<"Overview"|"Engineering"|"Telemetry"|"Simulation"|"Dependencies">("Overview");
  const [q, setQ] = useState("");
  const [sliders, setSliders] = useState({biz:70, effort:40, risk:60, conf:55});

  const filtered = useMemo(()=>rows.filter(r=>!q || r.title.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase())),[q]);

  const openDrawer = (title:string, kind="KPI") => { setDrawer({title,kind}); setTab("Overview"); };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="px-8 pt-8 pb-4 border-b border-slate-200 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 grid place-items-center shadow-sm">
                <ClipboardList className="h-5 w-5 text-white"/>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[26px] font-bold text-slate-900 tracking-tight leading-tight">Data Gap Register &amp; Engineering Backlog</h1>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">Production</span>
                </div>
                <p className="text-[13px] text-slate-600 mt-1 max-w-3xl">
                  Continuously transform operational observations into prioritized engineering work that improves the Data Orchestration Platform.
                </p>
              </div>
            </div>
            <p className="text-[11.5px] text-slate-500 max-w-4xl">
              Every gap detected across data quality, schema evolution, graph relationships, performance, governance, freshness, or AI readiness is automatically classified, prioritized, assigned, and tracked until operational quality improves.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right text-[10.5px] text-slate-500 mr-2">
              <div>Last Updated</div>
              <div className="text-slate-700 font-medium">May 12, 2025 10:32 AM</div>
            </div>
            <button className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] flex items-center gap-1.5"><Filter className="h-3.5 w-3.5"/>Filters</button>
            <button className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] flex items-center gap-1.5"><Boxes className="h-3.5 w-3.5"/>Categories</button>
            <button className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[12px] flex items-center gap-1.5"><Workflow className="h-3.5 w-3.5"/>Sprint View</button>
            <button className="h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[12px] flex items-center gap-1.5"><Download className="h-3.5 w-3.5"/>Export Backlog</button>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="px-8 py-5">
        <div className="grid grid-cols-8 gap-3">
          {kpis.map(k=>{
            const t = T[k.tone];
            const Icon = k.icon;
            return (
              <button key={k.label} onClick={()=>openDrawer(k.label,"KPI")}
                className="text-left rounded-xl border border-slate-200 bg-white p-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className={`h-7 w-7 rounded-lg ${t.bg} grid place-items-center`}><Icon className={`h-3.5 w-3.5 ${t.text}`}/></div>
                  <span className={`text-[9.5px] font-semibold ${t.text}`}>{k.trend}</span>
                </div>
                <div className="text-[10.5px] text-slate-500 font-medium leading-tight">{k.label}</div>
                <div className="text-[22px] font-bold text-slate-900 mt-0.5 leading-none">{k.value}</div>
                <div className="text-[10px] text-slate-500 mt-1">{k.sub}</div>
                <div className="mt-1.5"><Spark data={k.spark} color={t.stroke}/></div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main workspace: donut + impact + trend + top sources */}
      <section className="px-8 pb-5">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-slate-900">Gap Categories</h3>
              <span className="text-[10px] text-slate-500">10 types</span>
            </div>
            <div className="flex items-center gap-3">
              <Donut/>
              <div className="flex-1 space-y-1">
                {categories.map(c=>(
                  <div key={c.label} className="flex items-center gap-1.5 text-[10px]">
                    <span className={`h-2 w-2 rounded-full ${T[c.tone].dot}`}/>
                    <span className="flex-1 text-slate-600 truncate">{c.label}</span>
                    <span className="text-slate-900 font-semibold">{c.n}</span>
                    <span className="text-slate-400 w-10 text-right">{((c.n/totalGaps)*100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[13px] font-bold text-slate-900 mb-3">Gaps by Impact</h3>
            <div className="space-y-3 mt-4">
              {impact.map(i=>(
                <div key={i.label}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={`font-semibold ${T[i.tone].text}`}>{i.label}</span>
                    <span className="text-slate-500">{i.n} <span className="text-slate-400">({i.pct}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${T[i.tone].bar} transition-all duration-700`} style={{width:`${i.pct*2.5}%`}}/>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 mt-2 border-t border-slate-100 text-[11px]">
                <span className="font-semibold text-slate-700">Total</span>
                <span className="text-slate-900 font-bold">128</span>
              </div>
            </div>
          </div>

          <div className="col-span-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-slate-900">Gaps Trend (30 Days)</h3>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1"><span className="h-1.5 w-2.5 bg-blue-500 rounded-sm"/>Total</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-2.5 bg-amber-500 rounded-sm"/>New</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-2.5 bg-emerald-500 rounded-sm"/>Resolved</span>
              </div>
            </div>
            <TrendChart/>
          </div>

          <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[13px] font-bold text-slate-900 mb-3">Top Gap Sources</h3>
            <div className="space-y-1.5">
              {sources.map(s=>(
                <div key={s.name} className="flex items-center gap-2 text-[10.5px] py-1 border-b border-slate-50 last:border-0">
                  <span className="flex-1 text-slate-700 truncate">{s.name}</span>
                  <span className="text-slate-900 font-semibold w-5 text-right">{s.open}</span>
                  <span className="text-rose-600 font-semibold w-4 text-right">{s.crit}</span>
                  {s.trend==="up" && <TrendingUp className="h-3 w-3 text-rose-500"/>}
                  {s.trend==="down" && <TrendingDown className="h-3 w-3 text-emerald-500"/>}
                  {s.trend==="flat" && <ArrowRight className="h-3 w-3 text-slate-400"/>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Signature Pipeline */}
      <section className="px-8 pb-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-bold text-slate-900">Gap to Backlog Pipeline</h3>
              <p className="text-[11px] text-slate-500">Every operational deficiency automatically becomes an engineered improvement.</p>
            </div>
            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Activity className="h-3 w-3 animate-pulse text-emerald-500"/> Live · 12 packets/min</span>
          </div>
          <div className="grid grid-cols-7 gap-2 relative">
            {pipeline.map((s,i)=>{
              const t=T[s.tone]; const Icon=s.icon;
              return (
                <button key={s.n} onClick={()=>openDrawer(s.title,"Stage")}
                  className={`relative rounded-xl border ${t.border} ${t.bg} p-3 text-left hover:shadow-md transition-all group`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-7 w-7 rounded-lg bg-white grid place-items-center border ${t.border}`}>
                      <Icon className={`h-3.5 w-3.5 ${t.text}`}/>
                    </div>
                    <span className={`text-[10px] font-bold ${t.text}`}>Stage {s.n}</span>
                  </div>
                  <div className="text-[12px] font-bold text-slate-900 leading-tight">{s.title}</div>
                  <div className="text-[10px] text-slate-600 mt-1 leading-snug">{s.sub}</div>
                  {i<pipeline.length-1 && (
                    <ChevronRight className="absolute -right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 bg-white rounded-full"/>
                  )}
                  <span className={`absolute bottom-1 right-2 h-1.5 w-1.5 rounded-full ${t.dot} animate-pulse`}/>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Backlog grid + right panel */}
      <section className="px-8 pb-5">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-9 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2"><ListChecks className="h-4 w-4 text-blue-600"/>Engineering Backlog (Top 10)</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2"/>
                  <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search gaps…"
                    className="h-8 pl-7 pr-2 rounded-md border border-slate-200 text-[11px] w-48"/>
                </div>
                <button className="h-8 px-2.5 rounded-md border border-slate-200 text-[11px] flex items-center gap-1"><Filter className="h-3 w-3"/>Filter</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    {["ID","Title","Category","Source","Impact","Priority","Effort","Owner","Sprint","Target","Status","Conf ↑","Op ↑"].map(h=>(
                      <th key={h} className="text-left font-semibold px-3 py-2 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r=>{
                    const impactTone = r.impact==="Critical"?"rose":r.impact==="High"?"orange":r.impact==="Medium"?"amber":"emerald";
                    const statusTone = r.status==="In Progress"?"blue":r.status==="Done"?"emerald":r.status==="To Do"?"amber":"slate";
                    return (
                      <tr key={r.id} onClick={()=>{setSelected(r); openDrawer(r.title,"Backlog");}}
                        className={`border-t border-slate-100 hover:bg-slate-50 cursor-pointer ${selected.id===r.id?"bg-blue-50/40":""}`}>
                        <td className="px-3 py-2 font-mono text-slate-500">{r.id}</td>
                        <td className="px-3 py-2 text-slate-900 font-medium">{r.title}</td>
                        <td className="px-3 py-2 text-slate-600">{r.cat}</td>
                        <td className="px-3 py-2 text-slate-600">{r.source}</td>
                        <td className={`px-3 py-2 font-semibold ${T[impactTone].text}`}>{r.impact}</td>
                        <td className="px-3 py-2 text-slate-700 font-semibold">{r.prio}</td>
                        <td className="px-3 py-2 text-slate-700">{r.effort} pts</td>
                        <td className="px-3 py-2 text-slate-600">{r.owner}</td>
                        <td className="px-3 py-2 text-slate-500">{r.sprint}</td>
                        <td className="px-3 py-2 text-slate-500">{r.target}</td>
                        <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded ${T[statusTone].bg} ${T[statusTone].text} font-semibold text-[10px]`}>{r.status}</span></td>
                        <td className="px-3 py-2 text-emerald-600 font-semibold">+{(r.conf*100).toFixed(0)}%</td>
                        <td className="px-3 py-2 text-teal-600 font-semibold">+{(r.op*100).toFixed(0)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right panel */}
          <div className="col-span-3 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600"/>
                <h3 className="text-[12px] font-bold text-slate-900">Selected Gap</h3>
              </div>
              <div className="text-[11px] font-mono text-slate-500">{selected.id}</div>
              <div className="text-[13px] font-bold text-slate-900 mt-0.5 leading-snug">{selected.title}</div>
              <div className="mt-3 space-y-1.5 text-[10.5px]">
                {[
                  ["Business Impact", selected.impact],
                  ["Engineering Effort", `${selected.effort} pts`],
                  ["Operational Risk", selected.prio==="P0"?"Very High":selected.prio==="P1"?"High":"Medium"],
                  ["Consumers", "4 downstream models"],
                  ["Priority", selected.prio],
                  ["Confidence Gain", `+${(selected.conf*100).toFixed(0)}%`],
                  ["Operational Gain", `+${(selected.op*100).toFixed(0)}%`],
                  ["Status", selected.status],
                ].map(([k,v])=>(
                  <div key={k} className="flex justify-between border-b border-slate-50 py-1">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-slate-800 font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-[12px] font-bold text-slate-900 mb-2">Backlog Health</h3>
              <div className="grid place-items-center"><Gauge v={72}/></div>
              <div className="space-y-1.5 text-[10.5px] mt-2">
                {[
                  ["On Track", 69, "72%", "emerald"],
                  ["At Risk",  18, "19%", "amber"],
                  ["Blocked",   9,  "9%", "rose"],
                ].map(([l,n,p,tn]:any)=>(
                  <div key={l} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${T[tn as Tone].dot}`}/><span className="text-slate-600">{l}</span></span>
                    <span className="text-slate-800 font-semibold">{n} <span className="text-slate-400">({p})</span></span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5">
                  <span className="text-slate-500">Total Items</span><span className="text-slate-900 font-bold">96</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-[12px] font-bold text-slate-900 mb-2">Recent Gap Activity</h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activity.map((a,i)=>(
                  <div key={i} className="flex items-start gap-2 text-[10.5px]">
                    <span className={`mt-1 h-1.5 w-1.5 rounded-full ${T[a.tone].dot}`}/>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className={`font-semibold ${T[a.tone].text}`}>{a.kind}</span>
                        <span className="text-slate-400">{a.when}</span>
                      </div>
                      <div className="text-slate-600 leading-snug">{a.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Transparency Zone */}
      <section className="px-8 py-6 bg-slate-50/60 border-t border-slate-200">
        <div className="mb-4">
          <div className="text-[10.5px] uppercase tracking-wider text-blue-600 font-bold">Engineering Transparency Zone</div>
          <h2 className="text-[20px] font-bold text-slate-900">How the Engineering Intelligence Engine Creates Continuous Improvement</h2>
          <p className="text-[12px] text-slate-500">Every operational deficiency becomes an engineered improvement — telemetry in, engineering work out.</p>
        </div>

        {/* Continuous improvement pipeline */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
          <h3 className="text-[13px] font-bold text-slate-900 mb-3">Continuous Improvement Pipeline</h3>
          <div className="flex items-center gap-1 overflow-x-auto">
            {["Operational Telemetry","Gap Detection","Classification","Business Impact","Engineering Impact","Priority Model","Backlog Generator","Assignment","Engineering Sprint","Validation","Operational Improvement"].map((s,i,a)=>(
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
          {/* Prioritization Engine */}
          <div className="col-span-5 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[13px] font-bold text-slate-900 mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-orange-600"/>Prioritization Engine</h3>
            <div className="space-y-1.5">
              {prioInputs.map(p=>(
                <div key={p.label} className="flex items-center gap-2 text-[10.5px]">
                  <span className="w-36 text-slate-600">{p.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${T[p.tone].bar}`} style={{width:`${p.w*3}%`}}/>
                  </div>
                  <span className={`w-8 text-right font-semibold ${T[p.tone].text}`}>{p.w}%</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 py-2 text-[11px] flex-1 flex items-center justify-between">
                  <span className="font-semibold">Priority Score</span><span className="font-bold">0.87</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400"/>
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-[11px] flex-1 text-center font-semibold">Sprint S24.10</div>
              </div>
            </div>
          </div>

          {/* Auto Backlog Generator (dark) */}
          <div className="col-span-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 p-4 font-mono">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[12px] font-bold text-slate-100">Auto Backlog Generator</h3>
              <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>LIVE</span>
            </div>
            <div className="space-y-1 text-[10px]">
              {[
                ["gap.detected",     "GAP-1024 · missing tenant_id"],
                ["classify",         "category=Missing Fields severity=P1"],
                ["root_cause",       "producer schema omits tenant scope"],
                ["story.generate",   "STORY: Add tenant_id to Okta emitter"],
                ["criteria",         "AC: tenant_id present in 99.9% events"],
                ["points",           "estimate=5 pts · confidence=0.88"],
                ["deps",             "Identity Eng → Hydration → Canonical"],
                ["assign",           "owner=Identity Eng sprint=S24.10"],
                ["sprint.commit",    "commit=true target=May 21"],
              ].map(([k,v],i)=>(
                <div key={i} className="flex gap-2">
                  <span className="text-slate-500">{String(i+1).padStart(2,"0")}</span>
                  <span className="text-blue-300 w-32 shrink-0">{k}</span>
                  <span className="text-slate-200 truncate">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5 text-[9.5px]">
              {[["Stories/s","2.4"],["Latency","118ms"],["Workers","6"],["Automation","92%"],["CPU","41%"],["Mem","2.1G"],["Queue","14"],["Success","99.6%"]].map(([l,v])=>(
                <div key={l} className="rounded bg-slate-900 border border-slate-800 p-1.5">
                  <div className="text-slate-500">{l}</div>
                  <div className="text-emerald-400 font-semibold">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Continuous Improvement Loop */}
          <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[13px] font-bold text-slate-900 mb-2 flex items-center gap-2"><RefreshCw className="h-4 w-4 text-emerald-600 animate-spin-slow"/>Continuous Improvement Loop</h3>
            <div className="relative h-56 grid place-items-center">
              <svg width={220} height={220} viewBox="0 0 220 220">
                <circle cx={110} cy={110} r={80} fill="none" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="3 3"/>
                {loop.map((s,i)=>{
                  const a = (i/loop.length)*2*Math.PI - Math.PI/2;
                  const x = 110 + 80*Math.cos(a);
                  const y = 110 + 80*Math.sin(a);
                  return (
                    <g key={s}>
                      <circle cx={x} cy={y} r={14} fill="#eff6ff" stroke="#3b82f6" strokeWidth={1.5}/>
                      <text x={x} y={y+3} textAnchor="middle" className="fill-blue-700" style={{fontSize:9,fontWeight:600}}>{i+1}</text>
                      <text x={x} y={y+ (Math.sin(a)>=0?28:-20)} textAnchor="middle" className="fill-slate-600" style={{fontSize:9}}>{s}</text>
                    </g>
                  );
                })}
                <circle cx={110} cy={110} r={30} fill="url(#loopGrad)"/>
                <text x={110} y={106} textAnchor="middle" className="fill-white" style={{fontSize:10,fontWeight:700}}>Self</text>
                <text x={110} y={118} textAnchor="middle" className="fill-white" style={{fontSize:10,fontWeight:700}}>Improving</text>
                <defs>
                  <linearGradient id="loopGrad" x1="0" x2="1">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Roadmap + widgets */}
        <div className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-7 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[13px] font-bold text-slate-900 mb-3">Engineering Roadmap</h3>
            <div className="grid grid-cols-5 gap-2">
              {[
                { t:"Current Sprint", sub:"S24.10", n:22, tone:"blue" },
                { t:"Next Sprint",    sub:"S24.11", n:28, tone:"violet" },
                { t:"Quarter",        sub:"Q2 FY25", n:64, tone:"amber" },
                { t:"Release",        sub:"R25.06",  n:18, tone:"emerald" },
                { t:"Operational Outcome", sub:"+18% conf", n:12, tone:"teal" },
              ].map((c,i,a)=>(
                <div key={c.t} className={`rounded-lg border ${T[c.tone as Tone].border} ${T[c.tone as Tone].bg} p-3`}>
                  <div className={`text-[10px] font-semibold ${T[c.tone as Tone].text}`}>{c.t}</div>
                  <div className="text-[10px] text-slate-500">{c.sub}</div>
                  <div className="text-[20px] font-bold text-slate-900 mt-1">{c.n}</div>
                  <div className="text-[10px] text-slate-500">items</div>
                  <div className="mt-2 h-1 rounded-full bg-white/70 overflow-hidden">
                    <div className={`h-full ${T[c.tone as Tone].bar}`} style={{width:`${20+i*15}%`}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-5 grid grid-cols-3 gap-2">
            {[
              { l:"Engineering Velocity",   v:"142 pts", s:"↑ 12% MoM", tone:"emerald", i:Zap },
              { l:"Technical Debt",         v:"1,240 pts", s:"↓ 4%",   tone:"amber",   i:Bug },
              { l:"Business Value Delivered",v:"$4.2M",  s:"YTD",     tone:"blue",    i:TrendingUp },
              { l:"Operational Improvements",v:"64",     s:"90d",     tone:"violet",  i:Sparkles },
              { l:"Confidence Improvements",v:"+18%",    s:"90d",     tone:"teal",    i:BadgeCheck },
              { l:"AI Readiness",           v:"+22%",    s:"90d",     tone:"orange",  i:Cpu },
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
                <p className="text-[11px] text-slate-500 mt-0.5">Engineering intelligence · decomposable inspection</p>
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
                  <p>This item represents an operational deficiency automatically converted into an engineered improvement. Business explanation, operational importance, consumers, and priority are attached at ingest.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["Business Impact","High — SLO defense"],
                      ["Operational Importance","Primary"],
                      ["Consumers","4 downstream models"],
                      ["Priority","P1"],
                      ["Est. Value","$142K/yr"],
                      ["Confidence Gain","+18%"],
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
                  {["Gap detection","Classification","Root cause","Prioritization","Story generation","Acceptance criteria","Dependency graph","Assignment","Sprint planning","Validation","Continuous improvement"].map((s,i)=>(
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
                  {[["Gaps/sec","2.4"],["Classification Latency","118ms"],["Automation %","92%"],["Story Generation","1.8/s"],["CPU","41%"],["Memory","2.1G"],["Queue","14"],["Engineering Velocity","142 pts"],["Validation Rate","99.6%"],["Confidence Gain","+18%"]].map(([k,v])=>(
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
                    ["Business Impact","biz"],["Engineering Effort","effort"],["Operational Risk","risk"],["Confidence Loss","conf"],
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
                    <div className="flex justify-between"><span className="text-blue-700 font-semibold">Recomputed Priority</span><span className="text-blue-900 font-bold">{((sliders.biz*0.35+sliders.risk*0.25+(100-sliders.effort)*0.2+(100-sliders.conf)*0.2)/100).toFixed(2)}</span></div>
                    <div className="flex justify-between mt-1"><span className="text-blue-700">Sprint Assignment</span><span className="text-blue-900 font-semibold">{sliders.biz>60?"S24.10":"S24.11"}</span></div>
                    <div className="flex justify-between mt-1"><span className="text-blue-700">Backlog Rank</span><span className="text-blue-900 font-semibold">#{Math.max(1,20-Math.round((sliders.biz+sliders.risk)/10))}</span></div>
                  </div>
                </div>
              )}
              {tab==="Dependencies" && (
                <div className="space-y-1.5">
                  {["Hydration","Schema Engine","Canonical Model","Relationship Builder","Knowledge Graph","Performance Lab","Governance","AI Models","Dashboards","Owners","Risk"].map((d,i)=>(
                    <div key={d} className="flex items-center gap-2 text-[11px] border border-slate-200 rounded-md p-2">
                      <Database className="h-3.5 w-3.5 text-slate-400"/>
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
