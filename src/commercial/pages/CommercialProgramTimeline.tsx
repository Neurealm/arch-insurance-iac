import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarCheck, ChevronDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  EMPTY_FILTERS,
  MILESTONES,
  MOCK_TODAY,
  PROGRAM_CONTEXT,
  PROGRAM_SUMMARY,
  TIMELINE_ACTIVITIES,
  type Milestone,
  type ProgramSummary,
  type TimelineActivity,
  type TimelineFilterState,
} from "@/data/programTimelineMockData";

import { ProgramSummaryCards } from "@/commercial/timeline/ProgramSummaryCards";
import { TimelineToolbar, VIEW_OPTIONS, type TimelineView } from "@/commercial/timeline/TimelineToolbar";
import { FilterChips } from "@/commercial/timeline/TimelineFilters";
import { IntegratedTimeline } from "@/commercial/timeline/IntegratedTimeline";
import { ActivityDetailDrawer } from "@/commercial/timeline/ActivityDetailDrawer";
import { MilestoneTable } from "@/commercial/timeline/MilestoneTable";
import { MilestoneDetailDialog } from "@/commercial/timeline/MilestoneDetailDialog";
import { UpcomingMilestoneCard } from "@/commercial/timeline/UpcomingMilestoneCard";
import { ScheduleIntelligence } from "@/commercial/timeline/ScheduleIntelligence";
import { TimelineLegend } from "@/commercial/timeline/TimelineLegend";
import { formatDate, offsetPct, ZOOM_TRACK_WIDTH, type ZoomLevel } from "@/commercial/timeline/dates";

const EXPORT_ACTIONS = [
  "Export Timeline as PDF",
  "Export Milestones as CSV",
  "Export Executive Summary",
  "Copy Timeline Snapshot",
];

