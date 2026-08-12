// Traditional NOC — deterministic synthetic operational dataset.
// Terra Communications global optical network demonstration data.

import type {
  CustomerImpactRecord, EmergingRisk, LeadershipAction, MaintenanceRecord,
  OperationalIncident, OpticalLink, OpticalTerminal, RegionScorecard,
  ShiftHandoff, TrafficPoint, WeatherExposure,
} from "@/types/opticalOperations";

export const REGIONS = [
  "North America", "Latin America", "Europe", "Middle East", "Africa", "Asia Pacific",
] as const;

export const NETWORK_DOMAINS = ["Long-haul", "Metro", "Subsea", "Free-space optical"] as const;

export const opticalTerminals: OpticalTerminal[] = [
  { id: "chi-01", name: "Chicago Optical Hub", city: "Chicago", country: "United States", region: "North America", latitude: 41.8781, longitude: -87.6298, status: "healthy", availability: 99.99, activeAlarms: 0, connectedLinks: 4, customersAffected: 0, weatherCondition: "Clear", lastTelemetryAt: "2026-08-05T14:31:00Z", telemetryDelaySec: 6 },
  { id: "atl-01", name: "Atlanta Optical Hub", city: "Atlanta", country: "United States", region: "North America", latitude: 33.749, longitude: -84.388, status: "degraded", availability: 99.71, activeAlarms: 3, connectedLinks: 5, customersAffected: 12480, weatherCondition: "Heavy rain", lastTelemetryAt: "2026-08-05T14:30:30Z", alignmentIssue: true, telemetryDelaySec: 32 },
  { id: "lax-01", name: "Los Angeles Optical Hub", city: "Los Angeles", country: "United States", region: "North America", latitude: 34.0522, longitude: -118.2437, status: "healthy", availability: 99.96, activeAlarms: 1, connectedLinks: 4, customersAffected: 0, weatherCondition: "Clear", lastTelemetryAt: "2026-08-05T14:30:52Z", telemetryDelaySec: 9 },
  { id: "lon-01", name: "London Optical Hub", city: "London", country: "United Kingdom", region: "Europe", latitude: 51.5072, longitude: -0.1276, status: "healthy", availability: 99.97, activeAlarms: 1, connectedLinks: 6, customersAffected: 0, weatherCondition: "Cloudy", lastTelemetryAt: "2026-08-05T14:30:45Z", telemetryDelaySec: 8 },
  { id: "ams-01", name: "Amsterdam Optical Hub", city: "Amsterdam", country: "Netherlands", region: "Europe", latitude: 52.3676, longitude: 4.9041, status: "maintenance", availability: 99.91, activeAlarms: 0, connectedLinks: 5, customersAffected: 0, weatherCondition: "Clear", lastTelemetryAt: "2026-08-05T14:29:55Z", telemetryDelaySec: 12 },
  { id: "fra-01", name: "Frankfurt Optical Hub", city: "Frankfurt", country: "Germany", region: "Europe", latitude: 50.1109, longitude: 8.6821, status: "healthy", availability: 99.98, activeAlarms: 0, connectedLinks: 6, customersAffected: 0, weatherCondition: "Clear", lastTelemetryAt: "2026-08-05T14:31:02Z", telemetryDelaySec: 5 },
  { id: "dxb-01", name: "Dubai Optical Hub", city: "Dubai", country: "United Arab Emirates", region: "Middle East", latitude: 25.2048, longitude: 55.2708, status: "degraded", availability: 99.68, activeAlarms: 2, connectedLinks: 4, customersAffected: 5100, weatherCondition: "Dust storm", lastTelemetryAt: "2026-08-05T14:30:20Z", telemetryDelaySec: 21 },
  { id: "jnb-01", name: "Johannesburg Optical Hub", city: "Johannesburg", country: "South Africa", region: "Africa", latitude: -26.2041, longitude: 28.0473, status: "healthy", availability: 99.93, activeAlarms: 1, connectedLinks: 3, customersAffected: 0, weatherCondition: "Clear", lastTelemetryAt: "2026-08-05T14:30:35Z", powerIssue: true, telemetryDelaySec: 18 },
  { id: "mum-01", name: "Mumbai Optical Hub", city: "Mumbai", country: "India", region: "Asia Pacific", latitude: 19.076, longitude: 72.8777, status: "critical", availability: 98.84, activeAlarms: 7, connectedLinks: 4, customersAffected: 48210, weatherCondition: "Severe rain", lastTelemetryAt: "2026-08-05T14:31:10Z", alignmentIssue: true, connectivityIssue: true, telemetryDelaySec: 44 },
  { id: "sin-01", name: "Singapore Optical Hub", city: "Singapore", country: "Singapore", region: "Asia Pacific", latitude: 1.3521, longitude: 103.8198, status: "healthy", availability: 99.98, activeAlarms: 0, connectedLinks: 6, customersAffected: 0, weatherCondition: "Clear", lastTelemetryAt: "2026-08-05T14:30:15Z", telemetryDelaySec: 7 },
  { id: "syd-01", name: "Sydney Optical Hub", city: "Sydney", country: "Australia", region: "Asia Pacific", latitude: -33.8688, longitude: 151.2093, status: "degraded", availability: 99.62, activeAlarms: 2, connectedLinks: 3, customersAffected: 7400, weatherCondition: "High wind", lastTelemetryAt: "2026-08-05T14:30:05Z", telemetryDelaySec: 26 },
  { id: "sao-01", name: "São Paulo Optical Hub", city: "São Paulo", country: "Brazil", region: "Latin America", latitude: -23.5505, longitude: -46.6333, status: "healthy", availability: 99.94, activeAlarms: 1, connectedLinks: 3, customersAffected: 0, weatherCondition: "Clear", lastTelemetryAt: "2026-08-05T14:29:40Z", telemetryDelaySec: 11 },
];

