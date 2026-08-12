import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Download, Save, ShieldCheck, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ARTIFACT_COUNT, CHANGE_CONTEXT, CONTRIBUTORS, LIFECYCLE, STEPS, VALIDATIONS,
  type StageKey,
} from "./change/data";
import { STEP_TABS, StepWorkspaceBody, type StepTab } from "./change/StepWorkspace";
import { PackageContentsDrawer } from "./change/PackageContentsDrawer";

const STATUS_TONE: Record<string, string> = {
  Ready: "text-emerald-700",
  "In Focus": "text-[#1B4F91]",
  Pending: "text-slate-500",
};

function Panel({ title, right, children, className }: {
  title: string; right?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("flex flex-col rounded-md border border-[#E2E8F0] bg-white", className)}>
      <header className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-2">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">{title}</h2>
        {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
      </header>
      <div className="flex-1 p-3">{children}</div>
    </section>
  );
}

function Row({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "ok" | "warn" }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[3px] text-[11.5px]">
      <span className="text-slate-500">{label}</span>
      <span className={cn("text-right font-medium text-slate-800", tone === "ok" && "text-emerald-700", tone === "warn" && "text-amber-700")}>{value}</span>
    </div>
  );
}

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "amber" | "blue" }) {
  return (
    <span className={cn(
      "rounded border px-1.5 py-0.5 text-[10.5px] font-medium",
      tone === "slate" && "border-[#E2E8F0] bg-slate-50 text-slate-700",
      tone === "amber" && "border-amber-200 bg-amber-50 text-amber-700",
      tone === "blue" && "border-[#CFE0F3] bg-[#EFF4FB] text-[#1B4F91]",
    )}>
      {children}
    </span>
  );
}

