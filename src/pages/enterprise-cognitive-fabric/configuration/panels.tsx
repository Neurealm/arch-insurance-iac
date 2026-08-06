import { useMemo, useState } from "react";
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip,
} from "recharts";
import {
  ArrowRight, Clock, MoreHorizontal, Pause, Play, Plus, RefreshCw, Search, ShieldCheck, TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Panel } from "../command-center/panels";
import {
  accessBreakdown, accessMatrix, connectors, connectorSummaryRows,
  type AccessState, type AlertRule, type ConfigurationChange, type ConnectorConfiguration,
  type ConnectorSummaryRow, type DataClassificationRule, type DiscoveryOption, type DiscoveryPolicy,
  type ScheduleProfile, type SourceConfiguration,
} from "./data";

/* --------------------------------- atoms ---------------------------------- */

export function StatusDot({ tone }: { tone: "green" | "amber" | "red" | "blue" | "slate" }) {
  const map = { green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500", blue: "bg-blue-500", slate: "bg-slate-400" };
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", map[tone])} aria-hidden />;
}

export function Pill({ label, tone }: { label: string; tone: "green" | "amber" | "red" | "blue" | "slate" }) {
  const map = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[10.5px] font-medium", map[tone])}>{label}</span>;
}

export const statusTone = (s: string): "green" | "amber" | "red" | "slate" =>
  s === "Healthy" || s === "Approved" || s === "Active" || s === "Valid" || s === "Enabled"
    ? "green"
    : s === "Warning" || s === "Pending" || s === "Expiring" || s === "Restricted"
      ? "amber"
      : s === "Degraded" || s === "Denied" || s === "Failed"
        ? "red"
        : "slate";

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-1.5 last:border-0">
      <span className="text-[11.5px] text-slate-500">{label}</span>
      <span className="text-right text-[12px] font-medium text-slate-800">{value}</span>
    </div>
  );
}

