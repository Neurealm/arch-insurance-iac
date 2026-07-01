import { useMemo, useState } from "react";
import {
  ArrowRight, BadgeCheck, Boxes, ChevronRight, Cpu, Database, Download,
  Filter, GitBranch, Key, Link2, Network, RefreshCw, Search, Shield,
  Sparkles, TrendingUp, X, Zap, CheckCircle2, Users, Workflow, Gauge,
  Server, Globe, Router, Cable, Container, ShieldCheck, Bell, MapPin,
  Radar, GitMerge, Repeat, Package, Activity, Cloud, FileCode,
  ArrowRightLeft, Fingerprint, Layers, PlayCircle, Route as RouteIcon,
} from "lucide-react";

/* ---------------- tokens ---------------- */
type Tone = "blue"|"emerald"|"amber"|"rose"|"violet"|"teal"|"orange";
const T: Record<Tone,{text:string;bg:string;ring:string;dot:string;border:string;stroke:string}> = {
  blue:    { text:"text-blue-700",    bg:"bg-blue-50",    ring:"ring-blue-200",    dot:"bg-blue-500",    border:"border-blue-200",    stroke:"#3b82f6" },
  emerald: { text:"text-emerald-700", bg:"bg-emerald-50", ring:"ring-emerald-200", dot:"bg-emerald-500", border:"border-emerald-200", stroke:"#10b981" },
  amber:   { text:"text-amber-700",   bg:"bg-amber-50",   ring:"ring-amber-200",   dot:"bg-amber-500",   border:"border-amber-200",   stroke:"#f59e0b" },
  rose:    { text:"text-rose-700",    bg:"bg-rose-50",    ring:"ring-rose-200",    dot:"bg-rose-500",    border:"border-rose-200",    stroke:"#f43f5e" },
  violet:  { text:"text-violet-700",  bg:"bg-violet-50",  ring:"ring-violet-200",  dot:"bg-violet-500",  border:"border-violet-200",  stroke:"#8b5cf6" },
  teal:    { text:"text-teal-700",    bg:"bg-teal-50",    ring:"ring-teal-200",    dot:"bg-teal-500",    border:"border-teal-200",    stroke:"#14b8a6" },
  orange:  { text:"text-orange-700",  bg:"bg-orange-50",  ring:"ring-orange-200",  dot:"bg-orange-500",  border:"border-orange-200",  stroke:"#f97316" },
};

/* ---------------- data ---------------- */
const kpis: {label:string;value:string;sub:string;tone:Tone;icon:any;spark:number[];trend:string}[] = [
  { label:"Canonical Entities", value:"15",     sub:"Nodes in graph",       tone:"violet",  icon:Boxes,      spark:[10,11,12,13,14,15,15], trend:"+2 vs 7D" },
  { label:"Relationships",      value:"236",    sub:"Edges defined",        tone:"orange",  icon:GitBranch,  spark:[4,5,6,7,8,9,10],       trend:"+18.6%" },
  { label:"Primary Keys",       value:"48",     sub:"Deterministic",        tone:"blue",    icon:Key,        spark:[6,7,7,8,8,9,9],        trend:"+4" },
  { label:"Foreign Keys",       value:"72",     sub:"Mapped across",        tone:"teal",    icon:Link2,      spark:[5,6,7,7,8,9,9],        trend:"+6" },
  { label:"Correlation Keys",   value:"31",     sub:"Fuzzy / semantic",     tone:"violet",  icon:Fingerprint,spark:[4,4,5,6,6,7,7],        trend:"+3" },
  { label:"Graph Coverage",     value:"98.2%",  sub:"Target ≥ 95%",         tone:"emerald", icon:Radar,      spark:[7,8,8,9,9,10,10],      trend:"+0.9%" },
  { label:"Orphan Records",     value:"12,842", sub:"-8.7% vs prior 7D",    tone:"rose",    icon:Zap,        spark:[9,8,7,6,5,4,3],        trend:"-8.7%" },
  { label:"Query Path Success", value:"94.1%",  sub:"Target ≥ 90%",         tone:"emerald", icon:BadgeCheck, spark:[7,7,8,8,9,9,10],       trend:"+1.4%" },
];

