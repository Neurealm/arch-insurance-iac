import { useState } from "react";
import { ShieldCheck, Zap, UserCheck, Eye, XCircle, CheckCircle2, Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const boundaries = [
  { id: "auto", title: "Execute Automatically", desc: "Actions executed without human approval.", actions: 18, icon: Zap, tone: "healthy" },
  { id: "rec", title: "Recommend with Approval", desc: "Requires human approval before execution.", actions: 27, icon: UserCheck, tone: "indigo", active: true },
  { id: "only", title: "Recommend Only", desc: "Provides recommendations; no execution.", actions: 14, icon: Eye, tone: "info" },
  { id: "no", title: "Not Allowed", desc: "Actions outside of permitted boundaries.", actions: 6, icon: XCircle, tone: "critical" },
];

const workflows = [
  { name: "Low Impact Changes", trig: "Low risk actions", appr: "Ops Lead +1" },
  { name: "Medium Impact Changes", trig: "Medium risk actions", appr: "Incident Manager +2" },
  { name: "High Impact Changes", trig: "High risk actions", appr: "Operations Manager +1" },
  { name: "Security Sensitive Actions", trig: "Security-related actions", appr: "Security Officer +1" },
];

const compliance = [
  { id: "sox", name: "SOX Compliance", desc: "Financial controls and audit requirements.", status: "Enforced" },
  { id: "pci", name: "PCI DSS", desc: "Payment card industry data security.", status: "Enforced" },
  { id: "iso", name: "ISO 27001", desc: "Information security management.", status: "Enforced" },
  { id: "gdpr", name: "GDPR", desc: "Data privacy and protection.", status: "Monitor" },
  { id: "hipaa", name: "HIPAA", desc: "Healthcare data protection.", status: "Disabled" },
];

const toneMap: any = {
  healthy: "bg-status-healthy-soft text-status-healthy",
  indigo: "bg-accent text-indigo",
  info: "bg-status-info-soft text-status-info",
  critical: "bg-status-critical-soft text-status-critical",
};

export function Step4Governance() {
  const [thresholds, setThresholds] = useState({ impact: 70, risk: 60, change: 75, blast: 50, data: 60 });

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo/10 text-indigo grid place-items-center"><ShieldCheck className="h-5 w-5" /></div>
        <div>
          <h2 className="text-lg font-bold">Step 4: Governance & Guardrails</h2>
          <p className="text-sm text-muted-foreground">Define policies, approval workflows, and boundaries to ensure safe, compliant, and controlled automation.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 lg:col-span-4 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold">1. Autonomy & Action Boundaries</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Define what the digital coworker can recommend vs. execute.</p>
          <ul className="space-y-2">
            {boundaries.map((b) => (
              <li key={b.id} className={cn("flex items-center gap-3 p-3 rounded-xl border", b.active ? "border-indigo/40 bg-accent" : "border-border bg-card")}>
                <span className={cn("h-9 w-9 rounded-lg grid place-items-center", toneMap[b.tone])}><b.icon className="h-4 w-4" /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{b.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{b.desc}</div>
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">{b.actions} Actions</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="col-span-12 lg:col-span-4 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold">2. Approval Workflows</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Define approval chains based on impact, risk, and action type.</p>
          <div className="space-y-2">
            {workflows.map((w) => (
              <div key={w.name} className="p-3 rounded-xl border border-border">
                <div className="text-sm font-semibold">{w.name}</div>
                <div className="text-[11px] text-muted-foreground">{w.trig}</div>
                <div className="text-[11px] text-indigo font-semibold mt-1">Approvers: {w.appr}</div>
              </div>
            ))}
          </div>
          <button className="mt-3 text-xs font-semibold text-indigo inline-flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Create New Workflow
          </button>
        </section>

        <section className="col-span-12 lg:col-span-4 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold">3. Human-in-the-Loop Thresholds</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Set thresholds that determine when human approval is required.</p>
          {[
            { key: "impact", label: "Impact Score" },
            { key: "risk", label: "Risk Score" },
            { key: "change", label: "Change Risk" },
            { key: "blast", label: "Blast Radius" },
            { key: "data", label: "Data Sensitivity" },
          ].map(({ key, label }) => (
            <div key={key} className="mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold">{label}</span>
                <span className="text-muted-foreground font-mono">{(thresholds as any)[key]}/100</span>
              </div>
              <Slider
                value={[(thresholds as any)[key]]}
                onValueChange={(v) => setThresholds((p) => ({ ...p, [key]: v[0] }))}
                max={100}
                step={1}
              />
            </div>
          ))}
        </section>

        <section className="col-span-12 lg:col-span-4 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold">4. Compliance & Policy Controls</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Apply enterprise policies and compliance requirements.</p>
          <ul className="space-y-2">
            {compliance.map((c) => (
              <li key={c.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                <div className="min-w-0">
                  <div className="text-xs font-semibold">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{c.desc}</div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0",
                  c.status === "Enforced" && "bg-status-healthy-soft text-status-healthy",
                  c.status === "Monitor" && "bg-status-warning-soft text-status-warning",
                  c.status === "Disabled" && "bg-secondary text-muted-foreground",
                )}>{c.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="col-span-12 lg:col-span-4 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold">5. Access Control & Permissions</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Define who can manage, approve, and override actions.</p>
          <ul className="space-y-2 text-xs">
            {[
              ["Administrators","Full access to configure and override","5 Users"],
              ["Operators","Can approve and execute allowed actions","18 Users"],
              ["Auditors","Read-only access for audit and review","7 Users"],
              ["Viewers","Read-only access to dashboards and reports","24 Users"],
            ].map(([role, desc, count]) => (
              <li key={role} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                <div className="min-w-0">
                  <div className="font-semibold">{role}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{desc}</div>
                </div>
                <span className="text-[11px] font-bold text-indigo">{count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="col-span-12 lg:col-span-4 bg-gradient-to-br from-accent to-card border border-indigo/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-indigo" />
            <h3 className="text-sm font-bold">Governance Summary</h3>
          </div>
          <div className="text-xs text-muted-foreground mb-1">Overall Guardrail Posture</div>
          <div className="text-2xl font-bold text-status-healthy mb-3">Strong</div>
          <p className="text-xs text-muted-foreground mb-4">Your configuration meets best practices for safe autonomy.</p>
          <ul className="space-y-1.5 text-xs">
            {[
              ["Action boundaries defined","65 Actions"],
              ["Approval workflows configured","4 Workflows"],
              ["Thresholds configured","5 Categories"],
              ["Compliance policies applied","4 Enforced"],
              ["Audit logging enabled","All Systems"],
              ["Access controls configured","4 Roles"],
            ].map(([t, v]) => (
              <li key={t} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-status-healthy" />{t}</span>
                <span className="text-muted-foreground">{v}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}