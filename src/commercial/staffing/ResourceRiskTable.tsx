import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DetailDrawer, SectionHeading, SeverityBadge, StaffStatusBadge } from "./primitives";
import type { ResourceRisk } from "@/data/staffingResourcesMockData";

export function ResourceRiskTable({
  risks,
  onUpdate,
  onAdd,
}: {
  risks: ResourceRisk[];
  onUpdate: (id: string, patch: Partial<ResourceRisk>, message: string) => void;
  onAdd: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ResourceRisk | null>(null);

  const filtered = risks.filter((r) =>
    `${r.title} ${r.owner} ${r.severity} ${r.status}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card id="resource-risks" data-guide-target="staffing-risks">
      <CardHeader className="pb-3">
        <SectionHeading
          title="Resource Risks"
          subtitle="Staffing risks requiring monitoring or leadership intervention"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search risks"
                aria-label="Search resource risks"
                className="h-9 w-48"
              />
              <Button size="sm" onClick={onAdd}>
                Add Risk
              </Button>
            </div>
          }
        />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Mitigation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">{r.title}</TableCell>
                  <TableCell><SeverityBadge severity={r.severity} /></TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{r.owner}</TableCell>
                  <TableCell className="text-muted-foreground">{r.impact}</TableCell>
                  <TableCell className="text-muted-foreground">{r.mitigation}</TableCell>
                  <TableCell><StaffStatusBadge status={r.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No risks match the current search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <DetailDrawer
        open={Boolean(selected)}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.title ?? ""}
        description={selected?.impact}
        fields={
          selected
            ? [
                { label: "Severity", value: <SeverityBadge severity={selected.severity} /> },
                { label: "Owner", value: selected.owner },
                { label: "Impact", value: selected.impact },
                { label: "Mitigation", value: selected.mitigation },
                { label: "Status", value: <StaffStatusBadge status={selected.status} /> },
              ]
            : []
        }
        footer={
          selected && (
            <>
              <Button
                size="sm"
                onClick={() => onUpdate(selected.id, { status: "Closed" }, `${selected.title} closed locally.`)}
                disabled={selected.status === "Closed"}
              >
                Close Risk
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdate(selected.id, { severity: "High", status: "Escalated" }, "Risk escalated locally.")}
              >
                Escalate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdate(selected.id, { owner: "Delivery Executive" }, "Owner reassigned locally.")}
              >
                Assign Owner
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  onUpdate(
                    selected.id,
                    { mitigation: `${selected.mitigation}; interim coverage agreed` },
                    "Mitigation updated locally.",
                  )
                }
              >
                Add Mitigation
              </Button>
            </>
          )
        }
      />
    </Card>
  );
}
