import type { WorkedExampleGuide } from "./types";
import { GuidePending } from "./CommercialGuideSection";

export function CommercialGuideWorkedExample({ examples }: { examples: WorkedExampleGuide[] }) {
  if (examples.length === 0) return <GuidePending label="Worked example pending validation" />;
  return (
    <div className="space-y-3">
      {examples.map((e) => (
        <article key={e.id} className="rounded-md border border-border px-3 py-2">
          <h4 className="text-sm font-medium text-foreground">{e.title}</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{e.narrative}</p>
          {e.steps && e.steps.length > 0 && (
            <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-xs text-muted-foreground">
              {e.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          )}
          {e.result && <p className="mt-1 text-xs font-medium text-foreground">Result: {e.result}</p>}
        </article>
      ))}
    </div>
  );
}
