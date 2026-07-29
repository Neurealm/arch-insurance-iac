import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DetailDrawer } from "./primitives";
import { PIPELINE_STAGES, PIPELINE_SUMMARY, type ResourcePipelineItem } from "@/data/staffingResourcesMockData";

export function ResourcePipeline({
  items,
  onAdvance,
  onAddCandidate,
}: {
  items: ResourcePipelineItem[];
  onAdvance: (id: string) => void;
  onAddCandidate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selected, setSelected] = useState<ResourcePipelineItem | null>(null);

  const filtered = items.filter((i) => sourceFilter === "all" || i.source === sourceFilter);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Resource Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1.5 text-sm">
          {PIPELINE_SUMMARY.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-semibold tabular-nums text-foreground">{s.value}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          <Button variant="link" className="h-auto p-0 text-sm" onClick={() => setOpen((v) => !v)}>
            {open ? "Hide pipeline details" : "View pipeline details"}
          </Button>
          <Button variant="link" className="h-auto p-0 text-sm" onClick={onAddCandidate}>
            Add mock candidate
          </Button>
        </div>

        {open && (
          <div className="space-y-3 rounded-md border border-border p-3">
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-9" aria-label="Filter pipeline by source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {Array.from(new Set(items.map((i) => i.source))).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ul className="space-y-2">
              {filtered.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <button
                    type="button"
                    className="min-w-0 text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setSelected(i)}
                  >
                    <span className="block font-medium text-foreground">{i.role}</span>
                    <span className="block text-xs text-muted-foreground">
                      {i.name} · {i.source} · start {i.expectedStart}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {i.stage}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={i.stage === "Ready"}
                      onClick={() => onAdvance(i.id)}
                    >
                      Update stage
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Stages: {PIPELINE_STAGES.join(" → ")}
            </p>
          </div>
        )}

        <DetailDrawer
          open={Boolean(selected)}
          onOpenChange={(o) => !o && setSelected(null)}
          title={selected?.role ?? ""}
          description={selected ? `${selected.name}, ${selected.source}` : undefined}
          fields={
            selected
              ? [
                  { label: "Stage", value: selected.stage },
                  { label: "Source", value: selected.source },
                  { label: "Expected start", value: selected.expectedStart },
                ]
              : []
          }
          footer={
            selected && (
              <Button size="sm" onClick={() => onAdvance(selected.id)} disabled={selected.stage === "Ready"}>
                Advance stage
              </Button>
            )
          }
        />
      </CardContent>
    </Card>
  );
}
