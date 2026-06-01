import { useEffect, useRef } from "react";
import { X, Bot, ShieldCheck, Download } from "lucide-react";
import { executionSteps } from "@/data/assurance";

type Props = {
  open: boolean;
  onClose: () => void;
  currentStep: number; // 1..10 (or 11 = done)
  thoughts: string[];
  elapsedMs: number;
  completed: boolean;
  stepsPassed: number;
  anomalies: number;
};

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function LiveAgentOverlay({ open, onClose, currentStep, thoughts, elapsedMs, completed, stepsPassed, anomalies }: Props) {
  const termRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [thoughts.length]);

  if (!open) return null;
  const step = executionSteps[Math.min(currentStep, executionSteps.length) - 1] ?? executionSteps[0];
  const imgSrc = `/assurance/step-${step.n}.png`;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm grid place-items-center p-4 animate-fade-in">
      <div className="w-full max-w-[1400px] h-[88vh] rounded-xl overflow-hidden bg-card shadow-[var(--shadow-lg)] flex flex-col">
        {/* Header */}
        <div className="bg-navy text-white px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white/10 grid place-items-center">
              <Bot className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">Live Agent Monitoring</div>
              <div className="font-bold text-sm">Customer Experience Assurance Agent</div>
            </div>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <div><span className="text-white/60">Step</span> <span className="font-bold">{Math.min(currentStep, 10)}/10</span></div>
            <div><span className="text-white/60">Elapsed</span> <span className="font-bold tabular-nums">{fmt(elapsedMs)}</span></div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
            </span>
            <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body split */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
          {/* Left: app screenshot */}
          <div className="relative bg-secondary/40 border-r border-border p-5 flex flex-col">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Step {step.n} · {step.name}
            </div>
            <div className="flex-1 rounded-xl border border-border bg-white overflow-hidden flex items-center justify-center">
              <img
                src={imgSrc}
                alt={`Step ${step.n}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const fallback = (e.currentTarget.nextSibling as HTMLElement | null);
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div className="hidden flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <ImagePlaceholder n={step.n} />
              </div>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground truncate">{step.url}</div>
          </div>

          {/* Right: terminal */}
          <div className="bg-[#0b1220] text-emerald-200 flex flex-col min-h-0">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between text-xs">
              <span className="font-bold tracking-wide text-white">▌ Digital Coworker Thought Process</span>
              <span className="text-white/40">~/agent/cxa</span>
            </div>
            <div ref={termRef} className="flex-1 overflow-y-auto px-5 py-4 font-mono text-[12px] leading-relaxed space-y-1">
              {thoughts.map((t, i) => (
                <div key={i} className={t.startsWith("✓") ? "text-emerald-300" : "text-emerald-200/90"}>
                  <span className="text-white/30 mr-2">{String(i + 1).padStart(3, "0")}</span>
                  {t.startsWith("✓") ? t : `▸ ${t}`}
                </div>
              ))}
              <div className="text-emerald-300 animate-pulse">_</div>
            </div>

            {/* Health check report */}
            <div className="border-t border-white/10 bg-black/30 px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Functional Health Check
                </div>
                {completed && (
                  <button className="text-[11px] font-semibold text-emerald-300 inline-flex items-center gap-1 hover:underline">
                    <Download className="h-3 w-3" /> Download Report
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                <Hk label="MTTR" value={fmt(elapsedMs)} />
                <Hk label="Steps Passed" value={`${stepsPassed}/10`} />
                <Hk label="Anomalies" value={String(anomalies)} />
                <Hk label="Verdict" value={completed ? "PASS" : "RUNNING"} good={completed} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hk({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg bg-white/5 px-2 py-2">
      <div className="text-[9px] uppercase tracking-wider text-white/50">{label}</div>
      <div className={`text-sm font-bold tabular-nums ${good ? "text-emerald-300" : "text-white"}`}>{value}</div>
    </div>
  );
}

function ImagePlaceholder({ n }: { n: number }) {
  return (
    <>
      <div className="text-4xl font-extrabold text-foreground/30">Step {n}</div>
      <div className="text-xs mt-2">Awaiting screenshot — drop in <code className="bg-secondary px-1 rounded">public/assurance/step-{n}.png</code></div>
    </>
  );
}