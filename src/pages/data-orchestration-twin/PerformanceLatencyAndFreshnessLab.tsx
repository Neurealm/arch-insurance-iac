import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Boxes, Brain, Cable, Cpu,
  Database, Download, Filter, Gauge, GitBranch, HardDrive, Layers, LineChart,
  Play, Radio, RefreshCw, Search, Server, Settings2, Sparkles, Timer,
  TrendingDown, TrendingUp, X, Zap, Clock, Network, Workflow, Waves,
  CircuitBoard, Wind, Snowflake, Flame,
} from "lucide-react";

type Tone = "blue"|"emerald"|"amber"|"rose"|"violet"|"teal"|"orange";
const T: Record<Tone,{text:string;bg:string;ring:string;dot:string;border:string;stroke:string;bar:string;soft:string}> = {
  blue:    { text:"text-blue-700",    bg:"bg-blue-50",    ring:"ring-blue-200",    dot:"bg-blue-500",    border:"border-blue-200",    stroke:"#3b82f6", bar:"bg-blue-500",    soft:"bg-blue-100/60" },
  emerald: { text:"text-emerald-700", bg:"bg-emerald-50", ring:"ring-emerald-200", dot:"bg-emerald-500", border:"border-emerald-200", stroke:"#10b981", bar:"bg-emerald-500", soft:"bg-emerald-100/60" },
  amber:   { text:"text-amber-700",   bg:"bg-amber-50",   ring:"ring-amber-200",   dot:"bg-amber-500",   border:"border-amber-200",   stroke:"#f59e0b", bar:"bg-amber-500",   soft:"bg-amber-100/60" },
  rose:    { text:"text-rose-700",    bg:"bg-rose-50",    ring:"ring-rose-200",    dot:"bg-rose-500",    border:"border-rose-200",    stroke:"#f43f5e", bar:"bg-rose-500",    soft:"bg-rose-100/60" },
  violet:  { text:"text-violet-700",  bg:"bg-violet-50",  ring:"ring-violet-200",  dot:"bg-violet-500",  border:"border-violet-200",   stroke:"#8b5cf6", bar:"bg-violet-500",  soft:"bg-violet-100/60" },
  teal:    { text:"text-teal-700",    bg:"bg-teal-50",    ring:"ring-teal-200",    dot:"bg-teal-500",    border:"border-teal-200",    stroke:"#14b8a6", bar:"bg-teal-500",    soft:"bg-teal-100/60" },
  orange:  { text:"text-orange-700",  bg:"bg-orange-50",  ring:"ring-orange-200",  dot:"bg-orange-500",  border:"border-orange-200",  stroke:"#f97316", bar:"bg-orange-500",  soft:"bg-orange-100/60" },
};

/* ============================ DATA ============================ */
const kpis: {label:string;value:string;sub:string;tone:Tone;icon:any;spark:number[];trend:string;status?:string}[] = [
  { label:"Average Source Latency",     value:"1.42s",  sub:"↓ 12.4% vs prior 24h", tone:"blue",    icon:Timer,    spark:[1.9,1.82,1.7,1.61,1.55,1.48,1.42], trend:"-12.4%" },
  { label:"Average Hydration Duration", value:"2.31s",  sub:"↓ 8.7% vs prior 24h",  tone:"teal",    icon:Waves,    spark:[2.9,2.75,2.62,2.55,2.48,2.4,2.31],  trend:"-8.7%" },
  { label:"Average Query Runtime",      value:"0.86s",  sub:"↓ 9.3% vs prior 24h",  tone:"emerald", icon:Zap,      spark:[1.2,1.14,1.06,0.99,0.94,0.9,0.86],  trend:"-9.3%" },
  { label:"Data Freshness (P95)",       value:"2.7min", sub:"Target < 5 min",       tone:"violet",  icon:RefreshCw,spark:[3.6,3.4,3.2,3.1,2.95,2.85,2.7],    trend:"On SLA" },
  { label:"Cache Hit Rate",             value:"78.6%",  sub:"↑ 5.1% vs prior 24h",  tone:"emerald", icon:Layers,   spark:[71,72.4,74,75.2,76.5,77.8,78.6],    trend:"+5.1%" },
  { label:"Timeout Risk",               value:"2.3%",   sub:"Target < 5%",          tone:"rose",    icon:AlertTriangle, spark:[4.1,3.8,3.5,3.1,2.8,2.5,2.3],  trend:"↓" },
  { label:"Rows Scanned",               value:"8.7B",   sub:"↓ 4.3% vs prior 24h",  tone:"orange",  icon:Database, spark:[9.6,9.4,9.2,9.0,8.9,8.8,8.7],       trend:"-4.3%" },
  { label:"Overall Performance Score",  value:"0.87",   sub:"Good",                 tone:"emerald", icon:Gauge,    spark:[0.78,0.80,0.82,0.83,0.85,0.86,0.87], trend:"+0.09", status:"Good" },
];

