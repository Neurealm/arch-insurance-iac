import { toast } from "sonner";
import { X, CheckCircle2, XCircle, Clock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip } from "./wfPrimitives";
import {
  STAGE_LABEL, STAGE_ORDER, systems, type StageId, type Txn,
} from "./wfData";
import type { WorkflowState } from "./useWorkflowState";

const money = (n: number) => `$${n.toLocaleString()}`;

export function Drawer({
  open, title, subtitle, onClose, children, footer,
}: {
  open: boolean; title: string; subtitle?: string; onClose: () => void;
  children: React.ReactNode; footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/25" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={title}
        className="relative flex h-full w-full max-w-[580px] flex-col border-l border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[11.5px] text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close drawer"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">{footer}</div>}
      </aside>
    </div>
  );
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 px-2.5 py-1.5">
      <div className="text-[9.5px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 break-words text-[12px] font-medium text-slate-900">{value}</div>
    </div>
  );
}

function ActionBtn({
  children, onClick, tone = "default", disabled,
}: { children: React.ReactNode; onClick: () => void; tone?: "default" | "primary"; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={cn(
        "rounded-md px-2.5 py-1.5 text-[11.5px] font-medium transition-colors disabled:opacity-50",
        tone === "primary"
          ? "bg-indigo-600 text-white hover:bg-indigo-700"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
      )}>
      {children}
    </button>
  );
}

const stateIcon = (state: string) =>
  state === "complete" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
    : state === "failed" ? <XCircle className="h-3.5 w-3.5 text-rose-600" />
    : state === "inProgress" ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
    : <Clock className="h-3.5 w-3.5 text-slate-400" />;

/* ---------------------------- transaction drawer --------------------------- */

