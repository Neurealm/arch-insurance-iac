import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BoundedList } from "../remediation/BoundedList";
import type { EvidenceSection } from "../../review/reviewPackage";

/**
 * Stage 3.5.4.4 — review evidence package.
 *
 * Organised by source, bounded per section, and every item keeps the canonical
 * identifier the engine assigned it, so a reviewer can trace any conclusion.
 */
export function EvidencePackagePanel({ sections }: { sections: readonly EvidenceSection[] }) {
  const total = sections.reduce((sum, s) => sum + s.items.length, 0);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm" id="evidence-package-heading">
          Review evidence package ({total})
        </CardTitle>
        <p className="text-xs text-muted-foreground" data-testid="evidence-summary">
          {total} evidence item{total === 1 ? "" : "s"} across {sections.length} source section
          {sections.length === 1 ? "" : "s"}. Each item retains its canonical identifier.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => (
          <section
            key={section.id}
            aria-labelledby={`evidence-${section.id}`}
            data-testid={`evidence-section-${section.id}`}
            data-count={section.items.length}
            className="rounded border border-border p-3"
          >
            <h4 id={`evidence-${section.id}`} className="text-xs font-semibold text-foreground">
              {section.title} ({section.items.length})
            </h4>
            <div className="mt-2">
              <BoundedList
                items={section.items}
                label={`${section.title} evidence items`}
                testId={`evidence-list-${section.id}`}
                keyFor={(item, index) => `${item.id}:${index}`}
                emptyText={`No ${section.title.toLowerCase()} evidence was recorded for this plan.`}
                renderItem={(item) => (
                  <div className="text-xs text-muted-foreground" data-testid="evidence-item">
                    <span className="font-mono text-[11px]">{item.id}</span> — {item.statement}
                    {item.detail && <span className="block text-[11px]">{item.detail}</span>}
                  </div>
                )}
              />
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
