import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Shield, Lock, Key, ShieldCheck, AlertTriangle, Activity,
  Database, Cloud, Cpu, Server, Radio, Network, Timer, Zap, Gauge,
  TrendingUp, TrendingDown, CheckCircle2, XCircle, Info, Fingerprint,
  Layers, GitBranch, Workflow, ChevronRight,
} from "lucide-react";

/* ---------------- Row registry (mirrors parent) ---------------- */
type Row = {
  slug: string; name: string; desc: string; platform: string;
  connectorType: string; accessMethod: string; auth: string;
  iconTone: string;
};
const ROWS: Record<string, Row> = {
  "panw_ngfw_traffic_raw":   { slug:"panw_ngfw_traffic_raw", name:"panw_ngfw_traffic_raw", desc:"NGFW Traffic Logs",       platform:"Cortex XSIAM",   connectorType:"XQL",      accessMethod:"XQL API",     auth:"Service Account", iconTone:"amber" },
  "panw_ngfw_system_raw":    { slug:"panw_ngfw_system_raw",  name:"panw_ngfw_system_raw",  desc:"NGFW System Events",      platform:"Cortex XSIAM",   connectorType:"XQL",      accessMethod:"XQL API",     auth:"Service Account", iconTone:"amber" },
  "firewall_threat_logs":    { slug:"firewall_threat_logs",  name:"firewall_threat_logs",  desc:"Threat / URL / Content",  platform:"Cortex XSIAM",   connectorType:"XQL",      accessMethod:"XQL API",     auth:"Service Account", iconTone:"slate" },
  "vpn_globalprotect_logs":  { slug:"vpn_globalprotect_logs",name:"vpn_globalprotect_logs",desc:"GlobalProtect VPN Logs",  platform:"Cortex XSIAM",   connectorType:"XQL",      accessMethod:"XQL API",     auth:"Service Account", iconTone:"amber" },
  "gcp_billing_export":      { slug:"gcp_billing_export",    name:"gcp_billing_export",    desc:"GCP Billing Export",      platform:"Google BigQuery",connectorType:"SQL",      accessMethod:"BigQuery SQL",auth:"Service Account", iconTone:"blue"  },
  "gcp_cloud_audit_logs":    { slug:"gcp_cloud_audit_logs",  name:"gcp_cloud_audit_logs",  desc:"Cloud Audit Logs",        platform:"Google BigQuery",connectorType:"SQL",      accessMethod:"BigQuery SQL",auth:"Service Account", iconTone:"blue"  },
  "logicmonitor_device_stats":{slug:"logicmonitor_device_stats",name:"logicmonitor_device_stats",desc:"Device Performance Stats", platform:"LogicMonitor", connectorType:"REST API", accessMethod:"REST API", auth:"API Key",         iconTone:"emerald" },
  "logicmonitor_alerts":     { slug:"logicmonitor_alerts",   name:"logicmonitor_alerts",   desc:"Infrastructure Alerts",   platform:"LogicMonitor",   connectorType:"REST API", accessMethod:"REST API",    auth:"API Key",         iconTone:"emerald" },
  "datadog_metrics":         { slug:"datadog_metrics",       name:"datadog_metrics",       desc:"Metrics & Events",        platform:"Datadog",        connectorType:"REST API", accessMethod:"REST API",    auth:"API Key",         iconTone:"violet"  },
  "k8s_cluster_logs":        { slug:"k8s_cluster_logs",      name:"k8s_cluster_logs",      desc:"Kubernetes Cluster Logs", platform:"Kubernetes API", connectorType:"MCP",      accessMethod:"MCP Tool",    auth:"MCP",             iconTone:"cyan"    },
  "file_ingest_sftp":        { slug:"file_ingest_sftp",      name:"file_ingest_sftp",      desc:"Partner Data Ingest",     platform:"SFTP Server",    connectorType:"SFTP",     accessMethod:"SFTP",        auth:"SSH Key",         iconTone:"slate"   },
  "threat_intel_feeds":      { slug:"threat_intel_feeds",    name:"threat_intel_feeds",    desc:"External Threat Feeds",   platform:"Public API",     connectorType:"REST API", accessMethod:"REST API",    auth:"API Key",         iconTone:"emerald" },
};

