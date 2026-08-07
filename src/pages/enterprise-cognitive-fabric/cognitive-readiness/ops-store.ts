/**
 * Cognitive Readiness Assessment — Prompt 2 operational store.
 *
 * Local, deterministic state for remediation, clarification, evidence, review,
 * exception, override, reassessment, versioning, routing, activity and
 * notifications. No backend calls.
 */

import { useCallback, useMemo, useState } from "react";
import type { ReadinessComputation } from "./engine";
import {
  activityEntry, buildHandoffPackage, createVersion, expireExceptions, initialOpsState,
  notification, remediationSummary, simulateClarificationResponse,
  type OpsState,
} from "./ops-engine";
import type {
  CognitiveReadinessAddedEvidence, CognitiveReadinessClarification,
  CognitiveReadinessEvidenceRequest, CognitiveReadinessException, CognitiveReadinessOverride,
  CognitiveReadinessRemediation, Severity,
} from "./ops-data";
import { isProtectedOverride } from "./ops-engine";

export interface OpsApi {
  state: OpsState;
  summary: ReturnType<typeof remediationSummary>;
  /* remediation */
  updateRemediation: (id: string, patch: Partial<CognitiveReadinessRemediation>, entry?: string) => void;
  resolveRemediation: (id: string, entry: string) => void;
  /* clarification */
  requestClarification: (c: Omit<CognitiveReadinessClarification, "id" | "status">) => string;
  answerClarification: (id: string) => { response: string; effect: string; patch: Record<string, unknown> };
  /* evidence */
  requestEvidence: (r: Omit<CognitiveReadinessEvidenceRequest, "id" | "status">) => void;
  addEvidence: (e: Omit<CognitiveReadinessAddedEvidence, "id" | "addedAt">) => void;
  /* dependency + persona + condition + policy */
  setDependency: (name: string, status: string, confidence?: number) => void;
  setPersonaScope: (persona: string, patch: { included?: boolean; primary?: boolean }) => void;
  addPersona: (persona: string) => void;
  setCondition: (condition: string, status: string) => void;
  bindPolicy: (variable: string, value: string) => void;
  /* assumptions / constraints / ambiguity / contradiction */
  setAssumption: (id: string, status: string) => void;
  acceptAssumption: (id: string) => void;
  setConstraint: (id: string, status: string) => void;
  resolveAmbiguity: (id: string, status: string, interpretation: string, confidence: string) => void;
  resolveContradiction: (id: string, choice: string, value: string, reason: string) => void;
  acceptUncertainty: (label: string) => void;
  /* review / exception / override */
  updateReview: (id: string, patch: { status?: string; decision?: string; comments?: string; reviewer?: string; severity?: Severity }) => void;
  requestException: (e: Omit<CognitiveReadinessException, "id" | "status">) => void;
  approveException: (id: string) => void;
  requestOverride: (o: Omit<CognitiveReadinessOverride, "id" | "status">) => { blocked: boolean; reason?: string };
  approveOverride: (id: string) => void;
  /* lifecycle */
  reassess: (scope: string, reason: string, computation: ReadinessComputation) => void;
  route: (computation: ReadinessComputation) => void;
  setHistoricalViolations: (n: number) => void;
  setOperationalState: (s: OpsState["operationalState"]) => void;
  applyScenario: (scenario: string, patch?: Partial<OpsState>) => void;
  /* notifications */
  markRead: (id: string) => void;
  markAllRead: () => void;
  acknowledge: (id: string) => void;
  assignNotification: (id: string, assignee: string) => void;
  log: (category: string, entry: string) => void;
  notify: (category: string, title: string, detail: string, severity?: Severity) => void;
  reset: () => void;
}

