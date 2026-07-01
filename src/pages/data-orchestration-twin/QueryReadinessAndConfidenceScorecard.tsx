import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, BadgeCheck, Boxes, Brain, Check,
  CheckCircle2, ChevronRight, Cpu, Database, Download, Filter, Gauge,
  GitBranch, Layers, Link2, RefreshCw, Search, Shield, ShieldCheck,
  Sparkles, TrendingUp, X, Zap, PlayCircle, Clock, FileCheck2,
} from "lucide-react";

type Tone = "blue"|"emerald"|"amber"|"rose"|"violet"|"teal"|"orange";
const T: Record<Tone,{text:string;bg:string;ring:string;dot:string;border:string;stroke:string;bar:string}> = {
  blue:    { text:"text-blue-700",    bg:"bg-blue-50",    ring:"ring-blue-200",    dot:"bg-blue-500",    border:"border-blue-200",    stroke:"#3b82f6", bar:"bg-blue-500" },
  emerald: { text:"text-emerald-700", bg:"bg-emerald-50", ring:"ring-emerald-200", dot:"bg-emerald-500", border:"border-emerald-200", stroke:"#10b981", bar:"bg-emerald-500" },
  amber:   { text:"text-amber-700",   bg:"bg-amber-50",   ring:"ring-amber-200",   dot:"bg-amber-500",   border:"border-amber-200",   stroke:"#f59e0b", bar:"bg-amber-500" },
  rose:    { text:"text-rose-700",    bg:"bg-rose-50",    ring:"ring-rose-200",    dot:"bg-rose-500",    border:"border-rose-200",    stroke:"#f43f5e", bar:"bg-rose-500" },
  violet:  { text:"text-violet-700",  bg:"bg-violet-50",  ring:"ring-violet-200",  dot:"bg-violet-500",  border:"border-violet-200",  stroke:"#8b5cf6", bar:"bg-violet-500" },
  teal:    { text:"text-teal-700",    bg:"bg-teal-50",    ring:"ring-teal-200",    dot:"bg-teal-500",    border:"border-teal-200",    stroke:"#14b8a6", bar:"bg-teal-500" },
  orange:  { text:"text-orange-700",  bg:"bg-orange-50",  ring:"ring-orange-200",  dot:"bg-orange-500",  border:"border-orange-200",  stroke:"#f97316", bar:"bg-orange-500" },
};

const kpis: {label:string;value:string;sub:string;tone:Tone;icon:any;spark:number[];trend:string}[] = [
  { label:"Overall Readiness Score",  value:"0.86",   sub:"Ready · Target ≥ 0.85", tone:"emerald", icon:ShieldCheck, spark:[.78,.79,.81,.83,.84,.85,.86].map(v=>v*100), trend:"+0.08 vs 7D" },
  { label:"Production Ready Datasets",value:"142/168",sub:"84.5% · Target ≥ 85%",  tone:"blue",    icon:Database,    spark:[128,131,135,138,140,141,142], trend:"+14 vs 7D" },
  { label:"High Confidence Sources",  value:"118",    sub:"70.2% · Target ≥ 70%",  tone:"emerald", icon:BadgeCheck,  spark:[104,108,112,114,116,117,118], trend:"+8" },
  { label:"Sources Fully Onboarded",  value:"45/52",  sub:"86.5% · Target ≥ 90%",  tone:"amber",   icon:Boxes,       spark:[38,40,41,43,44,44,45], trend:"+3" },
  { label:"Query Success Rate",       value:"97.8%",  sub:"7D · Target ≥ 95%",     tone:"emerald", icon:CheckCircle2,spark:[95,95.4,96,96.6,97.1,97.5,97.8], trend:"+2.3%" },
  { label:"Avg Query Latency",        value:"1.42s",  sub:"↓ 12.4% vs prior 7D",   tone:"violet",  icon:Activity,    spark:[1.9,1.82,1.7,1.61,1.55,1.48,1.42].map(v=>v*10), trend:"-12.4%" },
  { label:"Refresh SLA Compliance",   value:"98.6%",  sub:"Target ≥ 98%",          tone:"teal",    icon:RefreshCw,   spark:[97,97.2,97.6,98,98.2,98.4,98.6], trend:"+1.4%" },
  { label:"Critical Readiness Issues",value:"6",      sub:"↓ 3 vs prior 7D",       tone:"rose",    icon:AlertTriangle,spark:[12,11,10,9,8,7,6], trend:"-3" },
];

