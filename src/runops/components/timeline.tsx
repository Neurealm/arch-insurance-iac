// Timeline — vertical event stream. Deterministic; no auto-scroll effects.

import { cn } from "@/lib/utils";
import { tones, type StatusTone } from "./variants";

export interface TimelineEventProps {
  at: string;
  title: string;
  detail?: string;
  actor?: string;
  tone?: StatusTone;
  className?: string;
  children?: React.ReactNode;
}

export function TimelineEvent({ at, title, detail, actor, tone = "neutral", className, children }: TimelineEventProps) {
  const spec = tones[tone];
  return (
    <li className={cn("relative flex gap-3 pb-3", className)}>
      <div className="flex flex-col items-center">
        <span className={cn("mt-1 grid h-4 w-4 place-items-center rounded-full border border-white ring-2", spec.dot, spec.dot.replace("bg-", "ring-").replace("500", "200").replace("600", "200"))} aria-hidden />
        <span className="mt-1 w-px flex-1 bg-slate-200" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[11px] font-mono text-slate-500">{at}</span>
          <span className="text-sm font-semibold text-slate-900">{title}</span>
          {actor && <span className="text-[11px] text-slate-500">· {actor}</span>}
        </div>
        {detail && <div className="mt-0.5 text-xs text-slate-600">{detail}</div>}
        {children && <div className="mt-1">{children}</div>}
      </div>
    </li>
  );
}

export function Timeline({
  children, className, ariaLabel = "Event timeline",
}: { children: React.ReactNode; className?: string; ariaLabel?: string }) {
  return (
    <ol aria-label={ariaLabel} className={cn("flex flex-col", className)}>
      {children}
    </ol>
  );
}
