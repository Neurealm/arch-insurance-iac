import { SectionCard, StatusPill } from "../components/primitives";
import { complianceFrameworks, securityLayers } from "../data";
import { ShieldCheck } from "lucide-react";

export default function SecurityGovernance() {
  return (
    <div className="space-y-4">
      <SectionCard title="Layered security architecture" subtitle="Defense-in-depth from identity to governance">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {securityLayers.map((l, i) => {
            const Icon = l.icon;
            return (
              <div key={l.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-md bg-indigo-100 text-indigo-700 grid place-items-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600">Layer {i + 1}</div>
                    <div className="text-sm font-semibold text-slate-900">{l.title}</div>
                  </div>
                </div>
                <ul className="space-y-1">
                  {l.items.map((it) => (
                    <li key={it} className="text-[12px] text-slate-700 flex gap-1.5">
                      <span className="text-emerald-500">✓</span>{it}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Compliance alignment" subtitle="Directional posture — not a certification">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {complianceFrameworks.map((c) => (
            <div key={c.name} className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <div className="text-sm font-semibold text-slate-900 mt-1.5">{c.name}</div>
              <div className="mt-1"><StatusPill tone="emerald">{c.status}</StatusPill></div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 mt-3">
          Neurealm platform patterns align with these frameworks. Formal certification is customer- and workload-specific.
        </p>
      </SectionCard>
    </div>
  );
}
