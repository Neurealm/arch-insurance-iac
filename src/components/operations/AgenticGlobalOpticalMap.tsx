// Global Reliability Digital Twin — SRE Based Agentic NOC.
// Rendered locally with d3-geo + world-atlas. No remote tiles or geography requests.

import { useMemo, useState } from "react";
import {
  geoInterpolate, geoNaturalEarth1, geoPath, type GeoProjection,
} from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import type {
  MapLayers, NetworkStatus, OpticalLink, OpticalTerminal,
} from "@/types/agenticOpticalOperations";

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 540;

export const statusStyle: Record<NetworkStatus, { label: string; stroke: string; fill: string; dash?: string }> = {
  healthy: { label: "Healthy", stroke: "#15803d", fill: "#22c55e" },
  degraded: { label: "Degraded", stroke: "#d97706", fill: "#f59e0b" },
  critical: { label: "Critical", stroke: "#dc2626", fill: "#ef4444" },
  "at-risk": { label: "At Risk", stroke: "#c2410c", fill: "#fb923c", dash: "5 4" },
  maintenance: { label: "Maintenance", stroke: "#7c3aed", fill: "#8b5cf6", dash: "8 6" },
  "recovery-active": { label: "Recovery Active", stroke: "#2563eb", fill: "#3b82f6", dash: "4 3" },
  validated: { label: "Validated", stroke: "#0f766e", fill: "#14b8a6" },
};

export function createGreatCircle(
  source: OpticalTerminal, target: OpticalTerminal, steps = 64,
): GeoJSON.Feature<GeoJSON.LineString> {
  const interpolate = geoInterpolate(
    [source.longitude, source.latitude],
    [target.longitude, target.latitude],
  );
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: Array.from({ length: steps + 1 }, (_, index) => interpolate(index / steps)),
    },
  };
}

export function projectTerminal(
  projection: GeoProjection, terminal: OpticalTerminal,
): [number, number] | null {
  if (!Number.isFinite(terminal.latitude) || !Number.isFinite(terminal.longitude)) return null;
  if (Math.abs(terminal.latitude) > 90 || Math.abs(terminal.longitude) > 180) return null;
  const point = projection([terminal.longitude, terminal.latitude]);
  if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) return null;
  return [point[0], point[1]];
}

interface AgenticGlobalOpticalMapProps {
  terminals: OpticalTerminal[];
  links: OpticalLink[];
  layers: MapLayers;
  selectedTerminalId?: string | null;
  selectedLinkId?: string | null;
  onTerminalSelect?: (terminal: OpticalTerminal) => void;
  onLinkSelect?: (link: OpticalLink) => void;
  loading?: boolean;
}