export function useReadinessOps(announce: (m: string) => void): OpsApi {
  const [state, setState] = useState<OpsState>(initialOpsState);
  const patch = useCallback((fn: (s: OpsState) => OpsState) => setState((s) => fn(s)), []);

  const log = useCallback((category: string, entry: string) => {
    patch((s) => ({ ...s, activity: [activityEntry(category, entry), ...s.activity].slice(0, 60) }));
  }, [patch]);

  const notify = useCallback((category: string, title: string, detail: string, severity: Severity = "Medium") => {
    patch((s) => ({ ...s, notifications: [notification(category, title, detail, severity), ...s.notifications].slice(0, 60) }));
  }, [patch]);

  const both = useCallback((category: string, entry: string, detail: string, severity: Severity = "Medium") => {
    patch((s) => ({
      ...s,
      activity: [activityEntry(category, entry), ...s.activity].slice(0, 60),
      notifications: [notification(category, entry, detail, severity), ...s.notifications].slice(0, 60),
    }));
    announce(entry);
  }, [patch, announce]);

  const api = useMemo<OpsApi>(() => ({
    state,
    summary: remediationSummary(state.remediations),

    updateRemediation: (id, p, entry) => {
      patch((s) => ({
        ...s,
        remediations: s.remediations.map((r) => r.id === id
          ? { ...r, ...p, history: entry ? [{ at: new Date().toLocaleTimeString(), entry }, ...r.history] : r.history }
          : r),
      }));
      if (entry) both("Readiness Changed", `${id} · ${entry}`, entry);
    },

    resolveRemediation: (id, entry) => {
      patch((s) => ({
        ...s,
        remediations: s.remediations.map((r) => r.id === id
          ? { ...r, status: "Resolved", blocking: false, history: [{ at: new Date().toLocaleTimeString(), entry }, ...r.history] }
          : r),
      }));
      both("Readiness Changed", `${id} resolved`, entry, "Low");
    },

    requestClarification: (c) => {
      const id = `CLR ${8200 + state.clarifications.length + 1}`;
      patch((s) => ({
        ...s,
        clarifications: [{ ...c, id, status: "Requested" }, ...s.clarifications],
        remediations: c.remediationId
          ? s.remediations.map((r) => r.id === c.remediationId ? { ...r, status: "Clarification Requested" } : r)
          : s.remediations,
      }));
      both("Clarification Requested", `Clarification ${id} requested from ${c.assignedTo}`, c.question, "High");
      return id;
    },

    answerClarification: (id) => {
      const c = state.clarifications.find((x) => x.id === id);
      const outcome = simulateClarificationResponse(c?.question ?? "");
      patch((s) => {
        let next: OpsState = {
          ...s,
          clarifications: s.clarifications.map((x) => x.id === id
            ? { ...x, status: "Answered" as const, response: outcome.response, effect: outcome.effect } : x),
        };
        if (outcome.patch.ambiguityId) {
          next = {
            ...next,
            ambiguityStates: {
              ...next.ambiguityStates,
              [outcome.patch.ambiguityId]: {
                status: "Accepted for Evaluation",
                interpretation: outcome.patch.boundedInterpretation ?? "",
                confidence: "Moderate",
              },
            },
          };
        }
        if (c?.remediationId) {
          next = { ...next, remediations: next.remediations.map((r) => r.id === c.remediationId ? { ...r, status: "Clarification Received", blocking: false } : r) };
        }
        return next;
      });
      both("Clarification Received", `Clarification ${id} answered`, outcome.effect, "Low");
      return { response: outcome.response, effect: outcome.effect, patch: outcome.patch as Record<string, unknown> };
    },

    requestEvidence: (r) => {
      const id = `EVR ${8300 + state.evidenceRequests.length + 1}`;
      patch((s) => ({ ...s, evidenceRequests: [{ ...r, id, status: "Requested" }, ...s.evidenceRequests] }));
      both("Evidence Requested", `${r.evidenceType} evidence requested from ${r.owner}`, r.description, "High");
    },

    addEvidence: (e) => {
      const id = `EVA ${8400 + state.addedEvidence.length + 1}`;
      patch((s) => ({
        ...s,
        addedEvidence: [{ ...e, id, addedAt: new Date().toISOString() }, ...s.addedEvidence],
        remediations: s.remediations.map((r) =>
          r.category === "Evidence" && e.relatedGap && r.id === e.relatedGap
            ? { ...r, status: "Resolved", blocking: false } : r),
        evidenceRequests: s.evidenceRequests.map((r) =>
          r.evidenceType === e.evidenceType ? { ...r, status: "Received" as const } : r),
      }));
      both("Evidence Added", `${e.name} attached`, `Evidence sufficiency and Persona readiness recalculated.`, "Low");
    },

    setDependency: (name, status, confidence) => {
      patch((s) => ({
        ...s,
        dependencies: { ...s.dependencies, [name]: { status, confidence: confidence ?? s.dependencies[name]?.confidence ?? 80 } },
      }));
      both("Dependency Validation Required", `${name} set to ${status}`, "Dependency readiness recalculated.", "Medium");
    },

    setPersonaScope: (persona, p) => {
      patch((s) => ({ ...s, personaScope: { ...s.personaScope, [persona]: { ...s.personaScope[persona], ...p } } }));
      both("Persona Scope Changed", `${persona} scope updated`, "Coverage and handoff package recalculated.", "Low");
    },

    addPersona: (persona) => {
      patch((s) => ({ ...s, personaScope: { ...s.personaScope, [persona]: { included: true, primary: false } } }));
      both("Persona Scope Changed", `${persona} added to candidate scope`, "Persona coverage recalculated.", "Medium");
    },

    setCondition: (condition, status) => {
      patch((s) => ({ ...s, conditions: { ...s.conditions, [condition]: status } }));
      both("Readiness Changed", `${condition} set to ${status}`, "Condition readiness recalculated.", "Low");
    },

    bindPolicy: (variable, value) => {
      patch((s) => ({
        ...s,
        policyBindings: { ...s.policyBindings, [variable]: value },
        remediations: s.remediations.map((r) => r.gapType === "Unbound Policy Variable" && r.description.includes(variable)
          ? { ...r, status: "Resolved", blocking: false } : r),
        conditions: variable === "risk.fraud.materiality"
          ? { ...s.conditions, "Fraud Loss Materiality": "Resolved" } : s.conditions,
      }));
      both("Policy Binding Required", `${variable} bound to ${value}`, "Condition readiness recalculated.", "Low");
    },

    setAssumption: (id, status) => {
      patch((s) => ({ ...s, assumptionStates: { ...s.assumptionStates, [id]: status } }));
      both("Readiness Changed", `Assumption ${id} set to ${status}`, "Assumption transparency recalculated.", "Low");
    },

    acceptAssumption: (id) => {
      patch((s) => ({
        ...s,
        assumptionStates: { ...s.assumptionStates, [id]: "Accepted for Evaluation" },
        acceptedAssumptions: s.acceptedAssumptions.includes(id) ? s.acceptedAssumptions : [...s.acceptedAssumptions, id],
      }));
      both("Assumption Accepted", `Assumption ${id} accepted for evaluation`,
        "Accepted for evaluation does not mean the assumption is true. It is carried forward as an uncertainty marker.", "Medium");
    },

    setConstraint: (id, status) => {
      patch((s) => ({ ...s, constraintStates: { ...s.constraintStates, [id]: status } }));
      both("Readiness Changed", `Constraint ${id} set to ${status}`, "Constraint transparency recalculated.", "Low");
    },

    resolveAmbiguity: (id, status, interpretation, confidence) => {
      patch((s) => ({ ...s, ambiguityStates: { ...s.ambiguityStates, [id]: { status, interpretation, confidence } } }));
      both("Readiness Changed", `Ambiguity ${id} · ${status}`,
        interpretation ? `Bounded interpretation carried downstream: ${interpretation}` : "Ambiguity state updated.", "Medium");
    },

    resolveContradiction: (id, choice, value, reason) => {
      patch((s) => ({
        ...s,
        contradictionResolutions: { ...s.contradictionResolutions, [id]: { choice, value, reason } },
        remediations: s.remediations.map((r) => r.category === "Contradiction" ? { ...r, status: "Resolved", blocking: false } : r),
      }));
      both("Contradiction Detected", `Contradiction ${id} resolved · ${choice}`,
        `${reason}. Original source records are preserved.`, "Medium");
    },

    acceptUncertainty: (label) => {
      patch((s) => ({ ...s, acceptedUncertainty: s.acceptedUncertainty.includes(label) ? s.acceptedUncertainty : [...s.acceptedUncertainty, label] }));
      both("Readiness Changed", `Nonblocking uncertainty accepted · ${label}`,
        "Carried forward as an explicit uncertainty marker.", "Medium");
    },

    updateReview: (id, p) => {
      patch((s) => ({ ...s, reviews: s.reviews.map((r) => r.id === id ? { ...r, ...p } : r) }));
      both("Readiness Changed", `${id} updated`, p.decision ?? p.status ?? "Review updated", "Low");
    },

    requestException: (e) => {
      const id = `EXC ${9100 + state.exceptions.length + 1}`;
      patch((s) => ({ ...s, exceptions: [{ ...e, id, status: "Requested" }, ...s.exceptions], operationalState: "Exception Pending" }));
      both("Exception Requested", `Exception ${id} requested`, e.reason, "High");
    },

    approveException: (id) => {
      patch((s) => ({
        ...s,
        exceptions: expireExceptions(s.exceptions.map((e) => e.id === id ? { ...e, status: "Approved" as const } : e)),
        operationalState: "Exception Approved",
      }));
      both("Exception Approved", `Exception ${id} approved`, "The exception expires and must be revisited.", "High");
    },

    requestOverride: (o) => {
      const blockedItem = o.blockingFindings.find((f) => isProtectedOverride(f));
      if (blockedItem) {
        patch((s) => ({ ...s, overrides: [{ ...o, id: `OVR ${9200 + s.overrides.length + 1}`, status: "Blocked" }, ...s.overrides] }));
        both("Override Requested", "Override blocked by protected finding",
          `${blockedItem} cannot be overridden under any governance level.`, "Critical");
        return { blocked: true, reason: blockedItem };
      }
      const id = `OVR ${9200 + state.overrides.length + 1}`;
      patch((s) => ({ ...s, overrides: [{ ...o, id, status: "Requested" }, ...s.overrides], operationalState: "Override Pending" }));
      both("Override Requested", `Override ${id} requested`, o.businessReason, "Critical");
      return { blocked: false };
    },

    approveOverride: (id) => {
      patch((s) => ({ ...s, overrides: s.overrides.map((o) => o.id === id && o.status === "Requested" ? { ...o, status: "Approved" as const } : o) }));
      both("Override Requested", `Override ${id} approved`, "Governed override recorded with expiration.", "Critical");
    },

    reassess: (scope, reason, computation) => {
      patch((s) => ({ ...s, operationalState: "Reassessment Running" }));
      patch((s) => {
        const version = createVersion(s, computation, reason || `Reassessment · ${scope}`, "Cognitive Fabric");
        return { ...s, versions: [...s.versions, version], operationalState: "Assessing" };
      });
      both("Reassessment Required", `Reassessment complete · ${scope}`,
        "A new immutable assessment version was created. Prior versions are unchanged.", "Medium");
    },

    route: (computation) => {
      patch((s) => {
        const version = createVersion(s, computation, "Handoff package routed to Persona Impact Analysis", "Cognitive Fabric");
        const pkg = buildHandoffPackage(s, computation, version.id);
        return {
          ...s,
          versions: [...s.versions, version],
          routed: true,
          routedPackageVersion: pkg.assessmentVersion,
          operationalState: "Routed to Persona Impact",
        };
      });
      both("Routed to Persona Impact", "Routed to Persona Impact Analysis",
        "A linked Persona Impact Evaluation was created and the handoff package version is preserved.", "Low");
    },

    setHistoricalViolations: (n) => {
      patch((s) => ({ ...s, historicalViolations: n, operationalState: n > 0 ? "Historical Integrity Alert" : s.operationalState }));
      if (n > 0) {
        both("Historical Integrity Alert", "Historical Context Rewrite Violations detected",
          "Readiness is Blocked, Context Integrity is Critical, and Persona Impact Handoff is disabled.", "Critical");
      } else {
        both("Historical Integrity Alert", "Historical context integrity restored", "Violations returned to zero.", "Low");
      }
    },

    setOperationalState: (os) => patch((s) => ({ ...s, operationalState: os })),

    applyScenario: (scenario, p) => {
      patch((s) => ({ ...s, scenario, ...(p ?? {}) }));
      both("Assessment Started", `Scenario applied · ${scenario}`, "All dependent panels recalculated.", "Low");
    },

    markRead: (id) => patch((s) => ({ ...s, notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
    markAllRead: () => patch((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    acknowledge: (id) => patch((s) => ({ ...s, notifications: s.notifications.map((n) => n.id === id ? { ...n, acknowledged: true, read: true } : n) })),
    assignNotification: (id, assignee) => patch((s) => ({ ...s, notifications: s.notifications.map((n) => n.id === id ? { ...n, assignee, read: true } : n) })),
    log, notify,
    reset: () => { setState(initialOpsState); announce("Demo data reset"); },
  }), [state, patch, both, log, notify, announce]);

  return api;
}
