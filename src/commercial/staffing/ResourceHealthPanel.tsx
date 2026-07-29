import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DetailDrawer, StaffStatusBadge } from "./primitives";
import { RESOURCE_HEALTH, type ResourceHealthMetric } from "@/data/staffingResourcesMockData";

export function ResourceHealthPanel({ onViewRisks }: { onViewRisks: () => void }) {
  const [selected, setSelected] = useState<ResourceHealthMetric | null>(null);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Resource Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <ul className="space-y-2">
          {RESOURCE_HEALTH.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setSelected(m)}
                className="flex w-full flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="min-w-0">
                  <span className="block text-sm text-muted-foreground">{m.label}</span>
                  <span className="block text-sm font-semibold text-foreground">{m.value}</span>
                </span>
                <StaffStatusBadge status={m.status} />
              </button>
            </li>
          ))}
        </ul>

        <Button variant="link" className="h-auto p-0 text-sm" onClick={onViewRisks}>
          View resource risks
        </Button>

        <DetailDrawer
          open={Boolean(selected)}
          onOpenChange={(o) => !o && setSelected(null)}
          title={selected?.label ?? ""}
          description={selected?.detail}
          fields={
            selected
              ? [
                  { label: "Value", value: selected.value },
                  { label: "Status", value: <StaffStatusBadge status={selected.status} /> },
                  { label: "Notes", value: selected.detail },
                ]
              : []
          }
          footer={
            selected && (
              <Button size="sm" variant="outline" onClick={() => toast.success("Metric note saved locally.")}>
                Save Locally
              </Button>
            )
          }
        />
      </CardContent>
    </Card>
  );
}
