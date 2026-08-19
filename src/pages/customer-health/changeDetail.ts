// Recent changes & maintenance. Every change is scored for *customer relevance*
// rather than presented as raw provider maintenance noise. A change at the
// cloud provider is only relevant to you when your deployments sit inside the
// affected scope — and it receives elevated attention when it lands inside your
// protected business window.

import type { ChangeDetail, ChangeRecord, ProtectedWindow } from "./types";

/** Mock customer configuration — protected operating window. */
export const protectedWindow: ProtectedWindow = {
  label: "Protected Business Window",
  days: "Monday – Friday",
  hours: "06:00 – 20:00",
  timezone: "local time (America/Los_Angeles)",
  note:
    "Changes scheduled inside this window are flagged for elevated attention and reviewed with you before they proceed.",
};

export const changeRows: ChangeRecord[] = [
  {
    id: "chg-az",
    title: "Azure Maintenance – West US 2",
    window: "Jun 6, 02:00 – 06:00 AM PT",
    kind: "Azure maintenance",
    region: "West US 2",
    deployment: "Production – West US 2",
    potentialImpact: "Low",
    relevance: "Relevant",
    customerAction: "No action required",
    inProtectedWindow: false,
    contextId: "chg-azure-westus2",
  },
  {
    id: "chg-plat",
    title: "Platform Update – Orchestration Service",
    window: "Jun 7, 10:00 – 11:00 AM PT",
    kind: "Platform maintenance",
    region: "All regions",
    deployment: "All production deployments",
    potentialImpact: "None",
    relevance: "Informational",
    customerAction: "No action required",
    inProtectedWindow: true,
    contextId: "chg-platform-update",
  },
  {
    id: "chg-net",
    title: "Infrastructure change – Edge routing tier, East US",
    window: "Jun 8, 23:00 PT – Jun 9, 01:00 AM PT",
    kind: "Infrastructure change",
    region: "East US",
    deployment: "Production – East US",
    potentialImpact: "Low",
    relevance: "Relevant",
    customerAction: "No action required",
    inProtectedWindow: false,
    contextId: "chg-edge-routing",
  },
  {
    id: "chg-svc",
    title: "Service change – Reporting API v2.14 rollout",
    window: "Jun 10, 09:00 – 09:45 AM PT",
    kind: "Service change",
    region: "All regions",
    deployment: "Reporting service",
    potentialImpact: "None",
    relevance: "Action required",
    customerAction: "Review deprecated v1 report endpoints before Jul 31",
    inProtectedWindow: true,
    contextId: "chg-reporting-api",
  },
  {
    id: "chg-dr",
    title: "Customer-specific maintenance – DR readiness verification, Central US",
    window: "Jun 9, 01:00 – 03:00 AM PT",
    kind: "Customer-specific maintenance",
    region: "Central US",
    deployment: "Disaster recovery – Central US",
    potentialImpact: "None",
    relevance: "Informational",
    customerAction: "No action required",
    inProtectedWindow: false,
    contextId: "chg-dr-verification",
  },
  {
    id: "chg-uk",
    title: "Azure Maintenance – UK South storage scale unit",
    window: "Jun 11, 03:00 – 05:00 AM BST",
    kind: "Azure maintenance",
    region: "UK South",
    deployment: "No customer deployment in this region",
    potentialImpact: "None",
    relevance: "Not relevant to you",
    customerAction: "No action required",
    inProtectedWindow: false,
    contextId: "chg-uk-south",
  },
];

