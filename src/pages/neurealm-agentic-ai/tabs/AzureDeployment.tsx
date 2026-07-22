import { useState } from "react";
import {
  Cloud, Lock, Server, Network, Layers, Eye, ShieldCheck, GitBranch,
  ArrowRight, Building2, Database,
} from "lucide-react";
import {
  SectionCard, StatusPill, DetailDrawer, DetailBlock, Legend,
  toneAccent, toneMap,
} from "../components/primitives";
import {
  azurePaasServices, deploymentPatterns, devsecops, externalSystems,
  govFoundation, hubServices, observabilityStack, spokeSubnets,
  type NodeKind,
} from "../data";
import { cn } from "@/lib/utils";

type Selection =
  | { kind: "pattern"; id: string }
  | { kind: "hub"; name: string; desc: string }
  | { kind: "subnet"; id: string }
  | { kind: "node"; name: string; nodeKind: NodeKind; parent: string; desc?: string }
  | { kind: "paas"; id: string }
  | { kind: "ext"; name: string }
  | { kind: "info"; title: string; desc: string; items?: string[] }
  | null;

const patternImpacts: Record<string, string[]> = {
  aks:    ["4–6 system + 3–8 user node pools", "Full network isolation", "Best for large enterprises with a platform team"],
  aca:    ["Serverless containers, no node ops", "Managed scale + revisions", "Faster time-to-value; less control"],
  vm:     ["VMSS with pinned images", "Best for strict regulatory pinning", "Higher ops overhead"],
  hybrid: ["Control plane on-prem", "Azure AI via ExpressRoute + Private Link", "Two operating models to run"],
};

const nodeVisual: Record<NodeKind, { tone: string; label: string; icon: any }> = {
  vnet:   { tone: "indigo", label: "Inside VNet",             icon: Server   },
  pe:     { tone: "violet", label: "Private Endpoint",        icon: Lock     },
  paas:   { tone: "violet", label: "Azure PaaS via Private Link", icon: Cloud },
  ext:    { tone: "amber",  label: "External system",         icon: Building2 },
  shared: { tone: "slate",  label: "Hub shared service",      icon: Network  },
};

const legendItems = [
  { label: "Inside Spoke VNet",                  tone: "indigo", note: "Compute in your subnets" },
  { label: "Private Endpoint (Private Link)",    tone: "violet", note: "PaaS reached privately" },
  { label: "External enterprise system",          tone: "amber",  note: "Reached over ExpressRoute / API" },
  { label: "Hub shared service",                  tone: "slate",  note: "Central networking + DNS" },
];

