import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Search, Bell, HelpCircle, Plus, Filter, RefreshCw, Download,
  AlertTriangle, CheckCircle2, Info, ArrowRight, Building2, ChevronRight,
  Briefcase, Bot, Sparkles, Star, ChevronDown, Merge, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CUSTOMERS = [
  { id: "waters", initial: "W", color: "#0ea5e9", name: "Waters Corp", industry: "Life Sciences", unit: "Enterprise Systems", geo: "North America", tier: "Strategic", type: "Existing Client", typeColor: "green" },
  { id: "vhc", initial: "V", color: "#10b981", name: "VHC Health", industry: "Healthcare", unit: "Clinical Operations", geo: "North America", tier: "Strategic", type: "Existing Client", typeColor: "green" },
  { id: "hha", initial: "H", color: "#f97316", name: "HHAeXchange", industry: "Healthcare Technology", unit: "Platform Engineering", geo: "North America", tier: "Growth", type: "Existing Client", typeColor: "green" },
  { id: "marvell", initial: "M", color: "#ef4444", name: "Marvell Technology", industry: "Semiconductor", unit: "IT Operations", geo: "Global", tier: "Strategic", type: "Existing Client", typeColor: "green" },
  { id: "health", initial: "H", color: "#22c55e", name: "Healthfirst", industry: "Healthcare", unit: "Digital Health", geo: "North America", tier: "Strategic", type: "Existing Client", typeColor: "green" },
  { id: "blue", initial: "B", color: "#6366f1", name: "BlueSky Insurance", industry: "Insurance", unit: "Core Systems", geo: "North America", tier: "Growth", type: "New Prospect", typeColor: "amber" },
];

const ENGAGEMENTS = [
  { name: "Waters Digital Platform Support", type: "New Managed Services", stage: "Discovery", stageColor: "#3b82f6", date: "Jun 30, 2025", owner: "Mark Davis", status: "Active", statusColor: "#10b981", activity: "May 12, 2025" },
  { name: "LIMS Application Support Renewal", type: "Renewal", stage: "Pricing", stageColor: "#f59e0b", date: "May 15, 2025", owner: "Mark Davis", status: "Active", statusColor: "#10b981", activity: "May 08, 2025" },
  { name: "Cloud Migration & Support", type: "Transformation", stage: "Transition", stageColor: "#8b5cf6", date: "Aug 15, 2025", owner: "Lisa Chen", status: "Planning", statusColor: "#64748b", activity: "May 02, 2025" },
];

