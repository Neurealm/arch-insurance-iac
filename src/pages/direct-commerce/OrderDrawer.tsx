import { toast } from "sonner";
import { CheckCircle2, Circle, XCircle, Clock } from "lucide-react";
import {
  ActionButton, Drawer, DrawerSection, Field, FieldGrid, ImpactCallout, StatusChip, Trace, toneDot,
} from "./primitives";
import { fmtMoney, fulfillments, orders, type Order } from "./data";
import { cn } from "@/lib/utils";

const icon = (tone: string) =>
  tone === "healthy" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
  : tone === "failed" ? <XCircle className="h-3.5 w-3.5 text-rose-600" />
  : tone === "pending" ? <Clock className="h-3.5 w-3.5 text-amber-600" />
  : <Circle className="h-3.5 w-3.5 text-slate-400" />;

const ACTIONS: { label: string; tone?: "primary" | "danger"; msg: (o: Order) => string }[] = [
  { label: "Validate Order", msg: (o) => `Commercial validation queued for ${o.id}. Contract, PO and tax profile re-checked.` },
  { label: "Create Entitlement", msg: (o) => `Entitlement creation requested for ${o.id}.` },
  { label: "Retry Lifter Submission", tone: "primary", msg: (o) => `Fulfillment resubmission queued for ${o.id}. Retry will use the current catalog mapping.` },
  { label: "Reconcile", msg: (o) => `Reconciliation sweep started for ${o.id} across commerce, entitlement, Lifter, Azure and metering.` },
  { label: "Approve Deployment", tone: "primary", msg: (o) => `Deployment approved for ${o.id}. Provisioning will start in the next window.` },
  { label: "Suspend Entitlement", tone: "danger", msg: (o) => `Suspension request raised for ${o.id}. Requires a second approver.` },
  { label: "View Audit Trail", msg: (o) => `Audit trail for ${o.id} exported (${o.timeline.length} evidence records).` },
];

export function OrderDrawer({ order, onClose }: { order: Order | null; onClose: () => void }) {
  if (!order) return null;
  const lft = fulfillments.find((f) => f.orderId === order.id);
  const impactTone = order.blockedReason ? "failed" : order.deployment === "Deployed" ? "healthy" : "pending";

  return (
    <Drawer
      open
      onClose={onClose}
      title={`${order.id} · ${order.customer}`}
      subtitle={`${order.product} · ${order.sku} · ${order.region}`}
      badge={
        <div className="flex flex-wrap gap-1.5">
          <StatusChip status={order.commercial} />
          <StatusChip status={order.entitlement} />
          <StatusChip status={`Lifter: ${order.lifter}`} />
          <StatusChip status={order.deployment} />
        </div>
      }
      footer={
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((a) => (
            <ActionButton key={a.label} label={a.label} tone={a.tone} onClick={() => toast.success(a.msg(order))} />
          ))}
        </div>
      }
    >
      <DrawerSection title="Customer impact">
        <ImpactCallout customerImpact={order.customerImpact} commercialImpact={order.commercialImpact} tone={impactTone} />
      </DrawerSection>

      {order.blockedReason && (
        <DrawerSection title="Current blocker">
          <p className="rounded-md border border-rose-200 bg-white px-3 py-2 text-[12.5px] leading-relaxed text-slate-800">
            {order.blockedReason}
          </p>
        </DrawerSection>
      )}

      <DrawerSection title="Commercial order">
        <FieldGrid>
          <Field label="Order ID" value={order.id} />
          <Field label="Commercial status" value={<StatusChip status={order.commercial} />} />
          <Field label="Contract value" value={fmtMoney(order.contractValue)} />
          <Field label="Order date" value={order.orderDate} />
          <Field label="Owner" value={order.owner} />
          <Field label="Elapsed in lifecycle" value={`${order.elapsedHours} h`} />
        </FieldGrid>
        <p className="mt-2 rounded-md bg-indigo-50 px-3 py-2 text-[11.5px] leading-relaxed text-indigo-900 ring-1 ring-inset ring-indigo-100">
          {order.procurementNote}
        </p>
      </DrawerSection>

      <DrawerSection title="Customer and Azure context">
        <FieldGrid>
          <Field label="Customer" value={`${order.customer} (${order.customerId})`} />
          <Field label="Region" value={order.region} />
          <Field label="Azure tenant" value={<span className="font-mono text-[11.5px]">{order.tenantId}</span>} />
          <Field label="Subscription" value={<span className="font-mono text-[11.5px]">{order.subscriptionId}</span>} />
        </FieldGrid>
      </DrawerSection>

      <DrawerSection title="Product and SKU">
        <FieldGrid>
          <Field label="Product" value={order.product} />
          <Field label="Internal SKU" value={order.sku} />
          <Field label="Capacity" value={`${order.capacityTb} TB`} />
          <Field label="Lifter plan" value={lft?.lifterPlan ?? "— not mapped —"} />
        </FieldGrid>
      </DrawerSection>

      <DrawerSection title="Contract and billing">
        <FieldGrid>
          <Field label="Contract start" value={order.contractStart} />
          <Field label="Contract end" value={order.contractEnd} />
          <Field label="Revenue at risk" value={order.revenueAtRisk ? fmtMoney(order.revenueAtRisk) : "None"} />
          <Field label="Billing route" value="Direct invoice (non-marketplace)" />
        </FieldGrid>
      </DrawerSection>

      <DrawerSection title="Entitlement record">
        <FieldGrid>
          <Field label="Entitlement status" value={<StatusChip status={order.entitlement} />} />
          <Field label="Term" value={`${order.contractStart} → ${order.contractEnd}`} />
        </FieldGrid>
      </DrawerSection>

      <DrawerSection title="Lifter fulfillment">
        {lft ? (
          <FieldGrid>
            <Field label="Fulfillment ID" value={lft.id} />
            <Field label="Status" value={<StatusChip status={lft.status} />} />
            <Field label="Activation artifact" value={lft.artifact} />
            <Field label="Retries" value={String(lft.retries)} />
            <Field label="Submitted" value={lft.submittedAt} />
            <Field label="Confirmed" value={lft.confirmedAt ?? "—"} />
          </FieldGrid>
        ) : (
          <p className="text-[12.5px] text-slate-600">No fulfillment record yet — the order has not reached submission.</p>
        )}
      </DrawerSection>

      <DrawerSection title="Provisioning state">
        <FieldGrid>
          <Field label="Deployment status" value={<StatusChip status={order.deployment} />} />
          <Field label="Current stage" value={order.stage} />
        </FieldGrid>
      </DrawerSection>

      <DrawerSection title="Audit timeline">
        <ol className="space-y-2.5">
          {order.timeline.map((e, i) => (
            <li key={i} className="flex gap-2.5">
              <div className="mt-1 flex flex-col items-center">
                <span className={cn("h-2 w-2 rounded-full", toneDot[e.status])} />
                {i < order.timeline.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  {icon(e.status)}
                  <span className="text-[12.5px] font-medium text-slate-900">{e.event}</span>
                  <span className="text-[11px] text-slate-500">{e.at}</span>
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-slate-600">{e.detail}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-[10.5px] text-slate-500">{e.actor}</span>
                  <Trace id={e.traceId} />
                  {e.response && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10.5px] text-slate-600">{e.response}</span>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </DrawerSection>
    </Drawer>
  );
}

export const findOrder = (id: string | null) => orders.find((o) => o.id === id) ?? null;
