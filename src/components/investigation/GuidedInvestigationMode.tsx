import { useGuidedInvestigation } from "@/context/GuidedInvestigationContext";
import { useScenarioState } from "@/context/ScenarioStateContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Activity, AlertOctagon, ArrowLeft, ArrowRight, Bot, CheckCircle2, ChevronRight,
  CircleDot, Compass, FileBarChart2, FileText, Gauge, Layers, MapPin, PauseCircle,
  PlayCircle, RefreshCw, Rocket, Search, ShieldCheck, Sparkles, Target, Timer, X, Zap,
} from "lucide-react";
import { TIMELINE_EVENTS } from "@/data/guidedInvestigations";
import type {
  DecisionOption, EvidenceItem, InvestigationStep, MetricSnapshot, RunbookStep,
} from "@/data/guidedInvestigations";
import { EvidenceGraphLauncher, EvidenceGraphAvailableIndicator } from "@/components/evidence/EvidenceGraphEngine";
import type { EvidenceGraphMode } from "@/data/evidenceGraphData";

/* ------------------------------ utilities ------------------------------- */

const STATUS_TONE: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  healthy:  { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  warning:  { text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-500" },
  critical: { text: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200",    dot: "bg-rose-500" },
  info:     { text: "text-sky-700",     bg: "bg-sky-50",     border: "border-sky-200",     dot: "bg-sky-500" },
};

const tone = (s?: string) => STATUS_TONE[s ?? "info"] ?? STATUS_TONE.info;

const formatElapsed = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

/* ------------------------------ launcher -------------------------------- */

export function InvestigationLauncher({ compact = false }: { compact?: boolean }) {
  const { activeScenario } = useScenarioState();
  const { status, canStart, start, exit } = useGuidedInvestigation();
  const active = status === "active" || status === "paused";

  if (active) {
    return (
      <Button size="sm" variant="outline" onClick={exit}
        className="h-8 gap-1.5 border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100">
        <X className="h-3.5 w-3.5" /> Exit Investigation
      </Button>
    );
  }

  if (!canStart) {
    return (
      <Button size="sm" variant="outline" disabled
        className="h-8 gap-1.5 border-slate-200 bg-white/80 text-slate-400">
        <Compass className="h-3.5 w-3.5" /> Start Investigation
      </Button>
    );
  }

  const label = compact
    ? "Start Investigation"
    : `Investigate ${activeScenario.name}`;

  return (
    <Button size="sm" onClick={() => start(activeScenario.id)}
      className="h-8 gap-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500 shadow-sm">
      <Compass className="h-3.5 w-3.5" /> {label}
    </Button>
  );
}

/* --------------------------- focus overlay ------------------------------- */

function InvestigationFocusOverlay() {
  // Full-frame opaque backdrop so the investigation workspace is the only
  // thing visible and readable while active.
  return (
    <div className="fixed inset-0 z-30">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50/60" />
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] [background-size:22px_22px] opacity-60" />
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400" />
    </div>
  );
}

/* ------------------------------ ribbon ---------------------------------- */

function InvestigationRibbon() {
  const { investigation, currentStep, currentStepIndex, elapsedSeconds, status, exit, pause, resume } =
    useGuidedInvestigation();
  if (!investigation || !currentStep) return null;
  const totalSteps = investigation.steps.length;

  return (
    <div className="fixed left-1/2 top-4 z-40 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-sky-200/80 bg-white/95 px-3 py-2 shadow-[0_8px_30px_-12px_rgba(56,189,248,0.35)] backdrop-blur">
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-2.5 py-1 text-white">
          <Compass className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold tracking-wide">Investigation Active</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-3">
          <span className="text-[12px] font-semibold text-slate-900">{investigation.name.replace(" Guided Investigation", "")}</span>
        </div>
        <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">{investigation.severity}</Badge>
        <span className="text-[10.5px] text-slate-500">{investigation.incidentId}</span>
        <span className="hidden md:inline text-[10.5px] text-slate-500">
          Step <span className="font-semibold text-slate-800">{currentStepIndex + 1}</span> of {totalSteps}
        </span>
        <span className="hidden md:flex items-center gap-1 text-[10.5px] text-slate-500">
          <Timer className="h-3 w-3" /> {formatElapsed(elapsedSeconds)}
        </span>
        <span className="hidden lg:flex items-center gap-1 text-[10.5px] text-slate-500">
          <Target className="h-3 w-3" /> {investigation.primaryService}
        </span>
        <span className="hidden lg:flex items-center gap-1 text-[10.5px] text-slate-500">
          <Gauge className="h-3 w-3" /> Confidence <b className="text-slate-800 ml-0.5">{investigation.confidence}%</b>
        </span>
        <div className="ml-1 flex items-center gap-1">
          {status === "active" ? (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={pause}>
              <PauseCircle className="h-4 w-4 text-slate-600" />
            </Button>
          ) : status === "paused" ? (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={resume}>
              <PlayCircle className="h-4 w-4 text-emerald-600" />
            </Button>
          ) : null}
          <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={exit}>
            <X className="h-3 w-3" /> Exit
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- progress rail ---------------------------- */

function InvestigationProgressRail() {
  const { investigation, currentStepIndex, stepStatuses, goTo } = useGuidedInvestigation();
  if (!investigation) return null;

  return (
    <div className="fixed left-4 top-32 z-40 hidden xl:block w-[238px]">
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
        <div className="flex items-center gap-2 px-1 pb-2">
          <Layers className="h-3.5 w-3.5 text-sky-600" />
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-600">
            Investigation Steps
          </span>
        </div>
        <ol className="space-y-1">
          {investigation.steps.map((step, i) => {
            const st = stepStatuses[i] ?? "not_started";
            const active = i === currentStepIndex;
            return (
              <li key={step.id}>
                <button
                  onClick={() => goTo(i)}
                  className={cn(
                    "group flex w-full items-start gap-2 rounded-lg border px-2 py-1.5 text-left transition",
                    active
                      ? "border-sky-300 bg-sky-50 shadow-sm"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                      st === "completed" && "bg-emerald-500 text-white",
                      st === "active" && "bg-sky-600 text-white",
                      st === "skipped" && "bg-slate-300 text-white",
                      st === "not_started" && "bg-slate-100 text-slate-500",
                    )}
                  >
                    {st === "completed" ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-[11.5px] font-medium leading-tight", active ? "text-slate-900" : "text-slate-700")}>
                      {step.title}
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{step.shortLabel}</div>
                  </div>
                  {active && <ChevronRight className="mt-1 h-3 w-3 text-sky-600" />}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ----------------------------- evidence cards --------------------------- */

function EvidenceCard({ item }: { item: EvidenceItem }) {
  const t = tone(item.status);
  return (
    <div className={cn("flex items-center justify-between rounded-lg border px-2.5 py-1.5", t.border, t.bg)}>
      <div className="min-w-0">
        <div className="text-[10.5px] text-slate-500">{item.label}</div>
        <div className={cn("text-[11.5px] font-semibold tabular-nums", t.text)}>
          {item.actual ?? item.value ?? "—"}
        </div>
      </div>
      {item.baseline && (
        <div className="text-right text-[10px] text-slate-400">
          baseline<br /><span className="tabular-nums text-slate-500">{item.baseline}</span>
        </div>
      )}
      {item.change && (
        <Badge className={cn("text-[10px]", t.bg, t.text, t.border)}>{item.change}</Badge>
      )}
    </div>
  );
}

function MetricSnapshotCard({ m }: { m: MetricSnapshot }) {
  const t = tone(m.status);
  return (
    <div className={cn("rounded-lg border px-2.5 py-1.5", t.border, "bg-white")}>
      <div className="flex items-center justify-between">
        <div className="text-[10.5px] text-slate-500">{m.metric}</div>
        <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      </div>
      <div className="mt-0.5 flex items-baseline gap-2">
        <span className={cn("text-[14px] font-semibold tabular-nums", t.text)}>{m.actual}</span>
        {m.baseline && <span className="text-[10px] text-slate-400">vs {m.baseline}</span>}
        {m.target && <span className="text-[10px] text-slate-400">target {m.target}</span>}
      </div>
    </div>
  );
}

function DecisionPanel({ options }: { options: DecisionOption[] }) {
  return (
    <div className="space-y-2">
      {options.map(o => {
        const t = o.recommended ? STATUS_TONE.info : STATUS_TONE.healthy;
        return (
          <div
            key={o.id}
            className={cn(
              "rounded-xl border bg-white p-2.5",
              o.recommended ? "border-sky-300 ring-1 ring-sky-200" : "border-slate-200",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-slate-900">{o.title}</span>
                  {o.recommended && (
                    <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-[9.5px]">Recommended</Badge>
                  )}
                </div>
                <div className="mt-0.5 text-[10.5px] text-slate-500">
                  Confidence <b className="text-slate-800">{o.confidence}%</b> · Risk <b className="text-slate-800">{o.risk}</b> · Recovery <b className="text-slate-800">{o.expectedRecovery}</b>
                </div>
              </div>
              <Button size="sm" variant={o.recommended ? "default" : "outline"} className="h-7 text-[11px]">
                {o.recommended ? "Recommend" : "Compare"}
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px]">
              <div className="rounded bg-slate-50 px-2 py-1">P95 after: <b className="text-slate-800">{o.expectedP95After}</b></div>
              <div className="rounded bg-slate-50 px-2 py-1">Errors after: <b className="text-slate-800">{o.expectedErrorAfter}</b></div>
              <div className="rounded bg-slate-50 px-2 py-1">Cost: <span className="text-slate-700">{o.costImpact}</span></div>
              <div className="rounded bg-slate-50 px-2 py-1">Approval: <b className="text-slate-800">{o.humanApprovalRequired ? "Required" : "Auto"}</b></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RunbookPanel({ runbook }: { runbook: NonNullable<InvestigationStep["runbook"]> }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[12px] font-semibold text-slate-900">{runbook.name}</div>
          <div className="text-[10.5px] text-slate-500">{runbook.changeId} · {runbook.status}</div>
        </div>
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Approval gate</Badge>
      </div>
      <ol className="mt-2 space-y-1">
        {runbook.steps.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-[11px]">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                s.status === "complete" && "bg-emerald-500",
                s.status === "waiting" && "bg-amber-500 animate-pulse",
                s.status === "pending" && "bg-slate-300",
              )}
            />
            <span className={cn(s.status === "complete" ? "text-slate-500 line-through" : "text-slate-700")}>
              {s.label}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-2 text-[10.5px] text-slate-500">
        Approvers: <span className="text-slate-700">{runbook.approvers.join(", ")}</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        <Button size="sm" className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-500">Approve Remediation</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]">Request Approval</Button>
      </div>
    </div>
  );
}

function ReportsPanel({ reports }: { reports: string[] }) {
  return (
    <div className="grid grid-cols-1 gap-1.5">
      {reports.map(r => (
        <button
          key={r}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
        >
          <span className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-sky-600" /> {r}
          </span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------- step panel ----------------------------- */

function InvestigationStepPanel() {
  const {
    investigation, currentStep, currentStepIndex,
    next, prev, skip, complete,
  } = useGuidedInvestigation();
  if (!investigation || !currentStep) return null;

  const isLast = currentStepIndex === investigation.steps.length - 1;
  const primaryAction = () => (isLast ? complete() : next());

  return (
    <div className="fixed right-4 top-32 z-40 w-[380px] max-h-[calc(100vh-160px)]">
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white/97 shadow-2xl backdrop-blur overflow-hidden">
        {/* header */}
        <div className="border-b border-slate-100 bg-gradient-to-br from-sky-50/80 to-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-sky-100 text-sky-700 border-sky-200 text-[10px]">
              Step {currentStep.stepNumber} of {investigation.steps.length}
            </Badge>
            <Badge className="bg-white text-slate-600 border-slate-200 text-[10px]">
              {currentStep.shortLabel}
            </Badge>
          </div>
          <h3 className="mt-1.5 text-[14.5px] font-semibold text-slate-900">{currentStep.title}</h3>
          <p className="mt-0.5 text-[11.5px] text-slate-500">
            <Search className="inline h-3 w-3 mr-1 text-sky-500" />
            {currentStep.sreQuestion}
          </p>
        </div>

        {/* body (scrollable) */}
        <div className="overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: "calc(100vh - 320px)" }}>
          <div className="text-[11.5px] leading-relaxed text-slate-700">{currentStep.narrative}</div>

          {/* NOVA */}
          <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-2.5">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-violet-700">
              <Bot className="h-3.5 w-3.5" /> NOVA · Investigation Context
            </div>
            <p className="mt-1 text-[11.5px] leading-relaxed text-slate-700">{currentStep.novaSummary}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {["Explain Evidence", "Show Blast Radius", "Compare Options", "Generate Update", "Generate RCA"].map(b => (
                <button key={b} className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[10px] text-violet-700 hover:bg-violet-100">
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Metric snapshots */}
          {currentStep.metricSnapshots.length > 0 && (
            <div>
              <SectionLabel icon={<Gauge className="h-3 w-3" />}>Metric snapshot</SectionLabel>
              <div className="grid grid-cols-2 gap-1.5">
                {currentStep.metricSnapshots.map((m, i) => <MetricSnapshotCard key={i} m={m} />)}
              </div>
            </div>
          )}

          {/* Evidence */}
          {currentStep.evidenceItems.length > 0 && (
            <div>
              <SectionLabel icon={<ShieldCheck className="h-3 w-3" />}>Evidence</SectionLabel>
              <div className="space-y-1">
                {currentStep.evidenceItems.map((e, i) => <EvidenceCard key={i} item={e} />)}
              </div>
            </div>
          )}

          {/* Decision */}
          {currentStep.decisionOptions && (
            <div>
              <SectionLabel icon={<Sparkles className="h-3 w-3" />}>Remediation options</SectionLabel>
              <DecisionPanel options={currentStep.decisionOptions} />
            </div>
          )}

          {/* Runbook */}
          {currentStep.runbook && (
            <div>
              <SectionLabel icon={<Rocket className="h-3 w-3" />}>Runbook & Emergency Change</SectionLabel>
              <RunbookPanel runbook={currentStep.runbook} />
            </div>
          )}

          {/* Reports */}
          {currentStep.reports && (
            <div>
              <SectionLabel icon={<FileBarChart2 className="h-3 w-3" />}>Communication & RCA</SectionLabel>
              <ReportsPanel reports={currentStep.reports} />
            </div>
          )}

          {/* Talking point */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
            <div className="text-[9.5px] uppercase tracking-wider text-slate-500">SRE talking point</div>
            <div className="mt-0.5 text-[11.5px] italic text-slate-700">"{currentStep.talkingPoint}"</div>
          </div>

          <div className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2">
            <div className="text-[9.5px] uppercase tracking-wider text-sky-700">Expected insight</div>
            <div className="mt-0.5 text-[11.5px] text-slate-700">{currentStep.expectedInsight}</div>
            <div className="mt-1 text-[10.5px] text-slate-500">
              <span className="font-semibold text-slate-700">Next:</span> {currentStep.suggestedAction}
          </div>

          {[5,6,7,8].includes(currentStep.stepNumber) && (
            <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50/70 to-white px-2.5 py-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[9.5px] uppercase tracking-wider text-violet-700">Evidence Graph available</div>
                  <div className="text-[11.5px] text-slate-700">Confidence 87% · 9 evidence items · 4 alternatives</div>
                </div>
                <EvidenceGraphAvailableIndicator />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <EvidenceGraphLauncher
                  variant="compact"
                  label={
                    currentStep.stepNumber === 5 ? "Open Timeline Correlation" :
                    currentStep.stepNumber === 6 ? "Open Causal Chain" :
                    currentStep.stepNumber === 7 ? "Open Blast Radius" :
                                                   "Open Recommendation Evidence"
                  }
                  mode={
                    (currentStep.stepNumber === 5 ? "timeline" :
                     currentStep.stepNumber === 6 ? "causal"  :
                     currentStep.stepNumber === 7 ? "blast"   :
                                                    "recommendation") as EvidenceGraphMode
                  }
                />
                <EvidenceGraphLauncher variant="pill" label="Compare Hypotheses" mode="hypotheses" />
              </div>
            </div>
          )}
        </div>
        </div>

        {/* footer actions */}
        <div className="border-t border-slate-100 bg-white px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-8 gap-1 text-[11px]" onClick={prev} disabled={currentStepIndex === 0}>
              <ArrowLeft className="h-3 w-3" /> Prev
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1 text-[11px] text-slate-500" onClick={skip} disabled={isLast}>
              Skip
            </Button>
            <Button size="sm" onClick={primaryAction}
              className={cn(
                "ml-auto h-8 gap-1 text-[11.5px] shadow-sm",
                isLast
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500",
              )}
            >
              {isLast ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
              {currentStep.primaryButtonLabel}
              {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      {icon}
      {children}
    </div>
  );
}

/* --------------------------- timeline strip ----------------------------- */

function InvestigationTimelineStrip() {
  const { investigation, currentStep, currentStepIndex, goTo } = useGuidedInvestigation();
  if (!investigation || !currentStep) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 xl:left-[260px] xl:right-[400px]">
      <div className="rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-xl backdrop-blur">
        <div className="flex items-center gap-2 pb-1">
          <CircleDot className="h-3 w-3 text-sky-600" />
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-600">
            Operational timeline
          </span>
          <span className="text-[10.5px] text-slate-400">· synced to Step {currentStepIndex + 1}</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {TIMELINE_EVENTS.map(ev => {
            const isActive = ev.id === currentStep.timelineEventId;
            const t = tone(ev.tone);
            // Find a step that targets this event so click can jump
            const targetStep = investigation.steps.findIndex(s => s.timelineEventId === ev.id);
            return (
              <button
                key={ev.id}
                onClick={() => targetStep >= 0 && goTo(targetStep)}
                className={cn(
                  "group flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[10.5px] transition",
                  isActive
                    ? "border-sky-400 bg-sky-50 text-sky-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
                <span className="font-mono tabular-nums">{ev.time}</span>
                <span className="max-w-[180px] truncate">{ev.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- completion panel -------------------------- */

function InvestigationCompletionPanel() {
  const { investigation, exit, restart, elapsedSeconds } = useGuidedInvestigation();
  if (!investigation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
      <div className="w-[640px] rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-2 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-slate-900">Investigation Complete</h2>
            <p className="text-[12px] text-slate-500">
              Payment Latency Incident investigation completed in {formatElapsed(elapsedSeconds)}.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11.5px]">
          <SummaryRow label="Probable root cause" value="Payment Service v2.14.7 → Aurora connection pool saturation" />
          <SummaryRow label="Confidence" value={`${investigation.confidence}%`} />
          <SummaryRow label="Recommended remediation" value="Rollback deployment v2.14.7" />
          <SummaryRow label="Human approval" value="Required" />
          <SummaryRow label="Estimated recovery" value="15 min after approval" />
          <SummaryRow label="Impacted services" value="Payment, Order, Notification" />
          <SummaryRow label="Evidence reviewed" value="9 items" />
          <SummaryRow label="Timeline events" value="10 events" />
        </div>

        <div className="mt-4">
          <div className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-1">Reports available</div>
          <div className="flex flex-wrap gap-1.5">
            {["Executive Summary", "RCA Draft", "SRE Report", "Evidence Package"].map(r => (
              <Badge key={r} className="bg-sky-50 text-sky-700 border-sky-200 text-[10.5px]">{r}</Badge>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white">Approve Remediation</Button>
          <Button size="sm" variant="outline" className="h-8">Generate RCA</Button>
          <Button size="sm" variant="outline" className="h-8">Generate Executive Summary</Button>
          <Button size="sm" variant="outline" className="h-8">Export Evidence Package</Button>
          <Button size="sm" variant="ghost" className="h-8 ml-auto" onClick={restart}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Restart
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={exit}>Return to Digital Twin</Button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-[12px] font-medium text-slate-800">{value}</div>
    </div>
  );
}

/* ------------------------ idle / empty state ---------------------------- */

export function InvestigationEmptyHint() {
  const { activeScenario } = useScenarioState();
  const { status, canStart } = useGuidedInvestigation();
  if (status !== "idle") return null;
  if (canStart) return null;
  // Normal Operations or unsupported scenario
  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/60 px-3 py-2 text-[11.5px] text-slate-700">
      <div className="flex items-center gap-1.5 font-semibold text-sky-700">
        <Compass className="h-3.5 w-3.5" /> Guided Investigation
      </div>
      <p className="mt-0.5 text-slate-600">
        No active incident is available for guided investigation in scenario{" "}
        <b>{activeScenario.name}</b>. Select <b>Payment Latency Incident</b> to start a guided SRE investigation.
      </p>
    </div>
  );
}

/* ------------------------------- root umbrella -------------------------- */

export function GuidedInvestigationMode() {
  const { status } = useGuidedInvestigation();
  if (status === "idle") return null;

  return (
    <>
      <InvestigationFocusOverlay />
      <InvestigationRibbon />
      <InvestigationProgressRail />
      <InvestigationStepPanel />
      <InvestigationTimelineStrip />
      {status === "completed" && <InvestigationCompletionPanel />}
    </>
  );
}
