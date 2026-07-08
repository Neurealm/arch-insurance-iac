import { NavLink } from "react-router-dom";
import { Building2 } from "lucide-react";

export function CrmTabs() {
  const base = "px-3 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2";
  const active = "border-indigo text-foreground";
  const idle = "border-transparent text-muted-foreground hover:text-foreground";
  return (
    <nav className="flex items-center gap-2 border-b mb-6">
      <NavLink to="/crm" end className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
        <Building2 className="h-4 w-4" /> Companies
      </NavLink>
    </nav>
  );
}