const pipelineStages = [
  { icon:Database,     label:"Source Systems",       lat:"0.34s", p95:"0.72s", queue:12,  workers:"18/24", success:"99.9%", tps:"142k/s", tone:"blue"    as Tone },
  { icon:Download,     label:"Ingestion",            lat:"0.28s", p95:"0.61s", queue:24,  workers:"22/32", success:"99.8%", tps:"138k/s", tone:"blue"    as Tone },
  { icon:Sparkles,     label:"Validation",           lat:"0.19s", p95:"0.44s", queue: 8,  workers:"14/20", success:"99.6%", tps:"137k/s", tone:"violet"  as Tone },
  { icon:Waves,        label:"Hydration",            lat:"2.31s", p95:"3.12s", queue:41,  workers:"28/32", success:"98.9%", tps:"122k/s", tone:"teal"    as Tone },
  { icon:CircuitBoard, label:"Enrichment",           lat:"1.07s", p95:"1.68s", queue:18,  workers:"20/24", success:"99.2%", tps:"120k/s", tone:"orange"  as Tone },
  { icon:Boxes,        label:"Canonical Modeling",   lat:"0.51s", p95:"0.94s", queue: 9,  workers:"12/16", success:"99.7%", tps:"118k/s", tone:"violet"  as Tone },
  { icon:GitBranch,    label:"Relationship Builder", lat:"0.62s", p95:"1.02s", queue:14,  workers:"14/18", success:"99.4%", tps:"116k/s", tone:"emerald" as Tone },
  { icon:Network,      label:"Graph Projection",     lat:"0.74s", p95:"1.24s", queue: 6,  workers:"10/12", success:"99.5%", tps:"115k/s", tone:"emerald" as Tone },
  { icon:Zap,          label:"Query Layer",          lat:"0.86s", p95:"1.42s", queue:22,  workers:"26/32", success:"97.8%", tps:"9.1k/s", tone:"blue"    as Tone },
  { icon:Radio,        label:"Operational Consumers",lat:"0.11s", p95:"0.29s", queue: 3,  workers:"8/8",   success:"99.9%", tps:"9.1k/s", tone:"emerald" as Tone },
];

type Row = {
  id:string; qtype:string; execs:number; avg:number; p95:number; scan:string;
  cache:number; cpu:number; mem:number; fail:number; timeout:number; score:number;
  tone:Tone;
};
const rows: Row[] = [
  { id:"opdash", qtype:"Operational Dashboard",   execs:12842, avg:0.61, p95:1.21, scan:"1.2B", cache:88, cpu:34, mem:41, fail: 22, timeout:1.1, score:0.94, tone:"emerald" },
  { id:"alert",  qtype:"Alert Investigation",     execs: 8731, avg:0.78, p95:1.54, scan:"2.3B", cache:74, cpu:52, mem:58, fail: 41, timeout:1.6, score:0.88, tone:"emerald" },
  { id:"hunt",   qtype:"Hunting / Forensics",     execs: 6521, avg:1.12, p95:2.31, scan:"3.1B", cache:52, cpu:71, mem:68, fail:112, timeout:2.4, score:0.79, tone:"amber"   },
  { id:"comp",   qtype:"Compliance / Audit",      execs: 4932, avg:0.93, p95:1.87, scan:"1.8B", cache:63, cpu:44, mem:52, fail: 38, timeout:1.8, score:0.85, tone:"emerald" },
  { id:"cap",    qtype:"Capacity / Trending",     execs: 3881, avg:1.45, p95:3.12, scan:"4.1B", cache:41, cpu:78, mem:74, fail: 95, timeout:3.1, score:0.72, tone:"amber"   },
  { id:"ai",     qtype:"AI Agent Reasoning",      execs: 2214, avg:0.94, p95:1.98, scan:"0.8B", cache:57, cpu:62, mem:66, fail: 18, timeout:1.4, score:0.83, tone:"emerald" },
  { id:"graph",  qtype:"Graph Traversal (3-hop)", execs: 1608, avg:1.74, p95:3.62, scan:"5.4B", cache:38, cpu:82, mem:79, fail: 74, timeout:4.2, score:0.68, tone:"rose"    },
  { id:"stream", qtype:"Streaming Enrichment",    execs: 9412, avg:0.42, p95:0.88, scan:"0.6B", cache:92, cpu:29, mem:34, fail: 12, timeout:0.6, score:0.96, tone:"emerald" },
];

const datasetSummary = [
  { name:"Firewall Traffic",    score:0.92, p95:"0.72s", fresh:"1.9 min", timeout:"1.2%", trend:"up",   tone:"emerald" as Tone },
  { name:"Threat Logs",         score:0.89, p95:"0.81s", fresh:"2.3 min", timeout:"1.6%", trend:"up",   tone:"emerald" as Tone },
  { name:"VPN Sessions",        score:0.85, p95:"0.95s", fresh:"2.8 min", timeout:"2.1%", trend:"up",   tone:"emerald" as Tone },
  { name:"DNS Logs",            score:0.82, p95:"1.12s", fresh:"3.1 min", timeout:"2.3%", trend:"up",   tone:"emerald" as Tone },
  { name:"Auth Logs",           score:0.79, p95:"1.28s", fresh:"3.9 min", timeout:"2.8%", trend:"down", tone:"amber"   as Tone },
  { name:"CloudTrail",          score:0.76, p95:"1.41s", fresh:"4.6 min", timeout:"3.4%", trend:"down", tone:"amber"   as Tone },
  { name:"K8s Events",          score:0.71, p95:"1.66s", fresh:"5.7 min", timeout:"4.2%", trend:"down", tone:"rose"    as Tone },
  { name:"NetFlow",             score:0.68, p95:"1.82s", fresh:"6.2 min", timeout:"4.9%", trend:"down", tone:"rose"    as Tone },
];