type Entity = {
  id:string; name:string; icon:any; tone:Tone;
  pk:string; fks:string[]; ck:string[]; composite:string; quality:number;
  coverage:number; relationships:number; confidence:number; owner:string; version:string;
};
const entities: Entity[] = [
  { id:"device",   name:"Device",       icon:Router,      tone:"violet",  pk:"device_id",    fks:["site_id","owner_id"],       ck:["hostname","serial_number","mgmt_ip"], composite:"(device_id, source_system)", quality:0.96, coverage:99.2, relationships:14, confidence:0.98, owner:"NetOps",     version:"v4.1" },
  { id:"site",     name:"Site",         icon:MapPin,      tone:"blue",    pk:"site_id",      fks:["owner_id"],                 ck:["site_code","location"],               composite:"(site_id, region)",           quality:0.95, coverage:100,  relationships:8,  confidence:0.99, owner:"Facilities", version:"v4.1" },
  { id:"iface",    name:"Interface",    icon:Cable,       tone:"teal",    pk:"interface_id", fks:["device_id"],                ck:["if_name","if_index","mac_address"],    composite:"(device_id, if_name)",        quality:0.94, coverage:97.4, relationships:9,  confidence:0.95, owner:"NetOps",     version:"v3.9" },
  { id:"tunnel",   name:"Tunnel",       icon:Cable,       tone:"teal",    pk:"tunnel_id",    fks:["device_id","peer_device_id"],ck:["tunnel_name","peer_ip"],             composite:"(tunnel_id, source_system)",  quality:0.93, coverage:96.1, relationships:6,  confidence:0.93, owner:"NetOps",     version:"v3.7" },
  { id:"rule",     name:"Rule",         icon:Shield,      tone:"orange",  pk:"rule_id",      fks:["device_id","policy_id"],    ck:["rule_uuid","rule_name"],              composite:"(device_id, rule_id)",        quality:0.94, coverage:98.0, relationships:5,  confidence:0.96, owner:"SecEng",     version:"v4.1" },
  { id:"user",     name:"User",         icon:Users,       tone:"violet",  pk:"user_id",      fks:["domain_id","owner_id"],     ck:["upn","email","sam_account"],          composite:"(user_id, source_system)",    quality:0.95, coverage:99.9, relationships:11, confidence:0.98, owner:"IAM",        version:"v4.0" },
  { id:"app",      name:"Application",  icon:Package,     tone:"blue",    pk:"app_id",       fks:["owner_id","zone_id"],       ck:["app_name","app_category"],            composite:"(app_id, source_system)",     quality:0.93, coverage:97.2, relationships:12, confidence:0.95, owner:"AppOps",     version:"v4.0" },
  { id:"alert",    name:"Alert",        icon:Bell,        tone:"rose",    pk:"alert_id",     fks:["device_id","rule_id","user_id"],ck:["event_id","signature_id"],       composite:"(alert_id, source_system)",   quality:0.93, coverage:100,  relationships:9,  confidence:0.92, owner:"SRE",        version:"v4.1" },
  { id:"route",    name:"Route",        icon:RouteIcon,   tone:"blue",    pk:"route_hash",   fks:["interface_id","tunnel_id"], ck:["prefix","next_hop"],                  composite:"(route_hash, source_system)", quality:0.88, coverage:95.8, relationships:5,  confidence:0.91, owner:"NetOps",     version:"v3.5" },
  { id:"dns",      name:"DNS Record",   icon:Globe,       tone:"blue",    pk:"dns_id",       fks:["zone_id","device_id"],      ck:["fqdn","record_type"],                 composite:"(fqdn, record_type)",         quality:0.95, coverage:99.5, relationships:8,  confidence:0.97, owner:"Platform",   version:"v4.1" },
  { id:"svc",      name:"Service",      icon:Server,      tone:"blue",    pk:"service_id",   fks:["app_id","cluster_id"],      ck:["service_dns","port"],                 composite:"(service_id, cluster_id)",    quality:0.92, coverage:96.9, relationships:11, confidence:0.94, owner:"SRE",        version:"v3.9" },
  { id:"k8s",      name:"K8s Workload", icon:Container,   tone:"teal",    pk:"k8s_uid",      fks:["service_id","namespace_id"],ck:["workload_name","cluster"],            composite:"(k8s_uid, cluster)",          quality:0.94, coverage:98.7, relationships:9,  confidence:0.96, owner:"Platform",   version:"v4.1" },
  { id:"cert",     name:"Certificate",  icon:Key,         tone:"amber",   pk:"cert_thumb",   fks:["dns_id","device_id"],       ck:["cn","san"],                           composite:"(cert_thumb, ca)",            quality:0.91, coverage:96.5, relationships:5,  confidence:0.93, owner:"SecEng",     version:"v3.9" },
  { id:"change",   name:"Change",       icon:GitBranch,   tone:"amber",   pk:"change_id",    fks:["app_id","user_id"],         ck:["ticket_no"],                          composite:"(change_id, system)",         quality:0.89, coverage:94.1, relationships:7,  confidence:0.90, owner:"ChangeMgmt", version:"v3.8" },
  { id:"identity", name:"Identity",     icon:ShieldCheck, tone:"violet",  pk:"identity_id",  fks:["user_id"],                  ck:["canonical_upn","emp_id"],             composite:"(identity_id, idp)",          quality:0.96, coverage:99.4, relationships:10, confidence:0.98, owner:"IAM",        version:"v4.1" },
];

