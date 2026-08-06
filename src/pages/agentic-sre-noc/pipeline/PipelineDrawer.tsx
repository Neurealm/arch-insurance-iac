/**
 * AIM-002 — lazy-loaded pipeline drawer.
 *
 * Right-hand overlay on desktop, bottom sheet on mobile. Used by the feature
 * detail drawer and the local evidence drawer.
 */

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { backdropEnter, controlTransition, drawerEnter, focusRing } from "../components/motion";

export function PipelineDrawer({
  open, title, subtitle, onClose, children, testId, wide,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  testId?: string;
  /** Wider desktop panel, used by the AIM-003 What-If and comparison panels. */
  wide?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const restoreRef = React.useRef<HTMLElement | null>(null);
  const headingId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-stretch">
      <button
        type="button"
        aria-label={`Close ${title}`}
        onClick={onClose}
        className={cn("absolute inset-0 bg-slate-900/20", backdropEnter)}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        data-testid={testId}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[85vh] w-full flex-col rounded-t-xl border border-slate-200 bg-white shadow-xl focus:outline-none",
          "sm:max-h-none sm:h-full sm:rounded-none sm:rounded-l-xl",
          wide ? "sm:w-[560px] lg:w-[680px]" : "sm:w-[420px]",
          drawerEnter,
        )}
      >
        <header className="flex items-start justify-between gap-2 border-b border-slate-200 px-4 py-2.5">
          <div className="min-w-0">
            <h3 id={headingId} className="text-sm font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title} panel`}
            className={cn(
              "rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-50",
              controlTransition,
              focusRing,
            )}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
      </div>
    </div>
  );
}

