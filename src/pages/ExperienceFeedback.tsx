import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, RotateCcw, Sparkles } from "lucide-react";

type Score = 1 | 2 | 3 | 4 | 5;

const SCORES: {
  value: Score;
  meaning: string;
  ring: string;
  active: string;
  glow: string;
  text: string;
}[] = [
  {
    value: 1,
    meaning: "Worst",
    ring: "hover:border-red-400/70 hover:bg-red-500/[0.06]",
    active: "border-red-500 bg-red-500/10",
    glow: "shadow-[0_18px_40px_-18px_hsl(0_80%_50%/0.55)]",
    text: "text-red-600",
  },
  {
    value: 2,
    meaning: "Poor",
    ring: "hover:border-orange-400/70 hover:bg-orange-500/[0.06]",
    active: "border-orange-500 bg-orange-500/10",
    glow: "shadow-[0_18px_40px_-18px_hsl(25_90%_50%/0.55)]",
    text: "text-orange-600",
  },
  {
    value: 3,
    meaning: "Okay",
    ring: "hover:border-amber-400/70 hover:bg-amber-500/[0.06]",
    active: "border-amber-500 bg-amber-500/10",
    glow: "shadow-[0_18px_40px_-18px_hsl(45_95%_50%/0.55)]",
    text: "text-amber-600",
  },
  {
    value: 4,
    meaning: "Good",
    ring: "hover:border-teal-400/70 hover:bg-teal-500/[0.06]",
    active: "border-teal-500 bg-teal-500/10",
    glow: "shadow-[0_18px_40px_-18px_hsl(174_70%_40%/0.55)]",
    text: "text-teal-600",
  },
  {
    value: 5,
    meaning: "Best",
    ring: "hover:border-emerald-400/70 hover:bg-emerald-500/[0.06]",
    active: "border-emerald-500 bg-emerald-500/10",
    glow: "shadow-[0_18px_40px_-18px_hsl(150_70%_40%/0.6)]",
    text: "text-emerald-600",
  },
];

const ACK: Record<Score, string> = {
  1: "Thank you for being candid. We clearly have work to do.",
  2: "Thank you. We appreciate the feedback and know we can do better.",
  3: "Thank you. We’re glad the experience is working, and we’ll keep improving it.",
  4: "Thank you. We’re glad you’re having a good experience.",
  5: "Thank you. We’re thrilled the platform is delivering a great experience.",
};

function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full bg-indigo/15 blur-3xl motion-safe:animate-[pulse_9s_ease-in-out_infinite]" />
      <div className="absolute -bottom-40 right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-teal-500/10 blur-3xl motion-safe:animate-[pulse_12s_ease-in-out_infinite]" />
      <div className="absolute left-1/2 top-1/3 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl motion-safe:animate-[pulse_11s_ease-in-out_infinite]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_35%,hsl(var(--background))_85%)]" />
    </div>
  );
}

export default function ExperienceFeedback() {
  const [score, setScore] = useState<Score | null>(null);
  const selected = score ? SCORES.find((s) => s.value === score)! : null;

  return (
    <AppShell>
      <div className="relative flex-1 overflow-hidden">
        <AmbientBackdrop />

        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-4xl flex-col items-center justify-center px-6 py-16">
          {!selected ? (
            <div className="w-full motion-safe:animate-fade-in text-center">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-indigo" />
                Experience pulse
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                How are we doing?
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
                Your feedback helps us make the experience better.
              </p>

              <p className="mt-10 text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
                How much do you like the platform?
              </p>

              <div
                role="radiogroup"
                aria-label="How much do you like the platform?"
                className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4"
              >
                {SCORES.map((s, i) => (
                  <button
                    key={s.value}
                    type="button"
                    role="radio"
                    aria-checked={false}
                    aria-label={`${s.value} — ${s.meaning}`}
                    onClick={() => setScore(s.value)}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className={cn(
                      "group relative flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card/80 px-4 py-7 backdrop-blur",
                      "transition-all duration-300 ease-out motion-safe:animate-fade-in",
                      "motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.03]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      s.ring,
                      "hover:shadow-lg",
                      s.value === 5 ? "sm:col-span-1 col-span-2" : "",
                    )}
                  >
                    <span
                      className={cn(
                        "text-4xl font-semibold tabular-nums transition-transform duration-300 motion-safe:group-hover:scale-110",
                        s.text,
                      )}
                    >
                      {s.value}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {s.meaning}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-x-6 bottom-3 h-px origin-center scale-x-0 bg-current opacity-40 transition-transform duration-300 group-hover:scale-x-100",
                        s.text,
                      )}
                    />
                  </button>
                ))}
              </div>

              <p className="mt-8 text-xs text-muted-foreground">
                One question. No comments needed. Your response stays on this page.
              </p>
            </div>
          ) : (
            <div
              className="w-full text-center motion-safe:animate-scale-in"
              role="status"
              aria-live="polite"
            >
              <div
                className={cn(
                  "mx-auto flex h-28 w-28 items-center justify-center rounded-3xl border bg-card/80 backdrop-blur",
                  selected.active,
                  selected.glow,
                )}
              >
                <span className={cn("text-5xl font-semibold tabular-nums", selected.text)}>
                  {selected.value}
                </span>
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                <Check className="h-3.5 w-3.5 text-status-healthy" />
                Rated {selected.value} — {selected.meaning}
              </div>

              <h2 className="mx-auto mt-8 max-w-2xl text-3xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl">
                {ACK[selected.value]}
              </h2>

              <Button
                variant="ghost"
                size="sm"
                className="mt-8 text-muted-foreground hover:text-foreground"
                onClick={() => setScore(null)}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                Change rating
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
