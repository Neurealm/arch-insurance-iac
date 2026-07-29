import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  RACI_COLUMNS,
  RACI_LEGEND,
  RACI_SHORT,
  type RaciAssignment,
  type RaciMarker,
} from "@/data/neurealmGovernanceMockData";
import { SectionHeading } from "./primitives";
import { RACI_CELL } from "./styles";

function Cell({ fn, column, marker }: { fn: string; column: string; marker: RaciMarker }) {
  if (!marker) {
    return (
      <span className="text-xs text-muted-foreground">
        <span aria-hidden="true">–</span>
        <span className="sr-only">{`${column} has no assignment for ${fn}`}</span>
      </span>
    );
  }
  const label = RACI_LEGEND[marker];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            RACI_CELL[marker],
          )}
        >
          <span aria-hidden="true">{marker}</span>
          <span className="sr-only">{`${column} is ${label} for ${fn}`}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {column} is <strong>{label}</strong> for {fn}
      </TooltipContent>
    </Tooltip>
  );
}

function Matrix({ raci, showDescription }: { raci: RaciAssignment[]; showDescription?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <caption className="sr-only">
          RACI matrix of key governance functions by accountable group
        </caption>
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold">
              Function
            </th>
            {showDescription && (
              <th scope="col" className="px-3 py-2 text-left text-xs font-semibold">
                Description
              </th>
            )}
            {RACI_COLUMNS.map((c) => (
              <th key={c} scope="col" className="px-2 py-2 text-center text-[11px] font-semibold">
                {RACI_SHORT[c]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {raci.map((row) => (
            <tr key={row.fn} className="border-b border-border last:border-0">
              <th scope="row" className="px-3 py-2 text-left text-xs font-medium text-foreground">
                {row.fn}
              </th>
              {showDescription && (
                <td className="px-3 py-2 text-xs text-muted-foreground">{row.description}</td>
              )}
              {RACI_COLUMNS.map((c) => (
                <td key={c} className="px-2 py-2 text-center">
                  <div className="flex justify-center">
                    <Cell fn={row.fn} column={c} marker={row.cells[c] ?? ""} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      {(Object.keys(RACI_LEGEND) as Array<Exclude<RaciMarker, "">>).map((k) => (
        <li key={k} className="flex items-center gap-1.5">
          <span className={cn("grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold", RACI_CELL[k])}>
            {k}
          </span>
          {RACI_LEGEND[k]}
        </li>
      ))}
    </ul>
  );
}

export function RaciSnapshot({ raci }: { raci: RaciAssignment[] }) {
  const [open, setOpen] = useState(false);
  return (
    <TooltipProvider delayDuration={150}>
      <Card id="raci">
        <CardHeader className="space-y-3">
          <SectionHeading
            title="RACI Snapshot, Key Functions"
            subtitle="Decision rights and accountability across governance groups"
            actions={
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                View Full RACI Matrix
              </Button>
            }
          />
          <Legend />
        </CardHeader>
        <CardContent>
          <Matrix raci={raci} />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-6xl overflow-auto">
          <DialogHeader>
            <DialogTitle>Full RACI Matrix</DialogTitle>
            <DialogDescription>
              Complete accountability model, including the scope description for each governance function.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Legend />
            <Matrix raci={raci} showDescription />
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
