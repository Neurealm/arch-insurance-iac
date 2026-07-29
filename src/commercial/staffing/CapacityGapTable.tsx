import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DetailDrawer, SectionHeading, SeverityBadge, StaffStatusBadge } from "./primitives";
import type { CapacityGap } from "@/data/staffingResourcesMockData";

const GAP_ACTIONS = [
  "Assign Internal Resource",
  "Add Contractor",
  "Start Hiring",
  "Request CoE Support",
  "Accept Risk",
  "Adjust Demand",
];

export function CapacityGapTable({
  gaps,
  onAction,
}: {
  gaps: CapacityGap[];
  onAction: (gap: CapacityGap, action: string) => void;
}) {
  const [selected, setSelected] = useState<CapacityGap | null>(null);

  return (
    <Card>
      <CardHeader className="pb-3">
        <SectionHeading
          title="Capacity and Demand Gaps"
          subtitle="Simulated shortfalls between forecast demand and available capacity"
        />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead className="text-right">Demand</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Gap</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Required by</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gaps.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium text-foreground">{g.area}</TableCell>
                  <TableCell className="text-right tabular-nums">{g.demand.toFixed(1)}</TableCell>
                  <TableCell className="text-right tabular-nums">{g.available.toFixed(1)}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{g.gap.toFixed(1)}</TableCell>
                  <TableCell><SeverityBadge severity={g.severity} /></TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{g.requiredBy}</TableCell>
                  <TableCell className="text-muted-foreground">{g.strategy}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{g.owner}</TableCell>
                  <TableCell><StaffStatusBadge status={g.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(g)}>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <DetailDrawer
        open={Boolean(selected)}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.area ?? ""}
        description={selected?.strategy}
        fields={
          selected
            ? [
                { label: "Demand", value: `${selected.demand.toFixed(1)} FTEs` },
                { label: "Available", value: `${selected.available.toFixed(1)} FTEs` },
                { label: "Gap", value: `${selected.gap.toFixed(1)} FTEs` },
                { label: "Severity", value: <SeverityBadge severity={selected.severity} /> },
                { label: "Required by", value: selected.requiredBy },
                { label: "Owner", value: selected.owner },
                { label: "Status", value: <StaffStatusBadge status={selected.status} /> },
              ]
            : []
        }
        footer={
          selected &&
          GAP_ACTIONS.map((a) => (
            <Button key={a} size="sm" variant="outline" onClick={() => onAction(selected, a)}>
              {a}
            </Button>
          ))
        }
      />
    </Card>
  );
}
