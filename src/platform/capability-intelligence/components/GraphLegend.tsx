/**
 * Stage 3.5.4.2 — canvas legend.
 *
 * Explains node families, edge treatments, candidate relationships, root and
 * selection markers, and truncation. Every entry pairs its colour with a text
 * marker so nothing depends on colour alone.
 */

import { NODE_GROUP_SPECS, NODE_VISUAL_GROUPS } from "../graph/nodeTaxonomy";
import { tones } from "@/runops/components/variants";
import { MAX_VISIBLE_EDGES, MAX_VISIBLE_NODES } from "../graph/graphViewTypes";

export function GraphLegend() {
  return (
    <section aria-labelledby="graph-legend-title" className="space-y-3 text-xs">
      <h3 id="graph-legend-title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Legend
      </h3>

      <div>
        <p className="mb-1.5 font-medium text-foreground">Entity families</p>
        <ul className="space-y-1">
          {NODE_VISUAL_GROUPS.map((g) => {
            const spec = NODE_GROUP_SPECS[g];
            return (
              <li key={g} className="flex items-start gap-2">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tones[spec.tone].dot}`} aria-hidden="true" />
                <span className="text-muted-foreground">
                  <span className="font-mono text-[10px] text-foreground">{spec.marker}</span>{" "}
                  <span className="text-foreground">{spec.label}</span> — {spec.description}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-1 text-[11px] text-muted-foreground">
          The canonical node type is always printed on the node, so families never replace the
          19-type taxonomy.
        </p>
      </div>

      <div>
        <p className="mb-1.5 font-medium text-foreground">Relationships</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>
            <span className="text-foreground">Solid line</span> — confirmed relationship, arrow points
            from source to target.
          </li>
          <li>
            <span className="text-foreground">Dashed line, “(candidate)” label</span> — weakly inferred
            candidate relationship. Not canonical, shown only on request.
          </li>
        </ul>
      </div>

      <div>
        <p className="mb-1.5 font-medium text-foreground">Markers</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>
            <span className="font-mono text-[10px] text-foreground">★ ROOT</span> — the traversal root.
          </li>
          <li>
            <span className="text-foreground">Indigo outline</span> plus “selected” in the accessible
            contents list — the current selection.
          </li>
          <li>
            <span className="text-foreground">Amber outline</span> — a direct neighbour of the
            selection. Unrelated entities are dimmed but remain readable.
          </li>
        </ul>
      </div>

      <div>
        <p className="mb-1.5 font-medium text-foreground">Truncation</p>
        <p className="text-muted-foreground">
          A view is capped at {MAX_VISIBLE_NODES} entities and {MAX_VISIBLE_EDGES} relationships. When
          a cap applies, the header states it and the summary explains how to narrow the view.
        </p>
      </div>
    </section>
  );
}