export const changeDetails: Record<string, ChangeDetail> = {
  "chg-azure-westus2": {
    headline: "Azure Maintenance, West US 2",
    kind: "Azure maintenance",
    window: "Jun 6, 02:00 – 06:00 AM PT",
    affectsMe: {
      verdict: "Potentially",
      explanation:
        "Your Production deployment in West US 2 sits inside the infrastructure scope of this maintenance. Work of this type is normally absorbed without any change to your experience, but a brief effect cannot be ruled out.",
      status: "advisory",
    },
    yourEnvironment: [
      { label: "Production, West US 2", note: "Within the affected infrastructure scope", status: "advisory" },
      { label: "Production, East US", note: "Outside the affected scope — able to carry traffic", status: "healthy" },
      { label: "Disaster recovery, Central US", note: "Outside the affected scope — standing by", status: "healthy" },
    ],
    expectedImpact: "Low",
    serviceInterruptionExpected: false,
    interruptionNote:
      "No interruption is expected. Maintenance is performed one fault domain at a time while capacity remains available.",
    resilience: [
      "Your service runs across multiple independent failure domains in this region.",
      "Traffic can be shifted to an unaffected region without action from you.",
      "Redundant capacity is held in reserve for the duration of the maintenance window.",
      "Automated health checks continuously verify that your service keeps serving traffic.",
    ],
    customerAction: "No action required",
    actionRequired: false,
    timeline: [
      { stage: "Maintenance start", at: "Jun 6, 02:00 AM PT", note: "Provider begins work on the first fault domain.", pending: true },
      { stage: "Expected completion", at: "Jun 6, 06:00 AM PT", note: "All fault domains returned to service.", pending: true },
      { stage: "Monitoring window", at: "Jun 6, 06:00 – 10:00 AM PT", note: "Heightened observation of your customer-facing indicators.", pending: true },
      { stage: "Post-change validation", at: "Jun 6, 10:00 AM PT", note: "Formal confirmation that your service is unchanged.", pending: true },
    ],
    validation: [
      {
        group: "Pre-change checks",
        items: [
          { label: "Scope confirmed against your deployments", state: "Passed", note: "One production deployment inside scope." },
          { label: "Failover path verified", state: "Passed", note: "East US able to absorb West US 2 traffic." },
        ],
      },
      {
        group: "Service readiness",
        items: [
          { label: "Redundant capacity reserved", state: "Passed", note: "Headroom held for the full window." },
          { label: "Error budget headroom", state: "Passed", note: "93.4% of the monthly allowance remains." },
        ],
      },
      {
        group: "Dependency health",
        items: [
          { label: "Storage dependency, West US 2", state: "In progress", note: "Existing advisory tracked alongside this change." },
          { label: "Identity and network dependencies", state: "Passed", note: "Healthy across all regions." },
        ],
      },
      {
        group: "Post-change verification",
        items: [
          { label: "Customer journey verification", state: "Scheduled", note: "Runs at the close of the monitoring window." },
          { label: "Latency and error-rate comparison", state: "Scheduled", note: "Compared against the pre-change baseline." },
        ],
      },
    ],
    protectedWindow: {
      overlaps: false,
      note: "This maintenance falls outside your protected business window of Monday–Friday, 06:00–20:00 local time.",
    },
  },

  "chg-platform-update": {
    headline: "Platform Update, Orchestration Service",
    kind: "Platform maintenance",
    window: "Jun 7, 10:00 – 11:00 AM PT",
    affectsMe: {
      verdict: "Informational only",
      explanation:
        "This is a rolling update to a platform component that sits behind your service. It is delivered without taking capacity out of rotation, so no change to your experience is expected.",
      status: "healthy",
    },
    yourEnvironment: [
      { label: "All production deployments", note: "Served by the platform component being updated", status: "healthy" },
    ],
    expectedImpact: "None",
    serviceInterruptionExpected: false,
    interruptionNote: "Rolling delivery — no capacity is removed from service at any point.",
    resilience: [
      "The update is applied progressively, with automatic halt on any deviation.",
      "The previous version remains available for immediate rollback.",
      "Customer-facing indicators are watched throughout the rollout.",
    ],
    customerAction: "No action required",
    actionRequired: false,
    timeline: [
      { stage: "Maintenance start", at: "Jun 7, 10:00 AM PT", note: "Rollout begins on the first wave.", pending: true },
      { stage: "Expected completion", at: "Jun 7, 11:00 AM PT", note: "All waves complete.", pending: true },
      { stage: "Monitoring window", at: "Jun 7, 11:00 AM – 03:00 PM PT", note: "Extended observation after rollout.", pending: true },
      { stage: "Post-change validation", at: "Jun 7, 03:00 PM PT", note: "Confirmation that behaviour is unchanged.", pending: true },
    ],
    validation: [
      {
        group: "Pre-change checks",
        items: [
          { label: "Change reviewed and approved", state: "Passed", note: "Approved under standard change governance." },
          { label: "Rollback rehearsed", state: "Passed", note: "Previous version verified in a staging environment." },
        ],
      },
      {
        group: "Service readiness",
        items: [{ label: "Progressive delivery gates armed", state: "Passed", note: "Automatic halt on any regression." }],
      },
      {
        group: "Dependency health",
        items: [{ label: "Upstream dependencies", state: "Passed", note: "All healthy at time of scheduling." }],
      },
      {
        group: "Post-change verification",
        items: [{ label: "Behavioural comparison", state: "Scheduled", note: "Compared against the pre-change baseline." }],
      },
    ],
    protectedWindow: {
      overlaps: true,
      note: "This change lands inside your protected business window (Mon–Fri, 06:00–20:00). It is delivered without removing capacity, and it is reviewed with you before it proceeds.",
    },
  },

  "chg-edge-routing": {
    headline: "Infrastructure change, Edge routing tier — East US",
    kind: "Infrastructure change",
    window: "Jun 8, 23:00 PT – Jun 9, 01:00 AM PT",
    affectsMe: {
      verdict: "Potentially",
      explanation:
        "Your Production deployment in East US is served by the routing tier being changed. Connections are drained gracefully, so a small number of long-lived sessions may reconnect.",
      status: "advisory",
    },
    yourEnvironment: [
      { label: "Production, East US", note: "Served by the routing tier being changed", status: "advisory" },
      { label: "Production, West US 2", note: "Unaffected — separate routing tier", status: "healthy" },
    ],
    expectedImpact: "Low",
    serviceInterruptionExpected: false,
    interruptionNote: "No interruption expected. Existing connections are drained rather than dropped.",
    resilience: [
      "Traffic is drained from each node before it is changed.",
      "Client reconnection is handled transparently by the service.",
      "A second routing path remains available throughout.",
    ],
    customerAction: "No action required",
    actionRequired: false,
    timeline: [
      { stage: "Maintenance start", at: "Jun 8, 11:00 PM PT", note: "First routing node drained.", pending: true },
      { stage: "Expected completion", at: "Jun 9, 01:00 AM PT", note: "All nodes returned to service.", pending: true },
      { stage: "Monitoring window", at: "Jun 9, 01:00 – 06:00 AM PT", note: "Connection and latency watch.", pending: true },
      { stage: "Post-change validation", at: "Jun 9, 06:00 AM PT", note: "Confirmation ahead of business hours.", pending: true },
    ],
    validation: [
      {
        group: "Pre-change checks",
        items: [{ label: "Connection drain tested", state: "Passed", note: "Verified in a non-production region." }],
      },
      { group: "Service readiness", items: [{ label: "Alternate routing path online", state: "Passed", note: "Verified before the window opens." }] },
      { group: "Dependency health", items: [{ label: "Network dependencies, East US", state: "Passed", note: "Healthy." }] },
      { group: "Post-change verification", items: [{ label: "Session establishment rate", state: "Scheduled", note: "Compared against baseline." }] },
    ],
    protectedWindow: {
      overlaps: false,
      note: "Deliberately scheduled outside your protected business window and completed before business hours begin.",
    },
  },

  "chg-reporting-api": {
    headline: "Service change, Reporting API v2.14",
    kind: "Service change",
    window: "Jun 10, 09:00 – 09:45 AM PT",
    affectsMe: {
      verdict: "Yes — a follow-up action applies",
      explanation:
        "The new reporting version is fully backward compatible today. However, the v1 report endpoints it supersedes are deprecated and will be withdrawn on Jul 31, so any integration still using them needs to move.",
      status: "advisory",
    },
    yourEnvironment: [
      { label: "Reporting service", note: "Receives the new version in all regions", status: "advisory" },
      { label: "2 integrations using v1 endpoints", note: "Identified in your account and listed in the change notice", status: "advisory" },
    ],
    expectedImpact: "None",
    serviceInterruptionExpected: false,
    interruptionNote: "No interruption. The new version is added alongside the existing one.",
    resilience: [
      "The previous version continues to serve until the announced withdrawal date.",
      "Rollout can be reversed immediately if a regression is detected.",
    ],
    customerAction: "Review the deprecated v1 report endpoints and migrate your two integrations before Jul 31.",
    actionRequired: true,
    timeline: [
      { stage: "Maintenance start", at: "Jun 10, 09:00 AM PT", note: "Version becomes available.", pending: true },
      { stage: "Expected completion", at: "Jun 10, 09:45 AM PT", note: "Rollout complete in all regions.", pending: true },
      { stage: "Monitoring window", at: "Jun 10, 09:45 AM – 05:00 PM PT", note: "Reporting error-rate watch.", pending: true },
      { stage: "Post-change validation", at: "Jun 10, 05:00 PM PT", note: "Confirmation that reports render correctly.", pending: true },
    ],
    validation: [
      { group: "Pre-change checks", items: [{ label: "Backward compatibility test suite", state: "Passed", note: "All v1 contracts still satisfied." }] },
      { group: "Service readiness", items: [{ label: "Report generation capacity", state: "Passed", note: "Headroom confirmed." }] },
      { group: "Dependency health", items: [{ label: "Data warehouse dependency", state: "Passed", note: "Healthy." }] },
      { group: "Post-change verification", items: [{ label: "Sample report comparison", state: "Scheduled", note: "Outputs compared pre and post change." }] },
    ],
    protectedWindow: {
      overlaps: true,
      note: "This change lands inside your protected business window (Mon–Fri, 06:00–20:00) and carries a customer action — it is highlighted for your review.",
    },
  },

  "chg-dr-verification": {
    headline: "Customer-specific maintenance, DR readiness verification — Central US",
    kind: "Customer-specific maintenance",
    window: "Jun 9, 01:00 – 03:00 AM PT",
    affectsMe: {
      verdict: "No impact expected",
      explanation:
        "This exercise is performed on your dedicated disaster-recovery environment in Central US. Production traffic is never routed into it during the verification.",
      status: "healthy",
    },
    yourEnvironment: [
      { label: "Disaster recovery, Central US", note: "The environment under verification", status: "healthy" },
      { label: "Production deployments", note: "Untouched — no traffic is redirected", status: "healthy" },
    ],
    expectedImpact: "None",
    serviceInterruptionExpected: false,
    interruptionNote: "No interruption. Production is isolated from the exercise.",
    resilience: [
      "The exercise confirms your recovery environment can take over if it is ever needed.",
      "Recovery time and data currency are measured and reported back to you.",
    ],
    customerAction: "No action required",
    actionRequired: false,
    timeline: [
      { stage: "Maintenance start", at: "Jun 9, 01:00 AM PT", note: "Recovery environment brought to active state.", pending: true },
      { stage: "Expected completion", at: "Jun 9, 03:00 AM PT", note: "Environment returned to standby.", pending: true },
      { stage: "Monitoring window", at: "Jun 9, 03:00 – 05:00 AM PT", note: "Standby state confirmed.", pending: true },
      { stage: "Post-change validation", at: "Jun 9, 05:00 AM PT", note: "Recovery report issued to you.", pending: true },
    ],
    validation: [
      { group: "Pre-change checks", items: [{ label: "Production isolation confirmed", state: "Passed", note: "No routing path into the DR environment." }] },
      { group: "Service readiness", items: [{ label: "Replication currency", state: "Passed", note: "Within the agreed recovery point." }] },
      { group: "Dependency health", items: [{ label: "Central US dependencies", state: "Passed", note: "Healthy." }] },
      { group: "Post-change verification", items: [{ label: "Standby state restored", state: "Scheduled", note: "Verified at the close of the exercise." }] },
    ],
    protectedWindow: {
      overlaps: false,
      note: "Scheduled outside your protected business window.",
    },
  },

  "chg-uk-south": {
    headline: "Azure Maintenance, UK South storage scale unit",
    kind: "Azure maintenance",
    window: "Jun 11, 03:00 – 05:00 AM BST",
    affectsMe: {
      verdict: "No",
      explanation:
        "You have no deployment in UK South. This provider maintenance is shown for completeness only and has no path to your service.",
      status: "healthy",
    },
    yourEnvironment: [{ label: "UK South", note: "No customer deployment in this region", status: "healthy" }],
    expectedImpact: "None",
    serviceInterruptionExpected: false,
    interruptionNote: "Not applicable — no deployment of yours sits in the affected scope.",
    resilience: ["No dependency path exists between this scale unit and your deployments."],
    customerAction: "No action required",
    actionRequired: false,
    timeline: [
      { stage: "Maintenance start", at: "Jun 11, 03:00 AM BST", note: "Provider begins work.", pending: true },
      { stage: "Expected completion", at: "Jun 11, 05:00 AM BST", note: "Work complete.", pending: true },
      { stage: "Monitoring window", at: "Not applicable", note: "No customer exposure to monitor." },
      { stage: "Post-change validation", at: "Not applicable", note: "No customer-facing verification required." },
    ],
    validation: [
      { group: "Pre-change checks", items: [{ label: "Scope compared to your footprint", state: "Passed", note: "No overlap found." }] },
      { group: "Service readiness", items: [{ label: "Not applicable", state: "Passed", note: "No deployment in scope." }] },
      { group: "Dependency health", items: [{ label: "Cross-region dependency check", state: "Passed", note: "No dependency path from UK South." }] },
      { group: "Post-change verification", items: [{ label: "Not applicable", state: "Passed", note: "No customer exposure." }] },
    ],
    protectedWindow: { overlaps: false, note: "Outside your protected business window." },
  },
};
