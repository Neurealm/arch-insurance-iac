import { type ReactNode } from "react";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, SectionEyebrow, toneMap, type Tone } from "./primitives";

/* --------------------------------------- HOW THIS WORKS IN YOUR ENVIRONMENT */

export interface FabricNode { label: string; detail: string; tone?: Tone }

export function EnvironmentFabricBand({
  nodes, note,
}: { nodes: FabricNode[]; note?: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <SectionEyebrow>How this works in your existing environment</SectionEyebrow>
      <div className="mt-3 flex flex-wrap items-stretch gap-2">
        {nodes.map((n, i) => {
          const t = toneMap[n.tone ?? "blue"];
          return (
            <div key={n.label} className="flex items-stretch gap-2">
              <div className={cn("min-w-[168px] max-w-[220px] rounded-lg border p-2.5", t.bg, t.border)}>
                <div className={cn("text-[11.5px] font-semibold", t.text)}>{n.label}</div>
                <div className="mt-0.5 text-[11px] leading-snug text-slate-600">{n.detail}</div>
              </div>
              {i < nodes.length - 1 && (
                <div className="grid place-items-center text-slate-300"><ArrowRight className="h-4 w-4" /></div>
              )}
            </div>
          );
        })}
      </div>
      {note && <p className="mt-3 text-[11.5px] text-slate-500">{note}</p>}
    </section>
  );
}

/* ------------------------------------------------------- MATURITY JOURNEY */

export interface MaturityLevel { level: string; title: string; detail: string; state: "current" | "next" | "future" }

export function MaturityJourneyBand({ levels }: { levels: MaturityLevel[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <SectionEyebrow>Maturity journey</SectionEyebrow>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {levels.map((l) => {
          const tone: Tone = l.state === "current" ? "emerald" : l.state === "next" ? "blue" : "slate";
          const t = toneMap[tone];
          return (
            <div key={l.level} className={cn("rounded-lg border p-3", t.bg, t.border)}>
              <div className="flex items-center justify-between">
                <span className={cn("text-[10px] font-semibold uppercase tracking-wider", t.text)}>{l.level}</span>
                <span className={cn("rounded border bg-white/70 px-1.5 py-0.5 text-[10px] font-medium", t.text, t.border)}>
                  {l.state === "current" ? "You are here" : l.state === "next" ? "Next" : "Target"}
                </span>
              </div>
              <div className="mt-1 text-[13px] font-semibold text-slate-900">{l.title}</div>
              <p className="mt-1 text-[11.5px] leading-snug text-slate-600">{l.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------- END TO END LIFECYCLE */

export interface LifecycleStep { label: string; state?: "done" | "active" | "todo" }

export const finopsLifecycle: LifecycleStep[] = [
  { label: "Ingest cost & telemetry", state: "done" },
  { label: "Detect opportunity", state: "done" },
  { label: "Validate safety & dependencies", state: "done" },
  { label: "Model financial impact", state: "active" },
  { label: "Approve & schedule", state: "todo" },
  { label: "Execute change", state: "todo" },
  { label: "Verify realized savings", state: "todo" },
  { label: "Govern & report", state: "todo" },
];

export function LifecycleRail({ steps = finopsLifecycle }: { steps?: LifecycleStep[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <SectionEyebrow>End-to-end FinOps lifecycle</SectionEyebrow>
      <ol className="mt-3 flex flex-wrap items-center gap-1.5">
        {steps.map((s, i) => {
          const tone: Tone = s.state === "done" ? "emerald" : s.state === "active" ? "blue" : "slate";
          const t = toneMap[tone];
          return (
            <li key={s.label} className="flex items-center gap-1.5">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium", t.bg, t.border, t.text)}>
                {s.state === "done"
                  ? <CheckCircle2 className="h-3 w-3" />
                  : <Circle className={cn("h-3 w-3", s.state === "active" && "fill-blue-500 text-blue-500")} />}
                {i + 1}. {s.label}
              </span>
              {i < steps.length - 1 && <ArrowRight className="h-3 w-3 text-slate-300" />}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------ page footer */

export function WorkspaceFooter({
  fabric, maturity, lifecycle, fabricNote,
}: {
  fabric: FabricNode[]; maturity: MaturityLevel[]; lifecycle?: LifecycleStep[]; fabricNote?: string;
}) {
  return (
    <div className="space-y-5">
      <EnvironmentFabricBand nodes={fabric} note={fabricNote} />
      <MaturityJourneyBand levels={maturity} />
      <LifecycleRail steps={lifecycle} />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
        <span className="text-[11px] text-slate-400">Agentic FinOps Digital Twin</span>
        <p className="flex-1 text-center text-[11.5px] text-slate-500">
          Demonstration environment. Financial and operational values are synthetic.
        </p>
        <span className="text-[11px] text-slate-500">Data refreshed: 2 minutes ago</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- page shell */

export function WorkspaceShell({
  title, subtitle, actions, children,
}: { title: string; subtitle: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-6 py-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold leading-tight tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 max-w-4xl text-[13px] text-slate-600">{subtitle}</p>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}

export function FilterBar({ chips }: { chips: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c, i) => (
        <span
          key={c}
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11.5px] font-medium",
            i === 0 ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600",
          )}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

export const defaultFabric: FabricNode[] = [
  { label: "Cloud billing & usage", detail: "AWS CUR, Azure Cost Mgmt, GCP Billing export", tone: "blue" },
  { label: "Observability", detail: "Datadog, Prometheus, CloudWatch utilization signals", tone: "sky" },
  { label: "Agentic FinOps twin", detail: "Correlates spend, usage, dependency, and risk", tone: "violet" },
  { label: "Change & approval", detail: "ServiceNow / Jira change records with policy gates", tone: "amber" },
  { label: "Execution", detail: "Terraform, IaC pipelines, native cloud APIs", tone: "teal" },
  { label: "Verification", detail: "Post-change billing reconciliation and reporting", tone: "emerald" },
];

export const defaultMaturity: MaturityLevel[] = [
  { level: "Level 1", title: "Visibility", detail: "Spend and utilization reported after the fact; savings identified manually in spreadsheets.", state: "future" },
  { level: "Level 2", title: "Guided optimization", detail: "Twin generates ranked, evidence-backed recommendations with human approval on every change.", state: "current" },
  { level: "Level 3", title: "Autonomous FinOps", detail: "Low-risk changes execute automatically under policy, with continuous savings verification and rollback.", state: "next" },
];
