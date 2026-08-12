/**
 * Contextual Audio Enrichment — administrative usage analytics.
 *
 * Every figure on this page comes from `audio_analytics_overview`, a
 * SECURITY DEFINER rollup that enforces workspace scoping and the
 * `audio.analytics.view` permission in the database. No cross-tenant read is
 * possible from the browser, and no narrative text is ever fetched here.
 */

import { useMemo, useState } from "react";
import { useAccess } from "@/platform/access/AccessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { LoadingState, ErrorState, EmptyState, ForbiddenState } from "@/platform/components/States";
import { usePlaybackEvents, useAudioAnalyticsOverview } from "./data";
import { formatDuration } from "./helpers";

const ANY = "__any__";
const WINDOWS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
];

/** Percentage of `part` within `whole`, safe when nothing has happened yet. */
export function ratePct(part: number, whole: number): number {
  if (!whole || whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function pct(part: number, whole: number): string {
  if (!whole || whole <= 0) return "—";
  return `${ratePct(part, whole).toFixed(1)}%`;
}

export default function AudioAnalytics() {
  const { activeTenantId, hasPermission } = useAccess();
  const [windowDays, setWindowDays] = useState("30");
  const overview = useAudioAnalyticsOverview(activeTenantId, Number(windowDays));
  const events = usePlaybackEvents(activeTenantId);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(ANY);

  const canView = hasPermission("audio.analytics.view") || hasPermission("audio.admin");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (events.data ?? []).filter((e) => {
      if (typeFilter !== ANY && e.event_type !== typeFilter) return false;
      if (!q) return true;
      return `${e.call_id ?? ""} ${e.placement_key ?? ""} ${e.error_code ?? ""}`.toLowerCase().includes(q);
    });
  }, [events.data, search, typeFilter]);

  const types = useMemo(
    () => [...new Set((events.data ?? []).map((e) => e.event_type))].sort(),
    [events.data],
  );

  if (!canView) return <ForbiddenState permission="audio.analytics.view" />;
  if (overview.isLoading) return <LoadingState label="Loading audio analytics…" />;
  if (overview.error) return <ErrorState error={overview.error} onRetry={() => overview.refetch()} />;
  if (overview.data?.status === "unauthorized") return <ForbiddenState permission="audio.analytics.view" />;

  const d = overview.data;
  const t = d?.totals ?? {
    requested: 0, started: 0, paused: 0, resumed: 0, stopped: 0, completed: 0,
    transcripts: 0, unavailable: 0, unsupported: 0, errors: 0, total: 0,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Audio analytics</h2>
          <p className="text-xs text-muted-foreground">
            Privacy-conscious usage and operational diagnostics for the active workspace.
            Identifiers and counts only — narration text, transcripts, and variable values are never recorded.
          </p>
        </div>
        <Select value={windowDays} onValueChange={setWindowDays}>
          <SelectTrigger className="w-[170px]" aria-label="Reporting window"><SelectValue /></SelectTrigger>
          <SelectContent>
            {WINDOWS.map((w) => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Playback starts" value={String(t.started)} />
        <Metric label="Completion rate" value={pct(t.completed, t.started)} />
        <Metric label="Stop rate" value={pct(t.stopped, t.started)} />
        <Metric label="Transcript opens" value={String(t.transcripts)} />
        <Metric label="Unsupported browser rate" value={pct(t.unsupported, t.requested)} />
        <Metric label="Playback errors" value={String(t.errors)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Most used narratives" empty="No narrative playback in this window.">
          {(d?.topNarratives ?? []).length > 0 && (
            <Table>
              <caption className="sr-only">Most used narratives</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Call ID</TableHead>
                  <TableHead className="text-right">Starts</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Transcript</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(d?.topNarratives ?? []).map((n) => (
                  <TableRow key={n.call_id}>
                    <TableCell className="font-mono text-xs">
                      {n.call_id}
                      {n.title && <div className="font-sans text-[11px] text-muted-foreground">{n.title}</div>}
                    </TableCell>
                    <TableCell className="text-right text-xs">{n.starts}</TableCell>
                    <TableCell className="text-right text-xs">{n.completes}</TableCell>
                    <TableCell className="text-right text-xs">{n.transcripts}</TableCell>
                    <TableCell className="text-right text-xs">{n.errors}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        <Panel title="Usage by module and page" empty="No module or page usage in this window.">
          {(d?.byModulePage ?? []).length > 0 && (
            <Table>
              <caption className="sr-only">Usage by module and page</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Starts</TableHead>
                  <TableHead className="text-right">Completion</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(d?.byModulePage ?? []).map((m) => (
                  <TableRow key={`${m.module_key}:${m.page_key}`}>
                    <TableCell className="text-xs">{m.module_key}</TableCell>
                    <TableCell className="font-mono text-xs">{m.page_key}</TableCell>
                    <TableCell className="text-right text-xs">{m.starts}</TableCell>
                    <TableCell className="text-right text-xs">{pct(m.completes, m.starts)}</TableCell>
                    <TableCell className="text-right text-xs">{m.errors}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        <Panel title="Unavailable or broken call IDs" empty="No unavailable or failing call IDs.">
          {(d?.brokenCalls ?? []).length > 0 && (
            <Table>
              <caption className="sr-only">Unavailable or broken call IDs</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Call ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Failures</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(d?.brokenCalls ?? []).map((b) => (
                  <TableRow key={b.call_id}>
                    <TableCell className="font-mono text-xs">{b.call_id}</TableCell>
                    <TableCell className="text-xs"><Badge variant="secondary">{b.category}</Badge></TableCell>
                    <TableCell className="text-right text-xs text-destructive">{b.failures}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        <Panel title="Placements referencing unavailable narratives" empty="Every enabled placement resolves to a published narrative.">
          {(d?.brokenPlacements ?? []).length > 0 && (
            <Table>
              <caption className="sr-only">Placements referencing unavailable narratives</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Placement</TableHead>
                  <TableHead>Call ID</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(d?.brokenPlacements ?? []).map((p) => (
                  <TableRow key={p.placement_key}>
                    <TableCell className="font-mono text-xs">{p.placement_key}</TableCell>
                    <TableCell className="font-mono text-xs">{p.call_id}</TableCell>
                    <TableCell className="text-xs text-destructive">{p.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        <Panel title="Active placements with no usage" empty="Every enabled placement has been played in this window.">
          {(d?.unusedPlacements ?? []).length > 0 && (
            <Table>
              <caption className="sr-only">Active placements with no usage</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Placement</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Call ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(d?.unusedPlacements ?? []).map((p) => (
                  <TableRow key={p.placement_key}>
                    <TableCell className="font-mono text-xs">{p.placement_key}</TableCell>
                    <TableCell className="text-xs">{p.module_key}</TableCell>
                    <TableCell className="font-mono text-xs">{p.call_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        <Panel title="Trends by published version" empty="No versioned playback in this window.">
          {(d?.versionTrends ?? []).length > 0 && (
            <Table>
              <caption className="sr-only">Trends by published narrative version</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Call ID</TableHead>
                  <TableHead className="text-right">Version</TableHead>
                  <TableHead className="text-right">Starts</TableHead>
                  <TableHead className="text-right">Completion</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(d?.versionTrends ?? []).map((v) => (
                  <TableRow key={`${v.call_id}:${v.version_no}`}>
                    <TableCell className="font-mono text-xs">{v.call_id}</TableCell>
                    <TableCell className="text-right text-xs">v{v.version_no}</TableCell>
                    <TableCell className="text-right text-xs">{v.starts}</TableCell>
                    <TableCell className="text-right text-xs">{pct(v.completes, v.starts)}</TableCell>
                    <TableCell className="text-right text-xs">{v.errors}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Search playback events"
            className="pl-8"
            placeholder="Search by call ID, placement, or error code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]" aria-label="Filter by event type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All event types</SelectItem>
            {types.map((t2) => <SelectItem key={t2} value={t2}>{t2}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">{rows.length} recent events</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {events.isLoading ? (
            <div className="p-6"><LoadingState label="Loading event feed…" /></div>
          ) : rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No playback telemetry yet"
                description="Events appear once Audio Enrichment Buttons are used in production pages."
              />
            </div>
          ) : (
            <Table>
              <caption className="sr-only">Contextual audio playback events</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Occurred</TableHead>
                  <TableHead>Call ID</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Voice / locale</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs">{new Date(e.occurred_at).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs">{e.call_id ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{e.placement_key ?? "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{e.event_type}</Badge></TableCell>
                    <TableCell className="text-xs">
                      {e.duration_ms ? formatDuration(e.duration_ms / 1000) : "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {[e.voice_name, e.locale].filter(Boolean).join(" · ") || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-destructive">{e.error_code ?? ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Panel({ title, empty, children }: { title: string; empty: string; children?: React.ReactNode }) {
  const hasContent = Boolean(children);
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {hasContent ? children : <p className="p-4 text-xs text-muted-foreground">{empty}</p>}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-xl font-semibold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}
