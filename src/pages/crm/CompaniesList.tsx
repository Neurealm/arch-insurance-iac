import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Building2, Plus, Search, Filter, Download, Pencil, Trash2, MoreVertical, Globe, Mail, ArrowRight } from "lucide-react";
import { useCompanies, useDeleteCompany } from "@/hooks/crm/useCompanies";
import { CompanySheet } from "@/components/crm/CompanySheet";
import { toast } from "@/hooks/use-toast";
import type { Company } from "./types";
import { CrmTabs } from "./CrmTabs";

export default function CompaniesList() {
  const navigate = useNavigate();
  const { data: companies = [], isLoading } = useCompanies();
  const del = useDeleteCompany();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Company | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Company | null>(null);

  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [priorityFilter, setPriorityFilter] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      if (q && ![c.name, c.industry, c.account_owner, c.email].some((x) => x?.toLowerCase().includes(q))) return false;
      if (typeFilter.size && !typeFilter.has(c.company_type)) return false;
      if (priorityFilter.size && !priorityFilter.has(c.priority)) return false;
      if (statusFilter === "active" && !c.status) return false;
      if (statusFilter === "inactive" && c.status) return false;
      return true;
    });
  }, [companies, search, typeFilter, statusFilter, priorityFilter]);

  const exportCsv = () => {
    const headers = ["Name", "Industry", "Type", "Owner", "Email", "Phone", "Status", "Priority"];
    const rows = filtered.map((c) => [c.name, c.industry, c.company_type, c.account_owner, c.email, c.phone, c.status ? "Active" : "Inactive", c.priority]);
    const csv = [headers, ...rows].map((r) => r.map((x) => `"${(x ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `companies-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggle = (set: Set<string>, val: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  };

  const openAdd = () => { setEditing(null); setSheetOpen(true); };
  const openEdit = (c: Company) => { setEditing(c); setSheetOpen(true); };

  const onDelete = async () => {
    if (!confirmDel) return;
    try {
      await del.mutateAsync(confirmDel.id);
      toast({ title: "Company deleted" });
      setConfirmDel(null);
    } catch (e: unknown) {
      toast({ title: e instanceof Error ? e.message : "Delete failed", variant: "destructive" });
    }
  };

  return (
    <AppShell>
      <div className="p-6 max-w-[1600px] mx-auto w-full">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-indigo" /> Customer Relation Manager
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage companies, stakeholders, departments, and engagement.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/crm-demo")}
              title="Preview AOCP Customer & Engagement Flow"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-violet-300 bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 hover:border-violet-400 transition-colors"
            >
              <span className="hidden sm:inline">AOCP Flow Preview</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Company</Button>
          </div>
        </header>

        <CrmTabs />

        <div className="rounded-lg border bg-card">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies, owner, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filter</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Type</DropdownMenuLabel>
                {["Customer","Partner","Vendor","Prospect"].map((t) => (
                  <DropdownMenuCheckboxItem key={t} checked={typeFilter.has(t)} onCheckedChange={() => toggle(typeFilter, t, setTypeFilter)}>{t}</DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Priority</DropdownMenuLabel>
                {["High","Medium","Low"].map((p) => (
                  <DropdownMenuCheckboxItem key={p} checked={priorityFilter.has(p)} onCheckedChange={() => toggle(priorityFilter, p, setPriorityFilter)}>{p}</DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                {(["all","active","inactive"] as const).map((s) => (
                  <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                    {statusFilter === s ? "● " : "○ "}{s.charAt(0).toUpperCase() + s.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="gap-2" onClick={exportCsv}><Download className="h-4 w-4" /> Export</Button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading...</div>
          ) : companies.length === 0 ? (
            <EmptyState onCreate={openAdd} />
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No companies match your filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => navigate(`/crm/companies/${c.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center text-indigo font-semibold">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div>{c.name}</div>
                          {c.website && <div className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />{c.website}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.industry || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{c.company_type}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{c.account_owner || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</div>}
                      {c.phone && <div>{c.phone}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.status ? "default" : "secondary"}>{c.status ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={c.priority} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(c)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setConfirmDel(c)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <CompanySheet open={sheetOpen} onOpenChange={setSheetOpen} company={editing} />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDel?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the company and all its stakeholders, departments, teams, activities, and notes.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="p-16 flex flex-col items-center text-center">
      <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center mb-4">
        <Building2 className="h-8 w-8 text-indigo" />
      </div>
      <h3 className="text-lg font-semibold">No companies created yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Add your first company to start managing stakeholders, departments and teams.
      </p>
      <Button onClick={onCreate} className="mt-5 gap-2"><Plus className="h-4 w-4" />Create Company</Button>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    High: "bg-status-critical-soft text-status-critical",
    Medium: "bg-accent text-indigo",
    Low: "bg-secondary text-muted-foreground",
  };
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${map[priority] || ""}`}>{priority}</span>;
}