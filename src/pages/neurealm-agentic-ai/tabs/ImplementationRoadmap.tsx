import { SectionCard, StatusPill } from "../components/primitives";
import { roadmapPhases } from "../data";
import { CheckCircle2 } from "lucide-react";

export default function ImplementationRoadmap() {
  return (
    <div className="space-y-4">
      <SectionCard title="Implementation roadmap" subtitle="Phased delivery from discovery to scale">
        <div className="relative">
          <div className="absolute left-0 right-0 top-6 h-0.5 bg-gradient-to-r from-indigo-200 via-violet-300 to-teal-200" />
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
            {roadmapPhases.map((p) => (
              <div key={p.id} className="relative">
                <div className="h-3 w-3 rounded-full bg-white border-2 border-indigo-500 mx-auto relative z-10" />
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600">Phase {p.id}</div>
                    <StatusPill tone="slate">{p.duration}</StatusPill>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-1">{p.name}</div>
                  <ul className="mt-2 space-y-1">
                    {p.items.map((i) => (
                      <li key={i} className="text-[11.5px] text-slate-700 flex gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />{i}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Delivery cadence" subtitle="How Neurealm partners with customer teams">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: "Two-week iterations", desc: "Working software every sprint, demoed to executive sponsors." },
            { title: "Joint squads", desc: "Neurealm engineers embedded with customer platform, security, and business teams." },
            { title: "Executive checkpoints", desc: "Steering committee at end of each phase with go/no-go decisions." },
          ].map((c) => (
            <div key={c.title} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <div className="text-[13px] font-semibold text-slate-900">{c.title}</div>
              <div className="text-[12px] text-slate-600 mt-1">{c.desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
