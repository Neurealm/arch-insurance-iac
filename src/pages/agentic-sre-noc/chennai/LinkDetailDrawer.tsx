/**
 * AIM-003 — Link detail drawer for the Chennai scenario.
 *
 * Eight tabs, all rendered on this page. No navigation and no external calls.
 */

import * as React from "react";
import { PipelineDrawer } from "../pipeline/PipelineDrawer";
import { cn } from "@/lib/utils";
import {
  chennaiEvidenceSections, customerServiceRoute, getTerminal, similarLinkRecords,
  type ChennaiLink,
} from "./chennaiFixtures";
import type { ChennaiPrediction } from "./chennaiModel";

const TABS = [
  "Summary", "Optical", "Weather", "Network", "Customer Service", "Evidence", "Similar Links", "History",
] as const;
export type LinkDetailTab = (typeof TABS)[number];

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="space-y-0.5">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-0.5">
          <dt className="text-[11px] text-slate-600">{k}</dt>
          <dd className="text-right text-[11.5px] font-medium text-slate-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const history: [string, string][] = [
  ["21:38 UTC", "Risk re-evaluated at 0.94 with 94% confidence"],
  ["21:10 UTC", "Fog advisory issued for the Chennai south corridor"],
  ["20:42 UTC", "Link margin crossed the 4.5 dB watch threshold"],
  ["18:05 UTC", "RF fallback validation completed successfully"],
  ["15:38 UTC", "Degradation rate first exceeded 0.3 dB per hour"],
  ["09:20 UTC", "Terminal B firmware confirmed at 2.8.4-lb"],
];

