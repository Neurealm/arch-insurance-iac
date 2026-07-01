import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plug, CheckCircle2, Lock, Users, Key, ShieldCheck, AlertTriangle, RefreshCw,
  Filter, Download, Search, Settings2, ChevronRight, Info,
  Database, Cloud, Cpu, Activity, Workflow, GitBranch, Boxes, Zap,
  FileText, Server, Shield, Timer, Clock, Share2, Network, Fingerprint,
  ClipboardCheck, Layers, Radio,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------------- Tokens ---------------- */
type Tone = "emerald" | "blue" | "amber" | "violet" | "rose" | "cyan" | "slate" | "teal";
const tone = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200", hex: "#10b981" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    ring: "ring-blue-200",    hex: "#3b82f6" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   ring: "ring-amber-200",   hex: "#f59e0b" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-600",  ring: "ring-violet-200",  hex: "#8b5cf6" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-600",    ring: "ring-rose-200",    hex: "#f43f5e" },
  cyan:    { bg: "bg-cyan-50",    text: "text-cyan-600",    ring: "ring-cyan-200",    hex: "#06b6d4" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-600",   ring: "ring-slate-200",   hex: "#64748b" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-600",    ring: "ring-teal-200",    hex: "#14b8a6" },
} as const;

const KPIS = [
  { icon: Plug,         label: "Total Connectors",         value: "122",   sub: "100% of in-scope", delta: "+4",   tone: "blue"    as Tone, spark: [110,114,116,118,120,121,122] },
  { icon: CheckCircle2, label: "Active Connectors",        value: "108",   sub: "88.5%",             delta: "+2",   tone: "emerald" as Tone, spark: [98,100,102,104,106,107,108] },
  { icon: Lock,         label: "Read-Only Connections",    value: "116",   sub: "95.1%",             delta: "+3",   tone: "cyan"    as Tone, spark: [102,105,108,110,112,114,116] },
  { icon: Users,        label: "Service Accounts",         value: "64",    sub: "52.5%",             delta: "+1",   tone: "violet"  as Tone, spark: [58,59,60,61,62,63,64] },
  { icon: Key,          label: "API Keys",                 value: "37",    sub: "30.3%",             delta: "-2",   tone: "amber"   as Tone, spark: [42,41,40,39,38,38,37] },
  { icon: ShieldCheck,  label: "Governance Compliance",    value: "96.7%", sub: "Policy adherence",  delta: "+0.4", tone: "emerald" as Tone, spark: [93,94,95,95.8,96.2,96.5,96.7] },
  { icon: AlertTriangle,label: "Security Findings",        value: "2",     sub: "1.6% of fleet",     delta: "-1",   tone: "rose"    as Tone, spark: [5,4,4,3,3,3,2] },
  { icon: RefreshCw,    label: "Credential Rotation",      value: "98.9%", sub: "Auto ≤ 90 days",    delta: "+0.2", tone: "teal"    as Tone, spark: [95,96,97,98,98.4,98.7,98.9] },
];

type AuthType = "Service Account" | "API Key" | "OAuth" | "SSH Key" | "IAM Role" | "MCP" | "Certificate";
const authStyle: Record<AuthType, { bg: string; text: string }> = {
  "Service Account": { bg: "bg-blue-50",    text: "text-blue-700" },
  "API Key":         { bg: "bg-amber-50",   text: "text-amber-700" },
  "OAuth":           { bg: "bg-violet-50",  text: "text-violet-700" },
  "SSH Key":         { bg: "bg-purple-50",  text: "text-purple-700" },
  "IAM Role":        { bg: "bg-emerald-50", text: "text-emerald-700" },
  "MCP":             { bg: "bg-cyan-50",    text: "text-cyan-700" },
  "Certificate":     { bg: "bg-rose-50",    text: "text-rose-700" },
};

type Row = {
  name: string; desc: string; platform: string; icon: any; iconTone: Tone;
  connectorType: string; accessMethod: string; auth: AuthType;
  access: string; credOwner: string; approver: string;
  status: "Secure" | "Warning" | "Critical"; policy: string;
  credAge: number; lastRotation: string; latency: number; lastSync: string; health: number;
};

