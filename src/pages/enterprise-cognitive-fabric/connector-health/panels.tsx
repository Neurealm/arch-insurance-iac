import { Fragment, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import {
  ChevronRight, CircleCheck, CirclePause, CircleSlash, MoreHorizontal, TriangleAlert,
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
  affectedCounts, categories, connectorErrors, credentialSummary, dependencyImpacts,
  downstreamSummary, errorCategorySummary, healthDistribution, trendSeries,
  type ConnectorActivity, type ConnectorAlert, type ConnectorDiagnostic, type ConnectorError,
  type ConnectorHealthRecord, type ConnectorIncident, type PermissionDrift, type TrendMetric,
  type ViewMode,
} from "./data";

/* --------------------------------- atoms ---------------------------------- */

type Tone = "green" | "amber" | "red" | "blue" | "slate";

export const healthTone = (status: string): Tone => {
  if (["Healthy", "Valid", "Passed", "Normal", "Real Time", "Current", "On Target", "Resolved", "Restored", "Completed", "Low"].includes(status)) return "green";
  if (["Warning", "Expiring Soon", "Elevated", "Aging", "Investigating", "Acknowledged", "Monitoring", "Pending Review", "Medium", "Moderate", "Snoozed"].includes(status)) return "amber";
  if (["Degraded", "Failed", "Expired", "Throttled", "Stale", "Unauthorized", "Unavailable", "Critical", "High", "Open", "Permission Drift Detected", "Restricted"].includes(status)) return "red";
  if (["Paused", "Maintenance", "Not Applicable", "Not Configured", "Checking", "Draining"].includes(status)) return "slate";
  return "blue";
};

export function StatusText({ status, className }: { status: string; className?: string }) {
  const tone = healthTone(status);
  const Icon = tone === "green" ? CircleCheck : tone === "amber" ? TriangleAlert : tone === "red" ? CircleSlash : CirclePause;
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          tone === "green" ? "text-emerald-600" : tone === "amber" ? "text-amber-600" : tone === "red" ? "text-red-600" : "text-slate-500",
        )}
        aria-hidden
      />
      <Pill label={status} tone={tone} />
    </span>
  );
}

