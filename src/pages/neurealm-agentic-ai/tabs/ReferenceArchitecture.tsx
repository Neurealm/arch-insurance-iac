import { useState } from "react";
import {
  Users, ShieldCheck, Server, Cloud, Eye, Gavel, Brain, Bot, Database,
  Workflow, ArrowRight,
} from "lucide-react";
import {
  ArchitectureLayerCard, CapabilityCard, DetailBlock, DetailDrawer,
  SectionCard, StatusPill, Legend, toneAccent, toneMap,
} from "../components/primitives";
import {
  accessSecurity, enterpriseSystems, experienceChannels,
  modelEcosystem, platformLayers, govFoundation, observabilityStack, type Layer,
} from "../data";
import { cn } from "@/lib/utils";

type Selection =
  | { kind: "layer"; layer: Layer }
  | { kind: "channel"; label: string }
  | { kind: "edge"; label: string }
  | { kind: "system"; label: string; systemKind: string }
  | { kind: "model"; label: string }
  | { kind: "cross"; title: string; items: string[]; tone: string }
  | null;

const legend = [
  { label: "Neurealm platform layer", tone: "indigo", note: "Runs inside the Spoke VNet" },
  { label: "User channel",            tone: "slate",  note: "Enters via secure edge" },
  { label: "Enterprise system",       tone: "amber",  note: "Reached via Tool Gateway" },
  { label: "Model provider",          tone: "violet", note: "Consumed via Model Gateway" },
  { label: "Cross-cutting control",   tone: "rose",   note: "Applied to every layer" },
];

