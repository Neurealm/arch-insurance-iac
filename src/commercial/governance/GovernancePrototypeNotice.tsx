import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { GOVERNANCE_META, RACI_LEGEND, type RaciMarker } from "@/data/neurealmGovernanceMockData";
import { RACI_CELL, STATUS_BADGE, STATUS_GLYPH } from "./styles";

const LEGEND_STATUSES = ["On Track", "In Progress", "Attention Required", "At Risk", "Planned"];

export function GovernancePrototypeNotice() {
  return (
    <Card className="bg-muted/30">
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legend</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {LEGEND_STATUSES.map((s) => (
              <span
                key={s}
                className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", STATUS_BADGE[s])}
              >
                <span aria-hidden="true" className="mr-1">{STATUS_GLYPH[s]}</span>
                {s}
              </span>
            ))}
            {(Object.keys(RACI_LEGEND) as Array<Exclude<RaciMarker, "">>).map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn("grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold", RACI_CELL[k])}>
                  {k}
                </span>
                {RACI_LEGEND[k]}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-md border border-border bg-card p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gv-blue" aria-hidden="true" />
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Prototype Governance View</p>
            <p className="mt-1">
              The data, dates, risks, decisions, responsibilities, readiness percentages, and governance
              metrics displayed on this screen are illustrative and are not sourced from a production
              governance system.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">Data source:</strong> Local mock data only
            </p>
            <p>
              <strong className="text-foreground">Persistence:</strong> Changes reset when the page is refreshed
            </p>
            <p className="mt-2">Last updated: {GOVERNANCE_META.lastUpdated}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
