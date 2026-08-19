// Event classification, customer-impact-first ranking, and specialised
// drawer payloads for each event. Prominence is driven by customer impact,
// not by raw infrastructure severity.

import type { EventDetail, EventRanking, ServiceEvent } from "./types";

/**
 * Ranking score. Weights, highest first:
 * actual customer impact > potential customer impact > deployments exposed >
 * duration > infrastructure severity.
 */
export function eventRank(e: ServiceEvent): number {
  const r: EventRanking = e.ranking ?? {
    actualImpact: 0, potentialImpact: 0, exposedDeployments: 0,
    durationMinutes: 0, infrastructureSeverity: 0,
  };
  const durationScore = Math.min(3, r.durationMinutes / 120);
  return (
    r.actualImpact * 1000 +
    r.potentialImpact * 200 +
    Math.min(r.exposedDeployments, 10) * 40 +
    durationScore * 10 +
    r.infrastructureSeverity * 2 +
    (e.active === false ? -5000 : 0)
  );
}

export const classificationStyles: Record<string, { chip: string; label: string; blurb: string }> = {
  Information: {
    chip: "border-slate-300 bg-slate-100 text-slate-600",
    label: "INFORMATION",
    blurb: "Something worth knowing. No impact to your service.",
  },
  Advisory: {
    chip: "border-amber-400/60 bg-amber-50 text-amber-700",
    label: "ADVISORY",
    blurb: "An underlying condition we are managing. Your service is unaffected.",
  },
  Degradation: {
    chip: "border-orange-400/70 bg-orange-50 text-orange-700",
    label: "DEGRADATION",
    blurb: "Some customers are seeing a reduced experience.",
  },
  Incident: {
    chip: "border-red-400/70 bg-red-50 text-red-700",
    label: "INCIDENT",
    blurb: "Customer-facing functionality is impaired.",
  },
  Maintenance: {
    chip: "border-sky-400/60 bg-sky-50 text-sky-700",
    label: "MAINTENANCE",
    blurb: "Planned work with no expected downtime.",
  },
};

