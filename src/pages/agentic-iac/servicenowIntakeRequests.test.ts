import { describe, expect, it } from "vitest";
import { canonicalTicketPayload, mergeTicketPayloadHistory } from "./servicenowIntakeRequests";

const original = {
  number: "REQ0012345",
  sys_id: "demo-stable-id",
  requester: "iac.requester@example.test",
  application: "Claims Platform",
  environment: "Development",
  description: "Create iac-demo-vm02 in eastus.",
  maintenance_window: "2026-09-14 02:00 UTC",
  business_impact: "Draft-only test.",
  application_owner: "IaC Platform Engineering",
  rollback_plan: "Close the draft PR.",
};

describe("canonicalTicketPayload", () => {
  it("unwraps a normal demo transport envelope", () => {
    expect(canonicalTicketPayload({ mode: "demo", ticket: original })).toEqual(original);
  });

  it("preserves original fields through an historical double-nested note revision", () => {
    const revision = {
      mode: "demo",
      ticket: {
        mode: "demo",
        ticket: original,
        number: original.number,
        sys_id: original.sys_id,
        description: `${original.description}\n\nAdditional notes: subnet supplied.`,
        clarification_answers: ["Subnet supplied."],
      },
    };
    expect(canonicalTicketPayload(revision)).toMatchObject({
      requester: original.requester,
      application: original.application,
      environment: original.environment,
      sys_id: original.sys_id,
      description: expect.stringContaining("Additional notes"),
      clarification_answers: ["Subnet supplied."],
    });
  });

  it("keeps the earliest ServiceNow identity and the full text/answer history", () => {
    const revision = {
      mode: "demo",
      ticket: {
        mode: "demo",
        ticket: {
          ...original,
          clarification_answers: ["Original answer."],
        },
        sys_id: "incorrect-new-browser-id",
        description: "Additional notes: subnet supplied.",
        clarification_answers: ["Subnet supplied."],
      },
    };
    expect(canonicalTicketPayload(revision)).toMatchObject({
      sys_id: original.sys_id,
      description: expect.stringContaining(original.description),
      clarification_answers: ["Original answer.", "Subnet supplied."],
    });
  });

  it("does not let a ticket-number alias replace the original ticket identity", () => {
    expect(canonicalTicketPayload({
      mode: "demo",
      ticket: { ticket_number: original.number, ticket: { ...original }, description: "Later note" },
    })).toMatchObject({ number: original.number });
  });

  it("reconstructs a revise form from the full event history", () => {
    expect(mergeTicketPayloadHistory([
      { mode: "demo", ticket: original },
      { mode: "demo", ticket: { number: original.number, sys_id: original.sys_id, description: "Requester follow-up: subnet supplied.", clarification_answers: ["Subnet supplied."] } },
    ])).toMatchObject({
      requester: original.requester,
      application: original.application,
      description: expect.stringContaining("Requester follow-up"),
      clarification_answers: ["Subnet supplied."],
    });
  });

  it("returns an empty payload for malformed non-object input", () => {
    expect(canonicalTicketPayload(["not", "a", "ticket"])).toEqual({});
  });
});