type Dataset = {
  id:string; source:string; dataset:string; overall:number;
  completeness:number; freshness:number; schema:number; rel:number;
  hydration:number; lineage:number; reliability:number; performance:number; opConf:number;
  trend:"up"|"down"|"flat"; updated:string; owner:string;
};
const datasets: Dataset[] = [
  { id:"panw-ngfw",  source:"PANW NGFW",     dataset:"Firewall Traffic",   overall:0.94, completeness:0.96, freshness:0.95, schema:0.92, rel:0.90, hydration:0.93, lineage:0.94, reliability:0.98, performance:0.90, opConf:0.95, trend:"up",   updated:"10:15 AM", owner:"SecOps" },
  { id:"panw-pano",  source:"PANW Panorama", dataset:"Threat Logs",        overall:0.89, completeness:0.91, freshness:0.88, schema:0.87, rel:0.85, hydration:0.90, lineage:0.89, reliability:0.93, performance:0.88, opConf:0.90, trend:"up",   updated:"10:10 AM", owner:"SecOps" },
  { id:"panw-wf",    source:"PANW WildFire", dataset:"File Verdicts",      overall:0.91, completeness:0.93, freshness:0.92, schema:0.90, rel:0.88, hydration:0.92, lineage:0.91, reliability:0.95, performance:0.86, opConf:0.92, trend:"up",   updated:"10:12 AM", owner:"SecEng" },
  { id:"okta",       source:"Okta",          dataset:"Authentication",     overall:0.82, completeness:0.85, freshness:0.79, schema:0.83, rel:0.80, hydration:0.85, lineage:0.82, reliability:0.88, performance:0.74, opConf:0.83, trend:"up",   updated:"10:05 AM", owner:"IAM" },
  { id:"cloudtrail", source:"AWS CloudTrail",dataset:"API Activity",       overall:0.78, completeness:0.81, freshness:0.75, schema:0.72, rel:0.72, hydration:0.80, lineage:0.78, reliability:0.90, performance:0.60, opConf:0.76, trend:"down", updated:"10:08 AM", owner:"CloudOps" },
  { id:"dns",        source:"DNS Logs",      dataset:"DNS Queries",        overall:0.75, completeness:0.76, freshness:0.72, schema:0.72, rel:0.70, hydration:0.78, lineage:0.74, reliability:0.85, performance:0.55, opConf:0.73, trend:"down", updated:"10:02 AM", owner:"NetOps" },
  { id:"vpn",        source:"VPN Logs",      dataset:"VPN Sessions",       overall:0.69, completeness:0.70, freshness:0.65, schema:0.71, rel:0.62, hydration:0.73, lineage:0.68, reliability:0.82, performance:0.50, opConf:0.68, trend:"down", updated:"09:58 AM", owner:"NetOps" },
  { id:"k8s",        source:"K8s Audit",     dataset:"Kubernetes Events",  overall:0.72, completeness:0.74, freshness:0.68, schema:0.70, rel:0.66, hydration:0.75, lineage:0.72, reliability:0.84, performance:0.48, opConf:0.71, trend:"down", updated:"09:55 AM", owner:"Platform" },
];

const weightsDefault = [
  { key:"completeness",  label:"Completeness",         weight:20, tone:"emerald" as Tone },
  { key:"freshness",     label:"Freshness",            weight:15, tone:"blue"    as Tone },
  { key:"schema",        label:"Schema Fitness",       weight:15, tone:"violet"  as Tone },
  { key:"rel",           label:"Relationship Coverage",weight:15, tone:"orange"  as Tone },
  { key:"hydration",     label:"Hydration Confidence", weight:10, tone:"teal"    as Tone },
  { key:"lineage",       label:"Lineage Integrity",    weight:10, tone:"blue"    as Tone },
  { key:"reliability",   label:"Source Reliability",   weight: 5, tone:"emerald" as Tone },
  { key:"performance",   label:"Query Performance",    weight: 5, tone:"violet"  as Tone },
  { key:"governance",    label:"Governance",           weight: 5, tone:"amber"   as Tone },
  { key:"opConf",        label:"Operational Confidence",weight:5, tone:"teal"    as Tone },
];

const distribution = [
  { label:"Excellent (0.90 – 1.00)", count:60, pct:35.7, tone:"emerald" as Tone },
  { label:"Good (0.75 – 0.90)",      count:72, pct:42.9, tone:"blue"    as Tone },
  { label:"Fair (0.50 – 0.75)",      count:24, pct:14.3, tone:"amber"   as Tone },
  { label:"Needs Work (< 0.50)",     count:12, pct: 7.1, tone:"rose"    as Tone },
];

const topIssues = [
  { label:"Low Completeness",         count:18, impact:"High",   trend:"up",   tone:"rose"    as Tone },
  { label:"Stale Data",               count:14, impact:"High",   trend:"up",   tone:"rose"    as Tone },
  { label:"Missing Relationships",    count:11, impact:"Medium", trend:"up",   tone:"amber"   as Tone },
  { label:"Schema Drift",             count: 9, impact:"Medium", trend:"flat", tone:"amber"   as Tone },
  { label:"Low Hydration Confidence", count: 7, impact:"Medium", trend:"up",   tone:"amber"   as Tone },
  { label:"High Null Rate",           count: 6, impact:"Low",    trend:"down", tone:"emerald" as Tone },
];

const pipelineStages = [
  { icon:Database,    label:"Incoming Dataset" },
  { icon:CheckCircle2,label:"Quality Engine" },
  { icon:FileCheck2,  label:"Schema Validation" },
  { icon:Sparkles,    label:"Hydration Validation" },
  { icon:Link2,       label:"Relationship Validation" },
  { icon:Layers,      label:"Canonical Validation" },
  { icon:GitBranch,   label:"Lineage Validation" },
  { icon:Clock,       label:"Freshness Validation" },
  { icon:Activity,    label:"Performance Validation" },
  { icon:Shield,      label:"Governance Validation" },
  { icon:Gauge,       label:"Confidence Engine" },
  { icon:ShieldCheck, label:"Composite Readiness" },
  { icon:Brain,       label:"AI Approval" },
  { icon:Boxes,       label:"Operational Consumers" },
];

