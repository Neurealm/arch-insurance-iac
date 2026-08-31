import { supabase } from "@/integrations/supabase/client";

export type ServiceNowIntakeRequest = {
  id: string;
  ticketNumber: string;
  status: string;
  requestedByUserId: string | null;
  normalizedRequest: Record<string, unknown>;
  llmAnalysis: Record<string, unknown>;
  azureObservation: Record<string, unknown>;
  clarificationNote: string | null;
  changePackageId: string | null;
  errorMessage: string | null;
  receivedAt: string;
  analyzedAt: string | null;
  updatedAt: string;
};

const table = () => supabase as unknown as { from: (name: string) => any };

function map(row: Record<string, any>): ServiceNowIntakeRequest {
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    status: row.status,
    requestedByUserId: row.requested_by_user_id ?? null,
    normalizedRequest: row.normalized_request ?? {},
    llmAnalysis: row.llm_analysis ?? {},
    azureObservation: row.azure_observation ?? {},
    clarificationNote: row.clarification_note ?? null,
    changePackageId: row.change_package_id ?? null,
    errorMessage: row.error_message ?? null,
    receivedAt: row.received_at,
    analyzedAt: row.analyzed_at ?? null,
    updatedAt: row.updated_at,
  };
}

export async function listServiceNowIntakeRequests() {
  const { data, error } = await table().from("servicenow_intake_requests").select("id, ticket_number, status, requested_by_user_id, normalized_request, llm_analysis, azure_observation, clarification_note, change_package_id, error_message, received_at, analyzed_at, updated_at").order("updated_at", { ascending: false }).limit(25);
  if (error) throw error;
  return (data ?? []).map(map);
}

export async function submitDemoServiceNowTicket(ticket: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("servicenow-intake", { body: { mode: "demo", ticket } });
  if (error) throw error;
  return data as { requestId: string; status: string; action: string; confidence: number; readyForEngineering: boolean; changePackageNumber: string | null; comment: string };
}
