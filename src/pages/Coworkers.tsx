import { useNavigate } from "react-router-dom";
import {
  Plus, ShieldCheck, ClipboardList, PlayCircle, AudioLines, Rocket,
  PieChart, Headphones, Share2, Gauge, FileText, ArrowRight, Sparkles, ServerCog, Scissors,
} from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "teal" | "violet" | "amber" | "blue" | "green" | "red" | "purple" | "cyan" | "orange" | "pink";

const toneMap: Record<Tone, { bg: string; text: string; ring: string; accent: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600", ring: "ring-emerald-500/20", accent: "text-emerald-700" },
  teal:    { bg: "bg-teal-500/10",    text: "text-teal-600",    ring: "ring-teal-500/20",    accent: "text-teal-700" },
  violet:  { bg: "bg-violet-500/10",  text: "text-violet-600",  ring: "ring-violet-500/20",  accent: "text-violet-700" },
  amber:   { bg: "bg-amber-500/10",   text: "text-amber-600",   ring: "ring-amber-500/20",   accent: "text-amber-700" },
  blue:    { bg: "bg-blue-500/10",    text: "text-blue-600",    ring: "ring-blue-500/20",    accent: "text-blue-700" },
  green:   { bg: "bg-green-600/10",   text: "text-green-700",   ring: "ring-green-600/20",   accent: "text-green-800" },
  red:     { bg: "bg-red-500/10",     text: "text-red-600",     ring: "ring-red-500/20",     accent: "text-red-700" },
  purple:  { bg: "bg-purple-500/10",  text: "text-purple-600",  ring: "ring-purple-500/20",  accent: "text-purple-700" },
  cyan:    { bg: "bg-cyan-500/10",    text: "text-cyan-600",    ring: "ring-cyan-500/20",    accent: "text-cyan-700" },
  orange:  { bg: "bg-orange-500/10",  text: "text-orange-600",  ring: "ring-orange-500/20",  accent: "text-orange-700" },
  pink:    { bg: "bg-pink-500/10",    text: "text-pink-600",    ring: "ring-pink-500/20",    accent: "text-pink-700" },
};

type Agent = {
  num: number;
  tone: Tone;
  icon: any;
  name: string;
  why: string;
  challenge: string;
  how: string;
  impact: string;
  deployed?: boolean;
};

