import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Database as DbIcon, Plus, Search as SearchIcon, RefreshCw, Download, MoreVertical,
  Eye, Pencil, Copy, Power, Trash2, RotateCcw, Filter, X,
} from "lucide-react";
import {
  useTechnologies, useSoftDeleteTechnology, useSetActive, useCloneTechnology,
  useRestoreTechnology, useBulkSetPractice, type Technology, type TechFilters,
} from "@/hooks/etdm/useTechnologies";
import {
  ETDM_CATEGORIES, ETDM_TECH_TYPES, ETDM_LIFECYCLE_STATUSES, ETDM_CRITICALITIES, ETDM_APPROVAL_STATUSES, ETDM_PRACTICES,
} from "@/lib/etdm/constants";

const TABS: { key: string; label: string; active: boolean }[] = [
  { key: "technologies", label: "Technologies", active: true },
  { key: "domains", label: "Domains", active: false },
  { key: "capabilities", label: "Capabilities", active: false },
  { key: "services", label: "Services", active: false },
  { key: "subservices", label: "Subservices", active: false },
  { key: "components", label: "Components", active: false },
];

const DEFAULT_COLUMNS = {
  name: true, short_name: true, vendor: true, family: true, category: true, type: true,
  version: true, lifecycle: true, criticality: true, practice: true, owner: false, approval: true,
  active: true, modified: true,
} as const;
type ColKey = keyof typeof DEFAULT_COLUMNS;

