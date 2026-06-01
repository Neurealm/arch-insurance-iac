import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDown, ArrowUp, Activity, Clock, AlertTriangle, Bell, CheckCircle2, Award } from "lucide-react";
import type { Kpi } from "@/data/eoc";
import { cn } from "@/lib/utils";

const iconFor: Record<string, any> = {
  health: Activity,
  mttr: Clock,
  incidents: AlertTriangle,
  alerts: Bell,
  change: CheckCircle2,
  vendor: Award,
};

const tone = {
  healthy: { text: "text-status-healthy", soft: "bg-status-healthy-soft", stroke: "hsl(var(--status-healthy))" },
  warning: { text: "text-status-warning", soft: "bg-status-warning-soft", stroke: "hsl(var(--status-warning))" },
  critical: { text: "text-status-critical", soft: "bg-status-critical-soft", stroke: "hsl(var(--status-critical))" },
  info: { text: "text-status-info", soft: "bg-status-info-soft", stroke: "hsl(var(--status-info))" },
};

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = iconFor[kpi.id] ?? Activity;
  const t = tone[kpi.status];
  const deltaPositive = kpi.delta.positive;
  const Arrow = kpi.delta.direction === "up" ? ArrowUp : ArrowDown;

  return (
    <button className="group text-left bg-card rounded-2xl border border-border p-5 card-hover w-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-muted-foreground truncate">{kpi.label}</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={cn("text-[34px] font-bold leading-none tracking-tight", t.text)}>{kpi.value}</span>
            {kpi.unit && <span className="text-base font-semibold text-muted-foreground">{kpi.unit}</span>}
          </div>
        </div>
        <span className={cn("h-9 w-9 rounded-xl grid place-items-center shrink-0 relative", t.soft, t.text, kpi.pulse && "pulse-dot")}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {kpi.delta.value && (
          <span className={cn("inline-flex items-center gap-0.5 font-semibold", deltaPositive ? "text-status-healthy" : "text-status-critical")}>
            <Arrow className="h-3 w-3" />
            {kpi.delta.value}
          </span>
        )}
        <span className="text-muted-foreground">{kpi.delta.period}</span>
      </div>

      <div className="h-[42px] mt-2 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={kpi.series} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
            <defs>
              <linearGradient id={`g-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={t.stroke} stopOpacity={0.35} />
                <stop offset="100%" stopColor={t.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="y" stroke={t.stroke} strokeWidth={2} fill={`url(#g-${kpi.id})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </button>
  );
}