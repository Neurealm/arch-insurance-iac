// Deployment-specific drawer payloads. Each deployment is described first in
// customer terms (is my service available?) and only then in infrastructure
// terms (what underneath it is behaving unusually?).

import type { DeploymentDetail, DependencyTreeNode, HealthStatus, InfraLayerRef } from "./types";

function tree(
  overrides: Partial<Record<string, { status: HealthStatus; note: string }>> = {},
): DependencyTreeNode[] {
  const base: DependencyTreeNode[] = [
    { id: "t-deploy", label: "Customer Deployment", depth: 0, status: "healthy", note: "Your workload as your users reach it", contextId: "layer-your-service" },
    { id: "t-service", label: "Service Layer", depth: 1, status: "healthy", note: "Application and API surface", contextId: "layer-service" },
    { id: "t-orch", label: "Orchestration", depth: 2, status: "healthy", note: "Scheduling, scaling and placement", contextId: "layer-service" },
    { id: "t-compute", label: "Compute", depth: 3, status: "healthy", note: "Virtual machines and host fleet", contextId: "layer-compute" },
    { id: "t-storage", label: "Storage", depth: 3, status: "healthy", note: "Managed disks and blob services", contextId: "layer-storage" },
    { id: "t-network", label: "Network", depth: 3, status: "healthy", note: "Virtual network and ingress paths", contextId: "layer-network" },
    { id: "t-azure", label: "Azure Services", depth: 4, status: "healthy", note: "Platform services this deployment consumes", contextId: "layer-azure-services" },
    { id: "t-region", label: "Azure Region", depth: 5, status: "healthy", note: "Cloud provider regional condition", contextId: "layer-azure-region" },
  ];
  return base.map((n) => (overrides[n.id] ? { ...n, ...overrides[n.id]! } : n));
}

function layers(
  overrides: Partial<Record<string, { status: HealthStatus; note: string }>> = {},
): InfraLayerRef[] {
  const base: InfraLayerRef[] = [
    { label: "Compute", status: "healthy", note: "Host fleet stable, no reallocation events", contextId: "layer-compute" },
    { label: "Storage", status: "healthy", note: "Read and write latency within baseline", contextId: "layer-storage" },
    { label: "Network", status: "healthy", note: "No loss, no congestion trend", contextId: "layer-network" },
    { label: "Platform Services", status: "healthy", note: "Identity, key management and messaging nominal", contextId: "layer-azure-services" },
    { label: "Azure Region", status: "healthy", note: "No open provider communication for this region", contextId: "layer-azure-region" },
  ];
  return base.map((l) => (overrides[l.label] ? { ...l, ...overrides[l.label]! } : l));
}

export const deploymentDetails: Record<string, DeploymentDetail> = {
  "dep-east": {
    headline: "Production, East US",
    service: {
      health: "healthy", healthLabel: "Healthy",
      availability: "99.999% (24h)",
      customerImpact: "None — your service is serving all traffic normally",
      sloStatus: "Within target · 99.99%", sloStatusLevel: "healthy",
    },
    infrastructure: layers(),
    impact: {
      statement: "Your service remains available.",
      current: "None", potential: "None", functionality: "None observed",
      action: "None required", level: "NO CURRENT IMPACT",
    },
    seeing: "All customer-facing transactions in East US are completing inside the normal latency band, and no supporting infrastructure layer is reporting an abnormal condition for this deployment.",
    doing: "Continuous telemetry correlation remains active. No operational intervention is in progress because no condition warrants one.",
    tree: tree(),
  },

  "dep-west": {
    headline: "Production, West US 2",
    service: {
      health: "healthy", healthLabel: "Healthy — available",
      availability: "99.982% (24h)",
      customerImpact: "None measurable — an underlying storage advisory has not reached your users",
      sloStatus: "Within target · 99.99% monthly", sloStatusLevel: "advisory",
    },
    infrastructure: layers({
      Storage: { status: "degraded", note: "Azure Blob access latency elevated against baseline", contextId: "layer-storage" } as never,
      "Azure Region": { status: "advisory", note: "Provider advisory open for West US 2", contextId: "layer-azure-region" } as never,
    }),
    impact: {
      statement: "Your service remains available.",
      current: "None", potential: "Low", functionality: "None observed",
      action: "None required", level: "POTENTIAL IMPACT",
    },
    seeing: "Azure storage access latency is elevated relative to the normal baseline for this deployment. The condition has not resulted in measurable service degradation.",
    doing: "Telemetry has been correlated across the affected region. Operations is monitoring the condition and has initiated cloud-provider escalation.",
    tree: tree({
      "t-storage": { status: "degraded", note: "Blob read latency elevated vs. baseline" },
      "t-azure": { status: "degraded", note: "Azure Blob Storage advisory in West US 2" },
      "t-region": { status: "at-risk", note: "Provider advisory open for West US 2" },
    }),
  },

  "dep-dr": {
    headline: "DR, Central US",
    service: {
      health: "healthy", healthLabel: "Healthy — standby ready",
      availability: "100.00% (24h)",
      customerImpact: "None — standby capacity verified and ready to receive traffic",
      sloStatus: "Recovery objective met · RTO 15m", sloStatusLevel: "healthy",
    },
    infrastructure: layers(),
    impact: {
      statement: "Your service remains available.",
      current: "None", potential: "None", functionality: "None observed",
      action: "None required", level: "NO CURRENT IMPACT",
    },
    seeing: "Replication lag from the primary region stays below the recovery objective and the last failover rehearsal completed successfully within the target window.",
    doing: "Standby readiness is validated on a continuous cycle. Capacity is held in reserve so a regional failover can be executed without provisioning delay.",
    tree: tree(),
  },

  "dep-eu": {
    headline: "Production, North Europe",
    service: {
      health: "healthy", healthLabel: "Healthy",
      availability: "99.996% (24h)",
      customerImpact: "None — European traffic is served normally",
      sloStatus: "Within target · 99.99%", sloStatusLevel: "healthy",
    },
    infrastructure: layers(),
    impact: {
      statement: "Your service remains available.",
      current: "None", potential: "None", functionality: "None observed",
      action: "None required", level: "NO CURRENT IMPACT",
    },
    seeing: "Regional request success rate and latency are steady, with no supporting dependency reporting a condition against this deployment.",
    doing: "Standard monitoring only. No escalation is open with the cloud provider for this region.",
    tree: tree(),
  },

  "dep-stg": {
    headline: "Staging, East US",
    service: {
      health: "healthy", healthLabel: "Healthy — non-production",
      availability: "99.940% (24h)",
      customerImpact: "None — this environment does not serve customer traffic",
      sloStatus: "Not covered by a customer SLO", sloStatusLevel: "info",
    },
    infrastructure: layers(),
    impact: {
      statement: "Your service remains available.",
      current: "None", potential: "None", functionality: "None observed",
      action: "None required", level: "NO CURRENT IMPACT",
    },
    seeing: "Pre-production validation workloads are running normally. Availability targets here are deliberately lower because the environment absorbs deployment testing.",
    doing: "Change validation continues ahead of production promotion. No customer-facing action is associated with this environment.",
    tree: tree(),
  },
};
