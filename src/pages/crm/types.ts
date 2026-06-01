export type Priority = "High" | "Medium" | "Low";
export type Influence = "High" | "Medium" | "Low";
export type CompanyType = "Customer" | "Partner" | "Vendor" | "Prospect";

export type Company = {
  id: string;
  name: string;
  industry: string;
  company_type: CompanyType;
  website: string;
  email: string;
  phone: string;
  address: string;
  account_owner: string;
  status: boolean;
  priority: Priority;
  notes: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  tenant_id?: string | null;
  lifecycle_stage?: string;
};

export type Department = {
  id: string;
  company_id: string;
  name: string;
  head_stakeholder_id: string | null;
  description: string;
};

export type Team = {
  id: string;
  company_id: string;
  department_id: string | null;
  name: string;
  lead_stakeholder_id: string | null;
  description: string;
};

export type Stakeholder = {
  id: string;
  company_id: string;
  department_id: string | null;
  team_id: string | null;
  first_name: string;
  last_name: string;
  job_title: string;
  emails: string[];
  phones: string[];
  linkedin: string;
  influence_level: Influence;
  reporting_manager_id: string | null;
  status: boolean;
  notes: string;
  tags: string[];
  photo_url: string;
};

export type Activity = {
  id: string;
  company_id: string;
  stakeholder_id: string | null;
  type: string;
  subject: string;
  occurred_at: string;
  description: string;
};

export type Note = {
  id: string;
  company_id: string;
  stakeholder_id: string | null;
  body: string;
  author: string;
  created_at: string;
};