import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { trendData } from "@/data/eoc";
import { Info } from "lucide-react";

const series = [
  { key: "Critical", color: "hsl(var(--status-critical))" },
  { key: "High",     color: "hsl(var(--status-warning))" },
  { key: "Medium",   color: "hsl(35 92% 60%)" },
  { key: "Low",      color: "hsl(var(--status-info))" },
];

export function IncidentTrend() {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold inline-flex items-center gap-1.5">
          Incident Trend (7 Days) <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </h2>
      </div>
      <div className="flex items-center gap-4 mb-2">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.key}
          </span>
        ))}
      </div>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 6, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, 50]} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12, boxShadow: "var(--shadow-lg)" }} />
            {series.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2.25} dot={{ r: 3, strokeWidth: 0, fill: s.color }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}