export function TxnDrawer({ s, txn }: { s: WorkflowState; txn: Txn }) {
  const ex = txn.exception;
  const busy = s.busy === txn.id;
  const sysState: [string, string][] = [
    ["Direct Marketplace", "Complete"],
    ["Order Service", "Complete"],
    ["Entitlement Service", STAGE_ORDER.indexOf(txn.stage) >= 1 ? "Complete" : "Failed"],
    ["Lifter", STAGE_ORDER.indexOf(txn.stage) >= 4 ? "Confirmed" : txn.stage === "lifterConfirm" ? "Pending" : "Submitted"],
    ["Azure Authorization", STAGE_ORDER.indexOf(txn.stage) > 4 ? "Complete" : txn.stage === "azureAuth" ? (ex ? "Failed" : "In progress") : "Waiting"],
    ["Provisioning", STAGE_ORDER.indexOf(txn.stage) > 5 ? "Complete" : txn.stage === "provision" ? (ex ? "Failed" : "In progress") : "Waiting"],
    ["Billing", txn.stage === "active" ? "Metering" : "Pending"],
  ];

  return (
    <Drawer
      open title={`${txn.customer} — ${txn.id}`}
      subtitle={`${txn.product} · ${txn.sku} · ${txn.region}`}
      onClose={() => s.setDrawer(null)}
      footer={
        <div className="flex flex-wrap gap-2">
          {ex && (
            <ActionBtn tone="primary" disabled={busy}
              onClick={() => s.remediate(txn.id, remediationLabel(ex.stage))}>
              {busy ? "Working…" : remediationLabel(ex.stage)}
            </ActionBtn>
          )}
          <ActionBtn onClick={() => toast.success(`Reconciliation run queued for ${txn.id}`)}>Run Reconciliation</ActionBtn>
          <ActionBtn onClick={() => toast.success(`Engineer assigned to ${txn.id} (on-call: Cloud Fulfillment)`)}>Assign Engineer</ActionBtn>
          <ActionBtn onClick={() => toast.success(`Incident INC-${Math.floor(Math.random() * 9000 + 1000)} opened for ${txn.customer}`)}>Open Incident</ActionBtn>
          <ActionBtn onClick={() => toast(`Audit trail exported for ${txn.id}`)}>View Full Audit Trail</ActionBtn>
        </div>
      }
    >
      {ex ? (
        <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50/70 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-600">What happened</div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-800">{ex.whatHappened}</p>
          <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-600">Customer impact</div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-800">{ex.customerImpact}</p>
          <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-600">What the customer is experiencing</div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-800">{ex.customerExperience}</p>
          <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-600">Commercial impact</div>
          <p className="mt-1 text-[13px] font-semibold text-rose-700">{money(txn.revenueAtRisk)} ARR currently blocked</p>
        </div>
      ) : (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
          <p className="text-[12.5px] leading-relaxed text-emerald-900">
            No open exception. Direct commerce, Lifter fulfillment and Azure provisioning are aligned for this transaction.
          </p>
        </div>
      )}

      <Sec title="Transaction">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Customer" value={txn.customer} />
          <Field label="Order" value={txn.id} />
          <Field label="Product" value={txn.product} />
          <Field label="SKU" value={txn.sku} />
          <Field label="ARR" value={money(txn.arr)} />
          <Field label="Azure Region" value={txn.region} />
          <Field label="Current stage" value={STAGE_LABEL[txn.stage]} />
          <Field label="Time stalled" value={txn.stalledMinutes ? `${txn.stalledMinutes} minutes` : "—"} />
        </div>
      </Sec>

      <Sec title="Customer journey">
        <ol className="space-y-1.5">
          {txn.events.map((e) => (
            <li key={e.stage} className="flex items-center gap-2.5 rounded-md border border-slate-200 px-2.5 py-1.5">
              {stateIcon(e.state)}
              <span className="flex-1 text-[12px] font-medium text-slate-800">{STAGE_LABEL[e.stage]}</span>
              <span className="text-[11px] tabular-nums text-slate-500">{e.at ?? (e.state === "inProgress" ? "In progress" : "Waiting")}</span>
              <span className="w-[62px] text-right text-[10.5px] tabular-nums text-slate-400">
                {e.durationSec ? (e.durationSec >= 60 ? `+${(e.durationSec / 60).toFixed(1)} min` : `+${e.durationSec}s`) : ""}
              </span>
            </li>
          ))}
        </ol>
      </Sec>

      <Sec title="Current state by system">
        <div className="grid grid-cols-2 gap-2">
          {sysState.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-md border border-slate-200 px-2.5 py-1.5">
              <span className="text-[11.5px] text-slate-600">{k}</span>
              <Chip tone={v === "Failed" ? "bad" : v === "Waiting" || v === "Pending" ? "neutral" : v === "In progress" ? "info" : "ok"}>{v}</Chip>
            </div>
          ))}
        </div>
      </Sec>

      {ex && (
        <>
          <Sec title="Likely root cause">
            <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12.5px] leading-relaxed text-slate-800">{ex.rootCause}</p>
          </Sec>
          <Sec title="Evidence">
            <div className="space-y-1.5">
              {ex.evidence.map((e) => (
                <div key={e.label} className="rounded-md border border-slate-200 px-2.5 py-1.5">
                  <div className="text-[9.5px] uppercase tracking-wide text-slate-500">{e.label}</div>
                  <div className="mt-0.5 break-all font-mono text-[11px] text-slate-800">{e.value}</div>
                </div>
              ))}
            </div>
          </Sec>
          <Sec title="Recommended remediation">
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3">
              <p className="text-[12.5px] leading-relaxed text-slate-800">{ex.remediation}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Chip tone="info">Automation confidence {ex.automationConfidence}%</Chip>
                <Chip tone={ex.humanApproval ? "warn" : "ok"}>
                  Human approval {ex.humanApproval ? "Required" : "Not Required"}
                </Chip>
              </div>
            </div>
          </Sec>
        </>
      )}

      <Sec title="Reconciliation">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Commercial order" value={txn.reconciliation.commercialOrder} />
          <Field label="Internal entitlement" value={txn.reconciliation.internalEntitlement} />
          <Field label="Lifter entitlement" value={txn.reconciliation.lifterEntitlement} />
          <Field label="Azure deployment" value={txn.reconciliation.azureDeployment} />
          <Field label="Metering" value={txn.reconciliation.metering} />
          <Field label="Billing" value={txn.reconciliation.billing} />
        </div>
        <div className="mt-2">
          <Chip tone={txn.reconciliation.verdict === "MATCH" ? "ok" : txn.reconciliation.verdict === "CRITICAL MISMATCH" ? "bad" : "warn"}>
            {txn.reconciliation.verdict}
          </Chip>
        </div>
      </Sec>
    </Drawer>
  );
}

export function remediationLabel(stage: StageId) {
  switch (stage) {
    case "azureAuth": return "Retry Authorization";
    case "lifterSubmit": return "Apply Mapping & Resubmit";
    case "lifterConfirm": return "Poll Lifter & Reconcile";
    case "provision": return "Re-run Deployment";
    case "entitlement": return "Recreate Entitlement";
    default: return "Retry";
  }
}

/* ------------------------------ system drawer ------------------------------ */

