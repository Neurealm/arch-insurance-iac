import { Laptop, Network, Server, Cloud, type LucideIcon } from "lucide-react";

export type CarveOutChild = { title: string; slug: string };
export type CarveOutGroup = {
  key: string;
  title: string;
  icon: LucideIcon;
  children: CarveOutChild[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[\/]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const mk = (titles: string[]): CarveOutChild[] =>
  titles.map((t) => ({ title: t, slug: slugify(t) }));

export const carveOutGroups: CarveOutGroup[] = [
  {
    key: "euc",
    title: "End User Compute & Workforce Enablement",
    icon: Laptop,
    children: mk([
      "Workforce Readiness Command Center (Day 1 View)",
      "Device Provisioning Factory (Global View)",
      "Golden Image & Configuration Control Plane",
      "Persona-Based Device Assignment Engine",
      "Identity & Access Cutover Dashboard",
      "VDI & Day 1 Continuity Layer",
      "Global Logistics & Field Services Orchestration",
      "Endpoint Health & Experience Monitoring",
      "Digital Coworker – EUC Automation Console",
      "Self-Service & Agentic Support Experience",
      "Asset Lifecycle & Financial Optimization",
    ]),
  },
  {
    key: "network",
    title: "Network & Connectivity Engineering",
    icon: Network,
    children: mk([
      "Global Network Separation Command Center (Day 1 View)",
      "Network Topology & Architecture Control Plane",
      "Site Connectivity Readiness Dashboard",
      "WAN / SD-WAN Orchestration Console",
      "Data Center & Cloud Connectivity Fabric",
      "Firewall, Security & Zero Trust Control Layer",
      "Network Provisioning & Build Factory",
      "Field Network Deployment Orchestration",
      "NOC Operations Command Center (Live Ops)",
      "Network Experience & Performance Analytics",
      "Digital Coworker – Network Automation Console",
      "Network Cost & Vendor Optimization Dashboard",
    ]),
  },
  {
    key: "infra",
    title: "Infrastructure & Hybrid Platform Operations",
    icon: Server,
    children: mk([
      "Infrastructure Separation Command Center (Day 1 View)",
      "Data Center Topology & Dependency Mapping Control Plane",
      "Environment Carve-Out & Replication Tracker",
      "Server Provisioning & Build Factory (Compute Layer)",
      "Storage & Data Platform Readiness Dashboard",
      "Hybrid Infrastructure Placement Decision Engine (On-Prem vs Cloud)",
      "Data Center Exit & Migration Orchestration Console",
      "Field Infrastructure Deployment & Rack Integration Tracker",
      "Infrastructure Operations Command Center (Live Ops)",
      "Workload Performance & Capacity Analytics",
      "Digital Coworker – Infrastructure Automation Console",
      "Infrastructure Cost, Capacity & Optimization (FinOps for Infra)",
    ]),
  },
  {
    key: "cloud",
    title: "Cloud Strategy & Migration",
    icon: Cloud,
    children: mk([
      "Cloud Transformation Command Center (Day 1 & Future-State View)",
      "Cloud Architecture & Landing Zone Control Plane",
      "Application Portfolio Rationalization & Migration Decision Engine",
      "Migration Wave Planning & Execution Orchestration Console",
      "Hybrid Cloud Connectivity & Integration Fabric",
      "Multi-Region Resiliency & Disaster Recovery Control Layer",
      "Cloud Migration Factory (Build, Deploy, Validate)",
      "Cloud Security & Governance (CSPM / Policy Control Plane)",
      "Cloud Operations Command Center (Live Ops)",
      "Cloud Performance, Reliability & Experience Analytics",
      "Digital Coworker – Cloud Automation Marketplace",
      "Cloud FinOps, Cost Optimization & Value Realization Dashboard",
    ]),
  },
];

export const findCarveOutPage = (groupKey?: string, slug?: string) => {
  const group = carveOutGroups.find((g) => g.key === groupKey);
  if (!group) return null;
  const child = group.children.find((c) => c.slug === slug);
  if (!child) return null;
  return { group, child };
};
