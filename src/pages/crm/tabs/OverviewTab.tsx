import { useStakeholders, useDepartments, useTeams, useActivities } from "@/hooks/crm/useCrmEntities";
import type { Company } from "../types";
import { Users, Building2, UsersRound, Activity as ActivityIcon } from "lucide-react";
import { OrgHierarchy } from "@/components/crm/OrgHierarchy";

export function OverviewTab({ company }: { company: Company }) {
  const { data: sh = [] } = useStakeholders(company.id);
  const { data: dp = [] } = useDepartments(company.id);
  const { data: tm = [] } = useTeams(company.id);
  const { data: ac = [] } = useActivities(company.id);

  const kpis = [
    { label: "Stakeholders", value: sh.length, icon: Users },
    { label: "Departments", value: dp.length, icon: Building2 },
    { label: "Teams", value: tm.length, icon: UsersRound },
    { label: "Activities", value: ac.length, icon: ActivityIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</div>
              <k.icon className="h-4 w-4 text-indigo" />
            </div>
            <div className="mt-2 text-2xl font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold mb-3">Company Details</h3>
          <dl className="space-y-2 text-sm">
            <Row k="Industry" v={company.industry || "—"} />
            <Row k="Type" v={company.company_type} />
            <Row k="Account Owner" v={company.account_owner || "—"} />
            <Row k="Priority" v={company.priority} />
            <Row k="Status" v={company.status ? "Active" : "Inactive"} />
            <Row k="Website" v={company.website || "—"} />
            <Row k="Email" v={company.email || "—"} />
            <Row k="Phone" v={company.phone || "—"} />
            <Row k="Address" v={company.address || "—"} />
          </dl>
          {company.notes && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Notes</div>
              <p className="text-sm whitespace-pre-wrap">{company.notes}</p>
            </div>
          )}
        </div>
        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold mb-3">Recent Activity</h3>
          {ac.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {ac.slice(0, 6).map((a) => (
                <li key={a.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 text-xs rounded bg-accent text-indigo">{a.type}</span>
                    <span className="font-medium">{a.subject}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(a.occurred_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <OrgHierarchy
        company={company}
        departments={dp}
        teams={tm}
        stakeholders={sh}
      />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-right truncate max-w-[60%]">{v}</dd>
    </div>
  );
}