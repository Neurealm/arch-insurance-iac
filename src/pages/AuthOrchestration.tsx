import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldCheck, Fingerprint, KeyRound, Smartphone, Globe2, Cpu,
  Radar, Lock, FileText, Activity, Users, Brain, Gauge, X, Sparkles,
  Copy, Clock, Server, MapPin, Wifi, ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";

/* ============================================================
   TELEMETRY ENGINE — everything randomized on each mount
   ============================================================ */

const PROVIDERS = ["Okta", "Microsoft Entra ID", "Ping Identity", "Auth0", "ForgeRock"];
const REGIONS = ["Chicago", "Dallas", "London", "Singapore", "Frankfurt", "Sydney", "Tokyo", "Toronto", "São Paulo"];
const DEVICES = ["macOS 14.5", "Windows 11 23H2", "Ubuntu 24.04", "iOS 17.6", "Android 14"];
const BROWSERS = ["Chrome 128", "Edge 128", "Safari 17.6", "Firefox 129", "Arc 1.55"];
const CIPHERS = ["TLS_AES_256_GCM_SHA384", "TLS_CHACHA20_POLY1305_SHA256", "TLS_AES_128_GCM_SHA256"];
const AWS = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1", "ap-northeast-1"];
const AZURE = ["East US 2", "West Europe", "Southeast Asia", "North Europe", "Australia East"];
const GCP = ["us-central1", "europe-west3", "asia-east1", "southamerica-east1"];
const FEEDS = ["Recorded Future", "Mandiant", "CrowdStrike Falcon X", "Microsoft Defender TI", "Anomali", "Flashpoint"];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const rand = (a: number, b: number, d = 0) => +(a + Math.random() * (b - a)).toFixed(d);
const hex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const uuid = () => `${hex(8)}-${hex(4)}-${hex(4)}-${hex(4)}-${hex(12)}`;
const ip = () => `${rand(20, 220)}.${rand(0, 255)}.${rand(0, 255)}.${rand(0, 255)}`;

function buildTelemetry() {
  return {
    sessionId: uuid(),
    jwtId: hex(24),
    oauthTokenId: hex(20),
    provider: pick(PROVIDERS),
    region: pick(REGIONS),
    device: pick(DEVICES),
    browser: pick(BROWSERS),
    cipher: pick(CIPHERS),
    aws: pick(AWS),
    azure: pick(AZURE),
    gcp: pick(GCP),
    feed: pick(FEEDS),
    ip: ip(),
    successRate: rand(98.5, 99.99, 2),
    threatsEvaluated: rand(8000, 25000),
    activeSessions: rand(4000, 25000),
    riskScore: rand(8, 34),
    mfaResponseMs: rand(620, 1480),
    blockedAttempts: rand(15, 250),
    identitiesLifetime: rand(2, 500, 1),
    feedsAnalyzed: rand(24, 62),
    trustScore: rand(86, 99, 1),
    assurance: rand(0.88, 0.99, 3),
  };
}

/* ============================================================
   AUTHENTICATION STAGES
   ============================================================ */

type Stage = {
  key: string;
  label: string;
  icon: any;
  purpose: string;
  frameworks: string[];
  detail: string[];
};

