import { dependencies } from "./data";
import { Interactive, PageHeader, StatusChip, useImpactDrawer } from "./primitives";

export default function CustomerHealthDependencies() {
  const { open } = useImpactDrawer();
  return (
    <div className="space-y-4">
      <PageHeader
        title="Service Dependencies"
        subtitle="The layers supporting your services — infrastructure condition is always shown separately from customer impact."
      />
      <ul className="space-y-2">
        {dependencies.map((d) => (
          <li key={d.id}>
            <Interactive
              tooltip="How this supporting layer is behaving — and whether its condition is reaching your users."
              onClick={() => open(d.contextId)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <span className="min-w-[180px] text-[13.5px] font-semibold text-slate-900">{d.layer}</span>
              <span className="flex-1 text-[12px] text-slate-500">{d.description}</span>
              <StatusChip status={d.status} />
            </Interactive>
          </li>
        ))}
      </ul>
    </div>
  );
}
