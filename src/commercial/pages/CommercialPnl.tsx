import { useMemo, useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { AlertTriangle, CheckCircle2, Info, Loader2, Play, Sigma } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import type { ModelResult, ModelRun } from "@/commercial/hooks/useRevenueRuns";
import { useCommercialPnlBundle, useTriggerPnlRun } from "@/commercial/hooks/usePnlRuns";
import { LoadingState } from "@/platform/components/States";
import { DirectionalBanner } from "@/commercial/components/DirectionalBanner";
import { AudioEnrichmentButton } from "@/platform/cae";

const FYS = ["FY2027", "FY2028", "FY2029", "FY2030", "FY2031"] as const;
const TOTAL_PERIOD = "FY2027-FY2031";

const COD_ROWS = [
  { code: "COD-01_POD_LEAD", label: "1. Account Pod Lead" },
  { code: "COD-02_CS_LEAD", label: "2. Customer Success / Adoption Lead" },
  { code: "COD-03_SA", label: "3. Citrix Solution Architect" },
  { code: "COD-04_HC_SME", label: "4. Healthcare Workflow SME" },
  { code: "COD-05_SVC_PRE", label: "5. Services Attach / Pre-Sales Lead" },
  { code: "COD-06_L1L2", label: "6. L1/L2 Support Resources" },
  { code: "COD-07_DATA", label: "7. Data / RevOps Analyst" },
  { code: "COD-08_PMO", label: "8. Program Manager / PMO" },
  { code: "COD-09_DEL_LEAD", label: "9. Delivery Lead — MS (base FTE)" },
  { code: "COD-09B_DEL_VAR", label: "9b. Delivery Resources — MS (variable)" },
  { code: "COD-10_TOOLS", label: "10. Third-Party Tools & Infrastructure" },
  { code: "COD-11_TRAVEL", label: "11. Travel & Customer Workshops" },
  { code: "COD-TOTAL", label: "TOTAL Cost of Delivery" },
];

const OPEX_ROWS = [
  { code: "OPEX-01_GM", label: "1. Executive Sponsor / Program GM" },
  { code: "OPEX-02_ALLIANCE", label: "2. Alliance Management" },
  { code: "OPEX-03_FIN", label: "3. Finance & Deal Operations" },
  { code: "OPEX-04_LEGAL", label: "4. Legal & Contracting" },
  { code: "OPEX-05_MKT", label: "5. Marketing / Customer Materials" },
  { code: "OPEX-06_TRAINING", label: "6. Training & Certification" },
  { code: "OPEX-07_TRAVEL", label: "7. Non-delivery Travel" },
  { code: "OPEX-08_GA", label: "8. G&A Allocation" },
  { code: "OPEX-09_TOOLS", label: "9. Internal Systems & Tooling" },
  { code: "OPEX-10_RECRUIT", label: "10. Recruiting / Hiring" },
  { code: "OPEX-TOTAL", label: "TOTAL Operating Expenses" },
];

const PL_ROWS = [
  { code: "PL-GROSS-PROFIT", label: "Gross Profit", fmt: "usd" as const },
  { code: "PL-GROSS-MARGIN-PCT", label: "Gross Margin %", fmt: "pct" as const },
  { code: "PL-EBITDA", label: "EBITDA", fmt: "usd" as const },
  { code: "PL-EBITDA-MARGIN-PCT", label: "EBITDA Margin %", fmt: "pct" as const },
];

const fmtUsd = (v: number | null) =>
  v == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const fmtPct = (v: number | null) =>
  v == null ? "—" : `${(v * 100).toFixed(1)}%`;
const fmtCount = (v: number | null) =>
  v == null ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(v);

function num(v: number | string | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
function findValue(results: ModelResult[], runId: string, code: string, fy: string): ModelResult | undefined {
  return results.find((r) => r.run_id === runId && r.metric_code === code && r.fiscal_period === fy);
}

export default function CommercialPnl() {
  const { tenantId, hasPermission, isPlatformAdmin } = useCommercialAccess();
  const canRun = isPlatformAdmin || hasPermission("commercial.model.run");

  const bundle = useCommercialPnlBundle(tenantId);
  const trigger = useTriggerPnlRun(tenantId);

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

  const revenuePrereq: ModelRun | undefined = useMemo(() => {
    if (!data || !("latestRevenueByScenario" in data) || !currentScenario) return undefined;
    return data.latestRevenueByScenario.get(currentScenario.id);
  }, [data, currentScenario]);

  if (!tenantId) {
    return (
      <Alert>
        <AlertTitle>Tenant required</AlertTitle>
        <AlertDescription>Select a workspace to view P&amp;L runs.</AlertDescription>
      </Alert>
    );
  }
  if (bundle.isLoading) return <LoadingState label="Loading P&L runs…" />;
  if (bundle.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load P&amp;L data</AlertTitle>
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

  const scenarioFailedRuns = data.runs.filter(
    (r) => currentScenario && r.scenario_id === currentScenario.id && r.model_version_id === activeVersion.id && r.status === "failed",
  );
  const latestFailed = scenarioFailedRuns[0];
  const latestFailedTs = latestFailed?.failed_at ? Date.parse(latestFailed.failed_at) : null;
  const currentCompletedTs = currentRun?.completed_at ? Date.parse(currentRun.completed_at) : null;
  const failureIsCurrent = !!latestFailed && (!currentCompletedTs || (latestFailedTs !== null && latestFailedTs > currentCompletedTs));

  const runNow = async () => {
    try {
      const res = await trigger.mutateAsync({
        program_id: data.program!.id,
        model_version_id: activeVersion.id,
      });
      const bad = res.runs.filter((r) => r.error);
      if (bad.length > 0) {
        toast({
          title: "P&L run completed with errors",
          description: bad.map((b) => `${b.scenario_id.slice(0, 8)}: ${b.error}`).join(" · "),
          variant: "destructive",
        });
      } else {
        const reused = res.runs.filter((r) => r.reused).length;
        toast({
          title: `P&L runs finished (${res.runs.length})`,
          description: `${res.runs.length - reused} new · ${reused} reused (idempotent).`,
        });
      }
    } catch (e) {
      toast({ title: "P&L run failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <DirectionalBanner />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model · P&amp;L scope</div>
          <h1 className="text-2xl font-semibold">Project Momentous — Cost, OPEX &amp; EBITDA</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Server-authoritative cost-of-delivery, operating-expense, gross-profit, and EBITDA
            calculations. Consumes the completed revenue run for the same scenario &amp; model version.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AudioEnrichmentButton
            callId="CAE.COMMERCIAL.EBITDA.001"
            placementId="CAE.PLACE.COMMERCIAL.PNL.EBITDA"
          />
          {!canRun && <Badge variant="secondary">View-only (missing commercial.model.run)</Badge>}
          <Button onClick={runNow} disabled={!canRun || trigger.isPending}>
            {trigger.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Play className="mr-1.5 h-4 w-4" />}
            Run P&amp;L (all scenarios)
          </Button>
        </div>
      </div>

      {failureIsCurrent && latestFailed && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Current P&amp;L run failed — {currentScenario?.name}</AlertTitle>
          <AlertDescription>
            <span className="font-mono text-xs">{latestFailed.error_code}</span>: {latestFailed.error_message}
          </AlertDescription>
        </Alert>
      )}

      {!failureIsCurrent && currentRun && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Completed — {currentScenario?.name}</AlertTitle>
          <AlertDescription className="text-xs">
            Run {currentRun.id.slice(0, 8)} · completed{" "}
            {currentRun.completed_at ? new Date(currentRun.completed_at).toLocaleString() : "—"} · input hash{" "}
            <span className="font-mono">{currentRun.input_hash.slice(0, 16)}…</span>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Run header</CardTitle>
            <CardDescription>Model version, scenario, upstream revenue run, hash, and timestamp.</CardDescription>
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
          <Field label="Upstream revenue run" value={revenuePrereq ? revenuePrereq.id.slice(0, 8) : "None"} sub={revenuePrereq?.input_hash ? revenuePrereq.input_hash.slice(0, 12) + "…" : "run revenue scope first"} />
          <Field label="P&L input hash" value={currentRun?.input_hash ? currentRun.input_hash.slice(0, 16) + "…" : "—"} sub={currentRun ? `scope=${currentRun.run_scope}` : ""} />
        </CardContent>
      </Card>

      {!revenuePrereq && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Revenue prerequisite missing</AlertTitle>
          <AlertDescription>
            Run the <b>Revenue</b> scope for this scenario &amp; model version before the P&amp;L engine can execute.
          </AlertDescription>
        </Alert>
      )}

      {!currentRun && revenuePrereq && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No completed P&amp;L run for this scenario</AlertTitle>
          <AlertDescription>Click <b>Run P&amp;L (all scenarios)</b> to compute cost, OPEX &amp; EBITDA.</AlertDescription>
        </Alert>
      )}

      {currentRun && (
        <>
          <MetricTable
            title="P&L summary — Gross Profit & EBITDA"
            description="Server-computed from the paired revenue run and this scenario's cost + OPEX inputs."
            rows={PL_ROWS.map((r) => ({ code: r.code, label: r.label, unit: r.fmt === "pct" ? "ratio" : "USD", fmt: r.fmt }))}
            results={data.results}
            run={currentRun}
            highlightCode="PL-EBITDA"
          />
          <MetricTable
            title="Cost of Delivery"
            description="Twelve delivery-cost lines; total is the sum used for Gross Profit."
            rows={COD_ROWS.map((r) => ({ ...r, unit: "USD", fmt: "usd" as const }))}
            results={data.results}
            run={currentRun}
            highlightCode="COD-TOTAL"
          />
          <MetricTable
            title="Operating Expenses"
            description="Ten OPEX categories including G&A allocation; total flows into EBITDA."
            rows={OPEX_ROWS.map((r) => ({ ...r, unit: "USD", fmt: "usd" as const }))}
            results={data.results}
            run={currentRun}
            highlightCode="OPEX-TOTAL"
          />
          <MetricTable
            title="Staffing memo"
            description="Total pod FTE per fiscal year (informational)."
            rows={[{ code: "POD-FTE", label: "Total Pod FTE", unit: "FTE", fmt: "count" as const }]}
            results={data.results}
            run={currentRun}
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
  title, description, rows, results, run, highlightCode,
}: {
  title: string;
  description: string;
  rows: Array<{ code: string; label: string; unit: string; fmt: "usd" | "pct" | "count" }>;
  results: ModelResult[];
  run: ModelRun;
  highlightCode?: string;
}) {
  const formatter = (fmt: "usd" | "pct" | "count") =>
    fmt === "usd" ? fmtUsd : fmt === "pct" ? fmtPct : fmtCount;

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
              <TableHead className="text-right">
                <span className="inline-flex items-center gap-1"><Sigma className="h-3.5 w-3.5" />5-yr</span>
              </TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const cells = FYS.map((fy) => findValue(results, run.id, r.code, fy));
              const total = findValue(results, run.id, r.code, TOTAL_PERIOD);
              const lineage = (cells[0]?.lineage_json ?? {}) as unknown;
              const isHighlight = highlightCode === r.code;
              const fmt = formatter(r.fmt);
              return (
                <TableRow key={r.code} className={isHighlight ? "font-semibold bg-muted/40" : ""}>
                  <TableCell>
                    <div className="font-medium">{r.label}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{r.code}</div>
                  </TableCell>
                  {cells.map((c, i) => (
                    <TableCell key={i} className="text-right font-mono text-sm">
                      {fmt(num(c?.value_numeric))}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-mono text-sm">
                    {r.fmt === "pct" ? fmt(num(total?.value_numeric)) : fmt(num(total?.value_numeric))}
                  </TableCell>
                  <TableCell>
                    {lineage && Object.keys(lineage as Record<string, unknown>).length > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Info className="h-3.5 w-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[380px] text-xs">
                          <div className="mb-1 font-semibold">{r.code} · lineage</div>
                          <pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed">
                            {JSON.stringify(lineage, null, 2)}
                          </pre>
                        </PopoverContent>
                      </Popover>
                    )}
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
