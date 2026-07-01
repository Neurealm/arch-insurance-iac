import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Fingerprint,
  KeyRound,
  Globe2,
  Cpu,
  Lock,
  Radar,
  Activity,
  CheckCircle2,
  Loader2,
} from "lucide-react";

/**
 * AuthVerificationOverlay
 * Cinematic pre-application authentication verification experience.
 * - Renders a full-screen dark cybersecurity console.
 * - Runs a scripted sequence of security control checks (~5s baseline).
 * - When `authComplete` becomes true, remaining stages accelerate.
 * - Calls `onFinished` once the sequence completes.
 */

type Stage = {
  id: string;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STAGES: Stage[] = [
  { id: "tls",     label: "Establishing TLS 1.3 Channel",       detail: "ECDHE • X25519 • AES-256-GCM",                icon: Lock },
  { id: "iam",     label: "Resolving Identity Provider",         detail: "OIDC discovery • JWKS cache warmed",         icon: Fingerprint },
  { id: "device",  label: "Attesting Device Posture",            detail: "TPM 2.0 • Managed • Disk encrypted",         icon: Cpu },
  { id: "geo",     label: "Correlating Geo & Network Signals",   detail: "ASN 15169 • Residential • Low risk",         icon: Globe2 },
  { id: "risk",    label: "Evaluating Adaptive Risk Engine",     detail: "312 signals scored • risk = 0.07",           icon: Radar },
  { id: "policy",  label: "Applying Zero-Trust Policy Set",      detail: "ABAC • Conditional Access • Tenant scope",   icon: ShieldCheck },
  { id: "mfa",     label: "Verifying Strong Authentication",     detail: "WebAuthn / FIDO2 • Passkey attested",        icon: KeyRound },
  { id: "session", label: "Minting Session & Audit Envelope",    detail: "JWT • 15m TTL • SIEM lineage logged",        icon: Activity },
];

type Props = {
  open: boolean;
  authComplete: boolean;
  onFinished: () => void;
  userEmail?: string | null;
  workspaceLabel?: string;
};

export function AuthVerificationOverlay({
  open,
  authComplete,
  onFinished,
  userEmail,
  workspaceLabel,
}: Props) {
  const [stageIdx, setStageIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const decisions = useSecurityDecisionsCounter(open);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    if (!open) {
      setStageIdx(0);
      setCompleted(false);
      startedAt.current = 0;
      return;
    }
    startedAt.current = performance.now();
    let cancelled = false;
    let idx = 0;

    const runNext = () => {
      if (cancelled) return;
      if (idx >= STAGES.length) {
        setCompleted(true);
        // brief hold on "Access Granted" then finish
        window.setTimeout(() => !cancelled && onFinished(), 650);
        return;
      }
      setStageIdx(idx);
      // Base cadence tuned for ~5s total across 8 stages (≈620ms each).
      // Accelerate once auth already completed and we're past the halfway mark.
      const baseDelay = 620;
      const accelerated = authComplete && idx > 2 ? 280 : baseDelay;
      idx += 1;
      window.setTimeout(runNext, accelerated);
    };

    // Small initial delay so the first stage animates in
    const t = window.setTimeout(runNext, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
    // authComplete intentionally read at each tick via closure over prop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, authComplete]);

  const orbNodes = useMemo(
    () =>
      STAGES.map((_, i) => {
        const angle = (i / STAGES.length) * Math.PI * 2 - Math.PI / 2;
        const r = 132;
        return {
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r,
        };
      }),
    [],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[9999] overflow-hidden bg-[#050914] text-slate-100"
          role="dialog"
          aria-label="Authentication Verification"
        >
          {/* Backdrop layers */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,113,255,0.18),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(rgba(120,160,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(120,160,255,0.35)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020509]" />

          {/* Header */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-8 py-5 text-[11px] tracking-[0.22em] uppercase text-slate-400/80">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              <span>Secure Access Broker</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">Zero-Trust Session Initiation</span>
            </div>
            <div className="flex items-center gap-6 text-slate-500">
              <span>TLS 1.3</span>
              <span>FIDO2</span>
              <span>SOC 2 • ISO 27001</span>
              <span className="tabular-nums">{formatClock()}</span>
            </div>
          </div>

          {/* Center stage */}
          <div className="relative h-full w-full flex items-center justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,340px)_minmax(360px,420px)_minmax(320px,380px)] gap-8 max-w-[1240px] w-full px-10">
              {/* Left: identity */}
              <IdentityCard email={userEmail} workspace={workspaceLabel} />

              {/* Center: orbiting shield */}
              <div className="relative h-[360px] flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                    className="relative h-[320px] w-[320px] rounded-full border border-blue-400/20"
                  >
                    <div className="absolute inset-8 rounded-full border border-blue-400/15" />
                    <div className="absolute inset-16 rounded-full border border-blue-400/10" />
                    {orbNodes.map((n, i) => {
                      const done = i < stageIdx || completed;
                      const active = i === stageIdx && !completed;
                      return (
                        <div
                          key={i}
                          className="absolute left-1/2 top-1/2"
                          style={{ transform: `translate(calc(-50% + ${n.x}px), calc(-50% + ${n.y}px))` }}
                        >
                          <motion.div
                            animate={
                              active
                                ? { scale: [1, 1.35, 1], opacity: [0.85, 1, 0.85] }
                                : { scale: 1, opacity: done ? 1 : 0.4 }
                            }
                            transition={{ duration: 1.1, repeat: active ? Infinity : 0 }}
                            className={
                              "h-2.5 w-2.5 rounded-full " +
                              (done
                                ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                                : active
                                  ? "bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.9)]"
                                  : "bg-slate-500/60")
                            }
                          />
                        </div>
                      );
                    })}
                  </motion.div>
                </div>

                {/* Radar sweep */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
                  className="absolute h-[320px] w-[320px] rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, rgba(56,189,248,0.35), rgba(56,189,248,0) 30%)",
                    WebkitMaskImage:
                      "radial-gradient(circle, black 62%, transparent 63%)",
                    maskImage:
                      "radial-gradient(circle, black 62%, transparent 63%)",
                  }}
                />

                {/* Core shield */}
                <div className="relative z-10 h-[180px] w-[180px] rounded-full bg-gradient-to-br from-[#0d1a3a] to-[#050914] border border-blue-400/30 shadow-[0_0_60px_rgba(56,113,255,0.35)] grid place-items-center">
                  <div className="text-center">
                    <AnimatePresence mode="wait">
                      {completed ? (
                        <motion.div
                          key="done"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 14 }}
                        >
                          <ShieldCheck className="h-14 w-14 text-emerald-400 mx-auto drop-shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
                          <div className="mt-2 text-[11px] tracking-[0.28em] text-emerald-300 uppercase">
                            Access Granted
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="verifying"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <ShieldCheck className="h-14 w-14 text-sky-300 mx-auto" />
                          <div className="mt-2 text-[10px] tracking-[0.28em] text-sky-200/80 uppercase">
                            Verifying
                          </div>
                          <div className="mt-1 text-[10px] tabular-nums text-slate-400">
                            {decisions.toLocaleString()} decisions/s
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Right: stage list */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-4">
                <div className="text-[10px] tracking-[0.24em] uppercase text-slate-400 mb-3 px-2">
                  Security Control Pipeline
                </div>
                <ul className="space-y-1.5">
                  {STAGES.map((s, i) => {
                    const done = i < stageIdx || completed;
                    const active = i === stageIdx && !completed;
                    const Icon = s.icon;
                    return (
                      <li
                        key={s.id}
                        className={
                          "flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors " +
                          (active
                            ? "bg-sky-500/10 ring-1 ring-sky-400/30"
                            : done
                              ? "bg-emerald-500/[0.06]"
                              : "opacity-60")
                        }
                      >
                        <div
                          className={
                            "h-7 w-7 rounded-md grid place-items-center shrink-0 " +
                            (done
                              ? "bg-emerald-500/15 text-emerald-300"
                              : active
                                ? "bg-sky-500/15 text-sky-300"
                                : "bg-slate-700/40 text-slate-400")
                          }
                        >
                          {done ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : active ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[12.5px] font-medium text-slate-100 leading-tight truncate">
                            {s.label}
                          </div>
                          <div className="text-[10.5px] text-slate-400 truncate tabular-nums">
                            {s.detail}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer ticker */}
          <div className="absolute bottom-0 inset-x-0 border-t border-white/5 bg-black/40 backdrop-blur-sm">
            <div className="max-w-[1240px] mx-auto px-10 py-3 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-6">
                <Stat label="Threats Evaluated" value={(decisions * 3.2).toFixed(0)} />
                <Stat label="Policies Applied" value={(24 + Math.floor(decisions / 12)).toString()} />
                <Stat label="Risk Score" value="0.07" tone="ok" />
                <Stat label="Latency" value={`${Math.max(38, 92 - Math.floor(decisions / 8))}ms`} />
              </div>
              <div className="text-slate-500">
                Session lineage streamed to SIEM • Governed by NIST 800-207 Zero-Trust Architecture
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function IdentityCard({ email, workspace }: { email?: string | null; workspace?: string }) {
  const initials = (email || "?")
    .split("@")[0]
    .split(/[._-]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("");
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 self-center">
      <div className="text-[10px] tracking-[0.24em] uppercase text-slate-400 mb-3">
        Principal
      </div>
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 grid place-items-center text-sm font-semibold text-white shadow-[0_0_18px_rgba(56,113,255,0.5)]">
          {initials || "U"}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-slate-100 truncate">
            {email || "Authenticating…"}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Workspace • {workspace || "—"}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
        <Meta k="Method" v="Passkey" />
        <Meta k="Device" v="Managed" />
        <Meta k="Region" v="US-East" />
        <Meta k="Tenant" v="Isolated" />
      </div>
      <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400"
        />
      </div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-white/[0.03] px-2.5 py-1.5">
      <div className="text-[9.5px] uppercase tracking-wider text-slate-500">{k}</div>
      <div className="text-slate-200">{v}</div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" }) {
  return (
    <div className="flex items-center gap-2">
      <span className="uppercase tracking-wider text-[9.5px] text-slate-500">{label}</span>
      <span
        className={
          "tabular-nums font-semibold " +
          (tone === "ok" ? "text-emerald-300" : "text-slate-100")
        }
      >
        {value}
      </span>
    </div>
  );
}

function useSecurityDecisionsCounter(active: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    setN(0);
    const id = window.setInterval(() => {
      setN((v) => v + Math.floor(28 + Math.random() * 42));
    }, 140);
    return () => window.clearInterval(id);
  }, [active]);
  return n;
}

function formatClock() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " UTC";
}
