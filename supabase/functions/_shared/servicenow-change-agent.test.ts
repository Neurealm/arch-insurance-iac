import { assert, assertEquals, assertThrows } from "jsr:@std/assert@1.0.14";
import {
  assertTransition, conciseQuestions, isProhibitedInfrastructureAction, mergeTicketHistory,
  reconcileFacts, redactSensitiveData, shouldAskForField, type CandidateFact, type QuestionRegistryEntry,
} from "./servicenow-change-agent.ts";

const ticket = {
  number: "REQ0012345",
  sys_id: "abc123",
  requester: "iac.requester@example.test",
  application: "Claims Platform",
  environment: "Development",
  description: "Create iac-demo-vm02 in eastus.",
  maintenance_window: "2026-09-14 02:00-02:30 UTC",
  business_impact: "No production impact; draft-only verification.",
  application_owner: "IaC Platform Engineering",
  rollback_plan: "Close the draft PR; no infrastructure is applied.",
};

Deno.test("re-analysis preserves original fields through a double-nested demo envelope", () => {
  const original = { mode: "demo", ticket };
  const revision = {
    mode: "demo",
    ticket: {
      ...original,
      number: "REQ0012345",
      description: "Subnet ARM ID: /subscriptions/7dc9a7e7-2294-487c-af02-7cee2806017f/resourceGroups/iac-pilot-dev/providers/Microsoft.Network/virtualNetworks/pilot-vnet/subnets/workload",
      clarification_answers: ["The requested subnet is pilot-vnet/workload."],
    },
  };
  const merged = mergeTicketHistory([original, revision]);
  assertEquals(merged.requester, ticket.requester);
  assertEquals(merged.application, ticket.application);
  assertEquals(merged.environment, ticket.environment);
  assert(merged.description.includes("Create iac-demo-vm02"));
  assert(merged.description.includes("Subnet ARM ID"));
  assertEquals(merged.clarificationAnswers, ["The requested subnet is pilot-vnet/workload."]);
});

Deno.test("ticket identity is immutable and a later mismatch becomes an explicit conflict", () => {
  const merged = mergeTicketHistory([
    { mode: "demo", ticket: ticket },
    { mode: "demo", ticket: { number: ticket.number, sys_id: "incorrect-new-browser-id", description: "A later note." } },
  ]);
  assertEquals(merged.sysId, ticket.sys_id);
  assertEquals(merged.identityConflicts.length, 1);
});

Deno.test("identity aliases cannot override the original ticket number", () => {
  const merged = mergeTicketHistory([
    { mode: "demo", ticket: { ticket_number: "REQ0012345", sysId: "stable-record" } },
    { mode: "demo", ticket: { number: "REQ0099999", sys_id: "stable-record" } },
  ]);
  assertEquals(merged.ticketNumber, "REQ0012345");
  assertEquals(merged.identityConflicts, ["Ticket number conflict: expected REQ0012345, but an update supplied REQ0099999."]);
});

Deno.test("a newer requester correction supersedes, but does not erase, structured history", () => {
  const facts: CandidateFact[] = [
    { field: "location", value: "westus", dataType: "string", source: "structured_ticket", sourceRecordId: "snapshot-1", sourceAuthor: null, sourceAt: "2026-09-10T10:00:00Z", supportingText: "location=westus", confidence: 1 },
    { field: "location", value: "eastus", dataType: "string", source: "requester_correction", sourceRecordId: "event-2", sourceAuthor: "requester", sourceAt: "2026-09-10T11:00:00Z", supportingText: "Use eastus instead.", confidence: 1 },
  ];
  const reconciled = reconcileFacts(facts);
  assertEquals(reconciled.conflicts.length, 0);
  assertEquals(reconciled.facts[0].value, "eastus");
  assertEquals(reconciled.facts[0].supersedes, ["snapshot-1"]);
});

Deno.test("same-priority simultaneous contradictory facts are surfaced rather than guessed", () => {
  const facts: CandidateFact[] = [
    { field: "vmSize", value: "Standard_B2s", dataType: "string", source: "requester_reply", sourceRecordId: "event-a", sourceAuthor: "requester", sourceAt: "2026-09-10T11:00:00Z", supportingText: "B2s", confidence: 1 },
    { field: "vmSize", value: "Standard_D2s_v5", dataType: "string", source: "requester_reply", sourceRecordId: "event-b", sourceAuthor: "requester", sourceAt: "2026-09-10T11:00:00Z", supportingText: "D2s", confidence: 1 },
  ];
  const reconciled = reconcileFacts(facts);
  assertEquals(reconciled.facts.length, 0);
  assertEquals(reconciled.conflicts[0].field, "vmSize");
});

Deno.test("a semantic question is never repeated after a recorded answer", () => {
  const answered: QuestionRegistryEntry[] = [{ field: "subnetArmId", fingerprint: "subnetArmId:valid-value-required", question: "Please provide the subnet ARM ID.", answer: "provided", resolution: "ANSWERED" }];
  assertEquals(shouldAskForField("subnetArmId", answered, "MISSING"), false);
  assertEquals(shouldAskForField("subnetArmId", [{ ...answered[0], resolution: "INVALID" }], "INVALID"), true);
  assertEquals(conciseQuestions({ subnetArmId: "MISSING", vmSize: "MISSING" }, answered), ["Please provide a valid approved VM SKU."]);
  assertEquals(conciseQuestions({ subnetArmId: "INVALID" }, answered), ["The supplied subnet ARM ID is invalid. Please provide a corrected value."]);
  assertEquals(conciseQuestions({ subnetArmId: "CONTRADICTORY" }, []), ["Please choose or correct the conflicting value for subnet ARM ID."]);
});

Deno.test("state transitions and prohibited infrastructure actions are enforced deterministically", () => {
  assertTransition("REQUEST_COMPLETE", "GAP_CREATED");
  assertThrows(() => assertTransition("WAITING_FOR_INFORMATION", "DRAFT_PR_CREATED"));
  assertEquals(isProhibitedInfrastructureAction("terraform plan -out=run.tfplan"), true);
  assertEquals(isProhibitedInfrastructureAction("terraform validate"), false);
  assertEquals(isProhibitedInfrastructureAction("merge pull request 42"), true);
});

Deno.test("secrets are redacted while false and zero retain their distinct values", () => {
  assertEquals(redactSensitiveData({ api_key: "do-not-store", enabled: false, retry_count: 0, note: "token=also-do-not-store" }), {
    api_key: "[REDACTED]", enabled: false, retry_count: 0, note: "[REDACTED]",
  });
});

Deno.test("an unlabeled PEM private key is redacted before it can enter ticket history", () => {
  const privateKey = "-----BEGIN OPENSSH PRIVATE KEY-----\nnot-a-real-key\n-----END OPENSSH PRIVATE KEY-----";
  assertEquals(redactSensitiveData({ note: `Customer pasted this by mistake:\n${privateKey}` }), {
    note: "Customer pasted this by mistake:\n[REDACTED]",
  });
});
