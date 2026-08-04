/**
 * Stage 3.5.4.2.1 — read-only traversal and query warning panel.
 *
 * Renders warnings already produced by the graph-view result. Warnings are
 * conveyed with visible text (never colour alone) and announced politely.
 */

import type { PresentedWarning } from "../graph/graphWarnings";

export function GraphWarningList({ warnings }: { warnings: readonly PresentedWarning[] }) {
  if (warnings.length === 0) return null;

  return (
    <section
      aria-label="Graph query warnings"
      data-testid="graph-warnings"
      className="space-y-2"
    >
      {warnings.map((w) => (
        <div
          key={w.key}
          data-testid="graph-warning"
          data-warning-code={w.code}
          className="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-foreground"
        >
          <p className="font-medium">
            Warning: {w.title}
          </p>
          <p className="text-muted-foreground">{w.explanation}</p>
          {w.actions.length > 0 && (
            <>
              <p className="mt-1 font-medium">Suggested actions</p>
              <ul className="list-disc pl-4 text-muted-foreground">
                {w.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            {w.code}
            {w.subject ? ` · ${w.subject}` : ""} — {w.detail}
            {w.occurrences > 1
              ? ` · one condition, reported by ${w.occurrences} traversal branches`
              : ""}
          </p>

        </div>
      ))}
    </section>
  );
}
