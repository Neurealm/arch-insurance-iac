import { useMemo, useState } from "react";
import { DataTable, PageHeader, PillFilter, Section, StatusChip, type Column } from "./primitives";
import { OrderDrawer } from "./OrderDrawer";
import { fmtMoney, orders, type Order } from "./data";

const VIEWS = ["All", "Open", "Blocked", "Deployed", "Cancelled"] as const;
type View = (typeof VIEWS)[number];

export default function DcfOrders() {
  const [view, setView] = useState<View>("All");
  const [selected, setSelected] = useState<Order | null>(null);

  const rows = useMemo(() => {
    if (view === "All") return orders;
    if (view === "Open") return orders.filter((o) => o.deployment !== "Deployed" && o.commercial !== "Cancelled");
    if (view === "Blocked") return orders.filter((o) => !!o.blockedReason);
    if (view === "Deployed") return orders.filter((o) => o.deployment === "Deployed");
    return orders.filter((o) => o.commercial === "Cancelled");
  }, [view]);

  const cols: Column<Order>[] = [
    { key: "id", header: "Order ID", render: (o) => <span className="font-medium text-slate-900">{o.id}</span> },
    { key: "customer", header: "Customer" },
    { key: "product", header: "Product" },
    { key: "sku", header: "SKU" },
    { key: "contractValue", header: "Contract value", value: (o) => o.contractValue, render: (o) => fmtMoney(o.contractValue) },
    { key: "tenantId", header: "Azure tenant", render: (o) => <span className="font-mono text-[11px]">{o.tenantId}</span> },
    { key: "subscriptionId", header: "Subscription", render: (o) => <span className="font-mono text-[11px]">{o.subscriptionId}</span> },
    { key: "region", header: "Region" },
    { key: "orderDate", header: "Order date" },
    { key: "contractStart", header: "Start" },
    { key: "contractEnd", header: "End" },
    { key: "commercial", header: "Commercial", render: (o) => <StatusChip status={o.commercial} /> },
    { key: "entitlement", header: "Entitlement", render: (o) => <StatusChip status={o.entitlement} /> },
    { key: "lifter", header: "Lifter", render: (o) => <StatusChip status={o.lifter} /> },
    { key: "deployment", header: "Deployment", render: (o) => <StatusChip status={o.deployment} /> },
  ];

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Direct Commerce Fulfillment"
        title="Orders & Commercial Transactions"
        description="Every direct marketplace-independent transaction, with the entitlement, Microsoft fulfillment and Azure deployment state it produced downstream."
      />
      <div className="p-6">
        <Section
          title="Direct orders"
          hint="Select a row to open the full commercial, entitlement, fulfillment and provisioning decomposition."
          right={<PillFilter<View> options={VIEWS} value={view} onChange={setView} />}
        >
          <DataTable<Order>
            rows={rows}
            columns={cols}
            onRowClick={setSelected}
            selectedId={selected?.id ?? null}
            searchPlaceholder="Search order, customer, SKU, tenant, subscription, region…"
          />
        </Section>
      </div>
      <OrderDrawer order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
