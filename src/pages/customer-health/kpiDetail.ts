// Enriched primary KPI area for the Customer Health Overview.
//
// Each KPI answers a customer question ("am I affected?") rather than reporting
// telemetry. The drawer payloads below decompose each KPI into the entities the
// customer actually consumes.
//
// RULE: an unhealthy Azure/infrastructure condition is NEVER presented as a
// degraded customer service unless telemetry demonstrates customer impact. Every
// row therefore carries BOTH an underlying condition and a customer-impact verdict.

import type {
  CustomerImpactContext, DetailGroup, DetailMetric, KpiTile,
} from "./types";

/* ------------------------------- KPI tiles -------------------------------- */

export const overviewKpis: KpiTile[] = [
  {
    id: "k-health", label: "Overall Health", question: "Are my services healthy right now?",
    value: "Healthy", caption: "No impact to your services",
    status: "healthy", icon: "shield", contextId: "overall-health",
    facets: [
      { label: "Services", value: "6 / 6", status: "healthy" },
      { label: "Impacting events", value: "0", status: "healthy" },
      { label: "Advisories", value: "1", status: "advisory" },
    ],
  },
  {
    id: "k-services", label: "Services", question: "Is everything I consume working?",
    value: "6 / 6 Healthy", caption: "0 degraded · 0 impacted",
    status: "healthy", icon: "layers", contextId: "services",
    facets: [
      { label: "Advisories", value: "1", status: "advisory" },
      { label: "Availability", value: "99.997%", status: "healthy" },
    ],
  },
  {
    id: "k-deploy", label: "Deployments", question: "Where do I run, and is it healthy?",
    value: "8 Deployments", caption: "Across 3 regions · 1 DR",
    status: "info", icon: "box", contextId: "deployments",
    facets: [
      { label: "Healthy", value: "7", status: "healthy" },
      { label: "At risk", value: "1", status: "at-risk" },
    ],
  },
  {
    id: "k-avail", label: "24-Hour Availability", question: "Did my service stay up?",
    value: "99.997%", caption: "Target 99.99% · met",
    status: "healthy", icon: "trend", contextId: "availability-24h",
    facets: [
      { label: "Unavailable", value: "0.0 min", status: "healthy" },
      { label: "Degraded", value: "4.3 min", status: "advisory" },
    ],
  },
  {
    id: "k-events", label: "Active Events", question: "Is anything open against me?",
    value: "1 Open", caption: "No event is impacting you",
    status: "advisory", icon: "bell", contextId: "active-events",
    facets: [
      { label: "Advisories", value: "1", status: "advisory" },
      { label: "Degradations", value: "0", status: "healthy" },
      { label: "Incidents", value: "0", status: "healthy" },
    ],
  },
  {
    id: "k-risk", label: "At-Risk Deployments", question: "Could anything affect me soon?",
    value: "1 Deployment", caption: "Production – West US 2",
    status: "at-risk", icon: "warning", contextId: "at-risk-deployments",
    facets: [
      { label: "Risk", value: "Elevated", status: "at-risk" },
      { label: "Trend", value: "Stable", status: "healthy" },
    ],
  },
  {
    id: "k-azure", label: "Azure Dependencies", question: "Is the cloud underneath me healthy?",
    value: "17 / 18 Healthy", caption: "1 degraded · 0 reaching you",
    status: "info", icon: "cloud", contextId: "azure-dependencies",
    facets: [
      { label: "Customer exposure", value: "1", status: "advisory" },
      { label: "Customer impact", value: "0", status: "healthy" },
    ],
  },
];

/* --------------------------- drawer enrichments --------------------------- */

type Overlay = { metrics?: DetailMetric[]; groups?: DetailGroup[]; subtitle?: string };

const noAction =
  "No action required. We will continue to monitor on your behalf and update you if the situation changes.";

