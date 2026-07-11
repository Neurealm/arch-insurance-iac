/**
 * Page 12 · Visual Runbook Designer
 * Route: /runops/runbooks/:runbookId/designer
 *
 * Uses the shared WorkflowCanvas for visualization and manages node graph
 * state locally per runbook. All context flows through useOperations();
 * no fixture arrays, no `any` types.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, Check, ClipboardCopy, ClipboardPaste, GitBranch, MessageSquare,
  Play, Plus, Redo2, Save, Send, Trash2, Undo2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  EntityHeader, PermissionDeniedState, WorkflowCanvas, type GraphNode, type GraphEdge,
} from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

const NODE_TYPES = [
  "Start", "Precheck", "Human Instruction", "Command", "API Call", "Query",
  "Decision", "Parallel Branch", "Wait", "Approval", "Digital Worker",
  "Validation", "Rollback", "Subrunbook", "Notification", "Completion",
] as const;
type NodeType = (typeof NODE_TYPES)[number];

interface DesignerNode {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  x: number;
  y: number;
  timeoutSeconds: number | null;
  hasFailureHandler: boolean;
  hasRollback: boolean;
  successCriteria: string;
  variables: string;      // comma list
  secretRefs: string;     // comma list
  approver: string;
  comment: string;
  requiresConnector: string;
}

interface DesignerEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface Snapshot {
  savedAt: string;
  actor: string;
  nodes: DesignerNode[];
  edges: DesignerEdge[];
  note: string;
}

interface DesignerState {
  runbookId: string;
  nodes: DesignerNode[];
  edges: DesignerEdge[];
  history: Snapshot[];
  reviewSubmittedAt: string | null;
  reviewers: string;
}

interface ValidationIssue {
  code: string;
  severity: "error" | "warning";
  message: string;
  nodeId?: string;
}

const NODE_TONES: Record<NodeType, GraphNode["tone"]> = {
  "Start": "info",
  "Precheck": "neutral",
  "Human Instruction": "neutral",
  "Command": "info",
  "API Call": "info",
  "Query": "neutral",
  "Decision": "warning",
  "Parallel Branch": "warning",
  "Wait": "neutral",
  "Approval": "warning",
  "Digital Worker": "info",
  "Validation": "success",
  "Rollback": "critical",
  "Subrunbook": "info",
  "Notification": "neutral",
  "Completion": "success",
};

const PRODUCTION_ACTIONS: readonly NodeType[] = ["Command", "API Call", "Digital Worker"];

/* -------------------------------------------------------------------------- */
/* Persistence                                                                 */
/* -------------------------------------------------------------------------- */

const LS_KEY = (runbookId: string) => `runops.designer.${runbookId}.v1`;
const LS_CLIP = "runops.designer.clipboard.v1";
const LS_COMMENTS = (runbookId: string) => `runops.designer.${runbookId}.comments.v1`;

interface CommentEntry { id: string; nodeId: string; at: string; author: string; text: string; }

