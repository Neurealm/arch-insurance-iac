import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

const TITLES: Record<string, string> = {
  "integrations": "Integrations & Connectivity",
  "access-security": "Access & Security",
  "policies-governance": "Policies & Governance",
  "audit-compliance": "Audit & Compliance",
  "system-settings": "System Settings",
};

/** Placeholder for Platform Administration pages not yet built. */
export default function PlatformAdminPlaceholder() {
  const { pathname } = useLocation();
  const key = pathname.split("/").pop() ?? "";
  const title = TITLES[key] ?? "Platform Administration";
  return (
    <div className="px-5 py-4">
      <nav className="mb-2 flex items-center gap-1.5 text-[11.5px] text-slate-500">
        <span>Platform Administration</span><span>/</span>
        <span className="font-medium text-slate-700">{title}</span>
      </nav>
      <h1 className="text-[20px] font-semibold text-slate-900">{title}</h1>
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-[#E2E8F0] bg-white px-4 py-6 text-[12.5px] text-slate-600">
        <Construction className="h-5 w-5 text-slate-400" />
        This administration workspace is planned for a later release.
      </div>
    </div>
  );
}
