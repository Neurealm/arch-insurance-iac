/** Cross Team Impact Analysis — Prompt 2 dialogs, wizards and drawers. */

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Drawer, Pill, Row } from "../persona-studio/primitives";
import { SimpleTable, ctiTone } from "./panels";
import {
  conflictsFor, ctiPersonas, dependenciesFor, evidenceState, personaById, sharedConditions,
  type CtiAnalysisState, type CrossTeamImpactConflict,
} from "./data";
import {
  analysisScopeOptions, buildExportRows, completedPersonaAnalyses, coordinationStatuses,
  escalationReasons, evidenceTypes, executionSteps, exportFormats, exportOptions, exportScopes,
  propagationRuleOptions, qualityControlDefaults, reanalysisScopes, reanalysisSteps, searchEverything,
  searchExamples, startSteps, toCsv, toYaml,
  type CoordinationRecord, type CoordinationStatus, type CrossTeamAcknowledgement,
  type CrossTeamAnalysisVersion, type CrossTeamEscalation, type CrossTeamMitigation,
  type RoutingValidation, type SearchHit,
} from "./ops-data";

/* ------------------------------------------------- start analysis wizard - */

export function StartAnalysisDialog({
  open, onClose, onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (summary: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [evalId, setEvalId] = useState("EVAL 2048");
  const [search, setSearch] = useState("");
  const [included, setIncluded] = useState<string[]>(ctiPersonas.map((p) => p.id));
  const [primary, setPrimary] = useState("PER 4101");
  const [scope, setScope] = useState<string[]>(analysisScopeOptions);
  const [rules, setRules] = useState<string[]>(propagationRuleOptions.slice(0, 5));
  const [quality, setQuality] = useState(qualityControlDefaults);
  const [running, setRunning] = useState(-1);

  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const run = () => {
    setRunning(0);
    executionSteps.forEach((_, i) => window.setTimeout(() => setRunning(i), i * 180));
    window.setTimeout(() => {
      onComplete(`${evalId} synthesised across ${included.length} Team Personas`);
    }, executionSteps.length * 180 + 120);
  };

  const filtered = completedPersonaAnalyses.filter((a) =>
    [a.id, a.workItem, a.team].join(" ").toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) { onClose(); setStep(0); setRunning(-1); } }} wide
      title="Start Cross Team Analysis"
      description={`Step ${step + 1} of ${startSteps.length} · ${startSteps[step]}`}>
      <Progress value={((step + 1) / startSteps.length) * 100} className="h-1" />

      <div className="mt-2 space-y-2">
        {step === 0 && (
          <>
            <label className="flex flex-col text-[10.5px] text-slate-600">
              Search analysis
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Analysis, work item or team"
                className="h-7 rounded border border-slate-200 px-1.5 text-[11px]" />
            </label>
            <SimpleTable head={["Select", "Analysis", "Work Item", "Team", "Personas", "Completed"]}
              rows={filtered.map((a) => [
                <input key="r" type="radio" name="eval" aria-label={`Select ${a.id}`} checked={evalId === a.id} onChange={() => setEvalId(a.id)} />,
                a.id, a.workItem, a.team, a.personas, a.completedAt,
              ])} />
          </>
        )}

        {step === 1 && (
          <SimpleTable head={["Include", "Persona", "Score", "Severity", "Primary"]}
            rows={ctiPersonas.map((p) => [
              <input key="c" type="checkbox" aria-label={`Include ${p.name}`} checked={included.includes(p.id)} onChange={() => toggle(included, setIncluded, p.id)} />,
              p.name, p.score,
              <Pill key="s" label={p.highestSeverity} tone={ctiTone(p.highestSeverity)} />,
              <Button key="p" size="sm" variant={primary === p.id ? "default" : "outline"} className="h-6 px-1.5 text-[10px]" onClick={() => setPrimary(p.id)}>
                {primary === p.id ? "Primary" : "Mark Primary"}
              </Button>,
            ])} />
        )}

        {step === 2 && (
          <div className="flex flex-wrap gap-1.5">
            {analysisScopeOptions.map((o) => (
              <label key={o} className="flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-700">
                <input type="checkbox" checked={scope.includes(o)} onChange={() => toggle(scope, setScope, o)} />
                {o}
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-wrap gap-1.5">
            {propagationRuleOptions.map((o) => (
              <label key={o} className="flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-700">
                <input type="checkbox" checked={rules.includes(o)} onChange={() => toggle(rules, setRules, o)} />
                {o}
              </label>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {(Object.keys(quality) as (keyof typeof quality)[]).map((k) => (
              <label key={k} className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
                {k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
                <input type="number" value={quality[k]} onChange={(e) => setQuality({ ...quality, [k]: Number(e.target.value) })}
                  className="h-6 w-20 rounded border border-slate-200 px-1 text-[11px]" />
              </label>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-1.5 sm:grid-cols-2">
            <Row label="Persona Impact Analysis" value={evalId} />
            <Row label="Personas" value={`${included.length} in scope · primary ${personaById(primary).short}`} />
            <Row label="Findings" value="142 normalized Persona findings" />
            <Row label="Dependencies" value={`${dependenciesFor({ maxTraffic: 15, deploymentTiming: "Standard window", fraudLossEvidence: true, idempotencyEvidence: true, dependencyLoadEvidence: false }).length} shared dependencies`} />
            <Row label="Conditions" value={`${sharedConditions.length} shared conditions`} />
            <Row label="Expected intersections" value="31" />
            <Row label="Expected conflicts" value="4" />
            <Row label="Estimated duration" value="6 minutes" />
            <Row label="Scope areas" value={`${scope.length} selected`} />
            <Row label="Propagation rules" value={`${rules.length} enabled`} />
          </div>
        )}

        {step === 6 && (
          <div>
            <ol className="space-y-0.5">
              {executionSteps.map((s, i) => (
                <li key={s} className="flex items-center gap-2 text-[11px]">
                  <Pill label={running >= i ? (running === i && i < executionSteps.length - 1 ? "Running" : "Complete") : "Pending"}
                    tone={running >= i ? (running === i && i < executionSteps.length - 1 ? "amber" : "green") : "slate"} />
                  {s}
                </li>
              ))}
            </ol>
            {running >= executionSteps.length - 1 && (
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                <Row label="Teams Evaluated" value={`${included.length}`} />
                <Row label="Matrix Cells" value="126" />
                <Row label="Material Intersections" value="31" />
                <Row label="Conflicts" value="4" />
                <Row label="Shared Dependencies" value="5" />
                <Row label="Opportunities" value="3" />
                <Row label="Mitigation Candidates" value="7" />
                <Row label="Coordination Actions" value="5" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {step < startSteps.length - 1
          ? <Button size="sm" className="h-7 text-[11px]" onClick={() => setStep((s) => s + 1)}>Next</Button>
          : <Button size="sm" className="h-7 text-[11px]" onClick={run} disabled={running >= 0}>Execute Analysis</Button>}
        <Button size="sm" variant="ghost" className="ml-auto h-7 text-[11px]" onClick={onClose}>Cancel</Button>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------ reanalysis - */

export function ReanalysisDialog({
  open, onClose, onComplete,
}: { open: boolean; onClose: () => void; onComplete: (scope: string, reason: string) => void }) {
  const [scope, setScope] = useState(reanalysisScopes[0]);
  const [reason, setReason] = useState("Traffic exposure and evidence updated");
  const [running, setRunning] = useState(-1);
  const run = () => {
    setRunning(0);
    reanalysisSteps.forEach((_, i) => window.setTimeout(() => setRunning(i), i * 160));
    window.setTimeout(() => onComplete(scope, reason), reanalysisSteps.length * 160 + 100);
  };
  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) { onClose(); setRunning(-1); } }}
      title="Reanalyze Cross Team Impact" description="A new analysis version is always created — prior versions are preserved">
      <label className="flex flex-col text-[10.5px] text-slate-600">
        Reanalysis scope
        <select value={scope} onChange={(e) => setScope(e.target.value)} className="h-7 rounded border border-slate-200 px-1 text-[11px]">
          {reanalysisScopes.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label className="mt-1.5 flex flex-col text-[10.5px] text-slate-600">
        Change reason
        <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className="rounded border border-slate-200 p-1.5 text-[11px]" />
      </label>
      <ol className="mt-2 space-y-0.5">
        {reanalysisSteps.map((s, i) => (
          <li key={s} className="flex items-center gap-2 text-[11px]">
            <Pill label={running >= i ? "Complete" : "Pending"} tone={running >= i ? "green" : "slate"} />{s}
          </li>
        ))}
      </ol>
      <Button size="sm" className="mt-2 h-7 text-[11px]" onClick={run} disabled={running >= 0}>Run Reanalysis</Button>
    </Drawer>
  );
}

/* ------------------------------------------------------------- escalation */

export function EscalationDialog({
  open, onClose, onCreate, state,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (e: Omit<CrossTeamEscalation, "id" | "createdAt">) => void;
  state: CtiAnalysisState;
}) {
  const [issueType, setIssueType] = useState(escalationReasons[0]);
  const [title, setTitle] = useState("Unresolved cross team tradeoff requires executive direction");
  const [teams, setTeams] = useState<string[]>(["PER 4101", "PER 4103"]);
  const [level, setLevel] = useState("Enterprise Architecture Council");
  const [due, setDue] = useState("2026-08-14");
  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }} wide
      title="Create Cross Team Escalation" description="Escalation records an unresolved tradeoff, it does not resolve it">
      <div className="grid gap-1.5 sm:grid-cols-2">
        <label className="flex flex-col text-[10.5px] text-slate-600">Escalation reason
          <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className="h-7 rounded border border-slate-200 px-1 text-[11px]">
            {escalationReasons.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-[10.5px] text-slate-600">Recommended escalation level
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="h-7 rounded border border-slate-200 px-1 text-[11px]">
            {["Coordination Office", "Enterprise Architecture Council", "Executive Steering"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-[10.5px] text-slate-600 sm:col-span-2">Issue
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-7 rounded border border-slate-200 px-1.5 text-[11px]" />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-[10.5px] text-slate-600">Affected teams</legend>
          <div className="flex flex-wrap gap-1">
            {ctiPersonas.map((p) => (
              <label key={p.id} className="flex items-center gap-1 rounded border border-slate-200 px-1.5 py-0.5 text-[10.5px]">
                <input type="checkbox" checked={teams.includes(p.id)}
                  onChange={() => setTeams((t) => t.includes(p.id) ? t.filter((x) => x !== p.id) : [...t, p.id])} />
                {p.short}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex flex-col text-[10.5px] text-slate-600">Due
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-7 rounded border border-slate-200 px-1.5 text-[11px]" />
        </label>
      </div>
      <Button size="sm" className="mt-2 h-7 text-[11px]"
        onClick={() => onCreate({
          analysisId: "CTA 3001", issueType, title,
          description: `${issueType} raised from the cross team analysis workspace.`,
          severity: "High", affectedTeamIds: teams,
          businessImpact: "Coordinated rollout cannot proceed without direction",
          customerImpact: "Checkout completion benefit delayed",
          technicalImpact: "Shared dependency capacity remains unproven",
          evidenceReferenceIds: evidenceState(state).filter((e) => e.status !== "Provided").map((e) => e.id),
          owner: level, dueDate: due, status: "Open",
        })}>
        Create Escalation
      </Button>
    </Drawer>
  );
}

/* -------------------------------------------------------- evidence ------- */

export function EvidenceDialog({
  open, onClose, onAdd, target,
}: { open: boolean; onClose: () => void; onAdd: (type: string, note: string) => void; target: string }) {
  const [type, setType] = useState(evidenceTypes[0]);
  const [note, setNote] = useState("");
  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }}
      title="Add or Request Evidence" description={`Target · ${target}`}>
      <label className="flex flex-col text-[10.5px] text-slate-600">Evidence type
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-7 rounded border border-slate-200 px-1 text-[11px]">
          {evidenceTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="mt-1.5 flex flex-col text-[10.5px] text-slate-600">Note
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="rounded border border-slate-200 p-1.5 text-[11px]" />
      </label>
      <p className="mt-1 text-[10.5px] text-slate-500">
        Adding evidence updates coverage, intersections, confidence, deterministic conflicts and coordination actions, and creates activity and a notification.
      </p>
      <Button size="sm" className="mt-2 h-7 text-[11px]" onClick={() => { onAdd(type, note); setNote(""); }}>Record Evidence</Button>
    </Drawer>
  );
}

/* --------------------------------------------------- conflict management - */

export function ConflictManagementDrawer({
  conflict, state, onClose, onAction,
}: {
  conflict: CrossTeamImpactConflict | null;
  state: CtiAnalysisState;
  onClose: () => void;
  onAction: (action: string, note: string) => void;
}) {
  const [note, setNote] = useState("");
  if (!conflict) return null;
  const a = personaById(conflict.personaAId);
  const b = personaById(conflict.personaBId);
  const deps = dependenciesFor(state).filter((d) => conflict.dependencyIds.includes(d.id));
  const actions = [
    "Acknowledge Both Perspectives", "Define Different Applicability", "Add Mitigation", "Change Proposal Scope",
    "Change Traffic Exposure", "Change Timing", "Change Rollout Strategy", "Request Evidence",
    "Escalate to Decision Intelligence", "Escalate to Governance",
  ];
  return (
    <Drawer open={Boolean(conflict)} onOpenChange={(o) => { if (!o) onClose(); }} wide
      title={`${conflict.id} · ${conflict.conflictType}`}
      description="Neither Persona is declared correct unless the conflict is caused by inconsistent enterprise source conditions">
      <div className="grid gap-2 sm:grid-cols-2">
        {[{ p: a, priority: conflict.priorityA }, { p: b, priority: conflict.priorityB }].map(({ p, priority }) => (
          <section key={p.id} className="rounded border border-slate-200 p-2">
            <h3 className="text-[12px] font-semibold text-slate-900">{p.name}</h3>
            <Row label="Priority" value={priority} />
            <Row label="Finding" value={p.primaryRisk} />
            <Row label="Conditions" value={sharedConditions.filter((c) => c.personaIds.includes(p.id)).map((c) => c.label).join("; ") || "—"} />
            <Row label="Evidence" value={evidenceState(state).filter((e) => e.personaIds.includes(p.id)).map((e) => `${e.label} (${e.status})`).join("; ") || "—"} />
          </section>
        ))}
      </div>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        <Row label="Shared dependency" value={deps.map((d) => d.dependencyName).join(", ") || "—"} />
        <Row label="Shared customer journey" value="Checkout" />
        <Row label="Shared risk" value={conflict.description} />
        <Row label="Shared opportunity" value="Recoverable authorization completion" />
        <Row label="Severity" value={<Pill label={conflict.severity} tone={ctiTone(conflict.severity)} />} />
        <Row label="Potential coordination" value={conflict.potentialCoordination} />
      </div>
      <label className="mt-2 flex flex-col text-[10.5px] text-slate-600">Coordination note
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="rounded border border-slate-200 p-1.5 text-[11px]" />
      </label>
      <div className="mt-2 flex flex-wrap gap-1">
        {actions.map((act) => (
          <Button key={act} size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => { onAction(act, note); setNote(""); }}>{act}</Button>
        ))}
      </div>
    </Drawer>
  );
}

/* --------------------------------------------- coordination action drawer */

export function CoordinationActionDrawer({
  record, onClose, onUpdate,
}: {
  record: CoordinationRecord | null;
  onClose: () => void;
  onUpdate: (r: CoordinationRecord) => void;
}) {
  const [draft, setDraft] = useState<CoordinationRecord | null>(record);
  const current = draft && record && draft.id === record.id ? draft : record;
  if (!record || !current) return null;
  return (
    <Drawer open={Boolean(record)} onOpenChange={(o) => { if (!o) onClose(); }} wide
      title={`${record.id} · ${record.title}`} description="Coordination actions carry owners, participants, evidence and acknowledgement">
      <div className="grid gap-1.5 sm:grid-cols-2">
        <label className="flex flex-col text-[10.5px] text-slate-600">Primary owner
          <input value={current.primaryOwner} onChange={(e) => setDraft({ ...current, primaryOwner: e.target.value })}
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px]" />
        </label>
        <label className="flex flex-col text-[10.5px] text-slate-600">Due date
          <input type="date" value={current.dueDate} onChange={(e) => setDraft({ ...current, dueDate: e.target.value })}
            className="h-7 rounded border border-slate-200 px-1.5 text-[11px]" />
        </label>
        <label className="flex flex-col text-[10.5px] text-slate-600">Status
          <select value={current.status} onChange={(e) => setDraft({ ...current, status: e.target.value as CoordinationStatus })}
            className="h-7 rounded border border-slate-200 px-1 text-[11px]">
            {coordinationStatuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-[10.5px] text-slate-600">Add participant
          <select value="" onChange={(e) => e.target.value && setDraft({ ...current, participants: Array.from(new Set([...current.participants, e.target.value])) })}
            className="h-7 rounded border border-slate-200 px-1 text-[11px]">
            <option value="">Select a team</option>
            {ctiPersonas.map((p) => <option key={p.id}>{p.team}</option>)}
          </select>
        </label>
        <Row label="Participants" value={current.participants.join(", ")} />
        <Row label="Evidence requirement" value={current.evidenceRequirement} />
        <Row label="Required before" value={current.requiredBefore} />
        <Row label="Dependencies" value={current.dependencies.join(", ") || "—"} />
        <Row label="Acknowledgements" value={current.acknowledgements.join(", ") || "None"} />
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <Button size="sm" className="h-7 text-[11px]" onClick={() => onUpdate(current)}>Save Action</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]"
          onClick={() => onUpdate({ ...current, acknowledgements: Array.from(new Set([...current.acknowledgements, current.primaryOwner])), status: "Acknowledged" })}>
          Acknowledge
        </Button>
      </div>
    </Drawer>
  );
}

/* ---------------------------------------------------------- global search */

export function GlobalSearchDialog({
  open, onClose, state, mitigations, records, acks, escalations, versions, onOpenHit,
}: {
  open: boolean;
  onClose: () => void;
  state: CtiAnalysisState;
  mitigations: CrossTeamMitigation[];
  records: CoordinationRecord[];
  acks: CrossTeamAcknowledgement[];
  escalations: CrossTeamEscalation[];
  versions: CrossTeamAnalysisVersion[];
  onOpenHit: (hit: SearchHit) => void;
}) {
  const [q, setQ] = useState("");
  const hits = useMemo(
    () => searchEverything(q, state, mitigations, records, acks, escalations, versions),
    [q, state, mitigations, records, acks, escalations, versions],
  );
  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }} wide
      title="Global Search" description="Analyses, work items, personas, matrix cells, intersections, conflicts, agreements, opportunities, dependencies, mitigations, coordination actions, evidence, versions, acknowledgements and escalations">
      <label className="flex flex-col text-[10.5px] text-slate-600">
        Search
        <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="Try: Fraud, Critical, Release Governance, Proposed, v3.3"
          className="h-8 rounded border border-slate-200 px-2 text-[12px]" />
      </label>
      <div className="mt-1 flex flex-wrap gap-1">
        {searchExamples.map((e) => (
          <button key={e} type="button" onClick={() => setQ(e)} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50">{e}</button>
        ))}
      </div>
      <p className="mt-1.5 text-[10.5px] text-slate-500">{hits.length} result(s)</p>
      <div className="mt-1 max-h-[52vh] overflow-y-auto">
        <SimpleTable dense head={["Type", "Analysis", "Teams", "Issue", "Severity", "Owner", "Status", "Action"]}
          rows={hits.map((h) => [
            h.type, h.analysis, h.teams, h.issue,
            <Pill key="s" label={h.severity} tone={ctiTone(h.severity)} />,
            h.owner, h.status,
            <Button key="a" size="sm" variant="outline" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenHit(h)}>Open</Button>,
          ])} />
      </div>
    </Drawer>
  );
}

/* ---------------------------------------------------------------- export - */

export function ExportDialog({
  open, onClose, state, mitigations, records, acks, onExported,
}: {
  open: boolean;
  onClose: () => void;
  state: CtiAnalysisState;
  mitigations: CrossTeamMitigation[];
  records: CoordinationRecord[];
  acks: CrossTeamAcknowledgement[];
  onExported: (format: string, scope: string) => void;
}) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState("Current Analysis");
  const [options, setOptions] = useState<string[]>(exportOptions.slice(0, 8));
  const rows = useMemo(() => buildExportRows(scope, state, mitigations, records, acks), [scope, state, mitigations, records, acks]);

  const preview = format === "CSV" ? toCsv(rows)
    : format === "JSON" ? JSON.stringify(rows, null, 2)
      : format === "YAML" ? toYaml(rows)
        : `${format} · ${scope} · ${rows.length} records · ${options.length} option groups included`;

  const download = () => {
    const ext = format === "CSV" ? "csv" : format === "JSON" ? "json" : format === "YAML" ? "yaml" : "txt";
    const blob = new Blob([preview], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cross-team-impact-${scope.toLowerCase().replace(/\s+/g, "-")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    onExported(format, scope);
  };

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }} wide
      title="Export Cross Team Impact Analysis" description="Governed export — content follows the current analysis state and selected scope">
      <div className="grid gap-1.5 sm:grid-cols-2">
        <label className="flex flex-col text-[10.5px] text-slate-600">Format
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="h-7 rounded border border-slate-200 px-1 text-[11px]">
            {exportFormats.map((f) => <option key={f}>{f}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-[10.5px] text-slate-600">Scope
          <select value={scope} onChange={(e) => setScope(e.target.value)} className="h-7 rounded border border-slate-200 px-1 text-[11px]">
            {exportScopes.map((f) => <option key={f}>{f}</option>)}
          </select>
        </label>
      </div>
      <fieldset className="mt-1.5">
        <legend className="text-[10.5px] text-slate-600">Included content</legend>
        <div className="flex flex-wrap gap-1">
          {exportOptions.map((o) => (
            <label key={o} className="flex items-center gap-1 rounded border border-slate-200 px-1.5 py-0.5 text-[10.5px]">
              <input type="checkbox" checked={options.includes(o)}
                onChange={() => setOptions((s) => s.includes(o) ? s.filter((x) => x !== o) : [...s, o])} />
              {o}
            </label>
          ))}
        </div>
      </fieldset>
      <pre className="mt-2 max-h-56 overflow-auto rounded border border-slate-200 bg-slate-50 p-2 text-[10.5px] text-slate-700">{preview.slice(0, 4000)}</pre>
      <Button size="sm" className="mt-2 h-7 text-[11px]" onClick={download}>Generate Export</Button>
    </Drawer>
  );
}

/* --------------------------------------------------------------- routing - */

export function RoutingDialog({
  open, onClose, validation, onRoute,
}: {
  open: boolean;
  onClose: () => void;
  validation: RoutingValidation;
  onRoute: () => void;
}) {
  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }} wide
      title="Proceed to Decision Intelligence" description="Routing is validated before handoff — unresolved conflicts are allowed when the conflict is the decision topic">
      <SimpleTable head={["Check", "State", "Detail"]}
        rows={validation.checks.map((c) => [
          c.label,
          <Pill key="s" label={c.state} tone={c.state === "Pass" ? "green" : c.state === "Warning" ? "amber" : "red"} />,
          c.detail,
        ])} />
      {validation.warnings.length > 0 && (
        <p className="mt-1.5 rounded border border-amber-200 bg-amber-50 p-1.5 text-[11px] text-amber-800">
          Routing proceeds with {validation.warnings.length} recorded warning(s): {validation.warnings.join(", ")}.
        </p>
      )}
      {validation.blocking.length > 0 && (
        <p className="mt-1.5 rounded border border-red-200 bg-red-50 p-1.5 text-[11px] text-red-800">
          Routing is blocked: {validation.blocking.join(", ")}.
        </p>
      )}
      <Button size="sm" className="mt-2 h-7 text-[11px]" onClick={onRoute} disabled={!validation.canRoute}>
        Route Decision Context Package
      </Button>
    </Drawer>
  );
}

/* ------------------------------------------------------- add persona ----- */

export function AddPersonaDialog({
  open, onClose, onAdd,
}: { open: boolean; onClose: () => void; onAdd: (name: string) => void }) {
  const [name, setName] = useState("Platform Engineering");
  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }}
      title="Add Team Persona to Scope" description="Adding a team recalculates the matrix, intersections, conflicts and coordination requirements">
      <label className="flex flex-col text-[10.5px] text-slate-600">Team Persona
        <input value={name} onChange={(e) => setName(e.target.value)} className="h-7 rounded border border-slate-200 px-1.5 text-[11px]" />
      </label>
      <Button size="sm" className="mt-2 h-7 text-[11px]" onClick={() => onAdd(name)}>Add to Scope</Button>
    </Drawer>
  );
}
