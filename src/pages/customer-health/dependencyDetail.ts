// Specialised, customer-readable drawer payloads for each supporting
// dependency layer. Customer language always leads; Azure terminology is
// shown as the secondary, technical reference.

import type { DependencyDetail } from "./types";

function series(base: number, jitter: number, spikeFrom?: number, spikeTo?: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 30; i++) {
    const wave = Math.sin(i / 3.1) * jitter;
    let v = base + wave;
    if (spikeFrom !== undefined && i >= spikeFrom) {
      const t = (i - spikeFrom) / Math.max(1, 29 - spikeFrom);
      v += (spikeTo ?? base) * t;
    }
    out.push(Number(v.toFixed(1)));
  }
  return out;
}

export const dependencyDetails: Record<string, DependencyDetail> = {
  "layer-storage": {
    headline: "Storage Dependency",
    conditionLabel: "Degraded underlying dependency",
    conditionStatus: "degraded",
    impactVerdict: "NO CURRENT SERVICE IMPACT",
    impactLevel: "No impact",
    affectedDeployments: [
      { name: "Production, West US 2", note: "Reads served normally; retries absorbed by the platform", status: "degraded" },
    ],
    signals: [
      { label: "Access latency", value: "Elevated", status: "degraded" },
      { label: "Request success", value: "Normal", status: "healthy" },
      { label: "Availability", value: "Normal", status: "healthy" },
      { label: "Throttling", value: "None", status: "healthy" },
      { label: "Connectivity", value: "Healthy", status: "healthy" },
      { label: "Error rate", value: "Normal", status: "healthy" },
    ],
    interpretation:
      "One supporting storage dependency is experiencing elevated latency. Your service remains within normal operating parameters.",
    trend: {
      caption: "Storage access latency — last 60 minutes",
      unit: "ms",
      baseline: 18,
      warning: 45,
      series: series(18, 2.2, 14, 26),
    },
    related: [
      { label: "Storage Account", technical: "Azure Storage · prodwus2data01", status: "degraded", contextId: "layer-storage" },
      { label: "Network Path", technical: "VNet peering · wus2-core", status: "healthy", contextId: "layer-network" },
      { label: "Region", technical: "Azure West US 2", status: "at-risk", contextId: "layer-azure-region" },
      { label: "Azure Service Health", technical: "Advisory · Blob Storage latency", status: "degraded", contextId: "layer-azure-services" },
    ],
    response: [
      "Monitoring active",
      "Automated correlation complete",
      "Cloud provider case open",
      "No customer action required",
    ],
  },

  "layer-compute": {
    headline: "Compute Dependency",
    conditionLabel: "Healthy underlying dependency",
    conditionStatus: "healthy",
    impactVerdict: "NO CURRENT SERVICE IMPACT",
    impactLevel: "No impact",
    affectedDeployments: [
      { name: "Production, East US", note: "All capacity healthy", status: "healthy" },
      { name: "Production, West US 2", note: "All capacity healthy", status: "healthy" },
    ],
    signals: [
      { label: "Processing capacity", value: "Normal", status: "healthy" },
      { label: "Host availability", value: "Normal", status: "healthy" },
      { label: "Node restarts", value: "None", status: "healthy" },
      { label: "Scheduling delay", value: "Normal", status: "healthy" },
      { label: "Saturation", value: "Low", status: "healthy" },
      { label: "Maintenance", value: "None planned", status: "healthy" },
    ],
    interpretation:
      "The machines running your service are healthy with capacity headroom. No compute condition is reaching your users.",
    trend: {
      caption: "Compute utilisation — last 60 minutes",
      unit: "%",
      baseline: 42,
      warning: 80,
      series: series(42, 3.5),
    },
    related: [
      { label: "Host Infrastructure", technical: "Azure Virtual Machines · Dsv5", status: "healthy", contextId: "layer-compute" },
      { label: "Network Path", technical: "Load balancer · wus2-lb01", status: "healthy", contextId: "layer-network" },
      { label: "Region", technical: "Azure West US 2", status: "at-risk", contextId: "layer-azure-region" },
      { label: "Azure Service Health", technical: "No compute advisories", status: "healthy", contextId: "layer-azure-services" },
    ],
    response: [
      "Monitoring active",
      "Capacity headroom verified",
      "No provider case required",
      "No customer action required",
    ],
  },

  "layer-network": {
    headline: "Network Dependency",
    conditionLabel: "Healthy underlying dependency",
    conditionStatus: "healthy",
    impactVerdict: "NO CURRENT SERVICE IMPACT",
    impactLevel: "No impact",
    affectedDeployments: [
      { name: "Production, West US 2", note: "Connectivity healthy on all paths", status: "healthy" },
    ],
    signals: [
      { label: "Connectivity", value: "Healthy", status: "healthy" },
      { label: "Round-trip time", value: "Normal", status: "healthy" },
      { label: "Packet loss", value: "None", status: "healthy" },
      { label: "Connection errors", value: "Normal", status: "healthy" },
      { label: "Path failover", value: "Not triggered", status: "healthy" },
      { label: "DNS resolution", value: "Normal", status: "healthy" },
    ],
    interpretation:
      "Traffic between your users, your deployments and their dependencies is flowing normally on every monitored path.",
    trend: {
      caption: "Network round-trip time — last 60 minutes",
      unit: "ms",
      baseline: 12,
      warning: 35,
      series: series(12, 1.4),
    },
    related: [
      { label: "Network Path", technical: "Azure Virtual Network · wus2-core", status: "healthy", contextId: "layer-network" },
      { label: "Storage Account", technical: "Private endpoint route", status: "degraded", contextId: "layer-storage" },
      { label: "Region", technical: "Azure West US 2", status: "at-risk", contextId: "layer-azure-region" },
      { label: "Azure Service Health", technical: "No networking advisories", status: "healthy", contextId: "layer-azure-services" },
    ],
    response: [
      "Monitoring active",
      "Path health continuously probed",
      "No provider case required",
      "No customer action required",
    ],
  },

  "layer-azure-services": {
    headline: "Platform Services Dependency",
    conditionLabel: "One platform dependency degraded",
    conditionStatus: "degraded",
    impactVerdict: "NO CURRENT SERVICE IMPACT",
    impactLevel: "No impact",
    affectedDeployments: [
      { name: "Production, West US 2", note: "Blob Storage advisory absorbed by retry and caching", status: "degraded" },
    ],
    signals: [
      { label: "Dependencies healthy", value: "17 of 18", status: "degraded" },
      { label: "Identity services", value: "Normal", status: "healthy" },
      { label: "Messaging", value: "Normal", status: "healthy" },
      { label: "Key management", value: "Normal", status: "healthy" },
      { label: "Provider advisories", value: "1 open", status: "degraded" },
      { label: "Fallback coverage", value: "Active", status: "healthy" },
    ],
    interpretation:
      "One of the eighteen cloud platform services your deployments depend on is degraded. Protective patterns are holding your customer experience steady.",
    trend: {
      caption: "Platform dependency error ratio — last 60 minutes",
      unit: "%",
      baseline: 0.2,
      warning: 1.5,
      series: series(0.2, 0.06, 16, 0.4),
    },
    related: [
      { label: "Azure Service Health", technical: "Advisory · Blob Storage West US 2", status: "degraded", contextId: "layer-azure-services" },
      { label: "Storage Account", technical: "Azure Storage · prodwus2data01", status: "degraded", contextId: "layer-storage" },
      { label: "Region", technical: "Azure West US 2", status: "at-risk", contextId: "layer-azure-region" },
      { label: "Network Path", technical: "Service endpoints", status: "healthy", contextId: "layer-network" },
    ],
    response: [
      "Monitoring active",
      "Automated correlation complete",
      "Cloud provider case open",
      "No customer action required",
    ],
  },

  "layer-azure-region": {
    headline: "Region Dependency",
    conditionLabel: "Regional condition being tracked",
    conditionStatus: "at-risk",
    impactVerdict: "NO CURRENT SERVICE IMPACT",
    impactLevel: "No impact",
    affectedDeployments: [
      { name: "Production, West US 2", note: "Running in-region; failover target verified", status: "at-risk" },
      { name: "DR, Central US", note: "Standby ready, no failover initiated", status: "healthy" },
    ],
    signals: [
      { label: "Regional availability", value: "Normal", status: "healthy" },
      { label: "Provider advisories", value: "1 open", status: "degraded" },
      { label: "Capacity in region", value: "Normal", status: "healthy" },
      { label: "Failover readiness", value: "Verified", status: "healthy" },
      { label: "Cross-region traffic", value: "Normal", status: "healthy" },
      { label: "Data residency", value: "Unchanged", status: "healthy" },
    ],
    interpretation:
      "The cloud region hosting one of your deployments has an open provider advisory. Your service is serving normally and a verified failover option is standing by.",
    trend: {
      caption: "Regional service availability — last 60 minutes",
      unit: "%",
      baseline: 99.99,
      warning: 99.9,
      series: series(99.99, 0.004),
    },
    related: [
      { label: "Region", technical: "Azure West US 2", status: "at-risk", contextId: "layer-azure-region" },
      { label: "Azure Service Health", technical: "Regional advisory feed", status: "degraded", contextId: "layer-azure-services" },
      { label: "Storage Account", technical: "In-region storage services", status: "degraded", contextId: "layer-storage" },
      { label: "Network Path", technical: "Regional backbone", status: "healthy", contextId: "layer-network" },
    ],
    response: [
      "Monitoring active",
      "Failover path validated",
      "Cloud provider case open",
      "No customer action required",
    ],
  },

  "layer-service": {
    headline: "Service Layer",
    conditionLabel: "Healthy control and orchestration layer",
    conditionStatus: "healthy",
    impactVerdict: "NO CURRENT SERVICE IMPACT",
    impactLevel: "No impact",
    affectedDeployments: [
      { name: "All deployments", note: "Routing, scaling and orchestration healthy", status: "healthy" },
    ],
    signals: [
      { label: "Request success", value: "Normal", status: "healthy" },
      { label: "Response time", value: "Normal", status: "healthy" },
      { label: "Queue depth", value: "Normal", status: "healthy" },
      { label: "Scaling actions", value: "Stable", status: "healthy" },
      { label: "Configuration drift", value: "None", status: "healthy" },
      { label: "Error rate", value: "Normal", status: "healthy" },
    ],
    interpretation:
      "The layer that routes and orchestrates your workload is operating normally, and is currently absorbing the one degraded storage dependency underneath it.",
    trend: {
      caption: "Service response time — last 60 minutes",
      unit: "ms",
      baseline: 96,
      warning: 250,
      series: series(96, 6),
    },
    related: [
      { label: "Compute", technical: "Azure Virtual Machines", status: "healthy", contextId: "layer-compute" },
      { label: "Storage Account", technical: "Azure Storage", status: "degraded", contextId: "layer-storage" },
      { label: "Network Path", technical: "Azure Virtual Network", status: "healthy", contextId: "layer-network" },
      { label: "Azure Service Health", technical: "Platform advisory feed", status: "degraded", contextId: "layer-azure-services" },
    ],
    response: [
      "Monitoring active",
      "Automated correlation complete",
      "No provider case required",
      "No customer action required",
    ],
  },

  "layer-your-service": {
    headline: "Your Service",
    conditionLabel: "Operating normally",
    conditionStatus: "healthy",
    impactVerdict: "NO CURRENT SERVICE IMPACT",
    impactLevel: "No impact",
    affectedDeployments: [
      { name: "Production, East US", note: "Healthy · 99.99% availability", status: "healthy" },
      { name: "Production, West US 2", note: "Healthy · supported by a degraded storage dependency", status: "healthy" },
      { name: "DR, Central US", note: "Standby healthy", status: "healthy" },
    ],
    signals: [
      { label: "User experience", value: "Normal", status: "healthy" },
      { label: "Availability", value: "Normal", status: "healthy" },
      { label: "Request success", value: "Normal", status: "healthy" },
      { label: "Response time", value: "Normal", status: "healthy" },
      { label: "Error rate", value: "Normal", status: "healthy" },
      { label: "SLO position", value: "Within target", status: "healthy" },
    ],
    interpretation:
      "Everything your users touch is behaving normally. Supporting dependency conditions are reported separately and are not reaching your service.",
    trend: {
      caption: "Customer-observed availability — last 60 minutes",
      unit: "%",
      baseline: 99.99,
      warning: 99.9,
      series: series(99.99, 0.003),
    },
    related: [
      { label: "Service Layer", technical: "Control and orchestration", status: "healthy", contextId: "layer-service" },
      { label: "Storage Account", technical: "Azure Storage", status: "degraded", contextId: "layer-storage" },
      { label: "Network Path", technical: "Azure Virtual Network", status: "healthy", contextId: "layer-network" },
      { label: "Region", technical: "Azure West US 2", status: "at-risk", contextId: "layer-azure-region" },
    ],
    response: [
      "Monitoring active",
      "Automated correlation complete",
      "No provider case required",
      "No customer action required",
    ],
  },
};
