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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertTriangle, CheckCircle2, Info, Loader2, Play, Sigma } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import type { ModelResult, ModelRun } from "@/commercial/hooks/useRevenueRuns";
import { useCommercialCashBundle, useTriggerCashRun } from "@/commercial/hooks/useCashRuns";
import { LoadingState } from "@/platform/components/States";
import { DirectionalBanner } from "@/commercial/components/DirectionalBanner";

const FYS = ["FY2027", "FY2028", "FY2029", "FY2030", "FY2031"] as const;
const QTRS = ["FY2027-Q1", "FY2027-Q2", "FY2027-Q3", "FY2027-Q4"] as const;
const TOTAL_PERIOD = "FY2027-FY2031";

const QTR_ROWS = [
  { code: "CASH-ACCRUED-REV", label: "Accrued Revenue" },
  { code: "CASH-COLLECTED", label: "Cash Collected" },
  { code: "CASH-COSTS-PAID", label: "Cash Costs Paid" },
  { code: "CASH-NCF-QTR", label: "Quarterly Net Cash Flow" },
  { code: "CASH-CUM-NCF-QTR", label: "Cumulative NCF (Quarterly)" },
];

const ANN_ROWS = [
  { code: "CASH-NCF-ANNUAL", label: "Annual Net Cash (proxy = EBITDA)", fmt: "usd" as const },
  { code: "CASH-CUM-ANNUAL", label: "Cumulative Cash", fmt: "usd" as const },
  { code: "CASH-CONVERSION", label: "Cash Conversion", fmt: "pct" as const },
  { code: "WC-REQUIREMENT", label: "Working Capital Requirement", fmt: "usd" as const },
];

const fmtUsd = (v: number | null) =>
  v == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const fmtPct = (v: number | null) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);

