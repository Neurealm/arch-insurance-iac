/**
 * AIM-002 — anomaly scatterplot.
 *
 * X: baseline deviation (sigma). Y: rate of change (dB/h).
 * Colour: risk class. Size: service criticality. Opacity: data quality.
 * Border: telemetry completeness. An accessible table alternative is always
 * available beneath the chart.
 */

import * as React from "react";
import {
  CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { RISK_COLORS } from "./usePipelineState";
import type { AnomalyRecord, RiskClass } from "../data/pliPipelineFixtures";

const RISK_CLASSES: RiskClass[] = ["Normal", "Watch", "Elevated", "High Risk", "Data Quality Concern"];

function AnomalyTooltip({ active, payload }: { active?: boolean; payload?: { payload: AnomalyRecord }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="max-w-[240px] rounded border border-slate-200 bg-white p-2 text-[10.5px] shadow-md">
      <p className="text-[11px] font-semibold text-slate-900">{p.linkId}</p>
      <p className="text-slate-600">{p.region} · {p.product}</p>
      <dl className="mt-1 space-y-0.5 text-slate-700">
        <div className="flex justify-between gap-2"><dt>Baseline deviation</dt><dd className="font-medium">{p.baselineDeviation} sigma</dd></div>
        <div className="flex justify-between gap-2"><dt>Rate of change</dt><dd className="font-medium">{p.rateOfChange} dB/h</dd></div>
        <div className="flex justify-between gap-2"><dt>Risk class</dt><dd className="font-medium">{p.riskClass}</dd></div>
        <div className="flex justify-between gap-2"><dt>Service criticality</dt><dd className="font-medium">{p.serviceCriticality}</dd></div>
        <div className="flex justify-between gap-2"><dt>Data quality</dt><dd className="font-medium">{p.dataQuality}</dd></div>
      </dl>
      <p className="mt-1 text-slate-600">Reasons: {p.reasons.join("; ")}</p>
    </div>
  );
}

export function AnomalyScatterplot({
  records, selectedLinkId, onSelect, onHover,
}: {
  records: AnomalyRecord[];
  selectedLinkId: string;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const [tableOpen, setTableOpen] = React.useState(false);

  return (
    <div className="space-y-1.5">
      <div className="h-[180px] w-full" data-testid="anomaly-scatterplot">
        <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={140}>
          <ScatterChart margin={{ top: 6, right: 8, bottom: 18, left: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="2 3" />
            <XAxis
              type="number" dataKey="baselineDeviation" name="Baseline deviation"
              domain={[-2, 4]} tick={{ fontSize: 9, fill: "#64748b" }}
              label={{ value: "Baseline deviation (sigma)", position: "insideBottom", offset: -10, fontSize: 9, fill: "#64748b" }}
            />
            <YAxis
              type="number" dataKey="rateOfChange" name="Rate of change"
              domain={[0, 0.7]} tick={{ fontSize: 9, fill: "#64748b" }} width={34}
              label={{ value: "dB/h", angle: -90, position: "insideLeft", fontSize: 9, fill: "#64748b" }}
            />
            <ZAxis type="number" dataKey="serviceCriticality" range={[18, 110]} />
            <Tooltip content={<AnomalyTooltip />} cursor={{ strokeDasharray: "3 3" }} isAnimationActive={false} />
            <Scatter
              data={records}
              isAnimationActive={false}
              onClick={(p: unknown) => {
                const rec = p as AnomalyRecord & { payload?: AnomalyRecord };
                const id = rec.payload?.linkId ?? rec.linkId;
                if (id) onSelect(id);
              }}
              onMouseEnter={(p: unknown) => {
                const rec = p as AnomalyRecord & { payload?: AnomalyRecord };
                onHover(rec.payload?.linkId ?? rec.linkId ?? null);
              }}
              onMouseLeave={() => onHover(null)}
            >
              {records.map((r) => {
                const selected = r.linkId === selectedLinkId;
                return (
                  <Cell
                    key={r.linkId}
                    fill={RISK_COLORS[r.riskClass]}
                    fillOpacity={Math.max(0.35, r.dataQuality)}
                    stroke={selected ? "#0f172a" : r.telemetryComplete ? RISK_COLORS[r.riskClass] : "#94a3b8"}
                    strokeWidth={selected ? 2.5 : r.telemetryComplete ? 1 : 1.5}
                    strokeDasharray={r.telemetryComplete ? undefined : "2 2"}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[9.5px] text-slate-500">
        Size shows service criticality, opacity shows data quality, a dashed outline marks incomplete telemetry.
        Selected link {selectedLinkId} is outlined in dark navy.
      </p>

      <button
        type="button"
        onClick={() => setTableOpen((v) => !v)}
        aria-expanded={tableOpen}
        data-testid="anomaly-table-toggle"
        className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {tableOpen ? "Hide" : "Show"} accessible anomaly table
      </button>

      <div className={cn(!tableOpen && "sr-only")}>
        <table className="w-full border-collapse text-[10px]" data-testid="anomaly-table">
          <caption className="sr-only">
            Anomaly detection results. {records.length} links, sorted by risk class.
          </caption>
          <thead>
            <tr className="text-left text-slate-500">
              <th scope="col" className="py-0.5">Link</th>
              <th scope="col">Risk class</th>
              <th scope="col">Deviation</th>
              <th scope="col">Rate</th>
              <th scope="col">Quality</th>
              <th scope="col">Select</th>
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 30).map((r) => (
              <tr key={r.linkId} className="border-t border-slate-100">
                <th scope="row" className="py-0.5 text-left font-medium text-slate-800">{r.linkId}</th>
                <td>{r.riskClass}</td>
                <td>{r.baselineDeviation}</td>
                <td>{r.rateOfChange}</td>
                <td>{r.dataQuality}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => onSelect(r.linkId)}
                    data-testid={`anomaly-row-select-${r.linkId}`}
                    className="rounded border border-slate-200 px-1 text-[9.5px] text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Select {r.linkId}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AnomalyLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] text-slate-600">
      {RISK_CLASSES.map((r) => (
        <li key={r} className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLORS[r] }} aria-hidden />
          {r}
        </li>
      ))}
    </ul>
  );
}

export { RISK_CLASSES };
