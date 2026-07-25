import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AlertTriangle, CheckCircle2, Info, Loader2, Play, Sigma } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import {
  useCommercialRevenueBundle,
  useTriggerRevenueRun,
  type ModelResult,
  type ModelRun,
} from "@/commercial/hooks/useRevenueRuns";
import { LoadingState } from "@/platform/components/States";
import { DirectionalBanner } from "@/commercial/components/DirectionalBanner";

const FYS = ["FY2027", "FY2028", "FY2029", "FY2030", "FY2031"] as const;
const TOTAL_PERIOD = "FY2027-FY2031";

const VOLUME_ROWS: Array<{ code: string; label: string; unit: "accounts" }> = [
  { code: "VOL-CUM-ACT", label: "Cumulative activated accounts", unit: "accounts" },
  { code: "VOL-NEW-ACT", label: "New accounts activated", unit: "accounts" },
  { code: "VOL-CONV-REBATE", label: "Accounts generating license rebate", unit: "accounts" },
  { code: "VOL-CONV-EXPAND", label: "Accounts generating expansion / growth", unit: "accounts" },
  { code: "VOL-CONV-MS", label: "Accounts buying managed services", unit: "accounts" },
];

const REV_BASE_ROWS = [
  { code: "REV-ACT-ARR", label: "Activated ARR base" },
  { code: "REV-INCR-ARR", label: "In-year incremental ARR" },
  { code: "REV-NEW-ACT-ARR", label: "New-account ARR" },
  { code: "REV-EAR-INFLUENCED", label: "EAR renewal pool influenced" },
];

const REV_STREAM_ROWS = [
  { code: "REV-01-BASE-REB", label: "1. Enhanced base / influenced renewal rebate" },
  { code: "REV-02-MKT-REB", label: "2. Marketplace / transacted rebate" },
  { code: "REV-03-NFLEX-REB", label: "3. Non-Flex expansion rebate" },
  { code: "REV-04-FLEX-REB", label: "4. Flex expansion / migration uplift rebate" },
  { code: "REV-05-GROWTH-ACCEL", label: "5. Strategic growth accelerator" },
  { code: "REV-06-GROWTH-SHARE", label: "6. Growth-share (Model 2)" },
  { code: "REV-07-ACT-FUND", label: "7. Activation Fund" },
  { code: "REV-08-MDF", label: "8. MDF / co-sell funding" },
  { code: "REV-09-SUP-READ", label: "9. Support Readiness Fund / retainer" },
  { code: "REV-10-MS", label: "10. Managed-services revenue (services)" },
  { code: "REV-11-PS", label: "11. Professional-services revenue (services)" },
  { code: "REV-TOTAL", label: "TOTAL Neurealm revenue" },
];

const fmtUsd = (v: number | null) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(v);

const fmtCount = (v: number | null) =>
  v == null ? "—" : new Intl.NumberFormat("en-US").format(v);

