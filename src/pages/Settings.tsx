import { AppShell } from "@/components/eoc/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Network, ArrowRight, UserCog, KeyRound, ClipboardList, Database, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
  const { isAdmin } = useAuth();
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
          <SettingsCard to="/settings/change-password" icon={KeyRound} title="Change Password"
            description="Update your account password. Strong-password rules and instant confirmation." />

          {isAdmin && (
            <>
              <SettingsCard to="/settings/organization/business-units" icon={Network} title="Organization Model"
                description="Manage Business Units → Practices → Capability Areas → Service Functions → Workflows → Activities → Tasks." />
              <SettingsCard to="/settings/user-management" icon={UserCog} title="User Management"
                description="Invite users, reset passwords, manage NeuRealm Employee vs Customer categories, platform roles, and review activity." />
              <SettingsCard to="/questionnaires" icon={ClipboardList} title="Questionnaires"
                description="Design, publish, and manage assessment questionnaires across programs and workstreams." />
              <SettingsCard to="/admin/technology-taxonomy" icon={Database} title="Technology Taxonomy"
                description="Curate the Enterprise Technology Domain Model — technologies, practices, and classifications." />
              <SettingsCard to="/admin/technology-taxonomy/domains" icon={Database} title="Domains"
                description="Manage the Domain records that describe how each Technology participates in the ETDM taxonomy." />
              <SettingsCard to="/crm" icon={Building2} title="Customer Relation Manager"
                description="Manage customer companies, departments, teams, stakeholders, activities, and notes." />


            </>
          )}
        </div>
      </main>
    </AppShell>
  );
}

function SettingsCard({ to, icon: Icon, title, description }: { to: string; icon: any; title: string; description: string }) {
  return (
    <Card className="border-primary/30">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-navy text-white grid place-items-center">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0">
          Open <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
    </Card>
  );
}