export const kpiOverlays: Record<string, Overlay> = {
  "overall-health": {
    subtitle: "Rolled up across every service, deployment and dependency you consume",
    metrics: [
      { label: "Overall customer health", value: "Healthy", caption: "No impact to your services", status: "healthy" },
      { label: "Deployments", value: "8", caption: "3 regions · 1 DR", status: "info" },
      { label: "Healthy services", value: "6 / 6", caption: "0 degraded", status: "healthy" },
      { label: "Infrastructure condition", value: "1 Degraded", caption: "Azure Blob Storage – West US 2", status: "advisory" },
      { label: "Customer-impacting events", value: "0", caption: "None open", status: "healthy" },
      { label: "Potential-impact events", value: "1", caption: "Advisory, monitored", status: "advisory" },
      { label: "Availability (24h)", value: "99.997%", caption: "Target 99.99%", status: "healthy" },
      { label: "Availability (30d)", value: "99.991%", caption: "Target 99.99%", status: "healthy" },
      { label: "SLO position", value: "Met", caption: "93.4% error budget remaining", status: "healthy" },
      { label: "Last customer-impacting event", value: "41 days ago", caption: "Apr 09 · Identity Gateway · 6 min", status: "info" },
    ],
    groups: [
      {
        title: "Health composition",
        caption: "How the single roll-up above is derived. Underlying conditions are reported separately from customer impact.",
        rows: [
          {
            label: "Customer experience", status: "healthy", impact: "NO CURRENT IMPACT",
            note: "Measured at the customer edge from synthetic journeys and real traffic.",
            fields: [
              { label: "Journey success", value: "100%", status: "healthy" },
              { label: "Request success", value: "99.997%", status: "healthy" },
              { label: "p95 latency", value: "218 ms", status: "healthy" },
            ],
          },
          {
            label: "Your platform (managed by us)", status: "healthy", impact: "NO CURRENT IMPACT",
            note: "Orchestration, control plane and data path we operate for you.",
            fields: [
              { label: "Deployments healthy", value: "7 / 8", status: "healthy" },
              { label: "At risk", value: "1", status: "at-risk" },
              { label: "Failovers armed", value: "Yes", status: "healthy" },
            ],
          },
          {
            label: "Cloud provider (Azure)", status: "advisory", impact: "NO CURRENT IMPACT",
            note: "One dependency is degraded upstream. Telemetry shows it is absorbed and is not reaching your users.",
            fields: [
              { label: "Dependencies healthy", value: "17 / 18", status: "advisory" },
              { label: "Reaching customers", value: "0", status: "healthy" },
              { label: "Absorbed by design", value: "1", status: "healthy" },
            ],
          },
        ],
      },
    ],
  },

  services: {
    subtitle: "6 of 6 customer-consumed services healthy",
    metrics: [
      { label: "Healthy", value: "6", status: "healthy" },
      { label: "Degraded", value: "0", status: "healthy" },
      { label: "Impacted", value: "0", status: "healthy" },
      { label: "Open advisories", value: "1", status: "advisory" },
    ],
    groups: [
      {
        title: "Services you consume",
        caption: "Each service decomposed to its deployment, region, dependencies and actual customer impact.",
        rows: [
          {
            label: "Orchestration API", status: "healthy", impact: "NO CURRENT IMPACT",
            note: "Dependencies: Compute, Identity, Networking, Control Plane.",
            fields: [
              { label: "Deployment", value: "Production – East US" },
              { label: "Region", value: "East US" },
              { label: "Health", value: "Healthy", status: "healthy" },
              { label: "Availability (24h)", value: "99.999%", status: "healthy" },
              { label: "Active advisories", value: "0", status: "healthy" },
            ],
          },
          {
            label: "Event Processing", status: "healthy", impact: "NO CURRENT IMPACT",
            note: "Dependencies: Compute, Service Bus, Networking.",
            fields: [
              { label: "Deployment", value: "Production – East US" },
              { label: "Region", value: "East US" },
              { label: "Health", value: "Healthy", status: "healthy" },
              { label: "Availability (24h)", value: "99.998%", status: "healthy" },
              { label: "Active advisories", value: "0", status: "healthy" },
            ],
          },
          {
            label: "Document Store", status: "healthy", impact: "NO CURRENT IMPACT",
            note: "Underlying Azure Blob Storage in West US 2 is degraded; writes are being served from a healthy replica, so your experience is unchanged.",
            fields: [
              { label: "Deployment", value: "Production – West US 2" },
              { label: "Region", value: "West US 2" },
              { label: "Health", value: "Healthy", status: "healthy" },
              { label: "Availability (24h)", value: "99.982%", status: "healthy" },
              { label: "Dependency condition", value: "Blob Storage degraded", status: "advisory" },
              { label: "Active advisories", value: "1", status: "advisory" },
            ],
          },
          {
            label: "Identity Gateway", status: "healthy", impact: "NO CURRENT IMPACT",
            note: "Dependencies: Entra ID, DNS, Networking.",
            fields: [
              { label: "Deployment", value: "Production – East US" },
              { label: "Region", value: "East US" },
              { label: "Health", value: "Healthy", status: "healthy" },
              { label: "Availability (24h)", value: "99.999%", status: "healthy" },
              { label: "Active advisories", value: "0", status: "healthy" },
            ],
          },
          {
            label: "Reporting", status: "healthy", impact: "NO CURRENT IMPACT",
            note: "Dependencies: Compute, Storage, Analytics.",
            fields: [
              { label: "Deployment", value: "Production – Central US" },
              { label: "Region", value: "Central US" },
              { label: "Health", value: "Healthy", status: "healthy" },
              { label: "Availability (24h)", value: "99.996%", status: "healthy" },
              { label: "Active advisories", value: "0", status: "healthy" },
            ],
          },
          {
            label: "Notification Delivery", status: "healthy", impact: "NO CURRENT IMPACT",
            note: "Dependencies: Compute, Networking, Email/SMS providers.",
            fields: [
              { label: "Deployment", value: "Production – North Europe" },
              { label: "Region", value: "North Europe" },
              { label: "Health", value: "Healthy", status: "healthy" },
              { label: "Availability (24h)", value: "99.997%", status: "healthy" },
              { label: "Active advisories", value: "0", status: "healthy" },
            ],
          },
        ],
      },
    ],
  },

  deployments: {
    subtitle: "8 deployments across 3 regions",
    metrics: [
      { label: "Production", value: "5", status: "healthy" },
      { label: "Disaster recovery", value: "1", status: "healthy" },
      { label: "Development", value: "2", status: "info" },
      { label: "Regions", value: "3", status: "info" },
    ],
    groups: [
      {
        title: "Your deployment inventory",
        caption: "Compute, storage, network and supporting-service health for every environment you own.",
        rows: [
          {
            label: "Production – East US", status: "healthy", impact: "NO CURRENT IMPACT",
            fields: [
              { label: "Classification", value: "Production" },
              { label: "Region", value: "East US" },
              { label: "Nodes / resources", value: "12 nodes · 46 resources" },
              { label: "Overall health", value: "Healthy", status: "healthy" },
              { label: "Compute", value: "Healthy", status: "healthy" },
              { label: "Storage", value: "Healthy", status: "healthy" },
              { label: "Network", value: "Healthy", status: "healthy" },
              { label: "Supporting services", value: "Healthy", status: "healthy" },
              { label: "Availability (24h)", value: "99.999%", status: "healthy" },
              { label: "Current risk", value: "Low", status: "healthy" },
              { label: "Active events", value: "0", status: "healthy" },
            ],
          },
          {
            label: "Production – West US 2", status: "advisory", impact: "NO CURRENT IMPACT",
            note: "Storage layer is degraded upstream. Customer traffic is unaffected; the deployment is classified at risk, not impacted.",
            fields: [
              { label: "Classification", value: "Production" },
              { label: "Region", value: "West US 2" },
              { label: "Nodes / resources", value: "8 nodes · 31 resources" },
              { label: "Overall health", value: "Healthy (at risk)", status: "at-risk" },
              { label: "Compute", value: "Healthy", status: "healthy" },
              { label: "Storage", value: "Degraded", status: "advisory" },
              { label: "Network", value: "Healthy", status: "healthy" },
              { label: "Supporting services", value: "Healthy", status: "healthy" },
              { label: "Availability (24h)", value: "99.982%", status: "healthy" },
              { label: "Current risk", value: "Elevated", status: "at-risk" },
              { label: "Active events", value: "1 advisory", status: "advisory" },
            ],
          },
          {
            label: "DR – Central US", status: "healthy", impact: "NO CURRENT IMPACT",
            fields: [
              { label: "Classification", value: "Disaster recovery" },
              { label: "Region", value: "Central US" },
              { label: "Nodes / resources", value: "6 nodes · 22 resources" },
              { label: "Overall health", value: "Healthy", status: "healthy" },
              { label: "Compute", value: "Healthy", status: "healthy" },
              { label: "Storage", value: "Healthy", status: "healthy" },
              { label: "Network", value: "Healthy", status: "healthy" },
              { label: "Supporting services", value: "Healthy", status: "healthy" },
              { label: "Availability (24h)", value: "100.00%", status: "healthy" },
              { label: "Current risk", value: "Low", status: "healthy" },
              { label: "Active events", value: "0", status: "healthy" },
            ],
          },
          {
            label: "Production – North Europe", status: "healthy", impact: "NO CURRENT IMPACT",
            fields: [
              { label: "Classification", value: "Production" },
              { label: "Region", value: "North Europe" },
              { label: "Nodes / resources", value: "6 nodes · 19 resources" },
              { label: "Overall health", value: "Healthy", status: "healthy" },
              { label: "Compute", value: "Healthy", status: "healthy" },
              { label: "Storage", value: "Healthy", status: "healthy" },
              { label: "Network", value: "Healthy", status: "healthy" },
              { label: "Supporting services", value: "Healthy", status: "healthy" },
              { label: "Availability (24h)", value: "99.997%", status: "healthy" },
              { label: "Current risk", value: "Low", status: "healthy" },
              { label: "Active events", value: "0", status: "healthy" },
            ],
          },
          {
            label: "Development – East US", status: "healthy", impact: "NO CURRENT IMPACT",
            fields: [
              { label: "Classification", value: "Development" },
              { label: "Region", value: "East US" },
              { label: "Nodes / resources", value: "3 nodes · 11 resources" },
              { label: "Overall health", value: "Healthy", status: "healthy" },
              { label: "Compute", value: "Healthy", status: "healthy" },
              { label: "Storage", value: "Healthy", status: "healthy" },
              { label: "Network", value: "Healthy", status: "healthy" },
              { label: "Supporting services", value: "Healthy", status: "healthy" },
              { label: "Availability (24h)", value: "99.94%", status: "healthy" },
              { label: "Current risk", value: "Low", status: "healthy" },
              { label: "Active events", value: "0", status: "healthy" },
            ],
          },
        ],
      },
    ],
  },

  "availability-24h": {
    subtitle: "Measured at the customer edge, not at the infrastructure layer",
    metrics: [
      { label: "24-hour", value: "99.997%", caption: "Target met", status: "healthy" },
      { label: "7-day", value: "99.994%", caption: "Target met", status: "healthy" },
      { label: "30-day", value: "99.991%", caption: "Target met", status: "healthy" },
      { label: "90-day", value: "99.993%", caption: "Target met", status: "healthy" },
      { label: "SLO target", value: "99.99%", caption: "Contractual", status: "info" },
      { label: "Current attainment", value: "99.991%", caption: "30-day window", status: "healthy" },
      { label: "Error budget consumed", value: "6.6%", caption: "of the 30-day budget", status: "healthy" },
      { label: "Error budget remaining", value: "93.4%", caption: "≈ 40.4 minutes", status: "healthy" },
    ],
    groups: [
      {
        title: "Degraded vs unavailable",
        caption: "Degraded means slower or partially reduced service. Unavailable means requests could not be served. Only unavailable minutes count against availability.",
        rows: [
          {
            label: "Unavailable service", status: "healthy", impact: "NO CURRENT IMPACT",
            note: "Requests that could not be served at all.",
            fields: [
              { label: "Last 24 hours", value: "0.0 min", status: "healthy" },
              { label: "Last 7 days", value: "0.6 min", status: "healthy" },
              { label: "Last 30 days", value: "3.9 min", status: "healthy" },
              { label: "Counts against SLO", value: "Yes" },
            ],
          },
          {
            label: "Degraded service", status: "advisory", impact: "NO CURRENT IMPACT",
            note: "Service continued to serve requests with reduced performance. Your users completed every journey.",
            fields: [
              { label: "Last 24 hours", value: "4.3 min", status: "advisory" },
              { label: "Last 7 days", value: "18.1 min", status: "advisory" },
              { label: "Last 30 days", value: "62.4 min", status: "advisory" },
              { label: "Counts against SLO", value: "No — tracked separately" },
            ],
          },
        ],
      },
      {
        title: "Availability by deployment",
        rows: [
          {
            label: "Production – East US", status: "healthy",
            fields: [
              { label: "24h", value: "99.999%", status: "healthy" },
              { label: "7d", value: "99.998%", status: "healthy" },
              { label: "30d", value: "99.996%", status: "healthy" },
              { label: "Unavailable (30d)", value: "1.7 min" },
            ],
          },
          {
            label: "Production – West US 2", status: "advisory",
            fields: [
              { label: "24h", value: "99.982%", status: "healthy" },
              { label: "7d", value: "99.987%", status: "healthy" },
              { label: "30d", value: "99.981%", status: "healthy" },
              { label: "Degraded (30d)", value: "51.2 min", status: "advisory" },
            ],
          },
          {
            label: "Production – North Europe", status: "healthy",
            fields: [
              { label: "24h", value: "99.997%", status: "healthy" },
              { label: "7d", value: "99.995%", status: "healthy" },
              { label: "30d", value: "99.993%", status: "healthy" },
              { label: "Unavailable (30d)", value: "3.0 min" },
            ],
          },
        ],
      },
    ],
  },

  "azure-dependencies": {
    subtitle: "17 of 18 provider dependencies healthy · 0 reaching your users",
    metrics: [
      { label: "Healthy", value: "17", status: "healthy" },
      { label: "Degraded", value: "1", status: "advisory" },
      { label: "Customer exposure", value: "1", caption: "Absorbed", status: "advisory" },
      { label: "Actual customer impact", value: "0", status: "healthy" },
    ],
    groups: [
      {
        title: "Compute",
        rows: [
          { label: "Virtual Machines (East US, West US 2, Central US)", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Direct" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "18s ago" }] },
          { label: "Virtual Machine Scale Sets", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Direct" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "22s ago" }] },
          { label: "Kubernetes Service (AKS)", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Direct" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "15s ago" }] },
        ],
      },
      {
        title: "Storage",
        rows: [
          {
            label: "Blob Storage – West US 2", status: "degraded", impact: "NO CURRENT IMPACT",
            note: "Provider-side latency is elevated. Your writes are served from a healthy replica, so telemetry shows no customer impact. This is reported as an underlying condition only.",
            fields: [
              { label: "Underlying health", value: "Degraded", status: "degraded" },
              { label: "Customer exposure", value: "Document Store writes (absorbed)", status: "advisory" },
              { label: "Actual customer impact", value: "None observed", status: "healthy" },
              { label: "Trend", value: "Improving", status: "healthy" },
              { label: "Last telemetry", value: "9s ago" },
            ],
          },
          { label: "Managed Disks", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Direct" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "20s ago" }] },
          { label: "Files & Backup Vault", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Indirect" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "37s ago" }] },
        ],
      },
      {
        title: "Networking",
        rows: [
          { label: "Virtual Network / Peering", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Direct" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "12s ago" }] },
          { label: "Load Balancer / Application Gateway", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Direct" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "11s ago" }] },
          { label: "ExpressRoute", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Direct" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Minor jitter, within tolerance" }, { label: "Last telemetry", value: "14s ago" }] },
        ],
      },
      {
        title: "Identity",
        rows: [
          { label: "Microsoft Entra ID", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Sign-in path" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "8s ago" }] },
          { label: "Managed Identities", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Indirect" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "26s ago" }] },
          { label: "Key Vault", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Indirect" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "31s ago" }] },
        ],
      },
      {
        title: "DNS",
        rows: [
          { label: "Azure DNS", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Resolution path" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "17s ago" }] },
          { label: "Traffic Manager", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Routing" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "19s ago" }] },
        ],
      },
      {
        title: "Control Plane",
        rows: [
          { label: "Azure Resource Manager", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Change operations only" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "24s ago" }] },
          { label: "Subscription & Quota Services", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Indirect" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "48s ago" }] },
        ],
      },
      {
        title: "Regional Azure Services",
        rows: [
          { label: "West US 2 region services", status: "advisory", impact: "NO CURRENT IMPACT", note: "Region carries one degraded storage dependency; all other regional services are healthy.", fields: [{ label: "Underlying health", value: "Advisory", status: "advisory" }, { label: "Customer exposure", value: "1 deployment" }, { label: "Actual customer impact", value: "None observed", status: "healthy" }, { label: "Trend", value: "Improving", status: "healthy" }, { label: "Last telemetry", value: "9s ago" }] },
          { label: "East US region services", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "3 deployments" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "10s ago" }] },
          { label: "Central US region services", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "DR deployment" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "13s ago" }] },
        ],
      },
      {
        title: "Supporting Platform Services",
        rows: [
          { label: "Service Bus", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Event processing" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "16s ago" }] },
          { label: "Monitor / Log Analytics", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Observability only" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "21s ago" }] },
          { label: "Container Registry", status: "healthy", impact: "NO CURRENT IMPACT", fields: [{ label: "Underlying health", value: "Healthy", status: "healthy" }, { label: "Customer exposure", value: "Deployments only" }, { label: "Actual customer impact", value: "None", status: "healthy" }, { label: "Trend", value: "Stable" }, { label: "Last telemetry", value: "34s ago" }] },
        ],
      },
    ],
  },
};

/* ---------------------------- new KPI contexts ---------------------------- */

export const kpiContexts: Record<string, CustomerImpactContext> = {
  "active-events": {
    id: "active-events", title: "Active events", subtitle: "Sorted by impact to you, not by technical severity",
    infrastructureStatus: "advisory",
    infrastructureNote: "One provider dependency in West US 2 is degraded and being tracked.",
    impact: "NO CURRENT IMPACT",
    whatIsHappening:
      "One advisory is open against your environment. Advisories describe an underlying condition we are managing; they do not mean your service is impacted. No degradation and no incident is open against any service you consume.",
    affected: [
      { label: "Document Store · Production – West US 2", detail: "Advisory open · experience unchanged", status: "advisory" },
      { label: "All other services", detail: "No events open", status: "healthy" },
    ],
    signals: [
      { label: "Customer-impacting events", value: "0", interpretation: "Nothing open is measurably affecting your users.", status: "healthy" },
      { label: "Potential-impact events", value: "1", interpretation: "One advisory could develop into impact if the provider condition worsens.", status: "advisory" },
      { label: "Mean time to update", value: "28 min", interpretation: "How often we publish progress while an event is open.", status: "info" },
    ],
    whatIsBeingDone: [
      "Advisory tracked against Microsoft case AZ-80456",
      "Write path pinned to a healthy storage replica",
      "Automatic escalation to incident if customer telemetry degrades",
    ],
    customerAction: noAction, noActionRequired: true,
    timeline: [
      { stage: "Detected", at: "08:41 AM PT", note: "Storage latency deviation observed in West US 2." },
      { stage: "Validated", at: "08:47 AM PT", note: "Confirmed no measurable effect on your services." },
      { stage: "Latest observation", at: "5m ago", note: "Latency trending back toward baseline." },
      { stage: "Next update", at: "10:00 AM PT", note: "Or immediately if customer impact begins.", pending: true },
    ],
    technical: [
      { label: "Event source", value: "Provider health API + our customer-edge telemetry" },
      { label: "Escalation rule", value: "Advisory → Degradation on 5 min sustained customer-visible error rate" },
      { label: "Open provider references", value: "AZ-80456" },
    ],
    metrics: [
      { label: "Advisories", value: "1", caption: "Watching, no impact", status: "advisory" },
      { label: "Degradations", value: "0", caption: "Reduced experience", status: "healthy" },
      { label: "Incidents", value: "0", caption: "Service impact", status: "healthy" },
      { label: "Customer-impacting", value: "0", caption: "Right now", status: "healthy" },
    ],
    groups: [
      {
        title: "Ordered by customer impact",
        caption: "Events are ranked by what they do to your users. A high provider severity with no customer effect ranks below a small event that your users can feel.",
        rows: [
          {
            label: "1 · Elevated Azure Blob Storage latency – West US 2", status: "advisory", impact: "NO CURRENT IMPACT",
            note: "Highest-ranked open event because it is the only one with a credible path to customer impact.",
            fields: [
              { label: "Class", value: "Advisory", status: "advisory" },
              { label: "Customer impact", value: "None observed", status: "healthy" },
              { label: "Affected deployment", value: "Production – West US 2" },
              { label: "Started", value: "08:41 AM PT" },
              { label: "Next update", value: "10:00 AM PT" },
            ],
          },
          {
            label: "2 · ExpressRoute jitter – East US (informational)", status: "info", impact: "NO CURRENT IMPACT",
            note: "Within tolerance and invisible to your users; retained for transparency only.",
            fields: [
              { label: "Class", value: "Information", status: "info" },
              { label: "Customer impact", value: "None", status: "healthy" },
              { label: "Affected deployment", value: "Production – East US" },
              { label: "Trend", value: "Stable" },
            ],
          },
          {
            label: "Degradations", status: "healthy", impact: "NO CURRENT IMPACT",
            note: "No service you consume is currently delivering a reduced experience.",
            fields: [{ label: "Open", value: "0", status: "healthy" }],
          },
          {
            label: "Incidents", status: "healthy", impact: "NO CURRENT IMPACT",
            note: "No service you consume is currently unavailable or materially impaired.",
            fields: [{ label: "Open", value: "0", status: "healthy" }, { label: "Last incident", value: "41 days ago" }],
          },
        ],
      },
    ],
  },

  "at-risk-deployments": {
    id: "at-risk-deployments", title: "At-risk deployments", subtitle: "Conditions that could develop into customer impact",
    infrastructureStatus: "at-risk",
    infrastructureNote: "One production deployment sits behind a degraded provider storage dependency.",
    impact: "POTENTIAL IMPACT",
    whatIsHappening:
      "One of your deployments is currently healthy for your users but is running with reduced protection underneath. We surface it early so that preventive action happens before your users feel anything.",
    affected: [
      { label: "Production – West US 2", detail: "Healthy for users · elevated risk", status: "at-risk" },
      { label: "7 other deployments", detail: "Low risk", status: "healthy" },
    ],
    signals: [
      { label: "Risk classification", value: "Elevated", interpretation: "Moderate probability of impact if the provider condition persists beyond the maintenance window.", status: "at-risk" },
      { label: "Customer-visible errors", value: "0", interpretation: "Nothing has reached your users so far.", status: "healthy" },
      { label: "Headroom on healthy replica", value: "62%", interpretation: "Sufficient capacity to absorb the full write path if required.", status: "healthy" },
    ],
    whatIsBeingDone: [
      "Write path pinned to the healthy storage replica",
      "Failover to DR – Central US pre-staged and verified",
      "Microsoft case AZ-80456 escalated with hourly progress checks",
    ],
    customerAction: "No action required from you. If risk escalates we will contact your nominated operations address before any customer impact occurs.",
    noActionRequired: false,
    timeline: [
      { stage: "Detected", at: "08:41 AM PT", note: "Storage latency deviation raised the deployment risk score." },
      { stage: "Validated", at: "08:52 AM PT", note: "Risk classified Elevated; no customer impact confirmed." },
      { stage: "Action initiated", at: "09:05 AM PT", note: "Write path pinned; DR failover pre-staged." },
      { stage: "Next update", at: "10:00 AM PT", note: "Risk re-scored on the next telemetry window.", pending: true },
    ],
    technical: [
      { label: "Risk model", value: "Dependency condition × exposure × historical escalation rate" },
      { label: "Scoring window", value: "Rolling 60 minutes" },
      { label: "Escalation threshold", value: "Sustained p95 write latency > 400 ms for 10 minutes" },
    ],
    metrics: [
      { label: "At-risk deployments", value: "1", status: "at-risk" },
      { label: "Customer impact today", value: "None", status: "healthy" },
      { label: "Risk trend", value: "Stable", status: "healthy" },
      { label: "Preventive actions", value: "3 underway", status: "info" },
    ],
    groups: [
      {
        title: "Risk detail",
        caption: "Each risk names its source, the deployment exposed, and the preventive work already underway.",
        rows: [
          {
            label: "Production – West US 2", status: "at-risk", impact: "POTENTIAL IMPACT",
            note: "Underlying storage is degraded; your service remains healthy. Classified at risk, not impacted.",
            fields: [
              { label: "Risk source", value: "Azure Blob Storage latency – West US 2" },
              { label: "Affected deployment", value: "Production – West US 2 (8 nodes)" },
              { label: "Current service condition", value: "Healthy for customers", status: "healthy" },
              { label: "Risk classification", value: "Elevated · moderate probability", status: "at-risk" },
              { label: "Trend", value: "Stable, latency improving", status: "healthy" },
              { label: "Potential impact", value: "Slower document writes if the healthy replica saturates", status: "advisory" },
              { label: "Preventive action", value: "Replica pinning · DR pre-staged · provider escalation" },
            ],
          },
          {
            label: "Production – East US", status: "healthy", impact: "NO CURRENT IMPACT",
            fields: [
              { label: "Risk source", value: "None active" },
              { label: "Risk classification", value: "Low", status: "healthy" },
              { label: "Trend", value: "Stable", status: "healthy" },
              { label: "Preventive action", value: "Routine monitoring" },
            ],
          },
          {
            label: "Production – North Europe", status: "healthy", impact: "NO CURRENT IMPACT",
            fields: [
              { label: "Risk source", value: "Scheduled platform update Jun 7" },
              { label: "Risk classification", value: "Low", status: "healthy" },
              { label: "Trend", value: "Stable", status: "healthy" },
              { label: "Preventive action", value: "Rolling update with drain and verify" },
            ],
          },
        ],
      },
    ],
  },
};
