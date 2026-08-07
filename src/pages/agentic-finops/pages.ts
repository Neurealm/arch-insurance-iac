import {
  Gauge, Trash2, PiggyBank, Timer, HardDrive, Network, Boxes, Container, ShieldCheck, LayoutDashboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FinPage {
  slug: string;
  title: string;
  navLabel: string;
  group: string;
  icon: LucideIcon;
  subtitle: string;
  breadcrumb: string;
}

export const finGroups = ["Executive", "Optimization Intelligence", "Governance"] as const;

export const finPages: FinPage[] = [
  {
    slug: "overview",
    navLabel: "Executive Overview",
    title: "Agentic FinOps — Executive Overview",
    group: "Executive",
    icon: LayoutDashboard,
    breadcrumb: "Executive Overview",
    subtitle:
      "Portfolio-level view of cloud spend, identified opportunity, realization, and governance across every optimization domain.",
  },

  {
    slug: "resource-rightsizing",
    navLabel: "Resource Rightsizing",
    title: "Resource Rightsizing Decision Workspace",
    group: "Optimization Intelligence",
    icon: Gauge,
    breadcrumb: "Resource Rightsizing",
    subtitle:
      "Turning native optimization signals into safe, executable, financially verified engineering changes.",
  },
  {
    slug: "idle-orphaned-resources",
    navLabel: "Idle & Orphaned Resources",
    title: "Idle & Orphaned Resource Reclamation Workspace",
    group: "Optimization Intelligence",
    icon: Trash2,
    breadcrumb: "Idle & Orphaned Resources",
    subtitle:
      "Discover, validate, and reclaim unused cloud resources with full dependency, ownership, and risk analysis.",
  },
  {
    slug: "commitment-optimization",
    navLabel: "Commitment Optimization",
    title: "Commitment Optimization Workspace",
    group: "Optimization Intelligence",
    icon: PiggyBank,
    breadcrumb: "Commitment Optimization",
    subtitle:
      "Maximize savings through intelligent commitment planning, continuous coverage analysis, and dynamic rebalancing.",
  },
  {
    slug: "elasticity-scheduling",
    navLabel: "Elasticity & Scheduling",
    title: "Elasticity & Scheduling Workspace",
    group: "Optimization Intelligence",
    icon: Timer,
    breadcrumb: "Elasticity & Scheduling",
    subtitle:
      "Optimize runtime by aligning compute to real demand patterns with intelligent scheduling, scale policies, and automation.",
  },
  {
    slug: "storage-data-lifecycle",
    navLabel: "Storage & Data Lifecycle",
    title: "Storage & Data Lifecycle Workspace",
    group: "Optimization Intelligence",
    icon: HardDrive,
    breadcrumb: "Storage & Data Lifecycle",
    subtitle:
      "Optimize storage cost by aligning data with access patterns, business value, compliance, and lifecycle policy.",
  },
  {
    slug: "network-data-movement",
    navLabel: "Network & Data Movement",
    title: "Network & Data Movement Workspace",
    group: "Optimization Intelligence",
    icon: Network,
    breadcrumb: "Network & Data Movement",
    subtitle:
      "Identify and optimize inefficient traffic flows, egress cost, cross-region movement, and networking resources.",
  },
  {
    slug: "platform-architecture-efficiency",
    navLabel: "Platform & Architecture Efficiency",
    title: "Platform & Architecture Efficiency Workspace",
    group: "Optimization Intelligence",
    icon: Boxes,
    breadcrumb: "Platform & Architecture Efficiency",
    subtitle:
      "Identify higher-value architectural alternatives based on cost, performance, resilience, operational complexity, and business outcomes.",
  },
  {
    slug: "kubernetes-economics",
    navLabel: "Kubernetes Economics",
    title: "Kubernetes Economics Workspace",
    group: "Optimization Intelligence",
    icon: Container,
    breadcrumb: "Kubernetes Economics",
    subtitle:
      "Reduce Kubernetes waste across compute, requests and limits, storage, networking, and cluster operations.",
  },
  {
    slug: "governance-realization",
    navLabel: "Governance & Realization",
    title: "Governance & Realization Workspace",
    group: "Governance",
    icon: ShieldCheck,
    breadcrumb: "Governance & Realization",
    subtitle:
      "Drive FinOps accountability, policy compliance, and measurable business value. Govern spend, enforce standards, track commitments, and realize financial and operational outcomes.",
  },
];

export const finBase = "/agentic-finops";
export const finDefaultSlug = "resource-rightsizing";

/* Back-compat aliases */
export type FinOpsPage = FinPage;
export const finopsPages = finPages;
export const finopsGroups = finGroups;
export const finopsBase = finBase;