const recommendations = [
  { title:"Increase Cache TTL for Operational Dashboards", impact:"High",   improvement:"+8% hit rate",     tone:"rose"    as Tone, icon:Layers },
  { title:"Add Materialized View for Top Talkers",         impact:"Low",    improvement:"-35% query runtime",tone:"emerald" as Tone, icon:Database },
  { title:"Partition NetFlow by collector + time",         impact:"Medium", improvement:"-22% scan volume", tone:"amber"   as Tone, icon:GitBranch },
  { title:"Add Index on src_ip in Threat Logs",            impact:"High",   improvement:"+18–25% p95",      tone:"rose"    as Tone, icon:Zap },
  { title:"Reduce Row Scan via predicate pushdown",        impact:"Medium", improvement:"-14% CPU",         tone:"amber"   as Tone, icon:Filter },
  { title:"Parallel Hydration for K8s Events",             impact:"High",   improvement:"-2.0s hydration",  tone:"rose"    as Tone, icon:Waves },
  { title:"Increase Worker Pool on Enrichment",            impact:"Medium", improvement:"-30% queue depth", tone:"amber"   as Tone, icon:Cpu },
  { title:"Move Threat Logs to Edge Cache",                impact:"Low",    improvement:"+12% freshness",   tone:"emerald" as Tone, icon:Wind },
  { title:"Use Graph Projection over 3-hop join",          impact:"High",   improvement:"-45% traversal",   tone:"rose"    as Tone, icon:Network },
  { title:"Optimize Join Strategy (broadcast → shuffle)",  impact:"Medium", improvement:"-19% p95",         tone:"amber"   as Tone, icon:Workflow },
];

const alerts = [
  { label:"High Timeout Risk: NetFlow dataset (4.9%)",   time:"10:28 AM", tone:"rose"    as Tone, icon:Flame },
  { label:"Data Freshness Warning: NetFlow (6.2 min)",   time:"10:25 AM", tone:"amber"   as Tone, icon:Snowflake },
  { label:"Hydration Duration High: K8s Events (3.21s)", time:"10:23 AM", tone:"amber"   as Tone, icon:Waves },
  { label:"Source Latency Spikes: Threat Logs",          time:"10:21 AM", tone:"blue"    as Tone, icon:Timer },
  { label:"Backpressure: Enrichment queue > 40",         time:"10:18 AM", tone:"amber"   as Tone, icon:Wind },
  { label:"Worker Saturation: Hydration pool 88%",       time:"10:14 AM", tone:"rose"    as Tone, icon:Cpu },
  { label:"Cache Miss Storm: Hunting workload",          time:"10:09 AM", tone:"amber"   as Tone, icon:Layers },
  { label:"Queue Growth: Ingestion +18% in 5m",          time:"10:04 AM", tone:"blue"    as Tone, icon:TrendingUp },
];

const optPipeline = [
  { icon:Radio,        label:"Telemetry Collection" },
  { icon:Timer,        label:"Latency Analyzer" },
  { icon:RefreshCw,    label:"Freshness Analyzer" },
  { icon:Wind,         label:"Queue Analysis" },
  { icon:Cpu,          label:"Worker Utilization" },
  { icon:Brain,        label:"Optimization Engine" },
  { icon:Sparkles,     label:"Recommendation Gen" },
  { icon:Settings2,    label:"Configuration Update" },
  { icon:Activity,     label:"Continuous Monitoring" },
];

const latencyStages = [
  { label:"Source",           ms:120, tone:"blue"    as Tone },
  { label:"Network",          ms: 80, tone:"blue"    as Tone },
  { label:"Connector",        ms:140, tone:"teal"    as Tone },
  { label:"Validation",       ms:190, tone:"violet"  as Tone },
  { label:"Hydration",        ms:920, tone:"rose"    as Tone },
  { label:"Transformation",   ms:310, tone:"orange"  as Tone },
  { label:"Graph Projection", ms:220, tone:"emerald" as Tone },
  { label:"Query Layer",      ms:280, tone:"emerald" as Tone },
  { label:"Response",         ms: 90, tone:"emerald" as Tone },
];

const freshnessStages = [
  { icon:Radio,        label:"Incoming Source" },
  { icon:Sparkles,     label:"Change Detection" },
  { icon:Clock,        label:"Fetch Scheduler" },
  { icon:Waves,        label:"Hydration" },
  { icon:Sparkles,     label:"Validation" },
  { icon:Boxes,        label:"Canonical Update" },
  { icon:Network,      label:"Graph Update" },
  { icon:Gauge,        label:"Operational Freshness" },
];