export function SystemDrawer({ s, id }: { s: WorkflowState; id: string }) {
  const sys = systems.find((x) => x.id === id);
  if (!sys) return null;
  return (
    <Drawer open title={sys.name} subtitle="Integration health and dependency posture" onClose={() => s.setDrawer(null)}
      footer={<ActionBtn tone="primary" onClick={() => toast.success(`Health probe re-run against ${sys.name}`)}>Re-run health probe</ActionBtn>}>
      <div className="mb-4">
        <Chip tone={sys.status === "Operational" ? "ok" : sys.status === "Degraded" ? "warn" : "bad"}>{sys.status}</Chip>
      </div>
      <Sec title="Service level">
        <div className="grid grid-cols-2 gap-2">
          <Field label="API availability" value={sys.availability} />
          <Field label="Latency (p95)" value={`${sys.latencyMs} ms`} />
          <Field label="Transactions / min" value={sys.tpm} />
          <Field label="Error rate" value={sys.errorRate} />
          <Field label="Last successful transaction" value={sys.lastTxn} />
          <Field label="Version" value={sys.version} />
        </div>
      </Sec>
      <Sec title="Recent errors">
        {sys.recentErrors.length === 0 ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-[12px] text-emerald-800">No errors in the selected period.</p>
        ) : (
          <div className="space-y-1.5">
            {sys.recentErrors.map((e, i) => (
              <div key={i} className="rounded-md border border-rose-200 bg-rose-50/50 px-2.5 py-1.5">
                <div className="flex items-center justify-between text-[10.5px] text-slate-500">
                  <span className="font-mono">{e.at}</span><span className="font-semibold text-rose-700">HTTP {e.code}</span>
                </div>
                <div className="mt-0.5 text-[12px] text-slate-800">{e.message}</div>
              </div>
            ))}
          </div>
        )}
      </Sec>
      <Sec title="Dependent services">
        <div className="flex flex-wrap gap-1.5">
          {sys.dependsOn.length ? sys.dependsOn.map((d) => <Chip key={d} tone="neutral">{d}</Chip>) : <span className="text-[12px] text-slate-500">Terminal system</span>}
        </div>
      </Sec>
      <Sec title="Change & incidents">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Last deployment" value={sys.lastDeployment} />
          <Field label="Open incidents" value={sys.incidents.length || "None"} />
        </div>
        {sys.incidents.map((i) => (
          <div key={i.title} className="mt-2 rounded-md border border-amber-200 bg-amber-50/60 px-2.5 py-1.5 text-[12px] text-amber-900">
            <span className="font-mono text-[10.5px] text-slate-500">{i.at}</span> — {i.title} ({i.status})
          </div>
        ))}
      </Sec>
    </Drawer>
  );
}

/* --------------------------- recommendations drawer ------------------------ */

export function RecommendationsDrawer({ s }: { s: WorkflowState }) {
  const ranked = [...s.exceptions].sort((a, b) => {
    const score = (t: Txn) =>
      t.revenueAtRisk / 1000 + t.stalledMinutes * 2 + (t.exception?.automationConfidence ?? 0) / 2;
    return score(b) - score(a);
  });
  const autoCount = ranked.filter((t) => !t.exception?.humanApproval).length;
  const releasable = ranked.filter((t) => !t.exception?.humanApproval).reduce((a, t) => a + t.revenueAtRisk, 0);

  return (
    <Drawer open title="Prioritized operational actions"
      subtitle={`Ranked by customer impact, revenue exposure, time stalled, remediation confidence and severity`}
      onClose={() => s.setDrawer(null)}>
      <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-[12.5px] leading-relaxed text-slate-800">
        {ranked.length} transactions currently require attention. {autoCount} can be automatically remediated.
        Clearing the automatable queue would release approximately {money(releasable)} in blocked ARR.
      </div>
      <div className="space-y-2.5">
        {ranked.map((t, i) => (
          <div key={t.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">#{i + 1}</span>
                  <span className="truncate text-[13px] font-semibold text-slate-900">{t.customer}</span>
                  <span className="font-mono text-[10.5px] text-slate-500">{t.id}</span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-700">{t.exception?.remediation}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Chip tone="bad">{money(t.revenueAtRisk)} at risk</Chip>
                  <Chip tone="warn">Stalled {t.stalledMinutes}m</Chip>
                  <Chip tone="info">{t.exception?.automationConfidence}% confidence</Chip>
                  <Chip tone={t.exception?.humanApproval ? "warn" : "ok"}>
                    {t.exception?.humanApproval ? "Approval required" : "Automatable"}
                  </Chip>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <ActionBtn tone="primary" disabled={s.busy === t.id}
                  onClick={() => s.remediate(t.id, remediationLabel(t.exception!.stage))}>
                  {s.busy === t.id ? "Working…" : "Remediate"}
                </ActionBtn>
                <ActionBtn onClick={() => s.setDrawer({ kind: "txn", id: t.id })}>Inspect</ActionBtn>
              </div>
            </div>
          </div>
        ))}
        {ranked.length === 0 && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-3 text-[12.5px] text-emerald-800">
            No open exceptions. Every direct order in the selected period has a confirmed Lifter entitlement and an authorized Azure deployment.
          </p>
        )}
      </div>
    </Drawer>
  );
}

