import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, Check, ChevronDown, ChevronRight, CircleDot, Copy, Download, FileText,
  OctagonX, Pause, Play, ShieldCheck, Database, Cloud, MonitorCog, Activity, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, Pill, KeyValue, ReviewDrawer, ReviewModal, type Tone } from "./review/parts";
import {
  AGENTS, AWS_API_CALL, EXEC_PACKAGE, PREFLIGHT_CHECKS, SCENARIOS, STEPS, STORY_STEPS,
  TERRAFORM_DIFF, VOLUME,
} from "./execution/data";
import {
  fmtDuration, useExecutionEngine, type ExecutionScenario, type StepStatus,
} from "./execution/engine";

const STEP_TONE: Record<StepStatus, Tone> = {
  waiting: "neutral", running: "info", passed: "ok", warning: "warn", failed: "bad", blocked: "warn",
};

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100">
      {children}
    </pre>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: Tone }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 py-1.5 last:border-0">
      <span className="text-[11.5px] text-slate-600">{label}</span>
      <span className="ml-auto text-[11.5px] font-medium text-slate-800">{value}</span>
      {tone && <Pill tone={tone}>{tone === "ok" ? "PASS" : tone === "warn" ? "WAITING" : "FAIL"}</Pill>}
    </div>
  );
}

