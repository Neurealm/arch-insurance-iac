import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowLeft, Bell, Bot, Boxes, Brain, ChartBar, CheckCircle2,
  Cloud, Cog, Database, DollarSign, Filter, Gauge, Globe2, HelpCircle,
  KeyRound, Layers, LineChart, Lock, MapPin, Network, Play, Plug, RefreshCw,
  Search, Server, Settings, ShieldCheck, Sparkles, TrendingUp, Users, Wand2,
  Workflow, X, FileText, Send, Route, Radio,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";
const glass = "rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm";
const chip = "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border";
const okChip = `${chip} border-emerald-200 bg-emerald-50 text-emerald-700`;
const warnChip = `${chip} border-amber-200 bg-amber-50 text-amber-700`;
const critChip = `${chip} border-red-200 bg-red-50 text-red-700`;
const infoChip = `${chip} border-blue-200 bg-blue-50 text-blue-700`;

const statusDot = (s: string) =>
  s === "Healthy" || s === "Success" ? "bg-emerald-500"
    : s === "Warning" || s === "Degrading" || s === "Degraded Performance" ? "bg-amber-500"
    : s === "High" ? "bg-orange-500"
    : s === "Critical" ? "bg-red-500"
    : s === "Investigating" ? "bg-blue-500"
    : "bg-slate-400";
const statusColor = (s: string) =>
  s === "Healthy" ? "text-emerald-600"
    : s === "Warning" || s === "Degrading" ? "text-amber-600"
    : s === "High" ? "text-orange-600"
    : s === "Critical" ? "text-red-600"
    : s === "Medium" ? "text-amber-600"
    : s === "Low" ? "text-slate-600"
    : "text-slate-600";

const KPIS = [
  { icon: ShieldCheck, label: "Overall Dependency Health",   value: "99.3%",  sub: "Healthy",         tone: "text-emerald-600" },
  { icon: AlertTriangle,label: "Providers at Risk",           value: "17",    sub: "High",            tone: "text-amber-600" },
  { icon: Radio,        label: "Predicted External Outages",  value: "6",     sub: "Next 24 Hours",   tone: "text-red-600" },
  { icon: Boxes,        label: "Business Services at Risk",   value: "24",    sub: "+6 vs yesterday", tone: "text-orange-600" },
  { icon: Cog,          label: "Applications Impacted",       value: "68",    sub: "+12 vs yesterday",tone: "text-amber-600" },
  { icon: CheckCircle2, label: "SLA Violations",              value: "4",     sub: "+1 vs yesterday", tone: "text-red-600" },
  { icon: Bot,          label: "Automated Failovers",         value: "31",    sub: "Today",           tone: "text-blue-600" },
  { icon: Activity,     label: "Downtime Prevented",          value: "184 hrs", sub: "Annualized",    tone: "text-emerald-600" },
  { icon: DollarSign,   label: "Financial Risk Avoided",      value: "$9.8M", sub: "Annualized",      tone: "text-emerald-600" },
  { icon: Plug,         label: "API Success Rate",            value: "99.96%",sub: "Excellent",       tone: "text-emerald-600" },
];

const HEADER = [
  { label: "Operational",         sub: "All Systems Normal", dot: "bg-emerald-500" },
  { label: "External Dependencies", sub: "1,248" },
  { label: "Critical Providers",  sub: "132" },
  { label: "Applications Protected", sub: "684" },
  { label: "Business Services",   sub: "412" },
  { label: "Last Dependency Analysis", sub: "7 Seconds Ago" },
  { label: "Prediction Engine",   sub: "Active", tone: "text-emerald-600" },
];

const TOPO = [
  { label: "Enterprise",        count: "1",     icon: Boxes },
  { label: "Applications",      count: "684",   icon: Cog },
  { label: "APIs",              count: "2,381", icon: Plug },
  { label: "Providers",         count: "1,248", icon: Cloud },
  { label: "Cloud / Partners",  count: "215",   icon: Globe2 },
  { label: "Business Services", count: "412",   icon: Users },
];

const PROVIDERS = [
  { name: "Microsoft 365", avail: "99.98%", lat: "128 ms", api: "99.99%", sla: "100%", inc: 0, cert: "Valid",       risk: "Low" },
  { name: "AWS",           avail: "99.95%", lat: "142 ms", api: "99.97%", sla: "99%",  inc: 1, cert: "Valid",       risk: "Low" },
  { name: "Salesforce",    avail: "99.81%", lat: "208 ms", api: "99.86%", sla: "98%",  inc: 2, cert: "Valid",       risk: "Medium" },
  { name: "ServiceNow",    avail: "99.77%", lat: "198 ms", api: "99.82%", sla: "97%",  inc: 1, cert: "Expiring (18d)", risk: "Medium" },
  { name: "Azure",         avail: "99.74%", lat: "175 ms", api: "99.80%", sla: "98%",  inc: 2, cert: "Valid",       risk: "Medium" },
  { name: "Cloudflare",    avail: "99.99%", lat: "46 ms",  api: "99.99%", sla: "100%", inc: 0, cert: "Valid",       risk: "Low" },
  { name: "Okta",          avail: "99.61%", lat: "215 ms", api: "99.71%", sla: "96%",  inc: 1, cert: "Valid",       risk: "High" },
  { name: "Stripe",        avail: "99.48%", lat: "245 ms", api: "99.52%", sla: "95%",  inc: 2, cert: "Expiring (9d)", risk: "High" },
];

