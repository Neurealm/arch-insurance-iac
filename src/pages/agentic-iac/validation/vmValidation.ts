import { supabase } from "@/integrations/supabase/client";

export type ValidationResult = {
  id?: string;
  checkCode: string;
  domain: string;
  measure: string;
  expected: string;
  observed: string;
  result: "PASS" | "WARN" | "FAIL";
  source: string;
  raw: Record<string, unknown>;
  checkedAt?: string;
};

export type ValidationRun = {
  id: string;
  packageId: string;
  status: "pending" | "running" | "verified" | "failed" | "closed";
  startedAt: string | null;
  completedAt: string | null;
  closedAt: string | null;
  validatedBy: string | null;
  confidence: number | null;
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  summary: string | null;
  evidenceHash: string | null;
  authority: "server-v1" | null;
};

export type EvidenceItem = { id: string; kind: string; name: string; source: string; capturedAt: string; content: Record<string, unknown>; contentHash: string | null };

const db = () => supabase as unknown as { from: (name: string) => any };

function mapRun(row: Record<string, any>): ValidationRun {
  return { id: row.id, packageId: row.package_id, status: row.status, startedAt: row.started_at, completedAt: row.completed_at, closedAt: row.closed_at, validatedBy: row.validated_by, confidence: row.confidence, beforeState: row.before_state ?? {}, afterState: row.after_state ?? {}, summary: row.summary ?? null, evidenceHash: row.evidence_hash ?? null, authority: row.validation_authority === "server-v1" ? "server-v1" : null };
}

function mapResult(row: Record<string, any>): ValidationResult {
  return { id: row.id, checkCode: row.check_code, domain: row.domain, measure: row.measure, expected: row.expected, observed: row.observed, result: row.result, source: row.source, raw: row.raw ?? {}, checkedAt: row.checked_at };
}

function mapEvidence(row: Record<string, any>): EvidenceItem {
  return { id: row.id, kind: row.kind, name: row.name, source: row.source, capturedAt: row.captured_at, content: row.content ?? {}, contentHash: row.content_hash ?? null };
}

export async function getValidationRun(packageId: string) {
  const { data, error } = await db().from("iac_validation_runs").select("*").eq("package_id", packageId).maybeSingle();
  if (error) throw error;
  return data ? mapRun(data) : null;
}

export async function getValidationResults(runId: string) {
  const { data, error } = await db().from("iac_validation_results").select("*").eq("run_id", runId).order("checked_at");
  if (error) throw error;
  return (data ?? []).map(mapResult);
}

export async function getEvidenceItems(runId: string) {
  const { data, error } = await db().from("iac_evidence_items").select("*").eq("run_id", runId).order("captured_at");
  if (error) throw error;
  return (data ?? []).map(mapEvidence);
}

async function requestValidation(packageId: string, action: "verify" | "close") {
  // The browser supplies identifiers only. The authenticated server fetches and
  // verifies the saved apply, approval, all targets, and fresh Azure state.
  const { data, error } = await supabase.functions.invoke("vm-change-validation", { body: { packageId, action } });
  if (error) {
    const context = (error as Error & { context?: Response }).context;
    const body = context instanceof Response ? await context.json().catch(() => null) : null;
    throw new Error(body?.error || error.message || "Server-side validation is unavailable.");
  }
  if (!data?.run || !Array.isArray(data.results)) throw new Error("The validation server returned an incomplete result.");
  return { run: mapRun(data.run), results: data.results.map(mapResult) as ValidationResult[] };
}

export function persistValidation(packageId: string) { return requestValidation(packageId, "verify"); }
export function closeValidationRun(packageId: string) { return requestValidation(packageId, "close"); }
