// Deterministic Ask NOVA answer engine. Demo Mode only. Selects a canonical
// answer by keyword match against the current scenario state. No hidden
// model reasoning is exposed — only conclusion, evidence, confidence,
// uncertainty, sources, and next actions.

import type { OperationsState } from "@/runops/state/RunOpsProviders";

export interface NovaAnswer {
  question: string;
  conclusion: string;
  evidence: string[];
  confidence: number;      // 0–100
  uncertainty: string;
  sources: { label: string; route?: string }[];
  nextActions: { label: string; route?: string }[];
}

export const novaExamples: string[] = [
  "What is causing the checkout latency?",
  "What changed before the incident?",
  "Which runbook applies?",
  "What evidence supports the database hypothesis?",
  "What approval is blocking execution?",
  "Has the service recovered?",
  "What should change in the runbook?",
  "How much error budget remains?",
];

type Kind =
  | "cause" | "change" | "runbook" | "evidence" | "approval"
  | "recovered" | "improve" | "budget" | "fallback";

function classify(q: string): Kind {
  const s = q.toLowerCase();
  if (/(caus|why|driver|root)/.test(s)) return "cause";
  if (/(chang|deploy|before)/.test(s)) return "change";
  if (/(runbook|which.*apply|playbook)/.test(s)) return "runbook";
  if (/(evidence|prove|proof|support)/.test(s)) return "evidence";
  if (/(approval|approver|block)/.test(s)) return "approval";
  if (/(recover|resolved|back to normal|healthy)/.test(s)) return "recovered";
  if (/(improve|should chang|update.*runbook)/.test(s)) return "improve";
  if (/(budget|slo|burn)/.test(s)) return "budget";
  return "fallback";
}

