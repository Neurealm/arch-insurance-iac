import { useState } from "react";
import { Cloud, Lock, Server, Network, Layers, Eye, ShieldCheck, GitBranch } from "lucide-react";
import { SectionCard, StatusPill, DetailDrawer, DetailBlock } from "../components/primitives";
import {
  azurePaasServices, deploymentPatterns, devsecops, govFoundation, observabilityStack,
} from "../data";

const subnets = [
  { id: "appgw", name: "Application Gateway Subnet", nodes: ["Azure App Gateway v2", "WAF Policy"] },
  { id: "aks", name: "AKS / Agent Runtime Subnet", nodes: ["Experience Services", "Multi-Agent Control Plane", "Specialist Agent Mesh", "Runtime Services"] },
  { id: "int", name: "Integration Subnet", nodes: ["Integration Runtime", "Connector Workers"] },
  { id: "pe", name: "Private Endpoint Subnet", nodes: ["PE to Azure OpenAI", "PE to AI Search", "PE to Cosmos DB", "PE to SQL DB", "PE to Storage", "PE to Key Vault", "PE to Event Hubs", "PE to Service Bus", "PE to AI Foundry"] },
  { id: "mgmt", name: "Management Subnet", nodes: ["Jump / Bastion", "Log forwarders"] },
];

const patternImpacts: Record<string, string[]> = {
  aks: ["4–6 system + 3–8 user node pools", "Full network isolation", "Best for large enterprises"],
  aca: ["Serverless containers", "No node ops", "Faster time-to-value; less control"],
  vm: ["VMSS with pinned images", "Best for strict regulatory pinning", "Higher ops overhead"],
  hybrid: ["Control plane on-prem", "Azure AI via ExpressRoute + Private Link", "Two operating models to run"],
};

