import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ArrowLeft, Copy, Download, Eye, Filter, Layers, MoreVertical, Pencil, Plus, Power,
  RefreshCw, RotateCcw, Search as SearchIcon, Sparkles, Trash2, X,
} from "lucide-react";
import AutoBuildDomainsDialog from "@/components/etdm/AutoBuildDomainsDialog";
import {
  useDomains, useMasterDomains, useTechnologyOptions,
  useSetDomainActive, useCloneDomain, useSoftDeleteDomain, useRestoreDomain,
  ETDM_DOMAIN_APPROVAL, ETDM_DOMAIN_CRITICALITY, ETDM_DOMAIN_LIFECYCLE,
  type Domain, type DomainFilters, type EtdmDomainApproval, type EtdmDomainCriticality, type EtdmDomainLifecycle,
} from "@/hooks/etdm/useDomains";
import {
  ActiveBadge, ApprovalBadge, CriticalityBadge, LifecycleBadge,
} from "@/components/etdm/DomainBadges";

const DEFAULT_COLUMNS = {
  technology: true, master_domain: true, name: true, short_name: false, criticality: true,
  lifecycle: true, approval: true, active: true, tags: false, source_of_record: false, modified: true,
} as const;
type ColKey = keyof typeof DEFAULT_COLUMNS;

