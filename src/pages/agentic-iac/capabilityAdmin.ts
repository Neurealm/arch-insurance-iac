/* The generated database types do not include the capability-promotion migration yet. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";

/**
 * Client wrapper for capability promotion. Mirrors automationCatalog.ts.
 *
 * Reads go straight to Postgres: a platform administrator can already SELECT
 * engineering gaps and non-approved capabilities under RLS. Everything that
 * decides or records anything goes through the terraform-ci-status-sync Edge
 * Function, because CI evidence must be observed server-side with the
 * read-only GitHub token and promotion is gated by approve_iac_capability.
 * Nothing here can approve a capability on its own.
 */

export type GapStatus =
  | "open" | "searching_existing" | "drafting" | "pr_opened" | "ci_running"
  | "ci_passed" | "ci_failed" | "ready_for_review" | "capability_approved" | "abandoned";
export type CiStatus = "unknown" | "running" | "passed" | "failed";
export type RemediationStatus = "idle" | "running" | "waiting_ci" | "succeeded" | "failed" | "exhausted";

export type CapabilityGap = {
  id: string; provider: string; resourceType: string; actionType: string;
  status: GapStatus; requestedBy: string | null; context: Record<string, unknown>;
  draftBranch: string | null; draftPrNumber: number | null; draftPrUrl: string | null;
  linkedCapabilityId: string | null;
  ciStatus: CiStatus; ciHeadSha: string | null; ciObservedAt: string | null;
  ciVersion: number; ciEvidence: Record<string, unknown>;
  remediationStatus: RemediationStatus; remediationAttempts: number;
  remediationHeadSha: string | null; remediationUpdatedAt: string | null;
  createdAt: string; updatedAt: string;
  capability: {
    id: string; displayName: string; actionType: string; moduleSource: string;
    moduleVersion: string; executionMode: string; lifecycleStatus: string;
    allowedEnvironments: string[]; maxTargetsPerRun: number;
    approvedSourceRevision: string | null; approvedAt: string | null;
  } | null;
};

export type GapEvent = { id: string; eventType: string; detail: Record<string, unknown>; createdAt: string };

/** Server-observed CI evidence. Only the server may produce this shape. */
export type CiEvidence = {
  status?: CiStatus; reason?: string; headSha?: string; merged?: boolean; mergeSha?: string;
  promotionReady?: boolean; observedAt?: string; prNumber?: string; branch?: string;
  workflows?: Array<Record<string, unknown>>; review?: Record<string, unknown>;
};

const db = () => supabase as unknown as { from: (name: string) => any };
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

const CAPABILITY_COLUMNS =
  "id,display_name,action_type,module_source,module_version,execution_mode,lifecycle_status," +
  "allowed_environments,max_targets_per_run,approved_source_revision,approved_at";

function mapGap(row: Record<string, any>): CapabilityGap {
  const capability = row.iac_automation_capabilities;
  return {
    id: row.id, provider: row.provider, resourceType: row.resource_type, actionType: row.action_type,
    status: row.status, requestedBy: row.requested_by ?? null, context: record(row.context),
    draftBranch: row.draft_branch ?? null,
    draftPrNumber: row.draft_pr_number == null ? null : Number(row.draft_pr_number),
    draftPrUrl: row.draft_pr_url ?? null, linkedCapabilityId: row.linked_capability_id ?? null,
    ciStatus: row.ci_status ?? "unknown", ciHeadSha: row.ci_head_sha ?? null,
    ciObservedAt: row.ci_observed_at ?? null, ciVersion: Number(row.ci_version ?? 0),
    ciEvidence: record(row.ci_evidence), createdAt: row.created_at, updatedAt: row.updated_at,
    remediationStatus: row.remediation_status ?? "idle",
    remediationAttempts: Number(row.remediation_attempts ?? 0),
    remediationHeadSha: row.remediation_head_sha ?? null,
    remediationUpdatedAt: row.remediation_updated_at ?? null,
    capability: capability
      ? {
        id: capability.id, displayName: capability.display_name, actionType: capability.action_type,
        moduleSource: capability.module_source, moduleVersion: capability.module_version,
        executionMode: capability.execution_mode, lifecycleStatus: capability.lifecycle_status,
        allowedEnvironments: capability.allowed_environments ?? [],
        maxTargetsPerRun: Number(capability.max_targets_per_run ?? 1),
        approvedSourceRevision: capability.approved_source_revision ?? null,
        approvedAt: capability.approved_at ?? null,
      }
      : null,
  };
}

export async function listCapabilityGaps(): Promise<CapabilityGap[]> {
  const { data, error } = await db().from("iac_engineering_gaps")
    .select(`*,iac_automation_capabilities!linked_capability_id(${CAPABILITY_COLUMNS})`)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapGap);
}

export async function getCapabilityGap(gapId: string): Promise<CapabilityGap | null> {
  const { data, error } = await db().from("iac_engineering_gaps")
    .select(`*,iac_automation_capabilities!linked_capability_id(${CAPABILITY_COLUMNS})`)
    .eq("id", gapId).maybeSingle();
  if (error) throw error;
  return data ? mapGap(data) : null;
}