export default function AzureDeployment() {
  const [pattern, setPattern] = useState<string>("aks");
  const [sel, setSel] = useState<Selection>({ kind: "pattern", id: "aks" });

  const paas = azurePaasServices.find((s) => s.id === (sel?.kind === "paas" ? sel.id : ""));
  const subnetSel = sel?.kind === "subnet" ? spokeSubnets.find((s) => s.id === sel.id) : null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
      <div className="space-y-4">
        <SectionCard
          title="Azure Landing Zone · Hub &amp; Spoke Deployment"
          subtitle="Neurealm workloads run in a Spoke VNet. Every Azure PaaS service is consumed via Private Endpoint. External systems are reached through the Tool Gateway."
          right={
            <div className="flex flex-wrap gap-1">
              {deploymentPatterns.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPattern(p.id); setSel({ kind: "pattern", id: p.id }); }}
                  className={cn(
                    "px-2.5 py-1 text-[11.5px] rounded-md border transition font-medium",
                    pattern === p.id
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          }
        >
          {/* Legend */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5 mb-4">
            <Legend items={legendItems} />
          </div>

          {/* Landing Zone container */}
          <div className="rounded-xl border-2 border-slate-300 bg-slate-50/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-slate-600" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                  Azure Landing Zone · Customer Tenant · Region: East US 2
                </span>
              </div>
              <StatusPill tone="indigo">
                {deploymentPatterns.find((p) => p.id === pattern)?.label}
              </StatusPill>
            </div>

            {/* Hub VNet */}
            <div className={cn("rounded-lg border-2 p-3 mb-4", toneMap.slate)}>
              <SectionRow icon={Network} label="Hub VNet · 10.10.0.0/16 · Shared Services" tone="slate" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {hubServices.map((h) => (
                  <button
                    key={h.name}
                    onClick={() => setSel({ kind: "hub", name: h.name, desc: h.desc })}
                    className={cn(
                      "text-left rounded-md border bg-white px-2.5 py-2 transition",
                      sel?.kind === "hub" && sel.name === h.name
                        ? "border-slate-900 shadow-sm"
                        : "border-slate-200 hover:border-slate-400",
                    )}
                  >
                    <div className="text-[12.5px] font-medium text-slate-900">{h.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{h.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* VNet peering arrow */}
            <div className="flex items-center justify-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
              <span className="h-px w-16 bg-slate-300" />
              VNet Peering
              <ArrowRight className="h-3 w-3" />
              <span className="h-px w-16 bg-slate-300" />
            </div>

            {/* Spoke VNet */}
            <div className={cn("rounded-lg border-2 p-3", toneMap.indigo)}>
              <SectionRow
                icon={Server}
                label="Spoke VNet · 10.20.0.0/16 · Neurealm Agentic AI Platform"
                tone="indigo"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {spokeSubnets.map((s) => (
                  <div key={s.id} className="rounded-lg border border-white bg-white/80 backdrop-blur-sm p-2.5">
                    <button
                      onClick={() => setSel({ kind: "subnet", id: s.id })}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[12px] font-semibold text-slate-900 truncate">{s.name}</div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{s.cidr}</span>
                      </div>
                    </button>
                    <div className="mt-2 space-y-1">
                      {s.nodes.map((n) => {
                        const v = nodeVisual[n.kind];
                        const Icon = v.icon;
                        return (
                          <button
                            key={n.name}
                            onClick={() => setSel({ kind: "node", name: n.name, nodeKind: n.kind, parent: s.name, desc: n.desc })}
                            className={cn(
                              "w-full flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-[11.5px] transition",
                              sel?.kind === "node" && sel.name === n.name
                                ? cn(toneMap[v.tone], "border-slate-900 shadow-sm")
                                : cn(toneMap[v.tone], "hover:shadow-sm"),
                            )}
                          >
                            <Icon className={cn("h-3.5 w-3.5 shrink-0", toneAccent[v.tone])} />
                            <span className="truncate text-slate-900">{n.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-600">
                <Lock className="h-3 w-3 text-violet-600" />
                All PaaS traffic below traverses <span className="font-semibold">snet-privateendpoints</span> — no public internet path.
              </div>
            </div>

            {/* Private Link arrows */}
            <div className="flex items-center justify-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-violet-700 my-3">
              <span className="h-px w-16 bg-violet-300" />
              Private Link
              <ArrowRight className="h-3 w-3" />
              <span className="h-px w-16 bg-violet-300" />
            </div>

            {/* Azure PaaS row */}
            <div className={cn("rounded-lg border-2 p-3", toneMap.violet)}>
              <SectionRow icon={Cloud} label="Azure PaaS Services · Consumed via Private Endpoint" tone="violet" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                {azurePaasServices.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSel({ kind: "paas", id: s.id })}
                    className={cn(
                      "text-left rounded-md border bg-white px-2.5 py-2 transition",
                      sel?.kind === "paas" && sel.id === s.id
                        ? "border-violet-500 shadow-sm"
                        : "border-violet-100 hover:border-violet-300",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[12.5px] font-medium text-slate-900 truncate">{s.name}</div>
                      <span className="text-[9.5px] font-mono uppercase text-violet-600">{s.cat}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* External systems band */}
          <div className={cn("mt-4 rounded-lg border-2 p-3", toneMap.amber)}>
            <SectionRow
              icon={Building2}
              label="External Enterprise Systems · reached via Tool Gateway (ExpressRoute or public API)"
              tone="amber"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
              {externalSystems.map((e) => (
                <button
                  key={e.name}
                  onClick={() => setSel({ kind: "ext", name: e.name })}
                  className={cn(
                    "text-left rounded-md border bg-white px-2.5 py-2 transition",
                    sel?.kind === "ext" && sel.name === e.name
                      ? "border-amber-500 shadow-sm"
                      : "border-amber-100 hover:border-amber-300",
                  )}
                >
                  <div className="text-[12px] font-medium text-slate-900 truncate">{e.name}</div>
                  <div className="text-[10.5px] text-amber-700 mt-0.5">{e.kind} · {e.via}</div>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Governance, security & trust foundation">
            <div className="flex flex-wrap gap-1.5">
              {govFoundation.map((g) => (
                <button
                  key={g}
                  onClick={() => setSel({ kind: "info", title: g, desc: "Foundational control applied via Azure Policy, Defender, and platform standards." })}
                  className="rounded-md border border-rose-200 bg-rose-50/60 text-rose-800 px-2 py-1 text-[11.5px] hover:bg-rose-100"
                >
                  {g}
                </button>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="DevSecOps &amp; delivery">
            <div className="flex flex-wrap gap-1.5">
              {devsecops.map((g) => (
                <button
                  key={g}
                  onClick={() => setSel({ kind: "info", title: g, desc: "Delivery capability used to ship and evolve the platform safely." })}
                  className="rounded-md border border-slate-200 bg-white text-slate-700 px-2 py-1 text-[11.5px] hover:border-slate-400"
                >
                  {g}
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Right — drawer */}
      <div>
        {sel?.kind === "pattern" ? (
          <DetailDrawer title={deploymentPatterns.find(p => p.id === sel.id)?.label ?? ""} subtitle="Deployment pattern" tone="indigo" onClose={() => setSel(null)}>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              {deploymentPatterns.find(p => p.id === sel.id)?.desc}
            </p>
            <DetailBlock label="Impact" items={patternImpacts[sel.id]} tone="indigo" />
          </DetailDrawer>
        ) : sel?.kind === "hub" ? (
          <DetailDrawer title={sel.name} subtitle="Hub VNet · shared service" tone="slate" onClose={() => setSel(null)}>
            <StatusPill tone="slate">Hub shared</StatusPill>
            <p className="text-[13px] text-slate-700 leading-relaxed">{sel.desc}</p>
            <DetailBlock label="Applies to" items={["Every spoke peered to the hub", "Both prod and non-prod tenants"]} />
          </DetailDrawer>
        ) : subnetSel ? (
          <DetailDrawer title={subnetSel.name} subtitle={`Spoke subnet · ${subnetSel.cidr}`} tone="indigo" onClose={() => setSel(null)}>
            <StatusPill tone="indigo">Inside VNet</StatusPill>
            <p className="text-[13px] text-slate-700 leading-relaxed">{subnetSel.purpose}</p>
            <DetailBlock label="Contained workloads" items={subnetSel.nodes.map(n => n.name)} tone="indigo" />
            <DetailBlock label="Network controls" items={["NSG on subnet", "UDR to Azure Firewall for egress", "Private DNS zone links"]} tone="rose" />
          </DetailDrawer>
        ) : sel?.kind === "node" ? (
          <DetailDrawer title={sel.name} subtitle={`${nodeVisual[sel.nodeKind].label} · ${sel.parent}`} tone={nodeVisual[sel.nodeKind].tone} onClose={() => setSel(null)}>
            <StatusPill tone={nodeVisual[sel.nodeKind].tone}>{nodeVisual[sel.nodeKind].label}</StatusPill>
            {sel.desc && <p className="text-[13px] text-slate-700 leading-relaxed">{sel.desc}</p>}
            {sel.nodeKind === "pe" && (
              <DetailBlock label="Private Endpoint properties" items={[
                "Private IP inside snet-privateendpoints",
                "Resolved via privatelink.* Private DNS zone",
                "No public endpoint reachable",
                "Traffic never leaves the Microsoft backbone",
              ]} tone="violet" />
            )}
            {sel.nodeKind === "vnet" && (
              <DetailBlock label="Workload characteristics" items={[
                "Runs on customer-managed compute",
                "Egress via Azure Firewall in the hub",
                "Managed identity for all Azure calls",
              ]} tone="indigo" />
            )}
          </DetailDrawer>
        ) : paas ? (
          <DetailDrawer title={paas.name} subtitle={`Azure PaaS · ${paas.cat}`} tone="violet" onClose={() => setSel(null)}>
            <StatusPill tone="violet">Private Link</StatusPill>
            <p className="text-[13px] text-slate-700 leading-relaxed">{paas.desc}</p>
            <DetailBlock label="Access pattern" items={[
              "Public network access disabled",
              "Consumed via Private Endpoint in snet-privateendpoints",
              "Managed identity authentication",
              "Diagnostic settings to Log Analytics",
            ]} tone="violet" />
            <DetailBlock label="Data considerations" items={[
              "Encryption at rest with customer-managed keys",
              "Purview classification propagates",
              "No customer data used for model training (AI services)",
            ]} tone="rose" />
          </DetailDrawer>
        ) : sel?.kind === "ext" ? (
          <DetailDrawer title={sel.name} subtitle="External enterprise system" tone="amber" onClose={() => setSel(null)}>
            <StatusPill tone="amber">External</StatusPill>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              Reached exclusively through the Tool Gateway. Calls are typed, authorized, rate-limited, and audited.
            </p>
            <DetailBlock label="Connectivity options" items={[
              "ExpressRoute for on-prem workloads",
              "Public REST + OAuth for SaaS",
              "Private Link Service where offered by vendor",
            ]} tone="amber" />
            <DetailBlock label="Governance" items={[
              "One connector, one schema, one owner",
              "Write actions gated by HITL policy",
              "Every call recorded with correlation ID",
            ]} tone="rose" />
          </DetailDrawer>
        ) : sel?.kind === "info" ? (
          <DetailDrawer title={sel.title} subtitle="Foundation control" tone="rose" onClose={() => setSel(null)}>
            <p className="text-[13px] text-slate-700 leading-relaxed">{sel.desc}</p>
            {sel.items && <DetailBlock label="Details" items={sel.items} />}
          </DetailDrawer>
        ) : (
          <DetailDrawer title="Select any element" subtitle="Click a subnet, endpoint, PaaS service or external system">
            <p className="text-[12.5px] text-slate-500">
              Every element in the landing zone opens a detail view with its role, access pattern, and security considerations.
            </p>
          </DetailDrawer>
        )}
      </div>
    </div>
  );
}

function SectionRow({ icon: Icon, label, tone }: { icon: any; label: string; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={cn("h-4 w-4", toneAccent[tone])} />
      <span className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-700">{label}</span>
    </div>
  );
}