export default function DomainsPage() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();

  const [search, setSearch] = useState(sp.get("q") ?? "");
  const [techIds, setTechIds] = useState<string[]>(sp.get("tech")?.split(",").filter(Boolean) ?? []);
  const [masterIds, setMasterIds] = useState<string[]>(sp.get("md")?.split(",").filter(Boolean) ?? []);
  const [lifecycle, setLifecycle] = useState<string[]>(sp.get("lc")?.split(",").filter(Boolean) ?? []);
  const [approval, setApproval] = useState<string[]>(sp.get("ap")?.split(",").filter(Boolean) ?? []);
  const [criticality, setCriticality] = useState<string[]>(sp.get("cr")?.split(",").filter(Boolean) ?? []);
  const [active, setActive] = useState<"all" | "active" | "inactive">((sp.get("a") as "all" | "active" | "inactive") ?? "all");
  const [showDeleted, setShowDeleted] = useState(sp.get("del") === "1");
  const [createdFrom, setCreatedFrom] = useState(sp.get("cf") ?? "");
  const [createdTo, setCreatedTo] = useState(sp.get("ct") ?? "");
  const [modifiedFrom, setModifiedFrom] = useState(sp.get("mf") ?? "");
  const [modifiedTo, setModifiedTo] = useState(sp.get("mt") ?? "");
  const [page, setPage] = useState<number>(Number(sp.get("p") ?? 0));
  const [pageSize, setPageSize] = useState<number>(Number(sp.get("ps") ?? 25));
  const [sortBy, setSortBy] = useState<string>(sp.get("sb") ?? "updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">((sp.get("sd") as "asc" | "desc") ?? "desc");

  const [columns, setColumns] = useState<Record<ColKey, boolean>>(() => {
    try {
      const raw = localStorage.getItem("etdm-domains-columns");
      if (raw) return { ...DEFAULT_COLUMNS, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return { ...DEFAULT_COLUMNS };
  });
  useEffect(() => {
    localStorage.setItem("etdm-domains-columns", JSON.stringify(columns));
  }, [columns]);

  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<Domain | null>(null);
  const [confirmClone, setConfirmClone] = useState<Domain | null>(null);
  const [confirmActive, setConfirmActive] = useState<{ domain: Domain; next: boolean } | null>(null);
  const [autoBuildOpen, setAutoBuildOpen] = useState(false);

  const filters: DomainFilters = useMemo(() => ({
    search, technology_ids: techIds, master_domain_ids: masterIds,
    lifecycle_status: lifecycle as EtdmDomainLifecycle[],
    approval_status: approval as EtdmDomainApproval[],
    business_criticality: criticality as EtdmDomainCriticality[],
    active, showDeleted,
    createdFrom: createdFrom || undefined, createdTo: createdTo || undefined,
    modifiedFrom: modifiedFrom || undefined, modifiedTo: modifiedTo || undefined,
    page, pageSize, sortBy, sortDir,
  }), [search, techIds, masterIds, lifecycle, approval, criticality, active, showDeleted, createdFrom, createdTo, modifiedFrom, modifiedTo, page, pageSize, sortBy, sortDir]);

  const { data, isLoading, isError, refetch, isFetching } = useDomains(filters);
  const { data: masterDomains } = useMasterDomains();
  const { data: techOptions } = useTechnologyOptions();
  const rows = data?.rows ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (techIds.length) p.set("tech", techIds.join(","));
    if (masterIds.length) p.set("md", masterIds.join(","));
    if (lifecycle.length) p.set("lc", lifecycle.join(","));
    if (approval.length) p.set("ap", approval.join(","));
    if (criticality.length) p.set("cr", criticality.join(","));
    if (active !== "all") p.set("a", active);
    if (showDeleted) p.set("del", "1");
    if (createdFrom) p.set("cf", createdFrom);
    if (createdTo) p.set("ct", createdTo);
    if (modifiedFrom) p.set("mf", modifiedFrom);
    if (modifiedTo) p.set("mt", modifiedTo);
    if (pageSize !== 25) p.set("ps", String(pageSize));
    if (page !== 0) p.set("p", String(page));
    if (sortBy !== "updated_at") p.set("sb", sortBy);
    if (sortDir !== "desc") p.set("sd", sortDir);
    setSp(p, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, techIds, masterIds, lifecycle, approval, criticality, active, showDeleted, createdFrom, createdTo, modifiedFrom, modifiedTo, page, pageSize, sortBy, sortDir]);

  const del = useSoftDeleteDomain();
  const restore = useRestoreDomain();
  const setActiveM = useSetDomainActive();
  const clone = useCloneDomain();

  const clearFilters = () => {
    setSearch(""); setTechIds([]); setMasterIds([]); setLifecycle([]); setApproval([]); setCriticality([]);
    setActive("all"); setShowDeleted(false);
    setCreatedFrom(""); setCreatedTo(""); setModifiedFrom(""); setModifiedTo("");
    setPage(0);
  };

  const activeFilterCount =
    techIds.length + masterIds.length + lifecycle.length + approval.length + criticality.length +
    (active !== "all" ? 1 : 0) + (showDeleted ? 1 : 0) +
    (createdFrom ? 1 : 0) + (createdTo ? 1 : 0) + (modifiedFrom ? 1 : 0) + (modifiedTo ? 1 : 0);

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  const toggleAll = (checked: boolean) => {
    if (checked) setSelection(new Set(rows.map((r) => r.id)));
    else setSelection(new Set());
  };
  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selection);
    if (checked) next.add(id); else next.delete(id);
    setSelection(next);
  };

  const doExport = (which: "all" | "selected") => {
    const source = which === "selected" ? rows.filter((r) => selection.has(r.id)) : rows;
    if (!source.length) { toast.error("Nothing to export."); return; }
    const cols = [
      "domain_display_name","short_name","slug","master_domain_name","technology_name",
      "business_criticality","lifecycle_status","approval_status","is_active","display_order",
      "tags","source_of_record","external_reference_id","created_at","updated_at",
    ];
    const header = cols.join(",");
    const body = source.map((r) => cols.map((c) => {
      let v: unknown;
      if (c === "master_domain_name") v = r.master_domain?.name;
      else if (c === "technology_name") v = r.technology?.technology_name;
      else if (c === "tags") v = (r.tags ?? []).join("|");
      else v = (r as unknown as Record<string, unknown>)[c];
      const s = v == null ? "" : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    }).join(",")).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `etdm-domains-${which}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bulkSetActive = async (act: boolean) => {
    for (const id of selection) await setActiveM.mutateAsync({ id, active: act });
    toast.success(`${selection.size} record${selection.size === 1 ? "" : "s"} ${act ? "activated" : "deactivated"}`);
    setSelection(new Set());
  };
  const bulkDelete = async () => {
    for (const id of selection) await del.mutateAsync(id);
    toast.success(`${selection.size} record${selection.size === 1 ? "" : "s"} moved to deleted`);
    setSelection(new Set());
  };

  return (
    <AppShell>
      <div className="p-6 max-w-[1600px] mx-auto w-full">
        <Link
          to="/admin/technology-taxonomy"
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo/10 px-3 py-1.5 text-sm font-semibold text-indigo ring-1 ring-indigo/30 hover:bg-indigo/15 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Technology Taxonomy
        </Link>

        <header className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Layers className="h-6 w-6 text-indigo" /> Domains
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Manage the Domain records that describe how each Technology participates in the Enterprise Technology Domain Model taxonomy.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={"h-3.5 w-3.5 mr-1.5 " + (isFetching ? "animate-spin" : "")} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => doExport("all")}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
            </Button>
            <Button size="sm" onClick={() => nav("/admin/technology-taxonomy/domains/new")}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Domain
            </Button>
          </div>
        </header>

        {/* Toolbar */}
        <Card className="p-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search display name, short name, description, tags, source, external id…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-8 h-9"
              />
            </div>

            <FilterMulti
              label="Technology"
              values={techIds}
              setValues={(v) => { setTechIds(v); setPage(0); }}
              options={(techOptions ?? []).map((t) => ({ value: t.id, label: t.technology_name }))}
            />
            <FilterMulti
              label="Master Domain"
              values={masterIds}
              setValues={(v) => { setMasterIds(v); setPage(0); }}
              options={(masterDomains ?? []).map((m) => ({ value: m.id, label: m.name }))}
            />
            <FilterMulti
              label="Lifecycle"
              values={lifecycle}
              setValues={(v) => { setLifecycle(v); setPage(0); }}
              options={ETDM_DOMAIN_LIFECYCLE.map((v) => ({ value: v, label: v }))}
            />
            <FilterMulti
              label="Approval"
              values={approval}
              setValues={(v) => { setApproval(v); setPage(0); }}
              options={ETDM_DOMAIN_APPROVAL.map((v) => ({ value: v, label: v }))}
            />
            <FilterMulti
              label="Criticality"
              values={criticality}
              setValues={(v) => { setCriticality(v); setPage(0); }}
              options={ETDM_DOMAIN_CRITICALITY.map((v) => ({ value: v, label: v }))}
            />

            <Select value={active} onValueChange={(v) => { setActive(v as "all" | "active" | "inactive"); setPage(0); }}>
              <SelectTrigger className="h-9 w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showDeleted ? "default" : "outline"}
              size="sm"
              onClick={() => { setShowDeleted((s) => !s); setPage(0); }}
              title="Show soft-deleted records"
            >
              {showDeleted ? "Viewing deleted" : "Deleted only"}
            </Button>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3.5 w-3.5 mr-1" /> Clear ({activeFilterCount})
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1.5" /> Columns</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Show columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(Object.keys(DEFAULT_COLUMNS) as ColKey[]).map((k) => (
                    <DropdownMenuCheckboxItem
                      key={k}
                      checked={columns[k]}
                      onCheckedChange={(v) => setColumns((c) => ({ ...c, [k]: !!v }))}
                    >
                      {k}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(0); }}>
                <SelectTrigger className="h-9 w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date filters row */}
          <div className="mt-2 flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
            <span>Created:</span>
            <Input type="date" className="h-8 w-[150px]" value={createdFrom} onChange={(e) => { setCreatedFrom(e.target.value); setPage(0); }} />
            <span>–</span>
            <Input type="date" className="h-8 w-[150px]" value={createdTo} onChange={(e) => { setCreatedTo(e.target.value); setPage(0); }} />
            <span className="ml-4">Modified:</span>
            <Input type="date" className="h-8 w-[150px]" value={modifiedFrom} onChange={(e) => { setModifiedFrom(e.target.value); setPage(0); }} />
            <span>–</span>
            <Input type="date" className="h-8 w-[150px]" value={modifiedTo} onChange={(e) => { setModifiedTo(e.target.value); setPage(0); }} />
          </div>

          {selection.size > 0 && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-indigo/30 bg-indigo/5 px-3 py-2 text-sm">
              <div className="font-medium">{selection.size} selected</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => bulkSetActive(true)}>Activate</Button>
                <Button size="sm" variant="outline" onClick={() => bulkSetActive(false)}>Deactivate</Button>
                <Button size="sm" variant="outline" onClick={() => doExport("selected")}>Export</Button>
                <Button size="sm" variant="destructive" onClick={bulkDelete}>Soft delete</Button>
                <Button size="sm" variant="ghost" onClick={() => setSelection(new Set())}>Clear</Button>
              </div>
            </div>
          )}
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[36px]">
                  <Checkbox
                    checked={rows.length > 0 && rows.every((r) => selection.has(r.id))}
                    onCheckedChange={(v) => toggleAll(!!v)}
                  />
                </TableHead>
                {columns.technology && <TableHead>Technology</TableHead>}
                {columns.master_domain && <TableHead>Master Domain</TableHead>}
                {columns.name && (
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("domain_display_name")}>Display Name</TableHead>
                )}
                {columns.short_name && <TableHead>Short Name</TableHead>}
                {columns.criticality && <TableHead>Criticality</TableHead>}
                {columns.lifecycle && <TableHead>Lifecycle</TableHead>}
                {columns.approval && <TableHead>Approval</TableHead>}
                {columns.active && <TableHead>Active</TableHead>}
                {columns.tags && <TableHead>Tags</TableHead>}
                {columns.source_of_record && <TableHead>Source</TableHead>}
                {columns.modified && (
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("updated_at")}>Last Modified</TableHead>
                )}
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={13} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
              )}
              {!isLoading && isError && (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-10">
                    <div className="text-destructive font-medium">Failed to load domain records.</div>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => refetch()}>Retry</Button>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-16">
                    <div className="text-lg font-medium">No domain records match the current filters.</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Adjust the filters, or create a new Domain to expand the taxonomy.
                    </div>
                    <Button size="sm" className="mt-4" onClick={() => nav("/admin/technology-taxonomy/domains/new")}>
                      <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Domain
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id} className={r.is_deleted ? "opacity-60" : ""}>
                  <TableCell>
                    <Checkbox checked={selection.has(r.id)} onCheckedChange={(v) => toggleOne(r.id, !!v)} />
                  </TableCell>
                  {columns.technology && (
                    <TableCell>
                      {r.technology
                        ? <Link to={`/admin/technology-taxonomy/technologies/${r.technology.id}`} className="hover:underline">{r.technology.technology_name}</Link>
                        : "—"}
                    </TableCell>
                  )}
                  {columns.master_domain && <TableCell>{r.master_domain?.name ?? "—"}</TableCell>}
                  {columns.name && (
                    <TableCell className="font-medium">
                      <Link to={`/admin/technology-taxonomy/domains/${r.id}`} className="hover:underline">
                        {r.domain_display_name}
                      </Link>
                    </TableCell>
                  )}
                  {columns.short_name && <TableCell>{r.short_name ?? "—"}</TableCell>}
                  {columns.criticality && <TableCell><CriticalityBadge value={r.business_criticality} /></TableCell>}
                  {columns.lifecycle && <TableCell><LifecycleBadge value={r.lifecycle_status} /></TableCell>}
                  {columns.approval && <TableCell><ApprovalBadge value={r.approval_status} /></TableCell>}
                  {columns.active && <TableCell><ActiveBadge value={r.is_active} /></TableCell>}
                  {columns.tags && (
                    <TableCell className="text-xs text-muted-foreground">
                      {r.tags?.length ? r.tags.slice(0, 4).join(", ") + (r.tags.length > 4 ? "…" : "") : "—"}
                    </TableCell>
                  )}
                  {columns.source_of_record && <TableCell>{r.source_of_record ?? "—"}</TableCell>}
                  {columns.modified && (
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.updated_at).toLocaleString()}
                    </TableCell>
                  )}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => nav(`/admin/technology-taxonomy/domains/${r.id}`)}>
                          <Eye className="h-3.5 w-3.5 mr-2" /> View
                        </DropdownMenuItem>
                        {!r.is_deleted && (
                          <>
                            <DropdownMenuItem onClick={() => nav(`/admin/technology-taxonomy/domains/${r.id}/edit`)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConfirmClone(r)}>
                              <Copy className="h-3.5 w-3.5 mr-2" /> Clone
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConfirmActive({ domain: r, next: !r.is_active })}>
                              <Power className="h-3.5 w-3.5 mr-2" /> {r.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setConfirmDelete(r)}>
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                        {r.is_deleted && (
                          <DropdownMenuItem onClick={async () => { await restore.mutateAsync(r.id); toast.success("Restored"); }}>
                            <RotateCcw className="h-3.5 w-3.5 mr-2" /> Restore
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
          <div>{total} record{total === 1 ? "" : "s"}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
            <div>Page {page + 1} of {totalPages}</div>
            <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete domain?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete <span className="font-semibold">{confirmDelete?.domain_display_name}</span>. Relationships and history are preserved and it can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!confirmDelete) return;
                try { await del.mutateAsync(confirmDelete.id); toast.success("Domain deleted"); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); }
                setConfirmDelete(null);
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clone confirm */}
      <AlertDialog open={!!confirmClone} onOpenChange={(o) => !o && setConfirmClone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clone domain?</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new draft record based on <span className="font-semibold">{confirmClone?.domain_display_name}</span>. The copy is marked Draft and Inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!confirmClone) return;
                try {
                  const res = await clone.mutateAsync(confirmClone.id);
                  toast.success("Cloned");
                  setConfirmClone(null);
                  nav(`/admin/technology-taxonomy/domains/${res.id}/edit`);
                } catch (e) { toast.error(e instanceof Error ? e.message : "Clone failed"); }
              }}
            >Clone</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Active toggle */}
      <AlertDialog open={!!confirmActive} onOpenChange={(o) => !o && setConfirmActive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmActive?.next ? "Activate" : "Deactivate"} domain?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmActive?.next
                ? "The record will be visible to consumers of the taxonomy."
                : "The record remains stored with full history but is hidden from active taxonomy consumers."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!confirmActive) return;
                try {
                  await setActiveM.mutateAsync({ id: confirmActive.domain.id, active: confirmActive.next });
                  toast.success(confirmActive.next ? "Activated" : "Deactivated");
                } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
                setConfirmActive(null);
              }}
            >Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function FilterMulti({
  label, values, setValues, options,
}: {
  label: string; values: string[]; setValues: (v: string[]) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          {label}{values.length ? ` · ${values.length}` : ""}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 overflow-auto">
        {options.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">No options</div>}
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.value}
            checked={values.includes(o.value)}
            onCheckedChange={(v) => {
              if (v) setValues([...values, o.value]);
              else setValues(values.filter((x) => x !== o.value));
            }}
          >{o.label}</DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
