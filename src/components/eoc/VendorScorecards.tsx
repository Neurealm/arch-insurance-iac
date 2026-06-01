import { vendors } from "@/data/eoc";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const slaTone = (sla: number) => {
  if (sla >= 95) return { text: "text-status-healthy", stroke: "hsl(var(--status-healthy))" };
  if (sla >= 90) return { text: "text-status-info", stroke: "hsl(var(--status-info))" };
  if (sla >= 85) return { text: "text-status-warning", stroke: "hsl(var(--status-warning))" };
  return { text: "text-status-critical", stroke: "hsl(var(--status-critical))" };
};

export function VendorScorecards() {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Vendor SLA Scorecards</h2>
        <button className="text-xs font-semibold text-indigo hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-[1.6fr_0.8fr_1fr_0.6fr] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 pb-2">
        <span>Vendor</span>
        <span>SLA Score</span>
        <span>Trend (7 Days)</span>
        <span className="text-right">Open Issues</span>
      </div>
      <ul className="flex-1 divide-y divide-border">
        {vendors.map((v) => {
          const t = slaTone(v.sla);
          return (
            <li key={v.id} className="grid grid-cols-[1.6fr_0.8fr_1fr_0.6fr] items-center px-2 py-2.5 rounded-lg hover:bg-secondary/60 transition">
              <span className="text-sm font-semibold truncate">{v.name}</span>
              <span className={cn("text-sm font-bold", t.text)}>{v.sla}%</span>
              <span className="h-7">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={v.trend} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
                    <defs>
                      <linearGradient id={`vg-${v.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={t.stroke} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={t.stroke} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="y" stroke={t.stroke} strokeWidth={1.75} fill={`url(#vg-${v.id})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </span>
              <span className="text-sm font-semibold text-foreground text-right">{v.openIssues}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}