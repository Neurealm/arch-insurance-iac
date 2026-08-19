import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import {
  DataTable, KpiCard, PageHeader, Section, StatusChip, toneDot, type Column,
} from "./primitives";
import { OrderDrawer } from "./OrderDrawer";
import {
  exceptions, fmtMoney, fulfillments, integrations, orders, stageCounts, STAGES, type Order, type Stage,
} from "./data";
import { cn } from "@/lib/utils";

const kpis = () => {
  const active = orders.filter((o) => o.entitlement === "Active").length;
  const month = orders.filter((o) => o.orderDate.startsWith("2026-08")).length;
  const confirmed = fulfillments.filter((f) => f.status === "Confirmed").length;
  const attempted = fulfillments.filter((f) => f.status !== "Cancelled").length;
  const ready = orders.filter((o) => o.deployment === "Ready to Deploy").length;
  const exc = exceptions.length;
  const blocked = orders.reduce((s, o) => s + (o.revenueAtRisk ?? 0), 0);
  return [
    { id: "active", label: "Active Customer Entitlements", value: String(active), sub: "Across 5 enterprise customers", tone: "healthy" as const },
    { id: "month", label: "Direct Orders This Month", value: String(month), sub: `${fmtMoney(orders.filter((o) => o.orderDate.startsWith("2026-08")).reduce((s, o) => s + o.contractValue, 0))} booked`, tone: "info" as const },
    { id: "lifter", label: "Lifter Fulfillment Success Rate", value: `${Math.round((confirmed / attempted) * 100)}%`, sub: `${confirmed} of ${attempted} submissions confirmed`, tone: "pending" as const },
    { id: "ready", label: "Ready to Deploy", value: String(ready), sub: "All Azure prerequisites satisfied", tone: "healthy" as const },
    { id: "exc", label: "Fulfillment Exceptions", value: String(exc), sub: `${exceptions.filter((e) => e.severity === "Critical").length} critical`, tone: "failed" as const },
    { id: "blocked", label: "Revenue Currently Blocked", value: fmtMoney(blocked), sub: "Held by fulfillment or provisioning", tone: "failed" as const },
    { id: "time", label: "Average Fulfillment Time", value: "4.6 h", sub: "Order accepted → Lifter confirmed", tone: "healthy" as const },
    { id: "recon", label: "Reconciliation Health", value: "92%", sub: `${exceptions.length} open exceptions across 6 systems`, tone: "pending" as const },
  ];
};