export const opticalLinks: OpticalLink[] = [
  { id: "chi-atl-01", name: "CHI–ATL Optical Route", sourceTerminalId: "chi-01", targetTerminalId: "atl-01", region: "North America", domain: "Long-haul", status: "degraded", capacityGbps: 400, utilizationPercent: 84, linkMarginDb: 2.8, availability: 99.74, activeAlarms: 2, customersAffected: 12480, incidentId: "INC-56231", riskLevel: "high", weatherExposed: true, receivedPowerDbm: -18.4, transmitPowerDbm: 3.1, bitErrorRate: "4.2e-7", packetLossPercent: 0.18, latencyMs: 14.2, alignmentState: "Drifting" },
  { id: "chi-lax-01", name: "CHI–LAX Optical Route", sourceTerminalId: "chi-01", targetTerminalId: "lax-01", region: "North America", domain: "Long-haul", status: "healthy", capacityGbps: 600, utilizationPercent: 66, linkMarginDb: 6.9, availability: 99.99, activeAlarms: 0, customersAffected: 0, riskLevel: "low", weatherExposed: false, receivedPowerDbm: -12.1, transmitPowerDbm: 3.0, bitErrorRate: "8.0e-12", packetLossPercent: 0.0, latencyMs: 21.5, alignmentState: "Locked" },
  { id: "atl-lon-01", name: "ATL–LON Transatlantic Route", sourceTerminalId: "atl-01", targetTerminalId: "lon-01", region: "Europe", domain: "Subsea", status: "healthy", capacityGbps: 800, utilizationPercent: 61, linkMarginDb: 6.4, availability: 99.98, activeAlarms: 0, customersAffected: 0, riskLevel: "medium", weatherExposed: false, receivedPowerDbm: -13.7, transmitPowerDbm: 4.2, bitErrorRate: "2.1e-11", packetLossPercent: 0.01, latencyMs: 74.8, alignmentState: "Locked" },
  { id: "lon-ams-01", name: "LON–AMS Optical Route", sourceTerminalId: "lon-01", targetTerminalId: "ams-01", region: "Europe", domain: "Metro", status: "maintenance", capacityGbps: 400, utilizationPercent: 38, linkMarginDb: 7.1, availability: 99.91, activeAlarms: 0, customersAffected: 0, riskLevel: "low", weatherExposed: false, receivedPowerDbm: -10.9, transmitPowerDbm: 2.8, bitErrorRate: "1.0e-12", packetLossPercent: 0.0, latencyMs: 5.4, alignmentState: "Nominal" },
  { id: "lon-fra-01", name: "LON–FRA Optical Route", sourceTerminalId: "lon-01", targetTerminalId: "fra-01", region: "Europe", domain: "Long-haul", status: "healthy", capacityGbps: 600, utilizationPercent: 72, linkMarginDb: 6.1, availability: 99.97, activeAlarms: 1, customersAffected: 0, riskLevel: "medium", weatherExposed: false, receivedPowerDbm: -12.6, transmitPowerDbm: 3.3, bitErrorRate: "6.4e-11", packetLossPercent: 0.02, latencyMs: 9.1, alignmentState: "Locked" },
  { id: "fra-dxb-01", name: "FRA–DXB Optical Route", sourceTerminalId: "fra-01", targetTerminalId: "dxb-01", region: "Middle East", domain: "Long-haul", status: "degraded", capacityGbps: 500, utilizationPercent: 81, linkMarginDb: 3.4, availability: 99.68, activeAlarms: 2, customersAffected: 5100, incidentId: "INC-56239", riskLevel: "high", weatherExposed: true, receivedPowerDbm: -17.8, transmitPowerDbm: 3.6, bitErrorRate: "2.8e-8", packetLossPercent: 0.12, latencyMs: 48.3, alignmentState: "Drifting" },
  { id: "ams-mum-01", name: "AMS–MUM Long-Haul Route", sourceTerminalId: "ams-01", targetTerminalId: "mum-01", region: "Asia Pacific", domain: "Long-haul", status: "critical", capacityGbps: 600, utilizationPercent: 92, linkMarginDb: 1.4, availability: 98.77, activeAlarms: 5, customersAffected: 48210, incidentId: "INC-56228", riskLevel: "critical", weatherExposed: true, receivedPowerDbm: -22.9, transmitPowerDbm: 4.0, bitErrorRate: "9.6e-6", packetLossPercent: 0.94, latencyMs: 96.4, alignmentState: "Realigning" },
  { id: "mum-sin-01", name: "MUM–SIN Optical Route", sourceTerminalId: "mum-01", targetTerminalId: "sin-01", region: "Asia Pacific", domain: "Subsea", status: "degraded", capacityGbps: 500, utilizationPercent: 86, linkMarginDb: 2.2, availability: 99.41, activeAlarms: 3, customersAffected: 17200, incidentId: "INC-56228", riskLevel: "high", weatherExposed: true, receivedPowerDbm: -19.6, transmitPowerDbm: 3.8, bitErrorRate: "1.4e-7", packetLossPercent: 0.31, latencyMs: 42.7, alignmentState: "Drifting" },
  { id: "sin-syd-01", name: "SIN–SYD Optical Route", sourceTerminalId: "sin-01", targetTerminalId: "syd-01", region: "Asia Pacific", domain: "Free-space optical", status: "degraded", capacityGbps: 400, utilizationPercent: 78, linkMarginDb: 3.1, availability: 99.62, activeAlarms: 2, customersAffected: 7400, incidentId: "INC-56234", riskLevel: "high", weatherExposed: true, receivedPowerDbm: -18.9, transmitPowerDbm: 3.4, bitErrorRate: "5.5e-8", packetLossPercent: 0.16, latencyMs: 61.2, alignmentState: "Drifting" },
  { id: "sao-atl-01", name: "SAO–ATL Optical Route", sourceTerminalId: "sao-01", targetTerminalId: "atl-01", region: "Latin America", domain: "Subsea", status: "healthy", capacityGbps: 400, utilizationPercent: 57, linkMarginDb: 6.2, availability: 99.95, activeAlarms: 0, customersAffected: 0, riskLevel: "low", weatherExposed: false, receivedPowerDbm: -13.2, transmitPowerDbm: 3.0, bitErrorRate: "3.0e-11", packetLossPercent: 0.0, latencyMs: 112.4, alignmentState: "Locked" },
  { id: "sao-jnb-01", name: "SAO–JNB Transatlantic South Route", sourceTerminalId: "sao-01", targetTerminalId: "jnb-01", region: "Africa", domain: "Subsea", status: "healthy", capacityGbps: 300, utilizationPercent: 49, linkMarginDb: 5.8, availability: 99.93, activeAlarms: 1, customersAffected: 0, riskLevel: "medium", weatherExposed: false, receivedPowerDbm: -14.4, transmitPowerDbm: 2.9, bitErrorRate: "7.2e-11", packetLossPercent: 0.01, latencyMs: 128.6, alignmentState: "Locked" },
  { id: "jnb-dxb-01", name: "JNB–DXB Optical Route", sourceTerminalId: "jnb-01", targetTerminalId: "dxb-01", region: "Middle East", domain: "Long-haul", status: "healthy", capacityGbps: 300, utilizationPercent: 64, linkMarginDb: 5.4, availability: 99.9, activeAlarms: 0, customersAffected: 0, riskLevel: "medium", weatherExposed: true, receivedPowerDbm: -15.1, transmitPowerDbm: 3.2, bitErrorRate: "9.1e-11", packetLossPercent: 0.02, latencyMs: 71.9, alignmentState: "Nominal" },
];

