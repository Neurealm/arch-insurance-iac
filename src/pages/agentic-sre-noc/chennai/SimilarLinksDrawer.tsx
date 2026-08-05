/**
 * AIM-003 — Similar Links comparison drawer.
 */

import * as React from "react";
import { PipelineDrawer } from "../pipeline/PipelineDrawer";
import { cn } from "@/lib/utils";
import { similarLinkRecords } from "./chennaiFixtures";

export function SimilarLinksDrawer({
  open, onClose, linkId,
}: {
  open: boolean;
  onClose: () => void;
  linkId: string | null;
}) {
  if (!open) return null;

  const sorted = [...similarLinkRecords].sort((a, b) => b.similarityPct - a.similarityPct);

  return (
    <PipelineDrawer
      open={open}
      title="Similar historical links"
      subtitle={`Compared against ${linkId ?? "the selected link"} · ranked by similarity`}
      onClose={onClose}
      testId="chennai-similar-links"
      wide
    >
      <ul className="space-y-2">
        {sorted.map((r) => (
          <li key={r.id} className="rounded-lg border border-slate-200 p-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[12px] font-semibold text-slate-900">{r.name}</p>
              <span
                className={cn(
                  "rounded-full border px-1.5 py-[1px] text-[10px] font-medium",
                  r.supports ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800",
                )}
              >
                {r.supports ? "Supports current prediction" : "Challenges current prediction"}
              </span>
            </div>

            <div className="mt-1 h-1.5 w-full rounded bg-slate-100" aria-hidden>
              <div className="h-1.5 rounded bg-blue-500" style={{ width: `${r.similarityPct}%` }} />
            </div>

            <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10.5px] sm:grid-cols-3">
              <div><dt className="inline text-slate-500">Similarity: </dt><dd className="inline font-medium text-slate-900">{r.similarityPct}%</dd></div>
              <div><dt className="inline text-slate-500">Driver: </dt><dd className="inline font-medium text-slate-900">{r.primaryDriver}</dd></div>
              <div><dt className="inline text-slate-500">Product: </dt><dd className="inline font-medium text-slate-900">{r.product}</dd></div>
              <div><dt className="inline text-slate-500">Distance: </dt><dd className="inline font-medium text-slate-900">{r.distanceKm} km</dd></div>
              <div><dt className="inline text-slate-500">Optical response: </dt><dd className="inline font-medium text-slate-900">{r.opticalResponse}</dd></div>
              <div><dt className="inline text-slate-500">Outcome: </dt><dd className="inline font-medium text-slate-900">{r.actualOutcome}</dd></div>
              <div><dt className="inline text-slate-500">Action taken: </dt><dd className="inline font-medium text-slate-900">{r.actionTaken}</dd></div>
              <div><dt className="inline text-slate-500">Prediction accuracy: </dt><dd className="inline font-medium text-slate-900">{r.predictionAccuracy}</dd></div>
              <div><dt className="inline text-slate-500">Recovery: </dt><dd className="inline font-medium text-slate-900">{r.recoveryResult}</dd></div>
              <div><dt className="inline text-slate-500">Evidence quality: </dt><dd className="inline font-medium text-slate-900">{r.evidenceQuality}</dd></div>
            </dl>

            <p className="mt-1 text-[10.5px] text-slate-600">
              <span className="font-medium text-slate-700">Differences: </span>
              {r.differences.join("; ")}.
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-slate-500">
        Synthetic historical records used to explain the current prediction. Not Taara operational history.
      </p>
    </PipelineDrawer>
  );
}
