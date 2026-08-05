// Stage 1 read-only operational panels for the SRE Based Agentic NOC.

import {
  Area, AreaChart, CartesianGrid, Legend, Line, ReferenceLine,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  EmptyState, LoadingState, OpsPanel, TableShell,
} from "@/components/operations/OperationsPrimitives";
import { statusStyle } from "@/components/operations/AgenticGlobalOpticalMap";
import { CAPACITY_CRITICAL_TBPS, CAPACITY_WARNING_TBPS } from "@/data/agenticOpticalNetworkData";
import type {
  AgenticAction, CapacityPoint, ChangeRecord, Hypothesis, LearningRecord,
  NetworkStatus, OperationalEvent, OpticalLink, OpticalTerminal, PredictedRisk,
  RiskLevel, ServiceReliabilityRecord, Situation, SloRecord,
} from "@/types/agenticOpticalOperations";

export function StatusPill({ status }: { status: NetworkStatus }) {
  const s = statusStyle[status];
  return (
    <span className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10.5px] font-medium"
      style={{ borderColor: s.stroke, color: s.stroke, backgroundColor: `${s.fill}1a` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.fill }} aria-hidden />
      {s.label}
    </span>
  );
}

const riskTone: Record<RiskLevel, string> = {
  low: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

export function RiskPill({ level }: { level: RiskLevel }) {
  return (
    <span className={cn("inline-flex rounded border px-1.5 py-0.5 text-[10.5px] font-medium capitalize", riskTone[level])}>
      {level}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <span className="inline-flex w-full max-w-[90px] items-center gap-1.5">
      <span className="h-1.5 flex-1 rounded bg-slate-100">
        <span className="block h-1.5 rounded bg-purple-500" style={{ width: `${value}%` }} />
      </span>
      <span className="text-[10.5px] text-slate-600">{value}%</span>
    </span>
  );
}

interface PanelBaseProps { loading?: boolean; className?: string }

export function ActiveSituationRoom({
  situations, loading, className,
}: PanelBaseProps & { situations: Situation[] }) {
  const primary = situations[0];
  return (
    <OpsPanel title="Active Situation Room" subtitle="Live customer impacting situations" className={className}>
      {loading ? <LoadingState rows={4} />
        : !primary ? <EmptyState message="No active situation in the selected scope." />
        : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[13px] font-semibold text-slate-900">{primary.title}</h3>
              <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-medium",
                primary.severity === "Critical" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700")}>
                {primary.severity}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11.5px]">
              <Field label="Customer impact" value={`${primary.customersAffected.toLocaleString()} customers`} />
              <Field label="Services affected" value={String(primary.servicesAffected.length)} />
              <Field label="Duration" value={`${Math.floor(primary.durationMinutes / 60)}h ${primary.durationMinutes % 60}m`} />
              <Field label="Current phase" value={primary.phase} />
              <Field label="SLO impact" value={primary.sloImpact} />
              <Field label="Critical journeys" value={primary.criticalJourneys.join(", ")} />
            </dl>
            <div className="rounded border border-slate-200 bg-slate-50 p-2.5">
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">
                Root cause hypothesis · {primary.confidence}% confidence
              </p>
              <p className="mt-1 text-[11.5px] text-slate-700">{primary.rootCauseHypothesis}</p>
              <p className="mt-2 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Current action</p>
              <p className="mt-1 text-[11.5px] text-slate-700">{primary.currentAction}</p>
              <p className="mt-2 text-[11px] text-slate-600">Validation state: <span className="font-medium capitalize">{primary.validationState.replace("-", " ")}</span></p>
            </div>
            {situations.length > 1 && (
              <ul className="space-y-1.5">
                {situations.slice(1).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 rounded border border-slate-200 px-2 py-1.5 text-[11.5px]">
                    <span className="truncate text-slate-700">{s.title}</span>
                    <span className="shrink-0 text-slate-500">{s.severity} · {s.phase}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
    </OpsPanel>
  );
}

export function AgenticInvestigationWorkspace({
  hypotheses, loading, className, agentAvailable = true,
}: PanelBaseProps & { hypotheses: Hypothesis[]; agentAvailable?: boolean }) {
  return (
    <OpsPanel title="Agentic Investigation Workspace" subtitle="Ranked cause hypotheses with evidence" className={className}>
      {loading ? <LoadingState rows={4} />
        : !agentAvailable ? <EmptyState message="Investigation agent unavailable. Showing last known analysis only." />
        : hypotheses.length === 0 ? <EmptyState message="No investigation hypotheses for the selected scope." />
        : (
          <ul className="space-y-2.5">
            {hypotheses.map((h) => (
              <li key={h.id} className="rounded border border-slate-200 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-medium text-slate-900">{h.hypothesis}</p>
                  <ConfidenceBar value={h.confidence} />
                </div>
                <p className="mt-1.5 text-[11px] text-green-700">Supporting: {h.supportingEvidence.join("; ")}</p>
                <p className="text-[11px] text-amber-700">
                  Contradicting: {h.contradictingEvidence.length ? h.contradictingEvidence.join("; ") : "None recorded"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Similar incidents: {h.similarIncidents.length ? h.similarIncidents.join(", ") : "None"}
                </p>
                <p className="mt-1 text-[10.5px] uppercase tracking-wide text-slate-500">State: {h.investigationState}</p>
              </li>
            ))}
          </ul>
        )}
    </OpsPanel>
  );
}

export function PredictiveLinkRiskCenter({
  risks, linkNames, loading, className, onSelectRisk,
}: PanelBaseProps & {
  risks: PredictedRisk[]; linkNames: Record<string, string>;
  onSelectRisk?: (risk: PredictedRisk) => void;
}) {
  return (
    <OpsPanel title="Predictive Link Risk Center" subtitle="Next 72 hours" className={className}>
      {loading ? <LoadingState rows={4} />
        : risks.length === 0 ? <EmptyState message="No predicted risks in the selected scope." />
        : (
          <ul className="space-y-2">
            {risks.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => onSelectRisk?.(r)}
                  className="w-full rounded border border-slate-200 p-2.5 text-left transition hover:border-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-slate-900">{linkNames[r.linkId] ?? r.linkId}</span>
                    <RiskPill level={r.riskLevel} />
                  </div>
                  <p className="mt-1 text-[11.5px] text-slate-700">{r.title}</p>
                  <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                    <Field label="Probability" value={`${Math.round(r.probability * 100)}%`} />
                    <Field label="Time to impact" value={`${r.predictedImpactAt.slice(11, 16)} UTC`} />
                    <Field label="Primary driver" value={r.primaryDriver} />
                    <Field label="Customers at risk" value={r.customersAtRisk.toLocaleString()} />
                  </dl>
                  <p className="mt-1 text-[11px] text-teal-700">Preparation: {r.recommendedPreparation}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
    </OpsPanel>
  );
}

export function HumanApprovalActionCenter({
  actions, loading, className,
}: PanelBaseProps & { actions: AgenticAction[] }) {
  return (
    <OpsPanel title="Human Approval and Action Center" subtitle="Read only in Stage 1" className={className}>
      {loading ? <LoadingState rows={4} />
        : actions.length === 0 ? <EmptyState message="No recommended or executing actions in the selected scope." />
        : (
          <ul className="space-y-2">
            {actions.map((a) => (
              <li key={a.id} className="rounded border border-slate-200 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-medium text-slate-900">{a.title}</p>
                  <span className="shrink-0 rounded border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[10.5px] font-medium capitalize text-purple-700">
                    {a.autonomyPolicy.replace(/-/g, " ")}
                  </span>
                </div>
                <dl className="mt-1.5 space-y-1 text-[11px]">
                  <Field label="Expected result" value={a.expectedResult} />
                  <Field label="Risk" value={a.riskDescription} />
                  <Field label="Approver" value={a.approver} />
                  <Field label="Execution status" value={`${a.activityType.replace(/-/g, " ")} · ${a.progressPercent}%`} />
                  <Field label="Validation plan" value={a.validationPlan} />
                  <Field label="Rollback" value={a.rollbackReady ? "Ready" : "Not applicable"} />
                </dl>
              </li>
            ))}
          </ul>
        )}
    </OpsPanel>
  );
}

export function SloErrorBudgetPanel({
  slos, loading, className,
}: PanelBaseProps & { slos: SloRecord[] }) {
  return (
    <OpsPanel title="SLO and Error Budgets" subtitle="30 day window" className={className}>
      {loading ? <LoadingState rows={4} />
        : slos.length === 0 ? <EmptyState message="No SLOs match the selected filters." />
        : (
          <TableShell caption="Service level objectives" headers={["Service", "Target", "Attainment", "Budget", "Burn", "Owner"]}>
            {slos.map((s) => (
              <tr key={s.id}>
                <td className="px-2 py-1.5 text-slate-800">{s.service}</td>
                <td className="px-2 py-1.5 text-slate-600">{s.target.toFixed(2)}%</td>
                <td className={cn("px-2 py-1.5 font-medium",
                  s.status === "critical" ? "text-red-600" : s.status === "degraded" ? "text-amber-600" : "text-green-700")}>
                  {s.attainment.toFixed(2)}%
                </td>
                <td className="px-2 py-1.5 text-slate-600">{s.errorBudgetRemaining}%</td>
                <td className="px-2 py-1.5 text-slate-600">{s.burnRate.toFixed(1)}x</td>
                <td className="px-2 py-1.5 text-slate-600">{s.owner}</td>
              </tr>
            ))}
          </TableShell>
        )}
    </OpsPanel>
  );
}

export function ServiceReliabilitySummary({
  services, loading, className,
}: PanelBaseProps & { services: ServiceReliabilityRecord[] }) {
  const healthy = services.filter((s) => s.status === "healthy").length;
  const degraded = services.filter((s) => s.status === "degraded").length;
  const down = services.filter((s) => s.status === "critical").length;
  return (
    <OpsPanel title="Service Reliability Summary" subtitle="Customer facing services" className={className}>
      {loading ? <LoadingState rows={4} />
        : services.length === 0 ? <EmptyState message="No services match the selected filters." />
        : (
          <div className="space-y-3">
            <dl className="grid grid-cols-4 gap-2 text-center">
              <Stat label="Services" value={String(services.length)} tone="text-slate-900" />
              <Stat label="Healthy" value={String(healthy)} tone="text-green-700" />
              <Stat label="Degraded" value={String(degraded)} tone="text-amber-600" />
              <Stat label="Down" value={String(down)} tone="text-red-600" />
            </dl>
            <ul className="space-y-1.5">
              {services.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 text-[11.5px]">
                  <span className="truncate text-slate-700">
                    {s.service}{s.criticalJourney ? " · critical journey" : ""}
                  </span>
                  <StatusPill status={s.status} />
                </li>
              ))}
            </ul>
          </div>
        )}
    </OpsPanel>
  );
}

export function OpticalNetworkHealthTable({
  links, terminals, loading, className, onSelectLink,
}: PanelBaseProps & {
  links: OpticalLink[]; terminals: OpticalTerminal[];
  onSelectLink?: (link: OpticalLink) => void;
}) {
  const city = (id: string) => terminals.find((t) => t.id === id)?.city ?? id;
  return (
    <OpsPanel title="Optical Network Health" subtitle="Link level reliability telemetry" className={className}>
      {loading ? <LoadingState rows={6} />
        : links.length === 0 ? <EmptyState message="No optical links match the selected filters." />
        : (
          <TableShell caption="Optical link health"
            headers={["Link", "Route", "Status", "Avail", "Margin", "Util", "BER", "Loss", "Risk", "Customers", "Agent", "Validation"]}>
            {links.map((l) => (
              <tr key={l.id} className="cursor-pointer hover:bg-slate-50" onClick={() => onSelectLink?.(l)}>
                <td className="px-2 py-1.5 font-medium text-slate-800">{l.name}</td>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{city(l.sourceTerminalId)} → {city(l.targetTerminalId)}</td>
                <td className="px-2 py-1.5"><StatusPill status={l.status} /></td>
                <td className="px-2 py-1.5 text-slate-600">{l.availability.toFixed(3)}%</td>
                <td className="px-2 py-1.5 text-slate-600">{l.linkMarginDb.toFixed(1)} dB</td>
                <td className="px-2 py-1.5 text-slate-600">{l.utilizationPercent}%</td>
                <td className="px-2 py-1.5 text-slate-600">{l.bitErrorRate.toExponential(1)}</td>
                <td className="px-2 py-1.5 text-slate-600">{l.packetLossPercent}%</td>
                <td className="px-2 py-1.5"><RiskPill level={l.riskLevel} /></td>
                <td className="px-2 py-1.5 text-slate-600">{l.customersAffected.toLocaleString()}</td>
                <td className="px-2 py-1.5 capitalize text-slate-600">{l.agentActivity?.replace(/-/g, " ") ?? "—"}</td>
                <td className="px-2 py-1.5 capitalize text-slate-600">{l.validationState?.replace(/-/g, " ") ?? "—"}</td>
              </tr>
            ))}
          </TableShell>
        )}
    </OpsPanel>
  );
}

export function CapacityTrafficIntelligence({
  series, loading, className,
}: PanelBaseProps & { series: CapacityPoint[] }) {
  return (
    <OpsPanel title="Capacity and Traffic Intelligence" subtitle="24 hour global view, Tbps" className={className}>
      {loading ? <LoadingState rows={6} />
        : series.length === 0 ? <EmptyState message="No capacity data for the selected time range." />
        : (
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <RTooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="availableCapacity" name="Available capacity" stroke="#94a3b8" fill="#f1f5f9" />
                <Area type="monotone" dataKey="protectedCapacity" name="Protected capacity" stroke="#0f766e" fill="#ccfbf1" />
                <Area type="monotone" dataKey="traffic" name="Traffic" stroke="#2563eb" fill="#dbeafe" />
                <Line type="monotone" dataKey="predictedDemand" name="Predicted demand" stroke="#7c3aed" strokeDasharray="4 3" dot={false} />
                <ReferenceLine y={CAPACITY_WARNING_TBPS} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: "Warning", fontSize: 10, fill: "#b45309" }} />
                <ReferenceLine y={CAPACITY_CRITICAL_TBPS} stroke="#ef4444" strokeDasharray="4 3" label={{ value: "Critical", fontSize: 10, fill: "#b91c1c" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
    </OpsPanel>
  );
}

export function ChangeIntelligencePanel({
  changes, loading, className,
}: PanelBaseProps & { changes: ChangeRecord[] }) {
  return (
    <OpsPanel title="Change Intelligence" subtitle="Next 7 days" className={className}>
      {loading ? <LoadingState rows={4} />
        : changes.length === 0 ? <EmptyState message="No changes scheduled in the selected scope." />
        : (
          <ul className="space-y-2">
            {changes.map((c) => (
              <li key={c.id} className="rounded border border-slate-200 p-2 text-[11.5px]">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-800">{c.title}</span>
                  <RiskPill level={c.risk} />
                </div>
                <p className="mt-0.5 text-slate-500">{c.window} · {c.affectedServices} services · {c.predictedSuccess}% predicted success</p>
              </li>
            ))}
          </ul>
        )}
    </OpsPanel>
  );
}

export function LearningImprovementPanel({
  learnings, loading, className,
}: PanelBaseProps & { learnings: LearningRecord[] }) {
  return (
    <OpsPanel title="Learning and Improvement" subtitle="Continuous" className={className}>
      {loading ? <LoadingState rows={4} />
        : learnings.length === 0 ? <EmptyState message="No learning records in the selected scope." />
        : (
          <ul className="space-y-2">
            {learnings.map((l) => (
              <li key={l.id} className="rounded border border-slate-200 p-2 text-[11.5px]">
                <p className="text-slate-800">{l.title}</p>
                <p className="text-slate-500">{l.category} · {l.createdAt.slice(11, 16)} UTC</p>
                <p className="text-slate-600">{l.detail}</p>
              </li>
            ))}
          </ul>
        )}
    </OpsPanel>
  );
}

export function AgenticOperationalEventStream({
  events, loading, className, telemetryDelayed = false,
}: PanelBaseProps & { events: OperationalEvent[]; telemetryDelayed?: boolean }) {
  return (
    <OpsPanel title="AI Native Operational Event Stream" subtitle="Correlated events and agent activity" className={className}>
      {loading ? <LoadingState rows={5} />
        : events.length === 0 ? <EmptyState message="No events match the selected filters." />
        : (
          <>
            {telemetryDelayed && (
              <p className="mb-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
                Telemetry delayed. Events may be up to 60 seconds behind.
              </p>
            )}
            <TableShell caption="Operational event stream"
              headers={["Timestamp", "Event", "Object", "Agent", "Result", "Confidence", "Evidence"]}>
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-2 py-1.5 text-slate-500">{e.timestamp.slice(11, 16)} UTC</td>
                  <td className="px-2 py-1.5 font-medium text-slate-800">{e.event}</td>
                  <td className="px-2 py-1.5 text-slate-600">{e.object}</td>
                  <td className="px-2 py-1.5 text-purple-700">{e.agent}</td>
                  <td className="px-2 py-1.5 text-slate-600">{e.result}</td>
                  <td className="px-2 py-1.5 text-slate-600">{Math.round(e.confidence * 100)}%</td>
                  <td className="px-2 py-1.5 text-slate-500">{e.evidence}</td>
                </tr>
              ))}
            </TableShell>
          </>
        )}
    </OpsPanel>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10.5px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded border border-slate-200 py-1.5">
      <dt className="text-[10px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={cn("text-[15px] font-semibold", tone)}>{value}</dd>
    </div>
  );
}
