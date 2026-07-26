import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, ArrowLeft, RefreshCcw, ShieldCheck, Rocket, Ban, GitBranch } from "lucide-react";
import { LoadingState, EmptyState } from "@/platform/components/States";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import {
  useReleaseContext,
  useReleaseReadiness,
  useReleaseCertifications,
  useReleaseLineage,
  useActivationHistory,
  useCreateCertification,
  useRefreshCertification,
  useCertifyRelease,
  useInvalidateCertification,
  useActivateModelVersion,
  useCreateSuccessorVersion,
  READINESS_CATEGORY_ORDER,
  type ReadinessControl,
} from "@/commercial/hooks/useModelRelease";

function statusVariant(status: ReadinessControl["status"]): "default" | "secondary" | "outline" | "destructive" {
  if (status === "pass") return "default";
  if (status === "fail") return "destructive";
  if (status === "warning") return "secondary";
  return "outline";
}

export default function CommercialReleaseDetail() {
  const { versionId } = useParams<{ versionId: string }>();
  const { tenantId, hasPermission, isPlatformAdmin } = useCommercialAccess();
  const canCertify = isPlatformAdmin || hasPermission("commercial.release.certify");
  const canActivate = isPlatformAdmin || hasPermission("commercial.model.version.activate");

  const ctx = useReleaseContext(tenantId);
  const program = ctx.data?.program ?? null;
  const versions = ctx.data?.versions ?? [];
  const version = versions.find((v) => v.id === versionId) ?? null;

  const readiness = useReleaseReadiness(tenantId, versionId ?? null);
  const certs = useReleaseCertifications(tenantId, versionId ?? null);
  const activations = useActivationHistory(tenantId, program?.id ?? null);

  const latestCert = (certs.data ?? [])[0] ?? null;
  const lineage = useReleaseLineage(tenantId, latestCert?.id ?? null);

  const createCert = useCreateCertification(tenantId);
  const refreshCert = useRefreshCertification(tenantId);
  const certify = useCertifyRelease(tenantId);
  const invalidate = useInvalidateCertification(tenantId);
  const activate = useActivateModelVersion(tenantId);
  const successor = useCreateSuccessorVersion(tenantId);

  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [invalidReason, setInvalidReason] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [successorCode, setSuccessorCode] = useState("");
  const [activateOpen, setActivateOpen] = useState(false);

  const controls = readiness.data ?? [];
  const grouped = useMemo(() => {
    const map = new Map<string, ReadinessControl[]>();
    for (const c of controls) {
      const list = map.get(c.category) ?? [];
      list.push(c);
      map.set(c.category, list);
    }
    return Array.from(map.entries()).sort(
      (a, b) => READINESS_CATEGORY_ORDER.indexOf(a[0]) - READINESS_CATEGORY_ORDER.indexOf(b[0]),
    );
  }, [controls]);

  const blocking = controls.filter((c) => c.blocking && c.status === "fail");
  const warnings = controls.filter((c) => c.status === "warning");

  if (ctx.isLoading) return <LoadingState label="Loading model version…" />;
  if (!version) return <EmptyState title="Model version not found" description="This version does not exist in the active workspace." />;

  const certReady = latestCert?.status === "ready" || latestCert?.status === "certified";
  const canActivateNow =
    canActivate && latestCert?.status === "certified" && version.status === "draft" && blocking.length === 0;

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast({ title: ok });
    } catch (e) {
      toast({ title: "Action failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-1 -ml-2">
            <Link to="/commercial/model/release"><ArrowLeft className="mr-1 h-3.5 w-3.5" />Release workspace</Link>
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <ShieldCheck className="h-5 w-5" />
            {version.version_code}
            <Badge variant={version.status === "active" ? "default" : version.status === "superseded" ? "secondary" : "outline"}>
              {version.status}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">{version.name}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => readiness.refetch()} disabled={readiness.isFetching}>
          <RefreshCcw className="mr-1 h-3.5 w-3.5" />Re-evaluate readiness
        </Button>
      </div>

      {blocking.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{blocking.length} blocking control{blocking.length === 1 ? "" : "s"} failing</AlertTitle>
          <AlertDescription>Activation is blocked until every blocking control passes.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Controls", value: controls.length },
          { label: "Passing", value: controls.filter((c) => c.status === "pass").length },
          { label: "Warnings", value: warnings.length },
          { label: "Blocking failures", value: blocking.length },
        ].map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2"><CardDescription>{k.label}</CardDescription></CardHeader>
            <CardContent className="text-2xl font-semibold">{k.value}</CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="readiness">
        <TabsList>
          <TabsTrigger value="readiness">Readiness</TabsTrigger>
          <TabsTrigger value="certification">Certification</TabsTrigger>
          <TabsTrigger value="lineage">Lineage</TabsTrigger>
          <TabsTrigger value="handoff">Handoff</TabsTrigger>
        </TabsList>

        <TabsContent value="readiness" className="space-y-4 pt-4">
          {readiness.isLoading && <LoadingState label="Evaluating controls…" />}
          {grouped.map(([category, list]) => (
            <Card key={category}>
              <CardHeader className="pb-2"><CardTitle className="text-base">{category}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Control</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Remediation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((c) => (
                      <TableRow key={c.control_code}>
                        <TableCell>
                          <div className="font-medium">{c.label}</div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {c.control_code}{c.blocking ? " · blocking" : ""}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={statusVariant(c.status)}>{c.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{c.expected_value ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{c.actual_value ?? "—"}</TableCell>
                        <TableCell className="max-w-[280px] text-xs text-muted-foreground">{c.remediation_hint ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="certification" className="space-y-4 pt-4">
          {canCertify && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Certification actions</CardTitle>
                <CardDescription>
                  Certification freezes a readiness snapshot and release manifest with deterministic hashes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Note (optional)</Label>
                  <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => run(() => createCert.mutateAsync({ modelVersionId: version.id, notes: note || undefined }), "Certification draft created")}
                    disabled={createCert.isPending}
                  >
                    New certification
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!latestCert || latestCert.status === "certified" || refreshCert.isPending}
                    onClick={() => run(() => refreshCert.mutateAsync(latestCert!.id), "Certification refreshed")}
                  >
                    <RefreshCcw className="mr-1 h-3.5 w-3.5" />Refresh snapshot
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!latestCert || latestCert.status !== "ready" || certify.isPending}
                    onClick={() => run(() => certify.mutateAsync({ certificationId: latestCert!.id, note: note || undefined }), "Release certified")}
                  >
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />Certify
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Certifications</CardTitle></CardHeader>
            <CardContent>
              {(certs.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No certification has been created for this version.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pass / Warn / Block</TableHead>
                      <TableHead>Readiness hash</TableHead>
                      <TableHead>Manifest hash</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(certs.data ?? []).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{new Date(c.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={c.status === "certified" ? "default" : c.status === "invalidated" ? "destructive" : "secondary"}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.pass_count} / {c.warning_count} / {c.blocking_failure_count}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{c.readiness_hash?.slice(0, 12) ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{c.manifest_hash?.slice(0, 12) ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          {canCertify && c.status !== "invalidated" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const r = invalidReason.trim() || "Manual invalidation";
                                run(() => invalidate.mutateAsync({ certificationId: c.id, reason: r }), "Certification invalidated");
                              }}
                            >
                              <Ban className="mr-1 h-3.5 w-3.5" />Invalidate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {canCertify && (
                <div className="mt-3 space-y-1.5">
                  <Label>Invalidation reason</Label>
                  <Input value={invalidReason} onChange={(e) => setInvalidReason(e.target.value)} placeholder="Reason recorded in the audit trail" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lineage" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Release lineage</CardTitle>
              <CardDescription>Upstream evidence bound to the latest certification snapshot.</CardDescription>
            </CardHeader>
            <CardContent>
              {(lineage.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No lineage recorded. Create a certification to capture lineage.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Upstream</TableHead>
                      <TableHead>Downstream</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Source hash</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(lineage.data ?? []).map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.relationship}</TableCell>
                        <TableCell className="text-muted-foreground">{l.upstream_type}</TableCell>
                        <TableCell className="text-muted-foreground">{l.downstream_type}</TableCell>
                        <TableCell className="text-muted-foreground">{l.scope ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{l.source_hash?.slice(0, 12) ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="handoff" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activation</CardTitle>
              <CardDescription>
                Activation requires a certified release with zero blocking failures. The previously active
                version is superseded atomically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!certReady && <p className="text-sm text-muted-foreground">Create and certify a release first.</p>}
              <div className="space-y-1.5">
                <Label>Activation reason</Label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Production handoff rationale" />
              </div>
              <Button
                disabled={!canActivateNow || !reason.trim() || activate.isPending}
                onClick={() => setActivateOpen(true)}
              >
                <Rocket className="mr-1 h-4 w-4" />Activate {version.version_code}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Successor version</CardTitle>
              <CardDescription>Open a new draft version to continue modelling after activation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>New version code</Label>
                <Input value={successorCode} onChange={(e) => setSuccessorCode(e.target.value)} placeholder="PM-FIN-2026.2" />
              </div>
              <Button
                variant="outline"
                disabled={!canActivate || !successorCode.trim() || successor.isPending}
                onClick={() =>
                  run(
                    () => successor.mutateAsync({ modelVersionId: version.id, versionCode: successorCode.trim() }),
                    "Successor draft created",
                  )
                }
              >
                <GitBranch className="mr-1 h-4 w-4" />Create successor draft
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Activation records</CardTitle></CardHeader>
            <CardContent>
              {(activations.data ?? []).filter((a) => a.model_version_id === version.id).length === 0 ? (
                <p className="text-sm text-muted-foreground">This version has never been activated.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Activated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Certification hash</TableHead>
                      <TableHead>Warnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(activations.data ?? [])
                      .filter((a) => a.model_version_id === version.id)
                      .map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>{new Date(a.activated_at).toLocaleString()}</TableCell>
                          <TableCell><Badge variant={a.status === "active" ? "default" : "secondary"}>{a.status}</Badge></TableCell>
                          <TableCell className="font-mono text-xs">{a.certification_hash?.slice(0, 12) ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{a.warning_count}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={activateOpen} onOpenChange={setActivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate {version.version_code}?</AlertDialogTitle>
            <AlertDialogDescription>
              This supersedes the currently active version and is recorded immutably. Type the version code
              to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)} placeholder={version.version_code} />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmCode("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmCode.trim() !== version.version_code || !latestCert}
              onClick={async () => {
                setActivateOpen(false);
                setConfirmCode("");
                await run(
                  () => activate.mutateAsync({
                    modelVersionId: version.id,
                    certificationId: latestCert!.id,
                    reason: reason.trim(),
                  }),
                  "Model version activated",
                );
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
