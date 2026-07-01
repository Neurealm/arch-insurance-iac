import { useNavigate } from "react-router-dom";
import { Edit3, Play, ShieldCheck, Info, Clock, Target, AlertTriangle, ShieldAlert, ShieldCheck as ShieldOk, TrendingUp, BarChart3, Sparkles } from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { AssuranceHeader } from "@/components/assurance/AssuranceHeader";
import { workflowSteps14, baseline, stepSnapshot, goals, riskSignals } from "@/data/assurance";
import { cn } from "@/lib/utils";

const typeBadge: Record<string, string> = {
  "Web Navigation":  "bg-blue-50 text-blue-700",
  "Page Load":       "bg-violet-50 text-violet-700",
  "Data Entry":      "bg-amber-50 text-amber-700",
  "Auth Check":      "bg-emerald-50 text-emerald-700",
  "Menu Navigation": "bg-slate-100 text-slate-700",
  "Action":          "bg-pink-50 text-pink-700",
  "Validation":      "bg-teal-50 text-teal-700",
};

const levelTone: Record<"Low" | "Medium" | "High", { bg: string; text: string; icon: any }> = {
  Low:    { bg: "bg-status-healthy-soft",  text: "text-status-healthy",  icon: ShieldOk },
  Medium: { bg: "bg-status-warning-soft",  text: "text-status-warning",  icon: AlertTriangle },
  High:   { bg: "bg-status-critical-soft", text: "text-status-critical", icon: ShieldAlert },
};

