import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, Database, FlaskConical, Trash2 } from "lucide-react";

const INCIDENT_COLUMNS = [
  { key: "incident_number", label: "Incident #", required: false },
  { key: "title", label: "Title", required: true },
  { key: "severity", label: "Severity (critical/high/medium/low)", required: true },
  { key: "status", label: "Status (open/in_progress/on_hold/pending/resolved)", required: false },
  { key: "service", label: "Service", required: false },
  { key: "owner", label: "Owner", required: false },
  { key: "opened_at", label: "Opened at (ISO date)", required: false },
  { key: "resolved_at", label: "Resolved at (ISO date)", required: false },
];

export function TenantDataPanel({ tenantId }: { tenantId: string }) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{
    rows: Record<string, string>[];
    headers: string[];
  } | null>(null);

  // Tenant + counts
  const { data: tenant } = useQuery({
    queryKey: ["tenant-data-mode-detail", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants").select("id,name,data_mode").eq("id", tenantId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["tenant-data-counts", tenantId],
    queryFn: async () => {
      const inc = await supabase
        .from("tenant_incidents")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId);
      return { incidents: inc.count ?? 0 };
    },
  });

  const setMode = useMutation({
    mutationFn: async (mode: "demo" | "live") => {
      const { error } = await supabase
        .from("tenants").update({ data_mode: mode }).eq("id", tenantId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Data mode updated" });
      qc.invalidateQueries({ queryKey: ["tenant-data-mode-detail", tenantId] });
      qc.invalidateQueries({ queryKey: ["tenant-data-mode", tenantId] });
    },
    onError: (e: unknown) =>
      toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }),
  });

  const importRows = useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const { data, error } = await supabase.functions.invoke("tenant-data-import", {
        body: { tenantId, domain: "incidents", rows },
      });
      if (error) {
        // Try to read the actual error body returned by the function.
        let detail = error.message;
        try {
          const ctx = (error as unknown as { context?: Response }).context;
          if (ctx && typeof ctx.text === "function") {
            const body = await ctx.text();
            if (body) detail = body;
          }
        } catch { /* ignore */ }
        throw new Error(detail);
      }
      if (data && (data as { error?: string }).error)
        throw new Error(typeof (data as { error: unknown }).error === "string"
          ? String((data as { error: string }).error)
          : JSON.stringify((data as { error: unknown }).error));
      return data as { processed: number; upserted: number; errors: { index: number; message: string }[] };
    },
    onSuccess: (data) => {
      toast({
        title: `Imported ${data.upserted}/${data.processed} rows`,
        description: data.errors.length
          ? `${data.errors.length} row(s) skipped — check format.`
          : "All rows accepted.",
      });
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["tenant-data-counts", tenantId] });
      qc.invalidateQueries({ queryKey: ["incidents-live", tenantId] });
    },
    onError: (e: unknown) =>
      toast({ title: e instanceof Error ? e.message : "Import failed", variant: "destructive" }),
  });

  const clearIncidents = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tenant_incidents").delete().eq("tenant_id", tenantId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Incidents cleared" });
      qc.invalidateQueries({ queryKey: ["tenant-data-counts", tenantId] });
      qc.invalidateQueries({ queryKey: ["incidents-live", tenantId] });
    },
    onError: (e: unknown) =>
      toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }),
  });

  const handleFile = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
      complete: (res) => {
        const headers = res.meta.fields ?? [];
        setPreview({ rows: res.data, headers });
      },
      error: (err) =>
        toast({ title: "CSV parse failed", description: err.message, variant: "destructive" }),
    });
  };

  const downloadSample = () => {
    const csv =
      "incident_number,title,severity,status,service,owner,opened_at\n" +
      "INC-1001,Login service degraded,critical,open,Identity,Alice,2026-06-01T09:14:00Z\n" +
      "INC-1002,Payment latency high,high,in_progress,Payments,Bob,2026-06-02T11:02:00Z\n";
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "incidents-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const live = tenant?.data_mode === "live";
  const canGoLive = (counts?.incidents ?? 0) > 0;

  const missingRequired = useMemo(() => {
    if (!preview) return [];
    return INCIDENT_COLUMNS
      .filter((c) => c.required)
      .filter((c) => !preview.headers.includes(c.key));
  }, [preview]);

  return (
    <div className="space-y-6">
      {/* Mode card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {live ? <Database className="h-4 w-4 text-status-healthy" />
                  : <FlaskConical className="h-4 w-4 text-ai" />}
            Data mode
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-6">
          <div className="text-sm">
            <div>
              Currently showing{" "}
              <Badge variant={live ? "default" : "secondary"}>
                {live ? "Live data" : "Demo data"}
              </Badge>{" "}
              to everyone in this tenant.
            </div>
            <p className="text-muted-foreground text-xs mt-1">
              Demo mode shows seeded sample data. Live mode reads from this tenant's tables.
              Switch back to demo anytime.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Demo</span>
            <Switch
              checked={live}
              disabled={setMode.isPending || (!live && !canGoLive)}
              onCheckedChange={(v) => setMode.mutate(v ? "live" : "demo")}
            />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </CardContent>
        {!live && !canGoLive && (
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Import at least one incident below before switching to live.
          </CardContent>
        )}
      </Card>

      {/* Incidents domain */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Incidents</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {counts?.incidents ?? 0} row{counts?.incidents === 1 ? "" : "s"} in this tenant.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadSample}>
              Sample CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-1.5" /> Upload CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {(counts?.incidents ?? 0) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                disabled={clearIncidents.isPending}
                onClick={() => {
                  if (confirm("Delete all incidents for this tenant?")) clearIncidents.mutate();
                }}
              >
                <Trash2 className="h-4 w-4 mr-1.5" /> Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-xs">
          <p className="text-muted-foreground mb-2">Expected columns (header row, case-insensitive):</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {INCIDENT_COLUMNS.map((c) => (
              <div key={c.key} className="flex items-center gap-1.5">
                <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">{c.key}</code>
                {c.required && <span className="text-status-critical text-[10px]">required</span>}
              </div>
            ))}
          </div>

          {preview && (
            <div className="mt-5 border rounded-lg overflow-hidden">
              <div className="p-3 bg-muted/30 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{preview.rows.length} row(s) parsed</div>
                  {missingRequired.length > 0 && (
                    <div className="text-status-critical text-[11px] mt-0.5">
                      Missing required columns: {missingRequired.map((c) => c.key).join(", ")}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>Cancel</Button>
                  <Button
                    size="sm"
                    disabled={importRows.isPending || missingRequired.length > 0}
                    onClick={() => importRows.mutate(preview.rows)}
                  >
                    {importRows.isPending ? "Importing…" : `Import ${preview.rows.length}`}
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-[11px]">
                  <thead className="bg-muted/20 sticky top-0">
                    <tr>
                      {preview.headers.map((h) => (
                        <th key={h} className="text-left px-2 py-1.5 font-semibold whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="border-t">
                        {preview.headers.map((h) => (
                          <td key={h} className="px-2 py-1 whitespace-nowrap text-muted-foreground">
                            {String(r[h] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.rows.length > 10 && (
                  <div className="text-[11px] text-muted-foreground text-center py-2">
                    Showing first 10 of {preview.rows.length} rows.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        More domains (alerts, vendors, KPIs, change requests) will follow the same pattern as we
        wire them up. Live data can also be ingested via connectors — see the Connectors tab.
      </p>
    </div>
  );
}
