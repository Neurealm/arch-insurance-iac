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
import { usePlaybackEvents } from "./data";
import { formatDuration } from "./helpers";

const ANY = "__any__";

export default function AudioAnalytics() {
  const { activeTenantId, hasPermission } = useAccess();
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

  const summary = useMemo(() => {
    const all = events.data ?? [];
    const starts = all.filter((e) => e.event_type === "start" || e.event_type === "started").length;
    const completes = all.filter((e) => e.event_type === "complete" || e.event_type === "completed").length;
    const errors = all.filter((e) => !!e.error_code || e.event_type === "error").length;
    const durations = all.map((e) => e.duration_ms ?? 0).filter((d) => d > 0);
    const avg = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length / 1000 : 0;
    const unsupported = all.filter((e) => e.browser_supported === false).length;
    return { total: all.length, starts, completes, errors, avg, unsupported };
  }, [events.data]);

  const types = useMemo(
    () => [...new Set((events.data ?? []).map((e) => e.event_type))].sort(),
    [events.data],
  );

  if (!canView) return <ForbiddenState permission="audio.analytics.view" />;
  if (events.isLoading) return <LoadingState label="Loading audio analytics…" />;
  if (events.error) return <ErrorState error={events.error} onRetry={() => events.refetch()} />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Audio analytics</h2>
        <p className="text-xs text-muted-foreground">
          Append-only playback telemetry for the active workspace. Most recent 500 events.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Metric label="Events" value={String(summary.total)} />
        <Metric label="Playbacks started" value={String(summary.starts)} />
        <Metric label="Playbacks completed" value={String(summary.completes)} />
        <Metric label="Average duration" value={formatDuration(summary.avg)} />
        <Metric label="Errors" value={String(summary.errors)} />
      </div>

      {summary.unsupported > 0 && (
        <p className="text-xs text-muted-foreground">
          {summary.unsupported} events came from browsers without speech support; those listeners saw the transcript instead.
        </p>
      )}

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
          <SelectTrigger className="w-[180px]" aria-label="Filter by event type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All event types</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">{rows.length} events</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No playback telemetry yet"
                description="Events appear once Audio Enrichment Buttons are placed in production pages."
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