export default function AzureDeployment() {
  const [pattern, setPattern] = useState<string>("aks");
  const [sel, setSel] = useState<{ title: string; desc: string; items?: string[] } | null>({
    title: "Enterprise AKS",
    desc: "Full-control AKS deployment on a spoke VNet with private endpoints to all Azure PaaS AI and data services.",
    items: patternImpacts.aks,
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
      <div className="space-y-4">
        <SectionCard
          title="Azure landing zone · Hub & Spoke"
          subtitle="Azure PaaS services are consumed via Private Endpoint / Private Link — not inside the VNet."
          right={
            <div className="flex gap-1">
              {deploymentPatterns.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPattern(p.id); setSel({ title: p.label, desc: p.desc, items: patternImpacts[p.id] }); }}
                  className={`px-2.5 py-1 text-[11px] rounded-md border transition ${
                    pattern === p.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-12 gap-3">
            {/* Left: Users & Edge */}
            <div className="col-span-12 md:col-span-3 space-y-3">
              <MiniCard title="Users & Channels" items={["Web", "Teams", "Slack", "Email", "Mobile", "API", "Voice"]}
                onItem={(i) => setSel({ title: i, desc: "Channel entering Azure Front Door." })} />
              <MiniCard title="Edge & Access Security" tone="rose"
                items={["Azure Front Door", "Azure WAF", "DDoS Protection", "Azure API Management", "Microsoft Entra ID", "Rate Limiting"]}
                onItem={(i) => setSel({ title: i, desc: "Enforces perimeter controls before requests hit the Spoke VNet." })} />
            </div>

            {/* Center: Landing zone */}
            <div className="col-span-12 md:col-span-6">
              <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 mb-2">Hub VNet · Shared Services</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {["Azure Firewall", "Azure Bastion", "Private DNS", "VPN / ExpressRoute", "NAT Gateway", "Management / Jump"].map((i) => (
                    <Chip key={i} label={i} onClick={() => setSel({ title: i, desc: "Shared service in Hub VNet." })} />
                  ))}
                </div>

                <div className="rounded-lg border border-indigo-300 bg-white p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider">Spoke VNet · Neurealm Agentic AI Platform</div>
                    <StatusPill tone="indigo">{deploymentPatterns.find(p => p.id === pattern)?.label}</StatusPill>
                  </div>
                  <div className="space-y-2">
                    {subnets.map((s) => (
                      <div key={s.id} className="rounded-md border border-slate-200 bg-slate-50/60 p-2">
                        <button onClick={() => setSel({ title: s.name, desc: "Spoke VNet subnet.", items: s.nodes })}
                          className="text-[11px] font-semibold text-slate-800 uppercase tracking-wide hover:text-indigo-700">
                          {s.name}
                        </button>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {s.nodes.map((n) => (
                            <Chip key={n} label={n} onClick={() => setSel({ title: n, desc: `Deployed in ${s.name}.` })} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-slate-500">
                    <Lock className="h-3 w-3 text-slate-400" />
                    All PaaS access below traverses Private Endpoints from the Private Endpoint Subnet.
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Azure PaaS + Observability */}
            <div className="col-span-12 md:col-span-3 space-y-3">
              <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-3">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-violet-800 mb-2">
                  <Cloud className="h-3.5 w-3.5" /> Azure PaaS · via Private Link
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {azurePaasServices.map((s) => (
                    <button key={s.id}
                      onClick={() => setSel({ title: s.name, desc: s.desc, items: ["Category: " + s.cat, "Consumed via Private Endpoint", "Isolated from public internet"] })}
                      className="text-left rounded-md bg-white border border-violet-100 px-2 py-1.5 text-[11.5px] text-slate-800 hover:border-violet-300">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-[10.5px] text-slate-500 truncate">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <MiniCard title="Observability & Operations" tone="teal" items={observabilityStack}
                icon={Eye}
                onItem={(i) => setSel({ title: i, desc: "Signal captured across the platform for ops, cost, and audit." })} />
            </div>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard title="Governance, Security & Trust foundation">
            <div className="flex flex-wrap gap-1.5">
              {govFoundation.map((g) => (
                <Chip key={g} label={g} tone="rose" onClick={() => setSel({ title: g, desc: "Foundational control applied via Azure Policy, Defender, and platform standards." })} />
              ))}
            </div>
          </SectionCard>
          <SectionCard title="DevSecOps & delivery">
            <div className="flex flex-wrap gap-1.5">
              {devsecops.map((g) => (
                <Chip key={g} label={g} tone="slate" onClick={() => setSel({ title: g, desc: "Delivery capability used to ship and evolve the platform." })} />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <div>
        <DetailDrawer title={sel?.title ?? "Select a component"} subtitle="Azure deployment element">
          {sel ? (
            <>
              <div className="text-[13px] text-slate-700 leading-relaxed">{sel.desc}</div>
              {sel.items && <DetailBlock label="Details" items={sel.items} tone="indigo" />}
            </>
          ) : (
            <p className="text-[12px] text-slate-500">Click any card to inspect.</p>
          )}
        </DetailDrawer>
      </div>
    </div>
  );
}

function MiniCard({ title, items, onItem, tone = "slate", icon: Icon }: {
  title: string; items: string[]; onItem: (i: string) => void; tone?: string; icon?: any;
}) {
  const toneMap: Record<string, string> = {
    slate: "border-slate-200 bg-white",
    rose: "border-rose-200 bg-rose-50/40",
    teal: "border-teal-200 bg-teal-50/40",
  };
  return (
    <div className={`rounded-xl border p-3 ${toneMap[tone]}`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-600" />}
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-700">{title}</div>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((i) => <Chip key={i} label={i} onClick={() => onItem(i)} />)}
      </div>
    </div>
  );
}

function Chip({ label, onClick, tone = "indigo" }: { label: string; onClick: () => void; tone?: string }) {
  const toneMap: Record<string, string> = {
    indigo: "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40",
    rose: "bg-white border-rose-200 text-rose-800 hover:bg-rose-50",
    slate: "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
  };
  return (
    <button onClick={onClick} className={`rounded-md border px-1.5 py-0.5 text-[11px] transition ${toneMap[tone]}`}>
      {label}
    </button>
  );
}
