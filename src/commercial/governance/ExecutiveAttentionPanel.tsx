import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecutiveAttentionItem } from "@/data/neurealmGovernanceMockData";
import { SectionHeading } from "./primitives";

export function ExecutiveAttentionPanel({
  items,
  summaryText,
  onNavigate,
  onCopySummary,
}: {
  items: ExecutiveAttentionItem[];
  summaryText: string;
  onNavigate: (target: string) => void;
  onCopySummary: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(summaryText);

  return (
    <Card id="attention" className="border-l-4 border-l-gv-warning bg-gv-warning-soft/40">
      <CardHeader>
        <SectionHeading
          title="Executive Attention Required"
          subtitle="Highest-priority items for Neurealm leadership this governance cycle"
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id} className="flex items-start gap-2 text-sm text-foreground">
              <AlertTriangle
                className={cn("mt-0.5 h-4 w-4 shrink-0", i.severity === "High" ? "text-gv-risk" : "text-gv-warning")}
                aria-hidden="true"
              />
              <span>
                <span className="sr-only">{i.severity} priority: </span>
                {i.text}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onNavigate("attention")}>
            View Priority Actions
          </Button>
          <Button size="sm" variant="outline" onClick={() => onNavigate("decisions")}>
            Open Decision Register
          </Button>
          <Button size="sm" variant="outline" onClick={() => onNavigate("risks")}>
            Open Risk Register
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setDraft(summaryText);
              setOpen(true);
            }}
          >
            Prepare Executive Update
          </Button>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Executive Update</DialogTitle>
            <DialogDescription>
              Generated from the current local governance data. Illustrative only.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={12}
            aria-label="Executive update summary"
            className="text-sm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            <Button onClick={() => onCopySummary(draft)}>Copy summary</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