export function LinkDetailDrawer({
  open, onClose, link, prediction, tab, onTabChange,
}: {
  open: boolean;
  onClose: () => void;
  link: ChennaiLink | undefined;
  prediction: ChennaiPrediction | null;
  tab: LinkDetailTab;
  onTabChange: (t: LinkDetailTab) => void;
}) {
  if (!open) return null;

  if (!link || !prediction) {
    return (
      <PipelineDrawer open={open} title="Link detail" onClose={onClose} testId="chennai-link-detail">
        <p className="text-[11.5px] text-slate-600">
          The selected link could not be resolved. Select a link from the map or the accessible link table.
        </p>
      </PipelineDrawer>
    );
  }

  const a = getTerminal(link.terminalA);
  const b = getTerminal(link.terminalB);
  const evidenceCount = chennaiEvidenceSections.reduce((s, sec) => s + sec.items.length, 0);

  return (
    <PipelineDrawer
      open={open}
      title={`Link detail, ${link.id}`}
      subtitle={link.name}
      onClose={onClose}
      testId="chennai-link-detail"
    >
      <div role="tablist" aria-label="Link detail views" className="mb-2 flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => onTabChange(t)}
            className={cn(
              "rounded border px-1.5 py-0.5 text-[10.5px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              tab === t ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={`${tab} detail`} data-testid={`chennai-detail-${tab.replace(/\s+/g, "-").toLowerCase()}`}>
        {tab === "Summary" && (
          <Rows rows={[
            ["Link identifier", link.id],
            ["Link name", link.name],
            ["Product", link.product],
            ["Region", "Chennai, India South"],
            ["Terminal A", `${a?.id} · ${a?.name}`],
            ["Terminal B", `${b?.id} · ${b?.name}`],
            ["Customer service", link.customerServiceIds.join(", ")],
            ["Service route", customerServiceRoute.customer],
            ["Capacity", `${link.capacityGbps} Gbps`],
            ["Current throughput", `${link.currentThroughputGbps} Gbps`],
            ["Availability", `${link.availabilityPct}%`],
            ["Risk score", prediction.riskProbability.toFixed(2)],
            ["Confidence", `${prediction.confidencePct}%`],
            ["ETA to impact", prediction.etaLabel],
            ["Recommendation", prediction.recommendedAction?.name ?? "None"],
            ["Evidence count", `${evidenceCount} references`],
            ["Last telemetry update", link.lastTelemetry],
          ]} />
        )}

        {tab === "Optical" && (
          <Rows rows={[
            ["Link margin", `${link.linkMarginDb} dB of ${link.linkMarginBaselineDb} dB baseline`],
            ["Received optical power", `${link.receivedPowerDbm} dBm`],
            ["Optical attenuation", `${link.attenuationDb} dB`],
            ["Degradation rate", `${link.degradationRateDbHr} dB per hour`],
            ["Threshold margin", `${link.thresholdMarginDb} dB`],
            ["Beam lock", `${a?.beamLock} / ${b?.beamLock}`],
            ["Pointing error", `${a?.pointingErrorMdeg} / ${b?.pointingErrorMdeg} mdeg`],
            ["Reacquisition count", `${a?.reacquisitionCount24h} / ${b?.reacquisitionCount24h} in 24 hours`],
            ["Optical severity", prediction.opticalSeverity?.toFixed(2) ?? "Not available"],
          ]} />
        )}

        {tab === "Weather" && (
          <Rows rows={[
            ["Visibility", `${link.visibilityKm} km forecast`],
            ["Fog probability", `${Math.round(link.fogProbability * 100)}%`],
            ["Humidity", `${link.humidityPct}%`],
            ["Rainfall", `${link.rainfallMmHr} mm per hour`],
            ["Wind", `${link.windKph} km per hour`],
            ["Weather severity", prediction.weatherSeverity?.toFixed(2) ?? "Not available"],
            ["Primary driver", link.primaryDriver],
          ]} />
        )}

        {tab === "Network" && (
          <Rows rows={[
            ["Interface state", "Up, no errors in 24 hours"],
            ["Throughput", `${link.currentThroughputGbps} Gbps of ${link.capacityGbps} Gbps`],
            ["Latency", "4.1 ms"],
            ["Packet loss", "0.00%"],
            ["Routing state", "Primary optical path preferred"],
            ["Fallback state", prediction.fallback.state],
            ["Fallback headroom", `${link.fallbackHeadroomPct}%`],
            ["Handoff health", `Validated ${link.fallbackValidationAgeHours} hours ago`],
          ]} />
        )}

        {tab === "Customer Service" && (
          <Rows rows={[
            ["Customer", customerServiceRoute.customer],
            ["Service", link.customerServiceIds.join(", ")],
            ["Criticality", link.serviceCriticality],
            ["Capacity", `${link.capacityGbps} Gbps`],
            ["SLO exposure", `${link.sloTargetPct}% monthly availability`],
            ["Error-budget exposure", `${link.errorBudgetRemainingPct}% remaining`],
            ["Services exposed", String(prediction.customer.servicesExposed)],
            ["Blast radius", prediction.customer.blastRadius.toFixed(2)],
          ]} />
        )}

        {tab === "Evidence" && (
          <div className="space-y-2">
            {chennaiEvidenceSections.slice(0, 5).map((sec) => (
              <section key={sec.id}>
                <h4 className="text-[11px] font-semibold text-slate-800">{sec.title}</h4>
                <Rows rows={sec.items.map((i) => [i.label, i.value] as [string, React.ReactNode])} />
              </section>
            ))}
            <p className="text-[10.5px] text-slate-500">
              Open the full evidence drawer for reliability, source, timestamp and contradicting evidence.
            </p>
          </div>
        )}

        {tab === "Similar Links" && (
          <ul className="space-y-1.5">
            {similarLinkRecords.map((r) => (
              <li key={r.id} className="rounded border border-slate-200 p-1.5">
                <p className="text-[11.5px] font-medium text-slate-900">{r.name}</p>
                <p className="text-[10.5px] text-slate-600">
                  {r.similarityPct}% similar · {r.primaryDriver} · {r.actualOutcome}
                </p>
              </li>
            ))}
          </ul>
        )}

        {tab === "History" && (
          <ol className="space-y-1">
            {history.map(([t, text]) => (
              <li key={t} className="flex gap-2 border-b border-slate-100 py-0.5">
                <span className="w-20 shrink-0 text-[10.5px] font-medium text-slate-500">{t}</span>
                <span className="text-[11px] text-slate-800">{text}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </PipelineDrawer>
  );
}
