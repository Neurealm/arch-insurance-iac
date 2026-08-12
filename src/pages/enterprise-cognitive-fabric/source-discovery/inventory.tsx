import { useMemo, useState } from "react";
import { ArrowUpDown, Columns3, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Panel, StatusBadge, DetailRow, CommandCenterDrawer as Drawer } from "../command-center/panels";
import { filterOptions, formatNumber, type EnterpriseSource } from "./data";

type ColumnKey =
  | "name" | "category" | "platform" | "businessOwner" | "status" | "artifactCount"
  | "lastSync" | "accessClassification" | "coverage" | "discoveryMode" | "warnings";

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "name", label: "Source Name" },
  { key: "category", label: "Category" },
  { key: "platform", label: "Platform" },
  { key: "businessOwner", label: "Owner" },
  { key: "status", label: "Status" },
  { key: "artifactCount", label: "Artifacts" },
  { key: "lastSync", label: "Last Sync" },
  { key: "accessClassification", label: "Access" },
  { key: "coverage", label: "Coverage" },
  { key: "discoveryMode", label: "Discovery Mode" },
  { key: "warnings", label: "Warnings" },
];

const statusTone = (s: string) => (s === "Healthy" ? "green" : s === "Warning" ? "amber" : s === "Degraded" ? "red" : "slate");

const PAGE_SIZE = 5;

export function SourceInventoryPanel({
  sources,
  onOpenSource,
  loading,
  degraded,
  spotlight,
  onExport,
}: {
  sources: EnterpriseSource[];
  onOpenSource: (s: EnterpriseSource) => void;
  loading?: boolean;
  degraded?: string | null;
  spotlight?: boolean;
  onExport: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [status, setStatus] = useState("All");
  const [owner, setOwner] = useState("All");
  const [access, setAccess] = useState("All");
  const [mode, setMode] = useState("All");
  const [sort, setSort] = useState<{ key: ColumnKey; dir: "asc" | "desc" }>({ key: "artifactCount", dir: "desc" });
  const [visible, setVisible] = useState<ColumnKey[]>(COLUMNS.map((c) => c.key));
  const [dense, setDense] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  const owners = useMemo(() => ["All", ...Array.from(new Set(sources.map((s) => s.businessOwner)))], [sources]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = sources.filter((s) => {
      if (q && ![s.name, s.platform, s.businessOwner, s.category].some((v) => v.toLowerCase().includes(q))) return false;
      if (category !== "All" && s.category !== category) return false;
      if (platform !== "All" && s.platform !== platform) return false;
      if (status !== "All" && s.status !== status) return false;
      if (owner !== "All" && s.businessOwner !== owner) return false;
      if (access !== "All" && s.accessClassification !== access) return false;
      if (mode !== "All" && s.discoveryMode !== mode) return false;
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key] as string | number | string[];
      const bv = b[sort.key] as string | number | string[];
      const an = Array.isArray(av) ? av.length : av;
      const bn = Array.isArray(bv) ? bv.length : bv;
      if (typeof an === "number" && typeof bn === "number") return (an - bn) * dir;
      return String(an).localeCompare(String(bn)) * dir;
    });
  }, [sources, query, category, platform, status, owner, access, mode, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const paged = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const cols = COLUMNS.filter((c) => visible.includes(c.key));

  const toggleSort = (key: ColumnKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));

  const cell = (s: EnterpriseSource, key: ColumnKey) => {
    switch (key) {
      case "name": return <span className="font-medium text-slate-900">{s.name}</span>;
      case "artifactCount": return formatNumber(s.artifactCount);
      case "coverage": return `${s.coverage}%`;
      case "status": return <StatusBadge tone={statusTone(s.status) as "green"}>{s.status}</StatusBadge>;
      case "accessClassification":
        return <StatusBadge tone={s.accessClassification === "Approved" ? "green" : s.accessClassification === "Restricted" ? "red" : "amber"}>{s.accessClassification}</StatusBadge>;
      case "warnings": return s.warnings.length ? <span className="text-amber-700">{s.warnings.length}</span> : <span className="text-slate-400">0</span>;
      default: return String(s[key]);
    }
  };

  return (
    <Panel id="panel-inventory" title="Source Inventory" loading={loading} degraded={degraded} spotlight={spotlight}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder="Search sources…"
            aria-label="Search sources"
            className="h-7 w-44 pl-7 text-[11.5px]"
          />
        </div>
        <InvSelect label="Category" value={category} options={filterOptions.sourceCategory} onChange={(v) => { setCategory(v); setPage(0); }} />
        <InvSelect label="Platform" value={platform} options={filterOptions.platform} onChange={setPlatform} />
        <InvSelect label="Status" value={status} options={filterOptions.connectorStatus} onChange={setStatus} />
        <InvSelect label="Owner" value={owner} options={owners} onChange={setOwner} />
        <InvSelect label="Access" value={access} options={filterOptions.accessClassification} onChange={setAccess} />
        <InvSelect label="Discovery Mode" value={mode} options={filterOptions.discoveryMode} onChange={setMode} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-[11px]">
              <Columns3 className="mr-1 h-3 w-3" aria-hidden /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-[11px]">Visible columns</DropdownMenuLabel>
            {COLUMNS.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.key}
                className="text-[12px]"
                checked={visible.includes(c.key)}
                onCheckedChange={(v) =>
                  setVisible((cur) => (v ? [...cur, c.key] : cur.filter((k) => k !== c.key)))
                }
              >
                {c.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setDense((d) => !d)} aria-pressed={dense}>
          {dense ? "Comfortable" : "Compact"}
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={onExport}>
          <Download className="mr-1 h-3 w-3" aria-hidden /> Export
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2 py-1">
          <span className="text-[11px] text-blue-800">{selected.length} selected</span>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => toast.success(`Discovery queued for ${selected.length} sources`)}>Run Discovery</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={() => toast.success(`Paused ${selected.length} sources`)}>Pause</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={onExport}>Export selected</Button>
          <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-[11.5px]">
          <caption className="sr-only">Enterprise source inventory with ownership, status, coverage and access classification</caption>
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th scope="col" className="w-8 py-1.5">
                <Checkbox
                  aria-label="Select all sources on this page"
                  checked={paged.length > 0 && paged.every((r) => selected.includes(r.id))}
                  onCheckedChange={(v) =>
                    setSelected(v ? Array.from(new Set([...selected, ...paged.map((r) => r.id)])) : selected.filter((id) => !paged.some((r) => r.id === id)))
                  }
                />
              </th>
              {cols.map((c) => (
                <th key={c.key} scope="col" className="py-1.5 pr-2 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    className="inline-flex items-center gap-1 rounded hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label={`Sort by ${c.label}`}
                  >
                    {c.label} <ArrowUpDown className="h-2.5 w-2.5" aria-hidden />
                  </button>
                </th>
              ))}
              <th scope="col" className="py-1.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={cols.length + 2} className="py-8 text-center text-slate-500">
                  No sources match the current filters. Clear filters or widen the date range.
                </td>
              </tr>
            ) : (
              paged.map((s) => (
                <tr key={s.id} className={cn("border-b border-slate-100 hover:bg-slate-50", dense ? "h-7" : "h-9")}>
                  <td className="py-1">
                    <Checkbox
                      aria-label={`Select ${s.name}`}
                      checked={selected.includes(s.id)}
                      onCheckedChange={(v) => setSelected((cur) => (v ? [...cur, s.id] : cur.filter((id) => id !== s.id)))}
                    />
                  </td>
                  {cols.map((c) => (
                    <td key={c.key} className="py-1 pr-2 text-slate-700">
                      {c.key === "name" ? (
                        <button
                          type="button"
                          onClick={() => onOpenSource(s)}
                          className="rounded text-left hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          {cell(s, c.key)}
                        </button>
                      ) : (
                        cell(s, c.key)
                      )}
                    </td>
                  ))}
                  <td className="py-1">
                    <Button size="sm" variant="ghost" className="h-6 text-[10.5px]" onClick={() => onOpenSource(s)}>
                      Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>{rows.length} sources</span>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={current === 0} onClick={() => setPage(current - 1)}>Previous</Button>
          <span>Page {current + 1} of {pageCount}</span>
          <Button size="sm" variant="outline" className="h-6 text-[10.5px]" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>Next</Button>
        </div>
      </div>
    </Panel>
  );
}

function InvSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="inline-flex items-center gap-1 text-[11px] text-slate-600">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o === "All" ? `${label}: All` : o}</option>
        ))}
      </select>
    </label>
  );
}