export const nf = (n: number) => n.toLocaleString("en-US");
export const pct = (n: number) => `${n}%`;
export const ms = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)} s` : `${n} ms`);

export function download(name: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function connectorsToCsv(rows: ConnectorHealthRecord[]) {
  const head = [
    "Connector ID", "Connector Name", "Category", "Platform", "Health", "Availability", "Avg Latency ms",
    "P95 Latency ms", "Throughput", "Queue", "Rate Limit %", "Authentication", "Authorization",
    "Credential Expiration", "Certificate", "Access Classification", "Owner", "Downstream Risk",
  ];
  const body = rows.map((c) => [
    c.id, c.name, c.category, c.platform, c.healthStatus, c.availability, c.averageLatency,
    c.p95Latency, c.throughput, c.queueDepth, c.rateLimitUtilization, c.authenticationStatus,
    c.authorizationStatus, c.credentialExpiration, c.certificateStatus, c.accessClassification,
    c.owner, c.downstreamRisk,
  ]);
  return [head, ...body].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}

/* ---------------------------- connector matrix ----------------------------- */

export type GroupBy = "Category" | "Platform" | "Owner" | "Status" | "Business Unit" | "Environment";
export const groupOptions: GroupBy[] = ["Category", "Platform", "Owner", "Status", "Business Unit", "Environment"];
export type Density = "compact" | "comfortable" | "expanded";

const groupKey = (c: ConnectorHealthRecord, g: GroupBy) =>
  g === "Category" ? c.category
    : g === "Platform" ? c.platform
      : g === "Owner" ? c.owner
        : g === "Status" ? c.healthStatus
          : g === "Business Unit" ? c.businessUnit
            : c.environment;

export function ConnectorMatrixPanel({
  rows, loading, error, spotlight, highlightIds, groupBy, onGroupBy, layout, onLayout,
  density, onDensity, onOpen, onAction, onEmptyAction,
}: {
  rows: ConnectorHealthRecord[];
  loading?: boolean;
  error?: string | null;
  spotlight?: boolean;
  highlightIds: string[];
  groupBy: GroupBy;
  onGroupBy: (g: GroupBy) => void;
  layout: "cards" | "table";
  onLayout: (l: "cards" | "table") => void;
  density: Density;
  onDensity: (d: Density) => void;
  onOpen: (c: ConnectorHealthRecord) => void;
  onAction: (action: string, c: ConnectorHealthRecord) => void;
  onEmptyAction: () => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, ConnectorHealthRecord[]>();
    const order = groupBy === "Category" ? (categories as string[]) : [];
    order.forEach((k) => map.set(k, []));
    rows.forEach((c) => {
      const k = groupKey(c, groupBy);
      map.set(k, [...(map.get(k) ?? []), c]);
    });
    return Array.from(map.entries()).filter(([, list]) => list.length > 0);
  }, [rows, groupBy]);

  return (
    <Panel
      id="panel-matrix"
      title="Connector Health Matrix"
      subtitle="Availability, authentication, authorization, latency, throughput, freshness, and rate limits by connector"
      loading={loading}
      error={error}
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Select value={groupBy} onValueChange={(v) => onGroupBy(v as GroupBy)}>
          <SelectTrigger className="h-7 w-[168px] text-[11.5px]" aria-label="Group connectors by"><SelectValue /></SelectTrigger>
          <SelectContent>
            {groupOptions.map((g) => <SelectItem key={g} value={g} className="text-[12px]">Group by {g}</SelectItem>)}
          </SelectContent>
        </Select>
        <div role="group" aria-label="Matrix layout" className="inline-flex overflow-hidden rounded-md border border-slate-200">
          {(["cards", "table"] as const).map((l) => (
            <button
              key={l} type="button" aria-pressed={layout === l} onClick={() => onLayout(l)}
              className={cn("px-2 py-1 text-[11px] capitalize", layout === l ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}
            >
              {l} view
            </button>
          ))}
        </div>
        <div role="group" aria-label="Matrix density" className="inline-flex overflow-hidden rounded-md border border-slate-200">
          {(["compact", "comfortable", "expanded"] as Density[]).map((d) => (
            <button
              key={d} type="button" aria-pressed={density === d} onClick={() => onDensity(d)}
              className={cn("px-2 py-1 text-[11px] capitalize", density === d ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50")}
            >
              {d}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[11px] text-slate-500">{rows.length} connectors in view</span>
      </div>

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed border-slate-300 p-6 text-center">
          <p className="text-[12.5px] font-medium text-slate-800">No connectors match the current filters</p>
          <p className="mt-0.5 text-[11.5px] text-slate-500">Clear the filters or add a connector to begin monitoring a new platform.</p>
          <Button size="sm" className="mt-2 h-7 text-[11.5px]" onClick={onEmptyAction}>Clear filters</Button>
        </div>
      )}

      <div className="space-y-3">
        {groups.map(([group, list]) => (
          <section key={group} aria-label={`${group} connectors`}>
            <h3 className="mb-1 flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
              {group}
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-600">{list.length}</span>
            </h3>

            {layout === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-[11.5px]">
                  <caption className="sr-only">{group} connector health summary</caption>
                  <thead>
                    <tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500">
                      {["Connector", "Health", "Auth", "Authz", "Availability", "Avg / P95", "Throughput", "Queue", "Rate Limit", "Last Sync", "Credential"].map((h) => (
                        <th key={h} scope="col" className="py-1 pr-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((c) => (
                      <tr
                        key={c.id}
                        className={cn("cursor-pointer border-b border-slate-100 hover:bg-slate-50", highlightIds.includes(c.id) && "bg-amber-50")}
                        onClick={() => onOpen(c)}
                      >
                        <td className="py-1 pr-3 font-medium text-slate-900">{c.name}</td>
                        <td className="py-1 pr-3"><StatusText status={c.healthStatus} /></td>
                        <td className="py-1 pr-3"><Pill label={c.authenticationStatus} tone={healthTone(c.authenticationStatus)} /></td>
                        <td className="py-1 pr-3"><Pill label={c.authorizationStatus} tone={healthTone(c.authorizationStatus)} /></td>
                        <td className="py-1 pr-3">{c.availability}%</td>
                        <td className="py-1 pr-3">{ms(c.averageLatency)} / {ms(c.p95Latency)}</td>
                        <td className="py-1 pr-3">{nf(c.throughput)}</td>
                        <td className="py-1 pr-3">{nf(c.queueDepth)}</td>
                        <td className="py-1 pr-3">{c.rateLimitStatus === "Not Applicable" ? "—" : `${c.rateLimitUtilization}%`}</td>
                        <td className="py-1 pr-3">{c.lastSuccessfulSync}</td>
                        <td className="py-1 pr-3">{c.credentialExpiration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className={cn("grid gap-2", density === "compact" ? "sm:grid-cols-2 xl:grid-cols-4" : density === "comfortable" ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2")}>
                {list.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onOpen(c)}
                      title={`${c.name} · ${c.healthStatus} · availability ${c.availability}% · P95 ${ms(c.p95Latency)} · queue ${nf(c.queueDepth)}`}
                      className={cn(
                        "w-full rounded-lg border p-2.5 text-left transition hover:border-blue-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                        highlightIds.includes(c.id) ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-semibold text-slate-900">{c.name}</p>
                          <p className="truncate text-[11px] text-slate-500">{c.platform} · {c.id}</p>
                        </div>
                        <StatusText status={c.healthStatus} />
                      </div>

                      <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                        <div className="flex justify-between"><dt className="text-slate-500">Availability</dt><dd className="font-medium text-slate-800">{c.availability}%</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-500">Avg latency</dt><dd className="font-medium text-slate-800">{ms(c.averageLatency)}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-500">P95</dt><dd className="font-medium text-slate-800">{ms(c.p95Latency)}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-500">Queue</dt><dd className="font-medium text-slate-800">{nf(c.queueDepth)}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-500">Throughput</dt><dd className="font-medium text-slate-800">{nf(c.throughput)}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-500">Rate limit</dt><dd className="font-medium text-slate-800">{c.rateLimitStatus === "Not Applicable" ? "n/a" : `${c.rateLimitUtilization}%`}</dd></div>
                      </dl>

                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <Pill label={`Auth: ${c.authenticationStatus}`} tone={healthTone(c.authenticationStatus)} />
                        <Pill label={`Authz: ${c.authorizationStatus}`} tone={healthTone(c.authorizationStatus)} />
                        {c.certificateStatus !== "Not Applicable" && (
                          <Pill label={`Cert: ${c.certificateStatus}`} tone={healthTone(c.certificateStatus)} />
                        )}
                      </div>

                      {density !== "compact" && (
                        <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 border-t border-slate-100 pt-1.5 text-[11px]">
                          <div className="flex justify-between"><dt className="text-slate-500">Last test</dt><dd className="text-slate-700">{c.lastSuccessfulTest}</dd></div>
                          <div className="flex justify-between"><dt className="text-slate-500">Last sync</dt><dd className="text-slate-700">{c.lastSuccessfulSync}</dd></div>
                          <div className="flex justify-between"><dt className="text-slate-500">Credential</dt><dd className="text-slate-700">{c.credentialExpiration}</dd></div>
                          <div className="flex justify-between"><dt className="text-slate-500">Certificate</dt><dd className="text-slate-700">{c.certificateExpiration}</dd></div>
                          <div className="flex justify-between"><dt className="text-slate-500">Warnings</dt><dd className="text-slate-700">{c.warningCount}</dd></div>
                          <div className="flex justify-between"><dt className="text-slate-500">Owner</dt><dd className="truncate text-slate-700">{c.owner}</dd></div>
                          <div className="flex justify-between"><dt className="text-slate-500">Sources</dt><dd className="text-slate-700">{affectedCounts[c.id]?.sources ?? c.sourceIds.length}</dd></div>
                          <div className="flex justify-between"><dt className="text-slate-500">Personas</dt><dd className="text-slate-700">{affectedCounts[c.id]?.personas ?? c.personaIds.length}</dd></div>
                        </dl>
                      )}

                      {density === "expanded" && (
                        <p className="mt-1.5 text-[11px] text-slate-600">{c.healthSummary}</p>
                      )}
                    </button>
                    {density === "expanded" && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {["Test Connection", "Run Diagnostics", "Reauthorize", "Pause"].map((a) => (
                          <Button key={a} size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => onAction(a, c)}>{a}</Button>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------------ inventory table ---------------------------- */

interface Column {
  key: string;
  label: string;
  numeric?: boolean;
  render: (c: ConnectorHealthRecord) => React.ReactNode;
  value: (c: ConnectorHealthRecord) => string | number;
}

const columnsByView: Record<ViewMode, Column[]> = {
  operations: [
    { key: "id", label: "Connector ID", render: (c) => c.id, value: (c) => c.id },
    { key: "name", label: "Connector Name", render: (c) => c.name, value: (c) => c.name },
    { key: "category", label: "Category", render: (c) => c.category, value: (c) => c.category },
    { key: "platform", label: "Platform", render: (c) => c.platform, value: (c) => c.platform },
    { key: "health", label: "Health", render: (c) => <StatusText status={c.healthStatus} />, value: (c) => c.healthStatus },
    { key: "availability", label: "Availability", numeric: true, render: (c) => `${c.availability}%`, value: (c) => c.availability },
    { key: "avg", label: "Average Latency", numeric: true, render: (c) => ms(c.averageLatency), value: (c) => c.averageLatency },
    { key: "p95", label: "P95 Latency", numeric: true, render: (c) => ms(c.p95Latency), value: (c) => c.p95Latency },
    { key: "throughput", label: "Throughput", numeric: true, render: (c) => nf(c.throughput), value: (c) => c.throughput },
    { key: "queue", label: "Queue", numeric: true, render: (c) => nf(c.queueDepth), value: (c) => c.queueDepth },
    { key: "rate", label: "Rate Limit", render: (c) => <Pill label={c.rateLimitStatus} tone={healthTone(c.rateLimitStatus)} />, value: (c) => c.rateLimitUtilization },
    { key: "lastTest", label: "Last Test", render: (c) => c.lastSuccessfulTest, value: (c) => c.lastSuccessfulTest },
    { key: "lastSync", label: "Last Sync", render: (c) => c.lastSuccessfulSync, value: (c) => c.lastSuccessfulSync },
    { key: "owner", label: "Owner", render: (c) => c.owner, value: (c) => c.owner },
  ],
  security: [
    { key: "id", label: "Connector ID", render: (c) => c.id, value: (c) => c.id },
    { key: "name", label: "Connector Name", render: (c) => c.name, value: (c) => c.name },
    { key: "method", label: "Authentication Method", render: (c) => c.authenticationMethod, value: (c) => c.authenticationMethod },
    { key: "authStatus", label: "Authentication Status", render: (c) => <StatusText status={c.authenticationStatus} />, value: (c) => c.authenticationStatus },
    { key: "credAge", label: "Credential Age", render: (c) => c.credentialAge, value: (c) => c.credentialAge },
    { key: "credExp", label: "Credential Expiration", render: (c) => c.credentialExpiration, value: (c) => c.credentialExpiresInDays ?? 9999 },
    { key: "certExp", label: "Certificate Expiration", render: (c) => c.certificateExpiration, value: (c) => c.certificateExpiresInDays ?? 9999 },
    { key: "authz", label: "Authorization Status", render: (c) => <Pill label={c.authorizationStatus} tone={healthTone(c.authorizationStatus)} />, value: (c) => c.authorizationStatus },
    { key: "scope", label: "Permission Scope", render: (c) => c.permissionScope, value: (c) => c.permissionScope },
    { key: "class", label: "Access Classification", render: (c) => c.accessClassification, value: (c) => c.accessClassification },
    { key: "residency", label: "Data Residency", render: (c) => c.dataResidency, value: (c) => c.dataResidency },
    { key: "secOwner", label: "Security Owner", render: (c) => c.securityOwner, value: (c) => c.securityOwner },
  ],
  dependency: [
    { key: "id", label: "Connector ID", render: (c) => c.id, value: (c) => c.id },
    { key: "name", label: "Connector Name", render: (c) => c.name, value: (c) => c.name },
    { key: "sources", label: "Sources", numeric: true, render: (c) => affectedCounts[c.id]?.sources ?? c.sourceIds.length, value: (c) => affectedCounts[c.id]?.sources ?? c.sourceIds.length },
    { key: "jobs", label: "Discovery Jobs", numeric: true, render: (c) => c.discoveryJobIds.length, value: (c) => c.discoveryJobIds.length },
    { key: "inflight", label: "Artifacts in Flight", numeric: true, render: (c) => nf(c.artifactsInFlight), value: (c) => c.artifactsInFlight },
    { key: "personas", label: "Personas", numeric: true, render: (c) => affectedCounts[c.id]?.personas ?? c.personaIds.length, value: (c) => affectedCounts[c.id]?.personas ?? c.personaIds.length },
    { key: "conditions", label: "Business Conditions", numeric: true, render: (c) => c.conditionIds.length, value: (c) => c.conditionIds.length },
    { key: "evidence", label: "Evidence Records", numeric: true, render: (c) => nf(c.evidenceRecordCount), value: (c) => c.evidenceRecordCount },
    { key: "evals", label: "Active Evaluations", numeric: true, render: (c) => c.activeEvaluationIds.length, value: (c) => c.activeEvaluationIds.length },
    { key: "decisions", label: "Decisions", numeric: true, render: (c) => c.decisionIds.length, value: (c) => c.decisionIds.length },
    { key: "risk", label: "Downstream Risk", render: (c) => <Pill label={c.downstreamRisk} tone={healthTone(c.downstreamRisk)} />, value: (c) => c.downstreamRisk },
  ],
  executive: [
    { key: "name", label: "Connector Name", render: (c) => c.name, value: (c) => c.name },
    { key: "platform", label: "Platform", render: (c) => c.platform, value: (c) => c.platform },
    { key: "health", label: "Health", render: (c) => <StatusText status={c.healthStatus} />, value: (c) => c.healthStatus },
    { key: "availability", label: "Availability", numeric: true, render: (c) => `${c.availability}%`, value: (c) => c.availability },
    { key: "freshness", label: "Freshness", render: (c) => <Pill label={c.freshnessStatus} tone={healthTone(c.freshnessStatus)} />, value: (c) => c.freshnessStatus },
    { key: "teams", label: "Affected Teams", numeric: true, render: (c) => c.teamNames.length, value: (c) => c.teamNames.length },
    { key: "personas", label: "Affected Personas", numeric: true, render: (c) => affectedCounts[c.id]?.personas ?? c.personaIds.length, value: (c) => affectedCounts[c.id]?.personas ?? c.personaIds.length },
    { key: "impact", label: "Business Impact", render: (c) => <span className="line-clamp-2 max-w-[280px]">{c.businessImpact}</span>, value: (c) => c.businessImpact },
    { key: "owner", label: "Owner", render: (c) => c.owner, value: (c) => c.owner },
    { key: "status", label: "Status", render: (c) => <Pill label={c.downstreamRisk} tone={healthTone(c.downstreamRisk)} />, value: (c) => c.downstreamRisk },
  ],
};

export const ROW_ACTIONS = [
  "Open Connector", "Test Connection", "Run Diagnostics", "Validate Authentication", "Validate Permissions",
  "Reauthorize", "Rotate Simulated Credential", "Run Sync", "Retry Failures", "Pause", "Resume",
  "Create Incident", "Export Connector Report",
];

export const BULK_ACTIONS = [
  "Run Diagnostics", "Test Connection", "Validate Authentication", "Validate Permissions",
  "Pause", "Resume", "Assign Owner", "Apply Alert Profile", "Apply Health Targets", "Export", "Create Incidents",
];

export function ConnectorInventoryTable({
  view, rows, loading, error, spotlight, highlightIds, selected, onSelected, onOpen,
  onRowAction, onBulkAction, onExport, density, onDensity, savedViews, onSaveView, onLoadView,
  filterControls, emptyAction,
}: {
  view: ViewMode;
  rows: ConnectorHealthRecord[];
  loading?: boolean;
  error?: string | null;
  spotlight?: boolean;
  highlightIds: string[];
  selected: string[];
  onSelected: (ids: string[]) => void;
  onOpen: (c: ConnectorHealthRecord) => void;
  onRowAction: (action: string, c: ConnectorHealthRecord) => void;
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
  const pageSize = 8;

  const columns = all.filter((c) => !hidden.includes(c.key));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? rows.filter((c) =>
        [c.id, c.name, c.platform, c.category, c.owner, c.technicalOwner, c.healthStatus, c.authenticationStatus]
          .join(" ").toLowerCase().includes(q))
      : rows;
    const col = all.find((c) => c.key === sort.key);
    if (!col) return base;
    return [...base].sort((a, b) => {
      const av = col.value(a);
      const bv = col.value(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, query, sort, all]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * pageSize, current * pageSize + pageSize);
  const allSelected = visible.length > 0 && visible.every((c) => selected.includes(c.id));

  if (loading) {
    return (
      <Panel id="panel-inventory" title="Connector Inventory" subtitle="Loading connector records">
        <div className="space-y-1.5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}</div>
      </Panel>
    );
  }

  return (
    <Panel
      id="panel-inventory"
      title="Connector Inventory"
      subtitle={`${filtered.length} of ${rows.length} connectors · ${view} view`}
      error={error}
      spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          placeholder="Search connectors…"
          aria-label="Search connectors"
          className="h-7 w-56 text-[11.5px]"
        />
        {filterControls}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-[11.5px]">Saved views</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="text-[12px]">
            <DropdownMenuItem onSelect={onSaveView}>Save current view</DropdownMenuItem>
            <DropdownMenuSeparator />
            {savedViews.length === 0 && <DropdownMenuLabel className="text-[11.5px] font-normal text-slate-500">No saved views yet</DropdownMenuLabel>}
            {savedViews.map((v) => <DropdownMenuItem key={v} onSelect={() => onLoadView(v)}>{v}</DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-[11.5px]">Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto text-[12px]">
            {all.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.key}
                checked={!hidden.includes(c.key)}
                onCheckedChange={(v) => setHidden((cur) => (v ? cur.filter((k) => k !== c.key) : [...cur, c.key]))}
              >
                {c.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline" size="sm" className="h-7 text-[11.5px]"
          onClick={() => onDensity(density === "compact" ? "comfortable" : "compact")}
        >
          {density === "compact" ? "Comfortable" : "Compact"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-[11.5px]" disabled={selected.length === 0}>
              Bulk actions ({selected.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="text-[12px]">
            {BULK_ACTIONS.map((a) => <DropdownMenuItem key={a} onSelect={() => onBulkAction(a, selected)}>{a}</DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" className="ml-auto h-7 text-[11.5px]" onClick={onExport}>Export view</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-6 text-center">
          <p className="text-[12.5px] font-medium text-slate-800">No connectors match this search</p>
          <p className="mt-0.5 text-[11.5px] text-slate-500">Adjust the search text or clear the active filters.</p>
          <Button size="sm" className="mt-2 h-7 text-[11.5px]" onClick={emptyAction}>Clear filters</Button>
        </div>
      ) : (
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[1000px] text-left text-[11.5px]">
            <caption className="sr-only">Connector inventory, {view} view</caption>
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500">
                <th scope="col" className="w-8 py-1 pr-2">
                  <Checkbox
                    checked={allSelected}
                    aria-label="Select all connectors on this page"
                    onCheckedChange={(v) => onSelected(v ? Array.from(new Set([...selected, ...visible.map((c) => c.id)])) : selected.filter((id) => !visible.some((c) => c.id === id)))}
                    className="h-3.5 w-3.5"
                  />
                </th>
                {columns.map((c) => (
                  <th key={c.key} scope="col" className={cn("py-1 pr-3", c.numeric && "text-right")}>
                    <button
                      type="button"
                      className="inline-flex items-center gap-0.5 hover:text-slate-800"
                      aria-label={`Sort by ${c.label}`}
                      onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key && s.dir === "asc" ? "desc" : "asc" }))}
                    >
                      {c.label}
                      {sort.key === c.key && <span aria-hidden>{sort.dir === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </th>
                ))}
                <th scope="col" className="py-1 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <Fragment key={c.id}>
                  <tr
                    className={cn(
                      "border-b border-slate-100 hover:bg-slate-50",
                      density === "comfortable" && "h-10",
                      highlightIds.includes(c.id) && "bg-amber-50",
                    )}
                  >
                    <td className="py-1 pr-2">
                      <Checkbox
                        checked={selected.includes(c.id)}
                        aria-label={`Select ${c.name}`}
                        onCheckedChange={(v) => onSelected(v ? [...selected, c.id] : selected.filter((x) => x !== c.id))}
                        className="h-3.5 w-3.5"
                      />
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn("cursor-pointer py-1 pr-3", col.numeric && "text-right tabular-nums")}
                        onClick={() => onOpen(c)}
                      >
                        {col.render(c)}
                      </td>
                    ))}
                    <td className="py-1 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost" size="sm" className="h-6 w-6 p-0"
                          aria-label={`Expand dependency summary for ${c.name}`}
                          onClick={() => setExpanded((e) => (e === c.id ? null : c.id))}
                        >
                          <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", expanded === c.id && "rotate-90")} aria-hidden />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label={`Actions for ${c.name}`}>
                              <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-[12px]">
                            {ROW_ACTIONS.map((a) => <DropdownMenuItem key={a} onSelect={() => onRowAction(a, c)}>{a}</DropdownMenuItem>)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                  {expanded === c.id && (
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <td colSpan={columns.length + 2} className="px-2 py-2">
                        <dl className="grid gap-x-6 sm:grid-cols-3">
                          <Row label="Sources" value={`${affectedCounts[c.id]?.sources ?? c.sourceIds.length} registered sources`} />
                          <Row label="Discovery jobs" value={c.discoveryJobIds.join(", ") || "None"} />
                          <Row label="Artifacts in flight" value={nf(c.artifactsInFlight)} />
                          <Row label="Personas" value={`${affectedCounts[c.id]?.personas ?? c.personaIds.length} team personas`} />
                          <Row label="Business conditions" value={String(c.conditionIds.length)} />
                          <Row label="Evidence records" value={nf(c.evidenceRecordCount)} />
                          <Row label="Active evaluations" value={String(c.activeEvaluationIds.length)} />
                          <Row label="Decisions" value={String(c.decisionIds.length)} />
                          <Row label="Downstream risk" value={c.downstreamRisk} />
                        </dl>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>Showing {visible.length} of {filtered.length} connectors</span>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-6 text-[11px]" disabled={current === 0} onClick={() => setPage(current - 1)}>Previous</Button>
          <span>Page {current + 1} of {pages}</span>
          <Button variant="outline" size="sm" className="h-6 text-[11px]" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Next</Button>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------- connector detail ----------------------------- */

const DRAWER_ACTIONS = [
  "Run Diagnostics", "Test Connection", "Test Authentication", "Validate Permissions", "Run Sync",
  "Retry Failures", "Reauthorize", "Rotate Simulated Credential", "Pause", "Resume",
  "Edit Configuration", "Create Incident", "Export Connector Report", "View Related Sources", "View Downstream Impact",
];

export function ConnectorDetailDrawer({ connector, incidents, onOpenChange, onAction }: {
  connector: ConnectorHealthRecord | null;
  incidents: ConnectorIncident[];
  onOpenChange: (v: boolean) => void;
  onAction: (action: string, c: ConnectorHealthRecord) => void;
}) {
  if (!connector) return null;
  const c = connector;
  const errors = connectorErrors.filter((e) => e.connectorId === c.id);
  const impact = dependencyImpacts.find((d) => d.connectorId === c.id);
  const own = incidents.filter((i) => i.connectorId === c.id);
  const perfSeries = trendSeries("Latency", "Last 24 hours", c.healthStatus === "Degraded");
  const availSeries = trendSeries("Availability", "Last 24 hours", c.healthStatus === "Degraded");

  return (
    <Drawer
      open onOpenChange={onOpenChange} wide
      title={c.name}
      description={`${c.id} · ${c.platform} · ${c.category} · availability ${c.availability}% · owner ${c.owner}`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusText status={c.healthStatus} />
        <Pill label={`Auth: ${c.authenticationStatus}`} tone={healthTone(c.authenticationStatus)} />
        <Pill label={`Authz: ${c.authorizationStatus}`} tone={healthTone(c.authorizationStatus)} />
        <Pill label={c.accessClassification} tone={c.accessClassification.includes("Restricted") ? "amber" : "slate"} />
      </div>

      {c.healthStatus === "Degraded" && (
        <div className="rounded-md border border-red-200 bg-red-50 p-2 text-[11.5px] text-red-800">
          Active operational impairment. {c.healthSummary} Downstream evidence is going stale.
        </div>
      )}
      {c.healthStatus === "Warning" && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">
          Approaching threshold or non-blocking drift. {c.healthSummary}
        </div>
      )}
      {c.healthStatus === "Paused" && (
        <div className="rounded-md border border-slate-300 bg-slate-100 p-2 text-[11.5px] text-slate-700">
          Connector paused. The queue is draining and source freshness will degrade until it is resumed.
        </div>
      )}
      {c.authenticationStatus === "Failed" && (
        <div className="rounded-md border border-red-200 bg-red-50 p-2 text-[11.5px] text-red-800">
          Unauthorized. Authentication is failing, so no new evidence can be collected from this connector.
        </div>
      )}
      {c.healthStatus === "Maintenance" && (
        <div className="rounded-md border border-cyan-200 bg-cyan-50 p-2 text-[11.5px] text-cyan-900">
          Scheduled maintenance window. Expected restoration within the configured window.
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-slate-100 p-1">
          {["overview", "authentication", "authorization", "performance", "synchronization", "errors", "dependencies", "incidents", "configuration", "history"].map((t) => (
            <TabsTrigger key={t} value={t} className="text-[11.5px] capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label="Business purpose" value={c.businessPurpose} />
            <Row label="Connector type" value={c.connectorType} />
            <Row label="Platform" value={c.platform} />
            <Row label="Environment" value={c.environment} />
            <Row label="Region" value={c.region} />
            <Row label="Business unit" value={c.businessUnit} />
            <Row label="Primary owner" value={c.owner} />
            <Row label="Technical owner" value={c.technicalOwner} />
            <Row label="Security owner" value={c.securityOwner} />
            <Row label="Related sources" value={`${affectedCounts[c.id]?.sources ?? c.sourceIds.length} sources`} />
            <Row label="Discovery mode" value={c.discoveryMode} />
            <Row label="Schedule" value={c.schedule} />
          </dl>
          <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-700">{c.healthSummary}</p>
          <p className="mt-1 text-[11.5px] text-slate-600">{c.warningCount} current alert{c.warningCount === 1 ? "" : "s"} on this connector.</p>
        </TabsContent>

        <TabsContent value="authentication" className="mt-2">
          <p className="mb-1.5 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
            Credentials are represented by safe metadata only. Secrets and tokens are never displayed or stored.
          </p>
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label="Authentication method" value={c.authenticationMethod} />
            <Row label="Authentication state" value={c.authenticationStatus} />
            <Row label="Credential type" value={c.credentialType} />
            <Row label="Credential age" value={c.credentialAge} />
            <Row label="Credential expiration" value={c.credentialExpiration} />
            <Row label="Last rotation" value={c.lastCredentialRotation} />
            <Row label="Next rotation" value={c.nextCredentialRotation} />
            <Row label="Token state" value={c.authenticationStatus === "Failed" ? "Rejected by provider" : "Active"} />
            <Row label="Certificate state" value={c.certificateStatus} />
            <Row label="Certificate expiration" value={c.certificateExpiration} />
            <Row label="Last validation" value={c.lastAuthValidation} />
            <Row label="Failed authentication attempts" value={String(c.failedAuthAttempts)} />
          </dl>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Test Authentication", "Reauthorize", "Rotate Simulated Credential", "Validate Certificate"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, c)}>{a}</Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="authorization" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label="Authorization state" value={c.authorizationStatus} />
            <Row label="Permission scope" value={c.permissionScope} />
            <Row label="Approved paths" value={c.approvedPaths.join(", ") || "None"} />
            <Row label="Restricted paths" value={c.restrictedPaths.join(", ") || "None"} />
            <Row label="Read permissions" value="Granted" />
            <Row label="Metadata permissions" value="Granted" />
            <Row label="Attachment permissions" value={c.category === "Documents" ? "Granted" : "Not requested"} />
            <Row label="Historical content permissions" value={c.discoveryMode === "Streaming" ? "Not requested" : "Granted"} />
            <Row label="Deleted content permissions" value="Denied" />
            <Row label="Permission drift" value={c.authorizationStatus === "Permission Drift Detected" ? "Detected" : "None"} />
            <Row label="Policy conflicts" value={c.accessClassification === "Highly Restricted" ? "1 restricted scope conflict" : "None"} />
            <Row label="Last permission validation" value={c.lastPermissionValidation} />
          </dl>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Validate Permissions", "Review Scope", "Apply Permission Template", "Request Access Review"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, c)}>{a}</Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label="Availability" value={`${c.availability}% (target ${c.availabilityTarget}%)`} />
            <Row label="Average latency" value={ms(c.averageLatency)} />
            <Row label="P95 latency" value={ms(c.p95Latency)} />
            <Row label="P99 latency" value={ms(c.p99Latency)} />
            <Row label="Throughput" value={`${nf(c.throughput)} ${c.throughputUnit}`} />
            <Row label="Error rate" value={`${c.errorRate}%`} />
            <Row label="Timeout rate" value={`${c.timeoutRate}%`} />
            <Row label="Retry rate" value={`${c.retryRate}%`} />
            <Row label="Rate-limit utilization" value={c.rateLimitStatus === "Not Applicable" ? "Not applicable" : `${c.rateLimitUtilization}%`} />
            <Row label="Queue depth" value={`${nf(c.queueDepth)} of ${nf(c.maximumQueue)}`} />
            <Row label="Connection pool utilization" value={`${Math.min(99, c.concurrency * 6)}%`} />
          </dl>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <figure>
              <figcaption className="text-[11px] font-medium text-slate-600">Availability trend, last 24 hours</figcaption>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={availSeries.data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="t" tick={{ fontSize: 9 }} />
                    <YAxis domain={["auto", 100]} tick={{ fontSize: 9 }} />
                    <RTooltip contentStyle={{ fontSize: 11 }} />
                    <Area dataKey="value" stroke="#2563eb" fill="#bfdbfe" name="Availability %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </figure>
            <figure>
              <figcaption className="text-[11px] font-medium text-slate-600">Latency trend, last 24 hours</figcaption>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={perfSeries.data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="t" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <RTooltip contentStyle={{ fontSize: 11 }} />
                    <Line dataKey="value" stroke="#0f172a" dot={false} name="Average ms" />
                    <Line dataKey="p95" stroke="#d97706" dot={false} name="P95 ms" />
                    <Line dataKey="p99" stroke="#dc2626" dot={false} name="P99 ms" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </figure>
          </div>
        </TabsContent>

        <TabsContent value="synchronization" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label="Last successful synchronization" value={c.lastSuccessfulSync} />
            <Row label="Next synchronization" value={c.nextSync} />
            <Row label="Freshness SLA" value={c.freshnessTarget} />
            <Row label="Current freshness" value={`${c.freshness} (${c.freshnessStatus})`} />
            <Row label="Artifacts discovered" value={nf(c.evidenceRecordCount)} />
            <Row label="Artifacts changed" value={nf(Math.round(c.evidenceRecordCount * 0.07))} />
            <Row label="Artifacts deleted" value={nf(Math.round(c.evidenceRecordCount * 0.004))} />
            <Row label="Artifacts queued" value={nf(c.queueDepth)} />
            <Row label="Artifacts failed" value={nf(Math.round(c.queueDepth * (c.errorRate / 100)))} />
            <Row label="Backfill state" value={c.healthStatus === "Degraded" ? "Blocked pending reauthorization" : "Not running"} />
            <Row label="Incremental cursor state" value={c.healthStatus === "Degraded" ? "Held at last successful checkpoint" : "Current"} />
          </dl>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Run Sync", "Run Metadata Sync", "Run Full Discovery", "Run Backfill", "Pause Synchronization"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, c)}>{a}</Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="errors" className="mt-2">
          {errors.length === 0 ? (
            <p className="py-4 text-center text-[11.5px] text-slate-500">No errors recorded for this connector in the selected time range.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[11.5px]">
                <caption className="sr-only">Connector errors</caption>
                <thead>
                  <tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500">
                    {["Code", "Category", "Description", "Count", "First Seen", "Last Seen", "Retryable", "Recommended Action"].map((h) => (
                      <th key={h} scope="col" className="py-1 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {errors.map((e) => (
                    <tr key={e.id} className="border-b border-slate-100">
                      <td className="py-1 pr-3 font-medium text-slate-900">{e.errorCode}</td>
                      <td className="py-1 pr-3">{e.errorCategory}</td>
                      <td className="py-1 pr-3 text-slate-600">{e.description}</td>
                      <td className="py-1 pr-3 tabular-nums">{e.count}</td>
                      <td className="py-1 pr-3">{e.firstSeen}</td>
                      <td className="py-1 pr-3">{e.lastSeen}</td>
                      <td className="py-1 pr-3">{e.retryable ? "Yes" : "No"}</td>
                      <td className="py-1 pr-3 text-slate-600">{e.recommendedAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Button size="sm" variant="outline" className="mt-2 h-7 text-[11px]" onClick={() => onAction("Retry Failures", c)}>Retry Failures</Button>
        </TabsContent>

        <TabsContent value="dependencies" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label="Registered sources" value={impact?.sourceNames.join(", ") ?? `${c.sourceIds.length} sources`} />
            <Row label="Discovery jobs" value={impact?.discoveryJobNames.join(", ") ?? c.discoveryJobIds.join(", ") ?? "None"} />
            <Row label="Pipeline runs" value={`${c.discoveryJobIds.length * 3} runs in the last 24 hours`} />
            <Row label="Team personas" value={impact?.personaNames.join(", ") ?? `${affectedCounts[c.id]?.personas ?? 0} personas`} />
            <Row label="Business conditions" value={impact?.conditionNames.join(", ") ?? `${c.conditionIds.length} conditions`} />
            <Row label="Evidence records" value={nf(impact?.evidenceRecordCount ?? c.evidenceRecordCount)} />
            <Row label="Context graph relationships" value={nf(c.evidenceRecordCount * 3)} />
            <Row label="Active impact evaluations" value={impact?.evaluationNames.join(", ") || "None"} />
            <Row label="Decisions" value={impact?.decisionNames.join(", ") || "None"} />
            <Row label="External consumers" value={String(c.externalConsumers)} />
          </dl>
          <Button size="sm" className="mt-2 h-7 text-[11px]" onClick={() => onAction("View Downstream Impact", c)}>View Downstream Impact</Button>
        </TabsContent>

        <TabsContent value="incidents" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label="Open incidents" value={String(own.filter((i) => i.status !== "Resolved").length)} />
            <Row label="Recent incidents" value={String(own.length)} />
            <Row label="Mean time to acknowledge" value={own.length ? `${own[0].mttaMinutes} min` : "—"} />
            <Row label="Mean time to resolve" value={own.length && own[0].mttrMinutes ? `${own[0].mttrMinutes} min` : "In progress"} />
            <Row label="Escalation owner" value={c.securityOwner} />
          </dl>
          <ol className="mt-2 space-y-1">
            {own.length === 0 && <li className="text-[11.5px] text-slate-500">No incidents recorded for this connector.</li>}
            {own.map((i) => (
              <li key={i.id} className="rounded-md border border-slate-200 p-2 text-[11.5px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">{i.id} — {i.summary}</span>
                  <Pill label={i.status} tone={healthTone(i.status)} />
                </div>
                <p className="mt-0.5 text-slate-600">{i.description}</p>
                <p className="mt-0.5 text-slate-500">Opened {i.createdAt} · {i.priority} · {i.resolverGroup}</p>
              </li>
            ))}
          </ol>
          <Button size="sm" variant="outline" className="mt-2 h-7 text-[11px]" onClick={() => onAction("Create Incident", c)}>Create Incident</Button>
        </TabsContent>

        <TabsContent value="configuration" className="mt-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Row label="Connector type" value={c.connectorType} />
            <Row label="Endpoint metadata" value={c.endpointMetadata} />
            <Row label="Authentication method" value={c.authenticationMethod} />
            <Row label="Timeout" value={c.timeout} />
            <Row label="Retries" value={String(c.retries)} />
            <Row label="Backoff" value={c.backoff} />
            <Row label="Concurrency" value={String(c.concurrency)} />
            <Row label="Batch size" value={String(c.batchSize)} />
            <Row label="Polling interval" value={c.pollingInterval} />
            <Row label="Streaming mode" value={c.streamingMode} />
            <Row label="Rate limit" value={c.rateLimit} />
            <Row label="Freshness threshold" value={c.freshnessTarget} />
            <Row label="Error threshold" value={c.errorThreshold} />
            <Row label="Availability target" value={`${c.availabilityTarget}%`} />
            <Row label="Latency target" value={ms(c.latencyTarget)} />
            <Row label="Configuration version" value={c.configurationVersion} />
          </dl>
          <Button size="sm" variant="outline" className="mt-2 h-7 text-[11px]" onClick={() => onAction("Edit Configuration", c)}>Edit Configuration</Button>
        </TabsContent>

        <TabsContent value="history" className="mt-2">
          <ol className="space-y-1 text-[11.5px]">
            {[
              [`Connector registered ${c.createdAt}`, "AUD-1001"],
              [`Credential rotated ${c.lastCredentialRotation}`, "AUD-1042"],
              ["Permission template applied", "AUD-1088"],
              [`Configuration updated to ${c.configurationVersion}`, "AUD-1131"],
              [c.lastFailedTest ? `Failure recorded ${c.lastFailedTest}` : "No recorded failures", "AUD-1194"],
              [own.length ? `Incident ${own[0].id} opened` : "No incidents", "AUD-1220"],
              ["Ownership confirmed with business owner", "AUD-1268"],
              [c.healthStatus === "Paused" ? "Connector paused by operator" : "No pause events", "AUD-1301"],
              ["Reactivation check completed", "AUD-1344"],
            ].map(([label, audit]) => (
              <li key={String(audit)} className="flex items-center justify-between border-b border-slate-100 py-1">
                <span className="text-slate-700">{label}</span>
                <span className="text-slate-400">{audit}</span>
              </li>
            ))}
          </ol>
        </TabsContent>
      </Tabs>

      <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-200 pt-2">
        {DRAWER_ACTIONS.map((a) => (
          <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, c)}>{a}</Button>
        ))}
      </div>
    </Drawer>
  );
}

/* --------------------------- health distribution --------------------------- */

export function HealthDistributionPanel({ onSegment, activeStatus, loading, spotlight }: {
  onSegment: (status: string) => void; activeStatus: string; loading?: boolean; spotlight?: boolean;
}) {
  const total = healthDistribution.reduce((a, d) => a + d.count, 0);
  return (
    <Panel
      id="panel-distribution" title="Connector Health Distribution"
      subtitle="Connector population by operational state with affected sources, personas, and unresolved incidents"
      loading={loading} spotlight={spotlight}
    >
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={healthDistribution.filter((d) => d.count > 0)} dataKey="count" nameKey="status" innerRadius={46} outerRadius={76} paddingAngle={1}>
                {healthDistribution.filter((d) => d.count > 0).map((d) => (
                  <Cell key={d.status} fill={d.color} opacity={activeStatus === "All" || activeStatus === d.status ? 1 : 0.35} />
                ))}
              </Pie>
              <RTooltip contentStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-0.5">
          {healthDistribution.map((d) => (
            <li key={d.status}>
              <button
                type="button"
                onClick={() => onSegment(d.status)}
                aria-pressed={activeStatus === d.status}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-[11.5px] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  activeStatus === d.status && "bg-blue-50",
                )}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: d.color }} aria-hidden />
                <span className="flex-1 text-slate-800">{d.status}</span>
                <span className="tabular-nums text-slate-900">{d.count}</span>
                <span className="w-12 text-right tabular-nums text-slate-500">{Math.round((d.count / total) * 100)}%</span>
                <span className="w-36 text-right text-slate-500">{d.sources} sources · {d.personas} personas</span>
                <span className="w-20 text-right text-slate-500">{d.incidents} incident{d.incidents === 1 ? "" : "s"}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="sr-only">
        {healthDistribution.map((d) => `${d.status}: ${d.count} connectors`).join(". ")}.
      </p>
    </Panel>
  );
}

/* ------------------------------ trends panel ------------------------------- */

export function TrendsPanel({ metric, onMetric, range, onRange, degraded, loading, spotlight, onPointFilter }: {
  metric: TrendMetric; onMetric: (m: TrendMetric) => void;
  range: string; onRange: (r: string) => void;
  degraded: boolean; loading?: boolean; spotlight?: boolean;
  onPointFilter: () => void;
}) {
  const series = trendSeries(metric, range, degraded);
  const breaches = metric === "Availability" ? series.data.filter((d) => (d.value as number) < 99.9).length : 0;

  return (
    <Panel
      id="panel-trends" title="Availability & Performance Trends"
      subtitle={`${metric} over ${range.toLowerCase()} against the configured target`}
      loading={loading} spotlight={spotlight}
      footer="Filter connectors by this metric" onFooter={onPointFilter}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <div role="group" aria-label="Trend metric" className="inline-flex flex-wrap gap-1">
          {(["Availability", "Latency", "Throughput", "Error Rate", "Rate-Limit Utilization"] as TrendMetric[]).map((m) => (
            <button
              key={m} type="button" aria-pressed={metric === m} onClick={() => onMetric(m)}
              className={cn(
                "rounded border px-2 py-0.5 text-[11px]",
                metric === m ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <Select value={range} onValueChange={onRange}>
          <SelectTrigger className="ml-auto h-7 w-[150px] text-[11.5px]" aria-label="Trend time range"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Last hour", "Last 6 hours", "Last 24 hours", "Last 7 days", "Last 30 days"].map((r) => (
              <SelectItem key={r} value={r} className="text-[12px]">{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-[236px]">
        <ResponsiveContainer width="100%" height="100%">
          {metric === "Latency" ? (
            <LineChart data={series.data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit=" ms" />
              <RTooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={series.target} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "#dc2626" }} />
              <Line dataKey="value" name="Average" stroke="#0f172a" dot={false} />
              <Line dataKey="p95" name="P95" stroke="#d97706" dot={false} />
              <Line dataKey="p99" name="P99" stroke="#dc2626" dot={false} />
            </LineChart>
          ) : metric === "Error Rate" ? (
            <LineChart data={series.data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit="%" />
              <RTooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={series.target} stroke="#dc2626" strokeDasharray="4 4" />
              <Line dataKey="value" name="Error rate" stroke="#dc2626" dot={false} />
              <Line dataKey="retry" name="Retry rate" stroke="#2563eb" dot={false} />
              <Line dataKey="timeout" name="Timeout rate" stroke="#d97706" dot={false} />
            </LineChart>
          ) : metric === "Throughput" ? (
            <BarChart data={series.data} margin={{ top: 8, right: 12, left: -6, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <RTooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={series.target} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "#dc2626" }} />
              <Bar dataKey="value" name="Records per minute" fill="#2563eb" radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={series.data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} />
              <YAxis domain={metric === "Availability" ? ["auto", 100] : [0, 100]} tick={{ fontSize: 10 }} unit="%" />
              <RTooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={series.target} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "#dc2626" }} />
              <Area dataKey="value" name={metric} stroke="#2563eb" fill="#bfdbfe" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <p className="mt-1 text-[11px] text-slate-600">
        {metric === "Availability" && `Target ${series.target}%. ${breaches} interval${breaches === 1 ? "" : "s"} below target in this range.`}
        {metric === "Latency" && `Average, P95, and P99 latency against an ${series.target} ms target.`}
        {metric === "Throughput" && `Records processed per minute against a target of ${nf(series.target)}.`}
        {metric === "Error Rate" && `Error, retry, and timeout rate against a ${series.target}% error threshold.`}
        {metric === "Rate-Limit Utilization" && `Utilization against an ${series.target}% throttle threshold with remaining capacity shown as headroom.`}
      </p>
    </Panel>
  );
}

/* --------------------------- authentication panel -------------------------- */

const CRED_ACTIONS = ["Test", "Reauthorize", "Rotate Simulated Credential", "Open Security Review", "Assign Owner", "Snooze"];

export function AuthenticationPanel({ rows, warnings, onAction, loading, spotlight }: {
  rows: {
    connectorId: string; connectorName: string; method: string; status: string; credentialType: string;
    age: string; expiresIn: string; certificate: string; lastValidation: string; owner: string;
  }[];
  warnings: string[];
  onAction: (action: string, connectorId: string) => void;
  loading?: boolean;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-auth" title="Authentication & Credential Health"
      subtitle="Credential and certificate posture represented by safe metadata only"
      loading={loading} spotlight={spotlight}
    >
      <dl className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
        {[
          ["Valid credentials", credentialSummary.valid, "green"],
          ["Expiring within 30 days", credentialSummary.expiringWithin30, "amber"],
          ["Expired", credentialSummary.expired, "red"],
          ["Failed authentication", credentialSummary.failedAuthentication, "red"],
          ["Certificates expiring in 30 days", credentialSummary.certificatesExpiringWithin30, "amber"],
          ["Permission drift detected", credentialSummary.permissionDrift, "amber"],
        ].map(([label, value, tone]) => (
          <div key={String(label)} className="rounded-md border border-slate-200 px-2 py-1.5">
            <dt className="text-[10.5px] text-slate-500">{label}</dt>
            <dd className={cn(
              "text-[16px] font-semibold",
              tone === "green" ? "text-emerald-700" : tone === "red" ? "text-red-700" : "text-amber-700",
            )}>
              {value as number}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="mb-2 space-y-1">
        {warnings.map((w) => (
          <li key={w} className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11.5px] text-amber-800">
            <TriangleAlert className="mr-1 inline h-3.5 w-3.5" aria-hidden />{w}
          </li>
        ))}
      </ul>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-[11.5px]">
          <caption className="sr-only">Authentication and credential health by connector</caption>
          <thead>
            <tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500">
              {["Connector", "Method", "Status", "Credential Age", "Expires In", "Certificate", "Last Validation", "Owner", "Action"].map((h) => (
                <th key={h} scope="col" className={cn("py-1 pr-3", h === "Action" && "text-right")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.connectorId} className="border-b border-slate-100">
                <td className="py-1 pr-3 font-medium text-slate-900">{r.connectorName}</td>
                <td className="py-1 pr-3">{r.method}</td>
                <td className="py-1 pr-3"><StatusText status={r.status} /></td>
                <td className="py-1 pr-3">{r.age}</td>
                <td className="py-1 pr-3">{r.expiresIn}</td>
                <td className="py-1 pr-3"><Pill label={r.certificate} tone={healthTone(r.certificate)} /></td>
                <td className="py-1 pr-3">{r.lastValidation}</td>
                <td className="py-1 pr-3">{r.owner}</td>
                <td className="py-1 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label={`Credential actions for ${r.connectorName}`}>
                        <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-[12px]">
                      {CRED_ACTIONS.map((a) => <DropdownMenuItem key={a} onSelect={() => onAction(a, r.connectorId)}>{a}</DropdownMenuItem>)}
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

/* ------------------------------ permission drift --------------------------- */

const DRIFT_ACTIONS = ["Restore Approved Scope", "Request Exception", "Open Review", "Acknowledge"];

export function PermissionDriftPanel({ drifts, summary, onAction, loading, spotlight }: {
  drifts: PermissionDrift[];
  summary: { validated: number; templatesApplied: number; drift: number; restrictedConflicts: number; pendingReviews: number };
  onAction: (action: string, d: PermissionDrift) => void;
  loading?: boolean;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-drift" title="Authorization & Permission Drift"
      subtitle="Compares granted connector scope against the approved permission template"
      loading={loading} spotlight={spotlight}
    >
      <dl className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        {[
          ["Connectors validated", summary.validated],
          ["Permission templates applied", summary.templatesApplied],
          ["Permission drift", summary.drift],
          ["Restricted scope conflicts", summary.restrictedConflicts],
          ["Pending reviews", summary.pendingReviews],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-md border border-slate-200 px-2 py-1.5">
            <dt className="text-[10.5px] text-slate-500">{label}</dt>
            <dd className="text-[16px] font-semibold text-slate-900">{value as number}</dd>
          </div>
        ))}
      </dl>

      <ul className="space-y-2">
        {drifts.length === 0 && <li className="py-3 text-center text-[11.5px] text-slate-500">No permission drift detected. Every connector matches its approved template.</li>}
        {drifts.map((d) => (
          <li key={d.connectorId} className="rounded-lg border border-slate-200 p-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12.5px] font-semibold text-slate-900">{d.connectorName}</span>
              <span className="flex items-center gap-1.5">
                <Pill label={`Risk ${d.risk}`} tone={healthTone(d.risk)} />
                <Pill label={d.status} tone={healthTone(d.status)} />
              </span>
            </div>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2">
                <p className="text-[10.5px] font-semibold uppercase text-emerald-800">Expected scope</p>
                <ul className="mt-0.5 list-disc pl-4 text-[11.5px] text-emerald-900">
                  {d.expectedScope.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-2">
                <p className="text-[10.5px] font-semibold uppercase text-amber-800">Actual scope</p>
                <ul className="mt-0.5 list-disc pl-4 text-[11.5px] text-amber-900">
                  {d.actualScope.map((s) => (
                    <li key={s} className={cn(d.addedPermissions.includes(s) && "font-semibold")}>
                      {s}{d.addedPermissions.includes(s) ? " (added)" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <dl className="mt-1.5 grid gap-x-6 sm:grid-cols-2">
              <Row label="Added permissions" value={d.addedPermissions.join(", ") || "None"} />
              <Row label="Removed permissions" value={d.removedPermissions.join(", ") || "None"} />
              <Row label="Affected sources" value={String(d.affectedSources)} />
              <Row label="Affected classifications" value={d.affectedClassifications.join(", ")} />
              <Row label="Recommended action" value={d.recommendedAction} />
            </dl>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {DRIFT_ACTIONS.map((a) => (
                <Button key={a} size="sm" variant={a === "Restore Approved Scope" ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => onAction(a, d)}>
                  {a}
                </Button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------------- throughput -------------------------------- */

export function ThroughputPanel({ rows, onOpen, loading, spotlight }: {
  rows: {
    connectorId: string; connectorName: string; current: number; unit: string; target: number;
    rateLimitUtilization: number; throttleEvents: number; queueGrowth: string; status: string;
  }[];
  onOpen: (connectorId: string) => void;
  loading?: boolean;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-throughput" title="Throughput & Rate-Limit Analysis"
      subtitle="Connectors ranked by rate-limit utilization with throughput against target"
      loading={loading} spotlight={spotlight}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-[11.5px]">
          <caption className="sr-only">Throughput and rate-limit analysis by connector</caption>
          <thead>
            <tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500">
              {["Connector", "Current Throughput", "Target", "Throughput vs Target", "Rate-Limit Utilization", "Throttle Events", "Queue Growth", "Status"].map((h) => (
                <th key={h} scope="col" className="py-1 pr-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const ratio = Math.min(150, Math.round((r.current / Math.max(1, r.target)) * 100));
              return (
                <tr key={r.connectorId} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50" onClick={() => onOpen(r.connectorId)}>
                  <td className="py-1 pr-3 font-medium text-slate-900">{r.connectorName}</td>
                  <td className="py-1 pr-3 tabular-nums">{nf(r.current)} <span className="text-slate-500">{r.unit}</span></td>
                  <td className="py-1 pr-3 tabular-nums">{nf(r.target)}</td>
                  <td className="py-1 pr-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200" role="img" aria-label={`${ratio} percent of target`}>
                        <div
                          className={cn("h-full rounded-full", ratio >= 100 ? "bg-emerald-500" : ratio >= 70 ? "bg-amber-500" : "bg-red-500")}
                          style={{ width: `${Math.min(100, ratio)}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-slate-600">{ratio}%</span>
                    </div>
                  </td>
                  <td className="py-1 pr-3">
                    <div className="flex items-center gap-1.5">
                      <Progress value={r.rateLimitUtilization} className="h-1.5 w-20" />
                      <span className="tabular-nums text-slate-700">{r.rateLimitUtilization}%</span>
                    </div>
                  </td>
                  <td className="py-1 pr-3 tabular-nums">{r.throttleEvents}</td>
                  <td className="py-1 pr-3">{r.queueGrowth}</td>
                  <td className="py-1 pr-3"><Pill label={r.status} tone={healthTone(r.status.split(" ")[0])} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ------------------------------ error analysis ----------------------------- */

