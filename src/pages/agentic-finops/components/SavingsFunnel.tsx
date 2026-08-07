import { cn } from "@/lib/utils";
import { toneMap, type Tone } from "./primitives";

export interface FunnelStage {
  label: string;
  value: string;
  pct: number;
  tone?: Tone;
  note?: string;
}

export const defaultFunnel: FunnelStage[] = [
  { label: "Identified", value: "$8.7M", pct: 100, tone: "blue" },
  { label: "Validated", value: "$6.9M", pct: 79, tone: "sky" },
  { label: "Approved", value: "$4.8M", pct: 55, tone: "amber" },
  { label: "Realized YTD", value: "$3.2M", pct: 37, tone: "emerald" },
];

export default function SavingsFunnel({
  stages = defaultFunnel,
  title = "Savings realization funnel",
}: { stages?: FunnelStage[]; title?: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{title}</div>
      <ul className="mt-2 space-y-2">
        {stages.map((s, i) => {
          const t = toneMap[s.tone ?? (["blue", "sky", "amber", "emerald"][i % 4] as Tone)];
          return (
            <li key={s.label} className="grid grid-cols-[112px_1fr_84px] items-center gap-2">
              <span className="truncate text-[12px] text-slate-600">{s.label}</span>
              <span className="h-5 rounded bg-slate-100">
                <span
                  className={cn("flex h-5 items-center justify-end rounded pr-1.5 text-[10px] font-semibold text-white", t.ring)}
                  style={{ width: `${Math.max(s.pct, 8)}%` }}
                >
                  {s.pct}%
                </span>
              </span>
              <span className="text-right text-[12px] font-semibold tabular-nums text-slate-900">{s.value}</span>
            </li>
          );
        })}
      </ul>
      {stages.some((s) => s.note) && (
        <ul className="mt-2 space-y-0.5">
          {stages.filter((s) => s.note).map((s) => (
            <li key={s.label} className="text-[11px] text-slate-500">{s.label}: {s.note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
