import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import { useProjectMomentous } from "@/commercial/hooks/useProjectMomentous";
import { useProjectMomentousScenarios } from "@/commercial/hooks/useProjectMomentousScenarios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/platform/components/States";
import { DirectionalBanner } from "@/commercial/components/DirectionalBanner";
import { SeedMomentousButton } from "@/commercial/components/SeedMomentousButton";
import { PlayIntroductionButton } from "@/commercial/components/PlayIntroductionButton";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, CircleDashed, Circle } from "lucide-react";

function formatUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}
function formatMetric(m: { numeric_value: number | null; unit: string | null; text_value: string | null }) {
  if (m.numeric_value == null) return m.text_value ?? "—";
  if ((m.unit ?? "").toUpperCase() === "USD") return formatUsd(Number(m.numeric_value));
  return `${Number(m.numeric_value).toLocaleString()}${m.unit ? ` ${m.unit}` : ""}`;
}

const NEXT_ACTIONS = [
  { label: "Validate and import account records", to: "/commercial/portfolio" },
  { label: "Build the calculation engine", to: null },
  { label: "Add scenario comparison outputs", to: "/commercial/scenarios" },
  { label: "Add approval governance", to: null },
  { label: "Invite Commercial users", to: "/platform/members" },
];

const READINESS = [
  { label: "Broader account universe known", state: "known" as const },
  { label: "Aggregate ARR known", state: "known" as const },
  { label: "No-partner aggregate model known", state: "known" as const },
  { label: "Account-level ARR pending", state: "pending" as const },
  { label: "Account-level renewal dates pending validation", state: "pending" as const },
  { label: "Product mix pending validation", state: "pending" as const },
  { label: "Partner status pending validation", state: "pending" as const },
  { label: "Opportunity and sentiment enrichment pending validation", state: "pending" as const },
];