const AI_RISK = [
  { p: "Stripe",    hs: 72, fail: "In 18 Hours", conf: "82%", impact: "High",   apps: 12, users: "125,340" },
  { p: "Salesforce",hs: 76, fail: "In 22 Hours", conf: "78%", impact: "High",   apps: 9,  users: "78,210" },
  { p: "Twilio",    hs: 80, fail: "In 1 Day",    conf: "76%", impact: "Medium", apps: 6,  users: "54,889" },
  { p: "Okta",      hs: 81, fail: "In 1 Day",    conf: "75%", impact: "High",   apps: 14, users: "210,455" },
  { p: "AWS (us-east-1)", hs: 82, fail: "In 2 Days", conf: "74%", impact: "High", apps: 22, users: "310,125" },
  { p: "Workday",   hs: 83, fail: "In 2 Days",   conf: "72%", impact: "Medium", apps: 4,  users: "33,002" },
  { p: "PayPal",    hs: 84, fail: "In 3 Days",   conf: "72%", impact: "High",   apps: 7,  users: "66,443" },
  { p: "DocuSign",  hs: 85, fail: "In 3 Days",   conf: "70%", impact: "Medium", apps: 6,  users: "29,334" },
  { p: "GitHub",    hs: 86, fail: "In 4 Days",   conf: "68%", impact: "Low",    apps: 19, users: "16,992" },
  { p: "Snowflake", hs: 87, fail: "In 4 Days",   conf: "66%", impact: "Medium", apps: 3,  users: "15,443" },
];

const ISSUES = [
  { i: "Salesforce API latency high",   p: "Salesforce", impact: "High",   risk: "High",   age: "18m", act: "Investigate" },
  { i: "Stripe intermittent errors",    p: "Stripe",     impact: "High",   risk: "High",   age: "24m", act: "Investigate" },
  { i: "Okta certificate expiring",     p: "Okta",       impact: "Medium", risk: "High",   age: "1h",  act: "Update Cert" },
  { i: "Twilio API rate limit reached", p: "Twilio",     impact: "Medium", risk: "Medium", age: "2h",  act: "Throttle" },
  { i: "AWS us-east-1 degradation",     p: "AWS",        impact: "High",   risk: "High",   age: "3h",  act: "Failover" },
  { i: "PayPal slow response time",     p: "PayPal",     impact: "Medium", risk: "Medium", age: "4h",  act: "Investigate" },
  { i: "ServiceNow maintenance",        p: "ServiceNow", impact: "Low",    risk: "Low",    age: "5h",  act: "Monitor" },
  { i: "DocuSign API errors",           p: "DocuSign",   impact: "Medium", risk: "Medium", age: "6h",  act: "Investigate" },
  { i: "GitHub API latency high",       p: "GitHub",     impact: "Low",    risk: "Low",    age: "8h",  act: "Monitor" },
  { i: "Cloudflare DNS issues",         p: "Cloudflare", impact: "High",   risk: "High",   age: "9h",  act: "Reroute" },
];

const HEATMAP_COLS = ["Availability","Latency","Errors","Security","Certificates","DNS","SLA","Region","API Perf","Risk"] as const;
const HEATMAP = [
  { p: "Microsoft 365", cells: ["g","g","g","g","g","g","g","g","g","Low"] },
  { p: "AWS",           cells: ["g","g","g","g","g","g","g","g","g","Low"] },
  { p: "Salesforce",    cells: ["a","a","a","g","g","g","a","g","a","Medium"] },
  { p: "ServiceNow",    cells: ["g","a","g","g","a","g","g","g","g","Medium"] },
  { p: "Azure",         cells: ["a","a","g","g","g","g","g","a","g","Medium"] },
  { p: "Okta",          cells: ["a","a","g","g","g","g","g","g","g","High"] },
  { p: "Stripe",        cells: ["r","a","r","g","a","g","r","g","a","High"] },
  { p: "Twilio",        cells: ["a","g","g","g","g","g","a","g","a","Medium"] },
  { p: "PayPal",        cells: ["a","a","g","g","g","g","a","g","a","Medium"] },
  { p: "Cloudflare",    cells: ["g","g","g","g","g","g","g","g","g","Low"] },
];

const ACTIVITY = [
  { t: "12:34:28", d: "Detected high latency in Salesforce API",           sys: "Salesforce",       status: "Critical" },
  { t: "12:34:35", d: "Correlated with vendor incident and network path",  sys: "Salesforce",       status: "High" },
  { t: "12:34:42", d: "Predicted elevated risk of authentication failures",sys: "Okta",             status: "High" },
  { t: "12:34:47", d: "Identified 9 impacted applications",                 sys: "9 Apps",           status: "Warning" },
  { t: "12:34:53", d: "Recommended failover to backup endpoint",           sys: "Salesforce",       status: "Success" },
  { t: "12:35:02", d: "Executed automated failover",                        sys: "Success",          status: "Success" },
  { t: "12:35:09", d: "Validated API performance recovery",                 sys: "Salesforce",       status: "Success" },
  { t: "12:35:14", d: "Generated executive summary report",                 sys: "Report",           status: "Success" },
];

