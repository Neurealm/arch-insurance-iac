// Prompt 0G — reusable production components. Typed props only, no page seeds.

import React, { useState, useMemo, Suspense, lazy } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSiliconStore } from "@/silicon/state/SiliconStore";
import type {
  EntityKind, StatusColor, Severity, Confidence, RegisterAccess,
  FormalStatus, SignoffState, EvidenceCitation, CoverageBin,
} from "@/silicon/domain/types";

const TONE: Record<StatusColor, string> = {
  green: "bg-emerald-100 text-emerald-800 border-emerald-200",
  yellow:"bg-amber-100 text-amber-800 border-amber-200",
  red:   "bg-rose-100 text-rose-800 border-rose-200",
  gray:  "bg-slate-100 text-slate-700 border-slate-200",
  blue:  "bg-sky-100 text-sky-800 border-sky-200",
};

const SEV: Record<Severity, StatusColor> = { info: "blue", low: "gray", medium: "yellow", high: "yellow", critical: "red" };

const Card = ({ title, children, actions }: { title?: string; children: React.ReactNode; actions?: React.ReactNode }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    {(title || actions) && (
      <div className="mb-3 flex items-center justify-between">
        {title ? <h3 className="text-sm font-semibold text-slate-800">{title}</h3> : <span />}
        {actions}
      </div>
    )}
    {children}
  </div>
);

const HelpTip = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <TooltipProvider delayDuration={150}>
    <Tooltip>
      <TooltipTrigger asChild><span className="cursor-help underline decoration-dotted decoration-slate-400 underline-offset-2">{children}</span></TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">{label}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/* ─────────────── KPI ─────────────── */

export interface KpiCardProps { label: string; value: string | number; tone?: StatusColor; help?: string; footnote?: string; }
export const KpiCard: React.FC<KpiCardProps> = ({ label, value, tone = "gray", help, footnote }) => (
  <div className={`rounded-lg border p-3 ${TONE[tone]}`}>
    <div className="text-xs font-medium opacity-80">
      {help ? <HelpTip label={help}>{label}</HelpTip> : label}
    </div>
    <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    {footnote && <div className="mt-1 text-[11px] opacity-70">{footnote}</div>}
  </div>
);

export interface KpiTrendCardProps extends KpiCardProps { series: number[]; }
export const KpiTrendCard: React.FC<KpiTrendCardProps> = (p) => {
  const max = Math.max(1, ...p.series);
  return (
    <div className={`rounded-lg border p-3 ${TONE[p.tone ?? "gray"]}`}>
      <div className="text-xs font-medium opacity-80">{p.help ? <HelpTip label={p.help}>{p.label}</HelpTip> : p.label}</div>
      <div className="mt-1 flex items-baseline gap-3">
        <div className="text-2xl font-semibold tabular-nums">{p.value}</div>
        <svg width="80" height="24" className="opacity-80">
          {p.series.map((v, i) => {
            const x = (i / Math.max(1, p.series.length - 1)) * 80;
            const y = 24 - (v / max) * 22 - 1;
            return <circle key={i} cx={x} cy={y} r={1.5} fill="currentColor" />;
          })}
          <polyline fill="none" stroke="currentColor" strokeWidth={1}
            points={p.series.map((v, i) => `${(i / Math.max(1, p.series.length - 1)) * 80},${24 - (v / max) * 22 - 1}`).join(" ")} />
        </svg>
      </div>
      {p.footnote && <div className="mt-1 text-[11px] opacity-70">{p.footnote}</div>}
    </div>
  );
};

/* ─────────────── Badges & indicators ─────────────── */

