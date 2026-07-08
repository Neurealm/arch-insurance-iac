import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowLeft, Bell, Bot, Boxes, Brain, ChartBar, CheckCircle2,
  ChevronRight, Cloud, Cog, Database, DollarSign, Download, Filter, Gauge, HardDrive,
  HelpCircle, History, Layers, LineChart, Loader2, MapPin, Network, Play, RefreshCw,
  Search, Server, Settings, ShieldCheck, Sparkles, Timer, TrendingDown, TrendingUp,
  Users, Wand2, Workflow, X, Zap, FileText, Archive, Snowflake, Waves, Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─────────────── design tokens ─────────────── */
const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";
const glass = "rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm";
const chip = "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border";
const okChip = `${chip} border-emerald-200 bg-emerald-50 text-emerald-700`;
const warnChip = `${chip} border-amber-200 bg-amber-50 text-amber-700`;
const critChip = `${chip} border-red-200 bg-red-50 text-red-700`;
const infoChip = `${chip} border-blue-200 bg-blue-50 text-blue-700`;

const statusColor = (s: "Healthy" | "Warning" | "High" | "Critical" | "Unknown") =>
  s === "Healthy" ? "text-emerald-600"
    : s === "Warning" ? "text-amber-600"
    : s === "High" ? "text-orange-600"
    : s === "Critical" ? "text-red-600"
    : "text-slate-500";

const statusDot = (s: string) =>
  s === "Healthy" ? "bg-emerald-500"
    : s === "Warning" ? "bg-amber-500"
    : s === "High" ? "bg-orange-500"
    : s === "Critical" ? "bg-red-500"
    : "bg-slate-400";

/* ─────────────── static mocks (kept realistic) ─────────────── */
const KPIS = [
  { icon: ShieldCheck, label: "Enterprise Storage Health", value: "98.9%", sub: "Healthy",       tone: "text-emerald-600" },
  { icon: Gauge,       label: "Critical Disk Pressure",    value: "27",     sub: "Immediate",     tone: "text-red-600" },
  { icon: Database,    label: "Databases at Risk",         value: "14",     sub: "Critical",      tone: "text-orange-600" },
  { icon: Waves,       label: "Transaction Logs Abnormal", value: "38",     sub: "+7 vs yesterday", tone: "text-amber-600" },
  { icon: Timer,       label: "Predicted Exhaustions (30D)", value: "61",  sub: "Today",         tone: "text-red-600" },
  { icon: Bot,         label: "Automated Remediations",    value: "184",    sub: "Today",         tone: "text-blue-600" },
  { icon: HardDrive,   label: "Storage Reclaimed",         value: "128 TB", sub: "This Month",    tone: "text-emerald-600" },
  { icon: CheckCircle2,label: "Downtime Prevented",        value: "246 hrs",sub: "Annualized",    tone: "text-emerald-600" },
  { icon: DollarSign,  label: "Cost Avoidance",            value: "$6.2M",  sub: "Annualized",    tone: "text-emerald-600" },
  { icon: Activity,    label: "Performance Health",        value: "99.2%",  sub: "Excellent",     tone: "text-emerald-600" },
];

const HEADER_INDICATORS = [
  { label: "Operational",        sub: "All Systems Normal",  dot: "bg-emerald-500" },
  { label: "Assets Monitored",   sub: "31,842" },
  { label: "Databases",          sub: "2,418" },
  { label: "Storage Systems",    sub: "386" },
  { label: "Last Capacity Analysis", sub: "9 Seconds Ago" },
  { label: "Prediction Engine",  sub: "Active", tone: "text-emerald-600" },
];

const TOPO = [
  { label: "Enterprise",       count: "1",     icon: Boxes,     tone: "text-slate-700" },
  { label: "Datacenters",      count: "3",     icon: MapPin,    tone: "text-slate-700" },
  { label: "Storage Arrays",   count: "8",     icon: HardDrive, tone: "text-slate-700" },
  { label: "Clusters",         count: "26",    icon: Network,   tone: "text-slate-700" },
  { label: "Servers",          count: "1,248", icon: Server,    tone: "text-slate-700" },
  { label: "Volumes",          count: "5,732", icon: Layers,    tone: "text-slate-700" },
  { label: "Databases",        count: "2,418", icon: Database,  tone: "text-slate-700" },
  { label: "Applications",     count: "366",   icon: Cog,       tone: "text-slate-700" },
  { label: "Business Services",count: "84",    icon: Users,     tone: "text-slate-700" },
];

const TRANSACTION_LOGS = [
  { db: "FinanceDB",     type: "SQL Server",  size: "1.28 TB", growth: "+42.6 GB", used: "92%", backup: "32 min", status: "Critical" },
  { db: "ERP_Production",type: "SQL Server",  size: "892 GB",  growth: "+28.4 GB", used: "88%", backup: "18 min", status: "High" },
  { db: "SalesDW",       type: "SQL Server",  size: "512 GB",  growth: "+16.7 GB", used: "76%", backup: "45 min", status: "Warning" },
  { db: "HR_Application",type: "Oracle",      size: "420 GB",  growth: "+12.9 GB", used: "71%", backup: "1.2 hr",  status: "Warning" },
  { db: "InventoryDB",   type: "PostgreSQL",  size: "256 GB",  growth: "+8.3 GB",  used: "58%", backup: "25 min", status: "Healthy" },
  { db: "AuthServiceDB", type: "MySQL",       size: "128 GB",  growth: "+4.1 GB",  used: "42%", backup: "12 min", status: "Healthy" },
  { db: "AnalyticsDB",   type: "MongoDB",     size: "98 GB",   growth: "+2.4 GB",  used: "36%", backup: "8 min",  status: "Healthy" },
  { db: "HANA_DB1",      type: "SAP HANA",    size: "64 GB",   growth: "+1.2 GB",  used: "28%", backup: "15 min", status: "Healthy" },
] as const;

