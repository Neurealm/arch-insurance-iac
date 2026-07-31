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
import { AlertTriangle, GitCompareArrows, Plus } from "lucide-react";
import { LoadingState, EmptyState } from "@/platform/components/States";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import { useAssumptionsContext } from "@/commercial/hooks/useAssumptionChangeSets";
import { useComparisons, useCreateComparison, type ComparisonMode } from "@/commercial/hooks/useComparisons";

const SCOPES = ["revenue", "pnl", "cash"] as const;

export default function CommercialCompare() {
  const { tenantId, hasPermission, isPlatformAdmin } = useCommercialAccess();
  const canCreate = isPlatformAdmin || hasPermission("commercial.comparison.create");
  const ctx = useAssumptionsContext(tenantId);
  const program = ctx.data?.program ?? null;
  const version = ctx.data?.draftVersion ?? null;
  const scenarios = ctx.data?.scenarios ?? [];
  const list = useComparisons(tenantId, program?.id ?? null);
  const create = useCreateComparison(tenantId);

  const baseline = useMemo(() => scenarios.find((s) => s.is_baseline) ?? scenarios[0], [scenarios]);
  const [mode, setMode] = useState<ComparisonMode>("three_way");
  const [baseId, setBaseId] = useState<string | null>(null);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [scopes, setScopes] = useState<string[]>([...SCOPES]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const effectiveBase = baseId ?? baseline?.id ?? null;
  const effectiveCompared = useMemo(() => {
    if (comparedIds.length) return comparedIds;
    if (!effectiveBase) return [];
    return scenarios.filter((s) => s.id !== effectiveBase).map((s) => s.id);
  }, [comparedIds, scenarios, effectiveBase]);

  const submit = async () => {
    if (!program || !version || !effectiveBase) return;
    if (mode === "pairwise" && effectiveCompared.length !== 1) {
      toast({ title: "Pairwise requires exactly 1 compared scenario", variant: "destructive" });
      return;
    }
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    try {
      const id = await create.mutateAsync({
        program_id: program.id,
        model_version_id: version.id,
        mode,
        baseline_scenario_id: effectiveBase,
        compared_scenario_ids: effectiveCompared,
        included_scopes: scopes,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      toast({ title: "Draft comparison created" });
      window.location.assign(`/commercial/model/compare/${id}`);
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" });
    }
  };

  if (ctx.isLoading || list.isLoading) return <LoadingState />;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitCompareArrows className="h-6 w-6" /> Scenario Comparison
        </h1>
        <p className="text-muted-foreground text-sm">
          Compare persisted Revenue, P&L, and Cash outputs across validated scenarios. No formulas are recomputed.
        </p>
      </div>

      {!program || !version ? (
        <EmptyState title="Project Momentous not initialized" description="Model version unavailable." />
      ) : (
        <>
          <Card data-guide-target="comparison-context">
            <CardHeader>
              <CardTitle>Model context</CardTitle>
              <CardDescription>
                Program {program.name} · Model {version.version_code} · Status {version.status}
              </CardDescription>
            </CardHeader>
          </Card>

          {canCreate && (
            <Card data-guide-target="comparison-selector">
              <CardHeader>
                <CardTitle>New comparison</CardTitle>
                <CardDescription>Draft a comparison. Snapshots persist only on Save.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2" data-guide-target="comparison-scenarios">

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q3 Base vs Conservative review" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mode</Label>
                    <Select value={mode} onValueChange={(v) => setMode(v as ComparisonMode)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pairwise">Pairwise (baseline vs 1)</SelectItem>
                        <SelectItem value="three_way">Three-way (baseline vs 2)</SelectItem>
                        <SelectItem value="historical">Historical runs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Baseline scenario</Label>
                    <Select value={effectiveBase ?? undefined} onValueChange={setBaseId}>
                      <SelectTrigger><SelectValue placeholder="Select baseline" /></SelectTrigger>
                      <SelectContent>
                        {scenarios.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Compared scenarios</Label>
                    <div className="flex flex-wrap gap-3 rounded border p-3">
                      {scenarios.filter((s) => s.id !== effectiveBase).map((s) => {
                        const checked = effectiveCompared.includes(s.id);
                        return (
                          <label key={s.id} className="inline-flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                setComparedIds((prev) => {
                                  const base = prev.length ? prev : effectiveCompared;
                                  return v ? Array.from(new Set([...base, s.id])) : base.filter((x) => x !== s.id);
                                });
                              }}
                            />
                            {s.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="space-y-2" data-guide-target="comparison-scopes">
                  <Label>Scopes</Label>

                  <div className="flex flex-wrap gap-3">
                    {SCOPES.map((sc) => {
                      const checked = scopes.includes(sc);
                      return (
                        <label key={sc} className="inline-flex items-center gap-2 text-sm capitalize">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => setScopes((prev) => v ? Array.from(new Set([...prev, sc])) : prev.filter((x) => x !== sc))}
                          />
                          {sc}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2" data-guide-target="comparison-recommendation">
                  <Label>Rationale (optional)</Label>

                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
                </div>
                <Button onClick={submit} disabled={create.isPending}>
                  <Plus className="h-4 w-4 mr-1" /> Create draft
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Comparisons</CardTitle>
              <CardDescription>Draft, Saved, and Archived comparison snapshots.</CardDescription>
            </CardHeader>
            <CardContent>
              {(list.data ?? []).length === 0 ? (
                <EmptyState title="No comparisons yet" description="Create a draft comparison above." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Scenarios</TableHead>
                      <TableHead>Scopes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stale at save</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.data?.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell><Badge variant="outline">{c.mode}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{1 + c.compared_scenario_ids.length}</TableCell>
                        <TableCell className="text-xs">{c.included_scopes.join(", ")}</TableCell>
                        <TableCell><Badge>{c.status}</Badge></TableCell>
                        <TableCell>{c.stale_at_creation ? <Badge variant="destructive">Stale</Badge> : "—"}</TableCell>
                        <TableCell className="text-xs">{new Date(c.updated_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button asChild size="sm" variant="ghost">
                            <Link to={`/commercial/model/compare/${c.id}`}>Open</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Read-only comparison layer</AlertTitle>
            <AlertDescription>
              Comparisons never re-run the model. Stale scopes are shown as-is; refresh runs from Revenue, P&L, or Cash pages.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
