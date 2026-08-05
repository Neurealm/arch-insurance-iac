// Stage 1 placeholder for navigation destinations that are built in later stages.

import { useLocation } from "react-router-dom";
import { sreNocNav } from "./SreAgenticNocLayout";

export default function SreAgenticNocPlaceholder() {
  const { pathname } = useLocation();
  const title = sreNocNav.find((item) => item.to === pathname)?.label ?? "Section";
  return (
    <div className="min-h-screen bg-white px-4 py-6 lg:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Terra Communications</p>
      <h1 className="text-[22px] font-semibold text-slate-900">{title}</h1>
      <p className="text-[14px] font-medium text-blue-700">SRE Based Agentic NOC</p>
      <p className="mt-4 max-w-xl rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-[12.5px] text-slate-600">
        This section is part of the Stage 1 navigation model. Detailed workflows arrive in Stage 2,
        alongside action approvals and autonomous execution.
      </p>
    </div>
  );
}
