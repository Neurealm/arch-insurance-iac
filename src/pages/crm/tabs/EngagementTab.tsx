import { useMemo } from "react";
import { useActivities, useStakeholders } from "@/hooks/crm/useCrmEntities";
import {
  Activity as ActivityIcon, Users, Calendar, TrendingUp, MessageSquare,
  Phone, Mail, Video, FileText, Star, Clock, Bot, Sparkles, BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import type { Company } from "../types";

function KpiCard({ label, value, sub, color, icon: Icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: `${color}1a`, color }}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground leading-tight">{label}</span>
      </div>
      <div className="text-[26px] font-bold leading-none">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{children}</h3>;
}

const ACTIVITY_COLORS: Record<string, string> = {
  Call: "#3b82f6",
  Email: "#10b981",
  Meeting: "#8b5cf6",
  Demo: "#f59e0b",
  "Follow-up": "#f97316",
  Other: "#64748b",
};

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  Call: Phone,
  Email: Mail,
  Meeting: Video,
  Demo: Star,
  "Follow-up": Clock,
  Other: FileText,
};

function activityColor(type: string) { return ACTIVITY_COLORS[type] ?? "#64748b"; }
function ActivityIcon2({ type }: { type: string }) {
  const Icon = ACTIVITY_ICONS[type] ?? FileText;
  return <Icon className="h-3.5 w-3.5" />;
}