/* ------------------------------ Source drawer ----------------------------- */

export function SourceDetailDrawer({
  source,
  onOpenChange,
  onViewArtifacts,
}: {
  source: EnterpriseSource | null;
  onOpenChange: (v: boolean) => void;
  onViewArtifacts: () => void;
}) {
  return (
    <Drawer
      open={!!source}
      onOpenChange={onOpenChange}
      title={source?.name ?? "Source"}
      description={source ? `${source.category} · ${source.platform}` : undefined}
    >
      {source && (
        <>
          <p className="text-[12px] text-slate-600">{source.purpose}</p>
          <div className="space-y-1.5">
            <DetailRow label="Business owner" value={source.businessOwner} />
            <DetailRow label="Technical owner" value={source.technicalOwner} />
            <DetailRow label="Knowledge domains" value={source.knowledgeDomains.join(", ")} />
            <DetailRow label="Teams represented" value={source.teams.join(", ")} />
            <DetailRow label="Authentication" value={source.authenticationStatus} />
            <DetailRow label="Authorization scope" value={source.authorizationScope} />
            <DetailRow label="Security classification" value={source.securityClassification} />
            <DetailRow label="Data residency" value={source.dataResidency} />
            <DetailRow label="Discovery mode" value={source.discoveryMode} />
            <DetailRow label="Schedule" value={source.schedule} />
            <DetailRow label="Last successful sync" value={source.lastSync} />
            <DetailRow label="Last failed sync" value={source.lastFailedSync} />
            <DetailRow label="Artifacts" value={formatNumber(source.artifactCount)} />
            <DetailRow label="New this period" value={formatNumber(source.newArtifacts)} />
            <DetailRow label="Coverage" value={`${source.coverage}%`} />
            <DetailRow label="Freshness" value={source.freshness} />
            <DetailRow label="Queue depth" value={formatNumber(source.queueDepth)} />
            <DetailRow
              label="Warnings"
              value={source.warnings.length ? source.warnings.join("; ") : "None"}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" className="h-7 text-[11px]" onClick={() => toast.success(`Discovery started for ${source.name}`)}>Run Discovery</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.warning(`${source.name} discovery paused`)}>Pause Discovery</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success("Connector retry queued")}>Retry Connector</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.info("Opening configuration")}>Edit Configuration</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onViewArtifacts}>View Artifacts</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.info("Opening evidence records")}>View Evidence</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.info("Opening access policy")}>View Access Policy</Button>
          </div>
        </>
      )}
    </Drawer>
  );
}
