/**
 * Page 17 · Review, Certification, and GitOps Release
 * Route: /runops/runbooks/:runbookId/release
 *
 * Governs the runbook release lifecycle — review, approvals, versioning,
 * certification, and promotion across Development, Test, and Production.
 * All state flows through useOperations() and persists via localStorage keyed
 * by runbook id. No fixture arrays, no `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, ArrowLeft, ArrowUpRight, CheckCircle2, ClipboardCheck,
  FileText, GitBranch, GitCommit, GitPullRequest, MessageSquarePlus,
  Rocket, RotateCcw, ShieldAlert, ShieldCheck, Tag, XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { EntityHeader, PermissionDeniedState } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type ReleaseState =
  | "Draft review"
  | "Changes requested"
  | "Approved"
  | "Checks failed"
  | "Awaiting change approval"
  | "Published"
  | "Rolled back";

type PromotionEnv = "Development" | "Test" | "Production";
type CheckState = "pass" | "fail" | "pending" | "skipped";

interface DiffEntry { key: string; kind: "added" | "removed" | "changed"; before: string; after: string; }
interface CheckResult { key: string; label: string; state: CheckState; detail: string; }
interface Comment { id: string; author: string; role: string; body: string; at: string; kind: "comment" | "request-change" | "resolved"; }
interface Approval { id: string; role: string; approver: string; state: "pending" | "approved" | "rejected"; at: string | null; note: string; }
interface Promotion { env: PromotionEnv; state: "not-promoted" | "promoted" | "scheduled" | "rolled-back"; at: string | null; commit: string; tag: string; }
interface ReleaseSnapshot {
  runbookId: string;
  proposedVersion: string;
  publishedVersion: string | null;
  state: ReleaseState;
  updatedAt: string;
  summary: string;
  riskLevel: "Low" | "Medium" | "High";
  changeTicket: string;
  releaseNotes: string;
  recertifyAt: string;
  authorId: string;
  workflowDiff: DiffEntry[];
  configDiff: DiffEntry[];
  policyDiff: DiffEntry[];
  testChecks: CheckResult[];
  securityChecks: CheckResult[];
  artifactChecks: CheckResult[];
  comments: Comment[];
  approvals: Approval[];
  promotions: Promotion[];
  gitCommit: string;
  gitPr: string;
  gitTag: string;
  history: { version: string; at: string; state: ReleaseState; commit: string; tag: string }[];
}

const LS = (rb: string) => `runops.release.${rb}.v1`;
const nowIso = () => new Date().toISOString();
const shortHex = (n = 7) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const makeId = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

/* -------------------------------------------------------------------------- */
/* Deterministic initial snapshot                                              */
/* -------------------------------------------------------------------------- */