const AI_PREDICTIONS = [
  { server: "SQL01.contoso.com", vol: "FinanceDB_Log",   usage: "92%", exhaust: "5 days",  conf: "95%", impact: "Critical", action: "Expand Volume" },
  { server: "SQL02.contoso.com", vol: "ERP_Production_Log", usage: "88%", exhaust: "7 days",conf: "93%", impact: "Critical", action: "Backup Log" },
  { server: "APP-SRV-09 (Azure)",vol: "OS Disk (E:)",    usage: "91%", exhaust: "9 days",  conf: "91%", impact: "High",     action: "Expand Disk" },
  { server: "ORCL01.contoso.com",vol: "ORCL_Redo01",     usage: "81%", exhaust: "12 days", conf: "90%", impact: "High",     action: "Archive Logs" },
  { server: "POSTGRES-01",       vol: "PGDATA + WAL",    usage: "74%", exhaust: "17 days", conf: "87%", impact: "Medium",   action: "Clean WAL" },
  { server: "MONGODB-01",        vol: "Oplog",           usage: "69%", exhaust: "18 days", conf: "85%", impact: "Medium",   action: "Archive Oplog" },
  { server: "HANA-01",           vol: "HANA_Log",        usage: "66%", exhaust: "21 days", conf: "83%", impact: "High",     action: "Backup Log" },
  { server: "WEB-APP-03",        vol: "Logs (F:)",       usage: "63%", exhaust: "24 days", conf: "82%", impact: "Low",      action: "Clean Logs" },
  { server: "BACKUPREPO-01",     vol: "Backup Repository", usage: "60%", exhaust: "27 days", conf: "80%", impact: "Medium", action: "Purge Backups" },
];

const TOP_ISSUES = [
  { issue: "SQL Log Drive 96% Full",         sys: "SQL01.contoso.com",  impact: "High",   risk: "Critical", age: "15m" },
  { issue: "Oracle Archive Logs Not Purging",sys: "ORCL01.contoso.com", impact: "High",   risk: "Critical", age: "28m" },
  { issue: "VMware Datastore Near Capacity", sys: "VCENTER-DS01",       impact: "High",   risk: "Critical", age: "42m" },
  { issue: "Azure Managed Disk Pressure",    sys: "APP-SRV-09 (Azure)", impact: "Medium", risk: "High",     age: "1h 12m" },
  { issue: "Linux /var Filesystem 95% Full", sys: "LINUX-APP-02",       impact: "Medium", risk: "High",     age: "1h 38m" },
  { issue: "Snapshot Consumption High",      sys: "PowerStore-Array-01",impact: "Low",    risk: "Medium",   age: "1h 55m" },
  { issue: "SQL TempDB Growing Fast",        sys: "SQL02.contoso.com",  impact: "Medium", risk: "Medium",   age: "1h 32m" },
  { issue: "Backup Repository 90% Full",     sys: "BackupRepo-01",      impact: "Low",    risk: "Medium",   age: "2h 05m" },
  { issue: "Storage Replication Lag",        sys: "ONTAP-Cluster-02",   impact: "High",   risk: "High",     age: "2h 21m" },
  { issue: "Application Temp File Growth",   sys: "WEB-APP-03",         impact: "Low",    risk: "Low",      age: "3h 11m" },
];

const PERF = [
  { m: "Average IOPS",       v: "18,532",   status: "Healthy" },
  { m: "Read IOPS",          v: "10,284",   status: "Healthy" },
  { m: "Write IOPS",         v: "8,248",    status: "Healthy" },
  { m: "Read Latency",       v: "1.2 ms",   status: "Healthy" },
  { m: "Write Latency",      v: "1.8 ms",   status: "Warning" },
  { m: "Disk Queue Depth",   v: "2.8",      status: "Warning" },
  { m: "Throughput",         v: "1.25 GB/s",status: "Healthy" },
  { m: "Cache Hit Ratio",    v: "96.2%",    status: "Healthy" },
  { m: "Storage Efficiency", v: "2.8 : 1",  status: "Healthy" },
  { m: "Replication Lag",    v: "45 sec",   status: "Warning" },
];

const HEATMAP_ARRAYS = [
  { a: "PowerStore-Array-01", cap: 82, perf: 92, lat: "1.2 ms", snap: 78, rep: "Healthy",  thin: 71, iops: "18K", risk: "High" },
  { a: "ONTAP-Cluster-01",    cap: 68, perf: 94, lat: "0.9 ms", snap: 64, rep: "Healthy",  thin: 62, iops: "22K", risk: "Medium" },
  { a: "PowerMax-0001",       cap: 76, perf: 89, lat: "1.1 ms", snap: 83, rep: "Warning",  thin: 65, iops: "34K", risk: "High" },
  { a: "Pure-FlashArray-01",  cap: 59, perf: 97, lat: "0.6 ms", snap: 42, rep: "Healthy",  thin: 55, iops: "19K", risk: "Low" },
  { a: "HPE-Alletra-01",      cap: 71, perf: 91, lat: "0.8 ms", snap: 75, rep: "Healthy",  thin: 63, iops: "16K", risk: "Medium" },
  { a: "Azure-Storage-01",    cap: 61, perf: 87, lat: "2.1 ms", snap: 58, rep: "Healthy",  thin: 66, iops: "14K", risk: "Low" },
  { a: "AWS-EBS-Prod",        cap: 57, perf: 88, lat: "1.9 ms", snap: 61, rep: "N/A",      thin: 61, iops: "12K", risk: "Low" },
];

