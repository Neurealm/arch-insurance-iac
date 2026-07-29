import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, AlertTriangle } from "lucide-react";
import { MOCK_TODAY, type Milestone, type MilestoneStatus } from "@/data/programTimelineMockData";
import { daysBetween, formatDate } from "./dates";
import { statusBadgeClass, statusGlyph } from "./styles";
import { cn } from "@/lib/utils";

type SortKey = "index" | "name" | "owner" | "date" | "status";

interface Props {
  milestones: Milestone[];
  selectedId: string | null;
  onSelect: (m: Milestone) => void;
  onEdit: (m: Milestone) => void;
  onComplete: (m: Milestone) => void;
}

export function MilestoneTable({ milestones, selectedId, onSelect, onEdit, onComplete }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "index", dir: "asc" });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MilestoneStatus | "all">("all");

  const rows = useMemo(() => {
    const filtered = milestones.filter((m) => {
      const matchesSearch =
        !search ||
        `${m.name} ${m.description} ${m.owner}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || m.status === status;
      return matchesSearch && matchesStatus;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = sort.key === "index" ? a.index : String(a[sort.key]);
      const vb = sort.key === "index" ? b.index : String(b[sort.key]);
      return va < vb ? -dir : va > vb ? dir : 0;
    });
  }, [milestones, search, status, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search milestones"
          aria-label="Search milestones"
          className="h-9 max-w-xs"
        />
        <Select value={status} onValueChange={(v) => setStatus(v as MilestoneStatus | "all")}>
          <SelectTrigger className="h-9 w-[10rem]" aria-label="Filter milestones by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="On Track">On Track</SelectItem>
            <SelectItem value="Delayed">Delayed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{rows.length} milestones</span>
      </div>

      <div className="max-h-[26rem] overflow-auto rounded-lg border border-border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/60">
            <TableRow>
              <SortableHead label="#" onClick={() => toggleSort("index")} className="w-12" />
              <SortableHead label="Milestone" onClick={() => toggleSort("name")} />
              <TableHead>Description</TableHead>
              <SortableHead label="Owner" onClick={() => toggleSort("owner")} />
              <SortableHead label="Target Date" onClick={() => toggleSort("date")} />
              <SortableHead label="Status" onClick={() => toggleSort("status")} />
              <TableHead>Dependency</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m) => {
              const overdue = m.status !== "Completed" && daysBetween(MOCK_TODAY, m.date) < 0;
              return (
                <TableRow
                  key={m.id}
                  tabIndex={0}
                  onClick={() => onSelect(m)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(m);
                    }
                  }}
                  className={cn(
                    "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    selectedId === m.id && "bg-accent"
                  )}
                >
                  <TableCell className="tabular-nums text-muted-foreground">{m.index}</TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="max-w-xs text-muted-foreground">{m.description}</TableCell>
                  <TableCell>{m.owner}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      {formatDate(m.date)}
                      {overdue && (
                        <AlertTriangle className="h-3.5 w-3.5 text-tl-risk" aria-label="Past target date" />
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadgeClass(m.status)}>
                      <span aria-hidden="true" className="mr-1">
                        {statusGlyph(m.status)}
                      </span>
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[14rem] text-xs text-muted-foreground">{m.dependency}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => onEdit(m)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onComplete(m)}
                        disabled={m.status === "Completed"}
                      >
                        Complete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  No milestones match the current search or filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SortableHead({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 rounded-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Sort by ${label}`}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
      </button>
    </TableHead>
  );
}