const RECS = [
  { title: "Fail Over Salesforce to Secondary Region",  conf: 94, saved: "12 min RTO",  impact: "Restores 9 apps", auto: true },
  { title: "Enable Circuit Breaker on Stripe endpoints",conf: 92, saved: "58% error reduction", impact: "Protects checkout", auto: true },
  { title: "Renew Okta Signing Certificate",            conf: 96, saved: "SSO continuity", impact: "24k users", auto: true },
  { title: "Switch Regional Endpoint AWS us-east-1",    conf: 89, saved: "8 min RTO",   impact: "22 apps",  auto: true },
  { title: "Rotate Twilio API Keys",                    conf: 88, saved: "Rate-limit relief", impact: "Notification path", auto: true },
  { title: "Refresh SAML Metadata (Ping Identity)",     conf: 87, saved: "Auth loop fix", impact: "36k users", auto: false },
];

const AUTOMATIONS = [
  { name: "Fail Over Provider",       desc: "Switch traffic to secondary provider",    runtime: "2-6 min" },
  { name: "Switch API Endpoint",      desc: "Route traffic to alternate endpoint",     runtime: "1-2 min" },
  { name: "Rotate API Keys",          desc: "Cycle third-party API keys",              runtime: "1-3 min" },
  { name: "Update Certificates",      desc: "Renew and deploy TLS certificates",       runtime: "3-8 min" },
  { name: "Refresh OAuth Tokens",     desc: "Force refresh of OAuth tokens",           runtime: "< 1 min" },
  { name: "Refresh SAML Metadata",    desc: "Update SAML IdP metadata",                runtime: "1-4 min" },
  { name: "Increase Timeouts",        desc: "Extend request timeouts globally",        runtime: "< 1 min" },
  { name: "Enable Circuit Breaker",   desc: "Trip breaker on failing dependency",      runtime: "< 1 min" },
  { name: "Enable Cached Responses",  desc: "Serve cached data during degradation",    runtime: "1-3 min" },
  { name: "Open ServiceNow Incident", desc: "Create Sev-1/2 incident with context",    runtime: "< 1 min" },
  { name: "Create Executive Report",  desc: "PDF/PPT executive summary",               runtime: "1-2 min" },
  { name: "Validate Disaster Recovery", desc: "Run automated DR verification",         runtime: "5-10 min" },
];

const VENDOR_STATUS = [
  { p: "AWS",        status: "Investigating",       note: "US-East-1 network connectivity issues" },
  { p: "Salesforce", status: "Degraded Performance",note: "API latency elevated in NA and EU" },
  { p: "Microsoft 365", status: "Healthy",          note: "All services operating normally" },
  { p: "ServiceNow", status: "Scheduled Maintenance", note: "San Diego Datacenter Upgrade" },
  { p: "Okta",       status: "Degraded Performance",note: "Increased authentication latency" },
];

const INTEGRATIONS = [
  "Azure","AWS","Google Cloud","Cloudflare","Akamai","Salesforce","ServiceNow","Workday","SAP","Oracle Cloud",
  "Snowflake","Stripe","PayPal","Twilio","DocuSign","Okta","Ping Identity","GitHub","Atlassian","PagerDuty",
  "Zoom","Slack","Datadog","Dynatrace","Splunk Cloud","Cisco ThousandEyes","Azure Monitor","AWS CloudWatch",
  "ServiceNow CMDB","CrowdStrike","Microsoft Defender XDR","Microsoft Sentinel",
];

const TIME_RANGES = ["24H", "7D", "30D"] as const;

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "Critical" ? critChip
      : status === "High" || status === "Warning" || status === "Degrading" || status === "Degraded Performance" ? warnChip
      : status === "Investigating" || status === "Medium" ? infoChip
      : okChip;
  return (
    <span className={cls}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot(status)}`} />
      {status}
    </span>
  );
}

function Sparkline({ tone = "emerald" as "emerald" | "amber" | "red" | "blue" }) {
  const stroke = tone === "emerald" ? "#10b981" : tone === "amber" ? "#f59e0b" : tone === "red" ? "#ef4444" : "#3b82f6";
  const pts = [4, 6, 5, 8, 7, 9, 6, 11, 9, 12, 10, 14, 12, 13];
  const w = 90, h = 22;
  const d = pts.map((y, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * w} ${h - y}`).join(" ");
  return <svg width={w} height={h}><path d={d} fill="none" stroke={stroke} strokeWidth="1.5" /></svg>;
}

