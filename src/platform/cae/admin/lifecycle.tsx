/**
 * CAE.080 — narrative version lifecycle controls.
 *
 * Every action here calls a SECURITY DEFINER database function. The client
 * never decides whether a transition is legal: allowed transitions, permission
 * codes, separation of duties and audit capture are enforced server-side.
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Send, CheckCircle2, XCircle, Upload, Archive, GitCompare, RotateCcw, History,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { sanitizeError } from "@/platform/components/States";
import {
  useCreateDraftFromVersion, useNarrativeAudit, useVersionTransition,
  type LifecycleAction, type VersionRow,
} from "./data";

export const LIFECYCLE_ORDER = ["draft", "in_review", "approved", "published", "retired"] as const;

export function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

type Perm = (code: string) => boolean;

/* --------------------------------------------------------- action buttons */

export function VersionLifecycleActions({
  version, hasPermission, activePlacementCount, onDone,
}: {
  version: VersionRow;
  hasPermission: Perm;
  activePlacementCount: number;
  onDone?: () => void;
}) {
  const transition = useVersionTransition();
  const restore = useCreateDraftFromVersion();
  const [prompt, setPrompt] = useState<LifecycleAction | "restore" | null>(null);
  const [comment, setComment] = useState("");

  const run = async (action: LifecycleAction, text?: string) => {
    try {
      await transition.mutateAsync({ versionId: version.id, action, comment: text ?? null });
      toast.success(`Version v${version.version_no} → ${statusLabel(actionTarget(action))}`);
      onDone?.();
    } catch (err) {
      toast.error(sanitizeError(err instanceof Error ? err.message : String(err)));
    }
  };

  const runRestore = async (text: string) => {
    try {
      await restore.mutateAsync({ sourceVersionId: version.id, changeSummary: text || null });
      toast.success(`New draft created from v${version.version_no}`);
      onDone?.();
    } catch (err) {
      toast.error(sanitizeError(err instanceof Error ? err.message : String(err)));
    }
  };

  const close = () => { setPrompt(null); setComment(""); };
  const busy = transition.isPending || restore.isPending;

  return (
    <div className="flex flex-wrap justify-end gap-1">
      {version.status === "draft" && hasPermission("audio.narrative.review") && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => setPrompt("submit")}>
          <Send className="h-3.5 w-3.5" aria-hidden="true" /><span>Submit for review</span>
        </Button>
      )}
      {version.status === "in_review" && hasPermission("audio.narrative.approve") && (
        <>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => setPrompt("approve")}>
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /><span>Approve</span>
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => setPrompt("reject")}>
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" /><span>Reject</span>
          </Button>
        </>
      )}
      {version.status === "approved" && hasPermission("audio.narrative.publish") && (
        <Button size="sm" disabled={busy} onClick={() => setPrompt("publish")}>
          <Upload className="h-3.5 w-3.5" aria-hidden="true" /><span>Publish</span>
        </Button>
      )}
      {(version.status === "published" || version.status === "approved")
        && hasPermission("audio.narrative.retire") && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => setPrompt("retire")}>
          <Archive className="h-3.5 w-3.5" aria-hidden="true" /><span>Retire</span>
        </Button>
      )}
      {version.status !== "draft" && hasPermission("audio.narrative.author") && (
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => setPrompt("restore")}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /><span>Restore as new draft</span>
        </Button>
      )}

      <Dialog open={prompt !== null} onOpenChange={(o) => (o ? null : close())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {prompt === "restore"
                ? `Restore v${version.version_no} as a new draft`
                : `${promptTitle(prompt)} v${version.version_no}`}
            </DialogTitle>
            <DialogDescription>
              {prompt === "restore"
                ? "A new draft version is created from this content. The source version is never modified."
                : prompt === "reject"
                  ? "A comment is required. The version returns to draft so the author can revise it."
                  : prompt === "publish"
                    ? "Publishing atomically retires the currently published version and makes this the single active version."
                    : prompt === "retire"
                      ? activePlacementCount > 0
                        ? `Warning: ${activePlacementCount} active placement${activePlacementCount === 1 ? "" : "s"} reference this narrative and will stop playing audio.`
                        : "No active placements reference this narrative."
                      : "Optionally record a comment for the audit trail."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="lifecycle-comment">
              {prompt === "restore" ? "Change summary" : "Comment"}
              {prompt === "reject" && <span aria-hidden="true"> *</span>}
            </Label>
            <Textarea
              id="lifecycle-comment" rows={3} value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={prompt === "reject" ? "Explain what must change…" : "Optional"}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={busy}>Cancel</Button>
            <Button
              disabled={busy || (prompt === "reject" && comment.trim().length === 0)}
              onClick={async () => {
                if (prompt === "restore") await runRestore(comment.trim());
                else if (prompt) await run(prompt, comment.trim() || undefined);
                close();
              }}
            >
              {busy ? "Working…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function actionTarget(action: LifecycleAction) {
  return action === "submit" ? "in_review"
    : action === "approve" ? "approved"
    : action === "reject" ? "draft"
    : action === "publish" ? "published" : "retired";
}

function promptTitle(action: LifecycleAction | "restore" | null) {
  switch (action) {
    case "submit": return "Submit for review";
    case "approve": return "Approve";
    case "reject": return "Reject with comments";
    case "publish": return "Publish";
    case "retire": return "Retire";
    default: return "";
  }
}

/* ------------------------------------------------------- compare versions */

type DiffLine = { kind: "same" | "added" | "removed"; text: string };

function diffLines(left: string, right: string): DiffLine[] {
  const a = left.split(/\n+/).filter(Boolean);
  const b = right.split(/\n+/).filter(Boolean);
  const setA = new Set(a);
  const setB = new Set(b);
  const out: DiffLine[] = [];
  a.forEach((line) => out.push({ kind: setB.has(line) ? "same" : "removed", text: line }));
  b.forEach((line) => { if (!setA.has(line)) out.push({ kind: "added", text: line }); });
  return out;
}

export function CompareVersionsDialog({
  open, onOpenChange, versions,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  versions: VersionRow[];
}) {
  const [leftId, setLeftId] = useState<string>(versions[1]?.id ?? versions[0]?.id ?? "");
  const [rightId, setRightId] = useState<string>(versions[0]?.id ?? "");
  const left = versions.find((v) => v.id === leftId) ?? null;
  const right = versions.find((v) => v.id === rightId) ?? null;

  const diff = useMemo(
    () => diffLines(left?.speech_text || left?.source_text || "", right?.speech_text || right?.source_text || ""),
    [left, right],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Compare versions</DialogTitle>
          <DialogDescription>Content differences between two versions of the same call ID.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Base version</Label>
            <Select value={leftId} onValueChange={setLeftId}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>v{v.version_no} · {statusLabel(v.status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Compared version</Label>
            <Select value={rightId} onValueChange={setRightId}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>v{v.version_no} · {statusLabel(v.status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="max-h-[45vh] space-y-1 overflow-y-auto rounded-md border border-border p-3 text-xs">
          {diff.length === 0 && <p className="text-muted-foreground">No content to compare.</p>}
          {diff.map((line, i) => (
            <p
              key={`${line.kind}-${i}`}
              className={
                line.kind === "added" ? "rounded bg-primary/10 px-1 text-foreground"
                  : line.kind === "removed" ? "rounded bg-destructive/10 px-1 text-muted-foreground line-through"
                  : "px-1 text-muted-foreground"
              }
            >
              <span className="mr-1 font-mono">{line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " "}</span>
              {line.text}
            </p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------------------- audit history */

export function AuditHistoryDialog({
  open, onOpenChange, narrativeId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  narrativeId: string | undefined;
}) {
  const audit = useNarrativeAudit(narrativeId, open);
  const rows = audit.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Audit history</DialogTitle>
          <DialogDescription>
            Every lifecycle action recorded with actor, timestamp, previous state, new state and comment.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[55vh] overflow-auto">
          <Table>
            <caption className="sr-only">Lifecycle audit history</caption>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Transition</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.isLoading && (
                <TableRow><TableCell colSpan={6} className="text-xs text-muted-foreground">Loading…</TableCell></TableRow>
              )}
              {!audit.isLoading && rows.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-xs text-muted-foreground">No audit entries yet.</TableCell></TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs">{new Date(r.occurred_at).toLocaleString()}</TableCell>
                  <TableCell className="text-xs"><Badge variant="secondary">{r.action_code.replace("cae.", "")}</Badge></TableCell>
                  <TableCell className="text-xs">{r.version_no != null ? `v${r.version_no}` : "—"}</TableCell>
                  <TableCell className="text-xs">
                    {r.previous_status ? statusLabel(r.previous_status) : "—"} → {r.new_status ? statusLabel(r.new_status) : "—"}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate text-xs">{r.actor_name ?? r.actor_user_id ?? "—"}</TableCell>
                  <TableCell className="max-w-[220px] text-xs">{r.comment ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const LifecycleIcons = { GitCompare, History };
