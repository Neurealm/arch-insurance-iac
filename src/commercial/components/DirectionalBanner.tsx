import { AlertTriangle } from "lucide-react";

export function DirectionalBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200"
    >
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>
        Directional portfolio model. Account-level validation and contractual confirmation are pending.
      </span>
    </div>
  );
}
