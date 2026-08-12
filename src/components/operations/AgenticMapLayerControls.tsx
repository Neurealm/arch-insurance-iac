// Independent overlay toggles for the Global Reliability Digital Twin.

import { cn } from "@/lib/utils";
import type { MapLayers } from "@/types/agenticOpticalOperations";

export const DEFAULT_LAYERS: MapLayers = {
  terminals: true,
  links: true,
  customerImpact: true,
  predictedRisk: true,
  weatherExposure: true,
  protectedRoutes: false,
  automationActivity: true,
  maintenance: true,
};

const LAYER_LABELS: { key: keyof MapLayers; label: string }[] = [
  { key: "terminals", label: "Terminals" },
  { key: "links", label: "Optical links" },
  { key: "customerImpact", label: "Customer impact" },
  { key: "predictedRisk", label: "Predicted risk" },
  { key: "weatherExposure", label: "Weather exposure" },
  { key: "protectedRoutes", label: "Protected routes" },
  { key: "automationActivity", label: "Automation activity" },
  { key: "maintenance", label: "Maintenance" },
];

export function AgenticMapLayerControls({
  layers, onToggle, onReset,
}: { layers: MapLayers; onToggle: (key: keyof MapLayers) => void; onReset: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Map layers">
      {LAYER_LABELS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          aria-pressed={layers[key]}
          onClick={() => onToggle(key)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            layers[key]
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
          )}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Reset map
      </button>
    </div>
  );
}