function num(v: number | string | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
function findValue(results: ModelResult[], runId: string, code: string, period: string) {
  return results.find((r) => r.run_id === runId && r.metric_code === code && r.fiscal_period === period);
}
function findScenarioFlag(results: ModelResult[], runId: string, code: string) {
  return results.find((r) => r.run_id === runId && r.metric_code === code && r.fiscal_period === "SCENARIO");
}

function negativeClass(v: number | null) {
  return v != null && v < 0 ? "text-red-600" : "";
}

export default function CommercialCash() {
  const { tenantId, hasPermission, isPlatformAdmin } = useCommercialAccess();
  const canRun = isPlatformAdmin || hasPermission("commercial.model.run");
  const bundle = useCommercialCashBundle(tenantId);
  const trigger = useTriggerCashRun(tenantId);

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

  const pnlPrereq: ModelRun | undefined = useMemo(() => {
    if (!data || !("latestPnlByScenario" in data) || !currentScenario) return undefined;
    return data.latestPnlByScenario.get(currentScenario.id);
  }, [data, currentScenario]);

  if (!tenantId) {
    return (
      <Alert>
        <AlertTitle>Tenant required</AlertTitle>
        <AlertDescription>Select a workspace to view cash runs.</AlertDescription>
      </Alert>
    );
  }
  if (bundle.isLoading) return <LoadingState label="Loading cash runs…" />;
  if (bundle.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load cash data</AlertTitle>
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
          title: "Cash run completed with errors",
          description: bad.map((b) => `${b.scenario_id.slice(0, 8)}: ${b.error}`).join(" · "),
          variant: "destructive",
        });
      } else {
        const reused = res.runs.filter((r) => r.reused).length;
        toast({
          title: `Cash runs finished (${res.runs.length})`,
          description: `${res.runs.length - reused} new · ${reused} reused (idempotent).`,
        });
      }
    } catch (e) {
      toast({ title: "Cash run failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const beEbitdaFy = currentRun ? findScenarioFlag(data.results, currentRun.id, "BE-EBITDA-YEAR")?.value_text : null;
  const beCashFy = currentRun ? findScenarioFlag(data.results, currentRun.id, "BE-CASH-YEAR")?.value_text : null;
  const beStatus = currentRun ? findScenarioFlag(data.results, currentRun.id, "BE-STATUS")?.value_text : null;
  const paybackFy = currentRun ? findScenarioFlag(data.results, currentRun.id, "PB-YEAR")?.value_text : null;
  const paybackMonths = currentRun ? num(findScenarioFlag(data.results, currentRun.id, "PB-MONTHS")?.value_numeric) : null;
  const susStatus = currentRun ? findScenarioFlag(data.results, currentRun.id, "SUS-STATUS")?.value_text : null;
  const modelHealth = currentRun ? findScenarioFlag(data.results, currentRun.id, "SUS-MODEL-HEALTH")?.value_text : null;
  const negYears = currentRun ? num(findScenarioFlag(data.results, currentRun.id, "SUS-NEG-YEARS")?.value_numeric) : null;
  const fundingNeed = currentRun ? num(findScenarioFlag(data.results, currentRun.id, "SUS-FUNDING-DEPENDENCY")?.value_numeric) : null;
  const peakTrough = currentRun ? num(findValue(data.results, currentRun.id, "WC-PEAK-TROUGH-Y1", "FY2027")?.value_numeric) : null;
  const maxFunding = currentRun ? num(findValue(data.results, currentRun.id, "WC-MAX-FUNDING", "FY2027")?.value_numeric) : null;

  return (
    <div className="space-y-6">
      <DirectionalBanner />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model · Cash & Sustainability</div>
          <h1 className="text-2xl font-semibold">Project Momentous — Cash Flow, Working Capital, Break-even & Sustainability</h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Server-authoritative cash engine. Consumes the completed P&amp;L run for the same
            scenario &amp; model version; does not recompute Revenue, COD, OPEX, or EBITDA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!canRun && <Badge variant="secondary">View-only (missing commercial.model.run)</Badge>}
          <Button onClick={runNow} disabled={!canRun || trigger.isPending}>
            {trigger.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Play className="mr-1.5 h-4 w-4" />}
            Run Cash (all scenarios)
          </Button>
        </div>
      </div>

      {failureIsCurrent && latestFailed && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Current cash run failed — {currentScenario?.name}</AlertTitle>
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
            <CardDescription>Model version, scenario, upstream P&amp;L run, hash, and timestamp.</CardDescription>
          </div>
          <div className="w-64">
            <Select value={scenarioCode} onValueChange={setScenarioCode}>
              <SelectTrigger><SelectValue placeholder="Scenario" /></SelectTrigger>
              <SelectContent>
                {data.scenarios.map((s) => (
                  <SelectItem key={s.id} value={s.code}>{s.name}{s.is_baseline ? " ★" : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <Field label="Model version" value={activeVersion.version_code} sub={`catalog ${activeVersion.formula_catalog_version} · ${activeVersion.status}`} />
          <Field label="Scenario" value={currentScenario?.name ?? "—"} sub={currentScenario?.code ?? ""} />
          <Field label="Upstream P&L run" value={pnlPrereq ? pnlPrereq.id.slice(0, 8) : "None"} sub={pnlPrereq?.input_hash ? pnlPrereq.input_hash.slice(0, 12) + "…" : "run P&L scope first"} />
          <Field label="Cash input hash" value={currentRun?.input_hash ? currentRun.input_hash.slice(0, 16) + "…" : "—"} sub={currentRun ? `scope=${currentRun.run_scope}` : ""} />
        </CardContent>
      </Card>

      {!pnlPrereq && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>P&amp;L prerequisite missing</AlertTitle>
          <AlertDescription>Run the <b>P&amp;L</b> scope for this scenario &amp; model version before the cash engine can execute.</AlertDescription>
        </Alert>
      )}

      {!currentRun && pnlPrereq && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No completed cash run for this scenario</AlertTitle>
          <AlertDescription>Click <b>Run Cash (all scenarios)</b> to compute cash, working capital, break-even, and sustainability.</AlertDescription>
        </Alert>
      )}

      {currentRun && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Y1 Quarterly Cash Flow ({currentScenario?.code})</CardTitle>
              <CardDescription>Payment lag applied; activation-fund upfront in Q1; travel front-loaded to Q1 to launch pods.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    {QTRS.map((q) => <TableHead key={q} className="text-right">{q.replace("FY2027-", "")}</TableHead>)}
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {QTR_ROWS.map((r) => {
                    const cells = QTRS.map((q) => findValue(data.results, currentRun.id, r.code, q));
                    const lineage = cells[0]?.lineage_json ?? {};
                    return (
                      <TableRow key={r.code}>
                        <TableCell>
                          <div className="font-medium">{r.label}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{r.code}</div>
                        </TableCell>
                        {cells.map((c, i) => {
                          const v = num(c?.value_numeric);
                          return <TableCell key={i} className={`text-right font-mono text-sm ${negativeClass(v)}`}>{fmtUsd(v)}</TableCell>;
                        })}
                        <TableCell>{lineageBtn(lineage as Record<string, unknown>, r.code)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Working Capital (Y1)</CardTitle>
              <CardDescription>Peak cash trough and maximum funding requirement over the first fiscal year.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <Metric label="Peak Working-Capital Trough (Y1)" value={fmtUsd(peakTrough)} klass={negativeClass(peakTrough)} />
              <Metric label="Maximum Funding Requirement (Y1)" value={fmtUsd(maxFunding)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Annual Cash Flow &amp; Cumulative Cash</CardTitle>
              <CardDescription>Annual net cash proxied by EBITDA (per model contract §7 — matches golden §8 cumulative EBITDA table).</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    {FYS.map((fy) => <TableHead key={fy} className="text-right">{fy}</TableHead>)}
                    <TableHead className="text-right"><span className="inline-flex items-center gap-1"><Sigma className="h-3.5 w-3.5" />5-yr</span></TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ANN_ROWS.map((r) => {
                    const cells = FYS.map((fy) => findValue(data.results, currentRun.id, r.code, fy));
                    const total = findValue(data.results, currentRun.id, r.code, TOTAL_PERIOD);
                    const lineage = cells[0]?.lineage_json ?? {};
                    const fmt = r.fmt === "pct" ? fmtPct : fmtUsd;
                    return (
                      <TableRow key={r.code}>
                        <TableCell>
                          <div className="font-medium">{r.label}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{r.code}</div>
                        </TableCell>
                        {cells.map((c, i) => {
                          const v = num(c?.value_numeric);
                          return <TableCell key={i} className={`text-right font-mono text-sm ${negativeClass(v)}`}>{fmt(v)}</TableCell>;
                        })}
                        <TableCell className={`text-right font-mono text-sm ${negativeClass(num(total?.value_numeric))}`}>{fmt(num(total?.value_numeric))}</TableCell>
                        <TableCell>{lineageBtn(lineage as Record<string, unknown>, r.code)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Break-even</CardTitle>
                <CardDescription>First year EBITDA and cumulative cash cross zero.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <Metric label="First positive EBITDA year" value={beEbitdaFy ?? "—"} />
                <Metric label="First positive cumulative cash year" value={beCashFy ?? "—"} />
                <Metric label="Break-even status" value={beStatus ?? "—"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payback</CardTitle>
                <CardDescription>Time to recover invested capital.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <Metric label="Payback year" value={paybackFy ?? "—"} />
                <Metric label="Months to payback" value={paybackMonths != null ? `${paybackMonths} mo` : "—"} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Sustainability</CardTitle>
              <CardDescription>Terminal cash position, negative-year count, funding dependency, and model health.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <Metric label="Negative EBITDA years (of 5)" value={negYears != null ? String(negYears) : "—"} />
              <Metric label="Funding dependency" value={fmtUsd(fundingNeed)} klass={negativeClass(fundingNeed != null && fundingNeed > 0 ? -fundingNeed : 0)} />
              <Metric label="Sustainability status" value={susStatus ?? "—"} />
              <Metric label="Model health" value={modelHealth ?? "—"} />
            </CardContent>
          </Card>
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

function Metric({ label, value, klass }: { label: string; value: string; klass?: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-mono text-base ${klass ?? ""}`}>{value}</div>
    </div>
  );
}

function lineageBtn(lineage: Record<string, unknown>, code: string) {
  if (!lineage || Object.keys(lineage).length === 0) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6"><Info className="h-3.5 w-3.5" /></Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] text-xs">
        <div className="mb-1 font-semibold">{code} · lineage</div>
        <pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed">
          {JSON.stringify(lineage, null, 2)}
        </pre>
      </PopoverContent>
    </Popover>
  );
}
