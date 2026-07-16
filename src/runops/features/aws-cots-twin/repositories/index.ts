/**
 * AWS COTS Digital Twin — repository layer.
 *
 * UI components MUST import from this file and never touch `data/seed.ts`
 * directly. The demo implementation reads from a deterministic in-memory
 * dataset; future live implementations can wrap Supabase or a server-side
 * AWS adapter behind the same interface without changing callers.
 */

import { awsCotsSeed } from "../data/seed";
import type {
  Alert,
  Application,
  AutomationAction,
  AwsAccount,
  AwsCotsDataset,
  AwsRegion,
  AwsResource,
  AwsResourceConfiguration,
  AvailabilityZone,
  BackupStatusRecord,
  BusinessService,
  Change,
  ComplianceFinding,
  CostObservation,
  Incident,
  ResourceRelationship,
  Runbook,
  SecurityFinding,
  SimulationEvent,
  SimulationScenario,
  SyntheticImpactResult,
  TelemetryDefinition,
  TelemetryObservation,
  Tenant,
} from "../types";

// ---------------------------------------------------------------------------
// Repository interface
// ---------------------------------------------------------------------------

export interface AwsCotsRepository {
  getTenant(): Promise<Tenant>;
  getBusinessService(id: string): Promise<BusinessService | null>;
  getApplication(id: string): Promise<Application | null>;
  getAwsAccounts(): Promise<AwsAccount[]>;
  getRegions(): Promise<AwsRegion[]>;
  getAvailabilityZones(): Promise<AvailabilityZone[]>;

  getResources(filter?: ResourceFilter): Promise<AwsResource[]>;
  getResourceById(id: string): Promise<AwsResource | null>;
  getResourceConfigurations(resourceId: string): Promise<AwsResourceConfiguration[]>;
  getResourceRelationships(resourceId?: string): Promise<ResourceRelationship[]>;

  getTelemetryDefinitions(): Promise<TelemetryDefinition[]>;
  getResourceTelemetry(resourceId: string): Promise<TelemetryObservation[]>;

  getAlerts(filter?: { resourceId?: string; status?: Alert["status"] }): Promise<Alert[]>;
  getIncidents(): Promise<Incident[]>;
  getChanges(): Promise<Change[]>;

  getRunbooks(filter?: { resourceType?: AwsResource["resource_type"] }): Promise<Runbook[]>;
  getAutomationActions(runbookId?: string): Promise<AutomationAction[]>;

  getSecurityFindings(resourceId?: string): Promise<SecurityFinding[]>;
  getComplianceFindings(resourceId?: string): Promise<ComplianceFinding[]>;
  getBackupStatus(resourceId?: string): Promise<BackupStatusRecord[]>;
  getCostObservations(resourceId?: string): Promise<CostObservation[]>;

  getSimulationScenarios(): Promise<SimulationScenario[]>;
  getSimulationScenario(id: string): Promise<SimulationScenario | null>;
  saveSimulationState(scenarioId: string, event: Omit<SimulationEvent, "id" | "tenant_id">): Promise<SimulationEvent>;
  resetSimulationState(scenarioId: string): Promise<void>;
  getSimulationEvents(scenarioId: string): Promise<SimulationEvent[]>;
  getSyntheticImpactResults(scenarioId: string): Promise<SyntheticImpactResult[]>;
}

export interface ResourceFilter {
  types?: AwsResource["resource_type"][];
  availabilityZone?: string;
  networkScope?: AwsResource["network_scope"];
  healthStatus?: AwsResource["health_status"];
  businessServiceId?: string;
  applicationId?: string;
}

// ---------------------------------------------------------------------------
// Demo (in-memory) implementation
// ---------------------------------------------------------------------------

class InMemoryAwsCotsRepository implements AwsCotsRepository {
  private readonly base: AwsCotsDataset;
  private readonly simulationLog = new Map<string, SimulationEvent[]>();
  private readonly syntheticByScenario = new Map<string, SyntheticImpactResult[]>();