export async function listGapEvents(gapId: string): Promise<GapEvent[]> {
  const { data, error } = await db().from("iac_engineering_gap_events")
    .select("*").eq("gap_id", gapId).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return (data ?? []).map((row: Record<string, any>) => ({
    id: row.id, eventType: row.event_type, detail: record(row.detail), createdAt: row.created_at,
  }));
}

/**
 * The Edge Function returns a structured body on a policy refusal (409/403).
 * supabase.functions.invoke surfaces those as an error with an unread body, so
 * read the response before falling back to the transport message; otherwise a
 * reviewer sees "Edge Function returned a non-2xx status code" and cannot tell
 * a stale-evidence refusal from an outage.
 */
async function invokeCiSync(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke("terraform-ci-status-sync", { body });
  if (!error) return record(data);
  const response = (error as { context?: Response }).context;
  if (response && typeof response.json === "function") {
    const parsed = record(await response.json().catch(() => ({})));
    if (typeof parsed.error === "string" && parsed.error) throw new Error(parsed.error);
  }
  throw error;
}

async function invokeDraftingAgent(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke("terraform-drafting-agent", { body });
  if (!error) return record(data);
  const response = (error as { context?: Response }).context;
  if (response && typeof response.json === "function") {
    const parsed = record(await response.json().catch(() => ({})));
    if (typeof parsed.error === "string" && parsed.error) throw new Error(parsed.error);
  }
  throw error;
}

async function invokeRemediationAgent(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke("terraform-ci-remediation-agent", { body });
  if (!error) return record(data);
  const response = (error as { context?: Response }).context;
  if (response && typeof response.json === "function") {
    const parsed = record(await response.json().catch(() => ({})));
    if (typeof parsed.error === "string" && parsed.error) throw new Error(parsed.error);
  }
  throw error;
}

export type DraftStartResult = {
  outcome: string;
  message: string;
  prUrl: string | null;
};

export async function startCapabilityDraft(gapId: string): Promise<DraftStartResult> {
  const { data, error } = await supabase.functions.invoke("capability-resolver", { body: { gapId } });
  if (error) throw error;
  const resolver = record(data);
  const result = await invokeDraftingAgent({ gapId });
  const row = record(Array.isArray(result.results) ? result.results[0] : result);
  return {
    outcome: String(row.outcome ?? resolver.outcome ?? "unknown"),
    message: String(row.message ?? "Drafting request submitted."),
    prUrl: typeof row.prUrl === "string" ? row.prUrl : null,
  };
}

export type CiSyncResult = { gapId: string; ciVersion: number; evidence: CiEvidence };

/** Re-observe GitHub. Records evidence; never approves anything. */
export async function syncCapabilityCi(gapId?: string): Promise<CiSyncResult[]> {
  const result = await invokeCiSync(gapId ? { operation: "sync", gapId } : { operation: "sync" });
  const rows = Array.isArray(result.results) ? result.results : [];
  return rows.map((row) => {
    const item = record(row);
    return { gapId: String(item.gapId ?? ""), ciVersion: Number(item.ciVersion ?? 0), evidence: record(item.evidence) as CiEvidence };
  });
}

export type CiRemediationResult = {
  outcome: "committed" | "rejected" | "exhausted" | "failed";
  attempt: number; remediationStatus: RemediationStatus;
  model: string | null; summary: string; newHeadSha: string | null;
};

/** Run one claimed repair attempt for the exact failed CI observation. */
export async function repairCapabilityCi(input: { gapId: string; expectedHeadSha: string; expectedCiVersion: number }): Promise<CiRemediationResult> {
  const result = await invokeRemediationAgent(input);
  return {
    outcome: String(result.outcome ?? "failed") as CiRemediationResult["outcome"],
    attempt: Number(result.attempt ?? 0),
    remediationStatus: String(result.remediationStatus ?? "failed") as RemediationStatus,
    model: typeof result.model === "string" ? result.model : null,
    summary: String(result.summary ?? result.message ?? "The repair agent did not report a summary."),
    newHeadSha: typeof result.newHeadSha === "string" ? result.newHeadSha : null,
  };
}

/**
 * Promote the exact reviewed commit. The caller must echo back the head SHA
 * and CI version it displayed, so a reviewer can never approve evidence that
 * changed after it was rendered; the server re-observes GitHub and the SQL
 * function re-checks role, separation of duties and freshness under a lock.
 */
export async function approveCapability(input: {
  gapId: string; expectedHeadSha: string; expectedCiVersion: number; comment: string;
}): Promise<{ evidence: CiEvidence; message: string }> {
  const result = await invokeCiSync({
    operation: "approve", gapId: input.gapId, expectedHeadSha: input.expectedHeadSha,
    expectedCiVersion: input.expectedCiVersion, comment: input.comment.trim(),
  });
  return { evidence: record(result.evidence) as CiEvidence, message: String(result.message ?? "Capability promoted.") };
}