function PerfChart() {
  const p95 = [180, 190, 210, 205, 220, 240, 235, 260, 250, 245, 260, 280, 275, 260, 250];
  const p99 = [280, 290, 310, 315, 330, 360, 355, 380, 370, 365, 380, 400, 395, 380, 370];
  const err = [30, 35, 40, 30, 45, 60, 55, 70, 55, 45, 55, 75, 65, 55, 50];
  const w = 640, h = 200, pad = 30, max = 500;
  const line = (data: number[], color: string) => {
    const d = data.map((y, i) => `${i === 0 ? "M" : "L"} ${pad + (i / (data.length - 1)) * (w - pad * 2)} ${h - pad - (y / max) * (h - pad * 2)}`).join(" ");
    return <path d={d} stroke={color} strokeWidth="1.5" fill="none" />;
  };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {[0,250,500,750,1000].map((g,i)=>(
        <g key={g}>
          <line x1={pad} x2={w-pad} y1={h-pad-(i/4)*(h-pad*2)} y2={h-pad-(i/4)*(h-pad*2)} stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x={2} y={h-pad-(i/4)*(h-pad*2)+3} className="fill-slate-400" style={{fontSize:9}}>{g}ms</text>
        </g>
      ))}
      {line(p95, "#3b82f6")}
      {line(p99, "#10b981")}
      {line(err, "#ef4444")}
      {["12AM","4AM","8AM","12PM","4PM","8PM","Now"].map((l,i)=>(
        <text key={l} x={pad+(i/6)*(w-pad*2)} y={h-8} className="fill-slate-400" style={{fontSize:9}} textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

function heatColor(v: string) {
  return v === "g" ? "bg-emerald-500" : v === "a" ? "bg-amber-500" : v === "r" ? "bg-red-500" : "bg-slate-300";
}

export default function ThirdPartyDependencyHealth() {
  const nav = useNavigate();
  const [range, setRange] = useState<(typeof TIME_RANGES)[number]>("24H");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ p: string } | null>({ p: "Salesforce" });
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilot, setCopilot] = useState("");

  const filteredRisk = useMemo(() => {
    if (!query) return AI_RISK;
    const q = query.toLowerCase();
    return AI_RISK.filter((r) => r.p.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex">
        {/* Left rail */}
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
              { label: "Dependency Map",   icon: Network },
              { label: "Providers",        icon: Cloud },
              { label: "Applications",     icon: Cog },
              { label: "APIs",             icon: Plug },
              { label: "Performance",      icon: Activity },
              { label: "Risk Prediction",  icon: Sparkles },
              { label: "Incidents",        icon: AlertTriangle },
              { label: "Business Impact",  icon: Users },
              { label: "Security & Trust", icon: Lock },
              { label: "Internet Path",    icon: Route },
              { label: "Vendor Status",    icon: Radio },
              { label: "Automation",       icon: Workflow },
              { label: "Reports",          icon: ChartBar },
              { label: "Insights",         icon: Brain },
              { label: "Settings",         icon: Settings },
            ].map((n) => {
              const I = n.icon;
              return (
                <button key={n.label}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 transition ${n.active ? "bg-blue-500/20 text-white" : "text-slate-300 hover:bg-white/5"}`}>
                  <I className="h-4 w-4" /><span className="truncate">{n.label}</span>
                </button>
              );
            })}
            <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-wider text-blue-300/70">Quick Actions</div>
            {["Open Investigation","Run Health Check","Create ServiceNow Incident","Vendor Escalation","Generate Report","View Executive Summary"].map((q) => (
              <button key={q} className="w-full text-left rounded-lg px-3 py-1.5 text-[12px] text-slate-300 hover:bg-white/5 flex items-center gap-2">
                <Play className="h-3 w-3 text-blue-300" /> {q}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-500/20 grid place-items-center"><Sparkles className="h-4 w-4 text-blue-300" /></div>
            <div className="text-[11px]"><div className="text-slate-400">Powered by</div><div className="font-semibold">NOVA AI</div></div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
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
                <h1 className="text-xl font-bold leading-tight">Third-Party Dependency Health</h1>
                <p className="text-[11px] text-slate-500 leading-snug max-w-3xl">
                  Continuously monitor the availability, performance, resilience, security, and business impact of all external services,
                  APIs, SaaS providers, cloud platforms, identity providers, payment gateways, and partner integrations to proactively
                  prevent business disruptions and automate dependency remediation.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-[11px]">
                {HEADER.map((h) => (
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
                  <span className="absolute -top-1 -right-1 h-4 w-4 grid place-items-center text-[9px] font-bold bg-red-500 text-white rounded-full">6</span>
                </button>
                <button className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
                <button className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><Users className="h-4 w-4 text-slate-600" /></button>
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
                      <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 grid place-items-center"><I className="h-3.5 w-3.5" /></div>
                      <div className="text-[10px] text-slate-500 leading-tight">{k.label}</div>
                    </div>
                    <div className={`mt-2 text-xl font-bold ${k.tone}`}>{k.value}</div>
                    <div className="text-[10px] text-slate-500">{k.sub}</div>
                    <div className="mt-1"><Sparkline tone={k.tone.includes("red") ? "red" : k.tone.includes("amber") ? "amber" : k.tone.includes("blue") ? "blue" : "emerald"} /></div>
                  </div>
                );
              })}
            </section>

            {/* Dependency Map + Providers + AI Risk + Selected */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Enterprise Dependency Map</h3>
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="grid grid-cols-6 gap-2 text-[10px] text-center">
                  {TOPO.map((t) => {
                    const I = t.icon;
                    return (
                      <div key={t.label} className="flex flex-col items-center gap-1">
                        <div className="h-8 w-8 rounded-md border border-slate-200 grid place-items-center text-slate-600">
                          <I className="h-4 w-4" />
                        </div>
                        <div className="text-slate-700 font-medium leading-tight">{t.label}</div>
                        <div className="text-slate-500">{t.count}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 h-40 rounded-lg border border-slate-100 bg-gradient-to-br from-blue-50/40 to-emerald-50/40 relative overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 gap-2 p-2">
                    {Array.from({length:32}).map((_,i)=>{
                      const c = i%9===0 ? "bg-red-500" : i%5===0 ? "bg-amber-500" : "bg-emerald-500";
                      return <span key={i} className={`h-2 w-2 rounded-full ${c} opacity-70 self-center justify-self-center`} />;
                    })}
                  </div>
                  <div className="absolute bottom-1 left-2 text-[10px] text-slate-500">Global provider health telemetry</div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                  {[
                    { c: "bg-emerald-500", l: "Healthy > 99%" },
                    { c: "bg-amber-500",   l: "Degrading 95-99%" },
                    { c: "bg-orange-500",  l: "Warning 90-95%" },
                    { c: "bg-red-500",     l: "Critical < 90%" },
                    { c: "bg-slate-400",   l: "Unknown" },
                  ].map((x) => (
                    <div key={x.l} className="flex items-center gap-1 text-slate-600"><span className={`h-2 w-2 rounded-full ${x.c}`} />{x.l}</div>
                  ))}
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Top Third-Party Providers</h3>
                  <button className="text-[11px] text-blue-600 hover:underline">View All Providers</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead className="text-slate-500">
                      <tr className="text-left">
                        <th className="py-1 pr-2 font-medium">Provider</th>
                        <th className="py-1 pr-2 font-medium">Avail.</th>
                        <th className="py-1 pr-2 font-medium">Latency</th>
                        <th className="py-1 pr-2 font-medium">API</th>
                        <th className="py-1 pr-2 font-medium">SLA</th>
                        <th className="py-1 pr-2 font-medium">Inc</th>
                        <th className="py-1 pr-2 font-medium">Cert</th>
                        <th className="py-1 font-medium">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PROVIDERS.map((p) => (
                        <tr key={p.name} className="border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer"
                            onClick={() => setSelected({ p: p.name })}>
                          <td className="py-1.5 pr-2 font-medium text-slate-900">{p.name}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{p.avail}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{p.lat}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{p.api}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{p.sla}</td>
                          <td className={`py-1.5 pr-2 font-semibold ${p.inc>1?"text-red-600":p.inc===1?"text-amber-600":"text-emerald-600"}`}>{p.inc}</td>
                          <td className={`py-1.5 pr-2 ${p.cert.startsWith("Expiring")?"text-amber-600":"text-emerald-600"}`}>{p.cert}</td>
                          <td className={`py-1.5 font-semibold ${statusColor(p.risk)}`}>{p.risk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold">AI Dependency Risk Prediction <span className="text-slate-400 font-normal">(Top 10)</span></h3>
                    <div className="text-[10px] text-slate-500">Powered by NOVA AI · Confidence-scored</div>
                  </div>
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-1.5" />
                    <input value={query} onChange={(e)=>setQuery(e.target.value)}
                      placeholder="Search providers..."
                      className="text-[11px] pl-6 pr-2 py-1 rounded-md border border-slate-200" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead className="text-slate-500">
                      <tr className="text-left">
                        <th className="py-1 pr-2 font-medium">Provider</th>
                        <th className="py-1 pr-2 font-medium">Health</th>
                        <th className="py-1 pr-2 font-medium">Predicted Failure</th>
                        <th className="py-1 pr-2 font-medium">Conf.</th>
                        <th className="py-1 pr-2 font-medium">Impact</th>
                        <th className="py-1 pr-2 font-medium">Apps</th>
                        <th className="py-1 font-medium">Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRisk.map((r) => (
                        <tr key={r.p} className="border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer"
                            onClick={()=>setSelected({p:r.p})}>
                          <td className="py-1.5 pr-2 font-medium text-slate-900">{r.p}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.hs}</td>
                          <td className="py-1.5 pr-2 text-amber-600">{r.fail}</td>
                          <td className="py-1.5 pr-2 text-emerald-600 font-semibold">{r.conf}</td>
                          <td className={`py-1.5 pr-2 font-semibold ${statusColor(r.impact)}`}>{r.impact}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{r.apps}</td>
                          <td className="py-1.5 text-slate-700">{r.users}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="text-[11px] text-blue-600 hover:underline mt-2">View All Risk Predictions</button>
              </div>
            </section>

            {/* API Perf + Heatmap + Top Issues + Selected Panel */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-4 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">API Performance Overview</h3>
                  <div className="flex items-center gap-1">
                    {TIME_RANGES.map((r) => (
                      <button key={r} onClick={()=>setRange(r)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${range===r?"bg-blue-600 text-white":"text-slate-600 hover:bg-slate-100"}`}>{r}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[11px]">
                  {[
                    { l: "Availability", v: "99.96%", tone: "text-emerald-600" },
                    { l: "P95 Latency",  v: "184 ms", tone: "text-slate-900" },
                    { l: "P99 Latency",  v: "312 ms", tone: "text-slate-900" },
                    { l: "Error Rate",   v: "0.04%",  tone: "text-emerald-600" },
                  ].map((k)=>(
                    <div key={k.l} className={`${glass} p-2`}>
                      <div className="text-[10px] text-slate-500">{k.l}</div>
                      <div className={`font-bold ${k.tone}`}>{k.v}</div>
                    </div>
                  ))}
                </div>
                <div className="h-[200px] mt-2"><PerfChart /></div>
                <div className="flex gap-3 text-[10px] text-slate-600">
                  <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />P95 Latency</div>
                  <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />P99 Latency</div>
                  <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Error Rate</div>
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-5 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">External Dependency Heat Map</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead className="text-slate-500">
                      <tr className="text-left">
                        <th className="py-1 pr-2 font-medium"> </th>
                        {HEATMAP_COLS.map((c)=>(<th key={c} className="py-1 px-1 font-medium text-center">{c}</th>))}
                      </tr>
                    </thead>
                    <tbody>
                      {HEATMAP.map((row)=>(
                        <tr key={row.p} className="border-t border-slate-100">
                          <td className="py-1.5 pr-2 font-medium text-slate-900">{row.p}</td>
                          {row.cells.map((cell, idx)=>{
                            if (idx === row.cells.length-1) {
                              return <td key={idx} className={`py-1.5 px-1 text-center font-semibold ${statusColor(cell)}`}>{cell}</td>;
                            }
                            return (
                              <td key={idx} className="py-1.5 px-1 text-center">
                                <span className={`inline-block h-2.5 w-2.5 rounded-full ${heatColor(cell)}`} />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Selected Provider</h3>
                  {selected && <button onClick={()=>setSelected(null)}><X className="h-4 w-4 text-slate-400" /></button>}
                </div>
                {selected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{selected.p}</div>
                        <div className="text-[10px] text-slate-500">SaaS CRM Platform</div>
                      </div>
                      <span className={`ml-auto ${warnChip}`}>At Risk</span>
                    </div>
                    <div className="grid grid-cols-4 text-[10px] border-b border-slate-100 pb-2">
                      {["Overview","Performance","Security","Business Impact"].map((t,i)=>(
                        <button key={t} className={`py-1 ${i===0?"text-blue-600 border-b-2 border-blue-600 -mb-[9px]":"text-slate-500"}`}>{t}</button>
                      ))}
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold mb-1">General</div>
                      <div className="text-[11px] space-y-0.5">
                        {[
                          ["Region","NA / US East"],
                          ["Status","Degraded"],
                          ["API Success Rate","99.86%"],
                          ["Business Owner","CRM Platform Team"],
                          ["Vendor Contact","enterprise-support@salesforce.com"],
                          ["Support Tier","Premier"],
                          ["Contract Expires","Dec 12, 2025"],
                        ].map(([k,v])=>(
                          <div key={k} className="flex justify-between">
                            <span className="text-slate-500">{k}</span>
                            <span className="text-slate-900 font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold mb-1">Health</div>
                      {[
                        { l: "Availability (24h)", v: "99.81%", delta: "-0.16%" },
                        { l: "Latency (P95)",      v: "208 ms",  delta: "+0.31%" },
                        { l: "API Success Rate",   v: "99.86%", delta: "-0.03%" },
                        { l: "Error Rate",         v: "0.18%",  delta: "" },
                        { l: "SLA Compliance",     v: "98%",    delta: "" },
                        { l: "Incidents",          v: "2 Active", delta: "" },
                      ].map((r)=>(
                        <div key={r.l} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">{r.l}</span>
                          <span className="flex gap-2">
                            <span className="text-slate-900 font-medium">{r.v}</span>
                            <span className={`text-[10px] ${r.delta.startsWith("-")?"text-emerald-600":r.delta.startsWith("+")?"text-red-600":"text-slate-400"}`}>{r.delta}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button className="flex-1 text-[11px] border border-slate-200 rounded-md py-1 hover:bg-slate-50">Investigate</button>
                      <button className="flex-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded-md py-1">Run Action</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500">Select a provider to view engineering details.</div>
                )}
              </div>
            </section>

            {/* Business Impact + Vendor Status + Activity + Internet Path */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Business Impact Dashboard</h3>
                  <button className="text-[11px] text-blue-600 hover:underline">View Full Map</button>
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div className="relative h-28 w-28 mx-auto rounded-full grid place-items-center"
                       style={{background: "conic-gradient(#ef4444 0 33%, #f97316 33% 62%, #f59e0b 62% 87%, #10b981 87% 100%)"}}>
                    <div className="h-20 w-20 rounded-full bg-white grid place-items-center">
                      <div className="text-center">
                        <div className="text-lg font-bold">24</div>
                        <div className="text-[9px] text-slate-500 leading-tight">Services at Risk</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] space-y-1">
                    {[["Critical","8 (33%)","bg-red-500"],["High","7 (29%)","bg-orange-500"],["Medium","6 (25%)","bg-amber-500"],["Low","3 (13%)","bg-emerald-500"]].map(([l,v,c])=>(
                      <div key={l} className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${c}`} /><span className="text-slate-600">{l}</span><span className="ml-auto font-semibold">{v}</span></div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-[11px]">
                  {[
                    ["Users Impacted","412,540"],
                    ["Revenue Exposure","$3.6M"],
                    ["Transactions / Min","85,230"],
                    ["Estimated Downtime","14.2 hrs"],
                    ["Executive Priority","High"],
                  ].map(([l,v])=>(
                    <div key={l} className="flex justify-between">
                      <span className="text-slate-500">{l}</span>
                      <span className="text-slate-900 font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Live Vendor Status Center</h3>
                  <label className="text-[10px] text-slate-500 flex items-center gap-1"><input type="checkbox" defaultChecked className="scale-75" /> Show my providers only</label>
                </div>
                <div className="space-y-2">
                  {VENDOR_STATUS.map((v)=>(
                    <div key={v.p} className="flex items-start gap-2 border-b border-slate-100 pb-2 last:border-0">
                      <span className={`mt-1 h-2 w-2 rounded-full ${statusDot(v.status)}`} />
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-slate-900">{v.p}</div>
                        <div className={`text-[10px] font-semibold ${v.status==="Healthy"?"text-emerald-600":v.status==="Investigating"?"text-blue-600":"text-amber-600"}`}>{v.status}</div>
                        <div className="text-[11px] text-slate-600">{v.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="text-[11px] text-blue-600 hover:underline mt-2">View All Vendor Status</button>
              </div>

              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Digital Coworker Activity Feed <span className="text-slate-400 font-normal">(Live)</span></h3>
                </div>
                <div className="space-y-2">
                  {ACTIVITY.map((a,i)=>(
                    <div key={i} className="grid grid-cols-[54px_1fr_70px] gap-2 text-[11px] items-center border-b border-slate-100 pb-1.5 last:border-0">
                      <div className="text-slate-500 font-mono text-[10px]">{a.t}</div>
                      <div>
                        <div className="text-slate-900">{a.d}</div>
                        <div className="text-[10px] text-slate-500">{a.sys}</div>
                      </div>
                      <div className="justify-self-end"><StatusPill status={a.status} /></div>
                    </div>
                  ))}
                </div>
                <button className="text-[11px] text-blue-600 hover:underline mt-2">View Full Activity</button>
              </div>

              <div className={`${card} col-span-12 xl:col-span-3 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Internet Path Visualization</h3>
                </div>
                <div className="flex items-center justify-between text-[10px] gap-1">
                  {["Enterprise","ISP","Backbone","IX","CDN","Cloud","Salesforce"].map((h,i)=>(
                    <div key={h} className="flex items-center gap-1">
                      <div className="flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full grid place-items-center text-white ${i===2?"bg-amber-500":i===5?"bg-emerald-500":"bg-blue-500"}`}>
                          <Server className="h-3 w-3" />
                        </div>
                        <div className="text-[9px] text-slate-600 mt-0.5">{h}</div>
                      </div>
                      {i<6 && <div className="w-3 h-px bg-slate-300" />}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[11px] font-semibold text-slate-700">Path Metrics (Current)</div>
                <div className="grid grid-cols-5 gap-1 mt-1 text-[10px]">
                  {[["Latency","186 ms"],["Packet Loss","0.02%"],["Jitter","3 ms"],["Hops","14"],["Health","Healthy"]].map(([k,v])=>(
                    <div key={k} className={`${glass} p-1.5 text-center`}>
                      <div className="text-slate-500">{k}</div>
                      <div className={`font-semibold ${k==="Health"?"text-emerald-600":"text-slate-900"}`}>{v}</div>
                    </div>
                  ))}
                </div>
                <button className="text-[11px] text-blue-600 hover:underline mt-3">View Full Path Analysis</button>
              </div>
            </section>

            {/* Top issues + AI recommendations */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-5 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Top Issues <span className="text-slate-400 font-normal">(10)</span></h3>
                  <button className="text-[11px] text-blue-600 hover:underline">View All Issues</button>
                </div>
                <table className="w-full text-[11px]">
                  <thead className="text-slate-500">
                    <tr className="text-left">
                      <th className="py-1 pr-2 font-medium">Issue</th>
                      <th className="py-1 pr-2 font-medium">Provider</th>
                      <th className="py-1 pr-2 font-medium">Impact</th>
                      <th className="py-1 pr-2 font-medium">Risk</th>
                      <th className="py-1 pr-2 font-medium">Age</th>
                      <th className="py-1 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ISSUES.map((i)=>(
                      <tr key={i.i} className="border-t border-slate-100">
                        <td className="py-1.5 pr-2 flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${statusDot(i.risk)}`} />
                          <span className="text-slate-900">{i.i}</span>
                        </td>
                        <td className="py-1.5 pr-2 text-slate-700">{i.p}</td>
                        <td className={`py-1.5 pr-2 font-semibold ${statusColor(i.impact)}`}>{i.impact}</td>
                        <td className={`py-1.5 pr-2 font-semibold ${statusColor(i.risk)}`}>{i.risk}</td>
                        <td className="py-1.5 pr-2 text-slate-500">{i.age}</td>
                        <td className="py-1.5 text-blue-600 font-medium">{i.act}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`${card} col-span-12 xl:col-span-7 p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">AI Recommendations</h3>
                  <span className={infoChip}><Sparkles className="h-3 w-3" /> NOVA AI</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {RECS.map((r) => (
                    <div key={r.title} className="rounded-xl border border-slate-200 p-3 hover:shadow-md transition">
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center"><Wand2 className="h-4 w-4" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-slate-900 leading-tight">{r.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{r.impact}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-[10px]">
                        <div><div className="text-slate-500">Confidence</div><div className="font-semibold text-emerald-600">{r.conf}%</div></div>
                        <div><div className="text-slate-500">Benefit</div><div className="font-semibold text-slate-900">{r.saved}</div></div>
                        <div><div className="text-slate-500">Automation</div><div className={`font-semibold ${r.auto?"text-emerald-600":"text-amber-600"}`}>{r.auto?"Available":"Manual"}</div></div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 text-[11px] border border-slate-200 rounded-md py-1 hover:bg-slate-50">Approve</button>
                        <button className="flex-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded-md py-1 flex items-center justify-center gap-1"><Play className="h-3 w-3" /> Execute</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Security & Trust + Automation */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-5 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Security & Trust Dashboard</h3>
                  <span className={okChip}><CheckCircle2 className="h-3 w-3" /> Attested</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  {[
                    { l: "Certificate Expiring < 30d", v: "12", tone: "text-amber-600" },
                    { l: "TLS 1.3 Adoption",            v: "97.4%", tone: "text-emerald-600" },
                    { l: "OAuth Health",                 v: "99.6%", tone: "text-emerald-600" },
                    { l: "OpenID Connect",               v: "99.8%", tone: "text-emerald-600" },
                    { l: "SAML Health",                  v: "98.9%", tone: "text-emerald-600" },
                    { l: "API Tokens Expiring",          v: "4",     tone: "text-amber-600" },
                    { l: "DNSSEC Coverage",              v: "92.1%", tone: "text-emerald-600" },
                    { l: "SOC2 Attested Providers",      v: "98%",   tone: "text-emerald-600" },
                    { l: "Supply-Chain Alerts",          v: "3",     tone: "text-red-600" },
                  ].map((k)=>(
                    <div key={k.l} className={`${glass} p-2`}>
                      <div className="text-[10px] text-slate-500">{k.l}</div>
                      <div className={`font-semibold ${k.tone}`}>{k.v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-[10px]">
                  {["SOC2","ISO 27001","PCI DSS","HIPAA","FedRAMP","GDPR","NIST 800-53","CIS"].map((f)=>(
                    <div key={f} className="flex items-center gap-1 border border-slate-100 rounded-md px-2 py-1"><ShieldCheck className="h-3 w-3 text-emerald-600" />{f}</div>
                  ))}
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-7 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Automation Library</h3>
                  <button className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Sync workflows</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {AUTOMATIONS.map((a) => (
                    <div key={a.name} className="rounded-lg border border-slate-200 p-2 hover:border-blue-300 hover:bg-blue-50/40 transition cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 grid place-items-center"><Workflow className="h-3.5 w-3.5" /></div>
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

            {/* Digital Supply Chain + Reports */}
            <section className="grid grid-cols-12 gap-4">
              <div className={`${card} col-span-12 xl:col-span-7 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Digital Supply Chain Dashboard</h3>
                  <span className={infoChip}><Gauge className="h-3 w-3" /> Resilience Score 82</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
                  {[
                    ["Supplier Dependency Score","74"],
                    ["Concentration Risk","High"],
                    ["Single Points of Failure","9"],
                    ["Backup Providers","62%"],
                    ["Provider Diversity","0.68"],
                    ["Regional Distribution","4 Regions"],
                    ["Cloud Concentration","AWS 54%"],
                    ["Vendor Financial Health","A-"],
                    ["Operational Risk","Medium"],
                    ["Resilience Score","82 / 100"],
                  ].map(([l,v])=>(
                    <div key={l} className={`${glass} p-2`}>
                      <div className="text-[10px] text-slate-500">{l}</div>
                      <div className="font-semibold text-slate-900">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${card} col-span-12 xl:col-span-5 p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">Executive Reporting</h3>
                  <span className="text-[10px] text-slate-500">One-click export</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {["Executive Third-Party Dependency Health","Digital Supply Chain Risk Assessment","Cloud Provider Health Report","API Performance Assessment","Vendor SLA Report","Business Service Impact Report","Executive Vendor Risk Summary","Weekly Operations Dashboard","Board Technology Risk Report","Supplier Resilience Assessment"].map((r)=>(
                    <button key={r} className="text-left rounded-lg border border-slate-200 p-2 hover:border-blue-300 hover:bg-blue-50/40 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-slate-800">{r}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 text-[10px] mt-2 text-slate-500">Formats: <span className="font-semibold text-slate-700">PPT · PDF · Excel · Word · Markdown</span></div>
              </div>
            </section>

            {/* Integrations */}
            <section className={`${card} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold">Enterprise Integrations</h3>
                <span className="text-[10px] text-slate-500">{INTEGRATIONS.length} connected sources · Data Refreshed: 7 Seconds Ago</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INTEGRATIONS.map((i) => (
                  <span key={i} className="text-[11px] px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-500" /> {i}
                  </span>
                ))}
              </div>
            </section>

            {/* Global Search hint */}
            <section className={`${card} p-3 flex items-center gap-2 text-[11px] text-slate-500`}>
              <KeyRound className="h-3.5 w-3.5" />
              Global Search — search across providers, APIs, apps, cloud regions, certificates, DNS records, endpoints, OAuth clients, SAML providers, incidents, automations, ServiceNow CIs and support cases.
              <Layers className="h-3.5 w-3.5 ml-auto" />
            </section>
          </div>
        </main>
      </div>

      {/* Copilot */}
      <button onClick={()=>setCopilotOpen(v=>!v)} className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl grid place-items-center">
        <Brain className="h-5 w-5" />
      </button>
      {copilotOpen && (
        <div className="fixed bottom-20 right-5 z-40 w-[360px] max-h-[70vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="p-3 border-b border-slate-200 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center"><Sparkles className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-bold">NOVA AI Copilot</div>
              <div className="text-[10px] text-slate-500">Ask about dependencies, vendors, or failover</div>
            </div>
            <button className="ml-auto" onClick={()=>setCopilotOpen(false)}><X className="h-4 w-4 text-slate-400" /></button>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto flex-1">
            <div className="text-[11px] text-slate-500">Suggested questions</div>
            {[
              "Why is Salesforce slow?",
              "Which providers threaten production?",
              "Predict cloud outages.",
              "Which providers have expiring certificates?",
              "What happens if AWS US-East fails?",
              "Which apps have no alternate provider?",
            ].map((q)=>(
              <button key={q} onClick={()=>setCopilot(q)} className="w-full text-left text-[11px] px-2 py-1.5 rounded-md border border-slate-200 hover:bg-blue-50/50">{q}</button>
            ))}
          </div>
          <div className="p-2 border-t border-slate-200 flex items-center gap-2">
            <input value={copilot} onChange={(e)=>setCopilot(e.target.value)} placeholder="Ask NOVA..."
              className="flex-1 text-[12px] px-2 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-300" />
            <button className="h-8 w-8 grid place-items-center rounded-md bg-blue-600 text-white hover:bg-blue-700"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
