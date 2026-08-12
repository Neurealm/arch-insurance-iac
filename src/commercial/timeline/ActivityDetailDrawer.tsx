import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ALL_STATUSES,
  DEPENDENCIES,
  MILESTONES,
  type ActivityStatus,
  type TimelineActivity,
} from "@/data/programTimelineMockData";
import { formatDate } from "./dates";
import { statusBadgeClass, statusGlyph } from "./styles";
import { CheckCircle2, Pencil } from "lucide-react";

interface Props {
  activity: TimelineActivity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, patch: Partial<TimelineActivity>) => void;
  onComplete: (id: string) => void;
}

export function ActivityDetailDrawer({ activity, open, onOpenChange, onUpdate, onComplete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<TimelineActivity | null>(activity);

  useEffect(() => {
    setDraft(activity);
    setEditing(false);
  }, [activity]);

  if (!activity || !draft) return null;

  const upstream = DEPENDENCIES.filter((d) => d.toActivityId === activity.id);
  const downstream = DEPENDENCIES.filter((d) => d.fromActivityId === activity.id);
  const milestones = MILESTONES.filter((m) => activity.relatedMilestoneIds.includes(m.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>{activity.name}</SheetTitle>
          <SheetDescription>{activity.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">{activity.category}</Badge>
          <Badge variant="outline" className={statusBadgeClass(activity.status)}>
            <span aria-hidden="true" className="mr-1">
              {statusGlyph(activity.status)}
            </span>
            {activity.status}
          </Badge>
          {activity.criticalPath && <Badge variant="outline">Critical path</Badge>}
          {activity.customerOwned && <Badge variant="outline">Customer-owned</Badge>}
        </div>

        <div className="mt-5 space-y-4 text-sm">
          {editing ? (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Activity name</Label>
                <Input id="edit-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-owner">Owner</Label>
                <Input id="edit-owner" value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-start">Start</Label>
                  <Input id="edit-start" type="date" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-end">End</Label>
                  <Input id="edit-end" type="date" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-progress">Progress %</Label>
                  <Input
                    id="edit-progress"
                    type="number"
                    min={0}
                    max={100}
                    value={draft.progress}
                    onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(v) => setDraft({ ...draft, status: v as ActivityStatus })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea id="edit-notes" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onUpdate(activity.id, draft);
                    setEditing(false);
                  }}
                >
                  Save local changes
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setDraft(activity); setEditing(false); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Owner" value={activity.owner} />
              <Field label="Category" value={activity.category} />
              <Field label="Start date" value={formatDate(activity.start)} />
              <Field label="End date" value={formatDate(activity.end)} />
              <div className="col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Progress</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <Progress value={activity.progress} className="h-2" aria-label={`Progress ${activity.progress} percent`} />
                  <span className="text-xs tabular-nums">{activity.progress}%</span>
                </dd>
              </div>
            </dl>
          )}

          <Separator />

          <Section title="Dependencies">
            {upstream.length === 0 && downstream.length === 0 ? (
              <p className="text-muted-foreground">No modelled dependencies.</p>
            ) : (
              <ul className="list-disc space-y-1 pl-4">
                {upstream.map((d) => (
                  <li key={d.id}>Upstream: {d.label}</li>
                ))}
                {downstream.map((d) => (
                  <li key={d.id}>Downstream: {d.label}</li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Related milestones">
            {milestones.length === 0 ? (
              <p className="text-muted-foreground">None linked.</p>
            ) : (
              <ul className="list-disc space-y-1 pl-4">
                {milestones.map((m) => (
                  <li key={m.id}>
                    {m.name} — {formatDate(m.date)}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Customer obligations">
            {activity.customerObligations.length === 0 ? (
              <p className="text-muted-foreground">None recorded.</p>
            ) : (
              <ul className="list-disc space-y-1 pl-4">
                {activity.customerObligations.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Commercial implications">
            <p>{activity.commercialImplications}</p>
          </Section>

          <Section title="Notes">
            <p>{activity.notes}</p>
            <p className="mt-1 text-xs text-muted-foreground">Last update: {activity.lastUpdate}</p>
          </Section>

          <div className="flex flex-wrap gap-2 pb-6">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={editing}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </Button>
            <Button
              size="sm"
              onClick={() => onComplete(activity.id)}
              disabled={activity.status === "Completed"}
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Mark Complete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="text-sm">{children}</div>
    </section>
  );
}