export default function ExecutionCenter() {
  const { packageId } = useParams();
  const pkgId = packageId ?? EXEC_PACKAGE.packageId;
  const navigate = useNavigate();
  const e = useExecutionEngine();

  const [startModal, setStartModal] = useState(false);
  const [startAck, setStartAck] = useState(false);
  const [haltModal, setHaltModal] = useState(false);
  const [haltAck, setHaltAck] = useState(false);
  const [haltReasonText, setHaltReasonText] = useState("");
  const [drawer, setDrawer] = useState<null | { title: string; subtitle?: string; body: React.ReactNode }>(null);
  const [tab, setTab] = useState("overview");
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [story, setStory] = useState<number | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({ safety: false, recon: false, agents: false, immutable: false });

  const streamRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (autoScroll && streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [e.events, autoScroll]);

  const running = e.status === "running" || e.status === "pause_requested";
  const started = e.status !== "ready";
  const def = STEPS[e.currentStep - 1];
  const stepState = e.steps[e.currentStep - 1];

  const statusLabel =
    e.status === "ready" ? "READY TO EXECUTE"
      : e.status === "running" ? "IN PROGRESS"
      : e.status === "pause_requested" ? "PAUSE REQUESTED"
      : e.status === "paused" ? "EXECUTION PAUSED"
      : e.status === "halted" ? "HALTED"
      : e.status === "failed" ? "HALTED — GATE FAILED"
      : "EXECUTION COMPLETE";

  const statusTone: Tone =
    e.status === "ready" ? "neutral"
      : e.status === "execution_complete" ? "ok"
      : e.status === "halted" || e.status === "failed" ? "bad"
      : e.status === "paused" || e.status === "pause_requested" ? "warn"
      : "info";

  const guardrails = useMemo(() => {
    const bad = e.status === "failed" || e.status === "halted";
    const appFail = bad && e.scenario === "application_validation_failure";
    return [
      { k: "OrdersDB State", v: "ONLINE", tone: "ok" as Tone },
      { k: "SQL Write Test", v: e.currentStep >= 6 ? "PASS" : "Pending", tone: (e.currentStep >= 6 ? "ok" : "neutral") as Tone },
      { k: "SQL Read Test", v: e.currentStep >= 6 ? "PASS" : "Pending", tone: (e.currentStep >= 6 ? "ok" : "neutral") as Tone },
      { k: "EC2 Instance Health", v: "Healthy", tone: "ok" as Tone },
      { k: "Windows System Health", v: e.scenario === "windows_extension_failure" && bad ? "Degraded" : "Healthy", tone: (e.scenario === "windows_extension_failure" && bad ? "warn" : "ok") as Tone },
      { k: "Order Processing Health", v: appFail ? "Degraded" : "Healthy", tone: (appFail ? "bad" : "ok") as Tone },
      { k: "Application Error Rate", v: appFail ? "4.80%" : "0.12%", tone: (appFail ? "bad" : "ok") as Tone },
      { k: "Application Latency", v: appFail ? "1,240 ms" : "235 ms", tone: (appFail ? "warn" : "ok") as Tone },
      { k: "Data Loss Signal", v: "None Detected", tone: "ok" as Tone },
      { k: "Critical Alerts", v: appFail ? "1" : "0", tone: (appFail ? "bad" : "ok") as Tone },
      { k: "SQL Blocking", v: "Normal", tone: "ok" as Tone },
      { k: "EBS Attachment", v: "Healthy", tone: "ok" as Tone },
      { k: "Backup State", v: e.currentStep >= 3 ? "Current" : "Pending", tone: (e.currentStep >= 3 ? "ok" : "neutral") as Tone },
    ];
  }, [e.currentStep, e.scenario, e.status]);

  const controlPlanes = [
    {
      icon: Database, name: "SQL Server", target: "SQL-PROD-07 / OrdersDB", tech: "T-SQL",
      state: e.currentStep <= 3 && running ? "Executing" : "Connected",
      extra: [["Last Action", e.currentStep >= 3 ? "Validate log reuse" : "Transaction-log backup"], ["Health", "Healthy"]],
      tone: "ok" as Tone,
    },
    {
      icon: Cloud, name: "AWS", target: `${EXEC_PACKAGE.region} · ${VOLUME.id}`, tech: "Terraform / EC2 API",
      state: e.currentStep === 4 && running ? "Executing" : e.currentStep > 4 ? "Completed" : "Standby",
      extra: [["Operation", "ModifyVolume"], ["Health", "Healthy"]],
      tone: (e.currentStep === 4 ? "info" : "ok") as Tone,
    },
    {
      icon: MonitorCog, name: "Windows Server", target: "SQL-PROD-07", tech: "PowerShell",
      state: e.currentStep === 5 && running ? "Executing" : e.currentStep > 5 ? "Completed" : "Standby",
      extra: [["Next Action", "Rescan and extend L:"], ["Reason", e.currentStep < 5 ? "Waiting for EBS gate" : "—"]],
      tone: (e.currentStep === 5 ? "info" : "neutral") as Tone,
    },
    {
      icon: Activity, name: "Application Monitoring", target: EXEC_PACKAGE.businessService, tech: "Synthetic Monitoring",
      state: "Active",
      extra: [["Last Check", e.events.length ? e.events[e.events.length - 1].t : "—"], ["Health", "Healthy"]],
      tone: "ok" as Tone,
    },
  ];

  const gateRows = STEPS.map((s, i) => ({
    step: s.short,
    gate: s.gate,
    evidence: s.requiredEvidence,
    state: e.steps[i].gateStatus === "passed" ? "PASSED"
      : e.steps[i].gateStatus === "failed" ? "FAILED"
      : e.steps[i].status === "running" ? "RUNNING" : "WAITING",
  }));

  const reconciliation = [
    { k: "AWS EBS", before: "500 GB", desired: "750 GB", observed: e.currentStep > 4 ? "750 GB" : e.currentStep === 4 ? "750 GB / optimizing" : "500 GB" },
    { k: "Windows L:", before: "500 GB", desired: "750 GB", observed: e.currentStep > 5 && e.scenario !== "windows_extension_failure" ? "750 GB" : "500 GB" },
    { k: "SQL Log Reuse", before: "LOG_BACKUP", desired: "Available", observed: e.currentStep > 3 ? "Available" : "LOG_BACKUP" },
    { k: "OrdersDB", before: "ONLINE", desired: "ONLINE", observed: "ONLINE" },
    { k: "Order Processing", before: "Healthy", desired: "Healthy", observed: e.status === "failed" && e.scenario === "application_validation_failure" ? "Degraded" : "Healthy" },
  ];

  const filteredEvents = filter === "ALL" ? e.events : e.events.filter((ev) => ev.severity === filter);

  const evidenceDrawer = (
    <div className="space-y-3">
      {[
        ["Authorization", "Verified"],
        ["Package Integrity", `Signature ${EXEC_PACKAGE.signature} · v${EXEC_PACKAGE.packageVersion} immutable`],
        ["Preflight", e.steps[0].gateStatus === "passed" ? "14/14 Passed" : "Pending"],
        ["SQL Evidence", e.steps[1].gateStatus === "passed" ? "Backup completed, checksum passed" : "Pending"],
        ["Log Reuse", e.steps[2].gateStatus === "passed" ? "LOG_BACKUP cleared" : e.steps[2].gateStatus === "failed" ? "LOG_BACKUP persists" : "Pending"],
        ["AWS Evidence", e.steps[3].gateStatus === "passed" ? "ModifyVolume accepted, 750 GB available" : "Pending"],
        ["Windows Evidence", e.steps[4].gateStatus === "passed" ? "L: extended to 750 GB" : e.steps[4].gateStatus === "failed" ? "Extension failed — EBS retained" : "Pending"],
        ["Application Evidence", e.steps[6].gateStatus === "passed" ? "Synthetic order passed" : e.steps[6].gateStatus === "failed" ? "Synthetic order failed" : "Pending"],
        ["Gate Decisions", `${e.steps.filter((s) => s.gateStatus === "passed").length} / 8 passed`],
        ["Runtime Safety", `Decision ${e.safetyState} · Runtime-Execution-Safety-v2.1`],
        ["Policy Decisions", "Production-Change-Policy-v3.2 — compliant"],
        ["Evidence Manifest", e.status === "execution_complete" ? "evidence-manifest.json generated" : "In Progress"],
      ].map(([k, v]) => (
        <div key={k} className="rounded-md border border-[#E2E8F0] p-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">{k}</div>
          <div className="mt-1 text-[12px] text-slate-800">{v}</div>
        </div>
      ))}
      <div>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Activity Log</div>
        <Code>{e.events.map((ev) => `${ev.t}  [${ev.severity}] ${ev.message}`).join("\n") || "No events yet."}</Code>
      </div>
    </div>
  );

  return (
    <div className="min-w-0 px-4 py-4">
      {/* Breadcrumb */}
      <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-[11.5px] text-slate-500">
        {["Assets", "SQL Servers", "SQL-PROD-07", "Remediation Intelligence", "Change Engineering", "Change Review & Approval"].map((c) => (
          <span key={c} className="flex items-center gap-1.5">
            <span className="hover:text-slate-700">{c}</span>
            <ChevronRight className="h-3 w-3 text-slate-300" />
          </span>
        ))}
        <span className="font-medium text-slate-700">Execution Center</span>
      </nav>

      {/* Header */}
      <header className="flex flex-wrap items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Execution Center</h1>
            <Pill tone={statusTone}>{statusLabel}</Pill>
          </div>
          <p className="mt-0.5 text-[12.5px] text-slate-600">Governed Change Orchestration</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDrawer({ title: `Change Package ${pkgId}`, subtitle: "Immutable approved package", body: (
              <div className="space-y-2">
                <KeyValue label="Package" value={pkgId} mono />
                <KeyValue label="Version" value={EXEC_PACKAGE.packageVersion} />
                <KeyValue label="State" value={EXEC_PACKAGE.state} />
                <KeyValue label="Authorization" value={EXEC_PACKAGE.authorization} mono />
                <KeyValue label="Artifacts" value={`${EXEC_PACKAGE.artifacts} engineered artifacts`} />
                <KeyValue label="Checksum" value={EXEC_PACKAGE.checksum} mono />
                <KeyValue label="Approved By" value={EXEC_PACKAGE.approvedBy} />
                <Code>{TERRAFORM_DIFF}</Code>
              </div>
            ) })}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileText className="h-3.5 w-3.5" /> View Change Package
          </button>
          <button
            onClick={() => setDrawer({ title: "Execution Evidence", subtitle: `${pkgId} · accumulating`, body: evidenceDrawer })}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Execution Evidence
          </button>
          {started && (
            <button
              onClick={e.requestPause}
              disabled={!running}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <Pause className="h-3.5 w-3.5" /> Pause After Current Step
            </button>
          )}
          <button
            onClick={() => setHaltModal(true)}
            disabled={!started || e.status === "halted" || e.status === "execution_complete"}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-rose-300 bg-white px-2.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
          >
            <OctagonX className="h-3.5 w-3.5" /> Emergency Halt
          </button>
        </div>
      </header>

      {/* Header metrics */}
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 md:grid-cols-4 xl:grid-cols-7">
        <KeyValue label="Change Package" value={<span className="font-mono">{pkgId}</span>} />
        <KeyValue label="Version" value={`${EXEC_PACKAGE.packageVersion} · Immutable`} />
        <KeyValue label="Authorization" value={<span className="font-mono">{EXEC_PACKAGE.authorization}</span>} />
        <KeyValue label="Status" value={statusLabel} />
        <KeyValue label="Started" value={started ? e.startedAtLabel : "—"} />
        <KeyValue label="Elapsed" value={fmtDuration(e.simTime)} />
        <KeyValue label="Estimated Remaining" value={started ? fmtDuration(e.remainingSeconds) : "—"} />
      </div>

      {/* Pre-execution */}
      {!started && (
        <section className="mt-3 rounded-lg border border-[#E2E8F0] bg-white p-4">
          <h2 className="text-[13.5px] font-semibold text-slate-900">Pre-Execution Summary</h2>
          <p className="mt-1 text-[12px] text-slate-600">
            Approved package {pkgId} v{EXEC_PACKAGE.packageVersion} is immutable and authorized. Execution has not started.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4">
            <KeyValue label="Target" value={EXEC_PACKAGE.target} />
            <KeyValue label="Environment" value={EXEC_PACKAGE.environment} />
            <KeyValue label="Business Service" value={`${EXEC_PACKAGE.businessService} · ${EXEC_PACKAGE.criticality}`} />
            <KeyValue label="Provider" value={`${EXEC_PACKAGE.provider} · ${EXEC_PACKAGE.region}`} />
            <KeyValue label="Expected Downtime" value={EXEC_PACKAGE.expectedDowntime} />
            <KeyValue label="Execution Steps" value="8" />
            <KeyValue label="Validation Tests" value={String(EXEC_PACKAGE.validationTests)} />
            <KeyValue label="Approval State" value={`${EXEC_PACKAGE.approvalState} · signature ${EXEC_PACKAGE.signature}`} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setStartAck(false); setStartModal(true); }}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#1B4F91] px-3.5 text-[12.5px] font-semibold text-white hover:bg-[#173f75]"
            >
              <Play className="h-4 w-4" /> Start Approved Execution
            </button>
            <button
              onClick={() => setDrawer({ title: "Execution Authorization", body: (
                <div className="space-y-2">
                  <KeyValue label="Authorization" value={EXEC_PACKAGE.authorization} mono />
                  <KeyValue label="Issued For" value={`${pkgId} v${EXEC_PACKAGE.packageVersion}`} />
                  <KeyValue label="Approved By" value={EXEC_PACKAGE.approvedBy} />
                  <KeyValue label="Scope" value="Execute approved actions only. No deviation permitted." />
                </div>
              ) })}
              className="h-9 rounded-md border border-[#E2E8F0] bg-white px-3 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
            >
              View Authorization
            </button>
            <Link
              to={`/approvals/${pkgId}`}
              className="inline-flex h-9 items-center rounded-md border border-[#E2E8F0] bg-white px-3 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
            >
              Return to Approval
            </Link>
          </div>
        </section>
      )}

      {/* Pipeline */}
      <section className="mt-3 overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white px-3 py-3">
        <div className="flex min-w-[900px] items-stretch gap-1">
          {STEPS.map((s, i) => {
            const st = e.steps[i];
            const active = st.status === "running";
            return (
              <div key={s.id} className="flex flex-1 items-center gap-1">
                <button
                  onClick={() => setDrawer({ title: `Step ${s.id} — ${s.name}`, subtitle: s.technology, body: (
                    <div className="space-y-2">
                      <KeyValue label="Control Plane" value={s.technology} />
                      <KeyValue label="Gate" value={s.gate} />
                      <KeyValue label="Required Evidence" value={s.requiredEvidence} />
                      <KeyValue label="If Failed" value={s.failureBehavior} />
                      <KeyValue label="Recovery" value={s.recovery} />
                      <KeyValue label="Status" value={st.status} />
                    </div>
                  ) })}
                  className={cn(
                    "flex flex-1 items-start gap-2 rounded-md border px-2 py-1.5 text-left transition-colors",
                    active ? "border-[#1B4F91]/40 bg-[#EFF4FB]"
                      : st.status === "passed" ? "border-emerald-200 bg-emerald-50/60"
                      : st.status === "failed" ? "border-rose-300 bg-rose-50"
                      : st.status === "blocked" ? "border-amber-300 bg-amber-50"
                      : "border-[#E2E8F0] bg-white hover:bg-slate-50",
                  )}
                >
                  <span className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10.5px] font-semibold",
                    st.status === "passed" ? "bg-emerald-600 text-white"
                      : active ? "bg-[#1B4F91] text-white"
                      : st.status === "failed" ? "bg-rose-600 text-white"
                      : "bg-slate-200 text-slate-600",
                  )}>
                    {st.status === "passed" ? <Check className="h-3 w-3" /> : s.id}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11.5px] font-semibold text-slate-800">{s.short}</span>
                    <span className="block truncate text-[10.5px] text-slate-500">{s.caption}</span>
                  </span>
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
              </div>
            );
          })}
        </div>
      </section>

      {/* Alerts */}
      {e.warning && running && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">WARNING — expected transition window exceeded</div>
            <div>SQL healthy · Application healthy · Capacity protected, change in progress. Continue monitoring.</div>
            <div className="mt-1.5 flex gap-2">
              <button className="h-7 rounded-md border border-amber-300 bg-white px-2 text-[11.5px] font-medium">Continue Waiting</button>
              <button onClick={e.requestPause} className="h-7 rounded-md border border-amber-300 bg-white px-2 text-[11.5px] font-medium">Pause After Current Step</button>
              <button className="h-7 rounded-md border border-amber-300 bg-white px-2 text-[11.5px] font-medium">Escalate</button>
            </div>
          </div>
        </div>
      )}

      {e.status === "failed" && (
        <div className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2.5 text-[12px] text-rose-800">
          <div className="text-[13px] font-semibold">
            {e.scenario === "application_validation_failure"
              ? "INFRASTRUCTURE CHANGE SUCCEEDED — BUSINESS SERVICE VALIDATION FAILED"
              : `${def?.name} gate FAILED — execution halted`}
          </div>
          <div className="mt-1">
            {e.scenario === "sql_backup_failure" && "Backup destination temporarily unavailable. No infrastructure mutation was attempted. Recommended: investigate backup pipeline; capacity emergency procedure may be considered separately."}
            {e.scenario === "log_backup_persists" && "SQL stabilization not confirmed. Execution halted before infrastructure mutation. Recommended: investigate backup-chain state and SQL backup metadata."}
            {e.scenario === "windows_extension_failure" && "AWS EBS 750 GB PASS · Windows L: 500 GB FAIL. EBS expansion retained — no shrink attempted. Recommended: retry storage discovery, inspect partition state, escalate to Windows engineering."}
            {e.scenario === "application_validation_failure" && "CHANGE NOT COMPLETE. Preserve current infrastructure state, capture diagnostics, compare baseline telemetry, notify application owner, initiate incident workflow if required. EBS expansion is not automatically rolled back."}
          </div>
        </div>
      )}

      {(e.status === "paused" || e.status === "halted") && (
        <div className={cn("mt-3 rounded-md border px-3 py-2.5 text-[12px]",
          e.status === "paused" ? "border-amber-300 bg-amber-50 text-amber-800" : "border-rose-300 bg-rose-50 text-rose-800")}>
          <div className="text-[13px] font-semibold">{e.status === "paused" ? "EXECUTION PAUSED" : "EXECUTION HALTED"}</div>
          <div className="mt-1">
            {e.status === "paused"
              ? "Reason: Operator requested pause after current step. No further stage has begun."
              : `Reason: ${e.haltReason}. Additional stages are prevented from beginning. Any already-submitted external control-plane transaction (e.g. AWS ModifyVolume) may not be reversible — verify final state before remediating.`}
          </div>
          <div className="mt-2 flex gap-2">
            {e.status === "paused" && (
              <button onClick={e.resume} className="h-7 rounded-md bg-[#1B4F91] px-2.5 text-[11.5px] font-semibold text-white">Resume Execution</button>
            )}
            <button onClick={() => setDrawer({ title: "Execution Evidence", body: evidenceDrawer })} className="h-7 rounded-md border border-current/30 bg-white px-2.5 text-[11.5px] font-medium">View Evidence</button>
          </div>
        </div>
      )}

      {e.status === "execution_complete" && (
        <div className="mt-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2.5">
          <div className="text-[13px] font-semibold text-emerald-800">EXECUTION COMPLETE</div>
          <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-1 text-[11.5px] text-emerald-900 md:grid-cols-4">
            {[["Steps", "8 / 8"], ["Execution Gates", "8 / 8 Passed"], ["Runtime Safety Violations", "0"], ["Infrastructure Mutations", "2 Completed"],
              ["SQL Actions", "Completed"], ["Validation", "Preliminary Passed"], ["Evidence", "Captured"], ["OrdersDB", "ONLINE"],
              ["AWS EBS", "750 GB"], ["Windows L:", "750 GB"], ["Order Processing", "Healthy"], ["Observed Interruption", "None Detected"]].map(([k, v]) => (
              <span key={k}><span className="text-emerald-700">{k}: </span><span className="font-medium">{v}</span></span>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-emerald-900">Execution completed successfully. Final outcome verification is required.</p>
          <button
            onClick={() => navigate(`/validation/${pkgId}`)}
            className="mt-2 inline-flex h-8 items-center rounded-md bg-emerald-700 px-3 text-[12px] font-semibold text-white hover:bg-emerald-800"
          >
            Proceed to Validation &amp; Evidence
          </button>
        </div>
      )}

      {/* Main grid */}
      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        {/* Current Step */}
        <div className="space-y-3 xl:col-span-4">
          <Panel title="Current Step" actions={<span className="text-[11px] text-slate-500">STEP {e.currentStep} OF 8</span>}>
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-semibold text-slate-900">{def?.name}</h3>
              <Pill tone={STEP_TONE[stepState?.status ?? "waiting"]}>{(stepState?.status ?? "waiting").toUpperCase()}</Pill>
            </div>
            <p className="mt-1 text-[12px] text-slate-600">
              {e.currentStep === 4 ? "Modify EBS volume from 500 GB to 750 GB." : def?.gate}
            </p>

            <div className="mt-2 flex flex-wrap gap-1 border-b border-[#E2E8F0] pb-1.5">
              {["overview", "artifact", "api", "telemetry", "evidence", "gate", "recovery"].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn("rounded-md px-2 py-1 text-[11.5px] capitalize",
                    tab === t ? "bg-[#EFF4FB] font-medium text-[#1B4F91]" : "text-slate-600 hover:bg-slate-50")}>
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-2 space-y-1.5">
              {tab === "overview" && (
                <>
                  <KeyValue label="Target Volume" value={<span className="font-mono">{VOLUME.id}</span>} />
                  <KeyValue label="Current → Desired" value={`${VOLUME.before} → ${VOLUME.desired}`} />
                  <KeyValue label="Volume Type" value={VOLUME.type} />
                  <KeyValue label="IOPS / Throughput" value={`${VOLUME.iops} / ${VOLUME.throughput}`} />
                  <KeyValue label="Attachment" value={VOLUME.attachment} />
                  <KeyValue label="Execution Method" value={def?.technology ?? ""} />
                  <KeyValue label="Started" value={stepState?.startedAt ?? "—"} />
                  <KeyValue label="Elapsed" value={fmtDuration(e.simTime)} />
                  <KeyValue label="AWS Volume State" value={e.currentStep === 4 ? (stepState.progress > 55 ? "optimizing" : "modifying") : "—"} />
                  <div className="mt-1.5">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-[#1B4F91] transition-all" style={{ width: `${stepState?.progress ?? 0}%` }} />
                    </div>
                    <div className="mt-1 text-right text-[11px] text-slate-500">{stepState?.progress ?? 0}%</div>
                  </div>
                  <p className="text-[11.5px] text-slate-600"><span className="font-medium">Next Gate: </span>{def?.gate}</p>
                  <button
                    onClick={() => setDrawer({ title: `Step Runbook — ${def?.name}`, body: (
                      <div className="space-y-2">
                        <KeyValue label="Technology" value={def?.technology ?? ""} />
                        <KeyValue label="Gate" value={def?.gate ?? ""} />
                        <KeyValue label="Failure Behavior" value={def?.failureBehavior ?? ""} />
                        <KeyValue label="Recovery" value={def?.recovery ?? ""} />
                        {e.currentStep === 1 && (
                          <ul className="list-disc pl-4 text-[11.5px] text-slate-700">{PREFLIGHT_CHECKS.map((c) => <li key={c}>{c}</li>)}</ul>
                        )}
                      </div>
                    ) })}
                    className="mt-2 h-8 w-full rounded-md border border-[#E2E8F0] bg-white text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View Step Runbook
                  </button>
                </>
              )}
              {tab === "artifact" && <Code>{TERRAFORM_DIFF}</Code>}
              {tab === "api" && <Code>{AWS_API_CALL}</Code>}
              {tab === "telemetry" && (
                <Code>{`VolumeId: ${VOLUME.id}\nModificationState: ${stepState.progress > 55 ? "optimizing" : "modifying"}\nOriginalSize: 500\nTargetSize: 750\nProgress: ${stepState?.progress ?? 0}%`}</Code>
              )}
              {tab === "evidence" && <Code>{`{\n  "control_plane": "aws",\n  "operation": "ModifyVolume",\n  "accepted": true,\n  "request_id": "b7c1-4f21-9a03",\n  "captured_at": "${e.events.at(-1)?.t ?? "--:--:--"}"\n}`}</Code>}
              {tab === "gate" && <p className="text-[12px] text-slate-700">{def?.gate} No downstream stage may run until this gate passes.</p>}
              {tab === "recovery" && <p className="text-[12px] text-slate-700">{def?.recovery}</p>}
            </div>
          </Panel>

          <Panel title="Production Guardrails">
            <div className="space-y-0">
              {guardrails.map((g) => (
                <div key={g.k} className="flex items-center gap-2 border-b border-slate-100 py-1.5 last:border-0">
                  <CircleDot className={cn("h-3.5 w-3.5", g.tone === "ok" ? "text-emerald-600" : g.tone === "bad" ? "text-rose-600" : g.tone === "warn" ? "text-amber-600" : "text-slate-300")} />
                  <span className="text-[11.5px] text-slate-700">{g.k}</span>
                  <span className="ml-auto text-[11.5px] font-medium text-slate-800">{g.v}</span>
                </div>
              ))}
            </div>
            <div className={cn("mt-3 rounded-md px-3 py-2 text-center text-[12.5px] font-semibold text-white",
              e.safetyState === "CONTINUE" ? "bg-emerald-700" : e.safetyState === "PAUSE" ? "bg-amber-600" : "bg-rose-700")}>
              EXECUTION SAFETY STATE: {e.safetyState}
            </div>
          </Panel>
        </div>

        {/* Activity stream */}
        <div className="space-y-3 xl:col-span-5">
          <Panel
            title="Execution Activity"
            actions={
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] text-emerald-700"><CircleDot className="h-3 w-3" /> Live</span>
                <select value={filter} onChange={(ev) => setFilter(ev.target.value)}
                  className="h-7 rounded-md border border-[#E2E8F0] bg-white px-1.5 text-[11px] text-slate-700">
                  {["ALL", "INFO", "ACTION", "PASS", "WARNING", "FAIL", "GATE", "AUTHORIZATION"].map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
            }
          >
            <div ref={streamRef} className="max-h-[420px] min-h-[240px] overflow-y-auto">
              {filteredEvents.length === 0 && <p className="py-6 text-center text-[12px] text-slate-500">Execution has not started.</p>}
              {filteredEvents.map((ev) => (
                <div key={ev.id} className="flex items-start gap-2 border-b border-slate-100 py-1.5 last:border-0">
                  <span className="mt-0.5 font-mono text-[11px] text-slate-400">{ev.t}</span>
                  <Pill tone={ev.severity === "PASS" || ev.severity === "GATE" ? "ok" : ev.severity === "FAIL" ? "bad" : ev.severity === "WARNING" ? "warn" : ev.severity === "ACTION" ? "info" : "neutral"}>
                    {ev.severity}
                  </Pill>
                  <span className="text-[11.5px] text-slate-700">{ev.message}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-3 border-t border-[#E2E8F0] pt-2">
              <label className="flex items-center gap-1.5 text-[11.5px] text-slate-600">
                <input type="checkbox" checked={autoScroll} onChange={(ev) => setAutoScroll(ev.target.checked)} /> Auto-scroll
              </label>
              <button onClick={() => setDrawer({ title: "Raw Execution Events", body: <Code>{e.events.map((ev) => `${ev.t} [${ev.severity}] step=${ev.step} ${ev.message}`).join("\n") || "—"}</Code> })}
                className="ml-auto h-7 rounded-md border border-[#E2E8F0] px-2 text-[11.5px] text-slate-700 hover:bg-slate-50">View Raw Events</button>
              <button onClick={() => setDrawer({ title: "Export Logs", body: <p>Simulated export of {e.events.length} orchestration events for {pkgId}. No file is written in this demo.</p> })}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-[#E2E8F0] px-2 text-[11.5px] text-slate-700 hover:bg-slate-50"><Download className="h-3 w-3" /> Export Logs</button>
            </div>
          </Panel>

          <Panel title="Execution Gates">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
                  <th className="py-1 font-medium">Step</th><th className="py-1 font-medium">Gate</th>
                  <th className="py-1 font-medium">Required Evidence</th><th className="py-1 font-medium">State</th>
                </tr>
              </thead>
              <tbody>
                {gateRows.map((g) => (
                  <tr key={g.step} className="border-t border-slate-100 align-top">
                    <td className="py-1.5 pr-2 text-[11.5px] font-medium text-slate-800">{g.step}</td>
                    <td className="py-1.5 pr-2 text-[11.5px] text-slate-600">{g.gate}</td>
                    <td className="py-1.5 pr-2 text-[11.5px] text-slate-600">{g.evidence}</td>
                    <td className="py-1.5">
                      <Pill tone={g.state === "PASSED" ? "ok" : g.state === "FAILED" ? "bad" : g.state === "RUNNING" ? "info" : "neutral"}>{g.state}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          {/* Expandables */}
          {[
            { key: "safety", title: "Runtime Safety Decision", body: (
              <div className="space-y-1.5">
                <KeyValue label="Current decision" value={e.safetyState} />
                <KeyValue label="Evaluated signals" value="13" />
                <KeyValue label="Critical failures" value={e.status === "failed" ? "1" : "0"} />
                <KeyValue label="Warnings" value={e.warning ? "1" : "0"} />
                <KeyValue label="Policy" value="Runtime-Execution-Safety-v2.1" />
                <KeyValue label="Last evaluation" value={e.events.at(-1)?.t ?? "—"} />
                <KeyValue label="Decision confidence" value="98%" />
                <ul className="list-disc pl-4 text-[11.5px] text-slate-700">
                  <li>SQL healthy</li><li>Application healthy</li><li>Infrastructure healthy</li>
                  <li>No critical monitoring alerts</li><li>Current execution step within expected state</li>
                  <li>No policy violation</li><li>No validation gate failure</li>
                </ul>
              </div>
            ) },
            { key: "recon", title: "State Reconciliation", body: (
              <table className="w-full text-left">
                <thead><tr className="text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
                  <th className="py-1 font-medium">Item</th><th className="py-1 font-medium">Before</th>
                  <th className="py-1 font-medium">Desired</th><th className="py-1 font-medium">Observed</th></tr></thead>
                <tbody>{reconciliation.map((r) => (
                  <tr key={r.k} className="border-t border-slate-100">
                    <td className="py-1.5 text-[11.5px] font-medium text-slate-800">{r.k}</td>
                    <td className="py-1.5 text-[11.5px] text-slate-600">{r.before}</td>
                    <td className="py-1.5 text-[11.5px] text-slate-600">{r.desired}</td>
                    <td className="py-1.5 text-[11.5px] text-slate-800">{r.observed}</td>
                  </tr>))}</tbody>
              </table>
            ) },
            { key: "agents", title: "Execution Agents", body: (
              <div className="grid gap-2 md:grid-cols-2">{AGENTS.map((a) => (
                <div key={a.name} className="rounded-md border border-[#E2E8F0] p-2.5">
                  <div className="text-[12px] font-semibold text-slate-800">{a.name}</div>
                  <div className="mt-1 text-[11.5px] text-slate-600">{a.responsibility}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Pill tone="info">{a.authority}</Pill>
                    <Pill tone="neutral">Confidence {a.confidence}</Pill>
                    <Pill tone="ok">May deviate from package: No</Pill>
                  </div>
                </div>))}
              </div>
            ) },
            { key: "immutable", title: "Immutable Package Enforcement", body: (
              <div className="space-y-1.5">
                <KeyValue label="Package" value={`${pkgId} v${EXEC_PACKAGE.packageVersion}`} />
                <KeyValue label="State" value="Immutable" />
                <KeyValue label="Authorization" value="Valid" />
                <KeyValue label="Execution Boundary" value="Locked" />
                <div className="grid gap-2 md:grid-cols-2">
                  <div><div className="text-[11px] font-semibold uppercase text-slate-500">Agents may</div>
                    <ul className="list-disc pl-4 text-[11.5px] text-slate-700"><li>Execute approved actions</li><li>Evaluate runtime state</li><li>Stop execution</li><li>Pause execution</li><li>Collect evidence</li></ul></div>
                  <div><div className="text-[11px] font-semibold uppercase text-slate-500">Agents may NOT</div>
                    <ul className="list-disc pl-4 text-[11.5px] text-slate-700"><li>Change target volume</li><li>Exceed 750 GB</li><li>Introduce or delete resources</li><li>Restart SQL Server</li><li>Skip validation gates</li><li>Alter approved code</li></ul></div>
                </div>
                <p className="text-[11.5px] text-slate-600">If a change becomes necessary, execution stops and a new package version must be engineered and approved.</p>
              </div>
            ) },
          ].map((sec) => (
            <section key={sec.key} className="rounded-lg border border-[#E2E8F0] bg-white">
              <button onClick={() => setOpen((o) => ({ ...o, [sec.key]: !o[sec.key] }))}
                className="flex w-full items-center gap-2 px-3 py-2 text-left">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">{sec.title}</h3>
                <ChevronDown className={cn("ml-auto h-4 w-4 text-slate-400 transition-transform", open[sec.key] && "rotate-180")} />
              </button>
              {open[sec.key] && <div className="border-t border-[#E2E8F0] p-3">{sec.body}</div>}
            </section>
          ))}
        </div>

        {/* Right rail */}
        <div className="space-y-3 xl:col-span-3">
          <Panel title="Active Control Planes">
            <div className="space-y-2">
              {controlPlanes.map((cp) => {
                const Icon = cp.icon;
                return (
                  <button key={cp.name} onClick={() => setDrawer({ title: cp.name, subtitle: cp.target, body: (
                    <div className="space-y-1.5">
                      <KeyValue label="Technology" value={cp.tech} />
                      <KeyValue label="State" value={cp.state} />
                      {cp.extra.map(([k, v]) => <KeyValue key={k} label={k} value={v} />)}
                    </div>
                  ) })}
                    className="w-full rounded-md border border-[#E2E8F0] p-2.5 text-left hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#1B4F91]" />
                      <span className="text-[12px] font-semibold text-slate-800">{cp.name}</span>
                      <Pill className="ml-auto" tone={cp.tone}>{cp.state}</Pill>
                    </div>
                    <div className="mt-1 truncate text-[11px] text-slate-500">{cp.target}</div>
                    <div className="text-[11px] text-slate-500">{cp.tech}</div>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Execution Controls">
            <div className="space-y-2">
              <button onClick={e.requestPause} disabled={!running}
                className="h-8 w-full rounded-md border border-[#E2E8F0] bg-white text-[12px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40">
                Pause After Current Step
              </button>
              <button onClick={() => setDrawer({ title: "Execution Evidence", body: evidenceDrawer })}
                className="h-8 w-full rounded-md border border-[#E2E8F0] bg-white text-[12px] font-medium text-slate-700 hover:bg-slate-50">
                View Execution Evidence
              </button>
              <button onClick={() => setHaltModal(true)} disabled={!started || e.status === "halted"}
                className="h-8 w-full rounded-md border border-rose-300 bg-white text-[12px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40">
                Emergency Halt
              </button>
            </div>
          </Panel>

          <Panel title="Demo Execution Scenario">
            <select
              value={e.scenario}
              onChange={(ev) => { e.setScenario(ev.target.value as ExecutionScenario); e.reset(); }}
              className="h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px] text-slate-800"
            >
              {SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <p className="mt-1.5 text-[11px] text-slate-500">Changing the scenario resets this demo session only.</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11.5px] text-slate-600">Demo Speed</span>
              {[1, 2, 4].map((s) => (
                <button key={s} onClick={() => e.setSpeed(s)}
                  className={cn("h-7 rounded-md border px-2 text-[11.5px]",
                    e.speed === s ? "border-[#1B4F91] bg-[#EFF4FB] font-medium text-[#1B4F91]" : "border-[#E2E8F0] text-slate-600")}>
                  {s}x
                </button>
              ))}
            </div>
            <button onClick={e.reset} className="mt-2 h-7 w-full rounded-md border border-[#E2E8F0] text-[11.5px] text-slate-700 hover:bg-slate-50">Reset Demo</button>
          </Panel>

          <Panel title="Overall Execution Progress">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-[#1B4F91]" style={{ width: `${e.overallProgress}%` }} />
            </div>
            <div className="mt-1.5 space-y-1">
              <KeyValue label="Completed" value={`${e.completedCount} of 8 steps`} />
              <KeyValue label="Executing" value={started && running ? `Step ${e.currentStep}` : "—"} />
              <KeyValue label="Overall" value={`${e.overallProgress}%`} />
              <KeyValue label="Elapsed" value={fmtDuration(e.simTime)} />
              <KeyValue label="Estimated Remaining" value={fmtDuration(e.remainingSeconds)} />
            </div>
          </Panel>

          <Panel title="Demo Story" actions={
            <button onClick={() => setStory(story === null ? 0 : null)}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-[#E2E8F0] px-2 text-[11.5px] text-slate-700 hover:bg-slate-50">
              <BookOpen className="h-3.5 w-3.5" /> {story === null ? "Start" : "Exit Story"}
            </button>
          }>
            {story === null ? (
              <p className="text-[11.5px] text-slate-500">Guided presenter walkthrough of the governed execution model.</p>
            ) : (
              <div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-slate-500">Step {story + 1} of {STORY_STEPS.length}</div>
                <div className="mt-0.5 text-[12.5px] font-semibold text-slate-800">{STORY_STEPS[story].title}</div>
                <p className="mt-1 text-[11.5px] text-slate-600">{STORY_STEPS[story].body}</p>
                {story === 5 && (
                  <button onClick={() => { e.setScenario("application_validation_failure"); e.reset(); }}
                    className="mt-2 h-7 w-full rounded-md border border-amber-300 bg-amber-50 text-[11.5px] font-medium text-amber-800">
                    Demonstrate Application Validation Failure
                  </button>
                )}
                <div className="mt-2 flex gap-2">
                  <button disabled={story === 0} onClick={() => setStory((s) => (s ?? 0) - 1)}
                    className="h-7 flex-1 rounded-md border border-[#E2E8F0] text-[11.5px] text-slate-700 disabled:opacity-40">Previous</button>
                  <button disabled={story === STORY_STEPS.length - 1} onClick={() => setStory((s) => (s ?? 0) + 1)}
                    className="h-7 flex-1 rounded-md bg-[#1B4F91] text-[11.5px] font-medium text-white disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* Start modal */}
      <ReviewModal
        open={startModal}
        title="Start Production Execution"
        onClose={() => setStartModal(false)}
        footer={
          <>
            <button onClick={() => setStartModal(false)} className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12px] font-medium text-slate-700">Cancel</button>
            <button
              disabled={!startAck}
              onClick={() => { setStartModal(false); e.start(); }}
              className="h-8 rounded-md bg-[#1B4F91] px-3 text-[12px] font-semibold text-white disabled:opacity-40"
            >
              Start Execution
            </button>
          </>
        }
      >
        <div className="space-y-1.5">
          <KeyValue label="Package" value={pkgId} mono />
          <KeyValue label="Version" value={EXEC_PACKAGE.packageVersion} />
          <KeyValue label="Authorization" value={EXEC_PACKAGE.authorization} mono />
          <KeyValue label="Target" value={EXEC_PACKAGE.target} />
          <KeyValue label="Environment" value={EXEC_PACKAGE.environment} />
          <KeyValue label="Business Service" value={EXEC_PACKAGE.businessService} />
          <KeyValue label="Expected Downtime" value={EXEC_PACKAGE.expectedDowntime} />
          <KeyValue label="Execution Steps" value="8" />
          <KeyValue label="Validation Tests" value={String(EXEC_PACKAGE.validationTests)} />
          <label className="mt-2 flex items-start gap-2 text-[12px] text-slate-700">
            <input type="checkbox" checked={startAck} onChange={(ev) => setStartAck(ev.target.checked)} className="mt-0.5" />
            I understand this will begin the approved production change.
          </label>
          <p className="text-[11px] text-slate-500">Demo simulation only — no AWS, SQL Server, Windows or production APIs are called.</p>
        </div>
      </ReviewModal>

      {/* Halt modal */}
      <ReviewModal
        open={haltModal}
        title="Emergency Halt"
        onClose={() => setHaltModal(false)}
        footer={
          <>
            <button onClick={() => setHaltModal(false)} className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12px] font-medium text-slate-700">Cancel</button>
            <button
              disabled={!haltAck || haltReasonText.trim().length === 0}
              onClick={() => { e.halt(haltReasonText.trim()); setHaltModal(false); setHaltAck(false); }}
              className="h-8 rounded-md bg-rose-600 px-3 text-[12px] font-semibold text-white disabled:opacity-40"
            >
              Halt Execution
            </button>
          </>
        }
      >
        <p className="text-[12px] text-slate-700">
          This will prevent additional execution stages from beginning. The currently active external control-plane
          transaction may not be technically reversible or immediately stoppable.
        </p>
        <label className="mt-2 block text-[11.5px] font-medium text-slate-600">Reason</label>
        <textarea value={haltReasonText} onChange={(ev) => setHaltReasonText(ev.target.value)} rows={3}
          className="mt-1 w-full rounded-md border border-[#E2E8F0] p-2 text-[12px] outline-none focus:border-[#1B4F91]/40"
          placeholder="Describe why execution must be halted" />
        <label className="mt-2 flex items-start gap-2 text-[12px] text-slate-700">
          <input type="checkbox" checked={haltAck} onChange={(ev) => setHaltAck(ev.target.checked)} className="mt-0.5" />
          I understand this will halt the orchestration workflow.
        </label>
      </ReviewModal>

      <ReviewDrawer open={!!drawer} title={drawer?.title ?? ""} subtitle={drawer?.subtitle} onClose={() => setDrawer(null)}>
        {drawer?.body}
      </ReviewDrawer>
    </div>
  );
}
