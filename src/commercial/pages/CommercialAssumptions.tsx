import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, ClipboardList, Plus, Search, ExternalLink } from "lucide-react";
import { LoadingState, EmptyState } from "@/platform/components/States";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import {
  useAssumptionsContext,
  useChangeSets,
  useCreateChangeSet,
  useUpsertChangeSetItem,
  useRunStaleness,
  classifyImpact,
  type EffectiveAssumption,
} from "@/commercial/hooks/useAssumptionChangeSets";

const IMPACT_COLORS: Record<string, string> = {
  revenue: "bg-emerald-500/10 text-emerald-700 border-emerald-500/40",
  pnl: "bg-blue-500/10 text-blue-700 border-blue-500/40",
  cash: "bg-purple-500/10 text-purple-700 border-purple-500/40",
  unknown: "bg-muted text-muted-foreground",
};

function ImpactBadges({ code }: { code: string }) {
  const scopes = classifyImpact(code);
  return (
    <div className="flex flex-wrap gap-1">
      {scopes.map((s) => (
        <Badge key={s} variant="outline" className={IMPACT_COLORS[s] ?? IMPACT_COLORS.unknown}>{s}</Badge>
      ))}
    </div>
  );
}

export default function CommercialAssumptions() {
  const { tenantId, hasPermission, isPlatformAdmin } = useCommercialAccess();
  const canCreate = isPlatformAdmin || hasPermission("commercial.assumption.change.create");
  const canValidate = isPlatformAdmin || hasPermission("commercial.assumption.change.validate");
  const canApply = isPlatformAdmin || hasPermission("commercial.assumption.change.apply");

  const ctx = useAssumptionsContext(tenantId);
  const sets = useChangeSets(tenantId, ctx.data?.program?.id ?? null);
  const staleness = useRunStaleness(ctx.data?.program?.id ?? null);

  const [scenarioId, setScenarioId] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [impactFilter, setImpactFilter] = useState<string>("ALL");
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, string>>({});
  const [rationale, setRationale] = useState<Record<string, string>>({});

  const createMut = useCreateChangeSet(tenantId);
  const upsertMut = useUpsertChangeSetItem(tenantId, selectedSet);

  const scenarios = ctx.data?.scenarios ?? [];
  const assumptions: EffectiveAssumption[] = ctx.data?.assumptions ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assumptions
      .filter((a) => scenarioId === "ALL" || a.scenario_id === scenarioId)
      .filter((a) => (impactFilter === "ALL" ? true : classifyImpact(a.assumption_code).includes(impactFilter)))
      .filter((a) => {
        if (!q) return true;
        return (
          a.assumption_code.toLowerCase().includes(q) ||
          (a.label ?? "").toLowerCase().includes(q)
        );
      });
  }, [assumptions, scenarioId, impactFilter, search]);

  const draftSet = useMemo(
    () => (selectedSet ? sets.data?.find((s) => s.id === selectedSet) ?? null : null),
    [sets.data, selectedSet]
  );

  if (ctx.isLoading) return <LoadingState label="Loading assumptions…" />;
  if (!ctx.data?.program) {
    return (
      <EmptyState
        title="Project Momentous not found in this workspace"
        description="Switch to the NeuGAIN Commercial tenant to access governed assumption editing."
      />
    );
  }
  const { program, draftVersion } = ctx.data;

  const staleScopes = new Set((staleness.data ?? []).filter((s) => s.is_stale).map((s) => s.run_scope));

  const applyProposedChange = async (a: EffectiveAssumption) => {
    if (!selectedSet) {
      toast({ title: "Pick a change set", description: "Create or select a Draft change set first.", variant: "destructive" });
      return;
    }
    if (draftSet && draftSet.status !== "draft") {
      toast({ title: "Change set is locked", description: `Status is ${draftSet.status}. Only Draft sets accept new items.`, variant: "destructive" });
      return;
    }
    const key = `${a.scenario_id}:${a.assumption_code}`;
    const raw = (pending[key] ?? "").trim();
    if (raw === "") {
      toast({ title: "Enter a proposed value", description: `Provide a numeric proposed value for ${a.assumption_code} before adding.`, variant: "destructive" });
      return;
    }
    const numeric = Number(raw);
    if (!Number.isFinite(numeric)) {
      toast({ title: "Invalid value", description: "Numeric value required.", variant: "destructive" });
      return;
    }
    if (a.numeric_value != null && numeric === a.numeric_value) {
      toast({
        title: "No change to stage",
        description: "Enter a proposed value different from the current effective value.",
        variant: "destructive",
      });
      return;
    }
    try {
      await upsertMut.mutateAsync({
        change_set_id: selectedSet,
        scenario_id: a.scenario_id,
        assumption_code: a.assumption_code,
        proposed_value_numeric: numeric,
        rationale: rationale[key]?.trim() ? rationale[key].trim() : null,
      });
      toast({ title: "Added to change set", description: `${a.assumption_code} staged as ${numeric}` });
      setPending((p) => {
        const { [key]: _drop, ...rest } = p;
        return rest;
      });
      setRationale((p) => {
        const { [key]: _drop, ...rest } = p;
        return rest;
      });
    } catch (e: any) {
      toast({ title: "Could not add change", description: e?.message ?? String(e), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-1" data-guide-target="assumptions-summary">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-foreground">Governed Assumption Editing</h1>
          {draftVersion?.status === "draft" && <Badge variant="outline">Draft model version · {draftVersion.version_code}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">
          Propose, validate, and apply controlled assumption changes to the Draft model version. Applying a change set updates future runs only —
          historical Revenue, P&L, and Cash runs remain immutable.
        </p>
      </header>

      {staleScopes.size > 0 && (
        <Alert data-guide-target="assumptions-staleness">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Model runs are stale</AlertTitle>
          <AlertDescription>
            Assumptions changed after the last completed run for: {Array.from(staleScopes).join(", ")}. Re-execute the affected scopes to refresh outputs.
          </AlertDescription>
        </Alert>
      )}

      {/* Change set panel */}
      <Card data-guide-target="change-sets-list">
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-base">Change sets</CardTitle>
              <CardDescription>Every change flows through a Draft → Validated → Applied lifecycle with full audit.</CardDescription>
            </div>
            <NewChangeSetDialog
              disabled={!canCreate || !draftVersion || draftVersion.status !== "draft"}
              onCreate={async (title, description) => {
                if (!draftVersion) return;
                const id = await createMut.mutateAsync({
                  program_id: program.id,
                  model_version_id: draftVersion.id,
                  title,
                  description,
                });
                setSelectedSet(id);
                toast({ title: "Draft change set created", description: title });
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted-foreground">Active draft:</label>
            <Select value={selectedSet ?? "NONE"} onValueChange={(v) => setSelectedSet(v === "NONE" ? null : v)}>
              <SelectTrigger className="w-[320px]"><SelectValue placeholder="Select a change set…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">— none —</SelectItem>
                {(sets.data ?? []).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title} · {s.status} · {s.change_count} items
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {draftSet && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/commercial/model/assumptions/change-sets/${draftSet.id}`}>
                  Open detail <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
          {draftSet && (
            <div className="text-xs text-muted-foreground">
              Status: <Badge variant="outline">{draftSet.status}</Badge> · Items: {draftSet.change_count} · Hash: {draftSet.content_hash ?? "—"}
            </div>
          )}
          {!canCreate && (
            <p className="text-xs text-muted-foreground">You do not have <code>commercial.assumption.change.create</code>. Contact an administrator.</p>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card data-guide-target="assumptions-register">
        <CardHeader>
          <CardTitle className="text-base">Browse effective assumptions</CardTitle>
          <CardDescription>Effective values resolve from <code>commercial_scenario_assumptions</code> — the same source consumed by the calculation runtime.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3" data-guide-target="assumptions-filters">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search code or label…" className="w-[260px]" />
            </div>
            <Select value={scenarioId} onValueChange={setScenarioId}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All scenarios</SelectItem>
                {scenarios.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={impactFilter} onValueChange={setImpactFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All impact scopes</SelectItem>
                <SelectItem value="revenue">Impacts Revenue</SelectItem>
                <SelectItem value="pnl">Impacts P&L</SelectItem>
                <SelectItem value="cash">Impacts Cash</SelectItem>
                <SelectItem value="unknown">Unknown impact</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{filtered.length} of {assumptions.length}</span>
          </div>
          <div className="overflow-auto max-h-[520px] border rounded-md" data-guide-target="assumptions-proposed-entry">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Effective</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Proposed</TableHead>
                  <TableHead>Rationale</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => {
                  const key = `${a.scenario_id}:${a.assumption_code}`;
                  const scen = scenarios.find((s) => s.id === a.scenario_id);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.assumption_code}</TableCell>
                      <TableCell className="text-xs">{scen?.code ?? "—"}</TableCell>
                      <TableCell className="text-sm">
                        {a.numeric_value != null ? a.numeric_value.toLocaleString() : (a.text_value ?? "—")}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.unit ?? "—"}</TableCell>
                      <TableCell><ImpactBadges code={a.assumption_code} /></TableCell>
                      <TableCell>
                        <Input
                          value={pending[key] ?? ""}
                          onChange={(e) => setPending((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder={a.numeric_value?.toString() ?? "value"}
                          className="h-8 w-[120px]"
                          disabled={!selectedSet || !canCreate || draftSet?.status !== "draft"}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={rationale[key] ?? ""}
                          onChange={(e) => setRationale((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder="optional"
                          className="h-8 w-[160px]"
                          disabled={!selectedSet || !canCreate || draftSet?.status !== "draft"}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => applyProposedChange(a)}
                          disabled={!selectedSet || !canCreate || draftSet?.status !== "draft" || upsertMut.isPending}
                        >
                          <Plus className="mr-1 h-3 w-3" /> Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground" data-guide-target="assumptions-permissions">
            Validation and application permissions: {canValidate ? "✓ validate" : "✗ validate"} · {canApply ? "✓ apply" : "✗ apply"}. Historical model runs
            are never mutated by an apply — new runs must be executed explicitly on the Revenue / P&L / Cash pages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function NewChangeSetDialog({
  disabled, onCreate,
}: {
  disabled: boolean;
  onCreate: (title: string, description: string | null) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}><Plus className="mr-1 h-4 w-4" /> New change set</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Draft change set</DialogTitle>
          <DialogDescription>Group related assumption changes under a single controlled change set for validation and apply.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Tighten Base ramp for FY2027" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Rationale / description</label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Why is this change proposed?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!title.trim() || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onCreate(title.trim(), desc.trim() || null);
                setOpen(false); setTitle(""); setDesc("");
              } finally { setBusy(false); }
            }}
          >
            Create Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
