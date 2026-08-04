/**
 * Stage 3.5.4.2 — scope and traversal controls.
 *
 * Read-only controls. Every one is labelled and keyboard operable; nothing here
 * can write to the graph.
 */

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GraphEdgeType } from "@/modules/graph/types";
import {
  DEFAULT_EDGE_TYPES,
  DIRECTION_HELP,
  DIRECTION_LABELS,
  ELIGIBLE_EDGE_TYPES,
  GRAPH_DEPTHS,
  GRAPH_DIRECTIONS,
  type GraphDepth,
  type GraphDirection,
} from "../graph/graphViewTypes";

export interface GraphControlsState {
  direction: GraphDirection;
  depth: GraphDepth;
  edgeTypes: readonly GraphEdgeType[];
  includeCandidates: boolean;
}

export function GraphControls({
  state,
  onChange,
  onReset,
  onFitView,
}: {
  state: GraphControlsState;
  onChange: (next: Partial<GraphControlsState>) => void;
  onReset: () => void;
  onFitView: () => void;
}) {
  const selected = new Set(state.edgeTypes);

  return (
    <div className="space-y-4">
      <fieldset className="space-y-1.5">
        <legend className="text-xs font-medium text-muted-foreground">Direction</legend>
        <div className="flex flex-wrap gap-1.5">
          {GRAPH_DIRECTIONS.map((d) => (
            <Button
              key={d}
              type="button"
              size="sm"
              variant={state.direction === d ? "default" : "outline"}
              aria-pressed={state.direction === d}
              onClick={() => onChange({ direction: d })}
              data-testid={`graph-direction-${d}`}
            >
              {DIRECTION_LABELS[d]}
            </Button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">{DIRECTION_HELP[state.direction]}</p>
      </fieldset>

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-medium text-muted-foreground">Traversal depth</legend>
        <div className="flex flex-wrap gap-1.5">
          {GRAPH_DEPTHS.map((d) => (
            <Button
              key={d}
              type="button"
              size="sm"
              variant={state.depth === d ? "default" : "outline"}
              aria-pressed={state.depth === d}
              aria-label={`Traversal depth ${d}`}
              onClick={() => onChange({ depth: d })}
              data-testid={`graph-depth-${d}`}
            >
              {d}
            </Button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Traversal is always bounded; depths beyond 3 are not offered.
        </p>
      </fieldset>

      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Relationship types</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between font-normal"
              aria-label={`Relationship types, ${state.edgeTypes.length} of ${ELIGIBLE_EDGE_TYPES.length} selected`}
              data-testid="graph-edge-types-trigger"
            >
              <span>
                {state.edgeTypes.length} of {ELIGIBLE_EDGE_TYPES.length} selected
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-xs font-medium text-foreground">Relationship types</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange({ edgeTypes: DEFAULT_EDGE_TYPES })}
              >
                Reset
              </Button>
            </div>
            <ScrollArea className="h-64">
              <ul className="space-y-1 p-3">
                {ELIGIBLE_EDGE_TYPES.map((t) => {
                  const id = `edge-type-${t}`;
                  return (
                    <li key={t} className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={selected.has(t)}
                        onCheckedChange={(checked) => {
                          const next = new Set(selected);
                          if (checked === true) next.add(t);
                          else next.delete(t);
                          onChange({
                            edgeTypes: ELIGIBLE_EDGE_TYPES.filter((e) => next.has(e)),
                          });
                        }}
                      />
                      <Label htmlFor={id} className="font-mono text-[11px] font-normal">
                        {t}
                      </Label>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Switch
            id="graph-candidates"
            checked={state.includeCandidates}
            onCheckedChange={(checked) => onChange({ includeCandidates: checked })}
            aria-describedby="graph-candidates-help"
            data-testid="graph-candidate-toggle"
          />
          <Label htmlFor="graph-candidates" className="text-xs font-medium">
            Include candidate relationships
          </Label>
        </div>
        <p id="graph-candidates-help" className="text-[11px] text-muted-foreground">
          Candidate relationships are weakly inferred and are excluded by default. Including them is
          a read-only preview: they are labelled as candidates, drawn with a dashed line, and are
          never treated as canonical.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          Reset view
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onFitView}>
          Fit graph to view
        </Button>
      </div>
    </div>
  );
}