export default function CommercialProgramTimeline() {
  const [activities, setActivities] = useState<TimelineActivity[]>(TIMELINE_ACTIVITIES);
  const [milestones, setMilestones] = useState<Milestone[]>(MILESTONES);
  const [filters, setFilters] = useState<TimelineFilterState>({ ...EMPTY_FILTERS });
  const [view, setView] = useState<TimelineView>("timeline");
  const [zoom, setZoom] = useState<ZoomLevel>("months");
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [showDependencies, setShowDependencies] = useState(true);
  const [criticalPath, setCriticalPath] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState<TimelineActivity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [featuredMilestoneId, setFeaturedMilestoneId] = useState<string>("m-uat");
  const [summaryCard, setSummaryCard] = useState<ProgramSummary | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const activeFilterCount =
    filters.groupIds.length +
    filters.owners.length +
    filters.statuses.length +
    filters.categories.length +
    (filters.search ? 1 : 0) +
    Number(filters.milestonesOnly) +
    Number(filters.atRiskOnly) +
    Number(filters.customerOwnedOnly) +
    Number(filters.criticalPathOnly);

  const visibleActivities = useMemo(() => {
    return activities.filter((a) => {
      if (view === "customer" && a.groupId !== "customer") return false;
      if (view === "deliverables" && a.groupId !== "deliverables") return false;
      if (view === "readiness" && a.groupId !== "readiness") return false;
      if (filters.groupIds.length && !filters.groupIds.includes(a.groupId)) return false;
      if (filters.owners.length && !filters.owners.includes(a.owner)) return false;
      if (filters.statuses.length && !filters.statuses.includes(a.status)) return false;
      if (filters.categories.length && !filters.categories.includes(a.category)) return false;
      if (filters.atRiskOnly && a.status !== "At Risk") return false;
      if (filters.customerOwnedOnly && !a.customerOwned) return false;
      if (filters.criticalPathOnly && !a.criticalPath) return false;
      if (filters.milestonesOnly && a.relatedMilestoneIds.length === 0) return false;
      if (
        filters.search &&
        !`${a.name} ${a.owner} ${a.category}`.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [activities, filters, view]);

  const featuredMilestone =
    milestones.find((m) => m.id === featuredMilestoneId) ?? milestones[milestones.length - 1];

  const jumpToToday = () => {
    const el = scrollRef.current;
    if (!el) return;
    const x = (offsetPct(MOCK_TODAY) / 100) * ZOOM_TRACK_WIDTH[zoom];
    el.scrollTo({ left: Math.max(0, x - el.clientWidth / 3), behavior: "smooth" });
    toast.success(`Timeline centred on today, ${formatDate(MOCK_TODAY)}`);
  };

  const updateActivity = (id: string, patch: Partial<TimelineActivity>) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, id } : a)));
    setSelectedActivity((prev) => (prev && prev.id === id ? { ...prev, ...patch, id } : prev));
    setDirty(true);
    toast.success("Local change applied. This prototype does not persist changes.");
  };

  const completeActivity = (id: string) => {
    updateActivity(id, { status: "Completed", progress: 100 });
  };

  const resetMockData = () => {
    setActivities(TIMELINE_ACTIVITIES);
    setMilestones(MILESTONES);
    setFilters({ ...EMPTY_FILTERS });
    setCollapsedGroups([]);
    setCriticalPath(false);
    setView("timeline");
    setZoom("months");
    setFeaturedMilestoneId("m-uat");
    setDirty(false);
    toast.success("Mock data reset to the prototype baseline.");
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header data-guide-target="timelines-context" className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Timelines
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Integrated schedule for commercial, customer, delivery, and operational readiness
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{PROGRAM_CONTEXT}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dirty && (
            <Badge variant="outline" className="bg-tl-deployment-soft text-tl-deployment border-tl-deployment/30">
              Unsaved local changes
            </Badge>
          )}
          <Badge variant="outline" className="gap-1 font-normal">
            <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Today: {formatDate(MOCK_TODAY)}
          </Badge>
          <Button variant="outline" size="sm" onClick={jumpToToday}>
            Today
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" aria-label="Export options">
                <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Export
                <ChevronDown className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {EXPORT_ACTIONS.map((label) => (
                <DropdownMenuItem
                  key={label}
                  onSelect={() => toast.success(`${label} prepared (prototype only).`)}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" aria-label="Change timeline view">
                View: {VIEW_OPTIONS.find((o) => o.value === view)?.label}
                <ChevronDown className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {VIEW_OPTIONS.map((o) => (
                <DropdownMenuItem key={o.value} onSelect={() => setView(o.value)}>
                  {o.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Section 1 — summary cards */}
      <ProgramSummaryCards
        cards={PROGRAM_SUMMARY}
        selectedId={summaryCard?.id ?? null}
        onSelect={(card) => {
          setSummaryCard(card);
          if (card.focusGroupIds?.length) {
            setFilters((f) => ({ ...f, groupIds: card.focusGroupIds as string[] }));
          }
        }}
      />

      {/* Section 2 — timeline workspace */}
      <Card data-guide-target="timelines-integrated" className={cn(fullScreen && "fixed inset-4 z-50 overflow-auto shadow-lg")}>
        <CardHeader className="gap-3 pb-3">
          <div data-guide-target="timelines-controls" className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Integrated Timeline</CardTitle>
            <TimelineToolbar
              view={view}
              onViewChange={setView}
              zoom={zoom}
              onZoomChange={setZoom}
              filters={filters}
              onFiltersChange={setFilters}
              activeFilterCount={activeFilterCount}
              showDependencies={showDependencies}
              onToggleDependencies={setShowDependencies}
              highlightCriticalPath={criticalPath}
              onToggleCriticalPath={setCriticalPath}
              onToday={jumpToToday}
              onFullScreen={() => setFullScreen((v) => !v)}
              onReset={resetMockData}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <FilterChips filters={filters} onChange={setFilters} />
          <IntegratedTimeline
            activities={visibleActivities}
            collapsedGroups={collapsedGroups}
            onToggleGroup={(id) =>
              setCollapsedGroups((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
            }
            zoom={zoom}
            showDependencies={showDependencies}
            highlightCriticalPath={criticalPath}
            showMilestones={view === "timeline" || view === "milestones"}
            selectedActivityId={selectedActivity?.id ?? null}
            onSelectActivity={(a) => {
              setSelectedActivity(a);
              setDrawerOpen(true);
            }}
            scrollRef={scrollRef}
          />
        </CardContent>
      </Card>

      {/* Sections 4 and 5 — milestones */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card data-guide-target="timelines-milestones" className="xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Key Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <MilestoneTable
              milestones={milestones}
              selectedId={featuredMilestone?.id ?? null}
              onSelect={(m) => {
                setSelectedMilestone(m);
                setMilestoneDialogOpen(true);
              }}
              onEdit={(m) => {
                setSelectedMilestone(m);
                setMilestoneDialogOpen(true);
                toast.info("Milestone editing is simulated in this prototype.");
              }}
              onComplete={(m) => {
                setMilestones((prev) =>
                  prev.map((x) => (x.id === m.id ? { ...x, status: "Completed", readiness: 100 } : x))
                );
                setDirty(true);
                toast.success(`${m.name} marked complete locally.`);
              }}
            />
          </CardContent>
        </Card>
        {featuredMilestone && (
          <UpcomingMilestoneCard
            milestone={featuredMilestone}
            onViewDetails={(m) => {
              setSelectedMilestone(m);
              setMilestoneDialogOpen(true);
            }}
            onSendReminder={(m) => toast.success(`Reminder queued for ${m.name} (prototype only).`)}
          />
        )}
      </div>

      {/* Section 6 */}
      <ScheduleIntelligence activities={activities} />

      {/* Section 7 */}
      <TimelineLegend />

      <ActivityDetailDrawer
        activity={selectedActivity}
        open={drawerOpen}
        onOpenChange={(o) => {
          setDrawerOpen(o);
          if (!o) setSelectedActivity(null);
        }}
        onUpdate={updateActivity}
        onComplete={completeActivity}
      />

      <MilestoneDetailDialog
        milestone={selectedMilestone}
        open={milestoneDialogOpen}
        onOpenChange={setMilestoneDialogOpen}
        onFeature={(m) => {
          setFeaturedMilestoneId(m.id);
          setMilestoneDialogOpen(false);
          toast.success(`${m.name} featured in the upcoming milestone panel.`);
        }}
        onComplete={(m) => {
          setMilestones((prev) =>
            prev.map((x) => (x.id === m.id ? { ...x, status: "Completed", readiness: 100 } : x))
          );
          setDirty(true);
          setMilestoneDialogOpen(false);
          toast.success(`${m.name} marked complete locally.`);
        }}
      />

      <Dialog open={Boolean(summaryCard)} onOpenChange={(o) => !o && setSummaryCard(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{summaryCard?.label}</DialogTitle>
            <DialogDescription>{summaryCard?.value}</DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-2 pl-4 text-sm">
            {summaryCard?.detail.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