export const StatusBadge: React.FC<{ tone?: StatusColor; children: React.ReactNode; help?: string }> = ({ tone = "gray", children, help }) => (
  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONE[tone]}`}>
    {help ? <HelpTip label={help}>{children}</HelpTip> : children}
  </span>
);

export const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => (
  <StatusBadge tone={SEV[severity]}>{severity}</StatusBadge>
);

export const ThresholdIndicator: React.FC<{ value: number; threshold: number; label: string; unit?: string }> = ({ value, threshold, label, unit = "%" }) => {
  const ok = value >= threshold;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold tabular-nums">{value}{unit}</span>
      <span className="text-slate-400">/ {threshold}{unit}</span>
    </div>
  );
};

export const EngineeringGauge: React.FC<{ value: number; label: string; help?: string }> = ({ value, label, help }) => (
  <Card title={label}>
    <div className="flex items-end justify-between">
      <div className="text-3xl font-bold tabular-nums text-slate-800">{value.toFixed(1)}<span className="text-base font-normal text-slate-500">%</span></div>
      {help && <div className="text-[11px] text-slate-500"><HelpTip label={help}>info</HelpTip></div>}
    </div>
    <div className="mt-3 h-2 rounded bg-slate-100">
      <div className="h-2 rounded bg-sky-500" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  </Card>
);

export const ConfidenceIndicator: React.FC<{ confidence: Confidence }> = ({ confidence }) => {
  const tone: StatusColor = confidence.band === "high" ? "green" : confidence.band === "medium" ? "yellow" : "gray";
  return <StatusBadge tone={tone}>Confidence {confidence.band} · {(confidence.value * 100).toFixed(0)}%</StatusBadge>;
};

/* ─────────────── Traceability / graphs ─────────────── */

export interface TraceabilityMatrixProps {
  rowLabel: string; colLabel: string;
  rows: { id: string; label: string }[];
  cols: { id: string; label: string }[];
  cells: { rowId: string; colId: string; status: "ok" | "partial" | "missing" }[];
}
export const TraceabilityMatrix: React.FC<TraceabilityMatrixProps> = ({ rowLabel, colLabel, rows, cols, cells }) => (
  <Card title={`Traceability: ${rowLabel} × ${colLabel}`}>
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-[11px]">
        <thead>
          <tr>
            <th className="border-b border-slate-200 p-1 text-left text-slate-500">{rowLabel}</th>
            {cols.map(c => <th key={c.id} className="border-b border-slate-200 p-1 text-left text-slate-500">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="border-b border-slate-100 p-1 font-mono text-slate-700">{r.label}</td>
              {cols.map(c => {
                const cell = cells.find(x => x.rowId === r.id && x.colId === c.id);
                const bg = cell?.status === "ok" ? "bg-emerald-400" : cell?.status === "partial" ? "bg-amber-400" : "bg-slate-100";
                return <td key={c.id} className="border-b border-slate-100 p-1"><span className={`inline-block h-3 w-3 rounded ${bg}`} /></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

export interface DependencyGraphProps { nodes: { id: string; label: string }[]; edges: { from: string; to: string }[]; }
export const DependencyGraph: React.FC<DependencyGraphProps> = ({ nodes, edges }) => {
  // Very lightweight radial layout — enough to visualize small graphs.
  const R = 90; const cx = 140; const cy = 100;
  const positions = nodes.map((n, i) => {
    const a = (i / nodes.length) * Math.PI * 2;
    return { id: n.id, label: n.label, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });
  const pos = (id: string) => positions.find(p => p.id === id)!;
  return (
    <Card title="Dependency graph">
      <svg viewBox="0 0 280 200" className="w-full h-48">
        {edges.map((e, i) => { const a = pos(e.from), b = pos(e.to); if (!a || !b) return null;
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#94a3b8" strokeWidth={1} />; })}
        {positions.map(p => (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={6} fill="#0284c7" />
            <text x={p.x + 8} y={p.y + 3} fontSize={9} fill="#334155">{p.label}</text>
          </g>
        ))}
      </svg>
    </Card>
  );
};

/* ─────────────── Timelines & lifecycles ─────────────── */

export interface LifecycleTimelineProps { steps: { label: string; state: "done" | "active" | "todo" }[]; }
export const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({ steps }) => (
  <Card title="Lifecycle">
    <ol className="flex items-center gap-2 overflow-x-auto text-[11px]">
      {steps.map((s, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${s.state === "done" ? "bg-emerald-500" : s.state === "active" ? "bg-sky-500" : "bg-slate-300"}`} />
          <span className={s.state === "todo" ? "text-slate-400" : "text-slate-700"}>{s.label}</span>
          {i < steps.length - 1 && <span className="text-slate-300">→</span>}
        </li>
      ))}
    </ol>
  </Card>
);