export default function ChangeEngineering() {
  const [stage, setStage] = useState<StageKey>(4);
  const [stepId, setStepId] = useState(4);
  const [tab, setTab] = useState<StepTab>("Overview");
  const [pkgOpen, setPkgOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const step = useMemo(() => STEPS.find((s) => s.id === stepId) ?? STEPS[3], [stepId]);
  const c = CHANGE_CONTEXT;

  const selectStage = (s: StageKey) => {
    setStage(s);
    const first = LIFECYCLE.find((l) => l.id === s)?.steps[0] ?? 1;
    setStepId(first);
    setTab("Overview");
  };

  const selectStep = (id: number) => {
    setStepId(id);
    const st = STEPS.find((s) => s.id === id);
    if (st) setStage(st.stage);
    setTab("Overview");
  };

  return (
    <div className="p-4">
      {/* breadcrumb */}
      <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-[11.5px] text-slate-500">
        <Link to="/agentic-iac-engineering" className="hover:text-slate-700">Assets</Link>
        <span>/</span><span>SQL Servers</span>
        <span>/</span><span className="text-slate-700">{c.server}</span>
        <span>/</span>
        <Link to="/agentic-iac-engineering/remediation-intelligence/sql-prod-07" className="hover:text-slate-700 hover:underline">Remediation Intelligence</Link>
        <span>/</span><span className="font-medium text-slate-800">Change Engineering</span>
      </nav>

      {/* header */}
      <header className="mb-3 flex flex-wrap items-start gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[20px] font-semibold leading-tight text-slate-900">Change Engineering Workspace</h1>
            <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              {submitted ? "Submitted for Approval" : "Ready for Review"}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-slate-700">
            <span className="font-medium">{c.server} / {c.database}</span>
            <Badge tone="amber">{c.environment}</Badge>
            <Badge>{c.criticality}</Badge>
            <Badge tone="blue">AWS</Badge>
            <Badge>SQL Server</Badge>
          </div>
          <p className="mt-1 text-[12px] text-slate-600">
            <span className="font-medium text-slate-700">Objective:</span> Stabilize SQL transaction log and increase infrastructure capacity headroom.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setPkgOpen(true)} className="flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export Package
          </button>
          <button type="button" onClick={() => setSaved(true)} className="flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50">
            <Save className="h-3.5 w-3.5" /> {saved ? "Draft Saved" : "Save Draft"}
          </button>
          <button type="button" onClick={() => setSubmitted(true)} className="flex items-center gap-1.5 rounded-md bg-[#1B4F91] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#16406f]">
            <ShieldCheck className="h-3.5 w-3.5" /> {submitted ? "Awaiting Approval" : "Submit for Approval"}
          </button>
        </div>
      </header>

      {submitted && (
        <p className="mb-3 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[11.5px] text-[#1B4F91]">
          Change package {c.changeId} routed for human approval. No infrastructure operation has been executed.
        </p>
      )}

      {/* summary strip */}
      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[11.5px]">
        {[
          ["Change Package", c.changeId], ["Status", c.status], ["Engineering Confidence", `${c.confidence}%`],
          ["Expected Downtime", c.downtime], ["Risk", c.risk], ["Approval Required", c.approvalRequired],
          ["Systems", c.systems], ["Artifacts", String(ARTIFACT_COUNT)], ["Validation Tests", String(VALIDATIONS.length)],
          ["Infrastructure Mutations", String(c.mutations)],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-1.5">
            <span className="text-slate-500">{k}:</span>
            <span className="font-medium text-slate-800">{v}</span>
          </div>
        ))}
      </div>

      {/* lifecycle */}
      <div className="mb-3 overflow-x-auto rounded-md border border-[#E2E8F0] bg-white p-3">
        <div className="flex min-w-[900px] items-stretch gap-2">
          {LIFECYCLE.map((l, i) => {
            const active = stage === l.id;
            return (
              <div key={l.id} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectStage(l.id)}
                  className={cn(
                    "flex flex-1 items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors",
                    active ? "border-[#CFE0F3] bg-[#EFF4FB]" : "border-transparent hover:bg-slate-50",
                  )}
                >
                  <span className={cn(
                    "mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10.5px] font-semibold",
                    active ? "bg-[#1B4F91] text-white" : l.state === "done" ? "bg-emerald-600 text-white" : "border border-slate-300 text-slate-500",
                  )}>{l.id}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11.5px] font-semibold uppercase tracking-wide text-slate-700">{l.title}</span>
                    <span className="block truncate text-[11px] text-slate-500">{l.sub}</span>
                    {l.state === "done" && <CheckCircle2 className="mt-1 h-3.5 w-3.5 text-emerald-600" />}
                  </span>
                </button>
                {i < LIFECYCLE.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* three-column workspace */}
      <div className="grid gap-3 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        {/* left: plan */}
        <Panel title="Engineered Change Plan" className="self-start">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11.5px]">
              <thead className="text-[10.5px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-1 font-medium">Step</th>
                  <th className="pb-1 font-medium">Technology</th>
                  <th className="pb-1 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {STEPS.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => selectStep(s.id)}
                    className={cn("cursor-pointer border-t border-[#E2E8F0] align-top", s.id === stepId ? "bg-[#EFF4FB]" : "hover:bg-slate-50")}
                  >
                    <td className="py-1.5 pr-2">
                      <div className="flex gap-2">
                        <span className="mt-[1px] grid h-4 w-4 shrink-0 place-items-center rounded-full border border-slate-300 text-[10px] text-slate-600">{s.id}</span>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800">{s.title}</div>
                          <div className="text-[11px] text-slate-500">{s.description}</div>
                          <div className="mt-0.5 font-mono text-[10.5px] text-slate-500">{s.artifacts.join(", ")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-1.5 pr-2 text-[11px] text-slate-600">{s.technology.join(", ")}</td>
                    <td className={cn("py-1.5 text-right text-[11px] font-medium", STATUS_TONE[s.status])}>{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* center: step workspace */}
        <section className="flex min-w-0 flex-col rounded-md border border-[#E2E8F0] bg-white">
          <header className="border-b border-[#E2E8F0] px-3 py-2">
            <h2 className="text-[13px] font-semibold text-slate-900">Step {step.id}, {step.title}</h2>
            <p className="text-[11.5px] text-slate-500">{step.description}</p>
          </header>
          <div className="flex flex-wrap gap-1 border-b border-[#E2E8F0] px-2 py-1.5">
            {STEP_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11.5px] transition-colors",
                  tab === t ? "bg-[#EFF4FB] font-medium text-[#1B4F91] ring-1 ring-inset ring-[#CFE0F3]" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="min-w-0 flex-1 p-3">
            <StepWorkspaceBody step={step} tab={tab} />
          </div>
        </section>

        {/* right rail */}
        <div className="flex flex-col gap-3">
          <Panel
            title="Change Package"
            right={
              <button type="button" onClick={() => setPkgOpen(true)} className="text-[11px] font-medium text-[#1B4F91] hover:underline">
                View Package Contents
              </button>
            }
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="font-mono text-[12.5px] font-semibold text-slate-900">{c.changeId}</span>
              <Badge>{c.status}</Badge>
            </div>
            <Row label="Target" value={`${c.server} / ${c.database}`} />
            <Row label="Environment" value={c.environment} />
            <Row label="Business Service" value="Order Processing" />
            <Row label="Systems" value="SQL Server, Windows, AWS" />
            <Row label="Artifacts" value={ARTIFACT_COUNT} />
            <Row label="Infrastructure Mutations" value={c.mutations} />
            <Row label="Validation Tests" value={VALIDATIONS.length} />
            <Row label="Expected Downtime" value={c.downtime} />
            <Row label="Risk" value={c.risk} tone="warn" />
            <Row label="Approval Required" value={c.approvalRequired} tone="warn" />
            <Row label="Engineering Confidence" value={`${c.confidence}%`} tone="ok" />
            <div className="mt-1 h-1.5 overflow-hidden rounded bg-slate-100">
              <div className="h-full rounded bg-emerald-500" style={{ width: `${c.confidence}%` }} />
            </div>
            <Row label="Created" value={c.created} />
          </Panel>

          <Panel title="Agentic Engineering Contributors">
            <ul className="space-y-2.5">
              {CONTRIBUTORS.map((a) => (
                <li key={a.name} className="flex gap-2">
                  <Bot className="mt-[2px] h-4 w-4 shrink-0 text-[#1B4F91]" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11.5px] font-medium text-slate-800">{a.name}</span>
                      <span className="ml-auto flex items-center gap-1 text-[10.5px] text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />{a.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{a.contribution}</p>
                    <p className="mt-0.5 text-[10.5px] text-slate-500">Artifacts: {a.artifacts} · Confidence: {a.confidence}%</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Scenario Context">
            <Row label="Condition" value={c.condition} />
            <Row label="Root Cause" value={c.rootCause} />
            <Row label="Log Utilization" value={c.logUtilization} tone="warn" />
            <Row label="Last Log Backup" value={c.lastLogBackup} />
            <Row label="Windows Volume" value={c.windowsVolume} />
            <Row label="EBS Volume" value={c.ebsVolume} />
            <Row label="Capacity" value={`${c.currentCapacity} → ${c.targetCapacity}`} />
            <Row label="Strategy" value={c.strategy} />
            <Row label="Region" value={c.region} />
            <Row label="Operating System" value={c.os} />
            <Row label="Engine" value={c.engine} />
          </Panel>
        </div>
      </div>

      <PackageContentsDrawer open={pkgOpen} onClose={() => setPkgOpen(false)} />
    </div>
  );
}
