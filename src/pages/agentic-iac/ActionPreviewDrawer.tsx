import { useEffect, useState } from "react";
import { X, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { asset, expandDiskPlan, genericPlan, type AssetAction, type ActionPlan } from "./data";

interface Props {
  action: AssetAction | null;
  onClose: () => void;
}

function riskTone(risk: string) {
  if (risk === "High") return "bg-red-50 text-red-700 ring-red-200";
  if (risk === "Medium") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
}

/** Right-side action preview drawer. Never executes a change. */
export function ActionPreviewDrawer({ action, onClose }: Props) {
  const plan: ActionPlan | null = action
    ? action.id === "expand-disk"
      ? expandDiskPlan
      : genericPlan(action)
    : null;

  const [capacity, setCapacity] = useState(expandDiskPlan.defaultCapacity);
  const [engineered, setEngineered] = useState(false);

  useEffect(() => {
    setEngineered(false);
    setCapacity(plan?.defaultCapacity || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action?.id]);

  if (!action || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close preview" onClick={onClose} className="flex-1 bg-slate-900/20" />
      <aside className="flex h-full w-full max-w-[460px] flex-col border-l border-[#E2E8F0] bg-white shadow-xl">
        <header className="flex items-start gap-2 border-b border-[#E2E8F0] px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Action</div>
            <h2 className="text-[15px] font-semibold text-slate-900">{plan.actionTitle}</h2>
            <div className="mt-0.5 text-[11.5px] text-slate-500">
              Target · <span className="font-medium text-slate-700">{asset.name}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="ml-auto grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3 text-[12px]">
          <Block title="Current State">
            <dl className="divide-y divide-[#EEF2F6] rounded-md border border-[#E2E8F0]">
              {plan.currentState.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 px-2.5 py-1.5">
                  <dt className="text-slate-500">{row.label}</dt>
                  <dd className={cn("font-medium", row.tone === "warn" ? "text-amber-700" : "text-slate-800")}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </Block>

          {plan.capacityOptions.length > 0 && (
            <Block title="Proposed Change">
              <div className="flex items-center gap-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2">
                <span className="font-medium text-slate-700">{plan.currentCapacity}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  aria-label="Target capacity"
                  className="h-7 rounded border border-[#E2E8F0] bg-white px-2 text-[12px] font-medium text-[#1B4F91] outline-none"
                >
                  {plan.capacityOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </Block>
          )}

          <Block title="Required Operations">
            <ol className="space-y-1">
              {plan.operations.map((op, i) => (
                <li key={op} className="flex gap-2 rounded border border-[#EEF2F6] bg-white px-2 py-1">
                  <span className="w-4 shrink-0 text-right text-[10.5px] text-slate-400">{i + 1}</span>
                  <span className="text-slate-700">{op}</span>
                </li>
              ))}
            </ol>
          </Block>

          <Block title="Automation Methods">
            <div className="flex flex-wrap gap-1.5">
              {plan.methods.map((m) => (
                <span key={m} className="rounded border border-[#CFE0F3] bg-[#EFF4FB] px-2 py-0.5 text-[11px] text-[#1B4F91]">{m}</span>
              ))}
            </div>
          </Block>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Fact label="Expected Interruption" value={plan.interruption} />
            <Fact label="Estimated Execution" value={plan.duration} />
            <div className="rounded-md border border-[#E2E8F0] px-2.5 py-1.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Risk</div>
              <span className={cn("mt-0.5 inline-block rounded px-1.5 py-0.5 text-[11px] font-medium ring-1", riskTone(plan.risk))}>
                {plan.risk}
              </span>
            </div>
            <Fact label="Policy" value={plan.policy} />
          </div>

          <Block title="Rollback Characteristic">
            <p className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2 text-slate-600">{plan.rollback}</p>
          </Block>

          {engineered && (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[12px] text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Change Engineering Workspace will receive this intent.</span>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12.5px] text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setEngineered(true)}
            className="h-8 rounded-md bg-[#1B4F91] px-3 text-[12.5px] font-medium text-white hover:bg-[#164077]"
          >
            Engineer Change
          </button>
        </footer>
      </aside>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-3 first:mt-0">
      <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#E2E8F0] px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-[12px] font-medium text-slate-800">{value}</div>
    </div>
  );
}
