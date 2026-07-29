import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Milestone } from "@/data/programTimelineMockData";
import { formatDate } from "./dates";
import { statusBadgeClass, statusGlyph } from "./styles";

interface Props {
  milestone: Milestone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFeature: (m: Milestone) => void;
  onComplete: (m: Milestone) => void;
}

export function MilestoneDetailDialog({ milestone, open, onOpenChange, onFeature, onComplete }: Props) {
  if (!milestone) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{milestone.name}</DialogTitle>
          <DialogDescription>{milestone.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={statusBadgeClass(milestone.status)}>
              <span aria-hidden="true" className="mr-1">{statusGlyph(milestone.status)}</span>
              {milestone.status}
            </Badge>
            <Badge variant="outline">{formatDate(milestone.date)}</Badge>
            <Badge variant="outline">{milestone.owner}</Badge>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Readiness
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Progress value={milestone.readiness} className="h-2" aria-label={`Readiness ${milestone.readiness} percent`} />
              <span className="text-xs tabular-nums">{milestone.readiness}%</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Dependencies
            </div>
            <p className="mt-1">{milestone.dependency}</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Required actions
            </div>
            {milestone.requiredActions.length === 0 ? (
              <p className="mt-1 text-muted-foreground">None outstanding.</p>
            ) : (
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {milestone.requiredActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button size="sm" variant="outline" onClick={() => onFeature(milestone)}>
            Feature in upcoming panel
          </Button>
          <Button size="sm" onClick={() => onComplete(milestone)} disabled={milestone.status === "Completed"}>
            Mark Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