export const customerImpacts: CustomerImpactRecord[] = [
  { id: "imp-01", customer: "Bharat Mobile Networks", enterprise: true, service: "Enterprise Backhaul 041", region: "Asia Pacific", severity: "Critical", durationMinutes: 92, affectedTrafficGbps: 210, slaMinutesAtRisk: 92, estimatedRestoration: "16:05 UTC", state: "Degraded", linkIds: ["ams-mum-01", "mum-sin-01"] },
  { id: "imp-02", customer: "Meridian Financial Group", enterprise: true, service: "Low-latency Trading Transport", region: "Asia Pacific", severity: "Critical", durationMinutes: 92, affectedTrafficGbps: 48, slaMinutesAtRisk: 184, estimatedRestoration: "15:50 UTC", state: "Degraded", linkIds: ["ams-mum-01"] },
  { id: "imp-03", customer: "Southern Grid Utilities", enterprise: true, service: "Regional Control Network", region: "North America", severity: "Major", durationMinutes: 68, affectedTrafficGbps: 32, slaMinutesAtRisk: 34, estimatedRestoration: "15:35 UTC", state: "Degraded", linkIds: ["chi-atl-01"] },
  { id: "imp-04", customer: "Pacific Cloud Services", enterprise: true, service: "Inter-region Replication", region: "Asia Pacific", severity: "Major", durationMinutes: 41, affectedTrafficGbps: 74, slaMinutesAtRisk: 41, estimatedRestoration: "15:20 UTC", state: "Degraded", linkIds: ["sin-syd-01"] },
  { id: "imp-05", customer: "Gulf Media Distribution", enterprise: false, service: "Broadcast Contribution Feed", region: "Middle East", severity: "Minor", durationMinutes: 26, affectedTrafficGbps: 18, slaMinutesAtRisk: 0, estimatedRestoration: "15:10 UTC", state: "Degraded", linkIds: ["fra-dxb-01"] },
  { id: "imp-06", customer: "Chennai Metro Broadband", enterprise: false, service: "Consumer Aggregation 7", region: "Asia Pacific", severity: "Major", durationMinutes: 92, affectedTrafficGbps: 96, slaMinutesAtRisk: 46, estimatedRestoration: "16:05 UTC", state: "Unavailable", linkIds: ["ams-mum-01"] },
];

