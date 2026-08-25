// Recent Changes & Maintenance — every change scored for customer relevance,
// with elevated attention for changes landing in the protected business window.

import { AlertTriangle, CalendarClock, ShieldCheck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChangeKind, ChangeRecord, ChangeRelevance } from "./types";
import { changeRows, protectedWindow } from "./changeDetail";
import { Interactive } from "./primitives";

export const relevanceStyles: Record<ChangeRelevance, string> = {
  "Not relevant to you": "border-slate-300 bg-slate-100 text-slate-600",
  Informational: "border-sky-500/40 bg-sky-500/10 text-sky-700",
  Relevant: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  "Action required": "border-orange-500/40 bg-orange-500/10 text-orange-700",
};

const kindStyles: Record<ChangeKind, string> = {
  "Azure maintenance": "text-sky-600",
  "Platform maintenance": "text-indigo-600",
  "Infrastructure change": "text-slate-600",
  "Service change": "text-violet-600",
  "Customer-specific maintenance": "text-emerald-600",
};

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{label}</div>
      <div className="truncate text-[11.5px] text-slate-700">{value}</div>
    </div>
  );
}

export function ChangeCard({
  c, onOpen, dense = false,
}: { c: ChangeRecord; onOpen: (id: string) => void; dense?: boolean }) {
  return (
    <Interactive
      tooltip="A planned change in your environment or at the cloud provider, with our assessment of what it could mean for you."
      onClick={() => onOpen(c.contextId)}
      className={cn(
        "block rounded-lg border bg-white px-3 py-2.5",
        c.inProtectedWindow ? "border-amber-400/70 ring-1 ring-amber-200" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-start gap-2.5">
          <Wrench className={cn("mt-0.5 h-4 w-4 shrink-0", kindStyles[c.kind])} aria-hidden />
          <span className="min-w-0">
            <span className="block truncate text-[12.5px] text-slate-900">{c.title}</span>
            <span className="block text-[11px] text-slate-500">
              {c.kind} · {c.window}
            </span>
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full border px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide",
            relevanceStyles[c.relevance],
          )}
        >
          {c.relevance}
        </span>
      </div>

      {c.inProtectedWindow && (
        <div className="mt-2 flex items-start gap-1.5 rounded-md border border-amber-400/50 bg-amber-500/10 px-2 py-1.5 text-[10.5px] leading-snug text-amber-800">
          <AlertTriangle className="mt-[1px] h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Occurs inside your protected business window — elevated attention applied.</span>
        </div>
      )}

      {!dense && (
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4">
          <Field label="Affected region" value={c.region} />
          <Field label="Affected deployment" value={c.deployment} />
          <Field label="Potential impact" value={c.potentialImpact} />
          <Field label="Customer action" value={c.customerAction} />
        </div>
      )}
    </Interactive>
  );
}

export function ProtectedWindowCard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
        <span className="text-[12px] font-medium text-slate-900">{protectedWindow.label}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-700">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-slate-500" aria-hidden />
          {protectedWindow.days}
        </span>
        <span>{protectedWindow.hours}</span>
        <span className="text-slate-500">{protectedWindow.timezone}</span>
      </div>
      <p className="mt-1.5 text-[10.5px] leading-snug text-slate-500">{protectedWindow.note}</p>
    </div>
  );
}

export function ChangesPanel({
  onOpen, rows = changeRows, dense = false,
}: { onOpen: (id: string) => void; rows?: ChangeRecord[]; dense?: boolean }) {
  return (
    <div className="space-y-2.5">
      <ProtectedWindowCard />
      <ul className="space-y-2">
        {rows.map((c) => (
          <li key={c.id}>
            <ChangeCard c={c} onOpen={onOpen} dense={dense} />
          </li>
        ))}
      </ul>
      <p className="text-[10.5px] leading-snug text-slate-500">
        Relevance is calculated per change by comparing the affected infrastructure scope with your own
        deployments. Changes with no path to your environment are shown, but marked as not relevant to you.
      </p>
    </div>
  );
}
