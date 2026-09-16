// Platform → Capabilities → Actions tab
//
// Shows pending proposed actions submitted by the servicenow-intake-agent
// when it encounters a ticket for an unsupported action type.
//
// Approve  → calls approve_proposed_action() RPC → auto-opens engineering gap
//            → navigates to the gap detail page in the existing Capabilities UI.
// Reject   → admin enters a reason → calls servicenow-intake-agent reject_proposal
//            → posts rejection comment to ServiceNow → proposal dismissed.
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  listProposedActions, approveProposedAction, rejectProposedAction,
  type ProposedAction, type ProposalStatus,
} from "@/pages/agentic-iac/proposedActionsAdmin";

// ─── helpers ────────────────────────────────────────────────────────────────

function statusBadge(status: ProposalStatus) {
  if (status === "pending") return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Pending review</Badge>;
  if (status === "approved") return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">Approved</Badge>;
  return <Badge variant="outline" className="text-slate-500 border-slate-300 bg-slate-50">Rejected</Badge>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// ─── Proposal row ────────────────────────────────────────────────────────────

function ProposalRow({
  proposal,
  onApprove,
  onReject,
  disabled,
}: {
  proposal: ProposedAction;
  onApprove: (id: string, displayName: string) => void;
  onReject: (id: string, displayName: string) => void;
  disabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg bg-white">
      {/* Header row */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-2 flex-1 text-left min-w-0"
        >
          {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{proposal.displayName}</p>
            <p className="text-xs text-slate-500 font-mono">{proposal.proposedName}</p>
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 hidden sm:block">{formatDate(proposal.createdAt)}</span>
          {statusBadge(proposal.status)}
          {proposal.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-700 border-green-300 hover:bg-green-50 hover:border-green-400"
                disabled={disabled}
                onClick={() => onApprove(proposal.id, proposal.displayName)}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                disabled={disabled}
                onClick={() => onReject(proposal.id, proposal.displayName)}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
              </Button>
            </>
          )}
          {proposal.status === "approved" && proposal.gapId && (
            <span className="text-xs text-slate-400">Gap created</span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t bg-slate-50 p-4 rounded-b-lg space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Originating ticket</p>
            <p className="text-sm font-mono text-slate-700">{proposal.ticketNumber}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Agent reasoning</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{proposal.agentReasoning}</p>
          </div>
          {proposal.status === "rejected" && proposal.rejectionReason && (
            <div>
              <p className="text-xs font-medium text-red-500 mb-1">Rejection reason</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{proposal.rejectionReason}</p>
            </div>
          )}
          {proposal.reviewedAt && (
            <p className="text-xs text-slate-400">Reviewed {formatDate(proposal.reviewedAt)}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Reject dialog ───────────────────────────────────────────────────────────

function RejectDialog({
  open,
  displayName,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  displayName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject proposed action</DialogTitle>
          <DialogDescription>
            Rejecting <strong>{displayName}</strong>. Your reason will be posted as a comment on the
            original ServiceNow ticket so the requester understands the decision.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Explain why this action type will not be added to the platform…"
          className="min-h-[100px] resize-none"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || loading}
            onClick={() => onConfirm(reason.trim())}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
            Reject & notify requester
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main tab component ──────────────────────────────────────────────────────

type ActionState = "idle" | "loading" | "approving" | "rejecting";
type FilterTab = "pending" | "all";

export function ProposedActionsTab() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<ProposedAction[]>([]);
  const [actionState, setActionState] = useState<ActionState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("pending");

  // Reject dialog state
  const [rejectTarget, setRejectTarget] = useState<{ id: string; displayName: string } | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setActionState("loading");
    setError(null);
    try {
      const data = await listProposedActions(filterTab === "pending" ? "pending" : undefined);
      setProposals(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load proposals");
    } finally {
      setActionState("idle");
    }
  }, [filterTab]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string, displayName: string) => {
    setError(null);
    setSuccessMsg(null);
    setActionState("approving");
    try {
      const { gapId } = await approveProposedAction(id);
      setSuccessMsg(`Approved "${displayName}". Engineering gap created.`);
      await load();
      // Navigate to the engineering gap detail after a short delay so the user
      // sees the success message before the tab change.
      setTimeout(() => navigate(`/platform/capabilities/${gapId}`), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approval failed");
      setActionState("idle");
    }
  };

  const handleRejectOpen = (id: string, displayName: string) => {
    setRejectTarget({ id, displayName });
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    setRejectLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const result = await rejectProposedAction(rejectTarget.id, reason);
      const commentNote = result.commentPosted
        ? "Rejection comment posted to ServiceNow."
        : `Note: ServiceNow comment could not be posted (${result.commentError ?? "unknown error"}). The rejection is recorded.`;
      setSuccessMsg(`Rejected "${rejectTarget.displayName}". ${commentNote}`);
      setRejectTarget(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rejection failed");
    } finally {
      setRejectLoading(false);
    }
  };

  const pendingCount = proposals.filter((p) => p.status === "pending").length;
  const displayed = filterTab === "pending" ? proposals.filter((p) => p.status === "pending") : proposals;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Proposed action types
              {pendingCount > 0 && (
                <Badge className="bg-amber-500 text-white">{pendingCount} pending</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              When the intake agent encounters a ticket for an unsupported action type, it logs a
              proposal here. Approve to open an engineering gap and start building support; reject
              to notify the requester that the action will not be added.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            disabled={actionState !== "idle"}
            className="text-slate-500"
          >
            <RefreshCw className={`h-4 w-4 ${actionState === "loading" ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mt-3 border-b">
          {(["pending", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterTab(t)}
              className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                filterTab === t
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "pending" ? "Pending" : "All"}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {/* Feedback banners */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMsg && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{successMsg}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {actionState === "loading" ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading proposals…
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <Clock className="h-8 w-8 text-slate-200" />
            <p className="text-sm">
              {filterTab === "pending" ? "No proposals waiting for review." : "No proposals recorded yet."}
            </p>
            <p className="text-xs max-w-xs text-center">
              Proposals appear here when the intake agent processes a ServiceNow ticket for an action
              type it doesn&apos;t recognize.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map((p) => (
              <ProposalRow
                key={p.id}
                proposal={p}
                onApprove={handleApprove}
                onReject={handleRejectOpen}
                disabled={actionState !== "idle"}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Reject confirmation dialog */}
      <RejectDialog
        open={rejectTarget !== null}
        displayName={rejectTarget?.displayName ?? ""}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        loading={rejectLoading}
      />
    </Card>
  );
}
