import { useCallback, useEffect, useState } from "react";
import { ecfPages } from "./pages";

const KEY = "ecf.completed";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Lightweight module progress tracking, mirroring the other learning modules. */
export function useEcfProgress() {
  const [completed, setCompleted] = useState<string[]>(read);

  useEffect(() => {
    const onStorage = () => setCompleted(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener("ecf-progress", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("ecf-progress", onStorage);
    };
  }, []);

  const persist = useCallback((next: string[]) => {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setCompleted(next);
    window.dispatchEvent(new Event("ecf-progress"));
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      const next = completed.includes(slug) ? completed.filter((s) => s !== slug) : [...completed, slug];
      persist(next);
    },
    [completed, persist],
  );

  const isComplete = useCallback((slug: string) => completed.includes(slug), [completed]);

  const total = ecfPages.length;
  const done = ecfPages.filter((p) => completed.includes(p.slug)).length;

  return { completed, toggle, isComplete, done, total, percent: Math.round((done / total) * 100) };
}