/* --------------------------- reconciliation drawer ------------------------- */

export function ReconciliationDrawer({ s }: { s: WorkflowState }) {
  return (
    <Drawer open title={`Reconciliation health ${s.reconciliationHealth.toFixed(1)}%`}
      subtitle="Commercial order ↔ internal entitlement ↔ Lifter entitlement ↔ Azure deployment ↔ metering ↔ billing"
      onClose={() => s.setDrawer(null)}>
      <div className="space-y-2">
        {s.txns.map((t) => (
          <button key={t.id} onClick={() => s.setDrawer({ kind: "txn", id: t.id })}
            className="w-full rounded-lg border border-slate-200 p-2.5 text-left hover:border-indigo-300 hover:bg-slate-50">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12.5px] font-medium text-slate-900">{t.customer}</span>
              <Chip tone={t.reconciliation.verdict === "MATCH" ? "ok" : t.reconciliation.verdict === "CRITICAL MISMATCH" ? "bad" : "warn"}>
                {t.reconciliation.verdict}
              </Chip>
            </div>
            <div className="mt-1 grid grid-cols-3 gap-1 text-[10.5px] text-slate-600">
              <span>Internal: {t.reconciliation.internalEntitlement}</span>
              <span>Lifter: {t.reconciliation.lifterEntitlement}</span>
              <span>Azure: {t.reconciliation.azureDeployment}</span>
              <span>Metering: {t.reconciliation.metering}</span>
              <span>Billing: {t.reconciliation.billing}</span>
              <span>Capacity: {t.capacityTb} TB</span>
            </div>
          </button>
        ))}
      </div>
    </Drawer>
  );
}

/* ---------------------------- architecture drawer -------------------------- */

export function ArchitectureDrawer({ s }: { s: WorkflowState }) {
  const layers = [
    { title: "Direct commerce front end", body: "Customers transact directly with the vendor through Direct Marketplace. Pricing, contracting and checkout are owned end to end.", tone: "info" as const },
    { title: "Entitlement orchestration", body: "A canonical entitlement is created and validated internally, then translated into the Microsoft fulfillment contract.", tone: "ok" as const },
    { title: "Lifter fulfillment (behind the scenes)", body: "Every direct order raises and confirms a Lifter entitlement automatically. Microsoft fulfillment obligations are satisfied — never bypassed.", tone: "purple" as const },
    { title: "Azure authorization & provisioning", body: "Azure validates deployment eligibility against the confirmed entitlement, then resources are deployed into the customer's own subscription.", tone: "teal" as const },
    { title: "Operations, metering & reconciliation", body: "Service telemetry, consumption metering and continuous reconciliation across order, entitlement, Lifter, Azure and billing.", tone: "neutral" as const },
  ];
  return (
    <Drawer open title="Solution architecture" subtitle="Direct commerce with automated Lifter fulfillment" onClose={() => s.setDrawer(null)}>
      <div className="space-y-2.5">
        {layers.map((l, i) => (
          <div key={l.title} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">{i + 1}</span>
              <span className="text-[12.5px] font-semibold text-slate-900">{l.title}</span>
              <Chip tone={l.tone}>Layer {i + 1}</Chip>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-slate-700">{l.body}</p>
            {i < layers.length - 1 && (
              <div className="mt-2 flex items-center gap-1 text-[10.5px] text-slate-400">
                <ArrowRight className="h-3 w-3" /> flows into
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-[12px] leading-relaxed text-emerald-900">
          Direct commerce is decoupled from Microsoft fulfillment, not detached from it. Every transaction produces a confirmed
          Lifter entitlement before Azure authorization is requested.
        </p>
      </div>
    </Drawer>
  );
}
