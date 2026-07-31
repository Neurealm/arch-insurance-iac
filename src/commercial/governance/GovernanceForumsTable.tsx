import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Search } from "lucide-react";
import type { GovernanceForum } from "@/data/neurealmGovernanceMockData";
import { StatusBadge, SectionHeading } from "./primitives";
import { TIER_SOFT } from "./styles";
import { cn } from "@/lib/utils";

type SortKey = "name" | "cadence" | "nextMeeting" | "openActions" | "status";

export function GovernanceForumsTable({
  forums,
  onOpenForum,
  onScheduleMeeting,
  onAddActionItem,
  statusFilterSeed,
}: {
  forums: GovernanceForum[];
  onOpenForum: (id: string) => void;
  onScheduleMeeting: (forum: GovernanceForum) => void;
  onAddActionItem: (forum: GovernanceForum) => void;
  statusFilterSeed?: string;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(statusFilterSeed ?? "all");
  const [cadence, setCadence] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("nextMeeting");
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = forums.filter((f) => {
      if (q && !`${f.name} ${f.purpose} ${f.chair} ${f.participants}`.toLowerCase().includes(q)) return false;
      if (status !== "all" && f.status !== status) return false;
      if (cadence !== "all" && f.cadence !== cadence) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (sortKey === "nextMeeting") {
        const d = new Date(a.nextMeeting).getTime() - new Date(b.nextMeeting).getTime();
        return sortAsc ? d : -d;
      }
      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [forums, search, status, cadence, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const SortButton = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(k)}
      className="inline-flex items-center gap-1 font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Sort by ${label}`}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
    </button>
  );

  return (
    <Card id="forums" data-guide-target="governance-forums">
      <CardHeader className="space-y-4">
        <SectionHeading
          title="Governance Forums"
          subtitle="Forums, cadence, chairs, and open actions across all three governance tiers"
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search forums"
              aria-label="Search governance forums"
              className="pl-8"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[190px]" aria-label="Filter forums by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="On Track">On Track</SelectItem>
              <SelectItem value="Attention Required">Attention Required</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cadence} onValueChange={setCadence}>
            <SelectTrigger className="w-[170px]" aria-label="Filter forums by cadence">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cadences</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Biweekly">Biweekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[520px] overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead scope="col"><SortButton label="Forum" k="name" /></TableHead>
                <TableHead scope="col">Purpose</TableHead>
                <TableHead scope="col">Participants</TableHead>
                <TableHead scope="col"><SortButton label="Cadence" k="cadence" /></TableHead>
                <TableHead scope="col"><SortButton label="Next Meeting" k="nextMeeting" /></TableHead>
                <TableHead scope="col">Chair</TableHead>
                <TableHead scope="col" className="text-right">
                  <SortButton label="Open Actions" k="openActions" />
                </TableHead>
                <TableHead scope="col"><SortButton label="Status" k="status" /></TableHead>
                <TableHead scope="col" className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    No forums match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((f) => (
                <TableRow key={f.id} className="align-top">
                  <TableCell className="min-w-[190px]">
                    <button
                      type="button"
                      onClick={() => onOpenForum(f.id)}
                      className="text-left text-sm font-medium text-foreground hover:text-gv-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {f.name}
                    </button>
                    <span
                      className={cn(
                        "mt-1 inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium",
                        TIER_SOFT[f.tier],
                      )}
                    >
                      Tier {f.tier}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[230px] text-xs text-muted-foreground">{f.purpose}</TableCell>
                  <TableCell className="min-w-[200px] text-xs text-muted-foreground">{f.participants}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{f.cadence}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{f.nextMeeting}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{f.chair}</TableCell>
                  <TableCell className="text-right text-xs font-semibold">{f.openActions}</TableCell>
                  <TableCell><StatusBadge status={f.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => onScheduleMeeting(f)}>
                        Schedule
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onAddActionItem(f)}>
                        Add action
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Showing {rows.length} of {forums.length} governance forums.
        </p>
      </CardContent>
    </Card>
  );
}

export function GovernanceForumDrawer({
  forum,
  open,
  onOpenChange,
  onSave,
}: {
  forum: GovernanceForum | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (id: string, patch: Partial<GovernanceForum>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState("");
  const [chair, setChair] = useState("");

  if (!forum) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) setEditing(false);
        onOpenChange(v);
      }}
    >
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{forum.name}</SheetTitle>
          <SheetDescription>{forum.purpose}</SheetDescription>
        </SheetHeader>
        <div className="mt-5 space-y-4 text-sm">
          <StatusBadge status={forum.status} />
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <Field label="Cadence" value={forum.cadence} />
            <Field label="Next meeting" value={forum.nextMeeting} />
            <Field label="Chair" value={forum.chair} />
            <Field label="Open actions" value={String(forum.openActions)} />
            <Field label="Governance tier" value={`Tier ${forum.tier}`} />
          </dl>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Participants</h3>
            <p className="mt-1 text-sm">{forum.participants}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Agenda</h3>
            <ul className="mt-1 list-inside list-disc text-sm">
              {forum.agenda.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          {forum.notes && !editing && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</h3>
              <p className="mt-1 whitespace-pre-line text-sm">{forum.notes}</p>
            </div>
          )}
          {editing ? (
            <div className="space-y-3 rounded-md border border-border p-3">
              <div className="space-y-1.5">
                <Label htmlFor="forum-chair">Chair</Label>
                <Input id="forum-chair" value={chair} onChange={(e) => setChair(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="forum-notes">Notes</Label>
                <Textarea id="forum-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onSave(forum.id, { chair, notes });
                    setEditing(false);
                  }}
                >
                  Save locally
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setChair(forum.chair);
                setNotes(forum.notes);
                setEditing(true);
              }}
            >
              Edit forum
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