export default function CommercialOverview() {
  const { activeTenant, isPlatformAdmin } = useCommercialAccess();
  const { data, isLoading } = useProjectMomentous();
  const { data: scen } = useProjectMomentousScenarios();
  const program = data?.program;
  const gates = data?.gates ?? [];
  const metrics = data?.metrics ?? [];
  const sources = data?.sources ?? [];
  const scenarios = scen?.scenarios ?? [];
  const assumptions = scen?.assumptions ?? [];
  const baseline = scenarios.find((s) => s.is_baseline) ?? null;
  const currentGate = gates.find((g) => g.gate_code === program?.current_gate_code) ?? gates[0];

  return (
    <div className="space-y-6">
      <DirectionalBanner />

      {/* 1 · Workspace & 2 · Program */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Workspace</CardTitle>
              <PlayIntroductionButton />
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div><span className="text-muted-foreground">Name:</span> {activeTenant?.name ?? "—"}</div>
            <div><span className="text-muted-foreground">Slug:</span> <span className="font-mono text-xs">{activeTenant?.slug ?? "—"}</span></div>
            <div><span className="text-muted-foreground">Status:</span> {activeTenant?.status ?? "—"}</div>
            {isPlatformAdmin && <Badge variant="secondary" className="mt-1">Platform Admin</Badge>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Program</CardTitle>
              {!program && !isLoading && <SeedMomentousButton />}
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {isLoading ? (
              <div className="text-muted-foreground">Loading…</div>
            ) : program ? (
              <>
                <div className="font-semibold text-foreground">{program.name}</div>
                <div className="text-muted-foreground">
                  Partner: {program.partner_name ?? "—"} · Segment: {program.market_segment ?? "—"}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="outline" className="capitalize">{program.status}</Badge>
                  <Badge variant="outline">Current: {program.current_gate_code}</Badge>
                  <Badge variant="secondary" className="capitalize">{program.source_status}</Badge>
                </div>
                <Link to="/commercial/program" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Open program workspace <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            ) : (
              <div className="text-muted-foreground">Not provisioned yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {program ? (
        <>
          {/* 3 · Current gate */}
          {currentGate && (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">Current Gate · {currentGate.gate_code}</CardTitle>
                  <Badge variant="outline">{currentGate.name}</Badge>
                  <Badge variant="secondary" className="capitalize">{currentGate.status.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><span className="text-muted-foreground">Account scope:</span> {currentGate.account_scope_label ?? "—"}</div>
                <div><span className="text-muted-foreground">Operating objective:</span> {currentGate.operating_objective ?? "—"}</div>
                <div><span className="text-muted-foreground">Economic objective:</span> {currentGate.economic_objective ?? "—"}</div>
              </CardContent>
            </Card>
          )}

          {/* 4 · Gate progression */}
          <Card>
            <CardHeader><CardTitle className="text-base">Gate progression</CardTitle></CardHeader>
            <CardContent>
              <ol className="flex flex-wrap items-center gap-2">
                {gates.map((g, i) => {
                  const done = g.status === "passed";
                  const active = g.gate_code === program.current_gate_code;
                  return (
                    <li key={g.id} className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
                        active ? "border-primary bg-primary/10 text-foreground" : done ? "border-emerald-500/40 bg-emerald-500/10 text-foreground" : "border-border text-muted-foreground"
                      }`}>
                        {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : active ? <Circle className="h-3.5 w-3.5 text-primary" /> : <CircleDashed className="h-3.5 w-3.5" />}
                        <span className="font-mono">{g.gate_code}</span>
                        <span className="hidden sm:inline">· {g.name}</span>
                      </div>
                      {i < gates.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          {/* 5 · Four aggregate metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <Card key={m.id}>
                <CardHeader className="pb-2">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.label}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-foreground">{formatMetric(m)}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground capitalize">{m.confidence}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 6 · Baseline scenario & 7 · Comparison summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Baseline scenario</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                {baseline ? (
                  <>
                    <div className="font-semibold text-foreground">{baseline.name}</div>
                    <div className="text-muted-foreground">{baseline.description ?? "—"}</div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <Badge variant="outline">{baseline.code}</Badge>
                      <Badge variant="secondary" className="capitalize">{baseline.source_status}</Badge>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">No baseline scenario yet.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Scenario comparison</CardTitle></CardHeader>
              <CardContent className="text-sm">
                {scenarios.length ? (
                  <ul className="divide-y divide-border">
                    {scenarios.map((s) => {
                      const count = assumptions.filter((a) => a.scenario_id === s.id).length;
                      return (
                        <li key={s.id} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{s.name}</span>
                            {s.is_baseline && <Badge variant="secondary" className="text-[10px]">Baseline</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground">{count} assumptions</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-muted-foreground">No scenarios seeded.</div>
                )}
                <Link to="/commercial/scenarios" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Open scenarios <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* 8 · Source validation */}
          <Card>
            <CardHeader><CardTitle className="text-base">Source validation</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <div className="mb-2 text-muted-foreground">
                {sources.length} confidential sources registered · no raw content stored client-side.
              </div>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {sources.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded border border-border px-2 py-1.5">
                    <div className="min-w-0">
                      <div className="text-xs font-mono">{s.source_code}</div>
                      <div className="truncate text-foreground">{s.title}</div>
                    </div>
                    <Badge variant="outline" className="capitalize">{s.status}</Badge>
                  </li>
                ))}
              </ul>
              <Link to="/commercial/sources" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                Open source register <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* 9 · Data readiness & 10 · Next actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Data readiness</CardTitle></CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {READINESS.map((r) => (
                    <li key={r.label} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        {r.state === "known" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <CircleDashed className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="truncate text-foreground">{r.label}</span>
                      </div>
                      <Badge variant={r.state === "known" ? "secondary" : "outline"}>
                        {r.state === "known" ? "Known" : "Pending"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Recommended next actions</CardTitle></CardHeader>
              <CardContent>
                <ol className="space-y-1.5 text-sm">
                  {NEXT_ACTIONS.map((a, i) => (
                    <li key={a.label} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium">
                        {i + 1}
                      </span>
                      {a.to ? (
                        <Link to={a.to} className="text-primary hover:underline">{a.label}</Link>
                      ) : (
                        <span className="text-muted-foreground">{a.label} <span className="text-[10px] uppercase tracking-wide">· deferred</span></span>
                      )}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        !isLoading && (
          <EmptyState
            title="No Commercial program configured"
            description="Seed Project Momentous to activate the Overview, Program, and Source Register."
          />
        )
      )}
    </div>
  );
}
