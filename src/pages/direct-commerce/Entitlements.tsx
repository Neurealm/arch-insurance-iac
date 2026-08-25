import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  DataTable, Drawer, DrawerSection, Field, FieldGrid, ImpactCallout, PageHeader, PillFilter,
  Section, StatusChip, toneDot, toneFor, type Column,
} from "./primitives";
import { entitlements, orders, type Entitlement } from "./data";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Active", "Pending", "Suspended", "Expiring Soon", "Failed Fulfillment", "Reconciliation Mismatch"] as const;
type Filter = (typeof FILTERS)[number];

export default function DcfEntitlements() {
  const [filter, setFilter] = useState<Filter>("All");
  const [sel, setSel] = useState<Entitlement | null>(null);

  const rows = useMemo(
    () => (filter === "All" ? entitlements : entitlements.filter((e) => e.status === filter)),
    [filter],
  );

  const cols: Column<Entitlement>[] = [
    { key: "id", header: "Entitlement", render: (e) => <span className="font-medium text-slate-900">{e.id}</span> },
    { key: "customerId", header: "Customer ID" },
    { key: "customer", header: "Customer" },
    { key: "tenantId", header: "Tenant", render: (e) => <span className="font-mono text-[11px]">{e.tenantId}</span> },
    { key: "subscriptionId", header: "Subscription", render: (e) => <span className="font-mono text-[11px]">{e.subscriptionId}</span> },
    { key: "orderId", header: "Order" },
    { key: "product", header: "Product" },
    { key: "sku", header: "SKU" },
    { key: "capacityTb", header: "Capacity", value: (e) => e.capacityTb, render: (e) => `${e.capacityTb} TB` },
    { key: "region", header: "Region" },
    { key: "contractStart", header: "Start" },
    { key: "contractEnd", header: "End" },
    { key: "status", header: "Entitlement", render: (e) => <StatusChip status={e.status} /> },
    { key: "lifter", header: "Lifter", render: (e) => <StatusChip status={e.lifter} /> },
    { key: "deployment", header: "Deployment", render: (e) => <StatusChip status={e.deployment} /> },
  ];

  const order = sel ? orders.find((o) => o.id === sel.orderId) ?? null : null;

  const chain = sel
    ? [
        { label: "Commerce", state: order?.commercial ?? "—", note: "Direct order, non-marketplace paper" },
        { label: "Entitlement", state: sel.status, note: `${sel.id} · ${sel.capacityTb} TB` },
        { label: "Lifter", state: sel.lifter, note: "Microsoft fulfillment obligation" },
        { label: "Azure", state: sel.deployment, note: `${sel.region} · ${sel.subscriptionId}` },
      ]
    : [];

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Direct Commerce Fulfillment"
        title="Entitlement Registry"
        description="The canonical system of record that binds a direct commercial order to a customer tenant, an Azure subscription, a Microsoft fulfillment record and a deployed environment."
      />
      <div className="p-6">
        <Section
          title="Entitlements"
          hint="Filter by lifecycle state, then open a record to see its dependency chain across Commerce → Entitlement → Lifter → Azure."
          right={<PillFilter<Filter> options={FILTERS} value={filter} onChange={setFilter} />}
        >
          <DataTable<Entitlement>
            rows={rows}
            columns={cols}
            onRowClick={setSel}
            selectedId={sel?.id ?? null}
            searchPlaceholder="Search entitlement, customer, tenant, subscription, SKU…"
          />
        </Section>
      </div>

      {sel && (
        <Drawer
          open
          onClose={() => setSel(null)}
          title={`${sel.id} · ${sel.customer}`}
          subtitle={`${sel.product} · ${sel.sku} · ${sel.region}`}
          badge={<div className="flex flex-wrap gap-1.5"><StatusChip status={sel.status} /><StatusChip status={`Lifter: ${sel.lifter}`} /><StatusChip status={sel.deployment} /></div>}
        >
          <DrawerSection title="Customer impact">
            <ImpactCallout
              customerImpact={order?.customerImpact ?? "No customer-visible condition on this entitlement."}
              commercialImpact={order?.commercialImpact}
              tone={sel.status === "Active" ? "healthy" : sel.status === "Pending" || sel.status === "Expiring Soon" ? "pending" : "failed"}
            />
          </DrawerSection>

          <DrawerSection title="Current state across systems">
            <div className="space-y-2">
              {chain.map((c, i) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2">
                    <div>
                      <div className="text-[12.5px] font-medium text-slate-900">{c.label}</div>
                      <div className="text-[11px] text-slate-500">{c.note}</div>
                    </div>
                    <StatusChip status={c.state} />
                  </div>
                  {i < chain.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowRight className={cn("h-3 w-3 rotate-90", toneFor(c.state) === "failed" ? "text-rose-400" : "text-slate-300")} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DrawerSection>

          <DrawerSection title="Entitlement record">
            <FieldGrid>
              <Field label="Customer ID" value={sel.customerId} />
              <Field label="Internal order" value={sel.orderId} />
              <Field label="Tenant ID" value={<span className="font-mono text-[11.5px]">{sel.tenantId}</span>} />
              <Field label="Subscription ID" value={<span className="font-mono text-[11.5px]">{sel.subscriptionId}</span>} />
              <Field label="Capacity" value={`${sel.capacityTb} TB`} />
              <Field label="Region" value={sel.region} />
              <Field label="Contract start" value={sel.contractStart} />
              <Field label="Contract end" value={sel.contractEnd} />
              <Field label="License / entitlement ID" value={sel.id} />
              <Field label="Fulfillment route" value="Direct commerce → Lifter" />
            </FieldGrid>
          </DrawerSection>

          <DrawerSection title="Dependencies">
            <ul className="space-y-1.5">
              {[
                "Commerce API — issues and amends the direct order",
                "Entitlement Service — owns this record",
                "Lifter API — carries the Microsoft fulfillment obligation",
                "Azure Resource Manager — validates and provisions the customer environment",
                "Metering — reports consumption against this entitlement",
              ].map((d) => (
                <li key={d} className="flex items-start gap-2 text-[12.5px] text-slate-700">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", toneDot.info)} />
                  {d}
                </li>
              ))}
            </ul>
          </DrawerSection>
        </Drawer>
      )}
    </div>
  );
}
