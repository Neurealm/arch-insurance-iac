/**
 * AIM-003 — Chennai Fog Scenario workspace.
 *
 * Hosts the MapLibre scenario map, the link table, the selected-link prediction
 * summary and the What-If, evidence, detail and similar-link drawers. All
 * calculations are deterministic and local; no service is called.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChennaiScenarioMap } from "./ChennaiScenarioMap";
import { SelectedLinkSummary } from "./SelectedLinkSummary";
import { WhatIfPanel } from "./WhatIfPanel";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { SimilarLinksDrawer } from "./SimilarLinksDrawer";
import { LinkDetailDrawer, type LinkDetailTab } from "./LinkDetailDrawer";
import {
  baselineWhatIf, chennaiLinks, CHENNAI_SCENARIO_LABEL, DEFAULT_CHENNAI_LINK_ID, getChennaiLink,
  whatIfPresets, type WhatIfPresetId, type WhatIfValues,
} from "./chennaiFixtures";
import { applyPatch, evaluateChennaiLink, type ChennaiPrediction } from "./chennaiModel";
import { DEFAULT_CHENNAI_VISIBILITY, type ChennaiLayerGroup } from "./chennaiLayers";
import type { PredictionOverrides } from "./chennaiGeojson";

export interface ChennaiWorkspaceProps {
  selectedLinkId: string | null;
  onSelectLink: (id: string | null) => void;
  whatIfOpen: boolean;
  onWhatIfOpenChange: (open: boolean) => void;
  /** Notifies the parent when the live prediction set changes. */
  onPredictionsChange?: (overrides: PredictionOverrides) => void;
}

