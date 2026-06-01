import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pause, Square, Play, CheckCircle2, Clock, Activity, Wifi, Cpu, Layers, Eye, ShieldCheck, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { AssuranceHeader } from "@/components/assurance/AssuranceHeader";
import { LiveAgentOverlay } from "@/components/assurance/LiveAgentOverlay";
import { executionSteps } from "@/data/assurance";
import { cn } from "@/lib/utils";

const STEP_DURATION_MS = 3500; // per step
const TICK_MS = 100;

function fmtClock(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
function fmtSec(ms: number) { return `${(ms / 1000).toFixed(2)} sec`; }

const LiveExecution = () => {
  const nav = useNavigate();
  const [stepIdx, setStepIdx] = useState(0); // 0-based current step
  const [stepElapsed, setStepElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [logs, setLogs] = useState<{ ts: string; text: string; tone?: "info" | "ok" | "muted" }[]>([]);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const startedAt = useRef(new Date());
  const execId = useMemo(() => {
    const d = startedAt.current;
    return `EXEC-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}${String(d.getSeconds()).padStart(2, "0")}`;
  }, []);

  const lastStepLogged = useRef(-1);

  // Main tick
  useEffect(() => {
    if (paused || completed) return;
    const t = setInterval(() => {
      setStepElapsed((e) => e + TICK_MS);
      setTotalElapsed((e) => e + TICK_MS);
    }, TICK_MS);
    return () => clearInterval(t);
  }, [paused, completed]);

  // Advance steps when stepElapsed exceeds duration
  useEffect(() => {
    if (completed) return;
    if (stepElapsed >= STEP_DURATION_MS) {
      // Step complete → advance
      const finishedIdx = stepIdx;
      const step = executionSteps[finishedIdx];
      const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
      setLogs((l) => [...l, { ts, text: `Step ${step.n} completed successfully`, tone: "ok" }]);
      if (finishedIdx + 1 >= executionSteps.length) {
        setCompleted(true);
      } else {
        setStepIdx(finishedIdx + 1);
        setStepElapsed(0);
      }
    }
  }, [stepElapsed, stepIdx, completed]);

  // Emit logs + thoughts when entering a step
  useEffect(() => {
    if (lastStepLogged.current === stepIdx) return;
    lastStepLogged.current = stepIdx;
    const step = executionSteps[stepIdx];
    const ts = () => new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((l) => [
      ...l,
      ...(stepIdx === 0 ? [{ ts: ts(), text: "Execution started", tone: "info" as const }] : []),
      { ts: ts(), text: `Step ${step.n}: ${step.name} started`, tone: "info" },
      { ts: ts(), text: `Navigating to ${step.url}`, tone: "muted" },
      { ts: ts(), text: "DNS resolution successful", tone: "muted" },
      { ts: ts(), text: "Connection established", tone: "muted" },
      { ts: ts(), text: "Page response received (200 OK)", tone: "muted" },
    ]);
    // Stream thoughts gradually
    step.thoughts.forEach((th, i) => {
      setTimeout(() => setThoughts((prev) => [...prev, th]), i * 700);
    });
  }, [stepIdx]);

  // Auto-redirect after completion
  useEffect(() => {
    if (!completed) return;
    const t = setTimeout(() => nav("/assurance"), 8000);
    return () => clearTimeout(t);
  }, [completed, nav]);

  const currentStep = executionSteps[stepIdx];
  const stepsPassed = completed ? executionSteps.length : stepIdx;
  const totalGoalMs = 90_000;
  const progressPct = Math.min(100, Math.round((totalElapsed / totalGoalMs) * 100));

  // Telemetry per step (deterministic-ish)
  const tel = useMemo(() => {
    const seed = stepIdx + 1;
    return {
      pageLoad: (0.8 + (seed % 4) * 0.3 + Math.random() * 0.2).toFixed(3),
      latency: 12 + ((seed * 7) % 30),
      dom: (0.6 + (seed % 3) * 0.25 + Math.random() * 0.15).toFixed(3),
      requests: 9 + ((seed * 3) % 18),
    };
  }, [stepIdx]);

  return (
    <AppShell>
      <AssuranceHeader
        title="Synthetic Transaction Live Execution"
        subtitle="Digital Coworker is executing the patient journey in real time."
        crumbs={[
          { label: "Digital Coworkers" },
          { label: "Customer Experience Assurance" },
          { label: "Workflows" },
          { label: "Epic MyChart" },
          { label: "Secure Message to Provider" },
          { label: "Live Execution", current: true },
        ]}
        actions={
          <div className="flex gap-2">
            {!completed ? (
              <span className="flex items-center gap-1.5 h-11 px-3 rounded-xl bg-status-healthy-soft text-status-healthy text-xs font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-status-healthy animate-pulse" /> LIVE
              </span>
            ) : (
              <span className="flex items-center h-11 px-3 rounded-xl bg-status-healthy-soft text-status-healthy text-xs font-bold">VERIFIED</span>
            )}
            <button onClick={() => setOverlayOpen(true)} className="h-11 px-4 rounded-xl bg-navy text-white font-semibold text-sm inline-flex items-center gap-2 hover:bg-navy/90 transition">
              <Eye className="h-4 w-4" /> Live Agent View
            </button>
            <button onClick={() => setPaused((p) => !p)} className="h-11 px-4 rounded-xl border border-border bg-card font-semibold text-sm inline-flex items-center gap-2 hover:bg-secondary transition">
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />} {paused ? "Resume" : "Pause"}
            </button>
            <button onClick={() => nav("/assurance")} className="h-11 px-4 rounded-xl border border-status-critical/30 text-status-critical font-semibold text-sm inline-flex items-center gap-2 hover:bg-status-critical-soft transition">
              <Square className="h-4 w-4 fill-status-critical" /> Stop
            </button>
          </div>
        }
      />

      <main className="flex-1 px-8 py-6 animate-fade-in space-y-5">

        {/* Status strip */}
        <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-2 md:grid-cols-7 gap-4 shadow-[var(--shadow-sm)]">
          <SS label="Workflow" value="Secure Message to Provider" />
          <SS label="Application" value="Epic MyChart" />
          <SS label="Execution ID" value={execId} mono />
          <SS label="Started" value={startedAt.current.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
          <SS label="Elapsed Time" value={fmtClock(totalElapsed)} mono />
          <SS label="Current Step" value={`${currentStep.n}. ${currentStep.name}`} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Overall Status</div>
            <div className={cn("flex items-center gap-1.5 mt-1 text-sm font-bold", completed ? "text-status-healthy" : "text-status-healthy")}>
              <span className="h-2 w-2 rounded-full bg-status-healthy" /> {completed ? "Verified" : "Healthy"}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] gap-5">
          {/* Steps sidebar */}
          <section className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)]">
            <div className="text-sm font-bold mb-1">Execution Steps</div>
            <div className="text-[11px] text-muted-foreground mb-3">Step {Math.min(stepIdx + 1, 10)} of 10 in progress</div>
            <ol className="space-y-1.5">
              {executionSteps.map((s, i) => {
                const state = i < stepIdx || completed && i <= 9 ? (i < stepIdx || completed ? "done" : "current") : i === stepIdx ? "current" : "pending";
                const isDone = completed || i < stepIdx;
                const isCurrent = !completed && i === stepIdx;
                return (
                  <li key={s.n} className={cn(
                    "flex items-center gap-3 px-2.5 py-2 rounded-lg",
                    isCurrent && "bg-accent/60 ring-1 ring-indigo/30",
                  )}>
                    <span className={cn(
                      "h-6 w-6 rounded-full grid place-items-center text-[11px] font-bold shrink-0",
                      isDone ? "bg-status-healthy text-white" : isCurrent ? "bg-indigo text-white" : "border border-border text-muted-foreground",
                    )}>
                      {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.n}
                    </span>
                    <span className={cn("flex-1 text-xs truncate", isCurrent ? "font-bold" : "font-semibold text-foreground/80")}>{s.name}</span>
                    {isCurrent && <span className="h-2 w-2 rounded-full bg-indigo animate-pulse" />}
                    {isDone && <span className="text-[10px] text-status-healthy font-semibold">Done</span>}
                    {!isDone && !isCurrent && <span className="text-[10px] text-muted-foreground">Pending</span>}
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-semibold">Total Workflow Time Goal: &lt; 90 sec</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-indigo transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="text-[11px] font-bold tabular-nums">{progressPct}%</span>
              </div>
            </div>
          </section>

          {/* Browser session */}
          <section className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)]">
            <div className="text-sm font-bold mb-3">Live Browser Session</div>
            <div className="rounded-xl border border-border overflow-hidden bg-secondary/40">
              {/* Browser chrome */}
              <div className="bg-secondary px-3 h-9 flex items-center gap-2 border-b border-border">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <div className="ml-3 flex-1 h-6 rounded-md bg-card border border-border px-3 text-[11px] flex items-center text-muted-foreground truncate">
                  {currentStep.url}
                </div>
              </div>
              {/* Screenshot slot */}
              <div className="aspect-[16/10] bg-white grid place-items-center relative">
                <img
                  key={currentStep.n}
                  src={`/assurance/step-${currentStep.n}.png`}
                  alt={`Step ${currentStep.n}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6"
                     style={{ display: undefined }}>
                  {/* Visible only when image fails — show subtle overlay */}
                </div>
              </div>
            </div>
            {/* Per-step result strip */}
            <div className="mt-4 rounded-xl border border-border p-3 grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={cn("h-5 w-5", stepElapsed > STEP_DURATION_MS * 0.5 ? "text-status-healthy" : "text-muted-foreground")} />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Step {currentStep.n}: {currentStep.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{currentStep.url}</div>
                </div>
              </div>
              <Mini label="Status" value={stepElapsed > STEP_DURATION_MS * 0.5 ? "Success" : "Running"} tone={stepElapsed > STEP_DURATION_MS * 0.5 ? "ok" : "muted"} />
              <Mini label="Response Time" value={fmtSec(STEP_DURATION_MS * 0.45)} />
              <Mini label="Start Time" value={new Date(startedAt.current.getTime() + stepIdx * STEP_DURATION_MS).toLocaleTimeString("en-US", { hour12: false })} />
              <Mini label="Duration" value={fmtSec(stepElapsed)} />
            </div>
          </section>

          {/* Telemetry */}
          <section className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold">Live Telemetry</div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-healthy-soft text-status-healthy">⬤ Streaming</span>
              </div>
              <ul className="space-y-2 text-xs">
                <Tel icon={Clock}    label="Step Duration (Current)" value={fmtClock(stepElapsed).slice(3)} />
                <Tel icon={Activity} label="Page Load Time" value={`${tel.pageLoad} sec`} good />
                <Tel icon={Wifi}     label="Network Latency" value={`${tel.latency} ms`} good />
                <Tel icon={Cpu}      label="DOM Render Time" value={`${tel.dom} sec`} good />
                <Tel icon={Layers}   label="Resource Requests" value={String(tel.requests)} />
                <Tel icon={ShieldCheck} label="Status" value="200 OK" good />
              </ul>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)]">
              <div className="text-sm font-bold mb-2">Live Screenshot <span className="text-[10px] text-muted-foreground font-normal">(Auto-capture)</span></div>
              <div className="aspect-[16/10] rounded-lg border border-border bg-white overflow-hidden grid place-items-center">
                <img src={`/assurance/step-${currentStep.n}.png`} alt="" className="max-w-full max-h-full object-contain" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)]">
              <div className="text-sm font-bold mb-2">Execution Logs <span className="text-[10px] text-muted-foreground font-normal">(Live)</span></div>
              <div className="h-44 overflow-y-auto font-mono text-[11px] space-y-1 pr-1">
                {logs.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-muted-foreground tabular-nums">{l.ts}</span>
                    <span className={cn(
                      l.tone === "ok" && "text-status-healthy font-semibold",
                      l.tone === "info" && "text-indigo",
                      (!l.tone || l.tone === "muted") && "text-foreground/80",
                    )}>{l.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Verified summary */}
        {completed && (
          <div className="rounded-xl border border-status-healthy/30 bg-status-healthy-soft p-6 flex items-center gap-5 shadow-[var(--shadow-md)]">
            <div className="h-14 w-14 rounded-xl bg-status-healthy text-white grid place-items-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-status-healthy">Transaction Verified</div>
              <p className="text-sm text-foreground/80">Synthetic patient journey completed end-to-end with zero functional regressions.</p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div><div className="text-xl font-bold tabular-nums">{fmtClock(totalElapsed)}</div><div className="text-[11px] text-muted-foreground">Total Duration / MTTR</div></div>
              <div><div className="text-xl font-bold text-status-healthy">100%</div><div className="text-[11px] text-muted-foreground">Success Rate</div></div>
              <div><div className="text-xl font-bold">0</div><div className="text-[11px] text-muted-foreground">Anomalies</div></div>
            </div>
            <button onClick={() => nav("/assurance")} className="h-10 px-4 rounded-lg bg-indigo text-white font-semibold text-sm inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Return to Dashboard
            </button>
          </div>
        )}
      </main>

      <LiveAgentOverlay
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        currentStep={Math.min(stepIdx + 1, 10)}
        thoughts={thoughts}
        elapsedMs={totalElapsed}
        completed={completed}
        stepsPassed={stepsPassed}
        anomalies={0}
      />
    </AppShell>
  );
};

function SS({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className={cn("text-sm font-bold mt-1 truncate", mono && "font-mono")}>{value}</div>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: "ok" | "muted" }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className={cn("text-sm font-bold mt-0.5", tone === "ok" && "text-status-healthy")}>{value}</div>
    </div>
  );
}

function Tel({ icon: Icon, label, value, good }: { icon: any; label: string; value: string; good?: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-foreground/80"><Icon className="h-3.5 w-3.5 text-muted-foreground" /> {label}</span>
      <span className={cn("font-bold tabular-nums", good ? "text-status-healthy" : "text-foreground")}>{value}</span>
    </li>
  );
}

export default LiveExecution;