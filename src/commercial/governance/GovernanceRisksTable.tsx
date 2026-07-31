import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import type { GovernanceRisk, HealthStatus } from "@/data/neurealmGovernanceMockData";
import { StatusBadge, SeverityBadge, SectionHeading } from "./primitives";

const TODAY = new Date("2026-06-17T00:00:00");

function isOverdue(dueDate: string, status: string) {
  if (status === "Closed") return false;
  const d = new Date(dueDate);
  return !Number.isNaN(d.getTime()) && d < TODAY;
}

export function GovernanceRisksTable({
  risks,
  onOpenRisk,
  onAddRisk,
  onCloseRisk,
  onEscalateRisk,
  severitySeed,
}: {
  risks: GovernanceRisk[];
  onOpenRisk: (id: string) => void;
  onAddRisk: (risk: Omit<GovernanceRisk, "id" | "notes">) => void;
  onCloseRisk: (id: string) => void;
  onEscalateRisk: (id: string) => void;
  severitySeed?: string;
}) {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState(severitySeed ?? "all");
  const [owner, setOwner] = useState("all");
  const [status, setStatus] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const owners = useMemo(() => Array.from(new Set(risks.map((r) => r.owner))), [risks]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return risks.filter((r) => {
      if (q && !`${r.title} ${r.impact} ${r.mitigation} ${r.owner}`.toLowerCase().includes(q)) return false;
      if (severity !== "all" && r.severity !== severity) return false;
      if (owner !== "all" && r.owner !== owner) return false;
      if (status !== "all" && r.status !== status) return false;
      return true;
    });
  }, [risks, search, severity, owner, status]);

  const counts = useMemo(
    () => ({
      High: risks.filter((r) => r.severity === "High" && r.status !== "Closed").length,
      Medium: risks.filter((r) => r.severity === "Medium" && r.status !== "Closed").length,
      Low: risks.filter((r) => r.severity === "Low" && r.status !== "Closed").length,
    }),
    [risks],
  );

  return (
    <Card id="risks" data-guide-target="governance-risks">
      <CardHeader className="space-y-4">
        <SectionHeading
          title="Top Risks and Issues"
          subtitle={`Open by severity — ${counts.High} High, ${counts.Medium} Medium, ${counts.Low} Low`}
          actions={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Add risk
            </Button>
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search risks and issues"
              aria-label="Search risks and issues"
              className="pl-8"
            />
          </div>
          <FilterSelect label="severity" value={severity} onChange={setSeverity} options={["High", "Medium", "Low"]} allLabel="All severities" />
          <FilterSelect label="owner" value={owner} onChange={setOwner} options={owners} allLabel="All owners" />
          <FilterSelect
            label="status"
            value={status}
            onChange={setStatus}
            options={["Open", "Monitoring", "In Progress", "Escalated", "Closed"]}
            allLabel="All statuses"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead scope="col">Risk or Issue</TableHead>
                <TableHead scope="col">Type</TableHead>
                <TableHead scope="col">Severity</TableHead>
                <TableHead scope="col">Owner</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col">Impact</TableHead>
                <TableHead scope="col">Mitigation</TableHead>
                <TableHead scope="col">Due Date</TableHead>
                <TableHead scope="col" className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    No risks or issues match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => {
                const overdue = isOverdue(r.dueDate, r.status);
                return (
                  <TableRow key={r.id} className="align-top">
                    <TableCell className="min-w-[220px]">
                      <button
                        type="button"
                        onClick={() => onOpenRisk(r.id)}
                        className="text-left text-sm font-medium text-foreground hover:text-gv-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {r.title}
                      </button>
                    </TableCell>
                    <TableCell className="text-xs">{r.type}</TableCell>
                    <TableCell><SeverityBadge severity={r.severity} /></TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{r.owner}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="min-w-[190px] text-xs text-muted-foreground">{r.impact}</TableCell>
                    <TableCell className="min-w-[190px] text-xs text-muted-foreground">{r.mitigation}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      {r.dueDate}
                      {overdue && (
                        <span className="ml-1.5 rounded bg-gv-risk-soft px-1.5 py-0.5 text-[10px] font-semibold text-gv-risk">
                          Overdue
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => onEscalateRisk(r.id)}>
                          Escalate
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onCloseRisk(r.id)} disabled={r.status === "Closed"}>
                          Close
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AddRiskDialog open={addOpen} onOpenChange={setAddOpen} onAdd={onAddRisk} owners={owners} />
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  allLabel: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[170px]" aria-label={`Filter by ${label}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function AddRiskDialog({
  open,
  onOpenChange,
  onAdd,
  owners,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (risk: Omit<GovernanceRisk, "id" | "notes">) => void;
  owners: string[];
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"Risk" | "Issue">("Risk");
  const [severity, setSeverity] = useState<"High" | "Medium" | "Low">("Medium");
  const [owner, setOwner] = useState(owners[0] ?? "PMO");
  const [impact, setImpact] = useState("");
  const [mitigation, setMitigation] = useState("");
  const [dueDate, setDueDate] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      type,
      severity,
      owner,
      status: "Open" as HealthStatus,
      impact: impact.trim() || "Impact to be assessed",
      mitigation: mitigation.trim() || "Mitigation to be defined",
      dueDate: dueDate.trim() || "To be confirmed",
    });
    setTitle("");
    setImpact("");
    setMitigation("");
    setDueDate("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add risk or issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="risk-title">Title</Label>
            <Input id="risk-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="risk-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "Risk" | "Issue")}>
                <SelectTrigger id="risk-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Risk">Risk</SelectItem>
                  <SelectItem value="Issue">Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="risk-severity">Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as "High" | "Medium" | "Low")}>
                <SelectTrigger id="risk-severity"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="risk-owner">Owner</Label>
              <Input id="risk-owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="risk-impact">Impact</Label>
            <Textarea id="risk-impact" value={impact} onChange={(e) => setImpact(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="risk-mitigation">Mitigation</Label>
            <Textarea id="risk-mitigation" value={mitigation} onChange={(e) => setMitigation(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="risk-due">Due date</Label>
            <Input id="risk-due" value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="August 30, 2026" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!title.trim()}>Add risk</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function GovernanceRiskDrawer({
  risk,
  open,
  onOpenChange,
  onSave,
  onAddNote,
}: {
  risk: GovernanceRisk | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (id: string, patch: Partial<GovernanceRisk>) => void;
  onAddNote: (id: string, note: string) => void;
}) {
  const [note, setNote] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState<HealthStatus>("Open");
  const [mitigation, setMitigation] = useState("");
  const [editing, setEditing] = useState(false);

  if (!risk) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) setEditing(false); onOpenChange(v); }}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{risk.title}</SheetTitle>
          <SheetDescription>
            {risk.type} · Owner {risk.owner} · Due {risk.dueDate}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-5 space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <SeverityBadge severity={risk.severity} />
            <StatusBadge status={risk.status} />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Impact</h3>
            <p className="mt-1">{risk.impact}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mitigation</h3>
            <p className="mt-1">{risk.mitigation}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</h3>
            {risk.notes.length === 0 ? (
              <p className="mt-1 text-muted-foreground">No notes recorded.</p>
            ) : (
              <ul className="mt-1 list-inside list-disc">
                {risk.notes.map((n, i) => (
                  <li key={`${n}-${i}`}>{n}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="risk-note">Add mitigation note</Label>
            <Textarea id="risk-note" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button
              size="sm"
              variant="outline"
              disabled={!note.trim()}
              onClick={() => {
                onAddNote(risk.id, note.trim());
                setNote("");
              }}
            >
              Add note
            </Button>
          </div>

          {editing ? (
            <div className="space-y-3 rounded-md border border-border p-3">
              <div className="space-y-1.5">
                <Label htmlFor="risk-edit-owner">Assign owner</Label>
                <Input id="risk-edit-owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="risk-edit-status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as HealthStatus)}>
                  <SelectTrigger id="risk-edit-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Open", "Monitoring", "In Progress", "Escalated", "Closed"] as HealthStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="risk-edit-mitigation">Mitigation</Label>
                <Textarea id="risk-edit-mitigation" value={mitigation} onChange={(e) => setMitigation(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onSave(risk.id, { owner, status, mitigation });
                    setEditing(false);
                  }}
                >
                  Save locally
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setOwner(risk.owner);
                setStatus(risk.status);
                setMitigation(risk.mitigation);
                setEditing(true);
              }}
            >
              Edit risk
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
