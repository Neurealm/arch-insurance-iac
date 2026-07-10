// Small badge indicating scenario-driven (simulated) data. Pages that render
// data sourced from the ScenarioStore should surface this label so operators
// never confuse demo output with live telemetry.

import { cn } from "@/lib/utils";
import { useScenarioStore } from "@/runops/scenario/ScenarioStore";

export function SimulationBadge({ className }: { className?: string }) {
  const { isSimulation } = useScenarioStore();
  if (!isSimulation) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800",
        className,
      )}
      title="Data driven by the deterministic demo scenario"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Simulation
    </span>
  );
}
