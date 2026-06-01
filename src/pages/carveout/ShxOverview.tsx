import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Workflow, LayoutDashboard, Target, Users, ShieldCheck,
  Briefcase, GraduationCap, UserCircle2, Clock, Search, UserCheck,
  ShieldAlert, ClipboardCheck, Network, BarChart3, CalendarCheck,
  AlertTriangle, FileCheck2, TrendingUp, UserSquare2, Headset, IdCard,
  RefreshCw, Building2, Crosshair, Bot, MonitorPlay, TimerReset, Lock,
  LineChart, CheckCircle2, ArrowDown
} from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";

const tag = "bg-secondary text-foreground border border-border";
const Pill = ({ label, color }: { label: string; color: string }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>{label}</span>
);

const Section = ({
  icon: Icon, title, accent, children,
}: { icon: any; title: string; accent: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className={`flex items-center gap-2 mb-3 ${accent}`}>
      <Icon className="h-4 w-4" />
      <h3 className="text-[13px] font-bold tracking-wide uppercase">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const Item = ({
  icon: Icon, title, body, accent,
}: { icon: any; title: string; body: React.ReactNode; accent: string }) => (
  <div className="flex gap-3">
    <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${accent}`}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <div className="text-[12.5px] font-bold leading-tight">{title}</div>
      <div className="text-[11.5px] text-muted-foreground leading-snug mt-0.5">{body}</div>
    </div>
  </div>
);

export default function ShxOverview() {
  const nav = useNavigate();
  return (
    <AppShell>
      <header className="bg-card border-b border-border">
        <div className="px-8 pt-5 pb-4 flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <button onClick={() => nav("/coworkers/it-carve-out-and-separation")} className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground mb-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to IT Carve-Out
            </button>
            <h1 className="text-[24px] font-bold tracking-tight text-foreground leading-tight">
              Security Hygiene & Exposure Reduction Coworker — <span className="text-slate-700">Overview</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              AI-powered guardian that continuously reduces risk, closes exposure, and ensures secure Day 1 operations.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <Button onClick={() => nav("/coworkers/it-carve-out-and-separation/shx/solution-design")} variant="outline" className="h-10 px-4 font-semibold">
              <Workflow className="h-4 w-4" /> Solution Design
            </Button>
            <Button onClick={() => nav("/coworkers/it-carve-out-and-separation/shx/operational-dashboard")} className="h-10 px-4 font-semibold bg-navy hover:bg-navy/90 text-white">
              <LayoutDashboard className="h-4 w-4" /> Operational Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 py-6 animate-fade-in space-y-5">
        {/* Hero */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
              <h2 className="text-[26px] font-extrabold tracking-tight text-navy">
                Security Hygiene & Exposure Reduction Coworker
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
                AI-powered guardian that continuously reduces risk, closes exposure, and ensures secure Day 1
                operations during separation and integration.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Pill label="Risk-Aware" color="border-blue-500/30 text-blue-700 bg-blue-500/5" />
                <Pill label="Continuous" color="border-emerald-500/30 text-emerald-700 bg-emerald-500/5" />
                <Pill label="Intelligent" color="border-violet-500/30 text-violet-700 bg-violet-500/5" />
                <Pill label="Automated" color="border-amber-500/30 text-amber-700 bg-amber-500/5" />
                <Pill label="Outcome Driven" color="border-lime-500/30 text-lime-700 bg-lime-500/5" />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 space-y-3">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-navy mt-0.5" />
                <div>
                  <div className="text-[12px] font-bold text-navy">Mission</div>
                  <div className="text-[11.5px] text-muted-foreground leading-snug">
                    Continuously identify, prioritize, and remediate security exposures created during separation
                    and integration—ensuring a secure, compliant, and resilient environment from Day 1 and beyond.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-navy mt-0.5" />
                <div>
                  <div className="text-[12px] font-bold text-navy">Reports To</div>
                  <div className="text-[11.5px] text-muted-foreground leading-snug">
                    CISO, Security Leadership, Separation Program Leadership
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-navy mt-0.5" />
                <div>
                  <div className="text-[12px] font-bold text-navy">Scope</div>
                  <div className="text-[11.5px] text-muted-foreground leading-snug">
                    Infrastructure & Operations · Security & Compliance · Separation & Integration Support · Risk Management
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {/* About column */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <blockquote className="text-[12.5px] italic text-foreground/80 border-l-2 border-navy pl-3">
              "I continuously find and fix what could put your business at risk—so you can move fast with confidence."
            </blockquote>
            <Item icon={Briefcase} accent="bg-blue-500/10 text-blue-600"
              title="Role"
              body="Security Hygiene & Exposure Reduction Digital Coworker" />
            <Item icon={GraduationCap} accent="bg-violet-500/10 text-violet-600"
              title="Expertise"
              body="Exposure management, identity hygiene, vulnerability & configuration management, threat intelligence, compliance automation." />
            <Item icon={UserCircle2} accent="bg-emerald-500/10 text-emerald-600"
              title="Personality"
              body="Vigilant, precise, proactive, trustworthy, and relentless about reducing risk." />
            <Item icon={Clock} accent="bg-amber-500/10 text-amber-600"
              title="Availability"
              body="24/7/365 monitoring and response across environments and time zones." />
            <div className="rounded-lg bg-secondary/60 border border-border p-3">
              <div className="text-[12px] font-bold mb-1">At a Glance</div>
              <div className="text-[11.5px] text-muted-foreground leading-snug">
                I find exposures, prioritize what matters most, and drive remediation at scale across your
                environment—ensuring secure Day 1 readiness and reducing risk throughout the separation journey.
              </div>
            </div>
          </div>

          {/* WHAT I DO */}
          <Section icon={Crosshair} title="What I Do" accent="text-blue-600">
            <Item icon={Search} accent="bg-blue-500/10 text-blue-600"
              title="Continuous Exposure Discovery"
              body={<>Continuously monitor on-prem, cloud, endpoints, identities, and apps. Detect misconfigurations, open ports, weak policies, and unused assets.</>} />
            <Item icon={UserCheck} accent="bg-blue-500/10 text-blue-600"
              title="Identity & Access Hygiene"
              body="Identify orphaned accounts and excessive privileged access. Enforce least privilege and access recertifications." />
            <Item icon={ShieldAlert} accent="bg-blue-500/10 text-blue-600"
              title="Vulnerability & Patch Management"
              body="Prioritize vulnerabilities by exploitability and business impact. Orchestrate patching and validate remediation." />
            <Item icon={ClipboardCheck} accent="bg-blue-500/10 text-blue-600"
              title="Configuration & Policy Compliance"
              body="Ensure secure configurations for OS, cloud, network, and applications. Align to CIS benchmarks and regulatory requirements." />
            <Item icon={Network} accent="bg-blue-500/10 text-blue-600"
              title="Threat & Risk Correlation"
              body="Correlate exposures with threat intel, asset criticality, and business context. Quantify risk and predict potential attack paths." />
            <Item icon={BarChart3} accent="bg-blue-500/10 text-blue-600"
              title="Continuous Monitoring & Validation"
              body="Validate that risks are remediated and do not reappear. Provide audit-ready evidence and compliance reports." />
          </Section>

          {/* WHY IT MATTERS */}
          <Section icon={Crosshair} title="Why It Matters" accent="text-violet-600">
            <Item icon={ShieldCheck} accent="bg-violet-500/10 text-violet-600"
              title="Reduce Risk During Transition"
              body="Eliminate exposures introduced by change before they can be exploited." />
            <Item icon={CalendarCheck} accent="bg-violet-500/10 text-violet-600"
              title="Protect Day 1 Readiness"
              body="Ensure new environments, users, and applications are secure and compliant from Day 1." />
            <Item icon={AlertTriangle} accent="bg-violet-500/10 text-violet-600"
              title="Prevent Breaches & Disruption"
              body="Close security gaps that could lead to breaches, downtime, or data loss." />
            <Item icon={FileCheck2} accent="bg-violet-500/10 text-violet-600"
              title="Ensure Compliance"
              body="Maintain continuous compliance with internal policies and external regulations." />
            <Item icon={TrendingUp} accent="bg-violet-500/10 text-violet-600"
              title="Improve Efficiency & Confidence"
              body="Automate detection and remediation to reduce manual effort and audit findings." />
            <Item icon={UserSquare2} accent="bg-violet-500/10 text-violet-600"
              title="Provide Executive Assurance"
              body="Deliver real-time risk visibility and actionable insights for confident decisions." />
          </Section>

          {/* WHO I WORK WITH */}
          <Section icon={Users} title="Who I Work With" accent="text-emerald-600">
            <Item icon={ShieldCheck} accent="bg-emerald-500/10 text-emerald-600"
              title="Security Leadership"
              body="CISO, Security Architects, GRC teams." />
            <Item icon={Headset} accent="bg-emerald-500/10 text-emerald-600"
              title="IT Operations"
              body="Infrastructure, Network, Cloud, Endpoint, Applications, and Service Desk teams." />
            <Item icon={IdCard} accent="bg-emerald-500/10 text-emerald-600"
              title="Identity & Access Teams"
              body="IAM administrators and access governance analysts." />
            <Item icon={ShieldAlert} accent="bg-emerald-500/10 text-emerald-600"
              title="Vulnerability & Compliance Teams"
              body="Vulnerability managers and compliance analysts." />
            <Item icon={RefreshCw} accent="bg-emerald-500/10 text-emerald-600"
              title="Change & Release Teams"
              body="Ensure security controls in change and release processes." />
            <Item icon={UserSquare2} accent="bg-emerald-500/10 text-emerald-600"
              title="Business Stakeholders"
              body="Provide risk context and assurance for business decisions." />
            <Item icon={Building2} accent="bg-emerald-500/10 text-emerald-600"
              title="Auditors & Regulators"
              body="Deliver evidence and reports for audits and regulatory reviews." />
          </Section>

          {/* HOW I DELIVER VALUE */}
          <Section icon={Crosshair} title="How I Deliver Value" accent="text-amber-600">
            <Item icon={Target} accent="bg-amber-500/10 text-amber-600"
              title="Prioritize What Matters"
              body="Focus on exposures with the highest risk and business impact." />
            <Item icon={Bot} accent="bg-amber-500/10 text-amber-600"
              title="Automate Detection & Remediation"
              body="AI-driven workflows trigger fixes and reductions at scale." />
            <Item icon={MonitorPlay} accent="bg-amber-500/10 text-amber-600"
              title="Real-Time Risk Visibility"
              body="Live dashboards show exposure, trends, and risk posture." />
            <Item icon={TimerReset} accent="bg-amber-500/10 text-amber-600"
              title="Reduce Mean Time to Remediate"
              body="Automate workflows to close risks faster and prevent recurrence." />
            <Item icon={Lock} accent="bg-amber-500/10 text-amber-600"
              title="Enforce Security by Design"
              body="Embed security policies and guardrails into CI/CD and provisioning." />
            <Item icon={LineChart} accent="bg-amber-500/10 text-amber-600"
              title="Measure & Improve Continuously"
              body="Track KPIs, measure risk reduction, and drive continuous improvement." />
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
              <div className="text-[12px] font-bold mb-1 text-amber-700">Key Data Sources I Use</div>
              <div className="text-[11.5px] text-foreground/80 leading-snug">
                ServiceNow, Intune, SCCM, Defender, Qualys, Tenable, Cloud Security Tools (AWS, Azure, GCP),
                Firewalls, AD/Entra ID, SIEM (Microsoft Sentinel, Splunk), ITSM, CMDB, Vulnerability Feeds,
                Compliance Tools.
              </div>
            </div>
          </Section>
        </div>

        {/* Outcomes strip */}
        <div className="rounded-xl bg-navy text-white p-5 grid grid-cols-2 md:grid-cols-7 gap-4 items-center">
          <div className="flex items-center gap-3 col-span-2 md:col-span-1">
            <Target className="h-8 w-8" />
            <div className="text-[15px] font-bold leading-tight">Outcomes<br/>You Can Expect</div>
          </div>
          {[
            { v: "30–60%", l: "Fewer High-Risk Exposures", s: "Reduce attack surface and security vulnerabilities." },
            { v: "50–70%", l: "Faster Remediation", s: "Reduce mean time to remediate risks and misconfigurations." },
            { v: "40–60%", l: "Lower Security Incidents", s: "Prevent breaches and security incidents during transition." },
            { v: "90%+",   l: "Compliance Coverage",     s: "Maintain continuous compliance and audit readiness." },
            { v: "100%",   l: "Day 1 Security Readiness", s: "Environments, users, and apps secure and ready on Day 1." },
          ].map((o) => (
            <div key={o.l} className="text-center">
              <div className="text-[22px] font-extrabold flex items-center justify-center gap-1">
                {o.v}
                {o.v.includes("%+") || o.v === "100%" ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <ArrowDown className="h-4 w-4 text-emerald-300" />}
              </div>
              <div className="text-[11.5px] font-semibold mt-0.5">{o.l}</div>
              <div className="text-[10.5px] text-white/70 leading-snug mt-0.5">{o.s}</div>
            </div>
          ))}
          <div className="col-span-2 md:col-span-1 text-right text-[11.5px] text-white/80 leading-snug">
            <div className="font-bold text-white">Secure today. Confident tomorrow.</div>
            I protect what matters most, reduce risk continuously, and give your teams the confidence to move forward—securely.
          </div>
        </div>

        {/* Capabilities */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[13px] font-bold tracking-wide uppercase text-navy mb-3">Security Capabilities Covered</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-[11.5px]">
            {[
              "Exposure Management","Identity & Access Hygiene","Vulnerability Management",
              "Patch & Configuration Compliance","Risk Prioritization","Reporting & Governance",
              "Automated Remediation","Continuous Monitoring","Compliance & Audit Support",
            ].map((c) => (
              <div key={c} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tag}`}>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
