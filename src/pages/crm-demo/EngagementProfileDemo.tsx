import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Search, Bell, HelpCircle, Plus, ChevronDown, Bot, AlertTriangle,
  CheckCircle2, Info, ArrowRight, Calendar, Star, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["Engagement Details", "Stakeholders", "Pursuit Timeline", "Scope Summary", "Readiness Check"];

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1", wide && "col-span-2")}>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label} {label !== "Notes" && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({ value, options }: { value: string; options?: string[] }) {
  return (
    <div className="flex items-center justify-between border border-border rounded-lg px-3 py-2 bg-white text-[11px] cursor-pointer hover:border-blue-400">
      <span>{value}</span><ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}

function Input({ value }: { value: string }) {
  return <div className="border border-border rounded-lg px-3 py-2 bg-white text-[11px]">{value}</div>;
}

function Textarea({ value }: { value: string }) {
  return <div className="border border-border rounded-lg px-3 py-2 bg-white text-[11px] h-16 text-muted-foreground">{value}</div>;
}

function Stars({ n, max = 5 }: { n: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} className={cn("h-3.5 w-3.5", i < n ? "fill-amber-400 text-amber-400" : "text-gray-300")} />
      ))}
    </div>
  );
}

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

function NovaRow({ icon: Icon, color, bg, title, items, status }: {
  icon: React.ElementType; color: string; bg: string; title: string;
  items?: string[]; status?: "Missing" | "Complete" | "Suggested";
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <div className={cn("h-4 w-4 rounded grid place-items-center shrink-0", bg)}><Icon className={cn("h-2.5 w-2.5", color)} /></div>
        <span className="text-[11px] font-bold">{title}</span>
      </div>
      {items && (
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-muted-foreground" /> {item.replace(/ \(.*\)$/, "")}
              </div>
              {item.includes("(Missing)") && <span className="text-[9px] bg-rose-100 text-rose-600 px-1 py-0.5 rounded font-semibold">Missing</span>}
              {item.includes("(Complete)") && <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1 py-0.5 rounded font-semibold">Complete</span>}
              {item.includes("(Suggested)") && <span className="text-[9px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded font-semibold">Suggested</span>}
            </div>
          ))}
        </div>
      )}
      <button className="text-[10px] font-semibold text-blue-600 hover:underline">{status ? `Create Missing Items` : "View Details →"}</button>
    </div>
  );
}

