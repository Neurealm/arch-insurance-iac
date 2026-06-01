import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Filter, Plus, Play, Calendar, ChevronRight, ShieldCheck, Info,
} from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { AssuranceHeader } from "@/components/assurance/AssuranceHeader";
import { applications, workflowsByApp, executionSteps } from "@/data/assurance";
import { cn } from "@/lib/utils";

const AssuranceCommand = () => {
  const nav = useNavigate();
  const [appId, setAppId] = useState("epic-mychart");
  const [wfId, setWfId] = useState("secure-message");

  const workflows = workflowsByApp[appId] ?? [];
  const selectedApp = applications.find((a) => a.id === appId)!;
  const selectedWf = workflows.find((w) => w.id === wfId);

  const steps = useMemo(() => (wfId === "secure-message" ? executionSteps : []), [wfId]);

  return (
    <AppShell>
      <AssuranceHeader
        title="Digital Coworker Command Center"
        subtitle="Select an application, workflow, and synthetic transaction to validate customer experience end-to-end."
        crumbs={[{ label: "Digital Coworkers" }, { label: "Customer Experience Assurance", current: true }]}
      />

      <main className="flex-1 px-8 py-6 animate-fade-in space-y-5">

        {/* 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Column 1 - Applications */}
          <section className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-1.5 mb-3">
              <h2 className="text-sm font-bold">1. Applications Library</h2>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-border bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-indigo/30" placeholder="Search applications..." />
              </div>
              <button className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-secondary">
                <Filter className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {applications.map((a) => {
                const selected = a.id === appId;
                return (
                  <button
                    key={a.id}
                    onClick={() => { setAppId(a.id); setWfId(a.id === "epic-mychart" ? "secure-message" : ""); }}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl p-2.5 border transition-all text-left",
                      selected ? "border-indigo bg-accent/60 ring-1 ring-indigo/30" : "border-border hover:bg-secondary/60",
                    )}
                  >
                    <div className={cn("h-5 w-5 rounded-full border-2 grid place-items-center shrink-0", selected ? "border-indigo bg-indigo" : "border-border")}>
                      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <div className={cn("h-9 w-12 rounded-md grid place-items-center shrink-0 text-[11px] font-extrabold", a.bg, a.text)}>
                      {a.monogram}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{a.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{a.sub}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-healthy-soft text-status-healthy">Active</span>
                  </button>
                );
              })}
            </div>
            <button className="mt-3 w-full text-xs font-semibold text-indigo flex items-center justify-center gap-1.5 py-2 hover:bg-accent/40 rounded-lg">
              <Plus className="h-3.5 w-3.5" /> Add Application
            </button>
          </section>

          {/* Column 2 - Workflows */}
          <section className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-1.5 mb-1">
              <h2 className="text-sm font-bold">2. Workflow Catalog</h2>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-xs font-semibold text-indigo mb-3">{selectedApp.name}</div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-border bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-indigo/30" placeholder="Search workflows..." />
            </div>
            <div className="space-y-2">
              {workflows.length === 0 && (
                <div className="text-xs text-muted-foreground py-8 text-center">No workflows configured for this application yet.</div>
              )}
              {workflows.map((w) => {
                const selected = w.id === wfId;
                return (
                  <button
                    key={w.id}
                    onClick={() => setWfId(w.id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl p-3 border transition-all text-left",
                      selected ? "border-indigo bg-accent/60 ring-1 ring-indigo/30" : "border-border hover:bg-secondary/60",
                    )}
                  >
                    <div className={cn("h-5 w-5 rounded-full border-2 grid place-items-center shrink-0", selected ? "border-indigo bg-indigo" : "border-border")}>
                      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{w.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{w.sub}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-healthy-soft text-status-healthy">Active</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
            <button className="mt-3 w-full text-xs font-semibold text-indigo flex items-center justify-center gap-1.5 py-2 hover:bg-accent/40 rounded-lg">
              <Plus className="h-3.5 w-3.5" /> Create New Workflow
            </button>
          </section>

          {/* Column 3 - Synthetic Transaction */}
          <section className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-1.5 mb-1">
              <h2 className="text-sm font-bold">3. Synthetic Transaction: {selectedWf?.name ?? "—"}</h2>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => nav("/assurance/workflow-detail")} className="text-xs font-semibold text-indigo hover:underline">
                End-to-end patient journey validation
              </button>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-foreground">{steps.length} Steps</span>
            </div>
            <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
              {steps.map((s) => (
                <div key={s.n} className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-secondary/40">
                  <span className="h-6 w-6 rounded-full border border-indigo text-indigo text-[11px] font-bold grid place-items-center shrink-0">{s.n}</span>
                  <s.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-xs font-semibold truncate">{s.name}</span>
                  <span className="text-[10px] text-muted-foreground">{s.type}</span>
                </div>
              ))}
              {steps.length === 0 && (
                <div className="text-xs text-muted-foreground py-8 text-center">Select a workflow to preview its steps.</div>
              )}
            </div>
            {steps.length > 0 && (
              <div className="mt-4 rounded-xl bg-accent/60 border border-indigo/20 p-3 flex gap-2.5">
                <ShieldCheck className="h-4 w-4 text-indigo shrink-0 mt-0.5" />
                <p className="text-[11px] leading-snug text-foreground/80">
                  Digital Coworker will securely execute each step using vaulted credentials and monitor performance at every point.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-4 flex items-center justify-center gap-3">
          <button
            onClick={() => nav("/assurance/execute")}
            disabled={steps.length === 0}
            className="h-12 px-7 rounded-xl bg-indigo hover:bg-indigo/90 text-white font-semibold inline-flex items-center gap-2 shadow-[var(--shadow-lg)] disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-white" /> Execute Synthetic Workflow
          </button>
          <button className="h-12 px-5 rounded-xl bg-card border border-border font-semibold inline-flex items-center gap-2 shadow-[var(--shadow-sm)] hover:bg-secondary">
            <Calendar className="h-4 w-4" /> Schedule Execution
          </button>
        </div>
      </main>
    </AppShell>
  );
};

export default AssuranceCommand;