  constructor(base: AwsCotsDataset) {
    this.base = base;
  }

  // ------------------------------ Foundation

  async getTenant() { return this.base.tenant; }
  async getBusinessService(id: string) {
    return this.base.business_services.find((s) => s.id === id) ?? null;
  }
  async getApplication(id: string) {
    return this.base.applications.find((a) => a.id === id) ?? null;
  }
  async getAwsAccounts() { return [...this.base.aws_accounts]; }
  async getRegions() { return [...this.base.aws_regions]; }
  async getAvailabilityZones() { return [...this.base.availability_zones]; }

  // ------------------------------ Resources

  async getResources(filter?: ResourceFilter): Promise<AwsResource[]> {
    let list = this.base.aws_resources;
    if (filter?.types?.length) list = list.filter((r) => filter.types!.includes(r.resource_type));
    if (filter?.availabilityZone) list = list.filter((r) => r.availability_zone === filter.availabilityZone);
    if (filter?.networkScope) list = list.filter((r) => r.network_scope === filter.networkScope);
    if (filter?.healthStatus) list = list.filter((r) => r.health_status === filter.healthStatus);
    if (filter?.businessServiceId) list = list.filter((r) => r.business_service_id === filter.businessServiceId);
    if (filter?.applicationId) list = list.filter((r) => r.application_id === filter.applicationId);
    return list.map((r) => ({ ...r }));
  }

  async getResourceById(id: string) {
    const found = this.base.aws_resources.find((r) => r.id === id);
    return found ? { ...found } : null;
  }

  async getResourceConfigurations(resourceId: string) {
    return this.base.aws_resource_configurations.filter((c) => c.resource_id === resourceId).map((c) => ({ ...c }));
  }

  async getResourceRelationships(resourceId?: string) {
    if (!resourceId) return this.base.resource_relationships.map((r) => ({ ...r }));
    return this.base.resource_relationships
      .filter((r) => r.source_resource_id === resourceId || r.target_resource_id === resourceId)
      .map((r) => ({ ...r }));
  }

  // ------------------------------ Telemetry

  async getTelemetryDefinitions() { return this.base.telemetry_definitions.map((d) => ({ ...d })); }
  async getResourceTelemetry(resourceId: string) {
    return this.base.telemetry_observations.filter((o) => o.resource_id === resourceId).map((o) => ({ ...o }));
  }

  // ------------------------------ Alerts / Incidents / Changes

  async getAlerts(filter?: { resourceId?: string; status?: Alert["status"] }) {
    let list = this.base.alerts;
    if (filter?.resourceId) list = list.filter((a) => a.resource_id === filter.resourceId);
    if (filter?.status) list = list.filter((a) => a.status === filter.status);
    return list.map((a) => ({ ...a }));
  }
  async getIncidents() { return this.base.incidents.map((i) => ({ ...i })); }
  async getChanges() { return this.base.changes.map((c) => ({ ...c })); }

  // ------------------------------ Runbooks / Automation

  async getRunbooks(filter?: { resourceType?: AwsResource["resource_type"] }) {
    let list = this.base.runbooks;
    if (filter?.resourceType) {
      list = list.filter((r) => r.applicable_resource_types.includes(filter.resourceType!));
    }
    return list.map((r) => ({ ...r }));
  }
  async getAutomationActions(runbookId?: string) {
    let list = this.base.automation_actions;
    if (runbookId) list = list.filter((a) => a.runbook_id === runbookId);
    return list.map((a) => ({ ...a }));
  }

  // ------------------------------ Security / Compliance / Backup / Cost

