import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Landmark, Network, Wrench } from "lucide-react";
import { useState } from "react";
import type { GovernanceTier, GovernanceRisk, GovernanceDecision, HealthStatus } from "@/data/neurealmGovernanceMockData";
import { StatusBadge, SectionHeading } from "./primitives";
import { TIER_ACCENT, TIER_SOFT } from "./styles";

const TIER_ICON: Record<number, React.ComponentType<{ className?: string }>> = {
  1: Landmark,
  2: Network,
  3: Wrench,
};

/** Pyramid widths per tier — visual hierarchy without decoration. */
const TIER_WIDTH: Record<number, string> = {
  1: "w-[52%]",
  2: "w-[74%]",
  3: "w-full",
};

export function GovernanceTierCard({
  tier,
  selected,
  onSelect,
}: {
  tier: GovernanceTier;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = TIER_ICON[tier.tier];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        TIER_SOFT[tier.tier],
        selected && "ring-2 ring-gv-blue ring-offset-1",
      )}
    >
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md", TIER_ACCENT[tier.tier])}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{tier.name}</span>
        <span className="mt-1 block text-xs leading-snug text-muted-foreground">{tier.purpose}</span>
        <span className="mt-2 block text-xs font-medium text-foreground">
          Cadence: {tier.cadence} · Authority: {tier.decisionAuthority} · Open actions: {tier.openActions}
        </span>
      </span>
    </button>
  );
}

export function GovernanceOperatingModel({
  tiers,
  selectedTierId,
  onSelectTier,
}: {
  tiers: GovernanceTier[];
  selectedTierId: string | null;
  onSelectTier: (id: string) => void;
}) {
  return (
    <Card id="operating-model" data-guide-target="governance-tiers">
      <CardHeader>
        <SectionHeading
          title="Neurealm Governance Operating Model"
          subtitle="Three-tier governance structure enabling strategic direction, program control, and operational execution"
        />
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-2" aria-hidden="true">
          {tiers.map((t) => (
            <div
              key={t.id}
              className={cn(
                "grid place-items-center rounded-md px-3 py-4 text-center text-xs font-semibold",
                TIER_WIDTH[t.tier],
                TIER_ACCENT[t.tier],
              )}
            >
              {t.name}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {tiers.map((t) => (
            <GovernanceTierCard
              key={t.id}
              tier={t}
              selected={selectedTierId === t.id}
              onSelect={() => onSelectTier(t.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function GovernanceTierDrawer({
  tier,
  risks,
  decisions,
  open,
  onOpenChange,
  onSave,
}: {
  tier: GovernanceTier | null;
  risks: GovernanceRisk[];
  decisions: GovernanceDecision[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (id: string, patch: Partial<GovernanceTier>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftNotes, setDraftNotes] = useState("");
  const [draftStatus, setDraftStatus] = useState<HealthStatus>("On Track");

  if (!tier) return null;

  const relatedRisks = risks.filter((r) => tier.relatedRiskIds.includes(r.id));
  const relatedDecisions = decisions.filter((d) => tier.relatedDecisionIds.includes(d.id));

  const startEdit = () => {
    setDraftNotes(tier.notes);
    setDraftStatus(tier.status);
    setEditing(true);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) setEditing(false);
        onOpenChange(v);
      }}
    >
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{tier.name}</SheetTitle>
          <SheetDescription>{tier.purpose}</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={tier.status} />
            <span className="text-xs text-muted-foreground">
              Cadence: {tier.cadence} · Decision rights: {tier.decisionAuthority}
            </span>
          </div>

          <DrawerList title="Responsibilities" items={tier.responsibilities} />
          <DrawerList title="Participants" items={tier.participants} />

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Escalation path</h3>
            <p className="mt-1 text-sm text-foreground">{tier.escalationPath}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Open actions</h3>
            <p className="mt-1 text-sm text-foreground">{tier.openActions} open governance actions</p>
          </div>

          <DrawerList title="Related risks" items={relatedRisks.map((r) => `${r.severity} — ${r.title}`)} />
          <DrawerList title="Related decisions" items={relatedDecisions.map((d) => `${d.status} — ${d.title}`)} />

          {tier.notes && !editing && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</h3>
              <p className="mt-1 whitespace-pre-line text-sm text-foreground">{tier.notes}</p>
            </div>
          )}

          {editing ? (
            <div className="space-y-3 rounded-md border border-border p-3">
              <div className="space-y-1.5">
                <Label htmlFor="tier-status">Status</Label>
                <Select value={draftStatus} onValueChange={(v) => setDraftStatus(v as HealthStatus)}>
                  <SelectTrigger id="tier-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["On Track", "Attention Required", "At Risk"] as HealthStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tier-notes">Notes</Label>
                <Textarea
                  id="tier-notes"
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  placeholder="Add a governance note (local only)"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onSave(tier.id, { notes: draftNotes, status: draftStatus });
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
            <Button size="sm" variant="outline" onClick={startEdit}>
              Edit tier
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DrawerList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">None recorded.</p>
      ) : (
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-foreground">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