export interface MilestoneTimelineProps { items: { name: string; targetDate: string; status: StatusColor }[]; }
export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ items }) => (
  <Card title="Program milestones">
    <ol className="space-y-2">
      {items.map((m, i) => (
        <li key={i} className="flex items-center justify-between rounded border border-slate-100 px-3 py-2">
          <div className="flex items-center gap-3">
            <StatusBadge tone={m.status}>{m.status}</StatusBadge>
            <span className="text-sm font-medium text-slate-800">{m.name}</span>
          </div>
          <span className="text-xs tabular-nums text-slate-500">{m.targetDate}</span>
        </li>
      ))}
    </ol>
  </Card>
);

export const AuditTimeline: React.FC<{ items: { at: string; who: string; action: string }[] }> = ({ items }) => (
  <Card title="Audit trail">
    <ol className="space-y-1 text-xs">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <span className="tabular-nums text-slate-400">{it.at}</span>
          <span className="font-medium text-slate-700">{it.who}</span>
          <span className="text-slate-600">{it.action}</span>
        </li>
      ))}
    </ol>
  </Card>
);

export interface ScenarioTimelineControlProps { scenarios: { id: string; label: string }[]; activeId: string; onSelect: (id: string) => void; }
export const ScenarioTimelineControl: React.FC<ScenarioTimelineControlProps> = ({ scenarios, activeId, onSelect }) => (
  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
    {scenarios.map(s => (
      <button key={s.id} onClick={() => onSelect(s.id)}
        className={`rounded px-3 py-1 text-xs font-medium transition ${s.id === activeId ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
        {s.label}
      </button>
    ))}
  </div>
);

/* ─────────────── Content cards ─────────────── */

export const RequirementCard: React.FC<{ id: string; title: string; category: string; priority: Severity; status: string; onOpen?: () => void }> = (p) => (
  <button onClick={p.onOpen} className="block w-full rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-sky-300">
    <div className="flex items-center justify-between">
      <span className="font-mono text-[11px] text-slate-500">{p.id}</span>
      <SeverityBadge severity={p.priority} />
    </div>
    <div className="mt-1 text-sm font-medium text-slate-800">{p.title}</div>
    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
      <span>{p.category}</span><span>·</span><span>{p.status}</span>
    </div>
  </button>
);

export const SpecificationSectionCard: React.FC<{ section: string; title: string; version: string }> = (p) => (
  <Card title={`§${p.section} · ${p.title}`}><div className="text-xs text-slate-500">Spec version {p.version}</div></Card>
);

export interface ModuleHierarchyTreeProps { nodes: { id: string; name: string; parentId?: string }[]; onOpen?: (id: string) => void; }
export const ModuleHierarchyTree: React.FC<ModuleHierarchyTreeProps> = ({ nodes, onOpen }) => {
  const roots = nodes.filter(n => !n.parentId);
  const children = (id: string) => nodes.filter(n => n.parentId === id);
  const render = (n: { id: string; name: string }) => (
    <li key={n.id} className="ml-3">
      <button onClick={() => onOpen?.(n.id)} className="font-mono text-xs text-slate-700 hover:text-sky-700">{n.name}</button>
      {children(n.id).length > 0 && <ul className="border-l border-slate-200 pl-2">{children(n.id).map(render)}</ul>}
    </li>
  );
  return <Card title="RTL module hierarchy"><ul>{roots.map(render)}</ul></Card>;
};

export interface InterfaceDiagramProps { interfaces: { name: string; protocol: string; width: number }[]; }
export const InterfaceDiagram: React.FC<InterfaceDiagramProps> = ({ interfaces }) => (
  <Card title="Interfaces">
    <div className="grid grid-cols-2 gap-2 text-xs">
      {interfaces.map(i => (
        <div key={i.name} className="rounded border border-slate-200 p-2">
          <div className="font-mono text-slate-800">{i.name}</div>
          <div className="text-slate-500">{i.protocol} · {i.width}b</div>
        </div>
      ))}
    </div>
  </Card>
);

export interface RegisterMapTableProps { registers: { name: string; offset: string; access: RegisterAccess; resetValue: string; description: string }[]; }
export const RegisterMapTable: React.FC<RegisterMapTableProps> = ({ registers }) => (
  <Card title="Register map">
    <table className="w-full text-[11px]">
      <thead className="text-left text-slate-500">
        <tr><th className="py-1">Offset</th><th>Name</th><th>Access</th><th>Reset</th><th>Description</th></tr>
      </thead>
      <tbody>
        {registers.map(r => (
          <tr key={r.name} className="border-t border-slate-100">
            <td className="py-1 font-mono">{r.offset}</td>
            <td className="font-mono">{r.name}</td>
            <td>
              <HelpTip label={
                r.access === "RO"  ? "Read-only." :
                r.access === "RW"  ? "Read/write." :
                r.access === "W1C" ? "Write-1-to-clear: writing 1 clears the corresponding bit; writing 0 has no effect." :
                                     "Write-only."
              }>{r.access}</HelpTip>
            </td>
            <td className="font-mono">{r.resetValue}</td>
            <td className="text-slate-600">{r.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

/* ─────────────── Regression / coverage / formal ─────────────── */

export const RegressionHeatmap: React.FC<{ suites: { name: string; pass: number; fail: number; abort: number }[] }> = ({ suites }) => (
  <Card title="Regression heatmap">
    <div className="space-y-1">
      {suites.map(s => {
        const total = s.pass + s.fail + s.abort || 1;
        return (
          <div key={s.name} className="flex items-center gap-2 text-[11px]">
            <span className="w-32 truncate text-slate-600">{s.name}</span>
            <div className="flex h-3 flex-1 overflow-hidden rounded">
              <div className="bg-emerald-500" style={{ width: `${(s.pass / total) * 100}%` }} />
              <div className="bg-rose-500"    style={{ width: `${(s.fail / total) * 100}%` }} />
              <div className="bg-amber-400"   style={{ width: `${(s.abort / total) * 100}%` }} />
            </div>
            <span className="w-24 tabular-nums text-slate-500">
              <HelpTip label="Failures include real design failures. Aborts are counted separately and include infrastructure aborts.">
                {s.pass}/{s.pass + s.fail + s.abort}
              </HelpTip>
            </span>
          </div>
        );
      })}
    </div>
  </Card>
);

export const FailureClusterCard: React.FC<{ label: string; count: number; hint: string }> = ({ label, count, hint }) => (
  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
    <div className="flex items-center justify-between">
      <div className="text-sm font-semibold text-rose-800">{label}</div>
      <span className="rounded bg-rose-200 px-2 py-0.5 text-[11px] font-medium text-rose-900">{count} failures</span>
    </div>
    <div className="mt-1 text-xs text-rose-800/80">{hint}</div>
  </div>
);

export const CoverageProgressCard: React.FC<{ percent: number; threshold: number; updatedAt: string }> = ({ percent, threshold, updatedAt }) => (
  <Card title={<HelpTip label={`Aggregate coverage across line, toggle, FSM, and functional bins. Threshold: ${threshold}%. Updated ${updatedAt}. Source: sim + regression merge.`}>Coverage</HelpTip> as any}>
    <div className="text-3xl font-bold tabular-nums text-slate-800">{percent.toFixed(1)}%</div>
    <ThresholdIndicator value={percent} threshold={threshold} label="Sign-off gate" />
  </Card>
);

export const CoverageSunburst: React.FC<{ bins: CoverageBin[] }> = ({ bins }) => {
  const total = bins.reduce((a, b) => a + b.goal, 0) || 1;
  let acc = 0;
  return (
    <Card title="Coverage by bin">
      <svg viewBox="-60 -60 120 120" className="mx-auto h-40 w-40">
        {bins.map((b, i) => {
          const start = (acc / total) * Math.PI * 2; acc += b.goal;
          const end = (acc / total) * Math.PI * 2;
          const large = end - start > Math.PI ? 1 : 0;
          const r = 40, ri = 22;
          const x1 = Math.cos(start) * r, y1 = Math.sin(start) * r;
          const x2 = Math.cos(end) * r,   y2 = Math.sin(end) * r;
          const x3 = Math.cos(end) * ri,  y3 = Math.sin(end) * ri;
          const x4 = Math.cos(start) * ri,y4 = Math.sin(start) * ri;
          const pct = Math.min(1, b.hits / Math.max(1, b.goal));
          const fill = pct >= 0.9 ? "#10b981" : pct >= 0.75 ? "#f59e0b" : "#ef4444";
          return <path key={i} fill={fill} d={`M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${ri},${ri} 0 ${large} 0 ${x4},${y4} Z`} />;
        })}
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
        {bins.map(b => <div key={b.id} className="flex justify-between text-slate-600"><span>{b.label}</span><span className="tabular-nums">{Math.round((b.hits / b.goal) * 100)}%</span></div>)}
      </div>
    </Card>
  );
};

const FORMAL_TONE: Record<FormalStatus, StatusColor> = { proven: "green", failed: "red", inconclusive: "yellow", vacuous: "gray", "not-run": "gray" };
export const FormalPropertyTable: React.FC<{ items: { name: string; status: FormalStatus; runtimeSec: number }[] }> = ({ items }) => (
  <Card title="Formal properties">
    <table className="w-full text-[11px]">
      <thead className="text-left text-slate-500"><tr><th>Property</th><th>Status</th><th>Runtime</th></tr></thead>
      <tbody>
        {items.map(p => (
          <tr key={p.name} className="border-t border-slate-100">
            <td className="py-1 font-mono">{p.name}</td>
            <td>
              <StatusBadge tone={FORMAL_TONE[p.status]} help={
                p.status === "proven"       ? "Property holds across all reachable states within the assumed constraints." :
                p.status === "failed"       ? "Solver found a counter-example. See waveform." :
                p.status === "inconclusive" ? "Solver hit resource limits without a decision." :
                p.status === "vacuous"      ? "Property is trivially true because its assumptions are never met — usually a bug in the assertion." :
                                              "Not run in this regression."
              }>{p.status}</StatusBadge>
            </td>
            <td className="tabular-nums text-slate-500">{p.runtimeSec}s</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

export const StaticFindingTable: React.FC<{ items: { rule: string; severity: Severity; line: number; message: string; state: string }[] }> = ({ items }) => (
  <Card title="Static findings">
    <table className="w-full text-[11px]">
      <thead className="text-left text-slate-500"><tr><th>Rule</th><th>Sev</th><th>Line</th><th>State</th><th>Message</th></tr></thead>
      <tbody>
        {items.map(f => (
          <tr key={f.rule + f.line} className="border-t border-slate-100">
            <td className="py-1 font-mono">{f.rule}</td>
            <td><SeverityBadge severity={f.severity} /></td>
            <td className="tabular-nums">{f.line}</td>
            <td>{f.state}</td>
            <td className="text-slate-600">{f.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

/* ─────────────── Waveform (lazy) ─────────────── */

const LazyWaveInner = lazy(async () => {
  const mod = await import("@/silicon/data/canonical/waveformSamples");
  const Inner: React.FC<{ signals: string[] }> = ({ signals }) => (
    <div>
      <div className="mb-1 text-[11px] italic text-slate-500">{mod.SYNTHETIC_LABEL}</div>
      <div className="space-y-1">
        {signals.map(name => {
          const trace = mod.syntheticWaveforms[name];
          if (!trace) return <div key={name} className="text-[11px] text-slate-400">no trace: {name}</div>;
          return (
            <div key={name} className="flex items-center gap-2 text-[10px]">
              <span className="w-32 truncate font-mono text-slate-600">{name}</span>
              <svg width="240" height="14" className="flex-1">
                <path d={buildWavePath(trace.samples)} stroke="#0369a1" fill="none" strokeWidth={1} />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
  return { default: Inner };
});

function buildWavePath(samples: (0 | 1)[]): string {
  const step = 240 / samples.length; let d = ""; let px = 0;
  samples.forEach((v, i) => {
    const x = i * step; const y = v ? 2 : 12;
    d += (i === 0 ? `M${x},${y}` : ` L${x},${y}`);
    if (i > 0 && samples[i - 1] !== v) d = d.replace(/L(\S+),(\S+)$/, (_, a) => `L${a},${samples[i-1] ? 2 : 12} L${a},${y}`);
    px = x;
  });
  d += ` L${240},${samples[samples.length - 1] ? 2 : 12}`; void px; return d;
}

export const WaveformPreview: React.FC<{ signals?: string[] }> = ({
  signals = ["ring_wrap","wr_rsp_pending","completion_accept","irq_coalesce_hit","fetch_head","committed_head","descriptor_seq","completion_valid"],
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Card title="Waveform preview" actions={
      <button onClick={() => setOpen(o => !o)} className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50">
        {open ? "Hide" : "Load preview"}
      </button>
    }>
      {!open ? (
        <div className="text-xs text-slate-500">Preview data is synthetic and only loaded on demand.</div>
      ) : (
        <Suspense fallback={<div className="text-xs text-slate-400">Loading waveform…</div>}>
          <LazyWaveInner signals={signals} />
        </Suspense>
      )}
    </Card>
  );
};

/* ─────────────── Logs / diff / change impact ─────────────── */

export const LogEvidencePanel: React.FC<{ lines: { at: string; level: "info" | "warn" | "error"; text: string }[] }> = ({ lines }) => (
  <Card title="Log evidence">
    <pre className="max-h-40 overflow-auto rounded bg-slate-950 p-2 font-mono text-[10.5px] leading-relaxed text-slate-100">
      {lines.map((l, i) => `${l.at}  [${l.level.padEnd(5)}] ${l.text}`).join("\n")}
    </pre>
  </Card>
);

export const CodeDiffViewer: React.FC<{ path: string; hunks: { minus: string[]; plus: string[] }[] }> = ({ path, hunks }) => (
  <Card title={`Diff · ${path}`}>
    <div className="space-y-2 font-mono text-[11px]">
      {hunks.map((h, i) => (
        <div key={i} className="rounded border border-slate-200">
          {h.minus.map((l, j) => <div key={"m"+j} className="bg-rose-50 px-2 text-rose-800">- {l}</div>)}
          {h.plus.map((l, j) => <div key={"p"+j} className="bg-emerald-50 px-2 text-emerald-800">+ {l}</div>)}
        </div>
      ))}
    </div>
  </Card>
);

export const ChangeImpactGraph: React.FC<{ changeTitle: string; impactedModules: string[] }> = ({ changeTitle, impactedModules }) => (
  <Card title={`Change impact: ${changeTitle}`}>
    <div className="flex flex-wrap gap-2 text-xs">
      {impactedModules.map(m => <span key={m} className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">{m}</span>)}
    </div>
  </Card>
);

/* ─────────────── Sign-off / compute ─────────────── */

const SIGNOFF_TONE: Record<SignoffState, StatusColor> = { "not-started": "gray", "in-review": "yellow", conditional: "yellow", approved: "green", blocked: "red" };
export const SignoffGateCard: React.FC<{ name: string; state: SignoffState; criteria: { label: string; passing: boolean }[] }> = ({ name, state, criteria }) => (
  <Card title={name} actions={<StatusBadge tone={SIGNOFF_TONE[state]}>{state}</StatusBadge>}>
    <ul className="space-y-1 text-xs">
      {criteria.map((c, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${c.passing ? "bg-emerald-500" : "bg-slate-300"}`} />
          <span className={c.passing ? "text-slate-700" : "text-slate-500"}>{c.label}</span>
        </li>
      ))}
    </ul>
  </Card>
);

