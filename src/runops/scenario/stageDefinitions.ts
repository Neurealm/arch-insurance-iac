// Deterministic per-stage descriptors for the canonical Global Order Processing
// demo scenario. No random timers, no random outcomes. Every entry lists the
// domain objects the transition touches so the DemoController drawer can
// display an accurate impact preview.

import { scenarioStages } from "@/runops/data/scenario";

export interface StageDescriptor {
  index: number;
  label: string;
  description: string;
  objectsAffected: readonly string[];
}

export const stageDescriptors: readonly StageDescriptor[] = [
  {
    index: 0,
    label: scenarioStages[0].label,
    description: "All services healthy. SLOs green. No active incidents.",
    objectsAffected: ["Service health", "Telemetry baseline", "Command center KPIs"],
  },
  {
    index: 1,
    label: scenarioStages[1].label,
    description: "Checkout p95 latency begins rising after CHG-20391.",
    objectsAffected: ["Service health", "Telemetry", "Component: Checkout API", "Component: SQL Primary"],
  },
  {
    index: 2,
    label: scenarioStages[2].label,
    description: "Fast-burn SLO alert opens for Global Order Processing.",
    objectsAffected: ["SLO burn", "Error budget", "Alerts", "Notifications"],
  },
  {
    index: 3,
    label: scenarioStages[3].label,
    description: "Related alerts group into a single operational situation.",
    objectsAffected: ["Alerts", "Operations queue", "Command center metrics"],
  },
  {
    index: 4,
    label: scenarioStages[4].label,
    description: "SEV 1 INC-10482 declared. Incident roles assigned.",
    objectsAffected: ["Incident", "Incident timeline", "Operations tasks", "Digital workers", "Notifications"],
  },
  {
    index: 5,
    label: scenarioStages[5].label,
    description: "Digital workers begin parallel investigations.",
    objectsAffected: ["Digital workers", "Hypotheses", "Incident timeline"],
  },
  {
    index: 6,
    label: scenarioStages[6].label,
    description: "Database hypothesis reaches high confidence.",
    objectsAffected: ["Hypotheses", "AI recommendation"],
  },
  {
    index: 7,
    label: scenarioStages[7].label,
    description: "Remediation options compared with impact and confidence.",
    objectsAffected: ["Remediation options", "AI recommendation"],
  },
  {
    index: 8,
    label: scenarioStages[8].label,
    description: "Runbook RB-0042 execution EXE-8841 requested.",
    objectsAffected: ["Execution", "Runbook usage", "Operations queue"],
  },
  {
    index: 9,
    label: scenarioStages[9].label,
    description: "Approval APR-4471 pending; execution paused.",
    objectsAffected: ["Approval", "Execution", "Notifications", "Operations queue"],
  },
  {
    index: 10,
    label: scenarioStages[10].label,
    description: "Approval granted; execution running.",
    objectsAffected: ["Approval", "Execution", "Audit log", "Worker session", "Incident timeline"],
  },
  {
    index: 11,
    label: scenarioStages[11].label,
    description: "Initial validation partially fails; corrective branch armed.",
    objectsAffected: ["Execution", "Step execution", "Validation"],
  },
  {
    index: 12,
    label: scenarioStages[12].label,
    description: "Corrective branch executes; connection pool cap raised.",
    objectsAffected: ["Execution", "Step execution", "Component: SQL Primary"],
  },
  {
    index: 13,
    label: scenarioStages[13].label,
    description: "Telemetry recovers; SQL saturation drops.",
    objectsAffected: ["Service health", "Telemetry", "SLO", "Error budget"],
  },
  {
    index: 14,
    label: scenarioStages[14].label,
    description: "Synthetic checkout journey passes end-to-end.",
    objectsAffected: ["Customer journey health", "Execution validation"],
  },
  {
    index: 15,
    label: scenarioStages[15].label,
    description: "Incident INC-10482 resolved; execution completed.",
    objectsAffected: ["Incident", "Execution", "SLO status", "Command center metrics", "Notifications"],
  },
  {
    index: 16,
    label: scenarioStages[16].label,
    description: "Postmortem PM-10482 opened.",
    objectsAffected: ["Postmortem", "Problem", "Known error"],
  },
  {
    index: 17,
    label: scenarioStages[17].label,
    description: "Runbook improvement proposal drafted.",
    objectsAffected: ["Runbook improvement", "Corrective actions", "Knowledge item"],
  },
  {
    index: 18,
    label: scenarioStages[18].label,
    description: "RB-0042 v3.3 certified and published.",
    objectsAffected: ["Runbook version", "Certification", "Knowledge item"],
  },
];

export const failureInjectionKinds = [
  "validation_failure",
  "connector_unavailable",
  "low_confidence_recommendation",
  "policy_violation",
  "approval_denied",
  "rollback_required",
  "runner_failure",
  "stale_telemetry",
] as const;

export type FailureInjectionKind = typeof failureInjectionKinds[number];

export const failureInjectionLabels: Record<FailureInjectionKind, string> = {
  validation_failure: "Validation failure",
  connector_unavailable: "Connector unavailable",
  low_confidence_recommendation: "Low confidence recommendation",
  policy_violation: "Policy violation",
  approval_denied: "Approval denied",
  rollback_required: "Rollback required",
  runner_failure: "Runner failure",
  stale_telemetry: "Stale telemetry",
};
