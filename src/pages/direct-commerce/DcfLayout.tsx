import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Home, LayoutDashboard, ShoppingCart, KeyRound, Repeat, Cloud, Scale,
  GitBranch, BookOpen, Plug, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", to: "/direct-commerce", icon: LayoutDashboard, end: true },
  { label: "Operational Workflow Overview", to: "/direct-commerce/workflow-overview", icon: Activity },

  { label: "Orders", to: "/direct-commerce/orders", icon: ShoppingCart },
  { label: "Entitlements", to: "/direct-commerce/entitlements", icon: KeyRound },
  { label: "Lifter Fulfillment", to: "/direct-commerce/lifter-fulfillment", icon: Repeat },
  { label: "Azure Provisioning", to: "/direct-commerce/provisioning", icon: Cloud },
  { label: "Reconciliation", to: "/direct-commerce/reconciliation", icon: Scale },
  { label: "Customer Timeline", to: "/direct-commerce/timeline", icon: GitBranch },
  { label: "Catalog & SKU Mapping", to: "/direct-commerce/catalog", icon: BookOpen },
  { label: "Integrations", to: "/direct-commerce/integrations", icon: Plug },
];

/** Module shell for Direct Commerce Fulfillment. */
export default function DcfLayout() {
  return (
    <div className="flex min-h-screen bg-[#F6F8FA] text-slate-900">
      <aside className="sticky top-0 flex h-screen w-[236px] shrink-0 flex-col border-r border-[#E2E8F0] bg-white">
        <Link
          to="/app"
          className="flex items-center gap-2 border-b border-[#E2E8F0] px-4 py-2.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          <Home className="h-4 w-4 shrink-0" />
          <span>NeuGAIN Command Center</span>
        </Link>

        <div className="border-b border-[#E2E8F0] px-4 py-3.5">
          <div className="text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-indigo-700">
            Direct Commerce
          </div>
          <div className="text-[13.5px] font-semibold leading-tight text-slate-900">Fulfillment Control Plane</div>
          <div className="mt-1 text-[10.5px] leading-snug text-slate-500">
            Marketplace-independent commerce with downstream Lifter fulfillment
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] transition-colors",
                    isActive
                      ? "bg-[#EEF2FF] font-medium text-[#3730A3] ring-1 ring-inset ring-[#C7D2FE]"
                      : "text-slate-700 hover:bg-slate-50",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#3730A3]" : "text-slate-500")} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-[#E2E8F0] px-4 py-3">
          <div className="flex items-start gap-2 rounded-md bg-emerald-50 px-2.5 py-2 ring-1 ring-inset ring-emerald-200">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <p className="text-[10.5px] leading-snug text-emerald-900">
              Direct commerce is decoupled from Microsoft fulfillment. Every direct order still raises and confirms a
              Lifter entitlement downstream.
            </p>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
