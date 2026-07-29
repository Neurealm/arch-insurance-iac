import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  DEPENDENCIES,
  SCHEDULE_INSIGHTS,
  SCHEDULE_RISKS,
  type TimelineActivity,
} from "@/data/programTimelineMockData";
import { statusBadgeClass } from "./styles";

interface Props {
  activities: TimelineActivity[];
}

export function ScheduleIntelligence({ activities }: Props) {
  const [open, setOpen] = useState(true);
  const byId = Object.fromEntries(activities.map((a) => [a.id, a]));
  const atRisk = activities.filter((a) => a.status === "At Risk");
  const criticalPath = activities.filter((a) => a.criticalPath);
  const blocked = DEPENDENCIES.filter((d) => byId[d.fromActivityId]?.status === "At Risk");

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Schedule Intelligence</CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Toggle schedule intelligence section">
              {open ? "Collapse" : "Expand"}
              <ChevronDown className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <Tabs defaultValue="risks">
              <TabsList>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="risks" className="mt-4 grid gap-3 md:grid-cols-3">
                {SCHEDULE_RISKS.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{r.title}</p>
                      <Badge
                        variant="outline"
                        className={r.severity === "High" ? statusBadgeClass("At Risk") : statusBadgeClass("In Progress")}
                      >
                        {r.severity}
                      </Badge>
                    </div>
                    <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <div><dt className="inline font-medium text-foreground">Impact: </dt><dd className="inline">{r.impact}</dd></div>
                      <div><dt className="inline font-medium text-foreground">Owner: </dt><dd className="inline">{r.owner}</dd></div>
                      <div><dt className="inline font-medium text-foreground">Mitigation: </dt><dd className="inline">{r.mitigation}</dd></div>
                    </dl>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="dependencies" className="mt-4 space-y-4 text-sm">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="Total dependencies" value={DEPENDENCIES.length} />
                  <Stat label="Blocked activities" value={blocked.length} />
                  <Stat label="Activities at risk" value={atRisk.length} />
                  <Stat label="Critical path items" value={criticalPath.length} />
                </div>
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {DEPENDENCIES.map((d) => (
                    <li key={d.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-xs">
                      <Badge variant="secondary" className="font-normal">Upstream</Badge>
                      <span className="font-medium">{byId[d.fromActivityId]?.name ?? d.fromActivityId}</span>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="secondary" className="font-normal">Downstream</Badge>
                      <span className="font-medium">{byId[d.toActivityId]?.name ?? d.toActivityId}</span>
                      <span className="ml-auto text-muted-foreground">{d.type.replace(/-/g, " ")}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="insights" className="mt-4 space-y-3 text-sm">
                <p className="text-xs text-muted-foreground">
                  Simulated insights generated from prototype rules. Not derived from live program data.
                </p>
                <ul className="space-y-2">
                  {SCHEDULE_INSIGHTS.map((i) => (
                    <li key={i.id} className="rounded-lg border border-border p-3">
                      <Badge variant="outline" className="mr-2 font-normal">Simulated</Badge>
                      {i.text}
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