const BUSINESS_TIER = [
  { level: "Business Services", count: "24",     tone: "text-emerald-700" },
  { level: "Applications",      count: "68",     tone: "text-emerald-700" },
  { level: "Databases",         count: "312",    tone: "text-amber-700" },
  { level: "Servers",           count: "1,248",  tone: "text-orange-700" },
  { level: "Assets",            count: "31,842", tone: "text-red-700" },
];

const RECS = [
  { title: "Expand FinanceDB Log Volume by 200 GB", conf: 96, saved: "5 days runway",  impact: "Prevents outage",  auto: true },
  { title: "Run Transaction Log Backup on SQL02",   conf: 94, saved: "34% log reuse",  impact: "Frees log space",  auto: true },
  { title: "Purge Oracle Archive Logs > 14d",       conf: 92, saved: "128 GB reclaim", impact: "Restores headroom",auto: true },
  { title: "Grow VMware Datastore VC-DS01",         conf: 90, saved: "12d runway",     impact: "Prevents freeze",  auto: false },
  { title: "Delete Old Snapshots on PowerStore-01", conf: 89, saved: "3.2 TB reclaim", impact: "Restores capacity",auto: true },
];

const ACTIVITY = [
  { t: "12:34:52", d: "Detected abnormal transaction log growth on FinanceDB", sys: "SQL01.contoso.com", status: "Critical" },
  { t: "12:34:48", d: "Predicted disk exhaustion in 5 days",                    sys: "SQL01.contoso.com (E:)", status: "High" },
  { t: "12:34:41", d: "Executed log backup successfully",                       sys: "FinanceDB",           status: "Success" },
  { t: "12:34:35", d: "Expanded volume by 200 GB",                              sys: "SQL01.contoso.com",   status: "Success" },
  { t: "12:34:28", d: "Deleted 1,248 old snapshots",                            sys: "PowerStore-Array-01", status: "Success" },
  { t: "12:34:12", d: "Reclaimed 3.2 TB of storage",                            sys: "Multiple Systems",    status: "Info" },
  { t: "12:34:02", d: "Generated executive storage summary report",             sys: "Storage Analytics",   status: "Info" },
];

const AUTOMATIONS = [
  { name: "Expand Disk",             desc: "Grow Windows/Linux volume in-place",       runtime: "2-6 min" },
  { name: "Expand Volume",           desc: "Add capacity to storage-array volume",     runtime: "3-8 min" },
  { name: "Grow Datastore",          desc: "Expand VMware VMFS/NFS datastore",         runtime: "4-10 min" },
  { name: "Run Log Backup",          desc: "Trigger transaction log backup",           runtime: "1-3 min" },
  { name: "Shrink Transaction Log",  desc: "Compact SQL/Oracle log after backup",      runtime: "2-5 min" },
  { name: "Archive Logs",            desc: "Move old archive/redo logs to cold tier",  runtime: "5-15 min" },
  { name: "Delete Old Snapshots",    desc: "Purge snapshots by retention policy",      runtime: "1-4 min" },
  { name: "Move Database Files",     desc: "Relocate MDF/NDF/LDF across drives",       runtime: "10-45 min" },
  { name: "Optimize Autogrowth",     desc: "Tune autogrowth increments and caps",      runtime: "< 1 min" },
  { name: "Compress Files",          desc: "Enable NTFS/ZFS compression on hot dirs",  runtime: "2-8 min" },
  { name: "Run Capacity Assessment", desc: "Executive-grade capacity report",          runtime: "3-6 min" },
  { name: "Generate Storage Report", desc: "Weekly executive PDF summary",             runtime: "1-2 min" },
];

const INTEGRATIONS = [
  "SQL Server", "Oracle", "PostgreSQL", "MySQL", "MongoDB", "SAP HANA",
  "vCenter", "vSAN", "PowerStore", "PowerMax", "NetApp ONTAP", "Pure Storage",
  "HPE Alletra", "Azure Managed Disks", "Azure NetApp Files", "AWS EBS", "AWS FSx",
  "Amazon RDS", "Google Persistent Disk", "Windows Server", "Linux", "Rubrik",
  "Veeam", "Datadog", "Dynatrace", "Splunk", "Cribl", "Azure Monitor",
  "Microsoft Sentinel", "ServiceNow CMDB", "ServiceNow Change",
];

const TIME_RANGES = ["7D", "30D", "60D", "90D", "180D", "365D"] as const;

