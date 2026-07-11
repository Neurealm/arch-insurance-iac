// Persistent Ask NOVA side panel. Conversation state is held at context
// scope so it survives route changes. Deterministic answers via
// askNovaEngine — no hidden model reasoning exposed.

import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Send, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOperations } from "@/runops/state/RunOpsProviders";
import { askNova, novaExamples, type NovaAnswer } from "@/runops/nova/askNovaEngine";

interface Turn { id: string; question: string; answer: NovaAnswer }
interface Ctx {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  turns: Turn[];
  ask: (q: string) => void;
  clear: () => void;
}
const AskNovaContext = createContext<Ctx | null>(null);

export function AskNovaProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const ops = useOperations();
  const seq = useRef(0);

  // Clear conversation whenever the selected tenant changes so answers
  // grounded in a prior tenant's scenario are never left visible.
  useEffect(() => {
    setTurns([]);
    seq.current = 0;
  }, [ops.tenant.id]);

  const ask = useCallback((q: string) => {
    const clean = q.trim();
    if (!clean) return;
    seq.current += 1;
    const answer = askNova(clean, ops);
    setTurns((prev) => [...prev, { id: `T-${seq.current}`, question: clean, answer }]);
  }, [ops]);

  const clear = useCallback(() => setTurns([]), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const value = useMemo<Ctx>(() => ({ open, setOpen, toggle, turns, ask, clear }),
    [open, toggle, turns, ask, clear]);
  return <AskNovaContext.Provider value={value}>{children}</AskNovaContext.Provider>;
}

export function useAskNova(): Ctx {
  const c = useContext(AskNovaContext);
  if (!c) throw new Error("useAskNova must be used within AskNovaProvider");
  return c;
}

export function AskNovaPanel() {
  const { open, setOpen, turns, ask, clear } = useAskNova();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [turns.length, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(input);
    setInput("");
  };

  return (
    <aside
      aria-label="Ask NOVA"
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex w-full max-w-[440px] flex-col border-l border-slate-200 bg-white shadow-xl transition-transform",
        open ? "translate-x-0" : "translate-x-full",
      )}
    >
      <header className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
        <Sparkles className="h-4 w-4 text-violet-600" />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-slate-900">Ask NOVA</div>
          <div className="text-[10.5px] text-slate-500">Simulation · deterministic answers grounded in scenario data</div>
        </div>
        <button
          type="button" onClick={clear}
          className="rounded border border-slate-200 px-2 py-1 text-[10.5px] text-slate-600 hover:bg-slate-50"
        >Clear</button>
        <button
          type="button" onClick={() => setOpen(false)} aria-label="Close Ask NOVA"
          className="grid h-6 w-6 place-items-center rounded text-slate-500 hover:bg-slate-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {turns.length === 0 && (
          <div className="space-y-3">
            <p className="text-[12px] text-slate-600">
              NOVA is scoped to the current tenant, service, and time range. Try one:
            </p>
            <ul className="space-y-1.5">
              {novaExamples.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => ask(q)}
                    className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[12px] text-slate-700 hover:bg-slate-100"
                  >{q}</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {turns.map((t) => (
          <div key={t.id} className="space-y-2">
            <div className="rounded-lg bg-slate-900 px-3 py-2 text-[12.5px] text-white">{t.question}</div>
            <AnswerCard answer={t.answer} />
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the current service, incident, or runbook…"
          aria-label="Ask NOVA a question"
          className="flex-1 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="grid h-8 w-8 place-items-center rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </aside>
  );
}

function AnswerCard({ answer }: { answer: NovaAnswer }) {
  const conf =
    answer.confidence >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : answer.confidence >= 60 ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-rose-50 text-rose-700 border-rose-200";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-[12.5px] text-slate-700">
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", conf)}>
          {answer.confidence}% confidence
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">Simulation</span>
      </div>
      <p className="text-slate-900">{answer.conclusion}</p>

      <Section title="Supporting evidence">
        <ul className="list-disc space-y-0.5 pl-4">
          {answer.evidence.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </Section>

      <Section title="Uncertainty">
        <p>{answer.uncertainty}</p>
      </Section>

      <Section title="Sources">
        <ul className="space-y-0.5">
          {answer.sources.map((s, i) => (
            <li key={i} className="flex items-center gap-1">
              {s.route ? (
                <Link to={s.route} className="inline-flex items-center gap-1 text-slate-900 underline decoration-slate-300 hover:decoration-slate-900">
                  {s.label} <ExternalLink className="h-3 w-3" />
                </Link>
              ) : <span>{s.label}</span>}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Suggested next actions">
        <ul className="space-y-1">
          {answer.nextActions.map((a, i) => (
            <li key={i}>
              {a.route ? (
                <Link to={a.route} className="inline-block rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11.5px] text-slate-800 hover:bg-slate-100">
                  {a.label}
                </Link>
              ) : (
                <span className="inline-block rounded border border-slate-200 bg-white px-2 py-0.5 text-[11.5px] text-slate-600">{a.label}</span>
              )}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{title}</div>
      <div className="mt-1 text-[12px] text-slate-700">{children}</div>
    </div>
  );
}
