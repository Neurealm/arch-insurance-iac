import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import { useProjectMomentous } from "@/commercial/hooks/useProjectMomentous";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/platform/components/States";
import { DirectionalBanner } from "@/commercial/components/DirectionalBanner";
import { SeedMomentousButton } from "@/commercial/components/SeedMomentousButton";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function formatUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}
function formatMetric(m: { numeric_value: number | null; unit: string | null; text_value: string | null }) {
  if (m.numeric_value == null) return m.text_value ?? "—";
  if ((m.unit ?? "").toUpperCase() === "USD") return formatUsd(Number(m.numeric_value));
  return `${Number(m.numeric_value).toLocaleString()}${m.unit ? ` ${m.unit}` : ""}`;
}

export default function CommercialOverview() {
  const { activeTenant, isPlatformAdmin } = useCommercialAccess();
  const { data, isLoading } = useProjectMomentous();
  const program = data?.program;
  const gates = data?.gates ?? [];
  const metrics = data?.metrics ?? [];
  const currentGate = gates.find((g) => g.gate_code === program?.current_gate_code) ?? gates[0];

  return (
    <div className="space-y-6">
      <DirectionalBanner />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Active Workspace</CardTitle></CardHeader>
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
                <Link
                  to="/commercial/program"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
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

          {currentGate && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Current Gate · {currentGate.gate_code}</CardTitle>
                  <Badge variant="outline">{currentGate.name}</Badge>
                  <Badge variant="secondary" className="capitalize">{currentGate.status.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><span className="text-muted-foreground">Account scope:</span> {currentGate.account_scope_label ?? "—"}</div>
                <div><span className="text-muted-foreground">Operating objective:</span> {currentGate.operating_objective}</div>
                <div><span className="text-muted-foreground">Economic objective:</span> {currentGate.economic_objective}</div>
              </CardContent>
            </Card>
          )}
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