export const incidents: OperationalIncident[] = [
  {
    id: "INC-56228", title: "Mumbai optical corridor degradation", severity: "Critical",
    service: "Enterprise Backhaul 041", region: "Asia Pacific", customersAffected: 48210,
    startedAt: "2026-08-05T12:59:00Z", durationMinutes: 92, commander: "R. Iyer",
    technicalOwner: "APAC Optical Engineering", phase: "Mitigating",
    estimatedRestoration: "16:05 UTC", status: "Open",
    hypothesis: "Monsoon-driven attenuation on the AMS–MUM corridor combined with a pointing drift on Mumbai Terminal B.",
    affectedServices: ["Enterprise Backhaul 041", "Low-latency Trading Transport", "Consumer Aggregation 7"],
    affectedLinkIds: ["ams-mum-01", "mum-sin-01"], affectedTerminalIds: ["mum-01", "ams-01"],
    actionsCompleted: ["Priority traffic shifted to protected route", "Terminal diagnostics completed", "Customer notification issued"],
    nextActions: ["Approve protected-route traffic shift for remaining 3.1 Gbps", "Validate link margin sustained above 4.0 dB for 15 minutes"],
    escalations: ["APAC Director of Network Operations", "Enterprise Service Assurance"],
    communications: "Customer advisory 2 issued 14:05 UTC; next update 15:05 UTC",
    timeline: [
      { at: "12:59 UTC", event: "Link margin alarm raised on AMS–MUM", actor: "Alarm system" },
      { at: "13:04 UTC", event: "Incident declared Critical", actor: "APAC NOC" },
      { at: "13:22 UTC", event: "Priority traffic moved to protected route", actor: "R. Iyer" },
      { at: "14:05 UTC", event: "Customer advisory 2 issued", actor: "Service Assurance" },
      { at: "14:28 UTC", event: "Link margin recovering, monitoring sustained threshold", actor: "APAC Optical Engineering" },
    ],
  },
  {
    id: "INC-56231", title: "Chicago–Atlanta route degradation", severity: "Major",
    service: "Regional Control Network", region: "North America", customersAffected: 12480,
    startedAt: "2026-08-05T13:23:00Z", durationMinutes: 68, commander: "D. Okafor",
    technicalOwner: "NA Transport Operations", phase: "Investigating",
    estimatedRestoration: "15:35 UTC", status: "Open",
    hypothesis: "Heavy rainfall at Atlanta plus alignment drift is reducing received optical power below the operating window.",
    affectedServices: ["Regional Control Network", "Enterprise VPN South"],
    affectedLinkIds: ["chi-atl-01"], affectedTerminalIds: ["atl-01"],
    actionsCompleted: ["Baseline captured", "Alignment telemetry pulled"],
    nextActions: ["Schedule alignment correction", "Assess capacity headroom on CHI–LAX"],
    escalations: ["NA Regional Operations Lead"],
    communications: "Internal only; no customer advisory required yet",
    timeline: [
      { at: "13:23 UTC", event: "Low link margin alarm", actor: "Alarm system" },
      { at: "13:31 UTC", event: "Incident triaged as Major", actor: "NA NOC" },
      { at: "14:02 UTC", event: "Weather correlation confirmed", actor: "D. Okafor" },
    ],
  },
  {
    id: "INC-56234", title: "Singapore–Sydney capacity pressure", severity: "Major",
    service: "Inter-region Replication", region: "Asia Pacific", customersAffected: 7400,
    startedAt: "2026-08-05T13:52:00Z", durationMinutes: 41, commander: "L. Tran",
    technicalOwner: "APAC Transport Operations", phase: "Monitoring",
    estimatedRestoration: "15:20 UTC", status: "Monitoring",
    hypothesis: "Sustained high wind is causing alignment drift, reducing usable capacity during peak replication.",
    affectedServices: ["Inter-region Replication"],
    affectedLinkIds: ["sin-syd-01"], affectedTerminalIds: ["syd-01"],
    actionsCompleted: ["Replication window rescheduled", "Tracking correction rate increased"],
    nextActions: ["Confirm stability for 30 minutes", "Close incident if margin holds above 4 dB"],
    escalations: [],
    communications: "Customer informed of replication delay",
    timeline: [
      { at: "13:52 UTC", event: "Capacity threshold breach detected", actor: "Alarm system" },
      { at: "14:11 UTC", event: "Replication rescheduled", actor: "L. Tran" },
    ],
  },
  {
    id: "INC-56239", title: "Dubai dust storm attenuation", severity: "Minor",
    service: "Broadcast Contribution Feed", region: "Middle East", customersAffected: 5100,
    startedAt: "2026-08-05T14:06:00Z", durationMinutes: 26, commander: "Unassigned",
    technicalOwner: "MEA Transport Operations", phase: "Triaged",
    estimatedRestoration: "15:10 UTC", status: "Open",
    hypothesis: "Airborne particulate attenuation on the FRA–DXB corridor.",
    affectedServices: ["Broadcast Contribution Feed"],
    affectedLinkIds: ["fra-dxb-01"], affectedTerminalIds: ["dxb-01"],
    actionsCompleted: ["Weather exposure confirmed"],
    nextActions: ["Assign incident commander", "Prepare protected-route option"],
    escalations: ["MEA Regional Operations Lead"],
    communications: "No customer advisory issued",
    timeline: [{ at: "14:06 UTC", event: "Attenuation alarm raised", actor: "Alarm system" }],
  },
];