/* ─────────────── UI helpers ─────────────── */
function StatusPill({ status }: { status: string }) {
  const cls =
    status === "Critical" ? critChip
      : status === "High" ? warnChip
      : status === "Warning" ? warnChip
      : status === "Medium" ? infoChip
      : status === "Success" || status === "Healthy" ? okChip
      : infoChip;
  return (
    <span className={cls}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot(status === "Success" ? "Healthy" : status)}`} />
      {status}
    </span>
  );
}

function Sparkline({ tone = "emerald" as "emerald" | "amber" | "red" | "blue" }) {
  const stroke = tone === "emerald" ? "#10b981" : tone === "amber" ? "#f59e0b" : tone === "red" ? "#ef4444" : "#3b82f6";
  const pts = [4, 6, 5, 8, 7, 9, 6, 11, 9, 12, 10, 14, 12, 13];
  const w = 90, h = 22;
  const d = pts.map((y, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * w} ${h - y}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-90">
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

function CapacityChart() {
  const series = [
    { name: "Storage Growth",     color: "#3b82f6", data: [30, 34, 38, 42, 47, 51, 56, 60, 65, 71, 76, 82] },
    { name: "Transaction Log",    color: "#ef4444", data: [22, 28, 34, 40, 46, 52, 58, 64, 71, 78, 85, 92] },
    { name: "Database Growth",    color: "#10b981", data: [25, 28, 32, 35, 39, 44, 48, 53, 58, 63, 68, 74] },
    { name: "Filesystem Growth",  color: "#a855f7", data: [20, 23, 27, 30, 34, 38, 42, 46, 50, 55, 59, 64] },
  ];
  const w = 640, h = 220, pad = 30;
  const max = 100;
  const line = (d: number[]) =>
    d.map((y, i) => `${i === 0 ? "M" : "L"} ${pad + (i / (d.length - 1)) * (w - pad * 2)} ${h - pad - (y / max) * (h - pad * 2)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={pad} x2={w - pad} y1={h - pad - (g / max) * (h - pad * 2)} y2={h - pad - (g / max) * (h - pad * 2)} stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x={4} y={h - pad - (g / max) * (h - pad * 2) + 3} className="fill-slate-400" style={{ fontSize: 9 }}>{g}%</text>
        </g>
      ))}
      {series.map((s) => (
        <path key={s.name} d={line(s.data)} stroke={s.color} strokeWidth="2" fill="none" />
      ))}
      <line x1={pad} x2={pad} y1={pad / 2} y2={h - pad} stroke="#cbd5e1" />
      <line x1={pad} x2={w - pad} y1={h - pad} y2={h - pad} stroke="#cbd5e1" />
      {["May 25", "May 31", "Jun 6", "Jun 12", "Jun 18", "Jun 24"].map((lbl, i) => (
        <text key={lbl} x={pad + (i / 5) * (w - pad * 2)} y={h - 8} className="fill-slate-400" style={{ fontSize: 9 }} textAnchor="middle">{lbl}</text>
      ))}
    </svg>
  );
}

