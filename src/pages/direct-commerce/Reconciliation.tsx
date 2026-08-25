import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ActionButton, DataTable, Drawer, DrawerSection, Field, FieldGrid, ImpactCallout, KpiCard,
  PageHeader, PillFilter, Section, StatusChip, type Column,
} from "./primitives";
import { exceptions, fmtMoney, type ReconException } from "./data";
import { cn } from "@/lib/utils";

const SEVERITIES = ["All", "Critical", "High", "Medium", "Low"] as const;
type Sev = (typeof SEVERITIES)[number];

const sevWeight: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

export default function DcfReconciliation() {
  const [sev, setSev] = useState<Sev>("All");
  const [sel, setSel] = useState<ReconException | null>(null);

  const rows = useMemo(() => {
    const base = sev === "All" ? exceptions : exceptions.filter((e) => e.severity === sev);
    return [...base].sort(
      (a, b) => sevWeight[b.severity] - sevWeight[a.severity] || b.revenueImpact - a.revenueImpact,
    );
  }, [sev]);

  const cols: Column<ReconException>[] = [
    { key: "id", header: "Exception", render: (e) => <span className="font-medium text-slate-900">{e.id}</span> },
    { key: "severity", header: "Severity", value: (e) => sevWeight[e.severity], render: (e) => <StatusChip status={e.severity} tone={e.severity === "Critical" || e.severity === "High" ? "failed" : e.severity === "Medium" ? "pending" : "info"} /> },
    { key: "category", header: "Category" },
    { key: "customer", header: "Customer" },
    { key: "orderId", header: "Order" },
    { key: "revenueImpact", header: "Revenue impact", value: (e) => e.revenueImpact, render: (e) => (e.revenueImpact ? fmtMoney(e.revenueImpact) : "—") },
    { key: "automationConfidence", header: "Automation", value: (e) => e.automationConfidence, render: (e) => `${e.automationConfidence}%` },
    { key: "approvalRequired", header: "Approval", render: (e) => <StatusChip status={e.approvalRequired ? "Human approval required" : "Auto-remediable"} tone={e.approvalRequired ? "pending" : "healthy"} /> },
    { key: "detectedAt", header: "Detected" },
  ];

  const totalRisk = exceptions.reduce((s, e) => s + e.revenueImpact, 0);

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Direct Commerce Fulfillment"
        title="Reconciliation & Exceptions"
        description="Continuously compares the commercial order, internal entitlement, Lifter entitlement, Azure deployment, metered usage and billing state — and surfaces every divergence ranked by customer and revenue impact."
      />

      <div className="space-y-4 p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Open Exceptions" value={String(exceptions.length)} sub="Across six reconciled systems" tone="failed" />
          <KpiCard label="Revenue Impact" value={fmtMoney(totalRisk)} sub="Blocked, unbilled or at renewal risk" tone="failed" />
          <KpiCard label="Auto-remediable" value={String(exceptions.filter((e) => !e.approvalRequired).length)} sub="No human approval required" tone="healthy" />
          <KpiCard label="Reconciliation Health" value="92%" sub="Records in full agreement across systems" tone="pending" />
        </div>

        <Section
          title="Exception queue"
          hint="Prioritised by customer impact first, then revenue impact."
          right={<PillFilter<Sev> options={SEVERITIES} value={sev} onChange={setSev} />}
        >
          <DataTable<ReconException>
            rows={rows}
            columns={cols}
            onRowClick={setSel}
            selectedId={sel?.id ?? null}
            searchPlaceholder="Search exception, category, customer, order…"
          />
        </Section>
      </div>

      {sel && (
        <Drawer
          open
          onClose={() => setSel(null)}
          title={`${sel.id} · ${sel.category}`}
          subtitle={`${sel.customer} · ${sel.orderId} · detected ${sel.detectedAt}`}
          badge={<div className="flex gap-1.5"><StatusChip status={sel.severity} tone={sel.severity === "Critical" || sel.severity === "High" ? "failed" : "pending"} /><StatusChip status={sel.approvalRequired ? "Approval required" : "Auto-remediable"} tone={sel.approvalRequired ? "pending" : "healthy"} /></div>}
          footer={
            <div className="flex flex-wrap gap-2">
              <ActionButton label="Apply Remediation" tone="primary" onClick={() => toast.success(`Remediation plan for ${sel.id} queued${sel.approvalRequired ? " — awaiting approver." : "."}`)} />
              <ActionButton label="Assign Owner" onClick={() => toast.success(`${sel.id} assigned to the commercial operations queue.`)} />
              <ActionButton label="Export Evidence" onClick={() => toast.success(`${sel.evidence.length} evidence artifacts exported for ${sel.id}.`)} />
            </div>
          }
        >
          <DrawerSection title="Customer impact">
            <ImpactCallout customerImpact={sel.customerImpact} commercialImpact={sel.commercialImpact} tone={sel.severity === "Low" ? "pending" : "failed"} />
          </DrawerSection>

          <DrawerSection title="Current state by system">
            <div className="space-y-1.5">
              {sel.systems.map((s) => (
                <div key={s.system} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2">
                  <span className="text-[12.5px] font-medium text-slate-800">{s.system}</span>
                  <StatusChip status={s.state} tone={s.tone} />
                </div>
              ))}
            </div>
          </DrawerSection>

          <DrawerSection title="Likely root cause">
            <p className="text-[12.5px] leading-relaxed text-slate-700">{sel.rootCause}</p>
          </DrawerSection>

          <DrawerSection title="Recommended remediation">
            <p className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-[12.5px] leading-relaxed text-indigo-900">{sel.remediation}</p>
          </DrawerSection>

          <DrawerSection title="Automation confidence">
            <div className="rounded-md border border-slate-200 px-3 py-2.5">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-slate-600">Confidence the platform can remediate without human input</span>
                <span className="font-semibold text-slate-900">{sel.automationConfidence}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className={cn("h-1.5 rounded-full", sel.automationConfidence >= 80 ? "bg-emerald-500" : sel.automationConfidence >= 55 ? "bg-amber-500" : "bg-rose-500")}
                  style={{ width: `${sel.automationConfidence}%` }}
                />
              </div>
            </div>
          </DrawerSection>

          <DrawerSection title="Human approval">
            <FieldGrid>
              <Field label="Approval required" value={sel.approvalRequired ? "Yes — dual control" : "No"} />
              <Field label="Revenue impact" value={sel.revenueImpact ? fmtMoney(sel.revenueImpact) : "None"} />
            </FieldGrid>
          </DrawerSection>

          <DrawerSection title="Audit evidence">
            <ul className="space-y-1.5">
              {sel.evidence.map((e) => (
                <li key={e} className="rounded-md bg-slate-50 px-3 py-1.5 font-mono text-[11.5px] text-slate-700">{e}</li>
              ))}
            </ul>
          </DrawerSection>
        </Drawer>
      )}
    </div>
  );
}
