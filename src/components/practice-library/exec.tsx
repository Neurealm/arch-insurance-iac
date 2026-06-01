import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Sparkline, MiniBars, Donut, Progress } from "./widgets";

export type ExecKpi = {
  Icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  label: string;
  sublabel?: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaDir?: "up" | "down";
  deltaTone?: "positive" | "negative" | "neutral";
  visual?: ReactNode;
  target?: string;
};

export function ExecKpiCard({
  Icon,
  iconBg = "bg-emerald-50",
  iconColor = "text-emerald-600",
  label,
  sublabel,
  value,
  unit,
  delta,
  deltaDir,
  deltaTone = "positive",
  visual,
  target,
}: ExecKpi) {
  const tone =
    deltaTone === "positive" ? "text-emerald-600" : deltaTone === "negative" ? "text-rose-600" : "text-muted-foreground";
  return (
    <div className="rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("h-3.5 w-3.5", iconColor)} />
        </div>
        <div className="text-[11px] font-medium text-muted-foreground leading-tight">
          {label}{sublabel && <><br/><span className="text-[10px]">{sublabel}</span></>}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <div className="text-xl font-bold tracking-tight text-foreground">{value}</div>
        {unit && <div className="text-xs font-semibold text-muted-foreground">{unit}</div>}
        {delta && (
          <div className={cn("ml-1 text-[10px] font-semibold inline-flex items-center", tone)}>
            {deltaDir === "down" ? <ArrowDown className="h-2.5 w-2.5" /> : <ArrowUp className="h-2.5 w-2.5" />}
            {delta}
          </div>
        )}
      </div>
      {visual && <div className="mt-2">{visual}</div>}
      {target && <div className="text-[10px] text-muted-foreground mt-1">{target}</div>}
    </div>
  );
}

export function ExecSummaryCard({
  title,
  body,
  Icon,
}: {
  title: string;
  body: string;
  Icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-2">
        <Icon className="h-5 w-5 text-indigo-600" />
      </div>
      <div className="text-sm font-semibold text-foreground mb-1">{title}</div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

export function BottomCallout({
  insight,
  insightBody,
  recommendations,
  rightTitle,
  rightValue,
  rightSub,
}: {
  insight: string;
  insightBody: string;
  recommendations?: string[];
  rightTitle?: string;
  rightValue?: string;
  rightSub?: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border bg-gradient-to-r from-indigo-50/50 via-white to-violet-50/50 p-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div>
          <div className="text-sm font-semibold text-indigo-700 mb-1">{insight}</div>
          <p className="text-xs text-muted-foreground leading-relaxed">{insightBody}</p>
        </div>
        {recommendations && (
          <div>
            <div className="text-sm font-semibold text-foreground mb-2">Recommended Actions</div>
            <ul className="space-y-1 text-xs text-foreground">
              {recommendations.map((r) => (
                <li key={r} className="flex items-start gap-2"><span className="text-indigo-600 mt-1">•</span>{r}</li>
              ))}
            </ul>
          </div>
        )}
        {rightTitle && (
          <div className="text-right md:text-left">
            <div className="text-xs text-muted-foreground">{rightTitle}</div>
            <div className="text-2xl font-bold text-emerald-600">{rightValue}</div>
            {rightSub && <div className="text-[10px] text-muted-foreground">{rightSub}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export { Sparkline, MiniBars, Donut, Progress };