export default function EngagementProfileDemo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <AppShell>
      <div className="flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        {/* TOP HEADER */}
        <div className="bg-white border-b border-border px-5 py-2.5 flex items-center gap-3 shrink-0 flex-wrap">
          <div className="min-w-0 mr-2">
            <h1 className="text-[15px] font-bold leading-tight">Engagement Profile</h1>
            <p className="text-[10px] text-muted-foreground">Define commercial and delivery context for this engagement</p>
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
            <ProgressPill label="Completion" value="22%" />
            <ProgressPill label="Confidence" value="78%" />
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

        {/* MAIN CONTENT */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* Engagement Information */}
            <div className="rounded-xl border bg-white p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Engagement Information</div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Engagement Name"><Input value="Waters Digital Platform Support" /></Field>
                <Field label="Opportunity ID (CRM)"><Input value="OPP-2026-004512" /></Field>
                <Field label="Opportunity Type"><Select value="New Managed Services" /></Field>
                <Field label="Buying Stage"><Select value="Solution Evaluation" /></Field>
                <Field label="Scope Type"><Select value="Application Support & Operations" /></Field>
                <Field label="Pursuit Priority"><Select value="● High" /></Field>
                <Field label="Engagement Owner"><Select value="Sarah Johnson" /></Field>
                <Field label="Account Owner"><Input value="Mark Davis" /></Field>
                <Field label="Business Unit"><Input value="Enterprise Systems" /></Field>
                <Field label="Contracting Entity"><Input value="Waters Corporation" /></Field>
                <Field label="Existing Client"><div className="flex gap-2 items-center"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold">Yes</span></div></Field>
                <Field label="Customer Tier"><Input value="Strategic" /></Field>
                <Field label="CRM Reference"><div className="text-[11px] text-blue-600 underline cursor-pointer pt-2">Salesforce Opportunity ↗</div></Field>
                <Field label="Description" wide>
                  <Textarea value="End-to-end application support and operations for the Claims Processing Platform including infrastructure, middleware, database, and integrations." />
                </Field>
              </div>
            </div>

            {/* Key Dates + Delivery & Commercial */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-white p-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  <Calendar className="h-3.5 w-3.5" /> Key Dates
                </div>
                <div className="space-y-2">
                  {[["Target Proposal Date","Jun 30, 2026"],["Desired Start Date","Sep 01, 2026"],["Target Contract Signature","Jul 15, 2026"],["Estimated Transition Start","Sep 15, 2026"]].map(([k,v]) => (
                    <div key={k} className="flex items-center justify-between text-[11px] border-b border-border pb-1.5 last:border-0">
                      <span className="text-muted-foreground">{k} <span className="text-rose-500">*</span></span>
                      <div className="flex items-center gap-1.5 border border-border rounded px-2 py-1 bg-slate-50 font-semibold">
                        <Calendar className="h-3 w-3 text-muted-foreground" />{v}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Engagement Term <span className="text-rose-500">*</span></span>
                    <div className="flex items-center gap-1 border border-border rounded px-2 py-1 bg-slate-50 font-semibold">36 <span className="text-muted-foreground">Months</span></div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Pursuit Priority &amp; Classification</div>
                <div className="space-y-2">
                  {[["Strategic Importance", 4],["Revenue Potential", 4],["Competitive Situation", 2],].map(([label, n]) => (
                    <div key={label as string} className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{label as string}</span>
                      <div className="flex items-center gap-2"><Stars n={n as number} /><span className="text-[10px] font-semibold text-muted-foreground">High</span></div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Win Probability</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-blue-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: "72%" }} /></div>
                      <span className="font-bold">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-semibold">Medium</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery & Commercial Context */}
            <div className="rounded-xl border bg-white p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Delivery &amp; Commercial Context</div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Delivery Model"><Select value="Managed Services" /></Field>
                <Field label="Delivery Restriction">
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">Data residency (US)</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">Client onsite access required</span>
                  </div>
                </Field>
                <Field label="Commercial Model"><Select value="Fixed Fee + T&M" /></Field>
                <Field label="Pricing Model"><Select value="Outcome Based" /></Field>
                <Field label="Currency"><Select value="USD" /></Field>
                <Field label="Payment Terms"><Select value="Net 30" /></Field>
                <Field label="Renewal Preference"><Select value="Annual" /></Field>
                <Field label="Notes" wide><Textarea value="Client prefers 24x7 coverage for Tier 1 services. All data must remain within US regions." /></Field>
              </div>
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
              <div className="rounded-lg border bg-white p-2.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Engagement Summary <span className="text-[9px] text-blue-500">(AI Generated)</span></div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Waters Corp is evaluating a managed services engagement for their Claims Processing Platform. This is a high priority strategic opportunity with target proposal by June 30, 2026 and desired start on September 1, 2026.
                </p>
                <button className="mt-1.5 text-[10px] text-blue-600 font-semibold hover:underline">View Full Summary</button>
              </div>

              <NovaRow icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" title="Recommended Next Steps"
                items={["Add Technical Owner (Missing)","Add Security Contact (Missing)","Confirm Budget Range (Missing)","Validate Delivery Restrictions (Complete)","Review Scope Assumptions (Suggested)"]}
              />

              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-rose-50 grid place-items-center"><AlertTriangle className="h-2.5 w-2.5 text-rose-500" /></div>
                  <span className="text-[11px] font-bold">Risks &amp; Watchouts</span>
                </div>
                {[["Limited competitor visibility","Medium"],["Data residency requirements","Medium"],["Onsite access complexity","Low"]].map(([r,s]) => (
                  <div key={r as string} className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1"><span className="text-amber-400">●</span>{r as string}</span>
                    <span className={cn("font-semibold", (s as string) === "Medium" ? "text-amber-600" : "text-emerald-600")}>{s as string}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border bg-white p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="h-4 w-4 rounded bg-blue-50 grid place-items-center"><Info className="h-2.5 w-2.5 text-blue-500" /></div>
                  <span className="text-[11px] font-bold">NOVA Suggestions</span>
                </div>
                <p className="text-[10px] text-emerald-600">● Similar win rate for similar deals: 74%</p>
                <p className="text-[10px] text-emerald-600">● Recommend early security assessment</p>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">Run Pursuit Analysis</button>
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
          <button onClick={() => navigate("/crm-demo")} className="px-4 py-1.5 rounded-lg border border-border text-[11px] font-semibold hover:bg-accent">Cancel</button>
          <button className="px-4 py-1.5 rounded-lg border border-border text-[11px] font-semibold hover:bg-accent">Save Draft</button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-border text-[11px] font-semibold hover:bg-accent">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Validate Engagement
          </button>
          <div className="flex-1" />
          <button onClick={() => navigate("/crm-demo/stakeholders")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700">
            Save &amp; Continue <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