export const ComputeQueueChart: React.FC<{ pool: string; queued: number; running: number; capacity: number }[] | any> = ({ pools = [
  { pool: "sim-farm-a", queued: 32, running: 128, capacity: 160 },
  { pool: "formal-farm", queued: 4, running: 12, capacity: 16 },
] }: any) => (
  <Card title="Compute queue">
    <div className="space-y-2 text-xs">
      {(pools as any[]).map(p => (
        <div key={p.pool}>
          <div className="flex justify-between text-slate-600"><span>{p.pool}</span><span className="tabular-nums">{p.running}/{p.capacity} · q{p.queued}</span></div>
          <div className="mt-1 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-sky-500" style={{ width: `${(p.running / p.capacity) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  </Card>
);

/* ─────────────── AI reasoning ─────────────── */

export interface AIReasoningPanelProps {
  trigger: string; facts: string[]; evidence: EvidenceCitation[]; inference: string;
  alternatives: string[]; confidence: Confidence; recommendation: string; expectedEffect: string; risk: string;
  humanReviewer?: string; approvalStatus: "pending" | "approved" | "denied";
}
export const AIReasoningPanel: React.FC<AIReasoningPanelProps> = (p) => (
  <Card title="AI reasoning" actions={<ConfidenceIndicator confidence={p.confidence} />}>
    <dl className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
      <Section label="Trigger">{p.trigger}</Section>
      <Section label="Facts"><ul className="list-disc pl-4">{p.facts.map((f,i)=><li key={i}>{f}</li>)}</ul></Section>
      <Section label="Evidence"><EvidenceCitationList items={p.evidence} /></Section>
      <Section label="Inference">{p.inference}</Section>
      <Section label="Alternative hypotheses"><ul className="list-disc pl-4">{p.alternatives.map((a,i)=><li key={i}>{a}</li>)}</ul></Section>
      <Section label="Recommendation">{p.recommendation}</Section>
      <Section label="Expected effect">{p.expectedEffect}</Section>
      <Section label="Risk">{p.risk}</Section>
      <Section label="Human reviewer">{p.humanReviewer ?? "unassigned"}</Section>
      <Section label="Approval">
        <StatusBadge tone={p.approvalStatus === "approved" ? "green" : p.approvalStatus === "denied" ? "red" : "yellow"}>{p.approvalStatus}</StatusBadge>
      </Section>
    </dl>
    <div className="mt-2 text-[10px] italic text-slate-400">Structured summary only. Hidden chain-of-thought is not exposed.</div>
  </Card>
);

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="rounded border border-slate-100 p-2">
    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    <div className="text-slate-700">{children}</div>
  </div>
);

export const EvidenceCitationList: React.FC<{ items: EvidenceCitation[] }> = ({ items }) => (
  <ul className="space-y-1">
    {items.map(e => (
      <li key={e.id} className="flex items-center gap-2 text-[11px]">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">{e.kind}</span>
        <span className="text-slate-700">{e.label}</span>
      </li>
    ))}
  </ul>
);

export const HumanApprovalPanel: React.FC<{ reviewer?: string; state: "pending" | "approved" | "denied"; actions: string[]; onAction?: (a: string) => void }> = ({ reviewer, state, actions, onAction }) => (
  <Card title="Human approval">
    <div className="mb-2 text-xs text-slate-600">Reviewer: <span className="font-medium">{reviewer ?? "unassigned"}</span></div>
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge tone={state === "approved" ? "green" : state === "denied" ? "red" : "yellow"}>{state}</StatusBadge>
      {actions.map(a => <button key={a} onClick={() => onAction?.(a)} className="rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-50">{a}</button>)}
    </div>
  </Card>
);

/* ─────────────── Screen context (persona banner) ─────────────── */

export const ScreenContextPanel: React.FC = () => {
  const scenario = useSiliconStore(s => s.selectedScenarioId);
  const persona = useSiliconStore(s => s.selectedPersonaId);
  const time = useSiliconStore(s => s.selectedTime);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
      <span><HelpTip label="Selecting a scenario freezes derived data across the app; canonical seed data is never mutated.">Scenario</HelpTip>: <b className="text-slate-800">{scenario}</b></span>
      <span>·</span>
      <span>Persona: <b className="text-slate-800">{persona}</b></span>
      <span>·</span>
      <span>Time: <b className="text-slate-800">{time}</b></span>
    </div>
  );
};

/* ─────────────── Filter framework ─────────────── */

export { FilterBar, useFilters } from "./filters";

/* ─────────────── Barrel exports ─────────────── */

export type { EntityKind };
