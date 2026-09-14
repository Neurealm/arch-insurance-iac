# ServiceNow intake -- agentic rebuild

`supabase/functions/servicenow-intake-agent` is a from-scratch, tool-calling
rebuild of `supabase/functions/servicenow-intake`. It runs **alongside** the
original function, unchanged and untouched -- nothing about the live
ServiceNow webhook depends on this file existing. Treat this as a parallel
implementation to validate in demo/resume mode before ever pointing real
ServiceNow traffic at it.

## Why this is a real agent and the original wasn't

The original function calls Gemini exactly once per ticket, in a fixed
pipeline the *code* controls: fetch history -> fetch Azure -> one LLM call
-> validate -> branch. The model has no say over that sequence.

This version hands the model a toolbox and lets it decide the sequence,
across up to 8 turns:

| Tool | Effect |
|---|---|
| `get_azure_inventory` | fetch live VM state (cached after first call) |
| `check_capability` | is there an approved Terraform module for this action? |
| `submit_analysis` | submit a classification for deterministic validation -- callable more than once as the agent refines its read of the ticket |
| `ask_clarifying_question` | **terminal** -- ends the run by asking the requester for missing/conflicting info |
| `create_change_package` | **terminal** -- opens a governed draft (still needs separate human approval) |
| `create_engineering_gap` | **terminal** -- opens/links an engineering gap when no capability exists yet |

The model decides *when* to check Azure, *when* to check capability status,
and *whether* to refine its analysis before committing to a terminal action.
That's the actual definition of "agent" vs. the original's single-shot
classifier -- see the chat history in this session for the fuller
explanation of that distinction.

## What did NOT change, on purpose

Every terminal tool re-validates its own precondition against
`_shared/servicenow-intake-agent-core.ts`'s `validate()` -- the **exact same
deterministic function** the original uses (copied here as-is, not
reimplemented). The model's `rationale` argument is recorded for audit; it
has zero effect on whether the tool call succeeds. Concretely:

- `create_change_package` fails (non-terminally -- the agent can course-correct) if `validate()` didn't return `ready: true`, no matter how confident the model's rationale sounds.
- `create_engineering_gap` fails unless `readyForGap: true`.
- Provisioning fields for `create_vm` still go through the same regex allowlist (`sanitizeProvisioning`) -- an absent field is asked for, a malformed one is silently dropped, never passed through.
- The canonical ServiceNow snapshot recording and identity-conflict quarantine still happen **before** the agent loop even starts -- that audit gate is not something the model can skip, delay, or reach through a tool.

## Safety mechanisms specific to the agent loop

- **Turn cap (8)**: if the model never calls a terminal tool, the loop stops and falls back to `needs_clarification`, routing to a human. No unbounded loops, no silent timeout-and-proceed.
- **Text-only nudge limit (2)**: if the model replies with prose instead of a tool call, it gets reminded twice, then the same fallback triggers.
- **Capability defaults to "not approved"**: if the agent never calls `check_capability`, `submit_analysis` treats the action as unapproved -- it fails toward "needs a gap," never toward "silently proceed."
- **Every tool call and terminal decision is logged** to `servicenow_intake_events` (no new table needed) -- this *is* the agent's audit trace, inspectable per ticket the same way the original's events already are.
- **Prompt-injection framing is stronger here, not weaker**: the system prompt tells the model ticket fields are untrusted data it must never treat as instructions -- this matters more for an agent with tool-calling power than for a one-shot classifier, since the failure mode is no longer "a bad JSON field" but "the wrong tool gets called."

## Before you point real traffic at this

1. **Verify the Lovable AI Gateway actually forwards `tools`/`tool_choice`/`tool_calls` for `google/gemini-2.5-flash`.** The gateway is OpenAI-wire-compatible for `response_format` (used by the original function) -- this assumes the same is true for function calling, but that has not been confirmed against a live call. Test this first, in isolation, before trusting anything downstream.
2. **Run it only in `mode: "demo"` from the admin console first.** No ServiceNow comment is posted in demo mode; the composed note comes back in the response for inspection.
3. **Compare outcomes against the original function on the same tickets** -- same `ready`/`readyForGap`/questions, ideally, for a batch of real historical tickets, before considering a cutover.
4. **Watch turn count and cost.** Multiple LLM calls per ticket is a real cost multiplier over the original's one call; `MAX_TURNS` in `agent-loop.ts` is a starting guess, not a tuned value.
5. **Only after 1-3 hold up** should ServiceNow's webhook be repointed at this function instead of the original -- and only then should the two be consolidated onto one shared core (right now `_shared/servicenow-intake-agent-core.ts` duplicates most of the original's logic rather than the original importing it, specifically so this rebuild carries zero risk to the live webhook while it's unproven).

## Known gaps vs. the original, left for a follow-up

- `resumeQueued` in this version does not currently write `azure_observation` back to the row (the main webhook/demo path does). Low-value, cheap to add later.
- No test coverage yet for the full agent loop (`agent-loop.ts`) itself -- `tools.test.ts` covers the tool-dispatch guardrails, which is the part that actually matters for safety, but a mocked-gateway test of multi-turn looping (including the turn-cap and text-only-nudge fallbacks) would be worth adding before cutover.
