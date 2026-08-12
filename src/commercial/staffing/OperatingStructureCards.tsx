import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DetailDrawer, SectionHeading, listOrDash } from "./primitives";
import { OPERATING_STRUCTURES, fte, type OperatingStructure } from "@/data/staffingResourcesMockData";

export function OperatingStructureCards({
  factor,
  onFilterStructure,
}: {
  factor: number;
  onFilterStructure: (name: string) => void;
}) {
  const [selected, setSelected] = useState<OperatingStructure | null>(null);

  return (
    <section data-guide-target="staffing-operating-structures" aria-label="Staffing by operating structure" className="space-y-3">
      <SectionHeading
        title="Staffing by Operating Structure"
        subtitle="How capability is organized across dedicated, phase-based, pooled and on demand models"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {OPERATING_STRUCTURES.map((s) => (
          <Card key={s.id}>
            <CardContent className="space-y-2 p-4">
              <p className="text-sm font-semibold text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.purpose}</p>
              <p className="text-xs text-foreground">
                <span className="font-medium">Staffing model:</span> {s.model}
              </p>
              <p className="text-xs text-foreground">
                <span className="font-medium">Peak allocation:</span>{" "}
                <span className="tabular-nums">{fte(s.peakAllocation * factor).toFixed(1)} FTEs</span>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => setSelected(s)}>
                  View details
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onFilterStructure(s.name)}>
                  Filter plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DetailDrawer
        open={Boolean(selected)}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.name ?? ""}
        description={selected?.purpose}
        fields={
          selected
            ? [
                { label: "Staffing model", value: selected.model },
                { label: "Peak allocation", value: `${fte(selected.peakAllocation * factor).toFixed(1)} FTEs` },
                { label: "Open positions", value: String(selected.openRoles) },
                { label: "Utilization", value: `${selected.utilization}%` },
                { label: "Phase demand", value: selected.phaseDemand },
                { label: "Example roles", value: listOrDash(selected.exampleRoles) },
              ]
            : []
        }
        footer={
          selected && (
            <Button
              size="sm"
              onClick={() => {
                onFilterStructure(selected.name);
                setSelected(null);
              }}
            >
              Show assigned resources
            </Button>
          )
        }
      />
    </section>
  );
}