function num(v: number | string | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function findValue(results: ModelResult[], runId: string, code: string, fy: string): ModelResult | undefined {
  return results.find(
    (r) => r.run_id === runId && r.metric_code === code && r.fiscal_period === fy,
  );
}

export default function CommercialRevenue() {
  const { tenantId, hasPermission, isPlatformAdmin } = useCommercialAccess();
  const canRun = isPlatformAdmin || hasPermission("commercial.model.run");

  const bundle = useCommercialRevenueBundle(tenantId);
  const trigger = useTriggerRevenueRun(tenantId);

  const [scenarioCode, setScenarioCode] = useState<string>("BASE");

  const data = bundle.data;
  const activeVersion = useMemo(() => {
    const versions = data && "versions" in data ? data.versions : [];
    return versions.find((v) => v.status === "active") ?? versions[0];
  }, [data]);

  const currentScenario = useMemo(() => {
    const scenarios = data && "scenarios" in data ? data.scenarios : [];
    return scenarios.find((s) => s.code === scenarioCode) ?? scenarios[0];
  }, [data, scenarioCode]);

  const currentRun: ModelRun | undefined = useMemo(() => {
    if (!data || !("latestByScenario" in data) || !currentScenario) return undefined;
    return data.latestByScenario.get(currentScenario.id);
  }, [data, currentScenario]);

  if (!tenantId) {
    return (
      <Alert>
        <AlertTitle>Tenant required</AlertTitle>
        <AlertDescription>Select a workspace to view revenue model runs.</AlertDescription>
      </Alert>
    );
  }
  if (bundle.isLoading) return <LoadingState label="Loading revenue runs…" />;
  if (bundle.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load revenue data</AlertTitle>
        <AlertDescription>{(bundle.error as Error).message}</AlertDescription>
      </Alert>
    );
  }
  if (!data?.program) {
    return (
      <Alert>
        <AlertTitle>No program</AlertTitle>
        <AlertDescription>Project Momentous has not been bootstrapped in this workspace.</AlertDescription>
      </Alert>
    );
  }
  if (!activeVersion) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No model version</AlertTitle>
        <AlertDescription>No registered model version. Seed the model foundation before running.</AlertDescription>
      </Alert>
    );
  }

  const staleVersion = activeVersion.status !== "active";
  const failedRun = data.runs.find((r) => r.status === "failed");

  const runNow = async () => {
    try {
      const res = await trigger.mutateAsync({
        program_id: data.program!.id,
        model_version_id: activeVersion.id,
      });
      const bad = res.runs.filter((r) => r.error);
      if (bad.length > 0) {
        toast({
          title: "Run completed with errors",
          description: bad.map((b) => `${b.scenario_id.slice(0, 8)}: ${b.error}`).join(" · "),
          variant: "destructive",
        });
      } else {
        const reused = res.runs.filter((r) => r.reused).length;
        toast({
          title: `Revenue runs finished (${res.runs.length})`,
          description: `${res.runs.length - reused} new · ${reused} reused (idempotent).`,
        });
      }
    } catch (e) {
      toast({
        title: "Run failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <DirectionalBanner />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model · Revenue scope</div>
          <h1 className="text-2xl font-semibold">Project Momentous — Revenue Engine</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Server-authoritative volume-driver and revenue calculations. Cost of delivery, OPEX,
            EBITDA, cash, and sensitivity are not implemented in this package.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!canRun && <Badge variant="secondary">View-only (missing commercial.model.run)</Badge>}
          <Button onClick={runNow} disabled={!canRun || trigger.isPending}>
            {trigger.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Play className="mr-1.5 h-4 w-4" />}
            Run all scenarios
          </Button>
        </div>
      </div>

      {staleVersion && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stale model version</AlertTitle>
          <AlertDescription>
            No active model version — showing the most recent draft ({activeVersion.version_code}).
            Runs will use this draft.
          </AlertDescription>
        </Alert>
      )}
      {failedRun && (
        <Alert variant="destructive">
          <AlertTitle>A previous run failed</AlertTitle>
          <AlertDescription>
            {failedRun.error_code}: {failedRun.error_message}
          </AlertDescription>
        </Alert>
      )}

      {/* Run header */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Run header</CardTitle>
            <CardDescription>Model version, scenario, hash, and timestamp for the displayed results.</CardDescription>
          </div>
          <div className="w-64">
            <Select value={scenarioCode} onValueChange={setScenarioCode}>
              <SelectTrigger><SelectValue placeholder="Scenario" /></SelectTrigger>
              <SelectContent>
                {data.scenarios.map((s) => (
                  <SelectItem key={s.id} value={s.code}>
                    {s.name}
                    {s.is_baseline ? " ★" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <Field label="Model version" value={activeVersion.version_code} sub={`catalog ${activeVersion.formula_catalog_version} · ${activeVersion.status}`} />
          <Field label="Scenario" value={currentScenario?.name ?? "—"} sub={currentScenario?.code ?? ""} />
          <Field label="Last completed run" value={currentRun?.completed_at ? new Date(currentRun.completed_at).toLocaleString() : "No completed run"} sub={currentRun?.id.slice(0, 8) ?? ""} />
          <Field label="Input hash" value={currentRun?.input_hash ? currentRun.input_hash.slice(0, 16) + "…" : "—"} sub={currentRun ? `scope=${currentRun.run_scope}` : ""} />
        </CardContent>
      </Card>

      {!currentRun && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No completed run for this scenario</AlertTitle>
          <AlertDescription>Click <b>Run all scenarios</b> to compute revenue outputs.</AlertDescription>
        </Alert>
      )}

      {currentRun && (
        <>
          <MetricTable
            title="Volume drivers"
            description="Account-count outputs (integer-rounded per workbook)."
            rows={VOLUME_ROWS.map((r) => ({ ...r, unit: r.unit }))}
            results={data.results}
            run={currentRun}
            format={fmtCount}
          />
          <MetricTable
            title="Revenue base"
            description="Intermediate ARR figures used by the revenue-stream formulas."
            rows={REV_BASE_ROWS.map((r) => ({ ...r, unit: "USD" as const }))}
            results={data.results}
            run={currentRun}
            format={fmtUsd}
          />
          <MetricTable
            title="Revenue streams"
            description="Eleven Neurealm revenue lines plus the total. Services revenue is kept separate from license economics per BP3.0 rule 10."
            rows={REV_STREAM_ROWS.map((r) => ({ ...r, unit: "USD" as const }))}
            results={data.results}
            run={currentRun}
            format={fmtUsd}
            highlightCode="REV-TOTAL"
          />
        </>
      )}
    </div>
  );
}

function Field({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-sm">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function MetricTable({
  title,
  description,
  rows,
  results,
  run,
  format,
  highlightCode,
}: {
  title: string;
  description: string;
  rows: Array<{ code: string; label: string; unit: string }>;
  results: ModelResult[];
  run: ModelRun;
  format: (v: number | null) => string;
  highlightCode?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              {FYS.map((fy) => (
                <TableHead key={fy} className="text-right">{fy}</TableHead>
              ))}
              <TableHead className="text-right"><span className="inline-flex items-center gap-1"><Sigma className="h-3.5 w-3.5" />5-yr</span></TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const cells = FYS.map((fy) => findValue(results, run.id, r.code, fy));
              const total = findValue(results, run.id, r.code, TOTAL_PERIOD);
              const lineage = (cells[0]?.lineage_json ?? {}) as unknown;
              const isHighlight = highlightCode === r.code;
              return (
                <TableRow key={r.code} className={isHighlight ? "font-semibold bg-muted/40" : ""}>
                  <TableCell>
                    <div className="font-medium">{r.label}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{r.code}</div>
                  </TableCell>
                  {cells.map((c, i) => (
                    <TableCell key={i} className="text-right font-mono text-xs">
                      {format(num(c?.value_numeric ?? null))}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-mono text-xs">
                    {total ? format(num(total.value_numeric)) : "—"}
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Formula lineage">
                          <Info className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 text-xs">
                        <div className="font-semibold mb-1">Formula lineage — {r.code}</div>
                        <pre className="whitespace-pre-wrap break-all font-mono text-[11px]">
                          {JSON.stringify(lineage, null, 2)}
                        </pre>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