export const leadershipActions: LeadershipAction[] = [
  { id: "la-01", priority: "Critical", issue: "Mumbai optical corridor degradation", impact: "48,210 customers affected across three enterprise services", durationMinutes: 92, owner: "APAC Network Operations", nextAction: "Approve protected-route traffic shift", decisionDeadlineMinutes: 12, incidentId: "INC-56228", region: "Asia Pacific" },
  { id: "la-02", priority: "Critical", issue: "AMS–MUM capacity at 92% with declining margin", impact: "Loss of the protected route would remove 600 Gbps of long-haul capacity", durationMinutes: 74, owner: "Global Capacity Planning", nextAction: "Authorise emergency capacity release on FRA–DXB", decisionDeadlineMinutes: 25, region: "Asia Pacific" },
  { id: "la-03", priority: "High", issue: "Chicago–Atlanta alignment drift", impact: "12,480 customers degraded on the Regional Control Network", durationMinutes: 68, owner: "NA Transport Operations", nextAction: "Approve out-of-window alignment correction", decisionDeadlineMinutes: 40, incidentId: "INC-56231", region: "North America" },
  { id: "la-04", priority: "High", issue: "Dubai incident has no commander assigned", impact: "5,100 broadcast customers degraded without a named owner", durationMinutes: 26, owner: "MEA Regional Operations", nextAction: "Assign incident commander", decisionDeadlineMinutes: 10, incidentId: "INC-56239", region: "Middle East" },
  { id: "la-05", priority: "Medium", issue: "Amsterdam maintenance overlaps peak APAC window", impact: "Reduces reroute options for the Mumbai corridor during restoration", durationMinutes: 55, owner: "Change Advisory Board", nextAction: "Approve deferral of CHG-4471 by four hours", decisionDeadlineMinutes: 55, region: "Europe" },
];