const STAGES: Stage[] = [
  { key: "discovery", label: "Identity Discovery", icon: Users, purpose: "Account, tenant & directory resolution",
    frameworks: ["NIST 800-63B", "COBIT DSS05"],
    detail: ["Tenant discovery via home-realm hint", "Directory federation lookup", "Account state & lockout check"] },
  { key: "credential", label: "Credential Validation", icon: KeyRound, purpose: "Password / certificate / passkey verification",
    frameworks: ["NIST 800-63B", "OWASP ASVS"],
    detail: ["Argon2id password hash verify", "X.509 client-cert chain validation", "Passkey assertion signature check"] },
  { key: "passwordless", label: "Passwordless Verification", icon: Fingerprint, purpose: "FIDO2 / WebAuthn handshake",
    frameworks: ["FIDO2", "WebAuthn L3", "NIST 800-63B"],
    detail: ["Attestation object parsed", "Authenticator data validated", "COSE key registered to RP"] },
  { key: "mfa", label: "Multi-Factor Authentication", icon: Smartphone, purpose: "Phishing-resistant second factor",
    frameworks: ["CISA ZT", "NIST 800-63B", "CIS Controls 6"],
    detail: ["Push challenge delivered", "Biometric match on device", "Hardware key WebAuthn assertion"] },
  { key: "device", label: "Device Trust", icon: Cpu, purpose: "Managed device posture & compliance",
    frameworks: ["NIST 800-207", "CIS Controls"],
    detail: ["EDR heartbeat within 5m", "TPM attestation present", "Disk encryption + Secure Boot verified"] },
  { key: "conditional", label: "Conditional Access", icon: Globe2, purpose: "Context, geo, behavior & network policy",
    frameworks: ["CISA ZT", "MITRE ATT&CK"],
    detail: ["Geo-velocity impossible-travel check", "Anonymizer / TOR / proxy screening", "UEBA behavior baseline diff"] },
  { key: "threat", label: "Threat Intelligence", icon: Radar, purpose: "Reputational & credential exposure signals",
    frameworks: ["MITRE ATT&CK", "CISA KEV", "FBI Guidance"],
    detail: ["Dark-web credential-stuffing feeds", "Known-bad IP + ASN correlation", "AI risk score composite"] },
  { key: "authz", label: "Authorization", icon: Lock, purpose: "RBAC / ABAC least-privilege decision",
    frameworks: ["NIST 800-162", "NIST 800-53 AC"],
    detail: ["Policy Decision Point evaluated", "JIT elevation window checked", "Separation of duties enforced"] },
  { key: "token", label: "Token Generation", icon: FileText, purpose: "Signed JWT / OIDC / OAuth issuance",
    frameworks: ["RFC 7519", "OAuth 2.0", "OpenID Connect"],
    detail: ["ES256 JWT signed by HSM key", "Refresh token bound to device", "Audience & scope minimization"] },
  { key: "audit", label: "Audit Logging", icon: Activity, purpose: "Immutable evidence to SIEM",
    frameworks: ["ISO 27001", "COBIT DSS05", "SOC 2"],
    detail: ["Append-only log to WORM store", "Streaming to SIEM via CEF", "Correlation-id chained across services"] },
  { key: "session", label: "Session Established", icon: ShieldCheck, purpose: "Continuous, revocable, phishing-resistant session",
    frameworks: ["CISA ZT Maturity", "NIST 800-207"],
    detail: ["Token bound to TLS channel", "Continuous auth evaluation armed", "Session revocable at PDP"] },
];

/* ============================================================
   TRUST ENGINE NODES (orbit graph)
   ============================================================ */

const NODES = [
  { key: "idp",     label: "Identity Provider",     icon: Users,        angle: -90 },
  { key: "cond",    label: "Conditional Access",    icon: Globe2,       angle: -60 },
  { key: "mfa",     label: "MFA",                   icon: Smartphone,   angle: -30 },
  { key: "threat",  label: "Threat Intelligence",   icon: Radar,        angle:   0 },
  { key: "vault",   label: "Credential Vault",      icon: KeyRound,     angle:  30 },
  { key: "device",  label: "Device Trust",          icon: Cpu,          angle:  60 },
  { key: "authz",   label: "Authorization Engine",  icon: Lock,         angle:  90 },
  { key: "token",   label: "Token Service",         icon: FileText,     angle: 120 },
  { key: "audit",   label: "Audit Engine",          icon: Activity,     angle: 150 },
  { key: "siem",    label: "SIEM",                  icon: Server,       angle: 180 },
  { key: "behav",   label: "Behavior Analytics",    icon: Brain,        angle: 210 },
  { key: "policy",  label: "Policy Engine",         icon: FileText,     angle: 240 },
  { key: "risk",    label: "Risk Engine",           icon: Gauge,        angle: 270 },
];

