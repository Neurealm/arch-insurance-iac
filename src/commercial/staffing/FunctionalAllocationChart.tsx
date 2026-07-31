import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DetailDrawer, listOrDash } from "./primitives";
import { FUNCTION_BG } from "./styles";
import { FUNCTIONAL_ALLOCATION, fte, type FunctionalAllocation } from "@/data/staffingResourcesMockData";

const STROKE: Record<string, string> = {
  delivery: "stroke-gv-blue",
  runops: "stroke-gv-teal",
  customerSuccess: "stroke-gv-purple",
  support: "stroke-gv-warning",
};

export function FunctionalAllocationChart({
  factor,
  onFilterFunction,
}: {
  factor: number;
  onFilterFunction: (key: string) => void;
}) {
  const [selected, setSelected] = useState<FunctionalAllocation | null>(null);
  const total = fte(FUNCTIONAL_ALLOCATION.reduce((a, f) => a + f.ftes, 0) * factor);
  const circumference = 2 * Math.PI * 42;
  let cursor = 0;

  return (
    <Card data-guide-target="staffing-function-allocation">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">FTE Allocation by Function, Peak</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-44 w-44" role="img" aria-label={`Peak allocation donut, total ${total.toFixed(1)} FTEs`}>
            {FUNCTIONAL_ALLOCATION.map((f) => {
              const dash = (f.pct / 100) * circumference;
              const el = (
                <circle
                  key={f.key}
                  cx={60}
                  cy={60}
                  r={42}
                  fill="none"
                  strokeWidth={14}
                  className={cn(STROKE[f.key], "cursor-pointer outline-none focus-visible:opacity-80")}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-cursor}
                  transform="rotate(-90 60 60)"
                  tabIndex={0}
                  role="button"
                  aria-label={`${f.name}: ${fte(f.ftes * factor).toFixed(1)} FTEs, ${f.pct} percent. Activate for function details.`}
                  onClick={() => setSelected(f)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(f);
                    }
                  }}
                />
              );
              cursor += dash;
              return el;
            })}
            <text x={60} y={57} textAnchor="middle" className="fill-foreground text-[13px] font-semibold">
              {total.toFixed(1)}
            </text>
            <text x={60} y={71} textAnchor="middle" className="fill-muted-foreground text-[9px]">
              FTEs
            </text>
          </svg>
        </div>

        <ul className="space-y-2" aria-label="Function allocation legend">
          {FUNCTIONAL_ALLOCATION.map((f) => (
            <li key={f.key}>
              <button
                type="button"
                onClick={() => setSelected(f)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-2 text-foreground">
                  <span className={cn("h-2.5 w-2.5 rounded-full", FUNCTION_BG[f.key])} aria-hidden="true" />
                  {f.name}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {fte(f.ftes * factor).toFixed(1)} FTEs · {f.pct}%
                </span>
              </button>
            </li>
          ))}
        </ul>

        <Button
          variant="link"
          className="h-auto p-0 text-sm"
          onClick={() => setSelected(FUNCTIONAL_ALLOCATION[0])}
        >
          View function details
        </Button>

        <DetailDrawer
          open={Boolean(selected)}
          onOpenChange={(o) => !o && setSelected(null)}
          title={selected?.name ?? ""}
          description={selected?.purpose}
          fields={
            selected
              ? [
                  { label: "Planned FTEs", value: fte(selected.ftes * factor).toFixed(1) },
                  { label: "Filled FTEs", value: fte(selected.filled * factor).toFixed(1) },
                  { label: "Open roles", value: String(selected.openRoles) },
                  { label: "Peak utilization", value: `${selected.peakUtilization}%` },
                  { label: "Critical skills", value: listOrDash(selected.criticalSkills) },
                  { label: "Phase demand", value: selected.phaseDemand },
                  { label: "Assignment model", value: selected.sharing },
                  { label: "Risks", value: listOrDash(selected.risks) },
                ]
              : []
          }
          footer={
            selected && (
              <>
                <Button size="sm" onClick={() => toast.success(`${selected.name} plan edit simulated locally.`)}>
                  Edit Plan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onFilterFunction(selected.key);
                    setSelected(null);
                  }}
                >
                  Filter staffing plan
                </Button>
              </>
            )
          }
        />
      </CardContent>
    </Card>
  );
}
