// Region-level detail. Every region carries TWO independent states:
// the Azure / provider infrastructure condition, and the customer's own
// service health in that region. A degraded region does not imply a
// degraded customer service unless telemetry shows customer impact.

import type { RegionDetail } from "./types";

export const regionDetails: Record<string, RegionDetail> = {
  "region-east": {
    headline: "East US",
    hasDeployment: true,
    infrastructure: { status: "healthy", label: "Healthy", note: "All Azure services reporting healthy in East US." },
    service: { status: "healthy", label: "Healthy", note: "Your service is operating normally in this region." },
    footprint: ["1 production deployment", "1 non-production deployment", "16 nodes / 84 resources", "No active advisories"],
    whatsHappening: "East US is healthy and carries the largest share of your traffic. No provider advisories are open for this region.",
    affectsMe: { verdict: "NO CURRENT IMPACT", explanation: "No regional condition is reaching your users here." },
    dependencies: [
      { label: "Compute", status: "healthy", note: "Virtual machine scale sets nominal", contextId: "layer-compute" },
      { label: "Storage", status: "healthy", note: "Blob and disk services nominal", contextId: "layer-storage" },
      { label: "Network", status: "healthy", note: "Ingress and peering nominal", contextId: "layer-network" },
      { label: "Identity", status: "healthy", note: "Microsoft Entra ID sign-ins nominal", contextId: "layer-identity" },
      { label: "Control Plane", status: "healthy", note: "Resource management nominal", contextId: "layer-control-plane" },
    ],
    regionalSignals: [
      { label: "Azure service advisories", value: "None open", status: "healthy" },
      { label: "Capacity conditions", value: "Normal", status: "healthy" },
      { label: "Maintenance", value: "None scheduled (7d)", status: "healthy" },
      { label: "Network conditions", value: "Normal", status: "healthy" },
      { label: "Resource provisioning", value: "Normal", status: "healthy" },
    ],
    risk: { current: "None", potential: "None", trend: "Stable", trendStatus: "healthy" },
    response: ["Routine monitoring active", "Synthetic checks every 60 seconds", "Next assessment in 5 minutes"],
  },

  "region-west": {
    headline: "West US 2",
    hasDeployment: true,
    infrastructure: { status: "degraded", label: "Degraded", note: "Azure storage latency elevated in this region; provider advisory open." },
    service: { status: "healthy", label: "Healthy", note: "Your service is serving traffic normally despite the underlying condition." },
    footprint: ["1 production deployment", "8 nodes / 46 resources", "1 active advisory"],
    whatsHappening: "Elevated latency has been detected in an Azure storage service used by your deployment. The provider has published an advisory for the region.",
    affectsMe: { verdict: "NO CURRENT IMPACT", explanation: "Not currently. Your service is absorbing the slower storage path without user-visible errors." },
    dependencies: [
      { label: "Compute", status: "healthy", note: "Nodes healthy, no restarts", contextId: "layer-compute" },
      { label: "Storage", status: "degraded", note: "Write latency p95 elevated to 612 ms", contextId: "layer-storage" },
      { label: "Network", status: "healthy", note: "Paths healthy, no packet loss", contextId: "layer-network" },
      { label: "Identity", status: "healthy", note: "Sign-ins nominal", contextId: "layer-identity" },
      { label: "Control Plane", status: "healthy", note: "Resource management nominal", contextId: "layer-control-plane" },
    ],
    regionalSignals: [
      { label: "Azure service advisories", value: "1 open (AZ-80456)", status: "advisory" },
      { label: "Capacity conditions", value: "Normal", status: "healthy" },
      { label: "Maintenance", value: "None during the advisory", status: "healthy" },
      { label: "Network conditions", value: "Normal", status: "healthy" },
      { label: "Resource provisioning", value: "Slower than normal", status: "advisory" },
    ],
    risk: { current: "None", potential: "Low", trend: "Stable", trendStatus: "healthy" },
    response: ["Monitoring active", "Provider escalation active (case AZ-80456)", "Automatic regional shift armed", "Next assessment in 5 minutes"],
  },

  "region-central": {
    headline: "Central US",
    hasDeployment: true,
    infrastructure: { status: "healthy", label: "Healthy", note: "All Azure services healthy in Central US." },
    service: { status: "healthy", label: "Healthy", note: "Your disaster recovery environment is healthy and pre-warmed." },
    footprint: ["1 DR deployment", "6 nodes / 28 resources", "No active advisories"],
    whatsHappening: "Central US hosts your warm standby environment. It is healthy and has been pre-warmed while the West US 2 advisory is open.",
    affectsMe: { verdict: "NO CURRENT IMPACT", explanation: "Not currently. Standby capacity is ready if traffic needs to shift." },
    dependencies: [
      { label: "Compute", status: "healthy", note: "Standby nodes warm", contextId: "layer-compute" },
      { label: "Storage", status: "healthy", note: "Replication lag 1.8 s", contextId: "layer-storage" },
      { label: "Network", status: "healthy", note: "Inter-region path 58 ms", contextId: "layer-network" },
      { label: "Identity", status: "healthy", note: "Sign-ins nominal", contextId: "layer-identity" },
      { label: "Control Plane", status: "healthy", note: "Resource management nominal", contextId: "layer-control-plane" },
    ],
    regionalSignals: [
      { label: "Azure service advisories", value: "None open", status: "healthy" },
      { label: "Capacity conditions", value: "Reserved capacity confirmed", status: "healthy" },
      { label: "Maintenance", value: "None scheduled (7d)", status: "healthy" },
      { label: "Network conditions", value: "Normal", status: "healthy" },
      { label: "Resource provisioning", value: "Normal", status: "healthy" },
    ],
    risk: { current: "None", potential: "None", trend: "Stable", trendStatus: "healthy" },
    response: ["DR readiness checks every 5 minutes", "Standby pre-warmed", "Next assessment in 5 minutes"],
  },

  "region-eu": {
    headline: "North Europe",
    hasDeployment: true,
    infrastructure: { status: "healthy", label: "Healthy", note: "All Azure services healthy in North Europe." },
    service: { status: "healthy", label: "Healthy", note: "Your European production service is operating normally." },
    footprint: ["1 production deployment", "9 nodes / 52 resources", "No active advisories"],
    whatsHappening: "North Europe is healthy and serving your European users with data residency maintained in-region.",
    affectsMe: { verdict: "NO CURRENT IMPACT", explanation: "No regional condition is reaching your users here." },
    dependencies: [
      { label: "Compute", status: "healthy", note: "Nodes healthy", contextId: "layer-compute" },
      { label: "Storage", status: "healthy", note: "Storage services nominal", contextId: "layer-storage" },
      { label: "Network", status: "healthy", note: "EU ingress nominal", contextId: "layer-network" },
      { label: "Identity", status: "healthy", note: "Sign-ins nominal", contextId: "layer-identity" },
      { label: "Control Plane", status: "healthy", note: "Resource management nominal", contextId: "layer-control-plane" },
    ],
    regionalSignals: [
      { label: "Azure service advisories", value: "None open", status: "healthy" },
      { label: "Capacity conditions", value: "Normal", status: "healthy" },
      { label: "Maintenance", value: "Certificate rotation Jun 7", status: "info" },
      { label: "Network conditions", value: "Normal", status: "healthy" },
      { label: "Resource provisioning", value: "Normal", status: "healthy" },
    ],
    risk: { current: "None", potential: "Low", trend: "Stable", trendStatus: "healthy" },
    response: ["Routine monitoring active", "Maintenance change staged with automatic rollback", "Next assessment in 5 minutes"],
  },

  "region-sea": {
    headline: "Southeast Asia",
    hasDeployment: false,
    infrastructure: { status: "healthy", label: "Healthy", note: "Azure services healthy in Southeast Asia." },
    service: { status: "healthy", label: "Not applicable", note: "No customer deployment in this region." },
    footprint: ["No customer deployment in this region", "Edge read traffic only (cached responses)"],
    whatsHappening: "You have no deployments in this region. Regional conditions are shown so you can inspect them, but they cannot reach your service directly.",
    affectsMe: { verdict: "NO CURRENT IMPACT", explanation: "You run nothing here. Only cached edge reads are served nearby." },
    dependencies: [
      { label: "Compute", status: "healthy", note: "No customer footprint" },
      { label: "Storage", status: "healthy", note: "No customer footprint" },
      { label: "Network", status: "healthy", note: "Edge points of presence healthy" },
      { label: "Identity", status: "healthy", note: "Global service, healthy" },
      { label: "Control Plane", status: "healthy", note: "No customer footprint" },
    ],
    regionalSignals: [
      { label: "Azure service advisories", value: "None open", status: "healthy" },
      { label: "Capacity conditions", value: "Normal", status: "healthy" },
      { label: "Maintenance", value: "None scheduled (7d)", status: "healthy" },
      { label: "Network conditions", value: "Edge cache hit rate 94%", status: "healthy" },
      { label: "Resource provisioning", value: "Normal", status: "healthy" },
    ],
    risk: { current: "None", potential: "None", trend: "Stable", trendStatus: "healthy" },
    response: ["Edge health monitoring", "No customer action possible or required", "Next assessment in 5 minutes"],
  },

  "region-uk": {
    headline: "UK South",
    hasDeployment: false,
    infrastructure: { status: "advisory", label: "Advisory", note: "Provider advisory open for resource provisioning delays." },
    service: { status: "healthy", label: "Not applicable", note: "No customer deployment in this region." },
    footprint: ["No customer deployment in this region"],
    whatsHappening: "Azure has published an advisory for slower resource provisioning in UK South. You have no footprint in this region, so it cannot affect your service.",
    affectsMe: { verdict: "NO CURRENT IMPACT", explanation: "Not applicable — you run nothing in this region." },
    dependencies: [
      { label: "Compute", status: "healthy", note: "No customer footprint" },
      { label: "Storage", status: "healthy", note: "No customer footprint" },
      { label: "Network", status: "healthy", note: "No customer footprint" },
      { label: "Identity", status: "healthy", note: "Global service, healthy" },
      { label: "Control Plane", status: "advisory", note: "Provisioning slower than normal" },
    ],
    regionalSignals: [
      { label: "Azure service advisories", value: "1 open", status: "advisory" },
      { label: "Capacity conditions", value: "Constrained (selected SKUs)", status: "advisory" },
      { label: "Maintenance", value: "None scheduled (7d)", status: "healthy" },
      { label: "Network conditions", value: "Normal", status: "healthy" },
      { label: "Resource provisioning", value: "Delayed", status: "advisory" },
    ],
    risk: { current: "None", potential: "None", trend: "Stable", trendStatus: "healthy" },
    response: ["Tracked for expansion planning only", "No customer action required", "Next assessment in 5 minutes"],
  },
};
