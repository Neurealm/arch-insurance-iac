import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, ArrowLeft, Play, Archive, RotateCcw } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingState, EmptyState } from "@/platform/components/States";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import { useAssumptionsContext } from "@/commercial/hooks/useAssumptionChangeSets";
import {
  useSensitivityExperiment,
  useExecuteSensitivity,
  useArchiveSensitivity,
  useResetSensitivityToDraft,
  expandPerturbations,
} from "@/commercial/hooks/useSensitivity";

function fmt(v: number | null | undefined, digits = 2) {
  if (v === null || v === undefined || !isFinite(Number(v))) return "—";
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: digits });
}

export default function CommercialSensitivityDetail() {
  const { id } = useParams<{ id: string }>();
  const { tenantId, hasPermission, isPlatformAdmin } = useCommercialAccess();
  const canExecute = isPlatformAdmin || hasPermission("commercial.sensitivity.execute");
  const canArchive = isPlatformAdmin || hasPermission("commercial.sensitivity.archive");

  const ctx = useAssumptionsContext(tenantId);
  const detail = useSensitivityExperiment(tenantId, id ?? null);
  const execute = useExecuteSensitivity(tenantId);
  const archive = useArchiveSensitivity(tenantId);
  const reset = useResetSensitivityToDraft(tenantId);
  const [executing, setExecuting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const exp = detail.data?.header ?? null;
  const perts = detail.data?.perturbations ?? [];
  const results = detail.data?.results ?? [];

  const baselineValue = useMemo(() => {
    if (!exp || !ctx.data) return null;
    const a = (ctx.data.assumptions ?? []).find(
      (x) => x.scenario_id === exp.baseline_scenario_id && x.assumption_code === exp.assumption_code,
    );
    return a?.numeric_value != null ? Number(a.numeric_value) : null;
  }, [exp, ctx.data]);

  const onExecute = async () => {
    if (!exp) return;
    const list = expandPerturbations(exp.perturbation_strategy, exp.perturbation_config ?? {}, baselineValue);
    if (list.length === 0) {
      toast({ title: "No valid perturbations", variant: "destructive" });
      return;
    }
    setExecuting(true);
    try {
      await execute.mutateAsync({ experiment_id: exp.id, perturbations: list });
      toast({ title: `Executed ${list.length} perturbations` });
    } catch (e) {
      toast({ title: "Execution failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setExecuting(false);
    }
  };

  const onArchive = async () => {
    if (!exp) return;
    try {
      await archive.mutateAsync(exp.id);
      toast({ title: "Archived" });
    } catch (e) {
      toast({ title: "Archive failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const onReset = async () => {
    if (!exp) return;
    try {
      await reset.mutateAsync({ experiment_id: exp.id, reason: "Recovery after failed sensitivity execution" });
      toast({ title: "Reset to Draft", description: "Failed-attempt perturbations cleared." });
      setResetOpen(false);
    } catch (e) {
      toast({ title: "Reset failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (detail.isLoading) return <LoadingState label="Loading experiment…" />;
  if (!exp) return <EmptyState title="Experiment not found" />;

  // Tornado: rank by absolute % delta magnitude per metric, grouped by fiscal period
  const tornadoRows = [...results]
    .filter((r) => r.percentage_delta !== null && isFinite(Number(r.percentage_delta)))
    .sort((a, b) => Math.abs(Number(b.percentage_delta)) - Math.abs(Number(a.percentage_delta)))
    .slice(0, 25);

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link to="/commercial/model/sensitivity"><ArrowLeft className="mr-1 h-4 w-4" />Back to experiments</Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{exp.title}</h1>
            {exp.description && <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>}
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <Badge variant={exp.status === "completed" ? "default" : exp.status === "failed" ? "destructive" : "secondary"}>{exp.status}</Badge>
              <Badge variant="outline" className="font-mono">{exp.assumption_code}</Badge>
              <Badge variant="outline">baseline: {fmt(baselineValue, 6)}</Badge>
              <Badge variant="outline">{(exp.included_scopes ?? []).join(", ")}</Badge>
              {exp.stale_at_creation && <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">stale baseline</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            {exp.status === "draft" && canExecute && (
              <Button onClick={onExecute} disabled={executing}><Play className="mr-1 h-4 w-4" />{executing ? "Executing…" : "Execute"}</Button>
            )}
            {exp.status === "failed" && canExecute && (
              <Button variant="destructive" onClick={() => setResetOpen(true)} disabled={reset.isPending}>
                <RotateCcw className="mr-1 h-4 w-4" />{reset.isPending ? "Resetting…" : "Reset to Draft"}
              </Button>
            )}
            {exp.status !== "archived" && canArchive && (
              <Button variant="outline" onClick={onArchive}><Archive className="mr-1 h-4 w-4" />Archive</Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset failed experiment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will return &ldquo;{exp.title}&rdquo; to Draft and clear {perts.length} failed-attempt
              perturbation{perts.length === 1 ? "" : "s"} so they can be regenerated on the next execution.
              No completed sensitivity results or financial model runs will be changed, and the original
              failure audit event is preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onReset}>Reset to Draft</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {exp.status === "failed" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{exp.error_code ?? "Execution failed"}</AlertTitle>
          <AlertDescription>{exp.error_message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="perturbations">
        <TabsList>
          <TabsTrigger value="perturbations">Perturbations</TabsTrigger>
          <TabsTrigger value="tornado">Tornado</TabsTrigger>
          <TabsTrigger value="results">All Results</TabsTrigger>
        </TabsList>

        <TabsContent value="perturbations">
          <Card>
            <CardHeader><CardTitle>Perturbations</CardTitle><CardDescription>{perts.length} perturbation(s)</CardDescription></CardHeader>
            <CardContent>
              {perts.length === 0 ? <p className="text-sm text-muted-foreground">No perturbations yet. Execute the experiment to generate them.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>#</TableHead><TableHead>Label</TableHead><TableHead>Value</TableHead>
                    <TableHead>Status</TableHead><TableHead>Fingerprint</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {perts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.perturbation_index}</TableCell>
                        <TableCell>{p.perturbation_label}</TableCell>
                        <TableCell className="font-mono text-xs">{fmt(p.perturbed_value, 6)}</TableCell>
                        <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[240px]">{p.runtime_fingerprint ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tornado">
          <Card>
            <CardHeader><CardTitle>Tornado (Top 25 by |Δ%|)</CardTitle><CardDescription>Ranked absolute impact of the perturbed assumption on downstream metrics.</CardDescription></CardHeader>
            <CardContent>
              {tornadoRows.length === 0 ? <p className="text-sm text-muted-foreground">No results yet.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Metric</TableHead><TableHead>Period</TableHead>
                    <TableHead className="text-right">Baseline</TableHead>
                    <TableHead className="text-right">Perturbed</TableHead>
                    <TableHead className="text-right">Δ</TableHead>
                    <TableHead className="text-right">Δ%</TableHead>
                    <TableHead>Direction</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {tornadoRows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.metric_code}</TableCell>
                        <TableCell className="text-xs">{r.fiscal_period ?? "—"}</TableCell>
                        <TableCell className="text-right">{fmt(r.baseline_value)}</TableCell>
                        <TableCell className="text-right">{fmt(r.perturbed_value)}</TableCell>
                        <TableCell className="text-right">{fmt(r.absolute_delta)}</TableCell>
                        <TableCell className="text-right">{r.percentage_delta === null ? "—" : `${(Number(r.percentage_delta) * 100).toFixed(2)}%`}</TableCell>
                        <TableCell><Badge variant="outline">{r.variance_direction}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader><CardTitle>All Results</CardTitle><CardDescription>{results.length} row(s)</CardDescription></CardHeader>
            <CardContent>
              {results.length === 0 ? <p className="text-sm text-muted-foreground">No results.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Scope</TableHead><TableHead>Metric</TableHead><TableHead>Period</TableHead>
                    <TableHead className="text-right">Baseline</TableHead>
                    <TableHead className="text-right">Perturbed</TableHead>
                    <TableHead className="text-right">Δ%</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {results.slice(0, 500).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs">{r.scope}</TableCell>
                        <TableCell className="font-mono text-xs">{r.metric_code}</TableCell>
                        <TableCell className="text-xs">{r.fiscal_period ?? "—"}</TableCell>
                        <TableCell className="text-right">{fmt(r.baseline_value)}</TableCell>
                        <TableCell className="text-right">{fmt(r.perturbed_value)}</TableCell>
                        <TableCell className="text-right">{r.percentage_delta === null ? "—" : `${(Number(r.percentage_delta) * 100).toFixed(2)}%`}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
