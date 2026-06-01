import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Plus, Search, Filter, Download, Eye, Pencil, Trash2, MoreVertical, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Priority = "High" | "Medium" | "Low";
type Influence = "High" | "Medium" | "Low";

type Register = {
  id: string;
  registerId: string;
  stakeholderName: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  department: string;
  priority: Priority;
  influenceLevel: Influence;
  engagementStrategy: string;
  notes: string;
  status: boolean; // true = Active
  updatedAt: string;
};

type DbRow = {
  id: string;
  register_id: string;
  stakeholder_name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  department: string | null;
  priority: string;
  influence_level: string;
  engagement_strategy: string | null;
  notes: string | null;
  status: boolean;
  updated_at: string;
};

const fromDb = (r: DbRow): Register => ({
  id: r.id,
  registerId: r.register_id,
  stakeholderName: r.stakeholder_name,
  company: r.company ?? "",
  role: r.role ?? "",
  email: r.email ?? "",
  phone: r.phone ?? "",
  department: r.department ?? "",
  priority: (r.priority as Priority) ?? "Medium",
  influenceLevel: (r.influence_level as Influence) ?? "Medium",
  engagementStrategy: r.engagement_strategy ?? "",
  notes: r.notes ?? "",
  status: r.status,
  updatedAt: r.updated_at,
});

const toDb = (r: Register) => ({
  id: r.id,
  register_id: r.registerId,
  stakeholder_name: r.stakeholderName,
  company: r.company,
  role: r.role,
  email: r.email,
  phone: r.phone,
  department: r.department,
  priority: r.priority,
  influence_level: r.influenceLevel,
  engagement_strategy: r.engagementStrategy,
  notes: r.notes,
  status: r.status,
});

const empty = (): Register => ({
  id: crypto.randomUUID(),
  registerId: `REG-${1000 + Math.floor(Math.random() * 9000)}`,
  stakeholderName: "", company: "", role: "", email: "", phone: "",
  department: "", priority: "Medium", influenceLevel: "Medium",
  engagementStrategy: "", notes: "", status: true,
  updatedAt: new Date().toISOString(),
});

const priorityClass: Record<Priority, string> = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-orange-100 text-orange-700 border-orange-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};
const influenceClass: Record<Influence, string> = {
  High: "bg-purple-100 text-purple-700 border-purple-200",
  Medium: "bg-slate-100 text-slate-700 border-slate-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
};

function toCsv(rows: Register[]) {
  const headers = [
    "Register ID","Stakeholder","Company","Role","Email","Phone","Department",
    "Priority","Influence","Status","Engagement Strategy","Notes","Last Updated",
  ];
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [
    r.registerId, r.stakeholderName, r.company, r.role, r.email, r.phone,
    r.department, r.priority, r.influenceLevel, r.status ? "Active" : "Inactive",
    r.engagementStrategy, r.notes, new Date(r.updatedAt).toLocaleString(),
  ].map(esc).join(","));
  return [headers.join(","), ...lines].join("\n");
}