export const emergingRisks: EmergingRisk[] = [
  { id: "risk-01", linkId: "ams-mum-01", linkName: "AMS–MUM Long-Haul Route", region: "Asia Pacific", driver: "Declining link margin", currentStatus: "critical", probabilityPercent: 82, expectedImpact: "Loss of 600 Gbps and full enterprise backhaul outage", timeToThresholdHours: 1.5, preparation: "Pre-stage protected-route capacity and hold change freeze", level: "critical" },
  { id: "risk-02", linkId: "chi-atl-01", linkName: "CHI–ATL Optical Route", region: "North America", driver: "Weather exposure", currentStatus: "degraded", probabilityPercent: 71, expectedImpact: "Regional control traffic degraded for a further 90 minutes", timeToThresholdHours: 2.0, preparation: "Prepare reroute over CHI–LAX and notify customer", level: "high" },
  { id: "risk-03", linkId: "mum-sin-01", linkName: "MUM–SIN Optical Route", region: "Asia Pacific", driver: "Capacity pressure", currentStatus: "degraded", probabilityPercent: 64, expectedImpact: "Utilisation breaches 90% during evening peak", timeToThresholdHours: 4.5, preparation: "Shift replication traffic to off-peak window", level: "high" },
  { id: "risk-04", linkId: "fra-dxb-01", linkName: "FRA–DXB Optical Route", region: "Middle East", driver: "Recurring alignment drift", currentStatus: "degraded", probabilityPercent: 58, expectedImpact: "Broadcast feed interruption during dust peak", timeToThresholdHours: 3.0, preparation: "Increase tracking correction rate and stage field team", level: "medium" },
  { id: "risk-05", linkId: "sin-syd-01", linkName: "SIN–SYD Optical Route", region: "Asia Pacific", driver: "High bit error rate", currentStatus: "degraded", probabilityPercent: 46, expectedImpact: "Replication windows extend beyond agreed schedule", timeToThresholdHours: 6.0, preparation: "Hold current distribution and monitor error trend", level: "medium" },
  { id: "risk-06", linkId: "jnb-dxb-01", linkName: "JNB–DXB Optical Route", region: "Middle East", driver: "Terminal instability", currentStatus: "healthy", probabilityPercent: 22, expectedImpact: "Single terminal power event could remove 300 Gbps", timeToThresholdHours: 12.0, preparation: "Validate backup power and telemetry freshness", level: "low" },
];

