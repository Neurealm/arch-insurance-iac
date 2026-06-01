import {
  Building2,
  Briefcase,
  Layers,
  Workflow as WorkflowIcon,
  GitBranch,
  Activity,
  CheckSquare,
  Network,
  type LucideIcon,
} from "lucide-react";

export type OrgLevelKey =
  | "business_units"
  | "practices"
  | "capability_areas"
  | "service_functions"
  | "workflows"
  | "activities"
  | "tasks";

export type OrgLevel = {
  key: OrgLevelKey;
  label: string;
  singular: string;
  table: string;
  slug: string;
  icon: LucideIcon;
  parent?: OrgLevelKey;
  parentFk?: string;
  child?: OrgLevelKey;
};

export const ORG_LEVELS: Record<OrgLevelKey, OrgLevel> = {
  business_units: {
    key: "business_units",
    label: "Business Units",
    singular: "Business Unit",
    table: "org_business_units",
    slug: "business-units",
    icon: Building2,
  },
  practices: {
    key: "practices",
    label: "Practices",
    singular: "Practice",
    table: "org_practices",
    slug: "practices",
    icon: Briefcase,
    child: "capability_areas",
  },
  capability_areas: {
    key: "capability_areas",
    label: "Capability Areas",
    singular: "Capability Area",
    table: "org_capability_areas",
    slug: "capability-areas",
    icon: Layers,
    parent: "practices",
    parentFk: "practice_id",
    child: "service_functions",
  },
  service_functions: {
    key: "service_functions",
    label: "Service Functions",
    singular: "Service Function",
    table: "org_service_functions",
    slug: "service-functions",
    icon: GitBranch,
    parent: "capability_areas",
    parentFk: "capability_area_id",
    child: "workflows",
  },
  workflows: {
    key: "workflows",
    label: "Workflows",
    singular: "Workflow",
    table: "org_workflows",
    slug: "workflows",
    icon: WorkflowIcon,
    parent: "service_functions",
    parentFk: "service_function_id",
    child: "activities",
  },
  activities: {
    key: "activities",
    label: "Activities",
    singular: "Activity",
    table: "org_activities",
    slug: "activities",
    icon: Activity,
    parent: "workflows",
    parentFk: "workflow_id",
    child: "tasks",
  },
  tasks: {
    key: "tasks",
    label: "Tasks",
    singular: "Task",
    table: "org_tasks",
    slug: "tasks",
    icon: CheckSquare,
    parent: "activities",
    parentFk: "activity_id",
  },
};

export const ORG_LEVEL_ORDER: OrgLevelKey[] = [
  "business_units",
  "practices",
  "capability_areas",
  "service_functions",
  "workflows",
  "activities",
  "tasks",
];

export const HIERARCHY_ICON = Network;

export function levelBySlug(slug: string): OrgLevel | undefined {
  return Object.values(ORG_LEVELS).find((l) => l.slug === slug);
}