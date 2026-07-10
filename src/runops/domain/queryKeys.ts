/**
 * Typed query keys for cache-oriented data access.
 * String tuples — safe to use with any client-side cache library.
 */

import type {
  ApprovalId, ExecutionId, IncidentId, PostmortemId, ProblemId,
  RunbookId, RunbookVersionId, ServiceId, TenantId,
} from "@/runops/domain/models";

export const queryKeys = {
  all: () => ["runops"] as const,

  tenants:  () => ["runops", "tenants"] as const,
  tenant:   (id: TenantId) => ["runops", "tenant", id] as const,

  services: (tenantId: TenantId) => ["runops", "services", tenantId] as const,
  service:  (id: ServiceId) => ["runops", "service", id] as const,
  serviceHealth: (id: ServiceId) => ["runops", "service", id, "health"] as const,
  serviceSlos:   (id: ServiceId) => ["runops", "service", id, "slos"] as const,
  serviceTelemetry: (id: ServiceId, window: string) =>
    ["runops", "service", id, "telemetry", window] as const,

  incidents:      (tenantId: TenantId) => ["runops", "incidents", tenantId] as const,
  incident:       (id: IncidentId) => ["runops", "incident", id] as const,
  incidentTimeline: (id: IncidentId) => ["runops", "incident", id, "timeline"] as const,

  runbooks:       (tenantId: TenantId) => ["runops", "runbooks", tenantId] as const,
  runbook:        (id: RunbookId) => ["runops", "runbook", id] as const,
  runbookVersion: (id: RunbookVersionId) => ["runops", "runbookVersion", id] as const,

  executions:  (tenantId: TenantId) => ["runops", "executions", tenantId] as const,
  execution:   (id: ExecutionId) => ["runops", "execution", id] as const,

  approvals: (tenantId: TenantId) => ["runops", "approvals", tenantId] as const,
  approval:  (id: ApprovalId) => ["runops", "approval", id] as const,

  problems: (tenantId: TenantId) => ["runops", "problems", tenantId] as const,
  problem:  (id: ProblemId) => ["runops", "problem", id] as const,

  postmortem: (id: PostmortemId) => ["runops", "postmortem", id] as const,

  digitalWorkers: (tenantId: TenantId) => ["runops", "digitalWorkers", tenantId] as const,
  auditLog:       (tenantId: TenantId) => ["runops", "auditLog", tenantId] as const,
  notifications:  (tenantId: TenantId) => ["runops", "notifications", tenantId] as const,
  featureFlags:   () => ["runops", "featureFlags"] as const,
} as const;

export type QueryKey = ReturnType<
  typeof queryKeys[keyof typeof queryKeys] extends (...args: never[]) => infer R ? never : never
> | readonly (string | number)[];
