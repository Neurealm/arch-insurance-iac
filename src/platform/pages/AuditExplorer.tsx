import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/platform/access/AccessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { LoadingState, ErrorState, EmptyState } from "@/platform/components/States";

type Event = {
  event_id: string; occurred_at: string; actor_user_id: string | null; actor_email: string | null;
  action_code: string; object_type: string; object_id: string;
  reason: string | null; source: string | null; correlation_id: string | null;
  before_values: any; after_values: any; total_count: number;
};

const PAGE = 25;

// Redact common sensitive keys from JSON payloads before display.
const SENSITIVE_KEYS = new Set([
  "password", "password_hash", "token", "access_token", "refresh_token",
  "secret", "api_key", "authorization", "cookie", "session",
]);
function redact(value: any): any {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? "[redacted]" : redact(v);
    }
    return out;
  }
  return value;
}

export default function AuditExplorer() {
  const { activeTenantId } = useAccess();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");
  const [objectType, setObjectType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Event | null>(null);

  const resetFilters = () => {
    setSearch(""); setAction(""); setActor(""); setObjectType("");
    setFrom(""); setTo(""); setPage(0);
  };

  const events = useQuery({
    queryKey: ["platform", "audit", activeTenantId, search, action, actor, objectType, from, to, page],
    enabled: !!activeTenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_audit_events", {
        p_tenant_id: activeTenantId!,
        p_search: search || null,
        p_action: action || null,
        p_actor: actor || null,
        p_object_type: objectType || null,
        p_from: from ? new Date(from).toISOString() : null,
        p_to: to ? new Date(to + "T23:59:59").toISOString() : null,
        p_limit: PAGE,
        p_offset: page * PAGE,
      });
      if (error) throw error;
      return (data ?? []) as Event[];
    },
  });

  const total = Number(events.data?.[0]?.total_count ?? 0);
  const maxPage = Math.max(0, Math.ceil(total / PAGE) - 1);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Audit events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset className="grid gap-3 md:grid-cols-3 lg:grid-cols-6" aria-label="Audit filters">
            <div className="space-y-1"><Label htmlFor="af-search">Search</Label>
              <Input id="af-search" placeholder="Object or correlation…" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }} /></div>
            <div className="space-y-1"><Label htmlFor="af-action">Action</Label>
              <Input id="af-action" placeholder="e.g. member.invite" value={action}
                onChange={(e) => { setAction(e.target.value); setPage(0); }} /></div>
            <div className="space-y-1"><Label htmlFor="af-actor">Actor UUID</Label>
              <Input id="af-actor" placeholder="uuid" value={actor}
                onChange={(e) => { setActor(e.target.value); setPage(0); }} /></div>
            <div className="space-y-1"><Label htmlFor="af-object">Object type</Label>
              <Input id="af-object" placeholder="e.g. membership" value={objectType}
                onChange={(e) => { setObjectType(e.target.value); setPage(0); }} /></div>
            <div className="space-y-1"><Label htmlFor="af-from">From</Label>
              <Input id="af-from" type="date" value={from}
                onChange={(e) => { setFrom(e.target.value); setPage(0); }} /></div>
            <div className="space-y-1"><Label htmlFor="af-to">To</Label>
              <Input id="af-to" type="date" value={to}
                onChange={(e) => { setTo(e.target.value); setPage(0); }} /></div>
          </fieldset>
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" onClick={resetFilters}>Reset filters</Button>
          </div>

          {events.isLoading ? <LoadingState /> :
           events.error ? <ErrorState error={events.error} onRetry={() => events.refetch()} /> :
           !events.data?.length ? <EmptyState title="No matching events" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="py-2 pr-4">When</th><th className="py-2 pr-4">Actor</th>
                    <th className="py-2 pr-4">Action</th><th className="py-2 pr-4">Object</th>
                    <th className="py-2 pr-4">Source</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.data.map((e) => (
                    <tr key={e.event_id} className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setSelected(e)}
                      onKeyDown={(k) => { if (k.key === "Enter") setSelected(e); }}
                      tabIndex={0} role="button" aria-label={`View event ${e.action_code}`}>
                      <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(e.occurred_at), "MMM d, HH:mm:ss")}
                      </td>
                      <td className="py-2 pr-4">{e.actor_email ?? (e.actor_user_id ? <span className="font-mono text-xs">{e.actor_user_id.slice(0,8)}…</span> : <span className="text-muted-foreground">system</span>)}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{e.action_code}</td>
                      <td className="py-2 pr-4 text-xs">{e.object_type} · <span className="text-muted-foreground">{e.object_id.slice(0,8)}…</span></td>
                      <td className="py-2 pr-4"><Badge variant="outline">{e.source ?? "—"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>{total} event{total === 1 ? "" : "s"}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
              <span>Page {page + 1} of {maxPage + 1}</span>
              <Button size="sm" variant="outline" disabled={page >= maxPage}
                onClick={() => setPage((p) => Math.min(maxPage, p + 1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader><SheetTitle>Event detail</SheetTitle></SheetHeader>
              <div className="mt-4 grid gap-3 text-xs">
                <Detail label="Action">{selected.action_code}</Detail>
                <Detail label="Occurred">{format(new Date(selected.occurred_at), "PPpp")}</Detail>
                <Detail label="Actor">{selected.actor_email ?? selected.actor_user_id ?? "system"}</Detail>
                <Detail label="Correlation">{selected.correlation_id ?? "—"}</Detail>
                <Detail label="Object">{selected.object_type} · {selected.object_id}</Detail>
                <Detail label="Reason">{selected.reason ?? "—"}</Detail>
                <div>
                  <div className="mb-1 text-muted-foreground">Before</div>
                  <pre className="max-h-64 overflow-auto rounded bg-muted p-2 text-[11px]">
                    {JSON.stringify(redact(selected.before_values), null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="mb-1 text-muted-foreground">After</div>
                  <pre className="max-h-64 overflow-auto rounded bg-muted p-2 text-[11px]">
                    {JSON.stringify(redact(selected.after_values), null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div><div className="text-muted-foreground">{label}</div><div className="text-foreground break-all">{children}</div></div>
  );
}
