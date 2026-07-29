import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailDrawer, SectionHeading, StaffStatusBadge, UtilizationBar, listOrDash } from "./primitives";
import { fte, type StaffingRole } from "@/data/staffingResourcesMockData";

type SortKey = keyof Pick<
  StaffingRole,
  "role" | "structure" | "day0" | "day1" | "day2" | "totalPlanned" | "filled" | "open" | "utilization" | "status"
>;

export interface RoleTotals {
  day0: number;
  day1: number;
  day2: number;
  totalPlanned: number;
  filled: number;
  open: number;
  utilization: number;
}

export function RoleStaffingTable({
  roles,
  totals,
  factor,
  search,
  onSearchChange,
  openOnly,
  onToggleOpenOnly,
  overallocatedOnly,
  onToggleOverallocated,
  onUpdateRole,
  onAddRole,
}: {
  roles: StaffingRole[];
  totals: RoleTotals;
  factor: number;
  search: string;
  onSearchChange: (v: string) => void;
  openOnly: boolean;
  onToggleOpenOnly: () => void;
  overallocatedOnly: boolean;
  onToggleOverallocated: () => void;
  onUpdateRole: (id: string, patch: Partial<StaffingRole>, message: string) => void;
  onAddRole: () => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("role");
  const [asc, setAsc] = useState(true);
  const [selected, setSelected] = useState<StaffingRole | null>(null);

  const sorted = useMemo(() => {
    const copy = [...roles];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return asc ? av - bv : bv - av;
      return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [roles, sortKey, asc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  const header = (key: SortKey, label: string, numeric = false) => (
    <TableHead
      aria-sort={sortKey === key ? (asc ? "ascending" : "descending") : "none"}
      className={cn("whitespace-nowrap", numeric && "text-right")}
    >
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className="inline-flex items-center gap-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {label}
        <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
      </button>
    </TableHead>
  );

  const n = (v: number) => fte(v * factor).toFixed(1);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <SectionHeading
          title="Role Staffing Plan"
          subtitle="Peak simultaneous demand, total planned resources, filled positions and open positions"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search roles"
                aria-label="Search roles"
                className="h-9 w-48"
              />
              <Button size="sm" variant={openOnly ? "secondary" : "outline"} aria-pressed={openOnly} onClick={onToggleOpenOnly}>
                Open roles only
              </Button>
              <Button
                size="sm"
                variant={overallocatedOnly ? "secondary" : "outline"}
                aria-pressed={overallocatedOnly}
                onClick={onToggleOverallocated}
              >
                Overallocated only
              </Button>
              <Button size="sm" onClick={onAddRole}>
                Add Role
              </Button>
            </div>
          }
        />
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div className="min-h-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                {header("role", "Role or Function")}
                {header("structure", "Operating Structure")}
                {header("day0", "Day 0 Peak", true)}
                {header("day1", "Day 1 Peak", true)}
                {header("day2", "Day 2 Peak", true)}
                {header("totalPlanned", "Total Planned", true)}
                {header("filled", "Filled", true)}
                {header("open", "Open", true)}
                <TableHead className="text-right">Shared</TableHead>
                <TableHead className="text-right">Contractor</TableHead>
                {header("utilization", "Peak Utilization")}
                {header("status", "Status")}
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r) => (
                <TableRow
                  key={r.id}
                  tabIndex={0}
                  onClick={() => setSelected(r)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setSelected(r);
                  }}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium text-foreground">{r.role}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{r.structure}</TableCell>
                  <TableCell className="text-right tabular-nums">{n(r.day0)}</TableCell>
                  <TableCell className="text-right tabular-nums">{n(r.day1)}</TableCell>
                  <TableCell className="text-right tabular-nums">{n(r.day2)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{n(r.totalPlanned)}</TableCell>
                  <TableCell className="text-right tabular-nums">{n(r.filled)}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.open}</TableCell>
                  <TableCell className="text-right tabular-nums">{n(r.shared)}</TableCell>
                  <TableCell className="text-right tabular-nums">{n(r.contractor)}</TableCell>
                  <TableCell>
                    <UtilizationBar value={r.utilization} label={r.role} />
                  </TableCell>
                  <TableCell>
                    <StaffStatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(r);
                      }}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} className="py-8 text-center text-sm text-muted-foreground">
                    No roles match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border bg-muted/40 px-4 py-3 text-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
            <span>Day 0 peak: <strong className="text-foreground tabular-nums">{n(totals.day0)}</strong></span>
            <span>Day 1 peak: <strong className="text-foreground tabular-nums">{n(totals.day1)}</strong></span>
            <span>Day 2 peak: <strong className="text-foreground tabular-nums">{n(totals.day2)}</strong></span>
            <span>Total planned: <strong className="text-foreground tabular-nums">{n(totals.totalPlanned)}</strong></span>
            <span>Filled: <strong className="text-foreground tabular-nums">{n(totals.filled)}</strong></span>
            <span>Open positions: <strong className="text-foreground tabular-nums">{totals.open}</strong></span>
            <span>Peak utilization: <strong className="text-foreground tabular-nums">{totals.utilization}%</strong></span>
          </div>
        </div>
      </CardContent>

      <DetailDrawer
        open={Boolean(selected)}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.role ?? ""}
        description={selected?.notes}
        fields={
          selected
            ? [
                { label: "Operating structure", value: selected.structure },
                { label: "Operating phase", value: `Day 0 ${n(selected.day0)} · Day 1 ${n(selected.day1)} · Day 2 ${n(selected.day2)}` },
                { label: "Planned FTEs", value: n(selected.totalPlanned) },
                { label: "Filled FTEs", value: n(selected.filled) },
                { label: "Open positions", value: String(selected.open) },
                { label: "Utilization", value: `${selected.utilization}%` },
                { label: "Skills", value: listOrDash(selected.skills) },
                { label: "Assignment model", value: selected.resourceType },
                { label: "Location model", value: selected.locationModel },
                { label: "Start date", value: selected.startDate },
                { label: "End date", value: selected.endDate },
                { label: "Owner", value: selected.owner },
                { label: "Dependencies", value: listOrDash(selected.dependencies) },
                { label: "Risks", value: listOrDash(selected.risks) },
                { label: "Status", value: <StaffStatusBadge status={selected.status} /> },
              ]
            : []
        }
        footer={
          selected && (
            <>
              <Button
                size="sm"
                onClick={() =>
                  onUpdateRole(
                    selected.id,
                    { utilization: Math.max(50, selected.utilization - 5) },
                    `${selected.role} utilization adjusted locally.`,
                  )
                }
              >
                Edit Plan
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onUpdateRole(
                    selected.id,
                    { filled: selected.filled + 1, open: Math.max(0, selected.open - 1) },
                    `Resource assigned to ${selected.role} locally.`,
                  )
                }
              >
                Assign Resource
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={selected.open === 0}
                onClick={() =>
                  onUpdateRole(
                    selected.id,
                    { open: Math.max(0, selected.open - 1), status: "On Track" },
                    `Position marked filled for ${selected.role}.`,
                  )
                }
              >
                Mark Position Filled
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast.success("Local note saved.")}>
                Save Locally
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                Cancel
              </Button>
            </>
          )
        }
      />
    </Card>
  );
}
