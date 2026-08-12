import { useState } from "react";
import {
  SectionCard, StatusPill, DetailDrawer, DetailBlock, Legend,
  toneAccent, toneMap,
} from "../components/primitives";
import { complianceFrameworks, securityLayers } from "../data";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SecurityGovernance() {
  const [selectedId, setSelectedId] = useState<string | null>(securityLayers[0].id);
  const sel = securityLayers.find((l) => l.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
      <div className="space-y-4">
        <SectionCard
          title="Layered Security &amp; Governance · CISO View"
          subtitle="Defense-in-depth. Each layer answers one question the CISO will ask — and stacks on the one below it."
        >
          {/* Legend */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5 mb-4">
            <Legend items={[
              { label: "Foundational layer", tone: "slate",   note: "Lower layers protect higher ones" },
              { label: "Detective control",  tone: "amber",  note: "Detects and alerts" },
              { label: "Preventive control", tone: "emerald", note: "Blocks before impact" },
              { label: "Assurance control",  tone: "indigo",  note: "Proves it worked" },
            ]} />
          </div>

          {/* Stacked layer pyramid */}
          <div className="space-y-2">
            {securityLayers.map((l, i) => {
              const Icon = l.icon;
              const active = selectedId === l.id;
              const tone = ["indigo", "rose", "amber", "violet", "teal"][i];
              return (
                <button
                  key={l.id}
                  onClick={() => setSelectedId(l.id)}
                  className={cn(
                    "w-full text-left rounded-xl border-2 p-4 transition",
                    active
                      ? cn(toneMap[tone], "border-slate-900 shadow-md")
                      : cn(toneMap[tone], "hover:shadow-sm hover:border-slate-400"),
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("h-12 w-12 rounded-lg bg-white border grid place-items-center shrink-0", `border-${tone}-200`)}>
                      <Icon className={cn("h-5 w-5", toneAccent[tone])} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-3">
                        <span className={cn("text-[10.5px] font-semibold uppercase tracking-wider", toneAccent[tone])}>
                          Layer {i + 1}
                        </span>
                        <span className="text-[15px] font-semibold text-slate-900">{l.title}</span>
                      </div>
                      <p className="text-[13px] text-slate-700 mt-1 leading-snug">{l.ciso}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {l.items.slice(0, 5).map((it) => (
                          <span key={it} className="rounded-md bg-white border border-slate-200 text-[11.5px] text-slate-700 px-2 py-0.5">
                            {it}
                          </span>
                        ))}
                        {l.items.length > 5 && (
                          <span className="rounded-md bg-white border border-slate-200 text-[11.5px] text-slate-500 px-2 py-0.5">
                            +{l.items.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Compliance alignment" subtitle="Directional posture — formal certification is customer- and workload-specific.">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {complianceFrameworks.map((c) => (
              <div key={c.name} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <div className="text-[13px] font-semibold text-slate-900 mt-1.5">{c.name}</div>
                <div className="mt-1"><StatusPill tone="emerald">{c.status}</StatusPill></div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Right drawer */}
      <div>
        {sel ? (
          <DetailDrawer title={sel.title} subtitle="Security layer" tone="rose" onClose={() => setSelectedId(null)}>
            <StatusPill tone="rose">CISO focus</StatusPill>
            <p className="text-[13px] text-slate-700 leading-relaxed">{sel.ciso}</p>
            <DetailBlock label="Controls in this layer" items={sel.items} tone="rose" />
            <DetailBlock label="How it's enforced" items={[
              "Azure Policy assignments per subscription",
              "Defender for Cloud recommendations",
              "Bicep / Terraform baseline modules",
              "CI/CD guardrails on every deploy",
            ]} tone="teal" />
            <DetailBlock label="How it's proven" items={[
              "Immutable audit stream to Log Analytics",
              "Sentinel analytics rules and workbooks",
              "Purview data map + lineage",
              "Compliance manager mapping",
            ]} tone="indigo" />
          </DetailDrawer>
        ) : (
          <DetailDrawer title="Select a layer" subtitle="Click any of the five defense-in-depth layers">
            <p className="text-[12.5px] text-slate-500">
              Each layer opens a detail view with its controls, how they're enforced, and how the posture is proven to auditors.
            </p>
          </DetailDrawer>
        )}
      </div>
    </div>
  );
}