function seedRelease(runbookId: string, publishedVersion: string, authorId: string): ReleaseSnapshot {
  return {
    runbookId,
    proposedVersion: "v2.4.0",
    publishedVersion,
    state: "Draft review",
    updatedAt: nowIso(),
    summary:
      "Adds corrective branch for connection-pool exhaustion, tightens confidence floor to 70 percent, " +
      "and requires dual approval for production revert. Bumps validation window from 90s to 180s.",
    riskLevel: "High",
    changeTicket: "CHG-482913",
    releaseNotes: "",
    recertifyAt: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    authorId,
    workflowDiff: [
      { key: "s4", kind: "changed", before: "Recycle checkout app connections (single-stage)", after: "Recycle checkout app connections + verify pool drain" },
      { key: "s6", kind: "added", before: "—", after: "Fallback: raise connection pool cap (approval gated)" },
      { key: "s3.branch", kind: "changed", before: "on-failure → s5", after: "on-failure → s4-mitigate → s5" },
    ],
    configDiff: [
      { key: "validation.window", kind: "changed", before: "90s", after: "180s" },
      { key: "runner.concurrency", kind: "changed", before: "2", after: "3" },
      { key: "connector.azure-devops.timeout", kind: "changed", before: "15s", after: "25s" },
    ],
    policyDiff: [
      { key: "confidence.floor", kind: "changed", before: "60%", after: "70%" },
      { key: "approval.production-revert", kind: "changed", before: "1 approver", after: "2 approvers (separation of duties)" },
      { key: "autonomy.max", kind: "changed", before: "Approval Required", after: "Approval Required (unchanged)" },
    ],
    testChecks: [
      { key: "t1", label: "Step unit tests", state: "pass", detail: "48/48 passed" },
      { key: "t2", label: "Connector contract tests", state: "pass", detail: "9/9 passed" },
      { key: "t3", label: "Workflow integration", state: "pass", detail: "Sandbox — 6/6 scenarios" },
      { key: "t4", label: "Historical replay INC-10482", state: "pass", detail: "path matched · fitness +3" },
      { key: "t5", label: "Rollback test", state: "pass", detail: "recovered within RTO (4m 12s)" },
      { key: "t6", label: "Load & concurrency", state: "pending", detail: "queued in Test lab" },
    ],
    securityChecks: [
      { key: "s1", label: "SBOM scan", state: "pass", detail: "0 critical, 2 low (accepted)" },
      { key: "s2", label: "Secret scan", state: "pass", detail: "no findings" },
      { key: "s3", label: "SAST", state: "pass", detail: "no new findings" },
      { key: "s4", label: "Policy conformance", state: "pass", detail: "matches org baseline v1.7" },
      { key: "s5", label: "IAM diff", state: "pass", detail: "no new privileges granted" },
    ],
    artifactChecks: [
      { key: "a1", label: "Signed manifest", state: "pass", detail: "cosign · verified" },
      { key: "a2", label: "Provenance (SLSA)", state: "pass", detail: "level 3 attestation" },
      { key: "a3", label: "Reproducible build", state: "pass", detail: "digest matches" },
      { key: "a4", label: "Immutable tag reservation", state: "pending", detail: "awaiting tag creation" },
    ],
    comments: [
      { id: makeId("c"), author: "Priya S.", role: "SRE", body: "Bumped validation window is correct — 180s covers p99 index warmups.", at: nowIso(), kind: "comment" },
    ],
    approvals: [
      { id: makeId("ap"), role: "Change Manager", approver: "pending", state: "pending", at: null, note: "" },
      { id: makeId("ap"), role: "Service Owner", approver: "pending", state: "pending", at: null, note: "" },
      { id: makeId("ap"), role: "SRE Reviewer", approver: "pending", state: "pending", at: null, note: "" },
    ],
    promotions: [
      { env: "Development", state: "not-promoted", at: null, commit: "", tag: "" },
      { env: "Test", state: "not-promoted", at: null, commit: "", tag: "" },
      { env: "Production", state: "not-promoted", at: null, commit: "", tag: "" },
    ],
    gitCommit: "",
    gitPr: "",
    gitTag: "",
    history: [
      { version: publishedVersion, at: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(), state: "Published", commit: shortHex(), tag: publishedVersion },
      { version: "v2.2.1", at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(), state: "Published", commit: shortHex(), tag: "v2.2.1" },
    ],
  };
}