const outcomes = [
  { label:"AI Agents",             eligible:118, blocked:12, tone:"violet"  as Tone, icon:Brain },
  { label:"Knowledge Graph",       eligible:142, blocked: 8, tone:"blue"    as Tone, icon:GitBranch },
  { label:"Operational Dashboards",eligible:156, blocked: 4, tone:"emerald" as Tone, icon:Gauge },
  { label:"Automation",            eligible:104, blocked:18, tone:"orange"  as Tone, icon:Zap },
  { label:"Digital Twins",         eligible: 88, blocked:22, tone:"teal"    as Tone, icon:Layers },
  { label:"Runbooks",              eligible:132, blocked: 6, tone:"blue"    as Tone, icon:FileCheck2 },
  { label:"Reporting",             eligible:160, blocked: 2, tone:"emerald" as Tone, icon:Database },
  { label:"Graph Queries",         eligible:126, blocked:10, tone:"violet"  as Tone, icon:Search },
];

/* ---------------- atoms ---------------- */
function Spark({values,tone}:{values:number[];tone:Tone}){
  const max=Math.max(...values),min=Math.min(...values); const w=90,h=24;
  const pts=values.map((v,i)=>{
    const x=(i/(values.length-1))*w;
    const y=h-((v-min)/Math.max(0.0001,max-min))*h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return <svg width={w} height={h} className="overflow-visible"><polyline points={pts} fill="none" strokeWidth={1.5} className={T[tone].text} stroke="currentColor"/></svg>;
}

function scoreTone(v:number):Tone{ return v>=0.9?"emerald":v>=0.75?"blue":v>=0.5?"amber":"rose"; }
function scoreCell(v:number){
  const t=T[scoreTone(v)];
  return <span className={`inline-block px-1.5 py-0.5 rounded font-semibold tabular-nums ${t.bg} ${t.text} ring-1 ${t.ring}`}>{v.toFixed(2)}</span>;
}

/* ---------------- page ---------------- */
export default function QueryReadinessAndConfidenceScorecard(){
  const [selected,setSelected] = useState<Dataset>(datasets[0]);
  const [drawer,setDrawer] = useState<null|{kind:"dataset";d:Dataset}|{kind:"kpi";label:string}|{kind:"stage";label:string}|{kind:"outcome";label:string}>(null);
  const [drawerTab,setDrawerTab] = useState<"overview"|"engineering"|"telemetry"|"simulation"|"dependencies">("overview");
  const [q,setQ] = useState("");
  const [weights,setWeights] = useState(weightsDefault.map(w=>w.weight));
  const [simThreshold,setSimThreshold] = useState(0.85);

  const filtered = useMemo(()=>datasets.filter(d=>
    (d.source+d.dataset+d.owner).toLowerCase().includes(q.toLowerCase())
  ),[q]);

  const composite = useMemo(()=>{
    const total = weights.reduce((a,b)=>a+b,0) || 1;
    return datasets.map(d => {
      const vals=[d.completeness,d.freshness,d.schema,d.rel,d.hydration,d.lineage,d.reliability,d.performance,d.opConf,d.opConf];
      const s = vals.reduce((acc,v,i)=>acc + v*weights[i], 0)/total;
      return { id:d.id, score:s };
    });
  },[weights]);
  const compositeAvg = composite.reduce((a,c)=>a+c.score,0)/composite.length;
  const aiEligible = composite.filter(c=>c.score>=simThreshold).length;

  return (
    <div className="p-6 space-y-6 bg-white">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Query Readiness &amp; Confidence Scorecard</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold ring-1 ring-emerald-200"><BadgeCheck className="h-3 w-3"/>Production</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">v4.2</span>
          </div>
          <p className="mt-1 text-slate-600 text-sm max-w-3xl">
            Continuously determine whether operational data is trusted enough for AI, graph intelligence, automation, analytics, and operational decision making.
          </p>
          <p className="mt-1 text-slate-500 text-xs max-w-3xl">
            The Query Readiness Engine evaluates quality, completeness, freshness, relationships, lineage, confidence, performance, governance, and reliability to produce deterministic readiness scores. <span className="text-slate-700 font-medium">AI never consumes raw data — AI consumes engineered operational truth.</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 mr-1">Last Updated <span className="text-slate-800 font-medium">May 12, 2025 10:32 AM</span></div>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><Filter className="h-3.5 w-3.5"/>Filters</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><Gauge className="h-3.5 w-3.5"/>Weights</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><Shield className="h-3.5 w-3.5"/>Readiness Policies</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><Brain className="h-3.5 w-3.5"/>AI Readiness Explorer</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-700"><Download className="h-3.5 w-3.5"/>Export Scorecard</button>
        </div>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map(k=>{
          const t=T[k.tone]; const Icon=k.icon;
          return (
            <button key={k.label} onClick={()=>{setDrawer({kind:"kpi",label:k.label}); setDrawerTab("overview");}}
              className="text-left rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
              <div className="flex items-start justify-between">
                <div className={`h-8 w-8 rounded-lg grid place-items-center ${t.bg} ${t.text}`}><Icon className="h-4 w-4"/></div>
                <Spark values={k.spark} tone={k.tone}/>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 leading-tight">{k.label}</div>
              <div className="mt-0.5 text-xl font-bold text-slate-900 tabular-nums">{k.value}</div>
              <div className={`mt-0.5 text-[10px] font-medium ${t.text}`}>{k.sub} · {k.trend}</div>
            </button>
          );
        })}
      </section>

      {/* Registry + right rail */}
      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-9 space-y-4">

          {/* Readiness registry */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2 gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-900">Enterprise Readiness Registry</div>
                <div className="text-[11px] text-slate-500">Composite readiness · component scores · trend · click any row to inspect</div>
              </div>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search source, dataset, owner..."
                  className="pl-7 pr-2 py-1.5 text-xs rounded-md border border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 outline-none w-72"/>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-2">Source</th>
                    <th className="py-2 pr-2">Dataset</th>
                    <th className="py-2 pr-2 text-center">Overall</th>
                    <th className="py-2 pr-2 text-center">Comp.</th>
                    <th className="py-2 pr-2 text-center">Fresh.</th>
                    <th className="py-2 pr-2 text-center">Schema</th>
                    <th className="py-2 pr-2 text-center">Rel. Cov.</th>
                    <th className="py-2 pr-2 text-center">Hydration</th>
                    <th className="py-2 pr-2 text-center">Lineage</th>
                    <th className="py-2 pr-2 text-center">Reliability</th>
                    <th className="py-2 pr-2 text-center">Query Perf.</th>
                    <th className="py-2 pr-2 text-center">Op. Conf.</th>
                    <th className="py-2 pr-2">Trend</th>
                    <th className="py-2 pr-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d=>{
                    const trendClr = d.trend==="up"?"text-emerald-600":d.trend==="down"?"text-rose-600":"text-slate-400";
                    return (
                      <tr key={d.id} onClick={()=>{setSelected(d); setDrawer({kind:"dataset",d}); setDrawerTab("overview");}}
                        className={`border-b border-slate-100 hover:bg-slate-50/60 cursor-pointer ${selected.id===d.id?"bg-indigo-50/30":""}`}>
                        <td className="py-2 pr-2 font-semibold text-slate-900">{d.source}</td>
                        <td className="py-2 pr-2 text-slate-600">{d.dataset}</td>
                        <td className="py-2 pr-2 text-center">{scoreCell(d.overall)}</td>
                        <td className="py-2 pr-2 text-center tabular-nums text-slate-700">{d.completeness.toFixed(2)}</td>
                        <td className="py-2 pr-2 text-center tabular-nums text-slate-700">{d.freshness.toFixed(2)}</td>
                        <td className="py-2 pr-2 text-center tabular-nums text-slate-700">{d.schema.toFixed(2)}</td>
                        <td className="py-2 pr-2 text-center tabular-nums text-slate-700">{d.rel.toFixed(2)}</td>
                        <td className="py-2 pr-2 text-center tabular-nums text-slate-700">{d.hydration.toFixed(2)}</td>
                        <td className="py-2 pr-2 text-center tabular-nums text-slate-700">{d.lineage.toFixed(2)}</td>
                        <td className="py-2 pr-2 text-center tabular-nums text-slate-700">{d.reliability.toFixed(2)}</td>
                        <td className="py-2 pr-2 text-center tabular-nums text-slate-700">{d.performance.toFixed(2)}</td>
                        <td className="py-2 pr-2 text-center tabular-nums text-slate-700">{d.opConf.toFixed(2)}</td>
                        <td className={`py-2 pr-2 ${trendClr}`}>{d.trend==="up"?"↑":d.trend==="down"?"↓":"→"}</td>
                        <td className="py-2 pr-2 text-slate-500">{d.updated}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button className="mt-3 text-[11px] text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">View All 45 Sources &amp; 168 Datasets <ArrowRight className="h-3 w-3"/></button>
          </div>

          {/* How readiness is calculated */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">How the Query Readiness Engine Produces Trusted Operational Intelligence</div>
                <div className="text-[11px] text-slate-500">Deterministic composite scoring · every dimension is explainable</div>
              </div>
              <div className="text-[11px] text-slate-500 inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/>Live evaluation</div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {[
                { tone:"violet"  as Tone, title:"Inputs (Weighted)", icon:Layers,     items:weightsDefault.map(w=>`${w.label} (${w.weight}%)`) },
                { tone:"blue"    as Tone, title:"Scoring Engine",    icon:Cpu,        items:["Normalize Scores (0–1)","Apply Weights","Calculate Composite","Trend & Volatility","Threshold Evaluation"] },
                { tone:"emerald" as Tone, title:"Composite Score",   icon:Gauge,      items:[`Current: ${compositeAvg.toFixed(2)}`,"Target ≥ 0.85","Confidence ≥ 0.90","5-star operational","Ready"] },
                { tone:"amber"   as Tone, title:"Readiness Tiers",   icon:BadgeCheck, items:["0.90 – 1.00 Excellent","0.75 – 0.90 Good","0.50 – 0.75 Fair","0.00 – 0.50 Needs Work"] },
                { tone:"teal"    as Tone, title:"Outcome",           icon:Brain,      items:["Safe for AI / Automation","Trusted for Reporting","Supports Multi-Dimensional Queries","Meets SLA & Quality Targets"] },
              ].map(s=>{
                const t=T[s.tone];
                return (
                  <button key={s.title} onClick={()=>{setDrawer({kind:"stage",label:s.title}); setDrawerTab("engineering");}}
                    className={`rounded-lg border ${t.border} ${t.bg} p-3 text-left relative overflow-hidden hover:shadow-sm transition`}>
                    <div className={`absolute inset-x-0 top-0 h-0.5 ${t.dot}`}/>
                    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${t.text}`}><s.icon className="h-3.5 w-3.5"/>{s.title}</div>
                    <ul className="mt-2 space-y-0.5">
                      {s.items.map(i=><li key={i} className="text-[11px] text-slate-700 flex items-center gap-1"><ChevronRight className={`h-3 w-3 ${t.text} opacity-60`}/>{i}</li>)}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 relative h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-violet-400 via-blue-400 via-emerald-400 via-amber-400 to-teal-400 opacity-70"/>
              <div className="absolute top-0 h-full w-8 bg-white/60 blur-sm" style={{animation:"slide 3s linear infinite"}}/>
              <style>{`@keyframes slide { from { left:-10% } to { left:110% } }`}</style>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <aside className="col-span-12 xl:col-span-3 space-y-4">
          {/* Readiness distribution */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Readiness Distribution</div>
            <div className="mt-3 flex items-center gap-4">
              <svg viewBox="0 0 42 42" className="h-24 w-24 -rotate-90">
                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#f1f5f9" strokeWidth="6"/>
                {(() => {
                  let acc=0;
                  return distribution.map((seg,i)=>{
                    const dash=`${seg.pct} ${100-seg.pct}`; const off=100-acc; acc+=seg.pct;
                    return <circle key={i} cx="21" cy="21" r="15.9" fill="transparent" strokeWidth="6" stroke="currentColor" className={T[seg.tone].text} strokeDasharray={dash} strokeDashoffset={off}/>;
                  });
                })()}
                <text x="21" y="20" textAnchor="middle" fontSize="6" className="fill-slate-900 font-bold rotate-90" transform="rotate(90 21 21)">168</text>
                <text x="21" y="26" textAnchor="middle" fontSize="3" className="fill-slate-500 rotate-90" transform="rotate(90 21 21)">Datasets</text>
              </svg>
              <ul className="flex-1 space-y-1 text-[11px]">
                {distribution.map(s=>(
                  <li key={s.label} className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-slate-700"><span className={`h-2 w-2 rounded-full ${T[s.tone].dot}`}/>{s.label}</span>
                    <span className="tabular-nums font-medium text-slate-600">{s.count} <span className="text-slate-400">({s.pct}%)</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Score component contribution */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Score Component Contribution</div>
            <ul className="mt-3 space-y-2 text-[11px]">
              {weightsDefault.map((w,i)=>{
                const score = 0.72 + (i%5)*0.04;
                const pct = Math.round(score*100);
                return (
                  <li key={w.key}>
                    <div className="flex justify-between text-slate-600"><span>{w.label} <span className="text-slate-400">({w.weight}%)</span></span><span className="tabular-nums font-semibold text-slate-800">{score.toFixed(2)}</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${T[scoreTone(score)].bar}`} style={{width:`${pct}%`}}/>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Top issues */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Top Issues Impacting Readiness</div>
            <ul className="mt-2 divide-y divide-slate-100">
              {topIssues.map(i=>(
                <li key={i.label} className="py-1.5 flex items-center justify-between text-[11px] hover:bg-slate-50 rounded-md px-1 -mx-1 cursor-pointer"
                  onClick={()=>{setDrawer({kind:"stage",label:i.label}); setDrawerTab("engineering");}}>
                  <span className="text-slate-800 font-medium truncate">{i.label}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="tabular-nums text-slate-600">{i.count}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${T[i.tone].bg} ${T[i.tone].text} ring-1 ${T[i.tone].ring}`}>{i.impact}</span>
                    <span className={i.trend==="up"?"text-rose-600":i.trend==="down"?"text-emerald-600":"text-slate-400"}>
                      {i.trend==="up"?"↑":i.trend==="down"?"↓":"→"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      {/* Engineering Transparency Zone */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Engineering Transparency</div>
            <div className="text-[11px] text-slate-500">Pipeline · scoring · decision tree · live evaluation</div>
          </div>
          <div className="text-[11px] text-slate-500">Lower 40% · Engineering Intelligence</div>
        </div>

        {/* Pipeline */}
        <div className="mt-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-[1500px]">
            {pipelineStages.map((s,i)=>{
              const Icon=s.icon;
              return (
                <div key={s.label} className="flex items-center">
                  <button onClick={()=>{setDrawer({kind:"stage",label:s.label}); setDrawerTab("engineering");}}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-2 hover:border-indigo-300 hover:shadow-sm transition text-left w-[110px]">
                    <div className="flex items-center justify-between">
                      <div className="text-[9px] uppercase text-slate-400">Stage {i+1}</div>
                      <Icon className="h-3 w-3 text-indigo-500"/>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 leading-tight mt-0.5">{s.label}</div>
                  </button>
                  {i<pipelineStages.length-1 && (
                    <div className="mx-1 flex items-center gap-0.5">
                      <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"/>
                      <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse [animation-delay:120ms]"/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-4">
          {/* Composite Scoring w/ weight sliders */}
          <div className="col-span-12 lg:col-span-5 rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Gauge className="h-4 w-4 text-indigo-600"/>Composite Readiness Engine</div>
              <div className="text-[11px] text-slate-500">Total weight <span className="font-semibold text-slate-800 tabular-nums">{weights.reduce((a,b)=>a+b,0)}%</span></div>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <svg viewBox="0 0 42 42" className="h-24 w-24 -rotate-90">
                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#f1f5f9" strokeWidth="6"/>
                <circle cx="21" cy="21" r="15.9" fill="transparent" strokeWidth="6" stroke="currentColor"
                  className={T[scoreTone(compositeAvg)].text}
                  strokeDasharray={`${Math.round(compositeAvg*100)} ${100-Math.round(compositeAvg*100)}`}
                  strokeDashoffset={100} strokeLinecap="round"/>
                <text x="21" y="20" textAnchor="middle" fontSize="7" className="fill-slate-900 font-bold rotate-90" transform="rotate(90 21 21)">{compositeAvg.toFixed(2)}</text>
                <text x="21" y="27" textAnchor="middle" fontSize="3" className="fill-slate-500 rotate-90" transform="rotate(90 21 21)">Readiness</text>
              </svg>
              <div className="flex-1 text-[11px] space-y-1">
                <div className="flex justify-between"><span>AI Eligible</span><span className="font-semibold text-emerald-700 tabular-nums">{aiEligible} / {datasets.length}</span></div>
                <div className="flex justify-between"><span>Approval Threshold</span><span className="font-semibold tabular-nums">{simThreshold.toFixed(2)}</span></div>
                <input type="range" min={0.5} max={1} step={0.01} value={simThreshold} onChange={e=>setSimThreshold(parseFloat(e.target.value))} className="w-full accent-indigo-600"/>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {weightsDefault.map((w,i)=>(
                <label key={w.key} className="text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-700">{w.label}</span><span className="tabular-nums font-semibold text-slate-800">{weights[i]}%</span></div>
                  <input type="range" min={0} max={30} step={1} value={weights[i]}
                    onChange={e=>{ const v=parseInt(e.target.value); const next=[...weights]; next[i]=v; setWeights(next); }}
                    className={`w-full accent-indigo-600`}/>
                </label>
              ))}
              <button onClick={()=>setWeights(weightsDefault.map(w=>w.weight))} className="col-span-2 mt-1 text-[11px] py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600">Reset to default weights</button>
            </div>
          </div>

          {/* AI Readiness Decision Tree */}
          <div className="col-span-12 lg:col-span-4 rounded-lg border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Brain className="h-4 w-4 text-violet-600"/>AI Readiness Decision Engine</div>
            <ol className="mt-2 space-y-1">
              {[
                { q:"Completeness ≥ Target?",     ok:true,  v:"0.87" },
                { q:"Schema Valid?",              ok:true,  v:"0.85" },
                { q:"Relationships Complete?",    ok:true,  v:"0.83" },
                { q:"Lineage Complete?",          ok:true,  v:"0.86" },
                { q:"Freshness Within SLA?",      ok:true,  v:"0.84" },
                { q:"Performance Acceptable?",    ok:false, v:"0.68" },
                { q:"Confidence ≥ Threshold?",    ok:true,  v:"0.91" },
                { q:"Governance Passed?",         ok:true,  v:"0.95" },
                { q:"Operational Approval",       ok:true,  v:"—"    },
              ].map((n,i)=>(
                <li key={n.q} className={`flex items-center gap-2 text-[11px] rounded-md border p-1.5 ${n.ok?"border-emerald-200 bg-emerald-50/40":"border-amber-200 bg-amber-50/40"}`}>
                  <span className={`h-5 w-5 rounded grid place-items-center text-[10px] font-bold ${n.ok?"bg-emerald-500 text-white":"bg-amber-500 text-white"}`}>{i+1}</span>
                  <span className="text-slate-800">{n.q}</span>
                  <span className="ml-auto text-[10px] text-slate-500 tabular-nums">{n.v}</span>
                  {n.ok ? <Check className="h-3 w-3 text-emerald-600"/> : <AlertTriangle className="h-3 w-3 text-amber-600"/>}
                </li>
              ))}
              <li className="flex items-center gap-2 text-[11px] rounded-md bg-violet-50 border border-violet-200 p-1.5">
                <Brain className="h-4 w-4 text-violet-600"/>
                <span className="font-semibold text-violet-800">AI Ready — with performance flag</span>
              </li>
            </ol>
          </div>

          {/* Live evaluation console */}
          <div className="col-span-12 lg:col-span-3 rounded-lg bg-slate-950 text-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold flex items-center gap-2"><Cpu className="h-4 w-4"/>Live Engineering Evaluation</div>
              <button className="p-1 rounded hover:bg-white/10"><RefreshCw className="h-3.5 w-3.5"/></button>
            </div>
            <div className="mt-3 space-y-1 text-[10px] font-mono">
              {[
                "quality   ✓ okta.auth        0.85",
                "schema    ✓ panw.ngfw        0.92",
                "hydration ✓ wildfire.verdict 0.92",
                "relation  ⚠ dns.queries      0.70",
                "lineage   ✓ ct.api           0.78",
                "freshness ⚠ vpn.sessions     0.65",
                "confid.   ✓ panw.panorama    0.90",
                "approve   → composite 0.86",
              ].map((line,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-500 w-14 tabular-nums">10:32:{String(11+i).padStart(2,"0")}</span>
                  <span className="text-emerald-400">▸</span>
                  <span className="text-slate-200 truncate">{line}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[["Eval/s","148"],["Approve/s","132"],["Reject/s","16"],["Latency","42ms"],["Workers","24"],["Queue","3"]].map(([k,v])=>(
                <div key={k} className="rounded bg-white/5 p-1.5">
                  <div className="text-[9px] text-slate-400">{k}</div>
                  <div className="text-[11px] font-bold tabular-nums">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Readiness Heatmap */}
        <div className="mt-4 rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Readiness Heatmap (Dataset × Dimension)</div>
            <div className="text-[11px] text-slate-500">Click any cell to inspect</div>
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-1 pr-2">Dataset</th>
                  {["Comp.","Fresh.","Schema","Rel. Cov.","Hydration","Lineage","Reliability","Query Perf.","Op. Conf."].map(h => <th key={h} className="py-1 px-2 text-center">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {datasets.map(d=>{
                  const cells=[d.completeness,d.freshness,d.schema,d.rel,d.hydration,d.lineage,d.reliability,d.performance,d.opConf];
                  return (
                    <tr key={d.id} className="border-b border-slate-100">
                      <td className="py-1 pr-2 font-medium text-slate-800">{d.source} <span className="text-slate-400">/ {d.dataset}</span></td>
                      {cells.map((v,i)=>{
                        const t=T[scoreTone(v)];
                        return (
                          <td key={i} className="p-0.5 text-center">
                            <button onClick={()=>{setSelected(d); setDrawer({kind:"dataset",d}); setDrawerTab("engineering");}}
                              className={`w-full py-1 rounded ${t.bg} ${t.text} font-semibold tabular-nums hover:ring-2 hover:ring-indigo-300 transition`}>{v.toFixed(2)}</button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational outcome + bottom widgets */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {outcomes.map(o=>{
            const t=T[o.tone]; const Icon=o.icon;
            const pct = Math.round((o.eligible/(o.eligible+o.blocked))*100);
            return (
              <button key={o.label} onClick={()=>{setDrawer({kind:"outcome",label:o.label}); setDrawerTab("overview");}}
                className="text-left rounded-lg border border-slate-200 bg-white p-3 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className={`h-7 w-7 rounded-md grid place-items-center ${t.bg} ${t.text}`}><Icon className="h-3.5 w-3.5"/></div>
                  <span className="text-[10px] font-semibold text-emerald-700">{pct}% ready</span>
                </div>
                <div className="mt-2 text-[12px] font-semibold text-slate-900">{o.label}</div>
                <div className="mt-1 flex items-baseline gap-2 text-[11px] text-slate-600">
                  <span className="tabular-nums font-bold text-slate-900">{o.eligible}</span>
                  <span>eligible</span>
                  <span className="ml-auto text-rose-600 tabular-nums">{o.blocked} blocked</span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${t.bar}`} style={{width:`${pct}%`}}/>
                </div>
              </button>
            );
          })}
        </div>

        {/* Data quality gates */}
        <div className="mt-4 rounded-lg border border-slate-200 p-3">
          <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-emerald-600"/>Data Quality Gates (Targets)</div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-5 gap-2 text-[11px]">
            {[
              { label:"Overall Readiness ≥ 0.85",       actual:"0.86", ok:true },
              { label:"High Confidence Datasets ≥ 70%", actual:"70.2%",ok:true },
              { label:"Query Success Rate ≥ 95%",       actual:"97.8%",ok:true },
              { label:"Refresh SLA Met ≥ 98%",          actual:"98.6%",ok:true },
              { label:"Critical Issues ≈ 0",            actual:"6",    ok:false },
            ].map(g=>(
              <div key={g.label} className={`rounded-md border p-2 flex items-center justify-between ${g.ok?"border-emerald-200 bg-emerald-50/40":"border-rose-200 bg-rose-50/40"}`}>
                <div>
                  <div className="text-slate-700">{g.label}</div>
                  <div className="text-slate-900 font-bold tabular-nums">{g.actual}</div>
                </div>
                {g.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600"/> : <AlertTriangle className="h-4 w-4 text-rose-600"/>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drawer */}
      {drawer && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={()=>setDrawer(null)}/>
          <aside className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-50 shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-semibold">
                  {drawer.kind==="dataset" ? "Dataset" : drawer.kind==="kpi" ? "KPI Detail" : drawer.kind==="outcome" ? "Operational Outcome" : "Engineering Stage"}
                </div>
                <div className="text-lg font-semibold text-slate-900 mt-0.5">
                  {drawer.kind==="dataset" ? `${drawer.d.source} · ${drawer.d.dataset}` : drawer.label}
                </div>
                {drawer.kind==="dataset" && (
                  <div className="text-[12px] text-slate-500">Owner {drawer.d.owner} · Overall {scoreCell(drawer.d.overall)}</div>
                )}
              </div>
              <button onClick={()=>setDrawer(null)} className="p-1.5 rounded-md hover:bg-slate-100"><X className="h-4 w-4"/></button>
            </div>

            <div className="px-4 pt-2 border-b border-slate-200 flex items-center gap-1 text-[12px]">
              {(["overview","engineering","telemetry","simulation","dependencies"] as const).map(t=>(
                <button key={t} onClick={()=>setDrawerTab(t)}
                  className={`px-2.5 py-1.5 rounded-t-md capitalize ${drawerTab===t ? "text-indigo-700 border-b-2 border-indigo-600 -mb-px font-semibold" : "text-slate-500 hover:text-slate-800"}`}>{t}</button>
              ))}
            </div>

            <div className="p-4 overflow-y-auto text-[12px] text-slate-700 space-y-3">
              {drawerTab==="overview" && (
                <>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Business Explanation</div>
                    <p className="mt-1">
                      {drawer.kind==="dataset"
                        ? `${drawer.d.source} · ${drawer.d.dataset} feeds ${drawer.d.owner} analytics, agentic AI runtime, and the operational knowledge graph. Composite readiness ${drawer.d.overall.toFixed(2)} — engineered from ten deterministic dimensions.`
                        : drawer.kind==="outcome"
                          ? `Consumer channel ${drawer.label} inherits readiness from every upstream dataset. Blocked datasets fail one or more engineering gates before AI consumption.`
                          : "Every stage in the readiness pipeline is deterministic, versioned, and continuously evaluated. Failures are explainable at the field level."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[["Consumers","AI · Graph · Dashboards · Automation"],["Criticality","Tier-1 operational"],["SLA Freshness","≤ 30s p95"],["Data Contract","v2.3 signed"]].map(([k,v])=>(
                      <div key={k} className="rounded-md bg-slate-50 p-2"><div className="text-[10px] text-slate-500">{k}</div><div className="font-semibold text-slate-900">{v}</div></div>
                    ))}
                  </div>
                </>
              )}

              {drawerTab==="engineering" && (
                <div className="space-y-1.5">
                  {["Quality Engine","Schema Validator","Hydration Validator","Relationship Validator","Canonical Model","Lineage Engine","Freshness Engine","Performance Engine","Governance Engine","Confidence Engine","Composite Scoring","AI Approval"].map((s,i)=>(
                    <div key={s} className="flex items-center gap-2 rounded-md border border-slate-200 p-2">
                      <div className="h-6 w-6 rounded bg-indigo-50 text-indigo-600 grid place-items-center text-[10px] font-semibold">{i+1}</div>
                      <div>
                        <div className="text-slate-800 font-medium">{s}</div>
                        <div className="text-[10px] text-slate-500">latency {(8+i*2)}ms · workers {8+i} · conf {(0.88+i*0.008).toFixed(2)} · v4.{i}</div>
                      </div>
                      <div className="ml-auto text-[10px] text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/>Active</div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab==="telemetry" && (
                <div className="grid grid-cols-2 gap-2">
                  {[["Evaluations/s","148"],["Avg latency","42ms"],["Workers","24"],["CPU","36%"],["Memory","6.2GB"],["Queue depth","3"],["Failures (5m)","0"],["Confidence avg","0.91"],["Historical p95","54ms"],["Prediction (10m)","0.87"],["Cache hit","93.4%"],["Retries","0.02%"]].map(([k,v])=>(
                    <div key={k} className="rounded-md bg-slate-50 p-2"><div className="text-[10px] text-slate-500">{k}</div><div className="font-semibold text-slate-900 tabular-nums">{v}</div></div>
                  ))}
                </div>
              )}

              {drawerTab==="simulation" && (
                <div className="space-y-3">
                  {[
                    ["Completeness",0.87],["Freshness",0.84],["Schema Quality",0.85],["Relationship Coverage",0.83],
                    ["Hydration Confidence",0.88],["Lineage",0.86],["Performance",0.78],["Governance",0.95],
                  ].map(([label,val])=>(
                    <label key={label as string} className="block">
                      <div className="flex justify-between text-[11px]"><span>{label as string}</span><span className="tabular-nums">{(val as number).toFixed(2)}</span></div>
                      <input type="range" min={0} max={1} step={0.01} defaultValue={val as number} className="w-full accent-indigo-600"/>
                    </label>
                  ))}
                  <div className="rounded-md bg-slate-950 text-slate-100 p-3 text-[11px] font-mono">
                    <div>composite_score = {compositeAvg.toFixed(2)}</div>
                    <div>ai_approval_threshold = {simThreshold.toFixed(2)}</div>
                    <div>ai_eligible = {aiEligible} / {datasets.length}</div>
                    <div>projected_query_success = {(94 + compositeAvg*4).toFixed(1)}%</div>
                    <div>status = {compositeAvg>=simThreshold ? "READY" : "BLOCKED"}</div>
                  </div>
                  <p className="text-[11px] text-slate-500">Simulation is in-memory; the production scorecard is unaffected.</p>
                </div>
              )}

              {drawerTab==="dependencies" && (
                <ul className="space-y-1.5">
                  {["Quality Engine","Hydration","Canonical Model","Relationship Builder","Knowledge Graph","Performance Lab","Lineage","Validation","Governance","AI Runtime","Operational Consumers","Ownership: Platform Data Eng","Risk: Low"].map(x=>(
                    <li key={x} className="flex items-center gap-2 rounded-md border border-slate-200 p-2"><Link2 className="h-3.5 w-3.5 text-indigo-600"/>{x}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3"/>Composite verified · deterministic</span>
              <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"><PlayCircle className="h-3 w-3"/>Recompute</button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