const ROWS: Row[] = [
  { name:"panw_ngfw_traffic_raw",   desc:"NGFW Traffic Logs",     platform:"Cortex XSIAM",   icon:Shield,  iconTone:"amber",   connectorType:"XQL",       accessMethod:"XQL API",     auth:"Service Account", access:"Read Only", credOwner:"SecOps Platform", approver:"Ravi Shankar", status:"Secure",  policy:"v4.2.1", credAge:22, lastRotation:"May 05 2025", latency:18, lastSync:"10:12 AM", health:98 },
  { name:"panw_ngfw_system_raw",    desc:"NGFW System Events",    platform:"Cortex XSIAM",   icon:Shield,  iconTone:"amber",   connectorType:"XQL",       accessMethod:"XQL API",     auth:"Service Account", access:"Read Only", credOwner:"SecOps Platform", approver:"Ravi Shankar", status:"Secure",  policy:"v4.2.1", credAge:22, lastRotation:"May 05 2025", latency:22, lastSync:"09:58 AM", health:96 },
  { name:"firewall_threat_logs",    desc:"Threat/URL/Content",    platform:"Cortex XSIAM",   icon:Shield,  iconTone:"slate",   connectorType:"XQL",       accessMethod:"XQL API",     auth:"Service Account", access:"Read Only", credOwner:"Threat Intel Team", approver:"Arjun Kumar", status:"Secure", policy:"v4.2.1", credAge:41, lastRotation:"Apr 12 2025", latency:31, lastSync:"09:45 AM", health:94 },
  { name:"vpn_globalprotect_logs",  desc:"GlobalProtect VPN Logs",platform:"Cortex XSIAM",   icon:Shield,  iconTone:"amber",   connectorType:"XQL",       accessMethod:"XQL API",     auth:"Service Account", access:"Read Only", credOwner:"Network Ops",       approver:"Priya J.",     status:"Secure",  policy:"v4.2.1", credAge:14, lastRotation:"May 12 2025", latency:19, lastSync:"09:41 AM", health:97 },
  { name:"gcp_billing_export",      desc:"GCP Billing Export",    platform:"Google BigQuery",icon:Database,iconTone:"blue",    connectorType:"SQL",       accessMethod:"BigQuery SQL",auth:"Service Account", access:"Read Only", credOwner:"FinOps",            approver:"Suresh B.",    status:"Secure",  policy:"v3.8.0", credAge:8,  lastRotation:"May 18 2025", latency:74, lastSync:"10:10 AM", health:92 },
  { name:"gcp_cloud_audit_logs",    desc:"Cloud Audit Logs",      platform:"Google BigQuery",icon:Database,iconTone:"blue",    connectorType:"SQL",       accessMethod:"BigQuery SQL",auth:"Service Account", access:"Read Only", credOwner:"Cloud Ops",         approver:"Naveen K.",    status:"Secure",  policy:"v3.8.0", credAge:8,  lastRotation:"May 18 2025", latency:68, lastSync:"10:05 AM", health:95 },
  { name:"logicmonitor_device_stats",desc:"Device Performance Stats", platform:"LogicMonitor", icon:Activity, iconTone:"emerald", connectorType:"REST API", accessMethod:"REST API", auth:"API Key",         access:"Read Only", credOwner:"Infra Ops",         approver:"Meena R.",     status:"Secure",  policy:"v2.1.4", credAge:56, lastRotation:"Mar 28 2025", latency:112, lastSync:"09:50 AM", health:89 },
  { name:"logicmonitor_alerts",     desc:"Infrastructure Alerts", platform:"LogicMonitor",   icon:Activity,iconTone:"emerald", connectorType:"REST API", accessMethod:"REST API",  auth:"API Key",         access:"Read Only", credOwner:"Infra Ops",         approver:"Meena R.",     status:"Secure",  policy:"v2.1.4", credAge:56, lastRotation:"Mar 28 2025", latency:98,  lastSync:"09:48 AM", health:91 },
  { name:"datadog_metrics",         desc:"Metrics & Events",      platform:"Datadog",        icon:Activity,iconTone:"violet",  connectorType:"REST API", accessMethod:"REST API",  auth:"API Key",         access:"Read Only", credOwner:"Cloud Ops",         approver:"Naveen K.",    status:"Secure",  policy:"v2.1.4", credAge:12, lastRotation:"May 14 2025", latency:64,  lastSync:"10:01 AM", health:96 },
  { name:"k8s_cluster_logs",        desc:"Kubernetes Cluster Logs", platform:"Kubernetes API", icon:Cpu,   iconTone:"cyan",   connectorType:"MCP",       accessMethod:"MCP Tool",    auth:"MCP",             access:"Read Only", credOwner:"Platform Eng",      approver:"Arjun Kumar",  status:"Warning", policy:"v1.9.7", credAge:82, lastRotation:"Mar 04 2025", latency:41,  lastSync:"08:22 AM", health:74 },
  { name:"file_ingest_sftp",        desc:"Partner Data Ingest",   platform:"SFTP Server",    icon:Server,  iconTone:"slate",   connectorType:"SFTP",      accessMethod:"SFTP",        auth:"SSH Key",         access:"Read Only", credOwner:"Data Engineering",  approver:"Ravi Shankar", status:"Secure",  policy:"v2.0.0", credAge:44, lastRotation:"Apr 09 2025", latency:210, lastSync:"09:30 AM", health:88 },
  { name:"threat_intel_feeds",      desc:"External Threat Feeds", platform:"Public API",     icon:Radio,   iconTone:"emerald", connectorType:"REST API", accessMethod:"REST API",  auth:"API Key",         access:"Read Only", credOwner:"Threat Intel Team", approver:"Arjun Kumar",  status:"Secure",  policy:"v2.1.4", credAge:19, lastRotation:"May 07 2025", latency:180, lastSync:"09:55 AM", health:93 },
];

