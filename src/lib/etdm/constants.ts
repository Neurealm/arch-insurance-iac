// Controlled values for ETDM Technology records — kept in one place so future
// migration to lookup tables does not require touching every screen.

export const ETDM_CATEGORIES = [
  "Server","Operating System","Database","Network","Security","Cloud","Virtualization",
  "Container Platform","Middleware","Application Platform","Enterprise Application","SaaS",
  "Data Platform","Observability","Automation","End User Computing","Collaboration","Storage",
  "Backup and Recovery","Other",
] as const;

export const ETDM_TECH_TYPES = [
  "Infrastructure","Platform","Application","Service","Tool","Framework","Appliance",
  "Managed Service","SaaS","Other",
] as const;

export const ETDM_LIFECYCLE_STATUSES = [
  "Emerging","Evaluation","Strategic","Active","Maintenance","Legacy","Deprecated","End of Support","Retired",
] as const;

export const ETDM_CRITICALITIES = [
  "Mission Critical","Business Critical","Important","Standard","Noncritical",
] as const;

export const ETDM_MATURITIES = [
  "Emerging","Developing","Established","Mature","Strategic","Legacy",
] as const;

export const ETDM_APPROVAL_STATUSES = [
  "Draft","In Review","Approved","Rejected","Retired",
] as const;

export const ETDM_VISIBILITIES = [
  "Internal Restricted","Internal","Future Customer Eligible",
] as const;

// Neurealm practices — the internal delivery organizations that own a technology.
// Controlled values enforced by a CHECK constraint on etdm_technologies.neurealm_practice.
export const ETDM_PRACTICES = [
  "AI",
  "Product Engineering",
  "RunOps",
  "Cyber",
  "S.E.A.D.",
  "Versa",
] as const;
export type EtdmPractice = typeof ETDM_PRACTICES[number];

// The 16 approved ETDM master domains.
export const ETDM_MASTER_DOMAINS = [
  "Business & Services",
  "Business Outcomes",
  "Architecture",
  "Engineering",
  "Platform & Applications",
  "Infrastructure",
  "Networking & Connectivity",
  "Cybersecurity",
  "Identity & Access Management",
  "Data & Information",
  "Observability & Operational Intelligence",
  "Reliability & Resilience",
  "Operations & Support",
  "Automation & AI",
  "Configuration & Knowledge",
  "Enterprise Governance",
] as const;

export const ETDM_DEPLOYMENT_MODELS = ["On-Premises","Private Cloud","Public Cloud","Hybrid","SaaS","Edge","Air-Gapped"] as const;
export const ETDM_CLOUD_PROVIDERS = ["AWS","Azure","GCP","OCI","IBM Cloud","Alibaba","Other"] as const;
export const ETDM_HYPERVISORS = ["VMware vSphere","Microsoft Hyper-V","Nutanix AHV","KVM","Citrix Hypervisor","Xen","Other"] as const;

export const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
