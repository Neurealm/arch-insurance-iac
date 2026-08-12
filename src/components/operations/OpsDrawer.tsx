// Accessible drawer and confirmation dialog primitives for the Agentic NOC.
// Keyboard operable: Escape closes, focus is trapped, focus returns to the opener.

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useDialogBehaviour(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    const node = ref.current;
    node?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener.current?.focus?.();
    };
  }, [open, onClose]);

  return ref;
}

export function OpsDrawer({
  open, title, subtitle, onClose, children, footer, widthClass = "max-w-2xl",
}: {
  open: boolean; title: string; subtitle?: string; onClose: () => void;
  children: ReactNode; footer?: ReactNode; widthClass?: string;
}) {
  const ref = useDialogBehaviour(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button" aria-label="Close drawer overlay" tabIndex={-1}
        className="absolute inset-0 bg-slate-900/30" onClick={onClose}
      />
      <div
        ref={ref} role="dialog" aria-modal="true" aria-label={title}
        className={cn(
          "relative flex h-full w-full flex-col border-l border-slate-200 bg-white shadow-xl",
          "ops-drawer-panel sm:w-[92vw]", widthClass,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-[12px] text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button" onClick={onClose} aria-label="Close drawer"
            className="rounded border border-slate-200 p-1 text-slate-600 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">{children}</div>
        {footer && <div className="border-t border-slate-200 px-4 py-3">{footer}</div>}
      </div>
      <style>{`
        @keyframes opsDrawerIn { from { transform: translateX(16px); opacity: 0.6; } to { transform: none; opacity: 1; } }
        .ops-drawer-panel { animation: opsDrawerIn 160ms ease-out; }
        @media (prefers-reduced-motion: reduce) { .ops-drawer-panel { animation: none; } }
      `}</style>
    </div>
  );
}

export function ConfirmDialog({
  open, title, message, confirmLabel, onConfirm, onCancel, tone = "primary",
}: {
  open: boolean; title: string; message: string; confirmLabel: string;
  onConfirm: () => void; onCancel: () => void; tone?: "primary" | "danger";
}) {
  const ref = useDialogBehaviour(open, onCancel);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="Close dialog overlay" tabIndex={-1}
        className="absolute inset-0 bg-slate-900/40" onClick={onCancel} />
      <div ref={ref} role="alertdialog" aria-modal="true" aria-label={title}
        className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
        <h2 className="text-[14px] font-semibold text-slate-900">{title}</h2>
        <p className="mt-1.5 text-[12.5px] text-slate-600">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel}
            className="rounded border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Cancel
          </button>
          <button type="button" onClick={onConfirm}
            className={cn("rounded px-2.5 py-1 text-[12px] font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              tone === "danger" ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500" : "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500")}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Polite live region used for screen reader announcements of workflow changes. */
export function LiveAnnouncer({ message }: { message: string }) {
  return (
    <div aria-live="polite" role="status" className="sr-only">{message}</div>
  );
}
