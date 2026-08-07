import { useMemo, useState } from "react";
import {
  AlertTriangle, Check, ChevronDown, ChevronRight, CircleDot, Lock, Minus,
  Shield, TriangleAlert, X,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Panel, StatusBadge } from "../command-center/panels";
import {
  authorityBands, breakdownDimensions, cadenceModes, cadenceScheduleOptions, computeBreakdown,
  evidenceFields, fmt, scopeDimensions, seedPlatformConfigs, seedScopeEntries, alwaysExcludedContent,
  permissionInheritanceChain, qualityDimensions,
  type AuthorityBand, type BreakdownDimension, type ContentTypePolicyRow, type DiscoveryConfigurationStage,
  type DiscoveryPreview, type DiscoveryPreviewWarning, type DiscoveryRule, type DraftState,
  type ScopeDimension, type ScopeState,
} from "./data";

/* -------------------------------------------------------------- primitives */

export function StateChip({ state }: { state: ScopeState }) {
  const tone = state === "included" ? "green" : state === "restricted" ? "amber" : "slate";
  const label = state === "included" ? "Included" : state === "restricted" ? "Restricted" : "Excluded";
  return <StatusBadge tone={tone as "green"}>{label}</StatusBadge>;
}

export function ScopeStateControl({
  value, onChange, id,
}: { value: ScopeState; onChange: (v: ScopeState) => void; id: string }) {
  const opts: { v: ScopeState; label: string; icon: typeof Check }[] = [
    { v: "included", label: "Include", icon: Check },
    { v: "restricted", label: "Restrict", icon: Lock },
    { v: "excluded", label: "Exclude", icon: X },
  ];
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-white" role="group" aria-label={`Scope state for ${id}`}>
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
          title={o.label}
          className={cn(
            "px-1.5 py-1 text-[10.5px] font-medium first:rounded-l-md last:rounded-r-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            value === o.v
              ? o.v === "included" ? "bg-emerald-600 text-white" : o.v === "restricted" ? "bg-amber-500 text-white" : "bg-slate-700 text-white"
              : "text-slate-600 hover:bg-slate-50",
          )}
        >
          <o.icon className="h-3 w-3" aria-hidden />
          <span className="sr-only">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2">
      <div className="text-[10.5px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={cn("mt-0.5 text-[15px] font-semibold text-slate-900", tone)}>{value}</div>
      {sub && <div className="text-[10.5px] text-slate-500">{sub}</div>}
    </div>
  );
}

/* ------------------------------------------------------------- lifecycle */

const stageTone: Record<DiscoveryConfigurationStage["status"], string> = {
  Complete: "border-emerald-300 bg-emerald-50 text-emerald-800",
  Warning: "border-amber-300 bg-amber-50 text-amber-800",
  Pending: "border-slate-300 bg-slate-50 text-slate-600",
  Ready: "border-blue-300 bg-blue-50 text-blue-800",
  "Not Started": "border-slate-200 bg-white text-slate-500",
  Failed: "border-red-300 bg-red-50 text-red-800",
};

