// Tool definitions + dispatch for the agentic ServiceNow intake.
//
// Design rule that matters more than any other in this file: a tool's
// SCHEMA tells the model what shape of thing to ask for; the tool's
// IMPLEMENTATION decides whether that's actually allowed, using the exact
// same deterministic validators the old one-shot function used. The model
// choosing to call create_change_package does not create a change package --
// calling it with a validation state that says "ready" does. Every terminal
// tool re-checks its own precondition against server-held state, never
// against whatever the model claims.
import {
  type RecordValue, type NormalizedTicket, type AzureVm, type Analysis, type ValidationResult,
  record, text, sanitizeAnalysis, validate,
  loadAzureInventory, maybeCreateDraft, maybeCreateGap, InFlightChangeConflict, clarificationNote,
  inFlightConflictNote, addEvent, supabaseAdmin, SUPPORTED_ACTIONS, VM_RESOURCE_TYPE,
} from "../_shared/servicenow-intake-agent-core.ts";

export type AgentOutcomeKind = "ready" | "gap_opened" | "needs_clarification" | "blocked";

export type AgentOutcome = {
  kind: AgentOutcomeKind;
  note: string;
  draft: { id: string; package_number: string } | null;
  gap: { id: string; reused: boolean } | null;
  analysis: Analysis | null;
  validation: ValidationResult | null;
};

export type AgentContext = {
  admin: ReturnType<typeof supabaseAdmin>;
  ticket: NormalizedTicket;
  requestId: string;
  demoMode: boolean;
  /** Only set in demo mode -- the human testing the agent from the console. Never the ticket requester. */
  callerId: string | null;
  userAuthorization?: string;
  azure: { state: string; vms: AzureVm[] } | null;
  capabilityCache: Map<string, boolean>;
  lastAnalysis: Analysis | null;
  lastValidation: ValidationResult | null;
  outcome: AgentOutcome | null;
};

export function createAgentContext(opts: {
  admin: ReturnType<typeof supabaseAdmin>;
  ticket: NormalizedTicket;
  requestId: string;
  demoMode: boolean;
  callerId: string | null;
  userAuthorization?: string;
}): AgentContext {
  return {
    ...opts,
    azure: null,
    capabilityCache: new Map(),
    lastAnalysis: null,
    lastValidation: null,
    outcome: null,
  };
}

/**
 * OpenAI-compatible function-calling tool schemas. Sent as the `tools` field
 * on every chat-completions call to the Lovable AI Gateway. NOTE: this
 * assumes the gateway forwards `tools`/`tool_calls` for the configured
 * Gemini model the same way it forwards `response_format` today -- verify
 * this against a real call in a dev environment before relying on it (see
 * docs/servicenow-intake-agent.md's "before you cut over" checklist).
 */