/* ---------------- Method catalogue ---------------- */
type Tone = "emerald" | "blue" | "amber" | "violet" | "rose" | "cyan" | "slate";
const toneMap: Record<Tone,{bg:string;text:string;ring:string;hex:string}> = {
  emerald:{bg:"bg-emerald-50",text:"text-emerald-700",ring:"ring-emerald-200",hex:"#10b981"},
  blue:   {bg:"bg-blue-50",   text:"text-blue-700",   ring:"ring-blue-200",   hex:"#3b82f6"},
  amber:  {bg:"bg-amber-50",  text:"text-amber-700",  ring:"ring-amber-200",  hex:"#f59e0b"},
  violet: {bg:"bg-violet-50", text:"text-violet-700", ring:"ring-violet-200", hex:"#8b5cf6"},
  rose:   {bg:"bg-rose-50",   text:"text-rose-700",   ring:"ring-rose-200",   hex:"#f43f5e"},
  cyan:   {bg:"bg-cyan-50",   text:"text-cyan-700",   ring:"ring-cyan-200",   hex:"#06b6d4"},
  slate:  {bg:"bg-slate-50",  text:"text-slate-700",  ring:"ring-slate-200",  hex:"#64748b"},
};

type Method = {
  id: string;
  name: string;
  icon: any;
  tone: Tone;
  summary: string;
  recommended?: boolean;
  // Cyber
  cyber: {
    inTransit: { protocol: string; strength: "Strong"|"Moderate"|"Weak"; notes: string };
    atRest:    { protocol: string; strength: "Strong"|"Moderate"|"Weak"; notes: string };
    authModel: string;
    keyRotation: string;
    auditability: "Full"|"Partial"|"Minimal";
    zeroTrustFit: number;   // 0-100
    riskScore:    number;   // 0-100 lower = better
    complianceHits: string[];
    residualRisks: string[];
  };
  // Forecast/Modeled stats (each unique)
  forecast: {
    throughputEventsPerSec: number;
    latencyMsP50: number;
    latencyMsP95: number;
    freshnessSec: number;
    dailyVolumeGB: number;
    monthlyCostUSD: number;
    dedupEfficiency: number;      // %
    schemaStability: number;      // %
    backpressureRisk: number;     // %
    scaleCeiling: string;
    ttlvHours: number;            // time-to-live-value hours
    yearOneSavingsUSD: number;
  };
  // Strategy scenarios (impact modelling)
  scenarios: {
    name: string;
    approach: string;
    upside: string;
    downside: string;
    costDelta: number;    // % vs baseline
    latencyDelta: number; // %
    riskDelta: number;    // %
    fitScore: number;     // 0-100
    tone: Tone;
  }[];
};