  async getSecurityFindings(resourceId?: string) {
    return this.base.security_findings
      .filter((f) => !resourceId || f.resource_id === resourceId)
      .map((f) => ({ ...f }));
  }
  async getComplianceFindings(resourceId?: string) {
    return this.base.compliance_findings
      .filter((f) => !resourceId || f.resource_id === resourceId)
      .map((f) => ({ ...f }));
  }
  async getBackupStatus(resourceId?: string) {
    return this.base.backup_status_records
      .filter((b) => !resourceId || b.resource_id === resourceId)
      .map((b) => ({ ...b }));
  }
  async getCostObservations(resourceId?: string) {
    return this.base.cost_observations
      .filter((c) => !resourceId || c.resource_id === resourceId)
      .map((c) => ({ ...c }));
  }

  // ------------------------------ Simulation

  async getSimulationScenarios() { return this.base.simulation_scenarios.map((s) => ({ ...s })); }
  async getSimulationScenario(id: string) {
    return this.base.simulation_scenarios.find((s) => s.id === id) ?? null;
  }
  async saveSimulationState(scenarioId: string, event: Omit<SimulationEvent, "id" | "tenant_id">) {
    const full: SimulationEvent = {
      ...event,
      id: `sim-evt.${scenarioId}.${(this.simulationLog.get(scenarioId)?.length ?? 0) + 1}`,
      tenant_id: this.base.tenant.id,
      scenario_id: scenarioId,
    };
    const list = this.simulationLog.get(scenarioId) ?? [];
    list.push(full);
    this.simulationLog.set(scenarioId, list);
    return full;
  }
  async resetSimulationState(scenarioId: string) {
    this.simulationLog.delete(scenarioId);
    this.syntheticByScenario.delete(scenarioId);
  }
  async getSimulationEvents(scenarioId: string) {
    return [...(this.simulationLog.get(scenarioId) ?? [])];
  }
  async getSyntheticImpactResults(scenarioId: string) {
    return [...(this.syntheticByScenario.get(scenarioId) ?? [])];
  }
}

// ---------------------------------------------------------------------------
// Singleton accessor
// ---------------------------------------------------------------------------

let repo: AwsCotsRepository | null = null;

/** Returns the active AWS COTS repository. Demo mode by default. */
export function getAwsCotsRepository(): AwsCotsRepository {
  if (!repo) repo = new InMemoryAwsCotsRepository(awsCotsSeed);
  return repo;
}

/** Swap in an alternate implementation (Supabase, live adapter) at runtime. */
export function setAwsCotsRepository(next: AwsCotsRepository): void {
  repo = next;
}

// ---------------------------------------------------------------------------
// Convenience wrappers matching the interface names required by Prompt 1
// ---------------------------------------------------------------------------

export const getBusinessService  = (id: string) => getAwsCotsRepository().getBusinessService(id);
export const getApplication      = (id: string) => getAwsCotsRepository().getApplication(id);
export const getResources        = (f?: ResourceFilter) => getAwsCotsRepository().getResources(f);
export const getResourceById     = (id: string) => getAwsCotsRepository().getResourceById(id);
export const getResourceRelationships = (id?: string) => getAwsCotsRepository().getResourceRelationships(id);
export const getResourceTelemetry = (id: string) => getAwsCotsRepository().getResourceTelemetry(id);
export const getAlerts           = (f?: Parameters<AwsCotsRepository["getAlerts"]>[0]) => getAwsCotsRepository().getAlerts(f);
export const getRunbooks         = (f?: Parameters<AwsCotsRepository["getRunbooks"]>[0]) => getAwsCotsRepository().getRunbooks(f);
export const getIncidents        = () => getAwsCotsRepository().getIncidents();
export const getChanges          = () => getAwsCotsRepository().getChanges();
export const getSecurityFindings = (id?: string) => getAwsCotsRepository().getSecurityFindings(id);
export const getCostObservations = (id?: string) => getAwsCotsRepository().getCostObservations(id);
export const getSimulationScenario = (id: string) => getAwsCotsRepository().getSimulationScenario(id);
export const saveSimulationState   = (id: string, e: Omit<SimulationEvent, "id" | "tenant_id">) => getAwsCotsRepository().saveSimulationState(id, e);
export const resetSimulationState  = (id: string) => getAwsCotsRepository().resetSimulationState(id);