function loadState(runbookId: string): DesignerState {
  try {
    const raw = localStorage.getItem(LS_KEY(runbookId));
    if (raw) return JSON.parse(raw) as DesignerState;
  } catch { /* fall through */ }
  const start: DesignerNode = {
    id: `n-${Date.now().toString(36)}-s`,
    type: "Start",
    label: "Start",
    description: "Entry point",
    x: 40, y: 80,
    timeoutSeconds: null, hasFailureHandler: true, hasRollback: false,
    successCriteria: "", variables: "", secretRefs: "", approver: "",
    comment: "", requiresConnector: "",
  };
  return { runbookId, nodes: [start], edges: [], history: [], reviewSubmittedAt: null, reviewers: "" };
}
function saveState(s: DesignerState) { localStorage.setItem(LS_KEY(s.runbookId), JSON.stringify(s)); }
function loadComments(runbookId: string): CommentEntry[] {
  try {
    const raw = localStorage.getItem(LS_COMMENTS(runbookId));
    return raw ? (JSON.parse(raw) as CommentEntry[]) : [];
  } catch { return []; }
}
function saveComments(runbookId: string, list: CommentEntry[]) {
  localStorage.setItem(LS_COMMENTS(runbookId), JSON.stringify(list));
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

function validateGraph(nodes: DesignerNode[], edges: DesignerEdge[], availableConnectors: ReadonlySet<string>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  for (const n of nodes) { outgoing.set(n.id, []); incoming.set(n.id, []); }
  for (const e of edges) {
    outgoing.get(e.source)?.push(e.target);
    incoming.get(e.target)?.push(e.source);
  }

  const start = nodes.find((n) => n.type === "Start");
  if (!start) issues.push({ code: "no-start", severity: "error", message: "Workflow has no Start node." });
  if (!nodes.some((n) => n.type === "Completion"))
    issues.push({ code: "no-completion", severity: "error", message: "Workflow has no Completion node." });

  // Reachability from Start
  const reachable = new Set<string>();
  if (start) {
    const stack = [start.id];
    while (stack.length) {
      const id = stack.pop()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      for (const t of outgoing.get(id) ?? []) stack.push(t);
    }
  }

  for (const n of nodes) {
    if (n.type !== "Start" && (incoming.get(n.id)?.length ?? 0) === 0) {
      issues.push({ code: "disconnected", severity: "error", message: `Node "${n.label}" has no incoming edge.`, nodeId: n.id });
    }
    if (n.type !== "Completion" && (outgoing.get(n.id)?.length ?? 0) === 0) {
      issues.push({ code: "no-outgoing", severity: "warning", message: `Node "${n.label}" has no outgoing edge.`, nodeId: n.id });
    }
    if (!reachable.has(n.id) && n.type !== "Start") {
      issues.push({ code: "unreachable", severity: "error", message: `Node "${n.label}" is unreachable from Start.`, nodeId: n.id });
    }
    if (n.timeoutSeconds === null && ["Command", "API Call", "Query", "Wait"].includes(n.type)) {
      issues.push({ code: "missing-timeout", severity: "warning", message: `"${n.label}" has no timeout.`, nodeId: n.id });
    }
    if (!n.hasFailureHandler && ["Command", "API Call", "Digital Worker"].includes(n.type)) {
      issues.push({ code: "missing-failure", severity: "error", message: `"${n.label}" has no failure handling.`, nodeId: n.id });
    }
    if (PRODUCTION_ACTIONS.includes(n.type) && !n.hasRollback) {
      issues.push({ code: "no-rollback", severity: "error", message: `Production action "${n.label}" has no rollback or compensation.`, nodeId: n.id });
    }
    if (n.type === "Validation" && !n.successCriteria.trim()) {
      issues.push({ code: "no-success-criteria", severity: "error", message: `Validation "${n.label}" is missing success criteria.`, nodeId: n.id });
    }
    // Undefined variables — references of the form ${varName} not in variables list
    const refs = [...n.description.matchAll(/\$\{([a-zA-Z0-9_.-]+)\}/g)].map((m) => m[1]);
    const declared = new Set(n.variables.split(",").map((s) => s.trim()).filter(Boolean));
    for (const r of refs) {
      if (!declared.has(r)) {
        issues.push({ code: "undef-var", severity: "warning", message: `"${n.label}" references undefined variable \${${r}}.`, nodeId: n.id });
      }
    }
    // Invalid secret refs
    const secrets = n.secretRefs.split(",").map((s) => s.trim()).filter(Boolean);
    for (const s of secrets) {
      if (!/^secret:[a-z0-9._-]+$/i.test(s)) {
        issues.push({ code: "bad-secret", severity: "error", message: `"${n.label}" has invalid secret reference "${s}" (expected secret:*).`, nodeId: n.id });
      }
    }
    // Approval self-dependency
    if (n.type === "Approval" && n.approver.trim() && n.approver.trim().toLowerCase() === n.label.trim().toLowerCase()) {
      issues.push({ code: "approval-self", severity: "error", message: `Approval "${n.label}" cannot approve itself.`, nodeId: n.id });
    }
    // Missing connector
    if (n.requiresConnector && !availableConnectors.has(n.requiresConnector)) {
      issues.push({ code: "connector-missing", severity: "error", message: `"${n.label}" requires connector "${n.requiresConnector}" which is unavailable.`, nodeId: n.id });
    }
  }

  // Circular dependencies (DFS coloring)
  const color = new Map<string, 0 | 1 | 2>();
  const visit = (id: string): boolean => {
    const c = color.get(id) ?? 0;
    if (c === 1) return true;
    if (c === 2) return false;
    color.set(id, 1);
    for (const t of outgoing.get(id) ?? []) if (visit(t)) return true;
    color.set(id, 2);
    return false;
  };
  for (const n of nodes) {
    if ((color.get(n.id) ?? 0) === 0 && visit(n.id)) {
      issues.push({ code: "cycle", severity: "error", message: "Workflow contains a circular dependency." });
      break;
    }
  }

  // Duplicate edges
  const seen = new Set<string>();
  for (const e of edges) {
    const key = `${e.source}->${e.target}`;
    if (seen.has(key)) issues.push({ code: "duplicate-edge", severity: "warning", message: `Duplicate connection ${nodeById.get(e.source)?.label} → ${nodeById.get(e.target)?.label}.` });
    seen.add(key);
  }

  return issues;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function RunbookDesigner() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams();
  const runbookId = params.runbookId ?? "RB-0042";

  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  const runbook = useMemo(() => ops.runbooks.find((r) => r.id === runbookId), [ops.runbooks, runbookId]);
  const publishedLocked = runbook?.state === "Published" || runbook?.state === "Certified";

  const [state, setState] = useState<DesignerState>(() => loadState(runbookId));
  const [selectedId, setSelectedId] = useState<string | null>(state.nodes[0]?.id ?? null);
  const [linkFromId, setLinkFromId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [undoStack, setUndoStack] = useState<DesignerState[]>([]);
  const [redoStack, setRedoStack] = useState<DesignerState[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [comments, setComments] = useState<CommentEntry[]>(() => loadComments(runbookId));
  const [newComment, setNewComment] = useState("");
  const [conflict] = useState<boolean>(() => {
    // Deterministic demo conflict — if role is Change Manager and there's history, simulate a peer edit warning
    return false;
  });

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { saveComments(runbookId, comments); }, [comments, runbookId]);

  /* -------- Connector availability -------- */
  const availableConnectors = useMemo(
    () => new Set(ops.connectors.filter((c) => c.status === "Healthy").map((c) => c.id)),
    [ops.connectors],
  );
  const connectorOptions = useMemo(() => ops.connectors.map((c) => c.id), [ops.connectors]);

  /* -------- Graph derivation for the shared canvas -------- */
  const graphNodes: GraphNode[] = useMemo(() => state.nodes.map((n) => ({
    id: n.id, label: n.label, sublabel: n.type, tone: NODE_TONES[n.type], x: n.x, y: n.y,
  })), [state.nodes]);
  const graphEdges: GraphEdge[] = useMemo(() => state.edges.map((e) => ({
    id: e.id, source: e.source, target: e.target, label: e.label,
  })), [state.edges]);

  const selected = state.nodes.find((n) => n.id === selectedId) ?? null;

  /* -------- Mutators -------- */
  const commit = useCallback((next: DesignerState) => {
    setUndoStack((u) => [...u.slice(-49), state]);
    setRedoStack([]);
    setState(next);
    setDirty(true);
  }, [state]);

  const addNode = useCallback((type: NodeType) => {
    if (publishedLocked || readOnly) return;
    const id = `n-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    const lastX = Math.max(0, ...state.nodes.map((n) => n.x));
    const node: DesignerNode = {
      id, type, label: type, description: "",
      x: lastX + 180, y: 80 + (state.nodes.length % 3) * 90,
      timeoutSeconds: ["Command", "API Call", "Query", "Wait"].includes(type) ? 60 : null,
      hasFailureHandler: type === "Rollback" || type === "Validation" || type === "Approval",
      hasRollback: type === "Rollback",
      successCriteria: "", variables: "", secretRefs: "", approver: "",
      comment: "", requiresConnector: "",
    };
    commit({ ...state, nodes: [...state.nodes, node] });
    setSelectedId(id);
  }, [commit, state, publishedLocked, readOnly]);

  const updateSelected = useCallback((patch: Partial<DesignerNode>) => {
    if (!selectedId) return;
    commit({ ...state, nodes: state.nodes.map((n) => n.id === selectedId ? { ...n, ...patch } : n) });
  }, [commit, selectedId, state]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    commit({
      ...state,
      nodes: state.nodes.filter((n) => n.id !== selectedId),
      edges: state.edges.filter((e) => e.source !== selectedId && e.target !== selectedId),
    });
    setSelectedId(null);
  }, [commit, selectedId, state]);

  const connectFromTo = useCallback((targetId: string) => {
    if (!linkFromId || linkFromId === targetId) { setLinkFromId(null); return; }
    if (state.edges.some((e) => e.source === linkFromId && e.target === targetId)) {
      setLinkFromId(null);
      return;
    }
    const id = `e-${linkFromId}->${targetId}-${Date.now().toString(36)}`;
    commit({ ...state, edges: [...state.edges, { id, source: linkFromId, target: targetId }] });
    setLinkFromId(null);
  }, [commit, linkFromId, state]);

  const copySelected = useCallback(() => {
    if (!selected) return;
    localStorage.setItem(LS_CLIP, JSON.stringify(selected));
    ops.pushNotification({ kind: "info", title: "Node copied", detail: selected.label, entityRef: runbookId });
  }, [selected, ops, runbookId]);

  const pasteNode = useCallback(() => {
    if (publishedLocked || readOnly) return;
    try {
      const raw = localStorage.getItem(LS_CLIP);
      if (!raw) return;
      const src = JSON.parse(raw) as DesignerNode;
      const id = `n-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
      const node: DesignerNode = { ...src, id, label: `${src.label} (copy)`, x: src.x + 60, y: src.y + 60 };
      commit({ ...state, nodes: [...state.nodes, node] });
      setSelectedId(id);
    } catch { /* ignore */ }
  }, [commit, publishedLocked, readOnly, state]);

  const undo = useCallback(() => {
    setUndoStack((u) => {
      if (u.length === 0) return u;
      const prev = u[u.length - 1];
      setRedoStack((r) => [...r, state]);
      setState(prev);
      setDirty(true);
      return u.slice(0, -1);
    });
  }, [state]);
  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      setUndoStack((u) => [...u, state]);
      setState(next);
      setDirty(true);
      return r.slice(0, -1);
    });
  }, [state]);

  const runValidation = useCallback(() => {
    const list = validateGraph(state.nodes, state.edges, availableConnectors);
    setIssues(list);
    ops.pushNotification({
      kind: list.some((i) => i.severity === "error") ? "warning" : "info",
      title: "Workflow validated",
      detail: `${list.filter((i) => i.severity === "error").length} errors · ${list.filter((i) => i.severity === "warning").length} warnings`,
      entityRef: runbookId,
    });
  }, [state, availableConnectors, ops, runbookId]);

  const handleSaveDraft = useCallback(() => {
    if (publishedLocked || readOnly) return;
    const snapshot: Snapshot = {
      savedAt: new Date().toISOString(),
      actor: ops.role,
      nodes: state.nodes,
      edges: state.edges,
      note: "Auto-saved draft revision",
    };
    const next = { ...state, history: [...state.history, snapshot].slice(-25) };
    setState(next);
    setDirty(false);
    ops.pushNotification({
      kind: "info",
      title: "Draft saved",
      detail: `${runbookId} · v-draft-${next.history.length}`,
      entityRef: runbookId,
    });
  }, [publishedLocked, readOnly, state, ops, runbookId]);

  const handleSubmitReview = useCallback(() => {
    if (publishedLocked || readOnly) return;
    const list = validateGraph(state.nodes, state.edges, availableConnectors);
    setIssues(list);
    if (list.some((i) => i.severity === "error")) {
      ops.pushNotification({
        kind: "warning",
        title: "Cannot submit — validation errors",
        detail: `${list.filter((i) => i.severity === "error").length} errors must be resolved`,
        entityRef: runbookId,
      });
      return;
    }
    const now = new Date().toISOString();
    setState((s) => ({ ...s, reviewSubmittedAt: now }));
    ops.pushNotification({
      kind: "info",
      title: "Submitted for review",
      detail: `${runbookId} · reviewers: ${state.reviewers || "unassigned"}`,
      entityRef: runbookId,
      route: `/runops/runbooks/${runbookId}`,
    });
  }, [publishedLocked, readOnly, state, availableConnectors, ops, runbookId]);

  const addComment = useCallback(() => {
    if (!selectedId || !newComment.trim()) return;
    const c: CommentEntry = {
      id: `c-${Date.now().toString(36)}`,
      nodeId: selectedId,
      at: new Date().toISOString(),
      author: ops.role,
      text: newComment.trim(),
    };
    setComments((list) => [c, ...list]);
    setNewComment("");
  }, [newComment, ops.role, selectedId]);

  /* -------- Machine + human views -------- */
  const machineJson = useMemo(() => JSON.stringify({
    runbookId,
    nodes: state.nodes.map((n) => ({
      id: n.id, type: n.type, label: n.label,
      timeoutSeconds: n.timeoutSeconds, hasRollback: n.hasRollback,
      hasFailureHandler: n.hasFailureHandler, requiresConnector: n.requiresConnector || null,
      successCriteria: n.successCriteria || null,
    })),
    edges: state.edges.map((e) => ({ from: e.source, to: e.target })),
  }, null, 2), [runbookId, state]);

  const humanOutline = useMemo(() => {
    const order = topologicalOrder(state.nodes, state.edges);
    return order.map((n, i) => `${i + 1}. [${n.type}] ${n.label}${n.description ? ` — ${n.description}` : ""}`).join("\n");
  }, [state]);

  /* -------- Permission gate -------- */
  if (readOnly) {
    return (
      <div className="p-6">
        <PermissionDeniedState
          title="Read-only role"
          description="Your current role cannot edit runbooks. Switch to an authoring role to open the designer."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 md:p-6" aria-label="Runbook designer">
      <EntityHeader
        eyebrow="Runbook designer"
        title={runbook?.title ?? runbookId}
        subtitle={`${runbookId} · ${runbook?.state ?? "Draft"} · ${runbook?.version ?? "v-draft"}`}
        meta={
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Tenant: <span className="text-foreground">{ops.tenant.name}</span></span>
            <span>Env: <span className="text-foreground">{ops.environment}</span></span>
            <span>Role: <span className="text-foreground">{ops.role}</span></span>
            <span aria-live="polite">{dirty ? "Unsaved changes" : "All changes saved"}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />Editors: {ops.role}, sre.oncall</span>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={undoStack.length === 0} aria-label="Undo"><Undo2 className="h-4 w-4" /> Undo</Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={redoStack.length === 0} aria-label="Redo"><Redo2 className="h-4 w-4" /> Redo</Button>
            <Button variant="outline" size="sm" onClick={copySelected} disabled={!selected} aria-label="Copy node"><ClipboardCopy className="h-4 w-4" /> Copy</Button>
            <Button variant="outline" size="sm" onClick={pasteNode} disabled={publishedLocked} aria-label="Paste node"><ClipboardPaste className="h-4 w-4" /> Paste</Button>
            <Button variant="outline" size="sm" onClick={runValidation} aria-label="Validate"><Play className="h-4 w-4" /> Validate</Button>
            <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={publishedLocked} aria-label="Save draft"><Save className="h-4 w-4" /> Save Draft</Button>
            <Button size="sm" onClick={handleSubmitReview} disabled={publishedLocked} aria-label="Submit for review"><Send className="h-4 w-4" /> Submit for Review</Button>
          </div>
        }
      />

      {publishedLocked && (
        <div className="rounded border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900" role="status">
          Read-only — this runbook is {runbook?.state}. Open a new draft version to edit.
        </div>
      )}
      {conflict && (
        <div className="rounded border border-destructive/40 bg-destructive/5 p-2 text-sm text-destructive" role="alert">
          Edit conflict: another editor updated this workflow. Reload to see their changes.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[220px_1fr_320px]">
        {/* Left palette */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Node palette</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-1 lg:grid-cols-1">
            {NODE_TYPES.map((t) => (
              <Button
                key={t}
                size="sm"
                variant="outline"
                className="justify-start"
                onClick={() => addNode(t)}
                disabled={publishedLocked}
                aria-label={`Add ${t} node`}
              >
                <Plus className="h-3 w-3" /> {t}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Center canvas + views */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm">Workflow</CardTitle>
            <div className="text-xs text-muted-foreground">
              {linkFromId
                ? <>Click a target node to connect from <Badge variant="outline">{state.nodes.find((n) => n.id === linkFromId)?.label}</Badge></>
                : "Select a node, then use Connect to draw an edge"}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="canvas">
              <TabsList>
                <TabsTrigger value="canvas">Canvas</TabsTrigger>
                <TabsTrigger value="outline">Human outline</TabsTrigger>
                <TabsTrigger value="machine">Machine</TabsTrigger>
              </TabsList>
              <TabsContent value="canvas">
                <WorkflowCanvas
                  nodes={graphNodes}
                  edges={graphEdges}
                  height={420}
                  selectedNodeId={selectedId ?? undefined}
                  onNodeClick={(id) => {
                    if (linkFromId) connectFromTo(id);
                    else setSelectedId(id);
                  }}
                  ariaLabel="Runbook workflow canvas"
                />
                {state.nodes.length === 0 && (
                  <div className="mt-2 rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Clean draft — add nodes from the palette to begin.
                  </div>
                )}
              </TabsContent>
              <TabsContent value="outline">
                <pre className="max-h-[420px] overflow-auto rounded border border-border bg-muted/40 p-3 text-xs">{humanOutline || "(no nodes)"}</pre>
              </TabsContent>
              <TabsContent value="machine">
                <pre className="max-h-[420px] overflow-auto rounded border border-border bg-muted/40 p-3 text-xs">{machineJson}</pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right properties */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Properties</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {!selected && <div className="text-sm text-muted-foreground">Select a node to edit its properties.</div>}
            {selected && (
              <>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{selected.type}</Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setLinkFromId(selected.id)} aria-label="Start connection">
                      <GitBranch className="h-3 w-3" /> Connect
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/runops/runbooks/${runbookId}/steps/${selected.id}`)}>Open step</Button>
                    <Button size="sm" variant="destructive" onClick={deleteSelected} aria-label="Delete node"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="p-label">Label</Label>
                  <Input id="p-label" value={selected.label} onChange={(e) => updateSelected({ label: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="p-desc">Description</Label>
                  <Textarea id="p-desc" rows={2} value={selected.description} onChange={(e) => updateSelected({ description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="p-timeout">Timeout (s)</Label>
                    <Input id="p-timeout" type="number" min={0} value={selected.timeoutSeconds ?? ""}
                      onChange={(e) => updateSelected({ timeoutSeconds: e.target.value === "" ? null : Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="p-connector">Connector</Label>
                    <Select value={selected.requiresConnector || "none"} onValueChange={(v) => updateSelected({ requiresConnector: v === "none" ? "" : v })}>
                      <SelectTrigger id="p-connector"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {connectorOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="p-vars">Declared variables (comma)</Label>
                  <Input id="p-vars" value={selected.variables} onChange={(e) => updateSelected({ variables: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="p-secrets">Secret refs (comma, prefix secret:)</Label>
                  <Input id="p-secrets" value={selected.secretRefs} onChange={(e) => updateSelected({ secretRefs: e.target.value })} />
                </div>
                {selected.type === "Approval" && (
                  <div className="space-y-1">
                    <Label htmlFor="p-appr">Approver role</Label>
                    <Input id="p-appr" value={selected.approver} onChange={(e) => updateSelected({ approver: e.target.value })} />
                  </div>
                )}
                {selected.type === "Validation" && (
                  <div className="space-y-1">
                    <Label htmlFor="p-succ">Success criteria</Label>
                    <Textarea id="p-succ" rows={2} value={selected.successCriteria} onChange={(e) => updateSelected({ successCriteria: e.target.value })} />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Checkbox id="p-fail" checked={selected.hasFailureHandler} onCheckedChange={(v) => updateSelected({ hasFailureHandler: Boolean(v) })} />
                  <Label htmlFor="p-fail" className="text-sm">Has failure handler</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="p-rb" checked={selected.hasRollback} onCheckedChange={(v) => updateSelected({ hasRollback: Boolean(v) })} />
                  <Label htmlFor="p-rb" className="text-sm">Has rollback / compensation</Label>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom validation + collaboration */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm">Validation & test</CardTitle>
            <div className="text-xs text-muted-foreground">
              {issues.length === 0 && <span className="text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> No issues detected</span>}
              {issues.length > 0 && <span>{issues.filter((i) => i.severity === "error").length} errors · {issues.filter((i) => i.severity === "warning").length} warnings</span>}
            </div>
          </CardHeader>
          <CardContent className="max-h-56 overflow-auto text-sm">
            {issues.length === 0 && <div className="text-muted-foreground">Run Validate to check the workflow.</div>}
            <ul className="space-y-1">
              {issues.map((i, idx) => (
                <li key={`${i.code}-${idx}`} className={cn("flex items-start gap-2 rounded p-1", i.severity === "error" ? "text-destructive" : "text-amber-700")}>
                  <AlertTriangle className="h-3 w-3 mt-1" aria-hidden />
                  <div>
                    <div>{i.message}</div>
                    {i.nodeId && <button className="text-xs underline" onClick={() => setSelectedId(i.nodeId ?? null)}>focus node</button>}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Comments & version history</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Textarea rows={2} value={newComment} onChange={(e) => setNewComment(e.target.value)}
                placeholder={selected ? `Comment on "${selected.label}"` : "Select a node to comment"} disabled={!selected} aria-label="New comment" />
              <Button size="sm" onClick={addComment} disabled={!selected || !newComment.trim()}><MessageSquare className="h-3 w-3" /></Button>
            </div>
            {comments.length === 0 && <div className="text-xs text-muted-foreground">No comments yet.</div>}
            <ul className="max-h-32 space-y-1 overflow-auto text-xs">
              {comments.map((c) => (
                <li key={c.id} className="rounded border border-border bg-card p-2">
                  <span className="font-medium">{c.author}</span> · {state.nodes.find((n) => n.id === c.nodeId)?.label ?? c.nodeId} · {new Date(c.at).toLocaleTimeString()}
                  <div>{c.text}</div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-2">
              <div className="mb-1 text-xs font-medium">Version history ({state.history.length})</div>
              <ul className="max-h-24 space-y-1 overflow-auto text-xs">
                {state.history.slice().reverse().map((h, i) => (
                  <li key={h.savedAt}>v-draft-{state.history.length - i} · {new Date(h.savedAt).toLocaleString()} · {h.actor}</li>
                ))}
                {state.history.length === 0 && <li className="text-muted-foreground">No saved revisions yet.</li>}
              </ul>
            </div>
            {state.reviewSubmittedAt && (
              <div className="rounded border border-emerald-300 bg-emerald-50 p-2 text-xs text-emerald-900">
                Submitted for review at {new Date(state.reviewSubmittedAt).toLocaleString()}.
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="rev">Reviewers</Label>
              <Input id="rev" value={state.reviewers} onChange={(e) => setState((s) => ({ ...s, reviewers: e.target.value }))} placeholder="Comma-separated" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Topological sort for the human outline                                      */
/* -------------------------------------------------------------------------- */

function topologicalOrder(nodes: DesignerNode[], edges: DesignerEdge[]): DesignerNode[] {
  const outgoing = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  for (const n of nodes) { outgoing.set(n.id, []); indeg.set(n.id, 0); }
  for (const e of edges) {
    outgoing.get(e.source)?.push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  }
  const queue = nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0).map((n) => n.id);
  const order: DesignerNode[] = [];
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  while (queue.length) {
    const id = queue.shift()!;
    const n = nodeById.get(id);
    if (n) order.push(n);
    for (const t of outgoing.get(id) ?? []) {
      indeg.set(t, (indeg.get(t) ?? 0) - 1);
      if ((indeg.get(t) ?? 0) === 0) queue.push(t);
    }
  }
  // Append leftovers (cycles)
  for (const n of nodes) if (!order.includes(n)) order.push(n);
  return order;
}
