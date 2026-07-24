import { useProjectMomentous } from "@/commercial/hooks/useProjectMomentous";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/platform/components/States";
import { DirectionalBanner } from "@/commercial/components/DirectionalBanner";
import { SeedMomentousButton } from "@/commercial/components/SeedMomentousButton";
import { Circle, CircleDot, CheckCircle2 } from "lucide-react";

function GateIcon({ status }: { status: string }) {
  if (status === "passed") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "in_progress" || status === "in_review" || status === "ready")
    return <CircleDot className="h-4 w-4 text-primary" />;
  return <Circle className="h-4 w-4 text-muted-foreground" />;
}

export default function CommercialProgram() {
  const { data, isLoading } = useProjectMomentous();
  const program = data?.program;
  const gates = data?.gates ?? [];

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading program…</div>;
  if (!program) {
    return (
      <div className="space-y-4">
        <DirectionalBanner />
        <div className="flex justify-end"><SeedMomentousButton /></div>
        <EmptyState
          title="No program selected"
          description="Seed Project Momentous from the Overview or below to provision the program, gates, and source register."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DirectionalBanner />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">{program.name}</CardTitle>
            <Badge variant="outline" className="font-mono text-[11px]">{program.code}</Badge>
            <Badge variant="secondary" className="capitalize">{program.status}</Badge>
            <Badge variant="outline">Current: {program.current_gate_code}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="text-muted-foreground">
            Partner: <span className="text-foreground">{program.partner_name}</span> · Segment:{" "}
            <span className="text-foreground">{program.market_segment}</span>
          </div>
          {program.description && <p className="text-foreground/90">{program.description}</p>}
          <p className="text-xs text-muted-foreground">
            One readiness gate (G0) plus four formal decision gates (G1–G4).
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Operating Gates</h2>
        <div className="space-y-3">
          {gates.map((g) => (
            <Card key={g.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <GateIcon status={g.status} />
                  <CardTitle className="text-sm">
                    {g.gate_code} · {g.name}
                  </CardTitle>
                  <Badge variant="secondary" className="capitalize">{g.status.replace("_", " ")}</Badge>
                  {g.account_scope_label && (
                    <Badge variant="outline" className="text-[11px]">{g.account_scope_label}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 text-xs md:grid-cols-2">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Operating objective</div>
                  <div className="text-foreground/90">{g.operating_objective}</div>
                </div>
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Economic objective</div>
                  <div className="text-foreground/90">{g.economic_objective}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Unlock conditions</div>
                  <ul className="list-disc space-y-0.5 pl-4 text-foreground/90">
                    {g.unlock_conditions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
