import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Activity, Plus } from "lucide-react";
import { LoadingState, EmptyState } from "@/platform/components/States";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import { useAssumptionsContext } from "@/commercial/hooks/useAssumptionChangeSets";
import { useSensitivityExperiments, useCreateSensitivity, type PerturbationStrategy } from "@/commercial/hooks/useSensitivity";

const SCOPES = ["revenue", "pnl", "cash"] as const;

export default function CommercialSensitivity() {
  const { tenantId, hasPermission, isPlatformAdmin } = useCommercialAccess();
  const canCreate = isPlatformAdmin || hasPermission("commercial.sensitivity.create");
  const ctx = useAssumptionsContext(tenantId);
  const program = ctx.data?.program ?? null;
  const version = ctx.data?.draftVersion ?? null;
  const scenarios = ctx.data?.scenarios ?? [];
  const assumptions = ctx.data?.assumptions ?? [];
  const baseline = useMemo(() => scenarios.find((s) => s.is_baseline) ?? scenarios[0], [scenarios]);

  const list = useSensitivityExperiments(tenantId, program?.id ?? null);
  const create = useCreateSensitivity(tenantId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scenarioId, setScenarioId] = useState<string>("");
  const [assumptionCode, setAssumptionCode] = useState<string>("");
  const [scopes, setScopes] = useState<string[]>([...SCOPES]);
  const [strategy, setStrategy] = useState<PerturbationStrategy>("increment_list");
  const [increments, setIncrements] = useState("-0.10,-0.05,0.05,0.10");
  const [values, setValues] = useState("");

  const effectiveScenario = scenarioId || baseline?.id || "";
  const scenarioAssumptions = useMemo(() => {
    return assumptions.filter((a) => a.scenario_id === effectiveScenario && a.numeric_value !== null);
  }, [assumptions, effectiveScenario]);

  const submit = async () => {
    if (!program || !version || !effectiveScenario || !assumptionCode || !title.trim()) {
      toast({ title: "Title, scenario, and assumption are required", variant: "destructive" });
      return;
    }
    let config: Record<string, unknown> = {};
    if (strategy === "increment_list") {
      config = { increments: increments.split(",").map((s) => Number(s.trim())).filter((n) => isFinite(n)) };
    } else if (strategy === "value_list") {
      config = { values: values.split(",").map((s) => Number(s.trim())).filter((n) => isFinite(n)) };
    }
    try {
      await create.mutateAsync({
        program_id: program.id,
        model_version_id: version.id,
        baseline_scenario_id: effectiveScenario,
        assumption_code: assumptionCode,
        included_scopes: scopes,
        perturbation_strategy: strategy,
        perturbation_config: config,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      toast({ title: "Sensitivity experiment created" });
      setTitle(""); setDescription("");
    } catch (e) {
      toast({ title: "Create failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (ctx.isLoading) return <LoadingState label="Loading commercial context…" />;
  if (!program || !version) return <EmptyState title="No draft model version" description="Create a draft model version to run sensitivity analysis." />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Activity className="h-5 w-5" />Sensitivity Analysis</h1>
          <p className="text-sm text-muted-foreground">Perturb a single governed assumption to measure downstream impact across Revenue, P&amp;L, and Cash.</p>
        </div>
      </div>

      {canCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4" />New Experiment</CardTitle>
            <CardDescription>Perturbed values persist to an isolated sensitivity run and never mutate historical model runs.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Revenue Ramp ±10%" />
              </div>
              <div className="space-y-1.5">
                <Label>Baseline Scenario</Label>
                <Select value={effectiveScenario} onValueChange={setScenarioId}>
                  <SelectTrigger><SelectValue placeholder="Select scenario" /></SelectTrigger>
                  <SelectContent>
                    {scenarios.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Perturbed Assumption</Label>
                <Select value={assumptionCode} onValueChange={setAssumptionCode}>
                  <SelectTrigger><SelectValue placeholder="Select assumption" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {scenarioAssumptions.map((a) => (
                      <SelectItem key={a.assumption_code} value={a.assumption_code}>
                        {a.assumption_code} · {Number(a.numeric_value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Strategy</Label>
                <Select value={strategy} onValueChange={(v) => setStrategy(v as PerturbationStrategy)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increment_list">% Increments (list)</SelectItem>
                    <SelectItem value="value_list">Absolute Values (list)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {strategy === "increment_list" && (
              <div className="space-y-1.5">
                <Label>Increments (comma-separated, decimal)</Label>
                <Input value={increments} onChange={(e) => setIncrements(e.target.value)} placeholder="-0.10,-0.05,0.05,0.10" />
              </div>
            )}
            {strategy === "value_list" && (
              <div className="space-y-1.5">
                <Label>Values (comma-separated)</Label>
                <Input value={values} onChange={(e) => setValues(e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Included Scopes</Label>
              <div className="flex gap-4">
                {SCOPES.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={scopes.includes(s)} onCheckedChange={(c) => setScopes((prev) => c ? Array.from(new Set([...prev, s])) : prev.filter((x) => x !== s))} />
                    <span className="capitalize">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Button onClick={submit} disabled={create.isPending}>{create.isPending ? "Creating…" : "Create Experiment"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Experiments</CardTitle>
          <CardDescription>Draft experiments can be executed from the detail page.</CardDescription>
        </CardHeader>
        <CardContent>
          {list.isLoading ? <LoadingState /> : (list.data ?? []).length === 0 ? (
            <EmptyState title="No experiments" description="Create your first sensitivity experiment above." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Assumption</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(list.data ?? []).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell className="font-mono text-xs">{e.assumption_code}</TableCell>
                    <TableCell className="text-xs">{(e.included_scopes ?? []).join(", ")}</TableCell>
                    <TableCell>
                      <Badge variant={e.status === "completed" ? "default" : e.status === "failed" ? "destructive" : "secondary"}>{e.status}</Badge>
                      {e.stale_at_creation && <Badge variant="outline" className="ml-2">stale</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline"><Link to={`/commercial/model/sensitivity/${e.id}`}>Open</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!canCreate && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Read-only access</AlertTitle>
          <AlertDescription>You have view-only access. Contact a workspace admin to create sensitivity experiments.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
