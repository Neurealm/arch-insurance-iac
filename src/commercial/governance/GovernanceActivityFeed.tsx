import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { GovernanceActivity } from "@/data/neurealmGovernanceMockData";
import { SectionHeading } from "./primitives";

export function GovernanceActivityFeed({ activity }: { activity: GovernanceActivity[] }) {
  const [category, setCategory] = useState("all");
  const categories = useMemo(() => Array.from(new Set(activity.map((a) => a.category))), [activity]);
  const rows = activity.filter((a) => category === "all" || a.category === category);

  return (
    <Card id="activity" data-guide-target="governance-activity">
      <CardHeader>
        <SectionHeading
          title="Recent Governance Activity"
          subtitle="Local activity log for this governance prototype session"
          actions={
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]" aria-label="Filter activity by type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All activity</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {rows.map((a) => (
            <li key={a.id} className="flex flex-wrap items-start gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
              <Badge variant="outline" className="shrink-0 text-[10px]">
                {a.category}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{a.action}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.actor} · {a.relatedItem} · {a.timestamp}
                </p>
              </div>
            </li>
          ))}
          {rows.length === 0 && <li className="text-sm text-muted-foreground">No activity for this filter.</li>}
        </ol>
      </CardContent>
    </Card>
  );
}
