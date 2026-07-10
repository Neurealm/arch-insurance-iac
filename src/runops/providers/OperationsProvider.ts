/**
 * OperationsProvider — the single contract every page uses to read and
 * mutate operational state. Pages MUST NOT import fixture data directly.
 *
 * Two implementations are planned:
 *   - DemoOperationsProvider      (deterministic, in-memory)
 *   - ConnectedOperationsProvider (backed by real integrations — placeholder)
 */

import { createContext, useContext } from "react";
import type {
  Approval, ApprovalId, AuditEvent, Change, Component, DigitalWorker,
  Environment, Execution, ExecutionId, Incident, IncidentId, Notification,
  Region, Runbook, RunbookId, ScenarioStage, Service, ServiceId, Tenant,
  TenantId,
} from "@/runops/domain/models";
import type { DomainEventBus } from "@/runops/domain/events";
import type { FeatureFlags } from "@/runops/domain/featureFlags";
import type { MutationResult, ProviderResponse } from "@/runops/domain/results";

/** Persistent selection context surfaced through the provider. */
export interface OperationsContext {
  tenant: Tenant;
  selectedServiceId: ServiceId;
  environment: Environment;
  region: Region;
  timeRange: "15m" | "1h" | "6h" | "24h" | "7d" | "30d";
  role: string;
}

export interface OperationsProvider {
  readonly kind: "demo" | "connected";
  readonly flags: FeatureFlags;
  readonly events: DomainEventBus;

  /* -------------------------- Reads -------------------------- */
  getContext(): OperationsContext;

  listTenants():        ProviderResponse<readonly Tenant[]>;
  getTenant(id: TenantId): ProviderResponse<Tenant>;

  listServices(tenantId: TenantId): ProviderResponse<readonly Service[]>;
  getService(id: ServiceId):        ProviderResponse<Service>;
  listComponents(serviceId: ServiceId): ProviderResponse<readonly Component[]>;

  listIncidents(tenantId: TenantId): ProviderResponse<readonly Incident[]>;
  getIncident(id: IncidentId):       ProviderResponse<Incident>;

  listRunbooks(tenantId: TenantId): ProviderResponse<readonly Runbook[]>;
  getRunbook(id: RunbookId):        ProviderResponse<Runbook>;

  getExecution(id: ExecutionId): ProviderResponse<Execution>;
  getApproval(id: ApprovalId):   ProviderResponse<Approval>;

  listChanges(tenantId: TenantId): ProviderResponse<readonly Change[]>;
  listDigitalWorkers(tenantId: TenantId): ProviderResponse<readonly DigitalWorker[]>;
  listAuditLog(tenantId: TenantId): ProviderResponse<readonly AuditEvent[]>;
  listNotifications(tenantId: TenantId): ProviderResponse<readonly Notification[]>;
  listScenarioStages(): ProviderResponse<readonly ScenarioStage[]>;

  /* -------------------------- Context mutations -------------- */
  setSelectedService(id: ServiceId): void;
  setEnvironment(env: Environment): void;
  setRegion(region: Region): void;
  setTimeRange(range: OperationsContext["timeRange"]): void;
  setRole(role: string): void;
  setTenant(id: TenantId): void;

  /* -------------------------- Domain mutations --------------- */
  approveExecution(input: { approvalId: ApprovalId; actor: string }):
    Promise<MutationResult<Approval, Execution | Incident>>;

  denyExecution(input: { approvalId: ApprovalId; actor: string; reason: string }):
    Promise<MutationResult<Approval, Execution>>;

  resolveIncident(input: { incidentId: IncidentId; actor: string }):
    Promise<MutationResult<Incident, Execution>>;

  advanceScenario(): Promise<MutationResult<ScenarioStage, ScenarioStage>>;
  resetScenario():   Promise<MutationResult<ScenarioStage, ScenarioStage>>;

  markAllNotificationsRead(): Promise<MutationResult<readonly Notification[], never>>;
}

/* --------------------------- React glue --------------------------- */

export const OperationsProviderContext = createContext<OperationsProvider | null>(null);

export function useOperationsProvider(): OperationsProvider {
  const ctx = useContext(OperationsProviderContext);
  if (!ctx) throw new Error("useOperationsProvider must be used within an OperationsProvider");
  return ctx;
}

/** Alias kept for the "useOperations" naming requested in the spec. */
export const useOperationsApi = useOperationsProvider;
