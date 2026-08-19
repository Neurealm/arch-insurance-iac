import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import {
  ActionButton, Drawer, DrawerSection, Field, FieldGrid, ImpactCallout, PageHeader, Section, StatusChip,
} from "./primitives";
import { provisioning, type ProvisioningCheck, type ProvisioningRecord } from "./data";
import { cn } from "@/lib/utils";

const checkIcon = (s: string) =>
  s === "healthy" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  : s === "failed" ? <XCircle className="h-4 w-4 text-rose-600" />
  : <Clock className="h-4 w-4 text-amber-600" />;

export default function DcfProvisioning() {
  const [recordId, setRecordId] = useState(provisioning[0].orderId);
  const [sel, setSel] = useState<{ rec: ProvisioningRecord; check: ProvisioningCheck } | null>(null);
  const rec = provisioning.find((p) => p.orderId === recordId)!;

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Direct Commerce Fulfillment"
        title="Provisioning & Azure Validation"
        description="Orders whose Microsoft fulfillment obligation is satisfied and which are now progressing into the customer's own Azure environment."
        actions={
          <ActionButton
            label={rec.state === "Ready to Deploy" ? "Execute Deployment" : "Re-run Validation"}
            tone="primary"
            onClick={() =>
              toast.success(
                rec.state === "Ready to Deploy"
                  ? `Deployment execution started for ${rec.orderId} (${rec.customer}).`
                  : `Validation re-run queued for ${rec.orderId}.`,
              )
            }
          />
        }
      />

      <div className="space-y-4 p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {provisioning.map((p) => (
            <button
              key={p.orderId}
              onClick={() => setRecordId(p.orderId)}
              className={cn(
                "rounded-lg border bg-white px-3.5 py-3 text-left transition-all",
                p.orderId === recordId ? "border-indigo-400 ring-2 ring-indigo-100" : "border-slate-200 hover:border-indigo-300",
              )}
            >
              <div className="text-[12.5px] font-semibold text-slate-900">{p.customer}</div>
              <div className="text-[11px] text-slate-500">{p.orderId} · {p.region}</div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <StatusChip status={p.state} />
                <span className={cn("text-[17px] font-semibold", p.score === 100 ? "text-emerald-700" : p.score >= 80 ? "text-amber-700" : "text-rose-700")}>
                  {p.score}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className={cn("h-1.5 rounded-full", p.score === 100 ? "bg-emerald-500" : p.score >= 80 ? "bg-amber-500" : "bg-rose-500")}
                  style={{ width: `${p.score}%` }}
                />
              </div>
              <div className="mt-1 text-[10.5px] text-slate-500">Customer readiness score</div>
            </button>
          ))}
        </div>

        <Section
          title={`Readiness checklist · ${rec.customer}`}
          hint={`Tenant ${rec.tenantId} · subscription ${rec.subscriptionId} · ${rec.region}. Select an item for impact, dependency, evidence and remediation.`}
        >
          <ul className="divide-y divide-slate-100">
            {rec.checks.map((c) => (
              <li key={c.id}>
                <button onClick={() => setSel({ rec, check: c })} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-indigo-50/50">
                  <span className="mt-0.5">{checkIcon(c.status)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[12.5px] font-medium text-slate-900">{c.label}</span>
                      <StatusChip status={c.status === "healthy" ? "Passed" : c.status === "failed" ? "Failed" : "In progress"} tone={c.status} />
                    </div>
                    <p className="mt-0.5 text-[12px] leading-snug text-slate-600">{c.detail}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Ready-to-deploy status">
            <div className="px-4 py-3">
              <StatusChip status={rec.state} />
              <p className="mt-2 text-[12.5px] leading-relaxed text-slate-700">
                {rec.state === "Ready to Deploy"
                  ? "All prerequisites in the customer's Azure environment are satisfied. Deployment can be executed at any approved change window."
                  : rec.state === "Blocked"
                  ? "Deployment is held by a prerequisite the customer controls. The commercial order and Microsoft fulfillment are both complete."
                  : "Validation is still running. No customer action is required yet."}
              </p>
            </div>
          </Section>

          <Section title="Deployment outputs">
            <div className="grid grid-cols-1 gap-2 p-3">
              {rec.outputs.map((o) => <Field key={o.label} label={o.label} value={o.value} />)}
            </div>
          </Section>
        </div>
      </div>

      {sel && (
        <Drawer
          open
          onClose={() => setSel(null)}
          title={sel.check.label}
          subtitle={`${sel.rec.customer} · ${sel.rec.orderId} · ${sel.rec.region}`}
          badge={<StatusChip status={sel.check.status === "healthy" ? "Passed" : sel.check.status === "failed" ? "Failed" : "In progress"} tone={sel.check.status} />}
          footer={
            <div className="flex flex-wrap gap-2">
              <ActionButton label="Re-run Check" tone="primary" onClick={() => toast.success(`${sel.check.label} re-queued for ${sel.rec.orderId}.`)} />
              <ActionButton label="Send Customer Change Request" onClick={() => toast.success("Pre-approved change request sent to the customer's Azure administrator.")} />
            </div>
          }
        >
          <DrawerSection title="Customer impact">
            <ImpactCallout customerImpact={sel.check.impact} tone={sel.check.status} />
          </DrawerSection>
          <DrawerSection title="Detail">
            <p className="text-[12.5px] leading-relaxed text-slate-700">{sel.check.detail}</p>
          </DrawerSection>
          <DrawerSection title="Dependency">
            <p className="text-[12.5px] text-slate-700">{sel.check.dependency}</p>
          </DrawerSection>
          <DrawerSection title="Evidence">
            <p className="rounded-md bg-slate-50 px-3 py-2 font-mono text-[11.5px] text-slate-700">{sel.check.evidence}</p>
          </DrawerSection>
          <DrawerSection title="Remediation">
            <p className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-[12.5px] leading-relaxed text-indigo-900">{sel.check.remediation}</p>
          </DrawerSection>
          <DrawerSection title="Environment">
            <FieldGrid>
              <Field label="Tenant" value={<span className="font-mono text-[11.5px]">{sel.rec.tenantId}</span>} />
              <Field label="Subscription" value={<span className="font-mono text-[11.5px]">{sel.rec.subscriptionId}</span>} />
              <Field label="Region" value={sel.rec.region} />
              <Field label="Readiness score" value={`${sel.rec.score} / 100`} />
            </FieldGrid>
          </DrawerSection>
        </Drawer>
      )}
    </div>
  );
}
