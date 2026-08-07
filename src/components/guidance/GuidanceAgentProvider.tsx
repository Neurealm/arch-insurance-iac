// Portal-wide guidance-agent conversation state. Mounted once near
// <AuthProvider> in App.tsx (NOT inside AppShell, which remounts per route)
// so conversation history survives navigation. Resets on sign-in/sign-out.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  askGuidanceAgent,
  escalateGuidanceInteraction,
  type GuidanceAnswer,
  type GuidanceHistoryTurn,
} from "./guidanceAgentClient";

export interface GuidanceTurn {
  id: string;
  question: string;
  answer: GuidanceAnswer | null;
  loading: boolean;
  error: string | null;
}

interface Ctx {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  turns: GuidanceTurn[];
  ask: (question: string) => Promise<void>;
  escalate: (interactionId: string, note?: string) => Promise<void>;
  clear: () => void;
  /** Route to visually spotlight in the sidebar (top source of the latest answer). */
  highlightedRoute: string | null;
}

const GuidanceAgentContext = createContext<Ctx | null>(null);

const HIGHLIGHT_DURATION_MS = 6000;
const MAX_HISTORY_TURNS = 6;

export function GuidanceAgentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<GuidanceTurn[]>([]);
  const [highlightedRoute, setHighlightedRouteState] = useState<string | null>(null);
  const seq = useRef(0);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const turnsRef = useRef<GuidanceTurn[]>(turns);
  turnsRef.current = turns;

  useEffect(() => {
    setTurns([]);
    setHighlightedRouteState(null);
    seq.current = 0;
  }, [user?.id]);

  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    },
    [],
  );

  const spotlight = useCallback((route: string | null) => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightedRouteState(route);
    if (route) {
      highlightTimer.current = setTimeout(() => setHighlightedRouteState(null), HIGHLIGHT_DURATION_MS);
    }
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const clean = question.trim();
      if (!clean) return;
      seq.current += 1;
      const id = `T-${seq.current}`;

      const history: GuidanceHistoryTurn[] = turnsRef.current
        .slice(-MAX_HISTORY_TURNS)
        .flatMap((t) => [
          { role: "user" as const, text: t.question },
          ...(t.answer ? [{ role: "assistant" as const, text: t.answer.answer }] : []),
        ]);

      setTurns((prev) => [...prev, { id, question: clean, answer: null, loading: true, error: null }]);
      spotlight(null);

      try {
        const answer = await askGuidanceAgent(clean, history);
        setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, answer, loading: false } : t)));
        spotlight(answer.sources[0]?.route ?? null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, loading: false, error: message } : t)));
      }
    },
    [spotlight],
  );

  const escalate = useCallback(async (interactionId: string, note?: string) => {
    await escalateGuidanceInteraction(interactionId, note);
  }, []);

  const clear = useCallback(() => {
    setTurns([]);
    spotlight(null);
  }, [spotlight]);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  const value = useMemo<Ctx>(
    () => ({ open, setOpen, toggle, turns, ask, escalate, clear, highlightedRoute }),
    [open, toggle, turns, ask, escalate, clear, highlightedRoute],
  );

  return <GuidanceAgentContext.Provider value={value}>{children}</GuidanceAgentContext.Provider>;
}

export function useGuidanceAgent(): Ctx {
  const c = useContext(GuidanceAgentContext);
  if (!c) throw new Error("useGuidanceAgent must be used within GuidanceAgentProvider");
  return c;
}