export function ErrorAnalysisPanel({ activeCategory, onCategory, errors, onErrorAction, loading, spotlight }: {
  activeCategory: string;
  onCategory: (c: string) => void;
  errors: ConnectorError[];
  onErrorAction: (action: string, e: ConnectorError) => void;
  loading?: boolean;
  spotlight?: boolean;
}) {
  const list = activeCategory === "All" ? errors : errors.filter((e) => e.errorCategory === activeCategory);
  return (
    <Panel
      id="panel-errors" title="Connector Error Analysis"
      subtitle="Error categories with recovery behaviour and recommended operator action"
      loading={loading} spotlight={spotlight}
    >
      <ul className="mb-2 flex flex-wrap gap-1">
        <li>
          <button
            type="button" aria-pressed={activeCategory === "All"} onClick={() => onCategory("All")}
            className={cn("rounded border px-1.5 py-0.5 text-[11px]", activeCategory === "All" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
          >
            All ({errors.reduce((a, e) => a + e.count, 0)})
          </button>
        </li>
        {errorCategorySummary.map((s) => (
          <li key={s.category}>
            <button
              type="button" aria-pressed={activeCategory === s.category} onClick={() => onCategory(s.category)}
              className={cn("rounded border px-1.5 py-0.5 text-[11px]", activeCategory === s.category ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
            >
              {s.category} ({s.count})
            </button>
          </li>
        ))}
      </ul>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-[11.5px]">
          <caption className="sr-only">Recent connector errors</caption>
          <thead>
            <tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500">
              {["Error Code", "Category", "Connector", "Description", "Count", "First Seen", "Last Seen", "Retry Success", "MTTR", "Actions"].map((h) => (
                <th key={h} scope="col" className={cn("py-1 pr-3", h === "Actions" && "text-right")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id} className="border-b border-slate-100">
                <td className="py-1 pr-3 font-medium text-slate-900">{e.errorCode}</td>
                <td className="py-1 pr-3">{e.errorCategory}</td>
                <td className="py-1 pr-3">{e.connectorName}</td>
                <td className="py-1 pr-3 text-slate-600">{e.description}</td>
                <td className="py-1 pr-3 tabular-nums">{e.count}</td>
                <td className="py-1 pr-3">{e.firstSeen}</td>
                <td className="py-1 pr-3">{e.lastSeen}</td>
                <td className="py-1 pr-3">{e.retryable ? `${e.retrySuccessRate}%` : "Not retryable"}</td>
                <td className="py-1 pr-3">{e.meanTimeToRecovery}</td>
                <td className="py-1 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label={`Actions for error ${e.errorCode}`}>
                        <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-[12px]">
                      {["Open Error Details", "Retry Eligible Failures", "Open Connector", "Create Incident"].map((a) => (
                        <DropdownMenuItem key={a} onSelect={() => onErrorAction(a, e)}>{a}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={10} className="py-3 text-center text-[11.5px] text-slate-500">No errors recorded in this category.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ----------------------------- downstream impact --------------------------- */

export function DownstreamImpactPanel({ impacts, onEntity, loading, spotlight }: {
  impacts: typeof dependencyImpacts;
  onEntity: (type: string, name: string) => void;
  loading?: boolean;
  spotlight?: boolean;
}) {
  const primary = impacts[0];
  return (
    <Panel
      id="panel-impact" title="Downstream Impact"
      subtitle="How connector degradation propagates to sources, personas, conditions, evidence, evaluations, and decisions"
      loading={loading} spotlight={spotlight}
    >
      <dl className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4 xl:grid-cols-8">
        {[
          ["Sources at risk", downstreamSummary.sourcesAtRisk],
          ["Artifacts delayed", nf(downstreamSummary.artifactsDelayed)],
          ["Discovery jobs affected", downstreamSummary.discoveryJobsAffected],
          ["Personas at risk", downstreamSummary.personasAtRisk],
          ["Conditions at risk", downstreamSummary.conditionsAtRisk],
          ["Evidence delayed", nf(downstreamSummary.evidenceDelayed)],
          ["Stale evaluations", downstreamSummary.staleEvaluations],
          ["Decisions awaiting", downstreamSummary.decisionsAwaiting],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-md border border-slate-200 px-2 py-1.5">
            <dt className="text-[10.5px] text-slate-500">{label}</dt>
            <dd className="text-[15px] font-semibold text-slate-900">{value as string}</dd>
          </div>
        ))}
      </dl>

      {primary && (
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-2.5">
          <p className="text-[12px] font-semibold text-slate-900">Dependency chain — {primary.connectorName}</p>
          <ol className="mt-1.5 space-y-1.5">
            {[
              { label: "Connector", items: [primary.connectorName], type: "Connector" },
              { label: "Sources", items: primary.sourceNames, type: "Source" },
              { label: "Discovery jobs", items: primary.discoveryJobNames, type: "Discovery Job" },
              { label: "Team personas", items: primary.personaNames, type: "Persona" },
              { label: "Business conditions", items: primary.conditionNames, type: "Business Condition" },
              { label: "Impact evaluations", items: primary.evaluationNames, type: "Impact Evaluation" },
              { label: "Decisions", items: primary.decisionNames, type: "Decision" },
            ].filter((s) => s.items.length > 0).map((step, i) => (
              <li key={step.label} className="flex flex-wrap items-start gap-1.5">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-slate-900 text-[9px] font-semibold text-white" aria-hidden>{i + 1}</span>
                <span className="w-32 shrink-0 text-[11px] text-slate-500">{step.label}</span>
                <span className="flex flex-wrap gap-1">
                  {step.items.map((it) => (
                    <button
                      key={it} type="button" onClick={() => onEntity(step.type, it)}
                      className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] text-slate-700 hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {it}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ol>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {[
              downstreamSummary.confidenceImpact,
              downstreamSummary.freshnessImpact,
              downstreamSummary.evaluationImpact,
              downstreamSummary.workflowImpact,
            ].map((t) => (
              <li key={t} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11.5px] text-slate-700">{t}</li>
            ))}
          </ul>
          <p className="mt-1.5 text-[11.5px] text-slate-700">Recommended action: {primary.recommendedAction}.</p>
        </div>
      )}

      {impacts.slice(1).map((im) => (
        <div key={im.connectorId} className="mt-2 rounded-lg border border-slate-200 p-2.5">
          <p className="text-[12px] font-semibold text-slate-900">{im.connectorName}</p>
          <dl className="mt-1 grid gap-x-6 sm:grid-cols-2">
            <Row label="Sources" value={im.sourceNames.join(", ")} />
            <Row label="Personas" value={im.personaNames.join(", ")} />
            <Row label="Artifacts delayed" value={nf(im.artifactCount)} />
            <Row label="Confidence impact" value={im.confidenceImpact} />
            <Row label="Freshness impact" value={im.freshnessImpact} />
            <Row label="Recommended action" value={im.recommendedAction} />
          </dl>
        </div>
      ))}
    </Panel>
  );
}

/* --------------------------------- alerts ---------------------------------- */

const ALERT_ACTIONS = ["Acknowledge", "Assign", "Open Detail", "Snooze", "Resolve", "Run Diagnostics", "Create Incident"];

export function AlertsPanel({ alerts, onAction, loading, spotlight, degraded }: {
  alerts: ConnectorAlert[];
  onAction: (action: string, a: ConnectorAlert) => void;
  loading?: boolean;
  spotlight?: boolean;
  degraded?: string | null;
}) {
  const [severity, setSeverity] = useState("All");
  const list = severity === "All" ? alerts : alerts.filter((a) => a.severity === severity);
  return (
    <Panel
      id="panel-alerts" title="Connector Alerts"
      subtitle={`${alerts.filter((a) => a.status === "Open" || a.status === "Investigating").length} alerts require attention`}
      loading={loading} spotlight={spotlight} degraded={degraded}
    >
      <ul className="mb-1.5 flex flex-wrap gap-1">
        {["All", "Critical", "High", "Medium", "Low"].map((s) => (
          <li key={s}>
            <button
              type="button" aria-pressed={severity === s} onClick={() => setSeverity(s)}
              className={cn("rounded border px-1.5 py-0.5 text-[11px]", severity === s ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
      <ul className="divide-y divide-slate-100">
        {list.map((a) => (
          <li key={a.id} className="py-1.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill label={a.severity} tone={healthTone(a.severity)} />
                  <span className="text-[12.5px] font-medium text-slate-900">{a.title}</span>
                  <Pill label={a.status} tone={healthTone(a.status)} />
                </div>
                <p className="mt-0.5 text-[11.5px] text-slate-600">
                  {a.connectorName} · observed {a.observedValue} · threshold {a.threshold} · {a.createdAt} · {a.owner}
                </p>
                <p className="text-[11.5px] text-slate-600">Business impact: {a.businessImpact}</p>
                <p className="text-[11.5px] text-slate-600">Technical impact: {a.technicalImpact}</p>
                <p className="text-[11.5px] text-slate-700">Recommended action: {a.recommendedAction}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 shrink-0 p-0" aria-label={`Actions for alert ${a.title}`}>
                    <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-[12px]">
                  {ALERT_ACTIONS.map((act) => <DropdownMenuItem key={act} onSelect={() => onAction(act, a)}>{act}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="py-3 text-center text-[11.5px] text-slate-500">No alerts at this severity. The connector network is operating within thresholds.</li>}
      </ul>
    </Panel>
  );
}

/* -------------------------------- incidents -------------------------------- */

export function IncidentsPanel({ incidents, onOpen, loading }: {
  incidents: ConnectorIncident[]; onOpen: (i: ConnectorIncident) => void; loading?: boolean;
}) {
  return (
    <Panel id="panel-incidents" title="Connector Incidents" subtitle="Simulated incident records raised from connector degradation" loading={loading}>
      <ul className="space-y-1">
        {incidents.length === 0 && <li className="py-3 text-center text-[11.5px] text-slate-500">No incidents recorded.</li>}
        {incidents.map((i) => (
          <li key={i.id}>
            <button
              type="button" onClick={() => onOpen(i)}
              className="w-full rounded-md border border-slate-200 p-2 text-left hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] font-medium text-slate-900">{i.id} — {i.summary}</span>
                <span className="flex gap-1.5">
                  <Pill label={i.severity} tone={healthTone(i.severity)} />
                  <Pill label={i.status} tone={healthTone(i.status)} />
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-slate-600">
                {i.connectorName} · {i.priority} · {i.resolverGroup} · opened {i.createdAt} · {i.affectedSources} sources, {i.affectedPersonas} personas
              </p>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* -------------------------------- activity --------------------------------- */

export function ActivityPanel({ activities, onOpen, loading, spotlight }: {
  activities: ConnectorActivity[]; onOpen: (a: ConnectorActivity) => void; loading?: boolean; spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-activity" title="Recent Connector Activity"
      subtitle="Audited connector tests, failures, warnings, and synchronization outcomes"
      loading={loading} spotlight={spotlight}
    >
      <ul className="divide-y divide-slate-100">
        {activities.slice(0, 12).map((a) => (
          <li key={a.id}>
            <button
              type="button" onClick={() => onOpen(a)}
              className="flex w-full items-start gap-2 py-1.5 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="w-20 shrink-0 text-[11px] text-slate-500">{a.timestamp}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] text-slate-800">{a.action} — {a.connectorName}</span>
                <span className="block text-[11px] text-slate-500">{a.category} · {a.owner} · {a.auditId}</span>
              </span>
              <Pill label={a.result} tone={healthTone(a.result)} />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ActivityDetailDrawer({ activity, onOpenChange }: {
  activity: ConnectorActivity | null; onOpenChange: (v: boolean) => void;
}) {
  if (!activity) return null;
  return (
    <Drawer open onOpenChange={onOpenChange} title={activity.action} description={`${activity.connectorName} · ${activity.timestamp}`}>
      <dl>
        <Row label="Connector" value={`${activity.connectorName} (${activity.connectorId})`} />
        <Row label="Category" value={activity.category} />
        <Row label="Description" value={activity.description} />
        <Row label="Result" value={activity.result} />
        <Row label="Owner" value={activity.owner} />
        <Row label="Audit ID" value={activity.auditId} />
      </dl>
    </Drawer>
  );
}

/* ---------------------------- diagnostics results -------------------------- */

export function DiagnosticResultsDrawer({ diagnostic, onOpenChange, onExport }: {
  diagnostic: ConnectorDiagnostic | null; onOpenChange: (v: boolean) => void; onExport: () => void;
}) {
  if (!diagnostic) return null;
  return (
    <Drawer
      open onOpenChange={onOpenChange} wide
      title="Diagnostic Results"
      description={`${diagnostic.scope} · ${diagnostic.depth} · started ${diagnostic.startedAt}`}
    >
      <dl className="grid gap-x-6 sm:grid-cols-3">
        <Row label="Tests selected" value={String(diagnostic.testsSelected)} />
        <Row label="Tests passed" value={String(diagnostic.testsPassed)} />
        <Row label="Tests warning" value={String(diagnostic.testsWarning)} />
        <Row label="Tests failed" value={String(diagnostic.testsFailed)} />
        <Row label="Connectors affected" value={String(diagnostic.connectorIds.length)} />
        <Row label="Sources affected" value={String(diagnostic.affectedSources)} />
        <Row label="Personas affected" value={String(diagnostic.affectedPersonas)} />
        <Row label="Evaluations affected" value={String(diagnostic.affectedEvaluations)} />
        <Row label="Completed" value={diagnostic.completedAt ?? "In progress"} />
      </dl>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[11.5px]">
          <caption className="sr-only">Diagnostic test results</caption>
          <thead>
            <tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500">
              {["Connector", "Test", "Status", "Duration", "Observed", "Expected", "Recommended Action"].map((h) => (
                <th key={h} scope="col" className="py-1 pr-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {diagnostic.tests.slice(0, 60).map((t) => (
              <tr key={t.id} className="border-b border-slate-100">
                <td className="py-1 pr-3">{t.connectorId}</td>
                <td className="py-1 pr-3">{t.testType}</td>
                <td className="py-1 pr-3"><Pill label={t.status} tone={healthTone(t.status)} /></td>
                <td className="py-1 pr-3">{t.duration}</td>
                <td className="py-1 pr-3 text-slate-600">{t.observedValue}</td>
                <td className="py-1 pr-3 text-slate-600">{t.expectedValue}</td>
                <td className="py-1 pr-3 text-slate-600">{t.recommendedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-700">
        {diagnostic.recommendations.map((r) => <li key={r}>{r}</li>)}
      </ul>
      <Button size="sm" variant="outline" className="h-7 w-fit text-[11px]" onClick={onExport}>Export Diagnostics</Button>
    </Drawer>
  );
}
