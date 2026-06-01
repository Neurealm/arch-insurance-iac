import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Pencil, Building2, Globe, Mail, Phone, MapPin, User } from "lucide-react";
import { useCompany } from "@/hooks/crm/useCompanies";
import { CompanySheet } from "@/components/crm/CompanySheet";
import { OverviewTab } from "./tabs/OverviewTab";
import { StakeholdersTab } from "./tabs/StakeholdersTab";
import { DepartmentsTab } from "./tabs/DepartmentsTab";
import { TeamsTab } from "./tabs/TeamsTab";
import { ActivitiesTab } from "./tabs/ActivitiesTab";
import { NotesTab } from "./tabs/NotesTab";

export default function CompanyWorkspace() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading } = useCompany(companyId);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return <AppShell><div className="p-6 text-muted-foreground">Loading...</div></AppShell>;
  }

  if (!company) {
    return (
      <AppShell>
        <div className="p-6">
          <Button variant="ghost" onClick={() => navigate("/crm")} className="gap-2 mb-4"><ArrowLeft className="h-4 w-4" />Back</Button>
          <div className="text-muted-foreground">Company not found.</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 max-w-[1600px] mx-auto w-full">
        <Button variant="ghost" onClick={() => navigate("/crm")} className="gap-2 mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" />All Companies
        </Button>

        <div className="rounded-lg border bg-card p-5 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4 min-w-0">
              <div className="h-14 w-14 rounded-lg bg-accent flex items-center justify-center text-2xl font-semibold text-indigo">
                {company.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold flex items-center gap-2"><Building2 className="h-5 w-5 text-indigo" />{company.name}</h1>
                  <Badge variant="outline">{company.company_type}</Badge>
                  <Badge variant={company.status ? "default" : "secondary"}>{company.status ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                  {company.industry && <span>{company.industry}</span>}
                  {company.account_owner && <span className="flex items-center gap-1"><User className="h-3 w-3" />{company.account_owner}</span>}
                  {company.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{company.website}</span>}
                  {company.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{company.email}</span>}
                  {company.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{company.phone}</span>}
                  {company.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.address}</span>}
                </div>
                {company.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {company.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                  </div>
                )}
              </div>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />Edit
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-5"><OverviewTab company={company} /></TabsContent>
          <TabsContent value="stakeholders" className="mt-5"><StakeholdersTab companyId={company.id} /></TabsContent>
          <TabsContent value="departments" className="mt-5"><DepartmentsTab companyId={company.id} /></TabsContent>
          <TabsContent value="teams" className="mt-5"><TeamsTab companyId={company.id} company={company} /></TabsContent>
          <TabsContent value="activities" className="mt-5"><ActivitiesTab companyId={company.id} /></TabsContent>
          <TabsContent value="notes" className="mt-5"><NotesTab companyId={company.id} /></TabsContent>
        </Tabs>
      </div>

      <CompanySheet open={editOpen} onOpenChange={setEditOpen} company={company} />
    </AppShell>
  );
}