/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function AuthOrchestration() {
  const [tel] = useState(buildTelemetry);
  const [now, setNow] = useState(new Date());
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [drawer, setDrawer] = useState<any>(null);
  const startedAt = useRef(Date.now());

  // Clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Overall progress + stage sequencing
  useEffect(() => {
    const total = 11000; // ~11s cinematic run (2× speed)
    const t = setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const p = Math.min(100, (elapsed / total) * 100);
      setProgress(p);
      setStageIdx(Math.min(STAGES.length - 1, Math.floor((p / 100) * STAGES.length)));
    }, 90);
    return () => clearInterval(t);
  }, []);

  const complete = progress >= 100;
  const elapsedSec = ((Date.now() - startedAt.current) / 1000).toFixed(2);

  return (
    <AppShell>
    <div className="relative min-h-screen flex-1 w-full overflow-hidden bg-white text-slate-900">

      <AmbientBackground />

      {/* Top bar */}
      <header className="relative z-10 flex items-start justify-between px-8 pt-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 shadow-lg shadow-indigo-500/30">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.24em] text-slate-500">VERITAS · SECURE PLATFORM</div>
            <div className="text-[10px] text-slate-400">Zero Trust Authentication Fabric</div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Authenticating Secure Enterprise Identity
          </h1>
          <p className="mt-1 text-sm text-slate-500">Executing Zero Trust authentication policies…</p>
        </div>

        <div className="min-w-[280px] rounded-2xl border border-slate-200/70 bg-white/70 p-3 text-xs backdrop-blur-xl shadow-sm">
          <Row icon={Clock} label="UTC"      value={now.toISOString().slice(11, 19)} />
          <Row icon={Clock} label="Date"     value={now.toISOString().slice(0, 10)} />
          <Row icon={Copy}  label="Session"  value={tel.sessionId.slice(0, 22) + "…"} mono />
          <Row icon={Gauge} label="Elapsed"  value={`${elapsedSec}s`} />
          <Row icon={Users} label="IdP"      value={tel.provider} />
        </div>
      </header>

      {/* Main grid */}
      <main className="relative z-10 grid grid-cols-12 gap-6 px-8 pt-6">
        {/* LEFT — Timeline */}
        <section className="col-span-3 rounded-2xl border border-slate-200/70 bg-white/70 p-5 backdrop-blur-xl shadow-sm">
          <div className="mb-4 text-[11px] font-semibold tracking-[0.22em] text-slate-500">
            AUTHENTICATION TIMELINE
          </div>
          <ol className="relative space-y-3 border-l border-slate-200 pl-4">
            {STAGES.map((s, i) => {
              const done = i < stageIdx || complete;
              const active = i === stageIdx && !complete;
              return (
                <li key={s.key} className="relative">
                  <span className={`absolute -left-[22px] top-1.5 grid h-4 w-4 place-items-center rounded-full ring-2 ring-white ${
                    done ? "bg-emerald-500" : active ? "bg-sky-500 animate-pulse" : "bg-slate-200"
                  }`}>
                    {done && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <button
                    onClick={() => setDrawer({ kind: "stage", stage: s })}
                    className="group block w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${done ? "text-slate-900" : active ? "text-sky-700" : "text-slate-400"}`}>
                        {i + 1}. {s.label}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {done ? `${(0.2 + i * 0.19).toFixed(2)}s` : active ? "…" : "—:—"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 group-hover:text-slate-700">{s.purpose}</div>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        {/* CENTER — Trust Engine */}
        <section className="col-span-6">
          <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-b from-white/80 to-sky-50/40 p-6 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(56,89,255,0.4)]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold tracking-[0.22em] text-slate-500">
                STEP {stageIdx + 1} OF {STAGES.length} · {STAGES[stageIdx].label.toUpperCase()}
              </span>
              <span className="font-mono text-slate-400">assurance {tel.assurance}</span>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-200/70">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.4 }}
              />
            </div>

            <TrustEngine progress={progress} complete={complete} onSelect={(n) => setDrawer({ kind: "node", node: n })} />

            <div className="mt-4 grid grid-cols-4 gap-2 text-[11px]">
              <MetaChip icon={Lock}   label="Channel" value={`TLS 1.3 · ${tel.cipher.split("_").slice(1,3).join("-")}`} />
              <MetaChip icon={MapPin} label="Region"  value={`${tel.region}`} />
              <MetaChip icon={Wifi}   label="IP"      value={tel.ip} />
              <MetaChip icon={Cpu}    label="Device"  value={tel.device} />
            </div>
          </div>
        </section>

        {/* RIGHT — Security Controls */}
        <section className="col-span-3 rounded-2xl border border-slate-200/70 bg-white/70 p-5 backdrop-blur-xl shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-500">ACTIVE SECURITY CONTROLS</div>
            <button className="text-[11px] font-medium text-sky-600 hover:underline">View All</button>
          </div>
          <ul className="space-y-2">
            {STAGES.slice(0, 8).map((s, i) => {
              const done = i < stageIdx || complete;
              const active = i === stageIdx && !complete;
              const risk = done ? "Low Risk" : active ? "Evaluating" : "Pending";
              return (
                <li key={s.key}>
                  <button
                    onClick={() => setDrawer({ kind: "stage", stage: s })}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-sky-300 bg-sky-50/70 shadow-sm"
                        : "border-slate-200 bg-white/70 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <s.icon className={`h-4 w-4 ${done ? "text-emerald-600" : active ? "text-sky-600" : "text-slate-400"}`} />
                        <span className="text-sm font-medium">{s.label}</span>
                      </div>
                      <span className={`text-[10px] font-semibold ${
                        done ? "text-emerald-600" : active ? "text-amber-600" : "text-slate-400"
                      }`}>{risk}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.frameworks.map((f) => (
                        <span key={f} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                          {f}
                        </span>
                      ))}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* BOTTOM analytics */}
        <section className="col-span-12 grid grid-cols-5 gap-4 pb-8">
          <AnalyticsCard label="Authentication Confidence" value={`${tel.trustScore}%`} sub="Trust score increasing" tone="emerald" gauge={tel.trustScore} />
          <AnalyticsCard label="Risk Assessment"           value={`${tel.riskScore}/100`} sub="MEDIUM · Real-time" tone="amber"  gauge={100 - tel.riskScore} />
          <AnalyticsCard label="Sign-In Insights"          value={tel.activeSessions.toLocaleString()} sub={`+${rand(4, 22)}% vs 24h`} tone="sky"     spark />
          <AnalyticsCard label="Threat Intelligence"       value={tel.threatsEvaluated.toLocaleString()} sub={`${tel.feedsAnalyzed} live feeds · ${tel.feed}`} tone="indigo" spark />
          <AnalyticsCard label="Identity Assurance"        value={`${(tel.assurance * 100).toFixed(1)}%`} sub={`MFA ${tel.mfaResponseMs}ms · ${tel.successRate}% success`} tone="fuchsia" gauge={tel.assurance * 100} />
        </section>
      </main>

      {/* Success overlay */}
      <AnimatePresence>{complete && <SuccessOverlay tel={tel} />}</AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {drawer && <EngineeringDrawer payload={drawer} tel={tel} onClose={() => setDrawer(null)} />}
      </AnimatePresence>
    </div>
    </AppShell>
  );
}



/* ============================================================
   TRUST ENGINE (SVG hero)
   ============================================================ */

function TrustEngine({ progress, complete, onSelect }: { progress: number; complete: boolean; onSelect: (n: any) => void }) {
  const size = 560;
  const cx = size / 2, cy = size / 2;
  const R1 = 130, R2 = 210;
  const activeIdx = Math.floor((progress / 100) * NODES.length) % NODES.length;

  return (
    <div className="relative mx-auto mt-3" style={{ width: size, height: size }}>
      {/* rotating rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-sky-200/60"
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-6 rounded-full border border-indigo-200/60"
        animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-16 rounded-full border border-emerald-200/50"
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
      />

      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={complete ? "#10b981" : "#38bdf8"} stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="linePulse" x1="0" x2="1">
            <stop offset="0%"  stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* core glow */}
        <circle cx={cx} cy={cy} r={90} fill="url(#core)" />

        {/* connections from center to nodes */}
        {NODES.map((n, i) => {
          const rad = (n.angle * Math.PI) / 180;
          const x = cx + Math.cos(rad) * R2;
          const y = cy + Math.sin(rad) * R2;
          const done = i < activeIdx || complete;
          const active = i === activeIdx && !complete;
          return (
            <g key={n.key}>
              <line
                x1={cx} y1={cy} x2={x} y2={y}
                stroke={done ? "#10b981" : active ? "#6366f1" : "#cbd5e1"}
                strokeOpacity={done ? 0.6 : active ? 0.9 : 0.35}
                strokeWidth={active ? 1.6 : 1}
              />
              {active && (
                <circle r={3} fill="#6366f1">
                  <animateMotion dur="1.2s" repeatCount="indefinite"
                    path={`M ${cx} ${cy} L ${x} ${y}`} />
                </circle>
              )}
            </g>
          );
        })}

        {/* inner orbit dots */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <circle key={i} cx={cx + Math.cos(a) * R1} cy={cy + Math.sin(a) * R1} r={1.5}
              fill="#38bdf8" opacity={0.5} />
          );
        })}
      </svg>

      {/* center user */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="relative grid h-28 w-28 place-items-center rounded-full bg-white shadow-xl ring-1 ring-slate-200"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        >
          <div className={`absolute inset-0 rounded-full ${complete ? "bg-emerald-500/10" : "bg-sky-500/10"} blur-xl`} />
          <div className="text-center">
            <div className={`text-2xl font-semibold ${complete ? "text-emerald-600" : "text-sky-600"}`}>
              {Math.floor(progress)}%
            </div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
              {complete ? "Verified" : "Evaluating"}
            </div>
          </div>
        </motion.div>
      </div>

      {/* nodes */}
      {NODES.map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const x = cx + Math.cos(rad) * R2;
        const y = cy + Math.sin(rad) * R2;
        const done = i < activeIdx || complete;
        const active = i === activeIdx && !complete;
        return (
          <motion.button
            key={n.key}
            onClick={() => onSelect(n)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-3 py-2 backdrop-blur-md transition ${
              done
                ? "border-emerald-300 bg-emerald-50/80 text-emerald-700"
                : active
                ? "border-indigo-300 bg-white/95 text-indigo-700 shadow-lg shadow-indigo-500/20"
                : "border-slate-200 bg-white/70 text-slate-500"
            }`}
            style={{ left: x, top: y }}
            animate={active ? { scale: [1, 1.06, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.6 }}
          >
            <div className="flex items-center gap-1.5">
              <n.icon className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold whitespace-nowrap">{n.label}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ============================================================
   ANALYTICS CARD
   ============================================================ */

function AnalyticsCard({ label, value, sub, tone, gauge, spark }: {
  label: string; value: string; sub: string; tone: string; gauge?: number; spark?: boolean;
}) {
  const toneMap: Record<string, string> = {
    emerald: "from-emerald-400 to-emerald-600",
    amber: "from-amber-400 to-orange-500",
    sky: "from-sky-400 to-cyan-500",
    indigo: "from-indigo-400 to-violet-500",
    fuchsia: "from-fuchsia-400 to-pink-500",
  };
  const pts = useMemo(() => Array.from({ length: 24 }, () => 30 + Math.random() * 40), []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur-xl shadow-sm"
    >
      <div className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">{label.toUpperCase()}</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold text-slate-900">{value}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">{sub}</div>
        </div>
        {gauge !== undefined ? (
          <div className="relative h-14 w-14">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="15" className="fill-none stroke-slate-200" strokeWidth="3" />
              <motion.circle cx="18" cy="18" r="15" strokeLinecap="round"
                className={`fill-none stroke-current bg-gradient-to-r ${toneMap[tone]}`}
                strokeWidth="3"
                style={{ stroke: tone === "amber" ? "#f59e0b" : tone === "emerald" ? "#10b981" : tone === "sky" ? "#0ea5e9" : tone === "indigo" ? "#6366f1" : "#d946ef" }}
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${gauge} 100` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
          </div>
        ) : spark ? (
          <svg viewBox="0 0 120 40" className="h-10 w-24">
            <polyline
              fill="none" stroke={tone === "indigo" ? "#6366f1" : "#0ea5e9"} strokeWidth="1.8"
              points={pts.map((v, i) => `${i * 5},${40 - v * 0.5}`).join(" ")}
            />
          </svg>
        ) : null}
      </div>
    </motion.div>
  );
}

/* ============================================================
   BACKGROUND — particles + soft grid
   ============================================================ */

function AmbientBackground() {
  const parts = useMemo(() =>
    Array.from({ length: 40 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      d: 8 + Math.random() * 20, s: 1 + Math.random() * 2,
    })), []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,#e0f2fe_0%,transparent_60%),radial-gradient(1000px_500px_at_100%_10%,#ede9fe_0%,transparent_55%),radial-gradient(900px_500px_at_50%_120%,#dcfce7_0%,transparent_50%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.06]">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#0f172a" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-sky-400/40"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ repeat: Infinity, duration: p.d, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
      <motion.div
        className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 18 }}
      />
      <motion.div
        className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 22 }}
      />
    </div>
  );
}