type Edge = { from:string; to:string; label:string; type:"1:1"|"1:N"|"N:N"|"opt"; conf:number };
const edges: Edge[] = [
  { from:"device",   to:"site",     label:"located_at",   type:"1:1", conf:0.98 },
  { from:"device",   to:"iface",    label:"has",          type:"1:N", conf:0.96 },
  { from:"iface",    to:"tunnel",   label:"has_tunnel",   type:"1:N", conf:0.93 },
  { from:"iface",    to:"route",    label:"routes_to",    type:"1:N", conf:0.91 },
  { from:"tunnel",   to:"site",     label:"terminates",   type:"1:1", conf:0.94 },
  { from:"device",   to:"rule",     label:"enforces",     type:"1:N", conf:0.95 },
  { from:"rule",     to:"app",      label:"permitted_by", type:"N:N", conf:0.92 },
  { from:"user",     to:"app",      label:"initiates",    type:"N:N", conf:0.94 },
  { from:"app",      to:"alert",    label:"generates",    type:"1:N", conf:0.90 },
  { from:"dns",      to:"device",   label:"resolves_to",  type:"1:N", conf:0.96 },
  { from:"alert",    to:"change",   label:"related_to",   type:"N:N", conf:0.87 },
  { from:"change",   to:"app",      label:"depend_to",    type:"N:N", conf:0.88, },
  { from:"user",     to:"identity", label:"is_a",         type:"1:1", conf:0.99 },
  { from:"svc",      to:"k8s",      label:"deployed_as",  type:"1:1", conf:0.96 },
  { from:"cert",     to:"dns",      label:"binds",        type:"1:1", conf:0.93 },
];

const cardinality = [
  { label:"One-to-One",   count:24,  pct:10.2, tone:"emerald" as Tone },
  { label:"One-to-Many",  count:158, pct:67.0, tone:"blue"    as Tone },
  { label:"Many-to-Many", count:42,  pct:17.7, tone:"amber"   as Tone },
  { label:"Optional",     count:12,  pct: 5.1, tone:"rose"    as Tone },
];

const topQueries = [
  { q:"Device → Interface → Alert",     type:"Path", success:98.7, count:12842 },
  { q:"User → Application → Change",    type:"Path", success:96.1, count: 8731 },
  { q:"Site → Device → Route → Rule",   type:"Path", success:95.4, count: 6521 },
  { q:"Interface → Tunnel → Route",     type:"Path", success:93.8, count: 4932 },
  { q:"DNS Record → Device → Alert",    type:"Path", success:92.5, count: 3881 },
];

const pipelineStages = [
  "Canonical Entity","Primary Key Discovery","Foreign Key Mapping","Correlation Engine",
  "Relationship Rules","Topology Discovery","Confidence Calc","Graph Builder","Knowledge Graph","Operational Consumers",
];

const orphanIssues = [
  { label:"Alerts with missing rule_id",         count:4512 },
  { label:"Interfaces with missing device_id",   count:3298 },
  { label:"Tunnels with unknown peer_device",    count:1842 },
  { label:"DNS Records with no resolving device",count:1276 },
  { label:"Rules not linked to any policy",      count: 912 },
];