function statusTone(s: string | null | undefined) {
  switch (s) {
    case "Approved": return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
    case "In Review": return "bg-amber-500/15 text-amber-600 border-amber-500/30";
    case "Draft": return "bg-slate-500/15 text-slate-500 border-slate-500/30";
    case "Rejected": return "bg-rose-500/15 text-rose-600 border-rose-500/30";
    case "Retired": return "bg-zinc-500/15 text-zinc-500 border-zinc-500/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

export default function TechnologyTaxonomyPage() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();

  const [search, setSearch] = useState(sp.get("q") ?? "");
  const [category, setCategory] = useState<string[]>(sp.get("cat")?.split(",").filter(Boolean) ?? []);
  const [type, setType] = useState<string[]>(sp.get("t")?.split(",").filter(Boolean) ?? []);
  const [lifecycle, setLifecycle] = useState<string[]>(sp.get("lc")?.split(",").filter(Boolean) ?? []);
  const [criticality, setCriticality] = useState<string[]>(sp.get("cr")?.split(",").filter(Boolean) ?? []);
  const [approval, setApproval] = useState<string[]>(sp.get("ap")?.split(",").filter(Boolean) ?? []);
  const [practice, setPractice] = useState<string[]>(sp.get("pr")?.split(",").filter(Boolean) ?? []);
  const [active, setActive] = useState<"all" | "active" | "inactive">((sp.get("a") as "all" | "active" | "inactive") ?? "all");
  const [showDeleted, setShowDeleted] = useState(sp.get("del") === "1");
  const [pageSize, setPageSize] = useState<number>(Number(sp.get("ps") ?? 25));
  const [page, setPage] = useState<number>(Number(sp.get("p") ?? 0));
  const [sortBy, setSortBy] = useState<string>(sp.get("sb") ?? "updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">((sp.get("sd") as "asc" | "desc") ?? "desc");
  const [columns, setColumns] = useState<Record<ColKey, boolean>>({ ...DEFAULT_COLUMNS });
  const [selection, setSelection] = useState<Set<string>>(new Set());

  const [confirmDelete, setConfirmDelete] = useState<Technology | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [confirmClone, setConfirmClone] = useState<Technology | null>(null);
  const [confirmActive, setConfirmActive] = useState<{ tech: Technology; next: boolean } | null>(null);
  const [bulkPracticeOpen, setBulkPracticeOpen] = useState(false);
  const [bulkPracticeValue, setBulkPracticeValue] = useState<string>("");

  const filters: TechFilters = useMemo(() => ({
    search, vendor: undefined, category, technology_type: type,
    lifecycle_status: lifecycle, business_criticality: criticality,
    approval_status: approval, neurealm_practice: practice, active, showDeleted,
    sortBy, sortDir, page, pageSize,
  }), [search, category, type, lifecycle, criticality, approval, practice, active, showDeleted, sortBy, sortDir, page, pageSize]);

  const { data, isLoading, isError, refetch, isFetching } = useTechnologies(filters);
  const rows = data?.rows ?? [];
  const total = data?.count ?? 0;

  // URL persistence (debounced-lite)
  useEffect(() => {
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (category.length) p.set("cat", category.join(","));
    if (type.length) p.set("t", type.join(","));
    if (lifecycle.length) p.set("lc", lifecycle.join(","));
    if (criticality.length) p.set("cr", criticality.join(","));
    if (approval.length) p.set("ap", approval.join(","));
    if (practice.length) p.set("pr", practice.join(","));
    if (active !== "all") p.set("a", active);
    if (showDeleted) p.set("del", "1");
    if (pageSize !== 25) p.set("ps", String(pageSize));
    if (page !== 0) p.set("p", String(page));
    if (sortBy !== "updated_at") p.set("sb", sortBy);
    if (sortDir !== "desc") p.set("sd", sortDir);
    setSp(p, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, type, lifecycle, criticality, approval, practice, active, showDeleted, pageSize, page, sortBy, sortDir]);

  const del = useSoftDeleteTechnology();
  const restore = useRestoreTechnology();
  const setActiveM = useSetActive();
  const clone = useCloneTechnology();
  const bulkPractice = useBulkSetPractice();

  const clearFilters = () => {
    setCategory([]); setType([]); setLifecycle([]); setCriticality([]); setApproval([]); setPractice([]);
    setActive("all"); setSearch(""); setShowDeleted(false); setPage(0);
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  const doExport = () => {
    const cols = ["technology_name","short_name","vendor_name","product_family","category","technology_type","version","lifecycle_status","business_criticality","neurealm_practice","approval_status","is_active","updated_at"];
    const header = cols.join(",");
    const body = rows.map((r) => cols.map((c) => {
      const v = r[c as keyof Technology] as unknown;
      const s = v == null ? "" : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    }).join(",")).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `etdm-technologies-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFilterCount =
    category.length + type.length + lifecycle.length + criticality.length + approval.length + practice.length +
    (active !== "all" ? 1 : 0) + (showDeleted ? 1 : 0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggleAll = (checked: boolean) => {
    if (checked) setSelection(new Set(rows.map((r) => r.id)));
    else setSelection(new Set());
  };
  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selection);
    if (checked) next.add(id); else next.delete(id);
    setSelection(next);
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
        <header className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <DbIcon className="h-6 w-6 text-indigo" /> Technology Taxonomy
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Create and manage the technology records used as the foundation of the Enterprise Technology Domain Model.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={"h-3.5 w-3.5 mr-1.5 " + (isFetching ? "animate-spin" : "")} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={doExport}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
            </Button>
            <Button size="sm" onClick={() => nav("/admin/technology-taxonomy/technologies/new")}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Technology
            </Button>
          </div>
        </header>

        {/* Future-ready taxonomy tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-border overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              disabled={!t.active}
              className={[
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
                t.active
                  ? "border-indigo text-foreground"
                  : "border-transparent text-muted-foreground/60 cursor-not-allowed",
              ].join(" ")}
            >
              {t.label}
              {!t.active && <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground/60">Coming Soon</span>}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <Card className="p-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search name, short name, vendor, product, description…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-8 h-9"
              />
            </div>

            <FilterMulti label="Category" values={category} setValues={(v) => { setCategory(v); setPage(0); }} options={[...ETDM_CATEGORIES]} />
            <FilterMulti label="Type" values={type} setValues={(v) => { setType(v); setPage(0); }} options={[...ETDM_TECH_TYPES]} />
            <FilterMulti label="Lifecycle" values={lifecycle} setValues={(v) => { setLifecycle(v); setPage(0); }} options={[...ETDM_LIFECYCLE_STATUSES]} />
            <FilterMulti label="Criticality" values={criticality} setValues={(v) => { setCriticality(v); setPage(0); }} options={[...ETDM_CRITICALITIES]} />
            <FilterMulti label="Approval" values={approval} setValues={(v) => { setApproval(v); setPage(0); }} options={[...ETDM_APPROVAL_STATUSES]} />
            <FilterMulti label="Practice" values={practice} setValues={(v) => { setPractice(v); setPage(0); }} options={[...ETDM_PRACTICES]} />

            <Select value={active} onValueChange={(v) => { setActive(v as "all" | "active" | "inactive"); setPage(0); }}>
              <SelectTrigger className="h-9 w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
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

          {/* Bulk action bar */}
          {selection.size > 0 && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-indigo/30 bg-indigo/5 px-3 py-2 text-sm">
              <div className="font-medium">{selection.size} selected</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => bulkSetActive(true)}>Activate</Button>
                <Button size="sm" variant="outline" onClick={() => bulkSetActive(false)}>Deactivate</Button>
                <Button size="sm" variant="outline" onClick={() => { setBulkPracticeValue(""); setBulkPracticeOpen(true); }}>Assign Practice</Button>
                <Button size="sm" variant="outline" onClick={doExport}>Export</Button>
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
                {columns.name && <TableHead className="cursor-pointer" onClick={() => toggleSort("technology_name")}>Name</TableHead>}
                {columns.short_name && <TableHead>Short Name</TableHead>}
                {columns.vendor && <TableHead className="cursor-pointer" onClick={() => toggleSort("vendor_name")}>Vendor</TableHead>}
                {columns.family && <TableHead>Product Family</TableHead>}
                {columns.category && <TableHead>Category</TableHead>}
                {columns.type && <TableHead>Type</TableHead>}
                {columns.version && <TableHead>Version</TableHead>}
                {columns.lifecycle && <TableHead>Lifecycle</TableHead>}
                {columns.criticality && <TableHead>Criticality</TableHead>}
                {columns.practice && <TableHead className="cursor-pointer" onClick={() => toggleSort("neurealm_practice")}>Practice</TableHead>}
                {columns.approval && <TableHead>Approval</TableHead>}
                {columns.active && <TableHead>Active</TableHead>}
                {columns.modified && <TableHead className="cursor-pointer" onClick={() => toggleSort("updated_at")}>Last Modified</TableHead>}
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={15} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
              )}
              {!isLoading && isError && (
                <TableRow><TableCell colSpan={15} className="text-center py-10">
                  <div className="text-destructive font-medium">Failed to load technology records.</div>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => refetch()}>Retry</Button>
                </TableCell></TableRow>
              )}
              {!isLoading && !isError && rows.length === 0 && (
                <TableRow><TableCell colSpan={15} className="text-center py-16">
                  <div className="text-lg font-medium">No technologies have been created yet.</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Create the first technology record to begin building the Enterprise Technology Domain Model.
                  </div>
                  <Button size="sm" className="mt-4" onClick={() => nav("/admin/technology-taxonomy/technologies/new")}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Technology
                  </Button>
                </TableCell></TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id} className={r.is_deleted ? "opacity-60" : ""}>
                  <TableCell>
                    <Checkbox checked={selection.has(r.id)} onCheckedChange={(v) => toggleOne(r.id, !!v)} />
                  </TableCell>
                  {columns.name && (
                    <TableCell className="font-medium">
                      <Link to={`/admin/technology-taxonomy/technologies/${r.id}`} className="hover:underline">
                        {r.technology_name}
                      </Link>
                      {r.is_sample && <Badge variant="outline" className="ml-2 text-[9px]">SAMPLE</Badge>}
                    </TableCell>
                  )}
                  {columns.short_name && <TableCell>{r.short_name ?? "—"}</TableCell>}
                  {columns.vendor && <TableCell>{r.vendor_name ?? "—"}</TableCell>}
                  {columns.family && <TableCell>{r.product_family ?? "—"}</TableCell>}
                  {columns.category && <TableCell>{r.category ?? "—"}</TableCell>}
                  {columns.type && <TableCell>{r.technology_type ?? "—"}</TableCell>}
                  {columns.version && <TableCell>{r.version ?? "—"}</TableCell>}
                  {columns.lifecycle && <TableCell>{r.lifecycle_status ?? "—"}</TableCell>}
                  {columns.criticality && <TableCell>{r.business_criticality ?? "—"}</TableCell>}
                  {columns.practice && (
                    <TableCell>
                      {(r as unknown as { neurealm_practice?: string | null }).neurealm_practice
                        ? <Badge variant="outline" className="bg-indigo/10 text-indigo border-indigo/30">{(r as unknown as { neurealm_practice?: string }).neurealm_practice}</Badge>
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                  )}
                  {columns.approval && (
                    <TableCell>
                      <Badge variant="outline" className={statusTone(r.approval_status)}>{r.approval_status}</Badge>
                    </TableCell>
                  )}
                  {columns.active && (
                    <TableCell>
                      {r.is_active
                        ? <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Active</Badge>
                        : <Badge variant="outline" className="bg-slate-500/15 text-slate-500 border-slate-500/30">Inactive</Badge>}
                    </TableCell>
                  )}
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
                        <DropdownMenuItem onClick={() => nav(`/admin/technology-taxonomy/technologies/${r.id}`)}>
                          <Eye className="h-3.5 w-3.5 mr-2" /> View
                        </DropdownMenuItem>
                        {!r.is_deleted && (
                          <>
                            <DropdownMenuItem onClick={() => nav(`/admin/technology-taxonomy/technologies/${r.id}/edit`)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConfirmClone(r)}>
                              <Copy className="h-3.5 w-3.5 mr-2" /> Clone
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConfirmActive({ tech: r, next: !r.is_active })}>
                              <Power className="h-3.5 w-3.5 mr-2" /> {r.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => { setConfirmDelete(r); setDeleteConfirmText(""); }}>
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

        {/* Pagination */}
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
            <AlertDialogTitle>Delete technology?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete <span className="font-semibold">{confirmDelete?.technology_name}</span>. Relationships and history are preserved and it can be restored later.
              Type <span className="font-mono font-semibold">DELETE</span> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" autoFocus />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmText !== "DELETE"}
              onClick={async () => {
                if (!confirmDelete) return;
                try { await del.mutateAsync(confirmDelete.id); toast.success("Technology deleted"); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); }
                setConfirmDelete(null); setDeleteConfirmText("");
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clone confirm */}
      <AlertDialog open={!!confirmClone} onOpenChange={(o) => !o && setConfirmClone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clone technology?</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new draft record based on <span className="font-semibold">{confirmClone?.technology_name}</span>. The copy is marked Draft and Inactive until you review and activate it.
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
                  nav(`/admin/technology-taxonomy/technologies/${res.id}/edit`);
                } catch (e) { toast.error(e instanceof Error ? e.message : "Clone failed"); }
              }}
            >Clone</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate/Deactivate confirm */}
      <AlertDialog open={!!confirmActive} onOpenChange={(o) => !o && setConfirmActive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmActive?.next ? "Activate" : "Deactivate"} technology?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmActive?.next
                ? "The record will become visible to consumers of the taxonomy."
                : "The record remains stored with full history but is hidden from active taxonomy consumers. Dependent records are not affected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!confirmActive) return;
                try {
                  await setActiveM.mutateAsync({ id: confirmActive.tech.id, active: confirmActive.next });
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
}: { label: string; values: string[]; setValues: (v: string[]) => void; options: string[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          {label}{values.length ? ` · ${values.length}` : ""}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 overflow-auto">
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o}
            checked={values.includes(o)}
            onCheckedChange={(v) => {
              if (v) setValues([...values, o]);
              else setValues(values.filter((x) => x !== o));
            }}
          >{o}</DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
