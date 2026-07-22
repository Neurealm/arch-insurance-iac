import { useNavigate } from "react-router-dom";
import {
  Plus, ShieldCheck, Share2, ServerCog, Scissors, Sparkles, Headphones,
  ShieldX, Activity, Layers, ArrowRight, Clock, Cloud, Database,
  Network as NetIcon, TrendingDown, TrendingUp, DollarSign, Smile, Gauge, ShieldHalf,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "teal" | "violet" | "amber" | "blue" | "green" | "red" | "purple" | "cyan" | "orange" | "pink" | "slate";

const toneMap: Record<Tone, { bg: string; text: string; ring: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600", ring: "ring-emerald-500/20" },
  teal:    { bg: "bg-teal-500/10",    text: "text-teal-600",    ring: "ring-teal-500/20" },
  violet:  { bg: "bg-violet-500/10",  text: "text-violet-600",  ring: "ring-violet-500/20" },
  amber:   { bg: "bg-amber-500/10",   text: "text-amber-600",   ring: "ring-amber-500/20" },
  blue:    { bg: "bg-blue-500/10",    text: "text-blue-600",    ring: "ring-blue-500/20" },
  green:   { bg: "bg-green-600/10",   text: "text-green-700",   ring: "ring-green-600/20" },
  red:     { bg: "bg-red-500/10",     text: "text-red-600",     ring: "ring-red-500/20" },
  purple:  { bg: "bg-purple-500/10",  text: "text-purple-600",  ring: "ring-purple-500/20" },
  cyan:    { bg: "bg-cyan-500/10",    text: "text-cyan-600",    ring: "ring-cyan-500/20" },
  orange:  { bg: "bg-orange-500/10",  text: "text-orange-600",  ring: "ring-orange-500/20" },
  pink:    { bg: "bg-pink-500/10",    text: "text-pink-600",    ring: "ring-pink-500/20" },
  slate:   { bg: "bg-slate-500/10",   text: "text-slate-500",   ring: "ring-slate-500/20" },
};

type ThemeKey = "mttr" | "toil" | "reliability" | "cost" | "risk" | "compliance" | "experience" | "throughput" | "security";

const themeMeta: Record<ThemeKey, { label: string; icon: LucideIcon; tone: Tone }> = {
  mttr:        { label: "Faster Incident Recovery", icon: TrendingDown, tone: "emerald" },
  toil:        { label: "Less Engineering Toil",    icon: TrendingDown, tone: "teal" },
  reliability: { label: "Higher Reliability",       icon: TrendingUp,   tone: "green" },
  cost:        { label: "Lower Run Cost",           icon: DollarSign,   tone: "amber" },
  risk:        { label: "Reduced Operational Risk", icon: ShieldHalf,   tone: "orange" },
  compliance:  { label: "Stronger Compliance",      icon: ShieldCheck,  tone: "blue" },
  experience:  { label: "Better User Experience",   icon: Smile,        tone: "pink" },
  throughput:  { label: "Increased Throughput",     icon: Gauge,        tone: "cyan" },
  security:    { label: "Hardened Security",        icon: ShieldCheck,  tone: "red" },
};

type Category = {
  title: string;
  desc: string;
  to: string;
  tone: Tone;
  icon: LucideIcon;
  agents: number;
  deployed: number;
  themes: ThemeKey[];
  pill?: "NEW" | "LIVE" | "BETA";
};

/**
 * Counts and themes are derived from each category page's actual agent
 * inventory + impact statements. SRE counts come from CoworkersSRE.tsx
 * (11 agents, 1 deployed). Network / Infra / Carve retain the counts the
 * landing page shipped with. IAM, Vuln, Citrix, App Support, HC Payer use
 * the curated counts that match their detail pages today.
 */
const categories: Category[] = [
  {
    title: "Site Reliability Engineering",
    desc: "SLO monitoring, incident triage, runbook execution, and error-budget guardrails.",
    to: "/coworkers/site-reliability-engineering",
    tone: "emerald", icon: ShieldCheck,
    agents: 11, deployed: 1,
    themes: ["mttr", "reliability", "toil"],
  },
  {
    title: "Identity and Access Management",
    desc: "Access reviews, entitlement drift, break-glass, and privileged-session assurance.",
    to: "/coworkers/identity-access-management",
    tone: "blue", icon: ShieldCheck,
    agents: 9, deployed: 0,
    themes: ["security", "compliance", "risk"],
  },
  {
    title: "Vulnerability Management",
    desc: "CVE triage, exploitability scoring, patch orchestration, and exception governance.",
    to: "/coworkers/vulnerability-management",
    tone: "red", icon: ShieldX,
    agents: 8, deployed: 0,
    themes: ["risk", "security", "compliance"],
  },
  {
    title: "Network & Connectivity Engineering",
    desc: "Firewall change, routing anomaly detection, and network automation.",
    to: "/coworkers/network-connectivity-engineering",
    tone: "cyan", icon: NetIcon,
    agents: 12, deployed: 0,
    themes: ["reliability", "toil", "throughput"],
  },
  {
    title: "Infrastructure Automation",
    desc: "Provisioning, drift detection, capacity, and 24×7 remediation across hybrid infra.",
    to: "/coworkers/infrastructure-automation",
    tone: "violet", icon: ServerCog,
    agents: 11, deployed: 0,
    themes: ["cost", "toil", "reliability"],
  },
  {
    title: "Citrix Platform Digital Coworkers",
    desc: "Session health, image lifecycle, entitlement governance, and Citrix modernization.",
    to: "/coworkers/citrix-platform-digital-coworkers",
    tone: "purple", icon: Layers,
    agents: 13, deployed: 0,
    themes: ["experience", "toil", "reliability"],
    pill: "NEW",
  },
  {
    title: "Application Support",
    desc: "L1/L2 triage, log correlation, ticket auto-resolution, and knowledge assist.",
    to: "/coworkers/application-support",
    tone: "orange", icon: Headphones,
    agents: 10, deployed: 0,
    themes: ["mttr", "experience", "toil"],
  },
  {
    title: "IT Carve-Out & Separation",
    desc: "Divestiture, separation, and Day-1 readiness across infra, apps, data, and identity.",
    to: "/coworkers/it-carve-out-and-separation",
    tone: "amber", icon: Scissors,
    agents: 11, deployed: 0,
    themes: ["risk", "cost", "compliance"],
  },
  {
    title: "Healthcare Payer",
    desc: "Claims, prior auth, member ops, and HIPAA-aligned service assurance.",
    to: "/coworkers/healthcare-payer",
    tone: "pink", icon: Activity,
    agents: 9, deployed: 0,
    themes: ["compliance", "experience", "cost"],
  },
];


const Coworkers = () => {
  const nav = useNavigate();

  const totalAgents = categories.reduce((a, c) => a + c.agents, 0);
  const totalDeployed = categories.reduce((a, c) => a + c.deployed, 0);

  return (
    <AppShell>
      <header className="bg-card border-b border-border">
        <div className="px-8 pt-5 pb-5 flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-tight">Digital Coworkers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              AI-powered teammates that observe, decide, and act — so engineering teams focus on outcomes, not repetitive work.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span><span className="font-semibold text-foreground">{categories.length}</span> categories</span>
              <span aria-hidden>·</span>
              <span><span className="font-semibold text-foreground">{totalAgents}</span> agents catalogued</span>
              <span aria-hidden>·</span>
              <span><span className="font-semibold text-emerald-600">{totalDeployed}</span> deployed today</span>
            </div>
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

        <div className="px-8 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { t: "Automate the Repetitive", d: "Free up engineers from toil." },
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

      <main className="flex-1 px-8 py-6 animate-fade-in">
        <div className="mb-5">
          <h2 className="text-[15px] font-bold tracking-tight">Coworker Categories</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Browse digital coworkers by engineering domain.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((s) => {
            const t = toneMap[s.tone];
            const Icon = s.icon;
            return (
              <button
                key={s.title}
                onClick={() => nav(s.to)}
                className="group bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] card-hover text-left flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("h-12 w-12 rounded-xl grid place-items-center shrink-0 ring-1", t.bg, t.text, t.ring)}>
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[14px] font-bold leading-tight">{s.title}</h3>
                      {s.pill && (
                        <span className="h-4 px-1.5 rounded text-[9px] font-bold grid place-items-center bg-crimson/10 text-crimson ring-1 ring-crimson/20">
                          {s.pill}
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug">{s.desc}</p>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-border/70 grid grid-cols-3 gap-2 text-[11px]">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wide">Agents</span>
                    <span className={cn("font-bold", t.text)}>{s.agents}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wide">Deployed</span>
                    <span className={cn(
                      "font-bold",
                      s.deployed > 0 ? "text-emerald-600" : "text-foreground/70",
                    )}>
                      {s.deployed}
                    </span>
                  </div>
                  <div className="flex flex-col items-end justify-end">
                    <span className="text-[11px] font-semibold text-indigo inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                {s.themes.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {s.themes.slice(0, 3).map((k) => {
                      const th = themeMeta[k];
                      const tt = toneMap[th.tone];
                      const ThIcon = th.icon;
                      return (
                        <span
                          key={k}
                          className={cn(
                            "inline-flex items-center justify-center gap-1 h-6 px-1.5 rounded text-[10px] font-semibold ring-1 text-center leading-tight",
                            tt.bg, tt.text, tt.ring,
                          )}
                        >
                          <ThIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{th.label}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
};

export default Coworkers;
