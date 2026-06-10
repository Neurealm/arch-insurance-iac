import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Search, Bell, HelpCircle, Plus, ChevronDown, Bot,
  AlertTriangle, CheckCircle2, ArrowRight, Users, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["Stakeholder Map", "Approval Chain", "Influence Matrix", "Validation Owners", "RACI Overview"];

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

// Org node component
function OrgNode({ name, title, role, badge, badgeColor, photo, borderColor = "#e2e8f0", width = 160 }: {
  name: string; title: string; role: string; badge: string; badgeColor: string;
  photo?: string; borderColor?: string; width?: number;
}) {
  const initials = name.split(" ").map(n => n[0]).join("");
  return (
    <div className="rounded-xl border-2 bg-white p-2.5 shadow-sm" style={{ borderColor, width }}>
      <div className="flex flex-col items-center text-center gap-1.5">
        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600">
          {initials}
        </div>
        <div>
          <div className="text-[10px] font-bold leading-tight">{name}</div>
          <div className="text-[9px] text-muted-foreground leading-tight">{title}</div>
        </div>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${badgeColor}20`, color: badgeColor }}>{badge}</span>
      </div>
    </div>
  );
}

// Connector lines helper
function VLine({ height = 16 }: { height?: number }) {
  return <div className="w-px bg-slate-300 mx-auto" style={{ height }} />;
}
function HConnector({ count }: { count: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ height: 16 }}>
      <div className="absolute top-0 left-1/2 w-px h-4 bg-slate-300" />
      <div className="absolute bottom-0 h-px bg-slate-300" style={{ left: `${(100 / count / 2)}%`, right: `${(100 / count / 2)}%` }} />
    </div>
  );
}

const DIRECTORY = [
  { role: "Executive Sponsor", name: "Jennifer Adams", title: "SVP, Operations", org: "Waters Corp", resp: "Final decision authority, strategic alignment", email: "jennifer.adams@waters.com", status: "Confirmed" },
  { role: "Business Owner", name: "Mark Davis", title: "Director, Operations", org: "Waters Corp", resp: "Business outcomes, scope approval", email: "mark.davis@waters.com", status: "Confirmed" },
  { role: "Application Owner", name: "Lisa Chen", title: "Manager, Claims Platform", org: "Waters Corp", resp: "Application lifecycle, service acceptance", email: "lisa.chen@waters.com", status: "Confirmed" },
  { role: "Technical Owner", name: "David Patel", title: "Engineering Manager", org: "Waters Corp", resp: "Technical decisions, delivery oversight", email: "david.patel@waters.com", status: "Confirmed" },
  { role: "Security Owner", name: "Alex Morgan", title: "Security Manager", org: "Waters Corp", resp: "Security requirements, risk validation", email: "alex.morgan@waters.com", status: "Confirmed" },
  { role: "Architecture Owner", name: "Priya Nair", title: "Solutions Architect", org: "Waters Corp", resp: "Architecture standards, design authority", email: "priya.nair@waters.com", status: "Confirmed" },
  { role: "Procurement", name: "James Walker", title: "Procurement Manager", org: "Waters Corp", resp: "Vendor management, contracting", email: "james.walker@waters.com", status: "Pending" },
  { role: "Finance", name: "Rachel Smith", title: "Finance Manager", org: "Waters Corp", resp: "Budget approval, financial governance", email: "rachel.smith@waters.com", status: "Pending" },
  { role: "Vendor Manager", name: "Tom Reynolds", title: "Vendor Manager", org: "Waters Corp", resp: "Vendor performance, escalation", email: "tom.reynolds@waters.com", status: "Confirmed" },
];

const APPROVAL_CHAIN = [
  { n: 1, name: "Jennifer Adams", role: "Executive Sponsor", action: "Approve" },
  { n: 2, name: "Mark Davis", role: "Business Owner", action: "Approve" },
  { n: 3, name: "Lisa Chen", role: "Application Owner", action: "Approve" },
  { n: 4, name: "David Patel", role: "Technical Owner", action: "Review" },
  { n: 5, name: "Alex Morgan", role: "Security Owner", action: "Review" },
  { n: 6, name: "Rachel Smith", role: "Finance", action: "Acknowledge" },
];

const INFLUENCE = [
  { name: "Executive Sponsor", decisions: "H", scope: "H", budget: "H", risk: "H", priority: "H" },
  { name: "Business Owner", decisions: "H", scope: "H", budget: "M", risk: "M", priority: "H" },
  { name: "Application Owner", decisions: "M", scope: "H", budget: "M", risk: "M", priority: "M" },
  { name: "Technical Owner", decisions: "M", scope: "H", budget: "M", risk: "M", priority: "M" },
  { name: "Security Owner", decisions: "M", scope: "M", budget: "M", risk: "H", priority: "M" },
  { name: "Procurement", decisions: "L", scope: "M", budget: "H", risk: "M", priority: "M" },
  { name: "Finance", decisions: "M", scope: "M", budget: "H", risk: "M", priority: "H" },
  { name: "Vendor Manager", decisions: "L", scope: "M", budget: "M", risk: "M", priority: "L" },
];

function ImpactBadge({ v }: { v: string }) {
  return (
    <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold",
      v === "H" ? "bg-emerald-100 text-emerald-700" : v === "M" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
    )}>{v}</span>
  );
}

export default function StakeholderMapDemo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <AppShell>
      <div className="flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        {/* HEADER */}
        <div className="bg-white border-b border-border px-5 py-2.5 flex items-center gap-3 shrink-0 flex-wrap">
          <div className="min-w-0 mr-2">
            <h1 className="text-[15px] font-bold leading-tight">Stakeholder &amp; Governance Map</h1>
            <p className="text-[10px] text-muted-foreground">Define ownership, influence, approval and validation for this engagement</p>
          </div>
          <div className="flex items-center gap-0 flex-wrap flex-1">
            {[["Customer","Waters Corp"],["Application","Claims Processing Platform"],["AOCP Phase","Customer & Engagement"]].map(([k,v]) => (
              <div key={k} className="border-l border-border pl-3 pr-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="font-semibold text-[11px]">{v}</div>
              </div>
            ))}
            <div className="border-l border-border pl-3 pr-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
              <div className="flex items-center gap-1 font-semibold text-[11px]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />Active</div>
            </div>
            <ProgressPill label="Completion" value="28%" />
            <ProgressPill label="Confidence" value="82%" />
            <div className="border-l border-border pl-3 flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">SJ</div>
              <div className="text-[9px] text-muted-foreground font-semibold">Sarah Johnson</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="h-7 w-7 rounded-lg border flex items-center justify-center hover:bg-accent"><Search className="h-3.5 w-3.5 text-muted-foreground" /></button>
            <button className="h-7 w-7 rounded-lg border flex items-center justify-center hover:bg-accent relative">
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">12</span>
            </button>
            <button className="h-7 w-7 rounded-lg border flex items-center justify-center hover:bg-accent"><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /></button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700">
              <Plus className="h-3 w-3" /> Create <ChevronDown className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>

        {/* SUB-TABS */}
        <div className="bg-white border-b border-border px-5 flex gap-0 shrink-0">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)}
              className={cn("px-4 py-2.5 text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap",
                activeTab === i ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* Org Chart */}
            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Stakeholder Relationship Map</span>
                <button className="text-[10px] border border-border rounded px-2 py-1 hover:bg-accent">⤢ Fit to View</button>
              </div>
              <div className="overflow-x-auto pb-2">
                <div className="flex flex-col items-center gap-0 min-w-[700px]">
                  {/* L1: Executive Sponsor */}
                  <OrgNode name="Jennifer Adams" title="SVP, Operations" role="exec" badge="Decision Authority" badgeColor="#1d4ed8" borderColor="#bfdbfe" width={172} />
                  <VLine height={16} />

                  {/* L2: Three direct reports */}
                  <div className="flex items-start gap-6 w-full justify-center relative">
                    <div className="absolute top-0 h-px bg-slate-300" style={{ left: "20%", right: "20%" }} />
                    {[
                      { name: "Mark Davis", title: "Director, Operations", role: "exec", badge: "Business Authority", badgeColor: "#059669", borderColor: "#bbf7d0" },
                      { name: "Lisa Chen", title: "Manager, Claims Platform", role: "exec", badge: "Accountable", badgeColor: "#7c3aed", borderColor: "#ddd6fe" },
                      { name: "David Patel", title: "Engineering Manager", role: "exec", badge: "Technical Authority", badgeColor: "#0e7490", borderColor: "#a5f3fc" },
                    ].map((n) => (
                      <div key={n.name} className="flex flex-col items-center gap-0">
                        <VLine height={16} />
                        <OrgNode {...n} width={150} />
                      </div>
                    ))}
                  </div>
                  <VLine height={16} />

                  {/* L3: Five reports */}
                  <div className="flex items-start gap-3 w-full justify-center relative">
                    <div className="absolute top-0 h-px bg-slate-300" style={{ left: "8%", right: "8%" }} />
                    {[
                      { name: "Alex Morgan", title: "Security Manager", role: "exec", badge: "Security Authority", badgeColor: "#b45309", borderColor: "#fde68a" },
                      { name: "Priya Nair", title: "Solutions Architect", role: "exec", badge: "Architecture Authority", badgeColor: "#92400e", borderColor: "#fed7aa" },
                      { name: "James Walker", title: "Procurement Manager", role: "exec", badge: "Procurement Authority", badgeColor: "#1d4ed8", borderColor: "#bfdbfe" },
                      { name: "Rachel Smith", title: "Finance Manager", role: "exec", badge: "Financial Authority", badgeColor: "#be185d", borderColor: "#fbcfe8" },
                      { name: "Tom Reynolds", title: "Vendor Manager", role: "exec", badge: "Vendor Authority", badgeColor: "#4d7c0f", borderColor: "#d9f99d" },
                    ].map((n) => (
                      <div key={n.name} className="flex flex-col items-center gap-0">
                        <VLine height={16} />
                        <OrgNode {...n} width={130} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border text-[9px] text-muted-foreground">
                {[["#1d4ed8","Decision Authority"],["#059669","Business Authority"],["#7c3aed","Accountable"],["#0e7490","Technical Authority"],["#64748b","Supporting"],].map(([c,l]) => (
                  <span key={l as string} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full inline-block" style={{ background: c as string }} />{l as string}
                  </span>
                ))}
                <span className="flex items-center gap-1"><span className="h-px w-4 bg-slate-400 inline-block" />Reports To</span>
                <span className="flex items-center gap-1"><span className="h-px w-4 border-t border-dashed border-slate-400 inline-block" />Collaborates</span>
              </div>
            </div>

            {/* Approval Chain + Influence Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Approval Chain</span>
                  <button className="text-[10px] text-blue-600 hover:underline font-semibold">View Full Approval Workflow ↗</button>
                </div>
                <div className="space-y-2">
                  {APPROVAL_CHAIN.map((a) => (
                    <div key={a.n} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{a.n}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold">{a.name}</div>
                        <div className="text-[10px] text-muted-foreground">{a.role}</div>
                      </div>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded",
                        a.action === "Approve" ? "bg-blue-100 text-blue-700" :
                        a.action === "Review" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                      )}>{a.action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Influence Matrix (High Level)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1.5 pr-3 font-semibold text-muted-foreground">Stakeholder</th>
                        {["Decisions","Scope","Budget","Risk","Priority"].map(h => (
                          <th key={h} className="py-1.5 px-2 text-center font-semibold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {INFLUENCE.map((r) => (
                        <tr key={r.name} className="border-b border-border hover:bg-slate-50">
                          <td className="py-1.5 pr-3 font-semibold whitespace-nowrap">{r.name}</td>
                          <td className="py-1.5 px-2 text-center"><ImpactBadge v={r.decisions} /></td>
                          <td className="py-1.5 px-2 text-center"><ImpactBadge v={r.scope} /></td>
                          <td className="py-1.5 px-2 text-center"><ImpactBadge v={r.budget} /></td>
                          <td className="py-1.5 px-2 text-center"><ImpactBadge v={r.risk} /></td>
                          <td className="py-1.5 px-2 text-center"><ImpactBadge v={r.priority} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-3 mt-2 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1"><ImpactBadge v="H" /> High Influence</span>
                  <span className="flex items-center gap-1"><ImpactBadge v="M" /> Medium Influence</span>
                  <span className="flex items-center gap-1"><ImpactBadge v="L" /> Low Influence</span>
                </div>
              </div>
            </div>

            {/* Stakeholder Directory */}
            <div className="rounded-xl border bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Stakeholder Directory</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] hover:bg-accent"><Plus className="h-3.5 w-3.5" /> Add Stakeholder</button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] hover:bg-accent"><Download className="h-3.5 w-3.5" /> Export</button>
                </div>
              </div>
              <table className="w-full text-[11px]">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>
                    {["Role","Name","Title","Organization","Primary Responsibility","Contact","Status"].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DIRECTORY.map((d) => (
                    <tr key={d.name} className="border-b border-border hover:bg-slate-50">
                      <td className="px-3 py-2 text-muted-foreground font-medium">{d.role}</td>
                      <td className="px-3 py-2 font-semibold">{d.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{d.title}</td>
                      <td className="px-3 py-2 text-muted-foreground">{d.org}</td>
                      <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">{d.resp}</td>
                      <td className="px-3 py-2 text-blue-600 text-[10px]">{d.email}</td>
                      <td className="px-3 py-2">
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold",
                          d.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>{d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

          {/* NOVA PANEL */}
          <aside className="w-72 border-l border-border bg-white overflow-y-auto shrink-0">
            <div className="p-3 border-b border-border bg-gradient-to-r from-violet-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-violet-600 text-white grid place-items-center"><Bot className="h-3.5 w-3.5" /></div>
                <span className="text-[12px] font-bold text-violet-700">NOVA Digital Coworker</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Insights &amp; Recommendations</div>
            </div>
            <div className="p-3 space-y-2.5">
              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-amber-50 grid place-items-center"><AlertTriangle className="h-2.5 w-2.5 text-amber-500" /></div>
                  <span className="text-[11px] font-bold">Missing Stakeholders Detected</span>
                </div>
                <p className="text-[10px] text-muted-foreground">We recommend adding the following roles:</p>
                <ul className="text-[10px] text-muted-foreground space-y-0.5 ml-2">
                  <li>• Legal Counsel</li>
                  <li>• Compliance Officer</li>
                </ul>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">Add Recommended Stakeholders</button>
              </div>
              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-emerald-50 grid place-items-center"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" /></div>
                  <span className="text-[11px] font-bold">Strong Governance Coverage</span>
                </div>
                <p className="text-[10px] text-muted-foreground">You have strong coverage for key decision areas including scope, budget, and risk.</p>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">View RACI Overview</button>
              </div>
              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-blue-50 grid place-items-center"><Users className="h-2.5 w-2.5 text-blue-500" /></div>
                  <span className="text-[11px] font-bold">Next Best Actions</span>
                </div>
                <ol className="text-[10px] text-muted-foreground space-y-0.5 ml-2">
                  <li>1. Confirm Procurement contact</li>
                  <li>2. Add Legal Counsel stakeholder</li>
                  <li>3. Complete validation owners mapping</li>
                </ol>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">Create Action Items</button>
              </div>
              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-yellow-50 grid place-items-center"><span className="text-[9px]">💡</span></div>
                  <span className="text-[11px] font-bold">NOVA Suggestion</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Based on similar engagements, adding Compliance Officer early reduces risk by 24%.</p>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">Add Compliance Officer</button>
              </div>
            </div>
            <div className="p-3 border-t border-border">
              <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700">
                <Bot className="h-3.5 w-3.5" /> Ask NOVA a Question
              </button>
            </div>
          </aside>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-border bg-white px-5 py-2.5 flex items-center gap-3 shrink-0">
          <button onClick={() => navigate("/crm-demo/engagement")} className="px-4 py-1.5 rounded-lg border text-[11px] font-semibold hover:bg-accent">Cancel</button>
          <button className="px-4 py-1.5 rounded-lg border text-[11px] font-semibold hover:bg-accent">Save Draft</button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border text-[11px] font-semibold hover:bg-accent">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Validate Governance
          </button>
          <div className="flex-1" />
          <button onClick={() => navigate("/crm-demo/discovery")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700">
            Save &amp; Continue <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
