import { listServiceNowIntakeRequests } from "../servicenowIntakeRequests";

/**
 * Values an analyzed ServiceNow ticket can seed into a change form.
 *
 * Prefill is a convenience only: every value lands in an ordinary form field
 * and is re-validated by the same gates a typed value goes through. Nothing
 * here bypasses a check, and nothing is submitted without a person confirming.
 */
export type TicketPrefill = {
  intakeRequestId: string;
  ticketNumber: string;
  sysId: string;
  requester: string;
  summary: string;
  action: string;
  targetVmName: string;
  environment: string;
  /** Only populated for a create_vm ticket. */
  provisioning: Record<string, unknown>;
  /** Free-form values the agent extracted, used by the existing-VM actions. */
  extractedFields: Record<string, unknown>;
};

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const record = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

export async function loadTicketPrefill(intakeRequestId: string): Promise<TicketPrefill | null> {
  const requests = await listServiceNowIntakeRequests();
  const row = requests.find((item) => item.id === intakeRequestId);
  if (!row) return null;
  const analysis = row.llmAnalysis;
  const normalized = row.normalizedRequest;
  return {
    intakeRequestId: row.id,
    ticketNumber: row.ticketNumber,
    sysId: text(normalized.sysId),
    requester: text(normalized.requester),
    summary: text(analysis.summary) || text(normalized.description),
    action: text(analysis.action),
    targetVmName: text(analysis.targetVmName),
    environment: text(normalized.environment).toLowerCase(),
    provisioning: record(analysis.provisioning),
    extractedFields: record(analysis.extractedFields),
  };
}

/** The reason box is seeded with who asked and what they asked for. */
export function prefillRationale(prefill: TicketPrefill) {
  const who = prefill.requester ? ` requested by ${prefill.requester}` : "";
  return `ServiceNow ${prefill.ticketNumber}${who}: ${prefill.summary}`.trim();
}

/** Where an analyzed ticket should hand off in Change Engineering. */
export function changeHandoffPath(
  intakeRequestId: string,
  action: string,
  targetVmName: string,
): { path: string; label: string } {
  const query = `?fromTicket=${encodeURIComponent(intakeRequestId)}`;
  if (action === "create_vm") return { path: `/changes/provision-vms${query}`, label: "Open provisioning request" };
  if (action && action !== "unknown" && targetVmName) {
    return { path: `/changes/${encodeURIComponent(targetVmName)}${query}`, label: "Open change request" };
  }
  return { path: "/changes", label: "Open Change Engineering" };
}
