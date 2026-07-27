import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Archive, RotateCcw, GitCompare, History } from "lucide-react";
import { useAccess } from "@/platform/access/AccessContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/platform/components/ConfirmDialog";
import { LoadingState, ErrorState, EmptyState, sanitizeError } from "@/platform/components/States";
import { TranscriptPanel } from "../components/TranscriptPanel";
import {
  useNarratives, useNarrativeVersions, usePlacements, useSetNarrativeStatus, useSpeechProfiles,
} from "./data";
import {
  AuditHistoryDialog, CompareVersionsDialog, VersionLifecycleActions, statusLabel,
} from "./lifecycle";
import { countWords, estimateDurationSeconds, extractVariableTokens, formatDuration } from "./helpers";

export default function NarrativeDetail() {
  const { narrativeId } = useParams<{ narrativeId: string }>();
  const { activeTenantId, hasPermission } = useAccess();
  const narratives = useNarratives(activeTenantId);
  const versions = useNarrativeVersions(activeTenantId, narrativeId);
  const placements = usePlacements(activeTenantId);
  const profiles = useSpeechProfiles(activeTenantId);
  const setNarrativeStatus = useSetNarrativeStatus();

  const [compareOpen, setCompareOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [retireOpen, setRetireOpen] = useState(false);

  const narrative = narratives.data?.find((n) => n.id === narrativeId) ?? null;
  const activeVersion = useMemo(
    () => versions.data?.find((v) => v.id === narrative?.active_version_id)
      ?? versions.data?.[0] ?? null,
    [versions.data, narrative?.active_version_id],
  );
  const linkedPlacements = (placements.data ?? []).filter((p) => p.narrative_id === narrativeId);
  const activePlacementCount = linkedPlacements.filter((p) => p.is_enabled).length;


  const transition = async (versionId: string, status: string) => {
    try {
      await setVersionStatus.mutateAsync({ versionId, status });
      toast.success(`Version moved to ${status.replace("_", " ")}`);
    } catch (err) {
      toast.error(sanitizeError(err instanceof Error ? err.message : String(err)));
    }
  };

  const narrativeTransition = async (status: "retired" | "restore") => {
    if (!narrativeId) return;
    try {
      await setNarrativeStatus.mutateAsync({ narrativeId, status });
      toast.success(status === "retired" ? "Narrative retired" : "Narrative restored");
    } catch (err) {
      toast.error(sanitizeError(err instanceof Error ? err.message : String(err)));
    }
  };

  if (narratives.isLoading || versions.isLoading) return <LoadingState label="Loading narrative…" />;
  if (narratives.error) return <ErrorState error={narratives.error} onRetry={() => narratives.refetch()} />;
  if (!narrative) {
    return (
      <EmptyState
        title="Narrative not found"
        description="It may have been removed, or it belongs to a different workspace."
        action={<Button asChild variant="outline"><Link to="/platform/audio">Back to library</Link></Button>}
      />
    );
  }

  const text = activeVersion?.speech_text || activeVersion?.source_text || "";
  const profile = profiles.data?.find(
    (p) => p.id === (activeVersion?.speech_profile_id ?? narrative.speech_profile_id),
  );
  const tokens = extractVariableTokens(activeVersion?.source_text ?? "");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/platform/audio"><ArrowLeft className="h-4 w-4" aria-hidden="true" /><span>Narrative library</span></Link>
          </Button>
          <h2 className="mt-1 text-lg font-semibold text-foreground">{narrative.name}</h2>
          <p className="font-mono text-xs text-muted-foreground">{narrative.call_id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={narrative.status === "published" ? "default" : "secondary"}>{narrative.status}</Badge>
          {hasPermission("audio.narrative.author") && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/platform/audio/narratives/${narrative.id}/edit`}>
                <Pencil className="h-4 w-4" aria-hidden="true" /><span>Edit</span>
              </Link>
            </Button>
          )}
          {hasPermission("audio.narrative.retire") && narrative.status !== "retired" && (
            <Button variant="outline" size="sm" onClick={() => narrativeTransition("retired")}>
              <Archive className="h-4 w-4" aria-hidden="true" /><span>Retire</span>
            </Button>
          )}
          {hasPermission("audio.narrative.author") && narrative.status === "retired" && (
            <Button variant="outline" size="sm" onClick={() => narrativeTransition("restore")}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /><span>Restore</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Identity</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field label="Module" value={narrative.module_key} />
            <Field label="Topic" value={narrative.topic_key} />
            <Field label="Scope" value={`${narrative.scope_type}${narrative.scope_reference ? ` · ${narrative.scope_reference}` : ""}`} />
            <Field label="Audience" value={narrative.audience} />
            <Field label="Locale" value={narrative.default_locale} />
            <Field label="Speech profile" value={profile?.display_name ?? "—"} />
            <Field label="Owner" value={narrative.owner_name ?? (narrative.owner_user_id ? "Unnamed user" : "—")} />
            <Field label="Placements" value={`${narrative.enabled_placement_count} enabled / ${narrative.placement_count} total`} />
            <Field label="Updated" value={new Date(narrative.updated_at).toLocaleString()} />
            {narrative.description && (
              <p className="pt-2 text-xs text-muted-foreground">{narrative.description}</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {activeVersion ? `Version ${activeVersion.version_no} · ${activeVersion.status}` : "No versions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>{countWords(text)} words</span>
                <span>
                  {formatDuration(
                    activeVersion?.estimated_duration_seconds ?? estimateDurationSeconds(text, profile?.rate ?? 1),
                  )} estimated
                </span>
                {tokens.length > 0 && <span>Variables: {tokens.join(", ")}</span>}
              </div>
              <TranscriptPanel
                title="Transcript"
                transcript={text || null}
                estimatedDurationSeconds={activeVersion?.estimated_duration_seconds ?? null}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Version history</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <caption className="sr-only">Version history for {narrative.call_id}</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Change summary</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(versions.data ?? []).map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>v{v.version_no}</TableCell>
                      <TableCell><Badge variant="secondary">{v.status.replace("_", " ")}</Badge></TableCell>
                      <TableCell className="max-w-[240px] truncate text-xs">{v.change_summary ?? "—"}</TableCell>
                      <TableCell className="text-xs">{v.published_at ? new Date(v.published_at).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {v.status === "draft" && hasPermission("audio.narrative.review") && (
                            <Button size="sm" variant="outline" onClick={() => transition(v.id, "in_review")}>
                              <Send className="h-3.5 w-3.5" aria-hidden="true" /><span>Review</span>
                            </Button>
                          )}
                          {v.status === "in_review" && hasPermission("audio.narrative.approve") && (
                            <Button size="sm" variant="outline" onClick={() => transition(v.id, "approved")}>
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /><span>Approve</span>
                            </Button>
                          )}
                          {v.status === "approved" && hasPermission("audio.narrative.publish") && (
                            <Button size="sm" onClick={() => transition(v.id, "published")}>
                              <Upload className="h-3.5 w-3.5" aria-hidden="true" /><span>Publish</span>
                            </Button>
                          )}
                          {v.status === "published" && hasPermission("audio.narrative.retire") && (
                            <Button size="sm" variant="outline" onClick={() => transition(v.id, "retired")}>
                              <Archive className="h-3.5 w-3.5" aria-hidden="true" /><span>Retire</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Placements</CardTitle></CardHeader>
            <CardContent>
              {!linkedPlacements.length ? (
                <p className="text-sm text-muted-foreground">
                  No placements reference this narrative yet.{" "}
                  <Link className="underline" to="/platform/audio/placements">Open the placement map</Link>.
                </p>
              ) : (
                <ul className="space-y-2">
                  {linkedPlacements.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-2 text-xs">
                      <span className="font-mono">{p.placement_key}</span>
                      <span>{p.route_pattern ?? "—"}</span>
                      <Badge variant={p.is_enabled ? "default" : "outline"}>{p.is_enabled ? "enabled" : "disabled"}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}
