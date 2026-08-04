import { useMemo } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { EmptyState } from "@/platform/components/States";
import type { GraphQueryEngine } from "@/modules/graph/query/index";
import type { IntelligenceResult } from "@/modules/graph/intelligence/index";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

/** Read-only detail drawer for a single graph entity. */
export function EntityDrawer({
  nodeId,
  engine,
  intelligence,
  onOpenChange,
  onSelectEntity,
}: {
  nodeId: string | null;
  engine: GraphQueryEngine;
  intelligence: IntelligenceResult;
  onOpenChange: (open: boolean) => void;
  onSelectEntity?: (nodeId: string) => void;
}) {
  const node = nodeId ? engine.getNode(nodeId) : null;

  const detail = useMemo(() => {
    if (!node) return null;
    const neighbors = engine.getNeighbors(node.id, { maxDepth: 1 }).results;
    const dependencies = engine.getDependencies(node.id, { maxDepth: 1 }).results;
    const dependents = engine.getDependents(node.id, { maxDepth: 1 }).results;
    const ancestors = engine.getAncestors(node.id, { maxDepth: 3 }).results;
    const recs = intelligence.recommendations.filter((r) => r.affected.nodeIds.includes(node.id));
    const findings = intelligence.findings.filter(
      (f) => f.subject === node.id || f.evidence.some((e) => e.subject === node.id || (e.nodeIds ?? []).includes(node.id)),
    );
    return { neighbors, dependencies, dependents, ancestors, recs, findings };
  }, [node, engine, intelligence]);

  return (
    <Sheet open={!!nodeId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        {!node || !detail ? (
          <div className="pt-10">
            <EmptyState title="Entity not found" description="This node is not present in the current graph snapshot." />
          </div>
        ) : (
          <>
            <SheetHeader className="pr-6">
              <SheetTitle className="text-base">{node.label}</SheetTitle>
              <SheetDescription className="font-mono text-[11px]">{node.id}</SheetDescription>
            </SheetHeader>
            <ScrollArea className="mt-4 h-[calc(100dvh-8rem)] pr-4">
              <div className="space-y-5 pb-10">
                <Section title="Identity">
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge value={node.type} tone="info" />
                    <StatusBadge value={node.ownership} />
                    <StatusBadge value={node.confidence} />
                    <StatusBadge value={node.source} tone="neutral" />
                  </div>
                  {node.description && <p className="text-sm text-muted-foreground">{node.description}</p>}
                  {node.filePath && <p className="font-mono text-[11px] text-muted-foreground">{node.filePath}</p>}
                </Section>

                <Separator />
                <Section title="Owners">
                  <p className="text-sm text-foreground">{node.moduleId ?? "Unassigned"}</p>
                </Section>

                <Section title="Registration">
                  <StatusBadge
                    value={
                      node.attributes.registered === false
                        ? "unregistered"
                        : node.attributes.registered === true
                          ? "registered"
                          : "n/a"
                    }
                  />
                </Section>

                <Section title="Traceability">
                  <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                    {node.evidence.length === 0 && <li>No declared evidence references.</li>}
                    {node.evidence.slice(0, 12).map((e) => (
                      <li key={e} className="font-mono">
                        {e}
                      </li>
                    ))}
                  </ul>
                </Section>

                <Separator />
                <Section title={`Relationships (${detail.neighbors.length})`}>
                  <NodeList
                    items={detail.neighbors.map((h) => ({ id: h.node.id, label: h.node.label, meta: h.node.type }))}
                    onSelect={onSelectEntity}
                  />
                </Section>

                <Section title={`Dependencies (${detail.dependencies.length})`}>
                  <NodeList
                    items={detail.dependencies.map((h) => ({ id: h.node.id, label: h.node.label, meta: h.node.type }))}
                    onSelect={onSelectEntity}
                  />
                </Section>

                <Section title={`Dependents (${detail.dependents.length})`}>
                  <NodeList
                    items={detail.dependents.map((h) => ({ id: h.node.id, label: h.node.label, meta: h.node.type }))}
                    onSelect={onSelectEntity}
                  />
                </Section>

                <Section title="Lineage">
                  <NodeList
                    items={detail.ancestors.map((h) => ({ id: h.node.id, label: h.node.label, meta: h.node.type }))}
                    onSelect={onSelectEntity}
                    empty="No parent lineage recorded."
                  />
                </Section>

                <Separator />
                <Section title={`Reasoning summary (${detail.findings.length} findings)`}>
                  <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                    {detail.findings.length === 0 && <li>No reasoning findings reference this entity.</li>}
                    {detail.findings.slice(0, 8).map((f) => (
                      <li key={f.id}>
                        <span className="text-foreground">{f.analysis}</span> · {f.severity} — {f.summary}
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title={`Recommendations (${detail.recs.length})`}>
                  <ul className="space-y-1.5">
                    {detail.recs.length === 0 && (
                      <li className="text-xs text-muted-foreground">No open recommendations for this entity.</li>
                    )}
                    {detail.recs.slice(0, 10).map((r) => (
                      <li key={r.id} className="rounded border border-border p-2">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge value={r.priority} />
                          <StatusBadge value={r.category} tone="info" />
                        </div>
                        <div className="mt-1 text-xs text-foreground">{r.title}</div>
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function NodeList({
  items,
  onSelect,
  empty = "None recorded.",
}: {
  items: readonly { id: string; label: string; meta: string }[];
  onSelect?: (id: string) => void;
  empty?: string;
}) {
  if (items.length === 0) return <p className="text-xs text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-1">
      {items.slice(0, 25).map((i) => (
        <li key={i.id}>
          <button
            type="button"
            onClick={() => onSelect?.(i.id)}
            className="w-full truncate rounded px-1.5 py-1 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <span className="text-foreground">{i.label}</span>{" "}
            <span className="text-[10px] uppercase">{i.meta}</span>
          </button>
        </li>
      ))}
      {items.length > 25 && <li className="text-[11px] text-muted-foreground">+{items.length - 25} more</li>}
    </ul>
  );
}