const agents: Agent[] = [
  {
    num: 1, tone: "emerald", icon: ShieldCheck,
    name: "SLO/SLA/SLI Monitoring & Breach Prediction",
    why: "SRE success depends on proactively protecting SLOs.",
    challenge: "SLIs tracked but not interpreted, breaches discovered too late.",
    how: "Continuously monitors SLIs, forecasts SLO breaches, and triggers preventive actions.",
    impact: "Higher SLO adherence, fewer customer-impacting events.",
  },
  {
    num: 2, tone: "teal", icon: ClipboardList,
    name: "Automated Incident Triage & Priority Classification",
    why: "Rapid, accurate triage reduces MTTR.",
    challenge: "Manual triage is inconsistent, slow, and depends on SME availability.",
    how: "Classifies incident severity, correlates signals, identifies probable domains, and assigns teams.",
    impact: "Faster triage, reduced MTTR, more consistent prioritization.",
  },
  {
    num: 3, tone: "violet", icon: PlayCircle,
    name: "Runbook Execution & Auto-Mitigation for Common Failures",
    why: "Human-run runbooks are slow and error-prone.",
    challenge: "Steps skipped under pressure; tribal knowledge dominates.",
    how: "Executes validated runbooks, validates state, applies remediations, and updates tickets.",
    impact: "Consistent remediation, faster stabilization, predictable incident handling.",
  },
  {
    num: 4, tone: "amber", icon: AudioLines,
    name: "Golden Signal Regression Detection (Latency, Traffic, Errors, Saturation)",
    why: "Golden signals are the earliest outage indicators.",
    challenge: "Alert storms hide the real regression; correlation is manual.",
    how: "Identifies subtle deviations, correlates multi-source telemetry, and predicts impact.",
    impact: "Early failure detection, fewer major incidents.",
  },
  {
    num: 5, tone: "blue", icon: Rocket,
    name: "Release, Deployment, & Rollout Validation (Blue/Green, Canary)",
    why: "Bad deployments cause major outages.",
    challenge: "Manual validation is incomplete and varies by engineer.",
    how: "Checks health post-deployment, monitors error budgets, rolls forward/back, validates endpoints.",
    impact: "Safer releases, reduced rollback events, higher deployment confidence.",
  },
  {
    num: 6, tone: "green", icon: PieChart,
    name: "Error Budget Tracking, Burn Rate Analysis, & Guardrail Enforcement",
    why: "Burn rate reflects reliability risk.",
    challenge: "Burn rate is often reviewed too late, not tied to actions.",
    how: "Tracks burn rate hourly, auto-triggers freeze controls, alerts teams, gates high-risk changes.",
    impact: "Protected reliability, stronger governance, fewer SLO breaches.",
  },
  {
    num: 7, tone: "red", icon: Headphones,
    name: "On-Call Assistance & Noise Reduction",
    why: "On-call fatigue leads to burnout and delayed response.",
    challenge: "Too many alerts, poor correlation, unclear signal vs noise.",
    how: "Reduces noise, provides context, suggests likely cause, handles low-risk incidents autonomously.",
    impact: "Reduced on-call fatigue, better work-life balance, faster response.",
  },
  {
    num: 8, tone: "purple", icon: Share2,
    name: "Dependency Mapping & Cross-Service Failure Correlation",
    why: "Most incidents span services, not individual components.",
    challenge: "Manual dependency maps are outdated and inaccurate.",
    how: "Builds dynamic dependency maps using logs, traces, metrics, topology — updates continuously.",
    impact: "Faster RCA, fewer multi-team war rooms, improved service understanding.",
  },
  {
    num: 9, tone: "cyan", icon: Gauge,
    name: "Performance Bottleneck Identification & Auto-Tuning",
    why: "SREs must maintain performance across systems.",
    challenge: "Performance tuning is complex and tribal knowledge heavy.",
    how: "Detects bottlenecks, identifies high-latency calls, suggests infra/app tuning, executes low-risk optimizations.",
    impact: "Higher efficiency, smoother performance, reduced toil.",
  },
  {
    num: 10, tone: "orange", icon: FileText,
    name: "Post-Incident Analysis (PIA/PIR) Automation",
    why: "PIAs improve reliability but are time-consuming.",
    challenge: "Humans struggle to gather evidence; timelines incomplete.",
    how: "Compiles system metrics, logs, timeline events, root cause indicators, and drafts PIA templates.",
    impact: "Faster PIAs, consistent RCA quality, better learning and prevention.",
  },
  {
    num: 11, tone: "pink", icon: Sparkles,
    name: "Customer Experience Assurance Agent",
    why: "Customer satisfaction and revenue retention rely on seamless digital interactions across all business functions.",
    challenge: "Functional failures in specific user journeys often occur silently and go undetected by infrastructure-level monitoring until reported by customers.",
    how: "The agent continuously validates digital experiences by performing synthetic transactions that mimic critical user paths to proactively detect functional issues.",
    impact: "Proactive experience protection, higher user journey reliability, and reduced churn through early functional error resolution.",
    deployed: true,
  },
];