const AUTH_SEG = [
  { label: "Service Accounts",  value: 64, color: tone.blue.hex },
  { label: "API Keys",          value: 37, color: tone.amber.hex },
  { label: "OAuth",             value: 8,  color: tone.violet.hex },
  { label: "SSH Keys",          value: 7,  color: "#a855f7" },
  { label: "IAM Roles",         value: 6,  color: tone.emerald.hex },
  { label: "MCP",               value: 5,  color: tone.cyan.hex },
  { label: "Certificates",      value: 3,  color: tone.rose.hex },
];

const CONN_SEG = [
  { label: "XQL",           value: 39, color: tone.blue.hex },
  { label: "REST API",      value: 33, color: tone.amber.hex },
  { label: "BigQuery SQL",  value: 22, color: tone.emerald.hex },
  { label: "MCP Tool",      value: 9,  color: tone.violet.hex },
  { label: "SFTP",          value: 7,  color: tone.cyan.hex },
  { label: "GraphQL",       value: 5,  color: tone.rose.hex },
  { label: "Streaming",     value: 4,  color: tone.teal.hex },
  { label: "Kafka",         value: 3,  color: "#a855f7" },
];

/* ---------------- Sparkline ---------------- */
function Spark({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v,i) => `${(i/(data.length-1))*100},${30 - ((v-min)/range)*28}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" className="h-8 w-full">
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts}/>
    </svg>
  );
}

/* ---------------- Donut ---------------- */
function Donut({ segments, centerTitle, centerSub }: { segments: { label: string; value: number; color: string }[]; centerTitle: string; centerSub: string; }) {
  const total = segments.reduce((a,b)=>a+b.value,0);
  let acc = 0;
  const R = 55, C = 2*Math.PI*R;
  return (
    <svg viewBox="0 0 160 160" className="w-[150px] h-[150px]">
      <circle cx={80} cy={80} r={R} fill="none" stroke="#f1f5f9" strokeWidth={16}/>
      {segments.map((s,i) => {
        const frac = s.value/total;
        const dash = frac * C;
        const off = (acc / total) * C;
        acc += s.value;
        return (
          <circle key={i} cx={80} cy={80} r={R} fill="none"
            stroke={s.color} strokeWidth={16}
            strokeDasharray={`${dash} ${C-dash}`} strokeDashoffset={-off}
            transform="rotate(-90 80 80)"/>
        );
      })}
      <text x={80} y={78} textAnchor="middle" fontSize={18} fontWeight={700} fill="#0f172a">{centerTitle}</text>
      <text x={80} y={94} textAnchor="middle" fontSize={9} fill="#64748b">{centerSub}</text>
    </svg>
  );
}

/* ---------------- Page ---------------- */
export default function ConnectorAccessGovernanceRegistry() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Row>(ROWS[0]);
  const [drawer, setDrawer] = useState<{ open: boolean; title: string }>({ open: false, title: "" });
  const [q, setQ] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 1000), 1400);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(
    () => ROWS.filter(r => (r.name + r.platform + r.desc).toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  const open = (title: string) => setDrawer({ open: true, title });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-slate-200">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Connector, Access &amp; Governance Registry</h1>
            <p className="mt-2 text-slate-600 max-w-3xl">
              Securely govern how enterprise data sources connect into the Data Orchestration Platform.
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-3xl">
              Every connector is continuously monitored for authentication health, governance compliance, credential lifecycle, access policy, telemetry, ownership, and operational readiness.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500">Last Updated <b className="text-slate-700">May 12, 2025 10:32 AM</b></span>
            <button onClick={()=>open("Filters")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              <Filter size={14}/> Filters
            </button>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search connectors…"
                className="pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-100"/>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">
              <Download size={14}/> Export Registry
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="px-8 py-5 grid grid-cols-8 gap-3">
        {KPIS.map((k) => (
          <button key={k.label} onClick={()=>open(k.label)}
            className="group text-left rounded-xl border border-slate-200 bg-white p-3 hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="flex items-center justify-between">
              <div className={`h-8 w-8 rounded-lg ${tone[k.tone].bg} ${tone[k.tone].text} flex items-center justify-center`}>
                <k.icon size={16}/>
              </div>
              <span className={`text-[10px] font-semibold ${k.delta.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>{k.delta}</span>
            </div>
            <div className="mt-2 text-[10px] font-medium text-slate-500">{k.label}</div>
            <div className="text-lg font-bold text-slate-900">{k.value}</div>
            <div className="text-[10px] text-slate-500">{k.sub}</div>
            <Spark data={k.spark} color={tone[k.tone].hex}/>
          </button>
        ))}
      </div>

      {/* Main 60/40 */}
      <div className="px-8 pb-6 grid grid-cols-12 gap-4">
        {/* Grid */}
        <div className="col-span-8 rounded-xl border border-slate-200 bg-white">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">Connector &amp; Access Inventory</div>
              <div className="text-xs text-slate-500">Click any row to load into the Governance Intelligence panel</div>
            </div>
            <div className="text-[11px] text-slate-500">Showing {rows.length} of 122 connectors</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-100">
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-2 py-2 font-medium">Platform</th>
                  <th className="px-2 py-2 font-medium">Type</th>
                  <th className="px-2 py-2 font-medium">Access Method</th>
                  <th className="px-2 py-2 font-medium">Auth Type</th>
                  <th className="px-2 py-2 font-medium">Access</th>
                  <th className="px-2 py-2 font-medium">Owner</th>
                  <th className="px-2 py-2 font-medium">Approver</th>
                  <th className="px-2 py-2 font-medium">Security</th>
                  <th className="px-2 py-2 font-medium">Last Sync</th>
                  <th className="px-2 py-2 font-medium text-right">Health</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const active = selected.name === r.name;
                  const t = tone[r.iconTone];
                  return (
                    <tr key={r.name}
                      onClick={()=>setSelected(r)}
                      className={`cursor-pointer border-b border-slate-100 transition
                        ${active ? "bg-blue-50/60" : "hover:bg-slate-50"}`}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-lg ${t.bg} ${t.text} flex items-center justify-center`}>
                            <r.icon size={13}/>
                          </div>
                          <div>
                            <div className="font-mono text-[11px] font-semibold text-slate-900">{r.name}</div>
                            <div className="text-[10px] text-slate-500">{r.desc}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-slate-700">{r.platform}</td>
                      <td className="px-2 py-2">
                        <span className="inline-flex rounded bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[10px] font-medium">{r.connectorType}</span>
                      </td>
                      <td className="px-2 py-2 text-slate-700">{r.accessMethod}</td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${authStyle[r.auth].bg} ${authStyle[r.auth].text}`}>
                          {r.auth === "API Key" && <Key size={10} className="mr-0.5 self-center"/>}
                          {r.auth}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-slate-700">{r.access}</td>
                      <td className="px-2 py-2 text-slate-700">{r.credOwner}</td>
                      <td className="px-2 py-2 text-slate-700">{r.approver}</td>
                      <td className="px-2 py-2">
                        {r.status === "Secure" && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-medium">
                            <ShieldCheck size={12}/> Secure
                          </span>
                        )}
                        {r.status === "Warning" && (
                          <span className="inline-flex items-center gap-1 text-amber-600 text-[11px] font-medium">
                            <AlertTriangle size={12}/> Warning
                          </span>
                        )}
                        {r.status === "Critical" && (
                          <span className="inline-flex items-center gap-1 text-rose-600 text-[11px] font-medium">
                            <AlertTriangle size={12}/> Critical
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-slate-600">
                        <div>May 12, 2025</div>
                        <div className="text-[10px] text-slate-400">{r.lastSync}</div>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="inline-flex flex-col items-end">
                          <div className={`text-sm font-bold ${r.health >= 90 ? "text-emerald-600" : r.health >= 75 ? "text-amber-600" : "text-rose-600"}`}>{r.health}</div>
                          <div className="w-14 h-1 rounded bg-slate-100 overflow-hidden">
                            <div className={`h-full ${r.health >= 90 ? "bg-emerald-500" : r.health >= 75 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${r.health}%`}}/>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Info size={12}/> All connectors enforce least-privilege access and are monitored for security posture, credential rotation, and usage.
            </div>
            <div>Policy engine v4.2.1 · Rotation SLA ≤ 90 days</div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-4 space-y-4">
          {/* Selected connector */}
          <button onClick={()=>open(selected.name)}
            className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-9 w-9 rounded-lg ${tone[selected.iconTone].bg} ${tone[selected.iconTone].text} flex items-center justify-center`}>
                  <selected.icon size={17}/>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Governance Intelligence</div>
                  <div className="font-mono font-semibold text-slate-900 text-sm">{selected.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${selected.health >= 90 ? "text-emerald-600" : "text-amber-600"}`}>
                  {selected.health}
                </div>
                <div className="text-[10px] text-slate-500">Connector Health</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
              {[
                ["Auth", selected.auth],
                ["Access", selected.access],
                ["Owner", selected.credOwner],
                ["Approver", selected.approver],
                ["Policy", selected.policy],
                ["Cred Age", `${selected.credAge}d`],
              ].map(([l,v]) => (
                <div key={l} className="rounded-md bg-slate-50 p-2">
                  <div className="text-slate-500">{l}</div>
                  <div className="font-semibold text-slate-800 truncate">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 text-emerald-600"><ShieldCheck size={12}/> Certificate valid · 218d</span>
              <span className="inline-flex items-center gap-1 text-slate-600"><Timer size={12}/> Latency {selected.latency}ms</span>
            </div>
          </button>

          {/* Auth Distribution */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="font-semibold text-slate-900 text-sm mb-2">Authentication Type</div>
            <div className="flex items-center gap-3">
              <Donut segments={AUTH_SEG} centerTitle="122" centerSub="Connectors"/>
              <div className="flex-1 space-y-1 text-[10px]">
                {AUTH_SEG.map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{background: s.color}}/>
                      <span className="text-slate-700">{s.label}</span>
                    </div>
                    <span className="text-slate-500 font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Connector Distribution */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="font-semibold text-slate-900 text-sm mb-2">Access Method Distribution</div>
            <div className="flex items-center gap-3">
              <Donut segments={CONN_SEG} centerTitle="122" centerSub="Methods"/>
              <div className="flex-1 space-y-1 text-[10px]">
                {CONN_SEG.map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{background: s.color}}/>
                      <span className="text-slate-700">{s.label}</span>
                    </div>
                    <span className="text-slate-500 font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Governance Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="font-semibold text-slate-900 text-sm mb-2">Governance Summary</div>
            <div className="space-y-1.5 text-[11px]">
              {[
                ["Read-Only Access", "116 (95.1%)", "emerald"],
                ["Approvals Up to Date", "118 (96.7%)", "emerald"],
                ["Credential Rotation OK", "104 (85.2%)", "emerald"],
                ["Expiring Credentials (30d)", "3 (2.5%)", "amber"],
                ["Security Issues", "2 (1.6%)", "rose"],
              ].map(([l,v,c]) => (
                <div key={l} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 size={12} className={c === "emerald" ? "text-emerald-500" : c === "amber" ? "text-amber-500" : "text-rose-500"}/>
                    <span>{l}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>open("Governance Dashboard")} className="mt-3 text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1">
              View Governance Dashboard <ChevronRight size={12}/>
            </button>
          </div>
        </div>
      </div>

      {/* Engineering Transparency Zone */}
      <div className="px-8 pb-6 grid grid-cols-12 gap-4">
        {/* Pipeline + Architecture */}
        <div className="col-span-8 rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3">
            <div className="text-sm font-semibold text-slate-900">How Secure Connectivity Is Engineered</div>
            <div className="text-[11px] text-slate-500">Every connector becomes a trusted enterprise integration through this engineered pipeline</div>
          </div>

          {/* Connector Engineering Pipeline */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4">
            <div className="grid grid-cols-10 gap-2 items-center">
              {[
                { label: "Source System",         icon: Database,       tone: "blue"    as Tone },
                { label: "Connector Selection",   icon: Plug,           tone: "cyan"    as Tone },
                { label: "Authentication",        icon: Fingerprint,    tone: "violet"  as Tone },
                { label: "Secrets Retrieval",     icon: Key,            tone: "amber"   as Tone },
                { label: "Authorization",         icon: Shield,         tone: "emerald" as Tone },
                { label: "Connection Validation", icon: CheckCircle2,   tone: "emerald" as Tone },
                { label: "Schema Verification",   icon: FileText,       tone: "cyan"    as Tone },
                { label: "Metadata Registration", icon: Boxes,          tone: "violet"  as Tone },
                { label: "Monitoring",            icon: Activity,       tone: "amber"   as Tone },
                { label: "Operational",           icon: Zap,            tone: "emerald" as Tone },
              ].map((s, i, arr) => (
                <div key={s.label} className="relative flex flex-col items-center">
                  <button onClick={()=>open(s.label)}
                    className={`h-10 w-10 rounded-lg ${tone[s.tone].bg} ${tone[s.tone].text} flex items-center justify-center hover:scale-110 transition`}>
                    <s.icon size={16}/>
                  </button>
                  <div className="mt-2 text-[9px] text-center text-slate-600 leading-tight">{s.label}</div>
                  {i < arr.length - 1 && (
                    <div className="absolute top-5 left-[calc(100%-4px)] w-[calc(100%-32px)] h-px bg-gradient-to-r from-slate-300 to-slate-200">
                      <div className="h-full w-6 bg-blue-500 animate-[flow_2.2s_linear_infinite]"
                        style={{ animationDelay: `${i * 0.14}s` }}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Governance Rule Engine */}
          <div className="mt-4 grid grid-cols-10 gap-2">
            {[
              ["Identity",       "PASS"],
              ["Role",           "PASS"],
              ["Least Privilege","PASS"],
              ["Policy",         "PASS"],
              ["Network",        "PASS"],
              ["Encryption",     "PASS"],
              ["Secret Exp.",    "WARN"],
              ["Certificate",    "PASS"],
              ["Logging",        "PASS"],
              ["Compliance",     "PASS"],
            ].map(([l, v]) => {
              const color = v === "PASS" ? "emerald" : v === "WARN" ? "amber" : "rose";
              return (
                <button key={l} onClick={()=>open(`${l} Rule`)}
                  className={`rounded-lg border p-2 text-center hover:shadow transition
                    ${color === "emerald" ? "border-emerald-200 bg-emerald-50" : color === "amber" ? "border-amber-200 bg-amber-50" : "border-rose-200 bg-rose-50"}`}>
                  <div className={`text-[10px] font-bold ${color === "emerald" ? "text-emerald-700" : color === "amber" ? "text-amber-700" : "text-rose-700"}`}>{v}</div>
                  <div className="text-[9px] text-slate-600 mt-0.5">{l}</div>
                </button>
              );
            })}
          </div>

          {/* Approval Workflow */}
          <div className="mt-5">
            <div className="text-sm font-semibold text-slate-900 mb-2">Approval Workflow</div>
            <div className="flex items-center gap-2">
              {[
                { l: "Request",       n: "3",   sub: "Pending",     icon: ClipboardCheck, tone: "slate" as Tone },
                { l: "Architecture",  n: "5",   sub: "In Review",   icon: Layers,         tone: "blue"  as Tone },
                { l: "Security",      n: "4",   sub: "In Review",   icon: Shield,         tone: "violet" as Tone },
                { l: "IAM Approval",  n: "118", sub: "Approved",    icon: Fingerprint,    tone: "emerald" as Tone },
                { l: "Provision",     n: "108", sub: "Provisioned", icon: Settings2,      tone: "emerald" as Tone },
                { l: "Testing",       n: "108", sub: "Passed",      icon: CheckCircle2,   tone: "emerald" as Tone },
                { l: "Production",    n: "108", sub: "Live",        icon: Zap,            tone: "cyan"  as Tone },
                { l: "Monitoring",    n: "122", sub: "Tracked",     icon: Activity,       tone: "teal"  as Tone },
              ].map((s, i, arr) => (
                <div key={s.l} className="flex-1 relative">
                  <button onClick={()=>open(s.l)} className={`w-full rounded-lg border border-slate-200 p-2 hover:shadow transition text-left`}>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-6 w-6 rounded ${tone[s.tone].bg} ${tone[s.tone].text} flex items-center justify-center`}>
                        <s.icon size={12}/>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-800">{s.l}</div>
                    </div>
                    <div className="mt-1 text-lg font-bold text-slate-900">{s.n}</div>
                    <div className="text-[9px] text-slate-500">{s.sub}</div>
                  </button>
                  {i < arr.length - 1 && (
                    <ChevronRight size={12} className="absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300"/>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Telemetry — dark */}
        <div className="col-span-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold">Live Connector Telemetry</div>
              <div className="text-[10px] text-slate-400">Real-time engineering console</div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/> LIVE
            </div>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono">
            {[
              "auth → OAuth handshake 42ms · ok",
              "secrets → Vault fetch (kv/prod/panw) 18ms",
              "policy → v4.2.1 · 10/10 rules PASS",
              "iam → role=readonly · scope=logs.read",
              "cert → valid 218d · CN=*.corp",
              "conn → pool 12/32 · sessions 8",
              "sync → 24,182 rows/s · latency p95 22ms",
              "rotate → next in 68d · auto-scheduled",
            ].map((line, i) => (
              <div key={i} className={`transition-opacity ${tick % 8 === i ? "text-emerald-300" : "text-slate-300"}`}>
                <span className="text-slate-500">›</span> {line}
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
            {[
              ["Req / s",       "412"],
              ["Auth p95",      "42ms"],
              ["Retries",       "0.03%"],
              ["Sessions",      "864"],
              ["Bandwidth",     "318 Mbps"],
              ["Token Refresh", "12/hr"],
            ].map(([l,v]) => (
              <div key={l} className="rounded-md bg-slate-800/70 border border-slate-700 p-2">
                <div className="text-slate-400">{l}</div>
                <div className="font-bold text-slate-100">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/> Heartbeat
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" style={{animationDelay:"0.3s"}}/>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" style={{animationDelay:"0.6s"}}/>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" style={{animationDelay:"0.9s"}}/>
          </div>
        </div>
      </div>

      {/* Bottom Operational Widgets */}
      <div className="px-8 pb-10 grid grid-cols-4 gap-3">
        {[
          { l: "Recent Connector Activity", icon: Activity, tone: "blue" as Tone,
            items: ["panw_ngfw_traffic — sync ok", "gcp_billing_export — sync ok", "datadog_metrics — sync ok"] },
          { l: "Credential Rotations", icon: RefreshCw, tone: "teal" as Tone,
            items: ["vpn_globalprotect — rotated", "gcp_billing — rotated", "3 due in 30 days"] },
          { l: "Certificate Expiration", icon: ShieldCheck, tone: "violet" as Tone,
            items: ["*.corp — 218d", "*.eu.corp — 96d", "partner.pem — 41d"] },
          { l: "Approval Queue", icon: ClipboardCheck, tone: "amber" as Tone,
            items: ["Kafka events (Arch)", "Snowflake finance (Sec)", "MCP registry (IAM)"] },
          { l: "Policy Changes", icon: Settings2, tone: "cyan" as Tone,
            items: ["v4.2.1 · added rotation SLA", "v4.2.0 · added MCP checks", "v4.1.9 · encryption at rest"] },
          { l: "Secrets Health", icon: Key, tone: "emerald" as Tone,
            items: ["Vault healthy · 100%", "0 stale secrets", "12 auto-rotations/day"] },
          { l: "Connector Performance", icon: Zap, tone: "rose" as Tone,
            items: ["p95 latency 42ms", "0.03% retries", "99.98% success"] },
          { l: "Audit Events", icon: FileText, tone: "slate" as Tone,
            items: ["1,842 events / 24h", "0 unauthorized", "All signed"] },
        ].map(w => (
          <button key={w.l} onClick={()=>open(w.l)}
            className="text-left rounded-xl border border-slate-200 bg-white p-3 hover:shadow-md transition">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-7 w-7 rounded-lg ${tone[w.tone].bg} ${tone[w.tone].text} flex items-center justify-center`}>
                <w.icon size={14}/>
              </div>
              <div className="text-xs font-semibold text-slate-900">{w.l}</div>
            </div>
            <ul className="text-[10px] text-slate-600 space-y-0.5">
              {w.items.map(x => <li key={x}>• {x}</li>)}
            </ul>
          </button>
        ))}
      </div>

      {/* Engineering Drawer */}
      <Sheet open={drawer.open} onOpenChange={(o)=>setDrawer({ ...drawer, open: o })}>
        <SheetContent side="right" className="w-[520px] sm:max-w-[560px] p-0 overflow-y-auto">
          <SheetHeader className="p-5 border-b border-slate-100">
            <SheetTitle className="text-base">{drawer.title}</SheetTitle>
            <div className="text-xs text-slate-500">Engineering transparency for {drawer.title.toLowerCase()}</div>
          </SheetHeader>
          <div className="p-5">
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="engineering">Engineering</TabsTrigger>
                <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="dependencies">Deps</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-3 text-sm">
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs font-semibold text-slate-500 mb-1">Purpose</div>
                  <div className="text-slate-700">
                    Governed connector into the Data Orchestration Platform. Continuously monitored for authentication health, credential lifecycle, policy adherence, and operational readiness.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["Owner", selected.credOwner],
                    ["Approver", selected.approver],
                    ["Criticality", "High"],
                    ["Consumers", "SecOps, SRE, FinOps"],
                    ["Risk", "Low"],
                    ["Policy", selected.policy],
                  ].map(([l,v]) => (
                    <div key={l} className="rounded border border-slate-200 p-2">
                      <div className="text-slate-500">{l}</div>
                      <div className="font-semibold text-slate-800">{v}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="engineering" className="mt-4 text-sm space-y-2">
                {[
                  { i: Plug,        l: "Connector architecture — validated adapter" },
                  { i: Fingerprint, l: "Authentication workflow — OAuth / SA / MCP" },
                  { i: Key,         l: "Secrets retrieval — Vault kv/prod" },
                  { i: RefreshCw,   l: "Token exchange — refresh every 55 min" },
                  { i: Timer,       l: "Credential rotation — auto ≤ 90d" },
                  { i: Users,       l: "IAM mapping — role=readonly" },
                  { i: Shield,      l: "Policy evaluation — 10 rules" },
                  { i: ShieldCheck, l: "Certificate validation — CN=*.corp" },
                  { i: Lock,        l: "Encryption — TLS 1.3, at-rest AES-256" },
                  { i: Activity,    l: "Monitoring — heartbeat + SLI/SLO" },
                ].map(x => (
                  <div key={x.l} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5">
                    <x.i size={14} className="text-blue-600"/>
                    <span className="text-xs text-slate-700">{x.l}</span>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="telemetry" className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {[
                  ["Conn Latency",    `${selected.latency}ms`],
                  ["Handshake",       "42ms"],
                  ["Auth Time",       "18ms"],
                  ["Retries",         "0.03%"],
                  ["Conn Pool",       "12/32"],
                  ["Sessions",        "864"],
                  ["Errors",          "0"],
                  ["Bandwidth",       "318 Mbps"],
                  ["Queue Depth",     "4"],
                  ["API TPS",         "412"],
                  ["CPU",             "38%"],
                  ["Memory",          "4.2 GB"],
                ].map(([l,v]) => (
                  <div key={l} className="rounded-lg border border-slate-200 p-2.5">
                    <div className="text-[10px] text-slate-500">{l}</div>
                    <div className="font-bold text-slate-900">{v}</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="security" className="mt-4 text-xs space-y-2">
                {[
                  ["Credential Age",     `${selected.credAge} days`],
                  ["Last Rotation",      selected.lastRotation],
                  ["Secret Location",    "Vault kv/prod/panw"],
                  ["Vault",              "HashiCorp Vault v1.15"],
                  ["Cert Expiration",    "218 days"],
                  ["Encryption",         "TLS 1.3 · AES-256"],
                  ["Policy Compliance",  "10/10 rules PASS"],
                  ["Least Privilege",    "Enforced"],
                  ["Audit Trail",        "1,842 events / 24h"],
                  ["Recent Sec Events",  "0 unauthorized"],
                ].map(([l,v]) => (
                  <div key={l} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="dependencies" className="mt-4 text-xs space-y-2">
                {[
                  ["Source system",       selected.platform],
                  ["Secrets Manager",     "HashiCorp Vault"],
                  ["IAM",                 "Okta + AWS IAM"],
                  ["Firewall",            "PANW NGFW"],
                  ["Network",             "Private link · VPC peered"],
                  ["MCP",                 "Registry v2.4"],
                  ["Service Accounts",    "sa-orchestrator"],
                  ["Certificates",        "corp-ca-2025"],
                  ["Downstream",          "XSIAM, SRE, FinOps"],
                  ["Ownership",           selected.credOwner],
                  ["Risk",                "Low"],
                ].map(([l,v]) => (
                  <div key={l} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-medium text-slate-800">{v}</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <style>{`
        @keyframes flow {
          0%   { transform: translateX(0);   opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
