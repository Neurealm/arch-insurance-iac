/**
 * AIM-003 — Evidence drawer for the Chennai scenario.
 */

import * as React from "react";
import { PipelineDrawer } from "../pipeline/PipelineDrawer";
import { cn } from "@/lib/utils";
import { chennaiEvidenceSections, type EvidenceItem } from "./chennaiFixtures";

function Chip({ children, tone }: { children: React.ReactNode; tone: "high" | "med" | "low" | "warn" }) {
  return (
    <span
      className={cn(
        "rounded-full border px-1.5 py-[1px] text-[9.5px] font-medium",
        tone === "high" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "med" && "border-amber-200 bg-amber-50 text-amber-800",
        tone === "low" && "border-slate-200 bg-slate-50 text-slate-600",
        tone === "warn" && "border-rose-200 bg-rose-50 text-rose-700",
      )}
    >
      {children}
    </span>
  );
}

function Item({ item }: { item: EvidenceItem }) {
  return (
    <li className="rounded border border-slate-200 p-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11.5px] font-medium text-slate-900">{item.label}</p>
        <p className="text-right text-[11.5px] font-semibold text-slate-900">{item.value}</p>
      </div>
      <p className="mt-0.5 text-[10.5px] text-slate-600">
        {item.source} · {item.timestamp} · {item.freshness}
      </p>
      <div className="mt-1 flex flex-wrap gap-1">
        <Chip tone={item.reliability === "High" ? "high" : item.reliability === "Medium" ? "med" : "low"}>
          {item.reliability} reliability
        </Chip>
        <Chip tone="low">{item.relevance}</Chip>
        <Chip tone={item.stance === "Contradicting" ? "warn" : item.stance === "Supporting" ? "high" : "low"}>
          {item.stance}
        </Chip>
      </div>
    </li>
  );
}

export function EvidenceDrawer({
  open, onClose, linkId,
}: {
  open: boolean;
  onClose: () => void;
  linkId: string | null;
}) {
  if (!open) return null;

  const supporting = chennaiEvidenceSections.flatMap((s) => s.items).filter((i) => i.stance === "Supporting").length;
  const contradicting = chennaiEvidenceSections.flatMap((s) => s.items).filter((i) => i.stance === "Contradicting").length;

  return (
    <PipelineDrawer
      open={open}
      title="Prediction evidence"
      subtitle={`${linkId ?? "No link selected"} · ${supporting} supporting and ${contradicting} contradicting references`}
      onClose={onClose}
      testId="chennai-evidence"
      wide
    >
      <div className="space-y-2.5">
        {chennaiEvidenceSections.map((section) => (
          <section key={section.id} aria-label={section.title}>
            <h4 className="mb-1 text-[11px] font-semibold text-slate-800">{section.title}</h4>
            <ul className="space-y-1">
              {section.items.map((item) => <Item key={item.id} item={item} />)}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-slate-500">
        Synthetic reference evidence. Every value is generated locally for demonstration purposes.
      </p>
    </PipelineDrawer>
  );
}
