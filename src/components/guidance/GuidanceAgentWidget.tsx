// Floating guidance-agent launcher + slide-in panel. Visually modeled on
// src/runops/shell/AskNovaPanel.tsx's AnswerCard, but decoupled from
// RunOps-only useOperations() state — this renders on every authenticated
// page (see AppShell.tsx), not just /runops.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Send, X, ExternalLink, Loader2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGuidanceAgent } from "./GuidanceAgentProvider";
import type { GuidanceAnswer } from "./guidanceAgentClient";

const EXAMPLE_QUESTIONS = [
  "Where can I evaluate our cloud operations maturity?",
  "How do I invite a new user?",
  "Where do I find our security posture dashboard?",
];

export function GuidanceAgentWidget() {
  const { open, setOpen, toggle, turns, ask, clear } = useGuidanceAgent();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [turns.length, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    void ask(input);
    setInput("");
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Close guidance assistant" : "Open guidance assistant"}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

      <aside
        aria-label="Platform guidance assistant"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-full max-w-[420px] flex-col border-l border-border bg-background shadow-xl transition-transform",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">Ask NeuGAIN</div>
            <div className="text-[10.5px] text-muted-foreground">Find the right page, assessment, or workflow</div>
          </div>
          <button
            type="button"
            onClick={clear}
            className="rounded border border-border px-2 py-1 text-[10.5px] text-muted-foreground hover:bg-accent"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-accent"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {turns.length === 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Ask where to find a feature, assessment, or document. Try one:
              </p>
              <ul className="space-y-1.5">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => void ask(q)}
                      className="w-full rounded border border-border bg-accent/40 px-2.5 py-1.5 text-left text-xs text-foreground hover:bg-accent"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {turns.map((t) => (
            <div key={t.id} className="space-y-2">
              <div className="rounded-lg bg-foreground px-3 py-2 text-xs text-background">{t.question}</div>
              {t.loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              )}
              {t.error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {t.error}
                </div>
              )}
              {t.answer && <AnswerCard answer={t.answer} onAsk={ask} />}
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="flex items-center gap-2 border-t border-border bg-background px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            aria-label="Ask a question"
            className="flex-1 rounded border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="grid h-8 w-8 place-items-center rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </aside>
    </>
  );
}

function AnswerCard({ answer, onAsk }: { answer: GuidanceAnswer; onAsk: (q: string) => void }) {
  const { escalate } = useGuidanceAgent();
  const [escalating, setEscalating] = useState(false);
  const [escalated, setEscalated] = useState(false);

  const conf =
    answer.confidence >= 70
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : answer.confidence >= 40
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-rose-50 text-rose-700 border-rose-200";

  const handleEscalate = async () => {
    if (!answer.interactionId || escalating || escalated) return;
    setEscalating(true);
    try {
      await escalate(answer.interactionId);
      setEscalated(true);
      toast.success("Escalated — our team will follow up.");
    } catch {
      toast.error("Couldn't escalate right now — please try again.");
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs text-foreground">
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", conf)}>
          {answer.confidence}% confidence
        </span>
      </div>
      <p>{answer.answer}</p>

      {answer.sources.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Go to</div>
          <ul className="mt-1 space-y-1">
            {answer.sources.map((s) => (
              <li key={s.catalogId}>
                <Link
                  to={s.route}
                  className="inline-flex items-center gap-1 rounded border border-border bg-accent/40 px-2 py-1 text-[11.5px] text-foreground hover:bg-accent"
                >
                  {s.label} <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {answer.followUps.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            You might also ask
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {answer.followUps.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onAsk(f)}
                className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent"
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {!escalated && (
        <button
          type="button"
          onClick={handleEscalate}
          disabled={escalating || !answer.interactionId}
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[11.5px] font-medium disabled:opacity-50",
            answer.escalate || answer.sources.length === 0
              ? "border border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
              : "text-muted-foreground underline decoration-dotted hover:text-foreground",
          )}
        >
          <Flag className="h-3 w-3" /> {escalating ? "Escalating…" : "Escalate to support"}
        </button>
      )}
      {escalated && <div className="mt-3 text-[11px] text-muted-foreground">Escalated — our team will follow up.</div>}
    </div>
  );
}