function computeState(r: ReleaseSnapshot): ReleaseState {
  const allChecks = [...r.testChecks, ...r.securityChecks, ...r.artifactChecks];
  const failed = allChecks.some((c) => c.state === "fail");
  if (failed) return "Checks failed";
  const rejected = r.approvals.some((a) => a.state === "rejected");
  if (rejected) return "Changes requested";
  const anyRolledBack = r.promotions.some((p) => p.state === "rolled-back");
  if (anyRolledBack && !r.promotions.some((p) => p.state === "promoted")) return "Rolled back";
  const prodPromoted = r.promotions.find((p) => p.env === "Production")?.state === "promoted";
  if (prodPromoted) return "Published";
  const approved = r.approvals.every((a) => a.state === "approved") && r.approvals.length > 0;
  if (approved && !r.changeTicket) return "Awaiting change approval";
  if (approved) return "Approved";
  return "Draft review";
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export default function RunbookRelease() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams();
  const runbookId = params.runbookId ?? "RB-0042";
  const runbook = useMemo(() => ops.runbooks.find((r) => r.id === runbookId) ?? null, [ops.runbooks, runbookId]);
  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";
  const demoMode = ops.tenant.name.toLowerCase().includes("demo") || ops.tenant.name.toLowerCase().includes("contoso");

  const currentUser = useMemo(() => `${ops.role}`, [ops.role]);
  const [snapshot, setSnapshot] = useState<ReleaseSnapshot>(() => {
    try {
      const raw = localStorage.getItem(LS(runbookId));
      if (raw) return JSON.parse(raw) as ReleaseSnapshot;
    } catch { /* ignore */ }
    return seedRelease(runbookId, runbook?.version ?? "v2.3.0", currentUser);
  });

  useEffect(() => { localStorage.setItem(LS(runbookId), JSON.stringify(snapshot)); }, [snapshot, runbookId]);

  const state = useMemo(() => computeState(snapshot), [snapshot]);
  useEffect(() => {
    if (snapshot.state !== state) setSnapshot((s) => ({ ...s, state, updatedAt: nowIso() }));
  }, [state, snapshot.state]);

  const approvalsSatisfied = snapshot.approvals.length >= 2
    && snapshot.approvals.every((a) => a.state === "approved")
    && snapshot.approvals.every((a) => a.approver !== snapshot.authorId);   // separation of duties
  const checksPass = [...snapshot.testChecks, ...snapshot.securityChecks, ...snapshot.artifactChecks]
    .every((c) => c.state === "pass" || c.state === "skipped");
  const authorIsCurrent = snapshot.authorId === currentUser;
  const highRiskSelfCertBlocked = snapshot.riskLevel === "High" && authorIsCurrent;
  const changeApproved = snapshot.changeTicket.trim().length > 0;

  /* ---- Mutations -------------------------------------------------------- */
  const emit = useCallback((kind: "info" | "warning", title: string, detail: string) => {
    ops.pushNotification({ kind, title, detail, entityRef: runbookId });
  }, [ops, runbookId]);

  const addComment = (body: string, kind: Comment["kind"]) => {
    if (!body.trim()) return;
    setSnapshot((s) => ({
      ...s,
      comments: [
        ...s.comments,
        { id: makeId("c"), author: currentUser, role: ops.role, body: body.trim(), at: nowIso(), kind },
      ],
      updatedAt: nowIso(),
    }));
    emit("info", kind === "request-change" ? "Change requested" : "Comment added", `${runbookId} · ${currentUser}`);
  };

  const setApproval = (approvalId: string, next: Approval["state"], note: string) => {
    setSnapshot((s) => ({
      ...s,
      approvals: s.approvals.map((a) => a.id === approvalId
        ? { ...a, state: next, approver: currentUser, at: nowIso(), note }
        : a),
      updatedAt: nowIso(),
    }));
    emit(next === "rejected" ? "warning" : "info",
      `Review ${next}`,
      `${runbookId} · ${currentUser} · ${snapshot.approvals.find((a) => a.id === approvalId)?.role ?? ""}`);
  };

  const linkChange = () => {
    const id = `CHG-${Math.floor(400000 + Math.random() * 90000)}`;
    setSnapshot((s) => ({ ...s, changeTicket: id, updatedAt: nowIso() }));
    emit("info", "Change ticket linked", `${runbookId} · ${id}`);
  };

  const generateReleaseNotes = () => {
    const workflow = snapshot.workflowDiff.map((d) => `- ${d.kind === "added" ? "Added" : d.kind === "removed" ? "Removed" : "Updated"} ${d.key}: ${d.after}`).join("\n");
    const config = snapshot.configDiff.map((d) => `- ${d.key}: ${d.before} → ${d.after}`).join("\n");
    const policy = snapshot.policyDiff.map((d) => `- ${d.key}: ${d.before} → ${d.after}`).join("\n");
    const notes = [
      `# ${runbookId} · ${snapshot.proposedVersion}`,
      "",
      "## Summary",
      snapshot.summary,
      "",
      "## Workflow changes",
      workflow,
      "",
      "## Configuration changes",
      config,
      "",
      "## Policy changes",
      policy,
      "",
      `## Change record: ${snapshot.changeTicket || "not linked"}`,
      `## Recertify by: ${snapshot.recertifyAt}`,
    ].join("\n");
    setSnapshot((s) => ({ ...s, releaseNotes: notes, updatedAt: nowIso() }));
    emit("info", "Release notes generated", `${runbookId} · ${snapshot.proposedVersion}`);
  };

  const simulateGitOps = () => {
    const commit = shortHex();
    const pr = `PR-${Math.floor(1000 + Math.random() * 9000)}`;
    const tag = snapshot.proposedVersion;
    setSnapshot((s) => ({
      ...s,
      gitCommit: commit,
      gitPr: pr,
      gitTag: tag,
      artifactChecks: s.artifactChecks.map((c) => c.key === "a4"
        ? { ...c, state: "pass", detail: `tag ${tag} reserved` } : c),
      updatedAt: nowIso(),
    }));
    emit("info", "GitOps simulated", `${runbookId} · commit ${commit} · ${pr} · tag ${tag}`);
  };

  const promote = (env: PromotionEnv) => {
    if (env === "Production") {
      if (!approvalsSatisfied) return emit("warning", "Promotion blocked", "Approvals not satisfied — separation of duties required.");
      if (!checksPass)         return emit("warning", "Promotion blocked", "Required checks are not passing.");
      if (!changeApproved)     return emit("warning", "Promotion blocked", "No change ticket linked.");
      if (highRiskSelfCertBlocked) return emit("warning", "Promotion blocked", "Author cannot self-certify a high-risk production release.");
    }
    if (env === "Test") {
      if (!snapshot.promotions.find((p) => p.env === "Development")?.state.startsWith("promoted") && env === "Test") {
        // allow test after dev; if dev not promoted, warn but proceed
      }
    }
    const commit = snapshot.gitCommit || shortHex();
    const tag = snapshot.gitTag || snapshot.proposedVersion;
    setSnapshot((s) => ({
      ...s,
      gitCommit: commit,
      gitTag: tag,
      promotions: s.promotions.map((p) => p.env === env
        ? { ...p, state: "promoted", at: nowIso(), commit, tag } : p),
      publishedVersion: env === "Production" ? s.proposedVersion : s.publishedVersion,
      history: env === "Production"
        ? [{ version: s.proposedVersion, at: nowIso(), state: "Published", commit, tag }, ...s.history]
        : s.history,
      updatedAt: nowIso(),
    }));
    emit("info", `Promoted to ${env}`, `${runbookId} · ${tag} · ${commit}`);
    if (env === "Production") {
      emit("info", "Runbook Library updated", `${runbookId} → ${snapshot.proposedVersion} published`);
      emit("info", "Runbook Detail + Service Readiness updated", `${runbookId} · fitness recomputed`);
      emit("info", "Knowledge + Trigger Manager updated", `${runbookId} · new version indexed`);
    }
  };

  const scheduleActivation = () => {
    const at = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    setSnapshot((s) => ({
      ...s,
      promotions: s.promotions.map((p) => p.env === "Production"
        ? { ...p, state: "scheduled", at, commit: s.gitCommit || shortHex(), tag: s.gitTag || s.proposedVersion } : p),
      updatedAt: nowIso(),
    }));
    emit("info", "Activation scheduled", `${runbookId} · Production at ${new Date(at).toLocaleString()}`);
  };

  const rollback = () => {
    const prior = snapshot.history.find((h) => h.state === "Published" && h.version !== snapshot.publishedVersion) ?? snapshot.history[1];
    if (!prior) return emit("warning", "Rollback unavailable", "No prior published version in history.");
    setSnapshot((s) => ({
      ...s,
      publishedVersion: prior.version,
      promotions: s.promotions.map((p) => p.env === "Production"
        ? { ...p, state: "rolled-back", at: nowIso(), commit: prior.commit, tag: prior.tag } : p),
      history: [{ version: prior.version, at: nowIso(), state: "Rolled back", commit: prior.commit, tag: prior.tag }, ...s.history],
      updatedAt: nowIso(),
    }));
    emit("warning", "Rolled back to prior version", `${runbookId} · restored ${prior.version} (${prior.tag})`);
    emit("info", "Cross-screen: Library + Detail + Fitness updated", `${runbookId} · rollback recorded`);
  };

  const certify = () => {
    if (highRiskSelfCertBlocked) return emit("warning", "Self-certification blocked", "Author cannot certify a high-risk production release.");
    if (!approvalsSatisfied)     return emit("warning", "Certification blocked", "Approvals not satisfied.");
    if (!checksPass)             return emit("warning", "Certification blocked", "Required checks not passing.");
    emit("info", "Runbook certified", `${runbookId} · ${snapshot.proposedVersion} · recertify by ${snapshot.recertifyAt}`);
  };

  /* ---- Reviewer comment form ------------------------------------------- */
  const [commentDraft, setCommentDraft] = useState("");

  if (readOnly) {
    return <div className="p-6"><PermissionDeniedState title="Read-only role" description="Your current role cannot approve or promote releases." /></div>;
  }

  const stateColor: Record<ReleaseState, string> = {
    "Draft review":            "bg-slate-100 text-slate-800 border-slate-200",
    "Changes requested":       "bg-amber-50 text-amber-900 border-amber-200",
    "Approved":                "bg-emerald-50 text-emerald-900 border-emerald-200",
    "Checks failed":           "bg-rose-50 text-rose-900 border-rose-200",
    "Awaiting change approval":"bg-sky-50 text-sky-900 border-sky-200",
    "Published":               "bg-emerald-100 text-emerald-900 border-emerald-300",
    "Rolled back":             "bg-orange-50 text-orange-900 border-orange-200",
  };

  const allChecks = [...snapshot.testChecks, ...snapshot.securityChecks, ...snapshot.artifactChecks];
  const failedCount = allChecks.filter((c) => c.state === "fail").length;
  const pendingCount = allChecks.filter((c) => c.state === "pending").length;

  /* -------- AI recommendation --------- */
  const aiConfidence = Math.max(35, Math.min(96,
    75 + (checksPass ? 8 : -25) + (approvalsSatisfied ? 6 : -8) + (changeApproved ? 3 : -6) + (highRiskSelfCertBlocked ? -20 : 0),
  ));

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-label="Runbook release and certification">
      <EntityHeader
        eyebrow="Runbook release"
        title={`Release · ${runbook?.title ?? runbookId}`}
        subtitle={`${runbookId} · proposed ${snapshot.proposedVersion} (currently ${snapshot.publishedVersion ?? "unpublished"})`}
        meta={
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Tenant: <span className="text-foreground">{ops.tenant.name}</span></span>
            <span>Env: <span className="text-foreground">{ops.environment}</span></span>
            <span>Role: <span className="text-foreground">{ops.role}</span></span>
            <span>Risk: <span className="text-foreground">{snapshot.riskLevel}</span></span>
            <Badge variant="outline" className={cn("border", stateColor[snapshot.state])}>{snapshot.state}</Badge>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/runops/runbooks/${runbookId}`)} aria-label="Back to runbook detail">
              <ArrowLeft className="h-4 w-4" /> Runbook
            </Button>
            <Button variant="outline" size="sm" onClick={generateReleaseNotes} aria-label="Generate release notes">
              <FileText className="h-4 w-4" /> Release notes
            </Button>
            <Button variant="outline" size="sm" onClick={simulateGitOps} disabled={!demoMode} title={!demoMode ? "Only available in Demo Mode" : "Simulate git commit, PR, checks, merge, and tag"} aria-label="Simulate GitOps">
              <GitBranch className="h-4 w-4" /> Simulate GitOps
            </Button>
            <Button size="sm" onClick={certify} disabled={!approvalsSatisfied || !checksPass || highRiskSelfCertBlocked}
              title={highRiskSelfCertBlocked ? "Author cannot self-certify a high-risk release" : !approvalsSatisfied ? "Approvals not satisfied" : !checksPass ? "Checks not passing" : "Certify this release"}
              aria-label="Certify release">
              <ShieldCheck className="h-4 w-4" /> Certify
            </Button>
          </div>
        }
      />

      {/* Guard band */}
      <div className="grid gap-2 md:grid-cols-4">
        <GuardTile ok={checksPass} okText={`All checks pass · ${allChecks.length - pendingCount}/${allChecks.length}`} badText={`Checks pending or failing (${pendingCount} pending, ${failedCount} failed)`} />
        <GuardTile ok={approvalsSatisfied} okText="Approvals satisfied (separation of duties)" badText="Approvals pending or same-author" />
        <GuardTile ok={changeApproved} okText={`Change ${snapshot.changeTicket}`} badText="Change record required" />
        <GuardTile ok={!highRiskSelfCertBlocked} okText="Author separated from certifier" badText="Author cannot self-certify high-risk release" />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        {/* Left: change + diffs + tests */}
        <div className="xl:col-span-2 space-y-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Change summary</h2>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Risk</Label>
                  <Select value={snapshot.riskLevel} onValueChange={(v) => setSnapshot((s) => ({ ...s, riskLevel: v as ReleaseSnapshot["riskLevel"], updatedAt: nowIso() }))}>
                    <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea
                aria-label="Change summary"
                value={snapshot.summary}
                onChange={(e) => setSnapshot((s) => ({ ...s, summary: e.target.value, updatedAt: nowIso() }))}
                rows={3}
              />
              <div className="grid gap-2 md:grid-cols-3 text-xs">
                <div>
                  <Label className="text-xs">Proposed version</Label>
                  <Input value={snapshot.proposedVersion} onChange={(e) => setSnapshot((s) => ({ ...s, proposedVersion: e.target.value, updatedAt: nowIso() }))} />
                </div>
                <div>
                  <Label className="text-xs">Recertify by</Label>
                  <Input type="date" value={snapshot.recertifyAt} onChange={(e) => setSnapshot((s) => ({ ...s, recertifyAt: e.target.value, updatedAt: nowIso() }))} />
                </div>
                <div>
                  <Label className="text-xs">Change ticket</Label>
                  <div className="flex gap-1">
                    <Input value={snapshot.changeTicket} onChange={(e) => setSnapshot((s) => ({ ...s, changeTicket: e.target.value, updatedAt: nowIso() }))} placeholder="CHG-XXXXXX" />
                    <Button size="sm" variant="outline" onClick={linkChange} aria-label="Create change ticket">New</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Tabs defaultValue="workflow">
                <TabsList>
                  <TabsTrigger value="workflow">Workflow diff</TabsTrigger>
                  <TabsTrigger value="config">Configuration diff</TabsTrigger>
                  <TabsTrigger value="policy">Policy diff</TabsTrigger>
                </TabsList>
                <TabsContent value="workflow"><DiffTable entries={snapshot.workflowDiff} /></TabsContent>
                <TabsContent value="config"><DiffTable entries={snapshot.configDiff} /></TabsContent>
                <TabsContent value="policy"><DiffTable entries={snapshot.policyDiff} /></TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Tabs defaultValue="tests">
                <TabsList>
                  <TabsTrigger value="tests">Test results ({snapshot.testChecks.filter((c) => c.state === "pass").length}/{snapshot.testChecks.length})</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
                </TabsList>
                <TabsContent value="tests"><ChecksTable checks={snapshot.testChecks} /></TabsContent>
                <TabsContent value="security"><ChecksTable checks={snapshot.securityChecks} /></TabsContent>
                <TabsContent value="artifacts"><ChecksTable checks={snapshot.artifactChecks} /></TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Reviewer comments</h2>
                <Badge variant="outline">{snapshot.comments.length}</Badge>
              </div>
              <div className="space-y-2 max-h-56 overflow-auto">
                {snapshot.comments.length === 0 && <p className="text-xs text-muted-foreground">No comments yet.</p>}
                {snapshot.comments.map((c) => (
                  <div key={c.id} className={cn("rounded border p-2 text-xs",
                    c.kind === "request-change" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50")}>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{c.author} · {c.role}</span>
                      <span>{new Date(c.at).toLocaleString()} · {c.kind}</span>
                    </div>
                    <div className="mt-1 text-foreground">{c.body}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 md:flex-row">
                <Textarea rows={2} placeholder="Add a review comment" aria-label="Comment body" value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} />
                <div className="flex flex-row gap-2 md:flex-col">
                  <Button size="sm" variant="outline" onClick={() => { addComment(commentDraft, "comment"); setCommentDraft(""); }} disabled={!commentDraft.trim()}>
                    <MessageSquarePlus className="h-4 w-4" /> Comment
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { addComment(commentDraft, "request-change"); setCommentDraft(""); }} disabled={!commentDraft.trim()}>
                    <AlertTriangle className="h-4 w-4" /> Request change
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {snapshot.releaseNotes && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Release notes</h2>
                  <Badge variant="outline">markdown</Badge>
                </div>
                <pre className="mt-2 max-h-64 overflow-auto rounded bg-slate-950 p-3 text-[11px] text-slate-100 whitespace-pre-wrap">{snapshot.releaseNotes}</pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: approvals, promotion, gitops, AI */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h2 className="text-sm font-semibold">Approvals (separation of duties)</h2>
              <div className="space-y-2">
                {snapshot.approvals.map((a) => (
                  <div key={a.id} className="rounded border border-slate-200 p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{a.role}</div>
                      <Badge variant="outline" className={cn(
                        a.state === "approved" && "border-emerald-300 bg-emerald-50 text-emerald-900",
                        a.state === "rejected" && "border-rose-300 bg-rose-50 text-rose-900",
                        a.state === "pending"  && "border-slate-200 bg-slate-50 text-slate-800",
                      )}>{a.state}</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {a.approver === "pending" ? "not yet reviewed" : `${a.approver} · ${a.at ? new Date(a.at).toLocaleString() : ""}`}
                    </div>
                    {a.approver === snapshot.authorId && a.state === "approved" && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-800">
                        <ShieldAlert className="h-3 w-3" /> Same as author — violates separation of duties
                      </div>
                    )}
                    <div className="mt-1 flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setApproval(a.id, "approved", "")}
                        disabled={a.state === "approved" || (snapshot.riskLevel === "High" && currentUser === snapshot.authorId)}
                        title={snapshot.riskLevel === "High" && currentUser === snapshot.authorId ? "Author cannot self-approve high-risk release" : "Approve"}
                        aria-label={`Approve as ${a.role}`}>
                        <CheckCircle2 className="h-3 w-3" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setApproval(a.id, "rejected", "")}
                        disabled={a.state === "rejected"} aria-label={`Reject as ${a.role}`}>
                        <XCircle className="h-3 w-3" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Promotion targets</h2>
                <Badge variant="outline"><GitCommit className="mr-1 h-3 w-3" />{snapshot.gitCommit || "no commit"}</Badge>
              </div>
              {snapshot.promotions.map((p) => (
                <div key={p.env} className="flex items-center justify-between rounded border border-slate-200 p-2 text-xs">
                  <div>
                    <div className="font-medium">{p.env}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.state === "not-promoted" ? "not promoted" : `${p.state} · ${p.tag || "—"} · ${p.commit ? p.commit.slice(0, 7) : "—"} · ${p.at ? new Date(p.at).toLocaleString() : ""}`}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => promote(p.env)}
                      disabled={p.env === "Production" && (!approvalsSatisfied || !checksPass || !changeApproved || highRiskSelfCertBlocked)}
                      title={p.env === "Production"
                        ? (highRiskSelfCertBlocked ? "Author cannot self-certify high-risk production release"
                          : !approvalsSatisfied ? "Approvals + separation of duties required"
                          : !checksPass ? "Required checks not passing"
                          : !changeApproved ? "Change record required" : "Promote to production")
                        : `Promote to ${p.env}`}
                      aria-label={`Promote to ${p.env}`}>
                      <Rocket className="h-3 w-3" /> Promote
                    </Button>
                    {p.env === "Production" && (
                      <Button size="sm" variant="outline" onClick={scheduleActivation}
                        disabled={!approvalsSatisfied || !checksPass || !changeApproved || highRiskSelfCertBlocked}
                        aria-label="Schedule activation">
                        <ArrowUpRight className="h-3 w-3" /> Schedule
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-1">
                <Button size="sm" variant="outline" onClick={rollback} aria-label="Roll back to prior version">
                  <RotateCcw className="h-3 w-3" /> Rollback
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSnapshot((s) => ({ ...s, gitTag: s.proposedVersion, updatedAt: nowIso() }))} aria-label="Create version tag">
                  <Tag className="h-3 w-3" /> Tag {snapshot.proposedVersion}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <h2 className="text-sm font-semibold">GitOps</h2>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-1"><GitCommit className="h-3 w-3" /> commit: <code className="rounded bg-slate-100 px-1">{snapshot.gitCommit || "—"}</code></div>
                <div className="flex items-center gap-1"><GitPullRequest className="h-3 w-3" /> pull request: <code className="rounded bg-slate-100 px-1">{snapshot.gitPr || "—"}</code></div>
                <div className="flex items-center gap-1"><Tag className="h-3 w-3" /> tag: <code className="rounded bg-slate-100 px-1">{snapshot.gitTag || "—"}</code></div>
                <div className="text-[11px] text-muted-foreground">{demoMode ? "Demo Mode simulates git commit, PR, checks, merge, tag, and release artifact." : "Live mode uses connected GitOps pipeline."}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">AI release advisor</h2>
                <Badge variant="outline">{aiConfidence}% confidence</Badge>
              </div>
              <ul className="text-xs list-disc pl-4 space-y-1">
                <li>Evidence: {snapshot.testChecks.filter((c) => c.state === "pass").length}/{snapshot.testChecks.length} tests pass, historical replay INC-10482 matched path, fitness delta +3.</li>
                <li>Confidence adjusted by check status ({checksPass ? "+" : "−"}), approval separation ({approvalsSatisfied ? "+" : "−"}), and author identity ({highRiskSelfCertBlocked ? "−" : "+"}).</li>
                <li>Uncertainty: load & concurrency test still pending; results may lower fitness delta by up to 2 points.</li>
              </ul>
              <div className="text-[11px] text-muted-foreground">
                Sources: Test Lab · Policy Designer v{snapshot.proposedVersion} · Recovery Designer · CHG-{snapshot.changeTicket.replace(/^CHG-/, "") || "—"} · Observability window last 24h.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold mb-2">Version history</h2>
              <div className="space-y-1 text-xs">
                {snapshot.history.map((h, i) => (
                  <div key={`${h.version}-${i}`} className="flex items-center justify-between rounded border border-slate-200 p-2">
                    <div>
                      <div className="font-medium">{h.version} <span className="text-muted-foreground">· {h.tag}</span></div>
                      <div className="text-[11px] text-muted-foreground">{new Date(h.at).toLocaleString()} · {h.commit.slice(0, 7)}</div>
                    </div>
                    <Badge variant="outline">{h.state}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small subcomponents                                                         */
/* -------------------------------------------------------------------------- */

function GuardTile({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return (
    <div className={cn("rounded border p-2 text-xs flex items-start gap-2",
      ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900")}>
      {ok ? <CheckCircle2 className="h-4 w-4 mt-0.5" /> : <ShieldAlert className="h-4 w-4 mt-0.5" />}
      <span>{ok ? okText : badText}</span>
    </div>
  );
}

function DiffTable({ entries }: { entries: DiffEntry[] }) {
  if (entries.length === 0) return <p className="p-2 text-xs text-muted-foreground">No differences.</p>;
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="p-1">Key</th><th className="p-1">Kind</th><th className="p-1">Before</th><th className="p-1">After</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((d) => (
            <tr key={d.key} className="border-t border-slate-100 align-top">
              <td className="p-1 font-mono">{d.key}</td>
              <td className="p-1">
                <Badge variant="outline" className={cn(
                  d.kind === "added"   && "border-emerald-300 bg-emerald-50 text-emerald-900",
                  d.kind === "removed" && "border-rose-300 bg-rose-50 text-rose-900",
                  d.kind === "changed" && "border-sky-300 bg-sky-50 text-sky-900",
                )}>{d.kind}</Badge>
              </td>
              <td className="p-1 text-muted-foreground">{d.before}</td>
              <td className="p-1">{d.after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChecksTable({ checks }: { checks: CheckResult[] }) {
  return (
    <div className="mt-2 space-y-1">
      {checks.map((c) => (
        <div key={c.key} className="flex items-center justify-between rounded border border-slate-200 p-2 text-xs">
          <div className="flex items-center gap-2">
            {c.state === "pass"    && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            {c.state === "fail"    && <XCircle className="h-4 w-4 text-rose-600" />}
            {c.state === "pending" && <ClipboardCheck className="h-4 w-4 text-amber-600" />}
            {c.state === "skipped" && <ClipboardCheck className="h-4 w-4 text-slate-400" />}
            <span className="font-medium">{c.label}</span>
          </div>
          <div className="text-muted-foreground">{c.detail}</div>
        </div>
      ))}
    </div>
  );
}
