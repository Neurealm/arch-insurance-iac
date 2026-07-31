import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, ArrowLeft, Archive, Save, Play, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LoadingState, EmptyState } from "@/platform/components/States";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import { useAssumptionsContext } from "@/commercial/hooks/useAssumptionChangeSets";
import {
  useComparison,
  useCalculateComparison,
  useComparisonReadiness,
  useComparisonAssumptions,
  useSaveComparison,
  useArchiveComparison,
  type ComparisonResultRow,
  type CalculationRow,
} from "@/commercial/hooks/useComparisons";

function fmtNum(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (abs >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}
function fmtPct(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `${(n * 100).toFixed(1)}%`;
}
function directionIcon(dir: string) {
  if (dir === "favorable") return <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />;
  if (dir === "unfavorable") return <TrendingDown className="h-3.5 w-3.5 text-rose-600" />;
  if (dir === "neutral") return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function CommercialCompareDetail() {
  const { id } = useParams<{ id: string }>();
  const { tenantId, hasPermission, isPlatformAdmin } = useCommercialAccess();
  const canSave = isPlatformAdmin || hasPermission("commercial.comparison.save");
  const canArchive = isPlatformAdmin || hasPermission("commercial.comparison.archive");
  const ctx = useAssumptionsContext(tenantId);
  const scenarios = ctx.data?.scenarios ?? [];
  const scenarioName = (sid: string) => scenarios.find((s) => s.id === sid)?.name ?? sid.slice(0, 8);

  const detail = useComparison(tenantId, id ?? null);
  const readiness = useComparisonReadiness(tenantId, id ?? null);
  const isDraft = detail.data?.header?.status === "draft";
  const calc = useCalculateComparison(tenantId, isDraft ? id ?? null : null);
  const assumptions = useComparisonAssumptions(tenantId, id ?? null);

  const save = useSaveComparison(tenantId);
  const archive = useArchiveComparison(tenantId);
  const [saveOpen, setSaveOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const header = detail.data?.header;
  const savedRows = detail.data?.results ?? [];
  const rows: (ComparisonResultRow | CalculationRow)[] = isDraft ? (calc.data ?? []) : savedRows;

  const readinessRows = readiness.data ?? [];
  const anyStale = readinessRows.some((r) => r.is_stale);
  const anyMissing = readinessRows.some((r) => r.is_missing);

  const summary = useMemo(() => {
    const keys = ["PNL-REVENUE", "PNL-GROSS-PROFIT", "PNL-EBITDA", "PNL-EBITDA-MARGIN", "CASH-MAX-FUNDING", "CASH-PAYBACK"];
    const map: Record<string, (typeof rows)[number][]> = {};
    for (const r of rows) if (keys.includes(r.metric_code)) (map[r.metric_code] ??= []).push(r);
    return keys.map((k) => ({ code: k, rows: map[k] ?? [] }));
  }, [rows]);

  if (detail.isLoading || ctx.isLoading) return <LoadingState />;
  if (!header) return <EmptyState title="Comparison not found" />;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/commercial/model/compare"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
          </Button>
          <h1 className="text-2xl font-bold mt-2">{header.title}</h1>
          <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
            <Badge variant="outline">{header.mode}</Badge>
            <Badge>{header.status}</Badge>
            {header.stale_at_creation && <Badge variant="destructive">Stale at save</Badge>}
            <span>Baseline: {scenarioName(header.baseline_scenario_id)}</span>
            <span>vs {header.compared_scenario_ids.map(scenarioName).join(", ")}</span>
            <span>Scopes: {header.included_scopes.join(", ")}</span>
          </div>
          {header.description && <p className="text-sm text-muted-foreground mt-1">{header.description}</p>}
        </div>
        <div className="flex gap-2" data-guide-target="comparison-actions">
          {isDraft && canSave && (
            <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
              <DialogTrigger asChild>
                <Button><Save className="h-4 w-4 mr-1" /> Save snapshot</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save immutable comparison</DialogTitle>
                  <DialogDescription>
                    Persists the current calculation as an immutable snapshot. The source-run manifest and
                    content hash will be frozen. No model execution will occur.
                  </DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-1">
                  <div>Scenarios: {[header.baseline_scenario_id, ...header.compared_scenario_ids].map(scenarioName).join(", ")}</div>
                  <div>Scopes: {header.included_scopes.join(", ")}</div>
                  <div>Any scope stale: <strong>{anyStale ? "yes" : "no"}</strong></div>
                  <div>Any scope missing: <strong>{anyMissing ? "yes" : "no"}</strong></div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setSaveOpen(false)}>Cancel</Button>
                  <Button
                    onClick={async () => {
                      try {
                        await save.mutateAsync(header.id);
                        toast({ title: "Comparison saved" });
                        setSaveOpen(false);
                      } catch (e: any) {
                        toast({ title: "Save failed", description: e.message, variant: "destructive" });
                      }
                    }}
                    disabled={save.isPending}
                  >
                    Confirm save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {header.status === "saved" && canArchive && (
            <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Archive className="h-4 w-4 mr-1" />Archive</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Archive comparison</DialogTitle>
                  <DialogDescription>Archived comparisons remain readable but fully immutable.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setArchiveOpen(false)}>Cancel</Button>
                  <Button onClick={async () => {
                    try { await archive.mutateAsync(header.id); toast({ title: "Archived" }); setArchiveOpen(false); }
                    catch (e: any) { toast({ title: "Archive failed", description: e.message, variant: "destructive" }); }
                  }} disabled={archive.isPending}>Confirm archive</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card data-guide-target="comparison-readiness">

        <CardHeader><CardTitle>Readiness</CardTitle><CardDescription>Per scenario × scope, sourced from the staleness helper.</CardDescription></CardHeader>
        <CardContent>
          {readiness.isLoading ? <LoadingState /> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Scenario</TableHead><TableHead>Scope</TableHead>
                <TableHead>State</TableHead><TableHead>Latest run</TableHead>
                <TableHead>Latest apply</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {readinessRows.map((r) => (
                  <TableRow key={`${r.scenario_id}:${r.scope}`}>
                    <TableCell>{scenarioName(r.scenario_id)}</TableCell>
                    <TableCell className="capitalize">{r.scope}</TableCell>
                    <TableCell>
                      {r.is_missing ? <Badge variant="destructive">Missing</Badge> :
                        r.is_stale ? <Badge variant="destructive">Stale</Badge> : <Badge>Current</Badge>}
                    </TableCell>
                    <TableCell className="text-xs">{r.latest_completed_at ? new Date(r.latest_completed_at).toLocaleString() : "—"}</TableCell>
                    <TableCell className="text-xs">{r.latest_apply_at ? new Date(r.latest_apply_at).toLocaleString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {anyStale && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stale scopes selected</AlertTitle>
          <AlertDescription>
            One or more scopes are stale. Comparisons proceed using the last persisted runs; refresh from the
            Revenue, P&L, or Cash pages before saving if you want current results.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
        </TabsList>
        <TabsContent value="metrics">
          <Card data-guide-target="comparison-deltas">

            <CardHeader>
              <CardTitle>Variance rows</CardTitle>
              <CardDescription>
                {isDraft ? <>Live calculation from persisted results — <Play className="inline h-3 w-3" /> read-only.</> : "Immutable saved snapshot."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rows.length === 0 ? <EmptyState title="No overlapping metrics" /> : (
                <div className="overflow-auto max-h-[520px]">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Metric</TableHead><TableHead>Period</TableHead>
                      <TableHead>Compared vs</TableHead><TableHead>Baseline</TableHead>
                      <TableHead>Compared</TableHead><TableHead>Δ</TableHead>
                      <TableHead>Δ %</TableHead><TableHead>Direction</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {rows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-mono">{r.metric_code}</TableCell>
                          <TableCell className="text-xs">{r.fiscal_period ?? "—"}</TableCell>
                          <TableCell className="text-xs">{scenarioName(r.compared_scenario_id)}</TableCell>
                          <TableCell className="text-xs tabular-nums">{fmtNum(r.baseline_value)}</TableCell>
                          <TableCell className="text-xs tabular-nums">{fmtNum(r.compared_value)}</TableCell>
                          <TableCell className="text-xs tabular-nums">{fmtNum(r.absolute_variance)}</TableCell>
                          <TableCell className="text-xs tabular-nums">{fmtPct(r.percentage_variance)}</TableCell>
                          <TableCell><span className="inline-flex items-center gap-1 text-xs capitalize">{directionIcon(r.variance_direction)}{r.variance_direction}</span></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="summary">
          <Card>
            <CardHeader><CardTitle>Key metric roll-up</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {summary.map((g) => (
                <div key={g.code} className="rounded border p-3">
                  <div className="text-xs font-mono text-muted-foreground">{g.code}</div>
                  {g.rows.length === 0 ? <div className="text-xs">No rows</div> : g.rows.slice(0, 6).map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-0.5">
                      <span className="text-muted-foreground">{r.fiscal_period ?? "—"} · {scenarioName(r.compared_scenario_id)}</span>
                      <span className="tabular-nums flex items-center gap-1">{fmtPct(r.percentage_variance)} {directionIcon(r.variance_direction)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assumptions">
          <Card>
            <CardHeader><CardTitle>Effective assumption differences</CardTitle>
              <CardDescription>Applied values only — Draft and Cancelled proposals excluded.</CardDescription></CardHeader>
            <CardContent>
              {assumptions.isLoading ? <LoadingState /> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Code</TableHead><TableHead>Scenario</TableHead>
                    <TableHead>Value</TableHead><TableHead>Unit</TableHead>
                    <TableHead>Differs</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {(assumptions.data ?? []).map((a, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-mono">{a.assumption_code}</TableCell>
                        <TableCell className="text-xs">{scenarioName(a.scenario_id)}{a.is_baseline ? " (baseline)" : ""}</TableCell>
                        <TableCell className="text-xs tabular-nums">{a.numeric_value !== null ? fmtNum(a.numeric_value) : (a.text_value ?? "—")}</TableCell>
                        <TableCell className="text-xs">{a.unit ?? "—"}</TableCell>
                        <TableCell>{a.differs_from_baseline ? <Badge>Changed</Badge> : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle>Source-run manifest</CardTitle></CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">Manifest hash: <code>{header.source_run_manifest_hash ?? "—"}</code></div>
          <div className="text-xs text-muted-foreground">Content hash: <code>{header.content_hash ?? "—"}</code></div>
          <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-2 text-[10px]">{JSON.stringify(header.source_run_manifest, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
