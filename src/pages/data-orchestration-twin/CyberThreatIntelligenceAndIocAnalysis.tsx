import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldAlert, Activity, Search, Filter, RefreshCw, ChevronRight,
  AlertTriangle, Zap, Bug, Terminal, Network, Server, KeyRound, Eye, EyeOff,
  Globe, Cloud, HardDrive, Lock, Unlock, GitBranch, Radar, Target, Fingerprint,
  FileWarning, PlayCircle, PauseCircle, ArrowRight, ExternalLink, X,
  Cpu, Database, Users, Layers, Sparkles, TrendingUp, ShieldCheck, Info, Clock,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ------------------------------- Seeded RNG ------------------------------- */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

/* ------------------------------- Source Meta ------------------------------ */
type SourceMeta = {
  slug: string; name: string; sub: string; platform: string; domain: string;
  hero: string; family: "NGFW" | "VPN" | "Cloud" | "Endpoint" | "K8s" | "Observability" | "Audit";
  hosts: string[]; users: string[]; processes: string[]; ips: string[]; domains: string[];
};
const SOURCES: Record<string, SourceMeta> = {
  "panw_ngfw_traffic_raw": {
    slug: "panw_ngfw_traffic_raw", name: "panw_ngfw_traffic_raw", sub: "NGFW Traffic Logs",
    platform: "Cortex XSIAM", domain: "XSIAM", family: "NGFW",
    hero: "Perimeter east-west & north-south session telemetry",
    hosts: ["fw-dc1-01", "fw-dc1-02", "fw-edge-06"], users: ["svc-netops", "aravi", "bhanu"],
    processes: ["session-agent", "log-forwarder", "url-cat"],
    ips: ["10.42.11.87", "10.42.11.204", "185.220.101.7", "45.61.184.19"],
    domains: ["update-cdn.microsoft.com", "cdn-77.suspicious-host.top", "beacon.telemetry-svc.net"],
  },
  "panw_ngfw_system_raw": {
    slug: "panw_ngfw_system_raw", name: "panw_ngfw_system_raw", sub: "NGFW System Events",
    platform: "Cortex XSIAM", domain: "XSIAM", family: "NGFW",
    hero: "Firewall control-plane, HA, and admin activity",
    hosts: ["fw-dc1-01", "fw-dc2-03"], users: ["admin", "svc-panorama"],
    processes: ["mgmt-server", "ha-agent", "config-daemon"],
    ips: ["10.10.0.14", "10.10.0.15"], domains: ["panorama.corp.local"],
  },
  "firewall_threat_logs": {
    slug: "firewall_threat_logs", name: "firewall_threat_logs", sub: "Threat / URL / Content",
    platform: "Cortex XSIAM", domain: "XSIAM", family: "NGFW",
    hero: "IPS, WildFire, URL filtering, and content inspection verdicts",
    hosts: ["fw-edge-06", "fw-edge-07"], users: ["ext-user-4471", "svc-web"],
    processes: ["ips-engine", "wildfire-sync"],
    ips: ["203.0.113.19", "198.51.100.44", "45.61.184.19"],
    domains: ["files.malshare.top", "c2-relay.badactor.io"],
  },
  "vpn_globalprotect_logs": {
    slug: "vpn_globalprotect_logs", name: "vpn_globalprotect_logs", sub: "GlobalProtect VPN Logs",
    platform: "Cortex XSIAM", domain: "XSIAM", family: "VPN",
    hero: "Remote access sessions, posture checks, and gateway auth",
    hosts: ["gp-gw-01", "gp-gw-02"], users: ["jharper", "mvasquez", "svc-contractor-88"],
    processes: ["gp-portal", "gp-agent"],
    ips: ["100.64.12.9", "100.64.12.201", "89.248.171.23"],
    domains: ["vpn.corp.example.com"],
  },
  "gcp_billing_export": {
    slug: "gcp_billing_export", name: "gcp_billing_export", sub: "GCP Billing Export",
    platform: "Google BigQuery", domain: "BigQuery", family: "Cloud",
    hero: "Billing anomalies, resource abuse, cryptomining detection",
    hosts: ["bq-scheduler-01"], users: ["svc-billing-export", "finops-bot"],
    processes: ["bq-load", "billing-extract"],
    ips: ["10.128.4.5"], domains: ["bigquery.googleapis.com"],
  },
  "gcp_cloud_audit_logs": {
    slug: "gcp_cloud_audit_logs", name: "gcp_cloud_audit_logs", sub: "Cloud Audit Logs",
    platform: "Google BigQuery", domain: "BigQuery", family: "Audit",
    hero: "Admin activity, data access, and policy denial events across GCP",
    hosts: ["proj-prod-01", "proj-analytics-04"], users: ["svc-terraform", "root@corp.example.com", "sre-oncall"],
    processes: ["iam.setIamPolicy", "storage.buckets.setIamPolicy", "compute.instances.insert"],
    ips: ["34.102.14.19", "8.34.208.171"], domains: ["accounts.google.com", "iam.googleapis.com"],
  },
  "logicmonitor_device_stats": {
    slug: "logicmonitor_device_stats", name: "logicmonitor_device_stats", sub: "Device Performance Stats",
    platform: "LogicMonitor", domain: "LogicMonitor", family: "Observability",
    hero: "Infra performance telemetry — CPU, memory, IO, thermal",
    hosts: ["core-sw-01", "core-sw-02", "esxi-14"], users: ["svc-lm", "sre-oncall"],
    processes: ["collector", "wmi-probe", "snmp-poll"],
    ips: ["10.20.30.40"], domains: ["portal.logicmonitor.com"],
  },
  "logicmonitor_alerts": {
    slug: "logicmonitor_alerts", name: "logicmonitor_alerts", sub: "Infrastructure Alerts",
    platform: "LogicMonitor", domain: "LogicMonitor", family: "Observability",
    hero: "Alert lifecycle, escalations, and suppression logic",
    hosts: ["lm-collector-03"], users: ["svc-lm", "noc-oncall"],
    processes: ["alert-engine", "escalator"],
    ips: ["10.20.30.55"], domains: ["portal.logicmonitor.com"],
  },
  "datadog_metrics": {
    slug: "datadog_metrics", name: "datadog_metrics", sub: "Metrics & Events",
    platform: "Datadog", domain: "MCP Tools", family: "Observability",
    hero: "APM traces, custom metrics, log-based signals",
    hosts: ["dd-agent-*", "web-tier-*"], users: ["svc-dd", "sre-oncall"],
    processes: ["agent.exe", "trace-agent"],
    ips: ["10.30.44.12"], domains: ["api.datadoghq.com"],
  },
  "k8s_cluster_logs": {
    slug: "k8s_cluster_logs", name: "k8s_cluster_logs", sub: "Kubernetes Cluster Logs",
    platform: "Kubernetes API", domain: "Internal APIs", family: "K8s",
    hero: "Pod, controller, and API server audit stream",
    hosts: ["k8s-cp-01", "k8s-node-14"], users: ["system:serviceaccount:default:web", "svc-ci"],
    processes: ["kube-apiserver", "kubelet", "sh -c curl | bash"],
    ips: ["10.244.1.19"], domains: ["api.k8s.corp.local"],
  },
};
const DEFAULT_SLUG = "panw_ngfw_traffic_raw";

