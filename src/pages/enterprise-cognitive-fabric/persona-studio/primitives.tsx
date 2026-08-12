import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type Tone = "green" | "amber" | "red" | "blue" | "slate";
export type Density = "compact" | "standard" | "comfortable";

export function Pill({ label, tone }: { label: string; tone: Tone }) {
  const map: Record<Tone, string> = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium", map[tone])}>
      {label}
    </span>
  );
}

export const toneFor = (status: string): Tone => {
  if (["Running", "Complete", "Approved", "Healthy", "Resolved", "Current", "Within SLA", "On target"].includes(status)) return "green";
  if (["Warning", "At risk", "Review Required", "Pending", "Aging", "Conflicts", "Partial", "Attention"].includes(status)) return "amber";
  if (["Blocked", "Failed", "Breached", "Critical", "High", "Unresolved", "Stale"].includes(status)) return "red";
  if (["Paused", "Idle", "Low", "Not Started", "Draft"].includes(status)) return "slate";
  return "blue";
};

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-1 last:border-0">
      <dt className="text-[11px] text-slate-500">{label}</dt>
      <dd className="text-right text-[11.5px] font-medium text-slate-800">{value}</dd>
    </div>
  );
}

export function Drawer({ open, onOpenChange, title, description, children, wide }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn("w-full overflow-y-auto", wide ? "sm:max-w-3xl" : "sm:max-w-xl")}>
        <SheetHeader>
          <SheetTitle className="text-[15px]">{title}</SheetTitle>
          {description && <SheetDescription className="text-[12px]">{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-3 space-y-3">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function FilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-7 rounded-md border px-1.5 text-[11px] text-slate-700 focus:border-blue-400 focus:outline-none",
          value !== "All" ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white",
        )}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
