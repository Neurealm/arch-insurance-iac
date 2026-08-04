import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EmptyState } from "@/platform/components/States";
import { StatusBadge } from "@/platform/components/StatusBadge";
import {
  PRIORITY_BANDS,
  RECOMMENDATION_CATEGORIES,
  type IntelligenceRecommendation,
} from "@/modules/graph/intelligence/index";

const ANY = "__any__";
const SEVERITIES = ["critical", "high", "medium", "low", "info"] as const;
const CONFIDENCES = ["high", "medium", "low", "unable-to-verify"] as const;

/** Single advisory recommendation. Read-only: no approve, edit or execute. */
export function RecommendationCard({
  recommendation,
  onSelectEntity,
}: {
  recommendation: IntelligenceRecommendation;
  onSelectEntity?: (nodeId: string) => void;
}) {
  const r = recommendation;
  return (
    <Card data-testid="recommendation-card">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={r.priority} />
          <StatusBadge value={r.severity} />
          <StatusBadge value={r.category} tone="info" />
          <StatusBadge value={`confidence: ${r.confidence}`} tone="neutral" />
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            {r.policyId} · score {r.priorityScore}
          </span>
        </div>
        <CardTitle className="pt-1 text-sm">{r.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">{r.summary}</p>
        <div className="grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
          <div>
            Affected: {r.affected.nodeIds.length} nodes · {r.affected.moduleIds.length} modules ·{" "}
            {r.affected.routeIds.length} routes · {r.affected.capabilityIds.length} capabilities
          </div>
          <div>Complexity: {r.remediation.complexity}</div>
        </div>
        {r.affected.nodeIds.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {r.affected.nodeIds.slice(0, 8).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onSelectEntity?.(id)}
                className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
              >
                {id}
              </button>
            ))}
            {r.affected.nodeIds.length > 8 && (
              <span className="text-[11px] text-muted-foreground">+{r.affected.nodeIds.length - 8} more</span>
            )}
          </div>
        )}
        <Accordion type="single" collapsible>
          <AccordionItem value="detail" className="border-none">
            <AccordionTrigger className="py-1 text-xs">Evidence and remediation</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-foreground">Recommended remediation</div>
                <p className="text-xs text-muted-foreground">{r.remediation.action}</p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-xs text-muted-foreground">
                  {r.remediation.sequence.map((s) => (
                    <li key={s.order}>{s.action}</li>
                  ))}
                </ol>
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Supporting evidence</div>
                <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                  {r.evidence.slice(0, 10).map((e, i) => (
                    <li key={`${r.id}-ev-${i}`}>{typeof e === "string" ? e : e.detail ?? JSON.stringify(e)}</li>
                  ))}
                </ul>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Confidence rationale: {r.confidenceRationale} · Lineage hash{" "}
                <span className="font-mono">{r.lineage.graphContentHash}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

/** Filterable, read-only recommendation list. */
export function RecommendationList({
  recommendations,
  onSelectEntity,
}: {
  recommendations: readonly IntelligenceRecommendation[];
  onSelectEntity?: (nodeId: string) => void;
}) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<string>(ANY);
  const [category, setCategory] = useState<string>(ANY);
  const [severity, setSeverity] = useState<string>(ANY);
  const [confidence, setConfidence] = useState<string>(ANY);
  const [limit, setLimit] = useState(20);

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    return recommendations.filter(
      (r) =>
        (priority === ANY || r.priority === priority) &&
        (category === ANY || r.category === category) &&
        (severity === ANY || r.severity === severity) &&
        (confidence === ANY || r.confidence === confidence) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.policyId.toLowerCase().includes(q)),
    );
  }, [recommendations, text, priority, category, severity, confidence]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-5">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search recommendations…"
          aria-label="Search recommendations"
        />
        <Pick label="Priority" value={priority} onChange={setPriority} options={[...PRIORITY_BANDS]} />
        <Pick label="Category" value={category} onChange={setCategory} options={[...RECOMMENDATION_CATEGORIES]} />
        <Pick label="Severity" value={severity} onChange={setSeverity} options={[...SEVERITIES]} />
        <Pick label="Confidence" value={confidence} onChange={setConfidence} options={[...CONFIDENCES]} />
      </div>

      <div className="text-xs text-muted-foreground" data-testid="recommendation-count">
        {filtered.length} of {recommendations.length} recommendations
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No recommendations match these filters" description="Relax the filters to see advisory findings." />
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, limit).map((r) => (
            <RecommendationCard key={r.id} recommendation={r} onSelectEntity={onSelectEntity} />
          ))}
          {filtered.length > limit && (
            <Button variant="outline" size="sm" onClick={() => setLimit((l) => l + 20)}>
              Show more ({filtered.length - limit} remaining)
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Pick({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value={ANY}>{label}: any</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
