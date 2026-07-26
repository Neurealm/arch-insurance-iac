import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import { LoadingState, EmptyState } from "@/platform/components/States";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import { useReleaseContext, useActivationHistory } from "@/commercial/hooks/useModelRelease";

export function versionStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "active") return "default";
  if (status === "superseded") return "secondary";
  return "outline";
}

export default function CommercialRelease() {
  const { tenantId } = useCommercialAccess();
  const ctx = useReleaseContext(tenantId);
  const program = ctx.data?.program ?? null;
  const versions = ctx.data?.versions ?? [];
  const activations = useActivationHistory(tenantId, program?.id ?? null);

  if (ctx.isLoading) return <LoadingState label="Loading release workspace…" />;
  if (!program) {
    return <EmptyState title="No commercial program" description="Bootstrap the commercial program before managing releases." />;
  }

  const active = versions.find((v) => v.status === "active") ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <ShieldCheck className="h-5 w-5" />
          Model Release &amp; Activation
        </h1>
        <p className="text-sm text-muted-foreground">
          Governed activation readiness, release certification, deterministic release manifests, and
          activation lineage for {program.name}.
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Directional model</AlertTitle>
        <AlertDescription>
          Activation makes a model version operational for this program. Readiness, manifests, hashes and
          lineage are computed server-side; nothing here is calculated in the browser.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Model versions</CardTitle>
          <CardDescription>
            {active ? `Active version: ${active.version_code}` : "No active version for this program yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Formula catalog</TableHead>
                <TableHead>Activated</TableHead>
                <TableHead className="text-right">Release</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.version_code}</TableCell>
                  <TableCell className="max-w-[320px] truncate text-muted-foreground">{v.name}</TableCell>
                  <TableCell><Badge variant={versionStatusVariant(v.status)}>{v.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{v.formula_catalog_version}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {v.activated_at ? new Date(v.activated_at).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/commercial/model/release/${v.id}`}>
                        Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activation history</CardTitle>
          <CardDescription>Immutable activation records for this program.</CardDescription>
        </CardHeader>
        <CardContent>
          {(activations.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No model version has been activated yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activated at</TableHead>
                  <TableHead>Model version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prior active</TableHead>
                  <TableHead>Manifest hash</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(activations.data ?? []).map((a) => {
                  const v = versions.find((x) => x.id === a.model_version_id);
                  const prior = versions.find((x) => x.id === a.prior_active_version_id);
                  return (
                    <TableRow key={a.id}>
                      <TableCell>{new Date(a.activated_at).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{v?.version_code ?? a.model_version_id}</TableCell>
                      <TableCell><Badge variant={a.status === "active" ? "default" : "secondary"}>{a.status}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{prior?.version_code ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{a.manifest_hash?.slice(0, 12) ?? "—"}</TableCell>
                      <TableCell className="max-w-[280px] truncate text-muted-foreground">{a.activation_reason}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