/* ---- Deterministic per-source jitter so each connector shows unique numbers ---- */
function hash(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function jitter(seed: number, i: number, base: number, spread: number) {
  const x = Math.sin(seed * 9301 + i * 49297) * 233280;
  const r = x - Math.floor(x);
  return Math.round((base + (r - 0.5) * 2 * spread) * 100) / 100;
}

function buildMethods(row: Row): Method[] {
  const seed = hash(row.slug);

  const base: Omit<Method,"forecast"|"scenarios">[] = [
    {
      id: "rest",
      name: "REST API (HTTPS)",
      icon: Cloud, tone: "blue",
      summary: "Pull-based JSON over TLS. Ubiquitous, easy to authorize, moderate throughput.",
      recommended: row.connectorType === "REST API",
      cyber: {
        inTransit: { protocol: "TLS 1.3 (AES-256-GCM)", strength: "Strong", notes: "PFS via X25519; HSTS enforced at gateway." },
        atRest:    { protocol: "AES-256 (vault-encrypted response cache)", strength: "Strong", notes: "Encrypted object store; per-tenant KMS keys." },
        authModel: "Bearer / API Key + IP allowlist",
        keyRotation: "90-day auto-rotation via secrets manager",
        auditability: "Full",
        zeroTrustFit: 82,
        riskScore: 18,
        complianceHits: ["SOC2 CC6.1","ISO 27001 A.13","HIPAA §164.312(e)"],
        residualRisks: ["Token leakage via client logs","Rate-limit induced backpressure"],
      },
    },
    {
      id: "sql",
      name: "SQL / JDBC (BigQuery, Snowflake, Postgres)",
      icon: Database, tone: "emerald",
      summary: "Set-based pull with predicate pushdown. Excellent for analytical corpuses.",
      recommended: row.connectorType === "SQL",
      cyber: {
        inTransit: { protocol: "TLS 1.3 + mTLS handshake", strength: "Strong", notes: "Certificate-pinned driver connections." },
        atRest:    { protocol: "CMEK (customer-managed encryption keys)", strength: "Strong", notes: "Column-level encryption for PII fields." },
        authModel: "Service Account (short-lived OAuth2 STS token)",
        keyRotation: "1-hour token TTL, JWT signed by workload identity",
        auditability: "Full",
        zeroTrustFit: 91,
        riskScore: 12,
        complianceHits: ["SOC2 CC6.6","GDPR Art. 32","PCI DSS 3.5"],
        residualRisks: ["Runaway queries impacting slot pool","Cross-project egress cost"],
      },
    },
    {
      id: "odbc",
      name: "ODBC / Native Driver",
      icon: GitBranch, tone: "slate",
      summary: "Persistent driver channel. Higher throughput, heavier client footprint.",
      cyber: {
        inTransit: { protocol: "TLS 1.2/1.3 (driver-negotiated)", strength: "Moderate", notes: "Some legacy drivers fall back to TLS 1.2." },
        atRest:    { protocol: "AES-256 (staging spool encrypted)", strength: "Strong", notes: "Driver spill files wiped on session close." },
        authModel: "DSN + Kerberos / SPNEGO",
        keyRotation: "Realm-managed principals; 24h ticket lifetime",
        auditability: "Partial",
        zeroTrustFit: 64,
        riskScore: 32,
        complianceHits: ["SOC2 CC6.1","ISO 27001 A.9"],
        residualRisks: ["Driver CVE exposure","DSN sprawl across workstations"],
      },
    },
    {
      id: "xql",
      name: "XQL / XSIAM Query API",
      icon: Shield, tone: "amber",
      summary: "Vendor-native query for Cortex-shaped telemetry. Optimized for security joins.",
      recommended: row.connectorType === "XQL",
      cyber: {
        inTransit: { protocol: "TLS 1.3 w/ tenant-scoped SNI", strength: "Strong", notes: "Region-pinned endpoints; no cross-tenant routing." },
        atRest:    { protocol: "AES-256 tenant KMS envelope", strength: "Strong", notes: "Immutable audit lake retention." },
        authModel: "Advanced API Key (Standard/Advanced tiers)",
        keyRotation: "60-day rotation, HSM-generated",
        auditability: "Full",
        zeroTrustFit: 88,
        riskScore: 15,
        complianceHits: ["SOC2 CC7.2","NIST 800-53 AU-2","FedRAMP AC-6"],
        residualRisks: ["Quota exhaustion under threat storms","Regional endpoint drift"],
      },
    },
    {
      id: "mcp",
      name: "MCP Tool (Model Context Protocol)",
      icon: Cpu, tone: "cyan",
      summary: "Agent-native tool invocation. Introspectable, low-code, emerging maturity.",
      recommended: row.connectorType === "MCP",
      cyber: {
        inTransit: { protocol: "TLS 1.3 over stdio/WebSocket", strength: "Strong", notes: "Session-scoped ephemeral tokens." },
        atRest:    { protocol: "Not persisted — pass-through", strength: "Moderate", notes: "Cache-off by default; opt-in for replay." },
        authModel: "OAuth 2.1 + capability scoping",
        keyRotation: "Per-session token, ≤ 15 min",
        auditability: "Partial",
        zeroTrustFit: 74,
        riskScore: 26,
        complianceHits: ["SOC2 CC6.7"],
        residualRisks: ["Tool-poisoning via prompt injection","Nascent standard, spec churn"],
      },
    },
    {
      id: "sftp",
      name: "SFTP / Managed File Transfer",
      icon: Server, tone: "slate",
      summary: "Batch file drops over SSH. Simple, high-latency, partner-friendly.",
      recommended: row.connectorType === "SFTP",
      cyber: {
        inTransit: { protocol: "SSH-2 (ChaCha20-Poly1305 / AES-256-GCM)", strength: "Strong", notes: "Host-key pinning; strict KEX allowlist." },
        atRest:    { protocol: "AES-256 landing zone + object-lock", strength: "Strong", notes: "WORM retention for partner files." },
        authModel: "Ed25519 SSH keypair + jump-host",
        keyRotation: "Annual key ceremony; CA-signed host keys",
        auditability: "Full",
        zeroTrustFit: 68,
        riskScore: 28,
        complianceHits: ["SOC2 CC6.1","HIPAA §164.312"],
        residualRisks: ["Freshness gap for streaming use cases","Filename-based routing brittleness"],
      },
    },
    {
      id: "stream",
      name: "Streaming (Kafka / Kinesis / Pub-Sub)",
      icon: Zap, tone: "violet",
      summary: "Push-based event fabric. Sub-second freshness, higher ops burden.",
      cyber: {
        inTransit: { protocol: "TLS 1.3 + SASL/SCRAM", strength: "Strong", notes: "Broker-to-broker mTLS; ACL per topic." },
        atRest:    { protocol: "AES-256 broker disks + tiered S3 SSE-KMS", strength: "Strong", notes: "Topic-level encryption keys." },
        authModel: "OAuth Bearer (Confluent) / IAM (MSK, Kinesis)",
        keyRotation: "Rolling; JIT credentials via STS",
        auditability: "Full",
        zeroTrustFit: 86,
        riskScore: 20,
        complianceHits: ["SOC2 CC7.2","ISO 27001 A.12","PCI DSS 10.5"],
        residualRisks: ["Consumer-group lag → data loss","Schema-registry compatibility breaks"],
      },
    },
    {
      id: "webhook",
      name: "Webhook / Push Callback",
      icon: Radio, tone: "rose",
      summary: "Event-driven push from source. Lowest latency, hardest to secure.",
      cyber: {
        inTransit: { protocol: "TLS 1.3 + HMAC-SHA256 signatures", strength: "Strong", notes: "Replay-protection nonce + timestamp." },
        atRest:    { protocol: "Ephemeral queue → AES-256 event store", strength: "Moderate", notes: "Dead-letter queue must be encrypted separately." },
        authModel: "Shared secret HMAC + mTLS optional",
        keyRotation: "180-day secret rotation (manual coordination)",
        auditability: "Partial",
        zeroTrustFit: 58,
        riskScore: 42,
        complianceHits: ["SOC2 CC6.1"],
        residualRisks: ["Public ingress attack surface","Signature validation regressions","No native replay"],
      },
    },
  ];

  return base.map((m, i) => {
    const s = seed + hash(m.id);
    const forecast = {
      throughputEventsPerSec: Math.max(50, Math.round(jitter(s, 1, m.id==="stream"?42000: m.id==="webhook"?18000: m.id==="rest"?3800: m.id==="sql"?9500: m.id==="odbc"?12000: m.id==="xql"?7200: m.id==="mcp"?1600: 900, 800))),
      latencyMsP50: Math.round(jitter(s, 2, m.id==="stream"?85: m.id==="webhook"?60: m.id==="rest"?260: m.id==="sql"?520: m.id==="odbc"?310: m.id==="xql"?190: m.id==="mcp"?420: 5400, 40)),
      latencyMsP95: Math.round(jitter(s, 3, m.id==="stream"?220: m.id==="webhook"?190: m.id==="rest"?880: m.id==="sql"?1600: m.id==="odbc"?940: m.id==="xql"?540: m.id==="mcp"?1200: 18000, 90)),
      freshnessSec: Math.round(jitter(s, 4, m.id==="stream"?2: m.id==="webhook"?1.5: m.id==="rest"?45: m.id==="sql"?300: m.id==="odbc"?120: m.id==="xql"?60: m.id==="mcp"?90: 1800, 5)),
      dailyVolumeGB: Math.round(jitter(s, 5, m.id==="stream"?820: m.id==="rest"?140: m.id==="sql"?960: m.id==="odbc"?720: m.id==="xql"?540: m.id==="mcp"?60: m.id==="sftp"?1200: 90, 40)),
      monthlyCostUSD: Math.round(jitter(s, 6, m.id==="stream"?18400: m.id==="sql"?9200: m.id==="odbc"?7400: m.id==="xql"?11200: m.id==="rest"?3200: m.id==="mcp"?1400: m.id==="sftp"?2100: 2600, 400)),
      dedupEfficiency: Math.min(99, Math.max(60, Math.round(jitter(s, 7, m.id==="sql"?96: m.id==="stream"?88: m.id==="xql"?92: m.id==="rest"?84: 76, 3)))),
      schemaStability: Math.min(99, Math.max(50, Math.round(jitter(s, 8, m.id==="sql"?95: m.id==="xql"?93: m.id==="odbc"?90: m.id==="rest"?82: m.id==="stream"?78: m.id==="mcp"?65: 70, 4)))),
      backpressureRisk: Math.min(90, Math.max(2, Math.round(jitter(s, 9, m.id==="webhook"?38: m.id==="stream"?22: m.id==="rest"?18: m.id==="mcp"?32: 8, 4)))),
      scaleCeiling: m.id==="stream" ? "≥ 250K eps" : m.id==="odbc" ? "40K rps" : m.id==="sql" ? "12K qps" : m.id==="rest" ? "6K rps" : m.id==="xql" ? "10K qps" : m.id==="mcp" ? "1.5K rps" : m.id==="sftp" ? "N/A (batch)" : "2K rps",
      ttlvHours: Math.max(0.5, Math.round(jitter(s, 10, m.id==="stream"?1: m.id==="webhook"?0.5: m.id==="rest"?4: m.id==="sql"?12: m.id==="mcp"?2: m.id==="odbc"?8: m.id==="sftp"?24: 6, 1)*10)/10),
      yearOneSavingsUSD: Math.round(jitter(s, 11, m.id==="sql"?128000: m.id==="stream"?96000: m.id==="xql"?84000: m.id==="rest"?42000: m.id==="odbc"?61000: m.id==="mcp"?18000: m.id==="sftp"?24000: 12000, 6000)),
    };

    const scenarios: Method["scenarios"] = [
      {
        name: "Pull-Everything Baseline",
        approach: `Full-fidelity ingest of ${row.desc.toLowerCase()} into orchestration tier with no filter.`,
        upside: "Zero data loss; simplest lineage story.",
        downside: "Costliest path; noisy fields dilute query readiness.",
        costDelta: Math.round(jitter(s, 21, 22, 6)),
        latencyDelta: Math.round(jitter(s, 22, -4, 3)),
        riskDelta: Math.round(jitter(s, 23, 6, 2)),
        fitScore: Math.round(jitter(s, 24, 58, 5)),
        tone: "amber",
      },
      {
        name: "Filter-at-Source",
        approach: "Predicate pushdown / server-side filter before wire transfer.",
        upside: "35-60% volume reduction, lower egress, faster p95.",
        downside: "Loses raw fidelity; requires contract with source owner.",
        costDelta: -Math.round(jitter(s, 31, 34, 6)),
        latencyDelta: -Math.round(jitter(s, 32, 22, 4)),
        riskDelta: Math.round(jitter(s, 33, 3, 2)),
        fitScore: Math.round(jitter(s, 34, 82, 4)),
        tone: "emerald",
      },
      {
        name: "Reference-Only Federation",
        approach: "Query source in place; store only pointers + query results.",
        upside: "Near-zero storage cost; strongest data-residency posture.",
        downside: "Depends on source availability; harder to backfill.",
        costDelta: -Math.round(jitter(s, 41, 62, 6)),
        latencyDelta: Math.round(jitter(s, 42, 18, 4)),
        riskDelta: -Math.round(jitter(s, 43, 8, 3)),
        fitScore: Math.round(jitter(s, 44, 74, 4)),
        tone: "blue",
      },
      {
        name: "Hybrid Tiered (Hot / Warm / Cold)",
        approach: "Hot streaming for 24h; warm queryable 30d; cold object store 400d.",
        upside: "Balances freshness, cost, and forensic replay.",
        downside: "Two lifecycle systems to govern; tier boundaries need drills.",
        costDelta: -Math.round(jitter(s, 51, 18, 4)),
        latencyDelta: -Math.round(jitter(s, 52, 8, 3)),
        riskDelta: -Math.round(jitter(s, 53, 4, 2)),
        fitScore: Math.round(jitter(s, 54, 88, 3)),
        tone: "violet",
      },
      {
        name: "Change-Data-Capture Only",
        approach: "Subscribe to deltas; rebuild materializations downstream.",
        upside: "Minimal wire volume; ideal for slow-changing dimensions.",
        downside: "Not applicable to append-only telemetry; snapshot bootstrap cost.",
        costDelta: -Math.round(jitter(s, 61, 44, 5)),
        latencyDelta: -Math.round(jitter(s, 62, 12, 3)),
        riskDelta: Math.round(jitter(s, 63, 5, 2)),
        fitScore: Math.round(jitter(s, 64, 66, 5)),
        tone: "cyan",
      },
    ];

    return { ...m, forecast, scenarios };
  });
}

/* ---------------- Bar mini-chart ---------------- */
function Bars({ vals, color }: { vals: number[]; color: string }) {
  const max = Math.max(...vals);
  return (
    <svg viewBox="0 0 100 30" className="h-8 w-full">
      {vals.map((v, i) => {
        const h = (v / max) * 26;
        const w = 100 / vals.length - 2;
        return <rect key={i} x={i * (100/vals.length) + 1} y={30-h} width={w} height={h} fill={color} opacity={0.85} rx={1}/>;
      })}
    </svg>
  );
}

/* ---------------- Page ---------------- */
export default function ConnectionMethodProfile() {
  const { slug = "" } = useParams();
  const row = ROWS[slug];
  const methods = useMemo(() => (row ? buildMethods(row) : []), [row]);

  if (!row) {
    return (
      <div className="min-h-screen bg-white p-8">
        <Link to="/data-orchestration-twin/connector-access-and-governance-registry" className="text-blue-600 text-sm inline-flex items-center gap-1">
          <ArrowLeft size={14}/> Back to Registry
        </Link>
        <div className="mt-6 text-slate-700">Unknown connector: <code>{slug}</code></div>
      </div>
    );
  }

  const t = toneMap[row.iconTone as Tone] ?? toneMap.slate;
  // Forecast rollups
  const bestFit = methods.reduce((a,b) => (b.forecast.dedupEfficiency + b.cyber.zeroTrustFit > a.forecast.dedupEfficiency + a.cyber.zeroTrustFit ? b : a), methods[0]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <Link to="/data-orchestration-twin/connector-access-and-governance-registry"
          className="text-xs text-blue-600 inline-flex items-center gap-1 hover:underline">
          <ArrowLeft size={12}/> Back to Connector, Access &amp; Governance Registry
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl ${t.bg} ${t.text} flex items-center justify-center ring-1 ${t.ring}`}>
                <Network size={20}/>
              </div>
              <div>
                <div className="text-[11px] uppercase font-semibold text-slate-500 tracking-wide">Connection Method Profile</div>
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="font-mono">{row.name}</span>
                </h1>
                <div className="text-sm text-slate-600">
                  {row.desc} · <span className="text-slate-500">{row.platform}</span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600 max-w-3xl">
              Modelled connection strategies available for this source. Each method is scored on cyber posture
              (encryption at rest &amp; in transit, zero-trust fit, residual risk) and its forecasted impact on
              log-data orchestration throughput, freshness, cost, and query readiness.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className={`rounded-lg border border-slate-200 bg-white px-3 py-2 text-right`}>
              <div className="text-[10px] uppercase text-slate-500">Currently in Production</div>
              <div className="text-sm font-semibold text-slate-800">{row.accessMethod}</div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-right">
              <div className="text-[10px] uppercase text-emerald-700">Modelled Best-Fit</div>
              <div className="text-sm font-semibold text-emerald-800">{bestFit.name.split(" ")[0]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Methods */}
      <div className="px-8 py-6 space-y-6">
        {methods.map((m) => {
          const tm = toneMap[m.tone];
          return (
            <section key={m.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`h-11 w-11 rounded-xl ${tm.bg} ${tm.text} flex items-center justify-center ring-1 ${tm.ring}`}>
                    <m.icon size={20}/>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{m.name}</h2>
                      {m.recommended && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold uppercase">
                          <CheckCircle2 size={10}/> In-use for this source
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5 max-w-2xl">{m.summary}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center shrink-0">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <div className="text-[9px] uppercase text-slate-500">Zero-Trust Fit</div>
                    <div className="text-lg font-bold text-slate-900">{m.cyber.zeroTrustFit}</div>
                  </div>
                  <div className={`rounded-lg px-3 py-2 ${m.cyber.riskScore <= 20 ? "bg-emerald-50" : m.cyber.riskScore <= 32 ? "bg-amber-50" : "bg-rose-50"}`}>
                    <div className="text-[9px] uppercase text-slate-500">Risk Score</div>
                    <div className={`text-lg font-bold ${m.cyber.riskScore <= 20 ? "text-emerald-700" : m.cyber.riskScore <= 32 ? "text-amber-700" : "text-rose-700"}`}>{m.cyber.riskScore}</div>
                  </div>
                </div>
              </div>

              {/* Body: 3 columns */}
              <div className="grid grid-cols-12 gap-4 p-5">
                {/* Cyber Evaluation */}
                <div className="col-span-4 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={14} className="text-emerald-600"/>
                    <div className="text-xs font-semibold uppercase text-slate-700 tracking-wide">Cyber Evaluation</div>
                  </div>
                  <div className="space-y-2.5 text-[11px]">
                    <div className="rounded-lg bg-white border border-slate-100 p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium"><Lock size={11}/> Encryption In Transit</div>
                        <StrengthPill s={m.cyber.inTransit.strength}/>
                      </div>
                      <div className="mt-1 text-slate-800 font-mono text-[10.5px]">{m.cyber.inTransit.protocol}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">{m.cyber.inTransit.notes}</div>
                    </div>
                    <div className="rounded-lg bg-white border border-slate-100 p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium"><Database size={11}/> Encryption At Rest</div>
                        <StrengthPill s={m.cyber.atRest.strength}/>
                      </div>
                      <div className="mt-1 text-slate-800 font-mono text-[10.5px]">{m.cyber.atRest.protocol}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">{m.cyber.atRest.notes}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <MiniStat icon={Fingerprint} label="Auth Model" value={m.cyber.authModel}/>
                      <MiniStat icon={Key} label="Key Rotation" value={m.cyber.keyRotation}/>
                      <MiniStat icon={ClipboardIcon} label="Auditability" value={m.cyber.auditability}/>
                      <MiniStat icon={Shield} label="Compliance" value={`${m.cyber.complianceHits.length} controls`}/>
                    </div>
                    <div className="rounded-lg bg-white border border-slate-100 p-2.5">
                      <div className="text-[10px] uppercase text-slate-500 mb-1">Compliance Coverage</div>
                      <div className="flex flex-wrap gap-1">
                        {m.cyber.complianceHits.map(c => (
                          <span key={c} className="rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[9.5px] font-medium">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white border border-rose-100 p-2.5">
                      <div className="text-[10px] uppercase text-rose-700 mb-1 flex items-center gap-1"><AlertTriangle size={10}/> Residual Risks</div>
                      <ul className="space-y-0.5 text-[10.5px] text-slate-700 list-disc pl-4">
                        {m.cyber.residualRisks.map(r => <li key={r}>{r}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Forecast */}
                <div className="col-span-4 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge size={14} className="text-blue-600"/>
                    <div className="text-xs font-semibold uppercase text-slate-700 tracking-wide">Forecast — Log Orchestration Impact</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <ForecastCell label="Throughput"       value={`${m.forecast.throughputEventsPerSec.toLocaleString()} eps`} tone="blue"/>
                    <ForecastCell label="Freshness (p95)"  value={`${m.forecast.freshnessSec}s`} tone="emerald"/>
                    <ForecastCell label="Latency p50"      value={`${m.forecast.latencyMsP50} ms`} tone="cyan"/>
                    <ForecastCell label="Latency p95"      value={`${m.forecast.latencyMsP95} ms`} tone="cyan"/>
                    <ForecastCell label="Daily Volume"     value={`${m.forecast.dailyVolumeGB} GB`} tone="violet"/>
                    <ForecastCell label="Monthly Cost"     value={`$${m.forecast.monthlyCostUSD.toLocaleString()}`} tone="amber"/>
                    <ForecastCell label="Dedup Efficiency" value={`${m.forecast.dedupEfficiency}%`} tone="emerald"/>
                    <ForecastCell label="Schema Stability" value={`${m.forecast.schemaStability}%`} tone="emerald"/>
                    <ForecastCell label="Backpressure Risk"value={`${m.forecast.backpressureRisk}%`} tone={m.forecast.backpressureRisk > 25 ? "rose" : "emerald"}/>
                    <ForecastCell label="Scale Ceiling"    value={m.forecast.scaleCeiling} tone="slate"/>
                    <ForecastCell label="Time-to-Value"    value={`${m.forecast.ttlvHours}h`} tone="violet"/>
                    <ForecastCell label="Yr-1 Savings"     value={`$${(m.forecast.yearOneSavingsUSD/1000).toFixed(0)}k`} tone="emerald"/>
                  </div>
                  <div className="mt-3 rounded-lg bg-white border border-slate-100 p-2.5">
                    <div className="text-[10px] uppercase text-slate-500 mb-1">7-day forecast — events/sec</div>
                    <Bars vals={[7,7.4,8.1,7.8,8.5,9.1,9.6].map(x => x * m.forecast.throughputEventsPerSec/10)} color={tm.hex}/>
                  </div>
                </div>

                {/* Scenarios */}
                <div className="col-span-4 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Workflow size={14} className="text-violet-600"/>
                    <div className="text-xs font-semibold uppercase text-slate-700 tracking-wide">Strategy Scenarios &amp; Impact</div>
                  </div>
                  <div className="space-y-2">
                    {m.scenarios.map((sc) => {
                      const st = toneMap[sc.tone];
                      return (
                        <div key={sc.name} className="rounded-lg bg-white border border-slate-100 p-2.5">
                          <div className="flex items-center justify-between">
                            <div className={`text-[11.5px] font-semibold ${st.text}`}>{sc.name}</div>
                            <div className="text-[10px] text-slate-500">Fit <b className="text-slate-800">{sc.fitScore}</b></div>
                          </div>
                          <div className="text-[10.5px] text-slate-600 mt-0.5">{sc.approach}</div>
                          <div className="mt-1.5 grid grid-cols-3 gap-1 text-[10px]">
                            <Delta label="Cost" v={sc.costDelta}/>
                            <Delta label="Latency" v={sc.latencyDelta} invert/>
                            <Delta label="Risk" v={sc.riskDelta} invert/>
                          </div>
                          <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px]">
                            <div className="rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5"><b>+</b> {sc.upside}</div>
                            <div className="rounded bg-rose-50 text-rose-700 px-1.5 py-0.5"><b>−</b> {sc.downside}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {/* Footer */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5"><Info size={12}/> Forecasts are modelled from historical telemetry for this source and current fleet capacity; scenario deltas are relative to the pull-everything baseline.</div>
          <div>Model v2.4 · Cyber policy v4.2.1</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Small helpers ---------------- */
function StrengthPill({ s }: { s: "Strong"|"Moderate"|"Weak" }) {
  const map = {
    Strong:   "bg-emerald-100 text-emerald-700",
    Moderate: "bg-amber-100 text-amber-700",
    Weak:     "bg-rose-100 text-rose-700",
  } as const;
  return <span className={`rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase ${map[s]}`}>{s}</span>;
}
function MiniStat({ icon:Icon, label, value }: { icon:any; label:string; value:string }) {
  return (
    <div className="rounded-lg bg-white border border-slate-100 p-2">
      <div className="flex items-center gap-1 text-[9.5px] uppercase text-slate-500"><Icon size={9}/> {label}</div>
      <div className="text-[10.5px] font-medium text-slate-800 mt-0.5 leading-tight">{value}</div>
    </div>
  );
}
function ForecastCell({ label, value, tone: t }: { label:string; value:string; tone: Tone }) {
  const tm = toneMap[t];
  return (
    <div className={`rounded-lg ${tm.bg} border ${tm.ring} border-transparent px-2 py-1.5`}>
      <div className="text-[9.5px] uppercase text-slate-500">{label}</div>
      <div className={`text-[12px] font-bold ${tm.text}`}>{value}</div>
    </div>
  );
}
function Delta({ label, v, invert }: { label:string; v:number; invert?:boolean }) {
  const good = invert ? v < 0 : v < 0;
  const cls = good ? "text-emerald-700 bg-emerald-50" : v === 0 ? "text-slate-600 bg-slate-50" : "text-rose-700 bg-rose-50";
  const Icon = v < 0 ? TrendingDown : v > 0 ? TrendingUp : Info;
  return (
    <div className={`rounded px-1.5 py-0.5 flex items-center justify-between ${cls}`}>
      <span className="uppercase text-[9px]">{label}</span>
      <span className="font-semibold flex items-center gap-0.5"><Icon size={9}/>{v > 0 ? "+" : ""}{v}%</span>
    </div>
  );
}
function ClipboardIcon(props: any) {
  return <ShieldCheck {...props}/>;
}
