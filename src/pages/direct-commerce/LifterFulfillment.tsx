import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import {
  ActionButton, DataTable, Drawer, DrawerSection, Field, FieldGrid, ImpactCallout, KpiCard,
  PageHeader, Section, StatusChip, Trace, toneDot, type Column,
} from "./primitives";
import { apiEventFeed, catalog, fmtMoney, fulfillments, orders, type Fulfillment } from "./data";
import { cn } from "@/lib/utils";

export default function DcfLifterFulfillment() {
  const [sel, setSel] = useState<Fulfillment | null>(null);

  const kpis = useMemo(() => {
    const attempted = fulfillments.filter((f) => f.submittedAt !== "—").length;
    const confirmed = fulfillments.filter((f) => f.status === "Confirmed").length;
    return [
      { label: "Submission Success", value: `${Math.round(((attempted - 1) / attempted) * 100)}%`, sub: `${attempted} submissions attempted`, tone: "pending" as const },
      { label: "Confirmation Rate", value: `${Math.round((confirmed / fulfillments.length) * 100)}%`, sub: `${confirmed} of ${fulfillments.length} records confirmed`, tone: "healthy" as const },
      { label: "Average Confirmation Time", value: "16 m", sub: "Submission → Microsoft confirmation", tone: "healthy" as const },
      { label: "Failed Calls", value: String(fulfillments.filter((f) => f.status === "Failed").length), sub: "Terminal rejections needing a catalog change", tone: "failed" as const },
      { label: "Retry Queue", value: String(fulfillments.filter((f) => f.status === "Retrying").length), sub: "Automatic exponential backoff", tone: "pending" as const },
      { label: "Mapping Errors", value: String(fulfillments.filter((f) => f.status === "Mapping Error").length), sub: "Internal SKU with no eligible Lifter plan", tone: "failed" as const },
    ];
  }, []);

  const cols: Column<Fulfillment>[] = [
    { key: "id", header: "Fulfillment ID", render: (f) => <span className="font-medium text-slate-900">{f.id}</span> },
    { key: "orderId", header: "Order ID" },
    { key: "customer", header: "Customer" },
    { key: "internalSku", header: "Internal SKU" },
    { key: "lifterPlan", header: "Lifter plan" },
    { key: "artifact", header: "License artifact" },
    { key: "submittedAt", header: "Submitted" },
    { key: "confirmedAt", header: "Confirmed", render: (f) => f.confirmedAt ?? "—" },
    { key: "status", header: "Status", render: (f) => <StatusChip status={f.status} /> },
    { key: "retries", header: "Retries", value: (f) => f.retries },
    { key: "lastError", header: "Last error", render: (f) => f.lastError ?? "—" },
  ];

  const order = sel ? orders.find((o) => o.id === sel.orderId) : undefined;
  const isIssue = !!sel && ["Failed", "Retrying", "Mapping Error"].includes(sel.status);

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Direct Commerce Fulfillment"
        title="Lifter Fulfillment Console"
        description="Translates a direct, marketplace-independent entitlement into the Microsoft Lifter fulfillment obligation. Commerce stays decoupled; the obligation is always raised, submitted and confirmed here."
      />

      <div className="space-y-4 p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
        </div>

        <Section title="Fulfillment records" hint="Select a failing record to open its issue analysis.">
          <DataTable<Fulfillment>
            rows={fulfillments}
            columns={cols}
            onRowClick={setSel}
            selectedId={sel?.id ?? null}
            searchPlaceholder="Search fulfillment, order, customer, SKU, plan…"
          />
        </Section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="SKU mapping" hint="Internal commercial SKU → Azure / Lifter plan translation used at submission time.">
            <ul className="divide-y divide-slate-100">
              {catalog.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-medium text-slate-900">{c.internalSku}</div>
                    <div className="truncate text-[11px] text-slate-500">{c.packageName} · {c.capacity} · {c.regions}</div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-[11.5px] text-indigo-800">{c.lifterPlan}</div>
                    <div className="truncate text-[11px] text-slate-500">{c.lifterOffer} · {c.meteringDimension}</div>
                  </div>
                  <StatusChip status={c.status} />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="API / event timeline" hint="Live fulfillment choreography across commerce, mapping, licensing and Microsoft.">
            <ol className="space-y-2.5 px-4 py-3">
              {apiEventFeed.map((e, i) => (
                <li key={i} className="flex gap-2.5">
                  <div className="mt-1 flex flex-col items-center">
                    <span className={cn("h-2 w-2 rounded-full", toneDot[e.status])} />
                    {i < apiEventFeed.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[12.5px] font-medium text-slate-900">{e.event}</span>
                      <span className="text-[11px] text-slate-500">{e.at}</span>
                    </div>
                    <p className="mt-0.5 text-[12px] leading-snug text-slate-600">{e.detail}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10.5px] text-slate-500">{e.system}</span>
                      <Trace id={e.trace} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </div>

      {sel && (
        <Drawer
          open
          onClose={() => setSel(null)}
          title={`${sel.id} · ${sel.customer}`}
          subtitle={`${sel.internalSku} → ${sel.lifterPlan} · order ${sel.orderId}`}
          badge={<StatusChip status={sel.status} />}
          footer={
            <div className="flex flex-wrap gap-2">
              <ActionButton label="Retry Submission" tone="primary" onClick={() => toast.success(`${sel.id} queued for resubmission using the current catalog mapping.`)} />
              <ActionButton label="Open Catalog Mapping" onClick={() => toast.info(`Catalog mapping for ${sel.internalSku} opened for edit.`)} />
              <ActionButton label="Escalate to Partner Team" onClick={() => toast.success(`Escalation raised for ${sel.id}.`)} />
            </div>
          }
        >
          {isIssue ? (
            <>
              <DrawerSection title="Customer impact">
                <ImpactCallout
                  customerImpact={order?.customerImpact ?? "—"}
                  commercialImpact={order?.commercialImpact}
                  tone={sel.status === "Retrying" ? "pending" : "failed"}
                />
              </DrawerSection>
              <DrawerSection title="What failed">
                <p className="text-[12.5px] leading-relaxed text-slate-700">{sel.whatFailed}</p>
              </DrawerSection>
              <DrawerSection title="Technical cause">
                <p className="text-[12.5px] leading-relaxed text-slate-700">{sel.technicalCause}</p>
              </DrawerSection>
              <DrawerSection title="Recommended action">
                <p className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-[12.5px] leading-relaxed text-indigo-900">
                  {sel.recommendedAction}
                </p>
              </DrawerSection>
              <DrawerSection title="Retry eligibility">
                <StatusChip status={sel.retryEligible ? "Eligible for automatic retry" : "Not retryable until the mapping is corrected"} />
              </DrawerSection>
              <DrawerSection title="Related API event">
                <p className="font-mono text-[11.5px] text-slate-700">{sel.relatedEvent}</p>
              </DrawerSection>
            </>
          ) : (
            <DrawerSection title="Fulfillment confirmed">
              <ImpactCallout
                customerImpact="The Microsoft fulfillment obligation for this direct order is confirmed. Nothing is outstanding for the customer."
                commercialImpact={order ? `${fmtMoney(order.contractValue)} contract fully fulfilled downstream.` : undefined}
                tone="healthy"
              />
            </DrawerSection>
          )}

          <DrawerSection title="Record">
            <FieldGrid>
              <Field label="Order" value={sel.orderId} />
              <Field label="Internal SKU" value={sel.internalSku} />
              <Field label="Lifter plan" value={sel.lifterPlan} />
              <Field label="Activation artifact" value={sel.artifact} />
              <Field label="Submitted" value={sel.submittedAt} />
              <Field label="Confirmed" value={sel.confirmedAt ?? "—"} />
              <Field label="Retries" value={String(sel.retries)} />
              <Field label="Last error" value={sel.lastError ?? "None"} />
            </FieldGrid>
          </DrawerSection>
        </Drawer>
      )}
    </div>
  );
}
