import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CornerDownLeft } from "lucide-react";
import { AVEP_NAV } from "./navigation";
import { useAvepShell } from "./ShellState";

export function AvepCommandPalette() {
  const { commandOpen, setCommandOpen } = useAvepShell();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AVEP_NAV;
    return AVEP_NAV.filter((n) =>
      n.label.toLowerCase().includes(q) ||
      n.group.toLowerCase().includes(q) ||
      n.id.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (commandOpen) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [commandOpen]);

  useEffect(() => setActiveIdx(0), [query]);

  if (!commandOpen) return null;

  const commit = (idx: number) => {
    const item = results[idx];
    if (!item) return;
    navigate(item.path);
    setCommandOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      style={{ background: "hsl(222 30% 8% / 0.35)" }}
      onClick={() => setCommandOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-lg overflow-hidden"
        style={{
          background: "hsl(var(--avep-surface))",
          border: "1px solid hsl(var(--avep-border))",
          boxShadow: "var(--avep-shadow-lg)",
        }}
      >
        <div
          className="flex items-center gap-2 px-3 h-11 border-b"
          style={{ borderColor: "hsl(var(--avep-border))" }}
        >
          <Search className="h-4 w-4" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setCommandOpen(false);
              else if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
              else if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
              else if (e.key === "Enter")     { e.preventDefault(); commit(activeIdx); }
            }}
            placeholder="Jump to module…"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground))" }}
          />
          <kbd
            className="px-1.5 py-0.5 rounded"
            style={{
              fontSize: "var(--avep-text-2xs)",
              background: "hsl(var(--avep-surface-muted))",
              border: "1px solid hsl(var(--avep-border))",
              color: "hsl(var(--avep-foreground-muted))",
            }}
          >
            Esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center" style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-subtle))" }}>
              No matches
            </li>
          )}
          {results.map((item, idx) => {
            const active = idx === activeIdx;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => commit(idx)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left"
                  style={{
                    background: active ? "hsl(var(--avep-primary-soft))" : "transparent",
                    color: active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground))",
                    fontSize: "var(--avep-text-sm)",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
                    {item.group}
                  </span>
                  {active && <CornerDownLeft className="h-3.5 w-3.5" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
