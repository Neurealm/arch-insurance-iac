import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Beaker, Workflow, Users, Sliders, Award, ClipboardList, ChevronRight,
  Play, RotateCcw, ShieldCheck, AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";
import {
  simulations, digitalCoworkers, workforceActivity, dependencyLayers,
  dependencyPaths, blastRadiusByComponent, transformationStates,
  valueMetrics, executiveReadout, remediationTimeline, transformationTimeline,
  valueTimeline, engagementPrompts, workshopOutput, type Simulation, type Coworker,
} from "@/data/sreTwinData";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/85 backdrop-blur-sm border border-slate-200/80 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] ${className}`}>
      {children}
    </div>
  );
}

const sevTone: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Critical: "bg-red-50 text-red-700 border-red-200",
};

const cwTone: Record<string, string> = {
  Idle: "bg-slate-50 text-slate-600 border-slate-200",
  Monitoring: "bg-sky-50 text-sky-700 border-sky-200",
  Investigating: "bg-violet-50 text-violet-700 border-violet-200",
  Recommending: "bg-amber-50 text-amber-700 border-amber-200",
  Executing: "bg-blue-50 text-blue-700 border-blue-200",
  "Waiting for Approval": "bg-orange-50 text-orange-700 border-orange-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

/* ============ Resilience Lab ============ */
export function ResilienceLabController({
  active, onInject, onRecover, onReset,
}: {
  active: string | null;
  onInject: (s: Simulation) => void;
  onRecover: () => void;
  onReset: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(active);
  const sel = simulations.find((s) => s.id === (openId ?? active)) ?? simulations[0];
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 grid place-items-center">
            <Beaker className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Resilience Lab</div>
            <div className="text-[11px] text-slate-500">Simulate production failures and observe SRE response</div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={onRecover} className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
            Run Recovery
          </button>
          <button onClick={onReset} className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>
      <div className="grid grid-cols-[260px_1fr] gap-3">
        <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
          {simulations.map((s) => {
            const isActive = (openId ?? active) === s.id;
            return (
              <button key={s.id} onClick={() => setOpenId(s.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg border text-[12px] transition flex items-center justify-between gap-2 ${
                  isActive ? "bg-sky-50 border-sky-200 text-sky-800" : "bg-white border-slate-200 hover:border-sky-200 text-slate-700"
                }`}>
                <span className="truncate">{s.name}</span>
                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border ${sevTone[s.severity]}`}>{s.severity}</span>
              </button>
            );
          })}
        </div>
        <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50/60 to-white p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Selected Simulation</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">{sel.name}</div>
              <p className="text-[12px] text-slate-600 mt-1">{sel.description}</p>
            </div>
            <button onClick={() => onInject(sel)}
              className="shrink-0 text-[11px] px-2.5 py-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1">
              <Play className="w-3 h-3" /> Inject Failure
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-3 text-[11px]">
            {[
              ["Severity", sel.severity], ["Blast radius", sel.blastRadius],
              ["Customer impact", sel.customerImpact], ["SLO impact", sel.sloImpact],
              ["MTTR forecast", sel.mttrForecast], ["Runbook", sel.runbook],
              ["Automation", sel.automation], ["Approval", sel.approval],
              ["Rollback", sel.rollback],
            ].map(([k, v]) => (
              <div key={k} className="px-2 py-1.5 rounded bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500">{k}</div>
                <div className="text-[11px] font-medium text-slate-800 leading-tight">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ============ Digital Workforce ============ */
export function DigitalWorkforcePanel({
  onSelect, activeId,
}: { onSelect: (c: Coworker) => void; activeId?: string | null }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 grid place-items-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Digital Workforce</div>
            <div className="text-[11px] text-slate-500">Human + agent collaboration with approval guardrails</div>
          </div>
        </div>
        <span className="text-[10px] text-slate-500">{digitalCoworkers.length} coworkers</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        {digitalCoworkers.map((c) => {
          const active = activeId === c.id;
          return (
            <button key={c.id} onClick={() => onSelect(c)}
              className={`text-left p-2.5 rounded-lg border transition ${
                active ? "border-sky-300 bg-sky-50/60 shadow-sm" : "border-slate-200 bg-white hover:border-sky-200"
              }`}>
              <div className="flex items-center justify-between gap-1">
                <div className="text-[12px] font-medium text-slate-900 truncate">{c.name}</div>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">{c.role}</div>
              <div className="mt-1.5 flex items-center justify-between gap-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${cwTone[c.status]}`}>{c.status}</span>
                <span className="text-[10px] text-slate-500">{c.confidence}%</span>
              </div>
              <div className="mt-1.5 text-[10px] text-slate-600 leading-snug line-clamp-2">{c.activity}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Digital Workforce Activity</div>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>{["Time", "Agent", "Action", "Evidence", "Recommendation", "Confidence", "Approval"].map(h =>
                <th key={h} className="text-left font-medium px-2.5 py-1.5">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {workforceActivity.map((a, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-2.5 py-1.5 text-slate-500">{a.t}</td>
                  <td className="px-2.5 py-1.5 font-medium text-slate-800">{a.agent}</td>
                  <td className="px-2.5 py-1.5 text-slate-700">{a.action}</td>
                  <td className="px-2.5 py-1.5 text-slate-600">{a.evidence}</td>
                  <td className="px-2.5 py-1.5 text-slate-600">{a.recommendation}</td>
                  <td className="px-2.5 py-1.5 text-slate-700">{a.confidence}%</td>
                  <td className="px-2.5 py-1.5 text-slate-600">{a.approval}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

/* ============ Dependency Map ============ */
export function DependencyMapPanel({
  selectedComponent, onSelectComponent,
}: { selectedComponent: string | null; onSelectComponent: (id: string) => void }) {
  const [layer, setLayer] = useState<"all" | "infrastructure" | "service" | "business">("all");
  const blast = selectedComponent ? blastRadiusByComponent[selectedComponent] : null;
  const path = selectedComponent ? dependencyPaths[selectedComponent] : null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 grid place-items-center">
            <Workflow className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Dependency Map</div>
            <div className="text-[11px] text-slate-500">Infrastructure → Service → Business Capability</div>
          </div>
        </div>
        <div className="flex gap-1">
          {(["all", "infrastructure", "service", "business"] as const).map((l) => (
            <button key={l} onClick={() => setLayer(l)}
              className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${
                layer === l ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-200"
              }`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["infrastructure", "service", "business"] as const).map((key) => {
          const dim = layer !== "all" && layer !== key;
          const titles = { infrastructure: "Infrastructure Layer", service: "Service Layer", business: "Business Capability Layer" };
          const tone = { infrastructure: "sky", service: "violet", business: "emerald" }[key];
          return (
            <div key={key} className={`rounded-lg border border-slate-200 p-3 bg-white ${dim ? "opacity-40" : ""}`}>
              <div className={`text-[10px] uppercase tracking-wider font-semibold text-${tone}-700 mb-2`}>{titles[key]}</div>
              <div className="space-y-1">
                {dependencyLayers[key].map((n) => {
                  const active = key === "infrastructure" && n.id === selectedComponent;
                  return (
                    <button key={n.id}
                      onClick={() => key === "infrastructure" && onSelectComponent(n.id)}
                      className={`w-full text-left text-[12px] px-2 py-1 rounded border transition ${
                        active ? "border-sky-400 bg-sky-50 text-sky-800" : "border-slate-100 bg-slate-50/40 text-slate-700 hover:bg-slate-50"
                      }`}>{n.label}</button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-gradient-to-br from-sky-50/40 to-white p-3.5">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Blast Radius</div>
        {!selectedComponent ? (
          <div className="text-[12px] text-slate-500 mt-1">Select an infrastructure component to trace impact across services and business capabilities.</div>
        ) : (
          <>
            <div className="mt-1 text-sm font-semibold text-slate-900">{selectedComponent.toUpperCase()}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-[11px]">
              {path && (
                <>
                  <div className="px-2 py-1.5 rounded bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-500">Dependent services</div>
                    <div className="text-[11px] text-slate-800">{path.services.join(", ")}</div>
                  </div>
                  <div className="px-2 py-1.5 rounded bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-500">Business capabilities</div>
                    <div className="text-[11px] text-slate-800">{path.capabilities.join(", ")}</div>
                  </div>
                </>
              )}
              {blast && Object.entries({
                "Users affected": blast.users, "Revenue at risk": blast.revenue,
                "Customer experience": blast.cx, "Risk severity": blast.severity,
                "Service owner": blast.serviceOwner, "Comms owner": blast.commsOwner,
              }).map(([k, v]) => (
                <div key={k} className="px-2 py-1.5 rounded bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500">{k}</div>
                  <div className="text-[11px] text-slate-800">{v}</div>
                </div>
              ))}
              {blast && (
                <div className="px-2 py-1.5 rounded bg-white border border-slate-200 md:col-span-3">
                  <div className="text-[10px] text-slate-500">Recommended SRE action</div>
                  <div className="text-[11px] text-slate-800">{blast.action}</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

/* ============ Transformation ============ */
export function TransformationSlider({
  value, onChange,
}: { value: number; onChange: (v: number) => void }) {
  const phase = value < 34 ? "current" : value < 67 ? "transition" : "target";
  const info = transformationStates[phase];
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 grid place-items-center">
          <Sliders className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Target State Transformation</div>
          <div className="text-[11px] text-slate-500">Move from reactive operations to proactive reliability engineering</div>
        </div>
      </div>

      <div className="px-1">
        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
          <span>0 · Current</span><span>50 · Transition</span><span>100 · Target</span>
        </div>
        <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full mt-1 accent-indigo-600" />
        <div className="relative h-1 -mt-1 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-indigo-500" style={{ width: `${value}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {(["current", "transition", "target"] as const).map((k) => {
          const t = transformationStates[k];
          const active = phase === k;
          return (
            <div key={k} className={`rounded-lg border p-3 transition ${active ? "border-indigo-300 bg-indigo-50/40" : "border-slate-200 bg-white"}`}>
              <div className={`text-[10px] uppercase tracking-wider font-semibold ${active ? "text-indigo-700" : "text-slate-500"}`}>{t.label}</div>
              <div className="text-[12px] font-medium text-slate-900 mt-1">{t.operatingModel}</div>
              <div className="text-[11px] text-slate-600 mt-2"><span className="text-slate-500">Challenge · </span>{t.challenge}</div>
              <div className="text-[11px] text-slate-600 mt-1"><span className="text-slate-500">Concern · </span>{t.concern}</div>
              <div className="text-[11px] text-slate-600 mt-1"><span className="text-slate-500">Shift · </span>{t.shift}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/40 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">{info.label} · key attributes</div>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1 text-[11px] text-slate-700">
          {info.bullets.map((b) => (
            <li key={b} className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-slate-400 mt-0.5" />{b}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

/* ============ Executive Value ============ */
export function ExecutiveValueRealization() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 grid place-items-center">
          <Award className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Executive Value Realization</div>
          <div className="text-[11px] text-slate-500">Engineering activity connected to business outcomes</div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
        {valueMetrics.map((m) => (
          <div key={m.id} className="rounded-lg border border-slate-200 p-3 bg-gradient-to-br from-white to-slate-50/40">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold text-slate-800">{m.name}</div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">{m.trend}</span>
            </div>
            <div className="text-lg font-semibold text-slate-900 mt-1.5">{m.current}</div>
            <div className="grid grid-cols-2 gap-x-2 text-[10px] text-slate-500 mt-0.5">
              <div>Baseline · <span className="text-slate-700">{m.baseline}</span></div>
              <div>Target · <span className="text-slate-700">{m.target}</span></div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-700"><span className="text-slate-500">Meaning · </span>{m.meaning}</div>
            <div className="mt-1 text-[11px] text-slate-700"><span className="text-slate-500">Action · </span>{m.action}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {executiveReadout.map(([k, v]) => (
          <div key={k} className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-700">{k}</div>
            <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{v}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============ Operating Timeline (modes) ============ */
export function OperatingTimeline({
  mode, onSelect,
}: { mode: "incident" | "remediation" | "transformation" | "value"; onSelect?: (target: string) => void }) {
  const incidents = [
    ["09:02", "CloudWatch latency warning", "alb"],
    ["09:05", "Target group health check variance", "ec2_02"],
    ["09:07", "Auto Scaling evaluation", "asg"],
    ["09:09", "SRE runbook recommended", "runbook"],
    ["09:12", "Traffic drain initiated", "ec2_02"],
    ["09:18", "Recovery forecast updated", "runbook"],
  ] as [string, string, string][];

  const items =
    mode === "incident" ? incidents.map(([t, title, target]) => ({ t, title, detail: "", target })) :
    mode === "remediation" ? remediationTimeline.map((s, i) => ({ t: `Step ${i + 1}`, title: s, detail: "", target: "runbook" })) :
    mode === "transformation" ? transformationTimeline.map(([t, d]) => ({ t, title: d, detail: "", target: "runbook" })) :
    valueTimeline.map(([t, d]) => ({ t, title: d, detail: "", target: "obs" }));

  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-3 h-px bg-slate-200" />
      <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {items.map((e, i) => (
          <button key={i} onClick={() => onSelect?.(e.target)} className="text-left group">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-white" />
              <span className="text-[11px] text-slate-500">{e.t}</span>
            </div>
            <div className="mt-2 text-[12px] font-medium text-slate-800 group-hover:text-sky-700 leading-tight">{e.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============ Workshop output ============ */
export function WorkshopOutputPanel() {
  const groups = [
    ["Top reliability risks", workshopOutput.reliabilityRisks],
    ["Top automation candidates", workshopOutput.automationCandidates],
    ["Top dependency gaps", workshopOutput.dependencyGaps],
    ["Top cost opportunities", workshopOutput.costOpportunities],
    ["Top security actions", workshopOutput.securityActions],
  ] as [string, string[]][];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 grid place-items-center">
          <ClipboardList className="w-4 h-4 text-rose-600" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Workshop Output · How to use this in an SRE engagement</div>
          <div className="text-[11px] text-slate-500">Guided conversation prompts and a 30-day SRE plan</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        {engagementPrompts.map((p, i) => (
          <div key={i} className="text-[11px] p-2 rounded-lg border border-slate-200 bg-white text-slate-700 leading-snug">
            <span className="text-slate-400 mr-1">{i + 1}.</span>{p}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        {groups.map(([title, items]) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-slate-50/40 p-2.5">
            <div className="text-[11px] font-semibold text-slate-800">{title}</div>
            <ul className="mt-1 space-y-1">
              {items.map((x) => (
                <li key={x} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />{x}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-gradient-to-br from-indigo-50/40 to-white p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Recommended 30-day SRE plan</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {workshopOutput.plan.map(([k, v]) => (
            <div key={k} className="p-2.5 rounded bg-white border border-slate-200">
              <div className="text-[11px] font-semibold text-indigo-700">{k}</div>
              <div className="text-[11px] text-slate-700 mt-0.5 leading-snug">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