export function askNova(question: string, ops: OperationsState): NovaAnswer {
  const kind = classify(question);
  const inc = ops.incident;
  const rb = ops.runbook;
  const svc = ops.selectedService;
  const appr = ops.approval;

  const source = (label: string, route?: string) => ({ label, route });
  const incRoute = `/runops/incidents/${inc.id}`;
  const rbRoute = `/runops/runbooks/${rb.id}`;
  const svcRoute = `/runops/services/${svc.id}`;

  switch (kind) {
    case "cause":
      return {
        question,
        conclusion:
          "Checkout latency is driven by a database query-plan regression introduced by CHG-20391. SQL primary saturated at 98% connections while application CPU remained nominal.",
        evidence: [
          "Onset 10:07 CT aligns with CHG-20391 completion 09:58 CT (9-minute plan-cache warmup).",
          "Trace analysis: database wait time dominates checkout spans.",
          "SQL primary connection utilization 98%; app pod CPU nominal.",
          "Top checkout query plan changed post-deploy (est. cost 4.7× baseline).",
        ],
        confidence: 88,
        uncertainty: "Low. Pure app-tier hypothesis not fully excluded without a canary.",
        sources: [
          source("Incident INC-10482", incRoute),
          source("Change CHG-20391", "/runops/governance#CHG-20391"),
          source("SQL primary telemetry", "/runops/services/svc-global-order-processing/observability"),
        ],
        nextActions: [
          { label: "Open approval APR-4471", route: "/runops/approvals" },
          { label: "Review remediation options", route: `${incRoute}/remediations` },
        ],
      };

    case "change":
      return {
        question,
        conclusion:
          "CHG-20391 (Order database index optimization) deployed 09:58 CT is the only production change in the 30 minutes before incident onset.",
        evidence: [
          "CHG-20391 completed 09:58 CT; incident onset 10:07 CT.",
          "No other Tier-1 changes recorded in the 30 minutes preceding onset.",
          "Change was Medium risk; no automated plan-regression gate.",
        ],
        confidence: 92,
        uncertainty: "Low. Correlation is strong; causation confirmed by query-plan diff.",
        sources: [
          source("Change CHG-20391", "/runops/governance#CHG-20391"),
          source("Change registry", "/runops/governance"),
        ],
        nextActions: [
          { label: "View change details", route: "/runops/governance#CHG-20391" },
          { label: "Open incident timeline", route: `${incRoute}/investigate` },
        ],
      };

    case "runbook":
      return {
        question,
        conclusion: `${rb.id} · ${rb.title} (${rb.version}) applies. It is ${rb.state} and rated fitness ${rb.fitnessScore}/100 for this failure mode.`,
        evidence: [
          `Runbook trigger criteria match: checkout latency + DB saturation on ${svc.name}.`,
          `Autonomy: ${rb.autonomy} — approval required before mitigation.`,
          `Certified version ${rb.version} with rehearsed rollback branch.`,
        ],
        confidence: 90,
        uncertainty: "Low. Alternative RB-0039 (SQL failover) is heavier and reserved as fallback.",
        sources: [
          source(`Runbook ${rb.id}`, rbRoute),
          source("Runbook library", "/runops/runbooks"),
        ],
        nextActions: [
          { label: "Open runbook", route: rbRoute },
          { label: "Launch runbook", route: `${rbRoute}/launch` },
        ],
      };

    case "evidence":
      return {
        question,
        conclusion:
          "Database hypothesis is supported by three independent signals: trace-level DB wait dominance, SQL primary connection saturation, and query-plan diff after CHG-20391.",
        evidence: [
          "EV-101: Checkout API traces show DB wait as dominant span contributor.",
          "EV-102: SQL primary connection utilization 98% at 10:12 CT.",
          "EV-104: Top query plan changed post-deploy (cost 4.7× baseline).",
          "EV-105: Checkout error log burst begins 10:11 CT.",
        ],
        confidence: 87,
        uncertainty: "Low. Redis and network signals remain healthy; app-tier isolated as non-causal.",
        sources: [
          source("Investigation graph", `${incRoute}/investigate`),
          source("SQL analyzer", "/runops/services/svc-global-order-processing/observability"),
        ],
        nextActions: [
          { label: "Open investigation", route: `${incRoute}/investigate` },
          { label: "Review hypotheses", route: `${incRoute}/hypotheses` },
        ],
      };

    case "approval":
      return {
        question,
        conclusion: `Approval ${appr.id} is ${appr.state}. It gates execution ${appr.executionId} of ${rb.id}.`,
        evidence: [
          `Requested by ${appr.requestedBy} at ${appr.requestedAt}.`,
          `Reason: ${appr.reason}`,
          `Autonomy policy: ${rb.autonomy} — requires human approval before execution.`,
        ],
        confidence: 100,
        uncertainty: "None. State is authoritative.",
        sources: [
          source(`Approval ${appr.id}`, "/runops/approvals"),
          source(`Execution ${appr.executionId}`, `/runops/executions/${appr.executionId}`),
        ],
        nextActions: [
          { label: "Open approvals queue", route: "/runops/approvals" },
          { label: "Open execution", route: `/runops/executions/${appr.executionId}` },
        ],
      };

    case "recovered": {
      const recovered = inc.state === "Resolved" || inc.state === "Closed";
      return {
        question,
        conclusion: recovered
          ? `${svc.name} has recovered. Incident ${inc.id} is ${inc.state}; SLIs are back within budget.`
          : `${svc.name} has not recovered. Incident ${inc.id} is ${inc.state}; SLO burn is active.`,
        evidence: [
          `Incident ${inc.id} state: ${inc.state}.`,
          `Service health: ${svc.health}.`,
          `Error budget remaining: ${svc.errorBudgetRemaining}%.`,
        ],
        confidence: recovered ? 95 : 90,
        uncertainty: recovered
          ? "Low. Monitor 30-minute observation window before closing."
          : "Low. Recovery depends on mitigation validation at step s5.",
        sources: [
          source(`Incident ${inc.id}`, incRoute),
          source(`Service ${svc.name}`, svcRoute),
        ],
        nextActions: recovered
          ? [{ label: "Open postmortem", route: `${incRoute}/postmortem` }]
          : [{ label: "Open recovery validation", route: `${incRoute}/recovery` }],
      };
    }

    case "improve":
      return {
        question,
        conclusion:
          "Add an explicit plan-regression pre-check before step s3 and pre-stage the connection-pool fallback (s6) so it can execute without a second approval.",
        evidence: [
          "Initial validation partially failed at s5 in the current execution.",
          "Corrective branch executed the pool-cap fallback successfully.",
          "Runbook fitness score 87/100 — plan-regression detection is the largest missing signal.",
        ],
        confidence: 78,
        uncertainty: "Medium. Requires runbook author + change manager review before certification.",
        sources: [
          source(`Runbook ${rb.id}`, rbRoute),
          source("Runbook fitness", "/runops/runbooks/fitness"),
        ],
        nextActions: [
          { label: "Open runbook designer", route: `${rbRoute}/designer` },
          { label: "Open runbook release", route: `${rbRoute}/release` },
        ],
      };

    case "budget":
      return {
        question,
        conclusion: `${svc.name} has ${svc.errorBudgetRemaining}% of its 28-day error budget remaining. Availability SLO ${svc.sloAvailability}% is currently at risk.`,
        evidence: [
          `Availability SLO target ${svc.sloAvailability}%; current burn accelerated by INC-${inc.id.replace(/^INC-/, "")}.`,
          `Latency SLO (p95 < ${svc.sloLatencyMs}ms) is breaching.`,
          "Error budget window: 28 days.",
        ],
        confidence: 96,
        uncertainty: "Low. Budget calculation is deterministic from SLI history.",
        sources: [source("SLO registry", "/runops/reliability/slos")],
        nextActions: [
          { label: "Open SLO detail", route: "/runops/reliability/slos" },
          { label: "Open analytics", route: "/runops/analytics" },
        ],
      };

    case "fallback":
    default:
      return {
        question,
        conclusion:
          "NOVA cannot answer that with high confidence from the current scenario context. Try one of the example questions for a grounded answer.",
        evidence: [
          `Active incident: ${inc.id} · ${inc.title}.`,
          `Selected service: ${svc.name} (${svc.health}).`,
          `Active runbook: ${rb.id} ${rb.version}.`,
        ],
        confidence: 25,
        uncertainty: "High. Question did not match a known scenario pattern.",
        sources: [source(`Incident ${inc.id}`, incRoute)],
        nextActions: [
          { label: "Try: What is causing the checkout latency?" },
          { label: "Try: Which runbook applies?" },
        ],
      };
  }
}