export const maintenanceRecords: MaintenanceRecord[] = [
  { id: "CHG-4471", kind: "Active", region: "Europe", affectedLinkIds: ["lon-ams-01"], affectedServices: ["Metro Transit EU"], customerExposure: 0, startTime: "2026-08-05T13:00:00Z", endTime: "2026-08-05T17:00:00Z", owner: "EU Field Engineering", risk: "medium", status: "In progress", rollbackReadiness: "Ready" },
  { id: "CHG-4482", kind: "Active", region: "North America", affectedLinkIds: ["chi-lax-01"], affectedServices: ["Enterprise VPN West"], customerExposure: 0, startTime: "2026-08-05T14:00:00Z", endTime: "2026-08-05T15:30:00Z", owner: "NA Transport Operations", risk: "low", status: "In progress", rollbackReadiness: "Ready" },
  { id: "MNT-2298", kind: "Upcoming", region: "Asia Pacific", affectedLinkIds: ["mum-sin-01"], affectedServices: ["Enterprise Backhaul 041"], customerExposure: 17200, startTime: "2026-08-05T20:00:00Z", endTime: "2026-08-06T00:00:00Z", owner: "APAC Field Engineering", risk: "high", status: "Scheduled", rollbackReadiness: "Partial" },
  { id: "MNT-2301", kind: "Upcoming", region: "Africa", affectedLinkIds: ["sao-jnb-01"], affectedServices: ["Transatlantic South Transit"], customerExposure: 0, startTime: "2026-08-06T02:00:00Z", endTime: "2026-08-06T05:00:00Z", owner: "MEA Field Engineering", risk: "low", status: "Scheduled", rollbackReadiness: "Ready" },
  { id: "CHG-4463", kind: "Recent change", region: "Europe", affectedLinkIds: ["lon-fra-01"], affectedServices: ["EU Core Transit"], customerExposure: 0, startTime: "2026-08-05T06:00:00Z", endTime: "2026-08-05T07:15:00Z", owner: "EU Transport Operations", risk: "low", status: "Successful", rollbackReadiness: "Not required" },
  { id: "CHG-4459", kind: "Recent change", region: "Asia Pacific", affectedLinkIds: ["sin-syd-01"], affectedServices: ["Inter-region Replication"], customerExposure: 7400, startTime: "2026-08-05T02:00:00Z", endTime: "2026-08-05T03:40:00Z", owner: "APAC Transport Operations", risk: "high", status: "Rolled back", rollbackReadiness: "Ready" },
];

export const changeFailureRatePercent = 4.2;
export const changeFailureRateBaselinePercent = 2.1;

export const weatherExposures: WeatherExposure[] = [
  { id: "wx-01", condition: "Severe rain", measure: "68 mm/h rainfall, visibility 400 m", region: "Asia Pacific", linkId: "ams-mum-01", linkName: "AMS–MUM Long-Haul Route", linkMarginDb: 1.4, customersAffected: 48210, level: "critical", expectedDurationHours: 3, recommendation: "Hold priority traffic on the protected route until margin sustains above 4 dB" },
  { id: "wx-02", condition: "Heavy rain", measure: "24 mm/h rainfall, visibility 2.1 km", region: "North America", linkId: "chi-atl-01", linkName: "CHI–ATL Optical Route", linkMarginDb: 2.8, customersAffected: 12480, level: "high", expectedDurationHours: 2, recommendation: "Prepare reroute over CHI–LAX and defer alignment work" },
  { id: "wx-03", condition: "Dust storm", measure: "Particulate index 7.4, visibility 900 m", region: "Middle East", linkId: "fra-dxb-01", linkName: "FRA–DXB Optical Route", linkMarginDb: 3.4, customersAffected: 5100, level: "high", expectedDurationHours: 4, recommendation: "Increase tracking correction rate and monitor received power" },
  { id: "wx-04", condition: "High wind", measure: "72 km/h gusts, structural vibration 0.6 mm", region: "Asia Pacific", linkId: "sin-syd-01", linkName: "SIN–SYD Optical Route", linkMarginDb: 3.1, customersAffected: 7400, level: "medium", expectedDurationHours: 5, recommendation: "Hold replication traffic until vibration falls below 0.4 mm" },
  { id: "wx-05", condition: "High temperature", measure: "44 °C ambient at shelter", region: "Middle East", linkId: "jnb-dxb-01", linkName: "JNB–DXB Optical Route", linkMarginDb: 5.4, customersAffected: 0, level: "low", expectedDurationHours: 6, recommendation: "Verify cooling margin on Dubai terminal enclosure" },
];

