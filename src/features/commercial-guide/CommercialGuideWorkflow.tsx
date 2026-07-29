import type { WorkflowStepGuide } from "./types";
import { GuidePending } from "./CommercialGuideSection";

export function CommercialGuideWorkflow({ steps }: { steps: WorkflowStepGuide[] }) {
  if (steps.length === 0) return <GuidePending label="Recommended workflow pending validation" />;
  return (
    <ol className="space-y-2">
      {[...steps]
        .sort((a, b) => a.step - b.step)
        .map((s) => (
          <li key={s.id} className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
              {s.step}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
              {s.role && <p className="text-[11px] text-muted-foreground">Role: {s.role}</p>}
            </div>
          </li>
        ))}
    </ol>
  );
}
