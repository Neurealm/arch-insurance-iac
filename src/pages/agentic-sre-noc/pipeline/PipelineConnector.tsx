/**
 * AIM-002 — restrained zone-to-zone pipeline connectors.
 *
 * Connectors are rendered as a thin band between column groups rather than as
 * individual signal-level lines. Selection highlights only the active path.
 */

import { cn } from "@/lib/utils";
import { FLOW_COLORS } from "./usePipelineState";

export type ConnectorKind = "data" | "reasoning" | "control" | "inactive";

export interface ConnectorSpec {
  id: string;
  from: string;
  to: string;
  label: string;
  kind: ConnectorKind;
}

export const PIPELINE_CONNECTORS: ConnectorSpec[] = [
  { id: "signals-features", from: "Signal Inputs", to: "Feature Engineering", label: "Validated signals", kind: "data" },
  { id: "features-anomalies", from: "Feature Engineering", to: "Anomaly Detection", label: "Feature vector", kind: "data" },
  { id: "anomalies-model", from: "Anomaly Detection", to: "Risk Prediction", label: "Anomaly records", kind: "reasoning" },
  { id: "model-impact", from: "Risk Prediction", to: "Customer and Service Impact", label: "Risk and confidence", kind: "reasoning" },
  { id: "impact-actions", from: "Customer and Service Impact", to: "Recommended Actions", label: "Service exposure", kind: "control" },
];

export function PipelineConnector({ activeIds }: { activeIds: string[] }) {
  return (
    <div
      data-testid="pipeline-connectors"
      aria-hidden="true"
      className="hidden grid-cols-5 gap-2 px-1 xl:grid"
    >
      {PIPELINE_CONNECTORS.map((c) => {
        const active = activeIds.includes(c.id);
        const color = active ? FLOW_COLORS[c.kind] : FLOW_COLORS.inactive;
        const dashed = c.kind === "reasoning";
        return (
          <div key={c.id} className="flex items-center gap-1">
            <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-2.5 flex-1">
              <line
                x1="0" y1="5" x2="94" y2="5"
                stroke={color}
                strokeWidth={active ? 2.4 : 1.4}
                strokeDasharray={dashed ? "5 3" : undefined}
                vectorEffect="non-scaling-stroke"
              />
              <polygon points="94,1.5 100,5 94,8.5" fill={color} />
            </svg>
            <span className={cn("shrink-0 text-[9px]", active ? "font-medium text-slate-700" : "text-slate-400")}>
              {c.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Text alternative to the connector band, always available to assistive tech. */
export function PipelineConnectorSummary({ activeIds }: { activeIds: string[] }) {
  return (
    <ul className="sr-only">
      {PIPELINE_CONNECTORS.map((c) => (
        <li key={c.id}>
          {c.from} sends {c.label} to {c.to}. {activeIds.includes(c.id) ? "Active path." : "Inactive path."}
        </li>
      ))}
    </ul>
  );
}
