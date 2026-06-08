import { useMemo } from "react";
import { useActivities, useNotes, useStakeholders, useDepartments, useTeams } from "@/hooks/crm/useCrmEntities";
import {
  CheckCircle2, Circle, AlertTriangle, FileText, MessageSquare, Users,
  Building2, Activity, GitBranch, Bot, Sparkles, TrendingUp, ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { cn } from "@/lib/utils";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{children}</h3>;
}

interface DiscoveryCategory {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  items: string[];
  evidence: number;
  required: number;
}

export function DiscoveryTab({ companyId }: { companyId: string }) {
  const { data: activities = [] } = useActivities(companyId);
  const { data: notes = [] } = useNotes(companyId);
  const { data: stakeholders = [] } = useStakeholders(companyId);
  const { data: departments = [] } = useDepartments(companyId);
  const { data: teams = [] } = useTeams(companyId);

  // Build discovery categories scored from CRM data
  const categories: DiscoveryCategory[] = useMemo(() => [
    {
      key: "stakeholders",
      label: "Stakeholder Coverage",
      icon: Users,
      color: "#3b82f6",
      items: [
        "Key decision-makers identified",
        "Technical contacts mapped",
        "Business sponsors confirmed",
        "Champions identified",
        "Blockers / risks documented",
      ],
      evidence: Math.min(stakeholders.length, 5),
      required: 5,
    },
    {
      key: "departments",
      label: "Org Structure",
      icon: Building2,
      color: "#10b981",
      items: [
        "Departments mapped",
        "Reporting structure documented",
        "Team leads identified",
        "Business units understood",
      ],
      evidence: Math.min(departments.length + teams.length, 4),
      required: 4,
    },
    {
      key: "activities",
      label: "Engagement Evidence",
      icon: Activity,
      color: "#f59e0b",
      items: [
        "Discovery call completed",
        "Demo / presentation done",
        "Email communication logged",
        "Follow-up scheduled",
        "Requirements discussion held",
        "Proposal / proposal review",
      ],
      evidence: Math.min(activities.length, 6),
      required: 6,
    },
    {
      key: "notes",
      label: "Documentation",
      icon: FileText,
      color: "#8b5cf6",
      items: [
        "Pain points documented",
        "Current state captured",
        "Desired outcomes noted",
        "Budget / timeline notes",
        "Technical requirements logged",
      ],
      evidence: Math.min(notes.length, 5),
      required: 5,
    },
    {
      key: "communications",
      label: "Communication Threads",
      icon: MessageSquare,
      color: "#ef4444",
      items: [
        "Call logs with outcomes",
        "Email chains documented",
        "Meeting notes captured",
        "Action items tracked",
      ],
      evidence: Math.min(activities.filter((a) => ["Call", "Email", "Meeting"].includes(a.type)).length, 4),
      required: 4,
    },
    {
      key: "governance",
      label: "Governance Clarity",
      icon: ShieldCheck,
      color: "#6366f1",
      items: [
        "Decision process understood",
        "Approval chain mapped",
        "Procurement contacts known",
        "Legal / compliance contacts",
      ],
      evidence: Math.min(stakeholders.filter((s) => s.influence_level === "High").length * 2, 4),
      required: 4,
    },
  ], [stakeholders, departments, teams, activities, notes]);

  const totalEvidence = categories.reduce((s, c) => s + c.evidence, 0);
  const totalRequired = categories.reduce((s, c) => s + c.required, 0);
  const completenessScore = totalRequired > 0 ? Math.round((totalEvidence / totalRequired) * 100) : 0;
  const completedCategories = categories.filter((c) => c.evidence >= c.required).length;

  const scoreColor = completenessScore >= 75 ? "#10b981" : completenessScore >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = completenessScore >= 75 ? "High Confidence" : completenessScore >= 50 ? "Moderate" : "Incomplete";

  const radialData = [{ name: "score", value: completenessScore, fill: scoreColor }];

  // Evidence library: recent notes + activities as evidence items
  const evidenceItems = useMemo(() => {
    const items: { id: string; type: "note" | "activity"; title: string; date: string; author?: string; category: string }[] = [];
    notes.forEach((n) => items.push({ id: n.id, type: "note", title: n.body.slice(0, 80) + (n.body.length > 80 ? "…" : ""), date: n.created_at, author: n.author, category: "Documentation" }));
    activities.forEach((a) => items.push({ id: a.id, type: "activity", title: `[${a.type}] ${a.subject}`, date: a.occurred_at, category: "Engagement Evidence" }));
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [notes, activities]);

  return (
    <div className="space-y-5">
      {/* Header score band */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Completeness Score", value: `${completenessScore}%`, sub: scoreLabel, color: scoreColor, icon: TrendingUp },
          { label: "Categories Covered", value: `${completedCategories}/${categories.length}`, sub: "fully complete", color: "#3b82f6", icon: CheckCircle2 },
          { label: "Evidence Items", value: totalEvidence, sub: `of ${totalRequired} required`, color: "#8b5cf6", icon: FileText },
          { label: "Discovery Phase", value: completenessScore >= 75 ? "Ready" : completenessScore >= 40 ? "In Progress" : "Early", sub: "current phase", color: "#10b981", icon: GitBranch },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: `${k.color}1a`, color: k.color }}>
                <k.icon className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground leading-tight">{k.label}</span>
            </div>
            <div className="text-[26px] font-bold leading-none">{k.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Completeness ring + categories */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Donut score */}
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <SectionTitle>Discovery Confidence</SectionTitle>
            <div className="relative h-[160px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <RadialBarChart innerRadius="65%" outerRadius="90%" data={radialData} startAngle={90} endAngle={90 - 360 * completenessScore / 100}>
                  <RadialBar dataKey="value" cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[28px] font-bold" style={{ color: scoreColor }}>{completenessScore}%</span>
                <span className="text-[11px] text-muted-foreground font-semibold">{scoreLabel}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 border-t pt-3 border-border">
              <div className="text-center">
                <div className="text-[14px] font-bold text-emerald-600">{completedCategories}</div>
                <div className="text-[9px] text-muted-foreground">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-[14px] font-bold text-amber-600">{categories.filter((c) => c.evidence > 0 && c.evidence < c.required).length}</div>
                <div className="text-[9px] text-muted-foreground">Partial</div>
              </div>
              <div className="text-center">
                <div className="text-[14px] font-bold text-rose-600">{categories.filter((c) => c.evidence === 0).length}</div>
                <div className="text-[9px] text-muted-foreground">Missing</div>
              </div>
            </div>
          </div>

          {/* NOVA */}
          <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-violet-600 text-white grid place-items-center shrink-0"><Sparkles className="h-3.5 w-3.5" /></div>
              <span className="text-[12px] font-bold text-violet-700">NOVA Discovery Insights</span>
            </div>
            <div className="space-y-2">
              {[
                {
                  icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50",
                  text: completenessScore >= 75 ? "Discovery is high-confidence. Ready to proceed to solution design." :
                    completenessScore >= 50 ? "Discovery is moderate. Focus on filling documentation and governance gaps." :
                    "Discovery is incomplete. Schedule stakeholder calls and log notes to build confidence.",
                },
                {
                  icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50",
                  text: categories.filter((c) => c.evidence === 0).length > 0
                    ? `Missing data in: ${categories.filter((c) => c.evidence === 0).map((c) => c.label).join(", ")}.`
                    : "All discovery categories have at least some evidence. Continue building completeness.",
                },
                {
                  icon: FileText, color: "text-violet-600", bg: "bg-violet-50",
                  text: notes.length === 0 ? "No notes logged yet. Add notes in the Notes tab to build your evidence library." :
                    `${notes.length} note${notes.length > 1 ? "s" : ""} in evidence library. ${activities.length} activities logged as engagement proof.`,
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
            <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700">
              <Bot className="h-3.5 w-3.5" /> Ask NOVA
            </button>
          </div>
        </div>

        {/* Category coverage checklist */}
        <div className="xl:col-span-4 rounded-xl border bg-card p-4 shadow-sm">
          <SectionTitle>Coverage Checklist</SectionTitle>
          <div className="space-y-4">
            {categories.map((cat) => {
              const pct = cat.required > 0 ? Math.round((cat.evidence / cat.required) * 100) : 0;
              const complete = cat.evidence >= cat.required;
              return (
                <div key={cat.key}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-5 w-5 rounded-md grid place-items-center shrink-0" style={{ background: `${cat.color}1a`, color: cat.color }}>
                      <cat.icon className="h-2.5 w-2.5" />
                    </div>
                    <span className="text-[11px] font-semibold flex-1">{cat.label}</span>
                    <span className="text-[10px] text-muted-foreground">{cat.evidence}/{cat.required}</span>
                    {complete ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: complete ? "#10b981" : cat.color }} />
                  </div>
                  <div className="space-y-0.5">
                    {cat.items.map((item, idx) => {
                      const done = idx < cat.evidence;
                      return (
                        <div key={idx} className={cn("flex items-center gap-1.5 text-[10px]", done ? "text-foreground" : "text-muted-foreground/60")}>
                          {done
                            ? <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                            : <Circle className="h-2.5 w-2.5 shrink-0" />
                          }
                          {item}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evidence Library */}
        <div className="xl:col-span-4 rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Evidence Library</span>
            <span className="text-[11px] text-muted-foreground">{evidenceItems.length} items</span>
          </div>
          {evidenceItems.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No evidence yet. Log activities and notes to build your discovery library.</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
              {evidenceItems.map((item) => (
                <div key={item.id} className="px-4 py-2.5 hover:bg-accent/30 group">
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "h-5 w-5 rounded-md grid place-items-center shrink-0 mt-0.5",
                      item.type === "note" ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {item.type === "note" ? <FileText className="h-2.5 w-2.5" /> : <Activity className="h-2.5 w-2.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">{item.category}</Badge>
                      </div>
                      <p className="text-[11px] font-medium mt-0.5 line-clamp-2">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        {item.author && <span className="text-[10px] text-muted-foreground">· {item.author}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
