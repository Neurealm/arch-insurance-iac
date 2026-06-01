import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TagsInput } from "@/components/crm/TagsInput";
import { MultiTextInput } from "@/components/crm/MultiTextInput";

const HML = ["High", "Medium", "Low"];
const ATTITUDE = ["Supportive", "Neutral", "Resistant", "Unknown"];
const PI_CATEGORY = ["Manage Closely", "Keep Satisfied", "Keep Informed", "Monitor"];
const ENGAGE_LEVEL = ["Unaware", "Resistant", "Neutral", "Supportive", "Leading"];
const REL_HEALTH = ["Strong", "Good", "Average", "Weak", "At Risk"];
const COMM_METHOD = ["Email", "Phone", "Meeting", "Teams", "Slack", "Dashboard", "Formal Report"];
const COMM_FREQ = ["Daily", "Weekly", "Bi-weekly", "Monthly", "Milestone-based", "As Needed"];
const COMM_FORMAT = ["Status Report", "Executive Summary", "Dashboard Update", "Risk Report", "Financial Report", "Technical Review", "Steering Committee Update"];
const DECISION_AUTH = ["Can Approve", "Can Recommend", "Can Review", "Inform Only"];
const APPROVAL_AREAS = ["Scope", "Budget", "Timeline", "Requirements", "Design", "Architecture", "Contract", "Change Request", "Deployment", "Final Delivery"];
const SIGNOFF_STAGE = ["Requirement Approval", "Design Approval", "UAT Approval", "Go-Live Approval", "Final Acceptance"];
const RACI = ["Responsible", "Accountable", "Consulted", "Informed"];
const POSSIBLE_IMPACT = ["Timeline Delay", "Budget Increase", "Scope Change", "Quality Issue", "Compliance Risk", "Relationship Risk", "Adoption Risk"];
const CHANGE_READY = ["Ready", "Needs Support", "Resistant", "Unknown"];
const STAKEHOLDER_TYPES = ["Executive Sponsor", "Business Owner", "End User", "Technical Lead", "Vendor", "Regulator", "Partner", "Customer", "Other"];
const PROJECT_PHASES = ["Initiation", "Planning", "Execution", "Monitoring", "Closure"];
const INVOLVEMENT = ["Full-time", "Part-time", "Advisory", "Occasional"];

type Form = Record<string, unknown>;

const REQUIRED: { key: string; label: string }[] = [
  { key: "first_name", label: "First Name" },
  { key: "stakeholder_type", label: "Stakeholder Type" },
  { key: "organization_name", label: "Organization Name" },
  { key: "primary_email", label: "Email" },
  { key: "project_name", label: "Project Name" },
  { key: "stakeholder_role", label: "Stakeholder Role" },
  { key: "power_level", label: "Power Level" },
  { key: "interest_level", label: "Interest Level" },
  { key: "influence_level", label: "Influence Level" },
  { key: "impact_level", label: "Impact Level" },
  { key: "current_engagement_level", label: "Current Engagement Level" },
  { key: "desired_engagement_level", label: "Desired Engagement Level" },
  { key: "communication_method", label: "Communication Method" },
  { key: "communication_frequency", label: "Communication Frequency" },
  { key: "decision_authority", label: "Decision Authority" },
  { key: "raci_role", label: "RACI Role" },
];

const blank = (): Form => ({
  first_name: "", last_name: "",
  emails: [], phones: [],
  influence_level: "Medium",
  status: true,
  approval_areas: [],
  attachments: [],
  related_documents: [],
  tags: [],
  decision_maker: false, approver: false, influencer: false,
  impacted_by_project: false, beneficiary: false, regulatory_or_compliance_role: false,
  signoff_required: false, escalation_required: false, training_required: false,
});

