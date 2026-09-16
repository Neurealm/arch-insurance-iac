/* The generated database types do not include the proposed-actions migration yet. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";

/**
 * Client data layer for Dynamic Action Discovery admin.
 *
 * Reads go straight to Postgres (platform admins can SELECT iac_proposed_actions
 * under RLS). Approve goes directly through the approve_proposed_action() RPC
 * (server-enforced is_platform_admin check + atomic gap creation). Reject goes
 * through servicenow-intake-agent (mode=reject_proposal) because it needs to
 * post a ServiceNow comment using server-held credentials.
 */

export type ProposalStatus = "pending" | "approved" | "rejected";

export type ProposedAction = {
  id: string;
  proposedName: string;
  displayName: string;
  intakeRequestId: string | null;
  ticketNumber: string;
  agentReasoning: string;
  status: ProposalStatus;
  rejectionReason: string | null;
  gapId: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

const db = () => supabase as unknown as { from: (name: string) => any };
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

function mapProposal(row: Record<string, any>): ProposedAction {
  return {
    id: row.id,
    proposedName: row.proposed_name,
    displayName: row.display_name,
    intakeRequestId: row.intake_request_id ?? null,
    ticketNumber: row.ticket_number,
    agentReasoning: row.agent_reasoning,
    status: row.status as ProposalStatus,
    rejectionReason: row.rejection_reason ?? null,
    gapId: row.gap_id ?? null,
    reviewedBy: row.reviewed_by ?? null,
    reviewedAt: row.reviewed_at ?? null,
    createdAt: row.created_at,
  };
}

export async function listProposedActions(status?: ProposalStatus): Promise<ProposedAction[]> {
  let query = db().from("iac_proposed_actions").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapProposal);
}

export async function getProposedAction(id: string): Promise<ProposedAction | null> {
  const { data, error } = await db().from("iac_proposed_actions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapProposal(data) : null;
}

export type ApproveResult = {
  gapId: string;
};

/**
 * Approve a pending proposed action.
 * Server-side: checks is_platform_admin, creates engineering gap, marks approved.
 * Returns the engineering gap id so the UI can redirect to the gap detail page.
 */
export async function approveProposedAction(proposalId: string): Promise<ApproveResult> {
  const { data, error } = await supabase.rpc("approve_proposed_action", { p_proposal_id: proposalId });
  if (error) throw error;
  const result = record(data);
  return { gapId: String(result.gapId ?? result.gap_id ?? "") };
}

export type RejectResult = {
  rejected: boolean;
  commentPosted: boolean;
  commentError?: string;
};

/**
 * Reject a pending proposed action.
 * Goes through servicenow-intake-agent (reject_proposal mode) because it needs
 * to post a ServiceNow comment with the rejection reason using server-held creds.
 */
export async function rejectProposedAction(proposalId: string, reason: string): Promise<RejectResult> {
  const { data, error } = await supabase.functions.invoke("servicenow-intake-agent", {
    body: { mode: "reject_proposal", proposalId, reason },
  });
  if (error) {
    // Surface structured error body from the Edge Function if available
    const response = (error as { context?: Response }).context;
    if (response && typeof response.json === "function") {
      const parsed = record(await response.json().catch(() => ({})));
      if (typeof parsed.error === "string" && parsed.error) throw new Error(parsed.error);
    }
    throw error;
  }
  const result = record(data);
  return {
    rejected: result.rejected === true,
    commentPosted: result.commentPosted === true,
    commentError: typeof result.commentError === "string" ? result.commentError : undefined,
  };
}