export function LifecyclePanel({
  stages, selected, onSelect,
}: { stages: DiscoveryConfigurationStage[]; selected: string; onSelect: (id: string) => void }) {
  const stage = stages.find((s) => s.id === selected) ?? stages[0];
  return (
    <Panel
      id="panel-lifecycle"
      title="Discovery Configuration Lifecycle"
      subtitle="Define the boundaries before discovering the knowledge. Prompt 1 implements through Preview Discovery."
    >
      <ol className="flex gap-1.5 overflow-x-auto pb-2" aria-label="Discovery configuration lifecycle stages">
        {stages.map((s) => (
          <li key={s.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              aria-current={s.id === selected ? "step" : undefined}
              className={cn(
                "w-[132px] rounded-lg border px-2 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                stageTone[s.status],
                s.id === selected && "ring-2 ring-blue-500 ring-offset-1",
              )}
            >
              <div className="text-[9.5px] font-semibold uppercase tracking-wide opacity-70">Stage {s.sequence}</div>
              <div className="mt-0.5 text-[11px] font-semibold leading-tight">{s.name}</div>
              <div className="mt-1 text-[10px] opacity-80">{s.status}</div>
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-semibold text-slate-900">Selected Configuration Stage: {stage.name}</span>
          <StatusBadge tone={stage.status === "Complete" ? "green" : stage.status === "Warning" ? "amber" : "slate"}>
            {stage.status}
          </StatusBadge>
        </div>
        <p className="mt-1 text-[11.5px] text-slate-600">{stage.note}</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-6">
          <Metric label="Completed" value={String(stage.completedItems)} />
          <Metric label="Pending" value={String(stage.pendingItems)} />
          <Metric label="Warnings" value={String(stage.warningCount)} />
          <Metric label="Failures" value={String(stage.failureCount)} />
          <Metric label="Confidence" value={`${stage.confidence}%`} />
          <Metric label="Owner" value={stage.owner} />
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------- workbench: region 1 scope */

export function WorkbenchScopeRegion({
  draft, onScopeChange, highlight, onSelectScope,
}: {
  draft: DraftState;
  onScopeChange: (id: string, state: ScopeState) => void;
  highlight?: boolean;
  onSelectScope: (id: string) => void;
}) {
  const [dimension, setDimension] = useState<ScopeDimension>("Business Unit");
  const entries = seedScopeEntries.filter((e) => e.scopeType === dimension);
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white", highlight && "ring-2 ring-blue-500")}>
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <h3 className="text-[12px] font-semibold text-slate-900">Region 1 · Enterprise Scope</h3>
        <Select value={dimension} onValueChange={(v) => setDimension(v as ScopeDimension)}>
          <SelectTrigger className="h-7 w-[150px] text-[11px]" aria-label="Scope dimension">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scopeDimensions.map((d) => <SelectItem key={d} value={d} className="text-[12px]">{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <ul className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
        {entries.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-2 px-3 py-1.5">
            <button
              type="button"
              onClick={() => onSelectScope(e.id)}
              className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              <div className="truncate text-[11.5px] font-medium text-slate-800">{e.scopeName}</div>
              <div className="truncate text-[10px] text-slate-500">
                {e.inheritedFrom ? `Inherited from ${e.inheritedFrom}` : "Explicit"} · {e.accessClassification} · {e.priority}
              </div>
            </button>
            <ScopeStateControl id={e.scopeName} value={draft.scope[e.id]} onChange={(v) => onScopeChange(e.id, v)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------------- workbench: region 2 sources & content */

export function WorkbenchSourceRegion({
  draft, onTogglePlatform, onDepthChange, onContentStateChange, highlight, onSelectPlatform,
}: {
  draft: DraftState;
  onTogglePlatform: (id: string) => void;
  onDepthChange: (id: string, depth: 1 | 2 | 3 | 99) => void;
  onContentStateChange: (ct: string, state: ContentTypePolicyRow["discoveryState"]) => void;
  highlight?: boolean;
  onSelectPlatform: (id: string) => void;
}) {
  const [tab, setTab] = useState<"platforms" | "content">("platforms");
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white", highlight && "ring-2 ring-blue-500")}>
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <h3 className="text-[12px] font-semibold text-slate-900">Region 2 · Source and Content Rules</h3>
        <div className="inline-flex rounded-md border border-slate-200">
          {(["platforms", "content"] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
              className={cn("px-2 py-1 text-[10.5px] font-medium first:rounded-l-md last:rounded-r-md",
                tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}
            >
              {t === "platforms" ? "Source Platforms" : "Content Types"}
            </button>
          ))}
        </div>
      </div>
      {tab === "platforms" ? (
        <ul className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
          {seedPlatformConfigs.map((p) => {
            const d = draft.platforms[p.id];
            return (
              <li key={p.id} className="px-3 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectPlatform(p.id)}
                    className="min-w-0 flex-1 text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <div className="truncate text-[11.5px] font-medium text-slate-800">{p.platform}</div>
                    <div className="truncate text-[10px] text-slate-500">
                      {p.sourceCount} sources · {d.permissionMode} · {d.authority}
                    </div>
                  </button>
                  <Select value={String(d.depth)} onValueChange={(v) => onDepthChange(p.id, Number(v) as 1 | 2 | 3 | 99)}>
                    <SelectTrigger className="h-6 w-[86px] text-[10.5px]" aria-label={`Discovery depth for ${p.platform}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1" className="text-[12px]">Depth 1</SelectItem>
                      <SelectItem value="2" className="text-[12px]">Depth 2</SelectItem>
                      <SelectItem value="3" className="text-[12px]">Depth 3</SelectItem>
                      <SelectItem value="99" className="text-[12px]">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                  <Switch
                    checked={d.enabled}
                    onCheckedChange={() => onTogglePlatform(p.id)}
                    aria-label={`Enable ${p.platform}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
          {Object.values(draft.contentTypes).map((c) => (
            <li key={c.contentType} className="flex items-center justify-between gap-2 px-3 py-1.5">
              <div className="min-w-0">
                <div className="truncate text-[11.5px] font-medium text-slate-800">{c.contentType}</div>
                <div className="truncate text-[10px] text-slate-500">{c.defaultAuthority} · {c.freshnessSla}</div>
              </div>
              <Select value={c.discoveryState} onValueChange={(v) => onContentStateChange(c.contentType, v as ContentTypePolicyRow["discoveryState"])}>
                <SelectTrigger className="h-6 w-[92px] text-[10.5px]" aria-label={`Discovery state for ${c.contentType}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Allow" className="text-[12px]">Allow</SelectItem>
                  <SelectItem value="Restrict" className="text-[12px]">Restrict</SelectItem>
                  <SelectItem value="Exclude" className="text-[12px]">Exclude</SelectItem>
                </SelectContent>
              </Select>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-slate-100 px-3 py-2">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Always excluded</div>
        <p className="text-[10.5px] text-slate-600">{alwaysExcludedContent.join(" · ")}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------- workbench: region 3 policy */

export function WorkbenchPolicyRegion({
  draft, onPermissionToggle, highlight,
}: {
  draft: DraftState;
  onPermissionToggle: (key: keyof DraftState["permission"]) => void;
  highlight?: boolean;
}) {
  const perm = draft.permission;
  const toggles: { key: keyof DraftState["permission"]; label: string }[] = [
    { key: "preserveSourceAcl", label: "Preserve Source ACL" },
    { key: "preserveClassification", label: "Preserve Source Classification" },
    { key: "preserveResidency", label: "Preserve Data Residency" },
    { key: "unknownPermissionBehavior", label: "Restrict Content When Source Permission Unknown" },
    { key: "metadataOnlyWhenRestricted", label: "Allow Metadata Only When Content Restricted" },
    { key: "permissionChangeRediscovery", label: "Permission Change Triggers Rediscovery" },
  ];
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white", highlight && "ring-2 ring-blue-500")}>
      <div className="border-b border-slate-100 px-3 py-2">
        <h3 className="text-[12px] font-semibold text-slate-900">Region 3 · Discovery Policy</h3>
      </div>
      <div className="max-h-[320px] space-y-3 overflow-y-auto px-3 py-2">
        <section>
          <h4 className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Permission Preservation</h4>
          <ul className="mt-1 space-y-1">
            {toggles.map((t) => (
              <li key={t.key} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-700">{t.label}</span>
                <Switch
                  checked={Boolean(perm[t.key])}
                  onCheckedChange={() => onPermissionToggle(t.key)}
                  aria-label={t.label}
                />
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Authority Preference</h4>
          <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
            {draft.authority.sourceTypeMappings.slice(0, 6).map((m) => (
              <li key={m.sourceType} className="flex justify-between gap-2">
                <span className="truncate">{m.sourceType}</span>
                <span className="shrink-0 text-slate-500">{m.authority}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Freshness</h4>
          <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
            {draft.freshness.slice(0, 4).map((f) => (
              <li key={f.id} className="flex justify-between gap-2">
                <span className="truncate">{f.sourceType}</span>
                <span className="shrink-0 text-slate-500">{f.freshnessSla}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Change Detection</h4>
          <p className="text-[11px] text-slate-700">
            {draft.changeDetection.slice(0, 6).map((c) => c.triggerType).join(" · ")} and 6 further triggers
          </p>
        </section>
        <section>
          <h4 className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Duplicate Handling</h4>
          <p className="text-[11px] text-slate-700">
            Preserve every original source identity. Link duplicates only when confidence is at or above {draft.duplicate.autoLinkThreshold}%.
            Provenance is never discarded.
          </p>
        </section>
        <section>
          <h4 className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Historical Versions</h4>
          <p className="text-[11px] text-slate-700">
            Approved historical versions are preserved. Previously used decision context is never overwritten.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------ workbench: region 4 handoffs and preview */

export function WorkbenchHandoffRegion({
  draft, preview, onHandoffToggle, onWarningSelect, highlight,
}: {
  draft: DraftState;
  preview: DiscoveryPreview;
  onHandoffToggle: (id: string) => void;
  onWarningSelect: (w: DiscoveryPreviewWarning) => void;
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white", highlight && "ring-2 ring-blue-500")}>
      <div className="border-b border-slate-100 px-3 py-2">
        <h3 className="text-[12px] font-semibold text-slate-900">Region 4 · Processing Handoff &amp; Preview</h3>
      </div>
      <div className="max-h-[320px] space-y-3 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {draft.handoffs.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] text-slate-700">{h.destination}</span>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-[10px] text-slate-500">{h.authorityRequirement}</span>
                <Switch checked={h.enabled} onCheckedChange={() => onHandoffToggle(h.id)} aria-label={`Enable ${h.destination} handoff`} />
              </div>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Sources Evaluated" value={String(preview.sourcesEvaluated)} />
          <Metric label="Sources Included" value={String(preview.includedSources)} />
          <Metric label="Sources Excluded" value={String(preview.excludedSources)} />
          <Metric label="Artifacts Discoverable" value={fmt(preview.discoverableArtifacts)} />
          <Metric label="New Artifacts" value={fmt(preview.newArtifacts)} />
          <Metric label="Changed Artifacts" value={fmt(preview.changedArtifacts)} />
          <Metric label="Permission Changes" value={fmt(preview.permissionChanges)} />
          <Metric label="Potential Duplicates" value={fmt(preview.potentialDuplicates)} />
          <Metric label="Restricted Records" value={fmt(preview.restrictedArtifacts)} />
          <Metric label="Condition Candidates" value={fmt(preview.conditionEligibleArtifacts)} />
          <Metric label="Persona Relevant" value={fmt(preview.personaRelevantArtifacts)} />
          <Metric label="Ingestion Volume" value={fmt(preview.projectedIngestionVolume)} />
        </div>
        <div>
          <h4 className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">
            Warnings ({preview.warnings.length}) · Blocking ({preview.blockingIssues.length})
          </h4>
          <ul className="mt-1 space-y-1">
            {[...preview.blockingIssues, ...preview.warnings].map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => onWarningSelect(w)}
                  className={cn(
                    "flex w-full items-start gap-1.5 rounded-md border px-2 py-1 text-left text-[10.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    w.severity === "Blocking" ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800",
                  )}
                >
                  <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                  <span>{w.message} <span className="underline">Open {w.elementLabel}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------- enterprise scope panel */

export function EnterpriseScopePanel({
  draft, onScopeChange, onPriorityChange, onReset, spotlight,
}: {
  draft: DraftState;
  onScopeChange: (id: string, state: ScopeState) => void;
  onPriorityChange: (id: string, p: "Standard" | "High" | "Critical") => void;
  onReset: (id: string) => void;
  spotlight?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({ "Business Unit": true, "Knowledge Domain": true });

  return (
    <Panel
      id="panel-scope"
      title="Enterprise Discovery Scope"
      subtitle="Enterprise → Business Unit → Team → Product hierarchy with inherited and explicit states"
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search scope"
          className="h-7 w-56 text-[11.5px]"
          aria-label="Search enterprise scope"
        />
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setOpen(Object.fromEntries(scopeDimensions.map((d) => [d, true])))}>
          Expand all
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setOpen({})}>
          Collapse all
        </Button>
      </div>
      <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
        {scopeDimensions.map((dim) => {
          const entries = seedScopeEntries.filter(
            (e) => e.scopeType === dim && e.scopeName.toLowerCase().includes(query.toLowerCase()),
          );
          if (!entries.length) return null;
          const expanded = open[dim] ?? Boolean(query);
          return (
            <div key={dim} className="rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [dim]: !expanded }))}
                aria-expanded={expanded}
                className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {expanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden /> : <ChevronRight className="h-3.5 w-3.5 text-slate-500" aria-hidden />}
                <span className="text-[11.5px] font-semibold text-slate-800">{dim}</span>
                <span className="ml-auto text-[10.5px] text-slate-500">
                  {entries.filter((e) => draft.scope[e.id] === "included").length} included · {entries.filter((e) => draft.scope[e.id] === "restricted").length} restricted · {entries.filter((e) => draft.scope[e.id] === "excluded").length} excluded
                </span>
              </button>
              {expanded && (
                <table className="w-full border-t border-slate-100 text-[11px]">
                  <caption className="sr-only">{dim} scope entries</caption>
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th scope="col" className="px-2.5 py-1 text-left font-medium">Scope item</th>
                      <th scope="col" className="px-2 py-1 text-left font-medium">Inheritance</th>
                      <th scope="col" className="px-2 py-1 text-left font-medium">Classification</th>
                      <th scope="col" className="px-2 py-1 text-left font-medium">Priority</th>
                      <th scope="col" className="px-2 py-1 text-left font-medium">State</th>
                      <th scope="col" className="px-2 py-1 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entries.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="px-2.5 py-1 font-medium text-slate-800">{e.scopeName}</td>
                        <td className="px-2 py-1 text-slate-500">
                          {e.inheritedFrom ? `Inherited · ${e.inheritedFrom}` : "Explicit"}
                          {e.explicitOverride && <span className="ml-1 text-blue-600">override</span>}
                        </td>
                        <td className="px-2 py-1 text-slate-600">{e.accessClassification}</td>
                        <td className="px-2 py-1">
                          <Select value={draft.scopePriority[e.id]} onValueChange={(v) => onPriorityChange(e.id, v as "Standard")}>
                            <SelectTrigger className="h-6 w-[92px] text-[10.5px]" aria-label={`Priority for ${e.scopeName}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Standard" className="text-[12px]">Standard</SelectItem>
                              <SelectItem value="High" className="text-[12px]">High</SelectItem>
                              <SelectItem value="Critical" className="text-[12px]">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-2 py-1">
                          <ScopeStateControl id={e.scopeName} value={draft.scope[e.id]} onChange={(v) => onScopeChange(e.id, v)} />
                        </td>
                        <td className="px-2 py-1 text-right">
                          <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onReset(e.id)}>
                            Reset to inherited
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ----------------------------------------------- source platform config panel */

export function SourcePlatformPanel({
  draft, preview, onTogglePlatform, onRestrictPlatform, onDepthChange, onPermissionModeChange,
  onCadenceOverrideChange, onAuthorityChange, onOpenDetail, spotlight,
}: {
  draft: DraftState;
  preview: DiscoveryPreview;
  onTogglePlatform: (id: string) => void;
  onRestrictPlatform: (id: string) => void;
  onDepthChange: (id: string, depth: 1 | 2 | 3 | 99) => void;
  onPermissionModeChange: (id: string, mode: "Preserve Source ACL" | "Metadata Only" | "Governed Access") => void;
  onCadenceOverrideChange: (id: string, cadence: string) => void;
  onAuthorityChange: (id: string, a: AuthorityBand) => void;
  onOpenDetail: (id: string) => void;
  spotlight?: boolean;
}) {
  const totalShare = seedPlatformConfigs.reduce((s, p) => s + p.artifactShare, 0);
  return (
    <Panel
      id="panel-platforms"
      title="Source Platform Configuration"
      subtitle="Synthetic demonstration sources only. No credentials, tokens, or secrets are requested or stored."
      spotlight={spotlight}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-[11px]">
          <caption className="sr-only">Source platform configuration</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["Source Platform", "Enabled", "Source Count", "Scope", "Content Types", "Permission Mode",
                "Discovery Depth", "Cadence", "Authority Preference", "Projected Volume", "Status", "Actions"].map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 text-left font-medium">{h}</th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {seedPlatformConfigs.map((p) => {
              const d = draft.platforms[p.id];
              const projected = Math.round(preview.discoverableArtifacts * (d.enabled ? p.artifactShare / totalShare : 0));
              return (
                <tr key={p.id} className={cn("hover:bg-slate-50", !d.enabled && "opacity-60")}>
                  <td className="px-2 py-1.5 font-medium text-slate-800">{p.platform}</td>
                  <td className="px-2 py-1.5">
                    <Switch checked={d.enabled} onCheckedChange={() => onTogglePlatform(p.id)} aria-label={`Enable ${p.platform}`} />
                  </td>
                  <td className="px-2 py-1.5 text-slate-700">{p.sourceCount}</td>
                  <td className="px-2 py-1.5 text-slate-600">{p.scopeLabel}</td>
                  <td className="px-2 py-1.5 text-slate-600">{p.contentTypes.slice(0, 2).join(", ")}{p.contentTypes.length > 2 ? ` +${p.contentTypes.length - 2}` : ""}</td>
                  <td className="px-2 py-1.5">
                    <Select value={d.permissionMode} onValueChange={(v) => onPermissionModeChange(p.id, v as "Metadata Only")}>
                      <SelectTrigger className="h-6 w-[136px] text-[10.5px]" aria-label={`Permission mode for ${p.platform}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preserve Source ACL" className="text-[12px]">Preserve Source ACL</SelectItem>
                        <SelectItem value="Metadata Only" className="text-[12px]">Metadata Only</SelectItem>
                        <SelectItem value="Governed Access" className="text-[12px]">Governed Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-1.5">
                    <Select value={String(d.depth)} onValueChange={(v) => onDepthChange(p.id, Number(v) as 3)}>
                      <SelectTrigger className="h-6 w-[92px] text-[10.5px]" aria-label={`Depth for ${p.platform}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1" className="text-[12px]">Depth 1</SelectItem>
                        <SelectItem value="2" className="text-[12px]">Depth 2</SelectItem>
                        <SelectItem value="3" className="text-[12px]">Depth 3</SelectItem>
                        <SelectItem value="99" className="text-[12px]">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-1.5">
                    <Select value={d.cadenceOverride} onValueChange={(v) => onCadenceOverrideChange(p.id, v)}>
                      <SelectTrigger className="h-6 w-[112px] text-[10.5px]" aria-label={`Cadence for ${p.platform}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inherited" className="text-[12px]">Inherited</SelectItem>
                        {cadenceScheduleOptions.map((c) => <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-1.5">
                    <Select value={d.authority} onValueChange={(v) => onAuthorityChange(p.id, v as AuthorityBand)}>
                      <SelectTrigger className="h-6 w-[150px] text-[10.5px]" aria-label={`Authority for ${p.platform}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[...authorityBands, "Observed Operational Evidence", "Technical Evidence"].map((a) => (
                          <SelectItem key={a} value={a} className="text-[12px]">{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-1.5 font-medium text-slate-800">{fmt(projected)}</td>
                  <td className="px-2 py-1.5">
                    <StatusBadge tone={d.restricted ? "amber" : !d.enabled ? "slate" : p.status === "Needs Owner" ? "amber" : "green"}>
                      {!d.enabled ? "Excluded" : d.restricted ? "Restricted" : p.status}
                    </StatusBadge>
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5">
                    <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onOpenDetail(p.id)}>Configure</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onRestrictPlatform(p.id)}>
                      {d.restricted ? "Unrestrict" : "Restrict"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------- rules panel */

export function DiscoveryRulesPanel({
  rules, onAdd, onEdit, onDuplicate, onToggle, onTest, spotlight,
}: {
  rules: DiscoveryRule[];
  onAdd: () => void;
  onEdit: (r: DiscoveryRule) => void;
  onDuplicate: (r: DiscoveryRule) => void;
  onToggle: (id: string) => void;
  onTest: (r: DiscoveryRule) => void;
  spotlight?: boolean;
}) {
  const [type, setType] = useState("All");
  const [query, setQuery] = useState("");
  const filtered = rules.filter((r) =>
    (type === "All" || r.ruleType === type) &&
    (r.name.toLowerCase().includes(query.toLowerCase()) || r.id.toLowerCase().includes(query.toLowerCase())));

  return (
    <Panel
      id="panel-rules"
      title="Discovery Rules"
      subtitle="Rules determine what discovery may include, exclude, restrict, prioritize, sample, or stop"
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rules" className="h-7 w-52 text-[11.5px]" aria-label="Search discovery rules" />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-7 w-[160px] text-[11px]" aria-label="Rule type filter"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All" className="text-[12px]">All rule types</SelectItem>
            {Array.from(new Set(rules.map((r) => r.ruleType))).map((t) => (
              <SelectItem key={t} value={t} className="text-[12px]">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="h-7 text-[11px]" onClick={onAdd}>Add Rule</Button>
        <span className="ml-auto text-[10.5px] text-slate-500">
          Governed deletion and rule approval arrive with configuration governance
        </span>
      </div>
      <div className="max-h-[380px] overflow-auto">
        <table className="w-full min-w-[980px] text-[11px]">
          <caption className="sr-only">Discovery rules</caption>
          <thead className="sticky top-0 bg-slate-50 text-slate-500">
            <tr>
              {["Rule ID", "Name", "Type", "Scope", "Source Platform", "Condition", "Action", "Priority", "Owner", "Matches", "Status", "Actions"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr key={r.id} className={cn("hover:bg-slate-50", !r.enabled && "opacity-55")}>
                <td className="px-2 py-1.5 font-mono text-[10.5px] text-slate-600">{r.id}</td>
                <td className="px-2 py-1.5 font-medium text-slate-800">{r.name}</td>
                <td className="px-2 py-1.5">
                  <StatusBadge tone={r.ruleType === "Exclude" ? "red" : r.ruleType === "Restrict" ? "amber" : r.ruleType === "Include" ? "green" : "blue"}>
                    {r.ruleType}
                  </StatusBadge>
                </td>
                <td className="px-2 py-1.5 text-slate-600">{r.scope}</td>
                <td className="px-2 py-1.5 text-slate-600">{r.sourcePlatform}</td>
                <td className="max-w-[240px] truncate px-2 py-1.5 text-slate-600">
                  {r.conditions.map((c) => `${c.attribute} ${c.operator} ${c.value}`).join(` ${r.conditions[0]?.join ?? "AND"} `)}
                </td>
                <td className="max-w-[200px] truncate px-2 py-1.5 text-slate-600">{r.action}</td>
                <td className="px-2 py-1.5 text-slate-700">{r.priority >= 1000 ? "Highest" : r.priority}</td>
                <td className="px-2 py-1.5 text-slate-600">{r.owner}</td>
                <td className="px-2 py-1.5 text-slate-700">{fmt(r.previewMatchCount)}</td>
                <td className="px-2 py-1.5">
                  <StatusBadge tone={r.enabled ? "green" : "slate"}>{r.enabled ? "Enabled" : "Disabled"}</StatusBadge>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5">
                  <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onEdit(r)}>Edit</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onDuplicate(r)}>Duplicate</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onToggle(r.id)}>{r.enabled ? "Disable" : "Enable"}</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onTest(r)}>Test</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* --------------------------------------------------- content type policy panel */

export function ContentTypePolicyPanel({
  draft, onChange, spotlight,
}: {
  draft: DraftState;
  onChange: (ct: string, patch: Partial<ContentTypePolicyRow>) => void;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-content-types"
      title="Content Type Discovery Policy"
      subtitle="Discovery state, authority default, downstream eligibility, freshness, and access policy by content type"
      spotlight={spotlight}
    >
      <div className="max-h-[380px] overflow-auto">
        <table className="w-full min-w-[1040px] text-[11px]">
          <caption className="sr-only">Content type discovery policy</caption>
          <thead className="sticky top-0 bg-slate-50 text-slate-500">
            <tr>
              {["Content Type", "Discovery State", "Default Authority", "Evidence", "Condition Extraction",
                "Persona Relevance", "Memory After Approval", "Freshness SLA", "Access Policy"].map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 text-left font-medium">{h}</th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.values(draft.contentTypes).map((c) => (
              <tr key={c.contentType} className="hover:bg-slate-50">
                <td className="px-2 py-1.5 font-medium text-slate-800">{c.contentType}</td>
                <td className="px-2 py-1.5">
                  <Select value={c.discoveryState} onValueChange={(v) => onChange(c.contentType, { discoveryState: v as "Allow" })}>
                    <SelectTrigger className="h-6 w-[92px] text-[10.5px]" aria-label={`Discovery state for ${c.contentType}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Allow" className="text-[12px]">Allow</SelectItem>
                      <SelectItem value="Restrict" className="text-[12px]">Restrict</SelectItem>
                      <SelectItem value="Exclude" className="text-[12px]">Exclude</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1.5">
                  <Select value={c.defaultAuthority} onValueChange={(v) => onChange(c.contentType, { defaultAuthority: v as AuthorityBand })}>
                    <SelectTrigger className="h-6 w-[168px] text-[10.5px]" aria-label={`Authority for ${c.contentType}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[...authorityBands, "Observed Operational Evidence", "Technical Evidence"].map((a) => (
                        <SelectItem key={a} value={a} className="text-[12px]">{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                {(["evidenceEligible", "conditionEligible", "personaEligible", "memoryEligible"] as const).map((k) => (
                  <td key={k} className="px-2 py-1.5">
                    <Switch
                      checked={c[k]}
                      onCheckedChange={(v) => onChange(c.contentType, { [k]: v } as Partial<ContentTypePolicyRow>)}
                      aria-label={`${k} for ${c.contentType}`}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5 text-slate-600">{c.freshnessSla}</td>
                <td className="px-2 py-1.5 text-slate-600">{c.accessPolicy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------ permission policy panel */

export function PermissionPolicyPanel({
  draft, onToggle, spotlight,
}: { draft: DraftState; onToggle: (key: keyof DraftState["permission"]) => void; spotlight?: boolean }) {
  const perm = draft.permission;
  const rows: { key: keyof DraftState["permission"]; label: string; note: string }[] = [
    { key: "preserveSourceAcl", label: "Preserve Source ACL", note: "Discovery never flattens permissions" },
    { key: "preserveClassification", label: "Preserve Source Classification", note: "Classification travels with the artifact" },
    { key: "preserveResidency", label: "Preserve Data Residency", note: "Residency constraints follow the record" },
    { key: "unknownPermissionBehavior", label: "Restrict Content When Source Permission Unknown", note: "Fail closed on unknown access" },
    { key: "metadataOnlyWhenRestricted", label: "Allow Metadata Only When Content Restricted", note: "Metadata visibility without content retrieval" },
    { key: "permissionChangeRediscovery", label: "Permission Change Triggers Rediscovery", note: "Access changes revalidate downstream exposure" },
  ];
  return (
    <Panel
      id="panel-permissions"
      title="Discovery Permission Policy"
      subtitle="PRESERVE SOURCE ACCESS. Do not flatten permissions."
      spotlight={spotlight}
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li key={r.key} className="flex items-start justify-between gap-3 rounded-md border border-slate-200 px-2.5 py-1.5">
              <div className="min-w-0">
                <div className="text-[11.5px] font-medium text-slate-800">{r.label}</div>
                <div className="text-[10.5px] text-slate-500">{r.note}</div>
              </div>
              <Switch checked={Boolean(perm[r.key])} onCheckedChange={() => onToggle(r.key)} aria-label={r.label} />
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <div className="rounded-lg border border-slate-200 p-2.5">
            <h4 className="text-[11px] font-semibold text-slate-800">Permission Inheritance</h4>
            <ol className="mt-1.5 flex flex-wrap items-center gap-1 text-[10.5px] text-slate-600">
              {permissionInheritanceChain.map((p, i) => (
                <li key={p} className="flex items-center gap-1">
                  <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">{p}</span>
                  {i < permissionInheritanceChain.length - 1 && <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden />}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-2.5">
            <h4 className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-900">
              <Shield className="h-3.5 w-3.5" aria-hidden /> Derived context rule
            </h4>
            <p className="mt-1 text-[11px] text-blue-900">{perm.derivedKnowledgeRules}</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* --------------------------------------------------------- authority panel */

export function AuthorityPanel({
  draft, onMappingChange, spotlight,
}: { draft: DraftState; onMappingChange: (sourceType: string, a: AuthorityBand) => void; spotlight?: boolean }) {
  return (
    <Panel
      id="panel-authority"
      title="Source Authority Preferences"
      subtitle="Authority preferences influence downstream review. They never make an extracted record approved."
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        {authorityBands.map((b) => <StatusBadge key={b} tone="blue">{b}</StatusBadge>)}
      </div>
      <table className="w-full text-[11px]">
        <caption className="sr-only">Source authority preferences</caption>
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th scope="col" className="px-2 py-1.5 text-left font-medium">Source Type</th>
            <th scope="col" className="px-2 py-1.5 text-left font-medium">Authority Band</th>
            <th scope="col" className="px-2 py-1.5 text-left font-medium">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {draft.authority.sourceTypeMappings.map((m) => (
            <tr key={m.sourceType} className="hover:bg-slate-50">
              <td className="px-2 py-1.5 font-medium text-slate-800">{m.sourceType}</td>
              <td className="px-2 py-1.5">
                <Select value={m.authority} onValueChange={(v) => onMappingChange(m.sourceType, v as AuthorityBand)}>
                  <SelectTrigger className="h-6 w-[210px] text-[10.5px]" aria-label={`Authority for ${m.sourceType}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[...authorityBands, "Observed Operational Evidence", "Technical Evidence"].map((a) => (
                      <SelectItem key={a} value={a} className="text-[12px]">{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-2 py-1.5 text-slate-600">{m.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

/* --------------------------------------------------------- freshness panel */

export function FreshnessPanel({
  draft, onChange, spotlight,
}: { draft: DraftState; onChange: (id: string, patch: Partial<DraftState["freshness"][number]>) => void; spotlight?: boolean }) {
  const stale = draft.freshness.reduce((s, f) => s + f.expectedStale, 0);
  const warning = draft.freshness.reduce((s, f) => s + f.expectedWarning, 0);
  return (
    <Panel
      id="panel-freshness"
      title="Discovery Freshness Policy"
      subtitle={`Expected stale volume ${stale.toLocaleString()} records · potential warning volume ${warning.toLocaleString()} records`}
      spotlight={spotlight}
    >
      <table className="w-full text-[11px]">
        <caption className="sr-only">Discovery freshness policy</caption>
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {["Source Type", "Freshness SLA", "Warning Threshold", "Stale Threshold", "Rediscovery Trigger", "Owner", "Expected Stale"].map((h) => (
              <th key={h} scope="col" className="px-2 py-1.5 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {draft.freshness.map((f) => (
            <tr key={f.id} className="hover:bg-slate-50">
              <td className="px-2 py-1.5 font-medium text-slate-800">{f.sourceType}</td>
              <td className="px-2 py-1.5">
                <Input
                  value={f.freshnessSla}
                  onChange={(e) => onChange(f.id, { freshnessSla: e.target.value })}
                  className="h-6 w-[168px] text-[10.5px]"
                  aria-label={`Freshness SLA for ${f.sourceType}`}
                />
              </td>
              <td className="px-2 py-1.5 text-slate-600">{f.warningThreshold}</td>
              <td className="px-2 py-1.5 text-slate-600">{f.staleThreshold}</td>
              <td className="px-2 py-1.5 text-slate-600">{f.rediscoveryTrigger}</td>
              <td className="px-2 py-1.5 text-slate-600">{f.owner}</td>
              <td className="px-2 py-1.5 text-slate-700">{f.expectedStale.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

/* ----------------------------------------------------------- cadence panel */

export function CadencePanel({
  draft, preview, onModeChange, onScheduleChange, onFullScheduleChange, spotlight,
}: {
  draft: DraftState;
  preview: DiscoveryPreview;
  onModeChange: (m: DraftState["cadence"]["mode"]) => void;
  onScheduleChange: (s: string) => void;
  onFullScheduleChange: (s: string) => void;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-cadence"
      title="Discovery Cadence"
      subtitle="Enterprise default is Hybrid: scheduled incremental with event triggers and weekly full reconciliation"
      spotlight={spotlight}
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="block">
            <span className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Mode</span>
            <Select value={draft.cadence.mode} onValueChange={(v) => onModeChange(v as "Hybrid")}>
              <SelectTrigger className="mt-1 h-7 text-[11.5px]" aria-label="Discovery cadence mode"><SelectValue /></SelectTrigger>
              <SelectContent>
                {cadenceModes.map((m) => <SelectItem key={m} value={m} className="text-[12px]">{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="block">
            <span className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Incremental schedule</span>
            <Select value={draft.cadence.incrementalSchedule} onValueChange={onScheduleChange}>
              <SelectTrigger className="mt-1 h-7 text-[11.5px]" aria-label="Incremental schedule"><SelectValue /></SelectTrigger>
              <SelectContent>
                {cadenceScheduleOptions.map((c) => <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="block">
            <span className="text-[10.5px] font-medium uppercase tracking-wide text-slate-500">Full reconciliation</span>
            <Select value={draft.cadence.fullSchedule} onValueChange={onFullScheduleChange}>
              <SelectTrigger className="mt-1 h-7 text-[11.5px]" aria-label="Full reconciliation schedule"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Daily full reconciliation", "Weekly full reconciliation", "Monthly full reconciliation"].map((c) => (
                  <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Cycles per day" value={String(preview.estimatedCyclesPerDay)} />
            <Metric label="Workload per cycle" value={fmt(preview.estimatedWorkloadPerCycle)} sub="artifacts" />
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold text-slate-800">Cadence inheritance</h4>
          <table className="mt-1 w-full text-[11px]">
            <caption className="sr-only">Cadence scope overrides</caption>
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th scope="col" className="px-2 py-1 text-left font-medium">Scope</th>
                <th scope="col" className="px-2 py-1 text-left font-medium">Cadence</th>
                <th scope="col" className="px-2 py-1 text-left font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {draft.cadence.scopeOverrides.map((o) => (
                <tr key={o.scope}>
                  <td className="px-2 py-1 text-slate-800">{o.scope}</td>
                  <td className="px-2 py-1 text-slate-600">{o.cadence}</td>
                  <td className="px-2 py-1"><StatusBadge tone={o.inherited ? "slate" : "blue"}>{o.inherited ? "Inherited" : "Explicit"}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[10.5px] text-slate-600">
            Event triggers: {draft.cadence.eventTriggers.join(" · ")}
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* --------------------------------------------------- change detection panel */

export function ChangeDetectionPanel({
  draft, onToggle, onDiscoveryChange, spotlight,
}: {
  draft: DraftState;
  onToggle: (id: string, key: "metadataRefresh" | "fullReingestion" | "permissionRevalidation" | "downstreamReassessment") => void;
  onDiscoveryChange: (id: string, v: string) => void;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-change-detection"
      title="Discovery Change Detection"
      subtitle="What constitutes new versus changed content, and what each change triggers"
      spotlight={spotlight}
    >
      <div className="max-h-[320px] overflow-auto">
        <table className="w-full min-w-[820px] text-[11px]">
          <caption className="sr-only">Discovery change detection triggers</caption>
          <thead className="sticky top-0 bg-slate-50 text-slate-500">
            <tr>
              {["Trigger", "Discovery Behavior", "Metadata Refresh", "Full Reingestion", "Permission Revalidation", "Downstream Reassessment"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {draft.changeDetection.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-2 py-1.5 font-medium text-slate-800">{c.triggerType}</td>
                <td className="px-2 py-1.5">
                  <Select value={c.triggerDiscovery} onValueChange={(v) => onDiscoveryChange(c.id, v)}>
                    <SelectTrigger className="h-6 w-[148px] text-[10.5px]" aria-label={`Discovery behavior for ${c.triggerType}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Incremental", "Metadata Refresh", "Full Discovery", "No Action"].map((o) => (
                        <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                {(["metadataRefresh", "fullReingestion", "permissionRevalidation", "downstreamReassessment"] as const).map((k) => (
                  <td key={k} className="px-2 py-1.5">
                    <Switch checked={c[k]} onCheckedChange={() => onToggle(c.id, k)} aria-label={`${k} for ${c.triggerType}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------ duplicates */

export function DuplicatePolicyPanel({
  draft, onStrategyToggle, onThresholdChange, spotlight,
}: {
  draft: DraftState;
  onStrategyToggle: (name: string) => void;
  onThresholdChange: (key: "autoLinkThreshold" | "humanReviewThreshold", v: number) => void;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-duplicates"
      title="Artifact Identity & Duplicate Policy"
      subtitle="Preserve every original source identity. A source artifact is never deleted because another copy exists."
      spotlight={spotlight}
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <h4 className="text-[11px] font-semibold text-slate-800">Identity strategies</h4>
          <ul className="mt-1 space-y-1">
            {draft.duplicate.identityStrategies.map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-1">
                <div>
                  <div className="text-[11px] font-medium text-slate-800">{s.name}</div>
                  <div className="text-[10.5px] text-slate-500">{s.note}</div>
                </div>
                <Switch checked={s.enabled} onCheckedChange={() => onStrategyToggle(s.name)} aria-label={s.name} />
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-2">
            {(["autoLinkThreshold", "humanReviewThreshold"] as const).map((k) => (
              <div key={k}>
                <div className="flex items-center justify-between text-[10.5px] text-slate-600">
                  <span>{k === "autoLinkThreshold" ? "Auto link confidence" : "Human review confidence"}</span>
                  <span className="font-semibold text-slate-800">{draft.duplicate[k]}%</span>
                </div>
                <Slider
                  value={[draft.duplicate[k]]}
                  min={50} max={100} step={1}
                  onValueChange={(v) => onThresholdChange(k, v[0])}
                  aria-label={k === "autoLinkThreshold" ? "Auto link confidence threshold" : "Human review confidence threshold"}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold text-slate-800">Outcomes</h4>
          <table className="mt-1 w-full text-[11px]">
            <caption className="sr-only">Duplicate outcomes</caption>
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th scope="col" className="px-2 py-1 text-left font-medium">Outcome</th>
                <th scope="col" className="px-2 py-1 text-left font-medium">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {draft.duplicate.duplicateStrategies.map((d) => (
                <tr key={d.outcome}>
                  <td className="px-2 py-1 font-medium text-slate-800">{d.outcome}</td>
                  <td className="px-2 py-1 text-slate-600">{d.handling}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------- traversal */

export function TraversalPanel({
  draft, preview, onDepthChange, onFollowToggle, spotlight,
}: {
  draft: DraftState;
  preview: DiscoveryPreview;
  onDepthChange: (d: 1 | 2 | 3 | 99) => void;
  onFollowToggle: (key: keyof DraftState["traversal"]) => void;
  spotlight?: boolean;
}) {
  const follows: { key: keyof DraftState["traversal"]; label: string }[] = [
    { key: "followLinks", label: "Follow linked documents" },
    { key: "followTickets", label: "Follow referenced tickets" },
    { key: "followArchitectureReferences", label: "Follow embedded architecture decisions" },
    { key: "followServiceReferences", label: "Follow related service records" },
    { key: "followDependencies", label: "Follow dependency references" },
  ];
  return (
    <Panel
      id="panel-traversal"
      title="Discovery Traversal & Depth"
      subtitle={draft.traversal.externalBoundaryBehavior}
      spotlight={spotlight}
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <div className="inline-flex rounded-md border border-slate-200" role="group" aria-label="Maximum traversal depth">
            {([1, 2, 3, 99] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={draft.traversal.maxDepth === d}
                onClick={() => onDepthChange(d)}
                className={cn("px-2.5 py-1 text-[11px] font-medium first:rounded-l-md last:rounded-r-md",
                  draft.traversal.maxDepth === d ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}
              >
                {d === 99 ? "Unlimited within approved scope" : `Depth ${d}`}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-600">
            Recommended default is Depth 3. Projected discoverable volume at the current depth is{" "}
            <span className="font-semibold text-slate-900">{fmt(preview.discoverableArtifacts)}</span> artifacts.
          </p>
          <ul className="mt-2 space-y-1">
            {follows.map((f) => (
              <li key={String(f.key)} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-1">
                <span className="text-[11px] text-slate-700">{f.label}</span>
                <Switch checked={Boolean(draft.traversal[f.key])} onCheckedChange={() => onFollowToggle(f.key)} aria-label={f.label} />
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 p-2.5">
          <h4 className="text-[11px] font-semibold text-slate-800">External boundary</h4>
          <p className="mt-1 text-[11px] text-slate-600">
            Traversal stops at the approved enterprise boundary. External domains are never followed in this configuration.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Metric label="Depth" value={draft.traversal.maxDepth === 99 ? "Unlimited" : `Depth ${draft.traversal.maxDepth}`} />
            <Metric label="Projected volume" value={fmt(preview.discoverableArtifacts)} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------- sampling */

export function SamplingPanel({
  draft, onChange, spotlight,
}: {
  draft: DraftState;
  onChange: (id: string, patch: Partial<DraftState["sampling"][number]>) => void;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-sampling"
      title="Discovery Sampling"
      subtitle="Sampling allows low value, extremely high volume content classes to be explored without full retrieval"
      spotlight={spotlight}
    >
      <table className="w-full text-[11px]">
        <caption className="sr-only">Discovery sampling policy</caption>
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {["Content Class", "Sampling Mode", "Sample Rate", "Time Window", "Metadata First", "Protected"].map((h) => (
              <th key={h} scope="col" className="px-2 py-1.5 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {draft.sampling.map((s) => (
            <tr key={s.id} className={cn("hover:bg-slate-50", s.protected && "bg-emerald-50/40")}>
              <td className="px-2 py-1.5 font-medium text-slate-800">{s.contentType}</td>
              <td className="px-2 py-1.5">
                {s.protected ? (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-700">
                    <Lock className="h-3 w-3" aria-hidden /> No Sampling (protected)
                  </span>
                ) : (
                  <Select value={s.samplingMode} onValueChange={(v) => onChange(s.id, { samplingMode: v as "No Sampling" })}>
                    <SelectTrigger className="h-6 w-[190px] text-[10.5px]" aria-label={`Sampling mode for ${s.contentType}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["No Sampling", "Percentage Sampling", "Recent Window Sampling", "Metadata First Sampling"].map((m) => (
                        <SelectItem key={m} value={m} className="text-[12px]">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </td>
              <td className="px-2 py-1.5 text-slate-700">{s.sampleRate}%</td>
              <td className="px-2 py-1.5 text-slate-600">{s.timeWindow}</td>
              <td className="px-2 py-1.5">{s.metadataFirst ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-label="Yes" /> : <Minus className="h-3.5 w-3.5 text-slate-400" aria-label="No" />}</td>
              <td className="px-2 py-1.5">{s.protected ? <StatusBadge tone="green">Protected</StatusBadge> : <span className="text-slate-400">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[10.5px] text-slate-600">
        Sampling is never applied to approved policies, critical controls, architecture decisions, regulatory evidence,
        decision records, outcome records, or validated learning.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------- handoffs */

export function ProcessingHandoffPanel({
  draft, onToggle, onQualityChange, onReviewToggle, spotlight,
}: {
  draft: DraftState;
  onToggle: (id: string) => void;
  onQualityChange: (id: string, v: number) => void;
  onReviewToggle: (id: string) => void;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-handoffs"
      title="Discovery Processing Handoffs"
      subtitle="Discovery → Evidence Vault → Artifact Ingestion → Normalization → Business Condition Extraction → Team Persona Context → Enterprise Cognitive Memory"
      spotlight={spotlight}
    >
      <div className="mb-2 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] text-blue-900">
        Discovery Configuration controls eligibility and routing only. It does not approve downstream Business Conditions or Team Personas.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1020px] text-[11px]">
          <caption className="sr-only">Discovery processing handoffs</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["Destination", "Eligible Content", "Required Metadata", "Access Requirements", "Quality Threshold", "Authority Requirement", "Human Review", "Enabled"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {draft.handoffs.map((h) => (
              <tr key={h.id} className={cn("hover:bg-slate-50", !h.enabled && "opacity-60")}>
                <td className="px-2 py-1.5 font-medium text-slate-800">{h.destination}</td>
                <td className="px-2 py-1.5 text-slate-600">{h.eligibleContentTypes}</td>
                <td className="px-2 py-1.5 text-slate-600">{h.requiredMetadata}</td>
                <td className="px-2 py-1.5 text-slate-600">{h.accessRequirements}</td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <Slider
                      className="w-20"
                      value={[h.qualityThreshold]} min={50} max={100} step={1}
                      onValueChange={(v) => onQualityChange(h.id, v[0])}
                      aria-label={`Quality threshold for ${h.destination}`}
                    />
                    <span className="text-[10.5px] font-semibold text-slate-800">{h.qualityThreshold}</span>
                  </div>
                </td>
                <td className="px-2 py-1.5 text-slate-600">{h.authorityRequirement}</td>
                <td className="px-2 py-1.5">
                  <Switch checked={h.humanReviewRequired} onCheckedChange={() => onReviewToggle(h.id)} aria-label={`Human review for ${h.destination}`} />
                </td>
                <td className="px-2 py-1.5">
                  <Switch checked={h.enabled} onCheckedChange={() => onToggle(h.id)} aria-label={`Enable ${h.destination}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* --------------------------------------------------------------- evidence */

export function EvidencePanel({
  draft, onToggle, spotlight,
}: { draft: DraftState; onToggle: (key: keyof DraftState["evidence"]) => void; spotlight?: boolean }) {
  return (
    <Panel
      id="panel-evidence"
      title="Evidence Preservation"
      subtitle="Core governance requirements. Disabling any of these breaks evidence traceability."
      spotlight={spotlight}
    >
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {evidenceFields.map((f) => {
          const on = Boolean(draft.evidence[f.key]);
          return (
            <li key={String(f.key)} className={cn(
              "flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5",
              on ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50",
            )}>
              <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-800">
                <Shield className={cn("h-3.5 w-3.5", on ? "text-emerald-600" : "text-red-600")} aria-hidden />
                {f.label}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] font-semibold text-slate-600">{on ? "Yes" : "No"}</span>
                <Switch checked={on} onCheckedChange={() => onToggle(f.key)} aria-label={f.label} />
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* ---------------------------------------------------------------- preview */

export function PreviewPanel({
  preview, onWarningSelect, onDryRun, spotlight,
}: {
  preview: DiscoveryPreview;
  onWarningSelect: (w: DiscoveryPreviewWarning) => void;
  onDryRun: () => void;
  spotlight?: boolean;
}) {
  const metrics: [string, string][] = [
    ["Sources Evaluated", String(preview.sourcesEvaluated)],
    ["Included Sources", String(preview.includedSources)],
    ["Excluded", String(preview.excludedSources)],
    ["Restricted", String(preview.restrictedSources)],
    ["Artifacts Discoverable", fmt(preview.discoverableArtifacts)],
    ["Projected New", fmt(preview.newArtifacts)],
    ["Projected Changed", fmt(preview.changedArtifacts)],
    ["Projected Permission Changes", fmt(preview.permissionChanges)],
    ["Potential Duplicates", fmt(preview.potentialDuplicates)],
    ["Restricted Artifacts", fmt(preview.restrictedArtifacts)],
    ["Condition Eligible Artifacts", fmt(preview.conditionEligibleArtifacts)],
    ["Persona Relevant Artifacts", fmt(preview.personaRelevantArtifacts)],
    ["Projected Ingestion Volume", fmt(preview.projectedIngestionVolume)],
    ["Projected Full Reconciliation", fmt(preview.projectedFullReconciliationVolume)],
    ["Warnings", String(preview.warnings.length)],
    ["Blocking Issues", String(preview.blockingIssues.length)],
  ];
  return (
    <Panel
      id="panel-preview"
      title="Discovery Configuration Preview"
      subtitle={`Deterministic estimate for draft v${preview.configurationVersion}. Preview never mutates Source Registry or downstream modules.`}
      spotlight={spotlight}
      footer="Run Dry Run Discovery"
      onFooter={onDryRun}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {metrics.map(([label, value]) => (
          <Metric key={label} label={label} value={value} />
        ))}
      </div>
      <ul className="mt-2 space-y-1">
        {[...preview.blockingIssues, ...preview.warnings].map((w) => (
          <li key={w.id}>
            <button
              type="button"
              onClick={() => onWarningSelect(w)}
              className={cn(
                "flex w-full items-start gap-1.5 rounded-md border px-2 py-1 text-left text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                w.severity === "Blocking" ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800",
              )}
            >
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
              <span>{w.message} — highlight {w.elementLabel}</span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------------------------------------ preview breakdown */

export function PreviewBreakdownPanel({
  draft, preview, spotlight,
}: { draft: DraftState; preview: DiscoveryPreview; spotlight?: boolean }) {
  const [dim, setDim] = useState<BreakdownDimension>("Source Platform");
  const rows = useMemo(() => computeBreakdown(draft, preview, dim), [draft, preview, dim]);
  return (
    <Panel
      id="panel-breakdown"
      title="Preview Breakdown"
      subtitle="Included, excluded, restricted, new, changed, and estimated volume by dimension"
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap gap-1">
        {breakdownDimensions.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={dim === d}
            onClick={() => setDim(d)}
            className={cn("rounded-md border px-2 py-1 text-[10.5px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              dim === d ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="max-h-[300px] overflow-auto">
          <table className="w-full text-[11px]">
            <caption className="sr-only">Preview breakdown by {dim}</caption>
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                {[dim, "Included", "Excluded", "Restricted", "New", "Changed", "Estimated Volume", "Warnings"].map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap px-2 py-1.5 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.key} className="hover:bg-slate-50">
                  <td className="px-2 py-1.5 font-medium text-slate-800">{r.key}</td>
                  <td className="px-2 py-1.5 text-slate-700">{fmt(r.included)}</td>
                  <td className="px-2 py-1.5 text-slate-700">{fmt(r.excluded)}</td>
                  <td className="px-2 py-1.5 text-slate-700">{fmt(r.restricted)}</td>
                  <td className="px-2 py-1.5 text-slate-700">{fmt(r.newCount)}</td>
                  <td className="px-2 py-1.5 text-slate-700">{fmt(r.changed)}</td>
                  <td className="px-2 py-1.5 font-semibold text-slate-900">{fmt(r.volume)}</td>
                  <td className="px-2 py-1.5">{r.warnings ? <StatusBadge tone="amber">{r.warnings}</StatusBadge> : <span className="text-slate-400">0</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows.slice(0, 12)} layout="vertical" margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => fmt(v)} />
              <YAxis type="category" dataKey="key" width={110} tick={{ fontSize: 9.5 }} />
              <RTooltip formatter={(v: number) => v.toLocaleString()} contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="volume" radius={[0, 3, 3, 0]}>
                {rows.slice(0, 12).map((r) => (
                  <Cell key={r.key} fill={r.excluded > 0 ? "#94a3b8" : r.warnings ? "#f59e0b" : "#2563eb"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Panel>
  );
}

/* ----------------------------------------------------------------- quality */

export function QualityPanel({
  draft, preview, spotlight,
}: { draft: DraftState; preview: DiscoveryPreview; spotlight?: boolean }) {
  const scores = useMemo(() => {
    const evidenceOn = evidenceFields.filter((f) => draft.evidence[f.key]).length;
    const permOn = [
      draft.permission.preserveSourceAcl, draft.permission.preserveClassification,
      draft.permission.preserveResidency, draft.permission.unknownPermissionBehavior,
      draft.permission.metadataOnlyWhenRestricted, draft.permission.permissionChangeRediscovery,
    ].filter(Boolean).length;
    const handoffOn = draft.handoffs.filter((h) => h.enabled).length;
    const platformsOn = Object.values(draft.platforms).filter((p) => p.enabled).length;
    const scopeOn = Object.values(draft.scope).filter((s) => s !== "excluded").length;

    return qualityDimensions.map((d) => {
      let current = d.base;
      if (d.name === "Permission Preservation") current = Math.round((permOn / 6) * 100);
      if (d.name === "Processing Handoff Coverage") current = Math.round((handoffOn / draft.handoffs.length) * 100) - 3 + 3;
      if (d.name === "Source Coverage") current = Math.round((platformsOn / Object.keys(draft.platforms).length) * 96);
      if (d.name === "Scope Completeness") current = Math.round((scopeOn / Object.keys(draft.scope).length) * 98);
      if (d.name === "Rule Integrity") current = Math.max(60, d.base - preview.warnings.length);
      if (d.name === "Preview Confidence") current = preview.blockingIssues.length ? 60 : d.base;
      if (d.name === "Ownership Coverage") current = d.base;
      if (d.name === "Freshness Coverage") current = d.base;
      const evidencePenalty = d.name === "Preview Confidence" ? Math.round(((10 - evidenceOn) / 10) * 20) : 0;
      current = Math.max(0, Math.min(100, current - evidencePenalty));
      return { ...d, current };
    });
  }, [draft, preview]);

  const overall = Math.round(scores.reduce((s, d) => s + d.current, 0) / scores.length);
  return (
    <Panel
      id="panel-quality"
      title="Discovery Configuration Quality"
      subtitle={`Overall ${overall} / 100 · target 97`}
      spotlight={spotlight}
    >
      <div className="mb-2 flex items-center gap-3">
        <div className="text-3xl font-bold text-slate-900">{overall}</div>
        <div className="flex-1">
          <Progress value={overall} className="h-2" aria-label={`Overall configuration quality ${overall} out of 100`} />
          <div className="mt-1 text-[10.5px] text-slate-500">
            {overall >= 95 ? "Healthy" : overall >= 88 ? "Attention" : "At risk"} · target 97
          </div>
        </div>
      </div>
      <table className="w-full text-[11px]">
        <caption className="sr-only">Discovery configuration quality dimensions</caption>
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {["Dimension", "Current", "Target", "Variance", "Affected Configuration Elements", "Status"].map((h) => (
              <th key={h} scope="col" className="px-2 py-1.5 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {scores.map((d) => {
            const variance = d.current - d.target;
            return (
              <tr key={d.name} className="hover:bg-slate-50">
                <td className="px-2 py-1.5 font-medium text-slate-800">{d.name}</td>
                <td className="px-2 py-1.5 text-slate-900">{d.current}</td>
                <td className="px-2 py-1.5 text-slate-600">{d.target}</td>
                <td className={cn("px-2 py-1.5 font-medium", variance < 0 ? "text-amber-700" : "text-emerald-700")}>
                  {variance > 0 ? `+${variance}` : variance}
                </td>
                <td className="px-2 py-1.5 text-slate-600">{d.elements}</td>
                <td className="px-2 py-1.5">
                  <StatusBadge tone={variance >= 0 ? "green" : variance >= -4 ? "amber" : "red"}>
                    {variance >= 0 ? "At target" : variance >= -4 ? "Below target" : "Attention"}
                  </StatusBadge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}

export function Prompt2Placeholder() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3">
      <h2 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-800">
        <CircleDot className="h-3.5 w-3.5 text-slate-400" aria-hidden /> Configuration governance arrives next
      </h2>
      <p className="mt-1 text-[11.5px] text-slate-600">
        Validation, configuration review, policy and access policy conflicts, change impact analysis, version history and
        comparison, approval workflow, publishing, activation and scheduled activation, rollback, environment promotion,
        configuration inheritance, exception management, drift detection, health checks, notifications, global search,
        and governed export extend this page without structural redesign.
      </p>
    </div>
  );
}
