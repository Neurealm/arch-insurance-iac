import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/platform/access/AccessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Event = {
  event_id: string; occurred_at: string; actor_user_id: string | null; actor_email: string | null;
  action_code: string; object_type: string; object_id: string;
  reason: string | null; source: string | null; correlation_id: string | null;
  before_values: any; after_values: any; total_count: number;
};

const PAGE = 25;

export default function AuditExplorer() {
  const { activeTenantId } = useAccess();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Event | null>(null);

  const events = useQuery({
    queryKey: ["platform", "audit", activeTenantId, search, action, page],
    enabled: !!activeTenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_audit_events", {
        p_tenant_id: activeTenantId!,
        p_search: search || null,
        p_action: action || null,
        p_limit: PAGE,
        p_offset: page * PAGE,
      });
      if (error) throw error;
      return (data ?? []) as Event[];
    },
  });

  const total = events.data?.[0]?.total_count ?? 0;
  const maxPage = Math.max(0, Math.ceil(Number(total) / PAGE) - 1);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm font-medium">Audit events</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input aria-label="Search audit" placeholder="Search object or correlation…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="w-64" />
            <Input aria-label="Filter action" placeholder="Action code" value={action}
              onChange={(e) => { setAction(e.target.value); setPage(0); }} className="w-48" />
          </div>
        </CardHeader>
        <CardContent>
          {events.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : events.error ? (
            <div className="text-sm text-destructive">{(events.error as Error).message}</div>
          ) : !events.data?.length ? (
            <div className="text-sm text-muted-foreground">No events match.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="py-2 pr-4">When</th><th className="py-2 pr-4">Actor</th><th className="py-2 pr-4">Action</th><th className="py-2 pr-4">Object</th><th className="py-2 pr-4">Source</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.data.map((e) => (
                    <tr key={e.event_id} className="cursor-pointer hover:bg-muted/40" onClick={() => setSelected(e)}>
                      <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(e.occurred_at), "MMM d, HH:mm:ss")}
                      </td>
                      <td className="py-2 pr-4">{e.actor_email ?? e.actor_user_id ?? <span className="text-muted-foreground">system</span>}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{e.action_code}</td>
                      <td className="py-2 pr-4 text-xs">{e.object_type} · <span className="text-muted-foreground">{e.object_id}</span></td>
                      <td className="py-2 pr-4"><Badge variant="outline">{e.source ?? "—"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div>{total} event{Number(total) === 1 ? "" : "s"}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
              <span>Page {page + 1} of {maxPage + 1}</span>
              <Button size="sm" variant="outline" disabled={page >= maxPage} onClick={() => setPage((p) => Math.min(maxPage, p + 1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Event detail</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Close</Button>
          </CardHeader>
          <CardContent className="grid gap-3 text-xs md:grid-cols-2">
            <Detail label="Action">{selected.action_code}</Detail>
            <Detail label="Occurred">{format(new Date(selected.occurred_at), "PPpp")}</Detail>
            <Detail label="Actor">{selected.actor_email ?? selected.actor_user_id ?? "system"}</Detail>
            <Detail label="Correlation">{selected.correlation_id ?? "—"}</Detail>
            <Detail label="Object">{selected.object_type} · {selected.object_id}</Detail>
            <Detail label="Reason">{selected.reason ?? "—"}</Detail>
            <div className="md:col-span-2">
              <div className="mb-1 text-muted-foreground">Before</div>
              <pre className="max-h-64 overflow-auto rounded bg-muted p-2 text-[11px]">{JSON.stringify(selected.before_values, null, 2)}</pre>
            </div>
            <div className="md:col-span-2">
              <div className="mb-1 text-muted-foreground">After</div>
              <pre className="max-h-64 overflow-auto rounded bg-muted p-2 text-[11px]">{JSON.stringify(selected.after_values, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div><div className="text-muted-foreground">{label}</div><div className="text-foreground">{children}</div></div>
  );
}
