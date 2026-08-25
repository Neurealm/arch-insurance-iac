import { useState } from "react";
import { toast } from "sonner";
import {
  ActionButton, Drawer, DrawerSection, Field, FieldGrid, ImpactCallout, PageHeader, Section, StatusChip, toneDot,
} from "./primitives";
import { integrations, type Integration } from "./data";
import { cn } from "@/lib/utils";

export default function DcfIntegrations() {
  const [sel, setSel] = useState<Integration | null>(null);
  const degraded = integrations.filter((i) => i.health !== "healthy");

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Direct Commerce Fulfillment"
        title="Integrations & System Health"
        description="Every system in the chain from the direct commercial transaction through Microsoft fulfillment to the customer's Azure environment, with the customer consequence of each dependency."
      />

      <div className="space-y-4 p-6">
        <Section title="Chain health" hint="Commerce → Entitlement → Fulfillment → Azure → Metering → Audit.">
          <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((i) => (
              <button
                key={i.id}
                onClick={() => setSel(i)}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-left transition-all hover:border-indigo-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[i.health])} />
                      <span className="truncate text-[13px] font-semibold text-slate-900">{i.name}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-slate-500">{i.role}</p>
                  </div>
                  <StatusChip status={i.health === "healthy" ? "Healthy" : i.health === "pending" ? "Degraded" : "Impaired"} tone={i.health} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <div><div className="text-slate-500">Latency</div><div className="font-medium text-slate-800">{i.latencyMs} ms</div></div>
                  <div><div className="text-slate-500">Error rate</div><div className="font-medium text-slate-800">{i.errorRate}</div></div>
                  <div><div className="text-slate-500">Last txn</div><div className="font-medium text-slate-800">{i.lastTxn}</div></div>
                </div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Open integration incidents" hint="Only conditions currently affecting the direct-to-fulfillment chain.">
          <ul className="divide-y divide-slate-100">
            {degraded.flatMap((i) =>
              i.incidents.map((inc, n) => (
                <li key={`${i.id}-${n}`} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <div>
                    <div className="text-[12.5px] font-medium text-slate-900">{i.name}</div>
                    <p className="mt-0.5 text-[11.5px] text-slate-600">{inc.note}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-500">{inc.at}</span>
                </li>
              )),
            )}
          </ul>
        </Section>
      </div>

      {sel && (
        <Drawer
          open
          onClose={() => setSel(null)}
          title={sel.name}
          subtitle={sel.role}
          badge={<StatusChip status={sel.health === "healthy" ? "Healthy" : sel.health === "pending" ? "Degraded" : "Impaired"} tone={sel.health} />}
          footer={
            <div className="flex flex-wrap gap-2">
              <ActionButton label="Run Connectivity Test" tone="primary" onClick={() => toast.success(`Connectivity test queued for ${sel.name}.`)} />
              <ActionButton label="View Recent Calls" onClick={() => toast.info(`Last 200 calls for ${sel.name} loaded.`)} />
            </div>
          }
        >
          <DrawerSection title="Customer impact">
            <ImpactCallout customerImpact={sel.customerImpact} tone={sel.health} />
          </DrawerSection>
          <DrawerSection title="Signals">
            <FieldGrid>
              <Field label="Latency (p95)" value={`${sel.latencyMs} ms`} />
              <Field label="Error rate" value={sel.errorRate} />
              <Field label="Last successful transaction" value={sel.lastTxn} />
              <Field label="Health" value={sel.health === "healthy" ? "Healthy" : sel.health === "pending" ? "Degraded" : "Impaired"} />
            </FieldGrid>
          </DrawerSection>
          <DrawerSection title="Recent incidents">
            {sel.incidents.length ? (
              <ul className="space-y-1.5">
                {sel.incidents.map((i, n) => (
                  <li key={n} className="rounded-md border border-slate-200 px-3 py-2">
                    <div className="text-[11px] text-slate-500">{i.at}</div>
                    <p className="text-[12.5px] text-slate-800">{i.note}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12.5px] text-slate-600">No incidents in the last 30 days.</p>
            )}
          </DrawerSection>
        </Drawer>
      )}
    </div>
  );
}