const WorkflowDetail = () => {
  const nav = useNavigate();
  return (
    <AppShell>
      <AssuranceHeader
        title="Workflow Configuration & Baseline"
        subtitle="Review the patient journey workflow, baseline performance, and success goals."
        crumbs={[
          { label: "Digital Coworkers" },
          { label: "Customer Experience Assurance" },
          { label: "Workflows" },
          { label: "Epic MyChart" },
          { label: "Secure Message to Provider", current: true },
        ]}
        actions={
          <div className="flex gap-2">
            <button className="h-11 px-4 rounded-xl border border-border bg-card font-semibold text-sm inline-flex items-center gap-2 hover:bg-secondary transition">
              <Edit3 className="h-4 w-4" /> Edit Workflow
            </button>
            <button onClick={() => nav("/assurance/execute")} className="h-11 px-4 rounded-xl bg-indigo hover:bg-indigo/90 text-white font-semibold text-sm inline-flex items-center gap-2 transition">
              <Play className="h-4 w-4 fill-white" /> Execute Workflow
            </button>
          </div>
        }
      />

      <main className="flex-1 px-8 py-6 animate-fade-in space-y-5">

        {/* Identity strip */}
        <div className="bg-card border border-border rounded-xl p-5 grid grid-cols-1 md:grid-cols-[auto_minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] gap-5 items-center shadow-[var(--shadow-sm)]">
          <div className="h-12 w-20 rounded-md bg-red-600 grid place-items-center text-white font-extrabold text-base tracking-wider">Epic</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base">Epic MyChart</span>
              <span className="text-xs text-muted-foreground">Patient Portal</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-healthy-soft text-status-healthy">Active</span>
            </div>
            <div className="text-xs mt-1"><span className="font-semibold">Workflow:</span> Secure Message to Provider</div>
            <div className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Purpose:</span> Validate end-to-end patient ability to send a secure message</div>
          </div>
          <KV label="Workflow ID" value="MYCHART-SM-001" />
          <KV label="Last Modified" value="May 10, 2026 10:15 AM" />
          <KV label="Created By" value="Digital Coworker" />
          <KV label="Synthetic Identity" value="PATIENT_SYN_01" badge />
        </div>

        {/* 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Workflow steps */}
          <section className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)]">
            <h2 className="text-sm font-bold mb-1">1. Workflow Steps</h2>
            <p className="text-[11px] text-muted-foreground mb-3">End-to-end patient journey (14 steps)</p>
            <ol className="space-y-1.5">
              {workflowSteps14.map((s) => (
                <li key={s.n} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/40">
                  <span className="h-6 w-6 rounded-full border border-indigo text-indigo text-[11px] font-bold grid place-items-center shrink-0">{s.n}</span>
                  <span className="flex-1 text-xs font-semibold truncate">{s.name}</span>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", typeBadge[s.type] ?? "bg-secondary text-foreground")}>{s.type}</span>
                </li>
              ))}
            </ol>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs">
              <span className="text-muted-foreground">Total Steps: <span className="font-bold text-foreground">14</span></span>
              <button className="font-semibold text-indigo hover:underline">View Step Details</button>
            </div>
          </section>

          {/* Baseline */}
          <section className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)]">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">2. Baseline Performance (Last 30 Days) <Info className="h-3.5 w-3.5 text-muted-foreground" /></h2>
            <div className="rounded-xl border border-border p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Performance Summary</div>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Real User Avg Journey Time" value={`${baseline.realAvg}`} unit="sec" sub={`P95: ${baseline.realP95} sec`} icon={<Clock className="h-3.5 w-3.5" />} />
                <Stat label="Real User Success Rate" value={`${baseline.realSuccess}%`} sub={`Failed: ${baseline.realFailed}%`} icon={<Target className="h-3.5 w-3.5 text-status-healthy" />} />
                <Stat label="Synthetic Baseline Avg" value={`${baseline.synthAvg}`} unit="sec" sub={`P95: ${baseline.synthP95} sec`} icon={<Sparkles className="h-3.5 w-3.5 text-indigo" />} />
                <Stat label="Synthetic Success Rate" value={`${baseline.synthSuccess}%`} sub={`Failed: ${baseline.synthFailed}%`} icon={<ShieldCheck className="h-3.5 w-3.5 text-status-healthy" />} />
              </div>
            </div>
            <div className="rounded-xl border border-border p-3 mt-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Step Performance Snapshot <span className="font-normal normal-case">(Avg Time)</span></div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground text-[10px] uppercase tracking-wider">
                    <th className="text-left font-semibold pb-1.5">Step Group</th>
                    <th className="text-right font-semibold pb-1.5">Real (s)</th>
                    <th className="text-right font-semibold pb-1.5">Synth (s)</th>
                    <th className="text-right font-semibold pb-1.5">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {stepSnapshot.map((r) => (
                    <tr key={r.group} className="border-t border-border">
                      <td className="py-1.5 font-semibold">{r.group}</td>
                      <td className="py-1.5 text-right">{r.real}</td>
                      <td className="py-1.5 text-right">{r.synth}</td>
                      <td className="py-1.5 text-right text-status-healthy font-semibold">{r.variance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="mt-3 text-xs font-semibold text-indigo inline-flex items-center gap-1.5 hover:underline">
              <BarChart3 className="h-3.5 w-3.5" /> View 30-Day Trend
            </button>
          </section>

          {/* Goals + Risks */}
          <section className="space-y-5">
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)]">
              <h2 className="text-sm font-bold mb-3">3. Goals & Thresholds</h2>
              <ul className="space-y-2.5">
                {goals.map((g) => (
                  <li key={g.label} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-foreground/85">
                      <Target className="h-3.5 w-3.5 text-muted-foreground" /> {g.label}
                    </span>
                    <span className={cn("font-bold", g.tone === "healthy" ? "text-status-healthy" : "text-foreground")}>{g.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)]">
              <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">4. Risk & Quality Signals <Info className="h-3.5 w-3.5 text-muted-foreground" /></h2>
              <ul className="space-y-2">
                {riskSignals.map((r) => {
                  const t = levelTone[r.level];
                  return (
                    <li key={r.text} className="flex items-center gap-3 text-xs">
                      <t.icon className={cn("h-4 w-4 shrink-0", t.text)} />
                      <span className="flex-1 text-foreground/85">{r.text}</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", t.bg, t.text)}>{r.level}</span>
                    </li>
                  );
                })}
              </ul>
              <button className="mt-3 text-xs font-semibold text-indigo inline-flex items-center gap-1.5 hover:underline">
                <TrendingUp className="h-3.5 w-3.5" /> View Historical Issues
              </button>
            </div>
          </section>
        </div>

        {/* Advantage banner */}
        <div className="bg-gradient-to-r from-accent via-accent/60 to-card border border-indigo/20 rounded-xl p-5 grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto_auto] gap-6 items-center shadow-[var(--shadow-sm)]">
          <div className="h-12 w-12 rounded-xl bg-indigo/10 grid place-items-center">
            <Sparkles className="h-6 w-6 text-indigo" />
          </div>
          <div>
            <div className="font-bold">Digital Coworker Advantage</div>
            <p className="text-xs text-muted-foreground mt-0.5">Synthetic execution removes user variability and provides consistent, repeatable measurements to detect issues before patients are impacted.</p>
          </div>
          <Bullet kpi="38%" label="Faster than real users" sub="(Avg Journey Time)" />
          <Bullet kpi="99.2%" label="Synthetic Success Rate" sub="(vs 91.8% real users)" />
          <Bullet kpi="24/7" label="Proactive Monitoring" sub="Every 15 minutes" />
        </div>
      </main>
    </AppShell>
  );
};

function KV({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-bold mt-0.5 truncate flex items-center gap-1.5">
        {value}
        {badge && <ShieldCheck className="h-3.5 w-3.5 text-status-healthy" />}
      </div>
    </div>
  );
}

function Stat({ label, value, unit, sub, icon }: { label: string; value: string; unit?: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-secondary/40 p-3">
      <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        {unit && <span className="text-xs text-muted-foreground font-semibold">{unit}</span>}
      </div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function Bullet({ kpi, label, sub }: { kpi: string; label: string; sub: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-indigo">{kpi}</div>
      <div className="text-[11px] font-semibold">{label}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

export default WorkflowDetail;