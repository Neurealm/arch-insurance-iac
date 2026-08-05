/**
 * GLHM-MAP-002 — regional summary callouts.
 *
 * Limited HTML overlays anchored to valid region coordinates. Five on desktop,
 * three on tablet, none on mobile. No click behaviour in this stage.
 */

import { Marker } from "react-map-gl/maplibre";
import { REGION_HEALTH_COLORS } from "./layers";
import type { EstateRegion } from "./estate";

const OFFSETS: Record<string, [number, number]> = {
  "REG-CAL": [-70, -54],
  "REG-LON": [-4, -70],
  "REG-RIO": [72, 34],
  "REG-NBO": [-78, 46],
  "REG-CHN": [86, -30],
};

export function RegionCallout({ region }: { region: EstateRegion }) {
  const [dx, dy] = OFFSETS[region.id] ?? [0, -60];
  const accent = REGION_HEALTH_COLORS[region.health] ?? "#94a3b8";
  const emphasised = region.health === "At Risk";
  return (
    <Marker longitude={region.center[0]} latitude={region.center[1]} offset={[dx, dy]} anchor="center">
      <div
        className={`pointer-events-none w-[176px] rounded-md border bg-white px-2 py-1.5 text-left shadow-[0_1px_3px_rgba(15,23,42,0.10)] ${
          emphasised ? "border-orange-300" : "border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[11px] font-semibold text-slate-800">{region.name}</span>
          <span className="inline-flex items-center gap-1 text-[9.5px] font-medium" style={{ color: accent }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
            {region.health}
          </span>
        </div>
        <dl className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9.5px] text-slate-600">
          <div className="flex justify-between"><dt>Links</dt><dd className="font-medium text-slate-800">{region.linkCount}</dd></div>
          <div className="flex justify-between"><dt>Cap</dt><dd className="font-medium text-slate-800">{region.capacityGbps >= 1000 ? `${(region.capacityGbps / 1000).toFixed(1)} Tbps` : `${region.capacityGbps} Gbps`}</dd></div>
          <div className="flex justify-between"><dt>Util</dt><dd className="font-medium text-slate-800">{region.utilizationPct}%</dd></div>
          <div className="flex justify-between"><dt>At risk</dt><dd className={`font-medium ${region.atRiskCount > 0 ? "text-orange-600" : "text-slate-800"}`}>{region.atRiskCount}</dd></div>
          <div className="col-span-2 flex justify-between"><dt>Customer impact</dt><dd className="font-medium text-slate-800">{region.customerServiceCount}</dd></div>
        </dl>
      </div>
    </Marker>
  );
}

export default RegionCallout;
