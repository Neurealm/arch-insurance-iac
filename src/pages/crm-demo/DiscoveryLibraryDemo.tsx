import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Search, Bell, HelpCircle, Plus, ChevronDown, Bot,
  AlertTriangle, CheckCircle2, ArrowRight, Upload, FileText,
  MoreVertical, Filter, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["All Evidence", "Uploaded", "Classified", "Linked", "Requires Review", "Archived"];

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

const KPIS = [
  { label: "Total Evidence", value: "48", sub: "Artifacts", icon: "📄", color: "#6366f1", bg: "#eef2ff" },
  { label: "Classified", value: "42", sub: "88%", icon: "✓", color: "#10b981", bg: "#ecfdf5" },
  { label: "High Confidence", value: "32", sub: "67%", icon: "🎯", color: "#f59e0b", bg: "#fffbeb" },
  { label: "Linked to Screens", value: "38", sub: "79%", icon: "🔗", color: "#3b82f6", bg: "#eff6ff" },
  { label: "Pending Review", value: "6", sub: "12%", icon: "⏳", color: "#8b5cf6", bg: "#f5f3ff" },
  { label: "Requires Attention", value: "2", sub: "4%", icon: "⚠", color: "#ef4444", bg: "#fef2f2" },
];

const EVIDENCE_TYPES = [
  ["Architecture Diagrams", 8], ["CMDB Exports", 6], ["Ticket Data Exports", 7],
  ["Monitoring & Logging", 6], ["Cloud Inventories", 5], ["Security Reports", 4],
  ["Runbooks & SOPs", 6], ["Contracts & SLAs", 3], ["Workshop Notes", 3], ["Other Documents", 0],
];

const EVIDENCE = [
  { name: "Claims Platform High Level Architecture.pdf", type: "Architecture Diagram", typeColor: "#3b82f6", source: "Enterprise Architecture", by: "Lisa Chen", date: "May 10, 2025", confidence: "High", status: "Classified", linked: "5 Screens" },
  { name: "CMDB_Export_ClaimsPlatform.xlsx", type: "CMDB Export", typeColor: "#10b981", source: "ServiceNow CMDB", by: "Mark Davis", date: "May 09, 2025", confidence: "High", status: "Classified", linked: "7 Screens" },
  { name: "Incident_Tickets_2024_Export.csv", type: "Ticket Data Export", typeColor: "#f59e0b", source: "ServiceNow ITSM", by: "Priya Nair", date: "May 09, 2025", confidence: "Medium", status: "Classified", linked: "4 Screens" },
  { name: "Datadog_Metrics_Export.json", type: "Monitoring Export", typeColor: "#8b5cf6", source: "Datadog", by: "Alex Morgan", date: "May 08, 2025", confidence: "High", status: "Classified", linked: "3 Screens" },
  { name: "AWS_Inventory_Report.xlsx", type: "Cloud Inventory", typeColor: "#6366f1", source: "AWS Organizations", by: "James Walker", date: "May 07, 2025", confidence: "Medium", status: "Classified", linked: "6 Screens" },
  { name: "Security_Assessment_Report.pdf", type: "Security Report", typeColor: "#ef4444", source: "SecureWorks", by: "Rachel Smith", date: "May 06, 2025", confidence: "High", status: "Classified", linked: "5 Screens" },
  { name: "Claims_App_Runbook_v2.docx", type: "Runbook / SOP", typeColor: "#0ea5e9", source: "Internal Team", by: "Tom Reynolds", date: "May 05, 2025", confidence: "Medium", status: "Review", linked: "2 Screens" },
  { name: "MSA_WatersCorp_2025.pdf", type: "Contract / SLA", typeColor: "#14b8a6", source: "Legal Repository", by: "David Patel", date: "May 04, 2025", confidence: "High", status: "Classified", linked: "3 Screens" },
  { name: "Discovery_Workshop_Notes_May02.docx", type: "Workshop Notes", typeColor: "#f97316", source: "Internal Team", by: "Lisa Chen", date: "May 02, 2025", confidence: "Low", status: "Review", linked: "1 Screen" },
  { name: "Network_Topology_Visio.zip", type: "Architecture Diagram", typeColor: "#3b82f6", source: "Network Team", by: "Priya Nair", date: "Apr 30, 2025", confidence: "Medium", status: "Pending", linked: "2 Screens" },
];

