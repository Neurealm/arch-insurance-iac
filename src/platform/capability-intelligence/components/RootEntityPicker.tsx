/**
 * Stage 3.5.4.2 — local root entity selector.
 *
 * A scoped Popover + Command surface over the existing ranked lexical search
 * (`GraphQueryEngine.search`). It is not a global command palette, it does not
 * introduce fuzzy matching, and it never renders all 1,291 nodes: results are
 * bounded by `ROOT_SEARCH_LIMIT` and truncation is stated.
 */

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatusBadge } from "@/platform/components/StatusBadge";
import type { GraphQueryEngine } from "@/modules/graph/query/index";
import type { GraphNode } from "@/modules/graph/types";
import { registrationOf } from "../graph/reactFlowAdapter";

/** Bounded result set. Keeps the list readable and the render cheap. */
export const ROOT_SEARCH_LIMIT = 25;

interface RootMatch {
  node: GraphNode;
  registration: string;
}

/**
 * Deterministic, bounded lookup. An empty term falls back to the graph's
 * highest-value entry points (capability-family nodes) rather than everything.
 */
export function searchRootCandidates(
  engine: GraphQueryEngine,
  term: string,
): { matches: readonly RootMatch[]; totalAvailable: number; truncated: boolean } {
  const trimmed = term.trim();
  const result = trimmed
    ? engine.search(trimmed, { limit: ROOT_SEARCH_LIMIT })
    : engine.findNodes(
        { nodeTypes: ["capability", "platform-capability", "shared-capability", "sub-capability"] },
        { limit: ROOT_SEARCH_LIMIT },
      );
  return {
    matches: result.results.map((node) => ({ node, registration: registrationOf(node) })),
    totalAvailable: result.totalAvailable,
    truncated: result.truncated,
  };
}

export function RootEntityPicker({
  engine,
  rootId,
  rootLabel,
  onSelect,
}: {
  engine: GraphQueryEngine;
  rootId: string | null;
  rootLabel: string;
  onSelect: (nodeId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  const { matches, totalAvailable, truncated } = useMemo(
    () => searchRootCandidates(engine, term),
    [engine, term],
  );

  return (
    <div className="space-y-1">
      <span id="graph-root-label" className="text-xs font-medium text-muted-foreground">
        Root entity
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-labelledby="graph-root-label"
            className="w-full justify-between font-normal"
            data-testid="graph-root-trigger"
          >
            <span className="truncate">{rootLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(28rem,90vw)] p-0" align="start">
          {/* Ranked lexical search comes from the engine; cmdk must not re-rank. */}
          <Command shouldFilter={false}>
            <CommandInput
              value={term}
              onValueChange={setTerm}
              placeholder="Search by label, identifier, route or description…"
              aria-label="Search graph entities"
            />
            <CommandList>
              <CommandEmpty>No entity matches this search.</CommandEmpty>
              <CommandGroup
                heading={
                  truncated
                    ? `Showing ${matches.length} of ${totalAvailable} matches — refine the search to narrow`
                    : `${matches.length} ${matches.length === 1 ? "match" : "matches"}`
                }
              >
                {matches.map((m) => (
                  <CommandItem
                    key={m.node.id}
                    value={m.node.id}
                    onSelect={() => {
                      onSelect(m.node.id);
                      setOpen(false);
                    }}
                    className="flex items-start gap-2"
                  >
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${m.node.id === rootId ? "opacity-100" : "opacity-0"}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">{m.node.label}</span>
                      <span className="block truncate font-mono text-[10px] text-muted-foreground">
                        {m.node.id}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1">
                        <StatusBadge value={m.node.type} tone="info" />
                        <StatusBadge value={m.node.moduleId ?? "unassigned"} tone="neutral" />
                        <StatusBadge value={m.registration} />
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
