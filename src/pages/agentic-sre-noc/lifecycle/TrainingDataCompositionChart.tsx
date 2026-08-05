/**
 * AIM-005 — training data composition chart.
 *
 * Functional donut with hover, selection, an accessible table alternative and
 * a current-versus-prior dataset comparison.
 */

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AnalyticsChartFrame, AnalyticsTooltip } from "../analytics/AnalyticsPrimitives";
import { trainingComposition } from "./lifecycleFixtures";
import { exportTrainingSummary } from "./lifecycleExport";
import { ComparisonBar } from "./LifecyclePrimitives";
import type { LifecyclePanelState } from "./useLifecycleState";

export interface TrainingDataCompositionChartProps {
  selectedCategory: string | null;
  onSelectCategory: (key: string | null) => void;
  panelState: LifecyclePanelState;
  onNotify: (message: string) => void;
}

export function TrainingDataCompositionChart({
  selectedCategory, onSelectCategory, panelState, onNotify,
}: TrainingDataCompositionChartProps) {
  const [hovered, setHovered] = React.useState<string | null>(null);

  const active = trainingComposition.find((c) => c.key === selectedCategory) ?? null;

  return (
    <div className="space-y-2" data-testid="training-composition">
      <AnalyticsChartFrame
        title="Training composition"
        summary="Share of training samples contributed by each signal family, compared with the prior dataset version."
        state={panelState}
        heightClass="h-[190px]"
        testId="training-composition-chart"
        tableCaption="Training composition by signal family"
        tableHeaders={["Signal family", "Share %", "Prior share %", "Samples"]}
        tableRows={trainingComposition.map((c) => [c.label, c.sharePct, c.priorSharePct, c.samples.toLocaleString()])}
        onExport={() => onNotify(exportTrainingSummary().message)}
        exportLabel="Export Training Data Summary"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={trainingComposition}
              dataKey="sharePct"
              nameKey="label"
              innerRadius="52%"
              outerRadius="82%"
              paddingAngle={1}
              isAnimationActive={false}
              onMouseEnter={(_, index) => setHovered(trainingComposition[index]?.key ?? null)}
              onMouseLeave={() => setHovered(null)}
              onClick={(_, index) => {
                const key = trainingComposition[index]?.key ?? null;
                onSelectCategory(key === selectedCategory ? null : key);
                onNotify(key === selectedCategory ? "Training category cleared." : `Training category ${trainingComposition[index]?.label} selected.`);
              }}
            >
              {trainingComposition.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={entry.color}
                  stroke="#ffffff"
                  strokeWidth={selectedCategory === entry.key || hovered === entry.key ? 2.5 : 1}
                  opacity={selectedCategory && selectedCategory !== entry.key ? 0.45 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active: isActive, payload }) => {
                if (!isActive || !payload?.length) return null;
                const row = payload[0].payload as (typeof trainingComposition)[number];
                return (
                  <AnalyticsTooltip
                    title={row.label}
                    value={`${row.sharePct}%`}
                    scope={`${row.samples.toLocaleString()} samples`}
                    comparison={`Prior dataset ${row.priorSharePct}%`}
                    interpretation={row.description}
                    source="PLI-TRAIN-2026.06"
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </AnalyticsChartFrame>

      <ul className="space-y-0.5" aria-label="Training composition selector">
        {trainingComposition.map((entry) => (
          <li key={entry.key}>
            <ComparisonBar
              label={entry.label}
              valuePct={entry.sharePct}
              referencePct={entry.priorSharePct}
              referenceLabel="Prior"
              color={entry.color}
              selected={selectedCategory === entry.key}
              onSelect={() => {
                const next = selectedCategory === entry.key ? null : entry.key;
                onSelectCategory(next);
                onNotify(next ? `Training category ${entry.label} selected.` : "Training category cleared.");
              }}
            />
          </li>
        ))}
      </ul>

      {active && (
        <p className="rounded border border-blue-200 bg-blue-50/60 p-2 text-[10.5px] text-slate-700">
          <span className="font-semibold text-slate-900">{active.label}.</span> {active.description} Current share{" "}
          {active.sharePct}%, prior dataset {active.priorSharePct}%, {active.samples.toLocaleString()} samples.
        </p>
      )}
    </div>
  );
}
