import { AppShell } from "@/components/eoc/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Network, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Settings() {
  return (
    <AppShell>
      <main className="flex-1 px-8 py-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-navy text-white grid place-items-center shadow-[var(--shadow-md)]">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Control Panel</h1>
            <p className="text-sm text-muted-foreground">
              Configure organization-wide modules, references, and operational defaults.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-primary/30">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-navy text-white grid place-items-center">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Organization Model</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage Business Units → Practices → Capability Areas → Service Functions → Workflows → Activities → Tasks.
                  </p>
                </div>
              </div>
              <Link
                to="/settings/organization/business-units"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
              >
                Open <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
          </Card>

          <Card className="border-primary/30">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-navy text-white grid place-items-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">User Approvals</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Review and approve new account requests. Pending users cannot access the platform.
                  </p>
                </div>
              </div>
              <Link
                to="/settings/approvals"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
              >
                Open <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}
