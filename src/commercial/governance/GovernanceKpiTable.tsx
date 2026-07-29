import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GovernanceKpi } from "@/data/neurealmGovernanceMockData";
import { StatusBadge, SectionHeading } from "./primitives";
import { TREND_CLASS, TREND_GLYPH } from "./styles";

function Sparkline({ values, label }: { values: number[]; label: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 60},${20 - ((v - min) / span) * 18}`)
    .join(" ");
  return (
    <svg width="60" height="20" viewBox="0 0 60 20" role="img" aria-label={`${label} trend sparkline`}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function GovernanceKpiTable({
  kpis,
  onUpdate,
  statusSeed,
}: {
  kpis: GovernanceKpi[];
  onUpdate: (id: string, patch: Partial<GovernanceKpi>) => void;
  statusSeed?: string;
}) {
  const [status, setStatus] = useState(statusSeed ?? "all");
  const [owner, setOwner] = useState("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [view, setView] = useState<"table" | "cards">("table");
  const [detail, setDetail] = useState<GovernanceKpi | null>(null);

  const owners = useMemo(() => Array.from(new Set(kpis.map((k) => k.owner))), [kpis]);

  const rows = useMemo(() => {
    const filtered = kpis.filter((k) => {
      if (status !== "all" && k.status !== status) return false;
      if (owner !== "all" && k.owner !== owner) return false;
      return true;
    });
    return [...filtered].sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );
  }, [kpis, status, owner, sortAsc]);

  return (
    <Card id="kpis">
      <CardHeader className="space-y-4">
        <SectionHeading
          title="Neurealm Governance KPIs"
          subtitle="Governance, service, and value metrics against agreed targets"
          actions={
            <Tabs value={view} onValueChange={(v) => setView(v as "table" | "cards")}>
              <TabsList>
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="cards">Summary cards</TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[190px]" aria-label="Filter KPIs by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {["On Track", "At Risk", "Attention Required", "In Progress"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={owner} onValueChange={setOwner}>
            <SelectTrigger className="w-[220px]" aria-label="Filter KPIs by owner">
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
        {view === "table" ? (
          <div className="max-h-[520px] overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead scope="col">
                    <button
                      type="button"
                      onClick={() => setSortAsc((v) => !v)}
                      className="inline-flex items-center gap-1 font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Sort by KPI name"
                    >
                      KPI
                      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </TableHead>
                  <TableHead scope="col">Target</TableHead>
                  <TableHead scope="col">Current</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Trend</TableHead>
                  <TableHead scope="col">Owner</TableHead>
                  <TableHead scope="col" className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="min-w-[190px]">
                      <button
                        type="button"
                        onClick={() => setDetail(k)}
                        className="text-left text-sm font-medium text-foreground hover:text-gv-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {k.name}
                      </button>
                      {k.updatedAt && (
                        <span className="block text-[10px] text-muted-foreground">Locally updated {k.updatedAt}</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{k.target}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs font-semibold">{k.current}</TableCell>
                    <TableCell><StatusBadge status={k.status} /></TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", TREND_CLASS[k.trend])}>
                        <span aria-hidden="true">{TREND_GLYPH[k.trend]}</span>
                        {k.trend}
                        <Sparkline values={k.history} label={k.name} />
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{k.owner}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setDetail(k)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setDetail(k)}
                className="rounded-lg border border-border p-3 text-left transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <p className="text-xs text-muted-foreground">{k.name}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{k.current}</p>
                <p className="text-xs text-muted-foreground">Target {k.target}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <StatusBadge status={k.status} />
                  <span className={cn("text-xs font-medium", TREND_CLASS[k.trend])}>
                    <span aria-hidden="true">{TREND_GLYPH[k.trend]}</span> {k.trend}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>

      <GovernanceKpiDetail kpi={detail} onOpenChange={(v) => !v && setDetail(null)} onUpdate={onUpdate} />
    </Card>
  );
}

export function GovernanceKpiDetail({
  kpi,
  onOpenChange,
  onUpdate,
}: {
  kpi: GovernanceKpi | null;
  onOpenChange: (v: boolean) => void;
  onUpdate: (id: string, patch: Partial<GovernanceKpi>) => void;
}) {
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [initialised, setInitialised] = useState<string | null>(null);

  if (!kpi) return null;
  if (initialised !== kpi.id) {
    setInitialised(kpi.id);
    setTarget(kpi.target);
    setCurrent(kpi.current);
  }

  return (
    <Dialog open={!!kpi} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{kpi.name}</DialogTitle>
          <DialogDescription>
            Owner {kpi.owner} · Trend {kpi.trend}
            {kpi.updatedAt ? ` · Locally updated ${kpi.updatedAt}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={kpi.status} />
            <span className={cn("inline-flex items-center gap-1.5 text-sm", TREND_CLASS[kpi.trend])}>
              <span aria-hidden="true">{TREND_GLYPH[kpi.trend]}</span>
              <Sparkline values={kpi.history} label={kpi.name} />
            </span>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Simulated history (last 6 periods)
            </h3>
            <ol className="mt-1 flex flex-wrap gap-2 text-xs">
              {kpi.history.map((h, i) => (
                <li key={`${h}-${i}`} className="rounded border border-border px-2 py-1">
                  P{i + 1}: {h}
                </li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="kpi-target">Target</Label>
              <Input id="kpi-target" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kpi-current">Current value</Label>
              <Input id="kpi-current" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onUpdate(kpi.id, { target, current });
              onOpenChange(false);
            }}
          >
            Save locally
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
