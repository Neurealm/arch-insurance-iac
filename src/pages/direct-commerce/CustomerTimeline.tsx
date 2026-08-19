import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Circle, Clock, XCircle } from "lucide-react";
import { Field, FieldGrid, PageHeader, Section, StatusChip, Trace, toneDot } from "./primitives";
import { fmtMoney, orders, STAGES, type Order, type Stage } from "./data";
import { cn } from "@/lib/utils";

const OPERATIONS_STAGE = "Operations Active";
const ALL_STAGES: string[] = [...STAGES, OPERATIONS_STAGE];

function stageState(order: Order, stage: string): "done" | "current" | "blocked" | "todo" {
  const reached = STAGES.indexOf(order.stage);
  const idx = ALL_STAGES.indexOf(stage);
  if (stage === OPERATIONS_STAGE) return order.deployment === "Deployed" && !order.blockedReason ? "done" : "todo";
  if (idx < reached) return "done";
  if (idx === reached) return order.blockedReason ? "blocked" : order.deployment === "Deployed" ? "done" : "current";
  return "todo";
}

const stateIcon = (s: string) =>
  s === "done" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  : s === "blocked" ? <XCircle className="h-4 w-4 text-rose-600" />
  : s === "current" ? <Clock className="h-4 w-4 text-amber-600" />
  : <Circle className="h-4 w-4 text-slate-300" />;

export default function DcfCustomerTimeline() {
  const [orderId, setOrderId] = useState(orders[0].id);
  const [open, setOpen] = useState<string | null>(null);
  const order = orders.find((o) => o.id === orderId)!;

  const eventFor = (stage: string) =>
    order.timeline.find((e) => e.event.toLowerCase().includes(stage.split(" ")[0].toLowerCase())) ??
    order.timeline[Math.min(ALL_STAGES.indexOf(stage), order.timeline.length - 1)];

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Direct Commerce Fulfillment"
        title="Customer Fulfillment Timeline"
        description="The end-to-end journey for a single customer order: direct commercial transaction, Microsoft fulfillment obligation, Azure validation, deployment and steady-state operations."
        actions={
          <select
            value={orderId}
            onChange={(e) => { setOrderId(e.target.value); setOpen(null); }}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>{o.id} — {o.customer}</option>
            ))}
          </select>
        }
      />

      <div className="space-y-4 p-6">
        <Section title="Order summary">
          <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Customer" value={`${order.customer} (${order.customerId})`} />
            <Field label="Product / SKU" value={`${order.product} · ${order.sku}`} />
            <Field label="Contract value" value={fmtMoney(order.contractValue)} />
            <Field label="Region" value={order.region} />
            <Field label="Azure tenant" value={<span className="font-mono text-[11.5px]">{order.tenantId}</span>} />
            <Field label="Subscription" value={<span className="font-mono text-[11.5px]">{order.subscriptionId}</span>} />
            <Field label="Current stage" value={<StatusChip status={order.blockedReason ? `${order.stage} · blocked` : order.stage} tone={order.blockedReason ? "failed" : "healthy"} />} />
            <Field label="Elapsed / owner" value={`${order.elapsedHours} h · ${order.owner}`} />
          </div>
          {order.blockedReason && (
            <p className="mx-3 mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12.5px] leading-relaxed text-rose-900">
              <span className="font-semibold">Customer impact: </span>{order.customerImpact}
            </p>
          )}
        </Section>

        <Section title="Lifecycle" hint="Each event expands to show system responses and audit evidence.">
          <div className="overflow-x-auto border-b border-slate-100 px-4 py-4">
            <div className="flex min-w-[900px] items-center gap-1.5">
              {ALL_STAGES.map((s, i) => {
                const st = stageState(order, s);
                return (
                  <div key={s} className="flex flex-1 items-center gap-1.5">
                    <div className={cn(
                      "flex-1 rounded-md border px-2.5 py-2 text-center",
                      st === "done" ? "border-emerald-200 bg-emerald-50" : st === "current" ? "border-amber-200 bg-amber-50" : st === "blocked" ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white",
                    )}>
                      <div className="flex items-center justify-center">{stateIcon(st)}</div>
                      <div className="mt-1 text-[11px] font-medium leading-tight text-slate-800">{s}</div>
                    </div>
                    {i < ALL_STAGES.length - 1 && <span className="h-px w-3 shrink-0 bg-slate-200" />}
                  </div>
                );
              })}
            </div>
          </div>

          <ol className="divide-y divide-slate-100">
            {ALL_STAGES.map((s) => {
              const st = stageState(order, s);
              const ev = eventFor(s);
              const expanded = open === s;
              return (
                <li key={s}>
                  <button onClick={() => setOpen(expanded ? null : s)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-indigo-50/40">
                    <span className="mt-0.5">{stateIcon(st)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[12.5px] font-medium text-slate-900">{s}</span>
                        <StatusChip
                          status={st === "done" ? "Complete" : st === "current" ? "In progress" : st === "blocked" ? "Blocked" : "Not started"}
                          tone={st === "done" ? "healthy" : st === "current" ? "pending" : st === "blocked" ? "failed" : "neutral"}
                        />
                        {st !== "todo" && ev && <span className="text-[11px] text-slate-500">{ev.at}</span>}
                      </div>
                      {expanded && st !== "todo" && ev && (
                        <div className="mt-2 rounded-md border border-slate-200 bg-slate-50/60 p-3">
                          <p className="text-[12.5px] leading-relaxed text-slate-700">{ev.detail}</p>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <Field label="System" value={ev.actor} />
                            <Field label="System response" value={ev.response ?? "—"} />
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[ev.status])} />
                            <span className="text-[11px] text-slate-500">Audit evidence</span>
                            <Trace id={ev.traceId} />
                          </div>
                        </div>
                      )}
                      {expanded && st === "todo" && (
                        <p className="mt-2 text-[12px] text-slate-500">This stage has not been reached for this order.</p>
                      )}
                    </div>
                    {expanded ? <ChevronDown className="mt-1 h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="mt-1 h-3.5 w-3.5 text-slate-400" />}
                  </button>
                </li>
              );
            })}
          </ol>
        </Section>

        <Section title="Commercial posture">
          <div className="p-4">
            <FieldGrid>
              <Field label="Purchase route" value="Direct (marketplace-independent)" />
              <Field label="Microsoft fulfillment" value={<StatusChip status={order.lifter} />} />
              <Field label="Revenue at risk" value={order.revenueAtRisk ? fmtMoney(order.revenueAtRisk) : "None"} />
              <Field label="Contract term" value={`${order.contractStart} → ${order.contractEnd}`} />
            </FieldGrid>
            <p className="mt-3 rounded-md bg-indigo-50 px-3 py-2 text-[12px] leading-relaxed text-indigo-900 ring-1 ring-inset ring-indigo-100">
              {order.procurementNote}
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
