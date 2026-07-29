import { Fragment, useMemo, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEPENDENCIES,
  MILESTONES,
  MOCK_TODAY,
  TIMELINE_GROUPS,
  type TimelineActivity,
} from "@/data/programTimelineMockData";
import { CATEGORY_BAR, CATEGORY_FILL, categoryToken, statusGlyph } from "./styles";
import { daysBetween, formatDate, formatShort, headerCells, offsetPct, widthPct, ZOOM_TRACK_WIDTH, type ZoomLevel } from "./dates";

const ROW_H = 40;
const GROUP_H = 34;
const LABEL_W = 260;

interface Props {
  activities: TimelineActivity[];
  collapsedGroups: string[];
  onToggleGroup: (id: string) => void;
  zoom: ZoomLevel;
  showDependencies: boolean;
  highlightCriticalPath: boolean;
  showMilestones: boolean;
  selectedActivityId: string | null;
  onSelectActivity: (a: TimelineActivity) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

type Row =
  | { kind: "group"; id: string; name: string; count: number; top: number }
  | { kind: "activity"; activity: TimelineActivity; top: number };

export function IntegratedTimeline({
  activities,
  collapsedGroups,
  onToggleGroup,
  zoom,
  showDependencies,
  highlightCriticalPath,
  showMilestones,
  selectedActivityId,
  onSelectActivity,
  scrollRef,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackWidth = ZOOM_TRACK_WIDTH[zoom];
  const cells = useMemo(() => headerCells(zoom), [zoom]);

  const { rows, height, activityTop } = useMemo(() => {
    const out: Row[] = [];
    const tops: Record<string, number> = {};
    let y = 0;
    TIMELINE_GROUPS.forEach((g) => {
      const items = activities.filter((a) => a.groupId === g.id);
      if (items.length === 0) return;
      out.push({ kind: "group", id: g.id, name: g.name, count: items.length, top: y });
      y += GROUP_H;
      if (!collapsedGroups.includes(g.id)) {
        items.forEach((a) => {
          out.push({ kind: "activity", activity: a, top: y });
          tops[a.id] = y;
          y += ROW_H;
        });
      }
    });
    return { rows: out, height: y, activityTop: tops };
  }, [activities, collapsedGroups]);

  const visibleIds = new Set(activities.map((a) => a.id));
  const connectors = showDependencies
    ? DEPENDENCIES.filter(
        (d) =>
          activityTop[d.fromActivityId] !== undefined && activityTop[d.toActivityId] !== undefined && visibleIds.has(d.fromActivityId) && visibleIds.has(d.toActivityId)
      )
    : [];

  const byId = useMemo(() => Object.fromEntries(activities.map((a) => [a.id, a])), [activities]);

  return (
    <TooltipProvider delayDuration={150}>
      <div ref={scrollRef} className="overflow-x-auto">
        <div className="min-w-full" style={{ width: LABEL_W + trackWidth }}>
          {/* Header */}
          <div className="flex border-b border-border bg-muted/40">
            <div
              className="sticky left-0 z-20 shrink-0 border-r border-border bg-muted/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              style={{ width: LABEL_W }}
            >
              Lane / Activity
            </div>
            <div className="relative" style={{ width: trackWidth, height: 34 }}>
              {cells.map((c) => (
                <div
                  key={c.key}
                  className="absolute top-0 flex h-full items-center border-l border-border/70 pl-2 text-xs font-medium text-muted-foreground"
                  style={{ left: `${c.leftPct}%`, width: `${c.widthPct}%` }}
                >
                  <span className="truncate">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex">
            <div className="sticky left-0 z-20 shrink-0 border-r border-border bg-card" style={{ width: LABEL_W }}>
              {rows.map((row) =>
                row.kind === "group" ? (
                  <button
                    key={`lg-${row.id}`}
                    type="button"
                    onClick={() => onToggleGroup(row.id)}
                    aria-expanded={!collapsedGroups.includes(row.id)}
                    className="flex w-full items-center gap-1.5 border-b border-border bg-muted/40 px-3 text-left text-[11px] font-semibold uppercase tracking-wider text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    style={{ height: GROUP_H }}
                  >
                    {collapsedGroups.includes(row.id) ? (
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span className="truncate">{row.name}</span>
                    <span className="ml-auto text-[10px] font-normal normal-case text-muted-foreground">
                      {row.count}
                    </span>
                  </button>
                ) : (
                  <div
                    key={`la-${row.activity.id}`}
                    className={cn(
                      "flex items-center gap-2 border-b border-border/70 px-3 text-sm",
                      selectedActivityId === row.activity.id && "bg-accent"
                    )}
                    style={{ height: ROW_H }}
                  >
                    <span
                      className={cn("h-2 w-2 shrink-0 rounded-full", CATEGORY_FILL[categoryToken(row.activity.category)])}
                      aria-hidden="true"
                    />
                    <span className="truncate text-foreground">{row.activity.name}</span>
                  </div>
                )
              )}
              {rows.length === 0 && (
                <div className="px-3 py-6 text-sm text-muted-foreground">No activities match the filters.</div>
              )}
            </div>

            <div ref={trackRef} className="relative" style={{ width: trackWidth, height: Math.max(height, 80) }}>
              {/* Column grid */}
              {cells.map((c) => (
                <div
                  key={`g-${c.key}`}
                  className="absolute top-0 h-full border-l border-border/50"
                  style={{ left: `${c.leftPct}%` }}
                  aria-hidden="true"
                />
              ))}

              {/* Row separators */}
              {rows.map((row) => (
                <div
                  key={`sep-${row.kind === "group" ? row.id : row.activity.id}`}
                  className={cn("absolute left-0 w-full border-b border-border/70", row.kind === "group" && "bg-muted/40")}
                  style={{ top: row.top, height: row.kind === "group" ? GROUP_H : ROW_H }}
                  aria-hidden="true"
                />
              ))}

              {/* Dependency connectors */}
              {connectors.length > 0 && (
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  aria-hidden="true"
                  role="presentation"
                >
                  <defs>
                    <marker id="tl-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--muted-foreground))" />
                    </marker>
                  </defs>
                  {connectors.map((d) => {
                    const from = byId[d.fromActivityId];
                    const to = byId[d.toActivityId];
                    if (!from || !to) return null;
                    const x1 = ((offsetPct(from.end) + widthPct(from.start, from.end) * 0) / 100) * trackWidth + (widthPct(from.start, from.end) / 100) * trackWidth * 0;
                    const startX = (offsetPct(from.start) / 100) * trackWidth + (widthPct(from.start, from.end) / 100) * trackWidth;
                    const endX = (offsetPct(to.start) / 100) * trackWidth;
                    const y1 = activityTop[from.id] + ROW_H / 2;
                    const y2 = activityTop[to.id] + ROW_H / 2;
                    const mid = Math.max(startX + 10, endX - 10);
                    return (
                      <path
                        key={d.id}
                        d={`M ${startX} ${y1} H ${mid} V ${y2} H ${endX}`}
                        fill="none"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        markerEnd="url(#tl-arrow)"
                        data-x1={x1}
                      />
                    );
                  })}
                </svg>
              )}

              {/* Bars */}
              {rows.map((row) => {
                if (row.kind !== "activity") return null;
                const a = row.activity;
                const token = a.status === "At Risk" ? "risk" : a.status === "Completed" ? "complete" : categoryToken(a.category);
                const dimmed = highlightCriticalPath && !a.criticalPath;
                return (
                  <Tooltip key={a.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onSelectActivity(a)}
                        aria-label={`${a.name}. ${a.category}. Owner ${a.owner}. ${formatDate(a.start)} to ${formatDate(a.end)}. Status ${a.status}. Progress ${a.progress} percent.`}
                        className={cn(
                          "absolute overflow-hidden rounded-md border text-left text-[11px] font-medium shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          CATEGORY_BAR[token],
                          dimmed && "opacity-35",
                          selectedActivityId === a.id && "ring-2 ring-ring"
                        )}
                        style={{
                          top: row.top + 8,
                          height: ROW_H - 16,
                          left: `${offsetPct(a.start)}%`,
                          width: `${widthPct(a.start, a.end)}%`,
                        }}
                      >
                        <span
                          className={cn("absolute inset-y-0 left-0 opacity-30", CATEGORY_FILL[token])}
                          style={{ width: `${a.progress}%` }}
                          aria-hidden="true"
                        />
                        <span className="relative flex h-full items-center justify-center gap-1 truncate px-2">
                          <span aria-hidden="true">{statusGlyph(a.status)}</span>
                          <span className="truncate">
                            {formatShort(a.start)} – {formatShort(a.end)}
                          </span>
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs space-y-1 text-xs">
                      <p className="text-sm font-semibold">{a.name}</p>
                      <p>Owner: {a.owner}</p>
                      <p>Start: {formatDate(a.start)}</p>
                      <p>End: {formatDate(a.end)}</p>
                      <p>Duration: {daysBetween(a.start, a.end) + 1} days</p>
                      <p>Status: {a.status}</p>
                      <p>Progress: {a.progress}%</p>
                      <p>
                        Dependencies:{" "}
                        {DEPENDENCIES.filter((d) => d.toActivityId === a.id).length || "None"}
                      </p>
                      <p>Commercial impact: {a.commercialImplications}</p>
                      <p>Last update: {a.lastUpdate}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* Milestones */}
              {showMilestones &&
                MILESTONES.map((m) => (
                  <Tooltip key={m.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Milestone ${m.name}, ${formatDate(m.date)}, status ${m.status}`}
                        className="absolute z-10 -translate-x-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{ left: `${offsetPct(m.date)}%`, top: Math.max(height, 60) - 22 }}
                      >
                        <span
                          className={cn(
                            "block rotate-45 border",
                            m.emphasis
                              ? "h-3.5 w-3.5 border-tl-complete bg-tl-complete"
                              : "h-2.5 w-2.5 border-primary bg-card"
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      <p className="font-semibold">{m.name}</p>
                      <p>{formatDate(m.date)}</p>
                      <p>{m.owner}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}

              {/* Today marker */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Today marker, ${formatDate(MOCK_TODAY)}`}
                    className="absolute top-0 z-10 h-full w-px -translate-x-1/2 bg-tl-today focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ left: `${offsetPct(MOCK_TODAY)}%` }}
                  >
                    <Badge className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-tl-today px-1.5 py-0 text-[10px] text-primary-foreground">
                      Today
                    </Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Today: {formatDate(MOCK_TODAY)}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export { Fragment };