export function EngagementTab({ companyId, company }: { companyId: string; company: Company }) {
  const { data: activities = [] } = useActivities(companyId);
  const { data: stakeholders = [] } = useStakeholders(companyId);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const recentActivities = useMemo(
    () => activities.filter((a) => new Date(a.occurred_at) >= thirtyDaysAgo),
    [activities, thirtyDaysAgo]
  );

  const activeStakeholderIds = useMemo(() => {
    const ids = new Set(activities.map((a) => a.stakeholder_id).filter(Boolean));
    return ids;
  }, [activities]);

  const engagementScore = useMemo(() => {
    if (activities.length === 0) return 0;
    let score = 0;
    score += Math.min(activities.length * 3, 40);
    score += Math.min(recentActivities.length * 5, 30);
    score += Math.min(activeStakeholderIds.size * 8, 20);
    if (company.priority === "High") score += 10;
    else if (company.priority === "Medium") score += 5;
    return Math.min(score, 100);
  }, [activities, recentActivities, activeStakeholderIds, company.priority]);

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    activities.forEach((a) => {
      map[a.type] = (map[a.type] ?? 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count, color: activityColor(type) }));
  }, [activities]);

  const last12Weeks = useMemo(() => {
    const weeks: { label: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const from = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const to = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const label = `W${12 - i}`;
      const count = activities.filter((a) => {
        const d = new Date(a.occurred_at);
        return d >= from && d < to;
      }).length;
      weeks.push({ label, count });
    }
    return weeks;
  }, [activities]);

  const recent5 = useMemo(
    () => [...activities].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()).slice(0, 8),
    [activities]
  );

  const topStakeholders = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach((a) => { if (a.stakeholder_id) counts[a.stakeholder_id] = (counts[a.stakeholder_id] ?? 0) + 1; });
    return stakeholders
      .filter((s) => counts[s.id])
      .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
      .slice(0, 6)
      .map((s) => ({ ...s, activityCount: counts[s.id] ?? 0 }));
  }, [activities, stakeholders]);

  const scoreColor = engagementScore >= 70 ? "#10b981" : engagementScore >= 40 ? "#f59e0b" : "#ef4444";
  const lastActivity = activities.length > 0
    ? new Date(Math.max(...activities.map((a) => new Date(a.occurred_at).getTime())))
    : null;

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Activities" value={activities.length} sub="all time" color="#3b82f6" icon={ActivityIcon} />
        <KpiCard label="Last 30 Days" value={recentActivities.length} sub="recent interactions" color="#10b981" icon={Calendar} />
        <KpiCard label="Stakeholders Touched" value={activeStakeholderIds.size} sub={`of ${stakeholders.length} total`} color="#8b5cf6" icon={Users} />
        <KpiCard label="Engagement Score" value={`${engagementScore}/100`} sub={engagementScore >= 70 ? "🟢 Healthy" : engagementScore >= 40 ? "🟡 Moderate" : "🔴 Low"} color={scoreColor} icon={TrendingUp} />
      </div>

      {/* Row 2: Charts + Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Activity Trend */}
        <div className="xl:col-span-5 rounded-xl border bg-card p-4 shadow-sm">
          <SectionTitle>Activity Trend — Last 12 Weeks</SectionTitle>
          {activities.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">No activity data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={last12Weeks}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#actGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Activity by Type */}
        <div className="xl:col-span-3 rounded-xl border bg-card p-4 shadow-sm">
          <SectionTitle>Activity by Type</SectionTitle>
          {byType.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">No activities yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={byType} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 9 }} width={60} />
                <Tooltip />
                <Bar dataKey="count" radius={4}>
                  {byType.map((d) => <Cell key={d.type} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* NOVA Insights */}
        <div className="xl:col-span-4 rounded-xl border border-violet-200 bg-violet-50/40 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-violet-600 text-white grid place-items-center shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-[12px] font-bold text-violet-700">NOVA Engagement Insights</span>
          </div>
          <div className="space-y-2">
            {[
              {
                icon: TrendingUp,
                color: "text-emerald-600", bg: "bg-emerald-50",
                text: engagementScore >= 70
                  ? `Strong engagement at ${engagementScore}/100 — ${recentActivities.length} interactions in the last 30 days.`
                  : engagementScore >= 40
                  ? `Moderate engagement (${engagementScore}/100). Consider increasing cadence with key stakeholders.`
                  : `Low engagement score (${engagementScore}/100). Schedule discovery calls to build momentum.`,
              },
              {
                icon: Users,
                color: "text-violet-600", bg: "bg-violet-50",
                text: stakeholders.length === 0
                  ? "No stakeholders mapped yet — add key contacts to improve discovery coverage."
                  : `${stakeholders.length} stakeholder${stakeholders.length > 1 ? "s" : ""} mapped. ${topStakeholders.length > 0 ? `Most engaged: ${topStakeholders[0]?.first_name} ${topStakeholders[0]?.last_name}.` : ""}`,
              },
              {
                icon: Clock,
                color: "text-amber-600", bg: "bg-amber-50",
                text: lastActivity
                  ? `Last interaction: ${lastActivity.toLocaleDateString()}. ${
                      new Date().getTime() - lastActivity.getTime() > 14 * 24 * 60 * 60 * 1000
                        ? "⚠ No activity in 2+ weeks — re-engage soon."
                        : "Engagement is recent and healthy."
                    }`
                  : "No activities logged yet. Start logging calls, emails, and meetings.",
              },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-violet-100">
                <div className={cn("h-5 w-5 rounded-md grid place-items-center shrink-0 mt-0.5", n.bg)}>
                  <n.icon className={cn("h-2.5 w-2.5", n.color)} />
                </div>
                <p className="text-[11px] leading-relaxed">{n.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-violet-100">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-violet-700 font-semibold uppercase tracking-wider">Account Priority</span>
              <Badge variant="outline" className="text-[10px]">{company.priority}</Badge>
            </div>
            {company.lifecycle_stage && (
              <div className="flex items-center justify-between text-[10px] mt-1">
                <span className="text-violet-700 font-semibold uppercase tracking-wider">Lifecycle Stage</span>
                <Badge variant="secondary" className="text-[10px]">{company.lifecycle_stage}</Badge>
              </div>
            )}
          </div>
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700">
            <Bot className="h-3.5 w-3.5" /> Ask NOVA
          </button>
        </div>
      </div>

      {/* Row 3: Recent Activities + Top Stakeholders */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Recent Activity Feed */}
        <div className="xl:col-span-8 rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recent Activity Timeline</span>
            <span className="text-[11px] text-muted-foreground">{activities.length} total</span>
          </div>
          {recent5.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No activities logged yet. Start by logging a call or email.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent5.map((a) => {
                const color = activityColor(a.type);
                const stkh = stakeholders.find((s) => s.id === a.stakeholder_id);
                return (
                  <div key={a.id} className="flex items-start gap-3 px-4 py-3 group hover:bg-accent/30">
                    <div className="h-7 w-7 rounded-lg grid place-items-center shrink-0 mt-0.5" style={{ background: `${color}1a`, color }}>
                      <ActivityIcon2 type={a.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[9px] border"
                          style={{ borderColor: `${color}60`, color }}
                        >
                          {a.type}
                        </Badge>
                        <span className="text-[12px] font-semibold truncate">{a.subject}</span>
                        {stkh && (
                          <span className="text-[11px] text-muted-foreground">
                            · {stkh.first_name} {stkh.last_name}
                          </span>
                        )}
                      </div>
                      {a.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(a.occurred_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Engaged Stakeholders */}
        <div className="xl:col-span-4 rounded-xl border bg-card p-4 shadow-sm">
          <SectionTitle>Top Engaged Stakeholders</SectionTitle>
          {topStakeholders.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No engagement data yet
            </div>
          ) : (
            <div className="space-y-2">
              {topStakeholders.map((s) => (
                <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent/30">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-[11px] font-bold text-indigo-700 shrink-0">
                    {s.first_name.charAt(0)}{s.last_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold truncate">{s.first_name} {s.last_name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{s.job_title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-bold" style={{ color: "#3b82f6" }}>{s.activityCount}</div>
                    <div className="text-[9px] text-muted-foreground">activities</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Engagement health meters */}
          <div className="mt-4 pt-3 border-t border-border">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Coverage Health</div>
            {[
              { label: "Activities logged", value: Math.min(activities.length / 20 * 100, 100), color: "#3b82f6" },
              { label: "Stakeholders engaged", value: stakeholders.length > 0 ? (activeStakeholderIds.size / stakeholders.length) * 100 : 0, color: "#10b981" },
              { label: "Recent (30d) coverage", value: activities.length > 0 ? Math.min(recentActivities.length / activities.length * 100, 100) : 0, color: "#8b5cf6" },
            ].map((m) => (
              <div key={m.label} className="mb-2">
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-semibold">{Math.round(m.value)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${m.value}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