export const eventDetails: Record<string, EventDetail> = {
  "evt-blob-latency": {
    headline: "Elevated Cloud Storage Latency, West US 2",
    classification: "Advisory",
    impactVerdict: "NO CURRENT IMPACT",
    situation:
      "We are observing elevated latency within an Azure storage dependency in West US 2. Requests are still completing successfully and your services remain available. Our platform absorbs this kind of slowdown through retries and caching, so your users are not seeing a change.",
    environment: [
      { name: "Production, West US 2", exposure: "Exposed", health: "Healthy", status: "healthy" },
      { name: "Production, East US", exposure: "Not exposed", health: "Healthy", status: "healthy" },
      { name: "DR, Central US", exposure: "Not exposed", health: "Healthy", status: "healthy" },
    ],
    customerExperience: [
      { label: "Availability", value: "Normal", status: "healthy" },
      { label: "Service responsiveness", value: "Normal", status: "healthy" },
      { label: "Data access", value: "Normal", status: "healthy" },
      { label: "Connectivity", value: "Normal", status: "healthy" },
    ],
    infrastructureCondition: [
      { label: "Storage latency", value: "Elevated", status: "degraded" },
      { label: "Storage errors", value: "Normal", status: "healthy" },
      { label: "Network", value: "Normal", status: "healthy" },
      { label: "Compute", value: "Normal", status: "healthy" },
    ],
    actionsUnderway: [
      { label: "Detection complete", done: true },
      { label: "Customer correlation complete", done: true },
      { label: "Engineering monitoring", done: true },
      { label: "Cloud provider escalation open", done: true },
    ],
    eventTimeline: [
      { time: "08:41", entry: "Condition detected" },
      { time: "08:42", entry: "Customer correlation complete" },
      { time: "08:43", entry: "No service impact confirmed" },
      { time: "08:45", entry: "Operations investigation started" },
      { time: "08:48", entry: "Provider escalation initiated" },
      { time: "08:53", entry: "Latest telemetry received" },
    ],
    customerAction: "No action required",
    nextUpdate: "10:00 AM PT",
    technical: [
      { label: "Dependency", value: "Azure Blob Storage — prodwus2data01" },
      { label: "Region", value: "West US 2" },
      { label: "P95 access latency", value: "44 ms (baseline 18 ms, warn 45 ms)" },
      { label: "Request success rate", value: "99.98%" },
      { label: "Throttled requests", value: "0" },
      { label: "Provider reference", value: "AZ-80456" },
      { label: "Correlation confidence", value: "High (telemetry + provider advisory)" },
    ],
    history: [
      { time: "May 14", entry: "Similar storage latency advisory, West US 2 — closed with no customer impact." },
      { time: "Mar 02", entry: "Storage latency advisory, West US 2 — resolved by provider in 74 minutes." },
    ],
  },

  "evt-api-slow": {
    headline: "Reduced responsiveness for order lookups, East US",
    classification: "Degradation",
    impactVerdict: "DEGRADED EXPERIENCE",
    situation:
      "A subset of order lookup requests in East US is completing more slowly than normal. Requests are succeeding, but some users may notice slower page loads. We have shifted a portion of traffic and are scaling the affected service tier.",
    environment: [
      { name: "Production, East US", exposure: "Exposed", health: "Degraded", status: "degraded" },
      { name: "Production, West US 2", exposure: "Not exposed", health: "Healthy", status: "healthy" },
      { name: "DR, Central US", exposure: "Not exposed", health: "Healthy", status: "healthy" },
    ],
    customerExperience: [
      { label: "Availability", value: "Normal", status: "healthy" },
      { label: "Service responsiveness", value: "Reduced", status: "degraded" },
      { label: "Data access", value: "Normal", status: "healthy" },
      { label: "Connectivity", value: "Normal", status: "healthy" },
    ],
    infrastructureCondition: [
      { label: "Service queue depth", value: "Elevated", status: "degraded" },
      { label: "Compute saturation", value: "Elevated", status: "degraded" },
      { label: "Storage latency", value: "Normal", status: "healthy" },
      { label: "Network", value: "Normal", status: "healthy" },
    ],
    actionsUnderway: [
      { label: "Detection complete", done: true },
      { label: "Customer correlation complete", done: true },
      { label: "Traffic partially shifted", done: true },
      { label: "Additional capacity scaling", done: false },
    ],
    eventTimeline: [
      { time: "09:02", entry: "Response time deviation detected" },
      { time: "09:04", entry: "Customer correlation complete — 1 deployment exposed" },
      { time: "09:06", entry: "Reduced responsiveness confirmed for order lookups" },
      { time: "09:09", entry: "Traffic shift to healthy capacity started" },
      { time: "09:15", entry: "Capacity scaling in progress" },
    ],
    customerAction: "No action required. Retry any slow request; it will succeed.",
    nextUpdate: "09:45 AM PT",
    technical: [
      { label: "Service", value: "order-lookup-api (East US)" },
      { label: "P95 response time", value: "780 ms (baseline 210 ms)" },
      { label: "Error rate", value: "0.04% (normal)" },
      { label: "Scaling action", value: "+6 instances, in progress" },
      { label: "Change reference", value: "CHG-24219" },
    ],
    history: [
      { time: "Apr 22", entry: "Comparable responsiveness degradation resolved by autoscale tuning." },
    ],
  },

  "evt-net-jitter": {
    headline: "Transient network jitter, Central US peering",
    classification: "Information",
    impactVerdict: "NO CURRENT IMPACT",
    situation:
      "A short period of packet re-transmission was observed on a peering path serving Central US. Traffic was automatically re-routed and the condition has cleared. Recorded here for your visibility only.",
    environment: [
      { name: "DR, Central US", exposure: "Exposed", health: "Healthy", status: "healthy" },
      { name: "Production, East US", exposure: "Not exposed", health: "Healthy", status: "healthy" },
      { name: "Production, West US 2", exposure: "Not exposed", health: "Healthy", status: "healthy" },
    ],
    customerExperience: [
      { label: "Availability", value: "Normal", status: "healthy" },
      { label: "Service responsiveness", value: "Normal", status: "healthy" },
      { label: "Data access", value: "Normal", status: "healthy" },
      { label: "Connectivity", value: "Normal", status: "healthy" },
    ],
    infrastructureCondition: [
      { label: "Packet re-transmission", value: "Cleared", status: "healthy" },
      { label: "Path failover", value: "Completed automatically", status: "healthy" },
      { label: "Storage latency", value: "Normal", status: "healthy" },
      { label: "Compute", value: "Normal", status: "healthy" },
    ],
    actionsUnderway: [
      { label: "Detection complete", done: true },
      { label: "Customer correlation complete", done: true },
      { label: "Auto-remediation by traffic steering", done: true },
      { label: "Event closed", done: true },
    ],
    eventTimeline: [
      { time: "21:12", entry: "Jitter detected on peering path" },
      { time: "21:13", entry: "Traffic automatically re-routed" },
      { time: "21:20", entry: "No customer impact confirmed" },
      { time: "22:04", entry: "Condition cleared, event closed" },
    ],
    customerAction: "No action required",
    nextUpdate: "Closed",
    technical: [
      { label: "Path", value: "Central US peering — carrier B" },
      { label: "Peak re-transmission", value: "0.8% for 90 seconds" },
      { label: "Failover time", value: "1.4 s" },
      { label: "Provider reference", value: "AZ-79912" },
    ],
    history: [
      { time: "Feb 09", entry: "Peering jitter on the same path, auto-remediated." },
    ],
  },

  "evt-identity-incident": {
    headline: "Sign-in failures for a subset of users, EU North",
    classification: "Incident",
    impactVerdict: "SERVICE IMPACT",
    situation:
      "Some users in EU North were unable to sign in due to an identity provider fault. Authentication has been failed over to a secondary path and sign-ins are recovering. Sessions already established were not affected.",
    environment: [
      { name: "Production, EU North", exposure: "Exposed", health: "Impaired", status: "incident" },
      { name: "Production, East US", exposure: "Not exposed", health: "Healthy", status: "healthy" },
      { name: "Production, West US 2", exposure: "Not exposed", health: "Healthy", status: "healthy" },
    ],
    customerExperience: [
      { label: "Availability", value: "Impaired for new sign-ins", status: "incident" },
      { label: "Service responsiveness", value: "Normal", status: "healthy" },
      { label: "Data access", value: "Normal", status: "healthy" },
      { label: "Connectivity", value: "Normal", status: "healthy" },
    ],
    infrastructureCondition: [
      { label: "Identity provider", value: "Faulted", status: "incident" },
      { label: "Token issuance", value: "Recovering", status: "degraded" },
      { label: "Storage latency", value: "Normal", status: "healthy" },
      { label: "Network", value: "Normal", status: "healthy" },
    ],
    actionsUnderway: [
      { label: "Detection complete", done: true },
      { label: "Customer correlation complete", done: true },
      { label: "Failover to secondary identity path", done: true },
      { label: "Recovery validation", done: false },
    ],
    eventTimeline: [
      { time: "07:58", entry: "Sign-in failure spike detected" },
      { time: "07:59", entry: "Customer correlation complete — 1 deployment exposed" },
      { time: "08:01", entry: "Customer impact confirmed for new sign-ins" },
      { time: "08:06", entry: "Failover to secondary identity path initiated" },
      { time: "08:19", entry: "Sign-in success rate recovering" },
    ],
    customerAction: "Affected users should retry sign-in. No configuration change is needed.",
    nextUpdate: "09:30 AM PT",
    technical: [
      { label: "Dependency", value: "Microsoft Entra ID — EU North" },
      { label: "Sign-in success rate", value: "91% and rising (baseline 99.9%)" },
      { label: "Established sessions", value: "Unaffected" },
      { label: "Provider reference", value: "AZ-80511" },
    ],
    history: [
      { time: "Jan 18", entry: "Identity provider incident, EU North — resolved in 41 minutes." },
    ],
  },

  "evt-cert-rotation": {
    headline: "Scheduled certificate rotation, orchestration endpoints",
    classification: "Maintenance",
    impactVerdict: "NO CURRENT IMPACT",
    situation:
      "Routine rotation of TLS certificates on orchestration endpoints. Connections are drained gracefully during the change and no downtime is expected.",
    environment: [
      { name: "Production, East US", exposure: "Exposed", health: "Healthy", status: "healthy" },
      { name: "Production, West US 2", exposure: "Exposed", health: "Healthy", status: "healthy" },
      { name: "DR, Central US", exposure: "Not exposed", health: "Healthy", status: "healthy" },
    ],
    customerExperience: [
      { label: "Availability", value: "Normal", status: "healthy" },
      { label: "Service responsiveness", value: "Normal", status: "healthy" },
      { label: "Data access", value: "Normal", status: "healthy" },
      { label: "Connectivity", value: "Normal", status: "healthy" },
    ],
    infrastructureCondition: [
      { label: "Certificate validity", value: "Rotating", status: "healthy" },
      { label: "Connection draining", value: "Graceful", status: "healthy" },
      { label: "Compute", value: "Normal", status: "healthy" },
      { label: "Network", value: "Normal", status: "healthy" },
    ],
    actionsUnderway: [
      { label: "Change approved", done: true },
      { label: "Customer correlation complete", done: true },
      { label: "Staged rollout", done: false },
      { label: "Post-change validation", done: false },
    ],
    eventTimeline: [
      { time: "Jun 7 10:00", entry: "Maintenance window opens" },
      { time: "Jun 7 10:10", entry: "Rotation begins on first endpoint group" },
      { time: "Jun 7 10:40", entry: "Rotation continues, connections drained gracefully" },
    ],
    customerAction: "No action required",
    nextUpdate: "Jun 7, 11:00 PT",
    technical: [
      { label: "Change reference", value: "CHG-24188" },
      { label: "Scope", value: "Orchestration endpoints, all production regions" },
      { label: "Rollback", value: "Previous certificate retained for 24 hours" },
    ],
    history: [
      { time: "Mar 07", entry: "Previous rotation completed with no impact." },
    ],
  },

  "evt-region-advisory": {
    headline: "Provider advisory, one availability zone in West US 2",
    classification: "Advisory",
    impactVerdict: "NO CURRENT IMPACT",
    situation:
      "Azure has an open advisory for a single availability zone in the West US 2 region. Your West US 2 deployment is distributed across three availability zones, so the remaining zones are serving all traffic normally. No requests have failed and no user-facing behaviour has changed.",
    environment: [
      { name: "Production, West US 2", exposure: "Exposed", health: "Healthy", status: "healthy" },
      { name: "Production, East US", exposure: "Not exposed", health: "Healthy", status: "healthy" },
      { name: "DR, Central US", exposure: "Not exposed", health: "Healthy", status: "healthy" },
      { name: "Production, North Europe", exposure: "Not exposed", health: "Healthy", status: "healthy" },
    ],
    customerExperience: [
      { label: "Availability", value: "Normal", status: "healthy" },
      { label: "Service responsiveness", value: "Normal", status: "healthy" },
      { label: "Data access", value: "Normal", status: "healthy" },
      { label: "Connectivity", value: "Normal", status: "healthy" },
    ],
    infrastructureCondition: [
      { label: "Affected availability zone", value: "1 of 3", status: "advisory" },
      { label: "Zone capacity in use", value: "Two healthy zones", status: "healthy" },
      { label: "Load balancing", value: "Distributing away from the affected zone", status: "healthy" },
      { label: "Storage replication", value: "Zone-redundant, in sync", status: "healthy" },
    ],
    actionsUnderway: [
      { label: "Zone-aware placement verified", done: true },
      { label: "Capacity confirmed in remaining zones", done: true },
      { label: "Provider advisory tracked", done: true },
      { label: "Regional failover rehearsed and standing by", done: true },
    ],
    eventTimeline: [
      { time: "07:20", entry: "Provider advisory published for one availability zone" },
      { time: "07:24", entry: "Deployment placement reviewed — three zones in use" },
      { time: "07:31", entry: "Capacity confirmed sufficient without the affected zone" },
      { time: "08:05", entry: "No customer impact observed" },
      { time: "10:39", entry: "Advisory still open, condition unchanged" },
    ],
    customerAction: "No action required",
    nextUpdate: "11:00 AM PT",
    technical: [
      { label: "Region", value: "West US 2 (Quincy, WA)" },
      { label: "Availability zones in use", value: "3" },
      { label: "Zones affected by advisory", value: "1" },
      { label: "Nodes in the affected zone", value: "3 of 8, drained" },
      { label: "Request success rate", value: "99.99%" },
      { label: "Provider reference", value: "AZ-80402" },
      { label: "Correlation confidence", value: "High (provider advisory + placement data)" },
    ],
    history: [
      { time: "Feb 19", entry: "Availability zone advisory, West US 2 — closed after 6 hours with no customer impact." },
      { time: "Nov 04", entry: "Availability zone advisory, East US — closed with no customer impact." },
    ],
  },

  "evt-az-host-maintenance": {
    headline: "Planned Azure host maintenance, East US virtual machines",
    classification: "Maintenance",
    impactVerdict: "NO CURRENT IMPACT",
    situation:
      "Azure will apply updates to the physical hosts running a portion of your East US virtual machines on June 6. The work is staged one availability zone at a time. Each node is drained of traffic before its host restarts and is returned to service afterwards, so your service stays available for the full window.",
    environment: [
      { name: "Production, East US", exposure: "Exposed", health: "Healthy", status: "healthy" },
      { name: "Staging, East US", exposure: "Exposed", health: "Healthy", status: "healthy" },
      { name: "Production, West US 2", exposure: "Not exposed", health: "Healthy", status: "healthy" },
      { name: "DR, Central US", exposure: "Not exposed", health: "Healthy", status: "healthy" },
    ],
    customerExperience: [
      { label: "Availability", value: "No change expected", status: "healthy" },
      { label: "Service responsiveness", value: "No change expected", status: "healthy" },
      { label: "Data access", value: "No change expected", status: "healthy" },
      { label: "Connectivity", value: "Brief connection resets absorbed by retry", status: "healthy" },
    ],
    infrastructureCondition: [
      { label: "Hosts to be updated", value: "5 of 12 East US nodes", status: "info" },
      { label: "Staging strategy", value: "One availability zone at a time", status: "healthy" },
      { label: "Node drain before restart", value: "Enabled", status: "healthy" },
      { label: "Spare capacity during the window", value: "Sufficient without the updating zone", status: "healthy" },
    ],
    actionsUnderway: [
      { label: "Maintenance notice received from provider", done: true },
      { label: "Checked against your protected business window", done: true },
      { label: "Zone-by-zone schedule agreed", done: true },
      { label: "Post-maintenance validation planned", done: false },
    ],
    eventTimeline: [
      { time: "Jun 2", entry: "Provider maintenance notice received" },
      { time: "Jun 2", entry: "Scope matched to your East US deployment" },
      { time: "Jun 3", entry: "Confirmed the window falls outside your protected hours" },
      { time: "Jun 6", entry: "02:00 PT — maintenance begins, zone 1" },
      { time: "Jun 6", entry: "06:00 PT — expected completion and validation" },
    ],
    customerAction: "No action required",
    nextUpdate: "Jun 5, 17:00 PT",
    technical: [
      { label: "Change type", value: "Provider host operating-system update" },
      { label: "Region", value: "East US" },
      { label: "Resource type", value: "Azure Virtual Machines" },
      { label: "Window", value: "Jun 6, 02:00 – 06:00 AM PT" },
      { label: "Protected business window", value: "Outside — no overlap" },
      { label: "Expected downtime", value: "None" },
      { label: "Provider reference", value: "AZ-MTC-11938" },
    ],
    history: [
      { time: "Apr 11", entry: "Host maintenance, East US — completed with no customer impact." },
      { time: "Jan 23", entry: "Host maintenance, West US 2 — completed with no customer impact." },
    ],
  },

  "evt-dns-failover": {
    headline: "Name resolution failures, North Europe (resolved)",
    classification: "Incident",
    impactVerdict: "RESOLVED",
    situation:
      "On May 28 a platform DNS fault in North Europe prevented some client requests from resolving the service endpoint for 52 minutes. Requests that did resolve continued to succeed. Traffic was moved to a secondary resolver, resolution recovered, and the fault was confirmed resolved by the provider. A written review has been published to your account team.",
    environment: [
      { name: "Production, North Europe", exposure: "Exposed", health: "Recovered", status: "healthy" },
      { name: "Production, East US", exposure: "Not exposed", health: "Healthy", status: "healthy" },
      { name: "Production, West US 2", exposure: "Not exposed", health: "Healthy", status: "healthy" },
      { name: "DR, Central US", exposure: "Not exposed", health: "Healthy", status: "healthy" },
    ],
    customerExperience: [
      { label: "Availability", value: "Impaired during the event, now normal", status: "healthy" },
      { label: "Service responsiveness", value: "Normal", status: "healthy" },
      { label: "Data access", value: "Never affected", status: "healthy" },
      { label: "Connectivity", value: "Restored", status: "healthy" },
    ],
    infrastructureCondition: [
      { label: "DNS resolution", value: "Restored on secondary resolver", status: "healthy" },
      { label: "Load balancer health probes", value: "Passing", status: "healthy" },
      { label: "Compute and storage", value: "Unaffected throughout", status: "healthy" },
      { label: "Private connectivity", value: "Unaffected throughout", status: "healthy" },
    ],
    actionsUnderway: [
      { label: "Failover to secondary resolver", done: true },
      { label: "Resolution recovery confirmed", done: true },
      { label: "Provider root cause received", done: true },
      { label: "Post-incident review published", done: true },
    ],
    eventTimeline: [
      { time: "14:06", entry: "Resolution failures detected in North Europe" },
      { time: "14:09", entry: "Customer impact confirmed — a subset of requests could not connect" },
      { time: "14:17", entry: "Traffic moved to the secondary resolver" },
      { time: "14:33", entry: "Resolution success rate back to normal" },
      { time: "14:58", entry: "Event closed after 25 minutes of clean telemetry" },
      { time: "Jun 1", entry: "Post-incident review published" },
    ],
    customerAction: "No action required — review available from your account team",
    nextUpdate: "Closed",
    technical: [
      { label: "Region", value: "North Europe (Dublin, Ireland)" },
      { label: "Dependency", value: "Platform DNS and load balancing" },
      { label: "Total event duration", value: "52 minutes" },
      { label: "Customer-impacting time", value: "41 minutes" },
      { label: "Peak resolution failure rate", value: "22% of lookups" },
      { label: "Error budget consumed", value: "9.4% of the monthly availability allowance" },
      { label: "Provider reference", value: "AZ-79604" },
    ],
    history: [
      { time: "May 28", entry: "This event — resolved in 52 minutes, review published Jun 1." },
      { time: "Sep 12", entry: "Resolver failover exercised during a planned test — no customer impact." },
    ],
  },
};
