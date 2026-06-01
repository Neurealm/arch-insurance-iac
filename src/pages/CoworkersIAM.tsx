import { useNavigate } from "react-router-dom";
import { Plus, AudioWaveform, ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "blue" | "violet" | "amber";
const toneMap: Record<Tone, { bg: string; text: string; ring: string; accent: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600", ring: "ring-emerald-500/20", accent: "text-emerald-700" },
  blue:    { bg: "bg-blue-500/10",    text: "text-blue-600",    ring: "ring-blue-500/20",    accent: "text-blue-700"    },
  violet:  { bg: "bg-violet-500/10",  text: "text-violet-600",  ring: "ring-violet-500/20",  accent: "text-violet-700"  },
  amber:   { bg: "bg-amber-500/10",   text: "text-amber-600",   ring: "ring-amber-500/20",   accent: "text-amber-700"   },
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
    num: 1, tone: "amber", icon: AudioWaveform,
    name: "Identity and Access Management",
    why: "Privileged accounts are the top breach and lateral-movement vector.",
    challenge: "Standing privilege and stale entitlements hide across IAM, PAM, and cloud directories.",
    how: "Continuously scores identity hygiene, revokes unused access, and enforces JIT least-privilege.",
    impact: "Smaller attack surface, faster reviews, provable zero-standing-privilege.",
  },
];

const CoworkersIAM = () => {
  const nav = useNavigate();
  return (
    <AppShell>
      <header className="bg-card border-b border-border">
        <div className="px-8 pt-5 pb-5 flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-tight">Digital Coworkers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Identity and Access Management — AI teammates that continuously protect identities, entitlements, and privileged access.
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

        <div className="px-8 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { t: "Reduce Standing Privilege", d: "Move toward zero standing access." },
            { t: "Continuous Hygiene", d: "Always-on identity posture monitoring." },
            { t: "Audit Ready", d: "Provable reviews & recertifications." },
            { t: "Stop Lateral Movement", d: "Close orphaned & risky accounts fast." },
          ].map((p) => (
            <div key={p.t} className="rounded-xl bg-secondary/60 border border-border px-3.5 py-2.5">
              <div className="text-[11px] font-bold tracking-wide uppercase text-foreground">{p.t}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{p.d}</div>
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 px-8 py-6 animate-fade-in">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-[15px] font-bold tracking-tight">Available Agents</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Specialized IAM coworkers ready to deploy.</p>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{agents.length}</span> agent · <span className="font-bold text-status-healthy">0</span> deployed
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {agents.map((a) => {
            const t = toneMap[a.tone];
            return (
              <article
                key={a.num}
                className="group bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] card-hover flex flex-col"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("h-12 w-12 rounded-xl grid place-items-center shrink-0 ring-1", t.bg, t.text, t.ring)}>
                    <a.icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[11px] font-bold", t.text)}>
                        {String(a.num).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                        IAM Agent
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold leading-snug mt-1.5">{a.name}</h3>
                  </div>
                </div>

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

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                    Not deployed
                  </div>
                  <button
                    onClick={() => nav("/coworkers/deploy?target=privileged-access")}
                    className="text-xs font-semibold text-indigo-600 inline-flex items-center gap-1 hover:gap-1.5 transition-all"
                  >
                    Deploy <ArrowRight className="h-3.5 w-3.5" />
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

export default CoworkersIAM;