/* ============================ HELPERS ============================ */
function Spark({data, color="#3b82f6", h=32, w=120}:{data:number[];color?:string;h?:number;w?:number}){
  const min=Math.min(...data), max=Math.max(...data), r=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/r)*h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.6" points={pts}/>
      <polyline fill={color} fillOpacity="0.10" stroke="none"
        points={`0,${h} ${pts} ${w},${h}`}/>
    </svg>
  );
}

function MultiLine({series, h=180}:{series:{name:string;data:number[];color:string}[];h?:number}){
  const w=760;
  const flat=series.flatMap(s=>s.data);
  const min=Math.min(...flat), max=Math.max(...flat), r=max-min||1;
  const pts=(d:number[])=>d.map((v,i)=>`${(i/(d.length-1))*w},${h-((v-min)/r)*(h-20)-10}`).join(" ");
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[180px]">
        {[0,1,2,3].map(i=>(
          <line key={i} x1="0" x2={w} y1={i*(h/3)+10} y2={i*(h/3)+10} stroke="#e5e7eb" strokeDasharray="3 3"/>
        ))}
        {series.map(s=>(
          <g key={s.name}>
            <polyline fill="none" stroke={s.color} strokeWidth="1.8" points={pts(s.data)} />
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-slate-600">
        {series.map(s=>(
          <span key={s.name} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-[2px]" style={{background:s.color}}/>{s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================ PAGE ============================ */
export default function PerformanceLatencyAndFreshnessLab(){
  const [drawer,setDrawer]=useState<null|{title:string;subtitle?:string}>(null);
  const [tab,setTab]=useState<"overview"|"engineering"|"telemetry"|"simulation"|"dependencies">("overview");
  const [query,setQuery]=useState("");
  const [workers,setWorkers]=useState(28);
  const [cacheTtl,setCacheTtl]=useState(15);
  const [freshnessSla,setFreshnessSla]=useState(5);

  const filtered = useMemo(()=>
    rows.filter(r=>r.qtype.toLowerCase().includes(query.toLowerCase())),[query]);

  const simScore = useMemo(()=>{
    const w = 0.4 + Math.min(workers,48)/48*0.35;
    const c = 0.15 + Math.min(cacheTtl,60)/60*0.2;
    const f = Math.max(0, 0.25 - Math.abs(freshnessSla-5)*0.02);
    return Math.min(0.99, Math.max(0.4, w+c+f));
  },[workers,cacheTtl,freshnessSla]);

  const open=(title:string,subtitle?:string)=>{ setDrawer({title,subtitle}); setTab("overview"); };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen text-slate-900">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-6">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 grid place-items-center text-white shadow-lg shadow-blue-500/20">
              <Gauge className="w-5 h-5"/>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Performance, Latency & Freshness Lab</h1>
              <p className="text-slate-500 text-sm mt-1">Continuously measure, optimize, and predict the operational performance of the enterprise data orchestration platform.</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
            Every stage of ingestion, validation, hydration, canonical modeling, graph projection, and query execution is continuously measured to optimize operational outcomes and AI readiness.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Last Updated</div>
            <div className="font-medium">10:32 AM · Live</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Time Window</div>
            <div className="font-medium">Last 24 hours</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Performance Profile</div>
            <div className="font-medium">Balanced</div>
          </div>
          <button className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"><Play className="w-3.5 h-3.5"/>Replay</button>
          <button className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 shadow-sm shadow-blue-500/20"><Download className="w-3.5 h-3.5"/>Export Report</button>
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="grid grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map(k=>{
          const t=T[k.tone]; const Icon=k.icon;
          return (
            <button key={k.label} onClick={()=>open(k.label,"Executive KPI")}
              className="group text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg ${t.bg} ${t.text} grid place-items-center`}><Icon className="w-4 h-4"/></div>
                <Spark data={k.spark} color={t.stroke} w={60} h={24}/>
              </div>
              <div className="mt-3 text-[11px] text-slate-500">{k.label}</div>
              <div className="text-2xl font-semibold tabular-nums mt-0.5">{k.value}</div>
              <div className={`text-[11px] mt-1 ${t.text}`}>{k.sub}</div>
            </button>
          );
        })}
      </div>

      {/* PIPELINE */}
      <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">End-to-End Performance Pipeline</h2>
            <p className="text-xs text-slate-500">Animated engineering flow — every stage streams live latency, throughput, and worker utilization.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>Streaming · 142k rows/s</span>
          </div>
        </div>
        <div className="grid grid-cols-10 gap-2 relative">
          {pipelineStages.map((s,i)=>{
            const t=T[s.tone]; const Icon=s.icon;
            return (
              <button key={s.label} onClick={()=>open(s.label,"Pipeline stage")}
                className={`group text-left p-3 rounded-xl bg-white border ${t.border} hover:shadow-md transition-all relative`}>
                <div className={`w-8 h-8 rounded-lg ${t.bg} ${t.text} grid place-items-center`}><Icon className="w-4 h-4"/></div>
                <div className="text-[11px] font-medium mt-2 leading-tight">{s.label}</div>
                <div className="mt-2 space-y-0.5 text-[10px] text-slate-500">
                  <div className="flex justify-between"><span>Lat</span><span className="tabular-nums font-medium text-slate-700">{s.lat}</span></div>
                  <div className="flex justify-between"><span>P95</span><span className="tabular-nums">{s.p95}</span></div>
                  <div className="flex justify-between"><span>Queue</span><span className="tabular-nums">{s.queue}</span></div>
                  <div className="flex justify-between"><span>Workers</span><span className="tabular-nums">{s.workers}</span></div>
                  <div className="flex justify-between"><span>OK</span><span className={`tabular-nums ${t.text}`}>{s.success}</span></div>
                  <div className="flex justify-between"><span>TPS</span><span className="tabular-nums">{s.tps}</span></div>
                </div>
                {i<pipelineStages.length-1 && <ArrowRight className="w-3 h-3 text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2 bg-white"/>}
                {/* moving particle */}
                <span className={`absolute bottom-0 left-0 h-[2px] w-full ${t.soft} overflow-hidden rounded-b-xl`}>
                  <span className={`absolute h-full w-6 ${t.bar} animate-[slide_2s_linear_infinite]`} style={{animation:`slide 2s ${i*0.15}s linear infinite`}}/>
                </span>
              </button>
            );
          })}
        </div>
        <style>{`@keyframes slide { from { transform: translateX(-24px); } to { transform: translateX(120px); } }`}</style>
      </section>

      {/* MAIN 3-COL: charts + right intelligence */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: charts + registry */}
        <div className="col-span-12 xl:col-span-9 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Performance Timeline (P95)</h3>
                <span className="text-[10px] text-slate-400">Zoom · Brush · Scrubber</span>
              </div>
              <MultiLine series={[
                { name:"Source Latency",  data:[1.8,1.7,1.9,1.6,1.5,1.7,1.5,1.42,1.5,1.4,1.3,1.42], color:"#3b82f6" },
                { name:"Hydration",       data:[2.9,2.7,2.8,2.6,2.5,2.4,2.5,2.3,2.4,2.3,2.2,2.31],  color:"#14b8a6" },
                { name:"Canonical",       data:[0.9,0.8,0.9,0.7,0.8,0.7,0.6,0.6,0.55,0.51,0.5,0.51], color:"#8b5cf6" },
                { name:"Query Runtime",   data:[1.2,1.1,1.0,0.95,0.9,0.88,0.86,0.9,0.87,0.86,0.84,0.86], color:"#10b981" },
                { name:"End-to-End Resp", data:[3.2,3.1,3.0,2.9,2.85,2.8,2.75,2.7,2.68,2.65,2.6,2.62], color:"#f97316" },
              ]}/>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Freshness & Staleness</h3>
                <span className="text-[10px] text-teal-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"/>Target 5 min</span>
              </div>
              <MultiLine series={[
                { name:"Freshness (P95)", data:[4.1,3.9,3.7,3.5,3.3,3.1,2.9,2.7,2.8,2.7,2.6,2.7], color:"#14b8a6" },
                { name:"Target",          data:[5,5,5,5,5,5,5,5,5,5,5,5],                          color:"#a78bfa" },
                { name:"Stale Records",   data:[220,210,190,170,150,140,120,110,100,95,90,88],    color:"#f43f5e" },
                { name:"Recovery",        data:[30,45,55,80,110,130,150,170,180,190,195,200],     color:"#10b981" },
              ]}/>
            </div>
          </div>

          {/* Performance Registry */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-sm">Performance Registry</h3>
                <p className="text-[11px] text-slate-500">Query-type performance across the platform · sortable · groupable · saved views.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2 top-2.5 text-slate-400"/>
                  <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search workloads"
                    className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-400 w-56"/>
                </div>
                <button className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1"><Filter className="w-3 h-3"/>Filters</button>
                <button className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50">Saved Views</button>
              </div>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-left">
                  {["Query Type","Executions","Avg","P95","Rows Scanned","Cache","CPU","Mem","Failures","Timeout","Score"].map(h=>(
                    <th key={h} className="px-4 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r=>{
                  const t=T[r.tone];
                  return (
                    <tr key={r.id} onClick={()=>open(r.qtype,"Workload")} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-2.5 font-medium">{r.qtype}</td>
                      <td className="px-4 py-2.5 tabular-nums">{r.execs.toLocaleString()}</td>
                      <td className="px-4 py-2.5 tabular-nums">{r.avg.toFixed(2)}s</td>
                      <td className="px-4 py-2.5 tabular-nums">{r.p95.toFixed(2)}s</td>
                      <td className="px-4 py-2.5 tabular-nums">{r.scan}</td>
                      <td className="px-4 py-2.5 tabular-nums">{r.cache}%</td>
                      <td className="px-4 py-2.5">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width:`${r.cpu}%`}}/></div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-violet-500" style={{width:`${r.mem}%`}}/></div>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">{r.fail}</td>
                      <td className="px-4 py-2.5 tabular-nums">{r.timeout}%</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${t.bg} ${t.text}`}>{r.score.toFixed(2)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Intelligence Panel */}
        <aside className="col-span-12 xl:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-sm mb-3">Dataset Performance Summary</h3>
            <div className="space-y-2">
              {datasetSummary.map(d=>{
                const t=T[d.tone];
                return (
                  <button key={d.name} onClick={()=>open(d.name,"Dataset summary")} className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>{d.name}</span>
                      <span className={`px-1.5 py-0.5 rounded ${t.bg} ${t.text} tabular-nums text-[10px]`}>{d.score.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 tabular-nums">
                      <span>P95 {d.p95}</span><span>Fresh {d.fresh}</span><span>TO {d.timeout}</span>
                      {d.trend==="up"?<TrendingUp className="w-3 h-3 text-emerald-500"/>:<TrendingDown className="w-3 h-3 text-rose-500"/>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Optimization Recommendations</h3>
              <span className="text-[10px] text-slate-400">{recommendations.length}</span>
            </div>
            <div className="space-y-2 max-h-[380px] overflow-auto pr-1">
              {recommendations.map(r=>{
                const t=T[r.tone]; const Icon=r.icon;
                return (
                  <button key={r.title} onClick={()=>open(r.title,"Optimization")}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition group">
                    <div className="flex items-start gap-2">
                      <div className={`w-7 h-7 rounded-md ${t.bg} ${t.text} grid place-items-center shrink-0`}><Icon className="w-3.5 h-3.5"/></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium leading-tight">{r.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                          <span className={`px-1.5 py-0.5 rounded ${t.bg} ${t.text}`}>{r.impact} Impact</span>
                          <span>{r.improvement}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-sm mb-3">Active Performance Alerts</h3>
            <div className="space-y-1.5">
              {alerts.map(a=>{
                const t=T[a.tone]; const Icon=a.icon;
                return (
                  <button key={a.label} onClick={()=>open(a.label,"Alert")} className="w-full text-left flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50">
                    <Icon className={`w-3.5 h-3.5 mt-0.5 ${t.text}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium leading-tight">{a.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{a.time}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* ENGINEERING TRANSPARENCY ZONE */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white grid place-items-center"><Brain className="w-4 h-4"/></div>
          <div>
            <h2 className="text-lg font-semibold">How the Performance Optimization Engine Works</h2>
            <p className="text-xs text-slate-500">Engineering continuously optimizes platform performance through a closed-loop analysis pipeline.</p>
          </div>
        </div>

        {/* Optimization Pipeline */}
        <div className="grid grid-cols-9 gap-2 mb-6">
          {optPipeline.map((s,i)=>{
            const Icon=s.icon;
            return (
              <button key={s.label} onClick={()=>open(s.label,"Optimization stage")}
                className="p-3 rounded-xl bg-white border border-slate-200 hover:shadow-md transition relative">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 grid place-items-center"><Icon className="w-3.5 h-3.5"/></div>
                <div className="text-[11px] font-medium mt-2 leading-tight">{s.label}</div>
                {i<optPipeline.length-1 && <ArrowRight className="w-3 h-3 text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2 bg-slate-50"/>}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Latency Analysis Engine */}
          <div className="col-span-2 p-4 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Latency Analysis Engine</h3>
              <span className="text-[10px] text-slate-400">Bottleneck highlighted in red</span>
            </div>
            <div className="space-y-2">
              {latencyStages.map(s=>{
                const t=T[s.tone];
                const pct=Math.min(100, (s.ms/1000)*100);
                return (
                  <button key={s.label} onClick={()=>open(s.label,"Latency stage")} className="w-full text-left group">
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-medium">{s.label}</span>
                      <span className="tabular-nums text-slate-500">{s.ms} ms</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${t.bar} transition-all`} style={{width:`${pct}%`}}/>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Performance Simulation (dark) */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Live Performance Simulation</h3>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>streaming</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { l:"Rows/sec",       v:"142,318", c:"text-emerald-300" },
                { l:"Queries/sec",    v:"9,124",   c:"text-blue-300" },
                { l:"Hydration/sec",  v:"122,441", c:"text-teal-300" },
                { l:"Graph ops/sec",  v:"41,209",  c:"text-violet-300" },
                { l:"AI reqs/sec",    v:"612",     c:"text-orange-300" },
                { l:"Backpressure",   v:"0.14",    c:"text-amber-300" },
                { l:"Thread util",    v:"72%",     c:"text-blue-300" },
                { l:"Worker scaling", v:"+4",      c:"text-emerald-300" },
              ].map(m=>(
                <div key={m.l} className="p-2 rounded-lg bg-slate-800/60 border border-slate-700">
                  <div className="text-[10px] text-slate-400">{m.l}</div>
                  <div className={`tabular-nums font-semibold text-sm ${m.c}`}>{m.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <div className="text-[10px] text-slate-400 mb-1">Worker · Queue · Cache · Hydration</div>
              <div className="flex gap-1 h-10 items-end">
                {Array.from({length:36}).map((_,i)=>(
                  <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-violet-400 rounded-sm animate-pulse"
                    style={{height:`${20+Math.abs(Math.sin(i/2))*60}%`, animationDelay:`${i*40}ms`}}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Freshness Intelligence */}
        <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Freshness Intelligence Engine</h3>
            <span className="text-[10px] text-teal-600">Freshness improving · animation live</span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {freshnessStages.map((s,i)=>{
              const Icon=s.icon;
              return (
                <button key={s.label} onClick={()=>open(s.label,"Freshness stage")}
                  className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 hover:shadow-md transition relative">
                  <div className="w-7 h-7 rounded-lg bg-white text-teal-700 grid place-items-center"><Icon className="w-3.5 h-3.5"/></div>
                  <div className="text-[11px] font-medium mt-2 leading-tight text-slate-800">{s.label}</div>
                  <div className="mt-1 text-[10px] text-teal-700 tabular-nums">{(6-i*0.5).toFixed(1)} min</div>
                  {i<freshnessStages.length-1 && <ArrowRight className="w-3 h-3 text-teal-300 absolute -right-2 top-1/2 -translate-y-1/2 bg-white rounded-full"/>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Bottleneck Sankey */}
        <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Live Bottleneck Explorer</h3>
            <span className="text-[10px] text-slate-500">Thickness = throughput · red = bottleneck</span>
          </div>
          <svg viewBox="0 0 900 200" className="w-full h-[200px]">
            {[
              { x1:20, x2:180, y1:100, w:60, color:"#3b82f6", label:"Ingestion" },
              { x1:180,x2:340, y1:100, w:54, color:"#8b5cf6", label:"Validation" },
              { x1:340,x2:500, y1:100, w:80, color:"#f43f5e", label:"Hydration ⚠" },
              { x1:500,x2:660, y1:100, w:44, color:"#10b981", label:"Graph" },
              { x1:660,x2:860, y1:100, w:40, color:"#f97316", label:"Query" },
            ].map((s,i)=>(
              <g key={i} onClick={()=>open(s.label.replace(" ⚠",""),"Bottleneck")} className="cursor-pointer">
                <path d={`M${s.x1},${s.y1-s.w/2} L${s.x2},${s.y1-s.w/2-4} L${s.x2},${s.y1+s.w/2+4} L${s.x1},${s.y1+s.w/2} Z`}
                  fill={s.color} fillOpacity="0.35" stroke={s.color} strokeWidth="1"/>
                <text x={(s.x1+s.x2)/2} y={s.y1+s.w/2+22} textAnchor="middle" className="fill-slate-600 text-[10px]">{s.label}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Prediction Engine */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          {[
            { l:"Latency Forecast",     v:"1.28s",  d:"+0 · stable",  tone:"blue"    as Tone, icon:Timer },
            { l:"Freshness Forecast",   v:"2.5min", d:"↓ improving",  tone:"teal"    as Tone, icon:RefreshCw },
            { l:"Worker Needs (7d)",    v:"36",     d:"+4 projected", tone:"violet"  as Tone, icon:Cpu },
            { l:"Storage Growth (30d)", v:"+18 TB", d:"CI 92%",       tone:"orange"  as Tone, icon:HardDrive },
          ].map(p=>{
            const t=T[p.tone]; const Icon=p.icon;
            return (
              <button key={p.l} onClick={()=>open(p.l,"Prediction")} className="p-3 rounded-xl bg-white border border-slate-200 hover:shadow-md transition text-left">
                <div className={`w-8 h-8 rounded-lg ${t.bg} ${t.text} grid place-items-center`}><Icon className="w-4 h-4"/></div>
                <div className="text-[11px] text-slate-500 mt-2">{p.l}</div>
                <div className="text-lg font-semibold tabular-nums">{p.v}</div>
                <div className={`text-[10px] ${t.text}`}>{p.d}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* BOTTOM OPERATIONAL WIDGETS */}
      <section className="grid grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { l:"Throughput Trends",     v:"142k/s", tone:"blue"    as Tone, spark:[110,118,124,130,135,140,142] },
          { l:"Resource Utilization",  v:"68%",    tone:"violet"  as Tone, spark:[60,62,64,65,66,67,68] },
          { l:"Concurrency (Peak)",    v:"312",    tone:"emerald" as Tone, spark:[280,290,295,300,305,310,312] },
          { l:"Worker Utilization",    v:"72%",    tone:"blue"    as Tone, spark:[65,66,68,70,71,72,72] },
          { l:"Query Mix",             v:"9.1k/s", tone:"teal"    as Tone, spark:[7.8,8.1,8.4,8.7,8.9,9.0,9.1] },
          { l:"Cache Hit Rate",        v:"78.6%",  tone:"emerald" as Tone, spark:[71,72,74,75,76,77,78.6] },
          { l:"Hydration Performance", v:"122k/s", tone:"teal"    as Tone, spark:[110,113,116,118,120,121,122] },
          { l:"Infrastructure Cost",   v:"$14.2k", tone:"orange"  as Tone, spark:[15,14.8,14.6,14.5,14.4,14.3,14.2] },
          { l:"Performance History",   v:"0.87",   tone:"emerald" as Tone, spark:[0.78,0.8,0.82,0.83,0.85,0.86,0.87] },
          { l:"Timeouts (24h)",        v:"1,024",  tone:"rose"    as Tone, spark:[1200,1180,1140,1100,1080,1050,1024] },
          { l:"Rows Returned",         v:"152M",   tone:"blue"    as Tone, spark:[130,135,140,144,148,150,152] },
          { l:"Data Processed",        v:"2.41 TB",tone:"violet"  as Tone, spark:[2.1,2.15,2.2,2.25,2.32,2.38,2.41] },
        ].map(w=>{
          const t=T[w.tone];
          return (
            <button key={w.l} onClick={()=>open(w.l,"Operational widget")} className="p-3 rounded-xl bg-white border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition text-left">
              <div className="text-[11px] text-slate-500">{w.l}</div>
              <div className="flex items-end justify-between mt-1">
                <div className="text-lg font-semibold tabular-nums">{w.v}</div>
                <Spark data={w.spark} color={t.stroke} w={60} h={22}/>
              </div>
            </button>
          );
        })}
      </section>

      {/* ================ ENGINEERING DRAWER ================ */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in" onClick={()=>setDrawer(null)}>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"/>
          <div onClick={e=>e.stopPropagation()} className="relative w-[560px] h-full bg-white border-l border-slate-200 shadow-2xl overflow-y-auto animate-slide-in-right">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">{drawer.subtitle||"Engineering"}</div>
                <h3 className="text-lg font-semibold mt-0.5">{drawer.title}</h3>
              </div>
              <button onClick={()=>setDrawer(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4"/></button>
            </div>
            <div className="px-5 pt-4 flex gap-1 border-b border-slate-100">
              {(["overview","engineering","telemetry","simulation","dependencies"] as const).map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  className={`px-3 py-2 text-xs rounded-t-lg capitalize border-b-2 -mb-px transition ${tab===t?"border-blue-500 text-blue-700 bg-blue-50/50":"border-transparent text-slate-500 hover:text-slate-700"}`}>{t}</button>
              ))}
            </div>
            <div className="p-5 space-y-4 text-sm">
              {tab==="overview" && (
                <>
                  <p className="text-slate-600 leading-relaxed">This metric represents a key measurement in the platform's performance envelope. It is monitored continuously and directly influences SLA attainment, AI readiness, and operational trust.</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-slate-400 text-[10px]">Operational Impact</div><div className="font-medium mt-0.5">High — 8 downstream consumers</div></div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-slate-400 text-[10px]">Criticality</div><div className="font-medium mt-0.5">Tier 1 · SLO gated</div></div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-slate-400 text-[10px]">Consumers</div><div className="font-medium mt-0.5">Dashboards · AI · Compliance</div></div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-slate-400 text-[10px]">Owner</div><div className="font-medium mt-0.5">Data Platform SRE</div></div>
                  </div>
                </>
              )}
              {tab==="engineering" && (
                <div className="space-y-2">
                  {["Performance telemetry","Latency engine","Queue management","Hydration optimizer","Worker scaling","Cache optimizer","Graph optimization","Query optimizer","Prediction engine","Continuous tuning"].map((e,i)=>(
                    <div key={e} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 rounded-md bg-white text-blue-600 grid place-items-center text-[10px] font-semibold">{i+1}</div>
                      <div className="text-xs font-medium">{e}</div>
                      <div className="ml-auto text-[10px] text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>active</div>
                    </div>
                  ))}
                </div>
              )}
              {tab==="telemetry" && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["CPU","34%"],["Memory","41%"],["Queue depth","18"],["Worker util","72%"],
                    ["Latency P95","1.42s"],["Cache hit","78.6%"],["Network","842 MB/s"],["Storage","2.41 TB"],
                    ["Rows/sec","142,318"],["Queries/sec","9,124"],["Hydration/sec","122,441"],["Graph ops/sec","41,209"],
                    ["Failures","41"],["Retries","112"],
                  ].map(([l,v])=>(
                    <div key={l} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">{l}</div>
                      <div className="font-semibold tabular-nums">{v}</div>
                    </div>
                  ))}
                </div>
              )}
              {tab==="simulation" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Simulated Performance Score</div>
                    <div className="text-3xl font-semibold tabular-nums text-blue-700">{simScore.toFixed(2)}</div>
                    <div className="text-[11px] text-slate-500">Live estimate from your parameter changes</div>
                  </div>
                  {[
                    { l:"Worker Count",     v:workers,        min:8,  max:48, set:setWorkers,       suffix:"workers" },
                    { l:"Cache TTL",        v:cacheTtl,       min:1,  max:60, set:setCacheTtl,      suffix:"min" },
                    { l:"Freshness SLA",    v:freshnessSla,   min:1,  max:15, set:setFreshnessSla,  suffix:"min" },
                  ].map(s=>(
                    <div key={s.l}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">{s.l}</span>
                        <span className="tabular-nums text-slate-500">{s.v} {s.suffix}</span>
                      </div>
                      <input type="range" min={s.min} max={s.max} value={s.v} onChange={e=>s.set(Number(e.target.value))}
                        className="w-full accent-blue-600"/>
                    </div>
                  ))}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                    Recommended: scale workers to {Math.min(48,workers+4)} · reduce cache TTL variance · tighten freshness SLA to 3 min for Tier 1 datasets.
                  </div>
                </div>
              )}
              {tab==="dependencies" && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["Schedulers","Hydration Engine","Canonical Model","Relationship Builder","Knowledge Graph","Storage","Caches","API Layer","Consumers","AI Models","Dashboards"].map(d=>(
                    <div key={d} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <Cable className="w-3.5 h-3.5 text-slate-400"/>{d}
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
