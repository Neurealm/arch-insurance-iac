// Derived selectors and filtering for the Traditional NOC operations dashboard.

import { useEffect, useMemo, useState } from "react";
import {
  customerImpacts, emergingRisks, incidents, maintenanceRecords, opticalLinks,
  opticalTerminals, regionScorecards, trafficSeries, weatherExposures,
} from "@/data/opticalNetworkData";
import type { OperationsFilters } from "@/types/opticalOperations";

export const DEFAULT_FILTERS: OperationsFilters = {
  timeWindow: "Last 24 hours",
  region: "All regions",
  country: "All countries",
  domain: "All domains",
  severity: "All severities",
  customer: "All customers",
  service: "All services",
  site: "All sites",
  terminal: "All terminals",
  linkStatus: "All link statuses",
  incidentStatus: "All incident statuses",
  maintenanceStatus: "All maintenance",
};

export function useOperationsData(filters: OperationsFilters, refreshToken: number) {
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 180);
    return () => window.clearTimeout(timer);
  }, [refreshToken]);

  const terminals = useMemo(() => opticalTerminals.filter((t) =>
    (filters.region === DEFAULT_FILTERS.region || t.region === filters.region) &&
    (filters.country === DEFAULT_FILTERS.country || t.country === filters.country) &&
    (filters.terminal === DEFAULT_FILTERS.terminal || t.id === filters.terminal) &&
    (filters.site === DEFAULT_FILTERS.site || t.city === filters.site)),
    [filters]);

  const terminalIds = useMemo(() => new Set(terminals.map((t) => t.id)), [terminals]);

  const links = useMemo(() => opticalLinks.filter((l) =>
    terminalIds.has(l.sourceTerminalId) && terminalIds.has(l.targetTerminalId) &&
    (filters.domain === DEFAULT_FILTERS.domain || l.domain === filters.domain) &&
    (filters.linkStatus === DEFAULT_FILTERS.linkStatus || l.status === filters.linkStatus)),
    [terminalIds, filters]);

  const linkIds = useMemo(() => new Set(links.map((l) => l.id)), [links]);

  const activeIncidents = useMemo(() => incidents.filter((i) =>
    (filters.region === DEFAULT_FILTERS.region || i.region === filters.region) &&
    (filters.severity === DEFAULT_FILTERS.severity || i.severity === filters.severity) &&
    (filters.incidentStatus === DEFAULT_FILTERS.incidentStatus || i.status === filters.incidentStatus) &&
    (filters.service === DEFAULT_FILTERS.service || i.service === filters.service)),
    [filters]);

  const impacts = useMemo(() => customerImpacts.filter((c) =>
    (filters.region === DEFAULT_FILTERS.region || c.region === filters.region) &&
    (filters.customer === DEFAULT_FILTERS.customer || c.customer === filters.customer) &&
    (filters.service === DEFAULT_FILTERS.service || c.service === filters.service) &&
    (filters.severity === DEFAULT_FILTERS.severity || c.severity === filters.severity)),
    [filters]);

  const risks = useMemo(() => emergingRisks.filter((r) =>
    (filters.region === DEFAULT_FILTERS.region || r.region === filters.region)),
    [filters]);

  const maintenance = useMemo(() => maintenanceRecords.filter((m) =>
    (filters.region === DEFAULT_FILTERS.region || m.region === filters.region) &&
    (filters.maintenanceStatus === DEFAULT_FILTERS.maintenanceStatus || m.kind === filters.maintenanceStatus)),
    [filters]);

  const weather = useMemo(() => weatherExposures.filter((w) =>
    (filters.region === DEFAULT_FILTERS.region || w.region === filters.region)),
    [filters]);

  const regions = useMemo(() => regionScorecards.filter((r) =>
    (filters.region === DEFAULT_FILTERS.region || r.region === filters.region)),
    [filters]);

  const metrics = useMemo(() => {
    const healthyLinks = links.filter((l) => l.status === "healthy").length;
    const degradedLinks = links.filter((l) => l.status === "degraded").length;
    const unavailableLinks = links.filter((l) => l.status === "critical").length;
    const belowMargin = links.filter((l) => l.linkMarginDb < 3.5).length;
    const availability = links.length
      ? links.reduce((sum, l) => sum + l.availability, 0) / links.length
      : 0;
    const utilization = links.length
      ? links.reduce((sum, l) => sum + l.utilizationPercent, 0) / links.length
      : 0;
    return {
      availability,
      availabilityTarget: 99.95,
      availabilityDelta: -0.03,
      unavailableLinks,
      customersAffected: impacts.reduce((s, c) => s + (c.state === "Unavailable" ? c.affectedTrafficGbps * 0 : 0), 0) ||
        terminals.reduce((s, t) => s + t.customersAffected, 0),
      servicesAffected: impacts.length,
      criticalCustomers: impacts.filter((c) => c.enterprise).length,
      estimatedDurationMinutes: impacts.length ? Math.max(...impacts.map((c) => c.durationMinutes)) : 0,
      criticalIncidents: activeIncidents.filter((i) => i.severity === "Critical").length,
      majorIncidents: activeIncidents.filter((i) => i.severity === "Major").length,
      oldestIncidentMinutes: activeIncidents.length ? Math.max(...activeIncidents.map((i) => i.durationMinutes)) : 0,
      unownedIncidents: activeIncidents.filter((i) => i.commander === "Unassigned").length,
      healthyLinks, degradedLinks, belowMargin,
      healthyTerminals: terminals.filter((t) => t.status === "healthy").length,
      degradedTerminals: terminals.filter((t) => t.status === "degraded").length,
      offlineTerminals: terminals.filter((t) => t.status === "critical").length,
      maintenanceTerminals: terminals.filter((t) => t.status === "maintenance").length,
      utilization,
      peakUtilization: links.length ? Math.max(...links.map((l) => l.utilizationPercent)) : 0,
      linksAbove70: links.filter((l) => l.utilizationPercent >= 70).length,
      linksAbove80: links.filter((l) => l.utilizationPercent >= 80).length,
      linksAbove90: links.filter((l) => l.utilizationPercent >= 90).length,
      activeChanges: maintenance.filter((m) => m.kind === "Active").length,
      upcomingMaintenance: maintenance.filter((m) => m.kind === "Upcoming").length,
      highRiskChanges: maintenance.filter((m) => m.risk === "high" || m.risk === "critical").length,
      highRiskLinks: links.filter((l) => l.riskLevel === "high" || l.riskLevel === "critical").length,
      weatherExposedLinks: links.filter((l) => l.weatherExposed).length,
      capacityRisks: links.filter((l) => l.utilizationPercent >= 80).length,
      agingIncidents: activeIncidents.filter((i) => i.durationMinutes >= 60).length,
    };
  }, [links, terminals, impacts, activeIncidents, maintenance]);

  return {
    loading, error, terminals, links, linkIds,
    incidents: activeIncidents, impacts, risks, maintenance, weather, regions,
    traffic: trafficSeries, metrics,
  };
}