/* ---------------- atoms ---------------- */
function Spark({values,tone}:{values:number[];tone:Tone}) {
  const max=Math.max(...values),min=Math.min(...values); const w=90,h=24;
  const pts = values.map((v,i)=>{
    const x=(i/(values.length-1))*w;
    const y=h-((v-min)/Math.max(1,max-min))*h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return <svg width={w} height={h} className="overflow-visible"><polyline points={pts} fill="none" strokeWidth={1.5} className={T[tone].text} stroke="currentColor"/></svg>;
}

const edgeTone = (t:Edge["type"]):Tone => t==="1:1"?"emerald":t==="1:N"?"blue":t==="N:N"?"amber":"rose";

/* ---------------- page ---------------- */
export default function RelationshipKeyAndGraphProjectionBuilder() {
  const [selected,setSelected] = useState<Entity>(entities[0]);
  const [drawer,setDrawer] = useState<Entity|Edge|null>(null);
  const [drawerTab,setDrawerTab] = useState<"overview"|"engineering"|"telemetry"|"simulation"|"dependencies">("overview");
  const [query,setQuery] = useState("");
  const [simConfidence,setSimConfidence] = useState(0.85);
  const [simTopology,setSimTopology] = useState(0.90);

  const filtered = useMemo(()=>entities.filter(e =>
    (e.name+e.owner+e.pk+e.fks.join(" ")+e.ck.join(" ")).toLowerCase().includes(query.toLowerCase())
  ),[query]);

  const openDrawer = (target:Entity|Edge) => { setDrawer(target); setDrawerTab("overview"); };
  const isEdge = (x:any):x is Edge => x && "from" in x && "to" in x;

  // Position entities on the graph circle
  const positions = useMemo(() => {
    const map:Record<string,{x:number;y:number}> = {};
    entities.forEach((e,i)=>{
      const angle = (i/entities.length)*Math.PI*2 - Math.PI/2;
      map[e.id] = { x: 400 + Math.cos(angle)*180, y: 200 + Math.sin(angle)*150 };
    });
    return map;
  },[]);

  return (
    <div className="p-6 space-y-6 bg-white">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Relationship, Key &amp; Graph Projection Builder</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[11px] font-semibold ring-1 ring-violet-200"><Network className="h-3 w-3"/>Graph Engine</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">v4.1</span>
          </div>
          <p className="mt-1 text-slate-600 text-sm max-w-3xl">
            Engineer semantic relationships that transform isolated telemetry into an operational knowledge graph.
          </p>
          <p className="mt-1 text-slate-500 text-xs max-w-3xl">
            The Relationship Builder continuously discovers, validates, scores, and maintains graph-ready relationships between canonical entities using deterministic rules and operational telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 mr-1">Last Updated <span className="text-slate-800 font-medium">May 12, 2025 10:32 AM</span></div>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><Filter className="h-3.5 w-3.5"/>Filters</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><Key className="h-3.5 w-3.5"/>Key Library</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"><Network className="h-3.5 w-3.5"/>Graph Explorer</button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-700"><Download className="h-3.5 w-3.5"/>Export Graph Model</button>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map(k => {
          const t=T[k.tone]; const Icon=k.icon;
          return (
            <button key={k.label} onClick={()=>openDrawer(selected)} className="text-left rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
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

      {/* Relationship construction pipeline */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">From Operational Entities to Graph Projection</div>
            <div className="text-[11px] text-slate-500">Data has limited value until relationships are engineered between operational entities</div>
          </div>
          <div className="text-[11px] text-slate-500 inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"/>Live construction</div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {[
            { tone:"blue"    as Tone, title:"1 · Define Keys",           icon:Key,        items:["Primary Keys (PK)","Foreign Keys (FK)","Correlation Keys (CK)","Composite Keys","Natural Keys"], footer:"Key Definitions" },
            { tone:"violet"  as Tone, title:"2 · Map Relationships",     icon:ArrowRightLeft, items:["One-to-One","One-to-Many","Many-to-Many","Optional Relationships","Cardinality Rules"],   footer:"Relationship Mapping" },
            { tone:"teal"    as Tone, title:"3 · Build Graph Projection",icon:Network,    items:["Nodes (Entities)","Edges (Relationships)","Edge Properties","Direction & Weight","Temporal Validity"], footer:"Graph Projection" },
            { tone:"orange"  as Tone, title:"4 · Validate & Score",      icon:BadgeCheck, items:["Referential Integrity","Orphan Detection","Loop Detection","Completeness Score","Confidence Score"], footer:"Validation Engine" },
            { tone:"emerald" as Tone, title:"5 · Activate & Consume",    icon:Sparkles,   items:["Graph Queries","Impact Analysis","Root Cause Analysis","AI/ML Features","Operational Dashboards"], footer:"Operational Use" },
          ].map(stage => {
            const t = T[stage.tone];
            return (
              <div key={stage.title} className={`rounded-lg border ${t.border} ${t.bg} p-3 relative overflow-hidden`}>
                <div className={`absolute inset-x-0 top-0 h-0.5 ${t.dot}`}/>
                <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${t.text}`}><stage.icon className="h-3.5 w-3.5"/>{stage.title}</div>
                <ul className="mt-2 space-y-0.5">
                  {stage.items.map(i => <li key={i} className="text-[11px] text-slate-700 flex items-center gap-1"><ChevronRight className={`h-3 w-3 ${t.text} opacity-60`}/>{i}</li>)}
                </ul>
                <div className={`mt-2 text-[10px] py-0.5 px-1.5 inline-block rounded ${t.bg} ${t.text} ring-1 ${t.ring}`}>{stage.footer}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 relative h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-blue-400 via-violet-400 via-teal-400 via-orange-400 to-emerald-400 opacity-70"/>
          <div className="absolute top-0 h-full w-8 bg-white/60 blur-sm" style={{animation:"slide 3s linear infinite"}}/>
          <style>{`@keyframes slide { from { left:-10% } to { left:110% } }`}</style>
        </div>
      </section>

      {/* Graph + right rail */}
      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-9 space-y-4">

          {/* Interactive graph */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Interactive Graph Builder</div>
                <div className="text-[11px] text-slate-500">Click any node to inspect · Edge color = relationship type · Edge thickness = confidence</div>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><span className="inline-block h-0.5 w-3 bg-emerald-500"/>1:1</span>
                <span className="inline-flex items-center gap-1"><span className="inline-block h-0.5 w-3 bg-blue-500"/>1:N</span>
                <span className="inline-flex items-center gap-1"><span className="inline-block h-0.5 w-3 bg-amber-500"/>N:N</span>
                <span className="inline-flex items-center gap-1"><span className="inline-block h-0.5 w-3 border-t border-dashed border-rose-500"/>optional</span>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-gradient-to-b from-slate-50 to-white ring-1 ring-slate-100 relative" style={{height:420}}>
              <svg viewBox="0 0 800 400" className="absolute inset-0 h-full w-full">
                {/* edges */}
                {edges.map((e,i)=>{
                  const a = positions[e.from], b = positions[e.to];
                  if(!a||!b) return null;
                  const t = edgeTone(e.type);
                  const mx = (a.x+b.x)/2, my = (a.y+b.y)/2;
                  return (
                    <g key={`edge-${i}`} className="cursor-pointer" onClick={()=>openDrawer(e)}>
                      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={T[t].stroke} strokeWidth={Math.max(1,e.conf*2.4)} strokeOpacity={0.75}>
                        <animate attributeName="stroke-opacity" values="0.4;0.9;0.4" dur="2.6s" begin={`${(i%6)*0.2}s`} repeatCount="indefinite"/>
                      </line>
                      <text x={mx} y={my-3} textAnchor="middle" fontSize="8" className="fill-slate-500 pointer-events-none select-none">{e.label}</text>
                    </g>
                  );
                })}
                {/* nodes */}
                {entities.map(e=>{
                  const p = positions[e.id]; if(!p) return null;
                  const t = T[e.tone]; const Icon = e.icon;
                  const isSel = selected.id === e.id;
                  return (
                    <g key={e.id} transform={`translate(${p.x},${p.y})`} className="cursor-pointer" onClick={()=>setSelected(e)} onDoubleClick={()=>openDrawer(e)}>
                      <circle r={isSel?18:14} className="fill-white" stroke={t.stroke} strokeWidth={isSel?2.5:1.5}/>
                      {isSel && <circle r={22} fill="none" stroke={t.stroke} strokeOpacity={0.4} strokeWidth={1}><animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite"/></circle>}
                      <foreignObject x={-8} y={-8} width={16} height={16}>
                        <div className={t.text}><Icon className="h-4 w-4"/></div>
                      </foreignObject>
                      <text y={30} textAnchor="middle" fontSize="9" className="fill-slate-700 font-semibold pointer-events-none">{e.name}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Key registry */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2 gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-900">Entity Key Registry</div>
                <div className="text-[11px] text-slate-500">Primary, foreign, correlation, and composite keys per canonical entity</div>
              </div>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search entities or keys..."
                  className="pl-7 pr-2 py-1.5 text-xs rounded-md border border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 outline-none w-64"/>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-2">Entity</th>
                    <th className="py-2 pr-2">Primary Key (PK)</th>
                    <th className="py-2 pr-2">Foreign Keys (FK)</th>
                    <th className="py-2 pr-2">Correlation Keys (CK)</th>
                    <th className="py-2 pr-2">Composite Key</th>
                    <th className="py-2 pr-2 text-right">Rels</th>
                    <th className="py-2 pr-2 text-right">Coverage</th>
                    <th className="py-2 pr-2 text-right">Quality</th>
                    <th className="py-2 pr-2">Owner</th>
                    <th className="py-2 pr-2">Version</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e=>{
                    const Icon=e.icon; const t=T[e.tone];
                    return (
                      <tr key={e.id} onClick={()=>{setSelected(e);openDrawer(e);}}
                        className={`border-b border-slate-100 hover:bg-slate-50/60 cursor-pointer ${selected.id===e.id?"bg-indigo-50/30":""}`}>
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-2">
                            <span className={`h-6 w-6 rounded grid place-items-center ${t.bg}`}><Icon className={`h-3.5 w-3.5 ${t.text}`}/></span>
                            <span className="font-semibold text-slate-900">{e.name}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-2 font-mono text-[11px] text-slate-800">{e.pk}</td>
                        <td className="py-2 pr-2 font-mono text-[11px] text-slate-600">{e.fks.join(", ")}</td>
                        <td className="py-2 pr-2 font-mono text-[11px] text-slate-600">{e.ck.join(", ")}</td>
                        <td className="py-2 pr-2 font-mono text-[11px] text-slate-600">{e.composite}</td>
                        <td className="py-2 pr-2 text-right tabular-nums">{e.relationships}</td>
                        <td className="py-2 pr-2 text-right tabular-nums">{e.coverage}%</td>
                        <td className="py-2 pr-2 text-right tabular-nums font-semibold text-emerald-700">{e.quality.toFixed(2)}</td>
                        <td className="py-2 pr-2 text-slate-700">{e.owner}</td>
                        <td className="py-2 pr-2 text-slate-500 font-mono text-[11px]">{e.version}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <aside className="col-span-12 xl:col-span-3 space-y-4">
          {/* Key Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Key Summary</div>
            <div className="mt-3 flex items-center gap-4">
              <svg viewBox="0 0 42 42" className="h-24 w-24 -rotate-90">
                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#f1f5f9" strokeWidth="6"/>
                {(() => {
                  const segs = [{pct:31.8,tone:"emerald" as Tone},{pct:47.7,tone:"blue" as Tone},{pct:20.5,tone:"violet" as Tone}];
                  let acc=0;
                  return segs.map((seg,i) => {
                    const dash=`${seg.pct} ${100-seg.pct}`; const off=100-acc; acc+=seg.pct;
                    return <circle key={i} cx="21" cy="21" r="15.9" fill="transparent" strokeWidth="6" stroke="currentColor" className={T[seg.tone].text} strokeDasharray={dash} strokeDashoffset={off}/>;
                  });
                })()}
                <text x="21" y="20" textAnchor="middle" fontSize="6" className="fill-slate-900 font-bold rotate-90" transform="rotate(90 21 21)">151</text>
                <text x="21" y="26" textAnchor="middle" fontSize="3" className="fill-slate-500 rotate-90" transform="rotate(90 21 21)">Total Keys</text>
              </svg>
              <ul className="flex-1 space-y-1 text-[11px]">
                {[
                  { label:"Primary Keys",     v:48, pct:"31.8%", tone:"emerald" as Tone },
                  { label:"Foreign Keys",     v:72, pct:"47.7%", tone:"blue"    as Tone },
                  { label:"Correlation Keys", v:31, pct:"20.5%", tone:"violet"  as Tone },
                ].map(s=>(
                  <li key={s.label} className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-slate-700"><span className={`h-2 w-2 rounded-full ${T[s.tone].dot}`}/>{s.label}</span>
                    <span className="tabular-nums font-medium text-slate-600">{s.v} <span className="text-slate-400">({s.pct})</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cardinality */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Relationship Cardinality</div>
            <ul className="mt-3 space-y-2 text-[11px]">
              {cardinality.map(c=>(
                <li key={c.label}>
                  <div className="flex justify-between text-slate-600"><span>{c.label}</span><span className="tabular-nums">{c.count} <span className="text-slate-400">({c.pct}%)</span></span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${T[c.tone].dot}`} style={{width:`${c.pct}%`}}/>
                  </div>
                </li>
              ))}
              <li className="pt-1 mt-1 border-t border-slate-100 flex justify-between font-semibold text-slate-800"><span>Total Relationships</span><span className="tabular-nums">236</span></li>
            </ul>
          </div>

          {/* Graph Health */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Graph Health (7D)</div>
              <Gauge className="h-4 w-4 text-slate-400"/>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="text-3xl font-bold text-emerald-600 tabular-nums">0.93</div>
              <div className="text-[10px] text-emerald-700 font-semibold rounded bg-emerald-50 px-1.5 py-0.5 ring-1 ring-emerald-200">Excellent</div>
            </div>
            <ul className="mt-3 space-y-1.5 text-[11px]">
              {[
                { label:"Integrity Score", v:"0.95", tone:"emerald" as Tone },
                { label:"Orphan Rate",     v:"0.02%",tone:"blue"    as Tone },
                { label:"Coverage",        v:"98.2%",tone:"emerald" as Tone },
                { label:"Confidence Avg",  v:"0.93", tone:"emerald" as Tone },
              ].map(x=>(
                <li key={x.label} className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-slate-600"><span className={`h-2 w-2 rounded-full ${T[x.tone].dot}`}/>{x.label}</span>
                  <span className="tabular-nums font-medium">{x.v}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top graph queries */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Top Graph Queries (7D)</div>
            <ul className="mt-2 divide-y divide-slate-100">
              {topQueries.map(q=>(
                <li key={q.q} className="py-1.5 flex items-center justify-between text-[11px] hover:bg-slate-50 rounded-md px-1 -mx-1 cursor-pointer">
                  <span className="text-slate-800 font-medium truncate">{q.q}</span>
                  <span className="ml-2 text-emerald-700 tabular-nums font-semibold">{q.success}%</span>
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
            <div className="text-sm font-semibold text-slate-900">How the Relationship Intelligence Engine Works</div>
            <div className="text-[11px] text-slate-500">Engineering services that discover, resolve, validate, and publish graph edges</div>
          </div>
          <div className="text-[11px] text-slate-500">Lower 40% · Engineering Transparency</div>
        </div>

        {/* Pipeline */}
        <div className="mt-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-[1200px]">
            {pipelineStages.map((s,i)=>(
              <div key={s} className="flex items-center">
                <button onClick={()=>openDrawer(selected)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-indigo-300 hover:shadow-sm transition text-left w-[140px]">
                  <div className="text-[10px] uppercase text-slate-400">Stage {i+1}</div>
                  <div className="text-[12px] font-semibold text-slate-800 leading-tight">{s}</div>
                </button>
                {i<pipelineStages.length-1 && (
                  <div className="mx-1 flex items-center gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse"/>
                    <span className="h-1 w-1 rounded-full bg-indigo-400 animate-pulse [animation-delay:120ms]"/>
                    <span className="h-1 w-1 rounded-full bg-indigo-300 animate-pulse [animation-delay:240ms]"/>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-4">
          {/* Key Resolution Engine */}
          <div className="col-span-12 lg:col-span-4 rounded-lg border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Key className="h-4 w-4 text-blue-600"/>Key Resolution Engine</div>
            <ol className="mt-2 space-y-1">
              {["Incoming Keys","Normalization","Composite Keys","Natural Keys","Hash Keys","Relationship Candidate","Confidence","Accepted Relationship","Graph Edge"].map((s,i)=>(
                <li key={s} className="flex items-center gap-2 text-[11px] rounded-md border border-slate-100 p-1.5 hover:bg-slate-50">
                  <span className="h-5 w-5 rounded bg-blue-50 text-blue-700 grid place-items-center text-[10px] font-bold">{i+1}</span>
                  <span className="text-slate-800">{s}</span>
                  <span className="ml-auto text-[10px] text-slate-500 tabular-nums">c={(0.86+i*0.01).toFixed(2)}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Live Graph Projection (dark) */}
          <div className="col-span-12 lg:col-span-4 rounded-lg bg-slate-950 text-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold flex items-center gap-2"><Cpu className="h-4 w-4"/>Live Graph Projection</div>
              <button className="p-1 rounded hover:bg-white/10"><RefreshCw className="h-3.5 w-3.5"/></button>
            </div>
            <div className="mt-3 space-y-1 text-[11px] font-mono">
              {[
                "discover › pk=device_id src=CMDB   hits=482/s",
                "resolve  › fk device→site match=0.98",
                "correlate› ck hostname~serial score=0.91",
                "infer    › rule→app N:N conf=0.92",
                "validate › cycles=0 orphans=0.02%",
                "publish  › edges/s=624 nodes/s=142",
              ].map((line,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-500 w-14 tabular-nums">10:32:{String(11+i).padStart(2,"0")}</span>
                  <span className="text-teal-400">▸</span>
                  <span className="text-slate-200 truncate">{line}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[["Nodes/s","142"],["Edges/s","624"],["Traversal","8ms"],["Workers","32"]].map(([k,v])=>(
                <div key={k} className="rounded bg-white/5 p-1.5">
                  <div className="text-[10px] text-slate-400">{k}</div>
                  <div className="text-[12px] font-bold tabular-nums">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Query Path Explorer */}
          <div className="col-span-12 lg:col-span-4 rounded-lg border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-2"><RouteIcon className="h-4 w-4 text-violet-600"/>Query Path Explorer</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <label className="col-span-1">
                <div className="text-slate-500">From</div>
                <select className="w-full mt-1 py-1 px-1.5 border border-slate-200 rounded">
                  {entities.map(e=><option key={e.id}>{e.name}</option>)}
                </select>
              </label>
              <label className="col-span-1">
                <div className="text-slate-500">To</div>
                <select defaultValue="Alert" className="w-full mt-1 py-1 px-1.5 border border-slate-200 rounded">
                  {entities.map(e=><option key={e.id}>{e.name}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-2 rounded-md bg-slate-50 p-2">
              <div className="text-[10px] uppercase text-slate-500 font-semibold">Suggested Path</div>
              <div className="mt-1 flex items-center flex-wrap gap-1 text-[11px]">
                {["Device","Interface","Route","Rule","Alert"].map((n,i,a)=>(
                  <span key={n} className="inline-flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-800">{n}</span>
                    {i<a.length-1 && <ArrowRight className="h-3 w-3 text-slate-400"/>}
                  </span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px]">
                <div className="rounded bg-white p-1"><div className="text-slate-500">Success</div><div className="font-bold text-emerald-700">98.7%</div></div>
                <div className="rounded bg-white p-1"><div className="text-slate-500">Latency</div><div className="font-bold">12ms</div></div>
                <div className="rounded bg-white p-1"><div className="text-slate-500">Cost</div><div className="font-bold">4 hops</div></div>
              </div>
            </div>
            <button className="mt-2 w-full text-[11px] py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center justify-center gap-1"><PlayCircle className="h-3 w-3"/>Replay Graph Traversal</button>
          </div>
        </div>

        {/* Bottom widgets */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[12px] font-semibold text-slate-900 flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-emerald-600"/>Key &amp; Relationship Quality (7D)</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
              {[["PK Coverage","99.1%","≥ 98%"],["FK Integrity","98.4%","≥ 95%"],["CK Hit","96.7%","≥ 90%"],["Orphan Rate","0.02%","≤ 1%"],["Rel Validity","98.6%","≥ 95%"],["Conf Avg","0.93","≥ 0.90"]].map(([k,v,t])=>(
                <div key={k} className="rounded bg-slate-50 p-1.5">
                  <div className="text-slate-500">{k}</div>
                  <div className="text-sm font-bold text-slate-900 tabular-nums">{v}</div>
                  <div className="text-emerald-700 text-[9px]">{t}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[12px] font-semibold text-slate-900 flex items-center gap-1.5"><GitBranch className="h-3.5 w-3.5 text-indigo-600"/>Recent Key &amp; Relationship Changes</div>
            <ul className="mt-2 space-y-1 text-[11px]">
              {[
                ["New FK: alert.rule_id → rule.rule_id","10:18 · System"],
                ["New CK: device.mgmt_ip","09:55 · Auto-Discovery"],
                ["Updated: tunnel.peer_device_id → device.device_id","09:32 · Engineering"],
                ["Deprecated Key: user.old_sam_account","May 11 · Cleanup"],
              ].map(([m,s])=>(
                <li key={m} className="flex items-center justify-between gap-2">
                  <span className="text-slate-800 truncate">{m}</span>
                  <span className="text-slate-500 text-[10px] shrink-0">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[12px] font-semibold text-slate-900 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-rose-600"/>Top Orphan &amp; Integrity Issues (7D)</div>
            <ul className="mt-2 space-y-1 text-[11px]">
              {orphanIssues.map(o=>(
                <li key={o.label} className="flex items-center justify-between">
                  <span className="text-slate-700 truncate">{o.label}</span>
                  <span className="tabular-nums font-semibold text-rose-700">{o.count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 bg-white">
            <div className="text-[12px] font-semibold text-slate-900 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-emerald-600"/>Graph Growth</div>
            <ul className="mt-2 space-y-1 text-[11px]">
              {[
                ["Nodes: 15 → 15",     "held"],
                ["Edges: 199 → 236",   "+18.6%"],
                ["Density: 0.62 → 0.71","+14.5%"],
                ["Traversal p95: 14ms → 12ms","-14%"],
              ].map(([m,s])=>(
                <li key={m} className="flex items-center justify-between">
                  <span className="text-slate-700">{m}</span>
                  <span className="text-emerald-700 text-[10px] font-semibold">{s}</span>
                </li>
              ))}
            </ul>
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
                {isEdge(drawer) ? (
                  <>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Relationship Edge · {drawer.type}</div>
                    <div className="text-lg font-semibold text-slate-900 mt-1">{drawer.from} → {drawer.to}</div>
                    <div className="text-[12px] text-slate-500">Label: <span className="font-mono">{drawer.label}</span> · Confidence <span className="font-semibold text-emerald-700">{drawer.conf.toFixed(2)}</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-lg grid place-items-center ${T[(drawer as Entity).tone].bg}`}><(drawer as Entity).icon className={`h-4 w-4 ${T[(drawer as Entity).tone].text}`}/></div>
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-semibold">Canonical Entity · {(drawer as Entity).version}</div>
                        <div className="text-lg font-semibold text-slate-900">{(drawer as Entity).name}</div>
                      </div>
                    </div>
                    <div className="mt-1 text-[12px] text-slate-500">PK <span className="font-mono">{(drawer as Entity).pk}</span> · {(drawer as Entity).relationships} relationships</div>
                  </>
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
                    <p className="mt-1">{isEdge(drawer)
                      ? `The ${drawer.label} relationship connects ${drawer.from} → ${drawer.to} with ${drawer.type} cardinality, enabling multi-dimensional queries and root-cause traversals.`
                      : `${(drawer as Entity).name} participates in ${(drawer as Entity).relationships} graph relationships, powering ${(drawer as Entity).owner}-owned analytics, automations, and AI features.`}
                    </p>
                  </div>
                  {!isEdge(drawer) && (
                    <div className="grid grid-cols-2 gap-2">
                      {[["Primary Key",(drawer as Entity).pk],["Coverage",`${(drawer as Entity).coverage}%`],["Quality",(drawer as Entity).quality.toFixed(2)],["Confidence",(drawer as Entity).confidence.toFixed(2)]].map(([k,v])=>(
                        <div key={k} className="rounded-md bg-slate-50 p-2"><div className="text-[10px] text-slate-500">{k}</div><div className="font-semibold text-slate-900 font-mono">{v}</div></div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {drawerTab==="engineering" && (
                <div className="space-y-1.5">
                  {["Primary key discovery","Foreign key mapping","Composite key generation","Relationship inference","Graph edge creation","Confidence engine","Cardinality validation","Temporal relationship engine","Topology resolution","Knowledge graph publishing"].map((s,i)=>(
                    <div key={s} className="flex items-center gap-2 rounded-md border border-slate-200 p-2">
                      <div className="h-6 w-6 rounded bg-indigo-50 text-indigo-600 grid place-items-center text-[10px] font-semibold">{i+1}</div>
                      <div className="text-slate-800 font-medium">{s}</div>
                      <div className="ml-auto text-[10px] text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/>Active</div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab==="telemetry" && (
                <div className="grid grid-cols-2 gap-2">
                  {[["Relationships/s","324"],["Edges/s","624"],["Traversal p95","12ms"],["Graph update p95","28ms"],["CPU","32%"],["Memory","5.4GB"],["Rel cache hit","94.1%"],["Confidence avg","0.93"],["Workers","32"],["Queue depth","6"],["Errors","0"],["Uptime","99.98%"]].map(([k,v])=>(
                    <div key={k} className="rounded-md bg-slate-50 p-2"><div className="text-[10px] text-slate-500">{k}</div><div className="font-semibold text-slate-900 tabular-nums">{v}</div></div>
                  ))}
                </div>
              )}

              {drawerTab==="simulation" && (
                <div className="space-y-3">
                  <label className="block">
                    <div className="flex justify-between text-[11px]"><span>Confidence threshold</span><span className="tabular-nums">{simConfidence.toFixed(2)}</span></div>
                    <input type="range" min={0.5} max={1} step={0.01} value={simConfidence} onChange={e=>setSimConfidence(parseFloat(e.target.value))} className="w-full accent-indigo-600"/>
                  </label>
                  <label className="block">
                    <div className="flex justify-between text-[11px]"><span>Topology completeness</span><span className="tabular-nums">{simTopology.toFixed(2)}</span></div>
                    <input type="range" min={0.5} max={1} step={0.01} value={simTopology} onChange={e=>setSimTopology(parseFloat(e.target.value))} className="w-full accent-indigo-600"/>
                  </label>
                  <div className="rounded-md bg-slate-950 text-slate-100 p-3 text-[11px] font-mono">
                    <div>projected_edges = {(236*(0.5+simConfidence/2)*(0.6+simTopology*0.4)).toFixed(0)}</div>
                    <div>projected_orphans = {Math.max(0, Math.round(12842*(1-simTopology)))}</div>
                    <div>projected_path_success = {(94.1*simConfidence).toFixed(1)}%</div>
                    <div>projected_traversal_p95 = {(20-simTopology*8).toFixed(0)}ms</div>
                  </div>
                  <p className="text-[11px] text-slate-500">In-memory simulation; live graph is unaffected.</p>
                </div>
              )}

              {drawerTab==="dependencies" && (
                <ul className="space-y-1.5">
                  {["Canonical Model","Hydration Engine","Validation Engine","Knowledge Graph","AI Models","Operational APIs","Dashboards","Automation","Ownership","Risk: Low"].map(x=>(
                    <li key={x} className="flex items-center gap-2 rounded-md border border-slate-200 p-2"><Link2 className="h-3.5 w-3.5 text-indigo-600"/>{x}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3"/>Graph integrity verified</span>
              <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"><Download className="h-3 w-3"/>Export</button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