/* --------------------------------- ATT&CK --------------------------------- */
const ATTACK_LIBRARY = [
  { tactic: "Initial Access",      tech: "External Remote Services",        sub: "VPN",             id: "T1133" },
  { tactic: "Initial Access",      tech: "Valid Accounts",                  sub: "Cloud Accounts",  id: "T1078.004" },
  { tactic: "Execution",           tech: "Command and Scripting Interpreter", sub: "PowerShell",   id: "T1059.001" },
  { tactic: "Execution",           tech: "Container Administration Command", sub: "kubectl exec",  id: "T1609" },
  { tactic: "Persistence",         tech: "Scheduled Task/Job",              sub: "Scheduled Task",  id: "T1053.005" },
  { tactic: "Persistence",         tech: "Boot or Logon Autostart",         sub: "Registry Run Keys", id: "T1547.001" },
  { tactic: "Privilege Escalation",tech: "Abuse Elevation Control Mechanism", sub: "UAC Bypass",   id: "T1548.002" },
  { tactic: "Defense Evasion",     tech: "Impair Defenses",                 sub: "Disable Logging", id: "T1562.002" },
  { tactic: "Defense Evasion",     tech: "Indicator Removal",               sub: "Clear Event Log", id: "T1070.001" },
  { tactic: "Credential Access",   tech: "OS Credential Dumping",           sub: "LSASS Memory",    id: "T1003.001" },
  { tactic: "Discovery",           tech: "Network Service Discovery",       sub: "Port Scan",       id: "T1046" },
  { tactic: "Lateral Movement",    tech: "Remote Services",                 sub: "SMB / Admin Shares", id: "T1021.002" },
  { tactic: "Collection",          tech: "Archive Collected Data",          sub: "Archive via Utility", id: "T1560.001" },
  { tactic: "Command & Control",   tech: "Application Layer Protocol",      sub: "HTTPS Beacon",    id: "T1071.001" },
  { tactic: "Exfiltration",        tech: "Exfiltration Over C2 Channel",    sub: "",                id: "T1041" },
  { tactic: "Impact",              tech: "Data Encrypted for Impact",       sub: "Ransomware",      id: "T1486" },
];

const KILL_CHAIN = [
  "Initial Access","Execution","Persistence","Privilege Escalation",
  "Defense Evasion","Credential Access","Discovery","Lateral Movement",
  "Collection","Command & Control","Exfiltration","Impact",
];

/* -------------------- Family-aware IoC & Log Generators ------------------- */
type LogRec = {
  id: string; ts: string; device: string; host: string; sip: string; dip: string;
  user: string; process: string; severity: "critical" | "high" | "medium" | "low";
  status: "Detected" | "Suspicious" | "Blocked" | "Observed"; confidence: number;
  techniques: number; summary: string;
};

function generateLogs(meta: SourceMeta, rng: () => number): LogRec[] {
  const templates: Record<SourceMeta["family"], { summary: string; sev: LogRec["severity"] }[]> = {
    NGFW: [
      { summary: "Outbound HTTPS to newly-registered domain over non-standard port", sev: "high" },
      { summary: "Repeated denied sessions from internal host to threat-intel IP", sev: "high" },
      { summary: "TLS session with self-signed certificate to external host", sev: "medium" },
      { summary: "Bulk data transfer 812MB egress in 4-minute burst", sev: "critical" },
      { summary: "URL category = 'newly-observed-domain' allowed by policy override", sev: "medium" },
      { summary: "Beacon pattern: 61 identical GETs at 47s interval", sev: "high" },
    ],
    VPN: [
      { summary: "Impossible travel: login from Frankfurt 12m after Dallas session", sev: "critical" },
      { summary: "Posture check bypass — device compliance disabled", sev: "high" },
      { summary: "Concurrent VPN sessions on service account (svc-contractor-88)", sev: "high" },
      { summary: "Split-tunnel policy modified mid-session", sev: "medium" },
      { summary: "Failed MFA challenge x14 followed by success", sev: "high" },
    ],
    Cloud: [
      { summary: "IAM policy bound Owner role to external gmail identity", sev: "critical" },
      { summary: "Unusual spend spike: +$4,812/hr on compute in us-east4", sev: "high" },
      { summary: "GCE instance created with n1-highmem-96 shape in unused project", sev: "high" },
      { summary: "Service account key exported outside change window", sev: "high" },
    ],
    Audit: [
      { summary: "Audit log sink deleted then re-created with reduced filter", sev: "critical" },
      { summary: "setIamPolicy grants roles/owner to service account", sev: "high" },
      { summary: "Bucket ACL made allUsers:READ on prod data lake", sev: "critical" },
      { summary: "Org policy 'require-uniform-bucket-access' constraint removed", sev: "high" },
    ],
    Endpoint: [
      { summary: "LSASS accessed by non-standard process (procdump)", sev: "critical" },
      { summary: "PowerShell -enc base64 launched by winword.exe", sev: "critical" },
      { summary: "Scheduled task created running from %TEMP%", sev: "high" },
    ],
    K8s: [
      { summary: "kubectl exec into privileged pod from non-admin SA", sev: "high" },
      { summary: "Pod mounted /var/run/docker.sock", sev: "critical" },
      { summary: "New CronJob spawns curl | sh from public gist", sev: "critical" },
      { summary: "RoleBinding grants cluster-admin to default SA", sev: "critical" },
    ],
    Observability: [
      { summary: "Agent stopped sending telemetry for 22 minutes", sev: "high" },
      { summary: "API key used from unlisted source IP", sev: "medium" },
      { summary: "Custom metric flood: 41k tags/min from single host", sev: "medium" },
    ],
  };
  const tmpl = templates[meta.family];
  const arr: LogRec[] = [];
  for (let i = 0; i < 22; i++) {
    const t = tmpl[Math.floor(rng() * tmpl.length)];
    const sevRoll = rng();
    const severity: LogRec["severity"] = sevRoll > 0.75 ? "critical" : sevRoll > 0.45 ? "high" : sevRoll > 0.2 ? "medium" : "low";
    arr.push({
      id: `EV-${(hashStr(meta.slug) % 100000).toString(36).toUpperCase()}-${(1000 + i).toString(16).toUpperCase()}`,
      ts: `2026-05-12T${String(9 + Math.floor(rng() * 4)).padStart(2, "0")}:${String(Math.floor(rng() * 60)).padStart(2, "0")}:${String(Math.floor(rng() * 60)).padStart(2, "0")}Z`,
      device: meta.platform,
      host: meta.hosts[Math.floor(rng() * meta.hosts.length)],
      sip: meta.ips[Math.floor(rng() * meta.ips.length)] ?? "10.0.0.1",
      dip: (rng() > 0.5 ? "45.61.184." : "203.0.113.") + Math.floor(rng() * 250),
      user: meta.users[Math.floor(rng() * meta.users.length)],
      process: meta.processes[Math.floor(rng() * meta.processes.length)],
      severity,
      status: rng() > 0.7 ? "Blocked" : rng() > 0.4 ? "Detected" : rng() > 0.2 ? "Suspicious" : "Observed",
      confidence: Math.round(75 + rng() * 24),
      techniques: 1 + Math.floor(rng() * 5),
      summary: t.summary,
    });
  }
  return arr;
}