function ConfBadge({ v }: { v: string }) {
  return (
    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded",
      v === "High" ? "bg-emerald-100 text-emerald-700" : v === "Medium" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
    )}>{v}</span>
  );
}
function StatusBadge({ v }: { v: string }) {
  return (
    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded",
      v === "Classified" ? "bg-blue-100 text-blue-700" : v === "Review" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
    )}>{v}</span>
  );
}

export default function DiscoveryLibraryDemo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);

  return (
    <AppShell>
      <div className="flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        {/* HEADER */}
        <div className="bg-white border-b border-border px-5 py-2.5 flex items-center gap-3 shrink-0 flex-wrap">
          <div className="min-w-0 mr-2">
            <h1 className="text-[15px] font-bold leading-tight">Discovery Intake &amp; Evidence Library</h1>
            <p className="text-[10px] text-muted-foreground">Manage and organize all discovery artifacts and evidence used to build the AOCP model</p>
          </div>
          <div className="flex items-center gap-0 flex-wrap flex-1">
            {[["Customer","Waters Corp"],["Application","Claims Processing Platform"],["AOCP Phase","Discovery"]].map(([k,v]) => (
              <div key={k} className="border-l border-border pl-3 pr-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="font-semibold text-[11px]">{v}</div>
              </div>
            ))}
            <div className="border-l border-border pl-3 pr-3">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
              <div className="flex items-center gap-1 font-semibold text-[11px]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />Active</div>
            </div>
            <ProgressPill label="Completion" value="35%" />
            <ProgressPill label="Confidence" value="74%" />
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
              <Upload className="h-3 w-3" /> Upload <ChevronDown className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="bg-white border-b border-border px-5 py-2 shrink-0">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            {KPIS.map((k) => (
              <div key={k.label} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white">
                <div className="h-8 w-8 rounded-lg grid place-items-center text-[16px] shrink-0" style={{ background: k.bg }}>{k.icon}</div>
                <div>
                  <div className="text-[16px] font-bold leading-none">{k.value}</div>
                  <div className="text-[9px] text-muted-foreground">{k.label}</div>
                  <div className="text-[9px] font-semibold" style={{ color: k.color }}>{k.sub}</div>
                </div>
              </div>
            ))}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Drag & Drop Upload */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border-2 border-dashed border-border bg-white p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <div className="h-12 w-12 rounded-full bg-blue-50 mx-auto flex items-center justify-center mb-3">
                    <Upload className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="text-[12px] font-semibold">Drag and drop files here or <span className="text-blue-600 underline">click to browse</span></p>
                  <p className="text-[10px] text-muted-foreground mt-1">Supports: PDF, DOCX, XLSX, CSV, Visio, PNG, JPG, XML, JSON (Max 500MB per file)</p>
                </div>
              </div>

              {/* Evidence Types */}
              <div className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Evidence Types</span>
                  <button className="text-[10px] text-blue-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {EVIDENCE_TYPES.map(([label, count]) => (
                    <div key={label as string} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground flex items-center gap-1"><FileText className="h-2.5 w-2.5" />{label as string}</span>
                      <span className="font-bold">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Evidence Table */}
            <div className="rounded-xl border bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input placeholder="Search evidence by name, type, source..." className="w-full border border-border rounded-lg pl-9 pr-3 py-1.5 text-[11px] bg-white focus:outline-none" />
                </div>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] hover:bg-accent"><Filter className="h-3.5 w-3.5" /> Evidence Type</button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] hover:bg-accent"><Filter className="h-3.5 w-3.5" /> Source System</button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] hover:bg-accent"><Filter className="h-3.5 w-3.5" /> Confidence</button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] hover:bg-accent">All Status <ChevronDown className="h-3 w-3" /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 border-b border-border">
                    <tr>
                      <th className="w-6 px-3 py-2"><input type="checkbox" className="h-3 w-3" /></th>
                      {["Evidence Name","Type","Source System","Uploaded By","Upload Date","Confidence","Status","Linked To","Actions"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {EVIDENCE.map((e) => (
                      <tr key={e.name} className="border-b border-border hover:bg-slate-50">
                        <td className="px-3 py-2"><input type="checkbox" className="h-3 w-3" /></td>
                        <td className="px-3 py-2 font-semibold max-w-[180px]">
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate text-[10px]">{e.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border" style={{ color: e.typeColor, borderColor: `${e.typeColor}40`, background: `${e.typeColor}10` }}>{e.type}</span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{e.source}</td>
                        <td className="px-3 py-2 text-muted-foreground">{e.by}</td>
                        <td className="px-3 py-2 text-muted-foreground">{e.date}</td>
                        <td className="px-3 py-2"><ConfBadge v={e.confidence} /></td>
                        <td className="px-3 py-2"><StatusBadge v={e.status} /></td>
                        <td className="px-3 py-2 text-blue-600 text-[10px] font-semibold">{e.linked}</td>
                        <td className="px-3 py-2"><button className="h-6 w-6 rounded hover:bg-accent grid place-items-center"><MoreVertical className="h-3 w-3" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-[11px]">
                <span className="text-muted-foreground">Showing 1 to 10 of 48 items</span>
                <div className="flex items-center gap-1">
                  {["←","‹",1,2,3,4,5,"›","→"].map((p, i) => (
                    <button key={i} onClick={() => typeof p === "number" && setPage(p)}
                      className={cn("h-6 w-6 rounded text-[10px] grid place-items-center hover:bg-accent",
                        page === p ? "bg-blue-600 text-white" : "border border-border"
                      )}>{p}</button>
                  ))}
                  <span className="ml-2 text-muted-foreground flex items-center gap-1">10 / page <ChevronDown className="h-3 w-3" /></span>
                </div>
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
              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-violet-50 grid place-items-center"><span className="text-[9px]">🔍</span></div>
                  <span className="text-[11px] font-bold">Evidence Classification</span>
                </div>
                <p className="text-[10px] text-muted-foreground">All new uploads have been automatically classified and linked to relevant AOCP screens.</p>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">View Auto-Classification</button>
              </div>
              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-amber-50 grid place-items-center"><AlertTriangle className="h-2.5 w-2.5 text-amber-500" /></div>
                  <span className="text-[11px] font-bold">Missing Evidence Detected</span>
                </div>
                <p className="text-[10px] text-muted-foreground">We recommend adding the following evidence to improve model confidence:</p>
                <ul className="text-[10px] text-muted-foreground space-y-0.5 ml-2">
                  <li>• DR Runbook</li>
                  <li>• Capacity Planning Report</li>
                  <li>• Backup &amp; Restore Procedures</li>
                </ul>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">Add Missing Evidence</button>
              </div>
              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-emerald-50 grid place-items-center"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" /></div>
                  <span className="text-[11px] font-bold">High Impact Evidence</span>
                </div>
                <p className="text-[10px] text-muted-foreground">CMDB Export and Architecture Diagram are critical to 7 screens.</p>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">View Impact Analysis</button>
              </div>
              <div className="rounded-lg border bg-white p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-blue-50 grid place-items-center"><span className="text-[9px]">🎯</span></div>
                  <span className="text-[11px] font-bold">Next Best Actions</span>
                </div>
                <div className="space-y-0.5">
                  {[["Review 2 items pending your approval"],["Link 6 unlinked evidence items"],["Upload recommended missing evidence"]].map(([a]) => (
                    <div key={a} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />{a}
                    </div>
                  ))}
                </div>
                <button className="text-[10px] text-blue-600 font-semibold hover:underline">View My Tasks</button>
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
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border text-[11px] font-semibold hover:bg-accent"><Download className="h-3.5 w-3.5" /> Export Library</button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border text-[11px] font-semibold hover:bg-accent"><FileText className="h-3.5 w-3.5" /> Generate Evidence Report</button>
          <div className="flex-1" />
          <button className="px-4 py-1.5 rounded-lg border text-[11px] font-semibold hover:bg-accent">Save Draft</button>
          <button onClick={() => navigate("/crm-demo/confidence")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700">
            Continue to Next Step <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