/* ─────────────── page ─────────────── */
export default function TransactionLogDiskPressure() {
  const nav = useNavigate();
  const [range, setRange] = useState<(typeof TIME_RANGES)[number]>("30D");
  const [selected, setSelected] = useState<{ server: string; vol: string; usage: string } | null>({
    server: "SQL01.contoso.com", vol: "FinanceDB_Log", usage: "92%",
  });
  const [query, setQuery] = useState("");
  const [copilot, setCopilot] = useState("");
  const [copilotOpen, setCopilotOpen] = useState(false);

  const filteredPredictions = useMemo(() => {
    if (!query) return AI_PREDICTIONS;
    const q = query.toLowerCase();
    return AI_PREDICTIONS.filter((p) =>
      p.server.toLowerCase().includes(q) || p.vol.toLowerCase().includes(q) || p.action.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── layout: dark left rail + content ── */}
      <div className="flex">
        {/* Left nav */}
        <aside className="hidden lg:flex w-64 shrink-0 bg-[#0b1e3f] text-slate-100 min-h-screen flex-col">
          <div className="p-4 flex items-center gap-3 border-b border-white/10">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 grid place-items-center ring-2 ring-blue-400/40">
              <Bot className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Digital Coworker</div>
              <div className="text-[10px] text-blue-300">NOVA AI</div>
            </div>
          </div>

          <nav className="p-2 text-[13px] space-y-0.5 flex-1 overflow-y-auto">
            {[
              { label: "Overview",         icon: LineChart, active: true },
              { label: "Storage Topology", icon: Network },
              { label: "Capacity Forecast",icon: TrendingUp },
              { label: "Transaction Logs", icon: Waves },
              { label: "Disk Pressure",    icon: Gauge },
              { label: "Performance",      icon: Activity },
              { label: "Databases",        icon: Database },
              { label: "File Systems",     icon: FileText },
              { label: "Virtualization",   icon: Layers },
              { label: "Cloud Storage",    icon: Cloud },
              { label: "Backups",          icon: Archive },
              { label: "Alerts & Issues",  icon: AlertTriangle },
              { label: "Remediation",      icon: Wand2 },
              { label: "Automation",       icon: Workflow },
              { label: "Reports",          icon: ChartBar },
              { label: "Insights",         icon: Sparkles },
              { label: "Business Impact",  icon: Users },
              { label: "Administration",   icon: ShieldCheck },
              { label: "Settings",         icon: Settings },
            ].map((n) => {
              const I = n.icon;
              return (
                <button
                  key={n.label}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 transition ${n.active ? "bg-blue-500/20 text-white" : "text-slate-300 hover:bg-white/5"}`}
                >
                  <I className="h-4 w-4" />
                  <span className="truncate">{n.label}</span>
                </button>
              );
            })}
            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-wider text-blue-300/70">Quick Actions</div>
            {["Expand Volume", "Run Log Backup", "Shrink Transaction Log", "Clean TempDB", "Delete Old Snapshots", "Generate Capacity Report"].map((q) => (
              <button key={q} className="w-full text-left rounded-lg px-3 py-1.5 text-[12px] text-slate-300 hover:bg-white/5 flex items-center gap-2">
                <Play className="h-3 w-3 text-blue-300" /> {q}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-500/20 grid place-items-center">
              <Sparkles className="h-4 w-4 text-blue-300" />
            </div>
            <div className="text-[11px]">
              <div className="text-slate-400">Powered by</div>
              <div className="font-semibold">NOVA AI</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
            <div className="px-6 py-3 flex items-center gap-4">
              <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] uppercase tracking-widest text-blue-600 font-semibold">Digital Coworker</div>
                  <span className={infoChip}><Brain className="h-3 w-3" /> AI Powered</span>
                </div>
                <h1 className="text-xl font-bold leading-tight">Transaction Log & Disk Pressure</h1>
                <p className="text-[11px] text-slate-500 leading-snug max-w-3xl">
                  Continuously monitor enterprise storage utilization, database transaction log growth, filesystem capacity,
                  I/O performance, and application dependencies to predict storage exhaustion, prevent outages, automate
                  remediation, and optimize infrastructure utilization.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-4 text-[11px]">
                {HEADER_INDICATORS.map((h) => (
                  <div key={h.label} className="flex flex-col items-start">
                    <div className="flex items-center gap-1">
                      {h.dot && <span className={`h-1.5 w-1.5 rounded-full ${h.dot}`} />}
                      <span className="text-slate-500">{h.label}</span>
                    </div>
                    <span className={`font-semibold ${h.tone ?? "text-slate-900"}`}>{h.sub}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button className="relative h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50">
                  <Bell className="h-4 w-4 text-slate-600" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 grid place-items-center text-[9px] font-bold bg-red-500 text-white rounded-full">9</span>
                </button>
                <button className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50">
                  <HelpCircle className="h-4 w-4 text-slate-600" />
                </button>
                <button className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50">
                  <Users className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* KPIs */}
            <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {KPIS.map((k) => {
                const I = k.icon;
                return (
                  <div key={k.label} className={`${card} p-3 hover:shadow-md transition cursor-pointer`}>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 grid place-items-center">
                        <I className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">{k.label}</div>
                    </div>
                    <div className={`mt-2 text-xl font-bold ${k.tone}`}>{k.value}</div>
                    <div className="text-[10px] text-slate-500">{k.sub}</div>
                    <div className="mt-1">
                      <Sparkline tone={k.tone.includes("red") ? "red" : k.tone.includes("amber") ? "amber" : k.tone.includes("blue") ? "blue" : "emerald"} />
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Topology + Forecast + TX log table + selected */}
            <section className="grid grid-cols-12 gap-4">
              {/* Topology */}
              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Enterprise Storage Topology</h3>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Search className="h-3.5 w-3.5" /><Filter className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="space-y-2">
                  {TOPO.map((t, i) => {
                    const I = t.icon;
                    return (
                      <div key={t.label} className="flex items-center gap-2 text-[11px]">
                        <div className="w-4 flex justify-center">
                          {i > 0 && <div className="w-px h-3 bg-slate-200" />}
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-slate-100 bg-slate-50/60 flex-1">
                          <I className={`h-3.5 w-3.5 ${t.tone}`} />
                          <span className="text-slate-700 font-medium">{t.label}</span>
                          <span className="ml-auto text-slate-500">{t.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                  {[
                    { c: "bg-emerald-500", l: "Healthy > 20% Free" },
                    { c: "bg-amber-500",   l: "Growing 10-20% Free" },
                    { c: "bg-orange-500",  l: "High Pressure 5-10% Free" },
                    { c: "bg-red-500",     l: "Critical < 5% Free" },
                    { c: "bg-slate-400",   l: "Unknown" },
                  ].map((x) => (
                    <div key={x.l} className="flex items-center gap-1 text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${x.c}`} />{x.l}
                    </div>
                  ))}
                </div>
              </div>

              {/* Forecast */}
              <div className={`${card} col-span-12 xl:col-span-5 p-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Capacity Forecast Dashboard</h3>
                  <div className="flex items-center gap-1">
                    {TIME_RANGES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${range === r ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] mt-2">
                  {[
                    { c: "bg-blue-500",  l: "Storage Growth" },
                    { c: "bg-red-500",   l: "Transaction Log Growth" },
                    { c: "bg-emerald-500", l: "Database Growth" },
                    { c: "bg-purple-500",l: "Filesystem Growth" },
                  ].map((x) => (
                    <div key={x.l} className="flex items-center gap-1 text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${x.c}`} />{x.l}
                    </div>
                  ))}
                </div>
                <div className="h-[220px] mt-1">
                  <CapacityChart />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div><div className="text-slate-500">Earliest Exhaustion</div><div className="font-bold text-red-600">Production-SQL-02</div><div className="text-slate-500">7 Days</div></div>
                  <div><div className="text-slate-500">Most At Risk</div><div className="font-bold text-orange-600">FinanceDB_Log</div><div className="text-slate-500">5 Days</div></div>
                  <div><div className="text-slate-500">Total at Risk</div><div className="font-bold text-slate-900">61 Assets</div><div className="text-slate-500">Capacity Remaining 1.28 PB</div></div>
                </div>
              </div>

              {/* TX Log */}
              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Transaction Log Dashboard <span className="text-slate-400 font-normal">(Top 8)</span></h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead className="text-slate-500">
                      <tr className="text-left">
                        <th className="py-1 pr-2 font-medium">Database</th>
                        <th className="py-1 pr-2 font-medium">Size</th>
                        <th className="py-1 pr-2 font-medium">Used</th>
                        <th className="py-1 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TRANSACTION_LOGS.map((r) => (
                        <tr key={r.db} className="border-t border-slate-100 hover:bg-slate-50/70">
                          <td className="py-1.5 pr-2">
                            <div className="font-medium text-slate-900">{r.db}</div>
                            <div className="text-[10px] text-slate-500">{r.type}</div>
                          </td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.size}<div className="text-[10px] text-emerald-600">{r.growth}</div></td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.used}<div className="text-[10px] text-slate-500">{r.backup}</div></td>
                          <td className="py-1.5"><span className={`h-2 w-2 rounded-full inline-block ${statusDot(r.status)}`} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="text-[11px] text-blue-600 hover:underline mt-2">View All Transaction Logs</button>
              </div>
            </section>

            {/* Top issues + AI predictions + engineering panel */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Top Issues</h3>
                  <button className="text-[11px] text-blue-600 hover:underline">View All</button>
                </div>
                <div className="space-y-1.5">
                  {TOP_ISSUES.slice(0, 9).map((i) => (
                    <div key={i.issue} className="flex items-center gap-2 py-1 text-[11px] border-b border-slate-100 last:border-0">
                      <span className={`h-2 w-2 rounded-full ${statusDot(i.risk)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{i.issue}</div>
                        <div className="text-[10px] text-slate-500">{i.sys}</div>
                      </div>
                      <div className={`text-[10px] font-semibold ${statusColor(i.impact as any)}`}>{i.impact}</div>
                      <div className={`text-[10px] font-semibold ${statusColor(i.risk as any)}`}>{i.risk}</div>
                      <div className="text-[10px] text-slate-500 w-12 text-right">{i.age}</div>
                    </div>
                  ))}
                </div>
                <button className="text-[11px] text-blue-600 hover:underline mt-2">View All Issues</button>
              </div>

              <div className={`${card} col-span-12 xl:col-span-5 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold">AI Capacity Prediction <span className="text-slate-400 font-normal">(Top 10 At Risk)</span></h3>
                    <div className="text-[10px] text-slate-500">Powered by NOVA AI · Confidence-scored</div>
                  </div>
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-1.5" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search servers, volumes..."
                      className="text-[11px] pl-6 pr-2 py-1 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead className="text-slate-500">
                      <tr className="text-left">
                        <th className="py-1 pr-2 font-medium">Server</th>
                        <th className="py-1 pr-2 font-medium">Database / Volume</th>
                        <th className="py-1 pr-2 font-medium">Usage</th>
                        <th className="py-1 pr-2 font-medium">Exhaustion</th>
                        <th className="py-1 pr-2 font-medium">Conf.</th>
                        <th className="py-1 pr-2 font-medium">Impact</th>
                        <th className="py-1 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPredictions.map((r) => (
                        <tr key={r.server + r.vol} className="border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer"
                            onClick={() => setSelected({ server: r.server, vol: r.vol, usage: r.usage })}>
                          <td className="py-1.5 pr-2 font-medium text-slate-900">{r.server}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.vol}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.usage}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.exhaust}</td>
                          <td className="py-1.5 pr-2 text-emerald-600 font-semibold">{r.conf}</td>
                          <td className={`py-1.5 pr-2 font-semibold ${statusColor(r.impact as any)}`}>{r.impact}</td>
                          <td className="py-1.5 text-blue-600 font-medium">{r.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selected system panel */}
              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Selected System</h3>
                  {selected && <button onClick={() => setSelected(null)}><X className="h-4 w-4 text-slate-400" /></button>}
                </div>
                {selected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{selected.server}</div>
                        <div className="text-[10px] text-slate-500">SQL Server 2019 Enterprise</div>
                      </div>
                      <span className={`ml-auto ${critChip}`}>Critical</span>
                    </div>
                    <div className="grid grid-cols-4 text-[10px] border-b border-slate-100 pb-2">
                      {["Overview", "Storage", "Database", "Performance", "History"].map((t, i) => (
                        <button key={t} className={`py-1 ${i === 0 ? "text-blue-600 border-b-2 border-blue-600 -mb-[9px]" : "text-slate-500"}`}>{t}</button>
                      ))}
                    </div>
                    <div className="text-[11px] space-y-1">
                      {[
                        ["Environment", "Production"],
                        ["Business Owner", "Finance IT"],
                        ["Application", "FinanceDB"],
                        ["Instance", "MSSQLSERVER"],
                        ["OS", "Windows Server 2019"],
                        ["Time Zone", "(UTC-05:00) Eastern Time"],
                        ["Site", "New York DC"],
                        ["Cluster", "SQL-Cluster-01"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-500">{k}</span>
                          <span className="text-slate-900 font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-900 mb-1">Capacity</div>
                      {[
                        { l: "C: (System)", v: 78, tone: "bg-emerald-500" },
                        { l: "D: (Data)",   v: 82, tone: "bg-amber-500" },
                        { l: "E: (Logs)",   v: 96, tone: "bg-red-500" },
                        { l: "F: (TempDB)", v: 61, tone: "bg-emerald-500" },
                      ].map((c) => (
                        <div key={c.l} className="text-[10px] mb-1">
                          <div className="flex justify-between"><span>{c.l}</span><span className="font-semibold">{c.v}%</span></div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className={`h-full ${c.tone}`} style={{ width: `${c.v}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-900 mb-1">Transaction Log</div>
                      <div className="text-[11px] space-y-0.5">
                        {[
                          ["Log Size", "1.28 TB"],
                          ["Growth (24h)", "+42.6 GB"],
                          ["Log Used", "92%"],
                          ["Autogrowth", "Enabled (512 MB)"],
                          ["Recovery Model", "Full"],
                          ["Log Reuse Wait", "ACTIVE_TRANSACTION"],
                          ["Last Log Backup", "32 min ago"],
                          ["Next Log Backup", "In 28 min"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-slate-500">{k}</span>
                            <span className="text-slate-900 font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button className="flex-1 text-[11px] border border-slate-200 rounded-md py-1 hover:bg-slate-50">Investigate</button>
                      <button className="flex-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded-md py-1">Run Action</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500">Select a row to view engineering details.</div>
                )}
              </div>
            </section>

            {/* Performance + heatmap + business */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Storage Performance Dashboard</h3>
                  <button className="text-[11px] text-blue-600 hover:underline">View All</button>
                </div>
                <table className="w-full text-[11px]">
                  <thead className="text-slate-500">
                    <tr className="text-left">
                      <th className="py-1 pr-2 font-medium">Metric</th>
                      <th className="py-1 pr-2 font-medium">Current</th>
                      <th className="py-1 pr-2 font-medium">Trend (24h)</th>
                      <th className="py-1 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERF.map((p) => (
                      <tr key={p.m} className="border-t border-slate-100">
                        <td className="py-1.5 pr-2 text-slate-700">{p.m}</td>
                        <td className="py-1.5 pr-2 font-semibold text-slate-900">{p.v}</td>
                        <td className="py-1.5 pr-2"><Sparkline tone={p.status === "Warning" ? "amber" : p.status === "Critical" ? "red" : "emerald"} /></td>
                        <td className="py-1.5 text-[10px]"><StatusPill status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`${card} col-span-12 xl:col-span-5 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Storage Heat Map <span className="text-slate-400 font-normal">(Arrays)</span></h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead className="text-slate-500">
                      <tr className="text-left">
                        <th className="py-1 pr-2 font-medium">Array</th>
                        <th className="py-1 pr-2 font-medium">Capacity</th>
                        <th className="py-1 pr-2 font-medium">Performance</th>
                        <th className="py-1 pr-2 font-medium">Latency</th>
                        <th className="py-1 pr-2 font-medium">Snapshots</th>
                        <th className="py-1 pr-2 font-medium">Replication</th>
                        <th className="py-1 pr-2 font-medium">Thin Prov.</th>
                        <th className="py-1 pr-2 font-medium">IOPS</th>
                        <th className="py-1 font-medium">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {HEATMAP_ARRAYS.map((r) => (
                        <tr key={r.a} className="border-t border-slate-100">
                          <td className="py-1.5 pr-2 font-medium text-slate-900">{r.a}</td>
                          <td className="py-1.5 pr-2"><HeatCell v={r.cap} /></td>
                          <td className="py-1.5 pr-2"><HeatCell v={r.perf} good /></td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.lat}</td>
                          <td className="py-1.5 pr-2"><HeatCell v={r.snap} /></td>
                          <td className={`py-1.5 pr-2 font-semibold ${r.rep === "Warning" ? "text-amber-600" : "text-emerald-600"}`}>{r.rep}</td>
                          <td className="py-1.5 pr-2"><HeatCell v={r.thin} /></td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.iops}</td>
                          <td className={`py-1.5 font-semibold ${statusColor(r.risk as any)}`}>{r.risk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 flex gap-3 text-[10px] text-slate-600">
                  {[
                    { c: "bg-emerald-500", l: "0-60% (Healthy)" },
                    { c: "bg-amber-500",   l: "60-80% (Warning)" },
                    { c: "bg-orange-500",  l: "80-90% (High)" },
                    { c: "bg-red-500",     l: "90-100% (Critical)" },
                  ].map((x) => (
                    <div key={x.l} className="flex items-center gap-1">
                      <span className={`h-2 w-2 rounded-full ${x.c}`} />{x.l}
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Business Impact Dashboard</h3>
                  <button className="text-[11px] text-blue-600 hover:underline">View Full Map</button>
                </div>
                <div className="space-y-1.5">
                  {BUSINESS_TIER.map((b, i) => (
                    <div
                      key={b.level}
                      className={`rounded-md border border-slate-100 px-3 py-2 flex items-center justify-between`}
                      style={{ marginLeft: i * 6, marginRight: i * 6 }}
                    >
                      <span className="text-[11px] font-medium text-slate-700">{b.level}</span>
                      <span className={`text-sm font-bold ${b.tone}`}>{b.count}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
                  <div className={`${glass} p-2 text-center`}>
                    <div className="text-slate-500 text-[10px]">Applications at Risk</div>
                    <div className="font-bold text-red-600">24</div>
                    <div className="text-[10px] text-slate-500">Critical</div>
                  </div>
                  <div className={`${glass} p-2 text-center`}>
                    <div className="text-slate-500 text-[10px]">Users Impacted</div>
                    <div className="font-bold text-slate-900">18,652</div>
                  </div>
                  <div className={`${glass} p-2 text-center`}>
                    <div className="text-slate-500 text-[10px]">Revenue at Risk</div>
                    <div className="font-bold text-slate-900">$2.38M</div>
                  </div>
                  <div className={`${glass} p-2 text-center`}>
                    <div className="text-slate-500 text-[10px]">Transactions / Min</div>
                    <div className="font-bold text-slate-900">8,942</div>
                  </div>
                  <div className={`${glass} p-2 text-center`}>
                    <div className="text-slate-500 text-[10px]">SLA Risk</div>
                    <div className="font-bold text-amber-600">High</div>
                  </div>
                  <div className={`${glass} p-2 text-center`}>
                    <div className="text-slate-500 text-[10px]">Est. Downtime</div>
                    <div className="font-bold text-red-600">18.7 hrs</div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI recommendations + activity feed */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-7 p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">AI Recommendations</h3>
                  <span className={infoChip}><Sparkles className="h-3 w-3" /> NOVA AI</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {RECS.map((r) => (
                    <div key={r.title} className="rounded-xl border border-slate-200 p-3 hover:shadow-md transition">
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                          <Wand2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-slate-900 leading-tight">{r.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{r.impact}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-[10px]">
                        <div><div className="text-slate-500">Confidence</div><div className="font-semibold text-emerald-600">{r.conf}%</div></div>
                        <div><div className="text-slate-500">Benefit</div><div className="font-semibold text-slate-900">{r.saved}</div></div>
                        <div><div className="text-slate-500">Automation</div><div className={`font-semibold ${r.auto ? "text-emerald-600" : "text-amber-600"}`}>{r.auto ? "Available" : "Manual"}</div></div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 text-[11px] border border-slate-200 rounded-md py-1 hover:bg-slate-50">Approve</button>
                        <button className="flex-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded-md py-1 flex items-center justify-center gap-1">
                          <Play className="h-3 w-3" /> Execute
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-5 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Digital Coworker Activity Feed <span className="text-slate-400 font-normal">(Live)</span></h3>
                  <button className="text-[11px] text-blue-600 hover:underline">View Full Activity</button>
                </div>
                <div className="space-y-2">
                  {ACTIVITY.map((a, i) => (
                    <div key={i} className="grid grid-cols-[64px_1fr_120px_80px] gap-2 text-[11px] items-center border-b border-slate-100 pb-1.5 last:border-0">
                      <div className="text-slate-500 font-mono text-[10px]">{a.t}</div>
                      <div className="text-slate-900">{a.d}</div>
                      <div className="text-slate-500 truncate">{a.sys}</div>
                      <div className="justify-self-end"><StatusPill status={a.status} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Backup + Automations */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-5 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Backup & Recovery Dashboard</h3>
                  <span className={okChip}><CheckCircle2 className="h-3 w-3" /> RPO Met</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  {[
                    { l: "Log Backup Frequency", v: "Every 15 min", tone: "text-emerald-600" },
                    { l: "Full Backup Success",  v: "99.4%",         tone: "text-emerald-600" },
                    { l: "Differential Backups", v: "98.7%",         tone: "text-emerald-600" },
                    { l: "Snapshot Success",     v: "97.9%",         tone: "text-emerald-600" },
                    { l: "Replication Status",   v: "Healthy",       tone: "text-emerald-600" },
                    { l: "RPO",                  v: "15 min",        tone: "text-slate-900" },
                    { l: "RTO",                  v: "45 min",        tone: "text-slate-900" },
                    { l: "Backup Storage",       v: "412 TB / 500 TB", tone: "text-amber-600" },
                    { l: "Restore Validation",   v: "Passed 24h ago", tone: "text-emerald-600" },
                  ].map((k) => (
                    <div key={k.l} className={`${glass} p-2`}>
                      <div className="text-[10px] text-slate-500">{k.l}</div>
                      <div className={`font-semibold ${k.tone}`}>{k.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-7 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Automation Library</h3>
                  <button className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Sync workflows
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {AUTOMATIONS.map((a) => (
                    <div key={a.name} className="rounded-lg border border-slate-200 p-2 hover:border-blue-300 hover:bg-blue-50/40 transition cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 grid place-items-center">
                          <Workflow className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-[12px] font-semibold text-slate-900">{a.name}</div>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">{a.desc}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-slate-500">Runtime: {a.runtime}</span>
                        <button className="text-[10px] text-blue-600 font-semibold flex items-center gap-1"><Play className="h-3 w-3" /> Launch</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Integrations */}
            <section className={`${card} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold">Enterprise Integrations</h3>
                <span className="text-[10px] text-slate-500">{INTEGRATIONS.length} connected sources</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INTEGRATIONS.map((i) => (
                  <span key={i} className="text-[11px] px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center gap-1">
                    <Plug2 /> {i}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* AI Copilot floating */}
      <button
        onClick={() => setCopilotOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl grid place-items-center"
      >
        <Brain className="h-5 w-5" />
      </button>
      {copilotOpen && (
        <div className="fixed bottom-20 right-5 z-40 w-[360px] max-h-[70vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="p-3 border-b border-slate-200 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center"><Sparkles className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-bold">NOVA AI Copilot</div>
              <div className="text-[10px] text-slate-500">Ask about capacity, logs, or remediation</div>
            </div>
            <button className="ml-auto" onClick={() => setCopilotOpen(false)}><X className="h-4 w-4 text-slate-400" /></button>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto flex-1">
            <div className="text-[11px] text-slate-500">Suggested questions</div>
            {[
              "Why is FinanceDB transaction log growing?",
              "Which servers will run out of disk next week?",
              "Predict storage exhaustion for Production DBs.",
              "Recommend storage optimization actions.",
              "Generate an executive storage report.",
            ].map((q) => (
              <button key={q} onClick={() => setCopilot(q)}
                className="w-full text-left text-[11px] px-2 py-1.5 rounded-md border border-slate-200 hover:bg-blue-50/50">
                {q}
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-slate-200 flex items-center gap-2">
            <input
              value={copilot}
              onChange={(e) => setCopilot(e.target.value)}
              placeholder="Ask NOVA..."
              className="flex-1 text-[12px] px-2 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
            <button className="h-8 w-8 grid place-items-center rounded-md bg-blue-600 text-white hover:bg-blue-700">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Small helpers used above */
function HeatCell({ v, good = false }: { v: number; good?: boolean }) {
  const tone = good
    ? v >= 90 ? "bg-emerald-500" : v >= 75 ? "bg-emerald-400" : v >= 60 ? "bg-amber-400" : "bg-red-400"
    : v >= 90 ? "bg-red-500" : v >= 80 ? "bg-orange-500" : v >= 60 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-[10px] text-slate-600 w-8">{v}%</span>
    </div>
  );
}

function Plug2() {
  return <Snowflake className="h-3 w-3 text-blue-500" />;
}