function generateIocs(meta: SourceMeta, rng: () => number) {
  const pool = [
    { type: "PowerShell", label: "Encoded PowerShell (-enc)", desc: "Base64-encoded command detected in parent-child chain", tactic: "Execution" },
    { type: "Process",    label: "Process Injection (VirtualAllocEx + WriteProcessMemory)", desc: "Suspicious API sequence targeting explorer.exe", tactic: "Defense Evasion" },
    { type: "Credential", label: "LSASS Access Attempt",     desc: "OpenProcess PROCESS_VM_READ on lsass.exe by non-standard binary", tactic: "Credential Access" },
    { type: "Persistence",label: "Scheduled Task from %TEMP%",desc: "Task created pointing to unsigned binary in temp path", tactic: "Persistence" },
    { type: "Persistence",label: "Registry Run Key added",   desc: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run modified", tactic: "Persistence" },
    { type: "Network",    label: "Beaconing HTTPS",          desc: "Periodic 62s POSTs to newly-registered domain", tactic: "Command & Control" },
    { type: "Network",    label: "DNS TXT tunneling pattern",desc: "High-entropy subdomains, TXT query response payloads", tactic: "Exfiltration" },
    { type: "Evasion",    label: "Event Log Cleared (1102)", desc: "Security event log wiped by non-admin session", tactic: "Defense Evasion" },
    { type: "Evasion",    label: "EDR Agent stopped",        desc: "Endpoint agent service transitioned to Stopped by unknown actor", tactic: "Defense Evasion" },
    { type: "Lateral",    label: "SMB Admin$ enumeration",   desc: "Sequential ADMIN$ / IPC$ probes across /24", tactic: "Lateral Movement" },
    { type: "Cloud",      label: "Suspicious IAM binding",   desc: "roles/owner granted to external principal", tactic: "Privilege Escalation" },
    { type: "Impact",     label: "Archive → Egress",         desc: "7z of user profile created 40s before egress spike", tactic: "Collection" },
  ];
  const count = 6 + Math.floor(rng() * 3);
  const picked = [...pool].sort(() => rng() - 0.5).slice(0, count);
  return picked.map((p, i) => ({
    ...p,
    severity: (["critical","high","medium"] as const)[Math.floor(rng() * 3)],
    confidence: Math.round(72 + rng() * 27),
    evidence: 2 + Math.floor(rng() * 12),
    firstObs: `2026-05-${10 + Math.floor(rng() * 2)}T${String(6 + Math.floor(rng() * 12)).padStart(2,"0")}:${String(Math.floor(rng()*60)).padStart(2,"0")}`,
    lastObs: `2026-05-12T${String(9 + Math.floor(rng() * 3)).padStart(2,"0")}:${String(Math.floor(rng()*60)).padStart(2,"0")}`,
    assets: 1 + Math.floor(rng() * 6),
    technique: ATTACK_LIBRARY[Math.floor(rng() * ATTACK_LIBRARY.length)],
    key: `ioc-${i}`,
  }));
}

/* -------------------------------- Primitives ------------------------------ */
const sevTone = (s: string) =>
  s === "critical" ? "bg-rose-50 text-rose-700 border-rose-200"
  : s === "high"   ? "bg-amber-50 text-amber-700 border-amber-200"
  : s === "medium" ? "bg-blue-50 text-blue-700 border-blue-200"
                   : "bg-slate-50 text-slate-600 border-slate-200";

const statusTone = (s: string) =>
  s === "Blocked"    ? "text-emerald-600"
  : s === "Detected" ? "text-rose-600"
  : s === "Suspicious" ? "text-amber-600" : "text-slate-500";

function Gauge({ label, value, tone = "blue" }: { label: string; value: number; tone?: "blue"|"emerald"|"amber"|"rose"|"violet" }) {
  const strokeMap = { blue: "#3b82f6", emerald: "#10b981", amber: "#f59e0b", rose: "#f43f5e", violet: "#8b5cf6" };
  const c = 2 * Math.PI * 38;
  const off = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[92px] h-[92px]">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="9" fill="none" />
          <motion.circle
            cx="50" cy="50" r="38" stroke={strokeMap[tone]} strokeWidth="9" fill="none"
            strokeDasharray={c} strokeLinecap="round"
            initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: off }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-[18px] font-bold text-slate-900 tabular-nums leading-none">{value}</div>
            <div className="text-[8.5px] text-slate-400 uppercase">/100</div>
          </div>
        </div>
      </div>
      <div className="mt-1.5 text-[10.5px] font-medium text-slate-600 text-center">{label}</div>
    </div>
  );
}