export function AgenticGlobalOpticalMap({
  terminals, links, layers,
  selectedTerminalId = null, selectedLinkId = null,
  onTerminalSelect, onLinkSelect, loading = false,
}: AgenticGlobalOpticalMapProps) {
  const [hoveredTerminalId, setHoveredTerminalId] = useState<string | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);

  const countries = useMemo(
    () => feature(
      worldAtlas as never,
      (worldAtlas as unknown as { objects: { countries: never } }).objects.countries,
    ) as unknown as GeoJSON.FeatureCollection,
    [],
  );

  const projection = useMemo(
    () => geoNaturalEarth1().fitExtent(
      [[18, 18], [VIEWBOX_WIDTH - 18, VIEWBOX_HEIGHT - 18]],
      countries as never,
    ),
    [countries],
  );
  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const terminalLookup = useMemo(() => new Map(terminals.map((t) => [t.id, t])), [terminals]);

  const visibleLinks = useMemo(() => links.filter((link) => {
    if (!layers.links) return false;
    if (!layers.maintenance && link.status === "maintenance") return false;
    if (!layers.customerImpact && link.customersAffected > 0 && link.status !== "critical") return false;
    if (!layers.automationActivity && link.status === "recovery-active") return false;
    if (!layers.predictedRisk && link.status === "at-risk") return false;
    return true;
  }), [links, layers]);

  const visibleTerminals = useMemo(() => (layers.terminals
    ? terminals.filter((t) => layers.maintenance || t.status !== "maintenance")
    : []), [terminals, layers]);

  const activeTerminal =
    visibleTerminals.find((t) => t.id === hoveredTerminalId) ??
    terminals.find((t) => t.id === selectedTerminalId) ?? null;
  const activeLink =
    visibleLinks.find((l) => l.id === hoveredLinkId) ??
    links.find((l) => l.id === selectedLinkId) ?? null;

  const isEmpty = visibleTerminals.length === 0 && visibleLinks.length === 0;

  if (loading) {
    return (
      <div role="status" aria-label="Loading global digital twin"
        className="h-[360px] w-full animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
    );
  }

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {(Object.keys(statusStyle) as NetworkStatus[]).map((status) => (
          <span key={status} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusStyle[status].fill }} aria-hidden />
            {statusStyle[status].label}
          </span>
        ))}
        {layers.weatherExposure && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="h-0.5 w-4" style={{ backgroundColor: "#0284c7" }} aria-hidden />
            Weather exposure
          </span>
        )}
        {layers.protectedRoutes && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="h-0.5 w-4" style={{ backgroundColor: "#0f766e" }} aria-hidden />
            Protected path
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Global reliability digital twin showing ${visibleTerminals.length} optical terminals and ${visibleLinks.length} optical routes`}
        >
          <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="#ffffff" />
          <g aria-hidden data-testid="map-countries">
            {countries.features.map((country, index) => (
              <path key={index} d={pathGenerator(country as never) ?? undefined}
                fill="#eef2f7" stroke="#dbe2ea" strokeWidth={0.5} />
            ))}
          </g>

          <g data-testid="map-routes">
            {visibleLinks.map((link) => {
              const source = terminalLookup.get(link.sourceTerminalId);
              const target = terminalLookup.get(link.targetTerminalId);
              if (!source || !target) return null;
              if (!projectTerminal(projection, source) || !projectTerminal(projection, target)) return null;
              const d = pathGenerator(createGreatCircle(source, target) as never);
              if (!d) return null;
              const isActive = hoveredLinkId === link.id || selectedLinkId === link.id;
              const style = statusStyle[link.status];
              return (
                <g key={link.id} data-testid={`route-${link.id}`}>
                  {layers.weatherExposure && link.weatherExposed && (
                    <path d={d} fill="none" stroke="#0284c7" strokeWidth={6} strokeOpacity={0.16} />
                  )}
                  {layers.protectedRoutes && link.protectedRouteAvailable && (
                    <path d={d} fill="none" stroke="#0f766e" strokeWidth={4} strokeOpacity={0.14} />
                  )}
                  <path
                    d={d} fill="none" stroke={style.stroke}
                    strokeWidth={isActive ? 3.2 : 1.8}
                    strokeOpacity={isActive ? 1 : 0.85}
                    strokeDasharray={style.dash}
                    className={
                      layers.automationActivity && link.status === "recovery-active"
                        ? "agentic-route-flow" : undefined
                    }
                  />
                  {layers.customerImpact && link.customersAffected > 0 && (
                    <path d={d} fill="none" stroke="#ef4444" strokeWidth={7} strokeOpacity={0.12} />
                  )}
                  <path
                    d={d} fill="none" stroke="transparent" strokeWidth={14}
                    tabIndex={0} role="button"
                    aria-label={`Optical route ${link.name}, status ${link.status}`}
                    className="cursor-pointer focus:outline-none"
                    onMouseEnter={() => setHoveredLinkId(link.id)}
                    onMouseLeave={() => setHoveredLinkId(null)}
                    onFocus={() => setHoveredLinkId(link.id)}
                    onBlur={() => setHoveredLinkId(null)}
                    onClick={() => onLinkSelect?.(link)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onLinkSelect?.(link); } }}
                  />
                </g>
              );
            })}
          </g>

          <g data-testid="map-terminals">
            {visibleTerminals.map((terminal) => {
              const point = projectTerminal(projection, terminal);
              if (!point) return null;
              const [x, y] = point;
              const isActive = hoveredTerminalId === terminal.id || selectedTerminalId === terminal.id;
              const style = statusStyle[terminal.status];
              return (
                <g
                  key={terminal.id} data-testid={`terminal-${terminal.id}`}
                  tabIndex={0} role="button"
                  aria-label={`Terminal ${terminal.name}, ${terminal.city}, status ${terminal.status}`}
                  className="cursor-pointer focus:outline-none"
                  onMouseEnter={() => setHoveredTerminalId(terminal.id)}
                  onMouseLeave={() => setHoveredTerminalId(null)}
                  onFocus={() => setHoveredTerminalId(terminal.id)}
                  onBlur={() => setHoveredTerminalId(null)}
                  onClick={() => onTerminalSelect?.(terminal)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTerminalSelect?.(terminal); } }}
                >
                  {terminal.status === "critical" && (
                    <circle cx={x} cy={y} r={12} fill={style.fill} className="agentic-map-pulse" />
                  )}
                  {layers.automationActivity && (terminal.agentActivity === "executing" || terminal.agentActivity === "validating") && (
                    <circle cx={x} cy={y} r={11} fill="none" stroke="#7c3aed" strokeWidth={1.2} className="agentic-map-orbit" />
                  )}
                  <circle cx={x} cy={y} r={isActive ? 7 : 5} fill={style.fill} stroke="#ffffff" strokeWidth={1.5} />
                  {layers.customerImpact && terminal.customersAffected > 0 && (
                    <circle cx={x} cy={y} r={9.5} fill="none" stroke="#dc2626" strokeWidth={1.2} strokeDasharray="2 2" />
                  )}
                  {layers.predictedRisk && terminal.predictedRiskIds.length > 0 && (
                    <circle cx={x + 9} cy={y - 8} r={2.6} fill="#0d9488" />
                  )}
                  <text x={x + 10} y={y + 3} className="fill-slate-700" style={{ fontSize: 9 }}>
                    {terminal.city}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {isEmpty && (
          <p className="px-4 py-3 text-center text-[12px] text-slate-500">
            No terminals or routes match the current filters and layers.
          </p>
        )}
      </div>

      {(activeTerminal || activeLink) && (
        <div className="pointer-events-none absolute right-3 top-10 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          {activeTerminal ? (
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[12.5px] font-semibold text-slate-900">{activeTerminal.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {activeTerminal.city}, {activeTerminal.country} · {activeTerminal.region}
                  </p>
                </div>
                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                  style={{ backgroundColor: statusStyle[activeTerminal.status].stroke }}>
                  {statusStyle[activeTerminal.status].label}
                </span>
              </div>
              <dl className="mt-2 space-y-1 text-[11px]">
                <Row label="Availability" value={`${activeTerminal.availability.toFixed(3)}%`} />
                <Row label="SLO contribution" value={`${activeTerminal.sloContribution}%`} />
                <Row label="Customers affected" value={activeTerminal.customersAffected.toLocaleString()} />
                <Row label="Services" value={activeTerminal.services.join(", ")} />
                <Row label="Active situations" value={activeTerminal.activeSituationIds.length ? activeTerminal.activeSituationIds.join(", ") : "None"} />
                <Row label="Predicted risks" value={activeTerminal.predictedRiskIds.length ? String(activeTerminal.predictedRiskIds.length) : "None"} />
                <Row label="Weather" value={activeTerminal.weatherCondition ?? "No active exposure"} />
                <Row label="Agent activity" value={activeTerminal.agentActivity ?? "None"} />
                <Row label="Last telemetry" value={`${activeTerminal.lastTelemetryAt.slice(11, 19)} UTC`} />
              </dl>
            </div>
          ) : activeLink ? (
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[12.5px] font-semibold text-slate-900">{activeLink.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {terminalLookup.get(activeLink.sourceTerminalId)?.city} → {terminalLookup.get(activeLink.targetTerminalId)?.city}
                  </p>
                </div>
                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                  style={{ backgroundColor: statusStyle[activeLink.status].stroke }}>
                  {statusStyle[activeLink.status].label}
                </span>
              </div>
              <dl className="mt-2 space-y-1 text-[11px]">
                <Row label="Capacity" value={`${activeLink.capacityGbps} Gbps`} />
                <Row label="Utilisation" value={`${activeLink.utilizationPercent}%`} />
                <Row label="Link margin" value={`${activeLink.linkMarginDb.toFixed(1)} dB`} />
                <Row label="Bit error rate" value={activeLink.bitErrorRate.toExponential(1)} />
                <Row label="Packet loss" value={`${activeLink.packetLossPercent}%`} />
                <Row label="Availability" value={`${activeLink.availability.toFixed(3)}%`} />
                <Row label="Services" value={activeLink.services.join(", ")} />
                <Row label="Customers affected" value={activeLink.customersAffected.toLocaleString()} />
                <Row label="Situation" value={activeLink.situationId ?? "None"} />
                <Row label="Predicted risk" value={activeLink.riskLevel} />
                <Row label="Cause hypothesis" value={activeLink.currentHypothesis ?? "None"} />
                <Row label="Protected route" value={activeLink.protectedRouteAvailable ? "Available" : "Not available"} />
                <Row label="Current action" value={activeLink.activeActionId ?? "None"} />
                <Row label="Validation" value={activeLink.validationState ?? "not-started"} />
              </dl>
            </div>
          ) : null}
        </div>
      )}

      <style>{`
        @keyframes agenticMapPulse {
          0% { opacity: 0.35; transform: scale(0.8); }
          70% { opacity: 0; transform: scale(1.45); }
          100% { opacity: 0; transform: scale(1.45); }
        }
        @keyframes agenticRouteFlow { to { stroke-dashoffset: -28; } }
        .agentic-map-pulse {
          transform-box: fill-box; transform-origin: center;
          animation: agenticMapPulse 2s ease-out infinite;
        }
        .agentic-map-orbit {
          transform-box: fill-box; transform-origin: center;
          animation: agenticMapPulse 2.6s ease-out infinite;
        }
        .agentic-route-flow { animation: agenticRouteFlow 1.6s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .agentic-map-pulse, .agentic-map-orbit, .agentic-route-flow { animation: none; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