export default function DcfOverview() {
  const [stage, setStage] = useState<Stage | null>(null);
  const [kpi, setKpi] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const stages = useMemo(stageCounts, []);
  const cards = useMemo(kpis, []);

  const filtered = useMemo(() => {
    let out = orders;
    if (stage) {
      const idx = STAGES.indexOf(stage);
      out = out.filter((o) => STAGES.indexOf(o.stage) >= idx);
    }
    if (kpi === "ready") out = out.filter((o) => o.deployment === "Ready to Deploy");
    if (kpi === "blocked") out = out.filter((o) => (o.revenueAtRisk ?? 0) > 0);
    if (kpi === "exc") out = out.filter((o) => !!o.blockedReason);
    if (kpi === "active") out = out.filter((o) => o.entitlement === "Active");
    if (kpi === "month") out = out.filter((o) => o.orderDate.startsWith("2026-08"));
    return out;
  }, [stage, kpi]);

  const cols: Column<Order>[] = [
    { key: "id", header: "Order", render: (o) => <span className="font-medium text-slate-900">{o.id}</span> },
    { key: "customer", header: "Customer" },
    { key: "sku", header: "SKU" },
    { key: "contractValue", header: "Value", value: (o) => o.contractValue, render: (o) => fmtMoney(o.contractValue) },
    { key: "region", header: "Region" },
    { key: "stage", header: "Stage" },
    { key: "lifter", header: "Lifter", render: (o) => <StatusChip status={o.lifter} /> },
    { key: "deployment", header: "Deployment", render: (o) => <StatusChip status={o.deployment} /> },
  ];

  const atRisk = orders.filter((o) => o.blockedReason).sort((a, b) => (b.revenueAtRisk ?? 0) - (a.revenueAtRisk ?? 0));
  const lifterExc = fulfillments.filter((f) => ["Failed", "Retrying", "Mapping Error"].includes(f.status));

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Direct Commerce Fulfillment"
        title="Commercial Operations Command Center"
        description="Customers transact directly with us — outside the Azure Commercial Marketplace — while every order is still translated into a Microsoft Lifter entitlement, fulfillment confirmation, Azure validation and metered deployment behind the scenes."
        actions={
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-[11.5px] text-emerald-800 ring-1 ring-inset ring-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Lifter obligations fulfilled downstream
          </div>
        }
      />

      <div className="space-y-4 p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <KpiCard
              key={c.id}
              label={c.label}
              value={c.value}
              sub={c.sub}
              tone={c.tone}
              active={kpi === c.id}
              onClick={() => setKpi((k) => (k === c.id ? null : c.id))}
            />
          ))}
        </div>

        <Section
          title="Order-to-deployment lifecycle"
          hint="Commercial transaction on the left, Microsoft fulfillment obligation in the middle, customer Azure environment on the right. Click a stage to filter the orders below."
          right={stage && <button className="text-[11.5px] text-indigo-700 hover:underline" onClick={() => setStage(null)}>Clear stage filter</button>}
        >
          <div className="overflow-x-auto px-4 py-4">
            <div className="flex min-w-[980px] items-stretch gap-2">
              {stages.map((s, i) => {
                const active = stage === s.stage;
                const tone = s.stalled > 0 ? "failed" : s.here > 0 ? "pending" : "healthy";
                return (
                  <div key={s.stage} className="flex flex-1 items-stretch gap-2">
                    <button
                      onClick={() => setStage((x) => (x === s.stage ? null : s.stage))}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2.5 text-left transition-all",
                        active ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100" : "border-slate-200 bg-white hover:border-indigo-300",
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[tone])} />
                        <span className="text-[11px] font-semibold leading-tight text-slate-700">{s.stage}</span>
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-[19px] font-semibold leading-none text-slate-900">{s.count}</span>
                        <span className="text-[11px] text-slate-500">{s.pct}%</span>
                      </div>
                      <div className="mt-1 text-[10.5px] text-slate-500">Avg dwell {s.dwell}</div>
                      <div className={cn("mt-0.5 text-[10.5px]", s.stalled ? "font-medium text-rose-600" : "text-slate-400")}>
                        {s.stalled ? `${s.stalled} stalled / failed` : "no stalled items"}
                      </div>
                    </button>
                    {i < stages.length - 1 && <ArrowRight className="mt-8 h-3.5 w-3.5 shrink-0 text-slate-300" />}
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        <Section
          title={stage || kpi ? "Filtered orders" : "Recent orders"}
          hint={stage ? `Orders that have reached “${stage}”.` : "Direct commercial transactions across all customers."}
          right={(stage || kpi) && <button className="text-[11.5px] text-indigo-700 hover:underline" onClick={() => { setStage(null); setKpi(null); }}>Reset</button>}
        >
          <DataTable<Order> rows={filtered} columns={cols} onRowClick={setSelected} selectedId={selected?.id ?? null} searchPlaceholder="Search orders, customers, SKUs…" />
        </Section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="At-risk / blocked orders" hint="Ranked by revenue held.">
            <ul className="divide-y divide-slate-100">
              {atRisk.map((o) => (
                <li key={o.id}>
                  <button onClick={() => setSelected(o)} className="w-full px-4 py-2.5 text-left hover:bg-indigo-50/50">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-medium text-slate-900">{o.customer} · {o.id}</span>
                      <span className="text-[12px] font-semibold text-rose-700">{o.revenueAtRisk ? fmtMoney(o.revenueAtRisk) : "—"}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-slate-600">{o.blockedReason}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Lifter exceptions" hint="Fulfillment obligations not yet confirmed by Microsoft.">
            <ul className="divide-y divide-slate-100">
              {lifterExc.map((f) => (
                <li key={f.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-medium text-slate-900">{f.id} · {f.customer}</span>
                    <StatusChip status={f.status} />
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-slate-600">{f.lastError} · {f.internalSku}</p>
                </li>
              ))}
              <li className="px-4 py-2.5">
                <Link to="/direct-commerce/lifter-fulfillment" className="text-[11.5px] font-medium text-indigo-700 hover:underline">
                  Open Lifter Fulfillment Console →
                </Link>
              </li>
            </ul>
          </Section>

          <Section title="Revenue opportunity unblocked" hint="Value released once the queued remediations complete.">
            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <div className="text-[10.5px] uppercase tracking-wide text-emerald-800">Unblocked in last 30 days</div>
                <div className="mt-1 text-[20px] font-semibold text-emerald-900">{fmtMoney(2_190_000)}</div>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
                <div className="text-[10.5px] uppercase tracking-wide text-amber-800">Recoverable this week</div>
                <div className="mt-1 text-[20px] font-semibold text-amber-900">{fmtMoney(922_500)}</div>
              </div>
              <div className="col-span-2 rounded-md border border-slate-200 px-3 py-2.5 text-[12px] leading-relaxed text-slate-600">
                Highest-leverage fix: extend catalog mapping <span className="font-medium text-slate-900">MAP-005</span> to
                the EU region set — releases {fmtMoney(505_000)} for Horizon Energy with 93% automation confidence.
              </div>
            </div>
          </Section>

          <Section title="Integration health" hint="Systems participating in the direct-to-fulfillment chain.">
            <ul className="grid grid-cols-2 gap-2 p-3">
              {integrations.map((i) => (
                <li key={i.id} className="rounded-md border border-slate-200 px-2.5 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[i.health])} />
                    <span className="truncate text-[12px] font-medium text-slate-800">{i.name}</span>
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-slate-500">{i.latencyMs} ms · err {i.errorRate}</div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>

      <OrderDrawer order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