/* ============================================================
   SUCCESS OVERLAY
   ============================================================ */

function SuccessOverlay({ tel }: { tel: any }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-3xl border border-emerald-200 bg-white/90 px-10 py-8 text-center shadow-2xl shadow-emerald-500/20 backdrop-blur-2xl"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="mt-4 text-2xl font-semibold text-slate-900">Authentication Successful</div>
        <div className="mt-1 text-sm text-slate-500">Zero Trust Policy Satisfied · Session Established</div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-left text-[11px] text-slate-600">
          <Fact k="Identity Assurance" v="High" />
          <Fact k="Device Trust" v="Verified" />
          <Fact k="Risk Level" v="Low" />
          <Fact k="Phishing-Resistant MFA" v="Verified" />
          <Fact k="JWT ID" v={tel.jwtId.slice(0, 16) + "…"} mono />
          <Fact k="Cloud" v={`${tel.aws} · ${tel.azure}`} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function Fact({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-widest text-slate-400">{k}</div>
      <div className={`text-slate-800 ${mono ? "font-mono text-[10px]" : "text-xs font-medium"}`}>{v}</div>
    </div>
  );
}

/* ============================================================
   DRAWER
   ============================================================ */

const TABS = [
  "Executive Summary", "Business Value", "Technical Flow", "Architecture", "API Calls",
  "Protocols", "Encryption", "Frameworks", "Threats Prevented", "Failure Modes",
  "Telemetry", "Developer Notes", "Implementation", "SOC View", "Operations",
  "Compliance", "Future",
];

function EngineeringDrawer({ payload, tel, onClose }: { payload: any; tel: any; onClose: () => void }) {
  const [tab, setTab] = useState(TABS[0]);
  const title = payload.kind === "stage" ? payload.stage.label : payload.node.label;
  const purpose = payload.kind === "stage" ? payload.stage.purpose : "Continuous Zero Trust control plane node";
  const frameworks = payload.kind === "stage" ? payload.stage.frameworks : ["NIST 800-207", "CISA ZT"];
  const detail = payload.kind === "stage" ? payload.stage.detail : ["Publishes signals to Policy Engine", "Consumed by Risk Engine", "Streamed to SIEM"];

  return (
    <motion.aside
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      className="fixed right-0 top-0 z-40 h-screen w-[520px] overflow-y-auto border-l border-slate-200 bg-white/95 backdrop-blur-2xl shadow-2xl"
    >
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 p-5 backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">ENGINEERING DEEP-DIVE</div>
            <div className="mt-1 text-xl font-semibold">{title}</div>
            <div className="mt-1 text-xs text-slate-500">{purpose}</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {frameworks.map((f: string) => (
            <span key={f} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">{f}</span>
          ))}
        </div>
        <div className="scrollbar-none mt-4 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium transition ${
                tab === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-5 text-sm text-slate-700">
        <Section title="What this control does">
          <ul className="space-y-1.5">
            {detail.map((d: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 text-sky-500" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={`Live telemetry — ${tab}`}>
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <KV k="session_id" v={tel.sessionId} />
            <KV k="jwt_id" v={tel.jwtId} />
            <KV k="oauth_token" v={tel.oauthTokenId} />
            <KV k="cipher" v={tel.cipher} />
            <KV k="identity_provider" v={tel.provider} />
            <KV k="region" v={tel.region} />
            <KV k="device" v={tel.device} />
            <KV k="browser" v={tel.browser} />
            <KV k="aws_region" v={tel.aws} />
            <KV k="azure_region" v={tel.azure} />
            <KV k="gcp_region" v={tel.gcp} />
            <KV k="threat_feed" v={tel.feed} />
            <KV k="risk_score" v={String(tel.riskScore)} />
            <KV k="trust_score" v={`${tel.trustScore}%`} />
            <KV k="mfa_latency_ms" v={String(tel.mfaResponseMs)} />
            <KV k="blocked_attempts" v={String(tel.blockedAttempts)} />
          </div>
        </Section>

        <Section title="Framework mapping">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {["NIST SP 800-63B","NIST SP 800-207","NIST 800-53","NIST SP 800-162","CISA ZT Maturity","MITRE ATT&CK","OWASP ASVS","CIS Controls v8","COBIT DSS05","ISO 27001","FIDO2","OAuth 2.0","OpenID Connect","RFC 7519 JWT"].map((f) => (
              <div key={f} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                <div className="text-[9px] uppercase tracking-widest text-slate-400">Framework</div>
                <div className="text-xs font-medium text-slate-800">{f}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Sample API call">
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-[10.5px] leading-relaxed text-emerald-300">
{`POST /oauth2/token HTTP/2
Host: auth.${tel.provider.toLowerCase().replace(/\s+/g,"")}.veritas.com
Authorization: Basic ****
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
client_id=veritas-web
code_verifier=${tel.oauthTokenId}
scope=openid profile offline_access

→ 200 OK   x-request-id: ${tel.sessionId}
{
  "token_type": "Bearer",
  "expires_in": 3600,
  "id_token":   "${tel.jwtId}...",
  "scope":      "openid profile"
}`}
          </pre>
        </Section>
      </div>
    </motion.aside>
  );
}

/* ============================================================
   TINY HELPERS
   ============================================================ */

function Row({ icon: Icon, label, value, mono }: any) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-400">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <span className={`text-slate-800 ${mono ? "font-mono text-[10px]" : "text-xs font-medium"}`}>{value}</span>
    </div>
  );
}

function MetaChip({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-2.5 py-1.5">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-widest text-slate-400">{label}</div>
        <div className="truncate text-[11px] font-medium text-slate-800">{value}</div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        <Sparkles className="h-3 w-3 text-indigo-500" /> {title}
      </div>
      {children}
    </section>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-2 py-1">
      <div className="text-[9px] uppercase tracking-widest text-slate-400">{k}</div>
      <div className="truncate text-slate-800">{v}</div>
    </div>
  );
}
