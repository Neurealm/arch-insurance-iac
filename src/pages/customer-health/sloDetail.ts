// Service level objectives and reliability history. Customer-impacting time is
// kept strictly distinct from infrastructure event time: an infrastructure
// event only counts against your service when telemetry shows customer impact.

import type { SloDetail, SloRow } from "./types";

export const sloRows: SloRow[] = [
  { id: "slo-avail", name: "Availability SLO", target: "99.99%", current: "99.997%", attainment: 99.997, errorBudget: 93.4, status: "healthy", contextId: "slo-availability" },
  { id: "slo-infra", name: "Infrastructure Reliability SLO", target: "99.95%", current: "99.962%", attainment: 99.962, errorBudget: 71.6, status: "advisory", contextId: "slo-infrastructure" },
  { id: "slo-dep", name: "Dependency Availability SLO", target: "99.9%", current: "99.934%", attainment: 99.934, errorBudget: 66.2, status: "advisory", contextId: "slo-dependency" },
  { id: "slo-durability", name: "Durability / Resilience Objective", target: "99.999999999%", current: "100%", attainment: 100, errorBudget: 100, status: "healthy", contextId: "slo-durability" },
];

export const sloDetails: Record<string, SloDetail> = {
  "slo-availability": {
    headline: "Availability SLO",
    target: "99.99%",
    current: "99.997%",
    statusLabel: "Met",
    status: "healthy",
    meaning: "Your service is currently operating above its availability objective.",
    measurement: "Measured at the edge across all production deployments. Planned maintenance windows you approved are excluded.",
    errorBudget: {
      remainingPct: 93.4,
      consumedPct: 6.6,
      remainingPlain: "About 40 minutes of unavailability could still occur this month without missing the objective.",
      consumedPlain: "Roughly 3 minutes of the monthly allowance has been used so far.",
      burnRate: "0.4×",
      burnRateNote: "You are using the allowance slower than the pace that would exhaust it by month end.",
      projected: "Projected to finish the month with ~88% remaining",
      projectedStatus: "healthy",
      explanation:
        "An error budget is the small amount of imperfect service the objective allows. At 99.99% you are allowed about 4.3 minutes of unavailability per month. What you have not used is what remains.",
    },
    history: [
      { window: "24 hours", attainment: "100%", status: "healthy", unavailableMinutes: 0, degradedMinutes: 0, infrastructureEventMinutes: 214, customerImpactingEventMinutes: 0, note: "Provider conditions were present but never reached your users." },
      { window: "7 days", attainment: "99.998%", status: "healthy", unavailableMinutes: 0.2, degradedMinutes: 11, infrastructureEventMinutes: 486, customerImpactingEventMinutes: 11, note: "One brief degradation during the EU North identity failover." },
      { window: "30 days", attainment: "99.997%", status: "healthy", unavailableMinutes: 0.9, degradedMinutes: 27, infrastructureEventMinutes: 1_642, customerImpactingEventMinutes: 28, note: "Well inside the objective across the full calendar month." },
      { window: "90 days", attainment: "99.995%", status: "healthy", unavailableMinutes: 4.1, degradedMinutes: 96, infrastructureEventMinutes: 5_130, customerImpactingEventMinutes: 100, note: "Objective met in each of the last three months." },
    ],
    contributions: [
      { contextId: "evt-identity-incident", title: "Sign-in failures for a subset of users, EU North", classification: "Incident", when: "Today 07:58 AM PT", minutes: 9, budgetPct: 4.1, customerImpacting: true, note: "Authentication failed over to a secondary path; a subset of sign-ins was affected." },
      { contextId: "evt-api-slow", title: "Reduced responsiveness for order lookups, East US", classification: "Degradation", when: "Today 09:02 AM PT", minutes: 2, budgetPct: 1.4, customerImpacting: true, note: "Some order lookups completed more slowly; requests continued to succeed." },
      { contextId: "evt-blob-latency", title: "Azure storage latency advisory, West US 2", classification: "Advisory", when: "Today 08:41 AM PT", minutes: 0, budgetPct: 0, customerImpacting: false, note: "Infrastructure condition only — no measurable customer impact, so no budget consumed." },
    ],
    trend: "Stable",
    trendNote: "Attainment has stayed within 0.003% across the last three measurement windows.",
  },

  "slo-infrastructure": {
    headline: "Infrastructure Reliability SLO",
    target: "99.95%",
    current: "99.962%",
    statusLabel: "Met",
    status: "advisory",
    meaning:
      "The infrastructure underneath your service is meeting its objective, though it is carrying more provider conditions than usual. This has not translated into customer impact.",
    measurement: "Measured across compute, storage, network and control plane resources that serve your deployments.",
    errorBudget: {
      remainingPct: 71.6,
      consumedPct: 28.4,
      remainingPlain: "About 15 minutes of infrastructure unreliability remains allowable this month.",
      consumedPlain: "Roughly 6 minutes has been consumed, mostly by the open West US 2 storage advisory.",
      burnRate: "1.3×",
      burnRateNote: "Slightly faster than the sustainable pace while the regional advisory stays open.",
      projected: "Projected to finish the month with ~58% remaining",
      projectedStatus: "advisory",
      explanation:
        "This budget tracks the infrastructure layer only. Spending it does not mean your users were affected — it means the platform beneath you worked harder to keep them unaffected.",
    },
    history: [
      { window: "24 hours", attainment: "99.94%", status: "advisory", unavailableMinutes: 0, degradedMinutes: 0, infrastructureEventMinutes: 214, customerImpactingEventMinutes: 0, note: "Storage latency elevated in one region for most of the day." },
      { window: "7 days", attainment: "99.958%", status: "advisory", unavailableMinutes: 0, degradedMinutes: 11, infrastructureEventMinutes: 486, customerImpactingEventMinutes: 11, note: "Two provider advisories, one of which briefly reached users." },
      { window: "30 days", attainment: "99.962%", status: "healthy", unavailableMinutes: 0.9, degradedMinutes: 27, infrastructureEventMinutes: 1_642, customerImpactingEventMinutes: 28, note: "Above objective for the calendar month." },
      { window: "90 days", attainment: "99.951%", status: "healthy", unavailableMinutes: 4.1, degradedMinutes: 96, infrastructureEventMinutes: 5_130, customerImpactingEventMinutes: 100, note: "Narrowly above objective; driven by two provider incidents in April." },
    ],
    contributions: [
      { contextId: "evt-blob-latency", title: "Azure storage latency advisory, West US 2", classification: "Advisory", when: "Today 08:41 AM PT", minutes: 214, budgetPct: 19.4, customerImpacting: false, note: "Counts against infrastructure reliability only — your service stayed healthy throughout." },
      { contextId: "evt-net-jitter", title: "Inter-region network variance", classification: "Information", when: "Yesterday 22:10 PT", minutes: 48, budgetPct: 5.2, customerImpacting: false, note: "Path variance absorbed by retries; no customer-facing symptom." },
      { contextId: "evt-identity-incident", title: "Sign-in failures for a subset of users, EU North", classification: "Incident", when: "Today 07:58 AM PT", minutes: 22, budgetPct: 3.8, customerImpacting: true, note: "Identity provider condition that did reach a subset of users." },
    ],
    trend: "Deteriorating",
    trendNote: "Infrastructure event minutes are up 18% week over week while customer-impacting minutes stayed flat.",
  },

  "slo-dependency": {
    headline: "Dependency Availability SLO",
    target: "99.9%",
    current: "99.934%",
    statusLabel: "Met",
    status: "advisory",
    meaning:
      "The external and platform dependencies your service relies on are meeting their objective. One dependency is degraded but is being absorbed without customer impact.",
    measurement: "Measured across identity, storage, messaging, database and third-party dependencies in your critical path.",
    errorBudget: {
      remainingPct: 66.2,
      consumedPct: 33.8,
      remainingPlain: "About 29 minutes of dependency unavailability remains allowable this month.",
      consumedPlain: "Roughly 15 minutes has been consumed, mainly by the EU North identity event.",
      burnRate: "1.6×",
      burnRateNote: "Elevated this week because of the identity incident; expected to settle once it closes.",
      projected: "Projected to finish the month with ~44% remaining",
      projectedStatus: "advisory",
      explanation:
        "This budget covers the services your platform depends on. When a dependency wobbles, retries and failover usually keep your users unaffected — the budget records the wobble even when your experience stayed normal.",
    },
    history: [
      { window: "24 hours", attainment: "99.88%", status: "degraded", unavailableMinutes: 0, degradedMinutes: 9, infrastructureEventMinutes: 236, customerImpactingEventMinutes: 9, note: "Identity dependency degraded for part of the morning." },
      { window: "7 days", attainment: "99.92%", status: "advisory", unavailableMinutes: 0.2, degradedMinutes: 20, infrastructureEventMinutes: 512, customerImpactingEventMinutes: 20, note: "One dependency incident, otherwise nominal." },
      { window: "30 days", attainment: "99.934%", status: "healthy", unavailableMinutes: 0.9, degradedMinutes: 34, infrastructureEventMinutes: 1_688, customerImpactingEventMinutes: 34, note: "Above objective for the calendar month." },
      { window: "90 days", attainment: "99.928%", status: "healthy", unavailableMinutes: 4.4, degradedMinutes: 118, infrastructureEventMinutes: 5_402, customerImpactingEventMinutes: 121, note: "Consistently above objective." },
    ],
    contributions: [
      { contextId: "evt-identity-incident", title: "Sign-in failures for a subset of users, EU North", classification: "Incident", when: "Today 07:58 AM PT", minutes: 9, budgetPct: 21.4, customerImpacting: true, note: "Microsoft Entra ID authentication path degraded; failover restored sign-ins." },
      { contextId: "evt-blob-latency", title: "Azure storage latency advisory, West US 2", classification: "Advisory", when: "Today 08:41 AM PT", minutes: 214, budgetPct: 9.8, customerImpacting: false, note: "Dependency degraded, customer experience unaffected." },
      { contextId: "evt-cert-rotation", title: "Certificate rotation across production endpoints", classification: "Information", when: "Jun 3, 01:00 PT", minutes: 0, budgetPct: 0, customerImpacting: false, note: "Planned and rolling; no dependency downtime recorded." },
    ],
    trend: "Stable",
    trendNote: "Dependency attainment is holding steady once the single identity event is set aside.",
  },

  "slo-durability": {
    headline: "Durability / Resilience Objective",
    target: "99.999999999%",
    current: "100%",
    statusLabel: "Met",
    status: "healthy",
    meaning: "No data loss has ever been recorded for your service, and every resilience rehearsal has passed.",
    measurement: "Measured through continuous checksum verification, replication health and quarterly failover rehearsals.",
    errorBudget: {
      remainingPct: 100,
      consumedPct: 0,
      remainingPlain: "The full durability allowance is intact — nothing has been consumed.",
      consumedPlain: "No objects lost, corrupted or unrecoverable since service inception.",
      burnRate: "0.0×",
      burnRateNote: "No durability events recorded in any measurement window.",
      projected: "Projected to remain at 100%",
      projectedStatus: "healthy",
      explanation:
        "Durability answers a simpler question than availability: is your data safe? Availability can dip while durability stays perfect — the two are measured separately on purpose.",
    },
    history: [
      { window: "24 hours", attainment: "100%", status: "healthy", unavailableMinutes: 0, degradedMinutes: 0, infrastructureEventMinutes: 214, customerImpactingEventMinutes: 0, note: "All integrity verification passes succeeded." },
      { window: "7 days", attainment: "100%", status: "healthy", unavailableMinutes: 0, degradedMinutes: 0, infrastructureEventMinutes: 486, customerImpactingEventMinutes: 11, note: "Replication healthy across all zones." },
      { window: "30 days", attainment: "100%", status: "healthy", unavailableMinutes: 0, degradedMinutes: 0, infrastructureEventMinutes: 1_642, customerImpactingEventMinutes: 28, note: "Monthly restore test completed successfully." },
      { window: "90 days", attainment: "100%", status: "healthy", unavailableMinutes: 0, degradedMinutes: 0, infrastructureEventMinutes: 5_130, customerImpactingEventMinutes: 100, note: "Two full DR rehearsals passed within target recovery times." },
    ],
    contributions: [
      { contextId: "chg-dr-verification", title: "DR readiness verification, Central US", classification: "Information", when: "Jun 9, 01:00 PT", minutes: 0, budgetPct: 0, customerImpacting: false, note: "Scheduled rehearsal; no durability impact expected or recorded." },
      { contextId: "evt-blob-latency", title: "Azure storage latency advisory, West US 2", classification: "Advisory", when: "Today 08:41 AM PT", minutes: 0, budgetPct: 0, customerImpacting: false, note: "Latency condition only — replication and checksum verification unaffected." },
    ],
    trend: "Stable",
    trendNote: "Durability has been unbroken across every window measured.",
  },
};
