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
import { ArrowUpDown, Plus, Search } from "lucide-react";
import type { GovernanceDecision, HealthStatus } from "@/data/neurealmGovernanceMockData";
import { StatusBadge, SectionHeading } from "./primitives";

const TODAY = new Date("2026-06-17T00:00:00");

function isOverdue(dueDate: string, status: string) {
  if (status === "Approved") return false;
  const d = new Date(dueDate);
  return !Number.isNaN(d.getTime()) && d < TODAY;
}

export function GovernanceDecisionsTable({
  decisions,
  onOpenDecision,
  onApprove,
  onEscalate,
  onAdd,
  statusSeed,
}: {
  decisions: GovernanceDecision[];
  onOpenDecision: (id: string) => void;
  onApprove: (id: string) => void;
  onEscalate: (id: string) => void;
  onAdd: (d: Omit<GovernanceDecision, "id">) => void;
  statusSeed?: string;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(statusSeed ?? "all");
  const [owner, setOwner] = useState("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const owners = useMemo(() => Array.from(new Set(decisions.map((d) => d.owner))), [decisions]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = decisions.filter((d) => {
      if (q && !`${d.title} ${d.impact} ${d.forum} ${d.owner}`.toLowerCase().includes(q)) return false;
      if (status !== "all" && d.status !== status) return false;
      if (owner !== "all" && d.owner !== owner) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return sortAsc ? diff : -diff;
    });
  }, [decisions, search, status, owner, sortAsc]);

  return (
    <Card id="decisions">
      <CardHeader className="space-y-4">
        <SectionHeading
          title="Key Decisions"
          subtitle="Decision register with owners, forums, due dates, and impact"
          actions={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Add decision
            </Button>
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search decisions"
              aria-label="Search decisions"
              className="pl-8"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[190px]" aria-label="Filter decisions by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(["Planned", "In Progress", "Attention Required", "Approved", "Escalated"] as string[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={owner} onValueChange={setOwner}>
            <SelectTrigger className="w-[190px]" aria-label="Filter decisions by owner">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All owners</SelectItem>
              {owners.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead scope="col">Decision</TableHead>
                <TableHead scope="col">Decision Type</TableHead>
                <TableHead scope="col">Owner</TableHead>
                <TableHead scope="col">Governance Forum</TableHead>
                <TableHead scope="col">
                  <button
                    type="button"
                    onClick={() => setSortAsc((v) => !v)}
                    className="inline-flex items-center gap-1 font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Sort by due date"
                  >
                    Due Date
                    <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                  </button>
                </TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col">Impact</TableHead>
                <TableHead scope="col" className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    No decisions match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((d) => (
                <TableRow key={d.id} className="align-top">
                  <TableCell className="min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => onOpenDecision(d.id)}
                      className="text-left text-sm font-medium text-foreground hover:text-gv-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {d.title}
                    </button>
                  </TableCell>
                  <TableCell className="text-xs">{d.decisionType}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{d.owner}</TableCell>
                  <TableCell className="min-w-[170px] text-xs">{d.forum}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {d.dueDate}
                    {isOverdue(d.dueDate, d.status) && (
                      <span className="ml-1.5 rounded bg-gv-risk-soft px-1.5 py-0.5 text-[10px] font-semibold text-gv-risk">
                        Overdue
                      </span>
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell className="min-w-[220px] text-xs text-muted-foreground">{d.impact}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => onEscalate(d.id)}>Escalate</Button>
                      <Button size="sm" variant="outline" onClick={() => onApprove(d.id)} disabled={d.status === "Approved"}>
                        Approve
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AddDecisionDialog open={addOpen} onOpenChange={setAddOpen} onAdd={onAdd} />
    </Card>
  );
}

function AddDecisionDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (d: Omit<GovernanceDecision, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [decisionType, setDecisionType] = useState("Governance");
  const [owner, setOwner] = useState("PMO");
  const [forum, setForum] = useState("Program Management Office");
  const [dueDate, setDueDate] = useState("");
  const [impact, setImpact] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      decisionType,
      owner,
      forum,
      dueDate: dueDate.trim() || "To be confirmed",
      status: "Planned" as HealthStatus,
      impact: impact.trim() || "Impact to be assessed",
      rationale: "",
    });
    setTitle("");
    setDueDate("");
    setImpact("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add decision</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="dec-title">Decision</Label>
            <Input id="dec-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dec-type">Decision type</Label>
              <Input id="dec-type" value={decisionType} onChange={(e) => setDecisionType(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dec-owner">Owner</Label>
              <Input id="dec-owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dec-forum">Governance forum</Label>
            <Input id="dec-forum" value={forum} onChange={(e) => setForum(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dec-due">Due date</Label>
            <Input id="dec-due" value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="September 1, 2026" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dec-impact">Impact</Label>
            <Textarea id="dec-impact" value={impact} onChange={(e) => setImpact(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!title.trim()}>Add decision</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function GovernanceDecisionDrawer({
  decision,
  open,
  onOpenChange,
  onSave,
}: {
  decision: GovernanceDecision | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (id: string, patch: Partial<GovernanceDecision>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<HealthStatus>("Planned");
  const [dueDate, setDueDate] = useState("");
  const [rationale, setRationale] = useState("");
  const [owner, setOwner] = useState("");

  if (!decision) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) setEditing(false); onOpenChange(v); }}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{decision.title}</SheetTitle>
          <SheetDescription>
            {decision.decisionType} decision · {decision.forum}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-5 space-y-4 text-sm">
          <StatusBadge status={decision.status} />
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-muted-foreground">Owner</dt>
              <dd className="font-medium text-foreground">{decision.owner}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Due date</dt>
              <dd className="font-medium text-foreground">{decision.dueDate}</dd>
            </div>
          </dl>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Impact</h3>
            <p className="mt-1">{decision.impact}</p>
          </div>
          {decision.rationale && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rationale / outcome</h3>
              <p className="mt-1 whitespace-pre-line">{decision.rationale}</p>
            </div>
          )}

          {editing ? (
            <div className="space-y-3 rounded-md border border-border p-3">
              <div className="space-y-1.5">
                <Label htmlFor="dec-edit-status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as HealthStatus)}>
                  <SelectTrigger id="dec-edit-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Planned", "In Progress", "Attention Required", "Approved", "Escalated"] as HealthStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dec-edit-owner">Assign owner</Label>
                <Input id="dec-edit-owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dec-edit-due">Due date</Label>
                <Input id="dec-edit-due" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dec-edit-rationale">Rationale / recorded outcome</Label>
                <Textarea id="dec-edit-rationale" value={rationale} onChange={(e) => setRationale(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onSave(decision.id, { status, dueDate, rationale, owner });
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
                setStatus(decision.status);
                setDueDate(decision.dueDate);
                setRationale(decision.rationale);
                setOwner(decision.owner);
                setEditing(true);
              }}
            >
              Edit decision
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
