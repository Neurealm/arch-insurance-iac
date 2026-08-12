import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Search, Copy, Archive, RotateCcw, Send, Pencil, Eye } from "lucide-react";
import { useAccess } from "@/platform/access/AccessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { LoadingState, ErrorState, EmptyState, sanitizeError, errorMessage } from "@/platform/components/States";
import {
  useNarratives, useNarrativeVersions, useSetNarrativeStatus, useDuplicateNarrative,
  useSetVersionStatus, type NarrativeRow,
} from "./data";
import { isValidCallId } from "./helpers";

const ANY = "__any__";

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "published" ? "default" : status === "retired" ? "outline" : "secondary";
  return <Badge variant={variant as never}>{status.replace("_", " ")}</Badge>;
}

export default function NarrativeLibrary() {
  const { activeTenantId, tenants, switchTenant, hasPermission } = useAccess();
  const narratives = useNarratives(activeTenantId);
  const navigate = useNavigate();

  const canAuthor = hasPermission("audio.narrative.author");
  const canRetire = hasPermission("audio.narrative.retire");

  const [search, setSearch] = useState("");
  const [module, setModule] = useState(ANY);
  const [topic, setTopic] = useState(ANY);
  const [status, setStatus] = useState(ANY);
  const [audience, setAudience] = useState(ANY);
  const [locale, setLocale] = useState(ANY);
  const [profile, setProfile] = useState(ANY);
  const [owner, setOwner] = useState(ANY);
  const [placement, setPlacement] = useState(ANY);
  const [duplicating, setDuplicating] = useState<NarrativeRow | null>(null);
  const [submitting, setSubmitting] = useState<NarrativeRow | null>(null);

  const rows = narratives.data ?? [];

  const options = useMemo(() => {
    const uniq = (values: (string | null)[]) =>
      [...new Set(values.filter((v): v is string => !!v))].sort();
    return {
      modules: uniq(rows.map((r) => r.module_key)),
      topics: uniq(rows.map((r) => r.topic_key)),
      statuses: uniq(rows.map((r) => r.status)),
      audiences: uniq(rows.map((r) => r.audience)),
      locales: uniq(rows.map((r) => r.default_locale)),
      profiles: uniq(rows.map((r) => r.speech_profile_name)),
      owners: uniq(rows.map((r) => r.owner_name ?? (r.owner_user_id ? "Unnamed user" : null))),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const ownerLabel = r.owner_name ?? (r.owner_user_id ? "Unnamed user" : "");
      if (q) {
        const haystack = [
          r.call_id, r.name, r.description ?? "", r.module_key, r.topic_key, ownerLabel,
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (module !== ANY && r.module_key !== module) return false;
      if (topic !== ANY && r.topic_key !== topic) return false;
      if (status !== ANY && r.status !== status) return false;
      if (audience !== ANY && r.audience !== audience) return false;
      if (locale !== ANY && r.default_locale !== locale) return false;
      if (profile !== ANY && r.speech_profile_name !== profile) return false;
      if (owner !== ANY && ownerLabel !== owner) return false;
      if (placement === "placed" && r.placement_count === 0) return false;
      if (placement === "unplaced" && r.placement_count > 0) return false;
      if (placement === "enabled" && r.enabled_placement_count === 0) return false;
      return true;
    });
  }, [rows, search, module, topic, status, audience, locale, profile, owner, placement]);

  const setStatusMutation = useSetNarrativeStatus();

  const changeStatus = async (row: NarrativeRow, next: "retired" | "restore") => {
    try {
      await setStatusMutation.mutateAsync({ narrativeId: row.id, status: next });
      toast.success(next === "retired" ? `${row.call_id} retired` : `${row.call_id} restored`);
    } catch (err) {
      toast.error(sanitizeError(errorMessage(err)));
    }
  };

  if (narratives.isLoading) return <LoadingState label="Loading narrative library…" />;
  if (narratives.error) return <ErrorState error={narratives.error} onRetry={() => narratives.refetch()} />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Search and filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[260px] flex-1">
              <Label htmlFor="cae-search" className="text-xs">Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="cae-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Call ID, name, description, module, topic, or owner"
                  className="pl-8"
                />
              </div>
            </div>
            {canAuthor && (
              <Button onClick={() => navigate("/platform/audio/narratives/new")}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>New narrative</span>
              </Button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <FilterSelect
              id="f-tenant" label="Workspace" value={activeTenantId ?? ANY}
              onChange={(v) => v !== ANY && switchTenant(v)} includeAny={false}
              options={tenants.map((t) => ({ value: t.tenant_id, label: t.name }))}
            />
            <FilterSelect id="f-module" label="Module" value={module} onChange={setModule} options={options.modules.map((v) => ({ value: v, label: v }))} />
            <FilterSelect id="f-topic" label="Topic" value={topic} onChange={setTopic} options={options.topics.map((v) => ({ value: v, label: v }))} />
            <FilterSelect id="f-status" label="Lifecycle status" value={status} onChange={setStatus} options={options.statuses.map((v) => ({ value: v, label: v }))} />
            <FilterSelect id="f-audience" label="Audience" value={audience} onChange={setAudience} options={options.audiences.map((v) => ({ value: v, label: v }))} />
            <FilterSelect id="f-locale" label="Locale" value={locale} onChange={setLocale} options={options.locales.map((v) => ({ value: v, label: v }))} />
            <FilterSelect id="f-profile" label="Speech profile" value={profile} onChange={setProfile} options={options.profiles.map((v) => ({ value: v, label: v }))} />
            <FilterSelect id="f-owner" label="Owner" value={owner} onChange={setOwner} options={options.owners.map((v) => ({ value: v, label: v }))} />
            <FilterSelect
              id="f-placement" label="Placement status" value={placement} onChange={setPlacement}
              options={[
                { value: "placed", label: "Has placements" },
                { value: "enabled", label: "Has enabled placements" },
                { value: "unplaced", label: "No placements" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {filtered.length} of {rows.length} narrative{rows.length === 1 ? "" : "s"}
      </div>

      {!filtered.length ? (
        <EmptyState
          title="No narratives match these filters"
          description="Adjust the search or filters, or create a new narrative."
        />
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <caption className="sr-only">Contextual audio narrative library</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Call ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Active version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Speech profile</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Placements</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.call_id}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-xs">{r.module_key}</TableCell>
                    <TableCell className="text-xs">{r.topic_key}</TableCell>
                    <TableCell className="text-xs">{r.active_version_no ? `v${r.active_version_no}` : "—"}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="text-xs">{r.speech_profile_name ?? "—"}</TableCell>
                    <TableCell className="text-xs">{r.owner_name ?? (r.owner_user_id ? "Unnamed user" : "—")}</TableCell>
                    <TableCell className="text-xs">
                      {r.enabled_placement_count}/{r.placement_count}
                    </TableCell>
                    <TableCell className="text-xs">{new Date(r.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="icon" variant="ghost" className="min-h-11 min-w-11" aria-label={`View ${r.call_id}`}>
                          <Link to={`/platform/audio/narratives/${r.id}`}><Eye className="h-4 w-4" aria-hidden="true" /></Link>
                        </Button>
                        {canAuthor && (
                          <Button asChild size="icon" variant="ghost" className="min-h-11 min-w-11" aria-label={`Edit ${r.call_id}`}>
                            <Link to={`/platform/audio/narratives/${r.id}/edit`}><Pencil className="h-4 w-4" aria-hidden="true" /></Link>
                          </Button>
                        )}
                        {canAuthor && (
                          <Button size="icon" variant="ghost" className="min-h-11 min-w-11" aria-label={`Duplicate ${r.call_id}`} onClick={() => setDuplicating(r)}>
                            <Copy className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        {hasPermission("audio.narrative.review") && (
                          <Button size="icon" variant="ghost" className="min-h-11 min-w-11" aria-label={`Submit ${r.call_id} for review`} onClick={() => setSubmitting(r)}>
                            <Send className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        {canRetire && r.status !== "retired" && (
                          <Button size="icon" variant="ghost" className="min-h-11 min-w-11" aria-label={`Retire ${r.call_id}`} onClick={() => changeStatus(r, "retired")}>
                            <Archive className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        {canAuthor && r.status === "retired" && (
                          <Button size="icon" variant="ghost" className="min-h-11 min-w-11" aria-label={`Restore ${r.call_id}`} onClick={() => changeStatus(r, "restore")}>
                            <RotateCcw className="h-4 w-4" aria-hidden="true" />
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
      )}

      <DuplicateDialog row={duplicating} onClose={() => setDuplicating(null)} />
      <SubmitForReviewDialog row={submitting} tenantId={activeTenantId} onClose={() => setSubmitting(null)} />
    </div>
  );
}

function FilterSelect({
  id, label, value, onChange, options, includeAny = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  includeAny?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} aria-label={label}><SelectValue placeholder={label} /></SelectTrigger>
        <SelectContent>
          {includeAny && <SelectItem value={ANY}>All</SelectItem>}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DuplicateDialog({ row, onClose }: { row: NarrativeRow | null; onClose: () => void }) {
  const duplicate = useDuplicateNarrative();
  const navigate = useNavigate();
  const [callId, setCallId] = useState("");
  const [name, setName] = useState("");

  const open = !!row;
  const valid = isValidCallId(callId) && name.trim().length > 2;

  const submit = async () => {
    if (!row || !valid) return;
    try {
      const id = await duplicate.mutateAsync({ narrativeId: row.id, newCallId: callId.trim(), newName: name.trim() });
      toast.success("Narrative duplicated as a new draft");
      onClose();
      navigate(`/platform/audio/narratives/${id}/edit`);
    } catch (err) {
      toast.error(sanitizeError(errorMessage(err)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setCallId(""); setName(""); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate narrative</DialogTitle>
          <DialogDescription>
            Copies the content of {row?.call_id} into a new narrative. Call IDs can never be changed
            after creation, so choose carefully.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="dup-call">New call ID</Label>
            <Input id="dup-call" value={callId} onChange={(e) => setCallId(e.target.value.toUpperCase())} placeholder="CAE.MODULE.TOPIC.001" />
            {callId && !isValidCallId(callId) && (
              <p className="mt-1 text-xs text-destructive">Use the format CAE.MODULE.TOPIC.001.</p>
            )}
          </div>
          <div>
            <Label htmlFor="dup-name">New name</Label>
            <Input id="dup-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!valid || duplicate.isPending}>Duplicate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubmitForReviewDialog({
  row, tenantId, onClose,
}: { row: NarrativeRow | null; tenantId: string | null; onClose: () => void }) {
  const versions = useNarrativeVersions(tenantId, row?.id);
  const setVersionStatus = useSetVersionStatus();
  const drafts = (versions.data ?? []).filter((v) => v.status === "draft");

  const submit = async (versionId: string) => {
    try {
      await setVersionStatus.mutateAsync({ versionId, status: "in_review" });
      toast.success("Version submitted for review");
      onClose();
    } catch (err) {
      toast.error(sanitizeError(errorMessage(err)));
    }
  };

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit for review</DialogTitle>
          <DialogDescription>
            Select the draft version of {row?.call_id} to move into review.
          </DialogDescription>
        </DialogHeader>
        {versions.isLoading ? (
          <LoadingState label="Loading versions…" />
        ) : !drafts.length ? (
          <p className="text-sm text-muted-foreground">This narrative has no draft version to submit.</p>
        ) : (
          <ul className="space-y-2">
            {drafts.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-2">
                <span className="text-sm">Version {v.version_no}</span>
                <Button size="sm" onClick={() => submit(v.id)} disabled={setVersionStatus.isPending}>
                  Submit v{v.version_no}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
