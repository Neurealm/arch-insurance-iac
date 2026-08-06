import { useMemo, useState } from "react";
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip,
} from "recharts";
import {
  ArrowRight, ChevronRight, CircleCheck, CirclePause, CircleSlash, MoreHorizontal, TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Panel } from "../command-center/panels";
import { Drawer, Pill, Row } from "../pipeline/panels";
import {
  approvalColumns, authorityDefinitions, authorityMatrix, categoryDistribution, lifecycleCounts,
  lineageStages, lifecycleTransitions, registryQuality, relationshipNodes, relationshipSummary,
  relationshipsForSource, sourceAuthorityDetail, sourceQualityDetail,
  type ApprovalState, type AuthorityLevel, type RegistryActivity, type RegistryException,
  type SourceRegistryRecord, type SourceReview, type ViewMode,
} from "./data";

/* --------------------------------- atoms ---------------------------------- */

type Tone = "green" | "amber" | "red" | "blue" | "slate";

export const registryTone = (status: string): Tone => {
  if (["Active", "Approved", "Healthy", "Current", "Real Time", "Ready", "Resolved", "Primary"].includes(status)) return "green";
  if (["Warning", "Pending", "Pending Review", "Aging", "Acknowledged", "Medium", "Degraded", "Restricted Approval", "Supporting"].includes(status)) return "amber";
  if (["Action Required", "Degraded Connector", "Failing", "Stale", "Critical", "High", "Blocked", "Open", "Possible Duplicate"].includes(status)) return "red";
  if (["Paused", "Deprecated", "Snoozed", "Low", "Historical", "Not Configured", "Unconfirmed"].includes(status)) return "slate";
  return "blue";
};

export function StatusText({ status }: { status: string }) {
  const tone = registryTone(status);
  const Icon = tone === "green" ? CircleCheck : tone === "amber" ? TriangleAlert : tone === "red" ? CircleSlash : CirclePause;
  return (
    <span className="inline-flex items-center gap-1">
      <Icon
        className={cn("h-3.5 w-3.5", tone === "green" ? "text-emerald-600" : tone === "amber" ? "text-amber-600" : tone === "red" ? "text-red-600" : "text-slate-500")}
        aria-hidden
      />
      <Pill label={status} tone={tone} />
    </span>
  );
}

export const nf = (n: number) => n.toLocaleString("en-US");

