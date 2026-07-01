import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, BadgeCheck, Boxes, Brain, Cable,
  CheckCircle2, ChevronRight, Cloud, Cpu, Database, Download, Filter,
  Gauge, GitBranch, Globe, HardDrive, Layers, Link2, Lock, MonitorSmartphone,
  Network, Play, RefreshCw, Search, Server, Settings2, Shield, ShieldCheck,
  Sparkles, Timer, TrendingUp, TrendingDown, User, X, Zap, Radio, Workflow,
  FileJson, Component, Waves, Route, Wind, Clock,
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

/* ================= KPIs ================= */
const kpis:{label:string;value:string;sub:string;tone:Tone;icon:any;spark:number[];trend:string;status?:string}[] = [
  { label:"Context Readiness",       value:"0.92",  sub:"Excellent",         tone:"emerald", icon:ShieldCheck, spark:[0.84,0.86,0.88,0.89,0.9,0.91,0.92], trend:"+0.08" },
  { label:"Operational Entities",    value:"1,842", sub:"↑ 8.6% vs prior 24h", tone:"blue",  icon:Database,    spark:[1620,1680,1720,1760,1790,1820,1842], trend:"+156" },
  { label:"Graph Relationships",     value:"7,654", sub:"↑ 7.8% vs prior 24h", tone:"violet", icon:GitBranch,  spark:[6800,6950,7100,7280,7440,7560,7654], trend:"+554" },
  { label:"Freshness (P95)",         value:"2.7 min", sub:"Target < 5 min",   tone:"teal",  icon:RefreshCw,   spark:[4.2,3.9,3.6,3.3,3.1,2.9,2.7], trend:"On SLA" },
  { label:"Average Confidence",      value:"0.91",  sub:"↑ 5.4% vs prior 24h", tone:"emerald", icon:BadgeCheck,spark:[0.83,0.85,0.87,0.88,0.89,0.9,0.91], trend:"+0.05" },
  { label:"Unresolved Gaps",         value:"23",    sub:"↓ 17% vs prior 24h",  tone:"rose",  icon:AlertTriangle,spark:[38,34,31,28,26,25,23], trend:"-6" },
  { label:"AI Query Success",        value:"97.8%", sub:"Target ≥ 95%",       tone:"emerald",icon:CheckCircle2,spark:[94.2,95.1,96,96.6,97.1,97.5,97.8], trend:"+2.3%" },
  { label:"Agent Handoff Latency",   value:"1.18s", sub:"Target < 2s",        tone:"blue",  icon:Timer,       spark:[1.55,1.48,1.4,1.32,1.26,1.22,1.18], trend:"-0.34s" },
];

/* ================= GRAPH ================= */
type Node = { id:string; label:string; sub?:string; type:string; icon:any; tone:Tone; x:number; y:number; conf:number; fresh:string; };
const nodes: Node[] = [
  { id:"fw",    label:"Palo Alto Firewall", sub:"10.10.1.15",   type:"Device",      icon:Shield,       tone:"blue",    x:110, y:120, conf:0.94, fresh:"1.2 min" },
  { id:"iface", label:"ethernet1/1",        sub:"Interface",    type:"Interface",   icon:Cable,        tone:"violet",  x:290, y: 90, conf:0.92, fresh:"1.0 min" },
  { id:"net",   label:"Internet.se",        sub:"Network",      type:"Network",     icon:Globe,        tone:"teal",    x:470, y:150, conf:0.90, fresh:"2.1 min" },
  { id:"saas",  label:"SaaS App",           sub:"Salesforce",   type:"Application", icon:Cloud,        tone:"violet",  x:650, y: 70, conf:0.93, fresh:"1.8 min" },
  { id:"dns",   label:"DNS Record",         sub:"salesforce.com",type:"DNS",        icon:Route,        tone:"emerald", x:790, y:170, conf:0.90, fresh:"2.4 min" },
  { id:"user",  label:"User: jdoe",         sub:"jdoe@acme.com",type:"User",        icon:User,         tone:"emerald", x:640, y:260, conf:0.89, fresh:"0.8 min" },
  { id:"vpn",   label:"VPN Tunnel",         sub:"NYC → SFO",    type:"Tunnel",      icon:Lock,         tone:"amber",   x:280, y:250, conf:0.87, fresh:"1.4 min" },
  { id:"rule",  label:"Security Rule",      sub:"Allow-HTTPS",  type:"Policy",      icon:ShieldCheck,  tone:"blue",    x:130, y:340, conf:0.95, fresh:"3.0 min" },
  { id:"sess",  label:"Session",            sub:"ID: 884211",   type:"Session",     icon:Activity,     tone:"violet",  x:360, y:390, conf:0.88, fresh:"0.5 min" },
  { id:"log",   label:"Threat Log",         sub:"ID: 778233",   type:"Threat",      icon:AlertTriangle,tone:"rose",    x:600, y:400, conf:0.86, fresh:"0.6 min" },
  { id:"alert", label:"Alert: Blocked",     sub:"Threat Detected",type:"Alert",     icon:AlertTriangle,tone:"rose",    x:820, y:330, conf:0.91, fresh:"0.4 min" },
];
type Edge = { s:string; t:string; label:string; kind:"primary"|"secondary"|"enrich"|"derived" };
const edges: Edge[] = [
  { s:"fw",   t:"iface", label:"has_interface", kind:"primary" },
  { s:"iface",t:"net",   label:"connects_to",   kind:"primary" },
  { s:"net",  t:"saas",  label:"routes_to",     kind:"enrich"  },
  { s:"net",  t:"dns",   label:"resolves_to",   kind:"enrich"  },
  { s:"saas", t:"user",  label:"queried_by",    kind:"secondary" },
  { s:"user", t:"vpn",   label:"tunnels_via",   kind:"secondary" },
  { s:"vpn",  t:"fw",    label:"located_at",    kind:"secondary" },
  { s:"rule", t:"fw",    label:"matched_by",    kind:"primary" },
  { s:"rule", t:"sess",  label:"evaluated_by",  kind:"primary" },
  { s:"sess", t:"log",   label:"generated",     kind:"derived" },
  { s:"log",  t:"alert", label:"raises",        kind:"derived" },
  { s:"user", t:"log",   label:"observed_in",   kind:"derived" },
];
const edgeStyle: Record<Edge["kind"], {color:string; dash:string; label:string}> = {
  primary:  { color:"#3b82f6", dash:"0",     label:"Primary" },
  secondary:{ color:"#94a3b8", dash:"4 3",   label:"Secondary" },
  enrich:   { color:"#10b981", dash:"6 4",   label:"Enrichment" },
  derived:  { color:"#8b5cf6", dash:"2 3",   label:"Derived" },
};

