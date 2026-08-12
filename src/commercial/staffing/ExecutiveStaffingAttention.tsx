import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { EXECUTIVE_ATTENTION, EXECUTIVE_STAFFING_UPDATE } from "@/data/staffingResourcesMockData";

export function ExecutiveStaffingAttention({
  onViewGaps,
  onOpenPositions,
  onReviewRisks,
}: {
  onViewGaps: () => void;
  onOpenPositions: () => void;
  onReviewRisks: () => void;
}) {
  const [open, setOpen] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EXECUTIVE_STAFFING_UPDATE);
      toast.success("Executive staffing update copied to the clipboard.");
    } catch {
      toast.error("Copy is unavailable in this browser context.");
    }
  };

  return (
    <Card data-guide-target="staffing-executive-attention" className="border-gv-warning/40 bg-gv-warning-soft/40">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-gv-warning" aria-hidden="true" />
          Executive Staffing Attention Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
          {EXECUTIVE_ATTENTION.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onViewGaps}>
            View Priority Gaps
          </Button>
          <Button size="sm" variant="outline" onClick={onOpenPositions}>
            Open Positions
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>
            Prepare Staffing Update
          </Button>
          <Button size="sm" variant="outline" onClick={onReviewRisks}>
            Review Resource Risks
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Executive Staffing Update</DialogTitle>
              <DialogDescription>Generated from the current mock staffing dataset.</DialogDescription>
            </DialogHeader>
            <p className="rounded-md border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
              {EXECUTIVE_STAFFING_UPDATE}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button onClick={copy}>Copy Summary</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