const Coworkers = () => {
  const nav = useNavigate();
  return (
    <AppShell>
      {/* Header — matches project pattern (bg-card with title + actions) */}
      <header className="bg-card border-b border-border">
        <div className="px-8 pt-5 pb-5 flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-tight">Digital Coworkers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              AI-powered teammates that observe, decide, and act — so SREs can focus on reliability, not repetitive work.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <Button
              onClick={() => nav("/neugain")}
              className="h-11 px-5 font-semibold bg-navy hover:bg-navy/90 text-white shadow-[var(--shadow-md)]"
            >
              <Sparkles className="h-4 w-4" /> RunOps NeuGAIN
            </Button>
            <Button
              onClick={() => nav("/coworkers/deploy")}
              className="bg-crimson hover:bg-crimson/90 text-crimson-foreground h-11 px-5 font-semibold shadow-[var(--shadow-md)]"
            >
              <Plus className="h-4 w-4" /> Deploy New Digital Coworker
            </Button>
          </div>
        </div>

        {/* Pillars strip — light variant matching project surfaces */}
        <div className="px-8 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { t: "Automate the Repetitive", d: "Free up SREs from toil." },
            { t: "Amplify Expertise", d: "Codify knowledge & best practices." },
            { t: "Improve Reliability", d: "Prevent issues, reduce MTTR." },
            { t: "Deliver Business Impact", d: "Happy users. Healthy systems." },
          ].map((p) => (
            <div key={p.t} className="rounded-xl bg-secondary/60 border border-border px-3.5 py-2.5">
              <div className="text-[11px] font-bold tracking-wide uppercase text-foreground">{p.t}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{p.d}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Sub-section hub */}
      <main className="flex-1 px-8 py-6 animate-fade-in">
        <div className="mb-5">
          <h2 className="text-[15px] font-bold tracking-tight">Coworker Categories</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Browse digital coworkers by engineering domain.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              title: "Site Reliability Engineering",
              desc: "11 specialized SRE coworkers for SLOs, incidents, runbooks, and reliability.",
              count: 11,
              to: "/coworkers/site-reliability-engineering",
              tone: "emerald" as Tone,
              icon: ShieldCheck,
            },
            {
              title: "Network & Connectivity Engineering",
              desc: "Agents for firewall, routing, anomaly detection, and network automation.",
              count: 12,
              to: "/coworkers/network-connectivity-engineering",
              tone: "blue" as Tone,
              icon: Share2,
            },
            {
              title: "Infrastructure Automation",
              desc: "Agents that provision, optimize, monitor, and remediate hybrid infrastructure 24x7.",
              count: 11,
              to: "/coworkers/infrastructure-automation",
              tone: "violet" as Tone,
              icon: ServerCog,
            },
            {
              title: "IT Carve-Out & Separation",
              desc: "Agents that accelerate divestiture, separation, and Day-1 readiness across infra, apps, data, and identity.",
              count: 11,
              to: "/coworkers/it-carve-out-and-separation",
              tone: "amber" as Tone,
              icon: Scissors,
            },
          ].map((s) => {
            const t = toneMap[s.tone];
            const Icon = s.icon;
            return (
              <button
                key={s.title}
                onClick={() => nav(s.to)}
                className="group bg-card rounded-xl border border-border p-6 shadow-[var(--shadow-sm)] card-hover text-left flex items-start gap-4"
              >
                <div className={cn("h-14 w-14 rounded-xl grid place-items-center shrink-0 ring-1", t.bg, t.text, t.ring)}>
                  <Icon className="h-7 w-7" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[16px] font-bold">{s.title}</h3>
                    <span className={cn("h-5 px-2 rounded-full text-[10px] font-bold grid place-items-center", t.bg, t.text)}>
                      {s.count} agents
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{s.desc}</p>
                  <div className="mt-3 text-xs font-semibold text-indigo inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Hidden legacy grid retained for reference - removed */}
        <div className="hidden">
          {agents.map((a) => {
            const t = toneMap[a.tone];
            return (
              <article
                key={a.num}
                className="group bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] card-hover flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className={cn("h-12 w-12 rounded-xl grid place-items-center shrink-0 ring-1", t.bg, t.text, t.ring)}>
                    <a.icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold grid place-items-center", t.bg, t.text)}>
                        {String(a.num).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                        SRE Agent
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold leading-snug mt-1.5">{a.name}</h3>
                  </div>
                </div>

                {/* Body */}
                <div className="mt-4 space-y-3 flex-1">
                  <Field label="Why It Matters" value={a.why} />
                  <Field label="The Challenge" value={a.challenge} />
                  <Field label="How the Agent Helps" value={a.how} />
                  <div className={cn("rounded-xl p-3 ring-1", t.bg, t.ring)}>
                    <div className={cn("text-[10px] font-bold tracking-wider uppercase mb-1", t.accent)}>
                      Business Impact
                    </div>
                    <div className={cn("text-xs font-semibold leading-snug", t.accent)}>{a.impact}</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                  {a.deployed ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-status-healthy">
                      <span className="h-1.5 w-1.5 rounded-full bg-status-healthy animate-pulse" />
                      Deployed
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                      Not deployed
                    </div>
                  )}
                  <button
                    onClick={() => nav(a.deployed ? "/assurance" : "/coworkers/deploy")}
                    className="text-xs font-semibold text-indigo inline-flex items-center gap-1 hover:gap-1.5 transition-all"
                  >
                    {a.deployed ? "Open Console" : "Deploy"} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-0.5">
        {label}
      </div>
      <p className="text-xs text-foreground/80 leading-snug">{value}</p>
    </div>
  );
}

export default Coworkers;