/* ================= TABLES ================= */
const joins = [
  { path:"User → Device → Session → Application",  type:"Multi-hop", ent:1248, used:"10:28 AM", conf:0.94, fresh:"2.1 min" },
  { path:"Device → Interface → Traffic → Application", type:"Multi-hop", ent:1102, used:"10:27 AM", conf:0.93, fresh:"2.4 min" },
  { path:"User → DNS Query → DNS Record → IP",      type:"Multi-hop", ent: 974, used:"10:26 AM", conf:0.90, fresh:"2.7 min" },
  { path:"Device → Threat Log → Alert → Rule",      type:"Multi-hop", ent: 812, used:"10:25 AM", conf:0.92, fresh:"1.9 min" },
  { path:"Application → Traffic → Device → Site",   type:"Multi-hop", ent: 688, used:"10:24 AM", conf:0.89, fresh:"3.2 min" },
];
const vectors = [
  { entity:"Palo Alto Firewall PA-5220 logs",   type:"Device",      sim:0.94, fresh:"Threat Logs" },
  { entity:"Salesforce API connectivity issues",type:"Application", sim:0.92, fresh:"App Logs" },
  { entity:"jdoe@acme.com authentication events",type:"User",       sim:0.91, fresh:"Auth Logs" },
  { entity:"Blocked outbound connections",      type:"Security",    sim:0.89, fresh:"Security Logs" },
  { entity:"NYC Office network performance",    type:"Network",     sim:0.88, fresh:"NetFlow" },
];
const gaps = [
  { gap:"Missing OS Version",       impact:"Medium", ent:42, reason:"Not in source",  tone:"amber" as Tone },
  { gap:"Unknown Interface Speed",  impact:"Low",    ent:18, reason:"Partial data",   tone:"emerald" as Tone },
  { gap:"Application Owner",        impact:"Medium", ent:31, reason:"No mapping",     tone:"amber" as Tone },
  { gap:"Geo Location",             impact:"Low",    ent:27, reason:"IP not mapped",  tone:"emerald" as Tone },
  { gap:"Business Criticality",     impact:"Medium", ent:15, reason:"Not tagged",     tone:"amber" as Tone },
  { gap:"Missing Ownership",        impact:"High",   ent: 9, reason:"Orphan entity",  tone:"rose" as Tone },
];
const entityTypes = [
  { l:"Device",      c:142, p:7.7,  tone:"emerald" as Tone },
  { l:"User",        c:312, p:16.9, tone:"blue"    as Tone },
  { l:"Application", c:256, p:13.9, tone:"violet"  as Tone },
  { l:"Network",     c:198, p:10.7, tone:"teal"    as Tone },
  { l:"Security",    c:284, p:15.4, tone:"orange"  as Tone },
  { l:"Other",       c:650, p:35.3, tone:"amber"   as Tone },
];
const freshBuckets = [
  { l:"0–1 min",   p:38, tone:"emerald" as Tone },
  { l:"1–5 min",   p:41, tone:"emerald" as Tone },
  { l:"5–15 min",  p:13, tone:"amber"   as Tone },
  { l:"15–30 min", p: 5, tone:"orange"  as Tone },
  { l:"> 30 min",  p: 3, tone:"rose"    as Tone },
];
const confDist = [
  { l:"High (0.90–1.00)",  p:68.1, tone:"emerald" as Tone },
  { l:"Medium (0.70–0.90)",p:25.6, tone:"amber"   as Tone },
  { l:"Low (0.50–0.70)",   p: 5.1, tone:"rose"    as Tone },
  { l:"Very Low (< 0.50)", p: 1.2, tone:"violet"  as Tone },
];