export function ChennaiWorkspace({
  selectedLinkId, onSelectLink, whatIfOpen, onWhatIfOpenChange, onPredictionsChange,
}: ChennaiWorkspaceProps) {
  const activeId = selectedLinkId ?? DEFAULT_CHENNAI_LINK_ID;
  const link = getChennaiLink(activeId);

  const [selectedTerminalId, setSelectedTerminalId] = React.useState<string | null>(null);
  const [visibility, setVisibility] = React.useState<Record<ChennaiLayerGroup, boolean>>(DEFAULT_CHENNAI_VISIBILITY);
  const [mapFullScreen, setMapFullScreen] = React.useState(false);
  const [resizeSignal, setResizeSignal] = React.useState(0);

  const [evidenceOpen, setEvidenceOpen] = React.useState(false);
  const [similarOpen, setSimilarOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailTab, setDetailTab] = React.useState<LinkDetailTab>("Summary");

  const [preset, setPreset] = React.useState<WhatIfPresetId>("baseline");
  const [whatIf, setWhatIf] = React.useState<WhatIfValues | null>(null);

  const baseline = React.useMemo<WhatIfValues | null>(() => (link ? baselineWhatIf(link) : null), [link]);

  /* Reset the What-If inputs whenever the selected link changes. */
  React.useEffect(() => {
    setWhatIf(null);
    setPreset("baseline");
  }, [activeId]);

  /* Resize the map when a drawer opens or closes. */
  React.useEffect(() => {
    setResizeSignal((n) => n + 1);
  }, [whatIfOpen, evidenceOpen, similarOpen, detailOpen, mapFullScreen]);

  const baselinePrediction = React.useMemo<ChennaiPrediction | null>(
    () => (link ? evaluateChennaiLink(link) : null),
    [link],
  );

  const proposedPrediction = React.useMemo<ChennaiPrediction | null>(
    () => (link && whatIf ? evaluateChennaiLink(link, whatIf) : null),
    [link, whatIf],
  );

  const livePrediction = proposedPrediction ?? baselinePrediction;

  /* Prediction overrides drive the map colouring for the selected link. */
  const overrides = React.useMemo<PredictionOverrides>(() => {
    const map: PredictionOverrides = {};
    for (const l of chennaiLinks) map[l.id] = evaluateChennaiLink(l);
    if (link && proposedPrediction) map[link.id] = proposedPrediction;
    return map;
  }, [link, proposedPrediction]);

  React.useEffect(() => {
    onPredictionsChange?.(overrides);
  }, [overrides, onPredictionsChange]);

  const rankedLinks = React.useMemo(
    () =>
      chennaiLinks
        .map((l) => ({ link: l, prediction: overrides[l.id]! }))
        .sort((a, b) => b.prediction.riskProbability - a.prediction.riskProbability),
    [overrides],
  );

  const handleChange = React.useCallback(
    (patch: Partial<WhatIfValues>) => {
      setWhatIf((prev) => (baseline ? applyPatch(prev ?? baseline, patch) : prev));
      setPreset("baseline");
    },
    [baseline],
  );

  const handlePreset = React.useCallback(
    (id: WhatIfPresetId) => {
      setPreset(id);
      if (!baseline) return;
      const p = whatIfPresets.find((x) => x.id === id);
      setWhatIf(id === "baseline" || !p ? null : applyPatch(baseline, p.patch));
    },
    [baseline],
  );

  const handleReset = React.useCallback(() => {
    setWhatIf(null);
    setPreset("baseline");
  }, []);

  const selectNextRisk = React.useCallback(() => {
    const idx = rankedLinks.findIndex((r) => r.link.id === activeId);
    const next = rankedLinks[(idx + 1) % rankedLinks.length];
    if (next) onSelectLink(next.link.id);
  }, [rankedLinks, activeId, onSelectLink]);

  return (
    <div data-testid="chennai-workspace" className="space-y-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11.5px] text-slate-600">
          {CHENNAI_SCENARIO_LABEL} · six synthetic optical links · deterministic local model output
        </p>
        <p className="text-[10.5px] text-slate-500">
          Selected link {activeId}
          {whatIf ? " · What-If inputs applied" : " · baseline inputs"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-12">
        <div className={cn("xl:col-span-7", mapFullScreen && "xl:col-span-12")}>
          <ChennaiScenarioMap
            selectedLinkId={activeId}
            onSelectLink={onSelectLink}
            selectedTerminalId={selectedTerminalId}
            onSelectTerminal={setSelectedTerminalId}
            overrides={overrides}
            visibility={visibility}
            onToggleLayer={(g) => setVisibility((v) => ({ ...v, [g]: !v[g] }))}
            isFullScreen={mapFullScreen}
            onToggleFullScreen={() => setMapFullScreen((f) => !f)}
            resizeSignal={resizeSignal}
            className={mapFullScreen ? "h-[70vh]" : "h-[420px]"}
          />
        </div>

        <div className="space-y-2.5 xl:col-span-5">
          <SelectedLinkSummary
            link={link}
            prediction={livePrediction}
            whatIfActive={Boolean(whatIf)}
            onViewEvidence={() => setEvidenceOpen(true)}
            onRunWhatIf={() => onWhatIfOpenChange(true)}
            onOpenDetail={() => { setDetailTab("Summary"); setDetailOpen(true); }}
            onCompareSimilar={() => setSimilarOpen(true)}
            onSelectNextRisk={selectNextRisk}
            onResetSelection={() => onSelectLink(DEFAULT_CHENNAI_LINK_ID)}
          />

          {/* Accessible, non-map equivalent of the link layer */}
          <section aria-labelledby="chn-link-table" className="rounded-xl border border-slate-200 bg-white p-2">
            <h3 id="chn-link-table" className="mb-1 text-[12px] font-semibold text-slate-900">
              Chennai links, ranked by risk
            </h3>
            <table className="w-full text-left text-[10.5px]">
              <caption className="sr-only">
                Text equivalent of the scenario map. Select a link to load its prediction.
              </caption>
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th scope="col" className="py-0.5 font-medium">Link</th>
                  <th scope="col" className="py-0.5 text-right font-medium tabular-nums">Risk</th>
                  <th scope="col" className="py-0.5 font-medium">Class</th>
                  <th scope="col" className="py-0.5 font-medium">ETA</th>
                  <th scope="col" className="py-0.5 font-medium">Driver</th>
                </tr>
              </thead>
              <tbody>
                {rankedLinks.map(({ link: l, prediction }) => (
                  <tr
                    key={l.id}
                    className={cn(
                      "border-b border-slate-100 hover:bg-slate-50",
                      controlTransition,
                      l.id === activeId && "bg-blue-50/60 hover:bg-blue-50",
                    )}
                  >
                    <th scope="row" className="py-0.5 font-normal">
                      <button
                        type="button"
                        onClick={() => onSelectLink(l.id)}
                        aria-current={l.id === activeId ? "true" : undefined}
                        className={cn(
                          "rounded text-left font-medium text-blue-700 underline-offset-2 hover:underline",
                          focusRing,
                        )}
                      >
                        {l.id}
                      </button>
                    </th>
                    <td className="py-0.5 text-right tabular-nums text-slate-900">{prediction.riskProbability.toFixed(2)}</td>

                    <td
                      className={cn(
                        "py-0.5 font-medium",
                        prediction.riskClass === "High" && "text-rose-700",
                        prediction.riskClass === "Moderate" && "text-amber-700",
                        prediction.riskClass === "Low" && "text-emerald-700",
                      )}
                    >
                      {prediction.riskClass}
                    </td>
                    <td className="py-0.5 text-slate-700">{prediction.etaLabel}</td>
                    <td className="py-0.5 text-slate-700">{l.primaryDriver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>

      <WhatIfPanel
        open={whatIfOpen}
        onClose={() => onWhatIfOpenChange(false)}
        values={whatIf ?? baseline ?? ({} as WhatIfValues)}
        baseline={baseline ?? ({} as WhatIfValues)}
        onChange={handleChange}
        onPreset={handlePreset}
        onReset={handleReset}
        activePreset={preset}
        current={baselinePrediction}
        proposed={proposedPrediction ?? baselinePrediction}
      />

      <EvidenceDrawer open={evidenceOpen} onClose={() => setEvidenceOpen(false)} linkId={activeId} />
      <SimilarLinksDrawer open={similarOpen} onClose={() => setSimilarOpen(false)} linkId={activeId} />
      <LinkDetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        link={link}
        prediction={livePrediction}
        tab={detailTab}
        onTabChange={setDetailTab}
      />
    </div>
  );
}
