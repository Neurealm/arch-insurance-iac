import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DetailDrawer, StaffStatusBadge } from "./primitives";
import type { CriticalRole } from "@/data/staffingResourcesMockData";

export function CriticalRoleCoverage({
  roles,
  onUpdate,
}: {
  roles: CriticalRole[];
  onUpdate: (id: string, patch: Partial<CriticalRole>, message: string) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<CriticalRole | null>(null);

  const filtered = roles.filter((r) => filter === "all" || r.status === filter);
  const visible = showAll ? filtered : filtered.slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Critical Role Coverage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-9" aria-label="Filter critical roles by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Filled">Filled</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Backfill Required">Backfill Required</SelectItem>
          </SelectContent>
        </Select>

        <ul className="space-y-1.5">
          {visible.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setSelected(r)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="min-w-0 truncate text-foreground">
                  {r.name}
                  {r.status !== "Filled" && (
                    <span className="ml-1.5 text-xs text-gv-warning">due {r.dueDate}</span>
                  )}
                </span>
                <StaffStatusBadge status={r.status} />
              </button>
            </li>
          ))}
        </ul>

        <Button variant="link" className="h-auto p-0 text-sm" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Show fewer critical roles" : "View all critical roles"}
        </Button>

        <DetailDrawer
          open={Boolean(selected)}
          onOpenChange={(o) => !o && setSelected(null)}
          title={selected?.name ?? ""}
          description={selected?.notes}
          fields={
            selected
              ? [
                  { label: "Status", value: <StaffStatusBadge status={selected.status} /> },
                  { label: "Owner", value: selected.owner },
                  { label: "Operating phase", value: selected.phase.toUpperCase() },
                  { label: "Required by", value: selected.dueDate },
                  { label: "Notes", value: selected.notes },
                ]
              : []
          }
          footer={
            selected && (
              <>
                <Button
                  size="sm"
                  onClick={() => onUpdate(selected.id, {}, `Candidate assigned to ${selected.name} locally.`)}
                >
                  Assign Candidate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={selected.status === "Filled"}
                  onClick={() =>
                    onUpdate(selected.id, { status: "Filled", dueDate: "Filled" }, `${selected.name} marked filled locally.`)
                  }
                >
                  Mark Filled
                </Button>
              </>
            )
          }
        />
      </CardContent>
    </Card>
  );
}