const assemblyPipeline = [
  { icon:Boxes,      label:"Canonical Entities" },
  { icon:GitBranch,  label:"Relationship Graph" },
  { icon:Link2,      label:"Lineage Verification" },
  { icon:RefreshCw,  label:"Freshness Validation" },
  { icon:BadgeCheck, label:"Confidence Evaluation" },
  { icon:Workflow,   label:"Relational Join Builder" },
  { icon:Search,     label:"Semantic Candidates" },
  { icon:FileJson,   label:"Context Packaging" },
  { icon:AlertTriangle,label:"Gap Analysis" },
  { icon:Sparkles,   label:"AI Handoff Package" },
  { icon:Brain,      label:"Operational Agent" },
];

const handoffStages = [
  { icon:MonitorSmartphone, label:"Incoming Question" },
  { icon:Sparkles, label:"Intent Detection" },
  { icon:Network,  label:"Graph Query" },
  { icon:Database, label:"Relational Retrieval" },
  { icon:Search,   label:"Semantic Retrieval" },
  { icon:Layers,   label:"Context Assembly" },
  { icon:AlertTriangle, label:"Gap Detection" },
  { icon:BadgeCheck,label:"Confidence" },
  { icon:FileJson, label:"Payload" },
  { icon:Brain,    label:"AI Agent" },
];

const workflow = [
  { n:1, icon:MonitorSmartphone, title:"Intent Received",      sub:"Natural language or API request" },
  { n:2, icon:ShieldCheck,       title:"Context Graph Built",  sub:"Entities, relationships, freshness, confidence" },
  { n:3, icon:Sparkles,          title:"Graph & Vector Retrieval", sub:"Relational + semantic candidates" },
  { n:4, icon:AlertTriangle,     title:"Gap Detection",        sub:"Identify missing or low-confidence" },
  { n:5, icon:FileJson,          title:"Handoff to Agent",     sub:"Trusted context + metadata" },
  { n:6, icon:Brain,             title:"Action & Response",    sub:"Answer, action, or next steps" },
];

