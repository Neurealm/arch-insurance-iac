import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { EmptyState } from "@/platform/components/States";
import { useMemo, useState } from "react";
import {
  PRIORITY_BANDS,
  RECOMMENDATION_CATEGORIES,
  type IntelligenceRecommendation,
} from "@/modules/graph/intelligence/index";

const ANY = "__any__";

/**
 * Stage 1 — choose the recommendation to remediate.
 *
 * Read-only selection: choosing a recommendation only seeds proposal
 * generation, it never changes the recommendation itself.
 */
export function RecommendationPicker({
  recommendations,
  selectedId,
  onSelect,
  disabled,
}: {
  recommendations: readonly IntelligenceRecommendation[];
  selectedId: string | null;
  onSelect: (recommendation: IntelligenceRecommendation) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState(ANY);
  const [category, setCategory] = useState(ANY);
  const [limit, setLimit] = useState(10);

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    return recommendations.filter(
      (r) =>
        (priority === ANY || r.priority === priority) &&
        (category === ANY || r.category === category) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.policyId.toLowerCase().includes(q)),
    );
  }, [recommendations, text, priority, category]);

  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search recommendations…"
          aria-label="Search recommendations to remediate"
        />
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Priority: any</SelectItem>
            {PRIORITY_BANDS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Category: any</SelectItem>
            {RECOMMENDATION_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-muted-foreground" role="status" aria-live="polite">
        {filtered.length} of {recommendations.length} recommendations
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No recommendations match these filters"
          description="Relax the filters to choose a recommendation to remediate."
        />
      ) : (
        <ul className="space-y-2">
          {filtered.slice(0, limit).map((r) => {
            const active = r.id === selectedId;
            return (
              <li key={r.id}>
                <Card
                  data-testid="remediation-recommendation-option"
                  data-selected={active}
                  className={active ? "border-primary" : undefined}
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={r.priority} label={`Priority: ${r.priority}`} />
                      <StatusBadge value={r.category} tone="info" label={`Category: ${r.category}`} />
                      <StatusBadge value={r.severity} label={`Severity: ${r.severity}`} />
                      <span className="ml-auto font-mono text-[11px] text-muted-foreground">{r.id}</span>
                    </div>
                    <CardTitle className="pt-1 text-sm">{r.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">{r.summary}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={active ? "default" : "outline"}
                        disabled={disabled}
                        onClick={() => onSelect(r)}
                        aria-pressed={active}
                      >
                        {active ? "Selected" : "Remediate this"}
                      </Button>
                      <span className="text-[11px] text-muted-foreground">
                        Complexity: {r.remediation.complexity}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length > limit && (
        <Button variant="outline" size="sm" onClick={() => setLimit((l) => l + 10)}>
          Show more ({filtered.length - limit} remaining)
        </Button>
      )}
    </div>
  );
}
