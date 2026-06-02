import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { incidents as demoIncidents, type Incident } from "@/data/eoc";
import { useDataSource } from "@/hooks/useDataSource";

type SeverityUi = Incident["severity"];
type PriorityUi = Incident["priority"];

const SEV_DB_TO_UI: Record<string, SeverityUi> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function normalizeSeverity(raw: string | null): SeverityUi {
  if (!raw) return "Medium";
  return SEV_DB_TO_UI[raw.toLowerCase()] ?? "Medium";
}

function severityToPriority(sev: SeverityUi): PriorityUi {
  return sev === "Critical" ? "P1" : sev === "High" ? "P2" : sev === "Medium" ? "P3" : "P4";
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function useIncidents(tenantIdOverride?: string | null) {
  const { mode, tenantId, loading: modeLoading } = useDataSource(tenantIdOverride);

  const live = useQuery({
    queryKey: ["incidents-live", tenantId],
    enabled: mode === "live" && !!tenantId,
    queryFn: async (): Promise<Incident[]> => {
      const { data, error } = await supabase
        .from("tenant_incidents")
        .select("id,incident_number,title,severity,opened_at,status")
        .eq("tenant_id", tenantId!)
        .neq("status", "resolved")
        .order("opened_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []).map((row) => {
        const sev = normalizeSeverity(row.severity);
        return {
          id: row.incident_number || row.id.slice(0, 8).toUpperCase(),
          title: row.title || "(untitled)",
          severity: sev,
          priority: severityToPriority(sev),
          startedAgo: timeAgo(row.opened_at),
        };
      });
    },
  });

  if (mode === "demo") {
    return { incidents: demoIncidents, loading: modeLoading, mode };
  }
  return { incidents: live.data ?? [], loading: modeLoading || live.isLoading, mode };
}