function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: string }) {
  const map: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${map[tone] || map.slate}`}>{children}</span>;
}

/* ---------------------------------- Page ---------------------------------- */
export default function CyberThreatIntelligenceAndIocAnalysis() {
  const { slug: rawSlug } = useParams();
  const slug = rawSlug && SOURCES[rawSlug] ? rawSlug : DEFAULT_SLUG;
  const meta = SOURCES[slug];
  const rng = useMemo(() => mulberry32(hashStr(slug)), [slug]);
  const logs = useMemo(() => generateLogs(meta, mulberry32(hashStr(slug + "logs"))), [slug]);
  const iocs = useMemo(() => generateIocs(meta, mulberry32(hashStr(slug + "iocs"))), [slug]);

  const [selectedId, setSelectedId] = useState(logs[0].id);
  const [query, setQuery] = useState("");
  const [sevFilter, setSevFilter] = useState<string>("all");
  const [drawer, setDrawer] = useState<null | { title: string; kind: string; sub?: string }>(null);
  const [live, setLive] = useState(true);
  const [confPulse, setConfPulse] = useState(94);

  const selected = logs.find(l => l.id === selectedId) ?? logs[0];

  // Live-ish confidence pulse
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setConfPulse(92 + Math.round(Math.random() * 7)), 2400);
    return () => clearInterval(t);
  }, [live]);

  const filtered = logs.filter(l =>
    (sevFilter === "all" || l.severity === sevFilter) &&
    (query === "" || l.summary.toLowerCase().includes(query.toLowerCase()) || l.host.includes(query) || l.user.includes(query))
  );

  // Deterministic per-source signal picks
  const techniques = useMemo(() => {
    const r = mulberry32(hashStr(slug + "tech"));
    return [...ATTACK_LIBRARY].sort(() => r() - 0.5).slice(0, 8).map(t => ({ ...t, conf: Math.round(70 + r() * 29) }));
  }, [slug]);

  const chainStages = useMemo(() => {
    const r = mulberry32(hashStr(slug + "chain"));
    return KILL_CHAIN.map(stage => ({ stage, active: r() > 0.35, ts: `${Math.floor(r()*24)}:${String(Math.floor(r()*60)).padStart(2,"0")}` }));
  }, [slug]);

  const surface = useMemo(() => {
    const r = mulberry32(hashStr(slug + "surface"));
    const cats = [
      { key: "External", icon: Globe, items: ["Edge Firewall", "VPN Gateway", "Public API", "WAF"] },
      { key: "Internal", icon: Server, items: ["Domain Controller", "File Server", "Hypervisor", "Identity Broker"] },
      { key: "Cloud",    icon: Cloud,  items: ["AWS Org", "GCP Project", "Azure Sub"] },
      { key: "SaaS",     icon: Layers, items: ["Microsoft 365", "Okta", "ServiceNow", "Salesforce"] },
    ];
    return cats.map(c => ({ ...c, items: c.items.map(name => ({ name, exposure: Math.round(20 + r() * 80), hit: r() > 0.55 })) }));
  }, [slug]);

  const enrichment = useMemo(() => {
    const r = mulberry32(hashStr(slug + "enrich"));
    return [
      { label: "IP Reputation",   verdict: "Malicious", src: "GreyNoise · AbuseIPDB", score: Math.round(60 + r()*35), tone: "rose" },
      { label: "Domain Reputation", verdict: "Newly Registered", src: "Umbrella · WHOIS", score: Math.round(50 + r()*40), tone: "amber" },
      { label: "Certificate Trust", verdict: "Self-signed", src: "crt.sh · CT Logs", score: Math.round(20 + r()*30), tone: "rose" },
      { label: "Hash Prevalence", verdict: "Rare (<10 sightings)", src: "VirusTotal", score: Math.round(15 + r()*30), tone: "amber" },
      { label: "Known Family",    verdict: "Loader family (generic)", src: "Community feeds", score: Math.round(45 + r()*30), tone: "violet" },
      { label: "Sandbox",         verdict: "Suspicious behavior tree", src: "Automated detonation", score: Math.round(55 + r()*35), tone: "amber" },
    ] as const;
  }, [slug]);

  const risk = useMemo(() => {
    const r = mulberry32(hashStr(slug + "risk"));
    return {
      enterprise: Math.round(70 + r()*25),
      asset: Math.round(60 + r()*35),
      business: Math.round(55 + r()*40),
      likelihood: Math.round(60 + r()*35),
      exploit: Math.round(50 + r()*45),
      detection: Math.round(80 + r()*18),
      containment: Math.round(60 + r()*35),
    };
  }, [slug]);

  const actions = useMemo(() => {
    const base = [
      { label: "Isolate endpoint",         icon: ShieldAlert, auto: true,  rollback: true,  eta: "45s" },
      { label: "Disable user account",     icon: Users,       auto: true,  rollback: true,  eta: "30s" },
      { label: "Reset credentials",        icon: KeyRound,    auto: false, rollback: true,  eta: "5m" },
      { label: "Block IP at edge",         icon: Network,     auto: true,  rollback: true,  eta: "20s" },
      { label: "Block domain (DNS)",       icon: Globe,       auto: true,  rollback: true,  eta: "25s" },
      { label: "Quarantine file",          icon: FileWarning, auto: true,  rollback: true,  eta: "40s" },
      { label: "Kill malicious process",   icon: X,           auto: true,  rollback: false, eta: "15s" },
      { label: "Force EDR scan",           icon: Radar,       auto: true,  rollback: true,  eta: "8m" },
      { label: "Capture memory image",     icon: HardDrive,   auto: false, rollback: true,  eta: "12m" },
      { label: "Open incident + notify SOC", icon: PlayCircle, auto: true, rollback: true,  eta: "10s" },
    ];
    const r = mulberry32(hashStr(slug + "act"));
    return base.map(a => ({ ...a, risk: r() > 0.66 ? "high" : r() > 0.33 ? "medium" : "low" }));
  }, [slug]);

  const openDrawer = (title: string, kind: string, sub?: string) => setDrawer({ title, kind, sub });

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      {/* Header */}
      <header className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
            <Link to="/data-orchestration-twin/log-source-inventory-and-scope-registry" className="hover:text-blue-600 inline-flex items-center gap-1">
              <ChevronRight className="h-3 w-3 rotate-180" /> Log Source Inventory
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-mono text-slate-700">{meta.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 via-violet-600 to-rose-600 grid place-items-center shadow-md shadow-blue-200/60">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Cyber Threat Intelligence &amp; IoC Analysis</h1>
              <p className="text-[12.5px] text-slate-600">AI-powered investigation of security telemetry, attack indicators, and adversary tradecraft — <span className="font-medium text-slate-800">{meta.sub}</span> ({meta.platform}).</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm text-center min-w-[110px]">
            <div className="text-[9.5px] text-slate-500 uppercase tracking-wider">Detection Confidence</div>
            <div className="text-[18px] font-bold text-emerald-600 tabular-nums leading-none">{confPulse}%</div>
            <div className="mt-1 h-1 rounded bg-slate-100 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600" animate={{ width: `${confPulse}%` }} />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm text-center min-w-[110px]">
            <div className="text-[9.5px] text-slate-500 uppercase tracking-wider">TI Feed Status</div>
            <div className="text-[12.5px] font-semibold text-emerald-600 flex items-center gap-1 justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
            </div>
            <div className="text-[9.5px] text-slate-500 mt-0.5">14 feeds · refreshed 42s ago</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm text-center min-w-[110px]">
            <div className="text-[9.5px] text-slate-500 uppercase tracking-wider">MITRE ATT&amp;CK</div>
            <div className="text-[12.5px] font-semibold text-slate-800">v14.1 Enterprise</div>
            <div className="text-[9.5px] text-slate-500 mt-0.5">784 techniques loaded</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm text-center min-w-[110px]">
            <div className="text-[9.5px] text-slate-500 uppercase tracking-wider">Detection Rules</div>
            <div className="text-[12.5px] font-semibold text-slate-800 tabular-nums">4,812 active</div>
            <div className="text-[9.5px] text-slate-500 mt-0.5">Sigma · YARA · custom</div>
          </div>
          <button onClick={() => setLive(v => !v)} className="h-9 w-9 rounded-lg border border-slate-200 bg-white grid place-items-center hover:bg-slate-50" title={live ? "Pause live" : "Resume live"}>
            {live ? <PauseCircle className="h-4 w-4 text-slate-600" /> : <PlayCircle className="h-4 w-4 text-slate-600" />}
          </button>
          <button className="h-9 w-9 rounded-lg border border-slate-200 bg-white grid place-items-center hover:bg-slate-50">
            <RefreshCw className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </header>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-3">
        {/* LEFT: Log Explorer */}
        <section className="col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-slate-500" />
            <div className="text-[12px] font-semibold text-slate-800">Log Explorer</div>
            <span className="ml-auto text-[10px] text-slate-500 tabular-nums">{filtered.length}/{logs.length}</span>
          </div>
          <div className="px-3 py-2 border-b border-slate-100 space-y-1.5">
            <div className="relative">
              <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search host, user, summary…"
                className="w-full pl-7 pr-2 h-7 rounded-md border border-slate-200 bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {["all","critical","high","medium","low"].map(s => (
                <button key={s} onClick={() => setSevFilter(s)}
                  className={`text-[10px] px-1.5 py-0.5 rounded-md border transition capitalize ${
                    sevFilter === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[720px]">
            {filtered.map(l => {
              const active = l.id === selectedId;
              return (
                <button key={l.id} onClick={() => setSelectedId(l.id)}
                  className={`w-full text-left px-3 py-2 border-b border-slate-50 transition ${
                    active ? "bg-blue-50/70 border-l-2 border-l-blue-500" : "hover:bg-slate-50 border-l-2 border-l-transparent"
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono ${statusTone(l.status)}`}>{l.status}</span>
                    <span className={`text-[9px] px-1 py-0.5 rounded border ${sevTone(l.severity)}`}>{l.severity}</span>
                  </div>
                  <div className="text-[11px] text-slate-800 line-clamp-2">{l.summary}</div>
                  <div className="mt-1 flex items-center justify-between text-[9.5px] text-slate-500 tabular-nums">
                    <span className="truncate">{l.host} · {l.user}</span>
                    <span>{l.confidence}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* CENTER + RIGHT */}
        <section className="col-span-9 space-y-3">
          {/* AI Investigation Canvas */}
          <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.35]" aria-hidden>
              <svg className="w-full h-full">
                <defs>
                  <radialGradient id="ci-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#ci-glow)" />
              </svg>
            </div>
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <div className="text-[13px] font-semibold text-slate-900">AI Investigation Canvas</div>
                  <span className="text-[10px] text-slate-500">Digital Coworker · Security Investigation</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <Pill tone="violet"><Fingerprint className="h-2.5 w-2.5" /> {selected.id}</Pill>
                  <Pill tone="blue"><Clock className="h-2.5 w-2.5" /> {selected.ts}</Pill>
                  <Pill tone={selected.severity === "critical" ? "rose" : selected.severity === "high" ? "amber" : "blue"}>{selected.severity.toUpperCase()}</Pill>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 mb-3"
                >
                  <div className="text-[12.5px] text-slate-800 font-medium">{selected.summary}</div>
                  <div className="mt-1 grid grid-cols-6 gap-2 text-[10.5px] text-slate-600">
                    <div><span className="text-slate-400 uppercase text-[9px] block">Host</span>{selected.host}</div>
                    <div><span className="text-slate-400 uppercase text-[9px] block">User</span>{selected.user}</div>
                    <div><span className="text-slate-400 uppercase text-[9px] block">Src IP</span>{selected.sip}</div>
                    <div><span className="text-slate-400 uppercase text-[9px] block">Dst IP</span>{selected.dip}</div>
                    <div><span className="text-slate-400 uppercase text-[9px] block">Process</span>{selected.process}</div>
                    <div><span className="text-slate-400 uppercase text-[9px] block">Techniques</span>{selected.techniques}</div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* AI Parsing pipeline */}
              <div className="grid grid-cols-8 gap-1.5">
                {["Parse","Enrich","Correlate","Map ATT&CK","Score","Simulate","Recommend","Explain"].map((s, i) => (
                  <motion.div key={s}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                    className="relative rounded-md border border-slate-200 bg-white px-2 py-1.5 text-center overflow-hidden">
                    <div className="text-[10px] font-semibold text-slate-700">{s}</div>
                    <div className="text-[9px] text-emerald-600 tabular-nums">✓ {88 + ((hashStr(s + slug) % 12))}%</div>
                    <motion.div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500"
                      initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.2, delay: 0.1 * i }} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* IoC panel + Log Tampering + Enrichment */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-rose-600" />
                  <div className="text-[13px] font-semibold text-slate-900">Indicators of Compromise</div>
                  <span className="text-[10px] text-slate-500">{iocs.length} indicators · specific to {meta.sub}</span>
                </div>
                <button onClick={() => openDrawer("IoC bundle — " + meta.name, "ioc-bundle")} className="text-[11px] text-blue-600 hover:text-blue-800 font-medium">Open bundle →</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {iocs.map((ioc) => (
                  <button key={ioc.key} onClick={() => openDrawer(ioc.label, "ioc", ioc.desc)}
                    className="text-left rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition p-2.5 bg-gradient-to-br from-white to-slate-50/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{ioc.type}</span>
                      <span className={`text-[9px] px-1 py-0.5 rounded border ${sevTone(ioc.severity)}`}>{ioc.severity}</span>
                    </div>
                    <div className="text-[12px] font-medium text-slate-800 leading-snug">{ioc.label}</div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5 line-clamp-2">{ioc.desc}</div>
                    <div className="mt-2 flex items-center justify-between text-[9.5px] text-slate-500 tabular-nums">
                      <span className="text-slate-600">{ioc.technique.id} · {ioc.technique.tactic}</span>
                      <span>{ioc.evidence} evidence · {ioc.confidence}%</span>
                    </div>
                    <div className="mt-1 h-1 rounded bg-slate-100 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-rose-500" style={{ width: `${ioc.confidence}%` }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Log Tampering */}
            <div className="col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="h-4 w-4 text-amber-600" />
                <div className="text-[13px] font-semibold text-slate-900">Log Tampering Analysis</div>
              </div>
              <div className="text-[10.5px] text-slate-500 mb-2">Signals of visibility loss or evidence manipulation.</div>
              <div className="space-y-1.5">
                {[
                  { l: "Event logging service stopped", ok: rng() > 0.6 },
                  { l: "Audit policy modified", ok: rng() > 0.6 },
                  { l: "Windows Event Log cleared (1102)", ok: rng() > 0.6 },
                  { l: "Syslog forwarding interruption", ok: rng() > 0.6 },
                  { l: "EDR agent disabled", ok: rng() > 0.6 },
                  { l: "Sudden drop in log volume (–68%)", ok: rng() > 0.4 },
                  { l: "Timestamp anomalies (clock skew)", ok: rng() > 0.5 },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] rounded-md px-2 py-1 border border-slate-100 bg-slate-50/50">
                    <span className="text-slate-700">{c.l}</span>
                    {c.ok
                      ? <span className="text-[9.5px] text-emerald-600 inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> clean</span>
                      : <span className="text-[9.5px] text-rose-600 inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> detected</span>}
                  </div>
                ))}
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[10.5px] text-slate-600">
                <span className="text-slate-500 uppercase tracking-wider text-[9px] block mb-0.5">Likely Objective</span>
                Suppress detection during credential-access phase and delay incident response.
              </div>
            </div>
          </div>

          {/* Attack Surface + Kill Chain */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div className="text-[13px] font-semibold text-slate-900">Attack Surface Map</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {surface.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className="rounded-lg border border-slate-200 p-2.5 bg-slate-50/40">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon className="h-3.5 w-3.5 text-slate-600" />
                        <div className="text-[11px] font-semibold text-slate-700">{cat.key}</div>
                      </div>
                      <div className="space-y-1">
                        {cat.items.map(item => (
                          <div key={item.name} className="flex items-center justify-between text-[10px]">
                            <span className={`truncate ${item.hit ? "text-rose-600 font-medium" : "text-slate-600"}`}>{item.hit ? "● " : "○ "}{item.name}</span>
                            <span className="tabular-nums text-slate-500">{item.exposure}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-violet-600" />
                <div className="text-[13px] font-semibold text-slate-900">Attack Vector Timeline (Kill Chain)</div>
              </div>
              <div className="relative">
                <div className="absolute top-3 left-0 right-0 h-px bg-slate-200" />
                <div className="flex items-start justify-between relative">
                  {chainStages.map((s, i) => (
                    <motion.button
                      key={s.stage}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
                      onClick={() => openDrawer(s.stage, "chain-stage", `Observed at ${s.ts}`)}
                      className="flex flex-col items-center gap-1 flex-1 min-w-0"
                    >
                      <div className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-semibold border-2 ${
                        s.active ? "bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-200" : "bg-white text-slate-400 border-slate-200"
                      }`}>{i + 1}</div>
                      <div className={`text-[9px] text-center leading-tight ${s.active ? "text-slate-800 font-medium" : "text-slate-400"}`}>
                        {s.stage}
                      </div>
                      {s.active && <div className="text-[8.5px] text-rose-600 tabular-nums">{s.ts}</div>}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                <div className="rounded-md bg-rose-50 border border-rose-100 p-2">
                  <div className="text-rose-700 font-semibold">Highest-risk stage</div>
                  <div className="text-slate-700 mt-0.5">Credential Access → LSASS memory acquisition attempted.</div>
                </div>
                <div className="rounded-md bg-amber-50 border border-amber-100 p-2">
                  <div className="text-amber-700 font-semibold">Fastest transition</div>
                  <div className="text-slate-700 mt-0.5">Execution → Persistence in 42 seconds.</div>
                </div>
                <div className="rounded-md bg-blue-50 border border-blue-100 p-2">
                  <div className="text-blue-700 font-semibold">Coverage gap</div>
                  <div className="text-slate-700 mt-0.5">No telemetry captured during Collection phase (agent gap).</div>
                </div>
              </div>
            </div>
          </div>

          {/* MITRE ATT&CK matrix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <div className="text-[13px] font-semibold text-slate-900">MITRE ATT&amp;CK Mapping</div>
                <span className="text-[10px] text-slate-500">Techniques inferred from this event and its correlations</span>
              </div>
              <span className="text-[10.5px] text-slate-500">v14.1 Enterprise</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {techniques.map((t) => (
                <button key={t.id} onClick={() => openDrawer(`${t.id} — ${t.tech}`, "technique", `${t.tactic}${t.sub ? " / " + t.sub : ""}`)}
                  className="text-left rounded-md border border-slate-200 hover:border-blue-300 hover:shadow-sm transition p-2 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{t.tactic}</span>
                    <span className="text-[9.5px] font-mono text-slate-400">{t.id}</span>
                  </div>
                  <div className="text-[11.5px] font-medium text-slate-800 leading-snug mt-0.5">{t.tech}</div>
                  {t.sub && <div className="text-[10px] text-slate-500">{t.sub}</div>}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="flex-1 h-1 rounded bg-slate-100 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${t.conf}%` }} />
                    </div>
                    <span className="text-[9.5px] tabular-nums text-slate-500">{t.conf}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Adversary Intel + Enrichment + Risk */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Radar className="h-4 w-4 text-violet-600" />
                <div className="text-[13px] font-semibold text-slate-900">Behavioral Similarity</div>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100 p-3">
                <div className="text-[11.5px] font-medium text-slate-800">
                  Observed activity <span className="text-violet-700">resembles publicly documented</span> credential-access + rapid persistence tradecraft used by financially motivated intrusion sets.
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[10.5px]">
                  <div><span className="text-slate-500 uppercase text-[9px] block">Similarity</span><b className="text-slate-800">{62 + Math.floor(rng()*20)}%</b></div>
                  <div><span className="text-slate-500 uppercase text-[9px] block">Sample size</span><b className="text-slate-800">184 campaigns</b></div>
                  <div><span className="text-slate-500 uppercase text-[9px] block">Common industries</span>Finance, Manufacturing, Semi</div>
                  <div><span className="text-slate-500 uppercase text-[9px] block">Common objective</span>Data theft → extortion</div>
                </div>
                <div className="mt-2 text-[9.5px] text-slate-500 italic">Behavioral similarity is not attribution. The platform does not name specific threat actors without corroborating evidence.</div>
              </div>
            </div>

            <div className="col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <div className="text-[13px] font-semibold text-slate-900">Threat Intelligence Correlation</div>
              </div>
              <div className="space-y-1.5">
                {enrichment.map(e => (
                  <div key={e.label} className="flex items-center gap-2 text-[10.5px]">
                    <span className="w-[110px] text-slate-600">{e.label}</span>
                    <span className="flex-1">
                      <Pill tone={e.tone as string}>{e.verdict}</Pill>
                    </span>
                    <div className="w-14 h-1 rounded bg-slate-100 overflow-hidden">
                      <div className="h-full bg-slate-700" style={{ width: `${e.score}%` }} />
                    </div>
                    <span className="tabular-nums text-slate-500 w-6 text-right">{e.score}</span>
                  </div>
                ))}
                <div className="pt-1.5 mt-1.5 border-t border-slate-100 text-[9.5px] text-slate-500">Sources refreshed continuously from 14 configured feeds.</div>
              </div>
            </div>

            <div className="col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-rose-600" />
                <div className="text-[13px] font-semibold text-slate-900">Risk Assessment</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Gauge label="Enterprise Risk" value={risk.enterprise} tone="rose" />
                <Gauge label="Asset Criticality" value={risk.asset} tone="amber" />
                <Gauge label="Business Impact" value={risk.business} tone="violet" />
                <Gauge label="Detection Conf." value={risk.detection} tone="emerald" />
              </div>
            </div>
          </div>

          {/* Recommended Actions + AI Reasoning Graph */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <div className="text-[13px] font-semibold text-slate-900">Recommended Response</div>
                  <span className="text-[10px] text-slate-500">Ordered by risk-adjusted priority</span>
                </div>
                <button className="text-[11px] text-blue-600 font-medium hover:text-blue-800">Execute Playbook →</button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {actions.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <button key={a.label} onClick={() => openDrawer(a.label, "action", `Auto: ${a.auto ? "eligible" : "manual"} · ETA ${a.eta}`)}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-left transition">
                      <div className="h-7 w-7 rounded-md bg-slate-50 grid place-items-center shrink-0">
                        <Icon className="h-3.5 w-3.5 text-slate-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-medium text-slate-800 truncate">{i + 1}. {a.label}</div>
                        <div className="text-[9.5px] text-slate-500 flex items-center gap-2">
                          <span>{a.auto ? "Auto-eligible" : "Manual"}</span>
                          <span>·</span>
                          <span>Rollback: {a.rollback ? "yes" : "no"}</span>
                          <span>·</span>
                          <span>ETA {a.eta}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] px-1 py-0.5 rounded border ${sevTone(a.risk)}`}>{a.risk}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <div className="text-[13px] font-semibold text-slate-900">AI Reasoning Graph</div>
              </div>
              <ReasoningGraph meta={meta} rng={mulberry32(hashStr(slug + "graph"))} onOpen={openDrawer} />
            </div>
          </div>
        </section>
      </div>

      {/* Engineering Drawer */}
      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="sm:max-w-[720px] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-slate-900">{drawer?.title}</SheetTitle>
            {drawer?.sub && <div className="text-[11.5px] text-slate-500">{drawer.sub}</div>}
          </SheetHeader>
          <Tabs defaultValue="exec">
            <TabsList className="grid grid-cols-5 h-8 mb-3">
              <TabsTrigger value="exec" className="text-[10.5px]">Executive</TabsTrigger>
              <TabsTrigger value="tech" className="text-[10.5px]">Technical</TabsTrigger>
              <TabsTrigger value="evidence" className="text-[10.5px]">Evidence</TabsTrigger>
              <TabsTrigger value="detect" className="text-[10.5px]">Detection</TabsTrigger>
              <TabsTrigger value="reason" className="text-[10.5px]">Reasoning</TabsTrigger>
            </TabsList>
            <TabsContent value="exec" className="space-y-2 text-[12px] text-slate-700">
              <DrawerRow label="What happened" text={selected.summary} />
              <DrawerRow label="Why it matters" text="This behavior aligns with early-stage adversary tradecraft and materially increases enterprise risk if unaddressed." />
              <DrawerRow label="Confidence" text={`${confPulse}% based on ${iocs.length} indicators, ${techniques.length} ATT&CK mappings, and correlated telemetry from ${meta.platform}.`} />
              <DrawerRow label="Recommended posture" text="Contain endpoint, rotate implicated credentials, and open incident with SOC. Business impact is contained if action is taken within the next 30 minutes." />
            </TabsContent>
            <TabsContent value="tech" className="space-y-2 text-[11.5px] text-slate-700">
              <DrawerCode title="Query used" code={`dataset=${meta.slug}\n| filter severity in ("critical","high")\n| join type=inner threat_intel on dip == ti.indicator\n| stats count by user, host, process, technique\n| sort -confidence`} />
              <DrawerCode title="Sigma detection (excerpt)" code={`title: Suspicious Activity in ${meta.sub}\nlogsource:\n  product: ${meta.platform.toLowerCase()}\ndetection:\n  selection:\n    process: '*${meta.processes[0]}*'\n  condition: selection\nlevel: high`} />
            </TabsContent>
            <TabsContent value="evidence" className="text-[11.5px] text-slate-700 space-y-1">
              {iocs.slice(0, 5).map(i => (
                <div key={i.key} className="border border-slate-200 rounded p-2">
                  <div className="font-medium text-slate-800">{i.label}</div>
                  <div className="text-[10.5px] text-slate-500">{i.desc} · {i.evidence} artifacts</div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="detect" className="text-[11.5px] text-slate-700">
              <DrawerRow label="Detection logic" text="Multi-signal correlation across process ancestry, network beaconing, and identity anomalies. Base rate suppressed by 12-hour rolling baseline." />
              <DrawerRow label="Data sources used" text={`${meta.platform} · Identity Provider · EDR · DNS · Cloud Audit`} />
              <DrawerRow label="Enterprise mitigations" text="M1026 Privileged Account Management · M1040 Behavior Prevention on Endpoint · M1049 Antivirus/Antimalware" />
            </TabsContent>
            <TabsContent value="reason" className="text-[11.5px] text-slate-700 space-y-1">
              {[
                "Parsed event fields and normalized to canonical schema",
                "Enriched IP, domain, hash, and identity against 14 threat feeds",
                "Correlated with 6 adjacent events within 5-minute window",
                "Mapped observed behaviors to 8 ATT&CK techniques",
                "Computed confidence via weighted evidence stacking",
                "Simulated blast radius across 4 asset tiers",
                "Ranked response actions by risk-adjusted priority",
                "Generated executive summary + technical evidence pack",
              ].map((s, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="h-4 w-4 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-[9px] font-bold shrink-0">{i+1}</div>
                  <div>{s}</div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* --------------------------- Reasoning Graph (SVG) ------------------------ */
function ReasoningGraph({ meta, rng, onOpen }: { meta: SourceMeta; rng: () => number; onOpen: (t: string, k: string, s?: string) => void }) {
  const nodes = [
    { id: "log", label: "Log Event", x: 160, y: 120, color: "#3b82f6" },
    { id: "user", label: meta.users[0], x: 50, y: 40, color: "#8b5cf6" },
    { id: "device", label: meta.hosts[0], x: 50, y: 200, color: "#10b981" },
    { id: "proc", label: meta.processes[0], x: 270, y: 40, color: "#f43f5e" },
    { id: "ip", label: "203.0.113.19", x: 300, y: 210, color: "#f59e0b" },
    { id: "dom", label: "c2-relay.badactor.io", x: 170, y: 240, color: "#06b6d4" },
    { id: "hash", label: "SHA-256 · a4f…9c", x: 40, y: 130, color: "#64748b" },
  ];
  const edges = [
    ["log","user"],["log","device"],["log","proc"],["log","ip"],["log","dom"],["log","hash"],["proc","ip"],["ip","dom"]
  ];
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  return (
    <div className="relative rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50/70 to-white p-2 overflow-hidden">
      <svg viewBox="0 0 340 260" className="w-full h-[260px]">
        {edges.map(([a, b], i) => {
          const A = byId[a], B = byId[b];
          return (
            <g key={i}>
              <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#cbd5e1" strokeWidth="1" />
              <motion.circle r="2.5" fill="#3b82f6"
                animate={{ cx: [A.x, B.x, A.x], cy: [A.y, B.y, A.y], opacity: [0, 1, 0] }}
                transition={{ duration: 3 + rng() * 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }} />
            </g>
          );
        })}
        {nodes.map(n => (
          <g key={n.id} onClick={() => onOpen(n.label, "node")} style={{ cursor: "pointer" }}>
            <circle cx={n.x} cy={n.y} r="10" fill={n.color} opacity="0.15" />
            <circle cx={n.x} cy={n.y} r="5" fill={n.color} />
            <text x={n.x + 8} y={n.y + 3} fontSize="9" fill="#334155" className="font-medium">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function DrawerRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-2">
      <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">{label}</div>
      <div className="text-slate-700 text-[11.5px]">{text}</div>
    </div>
  );
}
function DrawerCode({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-md border border-slate-200 overflow-hidden">
      <div className="px-2 py-1 bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-600 font-semibold">{title}</div>
      <pre className="p-2 text-[10.5px] font-mono text-slate-700 whitespace-pre-wrap">{code}</pre>
    </div>
  );
}
