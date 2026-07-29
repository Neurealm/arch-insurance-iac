import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, PlayCircle, Trash2, XCircle, AlertTriangle } from "lucide-react";
import { LoadingState, EmptyState } from "@/platform/components/States";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import {
  useChangeSetDetail, useValidateChangeSet, useApplyChangeSet, useCancelChangeSet,
  useRemoveChangeSetItem, useAssumptionsContext,
} from "@/commercial/hooks/useAssumptionChangeSets";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  validated: "bg-blue-500/10 text-blue-700 border-blue-500/40",
  applied: "bg-emerald-500/10 text-emerald-700 border-emerald-500/40",
  cancelled: "bg-red-500/10 text-red-700 border-red-500/40",
};

export default function CommercialAssumptionChangeSet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenantId, hasPermission, isPlatformAdmin } = useCommercialAccess();
  const ctx = useAssumptionsContext(tenantId);
  const detail = useChangeSetDetail(tenantId, id ?? null);

  const validateMut = useValidateChangeSet(tenantId, id ?? null);
  const applyMut = useApplyChangeSet(tenantId, id ?? null);
  const cancelMut = useCancelChangeSet(tenantId, id ?? null);
  const removeMut = useRemoveChangeSetItem(tenantId, id ?? null);

  const canValidate = isPlatformAdmin || hasPermission("commercial.assumption.change.validate");
  const canApply = isPlatformAdmin || hasPermission("commercial.assumption.change.apply");
  const canCancel = isPlatformAdmin || hasPermission("commercial.assumption.change.cancel");

  const scenarios = ctx.data?.scenarios ?? [];
  const scenarioName = (sid: string) => scenarios.find((s) => s.id === sid)?.name ?? sid.slice(0, 8);

  const header = detail.data?.header ?? null;
  const items = detail.data?.items ?? [];

  const summary = useMemo(() => {
    const errs = items.filter((i) => i.validation_status === "error").length;
    const warns = items.filter((i) => i.validation_status === "warning").length;
    const ok = items.filter((i) => i.validation_status === "valid").length;
    return { errs, warns, ok };
  }, [items]);

  const impactedScopes = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) for (const s of it.impact_scopes ?? []) set.add(s);
    return Array.from(set);
  }, [items]);

  if (detail.isLoading) return <LoadingState label="Loading change set…" />;
  if (!header) {
    return <EmptyState title="Change set not found" description="It may have been cancelled or you may lack permission." />;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/commercial/model/assumptions"><ArrowLeft className="mr-1 h-4 w-4" /> Back to assumptions</Link>
        </Button>
      </div>

      <Card data-guide-target="change-set-detail">
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle>{header.title}</CardTitle>
              <CardDescription>{header.description ?? "No rationale provided."}</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap" data-guide-target="change-set-status">
              <Badge className={STATUS_COLORS[header.status]} variant="outline">{header.status}</Badge>
              <Badge variant="outline">{header.change_count} items</Badge>
              {header.content_hash && <code className="text-xs text-muted-foreground">{header.content_hash.slice(0, 12)}…</code>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-2 text-xs text-muted-foreground" data-guide-target="change-set-audit">
            <div>Created: {new Date(header.created_at).toLocaleString()}</div>
            <div>Updated: {new Date(header.updated_at).toLocaleString()}</div>
            {header.validated_at && <div>Validated: {new Date(header.validated_at).toLocaleString()}</div>}
            {header.applied_at && <div>Applied: {new Date(header.applied_at).toLocaleString()}</div>}
            {header.cancelled_at && <div>Cancelled: {new Date(header.cancelled_at).toLocaleString()}</div>}
          </div>

          {header.status === "draft" && summary.errs > 0 && (
            <Alert variant="destructive" data-guide-target="change-set-validation">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{summary.errs} validation error(s)</AlertTitle>
              <AlertDescription>Fix the flagged items before this change set can be validated.</AlertDescription>
            </Alert>
          )}
          {header.status === "validated" && (
            <Alert data-guide-target="change-set-impact">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Validated · ready to apply</AlertTitle>
              <AlertDescription>
                Applying will update {header.change_count} assumption(s). Downstream scopes:{" "}
                {impactedScopes.length ? impactedScopes.join(", ") : "unknown"}. Historical runs are not mutated — re-execute the affected scopes to refresh outputs.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2" data-guide-target="change-set-actions">
            {header.status === "draft" && (
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    const r = await validateMut.mutateAsync();
                    toast({
                      title: (r as any).valid ? "Validation passed" : "Validation failed",
                      description: `errors: ${(r as any).errors} · warnings: ${(r as any).warnings}`,
                      variant: (r as any).valid ? "default" : "destructive",
                    });
                  } catch (e: any) {
                    toast({ title: "Validate failed", description: e.message ?? String(e), variant: "destructive" });
                  }
                }}
                disabled={!canValidate || items.length === 0}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" /> Validate
              </Button>
            )}

            {header.status === "validated" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" disabled={!canApply}>
                    <PlayCircle className="mr-1 h-4 w-4" /> Apply
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apply change set?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Applying will update <strong>{header.change_count}</strong> assumption(s) inside model version{" "}
                      <code>{header.model_version_id.slice(0, 8)}</code>. Downstream scopes:{" "}
                      <strong>{impactedScopes.length ? impactedScopes.join(", ") : "unknown"}</strong>. Completed model runs will NOT be changed —
                      new model execution is required to refresh outputs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        try {
                          const r = await applyMut.mutateAsync();
                          if ((r as any).applied) {
                            toast({ title: "Applied", description: `${(r as any).applied_items} assumption(s) updated.` });
                          } else {
                            toast({ title: "Conflict detected", description: "Assumptions changed since validation. Revalidate.", variant: "destructive" });
                          }
                        } catch (e: any) {
                          toast({ title: "Apply failed", description: e.message ?? String(e), variant: "destructive" });
                        }
                      }}
                    >
                      Apply now
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {(header.status === "draft" || header.status === "validated") && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={!canCancel}>
                    <XCircle className="mr-1 h-4 w-4" /> Cancel change set
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel change set?</AlertDialogTitle>
                    <AlertDialogDescription>This is permanent — cancelled change sets are immutable.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        try {
                          await cancelMut.mutateAsync("User cancelled");
                          toast({ title: "Change set cancelled" });
                          navigate("/commercial/model/assumptions");
                        } catch (e: any) {
                          toast({ title: "Cancel failed", description: e.message ?? String(e), variant: "destructive" });
                        }
                      }}
                    >
                      Cancel change set
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      <Card data-guide-target="change-set-current-proposed">
        <CardHeader>
          <CardTitle className="text-base">
            Proposed changes ({items.length}) · <span className="text-emerald-600">ok {summary.ok}</span> ·{" "}
            <span className="text-amber-600">warn {summary.warns}</span> ·{" "}
            <span className="text-red-600">err {summary.errs}</span>
          </CardTitle>
          <CardDescription>Draft items are removable; Validated/Applied/Cancelled items are immutable.</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState title="No items yet" description="Add assumptions from the browse page to populate this change set." />
          ) : (
            <div className="overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assumption</TableHead>
                    <TableHead>Scenario</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Δ</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead>Rationale</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => {
                    const prev = it.previous_value_numeric;
                    const next = it.proposed_value_numeric;
                    const delta = prev != null && next != null ? next - prev : null;
                    return (
                      <TableRow key={it.id}>
                        <TableCell className="font-mono text-xs">{it.assumption_code}</TableCell>
                        <TableCell className="text-xs">{scenarioName(it.scenario_id)}</TableCell>
                        <TableCell>{prev ?? it.previous_value_text ?? "—"}</TableCell>
                        <TableCell>{next ?? it.proposed_value_text ?? "—"}</TableCell>
                        <TableCell className={delta != null && delta !== 0 ? (delta > 0 ? "text-emerald-600" : "text-red-600") : ""}>
                          {delta != null ? (delta > 0 ? "+" : "") + delta : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{it.unit ?? "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {(it.impact_scopes ?? []).map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              it.validation_status === "error" ? "border-red-400 text-red-700" :
                              it.validation_status === "warning" ? "border-amber-400 text-amber-700" :
                              it.validation_status === "valid" ? "border-emerald-400 text-emerald-700" : ""
                            }
                            title={it.validation_message ?? ""}
                          >
                            {it.validation_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{it.rationale ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          {header.status === "draft" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={async () => {
                                try {
                                  await removeMut.mutateAsync(it.id);
                                  toast({ title: "Item removed" });
                                } catch (e: any) {
                                  toast({ title: "Remove failed", description: e.message ?? String(e), variant: "destructive" });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