export function download(name: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function sourcesToCsv(rows: SourceRegistryRecord[]) {
  const head = [
    "Source ID", "Source Name", "Category", "Platform", "Business Owner", "Technical Owner",
    "Teams", "Domains", "Authority", "Approval State", "Access", "Freshness", "Quality", "Registry Status", "Artifacts",
  ];
  const body = rows.map((s) => [
    s.id, s.sourceName, s.category, s.platform, s.businessOwner, s.technicalOwner,
    s.teamsRepresented, s.knowledgeDomains.join(" | "), s.authorityLevel, s.approvalState,
    s.accessClassification, s.freshnessStatus, s.qualityScore, s.registryStatus, s.artifactCount,
  ]);
  return [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function sourcesToYaml(rows: SourceRegistryRecord[]) {
  return rows
    .map((s) =>
      [
        `- id: ${s.id}`, `  sourceName: "${s.sourceName}"`, `  category: ${s.category}`,
        `  platform: "${s.platform}"`, `  businessOwner: "${s.businessOwner}"`,
        `  authorityLevel: ${s.authorityLevel}`, `  approvalState: "${s.approvalState}"`,
        `  accessClassification: ${s.accessClassification}`, `  qualityScore: ${s.qualityScore}`,
        `  registryStatus: "${s.registryStatus}"`, `  artifactCount: ${s.artifactCount}`,
      ].join("\n"),
    )
    .join("\n");
}

/* ------------------------------ registry table ----------------------------- */

interface Column { key: string; label: string; sortable?: boolean; numeric?: boolean; render: (s: SourceRegistryRecord) => React.ReactNode; value: (s: SourceRegistryRecord) => string | number }

const columnsByView: Record<ViewMode, Column[]> = {
  catalog: [
    { key: "id", label: "Source ID", sortable: true, render: (s) => <span className="font-medium text-blue-700">{s.id}</span>, value: (s) => s.id },
    { key: "name", label: "Source Name", sortable: true, render: (s) => s.sourceName, value: (s) => s.sourceName },
    { key: "category", label: "Category", sortable: true, render: (s) => s.category, value: (s) => s.category },
    { key: "platform", label: "Platform", sortable: true, render: (s) => s.platform, value: (s) => s.platform },
    { key: "businessOwner", label: "Business Owner", sortable: true, render: (s) => s.businessOwner, value: (s) => s.businessOwner },
    { key: "technicalOwner", label: "Technical Owner", sortable: true, render: (s) => s.technicalOwner, value: (s) => s.technicalOwner },
    { key: "teams", label: "Teams", sortable: true, numeric: true, render: (s) => s.teamsRepresented, value: (s) => s.teamsRepresented },
    { key: "domains", label: "Knowledge Domains", render: (s) => s.knowledgeDomains.join(", "), value: (s) => s.knowledgeDomains.join(", ") },
    { key: "authority", label: "Authority", sortable: true, render: (s) => <Pill label={s.authorityLevel} tone={registryTone(s.authorityLevel)} />, value: (s) => s.authorityLevel },
    { key: "approval", label: "Approval State", sortable: true, render: (s) => <Pill label={s.approvalState} tone={registryTone(s.approvalState)} />, value: (s) => s.approvalState },
    { key: "access", label: "Access", sortable: true, render: (s) => s.accessClassification, value: (s) => s.accessClassification },
    { key: "freshness", label: "Freshness", sortable: true, render: (s) => <Pill label={s.freshnessStatus} tone={registryTone(s.freshnessStatus)} />, value: (s) => s.freshnessStatus },
    { key: "quality", label: "Quality", sortable: true, numeric: true, render: (s) => s.qualityScore, value: (s) => s.qualityScore },
    { key: "status", label: "Registry Status", sortable: true, render: (s) => <StatusText status={s.registryStatus} />, value: (s) => s.registryStatus },
  ],
  operations: [
    { key: "id", label: "Source ID", sortable: true, render: (s) => <span className="font-medium text-blue-700">{s.id}</span>, value: (s) => s.id },
    { key: "name", label: "Source Name", sortable: true, render: (s) => s.sourceName, value: (s) => s.sourceName },
    { key: "platform", label: "Platform", sortable: true, render: (s) => s.platform, value: (s) => s.platform },
    { key: "connector", label: "Connector Status", sortable: true, render: (s) => <StatusText status={s.connectorStatus} />, value: (s) => s.connectorStatus },
    { key: "mode", label: "Discovery Mode", sortable: true, render: (s) => s.discoveryMode, value: (s) => s.discoveryMode },
    { key: "lastSync", label: "Last Sync", render: (s) => s.lastSync, value: (s) => s.lastSync },
    { key: "nextRun", label: "Next Run", render: (s) => s.nextRun, value: (s) => s.nextRun },
    { key: "artifacts", label: "Artifacts", sortable: true, numeric: true, render: (s) => nf(s.artifactCount), value: (s) => s.artifactCount },
    { key: "queue", label: "Queue Depth", sortable: true, numeric: true, render: (s) => nf(s.queueDepth), value: (s) => s.queueDepth },
    { key: "success", label: "Success Rate", sortable: true, numeric: true, render: (s) => `${s.successRate}%`, value: (s) => s.successRate },
    { key: "warnings", label: "Warnings", sortable: true, numeric: true, render: (s) => s.warningCount, value: (s) => s.warningCount },
    { key: "readiness", label: "Processing Readiness", render: (s) => s.processingReadiness, value: (s) => s.processingReadiness },
  ],
  governance: [
    { key: "id", label: "Source ID", sortable: true, render: (s) => <span className="font-medium text-blue-700">{s.id}</span>, value: (s) => s.id },
    { key: "name", label: "Source Name", sortable: true, render: (s) => s.sourceName, value: (s) => s.sourceName },
    { key: "businessOwner", label: "Business Owner", sortable: true, render: (s) => s.businessOwner, value: (s) => s.businessOwner },
    { key: "approval", label: "Approval State", sortable: true, render: (s) => <Pill label={s.approvalState} tone={registryTone(s.approvalState)} />, value: (s) => s.approvalState },
    { key: "authority", label: "Authority Level", sortable: true, render: (s) => s.authorityLevel, value: (s) => s.authorityLevel },
    { key: "access", label: "Access Classification", sortable: true, render: (s) => s.accessClassification, value: (s) => s.accessClassification },
    { key: "regulatory", label: "Regulatory Scope", render: (s) => (s.regulatoryScope.length ? s.regulatoryScope.join(", ") : "None"), value: (s) => s.regulatoryScope.join(", ") },
    { key: "retention", label: "Retention Policy", render: (s) => s.retentionPolicy, value: (s) => s.retentionPolicy },
    { key: "residency", label: "Data Residency", sortable: true, render: (s) => s.dataResidency, value: (s) => s.dataResidency },
    { key: "exceptions", label: "Exceptions", sortable: true, numeric: true, render: (s) => s.warningCount, value: (s) => s.warningCount },
    { key: "review", label: "Next Review", render: (s) => s.nextReviewDate, value: (s) => s.nextReviewDate },
  ],
  relationship: [
    { key: "id", label: "Source ID", sortable: true, render: (s) => <span className="font-medium text-blue-700">{s.id}</span>, value: (s) => s.id },
    { key: "name", label: "Source Name", sortable: true, render: (s) => s.sourceName, value: (s) => s.sourceName },
    { key: "teams", label: "Teams", sortable: true, numeric: true, render: (s) => s.teamsRepresented, value: (s) => s.teamsRepresented },
    { key: "domains", label: "Domains", render: (s) => s.knowledgeDomains.join(", "), value: (s) => s.knowledgeDomains.join(", ") },
    { key: "artifacts", label: "Artifacts", sortable: true, numeric: true, render: (s) => nf(s.relationshipCounts.artifacts), value: (s) => s.relationshipCounts.artifacts },
    { key: "conditions", label: "Business Conditions", sortable: true, numeric: true, render: (s) => nf(s.relationshipCounts.conditions), value: (s) => s.relationshipCounts.conditions },
    { key: "personas", label: "Personas", sortable: true, numeric: true, render: (s) => s.relationshipCounts.personas, value: (s) => s.relationshipCounts.personas },
    { key: "dependencies", label: "Dependencies", sortable: true, numeric: true, render: (s) => nf(s.relationshipCounts.dependencies), value: (s) => s.relationshipCounts.dependencies },
    { key: "decisions", label: "Decisions", sortable: true, numeric: true, render: (s) => nf(s.relationshipCounts.decisions), value: (s) => s.relationshipCounts.decisions },
    { key: "consumers", label: "Consumers", sortable: true, numeric: true, render: (s) => s.relationshipCounts.consumers, value: (s) => s.relationshipCounts.consumers },
    { key: "coverage", label: "Relationship Coverage", sortable: true, numeric: true, render: (s) => `${s.relationshipCoverage}%`, value: (s) => s.relationshipCoverage },
  ],
};

export const ROW_ACTIONS = [
  "Open Record", "Approve", "Request Review", "Restrict", "Pause Discovery", "Resume Discovery",
  "Run Discovery", "Reconcile", "Compare Duplicate", "Mark Duplicate", "Deprecate", "Reactivate",
  "View Connector", "Export Record",
];

export const BULK_ACTIONS = [
  "Approve", "Assign Owner", "Assign Technical Owner", "Apply Classification", "Apply Retention Policy",
  "Change Review Date", "Pause Discovery", "Resume Discovery", "Run Discovery", "Reconcile",
  "Export", "Mark for Review", "Deprecate",
];

export function RegistryTable({
  view, rows, loading, error, spotlight, highlightIds, selected, onSelected,
  onOpen, onRowAction, onBulkAction, onExport, density, onDensity, savedViews, onSaveView, onLoadView,
  filterControls, emptyAction,
}: {
  view: ViewMode;
  rows: SourceRegistryRecord[];
  loading?: boolean;
  error?: string | null;
  spotlight?: boolean;
  highlightIds: string[];
  selected: string[];
  onSelected: (ids: string[]) => void;
  onOpen: (s: SourceRegistryRecord) => void;
  onRowAction: (action: string, s: SourceRegistryRecord) => void;
  onBulkAction: (action: string, ids: string[]) => void;
  onExport: () => void;
  density: "compact" | "comfortable";
  onDensity: (d: "compact" | "comfortable") => void;
  savedViews: string[];
  onSaveView: () => void;
  onLoadView: (name: string) => void;
  filterControls: React.ReactNode;
  emptyAction: () => void;
}) {
  const all = columnsByView[view];
  const [hidden, setHidden] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "id", dir: "asc" });
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const perPage = density === "compact" ? 12 : 8;

  const cols = all.filter((c) => !hidden.includes(c.key));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? rows.filter((s) =>
          [s.id, s.sourceName, s.platform, s.businessOwner, s.technicalOwner, s.category, ...s.knowledgeDomains]
            .join(" ").toLowerCase().includes(q),
        )
      : rows;
    const col = all.find((c) => c.key === sort.key) ?? all[0];
    return [...list].sort((a, b) => {
      const av = col.value(a);
      const bv = col.value(b);
      const r = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? r : -r;
    });
  }, [rows, query, sort, all]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * perPage, current * perPage + perPage);
  const allSelected = visible.length > 0 && visible.every((s) => selected.includes(s.id));

  const pad = density === "compact" ? "py-1" : "py-2";

  return (
    <Panel
      id="panel-registry" title="Enterprise Source Registry"
      subtitle={`${filtered.length} of ${rows.length} sources · ${view} view`}
      loading={loading} error={error} spotlight={spotlight}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Input
          value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          placeholder="Search registry…" aria-label="Search registry" className="h-8 w-56 text-[12px]"
        />
        {filterControls}
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-[11.5px]">Saved views</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-[12px]">
              <DropdownMenuItem onSelect={onSaveView}>Save current view</DropdownMenuItem>
              <DropdownMenuSeparator />
              {savedViews.length === 0 && <DropdownMenuItem disabled>No saved views</DropdownMenuItem>}
              {savedViews.map((v) => <DropdownMenuItem key={v} onSelect={() => onLoadView(v)}>{v}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-[11.5px]">Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto text-[12px]">
              {all.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.key} checked={!hidden.includes(c.key)}
                  onCheckedChange={(v) => setHidden((cur) => (v ? cur.filter((k) => k !== c.key) : [...cur, c.key]))}
                >
                  {c.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => onDensity(density === "compact" ? "comfortable" : "compact")}>
            {density === "compact" ? "Comfortable" : "Compact"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-[11.5px]" disabled={selected.length === 0}>
                Bulk actions ({selected.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto text-[12px]">
              <DropdownMenuLabel>{selected.length} sources selected</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {BULK_ACTIONS.map((a) => (
                <DropdownMenuItem key={a} onSelect={() => onBulkAction(a, selected)}>{a}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={onExport}>Export view</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-slate-300 p-6 text-center">
          <p className="text-[12.5px] font-medium text-slate-800">No sources match the current filters</p>
          <p className="mt-1 text-[11.5px] text-slate-500">
            Clear filters or widen the date range. You can also register a source manually.
          </p>
          <Button size="sm" className="mt-2 h-8 text-[12px]" onClick={emptyAction}>Register Source</Button>
        </div>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[11.5px]">
            <caption className="sr-only">Enterprise source registry, {filtered.length} rows</caption>
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="w-8 py-1">
                  <Checkbox
                    checked={allSelected} aria-label="Select all visible sources"
                    onCheckedChange={(v) =>
                      onSelected(v ? Array.from(new Set([...selected, ...visible.map((s) => s.id)])) : selected.filter((id) => !visible.some((s) => s.id === id)))
                    }
                    className="h-3.5 w-3.5"
                  />
                </th>
                {cols.map((c) => (
                  <th key={c.key} scope="col" className={cn("py-1 pr-3", c.numeric && "text-right", c.key === "id" && "sticky left-0 bg-white")}>
                    {c.sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-0.5 hover:text-slate-800"
                        aria-label={`Sort by ${c.label}`}
                        onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key && s.dir === "asc" ? "desc" : "asc" }))}
                      >
                        {c.label}
                        {sort.key === c.key && <span aria-hidden>{sort.dir === "asc" ? "▲" : "▼"}</span>}
                      </button>
                    ) : c.label}
                  </th>
                ))}
                <th scope="col" className="py-1 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={cols.length + 2} className="py-1.5"><Skeleton className="h-5 w-full" /></td></tr>
                  ))
                : visible.map((s) => (
                    <>
                      <tr
                        key={s.id}
                        className={cn(
                          "border-b border-slate-100 hover:bg-slate-50",
                          highlightIds.includes(s.id) && "bg-blue-50/60",
                        )}
                      >
                        <td className={pad}>
                          <Checkbox
                            checked={selected.includes(s.id)} aria-label={`Select ${s.sourceName}`}
                            onCheckedChange={(v) => onSelected(v ? [...selected, s.id] : selected.filter((id) => id !== s.id))}
                            className="h-3.5 w-3.5"
                          />
                        </td>
                        {cols.map((c) => (
                          <td key={c.key} className={cn(pad, "pr-3 align-top", c.numeric && "text-right", c.key === "id" && "sticky left-0 bg-inherit")}>
                            {c.key === "id" ? (
                              <button type="button" className="font-medium text-blue-700 hover:underline" onClick={() => onOpen(s)}>{s.id}</button>
                            ) : c.key === "name" ? (
                              <button type="button" className="text-left text-slate-800 hover:underline" onClick={() => onOpen(s)}>{s.sourceName}</button>
                            ) : (
                              c.render(s)
                            )}
                          </td>
                        ))}
                        <td className={cn(pad, "text-right")}>
                          <div className="inline-flex items-center gap-1">
                            <Button
                              variant="ghost" size="sm" className="h-6 px-1 text-[11px]"
                              aria-label={`Expand relationships for ${s.sourceName}`}
                              onClick={() => setExpanded((e) => (e === s.id ? null : s.id))}
                            >
                              <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", expanded === s.id && "rotate-90")} aria-hidden />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label={`Actions for ${s.sourceName}`}>
                                  <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto text-[12px]">
                                {ROW_ACTIONS.map((a) => (
                                  <DropdownMenuItem key={a} onSelect={() => (a === "Open Record" ? onOpen(s) : onRowAction(a, s))}>{a}</DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                      {expanded === s.id && (
                        <tr key={`${s.id}-exp`} className="border-b border-slate-100 bg-slate-50/70">
                          <td colSpan={cols.length + 2} className="px-3 py-2">
                            <dl className="grid gap-x-6 sm:grid-cols-3">
                              <Row label="Teams represented" value={s.teamNames.join(", ") || "—"} />
                              <Row label="Knowledge domains" value={s.knowledgeDomains.join(", ")} />
                              <Row label="Business conditions" value={nf(s.relationshipCounts.conditions)} />
                              <Row label="Team personas" value={String(s.relationshipCounts.personas)} />
                              <Row label="Decisions referencing" value={nf(s.relationshipCounts.decisions)} />
                              <Row label="External consumers" value={String(s.relationshipCounts.consumers)} />
                            </dl>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>Showing {visible.length} of {filtered.length} sources</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-[11px]" disabled={current === 0} onClick={() => setPage(current - 1)}>Previous</Button>
            <span>Page {current + 1} of {pages}</span>
            <Button variant="outline" size="sm" className="h-7 text-[11px]" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Next</Button>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* --------------------------- source record drawer -------------------------- */

const DRAWER_ACTIONS = [
  "Edit Record", "Approve", "Request Review", "Restrict", "Pause Discovery", "Run Discovery",
  "Reconcile", "Merge Source", "Mark Duplicate", "Deprecate", "Reactivate",
  "View Connector", "View Artifacts", "View Related Personas", "View Lineage", "Export Record",
];

export function SourceRecordDrawer({ source, onOpenChange, onAction }: {
  source: SourceRegistryRecord | null;
  onOpenChange: (v: boolean) => void;
  onAction: (action: string, s: SourceRegistryRecord) => void;
}) {
  if (!source) return null;
  const s = source;
  const quality = sourceQualityDetail[s.id];
  const authority = sourceAuthorityDetail[s.id];
  const relationships = relationshipsForSource(s);

  return (
    <Drawer open onOpenChange={onOpenChange} wide title={s.sourceName} description={`${s.id} · ${s.platform} · ${s.category}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusText status={s.registryStatus} />
        <Pill label={`Authority: ${s.authorityLevel}`} tone={registryTone(s.authorityLevel)} />
        <Pill label={`Quality ${s.qualityScore}`} tone={s.qualityScore >= 90 ? "green" : s.qualityScore >= 75 ? "amber" : "red"} />
        <Pill label={s.approvalState} tone={registryTone(s.approvalState)} />
      </div>

      {s.registryStatus === "Deprecated" && (
        <div className="rounded-md border border-slate-300 bg-slate-100 p-2 text-[11.5px] text-slate-700">
          This source is deprecated. Historical references are retained{s.replacementSourceId ? ` and superseded by ${s.replacementSourceId}` : ""}. Use Reactivate to restore it.
        </div>
      )}
      {s.accessClassification === "Restricted" || s.accessClassification === "Highly Restricted" ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">
          Access classification {s.accessClassification}. Only approved consumers may use evidence from this source.
        </div>
      ) : null}
      {s.registryStatus === "Possible Duplicate" && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">
          <span>Possible duplicate of an approved source.</span>
          <Button size="sm" className="h-6 text-[11px]" onClick={() => onAction("Compare Duplicate", s)}>Compare sources</Button>
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-slate-100">
          {["Overview", "Ownership", "Governance", "Discovery", "Artifacts", "Relationships", "Lineage", "Quality", "History"].map((t) => (
            <TabsTrigger key={t} value={t.toLowerCase()} className="text-[11.5px]">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-2">
          <p className="text-[12px] text-slate-700">{s.description}</p>
          <dl className="mt-2 grid gap-x-6 sm:grid-cols-2">
            <Row label="Business purpose" value={s.businessPurpose} />
            <Row label="Category" value={s.category} />
            <Row label="Platform" value={s.platform} />
            <Row label="Environment" value={s.environment} />
            <Row label="Region" value={s.region} />
            <Row label="Data residency" value={s.dataResidency} />
            <Row label="Teams represented" value={s.teamNames.join(", ") || `${s.teamsRepresented}`} />
            <Row label="Knowledge domains" value={s.knowledgeDomains.join(", ")} />
            <Row label="Estimated business relevance" value={`${Math.min(99, s.qualityScore + 3)} / 100`} />
            <Row label="Current status" value={s.registryStatus} />
            <Row label="Freshness" value={s.freshnessStatus} />
            <Row label="Last updated" value={s.updatedAt} />
          </dl>
        </TabsContent>

        <TabsContent value="ownership" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label="Business owner" value={s.businessOwner} />
            <Row label="Technical owner" value={s.technicalOwner} />
            <Row label="Data steward" value={s.dataSteward} />
            <Row label="Security owner" value={s.securityOwner} />
            <Row label="Compliance owner" value={s.complianceOwner} />
            <Row label="Persona owners" value={`${s.relationshipCounts.personas} persona owners`} />
            <Row label="Backup owners" value={s.businessOwner === "Unassigned" ? "None" : "Deputy assigned"} />
            <Row label="Ownership confidence" value={`${s.ownershipConfidence}%`} />
          </dl>
          {s.businessOwner === "Unassigned" && (
            <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-[11.5px] text-red-700">
              Missing business owner. Persona attribution and approval workflows are blocked until an owner is assigned.
            </div>
          )}
          <h3 className="mt-3 text-[12px] font-semibold text-slate-900">Ownership history</h3>
          <ul className="mt-1 space-y-1 text-[11.5px] text-slate-600">
            <li>{s.createdAt} — Registered with initial ownership</li>
            <li>{s.updatedAt} — Ownership last confirmed by {s.technicalOwner}</li>
          </ul>
        </TabsContent>

        <TabsContent value="governance" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label="Authority level" value={s.authorityLevel} />
            <Row label="Authoritative for" value={authority.authoritativeFor.join(", ")} />
            <Row label="Approval state" value={s.approvalState} />
            <Row label="Access classification" value={s.accessClassification} />
            <Row label="Regulatory scope" value={s.regulatoryScope.join(", ") || "None"} />
            <Row label="Retention policy" value={s.retentionPolicy} />
            <Row label="Legal hold" value={s.legalHold ? "Active" : "None"} />
            <Row label="Data residency" value={s.dataResidency} />
            <Row label="Allowed uses" value={s.allowedUses.join(", ") || "None defined"} />
            <Row label="Restricted uses" value={s.restrictedUses.join(", ") || "None"} />
            <Row label="Exceptions" value={`${s.warningCount} open`} />
            <Row label="Review cadence" value={s.reviewCadence} />
            <Row label="Next review date" value={s.nextReviewDate} />
          </dl>
        </TabsContent>

        <TabsContent value="discovery" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label="Connector" value={`${s.connectorId} · ${s.connectorStatus}`} />
            <Row label="Authentication status" value={s.authenticationStatus} />
            <Row label="Authorization scope" value={s.authorizationScope} />
            <Row label="Discovery mode" value={s.discoveryMode} />
            <Row label="Schedule" value={s.schedule} />
            <Row label="Last successful run" value={s.lastSync} />
            <Row label="Next run" value={s.nextRun} />
            <Row label="Artifacts discovered" value={nf(s.artifactCount)} />
            <Row label="Queue depth" value={nf(s.queueDepth)} />
            <Row label="Success rate" value={`${s.successRate}%`} />
            <Row label="Warnings" value={String(s.warningCount)} />
            <Row label="Configuration version" value={s.configurationVersion} />
          </dl>
        </TabsContent>

        <TabsContent value="artifacts" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label={`${s.category} artifacts`} value={nf(s.artifactCount)} />
            <Row label="Artifact freshness" value={s.freshnessStatus} />
            <Row label="Artifact quality" value={`${s.qualityScore} / 100`} />
            <Row label="New this period" value={nf(Math.round(s.artifactCount * 0.04))} />
            <Row label="Deleted this period" value={nf(Math.round(s.artifactCount * 0.006))} />
            <Row label="Duplicate artifacts" value={nf(Math.round(s.artifactCount * 0.011))} />
            <Row label="Restricted artifacts" value={nf(Math.round(s.artifactCount * 0.03))} />
            <Row label="Failed artifacts" value={nf(Math.round(s.artifactCount * (1 - s.successRate / 100)))} />
          </dl>
          <Button size="sm" variant="outline" className="mt-2 h-7 text-[11px]" onClick={() => onAction("View Artifacts", s)}>View Artifact Inventory</Button>
        </TabsContent>

        <TabsContent value="relationships" className="mt-2">
          <table className="w-full text-left text-[11.5px]">
            <caption className="sr-only">Relationships for {s.sourceName}</caption>
            <thead>
              <tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500">
                <th scope="col" className="py-1 pr-3">Relationship</th>
                <th scope="col" className="py-1 pr-3">Target type</th>
                <th scope="col" className="py-1 pr-3">Target</th>
                <th scope="col" className="py-1 pr-3 text-right">Confidence</th>
                <th scope="col" className="py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {relationships.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-1 pr-3 font-medium text-slate-800">{r.relationshipType}</td>
                  <td className="py-1 pr-3">{r.targetType}</td>
                  <td className="py-1 pr-3">{r.targetName}</td>
                  <td className="py-1 pr-3 text-right">{r.confidence}%</td>
                  <td className="py-1">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="lineage" className="mt-2">
          <ol className="space-y-1">
            {lineageStages.map((stage, i) => (
              <li key={stage} className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5 text-[11.5px]">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">{i + 1}</span>
                <span className="font-medium text-slate-800">{stage}</span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-400" aria-hidden />
                <span className="text-slate-500">
                  {i === 0 ? s.platform : i === 1 ? s.connectorId : i <= 3 ? `${nf(s.artifactCount)} artifacts` : i <= 5 ? `${nf(s.relationshipCounts.conditions)} conditions` : i <= 7 ? `${s.relationshipCounts.personas} personas` : `${nf(s.relationshipCounts.decisions)} decisions`}
                </span>
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="quality" className="mt-2">
          <div className="text-[24px] font-bold text-slate-900">{quality.overallScore}<span className="text-[13px] font-medium text-slate-500"> / 100</span></div>
          <div className="mt-2 space-y-1.5">
            {([
              ["Metadata completeness", quality.metadataCompleteness],
              ["Ownership completeness", quality.ownershipCompleteness],
              ["Authority confidence", quality.authorityConfidence],
              ["Freshness", quality.freshness],
              ["Artifact quality", Math.round(s.successRate)],
              ["Coverage", s.relationshipCoverage],
              ["Relationship completeness", quality.relationshipCoverage],
              ["Approval confidence", quality.approvalCoverage],
            ] as [string, number][]).map(([label, val]) => (
              <div key={label}>
                <div className="flex justify-between text-[11px] text-slate-600"><span>{label}</span><span>{val}</span></div>
                <Progress value={val} className="h-1.5" />
              </div>
            ))}
          </div>
          <h3 className="mt-3 text-[12px] font-semibold text-slate-900">Top issues</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-600">{quality.topIssues.map((i) => <li key={i}>{i}</li>)}</ul>
          <h3 className="mt-2 text-[12px] font-semibold text-slate-900">Recommended remediations</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-600">{quality.recommendedActions.map((i) => <li key={i}>{i}</li>)}</ul>
        </TabsContent>

        <TabsContent value="history" className="mt-2">
          <ul className="space-y-1 text-[11.5px] text-slate-600">
            <li>{s.createdAt} — Created</li>
            <li>{s.discoveredAt} — Discovered by Enterprise Source Discovery</li>
            <li>{authority.approvedAt} — Approved by {authority.approvedBy}</li>
            <li>{s.updatedAt} — Owner confirmed as {s.businessOwner}</li>
            <li>{s.updatedAt} — Classification set to {s.accessClassification}</li>
            <li>{s.updatedAt} — Connector configuration {s.configurationVersion}</li>
            <li>{s.nextReviewDate} — Next scheduled review ({s.reviewCadence})</li>
            <li>Audit events retained for {s.retentionPolicy}</li>
          </ul>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
        {DRAWER_ACTIONS.map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, s)}>{a}</Button>
        ))}
      </div>
    </Drawer>
  );
}

/* ---------------------------- quality overview ----------------------------- */

export function QualityOverviewPanel({ score, onDimension, loading, spotlight, onFooter }: {
  score: number;
  onDimension: (key: keyof import("./data").Filters, value: string) => void;
  loading?: boolean;
  spotlight?: boolean;
  onFooter: () => void;
}) {
  const circumference = 2 * Math.PI * 34;
  return (
    <Panel
      id="panel-quality" title="Registry Quality Overview"
      subtitle="Composite registry trust score across ownership, metadata, authority, freshness, and coverage"
      loading={loading} spotlight={spotlight} footer="View Quality Details" onFooter={onFooter}
    >
      <div className="flex items-center gap-4">
        <svg width="88" height="88" viewBox="0 0 88 88" role="img" aria-label={`Registry quality score ${score} out of 100`}>
          <circle cx="44" cy="44" r="34" fill="none" stroke="#e2e8f0" strokeWidth="9" />
          <circle
            cx="44" cy="44" r="34" fill="none" stroke="#2563eb" strokeWidth="9" strokeLinecap="round"
            strokeDasharray={`${(score / 100) * circumference} ${circumference}`} transform="rotate(-90 44 44)"
          />
          <text x="44" y="48" textAnchor="middle" className="fill-slate-900 text-[17px] font-bold">{score}</text>
        </svg>
        <div className="text-[11.5px] text-slate-600">
          <p className="text-[12.5px] font-semibold text-slate-900">{score} out of 100</p>
          <p>Registry trust is healthy. Freshness and authority confidence are the largest improvement opportunities.</p>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {registryQuality.dimensions.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              className="w-full rounded-md px-1 py-0.5 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => onDimension(d.filter.key, d.filter.value)}
            >
              <div className="flex items-center justify-between gap-2 text-[11.5px]">
                <span className="text-slate-700">{d.label}</span>
                <span className="text-slate-500">
                  {d.score} · target {d.target} · {d.trend > 0 ? `+${d.trend}` : d.trend} · {d.affected} sources
                </span>
              </div>
              <Progress value={d.score} className="mt-0.5 h-1.5" />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* -------------------------- category distribution -------------------------- */

export function CategoryDistributionPanel({ activeCategory, onSelect, loading }: {
  activeCategory: string; onSelect: (c: string) => void; loading?: boolean;
}) {
  return (
    <Panel
      id="panel-category" title="Source Category Distribution"
      subtitle="Registered sources by category with artifact volume, quality, approval, and freshness"
      loading={loading}
    >
      <div className="grid gap-3 sm:grid-cols-[190px_1fr]">
        <div className="h-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryDistribution} dataKey="sources" nameKey="category" innerRadius={48} outerRadius={78} paddingAngle={1}>
                {categoryDistribution.map((c) => (
                  <Cell
                    key={c.category} fill={c.color}
                    opacity={activeCategory === "All" || activeCategory === c.category ? 1 : 0.35}
                  />
                ))}
              </Pie>
              <RTooltip
                formatter={(v: number, _n, p) => {
                  const item = categoryDistribution.find((c) => c.category === p?.payload?.category);
                  return [`${v} sources · ${nf(item?.artifacts ?? 0)} artifacts · quality ${item?.avgQuality} · approved ${item?.approvedPct}% · fresh ${item?.freshPct}%`, p?.payload?.category];
                }}
                contentStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="grid gap-1 sm:grid-cols-2">
          {categoryDistribution.map((c) => (
            <li key={c.category}>
              <button
                type="button"
                aria-pressed={activeCategory === c.category}
                onClick={() => onSelect(activeCategory === c.category ? "All" : c.category)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md border px-2 py-1 text-left text-[11.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  activeCategory === c.category ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50",
                )}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: c.color }} aria-hidden />
                <span className="flex-1 truncate text-slate-700">{c.category}</span>
                <span className="font-medium text-slate-900">{c.sources}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="sr-only">
        Documents 42, Tickets 21, Chat 18, Meetings 16, Code 14, APIs 17, Telemetry 12, Other 7 sources.
      </p>
    </Panel>
  );
}

/* ---------------------------- authority matrix ----------------------------- */

export function AuthorityMatrixPanel({ onCell, loading, spotlight }: {
  onCell: (authority: AuthorityLevel, approval: ApprovalState) => void;
  loading?: boolean;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-authority" title="Authority & Approval Matrix"
      subtitle="Distinguishes authoritative sources from supporting, historical, reference, and unconfirmed evidence"
      loading={loading} spotlight={spotlight}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[11.5px]">
          <caption className="sr-only">Source counts by authority level and approval state</caption>
          <thead>
            <tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500">
              <th scope="col" className="py-1 pr-3">Authority</th>
              {approvalColumns.map((c) => <th key={c} scope="col" className="py-1 pr-3 text-right">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {authorityDefinitions.map(({ level }) => (
              <tr key={level} className="border-b border-slate-100">
                <th scope="row" className="py-1 pr-3 font-medium text-slate-800">{level}</th>
                {approvalColumns.map((c) => {
                  const count = authorityMatrix[level][c];
                  return (
                    <td key={c} className="py-1 pr-3 text-right">
                      <button
                        type="button"
                        onClick={() => onCell(level, c)}
                        aria-label={`Filter to ${level} sources with approval state ${c}, ${count} sources`}
                        className={cn(
                          "w-full rounded px-1.5 py-0.5 text-right hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                          count === 0 ? "text-slate-300" : "font-medium text-slate-800",
                        )}
                      >
                        {count}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="mt-2 space-y-0.5 text-[11px] text-slate-500">
        {authorityDefinitions.map((d) => (
          <div key={d.level} className="flex gap-1.5">
            <dt className="font-medium text-slate-700">{d.level}:</dt>
            <dd>{d.definition}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

/* ------------------------------- exceptions -------------------------------- */

const EXCEPTION_ACTIONS = ["Assign", "Acknowledge", "Open Source", "Resolve", "Snooze", "Create Review Task"];

export function ExceptionsPanel({ exceptions, summary, onAction, loading, spotlight, degraded }: {
  exceptions: RegistryException[];
  summary: { type: string; count: number }[];
  onAction: (action: string, e: RegistryException) => void;
  loading?: boolean;
  spotlight?: boolean;
  degraded?: string | null;
}) {
  const [type, setType] = useState("All");
  const list = type === "All" ? exceptions : exceptions.filter((e) => e.exceptionType === type);
  return (
    <Panel
      id="panel-exceptions" title="Registry Exceptions"
      subtitle="Sources that require action before they influence downstream decisions"
      loading={loading} spotlight={spotlight} degraded={degraded}
    >
      <ul className="flex flex-wrap gap-1">
        <li>
          <button
            type="button" aria-pressed={type === "All"} onClick={() => setType("All")}
            className={cn("rounded border px-1.5 py-0.5 text-[11px]", type === "All" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
          >
            All ({exceptions.length})
          </button>
        </li>
        {summary.map((s) => (
          <li key={s.type}>
            <button
              type="button" aria-pressed={type === s.type} onClick={() => setType(s.type)}
              className={cn("rounded border px-1.5 py-0.5 text-[11px]", type === s.type ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
            >
              {s.type} ({s.count})
            </button>
          </li>
        ))}
      </ul>

      <ul className="mt-2 divide-y divide-slate-100">
        {list.map((e) => (
          <li key={e.id} className="py-1.5">
            <div className="flex flex-wrap items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-slate-900">{e.exceptionType} — {e.sourceName}</p>
                <p className="text-[11.5px] text-slate-600">{e.description}</p>
                <p className="text-[11px] text-slate-500">
                  Severity {e.severity} · Age {e.ageLabel} · Owner {e.owner} · Due {e.dueAt} · Recommended: {e.recommendedAction}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Pill label={e.severity} tone={registryTone(e.severity)} />
                <Pill label={e.status} tone={registryTone(e.status)} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label={`Actions for exception ${e.id}`}>
                      <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-[12px]">
                    {EXCEPTION_ACTIONS.map((a) => <DropdownMenuItem key={a} onSelect={() => onAction(a, e)}>{a}</DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="py-3 text-center text-[11.5px] text-slate-500">No exceptions of this type. The registry is clean for this category.</li>}
      </ul>
    </Panel>
  );
}

/* --------------------------- relationship summary -------------------------- */

export function RelationshipSummaryPanel({ onNode, loading, spotlight }: {
  onNode: (id: string, route: string | null) => void; loading?: boolean; spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-relationships" title="Source Relationship Summary"
      subtitle="How registered sources contribute to the enterprise operating model"
      loading={loading} spotlight={spotlight}
    >
      <dl className="grid gap-x-6 sm:grid-cols-2">
        <Row label="Teams represented" value={nf(relationshipSummary.teams)} />
        <Row label="Knowledge domains" value={nf(relationshipSummary.domains)} />
        <Row label="Business conditions" value={nf(relationshipSummary.conditions)} />
        <Row label="Team personas" value={nf(relationshipSummary.personas)} />
        <Row label="Dependencies" value={nf(relationshipSummary.dependencies)} />
        <Row label="Decisions referencing sources" value={nf(relationshipSummary.decisions)} />
        <Row label="External consumers" value={nf(relationshipSummary.consumers)} />
      </dl>
      <ol className="mt-3 flex items-stretch gap-1 overflow-x-auto">
        {relationshipNodes.map((n, i) => (
          <li key={n.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onNode(n.id, n.route)}
              className="min-w-[92px] rounded-md border border-slate-200 px-2 py-1.5 text-left hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="block text-[10.5px] uppercase tracking-wide text-slate-500">{n.label}</span>
              <span className="block text-[13px] font-semibold text-slate-900">{nf(n.value)}</span>
            </button>
            {i < relationshipNodes.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />}
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ----------------------------- lifecycle status ---------------------------- */

export function LifecyclePanel({ onStage, loading }: { onStage: (stage: string) => void; loading?: boolean }) {
  return (
    <Panel id="panel-lifecycle" title="Source Lifecycle Status" subtitle="Registered sources by lifecycle stage with recent transitions" loading={loading}>
      <ol className="grid gap-1 sm:grid-cols-4">
        {lifecycleCounts.map((l) => (
          <li key={l.stage}>
            <button
              type="button" onClick={() => onStage(l.stage)}
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-left hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="block text-[11px] text-slate-600">{l.stage}</span>
              <span className="block text-[15px] font-semibold text-slate-900">{l.count}</span>
              <span className="block text-[10.5px] text-slate-500">{l.delta}</span>
            </button>
          </li>
        ))}
      </ol>
      <h3 className="mt-2 text-[12px] font-semibold text-slate-900">Recent transitions</h3>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-600">
        {lifecycleTransitions.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </Panel>
  );
}

/* ------------------------------- review queue ------------------------------ */

const REVIEW_ACTIONS = ["Open Review", "Approve", "Request Information", "Reassign", "Extend Due Date", "Reject"];

export function ReviewQueuePanel({ reviews, onAction, loading, spotlight }: {
  reviews: SourceReview[]; onAction: (action: string, r: SourceReview) => void; loading?: boolean; spotlight?: boolean;
}) {
  return (
    <Panel id="panel-reviews" title="Source Review Queue" subtitle={`${reviews.filter((r) => r.status === "Open" || r.status === "In Review").length} reviews awaiting decision`} loading={loading} spotlight={spotlight}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[11.5px]">
          <caption className="sr-only">Source review queue</caption>
          <thead>
            <tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500">
              {["Source", "Review Type", "Reason", "Priority", "Assigned Reviewer", "Due Date", "Age", "Status", "Actions"].map((h) => (
                <th key={h} scope="col" className={cn("py-1 pr-3", h === "Actions" && "text-right")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="py-1 pr-3 font-medium text-slate-900">{r.sourceName}</td>
                <td className="py-1 pr-3">{r.reviewType}</td>
                <td className="py-1 pr-3 text-slate-600">{r.reason}</td>
                <td className="py-1 pr-3"><Pill label={r.priority} tone={registryTone(r.priority)} /></td>
                <td className="py-1 pr-3">{r.assignedReviewer}</td>
                <td className="py-1 pr-3">{r.dueDate}</td>
                <td className="py-1 pr-3">{r.ageLabel}</td>
                <td className="py-1 pr-3"><Pill label={r.status} tone={registryTone(r.status)} /></td>
                <td className="py-1 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label={`Actions for review ${r.id}`}>
                        <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-[12px]">
                      {REVIEW_ACTIONS.map((a) => <DropdownMenuItem key={a} onSelect={() => onAction(a, r)}>{a}</DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* --------------------------------- activity -------------------------------- */

export function ActivityPanel({ activities, onOpen, loading }: {
  activities: RegistryActivity[]; onOpen: (a: RegistryActivity) => void; loading?: boolean;
}) {
  return (
    <Panel id="panel-activity" title="Recent Registry Activity" subtitle="Audited registry changes across ownership, approval, classification, and reconciliation" loading={loading}>
      <ul className="divide-y divide-slate-100">
        {activities.slice(0, 12).map((a) => (
          <li key={a.id}>
            <button
              type="button" onClick={() => onOpen(a)}
              className="flex w-full items-start gap-2 py-1.5 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="w-16 shrink-0 text-[11px] text-slate-500">{a.timestamp}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] text-slate-800">{a.action} — {a.sourceName}</span>
                <span className="block text-[11px] text-slate-500">{a.changedBy} · {a.auditId}</span>
              </span>
              <Pill label={a.status} tone={registryTone(a.status)} />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* --------------------------- activity detail drawer ------------------------ */

export function ActivityDetailDrawer({ activity, onOpenChange }: {
  activity: RegistryActivity | null; onOpenChange: (v: boolean) => void;
}) {
  if (!activity) return null;
  return (
    <Drawer open onOpenChange={onOpenChange} title={activity.action} description={`${activity.sourceName} · ${activity.timestamp}`}>
      <dl>
        <Row label="Source" value={`${activity.sourceName} (${activity.sourceId})`} />
        <Row label="Description" value={activity.description} />
        <Row label="Changed by" value={activity.changedBy} />
        <Row label="Previous value" value={activity.previousValue ?? "—"} />
        <Row label="New value" value={activity.newValue ?? "—"} />
        <Row label="Status" value={activity.status} />
        <Row label="Audit ID" value={activity.auditId} />
      </dl>
    </Drawer>
  );
}
