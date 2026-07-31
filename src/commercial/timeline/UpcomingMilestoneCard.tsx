import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MOCK_TODAY, type Milestone } from "@/data/programTimelineMockData";
import { daysBetween, formatDate } from "./dates";
import { statusBadgeClass, statusGlyph } from "./styles";
import { Bell, CalendarClock } from "lucide-react";

interface Props {
  milestone: Milestone;
  onViewDetails: (m: Milestone) => void;
  onSendReminder: (m: Milestone) => void;
}

export function UpcomingMilestoneCard({ milestone, onViewDetails, onSendReminder }: Props) {
  const days = daysBetween(MOCK_TODAY, milestone.date);
  return (
    <Card data-guide-target="timelines-upcoming" className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <CalendarClock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Upcoming Milestone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <div className="text-lg font-semibold leading-tight">{milestone.name}</div>
          <p className="mt-1 text-muted-foreground">{milestone.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{formatDate(milestone.date)}</Badge>
          <Badge variant="outline">{milestone.owner}</Badge>
          <Badge variant="outline" className={statusBadgeClass(milestone.status)}>
            <span aria-hidden="true" className="mr-1">{statusGlyph(milestone.status)}</span>
            {milestone.status}
          </Badge>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Countdown
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            {days >= 0 ? `${days} days` : `${Math.abs(days)} days overdue`}
          </div>
          <div className="text-xs text-muted-foreground">From mock today, {formatDate(MOCK_TODAY)}</div>
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
          <p className="mt-1 text-muted-foreground">{milestone.dependency}</p>
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
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onViewDetails(milestone)}>
            View Details
          </Button>
          <Button size="sm" variant="outline" onClick={() => onSendReminder(milestone)}>
            <Bell className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Send Reminder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