/** Weighted regional operational status (availability 30, impact 25, incidents 20, degradation 10, capacity 5, weather 5, change 5). */
export function regionalScore(r: {
  availability: number; customersAffected: number; criticalIncidents: number;
  degradedLinks: number; capacityPressurePercent: number; weatherExposedLinks: number; changeRiskPercent: number;
}) {
  const availabilityScore = Math.max(0, Math.min(1, (r.availability - 98.5) / 1.5));
  const impactScore = Math.max(0, 1 - r.customersAffected / 50000);
  const incidentScore = Math.max(0, 1 - r.criticalIncidents / 2);
  const degradationScore = Math.max(0, 1 - r.degradedLinks / 3);
  const capacityScore = Math.max(0, 1 - r.capacityPressurePercent / 100);
  const weatherScore = Math.max(0, 1 - r.weatherExposedLinks / 3);
  const changeScore = Math.max(0, 1 - r.changeRiskPercent / 100);
  const score =
    availabilityScore * 30 + impactScore * 25 + incidentScore * 20 +
    degradationScore * 10 + capacityScore * 5 + weatherScore * 5 + changeScore * 5;
  const status: "healthy" | "degraded" | "critical" =
    score >= 85 ? "healthy" : score >= 65 ? "degraded" : "critical";
  return { score: Math.round(score), status };
}
