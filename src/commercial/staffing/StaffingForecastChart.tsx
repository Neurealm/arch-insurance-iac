import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./primitives";
import { FUNCTION_BG, FUNCTION_FILL } from "./styles";
import {
  FUNCTION_LABELS,
  MONTHLY_DEMAND,
  OPERATIONAL_PHASES,
  fte,
  type PhaseKey,
  type ScenarioKey,
} from "@/data/staffingResourcesMockData";

const SERIES = [
  { key: "delivery", label: FUNCTION_LABELS.delivery },
  { key: "runops", label: FUNCTION_LABELS.runops },
  { key: "customerSuccess", label: FUNCTION_LABELS.customerSuccess },
  { key: "support", label: FUNCTION_LABELS.support },
] as const;

type Mode = "fte" | "pct";
type Grouping = "month" | "phase";

interface Column {
  id: string;
  label: string;
  phase: PhaseKey;
  values: Record<string, number>;
  total: number;
}

export function StaffingForecastChart({
  factor,
  scenario,
  onSegmentSelect,
  activePhases,
}: {
  factor: number;
  scenario: ScenarioKey;
  onSegmentSelect: (functionKey: string, phase: PhaseKey) => void;
  activePhases: PhaseKey[];
}) {
  const [mode, setMode] = useState<Mode>("fte");
  const [grouping, setGrouping] = useState<Grouping>("month");

  const columns: Column[] = useMemo(() => {
    const scaled = MONTHLY_DEMAND.map((m) => {
      const values: Record<string, number> = {
        delivery: fte(m.delivery * factor),
        runops: fte(m.runops * factor),
        customerSuccess: fte(m.customerSuccess * factor),
        support: fte(m.support * factor),
      };
      return {
        id: m.month,
        label: m.short,
        phase: m.phase,
        values,
        total: fte(Object.values(values).reduce((a, b) => a + b, 0)),
      };
    });
    if (grouping === "month") return scaled;

    return OPERATIONAL_PHASES.map((p) => {
      const rows = scaled.filter((s) => s.phase === p.key);
      const values: Record<string, number> = { delivery: 0, runops: 0, customerSuccess: 0, support: 0 };
      rows.forEach((r) => {
        SERIES.forEach((s) => {
          values[s.key] = Math.max(values[s.key], r.values[s.key]);
        });
      });
      Object.keys(values).forEach((k) => (values[k] = fte(values[k])));
      return {
        id: p.key,
        label: `${p.title} peak`,
        phase: p.key,
        values,
        total: fte(Object.values(values).reduce((a, b) => a + b, 0)),
      };
    });
  }, [factor, grouping]);

  const max = Math.max(...columns.map((c) => c.total), 1);

  const summaryText = columns
    .map((c) => `${c.label}: ${c.total.toFixed(1)} FTEs`)
    .join("; ");

  return (
    <Card data-guide-target="staffing-forecast">
      <CardHeader className="pb-3">
        <SectionHeading
          title="Day 0, Day 1 and Day 2 Staffing Plan"
          subtitle="Planned FTE demand by operational phase and functional area"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex overflow-hidden rounded-md border border-border" role="group" aria-label="Value mode">
                <Button
                  size="sm"
                  variant={mode === "fte" ? "secondary" : "ghost"}
                  className="rounded-none"
                  aria-pressed={mode === "fte"}
                  onClick={() => setMode("fte")}
                >
                  FTE
                </Button>
                <Button
                  size="sm"
                  variant={mode === "pct" ? "secondary" : "ghost"}
                  className="rounded-none"
                  aria-pressed={mode === "pct"}
                  onClick={() => setMode("pct")}
                >
                  %
                </Button>
              </div>
              <div className="inline-flex overflow-hidden rounded-md border border-border" role="group" aria-label="Grouping">
                <Button
                  size="sm"
                  variant={grouping === "month" ? "secondary" : "ghost"}
                  className="rounded-none"
                  aria-pressed={grouping === "month"}
                  onClick={() => setGrouping("month")}
                >
                  Monthly
                </Button>
                <Button
                  size="sm"
                  variant={grouping === "phase" ? "secondary" : "ghost"}
                  className="rounded-none"
                  aria-pressed={grouping === "phase"}
                  onClick={() => setGrouping("phase")}
                >
                  Phase
                </Button>
              </div>
            </div>
          }
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="flex flex-wrap items-center gap-4 text-xs" aria-label="Chart legend">
          {SERIES.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5 text-muted-foreground">
              <span className={cn("h-2.5 w-2.5 rounded-sm", FUNCTION_BG[s.key])} aria-hidden="true" />
              {s.label}
            </li>
          ))}
        </ul>

        <div className="overflow-x-auto">
          <div
            className="flex min-w-[640px] items-end gap-4"
            role="group"
            aria-label="Stacked staffing demand chart"
          >
            {columns.map((c) => {
              let offset = 0;
              const dimmed = activePhases.length > 0 && !activePhases.includes(c.phase);
              return (
                <div key={c.id} className={cn("flex flex-1 flex-col items-center gap-2", dimmed && "opacity-40")}>
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    {mode === "fte" ? c.total.toFixed(1) : "100%"}
                  </span>
                  <svg
                    viewBox="0 0 60 240"
                    className="h-52 w-full max-w-[64px]"
                    role="img"
                    aria-label={`${c.label}: total ${c.total.toFixed(1)} FTEs`}
                  >
                    {SERIES.map((s) => {
                      const value = c.values[s.key];
                      const height = (value / max) * 230;
                      const y = 235 - offset - height;
                      offset += height;
                      const pct = c.total ? Math.round((value / c.total) * 100) : 0;
                      return (
                        <g key={s.key}>
                          <title>{`${c.label} — ${s.label}: ${value.toFixed(1)} FTEs (${pct}%)`}</title>
                          <rect
                            x={6}
                            y={y}
                            width={48}
                            height={Math.max(height, 1)}
                            rx={2}
                            tabIndex={0}
                            role="button"
                            aria-label={`${c.label}, ${s.label}, ${value.toFixed(1)} FTEs, ${pct} percent. Activate to filter the staffing table.`}
                            className={cn(FUNCTION_FILL[s.key], "cursor-pointer outline-none focus-visible:stroke-foreground")}
                            onClick={() => onSegmentSelect(s.key, c.phase)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onSegmentSelect(s.key, c.phase);
                              }
                            }}
                          />
                        </g>
                      );
                    })}
                  </svg>
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted-foreground" aria-live="polite">
          Accessible summary, {scenario} scenario. {summaryText}.
        </p>
      </CardContent>
    </Card>
  );
}