export default function StakeholderFormPage() {
  const { companyId = "", stakeholderId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(blank());
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!stakeholderId);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from("crm_companies").select("name").eq("id", companyId).maybeSingle();
      if (c) setCompanyName(c.name);
    })();
  }, [companyId]);

  useEffect(() => {
    if (!stakeholderId) return;
    (async () => {
      const { data, error } = await supabase.from("crm_stakeholders").select("*").eq("id", stakeholderId).maybeSingle();
      if (error) {
        toast({ title: "Failed to load", description: error.message, variant: "destructive" });
      } else if (data) {
        const f: Form = { ...data };
        f.primary_email = (data.emails && data.emails[0]) || "";
        f.primary_phone = (data.phones && data.phones[0]) || "";
        setForm(f);
      }
      setLoading(false);
    })();
  }, [stakeholderId]);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const missing = useMemo(() => REQUIRED.filter((r) => {
    const v = form[r.key];
    return v === undefined || v === null || v === "";
  }), [form]);

  const submit = async () => {
    if (missing.length) {
      toast({ title: "Missing required fields", description: missing.map((m) => m.label).join(", "), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const emails = (form.emails as string[] | undefined) ?? [];
      const phones = (form.phones as string[] | undefined) ?? [];
      const primaryEmail = (form.primary_email as string) || "";
      const primaryPhone = (form.primary_phone as string) || "";
      const mergedEmails = primaryEmail && !emails.includes(primaryEmail) ? [primaryEmail, ...emails] : (emails.length ? emails : (primaryEmail ? [primaryEmail] : []));
      const mergedPhones = primaryPhone && !phones.includes(primaryPhone) ? [primaryPhone, ...phones] : (phones.length ? phones : (primaryPhone ? [primaryPhone] : []));

      const payload: Record<string, unknown> = { ...form, company_id: companyId, emails: mergedEmails, phones: mergedPhones };
      delete payload.primary_email;
      delete payload.primary_phone;

      if (stakeholderId) {
        payload.updated_by = user?.id ?? null;
        const { id: _ignore, created_at, ...patch } = payload as Record<string, unknown>;
        const { error } = await supabase.from("crm_stakeholders").update(patch as never).eq("id", stakeholderId);
        if (error) throw error;
      } else {
        payload.created_by = user?.id ?? null;
        delete (payload as Record<string, unknown>).id;
        const { error } = await supabase.from("crm_stakeholders").insert(payload as never);
        if (error) throw error;
      }
      toast({ title: stakeholderId ? "Stakeholder updated" : "Stakeholder added" });
      navigate(`/crm/companies/${companyId}`);
    } catch (e: unknown) {
      toast({ title: "Save failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AppShell><div className="p-10 text-sm text-muted-foreground">Loading…</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button onClick={() => navigate(`/crm/companies/${companyId}`)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to {companyName || "Company"}
            </button>
            <h1 className="text-2xl font-bold mt-2">{stakeholderId ? "Edit Stakeholder" : "Add Stakeholder"}</h1>
            <p className="text-sm text-muted-foreground mt-1">Complete the stakeholder register for {companyName || "this company"}.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/crm/companies/${companyId}`)}><X className="h-4 w-4 mr-1" />Cancel</Button>
            <Button onClick={submit} disabled={saving}><Save className="h-4 w-4 mr-1" />{saving ? "Saving…" : "Save Stakeholder"}</Button>
          </div>
        </div>

        {/* 1. Identification */}
        <Section title="1. Stakeholder Identification">
          <Grid>
            <F label="Stakeholder ID"><Input value={s(form.stakeholder_code)} onChange={(e) => set("stakeholder_code", e.target.value)} placeholder="e.g. STK-1001" /></F>
            <F label="First Name *"><Input value={s(form.first_name)} onChange={(e) => set("first_name", e.target.value)} /></F>
            <F label="Last Name"><Input value={s(form.last_name)} onChange={(e) => set("last_name", e.target.value)} /></F>
            <F label="Stakeholder Type *">{Sel(s(form.stakeholder_type), (v) => set("stakeholder_type", v), STAKEHOLDER_TYPES)}</F>
            <F label="Stakeholder Category"><Input value={s(form.stakeholder_category)} onChange={(e) => set("stakeholder_category", e.target.value)} /></F>
            <F label="Organization Name *"><Input value={s(form.organization_name)} onChange={(e) => set("organization_name", e.target.value)} /></F>
            <F label="Department"><Input value={s(form.department_name)} onChange={(e) => set("department_name", e.target.value)} /></F>
            <F label="Job Title"><Input value={s(form.job_title)} onChange={(e) => set("job_title", e.target.value)} /></F>
            <F label="Location"><Input value={s(form.location)} onChange={(e) => set("location", e.target.value)} /></F>
            <F label="Region"><Input value={s(form.region)} onChange={(e) => set("region", e.target.value)} /></F>
            <F label="Status">
              <div className="flex items-center gap-2 h-10">
                <Switch checked={!!form.status} onCheckedChange={(v) => set("status", v)} />
                <span className="text-sm">{form.status ? "Active" : "Inactive"}</span>
              </div>
            </F>
          </Grid>
        </Section>

        {/* 2. Contact */}
        <Section title="2. Contact Information">
          <Grid>
            <F label="Email *"><Input type="email" value={s(form.primary_email)} onChange={(e) => set("primary_email", e.target.value)} /></F>
            <F label="Phone"><Input value={s(form.primary_phone)} onChange={(e) => set("primary_phone", e.target.value)} /></F>
            <F label="Alternate Phone"><Input value={s(form.alternate_phone)} onChange={(e) => set("alternate_phone", e.target.value)} /></F>
            <F label="LinkedIn URL"><Input value={s(form.linkedin)} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." /></F>
            <F label="Preferred Contact Method">{Sel(s(form.preferred_contact_method), (v) => set("preferred_contact_method", v), COMM_METHOD)}</F>
            <F label="Preferred Contact Time"><Input value={s(form.preferred_contact_time)} onChange={(e) => set("preferred_contact_time", e.target.value)} placeholder="e.g. 9am–12pm" /></F>
            <F label="Time Zone"><Input value={s(form.time_zone)} onChange={(e) => set("time_zone", e.target.value)} placeholder="e.g. America/New_York" /></F>
            <F label="Additional Emails" full><MultiTextInput type="email" value={(form.emails as string[]) ?? []} onChange={(v) => set("emails", v)} placeholder="Add and press Enter" /></F>
            <F label="Additional Phones" full><MultiTextInput value={(form.phones as string[]) ?? []} onChange={(v) => set("phones", v)} placeholder="Add and press Enter" /></F>
          </Grid>
        </Section>

        {/* 3. Project Association */}
        <Section title="3. Project Association">
          <Grid>
            <F label="Project ID"><Input value={s(form.project_code)} onChange={(e) => set("project_code", e.target.value)} /></F>
            <F label="Project Name *"><Input value={s(form.project_name)} onChange={(e) => set("project_name", e.target.value)} /></F>
            <F label="Program Name"><Input value={s(form.program_name)} onChange={(e) => set("program_name", e.target.value)} /></F>
            <F label="Portfolio Name"><Input value={s(form.portfolio_name)} onChange={(e) => set("portfolio_name", e.target.value)} /></F>
            <F label="Account Name"><Input value={s(form.account_name)} onChange={(e) => set("account_name", e.target.value)} /></F>
            <F label="Business Unit"><Input value={s(form.business_unit)} onChange={(e) => set("business_unit", e.target.value)} /></F>
            <F label="Practice Area"><Input value={s(form.practice_area)} onChange={(e) => set("practice_area", e.target.value)} /></F>
            <F label="Project Phase">{Sel(s(form.project_phase), (v) => set("project_phase", v), PROJECT_PHASES)}</F>
            <F label="Stakeholder Role *"><Input value={s(form.stakeholder_role)} onChange={(e) => set("stakeholder_role", e.target.value)} /></F>
            <F label="Responsibility"><Input value={s(form.responsibility)} onChange={(e) => set("responsibility", e.target.value)} /></F>
            <F label="Ownership Area"><Input value={s(form.ownership_area)} onChange={(e) => set("ownership_area", e.target.value)} /></F>
            <F label="Involvement Level">{Sel(s(form.involvement_level), (v) => set("involvement_level", v), INVOLVEMENT)}</F>
            <F label="Start Date"><Input type="date" value={s(form.start_date)?.slice(0, 10) ?? ""} onChange={(e) => set("start_date", e.target.value || null)} /></F>
            <F label="End Date"><Input type="date" value={s(form.end_date)?.slice(0, 10) ?? ""} onChange={(e) => set("end_date", e.target.value || null)} /></F>
          </Grid>
        </Section>

        {/* 4. Classification */}
        <Section title="4. Stakeholder Classification">
          <Grid>
            <F label="Internal / External">{Sel(s(form.internal_external), (v) => set("internal_external", v), ["Internal", "External"])}</F>
            <F label="Primary / Secondary">{Sel(s(form.primary_secondary), (v) => set("primary_secondary", v), ["Primary", "Secondary"])}</F>
            <F label="Direct / Indirect">{Sel(s(form.direct_indirect), (v) => set("direct_indirect", v), ["Direct", "Indirect"])}</F>
          </Grid>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ["decision_maker", "Decision Maker"],
              ["approver", "Approver"],
              ["influencer", "Influencer"],
              ["impacted_by_project", "Impacted by Project"],
              ["beneficiary", "Beneficiary"],
              ["regulatory_or_compliance_role", "Regulatory / Compliance Role"],
            ].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 rounded-md border p-2.5 text-sm">
                <Switch checked={!!form[k]} onCheckedChange={(v) => set(k, v)} />
                {l}
              </label>
            ))}
          </div>
        </Section>

        {/* 5. Analysis */}
        <Section title="5. Stakeholder Analysis">
          <Grid>
            <F label="Power Level *">{Sel(s(form.power_level), (v) => set("power_level", v), HML)}</F>
            <F label="Interest Level *">{Sel(s(form.interest_level), (v) => set("interest_level", v), HML)}</F>
            <F label="Influence Level *">{Sel(s(form.influence_level), (v) => set("influence_level", v), HML)}</F>
            <F label="Impact Level *">{Sel(s(form.impact_level), (v) => set("impact_level", v), HML)}</F>
            <F label="Urgency Level">{Sel(s(form.urgency_level), (v) => set("urgency_level", v), HML)}</F>
            <F label="Legitimacy Level">{Sel(s(form.legitimacy_level), (v) => set("legitimacy_level", v), HML)}</F>
            <F label="Priority Level">{Sel(s(form.priority_level), (v) => set("priority_level", v), HML)}</F>
            <F label="Support Level">{Sel(s(form.support_level), (v) => set("support_level", v), HML)}</F>
            <F label="Attitude">{Sel(s(form.attitude), (v) => set("attitude", v), ATTITUDE)}</F>
            <F label="Risk Sensitivity">{Sel(s(form.risk_sensitivity), (v) => set("risk_sensitivity", v), HML)}</F>
            <F label="Power-Interest Category">{Sel(s(form.power_interest_category), (v) => set("power_interest_category", v), PI_CATEGORY)}</F>
            <F label="Management Strategy" full><Textarea rows={2} value={s(form.stakeholder_management_strategy)} onChange={(e) => set("stakeholder_management_strategy", e.target.value)} /></F>
          </Grid>
        </Section>

        {/* 6. Engagement */}
        <Section title="6. Engagement Assessment">
          <Grid>
            <F label="Current Engagement Level *">{Sel(s(form.current_engagement_level), (v) => set("current_engagement_level", v), ENGAGE_LEVEL)}</F>
            <F label="Desired Engagement Level *">{Sel(s(form.desired_engagement_level), (v) => set("desired_engagement_level", v), ENGAGE_LEVEL)}</F>
            <F label="Engagement Gap"><Input value={s(form.engagement_gap)} onChange={(e) => set("engagement_gap", e.target.value)} /></F>
            <F label="Engagement Owner"><Input value={s(form.engagement_owner)} onChange={(e) => set("engagement_owner", e.target.value)} /></F>
            <F label="Relationship Health">{Sel(s(form.relationship_health), (v) => set("relationship_health", v), REL_HEALTH)}</F>
            <F label="Engagement Strategy" full><Textarea rows={2} value={s(form.engagement_strategy)} onChange={(e) => set("engagement_strategy", e.target.value)} /></F>
          </Grid>
        </Section>

        {/* 7. Communication */}
        <Section title="7. Communication Plan">
          <Grid>
            <F label="Communication Method *">{Sel(s(form.communication_method), (v) => set("communication_method", v), COMM_METHOD)}</F>
            <F label="Frequency *">{Sel(s(form.communication_frequency), (v) => set("communication_frequency", v), COMM_FREQ)}</F>
            <F label="Format">{Sel(s(form.communication_format), (v) => set("communication_format", v), COMM_FORMAT)}</F>
            <F label="Meeting Cadence"><Input value={s(form.meeting_cadence)} onChange={(e) => set("meeting_cadence", e.target.value)} /></F>
            <F label="Communication Owner"><Input value={s(form.communication_owner)} onChange={(e) => set("communication_owner", e.target.value)} /></F>
            <F label="Last Contacted Date"><Input type="date" value={s(form.last_contacted_date)?.slice(0, 10) ?? ""} onChange={(e) => set("last_contacted_date", e.target.value || null)} /></F>
            <F label="Next Followup Date"><Input type="date" value={s(form.next_followup_date)?.slice(0, 10) ?? ""} onChange={(e) => set("next_followup_date", e.target.value || null)} /></F>
            <F label="Information Needs" full><Textarea rows={2} value={s(form.information_needs)} onChange={(e) => set("information_needs", e.target.value)} /></F>
            <F label="Reporting Needs" full><Textarea rows={2} value={s(form.reporting_needs)} onChange={(e) => set("reporting_needs", e.target.value)} /></F>
            <F label="Communication Notes" full><Textarea rows={2} value={s(form.communication_notes)} onChange={(e) => set("communication_notes", e.target.value)} /></F>
          </Grid>
        </Section>

        {/* 8. Governance */}
        <Section title="8. Governance & Approval">
          <Grid>
            <F label="Decision Authority *">{Sel(s(form.decision_authority), (v) => set("decision_authority", v), DECISION_AUTH)}</F>
            <F label="Approval Authority"><Input value={s(form.approval_authority)} onChange={(e) => set("approval_authority", e.target.value)} /></F>
            <F label="Approval Limit"><Input value={s(form.approval_limit)} onChange={(e) => set("approval_limit", e.target.value)} placeholder="e.g. $50,000" /></F>
            <F label="Sign-off Stage">{Sel(s(form.signoff_stage), (v) => set("signoff_stage", v), SIGNOFF_STAGE)}</F>
            <F label="Governance Role"><Input value={s(form.governance_role)} onChange={(e) => set("governance_role", e.target.value)} /></F>
            <F label="Escalation Path"><Input value={s(form.escalation_path)} onChange={(e) => set("escalation_path", e.target.value)} /></F>
            <F label="Approval Areas" full>
              <MultiCheck options={APPROVAL_AREAS} value={(form.approval_areas as string[]) ?? []} onChange={(v) => set("approval_areas", v)} />
            </F>
            <F label="Sign-off Required">
              <div className="flex items-center gap-2 h-10"><Switch checked={!!form.signoff_required} onCheckedChange={(v) => set("signoff_required", v)} /><span className="text-sm">{form.signoff_required ? "Yes" : "No"}</span></div>
            </F>
            <F label="Escalation Required">
              <div className="flex items-center gap-2 h-10"><Switch checked={!!form.escalation_required} onCheckedChange={(v) => set("escalation_required", v)} /><span className="text-sm">{form.escalation_required ? "Yes" : "No"}</span></div>
            </F>
          </Grid>
        </Section>

        {/* 9. RACI */}
        <Section title="9. RACI Responsibility">
          <Grid>
            <F label="RACI Role *">{Sel(s(form.raci_role), (v) => set("raci_role", v), RACI)}</F>
            <F label="Responsible For"><Input value={s(form.responsible_for)} onChange={(e) => set("responsible_for", e.target.value)} /></F>
            <F label="Accountable For"><Input value={s(form.accountable_for)} onChange={(e) => set("accountable_for", e.target.value)} /></F>
            <F label="Consulted For"><Input value={s(form.consulted_for)} onChange={(e) => set("consulted_for", e.target.value)} /></F>
            <F label="Informed For"><Input value={s(form.informed_for)} onChange={(e) => set("informed_for", e.target.value)} /></F>
          </Grid>
        </Section>

        {/* 10. Expectations */}
        <Section title="10. Expectations & Concerns">
          <Grid>
            <F label="Key Expectations" full><Textarea rows={2} value={s(form.key_expectations)} onChange={(e) => set("key_expectations", e.target.value)} /></F>
            <F label="Success Criteria" full><Textarea rows={2} value={s(form.success_criteria)} onChange={(e) => set("success_criteria", e.target.value)} /></F>
            <F label="Key Concerns" full><Textarea rows={2} value={s(form.key_concerns)} onChange={(e) => set("key_concerns", e.target.value)} /></F>
            <F label="Pain Points" full><Textarea rows={2} value={s(form.pain_points)} onChange={(e) => set("pain_points", e.target.value)} /></F>
            <F label="Business Needs" full><Textarea rows={2} value={s(form.business_needs)} onChange={(e) => set("business_needs", e.target.value)} /></F>
            <F label="Constraints" full><Textarea rows={2} value={s(form.constraints)} onChange={(e) => set("constraints", e.target.value)} /></F>
            <F label="Assumptions" full><Textarea rows={2} value={s(form.assumptions)} onChange={(e) => set("assumptions", e.target.value)} /></F>
          </Grid>
        </Section>

        {/* 11. Risk */}
        <Section title="11. Risk & Issue Linkage">
          <Grid>
            <F label="Stakeholder Risk Level">{Sel(s(form.stakeholder_risk_level), (v) => set("stakeholder_risk_level", v), HML)}</F>
            <F label="Possible Project Impact">{Sel(s(form.possible_project_impact), (v) => set("possible_project_impact", v), POSSIBLE_IMPACT)}</F>
            <F label="Risk Description" full><Textarea rows={2} value={s(form.risk_description)} onChange={(e) => set("risk_description", e.target.value)} /></F>
            <F label="Mitigation Plan" full><Textarea rows={2} value={s(form.mitigation_plan)} onChange={(e) => set("mitigation_plan", e.target.value)} /></F>
            <F label="Issue History" full><Textarea rows={2} value={s(form.issue_history)} onChange={(e) => set("issue_history", e.target.value)} /></F>
            <F label="Open Actions" full><Textarea rows={2} value={s(form.open_actions)} onChange={(e) => set("open_actions", e.target.value)} /></F>
            <F label="Escalation Notes" full><Textarea rows={2} value={s(form.escalation_notes)} onChange={(e) => set("escalation_notes", e.target.value)} /></F>
          </Grid>
        </Section>

        {/* 12. Change Mgmt */}
        <Section title="12. Change Management">
          <Grid>
            <F label="Change Impact Level">{Sel(s(form.change_impact_level), (v) => set("change_impact_level", v), HML)}</F>
            <F label="Change Readiness">{Sel(s(form.change_readiness), (v) => set("change_readiness", v), CHANGE_READY)}</F>
            <F label="Adoption Owner"><Input value={s(form.adoption_owner)} onChange={(e) => set("adoption_owner", e.target.value)} /></F>
            <F label="Training Required">
              <div className="flex items-center gap-2 h-10"><Switch checked={!!form.training_required} onCheckedChange={(v) => set("training_required", v)} /><span className="text-sm">{form.training_required ? "Yes" : "No"}</span></div>
            </F>
            <F label="Resistance Reason" full><Textarea rows={2} value={s(form.resistance_reason)} onChange={(e) => set("resistance_reason", e.target.value)} /></F>
            <F label="Change Management Strategy" full><Textarea rows={2} value={s(form.change_management_strategy)} onChange={(e) => set("change_management_strategy", e.target.value)} /></F>
          </Grid>
        </Section>

        {/* 13. Notes */}
        <Section title="13. Notes & Attachments">
          <Grid>
            <F label="Tags" full><TagsInput value={(form.tags as string[]) ?? []} onChange={(t) => set("tags", t)} /></F>
            <F label="Attachments (URLs)" full><MultiTextInput value={(form.attachments as string[]) ?? []} onChange={(v) => set("attachments", v)} placeholder="Paste URL and press Enter" /></F>
            <F label="Related Documents (URLs)" full><MultiTextInput value={(form.related_documents as string[]) ?? []} onChange={(v) => set("related_documents", v)} placeholder="Paste URL and press Enter" /></F>
            <F label="Meeting Notes" full><Textarea rows={3} value={s(form.meeting_notes)} onChange={(e) => set("meeting_notes", e.target.value)} /></F>
            <F label="General Notes" full><Textarea rows={3} value={s(form.notes)} onChange={(e) => set("notes", e.target.value)} /></F>
          </Grid>
        </Section>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => navigate(`/crm/companies/${companyId}`)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}><Save className="h-4 w-4 mr-1" />{saving ? "Saving…" : "Save Stakeholder"}</Button>
        </div>
      </div>
    </AppShell>
  );
}

/* ---------- helpers ---------- */
function s(v: unknown): string { return (v ?? "") as string; }

function Sel(value: string, onChange: (v: string) => void, options: string[]) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b">{title}</h2>
      {children}
    </Card>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? "md:col-span-2" : ""}`}>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function MultiCheck({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (o: string) => {
    onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button type="button" key={o} onClick={() => toggle(o)}
            className={`text-xs px-2.5 py-1 rounded-full border transition ${on ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent border-input"}`}>
            {o}
          </button>
        );
      })}
    </div>
  );
}