export const TOOL_SCHEMAS = [
  {
    type: "function",
    function: {
      name: "get_azure_inventory",
      description: "Fetch the live Azure VM inventory. Call this before matching a ticket to a specific machine, or before submit_analysis for any action other than create_vm. Cached after the first call within this request.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "check_capability",
      description: "Check whether an approved, human-reviewed Terraform capability already exists for a given action type. If it does not, the request will need an engineering gap instead of a change package even when everything else checks out.",
      parameters: {
        type: "object",
        properties: {
          action_type: { type: "string", enum: [...SUPPORTED_ACTIONS] },
        },
        required: ["action_type"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "submit_analysis",
      description: "Submit your classification and extraction of this ticket for deterministic validation. This does not take any action by itself -- it returns exactly what is missing, conflicting, or unresolved so you can decide what to do next (ask a clarifying question, open an engineering gap, or create a change package). You may call this more than once if you refine your reading of the ticket after checking Azure inventory or capability status.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: [...SUPPORTED_ACTIONS, "unknown"], description: "The classified action. 'unknown' if the ticket does not clearly ask for one of the supported actions." },
          confidence: { type: "integer", minimum: 0, maximum: 100, description: "Integer percentage 0-100. Below 60 for anything ambiguous." },
          summary: { type: "string", description: "One or two sentence plain-English summary of the request." },
          targetVmName: { type: "string", description: "Exact inventory VM name this ticket targets, for any action except create_vm. Empty string if not applicable or not yet determined." },
          extractedFields: { type: "object", description: "Any structured facts you pulled from the ticket prose (requester, application, environment, maintenanceWindow, businessImpact, applicationOwner, rollbackPlan, or action-specific values). Use the ticket's own field names where obvious." },
          missingFields: { type: "array", items: { type: "string" }, description: "Human-readable descriptions of information the ticket does not provide. Ignored for create_vm (that action's requirements are computed deterministically)." },
          conflicts: { type: "array", items: { type: "string" }, description: "Contradictions you noticed between the ticket and Azure state, or within the ticket itself." },
          clarificationQuestions: { type: "array", items: { type: "string" }, description: "Specific questions to ask the requester, phrased for a non-technical reader. Ignored for create_vm." },
          provisioning: {
            type: "object",
            description: "Only when action is create_vm: whatever of resourceGroupArmId, subnetArmId, location, vmNames, vmSize, adminUsername, sshPublicKey, osPublisher, osOffer, osSku, osVersion, tags the ticket genuinely states. Never invent a value -- an absent key is asked for; a wrong one is silently rejected and worse.",
          },
        },
        required: ["action", "confidence", "summary"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "ask_clarifying_question",
      description: "Terminal action. Ends this analysis by asking the requester for missing or conflicting information. Requires that you have already called submit_analysis and its validation was not ready to proceed. Composes and (outside demo mode) posts the clarification note to ServiceNow using your last submitted analysis.",
      parameters: {
        type: "object",
        properties: {
          rationale: { type: "string", description: "One sentence: why this ticket cannot proceed yet." },
        },
        required: ["rationale"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_change_package",
      description: "Terminal action. Opens a governed (still human-approval-required) change package for this request. Only succeeds if your last submit_analysis validated as fully ready AND check_capability confirmed an approved capability for this action. Fails safely (non-terminal error result, you may correct and retry) if either precondition is not met.",
      parameters: {
        type: "object",
        properties: {
          rationale: { type: "string", description: "One sentence: why this request is ready to become a governed change package." },
        },
        required: ["rationale"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_engineering_gap",
      description: "Terminal action. Opens (or links to an existing) engineering gap when the request is otherwise fully valid but no approved Terraform capability exists yet for the action. Only succeeds if your last submit_analysis was fully valid except for capability approval.",
      parameters: {
        type: "object",
        properties: {
          rationale: { type: "string", description: "One sentence: why this request is complete but needs a new capability." },
        },
        required: ["rationale"],
        additionalProperties: false,
      },
    },
  },
] as const;

export type ToolResult = { content: RecordValue; terminal: boolean };

function requireAnalysis(ctx: AgentContext): { analysis: Analysis; validation: ValidationResult } | { error: string } {
  if (!ctx.lastAnalysis || !ctx.lastValidation) {
    return { error: "Call submit_analysis at least once before this tool." };
  }
  return { analysis: ctx.lastAnalysis, validation: ctx.lastValidation };
}

export async function callTool(name: string, rawArgs: unknown, ctx: AgentContext): Promise<ToolResult> {
  const args = record(rawArgs);

  if (name === "get_azure_inventory") {
    if (!ctx.azure) {
      try {
        ctx.azure = await loadAzureInventory(ctx.userAuthorization);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Azure inventory lookup failed.";
        return { content: { error: message }, terminal: false };
      }
    }
    return { content: { state: ctx.azure.state, vmCount: ctx.azure.vms.length, vms: ctx.azure.vms }, terminal: false };
  }

  if (name === "check_capability") {
    const actionType = text(args.action_type);
    if (!SUPPORTED_ACTIONS.has(actionType)) return { content: { error: "action_type must be one of the supported actions." }, terminal: false };
    if (!ctx.capabilityCache.has(actionType)) {
      const { data } = await ctx.admin.from("iac_automation_capabilities")
        .select("id").eq("provider", "azure").eq("resource_type", VM_RESOURCE_TYPE)
        .eq("action_type", actionType).eq("lifecycle_status", "approved").maybeSingle();
      ctx.capabilityCache.set(actionType, !!data);
    }
    return { content: { action_type: actionType, approved: ctx.capabilityCache.get(actionType) }, terminal: false };
  }

  if (name === "submit_analysis") {
    const analysis = sanitizeAnalysis(args);
    const azure = ctx.azure ?? { state: "not_fetched", vms: [] as AzureVm[] };
    const hasApprovedCapability = ctx.capabilityCache.get(analysis.action) ?? false;
    const validation = validate(ctx.ticket, analysis, azure, hasApprovedCapability);
    ctx.lastAnalysis = analysis;
    ctx.lastValidation = validation;
    return {
      content: {
        sanitizedAction: analysis.action,
        sanitizedConfidence: analysis.confidence,
        missing: validation.missing,
        conflicts: validation.conflicts,
        questions: validation.questions,
        ready: validation.ready,
        readyForGap: validation.readyForGap,
        capabilityChecked: ctx.capabilityCache.has(analysis.action),
        note: ctx.capabilityCache.has(analysis.action)
          ? undefined
          : "You have not called check_capability for this action yet; readyForGap assumes no approved capability until you do.",
        azureChecked: ctx.azure !== null,
      },
      terminal: false,
    };
  }

  if (name === "ask_clarifying_question") {
    const rationale = text(args.rationale);
    if (!rationale) return { content: { error: "rationale is required." }, terminal: false };
    const found = requireAnalysis(ctx);
    if ("error" in found) return { content: { error: found.error }, terminal: false };
    const { analysis, validation } = found;
    if (validation.ready) return { content: { error: "Your last submit_analysis validated as ready. Did you mean create_change_package?" }, terminal: false };
    const note = clarificationNote(ctx.ticket, analysis, validation, null);
    ctx.outcome = { kind: "needs_clarification", note, draft: null, gap: null, analysis, validation };
    await addEvent(ctx.admin, ctx.requestId, "agent_terminal_ask_clarifying_question", { rationale, missing: validation.missing, conflicts: validation.conflicts });
    return { content: { accepted: true, note }, terminal: true };
  }

  if (name === "create_change_package") {
    const rationale = text(args.rationale);
    if (!rationale) return { content: { error: "rationale is required." }, terminal: false };
    const found = requireAnalysis(ctx);
    if ("error" in found) return { content: { error: found.error }, terminal: false };
    const { analysis, validation } = found;
    if (!validation.ready) {
      return { content: { error: "Not ready: this request either has missing/conflicting fields, or no approved capability was confirmed via check_capability. Call ask_clarifying_question or create_engineering_gap instead, or refine and resubmit." }, terminal: false };
    }
    try {
      const draft = await maybeCreateDraft(ctx.admin, ctx.ticket, analysis, validation.target, ctx.demoMode ? ctx.callerId : null);
      const note = draft ? `${clarificationNote(ctx.ticket, analysis, validation, null)}\n\nGoverned draft package created: ${draft.package_number}. Approval is still required.` : clarificationNote(ctx.ticket, analysis, validation, null);
      ctx.outcome = { kind: "ready", note, draft, gap: null, analysis, validation };
      await addEvent(ctx.admin, ctx.requestId, "agent_terminal_create_change_package", { rationale, packageNumber: draft?.package_number ?? null });
      return { content: { accepted: true, packageNumber: draft?.package_number ?? null, note }, terminal: true };
    } catch (cause) {
      if (cause instanceof InFlightChangeConflict) {
        const note = inFlightConflictNote(analysis, cause.message);
        ctx.outcome = { kind: "blocked", note, draft: null, gap: null, analysis, validation };
        await addEvent(ctx.admin, ctx.requestId, "agent_terminal_in_flight_conflict", { rationale, detail: cause.message });
        return { content: { accepted: true, blocked: true, reason: cause.message, note }, terminal: true };
      }
      const message = cause instanceof Error ? cause.message : "Unable to create governed draft.";
      return { content: { error: message }, terminal: false };
    }
  }

  if (name === "create_engineering_gap") {
    const rationale = text(args.rationale);
    if (!rationale) return { content: { error: "rationale is required." }, terminal: false };
    const found = requireAnalysis(ctx);
    if ("error" in found) return { content: { error: found.error }, terminal: false };
    const { analysis, validation } = found;
    if (!validation.readyForGap) {
      return { content: { error: "Not ready for a gap: either fields are still missing/conflicting, or an approved capability already exists (call create_change_package instead)." }, terminal: false };
    }
    const gap = await maybeCreateGap(ctx.admin, ctx.ticket, analysis, ctx.requestId, ctx.demoMode ? ctx.callerId : null);
    const note = clarificationNote(ctx.ticket, analysis, validation, gap);
    ctx.outcome = { kind: "gap_opened", note, draft: null, gap, analysis, validation };
    await addEvent(ctx.admin, ctx.requestId, "agent_terminal_create_engineering_gap", { rationale, gapId: gap.id, reused: gap.reused });
    return { content: { accepted: true, gapId: gap.id, reused: gap.reused, note }, terminal: true };
  }

  return { content: { error: `Unknown tool: ${name}` }, terminal: false };
}
