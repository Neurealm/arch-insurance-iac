import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GovernanceMeeting, GovernanceRisk, GovernanceDecision } from "@/data/neurealmGovernanceMockData";
import { SectionHeading } from "./primitives";
import { TIER_SOFT } from "./styles";

export function GovernanceCalendar({
  meetings,
  onOpenMeeting,
}: {
  meetings: GovernanceMeeting[];
  onOpenMeeting: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [forum, setForum] = useState("all");
  const [tier, setTier] = useState("all");

  const forums = useMemo(() => Array.from(new Set(meetings.map((m) => m.forum))), [meetings]);

  const filtered = meetings.filter((m) => {
    if (forum !== "all" && m.forum !== forum) return false;
    if (tier !== "all" && String(m.tier) !== tier) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, GovernanceMeeting[]>>((acc, m) => {
    (acc[m.date] ||= []).push(m);
    return acc;
  }, {});

  return (
    <Card id="calendar" data-guide-target="governance-calendar">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="space-y-4">
          <SectionHeading
            title="Governance Calendar"
            subtitle="Chronological agenda of scheduled governance forums"
            actions={
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" aria-expanded={open}>
                  {open ? "Collapse" : "Expand"}
                  <ChevronDown className={cn("ml-1.5 h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
                </Button>
              </CollapsibleTrigger>
            }
          />
          <CollapsibleContent>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={forum} onValueChange={setForum}>
                <SelectTrigger className="w-[240px]" aria-label="Filter calendar by forum">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All forums</SelectItem>
                  {forums.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger className="w-[190px]" aria-label="Filter calendar by governance tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tiers</SelectItem>
                  <SelectItem value="1">Tier 1 — Executive</SelectItem>
                  <SelectItem value="2">Tier 2 — Program</SelectItem>
                  <SelectItem value="3">Tier 3 — Operational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {Object.keys(grouped).length === 0 ? (
              <p className="text-sm text-muted-foreground">No meetings match the current filters.</p>
            ) : (
              <ol className="space-y-3">
                {Object.entries(grouped).map(([date, items]) => (
                  <li key={date} className="grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)]">
                    <p className="pt-1 text-xs font-semibold text-muted-foreground">{date}</p>
                    <ul className="space-y-2">
                      {items.map((m) => (
                        <li key={m.id}>
                          <button
                            type="button"
                            onClick={() => onOpenMeeting(m.id)}
                            className="w-full rounded-md border border-border p-3 text-left transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{m.forum}</span>
                              <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium", TIER_SOFT[m.tier])}>
                                Tier {m.tier}
                              </span>
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              Chair: {m.chair} · {m.agenda.length} agenda items
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function GovernanceMeetingDialog({
  meeting,
  risks,
  decisions,
  onOpenChange,
  onReschedule,
  onAddAgendaItem,
}: {
  meeting: GovernanceMeeting | null;
  risks: GovernanceRisk[];
  decisions: GovernanceDecision[];
  onOpenChange: (v: boolean) => void;
  onReschedule: (id: string) => void;
  onAddAgendaItem: (id: string, item: string) => void;
}) {
  const [item, setItem] = useState("");
  if (!meeting) return null;

  const relatedRisks = risks.filter((r) => meeting.openRiskIds.includes(r.id));
  const relatedDecisions = decisions.filter((d) => meeting.openDecisionIds.includes(d.id));

  return (
    <Dialog open={!!meeting} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{meeting.forum}</DialogTitle>
          <DialogDescription>
            {meeting.date} · Chair: {meeting.chair}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Purpose</h3>
            <p className="mt-1">{meeting.purpose}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Participants</h3>
            <p className="mt-1">{meeting.participants}</p>
          </div>
          <List title="Agenda" items={meeting.agenda} />
          <List title="Open decisions" items={relatedDecisions.map((d) => `${d.status} — ${d.title}`)} />
          <List title="Open risks" items={relatedRisks.map((r) => `${r.severity} — ${r.title}`)} />
          <List title="Action items" items={meeting.actionItems} />

          <div className="space-y-1.5">
            <Label htmlFor="agenda-item">Add agenda item</Label>
            <div className="flex gap-2">
              <Input id="agenda-item" value={item} onChange={(e) => setItem(e.target.value)} />
              <Button
                variant="outline"
                disabled={!item.trim()}
                onClick={() => {
                  onAddAgendaItem(meeting.id, item.trim());
                  setItem("");
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onReschedule(meeting.id)}>Reschedule</Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-muted-foreground">None recorded.</p>
      ) : (
        <ul className="mt-1 list-inside list-disc">
          {items.map((i, idx) => (
            <li key={`${i}-${idx}`}>{i}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