function Drawer({ open, onOpenChange, title, description, children, wide }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; description?: string;
  children: React.ReactNode; wide?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn("w-full overflow-y-auto", wide ? "sm:max-w-3xl" : "sm:max-w-md")}>
        <SheetHeader>
          <SheetTitle className="text-[15px]">{title}</SheetTitle>
          {description && <SheetDescription className="text-[12px]">{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-4 space-y-3 text-[12.5px] text-slate-700">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

/* ---------------------------- policy overview ----------------------------- */

export function PolicyOverviewPanel({
  policies, onToggle, onOpen, onFooter, loading, degraded, spotlight, governance,
}: {
  policies: DiscoveryPolicy[];
  onToggle: (id: string, next: boolean) => void;
  onOpen: (p: DiscoveryPolicy) => void;
  onFooter: () => void;
  loading?: boolean;
  degraded?: string | null;
  spotlight?: boolean;
  governance?: boolean;
}) {
  return (
    <Panel
      id="panel-policies" title="Discovery Policy Overview"
      subtitle="Governance rules applied to every discovery run"
      footer="Manage Discovery Policies" onFooter={onFooter}
      loading={loading} degraded={degraded} spotlight={spotlight}
    >
      <ul className="divide-y divide-slate-100">
        {policies.map((p) => (
          <li key={p.id} className="flex items-center gap-2 py-1.5">
            <button
              type="button"
              onClick={() => onOpen(p)}
              className="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="block truncate text-[12px] text-slate-800">{p.name}</span>
              {governance && (
                <span className="block truncate text-[10.5px] text-slate-500">
                  {p.owner} · {p.coveredSources} sources · {p.exceptions.length} exceptions · updated {p.lastUpdated}
                </span>
              )}
            </button>
            <Pill label={p.enabled ? "Enabled" : "Disabled"} tone={p.enabled ? "green" : "slate"} />
            <Switch
              checked={p.enabled}
              onCheckedChange={(v) => onToggle(p.id, v)}
              aria-label={`${p.name} policy enabled`}
              className="scale-75"
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function PolicyDrawer({ policy, onOpenChange }: { policy: DiscoveryPolicy | null; onOpenChange: (v: boolean) => void }) {
  return (
    <Drawer open={!!policy} onOpenChange={onOpenChange} title={policy?.name ?? "Policy"} description={policy?.description}>
      {policy && (
        <>
          <p className="text-[12px] text-slate-600">{policy.businessPurpose}</p>
          <div>
            <Row label="Status" value={<Pill label={policy.enabled ? "Enabled" : "Disabled"} tone={policy.enabled ? "green" : "slate"} />} />
            <Row label="Owner" value={policy.owner} />
            <Row label="Approval owner" value={policy.approvalOwner} />
            <Row label="Review cadence" value={policy.reviewCadence} />
            <Row label="Coverage" value={`${policy.coveredSources} of 147 sources`} />
            <Row label="Applied categories" value={policy.coveredCategories.join(", ")} />
            <Row label="Knowledge domains" value={policy.knowledgeDomains.join(", ")} />
            <Row label="Included classifications" value={policy.classifications.join(", ")} />
            <Row label="Excluded classifications" value={policy.excludedClassifications.join(", ")} />
            <Row label="Triggers" value={policy.triggers.join("; ")} />
            <Row label="Actions" value={policy.actions.join(", ")} />
            <Row label="Last updated" value={policy.lastUpdated} />
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-slate-900">Sources not covered</h3>
            <ul className="mt-1 list-disc pl-4 text-[11.5px] text-slate-600">
              {policy.uncoveredSources.length ? policy.uncoveredSources.map((u) => <li key={u}>{u}</li>) : <li>All sources covered</li>}
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-slate-900">Exceptions ({policy.exceptions.length})</h3>
            <ul className="mt-1 list-disc pl-4 text-[11.5px] text-slate-600">
              {policy.exceptions.length ? policy.exceptions.map((e) => <li key={e}>{e}</li>) : <li>No exceptions</li>}
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-slate-900">Audit history</h3>
            <ul className="mt-1 space-y-1 text-[11.5px] text-slate-600">
              {policy.audit.map((a) => <li key={a.at}>{a.at} · {a.by} · {a.change}</li>)}
            </ul>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["Edit Policy", "Duplicate Policy", "Disable Policy", "View Exceptions", "View Audit History"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success(`${a} — ${policy.name}`)}>{a}</Button>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* -------------------------- source configuration -------------------------- */

const ALL_COLUMNS = ["Category", "Platform", "Owner", "Status", "Access", "Discovery Mode", "Schedule", "Last Run", "Artifact Estimate", "Coverage", "Warnings"] as const;
type ColumnKey = (typeof ALL_COLUMNS)[number];
const DEFAULT_COLUMNS: ColumnKey[] = ["Category", "Platform", "Owner", "Status", "Access", "Discovery Mode", "Schedule", "Last Run"];

export function SourceConfigurationPanel({
  sources, onOpenSource, onAddSource, onRowAction, loading, degraded, spotlight, operations,
  categoryFilter, statusFilter, accessFilter, ownerFilter,
  onCategoryFilter, onStatusFilter, onAccessFilter, onOwnerFilter,
}: {
  sources: SourceConfiguration[];
  onOpenSource: (s: SourceConfiguration) => void;
  onAddSource: () => void;
  onRowAction: (action: string, s: SourceConfiguration) => void;
  loading?: boolean;
  degraded?: string | null;
  spotlight?: boolean;
  operations?: boolean;
  categoryFilter: string; statusFilter: string; accessFilter: string; ownerFilter: string;
  onCategoryFilter: (v: string) => void; onStatusFilter: (v: string) => void;
  onAccessFilter: (v: string) => void; onOwnerFilter: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "name", dir: 1 });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [dense, setDense] = useState(true);
  const [columns, setColumns] = useState<ColumnKey[]>(operations ? [...ALL_COLUMNS] : DEFAULT_COLUMNS);
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = sources.filter((s) =>
      (!q || `${s.name} ${s.platform} ${s.businessOwner} ${s.category}`.toLowerCase().includes(q)) &&
      (categoryFilter === "All" || s.category === categoryFilter) &&
      (statusFilter === "All" || s.status === statusFilter) &&
      (accessFilter === "All" || s.access === accessFilter) &&
      (ownerFilter === "All" || s.businessOwner === ownerFilter));
    return [...filtered].sort((a, b) => {
      const get = (s: SourceConfiguration) =>
        sort.key === "coverage" ? s.coverage : String((s as unknown as Record<string, unknown>)[sort.key] ?? "");
      const av = get(a), bv = get(b);
      return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir;
    });
  }, [sources, query, sort, categoryFilter, statusFilter, accessFilter, ownerFilter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const current = Math.min(page, totalPages);
  const visible = rows.slice((current - 1) * perPage, current * perPage);
  const pad = dense ? "py-1.5" : "py-2.5";

  const toggleSort = (key: string) => setSort((s) => ({ key, dir: s.key === key && s.dir === 1 ? -1 : 1 }));

  const cell = (s: SourceConfiguration, c: ColumnKey) => {
    switch (c) {
      case "Category": return s.category;
      case "Platform": return s.platform;
      case "Owner": return s.businessOwner;
      case "Status": return <span className="inline-flex items-center gap-1"><StatusDot tone={statusTone(s.status)} />{s.status}</span>;
      case "Access": return <Pill label={s.access} tone={statusTone(s.access)} />;
      case "Discovery Mode": return s.discoveryMode;
      case "Schedule": return s.scheduleLabel;
      case "Last Run": return s.lastRun;
      case "Artifact Estimate": return s.artifactEstimate.toLocaleString("en-US");
      case "Coverage": return `${s.coverage}%`;
      case "Warnings": return s.warnings.length ? <Pill label={`${s.warnings.length}`} tone="amber" /> : "—";
    }
  };

  return (
    <Panel
      id="panel-sources" title="Source Configuration"
      subtitle={`${rows.length} of ${sources.length} configured sources`}
      loading={loading} degraded={degraded} spotlight={spotlight}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <TableSelect label="Category" value={categoryFilter} options={["All", "Documents", "Tickets", "Chat", "Meetings", "Code", "APIs", "Telemetry"]} onChange={onCategoryFilter} />
        <TableSelect label="Status" value={statusFilter} options={["All", "Healthy", "Warning", "Degraded", "Paused"]} onChange={onStatusFilter} />
        <TableSelect label="Access" value={accessFilter} options={["All", "Approved", "Restricted", "Pending", "Denied"]} onChange={onAccessFilter} />
        <TableSelect label="Owner" value={ownerFilter} options={["All", ...Array.from(new Set(sources.map((s) => s.businessOwner)))]} onChange={onOwnerFilter} />
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search sources..." aria-label="Search sources"
            className="h-7 w-48 pl-7 text-[11.5px]"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-[11px]">Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-[11px]">Visible columns</DropdownMenuLabel>
            {ALL_COLUMNS.map((c) => (
              <DropdownMenuItem
                key={c} className="text-[12px]"
                onSelect={(e) => { e.preventDefault(); setColumns((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c])); }}
              >
                <Checkbox checked={columns.includes(c)} className="mr-2 h-3.5 w-3.5" aria-hidden tabIndex={-1} />
                {c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setDense((d) => !d)} aria-pressed={dense}>
          {dense ? "Compact" : "Comfortable"}
        </Button>
        <Button size="sm" className="h-7 text-[11px]" onClick={onAddSource}>
          <Plus className="mr-1 h-3.5 w-3.5" aria-hidden /> Add Source
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11.5px] text-blue-800">
          <span>{selected.length} selected</span>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => toast.success(`${selected.length} sources queued for discovery`)}>Run Discovery</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => toast.success(`${selected.length} sources paused`)}>Pause</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => exportRows(rows.filter((r) => selected.includes(r.id)))}>Export Selected</Button>
          <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[12.5px] text-slate-600">No sources match the current configuration filters.</p>
          <Button size="sm" className="mt-3 h-7 text-[11px]" onClick={onAddSource}>Add Source</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <caption className="sr-only">Configured enterprise discovery sources</caption>
            <thead>
              <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="w-8 pb-1.5">
                  <Checkbox
                    aria-label="Select all sources"
                    checked={selected.length > 0 && selected.length === visible.length}
                    onCheckedChange={(v) => setSelected(v ? visible.map((r) => r.id) : [])}
                    className="h-3.5 w-3.5"
                  />
                </th>
                <th scope="col" className="pb-1.5">
                  <button type="button" className="hover:text-slate-800" onClick={() => toggleSort("name")}>Source Name</button>
                </th>
                {columns.map((c) => (
                  <th key={c} scope="col" className="pb-1.5 pl-3">
                    <button type="button" className="hover:text-slate-800" onClick={() => toggleSort(c === "Coverage" ? "coverage" : "name")}>{c}</button>
                  </th>
                ))}
                <th scope="col" className="pb-1.5 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 text-[11.5px] text-slate-700 hover:bg-slate-50">
                  <td className={pad}>
                    <Checkbox
                      aria-label={`Select ${s.name}`}
                      checked={selected.includes(s.id)}
                      onCheckedChange={(v) => setSelected((cur) => (v ? [...cur, s.id] : cur.filter((x) => x !== s.id)))}
                      className="h-3.5 w-3.5"
                    />
                  </td>
                  <td className={pad}>
                    <button
                      type="button" onClick={() => onOpenSource(s)}
                      className="rounded font-medium text-slate-900 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {s.name}
                    </button>
                  </td>
                  {columns.map((c) => <td key={c} className={cn(pad, "pl-3")}>{cell(s, c)}</td>)}
                  <td className={cn(pad, "pl-3 text-right")}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label={`Actions for ${s.name}`}>
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {["Edit Source", "Test Connection", "Run Discovery", "Pause Discovery", "View Artifacts", "View Access Policy", "Duplicate Configuration", "Delete Configuration"].map((a) => (
                          <DropdownMenuItem key={a} className="text-[12px]" onSelect={() => onRowAction(a, s)}>{a}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>Showing {(current - 1) * perPage + 1} to {Math.min(current * perPage, rows.length)} of {rows.length} sources</span>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-6 text-[10.5px]" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</Button>
          <span aria-live="polite">Page {current} of {totalPages}</span>
          <Button variant="outline" size="sm" className="h-6 text-[10.5px]" disabled={current === totalPages} onClick={() => setPage(current + 1)}>Next</Button>
          <select
            aria-label="Rows per page" value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="h-6 rounded border border-slate-200 bg-white px-1 text-[10.5px]"
          >
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>
    </Panel>
  );
}

function TableSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="inline-flex items-center gap-1 text-[10.5px] text-slate-500">
      <span>{label}</span>
      <select
        aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
        className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function exportRows(rows: SourceConfiguration[], format: "csv" | "json" | "yaml" = "csv") {
  const name = `discovery-configuration.${format}`;
  let content = "";
  if (format === "json") content = JSON.stringify(rows, null, 2);
  else if (format === "yaml") content = rows.map((r) => `- name: ${r.name}\n  platform: ${r.platform}\n  status: ${r.status}\n  access: ${r.access}\n  mode: ${r.discoveryMode}`).join("\n");
  else {
    const header = ["Source Name", "Category", "Platform", "Owner", "Status", "Access", "Discovery Mode", "Schedule", "Last Run", "Artifacts", "Coverage"];
    content = [header.join(","), ...rows.map((r) => [r.name, r.category, r.platform, r.businessOwner, r.status, r.access, r.discoveryMode, r.scheduleLabel, r.lastRun, r.artifactEstimate, `${r.coverage}%`].join(","))].join("\n");
  }
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${rows.length} records as ${format.toUpperCase()}`);
}

export function SourceDrawer({ source, onOpenChange, onAction }: {
  source: SourceConfiguration | null; onOpenChange: (v: boolean) => void; onAction: (a: string, s: SourceConfiguration) => void;
}) {
  const connector = source ? connectors.find((c) => c.sourceId === source.id) : undefined;
  return (
    <Drawer open={!!source} onOpenChange={onOpenChange} title={source?.name ?? "Source"} description={source ? `${source.category} · ${source.platform}` : undefined}>
      {source && (
        <>
          <div>
            <Row label="Status" value={<span className="inline-flex items-center gap-1"><StatusDot tone={statusTone(source.status)} />{source.status}</span>} />
            <Row label="Access state" value={<Pill label={source.access} tone={statusTone(source.access)} />} />
            <Row label="Classification" value={source.accessClassification} />
            <Row label="Business owner" value={source.businessOwner} />
            <Row label="Technical owner" value={source.technicalOwner} />
            <Row label="Business unit / team" value={`${source.businessUnit} · ${source.team}`} />
            <Row label="Knowledge domains" value={source.knowledgeDomains.join(", ")} />
            <Row label="Authentication" value={source.authenticationMethod} />
            <Row label="Authorization scope" value={source.authorizationScope.join(", ")} />
            <Row label="Discovery mode" value={source.discoveryMode} />
            <Row label="Schedule" value={source.scheduleLabel} />
            <Row label="Last run" value={source.lastRun} />
            <Row label="Artifact estimate" value={source.artifactEstimate.toLocaleString("en-US")} />
            <Row label="Coverage" value={`${source.coverage}%`} />
            <Row label="Environment" value={source.environment} />
            <Row label="Updated" value={source.updatedAt} />
          </div>
          {source.warnings.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">
              <TriangleAlert className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              {source.warnings.join(" · ")}
            </div>
          )}
          {connector && (
            <div>
              <h3 className="text-[12px] font-semibold text-slate-900">Connector</h3>
              <Row label="Authentication status" value={<Pill label={connector.authenticationStatus} tone={statusTone(connector.authenticationStatus)} />} />
              <Row label="Token expiration" value={connector.tokenExpiration} />
              <Row label="Average latency" value={connector.averageLatency} />
              <Row label="Data residency" value={connector.dataResidency} />
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["Edit Source", "Test Connection", "Run Discovery", "Pause Discovery", "View Artifacts", "View Access Policy"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, source)}>{a}</Button>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ------------------------- connector configuration ------------------------ */

export function ConnectorConfigurationPanel({
  onOpenSummary, onManage, loading, degraded, spotlight,
}: {
  onOpenSummary: (row: ConnectorSummaryRow) => void;
  onManage: () => void;
  loading?: boolean;
  degraded?: string | null;
  spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-connectors" title="Connector Configuration" subtitle="Reusable connector building blocks"
      footer="Manage Connectors" onFooter={onManage} loading={loading} degraded={degraded} spotlight={spotlight}
    >
      <ul className="divide-y divide-slate-100">
        {connectorSummaryRows.map((r) => (
          <li key={r.id}>
            <button
              type="button" onClick={() => onOpenSummary(r)}
              className="flex w-full items-center justify-between gap-2 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="text-[12px] text-slate-700">{r.label}</span>
              <span className="text-[12px] font-semibold text-slate-900">{r.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ConnectorSummaryDrawer({ row, onOpenChange }: { row: ConnectorSummaryRow | null; onOpenChange: (v: boolean) => void }) {
  return (
    <Drawer open={!!row} onOpenChange={onOpenChange} title={row?.label ?? ""} description={row?.detail}>
      <ul className="space-y-1.5">
        {row?.items.map((i) => (
          <li key={i} className="rounded-md border border-slate-200 px-2 py-1.5 text-[12px] text-slate-700">{i}</li>
        ))}
      </ul>
      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success(`${row?.label} configuration opened`)}>Configure</Button>
    </Drawer>
  );
}

export function ConnectorManagementDrawer({ open, onOpenChange, onAction }: {
  open: boolean; onOpenChange: (v: boolean) => void; onAction: (a: string, c: ConnectorConfiguration) => void;
}) {
  const [selectedId, setSelectedId] = useState(connectors[0]?.id ?? "");
  const connector = connectors.find((c) => c.id === selectedId) ?? connectors[0];
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Connector Management" description="Authentication, scope, throughput, and reliability for each enterprise connector" wide>
      <div className="flex flex-wrap gap-1.5">
        {connectors.map((c) => (
          <button
            key={c.id} type="button" onClick={() => setSelectedId(c.id)} aria-pressed={c.id === selectedId}
            className={cn("rounded-md border px-2 py-1 text-[11px]", c.id === selectedId ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}
          >
            {c.platform}
          </button>
        ))}
      </div>
      {connector && (
        <>
          <div className="grid gap-x-6 sm:grid-cols-2">
            <div>
              <Row label="Connector" value={connector.name} />
              <Row label="Platform" value={connector.platform} />
              <Row label="Type" value={connector.connectorType} />
              <Row label="Authentication" value={connector.authenticationMethod} />
              <Row label="Auth status" value={<Pill label={connector.authenticationStatus} tone={statusTone(connector.authenticationStatus)} />} />
              <Row label="Token expiration" value={connector.tokenExpiration} />
              <Row label="Permission scope" value={connector.permissionScope.join(", ")} />
              <Row label="Data residency" value={connector.dataResidency} />
            </div>
            <div>
              <Row label="Retry policy" value={connector.retryPolicy} />
              <Row label="Rate limit" value={connector.rateLimit} />
              <Row label="Timeout" value={connector.timeout} />
              <Row label="Polling interval" value={connector.pollingInterval} />
              <Row label="Streaming" value={connector.streamingEnabled ? "Enabled" : "Disabled"} />
              <Row label="Last successful test" value={connector.lastSuccessfulTest} />
              <Row label="Last failed test" value={connector.lastFailedTest} />
              <Row label="Average latency" value={connector.averageLatency} />
            </div>
          </div>
          {connector.warnings.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">{connector.warnings.join(" · ")}</div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {["Test Connector", "Reauthorize", "Rotate Simulated Credential", "Pause", "Resume", "Edit", "View Logs"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, connector)}>{a}</Button>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ----------------------------- schedule panel ----------------------------- */

export function SchedulePanel({
  schedules, onOpen, onNew, onFooter, loading, degraded, spotlight,
}: {
  schedules: ScheduleProfile[];
  onOpen: (s: ScheduleProfile) => void;
  onNew: () => void;
  onFooter: () => void;
  loading?: boolean; degraded?: string | null; spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-schedules" title="Discovery Schedule Management"
      subtitle="All times shown in America/New_York"
      footer="Manage Schedules" onFooter={onFooter} loading={loading} degraded={degraded} spotlight={spotlight}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
          <Clock className="h-3.5 w-3.5" aria-hidden /> America/New_York
        </span>
        <Button size="sm" className="h-7 text-[11px]" onClick={onNew}>
          <Plus className="mr-1 h-3.5 w-3.5" aria-hidden /> New Schedule
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left">
          <caption className="sr-only">Discovery schedules</caption>
          <thead>
            <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
              <th scope="col" className="pb-1.5">Schedule Name</th>
              <th scope="col" className="pb-1.5 pl-3">Frequency</th>
              <th scope="col" className="pb-1.5 pl-3">Next Run</th>
              <th scope="col" className="pb-1.5 pl-3">Sources</th>
              <th scope="col" className="pb-1.5 pl-3">Status</th>
              <th scope="col" className="pb-1.5 pl-3">Owner</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 text-[11.5px] text-slate-700 hover:bg-slate-50">
                <td className="py-1.5">
                  <button type="button" onClick={() => onOpen(s)} className="rounded font-medium text-slate-900 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {s.name}
                  </button>
                </td>
                <td className="py-1.5 pl-3">{s.frequency}</td>
                <td className="py-1.5 pl-3">{s.nextRun}</td>
                <td className="py-1.5 pl-3">{s.sources}</td>
                <td className="py-1.5 pl-3"><Pill label={s.status} tone={statusTone(s.status)} /></td>
                <td className="py-1.5 pl-3">{s.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function ScheduleDrawer({ schedule, onOpenChange, onAction }: {
  schedule: ScheduleProfile | null; onOpenChange: (v: boolean) => void; onAction: (a: string, s: ScheduleProfile) => void;
}) {
  return (
    <Drawer open={!!schedule} onOpenChange={onOpenChange} title={schedule?.name ?? "Schedule"} description={schedule ? `${schedule.frequency} · ${schedule.timezone}` : undefined}>
      {schedule && (
        <>
          <div>
            <Row label="Status" value={<Pill label={schedule.status} tone={statusTone(schedule.status)} />} />
            <Row label="Next run" value={schedule.nextRun} />
            <Row label="Sources" value={schedule.sources} />
            <Row label="Owner" value={schedule.owner} />
            <Row label="Retry policy" value={schedule.retryPolicy} />
            <Row label="Maximum duration" value={schedule.maximumDuration} />
            <Row label="Last updated" value={schedule.lastUpdated} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Edit Schedule", "Duplicate Schedule", schedule.status === "Active" ? "Pause Schedule" : "Resume Schedule", "Run Now", "View Sources", "Delete Schedule"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onAction(a, schedule)}>
                {a === "Run Now" ? <><Play className="mr-1 h-3 w-3" aria-hidden />{a}</> : a.startsWith("Pause") ? <><Pause className="mr-1 h-3 w-3" aria-hidden />{a}</> : a}
              </Button>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ------------------------- access & permission ---------------------------- */

export function AccessPanel({
  breakdown, onSelect, onMatrix, loading, degraded, spotlight, activeState,
}: {
  breakdown: typeof accessBreakdown;
  onSelect: (state: AccessState) => void;
  onMatrix: () => void;
  loading?: boolean; degraded?: string | null; spotlight?: boolean;
  activeState: string;
}) {
  const total = breakdown.reduce((a, b) => a + b.value, 0);
  return (
    <Panel
      id="panel-access" title="Access & Permission Overview"
      subtitle={`${total} sources by access state`}
      footer="View Access Matrix" onFooter={onMatrix} loading={loading} degraded={degraded} spotlight={spotlight}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-[150px] w-[150px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={breakdown} dataKey="value" innerRadius={48} outerRadius={70} paddingAngle={2} stroke="none">
                {breakdown.map((b) => <Cell key={b.label} fill={b.color} />)}
              </Pie>
              <RTooltip formatter={(v: number, n: string) => [`${v} sources`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-[19px] font-bold text-slate-900">{total}</div>
              <div className="text-[10px] text-slate-500">Total Sources</div>
            </div>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-1">
          {breakdown.map((b) => (
            <li key={b.label}>
              <button
                type="button" onClick={() => onSelect(b.state)} aria-pressed={activeState === b.state}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded px-1.5 py-1 text-[11.5px] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  activeState === b.state && "bg-blue-50",
                )}
              >
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="h-2 w-2 rounded-full" style={{ background: b.color }} aria-hidden />
                  {b.label}
                </span>
                <span className="text-slate-900">{b.value} <span className="text-slate-500">({b.pct}%)</span></span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="sr-only">
        {breakdown.map((b) => `${b.label}: ${b.value} sources, ${b.pct} percent`).join(". ")}
      </p>
    </Panel>
  );
}

export function AccessMatrixDrawer({ open, onOpenChange, onChangeAccess }: {
  open: boolean; onOpenChange: (v: boolean) => void; onChangeAccess: (team: string, category: string) => void;
}) {
  const tone = (s: AccessState) => statusTone(s);
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Access Matrix" description="Team access to source categories" wide>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <caption className="sr-only">Team by category access matrix</caption>
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wide text-slate-500">
              <th scope="col" className="pb-1.5">Team</th>
              {accessMatrix.cols.map((c) => <th key={c} scope="col" className="pb-1.5 pl-2">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {accessMatrix.rows.map((r, ri) => (
              <tr key={r} className="border-t border-slate-100">
                <th scope="row" className="py-1.5 text-[11.5px] font-medium text-slate-800">{r}</th>
                {accessMatrix.cols.map((c, ci) => {
                  const state = accessMatrix.cell(ri, ci);
                  return (
                    <td key={c} className="py-1.5 pl-2">
                      <button
                        type="button"
                        onClick={() => { if (window.confirm(`Change access for ${r} on ${c}?`)) onChangeAccess(r, c); }}
                        aria-label={`${r} access to ${c}: ${state}. Change access`}
                        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <Pill label={state} tone={tone(state)} />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* --------------------------- classification ------------------------------- */

export function ClassificationPanel({
  rules, onOpen, onNew, onFooter, loading, degraded, spotlight,
}: {
  rules: DataClassificationRule[];
  onOpen: (r: DataClassificationRule) => void;
  onNew: () => void; onFooter: () => void;
  loading?: boolean; degraded?: string | null; spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-classification" title="Data Classification Rules"
      subtitle="Applied before any artifact enters ingestion"
      footer="Manage Classifications" onFooter={onFooter} loading={loading} degraded={degraded} spotlight={spotlight}
    >
      <div className="mb-2 flex justify-end">
        <Button size="sm" className="h-7 text-[11px]" onClick={onNew}>
          <Plus className="mr-1 h-3.5 w-3.5" aria-hidden /> New Rule
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left">
          <caption className="sr-only">Data classification rules</caption>
          <thead>
            <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
              <th scope="col" className="pb-1.5">Classification</th>
              <th scope="col" className="pb-1.5 pl-3">Description</th>
              <th scope="col" className="pb-1.5 pl-3">Sources</th>
              <th scope="col" className="pb-1.5 pl-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 text-[11.5px] text-slate-700 hover:bg-slate-50">
                <td className="py-1.5">
                  <button type="button" onClick={() => onOpen(r)} className="rounded font-medium text-slate-900 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {r.name}
                  </button>
                </td>
                <td className="py-1.5 pl-3 text-slate-600">{r.description}</td>
                <td className="py-1.5 pl-3">{r.sources}</td>
                <td className="py-1.5 pl-3"><Pill label={r.status} tone={statusTone(r.status)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function ClassificationDrawer({ rule, onOpenChange }: { rule: DataClassificationRule | null; onOpenChange: (v: boolean) => void }) {
  return (
    <Drawer open={!!rule} onOpenChange={onOpenChange} title={rule?.name ?? "Classification"} description={rule?.description}>
      {rule && (
        <>
          <div>
            <Row label="Owner" value={rule.owner} />
            <Row label="Sources" value={rule.sources} />
            <Row label="Detection criteria" value={rule.detectionCriteria} />
            <Row label="Keywords" value={rule.keywords.join(", ") || "—"} />
            <Row label="Patterns" value={rule.patterns.join(", ") || "—"} />
            <Row label="Source categories" value={rule.sourceCategories.join(", ")} />
            <Row label="Knowledge domains" value={rule.knowledgeDomains.join(", ")} />
            <Row label="Access requirements" value={rule.accessRequirements} />
            <Row label="Retention" value={rule.retention} />
            <Row label="Data residency" value={rule.dataResidency} />
            <Row label="Review cadence" value={rule.reviewCadence} />
            <Row label="Review date" value={rule.reviewDate} />
            <Row label="Actions when detected" value={rule.actions.join(", ")} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Edit Rule", "Duplicate Rule", "Deactivate Rule", "View Sources", "View Exceptions"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success(`${a} — ${rule.name}`)}>{a}</Button>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ---------------------------- discovery options --------------------------- */

export function DiscoveryOptionsPanel({
  options, onToggle, onAdvanced, loading, spotlight, degraded,
}: {
  options: DiscoveryOption[];
  onToggle: (id: string, next: boolean) => void;
  onAdvanced: () => void;
  loading?: boolean; spotlight?: boolean; degraded?: string | null;
}) {
  return (
    <Panel
      id="panel-options" title="Discovery Options" subtitle="Content, detection, governance, and operational behavior"
      footer="Advanced Options" onFooter={onAdvanced} loading={loading} spotlight={spotlight} degraded={degraded}
    >
      <TooltipProvider delayDuration={200}>
        <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
          {options.map((o) => (
            <Tooltip key={o.id}>
              <TooltipTrigger asChild>
                <label className="flex items-start gap-2 rounded px-1 py-1 text-[11.5px] text-slate-700 hover:bg-slate-50">
                  <Checkbox
                    checked={o.enabled}
                    onCheckedChange={(v) => onToggle(o.id, !!v)}
                    aria-label={o.name}
                    className="mt-0.5 h-3.5 w-3.5"
                  />
                  <span className="min-w-0">{o.name}{o.requiresApproval && <span className="ml-1 text-[10px] text-amber-600">(approval)</span>}</span>
                </label>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-[11.5px]">{o.description}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </Panel>
  );
}

export function AdvancedOptionsDrawer({ open, onOpenChange, onChange }: {
  open: boolean; onOpenChange: (v: boolean) => void; onChange: () => void;
}) {
  const fields: [string, string][] = [
    ["Historical date range", "Last 3 years"], ["Maximum file size", "250 MB"],
    ["Supported file types", "pdf, docx, md, txt, html"], ["Excluded file types", "exe, zip, iso"],
    ["Attachment handling", "Discover and index"], ["Archived content handling", "Metadata only"],
    ["Deleted content retention", "30 days"], ["Duplicate threshold", "0.92 similarity"],
    ["Owner confidence threshold", "0.75"], ["Freshness threshold", "45 days"],
    ["Source inactivity threshold", "90 days"], ["Drift detection sensitivity", "Medium"],
    ["Maximum concurrent discovery jobs", "24"], ["Rate limit behavior", "Backoff and retry"],
    ["Retry policy", "5 attempts, exponential"],
  ];
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Advanced Discovery Options" description="Fine-grained controls applied across all discovery runs">
      <div className="space-y-2">
        {fields.map(([label, value]) => (
          <div key={label} className="grid gap-1">
            <Label htmlFor={`adv-${label}`} className="text-[11px] text-slate-600">{label}</Label>
            <Input id={`adv-${label}`} defaultValue={value} onChange={onChange} className="h-7 text-[11.5px]" />
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ------------------------------ alerts panel ------------------------------ */

export function AlertsPanel({
  rules, onToggle, onOpen, onNew, onFooter, loading, degraded, spotlight,
}: {
  rules: AlertRule[];
  onToggle: (id: string, next: boolean) => void;
  onOpen: (r: AlertRule) => void;
  onNew: () => void; onFooter: () => void;
  loading?: boolean; degraded?: string | null; spotlight?: boolean;
}) {
  return (
    <Panel
      id="panel-alerts" title="Notifications & Alerts" subtitle="Operational and governance alerting"
      footer="Manage Alerts" onFooter={onFooter} loading={loading} degraded={degraded} spotlight={spotlight}
    >
      <div className="mb-2 flex justify-end">
        <Button size="sm" className="h-7 text-[11px]" onClick={onNew}>
          <Plus className="mr-1 h-3.5 w-3.5" aria-hidden /> New Alert Rule
        </Button>
      </div>
      <ul className="divide-y divide-slate-100">
        {rules.map((r) => (
          <li key={r.id} className="flex items-center gap-2 py-1.5">
            <button type="button" onClick={() => onOpen(r)} className="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <span className="block truncate text-[12px] text-slate-800">{r.name}</span>
              <span className="block truncate text-[10.5px] text-slate-500">{r.recipients} · {r.severity}</span>
            </button>
            <Pill label={r.enabled ? "Active" : "Paused"} tone={r.enabled ? "green" : "slate"} />
            <Switch checked={r.enabled} onCheckedChange={(v) => onToggle(r.id, v)} aria-label={`${r.name} alert enabled`} className="scale-75" />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function AlertDrawer({ rule, onOpenChange }: { rule: AlertRule | null; onOpenChange: (v: boolean) => void }) {
  return (
    <Drawer open={!!rule} onOpenChange={onOpenChange} title={rule?.name ?? "Alert rule"} description={rule?.eventType}>
      {rule && (
        <>
          <div>
            <Row label="Severity" value={rule.severity} />
            <Row label="Threshold" value={rule.threshold} />
            <Row label="Sources" value={rule.sources} />
            <Row label="Categories" value={rule.categories} />
            <Row label="Teams" value={rule.teams} />
            <Row label="Recipients" value={rule.recipients} />
            <Row label="Delivery channels" value={rule.deliveryChannels.join(", ")} />
            <Row label="Escalation delay" value={rule.escalationDelay} />
            <Row label="Repeat frequency" value={rule.repeatFrequency} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Edit Recipients", "Edit Severity", "Edit Threshold", "Test Alert", "Delete Alert"].map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success(`${a} — ${rule.name}`)}>{a}</Button>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* --------------------------- configuration changes ------------------------ */

export function ChangesPanel({
  changes, onOpen, onFooter, loading, spotlight, degraded,
}: {
  changes: ConfigurationChange[];
  onOpen: (c: ConfigurationChange) => void;
  onFooter: () => void;
  loading?: boolean; spotlight?: boolean; degraded?: string | null;
}) {
  return (
    <Panel
      id="panel-changes" title="Recent Configuration Changes" subtitle="Versioned enterprise audit trail"
      footer="View Change History" onFooter={onFooter} loading={loading} spotlight={spotlight} degraded={degraded}
    >
      <ul className="divide-y divide-slate-100">
        {changes.map((c) => (
          <li key={c.id}>
            <button
              type="button" onClick={() => onOpen(c)}
              className="flex w-full items-start justify-between gap-3 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="w-[62px] shrink-0 text-[11px] text-slate-500">{c.time}</span>
              <span className="min-w-0 flex-1 truncate text-[11.5px] text-slate-800">{c.description}</span>
              <span className="shrink-0 text-[11px] text-slate-500">{c.changedBy}</span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ChangeDrawer({ change, onOpenChange, onRollback }: {
  change: ConfigurationChange | null; onOpenChange: (v: boolean) => void; onRollback: (c: ConfigurationChange) => void;
}) {
  return (
    <Drawer open={!!change} onOpenChange={onOpenChange} title={change?.description ?? "Change"} description={change ? `${change.objectType} · ${change.changeType}` : undefined}>
      {change && (
        <>
          <div>
            <Row label="Configuration object" value={`${change.objectType} (${change.objectId})`} />
            <Row label="Before" value={change.previousValue} />
            <Row label="After" value={change.newValue} />
            <Row label="Changed by" value={change.changedBy} />
            <Row label="Change reason" value={change.changeReason} />
            <Row label="Approval" value={<Pill label={change.approvalStatus} tone={statusTone(change.approvalStatus === "Pending" ? "Pending" : "Approved")} />} />
            <Row label="Related source" value={change.relatedSource ?? "—"} />
            <Row label="Related policy" value={change.relatedPolicy ?? "—"} />
            <Row label="Related schedule" value={change.relatedSchedule ?? "—"} />
            <Row label="Audit ID" value={change.auditId} />
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onRollback(change)}>
            <RefreshCw className="mr-1 h-3 w-3" aria-hidden /> Roll back change
          </Button>
        </>
      )}
    </Drawer>
  );
}

/* ---------------------------- governance summary -------------------------- */

export function GovernanceSummaryPanel({ pendingApproval, loading }: { pendingApproval: boolean; loading?: boolean }) {
  return (
    <Panel id="panel-governance" title="Governance Posture" subtitle="Approval, review, and compliance state" loading={loading}>
      <div>
        <Row label="Configuration version" value="v14.2" />
        <Row label="Approval status" value={<Pill label={pendingApproval ? "Pending Approval" : "Approved"} tone={pendingApproval ? "amber" : "green"} />} />
        <Row label="Approval owner" value="Alex Valencia" />
        <Row label="Last review" value="2025-05-01" />
        <Row label="Next review" value="2025-08-01" />
        <Row label="Regulated sources" value="2" />
        <Row label="Open exceptions" value="26" />
      </div>
      <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> All active policies have a named approval owner.
      </p>
    </Panel>
  );
}

export function FooterNote({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[12px] text-blue-900">
      <span>Configure discovery sources, connectors, access policies, and schedules to ensure comprehensive and secure knowledge capture across the enterprise.</span>
      <button type="button" onClick={onNext} className="inline-flex items-center gap-1 rounded font-medium text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        Discovery Pipelines <ArrowRight className="h-3 w-3" aria-hidden />
      </button>
    </div>
  );
}