function ProgressPill({ label, value, color = "#22c55e" }: { label: string; value: string; color?: string }) {
  const num = parseInt(value);
  return (
    <div className="flex flex-col gap-0.5 border-l border-border pl-3">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${num}%`, background: color }} />
        </div>
        <span className="text-[12px] font-bold" style={{ color }}>{value}</span>
      </div>
    </div>
  );
}

function NovaInsight({ icon: Icon, iconColor, iconBg, title, body, link }: { icon: React.ElementType; iconColor: string; iconBg: string; title: string; body: string; link: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-3 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className={cn("h-5 w-5 rounded-md grid place-items-center shrink-0", iconBg)}>
          <Icon className={cn("h-3 w-3", iconColor)} />
        </div>
        <span className="text-[11px] font-bold">{title}</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">{body}</p>
      <button className="text-[10px] font-semibold text-blue-600 hover:underline">{link}</button>
    </div>
  );
}

export default function CustomerSelectionDemo() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>("waters");

  const sel = CUSTOMERS.find((c) => c.id === selected);

  return (
    <AppShell>
      <div className="flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        {/* ── TOP HEADER ── */}
        <div className="bg-white border-b border-border px-5 py-2.5 flex items-center gap-3 shrink-0 flex-wrap">
          <div className="min-w-0 mr-2">
            <h1 className="text-[15px] font-bold leading-tight">Customer Selection</h1>
            <p className="text-[10px] text-muted-foreground">Select or create a customer to begin building an AOCP model</p>
          </div>

          <div className="flex items-center gap-0 flex-wrap flex-1 text-[11px]">
            <div className="border-l border-border pl-3 pr-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Current Phase</div>
              <div className="font-semibold text-[11px]">Customer &amp; Engagement</div>
            </div>
            <div className="border-l border-border pl-3 pr-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
              <div className="flex items-center gap-1 font-semibold text-[11px]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />Active</div>
            </div>
            <ProgressPill label="Completion" value="8%" />
            <ProgressPill label="Confidence" value="82%" />
            <div className="border-l border-border pl-3 pr-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Last Updated</div>
              <div className="font-semibold text-[11px]">May 12, 2025</div>
            </div>
            <div className="border-l border-border pl-3 flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">SJ</div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Owner</div>
                <div className="font-semibold text-[11px] flex items-center gap-0.5">Sarah Johnson <ChevronDown className="h-2.5 w-2.5" /></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-accent"><Search className="h-3.5 w-3.5 text-muted-foreground" /></button>
            <button className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-accent relative">
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">12</span>
            </button>
            <button className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-accent"><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /></button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700">
              <Plus className="h-3 w-3" /> Create New <ChevronDown className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>

        {/* ── MAIN BODY ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left/main scroll area */}
          <main className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* Search + action bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[280px] max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  placeholder="Search customers by name, industry, business unit, owner, or CRM ID..."
                  className="w-full border border-border rounded-lg pl-9 pr-3 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-white text-[11px] hover:bg-accent">
                <Filter className="h-3.5 w-3.5" /> Filters
              </button>
              <button onClick={() => navigate("/crm-demo/engagement")} className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700">
                <Plus className="h-3.5 w-3.5" /> Create New Customer
              </button>
            </div>

            {/* Customer cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold">Recent &amp; Active Customers <span className="text-muted-foreground font-normal ml-1">6</span></span>
                <button className="h-5 w-5 rounded-full border border-border grid place-items-center hover:bg-accent"><ChevronRight className="h-3 w-3" /></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
                {CUSTOMERS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={cn(
                      "rounded-xl border-2 bg-white p-3 text-left transition-all hover:shadow-md",
                      selected === c.id ? "border-blue-500 shadow-sm" : "border-border hover:border-blue-200"
                    )}
                  >
                    {selected === c.id && (
                      <div className="flex justify-end mb-1">
                        <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-semibold">Selected</span>
                      </div>
                    )}
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-[16px] mb-2" style={{ background: c.color }}>
                      {c.initial}
                    </div>
                    <div className="text-[11px] font-bold leading-tight mb-1">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{c.industry}</div>
                    <div className="mt-1.5 space-y-0.5">
                      <div className="text-[9px] text-muted-foreground"><span className="font-semibold">Business Unit</span><br />{c.unit}</div>
                      <div className="text-[9px] text-muted-foreground"><span className="font-semibold">Geography</span><br />{c.geo}</div>
                      <div className="text-[9px] text-muted-foreground"><span className="font-semibold">Tier</span><br />{c.tier}</div>
                    </div>
                    <div className="mt-2">
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold",
                        c.typeColor === "green" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>{c.type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Engagements */}
            {sel && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold">Recent Engagements for {sel.name} <span className="text-muted-foreground font-normal">3</span></span>
                  <button className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1">View All Engagements <ChevronDown className="h-3 w-3" /></button>
                </div>
                <div className="rounded-xl border bg-white overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead className="bg-slate-50 border-b border-border">
                      <tr>
                        {["Engagement Name","Opportunity Type","Stage","Target Proposal Date","Opportunity Owner","Status","Last Activity"].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ENGAGEMENTS.map((e) => (
                        <tr key={e.name} className="border-b border-border hover:bg-slate-50 cursor-pointer" onClick={() => navigate("/crm-demo/engagement")}>
                          <td className="px-3 py-2.5 font-semibold text-blue-600 hover:underline">{e.name}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{e.type}</td>
                          <td className="px-3 py-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-white" style={{ background: e.stageColor }}>{e.stage}</span>
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">{e.date}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{e.owner}</td>
                          <td className="px-3 py-2.5">
                            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: e.statusColor }}>
                              <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: e.statusColor }} />{e.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">{e.activity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Customer Summary + CRM Context */}
            {sel && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-white p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Customer Summary</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
                    {[["Industry","Life Sciences"],["Account Owner","Mark Davis"],["Existing Client","Yes"],["CRM Account ID","0012B00000XyZ12QAF"],["Customer Tier","Strategic"],["CRM Reference","—"],["Headquarters","Milford, MA, USA"],["Customer Since","2018"]].map(([k,v]) => (
                      <div key={k}><span className="text-muted-foreground">{k}</span><div className="font-semibold mt-0.5">{v}</div></div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-5 w-5 rounded bg-blue-600 flex items-center justify-center"><span className="text-white text-[8px] font-bold">SF</span></div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">CRM Context</span>
                    <button className="ml-auto text-[10px] text-blue-600 font-semibold hover:underline">View in Salesforce ↗</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    {[["Open Opportunities","2"],["Account Health","Healthy ●"],["Pipeline Value","$4.2M"],["Relationship Strength","Strong ●"],["Last CRM Sync","May 12, 2025 9:15 AM"],["Next Touchpoint","May 20, 2025"]].map(([k,v]) => (
                      <div key={k} className="border border-border rounded-lg p-2">
                        <div className="text-[10px] text-muted-foreground">{k}</div>
                        <div className={cn("font-bold mt-0.5", v.includes("Healthy") || v.includes("Strong") ? "text-emerald-600" : "")}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* ── NOVA PANEL ── */}
          <aside className="w-72 border-l border-border bg-white overflow-y-auto shrink-0">
            <div className="p-3 border-b border-border bg-gradient-to-r from-violet-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-violet-600 text-white grid place-items-center"><Bot className="h-3.5 w-3.5" /></div>
                <span className="text-[12px] font-bold text-violet-700">NOVA Digital Coworker</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Insights &amp; Recommendations</div>
            </div>
            <div className="p-3 space-y-2.5">
              <NovaInsight icon={AlertTriangle} iconColor="text-amber-500" iconBg="bg-amber-50" title="Possible Duplicate Found"
                body="We found a potential duplicate: Waters Corporation (CRM ID: 0012B00000XyZ12QA). Match Confidence: 92%"
                link="Review Duplicate" />
              <NovaInsight icon={Briefcase} iconColor="text-emerald-600" iconBg="bg-emerald-50" title="Known Opportunities"
                body="2 open opportunities found in Salesforce for Waters Corp."
                link="View Opportunities" />
              <NovaInsight icon={Info} iconColor="text-blue-500" iconBg="bg-blue-50" title="Recommended Next Step"
                body="Select a customer or create a new one to continue with engagement setup."
                link="Create Engagement" />
              <NovaInsight icon={AlertTriangle} iconColor="text-rose-500" iconBg="bg-rose-50" title="Missing Information"
                body="Business Unit and Account Owner can be confirmed from CRM."
                link="Sync from CRM" />
            </div>
            <div className="p-3 border-t border-border">
              <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700">
                <Bot className="h-3.5 w-3.5" /> Ask NOVA a Question
              </button>
            </div>
          </aside>
        </div>

        {/* ── BOTTOM ACTION BAR ── */}
        <div className="border-t border-border bg-white px-5 py-2.5 flex items-center gap-2 shrink-0 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-semibold hover:bg-accent"><Plus className="h-3.5 w-3.5" /> Create Customer</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-semibold hover:bg-accent"><Upload className="h-3.5 w-3.5" /> Import from CRM</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-semibold hover:bg-accent"><Building2 className="h-3.5 w-3.5" /> View All Customers</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-semibold hover:bg-accent"><Merge className="h-3.5 w-3.5" /> Merge Duplicate</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-semibold hover:bg-accent"><RefreshCw className="h-3.5 w-3.5" /> Refresh from CRM</button>
          <div className="flex-1" />
          <button
            disabled={!selected}
            onClick={() => navigate("/crm-demo/engagement")}
            className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-colors",
              selected ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Continue to Engagement <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
