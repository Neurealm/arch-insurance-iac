import { useState } from "react";
import {
  Users, ShieldCheck, Server, Cloud, Eye, Gavel, Layers,
} from "lucide-react";
import {
  ArchitectureLayerCard, CapabilityCard, DetailBlock, DetailDrawer, SectionCard, StatusPill,
} from "../components/primitives";
import {
  accessSecurity, crossCutting, enterpriseSystems, experienceChannels,
  modelEcosystem, platformLayers, type Layer,
} from "../data";

type Selection =
  | { kind: "layer"; layer: Layer }
  | { kind: "note"; title: string; description: string; items?: string[] }
  | null;

export default function ReferenceArchitecture() {
  const [sel, setSel] = useState<Selection>({ kind: "layer", layer: platformLayers[1] });

  const pick = (s: Selection) => setSel(s);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
      <div className="space-y-4">
        <SectionCard title="Neurealm reference architecture" subtitle="Interactive layers · click any card to inspect">
          <div className="grid grid-cols-12 gap-3">
            {/* Users & Channels */}
            <div className="col-span-12 md:col-span-2">
              <ColumnLabel>Users & Channels</ColumnLabel>
              <div className="space-y-1.5">
                {experienceChannels.map((c) => (
                  <CapabilityCard key={c.id} label={c.label} icon={c.icon}
                    onClick={() => pick({ kind: "note", title: c.label, description: "Channel adapter into the Experience Layer." })} />
                ))}
              </div>
            </div>

            {/* Access & Security */}
            <div className="col-span-12 md:col-span-2">
              <ColumnLabel>Access & Security</ColumnLabel>
              <div className="space-y-1.5">
                {accessSecurity.map((s) => (
                  <CapabilityCard key={s} label={s} icon={ShieldCheck}
                    onClick={() => pick({ kind: "note", title: s, description: "Edge control enforced before requests reach the platform." })} />
                ))}
              </div>
            </div>

            {/* Center platform */}
            <div className="col-span-12 md:col-span-5">
              <ColumnLabel highlight>Neurealm Agentic AI Platform</ColumnLabel>
              <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-violet-50/40 p-3 space-y-2">
                {platformLayers.map((l) => (
                  <ArchitectureLayerCard
                    key={l.id}
                    title={l.title}
                    icon={l.icon}
                    tone={l.tone}
                    capabilities={l.capabilities}
                    active={sel?.kind === "layer" && sel.layer.id === l.id}
                    onClick={() => pick({ kind: "layer", layer: l })}
                  />
                ))}
              </div>
            </div>

            {/* Enterprise systems */}
            <div className="col-span-12 md:col-span-2">
              <ColumnLabel>Enterprise Systems</ColumnLabel>
              <div className="space-y-1.5">
                {enterpriseSystems.map((s) => (
                  <CapabilityCard key={s} label={s} icon={Server}
                    onClick={() => pick({ kind: "note", title: s, description: "Target system reached via typed connectors and Tool Gateway.", items: ["OAuth / OBO auth", "Rate-limited via APIM", "Audited tool call"] })} />
                ))}
              </div>
            </div>

            {/* Model ecosystem */}
            <div className="col-span-12 md:col-span-1">
              <ColumnLabel>Model Ecosystem</ColumnLabel>
              <div className="space-y-1.5">
                {modelEcosystem.map((m) => (
                  <CapabilityCard key={m} label={m} icon={Cloud}
                    onClick={() => pick({ kind: "note", title: m, description: "Available via the Model Gateway. Routing is per-task, not per-tenant." })} />
                ))}
              </div>
            </div>
          </div>

          {/* Cross-cutting */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <CrossBar title="Governance, Security & Trust" tone="rose" icon={Gavel}
              items={crossCutting.governance}
              onSelect={(item) => pick({ kind: "note", title: item, description: "Cross-cutting control enforced across every layer." })} />
            <CrossBar title="Observability & Operations" tone="teal" icon={Eye}
              items={crossCutting.observability}
              onSelect={(item) => pick({ kind: "note", title: item, description: "Signal captured for every agent, tool call, and workflow." })} />
            <CrossBar title="Deployment Foundation" tone="slate" icon={Layers}
              items={crossCutting.deployment}
              onSelect={(item) => pick({ kind: "note", title: item, description: "Platform runtime and delivery foundation." })} />
          </div>
        </SectionCard>
      </div>

      {/* Right detail panel */}
      <div>
        {sel?.kind === "layer" ? (
          <DetailDrawer title={sel.layer.title} subtitle="Platform layer">
            <StatusPill tone="indigo">Layer</StatusPill>
            <div className="text-[13px] text-slate-700 leading-relaxed">{sel.layer.what}</div>
            <div className="rounded-md bg-indigo-50/60 border border-indigo-100 p-2 text-[12px] text-indigo-900">
              <span className="font-semibold">Why it matters: </span>{sel.layer.why}
            </div>
            <DetailBlock label="Key capabilities" items={sel.layer.capabilities} tone="indigo" />
            <DetailBlock label="Example technologies" items={sel.layer.tech} tone="violet" />
            <DetailBlock label="Customer decision points" items={sel.layer.decisions} tone="amber" />
            <DetailBlock label="Implementation notes" items={sel.layer.notes} tone="teal" />
          </DetailDrawer>
        ) : sel?.kind === "note" ? (
          <DetailDrawer title={sel.title} subtitle="Architecture element">
            <div className="text-[13px] text-slate-700 leading-relaxed">{sel.description}</div>
            {sel.items && <DetailBlock label="Considerations" items={sel.items} tone="indigo" />}
          </DetailDrawer>
        ) : (
          <DetailDrawer title="Select an element" subtitle="Click any card to inspect">
            <p className="text-[12px] text-slate-500">Layers, channels, systems, and cross-cutting controls all open a detail view here.</p>
          </DetailDrawer>
        )}
      </div>
    </div>
  );
}

function ColumnLabel({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${highlight ? "text-indigo-700" : "text-slate-500"}`}>
      {children}
    </div>
  );
}

function CrossBar({ title, tone, icon: Icon, items, onSelect }: {
  title: string; tone: string; icon: any; items: string[]; onSelect: (i: string) => void;
}) {
  const toneMap: Record<string, string> = {
    rose: "border-rose-200 bg-rose-50/60 text-rose-800",
    teal: "border-teal-200 bg-teal-50/60 text-teal-800",
    slate: "border-slate-200 bg-slate-50 text-slate-800",
  };
  return (
    <div className={`rounded-lg border p-3 ${toneMap[tone]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <div className="text-[13px] font-semibold">{title}</div>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((i) => (
          <button key={i} onClick={() => onSelect(i)}
            className="rounded-md bg-white/80 border border-white text-[11px] text-slate-700 px-1.5 py-0.5 hover:border-slate-300">
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}
