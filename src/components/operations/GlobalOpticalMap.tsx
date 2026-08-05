// Global optical network map rendered locally with d3-geo + world-atlas.
// No remote tiles, no external geography requests.

import { useMemo, useState } from "react";
import { geoInterpolate, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import type {
  OperationalStatus, OpticalLink, OpticalTerminal,
} from "@/types/opticalOperations";

interface GlobalOpticalMapProps {
  terminals: OpticalTerminal[];
  links: OpticalLink[];
  showTerminals?: boolean;
  showRoutes?: boolean;
  customerImpactOnly?: boolean;
  weatherExposureOnly?: boolean;
  selectedTerminalId?: string | null;
  selectedLinkId?: string | null;
  onTerminalSelect?: (terminal: OpticalTerminal) => void;
  onLinkSelect?: (link: OpticalLink) => void;
}

const VIEWBOX_WIDTH = 1100;
const VIEWBOX_HEIGHT = 500;

export const statusStyles: Record<OperationalStatus, { stroke: string; fill: string; label: string }> = {
  healthy: { stroke: "#16a34a", fill: "#22c55e", label: "Healthy" },
  degraded: { stroke: "#d97706", fill: "#f59e0b", label: "Degraded" },
  critical: { stroke: "#dc2626", fill: "#ef4444", label: "Critical" },
  maintenance: { stroke: "#7c3aed", fill: "#8b5cf6", label: "Maintenance" },
};

function greatCircle(source: OpticalTerminal, target: OpticalTerminal, steps = 48): [number, number][] {
  const interpolate = geoInterpolate(
    [source.longitude, source.latitude],
    [target.longitude, target.latitude],
  );
  return Array.from({ length: steps + 1 }, (_, i) => interpolate(i / steps) as [number, number]);
}

export function GlobalOpticalMap({
  terminals, links,
  showTerminals = true, showRoutes = true,
  customerImpactOnly = false, weatherExposureOnly = false,
  selectedTerminalId = null, selectedLinkId = null,
  onTerminalSelect, onLinkSelect,
}: GlobalOpticalMapProps) {
  const [hoveredTerminalId, setHoveredTerminalId] = useState<string | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);

  const countries = useMemo(
    () => feature(worldAtlas as never, (worldAtlas as never as { objects: { countries: never } }).objects.countries) as unknown as GeoJSON.FeatureCollection,
    [],
  );

  const projection = useMemo(
    () => geoNaturalEarth1().fitExtent(
      [[16, 16], [VIEWBOX_WIDTH - 16, VIEWBOX_HEIGHT - 16]],
      countries as never,
    ),
    [countries],
  );
  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const terminalLookup = useMemo(
    () => new Map(terminals.map((t) => [t.id, t])),
    [terminals],
  );

  const visibleTerminals = useMemo(
    () => terminals.filter((t) => (!customerImpactOnly || t.customersAffected > 0)),
    [terminals, customerImpactOnly],
  );
  const visibleTerminalIds = useMemo(
    () => new Set(visibleTerminals.map((t) => t.id)),
    [visibleTerminals],
  );

  const visibleLinks = useMemo(
    () => links.filter((l) =>
      visibleTerminalIds.has(l.sourceTerminalId) &&
      visibleTerminalIds.has(l.targetTerminalId) &&
      (!customerImpactOnly || l.customersAffected > 0) &&
      (!weatherExposureOnly || l.weatherExposed)),
    [links, visibleTerminalIds, customerImpactOnly, weatherExposureOnly],
  );

  const activeTerminal =
    visibleTerminals.find((t) => t.id === hoveredTerminalId) ??
    visibleTerminals.find((t) => t.id === selectedTerminalId) ?? null;
  const activeLink =
    visibleLinks.find((l) => l.id === hoveredLinkId) ??
    visibleLinks.find((l) => l.id === selectedLinkId) ?? null;

  const isEmpty = visibleTerminals.length === 0 && visibleLinks.length === 0;

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {Object.entries(statusStyles).map(([status, style]) => (
          <span key={status} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: style.fill }} aria-hidden />
            {style.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
          <span className="h-2 w-2 rounded-full ring-2 ring-red-300" style={{ backgroundColor: "#ef4444" }} aria-hidden />
          Customer impact
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
          <span className="h-0.5 w-4" style={{ backgroundColor: "#0284c7" }} aria-hidden />
          Weather exposure
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Global optical network map showing ${visibleTerminals.length} terminals and ${visibleLinks.length} optical routes`}
        >
          <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="#f8fafc" />
          <g aria-hidden>
            {countries.features.map((country, index) => (
              <path
                key={index}
                d={pathGenerator(country as never) ?? undefined}
                fill="#e2e8f0"
                stroke="#cbd5e1"
                strokeWidth={0.5}
              />
            ))}
          </g>

          {showRoutes && (
            <g>
              {visibleLinks.map((link) => {
                const source = terminalLookup.get(link.sourceTerminalId);
                const target = terminalLookup.get(link.targetTerminalId);
                if (!source || !target) return null;
                const d = pathGenerator({
                  type: "Feature", properties: {},
                  geometry: { type: "LineString", coordinates: greatCircle(source, target) },
                } as never);
                if (!d) return null;
                const isActive = hoveredLinkId === link.id || selectedLinkId === link.id;
                const style = statusStyles[link.status];
                return (
                  <g key={link.id}>
                    {link.weatherExposed && (
                      <path d={d} fill="none" stroke="#0284c7" strokeWidth={5} strokeOpacity={0.18} />
                    )}
                    <path d={d} fill="none" stroke={style.stroke} strokeWidth={isActive ? 3 : 1.8} strokeOpacity={isActive ? 1 : 0.8} />
                    <path
                      d={d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={12}
                      tabIndex={0}
                      role="button"
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
          )}

          {showTerminals && (
            <g>
              {visibleTerminals.map((terminal) => {
                const point = projection([terminal.longitude, terminal.latitude]);
                if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) return null;
                const [x, y] = point;
                const isActive = hoveredTerminalId === terminal.id || selectedTerminalId === terminal.id;
                const style = statusStyles[terminal.status];
                return (
                  <g
                    key={terminal.id}
                    tabIndex={0}
                    role="button"
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
                      <circle cx={x} cy={y} r={12} fill={style.fill} className="optical-map-pulse" />
                    )}
                    <circle cx={x} cy={y} r={isActive ? 7 : 5} fill={style.fill} stroke="#ffffff" strokeWidth={1.5} />
                    {terminal.customersAffected > 0 && (
                      <circle cx={x} cy={y} r={9.5} fill="none" stroke={style.stroke} strokeWidth={1.2} strokeDasharray="2 2" />
                    )}
                    <text x={x + 10} y={y + 3} className="fill-slate-700 text-[9px]" style={{ fontSize: 9 }}>
                      {terminal.city}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {isEmpty && (
          <p className="px-4 py-3 text-center text-[12px] text-slate-500">
            No terminals or routes match the current filters.
          </p>
        )}
      </div>

      {(activeTerminal || activeLink) && (
        <div className="pointer-events-none absolute right-3 top-10 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          {activeTerminal && (
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[12.5px] font-semibold text-slate-900">{activeTerminal.name}</p>
                  <p className="text-[11px] text-slate-500">{activeTerminal.city}, {activeTerminal.country} · {activeTerminal.region}</p>
                </div>
                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: statusStyles[activeTerminal.status].stroke }}>
                  {statusStyles[activeTerminal.status].label}
                </span>
              </div>
              <dl className="mt-2 space-y-1 text-[11px]">
                <Row label="Availability" value={`${activeTerminal.availability.toFixed(2)}%`} />
                <Row label="Connected links" value={String(activeTerminal.connectedLinks)} />
                <Row label="Active alarms" value={String(activeTerminal.activeAlarms)} />
                <Row label="Customers affected" value={activeTerminal.customersAffected.toLocaleString()} />
                <Row label="Weather" value={activeTerminal.weatherCondition ?? "No active exposure"} />
                <Row label="Last telemetry" value={new Date(activeTerminal.lastTelemetryAt).toISOString().slice(11, 19) + " UTC"} />
              </dl>
            </div>
          )}
          {!activeTerminal && activeLink && (
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[12.5px] font-semibold text-slate-900">{activeLink.name}</p>
                  <p className="text-[11px] text-slate-500">{activeLink.region} · {activeLink.domain}</p>
                </div>
                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: statusStyles[activeLink.status].stroke }}>
                  {statusStyles[activeLink.status].label}
                </span>
              </div>
              <dl className="mt-2 space-y-1 text-[11px]">
                <Row label="Capacity" value={`${activeLink.capacityGbps} Gbps`} />
                <Row label="Utilisation" value={`${activeLink.utilizationPercent}%`} />
                <Row label="Link margin" value={`${activeLink.linkMarginDb.toFixed(1)} dB`} />
                <Row label="Availability" value={`${activeLink.availability.toFixed(2)}%`} />
                <Row label="Active alarms" value={String(activeLink.activeAlarms)} />
                <Row label="Customers affected" value={activeLink.customersAffected.toLocaleString()} />
                <Row label="Incident" value={activeLink.incidentId ?? "None"} />
                <Row label="Predicted risk" value={activeLink.riskLevel} />
              </dl>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes opticalMapPulse {
          0% { opacity: 0.35; transform: scale(0.8); }
          70% { opacity: 0; transform: scale(1.45); }
          100% { opacity: 0; transform: scale(1.45); }
        }
        .optical-map-pulse {
          transform-box: fill-box;
          transform-origin: center;
          animation: opticalMapPulse 2s ease-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .optical-map-pulse { animation: none; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