export const regionScorecards: RegionScorecard[] = [
  { region: "North America", availability: 99.94, customersAffected: 12480, criticalIncidents: 0, degradedLinks: 1, offlineTerminals: 0, capacityPressurePercent: 71, weatherExposedLinks: 1, changeRiskPercent: 12 },
  { region: "Latin America", availability: 99.97, customersAffected: 0, criticalIncidents: 0, degradedLinks: 0, offlineTerminals: 0, capacityPressurePercent: 54, weatherExposedLinks: 0, changeRiskPercent: 5 },
  { region: "Europe", availability: 99.96, customersAffected: 0, criticalIncidents: 0, degradedLinks: 0, offlineTerminals: 0, capacityPressurePercent: 62, weatherExposedLinks: 0, changeRiskPercent: 22 },
  { region: "Middle East", availability: 99.79, customersAffected: 5100, criticalIncidents: 0, degradedLinks: 1, offlineTerminals: 0, capacityPressurePercent: 74, weatherExposedLinks: 2, changeRiskPercent: 15 },
  { region: "Africa", availability: 99.93, customersAffected: 0, criticalIncidents: 0, degradedLinks: 0, offlineTerminals: 0, capacityPressurePercent: 49, weatherExposedLinks: 0, changeRiskPercent: 8 },
  { region: "Asia Pacific", availability: 99.12, customersAffected: 55610, criticalIncidents: 1, degradedLinks: 2, offlineTerminals: 0, capacityPressurePercent: 88, weatherExposedLinks: 3, changeRiskPercent: 34 },
];

export const trafficSeries: TrafficPoint[] = Array.from({ length: 25 }, (_, i) => {
  const base = 16.2 + Math.sin((i / 24) * Math.PI * 2 - 1.2) * 3.1 + (i % 3) * 0.12;
  const traffic = Number(base.toFixed(2));
  const capacity = 30.2;
  return {
    time: `${String(i).padStart(2, "0")}:00`,
    trafficTbps: traffic,
    capacityTbps: capacity,
    utilizationPercent: Number(((traffic / capacity) * 100).toFixed(1)),
  };
});

export const shiftHandoff: ShiftHandoff = {
  currentShift: "Shift B — 12:00 to 20:00 UTC",
  outgoingLead: "M. Alvarez, Global NOC Shift Lead",
  incomingLead: "K. Wallace, Global NOC Shift Lead",
  openIncidents: 3,
  pendingEscalations: 2,
  unacknowledgedAlarms: 5,
  maintenanceInProgress: 2,
  actionsDueNextHour: [
    "Approve protected-route traffic shift for INC-56228",
    "Assign incident commander for INC-56239",
    "Confirm CHG-4482 completion and close change record",
  ],
  concerns: [
    "Mumbai corridor remains weather exposed for a further three hours",
    "APAC capacity headroom is below 12% during evening peak",
    "Amsterdam maintenance limits reroute options until 17:00 UTC",
  ],
};

export const nocStrengths = [
  { title: "Real-time visibility", description: "Continuous monitoring provides immediate awareness of infrastructure health, service disruption, and optical network instability." },
  { title: "Fast alert detection", description: "Threshold and alarm correlation surface link margin loss, power anomalies, and terminal faults within seconds of onset." },
  { title: "Operational discipline", description: "Severity models, escalation paths, and named ownership keep every major incident structured and accountable." },
  { title: "24-hour coverage", description: "Follow-the-sun shifts and documented handoff protect service continuity across every region without gaps." },
  { title: "Repeatable incident response", description: "Established runbooks make detection, triage, mitigation, and restoration consistent across regions and teams." },
];