export default function ReferenceArchitecture() {
  const [sel, setSel] = useState<Selection>({ kind: "layer", layer: platformLayers[1] });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
      <div className="space-y-4">
        <SectionCard
          title="Neurealm Agentic AI · Reference Architecture"
          subtitle="Five stacked platform layers, flanked by users, enterprise systems, and the model ecosystem. Click any element to inspect."
        >
          {/* Legend */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5 mb-4">
            <Legend items={legend} />
          </div>

          {/* Main diagram */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left column — users + edge */}
            <div className="col-span-12 lg:col-span-3 space-y-3">
              <ColumnTitle>Users & Channels</ColumnTitle>
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                {experienceChannels.map((c) => (
                  <CapabilityCard
                    key={c.id} label={c.label} icon={c.icon}
                    active={sel?.kind === "channel" && sel.label === c.label}
                    onClick={() => setSel({ kind: "channel", label: c.label })}
                  />
                ))}
              </div>

              <ColumnTitle tone="rose">Edge &amp; Access Security</ColumnTitle>
              <div className={cn("rounded-xl border p-3 space-y-1.5", toneMap.rose)}>
                {accessSecurity.map((s) => (
                  <CapabilityCard
                    key={s} label={s} icon={ShieldCheck} tone="rose"
                    active={sel?.kind === "edge" && sel.label === s}
                    onClick={() => setSel({ kind: "edge", label: s })}
                  />
                ))}
              </div>
            </div>

            {/* Center column — platform */}
            <div className="col-span-12 lg:col-span-6">
              <ColumnTitle tone="indigo" highlight>Neurealm Agentic AI Platform</ColumnTitle>
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/60 via-white to-violet-50/40 p-4">
                <div className="space-y-3">
                  {platformLayers.map((l, i) => (
                    <div key={l.id}>
                      <ArchitectureLayerCard
                        index={i + 1}
                        title={l.title}
                        purpose={l.purpose}
                        icon={l.icon}
                        tone={l.tone}
                        capabilities={l.capabilities}
                        active={sel?.kind === "layer" && sel.layer.id === l.id}
                        onClick={() => setSel({ kind: "layer", layer: l })}
                      />
                      {i < platformLayers.length - 1 && (
                        <div className="flex justify-center py-1" aria-hidden>
                          <div className="h-4 w-px bg-slate-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — enterprise + models */}
            <div className="col-span-12 lg:col-span-3 space-y-3">
              <ColumnTitle tone="amber">Enterprise Systems</ColumnTitle>
              <div className={cn("rounded-xl border p-3 space-y-1.5", toneMap.amber)}>
                {enterpriseSystems.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSel({ kind: "system", label: s.name, systemKind: s.kind })}
                    className={cn(
                      "w-full rounded-md border bg-white px-2.5 py-2 text-left transition text-[12.5px]",
                      sel?.kind === "system" && sel.label === s.name
                        ? "border-amber-500 bg-amber-50 shadow-sm"
                        : "border-amber-100 hover:border-amber-300 hover:bg-amber-50/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-900 truncate">{s.name}</span>
                      <span className="text-[10px] uppercase tracking-wide text-amber-700">{s.kind}</span>
                    </div>
                  </button>
                ))}
              </div>

              <ColumnTitle tone="violet">Model Ecosystem</ColumnTitle>
              <div className={cn("rounded-xl border p-3 space-y-1.5", toneMap.violet)}>
                {modelEcosystem.map((m) => (
                  <CapabilityCard
                    key={m} label={m} icon={Cloud} tone="violet"
                    active={sel?.kind === "model" && sel.label === m}
                    onClick={() => setSel({ kind: "model", label: m })}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Cross-cutting bands */}
          <div className="mt-5">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Cross-cutting controls · applied to every layer
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <CrossBand
                title="Governance, Security & Trust" tone="rose" icon={Gavel}
                items={govFoundation}
                onClick={() => setSel({ kind: "cross", title: "Governance, Security & Trust", items: govFoundation, tone: "rose" })}
                active={sel?.kind === "cross" && sel.title === "Governance, Security & Trust"}
              />
              <CrossBand
                title="Observability & Operations" tone="teal" icon={Eye}
                items={observabilityStack}
                onClick={() => setSel({ kind: "cross", title: "Observability & Operations", items: observabilityStack, tone: "teal" })}
                active={sel?.kind === "cross" && sel.title === "Observability & Operations"}
              />
              <CrossBand
                title="Delivery Foundation" tone="slate" icon={Workflow}
                items={["Bicep / Terraform", "GitHub / Azure DevOps", "Environment promotion", "Automated evals", "Blue/green"]}
                onClick={() => setSel({ kind: "cross", title: "Delivery Foundation", items: ["Bicep / Terraform", "GitHub / Azure DevOps", "Environment promotion", "Automated evals", "Blue/green"], tone: "slate" })}
                active={sel?.kind === "cross" && sel.title === "Delivery Foundation"}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Right — detail drawer */}
      <div>
        {sel?.kind === "layer" ? (
          <DetailDrawer
            title={sel.layer.title}
            subtitle="Platform layer"
            tone={sel.layer.tone}
            onClose={() => setSel(null)}
          >
            <StatusPill tone={sel.layer.tone}>Layer</StatusPill>
            <p className="text-[13px] text-slate-700 leading-relaxed">{sel.layer.purpose}</p>
            <DetailBlock label="Responsibilities" items={sel.layer.responsibilities} tone={sel.layer.tone} />
            <DetailBlock label="Azure services" items={sel.layer.azureServices} tone="violet" />
            <DetailBlock label="Implementation considerations" items={sel.layer.considerations} tone="teal" />
            <DetailBlock label="Customer decision points" items={sel.layer.decisions} tone="amber" />
            <DetailBlock label="Security considerations" items={sel.layer.security} tone="rose" />
          </DetailDrawer>
        ) : sel?.kind === "channel" ? (
          <DetailDrawer title={sel.label} subtitle="User channel" tone="slate" onClose={() => setSel(null)}>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              User surface into the Experience Layer. Every channel is a thin adapter — the same session, policy, and audit
              apply regardless of entry point.
            </p>
            <DetailBlock label="Reaches" items={["Experience Layer via Front Door", "Session bound to Entra ID identity", "Same conversation state across channels"]} />
            <DetailBlock label="Security" items={["TLS 1.2+", "MFA + Conditional Access", "Rate limiting at edge"]} tone="rose" />
          </DetailDrawer>
        ) : sel?.kind === "edge" ? (
          <DetailDrawer title={sel.label} subtitle="Edge control" tone="rose" onClose={() => setSel(null)}>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              Enforced before any request reaches the Spoke VNet. Fails closed on policy violation.
            </p>
            <DetailBlock label="Enforces" items={["Perimeter defence", "Identity + Conditional Access", "Rate and quota limits"]} tone="rose" />
          </DetailDrawer>
        ) : sel?.kind === "system" ? (
          <DetailDrawer title={sel.label} subtitle={`Enterprise ${sel.systemKind} system`} tone="amber" onClose={() => setSel(null)}>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              Reached exclusively through the Tool Gateway. Calls are typed, authorized, rate-limited, and audited.
            </p>
            <DetailBlock label="Integration pattern" items={["OAuth 2.0 on-behalf-of user", "Typed schema per action", "APIM rate limits", "Idempotency key required"]} tone="amber" />
            <DetailBlock label="Data handling" items={["No bulk copy of source data", "Reads cached with TTL", "Writes gated by HITL policy"]} tone="teal" />
          </DetailDrawer>
        ) : sel?.kind === "model" ? (
          <DetailDrawer title={sel.label} subtitle="Model provider" tone="violet" onClose={() => setSel(null)}>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              Consumed via the Model Gateway. Routing is per task class — never hard-coded per team.
            </p>
            <DetailBlock label="Controls" items={["Per-route SLO and cost cap", "Fall-back model for every route", "Content Safety on prompt + response", "No training on customer data"]} tone="violet" />
          </DetailDrawer>
        ) : sel?.kind === "cross" ? (
          <DetailDrawer title={sel.title} subtitle="Cross-cutting control" tone={sel.tone} onClose={() => setSel(null)}>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              Applied consistently across every platform layer — not bolted on later.
            </p>
            <DetailBlock label="Includes" items={sel.items} tone={sel.tone} />
          </DetailDrawer>
        ) : (
          <DetailDrawer title="Select any element" subtitle="Click a layer, channel, system or control">
            <p className="text-[12.5px] text-slate-500">
              Every element in the diagram opens a detail view here with responsibilities, Azure services, decisions and
              security considerations.
            </p>
          </DetailDrawer>
        )}
      </div>
    </div>
  );
}

function ColumnTitle({
  children, tone = "slate", highlight,
}: { children: React.ReactNode; tone?: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "text-[10.5px] font-semibold uppercase tracking-wider",
      highlight ? "text-indigo-700" : toneAccent[tone],
    )}>
      {children}
    </div>
  );
}

function CrossBand({
  title, tone, icon: Icon, items, onClick, active,
}: {
  title: string; tone: string; icon: any; items: string[];
  onClick: () => void; active?: boolean;
}) {
  return (
    <button
      type="button" onClick={onClick}
      className={cn(
        "text-left rounded-lg border-2 p-3 transition",
        active ? "border-slate-900 shadow-sm bg-white" : cn(toneMap[tone], "hover:shadow-sm"),
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", toneAccent[tone])} />
        <div className="text-[13px] font-semibold text-slate-900">{title}</div>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.slice(0, 6).map((i) => (
          <span key={i} className="rounded-md bg-white/80 border border-white text-[11px] text-slate-700 px-1.5 py-0.5">
            {i}
          </span>
        ))}
        {items.length > 6 && (
          <span className="rounded-md bg-white/80 border border-white text-[11px] text-slate-500 px-1.5 py-0.5">
            +{items.length - 6}
          </span>
        )}
      </div>
    </button>
  );
}