export default function StakeholderRegisterPage() {
  const [rows, setRows] = useState<Register[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(["Active", "Inactive"]));
  const [priorityFilter, setPriorityFilter] = useState<Set<Priority>>(new Set(["High", "Medium", "Low"]));
  const [influenceFilter, setInfluenceFilter] = useState<Set<Influence>>(new Set(["High", "Medium", "Low"]));

  const [editing, setEditing] = useState<Register | null>(null);
  const [viewing, setViewing] = useState<Register | null>(null);
  const [deleting, setDeleting] = useState<Register | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("stakeholder_registers")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) {
        toast({ title: "Failed to load", description: error.message, variant: "destructive" });
      } else if (data) {
        setRows((data as DbRow[]).map(fromDb));
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ = !q ||
        r.stakeholderName.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.registerId.toLowerCase().includes(q);
      const matchS = statusFilter.has(r.status ? "Active" : "Inactive");
      const matchP = priorityFilter.has(r.priority);
      const matchI = influenceFilter.has(r.influenceLevel);
      return matchQ && matchS && matchP && matchI;
    });
  }, [rows, query, statusFilter, priorityFilter, influenceFilter]);

  const upsert = async (r: Register) => {
    const exists = rows.some((p) => p.id === r.id);
    const { data, error } = await supabase
      .from("stakeholder_registers")
      .upsert(toDb(r))
      .select()
      .single();
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    const saved = fromDb(data as DbRow);
    setRows((prev) => exists ? prev.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev]);
    toast({ title: "Saved", description: `${saved.stakeholderName || "Register"} has been saved.` });
    setEditing(null);
  };

  const remove = async (r: Register) => {
    const { error } = await supabase.from("stakeholder_registers").delete().eq("id", r.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((prev) => prev.filter((p) => p.id !== r.id));
    toast({ title: "Deleted", description: `${r.stakeholderName} removed.` });
    setDeleting(null);
  };

  const toggleStatus = async (r: Register) => {
    const newStatus = !r.status;
    setRows((prev) => prev.map((p) => p.id === r.id ? { ...p, status: newStatus } : p));
    const { error } = await supabase
      .from("stakeholder_registers")
      .update({ status: newStatus })
      .eq("id", r.id);
    if (error) {
      setRows((prev) => prev.map((p) => p.id === r.id ? { ...p, status: r.status } : p));
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `stakeholder-register-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const toggleSet = <T extends string>(s: Set<T>, v: T) => {
    const n = new Set(s);
    n.has(v) ? n.delete(v) : n.add(v);
    return n;
  };

  return (
    <AppShell>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo" /> Stakeholder Register
            </h1>
            <p className="text-sm italic text-slate-600 mt-1">
              Manage all stakeholders, their influence, and engagement strategies in one place.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, company, email, or ID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {(["Active", "Inactive"] as const).map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={statusFilter.has(s)}
                  onCheckedChange={() => setStatusFilter((p) => toggleSet(p, s))}
                >{s}</DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              {(["High", "Medium", "Low"] as const).map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={priorityFilter.has(p)}
                  onCheckedChange={() => setPriorityFilter((s) => toggleSet(s, p))}
                >{p}</DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Influence</DropdownMenuLabel>
              {(["High", "Medium", "Low"] as const).map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={influenceFilter.has(p)}
                  onCheckedChange={() => setInfluenceFilter((s) => toggleSet(s, p))}
                >{p}</DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setEditing(empty())}>
            <Plus className="h-4 w-4" /> Add Register
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <Table className="min-w-[1200px] [&_td]:align-middle [&_th]:align-middle [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Register ID</TableHead>
                <TableHead>Stakeholder</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Influence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.registerId}</TableCell>
                  <TableCell className="font-medium">{r.stakeholderName}</TableCell>
                  <TableCell>{r.company}</TableCell>
                  <TableCell className="text-slate-600">{r.role}</TableCell>
                  <TableCell className="text-slate-600">{r.email}</TableCell>
                  <TableCell className="text-slate-600">{r.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityClass[r.priority]}>{r.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={influenceClass[r.influenceLevel]}>{r.influenceLevel}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={r.status} onCheckedChange={() => toggleStatus(r)} />
                      <span className={r.status ? "text-emerald-700 text-xs font-medium" : "text-slate-500 text-xs"}>
                        {r.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(r.updatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => setViewing(r)}>
                          <Eye className="h-3.5 w-3.5 mr-2" /> View
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => setEditing(r)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => setDeleting(r)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2 text-red-600" /> <span className="text-red-600">Delete</span>
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-sm text-slate-500 py-10">
                    No stakeholders match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing && rows.some(r => r.id === editing.id) ? "Edit Register" : "Add Register"}</DialogTitle>
            <DialogDescription>Fill in the stakeholder details below.</DialogDescription>
          </DialogHeader>
          {editing && <RegisterForm value={editing} onChange={setEditing} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => editing && upsert(editing)} disabled={!editing?.stakeholderName}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View drawer */}
      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{viewing?.stakeholderName}</SheetTitle>
            <SheetDescription className="font-mono text-xs">{viewing?.registerId}</SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="mt-4 space-y-4 text-sm">
              <Field k="Company" v={viewing.company} />
              <Field k="Role" v={viewing.role} />
              <Field k="Department" v={viewing.department} />
              <Field k="Email" v={viewing.email} />
              <Field k="Phone" v={viewing.phone} />
              <div className="flex gap-2">
                <Badge variant="outline" className={priorityClass[viewing.priority]}>Priority: {viewing.priority}</Badge>
                <Badge variant="outline" className={influenceClass[viewing.influenceLevel]}>Influence: {viewing.influenceLevel}</Badge>
                <Badge variant="outline" className={viewing.status ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}>
                  {viewing.status ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Field k="Engagement Strategy" v={viewing.engagementStrategy} multiline />
              <Field k="Notes" v={viewing.notes} multiline />
              <div className="text-xs text-slate-500">Last updated {new Date(viewing.updatedAt).toLocaleString()}</div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this register?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <span className="font-semibold">{deleting?.stakeholderName}</span> from the register.
              You can re-add them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove(deleting)} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function Field({ k, v, multiline }: { k: string; v: string; multiline?: boolean }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{k}</div>
      <div className={multiline ? "text-slate-800 whitespace-pre-wrap" : "text-slate-800"}>{v || "—"}</div>
    </div>
  );
}

function RegisterForm({ value, onChange }: { value: Register; onChange: (r: Register) => void }) {
  const set = <K extends keyof Register>(k: K, v: Register[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      <div className="col-span-2 grid grid-cols-2 gap-4">
        <div>
          <Label>Stakeholder Name *</Label>
          <Input value={value.stakeholderName} onChange={(e) => set("stakeholderName", e.target.value)} />
        </div>
        <div>
          <Label>Company</Label>
          <Input value={value.company} onChange={(e) => set("company", e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Role</Label>
        <Input value={value.role} onChange={(e) => set("role", e.target.value)} />
      </div>
      <div>
        <Label>Department</Label>
        <Input value={value.department} onChange={(e) => set("department", e.target.value)} />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={value.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={value.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <div>
        <Label>Priority</Label>
        <Select value={value.priority} onValueChange={(v) => set("priority", v as Priority)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Influence Level</Label>
        <Select value={value.influenceLevel} onValueChange={(v) => set("influenceLevel", v as Influence)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Label>Engagement Strategy</Label>
        <Textarea rows={3} value={value.engagementStrategy} onChange={(e) => set("engagementStrategy", e.target.value)} />
      </div>
      <div className="col-span-2">
        <Label>Notes</Label>
        <Textarea rows={3} value={value.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
      <div className="col-span-2 flex items-center justify-between rounded-md border border-slate-200 p-3">
        <div>
          <div className="text-sm font-medium">Status</div>
          <div className="text-xs text-slate-500">Toggle whether this register is currently active.</div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={value.status} onCheckedChange={(v) => set("status", v)} />
          <span className={value.status ? "text-emerald-700 text-sm font-medium" : "text-slate-500 text-sm"}>
            {value.status ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}