/* ================= HELPERS ================= */
function Spark({data,color="#3b82f6",h=24,w=60}:{data:number[];color?:string;h?:number;w?:number}){
  const min=Math.min(...data), max=Math.max(...data), r=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/r)*h}`).join(" ");
  return (
    <svg width={w} height={h}>
      <polyline fill="none" stroke={color} strokeWidth="1.6" points={pts}/>
      <polyline fill={color} fillOpacity=".1" stroke="none" points={`0,${h} ${pts} ${w},${h}`}/>
    </svg>
  );
}
function Donut({data,size=110}:{data:{l:string;p:number;tone:Tone}[];size?:number}){
  const total = data.reduce((s,d)=>s+d.p,0);
  const R=size/2-8, C=size/2;
  let acc=0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={C} cy={C} r={R} fill="none" stroke="#f1f5f9" strokeWidth="14"/>
      {data.map((d,i)=>{
        const start=acc/total*Math.PI*2 - Math.PI/2;
        acc+=d.p;
        const end  =acc/total*Math.PI*2 - Math.PI/2;
        const x1=C+R*Math.cos(start), y1=C+R*Math.sin(start);
        const x2=C+R*Math.cos(end),   y2=C+R*Math.sin(end);
        const large = end-start > Math.PI ? 1 : 0;
        return (
          <path key={i} d={`M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`}
            stroke={T[d.tone].stroke} strokeWidth="14" fill="none" strokeLinecap="butt"/>
        );
      })}
    </svg>
  );
}

/* ================= PAGE ================= */
export default function ContextGraphAndAgenticQueryHandoffLayer(){
  const [drawer,setDrawer]=useState<null|{title:string;subtitle?:string}>(null);
  const [tab,setTab]=useState<"overview"|"engineering"|"telemetry"|"simulation"|"dependencies">("overview");
  const [hoverNode,setHoverNode]=useState<string|null>(null);
  const [confThresh,setConfThresh]=useState(0.85);
  const [freshSla,setFreshSla]=useState(5);
  const [graphDepth,setGraphDepth]=useState(3);

  const open=(title:string,subtitle?:string)=>{ setDrawer({title,subtitle}); setTab("overview"); };
  const nodeMap = useMemo(()=>Object.fromEntries(nodes.map(n=>[n.id,n])),[]);
  const hovered = hoverNode ? nodeMap[hoverNode] : null;

  const simPayloadSize = useMemo(()=>{
    const base = 24 * (graphDepth/3) * (confThresh<0.9?1.2:0.8) * (freshSla>5?1.15:0.9);
    return Math.round(base);
  },[graphDepth,confThresh,freshSla]);

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen text-slate-900">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-6">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 grid place-items-center text-white shadow-lg shadow-violet-500/20">
              <Component className="w-5 h-5"/>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">Context Graph & Agentic Query Handoff Layer</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold ring-1 ring-emerald-200 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>Ready</span>
              </div>
              <p className="text-slate-500 text-sm mt-1">Transform trusted operational entities into AI-ready contextual intelligence.</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
            The Context Graph Engine continuously assembles operational entities, relationships, freshness, confidence, lineage, semantic retrieval candidates, and graph intelligence into context packages that power enterprise AI agents.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Last Updated</div>
            <div className="font-medium">10:32 AM · Live</div>
          </div>
          <button onClick={()=>open("Graph Explorer","Interactive")} className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"><Network className="w-3.5 h-3.5"/>Graph Explorer</button>
          <button className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"><Filter className="w-3.5 h-3.5"/>Context Filters</button>
          <button onClick={()=>open("AI Playground","Agent runtime")} className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"><Play className="w-3.5 h-3.5"/>AI Playground</button>
          <button className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 shadow-sm shadow-blue-500/20"><Download className="w-3.5 h-3.5"/>Export Context</button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map(k=>{
          const t=T[k.tone]; const Icon=k.icon;
          return (
            <button key={k.label} onClick={()=>open(k.label,"Executive KPI")}
              className="text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg ${t.bg} ${t.text} grid place-items-center`}><Icon className="w-4 h-4"/></div>
                <Spark data={k.spark} color={t.stroke}/>
              </div>
              <div className="mt-3 text-[11px] text-slate-500">{k.label}</div>
              <div className="text-2xl font-semibold tabular-nums mt-0.5">{k.value}</div>
              <div className={`text-[11px] mt-1 ${t.text}`}>{k.sub}</div>
            </button>
          );
        })}
      </div>

      {/* PRIMARY WORKSPACE */}
      <div className="grid grid-cols-12 gap-4">
        {/* GRAPH */}
        <div className="col-span-12 xl:col-span-8 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold">Context Graph (Handoff View)</h2>
              <p className="text-xs text-slate-500">Force-directed operational graph · packets animate along edges · click any node.</p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              {entityTypes.slice(0,6).map(e=>(
                <span key={e.l} className="flex items-center gap-1 text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${T[e.tone].dot}`}/>{e.l} ({e.c})
                </span>
              ))}
            </div>
          </div>
          <div className="relative rounded-xl bg-gradient-to-br from-slate-50/60 to-white border border-slate-100 overflow-hidden" style={{height:460}}>
            <svg viewBox="0 0 940 480" className="w-full h-full">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#94a3b8"/>
                </marker>
              </defs>
              {edges.map((e,i)=>{
                const s=nodeMap[e.s], t=nodeMap[e.t]; if(!s||!t) return null;
                const st=edgeStyle[e.kind];
                const mx=(s.x+t.x)/2, my=(s.y+t.y)/2 - 12;
                return (
                  <g key={i}>
                    <path d={`M${s.x},${s.y} Q${mx},${my} ${t.x},${t.y}`}
                      stroke={st.color} strokeWidth="1.4" strokeDasharray={st.dash} fill="none" opacity="0.8" markerEnd="url(#arrow)"/>
                    <text x={mx} y={my-4} textAnchor="middle" className="fill-slate-500 text-[9px]">{e.label}</text>
                    {/* moving packet */}
                    <circle r="2.5" fill={st.color}>
                      <animateMotion dur={`${3+i*0.3}s`} repeatCount="indefinite"
                        path={`M${s.x},${s.y} Q${mx},${my} ${t.x},${t.y}`}/>
                    </circle>
                  </g>
                );
              })}
              {nodes.map(n=>{
                const t=T[n.tone]; const Icon=n.icon;
                const hovered = hoverNode===n.id;
                return (
                  <g key={n.id} onMouseEnter={()=>setHoverNode(n.id)} onMouseLeave={()=>setHoverNode(null)}
                    onClick={()=>open(n.label, n.type)} className="cursor-pointer">
                    <rect x={n.x-64} y={n.y-24} width="128" height="48" rx="10"
                      fill="white" stroke={t.stroke} strokeWidth={hovered?2.5:1.2}
                      className={hovered?"drop-shadow-lg":""}/>
                    <foreignObject x={n.x-56} y={n.y-16} width="24" height="24">
                      <div className={`w-6 h-6 rounded-md ${t.bg} ${t.text} grid place-items-center`}>
                        <Icon className="w-3.5 h-3.5"/>
                      </div>
                    </foreignObject>
                    <text x={n.x-26} y={n.y-2} className="fill-slate-900 text-[10px] font-semibold">{n.label}</text>
                    {n.sub && <text x={n.x-26} y={n.y+11} className="fill-slate-500 text-[9px]">{n.sub}</text>}
                    {hovered && (
                      <circle cx={n.x} cy={n.y} r="34" fill="none" stroke={t.stroke} strokeWidth="1" opacity="0.4">
                        <animate attributeName="r" values="30;38;30" dur="1.6s" repeatCount="indefinite"/>
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hovered && (
              <div className="absolute top-3 left-3 p-3 rounded-xl bg-white/95 backdrop-blur border border-slate-200 shadow-lg text-xs w-56 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${T[hovered.tone].dot}`}/>
                  <span className="font-semibold">{hovered.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="text-slate-500">Type</div><div className="tabular-nums">{hovered.type}</div>
                  <div className="text-slate-500">Confidence</div><div className={`tabular-nums ${T[hovered.tone].text}`}>{hovered.conf.toFixed(2)}</div>
                  <div className="text-slate-500">Freshness</div><div className="tabular-nums">{hovered.fresh}</div>
                  <div className="text-slate-500">Relationships</div><div className="tabular-nums">{edges.filter(e=>e.s===hovered.id||e.t===hovered.id).length}</div>
                </div>
              </div>
            )}
            {/* Legend */}
            <div className="absolute bottom-2 left-3 flex items-center gap-4 text-[10px] text-slate-500 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-100">
              {Object.entries(edgeStyle).map(([k,v])=>(
                <span key={k} className="flex items-center gap-1.5">
                  <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke={v.color} strokeWidth="1.8" strokeDasharray={v.dash}/></svg>
                  {v.label} Relationships
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-sm mb-3">Context Summary</h3>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              {[
                ["Total Entities","1,842"],["Total Relationships","7,654"],
                ["Connected Components","14"],["Orphan Entities","18 (1.0%)"],
                ["Average Degree","4.16"],["Graph Density","0.0024"],
                ["Lineage Coverage","98.4%"],["Version","v4.2.1"],
                ["Last Refreshed","10:30 AM"],["Consumers","32"],
              ].map(([l,v])=>(
                <div key={l} className="flex justify-between border-b border-slate-100 py-1.5">
                  <span className="text-slate-500">{l}</span><span className="font-medium tabular-nums">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Entity Types in Context</h3>
              <span className="text-[10px] text-slate-400">1,842 entities</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Donut data={entityTypes.map(e=>({l:e.l,p:e.p,tone:e.tone}))}/>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="text-lg font-semibold tabular-nums">1,842</div>
                    <div className="text-[9px] text-slate-500">Entities</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1.5 text-xs">
                {entityTypes.map(e=>(
                  <button key={e.l} onClick={()=>open(e.l,"Entity type")} className="w-full flex items-center justify-between hover:bg-slate-50 p-1 rounded">
                    <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${T[e.tone].dot}`}/>{e.l}</span>
                    <span className="tabular-nums text-slate-600">{e.c} <span className="text-slate-400">({e.p}%)</span></span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap + Confidence */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Freshness Heatmap (P95)</h3>
            <span className="text-[10px] text-slate-400">Hover to reveal affected entities</span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {freshBuckets.map(b=>{
              const t=T[b.tone];
              return (
                <button key={b.l} onClick={()=>open(b.l,"Freshness bucket")}
                  className={`p-4 rounded-xl ${t.bg} border ${t.border} hover:shadow-md transition text-center`}>
                  <div className="text-[10px] text-slate-500">{b.l}</div>
                  <div className={`text-2xl font-semibold tabular-nums ${t.text} mt-1`}>{b.p}%</div>
                  <div className="mt-2 h-1 rounded-full bg-white/60 overflow-hidden">
                    <div className={`h-full ${t.bar} animate-pulse`} style={{width:`${b.p*2}%`}}/>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-sm mb-3">Confidence Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Donut data={confDist} size={120}/>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-lg font-semibold tabular-nums">0.91</div>
                  <div className="text-[9px] text-slate-500">Average</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 text-xs">
              {confDist.map(c=>(
                <div key={c.l} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${T[c.tone].dot}`}/>{c.l}</span>
                  <span className="tabular-nums text-slate-600">{c.p}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Joins / Vectors / Gaps / Payload */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-sm">Relational Joins Available (Top)</h3>
            <p className="text-[11px] text-slate-500">Multi-hop join paths ranked by usage and confidence.</p>
          </div>
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>{["Join Path","Type","Ent","Used","Conf","Fresh"].map(h=><th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {joins.map(j=>(
                <tr key={j.path} onClick={()=>open(j.path,"Relational Join")} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <td className="px-3 py-2 font-medium">{j.path}</td>
                  <td className="px-3 py-2 text-slate-500">{j.type}</td>
                  <td className="px-3 py-2 tabular-nums">{j.ent}</td>
                  <td className="px-3 py-2 tabular-nums text-slate-500">{j.used}</td>
                  <td className="px-3 py-2 tabular-nums text-emerald-600 font-semibold">{j.conf.toFixed(2)}</td>
                  <td className="px-3 py-2 tabular-nums">{j.fresh}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="w-full text-xs text-blue-600 hover:text-blue-700 py-2 flex items-center justify-center gap-1">View All Joins <ArrowRight className="w-3 h-3"/></button>
        </div>

        <div className="col-span-12 xl:col-span-4 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-sm">Vector Candidates (Semantic Search)</h3>
            <p className="text-[11px] text-slate-500">Top embedding candidates ranked by similarity.</p>
          </div>
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>{["Entity / Chunk","Type","Sim","Source"].map(h=><th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {vectors.map(v=>(
                <tr key={v.entity} onClick={()=>open(v.entity,"Semantic Candidate")} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <td className="px-3 py-2 font-medium">{v.entity}</td>
                  <td className="px-3 py-2 text-slate-500">{v.type}</td>
                  <td className="px-3 py-2 tabular-nums text-emerald-600 font-semibold">{v.sim.toFixed(2)}</td>
                  <td className="px-3 py-2 text-slate-500">{v.fresh}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="w-full text-xs text-blue-600 hover:text-blue-700 py-2 flex items-center justify-center gap-1">View All Candidates <ArrowRight className="w-3 h-3"/></button>
        </div>

        <div className="col-span-12 xl:col-span-4 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-sm">Unresolved Gaps</h3>
            <p className="text-[11px] text-slate-500">Missing metadata or relationships blocking full context.</p>
          </div>
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>{["Gap","Impact","Ent","Reason"].map(h=><th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {gaps.map(g=>{
                const t=T[g.tone];
                return (
                  <tr key={g.gap} onClick={()=>open(g.gap,"Context Gap")} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <td className="px-3 py-2 font-medium">{g.gap}</td>
                    <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded ${t.bg} ${t.text} text-[10px] font-semibold`}>{g.impact}</span></td>
                    <td className="px-3 py-2 tabular-nums">{g.ent}</td>
                    <td className="px-3 py-2 text-slate-500">{g.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button className="w-full text-xs text-blue-600 hover:text-blue-700 py-2 flex items-center justify-center gap-1">View All Gaps <ArrowRight className="w-3 h-3"/></button>
        </div>
      </div>

      {/* AI Payload Viewer */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm text-white">Agentic Query Handoff Payload (Sample)</h3>
              <p className="text-[11px] text-slate-400">Live-assembled context package delivered to the agent runtime.</p>
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>streaming</span>
          </div>
          <pre className="text-[11px] leading-relaxed font-mono overflow-x-auto">
{`{
  "query_id": "q_12345",
  "intent": "Investigate blocked connection to Salesforce",
  "context_graph": {
    "entities": 24,
    "relationships": 68,
    "confidence": 0.93,
    "freshness_p95": "2.1 min"
  },
  "available_joins": 5,
  "vector_candidates": 10,
  "unresolved_gaps": 3,
  "lineage": { "coverage": 0.984, "sources": 12 },
  "operational_metadata": {
    "owner": "SecOps",
    "criticality": "Tier 1",
    "consumers": ["SIEM Agent", "SOAR", "Analyst Copilot"]
  },
  "handoff_timestamp": "2026-05-12T10:30:22Z"
}`}
          </pre>
        </div>

        <div className="col-span-12 xl:col-span-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-sm mb-3">Trust & Transparency</h3>
          <div className="space-y-2 text-xs">
            {[
              "All data lineage captured",
              "Confidence & freshness included",
              "Unresolved gaps surfaced",
              "Ready for agent execution",
              "Deterministic packaging",
              "Every stage explainable",
            ].map(x=>(
              <div key={x} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/>
                <span className="font-medium">{x}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engineering Transparency Zone */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white grid place-items-center"><Brain className="w-4 h-4"/></div>
          <div>
            <h2 className="text-lg font-semibold">How the Context Intelligence Engine Builds AI Context</h2>
            <p className="text-xs text-slate-500">Engineering assembles trusted operational context through deterministic, explainable stages.</p>
          </div>
        </div>

        {/* Assembly Pipeline */}
        <div className="grid grid-cols-11 gap-2 mb-6">
          {assemblyPipeline.map((s,i)=>{
            const Icon=s.icon;
            return (
              <button key={s.label} onClick={()=>open(s.label,"Assembly stage")}
                className="p-3 rounded-xl bg-white border border-slate-200 hover:shadow-md transition relative">
                <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-700 grid place-items-center"><Icon className="w-3.5 h-3.5"/></div>
                <div className="text-[10px] font-medium mt-2 leading-tight">{s.label}</div>
                {i<assemblyPipeline.length-1 && <ArrowRight className="w-3 h-3 text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2 bg-slate-50"/>}
                <span className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden rounded-b-xl bg-violet-100/60">
                  <span className="absolute h-full w-6 bg-violet-500" style={{animation:`slide 2.4s ${i*0.15}s linear infinite`}}/>
                </span>
              </button>
            );
          })}
        </div>
        <style>{`@keyframes slide { from { transform: translateX(-24px); } to { transform: translateX(120px); } }`}</style>

        <div className="grid grid-cols-3 gap-4">
          {/* AI Context Builder */}
          <div className="col-span-2 p-4 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">AI Context Builder</h3>
              <span className="text-[10px] text-slate-400">Stage latency · confidence · freshness</span>
            </div>
            <div className="space-y-2">
              {[
                { l:"Canonical Model",       lat:"32ms", conf:0.96, fresh:"1.1 min", tone:"blue"    as Tone },
                { l:"Relationship Graph",    lat:"64ms", conf:0.93, fresh:"1.4 min", tone:"violet"  as Tone },
                { l:"SQL Join Layer",        lat:"88ms", conf:0.94, fresh:"1.8 min", tone:"blue"    as Tone },
                { l:"Graph Traversal",       lat:"142ms",conf:0.90, fresh:"2.0 min", tone:"violet"  as Tone },
                { l:"Semantic Search",       lat:"118ms",conf:0.88, fresh:"2.6 min", tone:"teal"    as Tone },
                { l:"Vector Candidates",     lat:"52ms", conf:0.87, fresh:"2.4 min", tone:"teal"    as Tone },
                { l:"Freshness Validation",  lat:"18ms", conf:0.99, fresh:"real-time",tone:"emerald" as Tone },
                { l:"Confidence Engine",     lat:"22ms", conf:0.91, fresh:"real-time",tone:"emerald" as Tone },
                { l:"Context Package",       lat:"41ms", conf:0.93, fresh:"1.9 min", tone:"orange"  as Tone },
                { l:"Agent Runtime",         lat:"96ms", conf:0.94, fresh:"live",     tone:"emerald" as Tone },
              ].map(s=>{
                const t=T[s.tone];
                return (
                  <button key={s.l} onClick={()=>open(s.l,"Context builder stage")} className="w-full text-left group">
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-medium flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${t.dot}`}/>{s.l}</span>
                      <span className="tabular-nums text-slate-500">{s.lat} · conf {s.conf} · {s.fresh}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${t.bar} transition-all`} style={{width:`${s.conf*100}%`}}/>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Agent Handoff Simulation */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Live Agent Handoff</h3>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>streaming</span>
            </div>
            <div className="space-y-1.5 mb-3">
              {handoffStages.map((s,i)=>{
                const Icon=s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-2 p-1.5 rounded-md bg-slate-800/60 border border-slate-700 text-[11px]">
                    <div className="w-5 h-5 rounded bg-slate-700 grid place-items-center"><Icon className="w-3 h-3"/></div>
                    <span className="flex-1">{s.label}</span>
                    <span className="text-emerald-400 tabular-nums">{40+i*18}ms</span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {[
                ["Entities","24"],["Relationships","68"],["Freshness","2.1m"],["Confidence","0.93"],
                ["Token Size","3,214"],["Context Size","18 KB"],["Workers","12"],["Latency","1.18s"],
              ].map(([l,v])=>(
                <div key={l} className="p-1.5 rounded bg-slate-800/60 border border-slate-700">
                  <div className="text-slate-400">{l}</div>
                  <div className="tabular-nums font-semibold text-white">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Context Packaging */}
        <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Context Packaging Engine</h3>
            <span className="text-[10px] text-slate-500">Deterministic assembly · every field explainable</span>
          </div>
          <div className="grid grid-cols-10 gap-2">
            {[
              { l:"Operational Entity", icon:Boxes,    tone:"blue"    as Tone },
              { l:"Metadata",           icon:FileJson, tone:"blue"    as Tone },
              { l:"Relationships",      icon:GitBranch,tone:"violet"  as Tone },
              { l:"Lineage",            icon:Link2,    tone:"violet"  as Tone },
              { l:"Confidence",         icon:BadgeCheck,tone:"emerald" as Tone },
              { l:"Freshness",          icon:RefreshCw,tone:"teal"    as Tone },
              { l:"SQL Context",        icon:Database, tone:"blue"    as Tone },
              { l:"Graph Context",      icon:Network,  tone:"violet"  as Tone },
              { l:"Semantic Context",   icon:Search,   tone:"teal"    as Tone },
              { l:"Agent Package",      icon:Sparkles, tone:"orange"  as Tone },
            ].map((s,i,arr)=>{
              const t=T[s.tone]; const Icon=s.icon;
              return (
                <button key={s.l} onClick={()=>open(s.l,"Packaging step")}
                  className={`p-3 rounded-xl bg-white border ${t.border} hover:shadow-md transition relative`}>
                  <div className={`w-7 h-7 rounded-lg ${t.bg} ${t.text} grid place-items-center`}><Icon className="w-3.5 h-3.5"/></div>
                  <div className="text-[10px] font-medium mt-2 leading-tight">{s.l}</div>
                  {i<arr.length-1 && <ArrowRight className="w-3 h-3 text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2 bg-white"/>}
                </button>
              );
            })}
          </div>
        </div>

        {/* How this powers agentic workflows */}
        <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">How This Powers Agentic Workflows</h3>
            <span className="text-[10px] text-slate-400">Intent → Context → Retrieval → Gaps → Handoff → Action</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {workflow.map((w,i,arr)=>{
              const Icon=w.icon;
              return (
                <div key={w.n} className="p-3 rounded-xl border border-slate-200 relative">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 grid place-items-center"><Icon className="w-4 h-4"/></div>
                  <div className="text-[11px] font-semibold mt-2">{w.n}. {w.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{w.sub}</div>
                  {i<arr.length-1 && <ArrowRight className="w-3 h-3 text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2 bg-white"/>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Operational Widgets */}
      <section className="grid grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { l:"Graph Growth",           v:"+554/24h", tone:"violet"  as Tone, spark:[6800,6950,7100,7280,7440,7560,7654] },
          { l:"Top Consumers",          v:"32 agents",tone:"blue"    as Tone, spark:[24,26,27,29,30,31,32] },
          { l:"KG Health",              v:"0.94",     tone:"emerald" as Tone, spark:[0.88,0.89,0.9,0.91,0.92,0.93,0.94] },
          { l:"Context Packages",       v:"18,412",   tone:"orange"  as Tone, spark:[15000,15800,16600,17200,17800,18200,18412] },
          { l:"Recent AI Requests",     v:"612/min",  tone:"teal"    as Tone, spark:[520,540,560,580,595,605,612] },
          { l:"Context Evolution",      v:"v4.2.1",   tone:"blue"    as Tone, spark:[1,2,3,4,5,6,7] },
          { l:"Version Timeline",       v:"14 rel",   tone:"violet"  as Tone, spark:[8,9,10,11,12,13,14] },
          { l:"Relationship Growth",    v:"+7.8%",    tone:"emerald" as Tone, spark:[6800,6950,7100,7280,7440,7560,7654] },
          { l:"Payload P95 Size",       v:"22 KB",    tone:"orange"  as Tone, spark:[26,25,24,23,22.5,22.2,22] },
          { l:"Traversals/sec",         v:"41,209",   tone:"violet"  as Tone, spark:[36,37,38,39,40,40.6,41.2] },
          { l:"Embedding Cache Hit",    v:"82.4%",    tone:"emerald" as Tone, spark:[74,76,78,80,81,82,82.4] },
          { l:"Handoff Success",        v:"97.8%",    tone:"emerald" as Tone, spark:[95,95.4,96,96.6,97.1,97.5,97.8] },
        ].map(w=>{
          const t=T[w.tone];
          return (
            <button key={w.l} onClick={()=>open(w.l,"Operational widget")}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition text-left">
              <div className="text-[11px] text-slate-500">{w.l}</div>
              <div className="flex items-end justify-between mt-1">
                <div className="text-lg font-semibold tabular-nums">{w.v}</div>
                <Spark data={w.spark} color={t.stroke}/>
              </div>
            </button>
          );
        })}
      </section>

      {/* Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in" onClick={()=>setDrawer(null)}>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"/>
          <div onClick={e=>e.stopPropagation()} className="relative w-[580px] h-full bg-white border-l border-slate-200 shadow-2xl overflow-y-auto animate-slide-in-right">
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
                  className={`px-3 py-2 text-xs rounded-t-lg capitalize border-b-2 -mb-px transition ${tab===t?"border-violet-500 text-violet-700 bg-violet-50/50":"border-transparent text-slate-500 hover:text-slate-700"}`}>{t}</button>
              ))}
            </div>
            <div className="p-5 space-y-4 text-sm">
              {tab==="overview" && (
                <>
                  <p className="text-slate-600 leading-relaxed">This element is part of the final handoff layer that packages trusted operational context for AI agents. It contributes to explainability, freshness guarantees, and confidence-scored retrieval.</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-slate-400 text-[10px]">Operational Purpose</div><div className="font-medium mt-0.5">AI-ready context</div></div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-slate-400 text-[10px]">Criticality</div><div className="font-medium mt-0.5">Tier 1 · SLO gated</div></div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-slate-400 text-[10px]">Consumers</div><div className="font-medium mt-0.5">SIEM · SOAR · Copilots</div></div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200"><div className="text-slate-400 text-[10px]">Use Cases</div><div className="font-medium mt-0.5">Investigation · Automation</div></div>
                  </div>
                </>
              )}
              {tab==="engineering" && (
                <div className="space-y-2">
                  {["Context builder","Graph traversal","Relationship selection","Join engine","Semantic retrieval","Vector preparation","Confidence engine","Freshness validation","Gap detection","Context packaging","AI runtime handoff"].map((e,i)=>(
                    <div key={e} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 rounded-md bg-white text-violet-600 grid place-items-center text-[10px] font-semibold">{i+1}</div>
                      <div className="text-xs font-medium">{e}</div>
                      <div className="ml-auto text-[10px] text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>active</div>
                    </div>
                  ))}
                </div>
              )}
              {tab==="telemetry" && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["Context packages/sec","612"],["Graph traversals/sec","41,209"],
                    ["Join latency P95","88ms"],["Embedding latency P95","118ms"],
                    ["Vector search latency","52ms"],["Freshness P95","2.7 min"],
                    ["Confidence avg","0.91"],["CPU","46%"],
                    ["Memory","52%"],["Workers","12/16"],
                    ["Queue depth","14"],["Failures","3"],
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
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-teal-50 border border-violet-200">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Simulated Payload Size</div>
                    <div className="text-3xl font-semibold tabular-nums text-violet-700">{simPayloadSize} KB</div>
                    <div className="text-[11px] text-slate-500">Live estimate · adjust parameters below</div>
                  </div>
                  {[
                    { l:"Confidence Threshold", v:confThresh, min:0.5, max:1,  step:0.01, set:setConfThresh, fmt:(v:number)=>v.toFixed(2) },
                    { l:"Freshness SLA (min)",  v:freshSla,   min:1,   max:15, step:1,    set:setFreshSla,   fmt:(v:number)=>`${v} min` },
                    { l:"Graph Depth (hops)",   v:graphDepth, min:1,   max:6,  step:1,    set:setGraphDepth, fmt:(v:number)=>`${v} hops` },
                  ].map(s=>(
                    <div key={s.l}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">{s.l}</span>
                        <span className="tabular-nums text-slate-500">{s.fmt(s.v)}</span>
                      </div>
                      <input type="range" min={s.min} max={s.max} step={s.step} value={s.v}
                        onChange={e=>s.set(Number(e.target.value))} className="w-full accent-violet-600"/>
                    </div>
                  ))}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                    Effect: increasing depth grows the payload; tightening confidence and freshness increases precision but may shrink candidate coverage.
                  </div>
                </div>
              )}
              {tab==="dependencies" && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["Canonical Model","Relationship Builder","Knowledge Graph","Hydration","Lineage","Validation","Vector Store","Embedding Service","AI Models","Operational APIs","Dashboards","Consumers"].map(d=>(
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
