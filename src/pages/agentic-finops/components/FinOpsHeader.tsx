import { type ReactNode } from "react";
import { Play, Download, FlaskConical, Activity } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterDef {
  id: string;
  label: string;
  value: string;
  options: string[];
  width?: string;
}

export const standardFilters: FilterDef[] = [
  { id: "env", label: "Environment", value: "Production", options: ["All Environments", "Production", "Staging", "Development", "Sandbox"] },
  { id: "cloud", label: "Cloud", value: "All Clouds", options: ["All Clouds", "AWS", "Azure", "GCP", "OCI"] },
  { id: "bu", label: "Business Unit", value: "All Units", options: ["All Units", "Commerce", "Payments", "Marketing", "Analytics", "Corporate"] },
  { id: "app", label: "Application", value: "All Applications", options: ["All Applications", "Payment Authorization", "Order Capture", "Customer Profile", "Data Lake"] },
  { id: "region", label: "Region", value: "All Regions", options: ["All Regions", "us-east-1", "us-west-2", "eu-west-1", "ap-south-1"] },
  { id: "window", label: "Analysis Window", value: "Last 30 Days", options: ["Last 7 Days", "Last 30 Days", "Last 90 Days", "Last 12 Months"] },
];

export interface FinOpsHeaderProps {
  title: string;
  tagline: string;
  filters?: FilterDef[];
  primaryLabel?: string;
  secondaryActions?: { label: string; icon?: "export" | "simulate" }[];
  meta?: { lastAnalysis: string; freshness: string; resources: string };
  onPrimary?: () => void;
  onSecondary?: (label: string) => void;
  onFilterChange?: (id: string, value: string) => void;
  extra?: ReactNode;
}

export default function FinOpsHeader({
  title, tagline, filters = standardFilters, primaryLabel = "Run Analysis",
  secondaryActions = [{ label: "Export Evidence", icon: "export" }, { label: "Open Simulator", icon: "simulate" }],
  meta = { lastAnalysis: "12 minutes ago", freshness: "98.4% within SLA", resources: "18,428 resources analyzed" },
  onPrimary, onSecondary, onFilterChange, extra,
}: FinOpsHeaderProps) {
  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[280px]">
          <h1 className="text-[22px] font-bold leading-tight tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 max-w-4xl text-[13px] text-slate-600">{tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-emerald-700">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            FinOps Twin: Operational
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        {filters.map((f) => (
          <div key={f.id} className="min-w-[132px]">
            <div className="mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-slate-500">{f.label}</div>
            <Select defaultValue={f.value} onValueChange={(v) => onFilterChange?.(f.id, v)}>
              <SelectTrigger className={cn("h-8 border-slate-200 bg-white text-[12px]", f.width ?? "w-[168px]")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {f.options.map((o) => (
                  <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {secondaryActions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => onSecondary?.(a.label)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700"
            >
              {a.icon === "simulate" ? <FlaskConical className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
              {a.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onPrimary}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-[12px] font-semibold text-white transition hover:bg-slate-800"
          >
            <Play className="h-3.5 w-3.5" /> {primaryLabel}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-200 pb-3 text-[11.5px] text-slate-500">
        <span className="inline-flex items-center gap-1"><Activity className="h-3 w-3" /> Last analysis: <span className="font-medium text-slate-700">{meta.lastAnalysis}</span></span>
        <span>Evidence freshness: <span className="font-medium text-slate-700">{meta.freshness}</span></span>
        <span>{meta.resources}</span>
        {extra}
      </div>
    </header>
  );
}
