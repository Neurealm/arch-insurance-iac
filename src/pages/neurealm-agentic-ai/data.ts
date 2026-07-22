import {
  Users, ShieldCheck, Cpu, Database, Cloud, Activity, Bot, Wrench,
  Globe, Layers, GitBranch, Lock, Eye, DollarSign, Zap, Server,
  Network, Key, FileCheck, AlertTriangle, Workflow, Search, Brain,
  MessageSquare, Mail, Phone, Smartphone, Code2, LineChart,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Platform layers — enriched for enterprise workshop use                     */
/* -------------------------------------------------------------------------- */

export type Layer = {
  id: string;
  title: string;
  icon: LucideIcon;
  tone: "indigo" | "violet" | "teal" | "blue" | "amber" | "rose" | "slate" | "emerald";
  purpose: string;
  responsibilities: string[];
  azureServices: string[];
  considerations: string[];
  decisions: string[];
  security: string[];
  capabilities: string[];
};

export const platformLayers: Layer[] = [
  {
    id: "experience",
    title: "Experience Layer",
    icon: Users, tone: "indigo",
    purpose:
      "User-facing surfaces where employees and customers interact with digital coworkers across channels.",
    responsibilities: [
      "Channel adapters for Web, Teams, Slack, Email, Mobile, Voice, API",
      "Session and conversation UI state",
      "Persona, branding and tenancy presentation",
      "Front-end telemetry and consent capture",
    ],
    azureServices: [
      "Azure Front Door (global entry)",
      "Azure App Service / Static Web Apps",
      "Azure Bot Service (Teams / Web Chat)",
      "Azure Communication Services (voice, SMS)",
    ],
    considerations: [
      "Ship channel adapters, not per-channel UIs",
      "Instrument every interaction with a correlation ID",
      "Accessibility (WCAG AA) is part of definition of done",
    ],
    decisions: [
      "Which channels launch first — Teams-first or Web-first?",
      "Native mobile app vs progressive web app?",
      "Single-tenant vs multi-tenant branding model",
    ],
    security: [
      "Entra ID SSO with Conditional Access",
      "Session tokens rotated on channel switch",
      "No secrets in browser; use BFF pattern",
    ],
    capabilities: ["Conversational UI", "Agent Workspace", "Dashboards", "Task Inbox"],
  },
  {
    id: "orchestration",
    title: "Orchestration & Control Plane",
    icon: Workflow, tone: "violet",
    purpose:
      "Routes intents to the right agents, enforces policy, and coordinates multi-step plans with human approvals.",
    responsibilities: [
      "Intent classification and agent routing",
      "Workflow / plan execution with retries and escalation",
      "Policy evaluation (who can do what, on which data)",
      "Human-in-the-Loop approval orchestration",
      "Agent registry and capability discovery",
    ],
    azureServices: [
      "Azure Kubernetes Service or Container Apps",
      "Azure API Management (control plane API)",
      "Azure Service Bus (workflow messaging)",
      "Azure Durable Functions (long-running plans)",
    ],
    considerations: [
      "Version every plan graph — treat it as code",
      "Treat HITL as a first-class step, not an exception",
      "Idempotency keys on every tool call",
    ],
    decisions: [
      "Central planner vs decentralized handoff pattern",
      "Approval SLA windows per action class",
      "Retry, escalation and fall-back policies",
    ],
    security: [
      "OPA / Cedar policy-as-code for authorization",
      "Immutable audit of every plan and approval",
      "Blast-radius controls on autonomous actions",
    ],
    capabilities: ["Agent Registry", "Planner / Router", "Workflow Engine", "Policy Engine", "HITL"],
  },
  {
    id: "agents",
    title: "Specialist Agent Mesh",
    icon: Bot, tone: "teal",
    purpose:
      "Domain-scoped agents that own a bounded set of skills, tools, and data access rights.",
    responsibilities: [
      "Domain reasoning and task execution",
      "Skill scoping and tool selection",
      "Grounded response generation with citations",
      "Escalation to humans on low confidence",
    ],
    azureServices: [
      "Azure AI Foundry Agents",
      "Azure OpenAI Service",
      "Azure Container Apps (agent workers)",
      "Azure Functions (event handlers)",
    ],
    considerations: [
      "One tool registry per agent — least privilege by design",
      "Constrain scope tightly to reduce blast radius",
      "Golden-set evals per agent before promotion",
    ],
    decisions: [
      "Skill boundaries and ownership per agent",
      "Which agents receive write access to systems of record",
      "Model tier per agent (frontier vs task-tuned)",
    ],
    security: [
      "Managed identity per agent workload",
      "Response filtering and content-safety pre-emit",
      "Prompt-injection defence at retrieval boundary",
    ],
    capabilities: ["Coordinator", "Service Desk", "ITOps", "SecOps", "Finance", "HR", "Knowledge", "Custom"],
  },
  {
    id: "knowledge",
    title: "Knowledge & Integration",
    icon: Database, tone: "blue",
    purpose:
      "Grounds agents in enterprise reality through retrieval, memory, and governed tool invocation.",
    responsibilities: [
      "Ingest and chunk enterprise content",
      "Hybrid vector + keyword retrieval",
      "Agent short- and long-term memory",
      "Typed, audited tool calls into systems of record",
    ],
    azureServices: [
      "Azure AI Search (hybrid + semantic)",
      "Azure Cosmos DB (memory, vector)",
      "Azure API Management (Tool Gateway)",
      "Azure Data Factory / Fabric (ingest)",
    ],
    considerations: [
      "Every tool call must be typed and audited",
      "RAG quality is a product, not a feature — measure groundedness",
      "Freshness SLAs per source (minutes / hours / daily)",
    ],
    decisions: [
      "Chunking and embedding strategy per content type",
      "Tool auth model: on-behalf-of vs service principal",
      "Which systems allow write vs read-only",
    ],
    security: [
      "Purview classification propagates to search results",
      "Row-level and document-level ACLs enforced at query time",
      "Secrets and connector creds in Key Vault only",
    ],
    capabilities: ["Memory", "Retrieval", "Connectors", "Tool Gateway"],
  },
  {
    id: "ai",
    title: "AI & Data Services",
    icon: Brain, tone: "amber",
    purpose:
      "Model routing, embeddings, evaluation, and the operational data plane underneath the platform.",
    responsibilities: [
      "Model gateway with routing and fall-back",
      "Embedding generation and vector storage",
      "Evaluation harness and drift detection",
      "Operational data for agents and workflows",
    ],
    azureServices: [
      "Azure OpenAI (GPT-4o, o-series, embeddings)",
      "Azure AI Content Safety",
      "Azure Machine Learning (evals, custom)",
      "Azure Cosmos DB / SQL / Storage",
    ],
    considerations: [
      "Route by task, not by team",
      "Track cost per outcome, not per token",
      "Keep a fall-back model wired for every route",
    ],
    decisions: [
      "PTU (provisioned) vs consumption per workload",
      "Which models by task class (reason, extract, summarize)",
      "Evaluation cadence and quality gates for promotion",
    ],
    security: [
      "All model calls over Private Endpoint",
      "Content Safety filters on prompt and response",
      "No customer data used for model training",
    ],
    capabilities: ["Model Gateway", "Foundation Models", "Embeddings", "Operational Data"],
  },
];

/* -------------------------------------------------------------------------- */
/*  Reference architecture — flanking columns                                  */
/* -------------------------------------------------------------------------- */

export const experienceChannels = [
  { id: "web", label: "Web Portal", icon: Globe },
  { id: "teams", label: "Microsoft Teams", icon: MessageSquare },
  { id: "slack", label: "Slack", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
  { id: "mobile", label: "Mobile App", icon: Smartphone },
  { id: "api", label: "APIs / SDKs", icon: Code2 },
  { id: "voice", label: "Voice / IVR", icon: Phone },
];

export const accessSecurity = [
  "WAF / DDoS", "API Gateway", "Entra ID / SSO", "Rate Limiting", "Key Vault",
];

export const enterpriseSystems = [
  { name: "ServiceNow", kind: "ITSM" },
  { name: "Jira", kind: "DevOps" },
  { name: "SAP / ERP", kind: "Finance" },
  { name: "Salesforce CRM", kind: "CRM" },
  { name: "Workday", kind: "HR" },
  { name: "Microsoft 365", kind: "Productivity" },
  { name: "Data Warehouse", kind: "Analytics" },
];

export const modelEcosystem = [
  "Azure OpenAI", "OpenAI", "Anthropic", "Google Gemini", "Meta Llama", "Open-source",
];

/* -------------------------------------------------------------------------- */
/*  Azure landing zone — hub, spokes, subnets, private endpoints               */
/* -------------------------------------------------------------------------- */

export type NodeKind = "vnet" | "pe" | "paas" | "ext" | "shared";

export type SubnetSpec = {
  id: string;
  name: string;
  cidr: string;
  purpose: string;
  nodes: { name: string; kind: NodeKind; desc?: string }[];
};

export const spokeSubnets: SubnetSpec[] = [
  {
    id: "appgw", name: "snet-appgw", cidr: "10.20.1.0/24",
    purpose: "Application Gateway with WAF v2 — the single ingress into the spoke.",
    nodes: [
      { name: "Application Gateway v2", kind: "vnet", desc: "Ingress with WAF, TLS termination" },
      { name: "WAF Policy", kind: "vnet", desc: "OWASP CRS + bot protection" },
    ],
  },
  {
    id: "runtime", name: "snet-runtime", cidr: "10.20.10.0/23",
    purpose: "Agent runtime — orchestration, agent mesh, experience services.",
    nodes: [
      { name: "Orchestration & Control Plane", kind: "vnet", desc: "AKS system + user pools" },
      { name: "Specialist Agent Mesh", kind: "vnet", desc: "Agent workers, one pool per domain" },
      { name: "Experience Services", kind: "vnet", desc: "BFF, session, channel adapters" },
    ],
  },
  {
    id: "int", name: "snet-integration", cidr: "10.20.20.0/24",
    purpose: "Integration runtime — connector workers to enterprise systems.",
    nodes: [
      { name: "Tool Gateway (APIM self-hosted)", kind: "vnet", desc: "Typed, audited tool calls" },
      { name: "Connector Workers", kind: "vnet", desc: "OBO / SP auth to systems of record" },
    ],
  },
  {
    id: "pe", name: "snet-privateendpoints", cidr: "10.20.30.0/24",
    purpose: "Private Endpoints — every Azure PaaS service is reached only through here.",
    nodes: [
      { name: "PE → Azure OpenAI", kind: "pe" },
      { name: "PE → AI Search", kind: "pe" },
      { name: "PE → Cosmos DB", kind: "pe" },
      { name: "PE → Azure SQL", kind: "pe" },
      { name: "PE → Storage", kind: "pe" },
      { name: "PE → Key Vault", kind: "pe" },
      { name: "PE → Service Bus", kind: "pe" },
      { name: "PE → AI Foundry", kind: "pe" },
    ],
  },
  {
    id: "mgmt", name: "snet-mgmt", cidr: "10.20.40.0/26",
    purpose: "Management — Bastion access, log forwarders, jump hosts.",
    nodes: [
      { name: "Jump Host (VMSS)", kind: "vnet" },
      { name: "Log Forwarder", kind: "vnet" },
    ],
  },
];

export const hubServices = [
  { name: "Azure Firewall Premium", desc: "Egress inspection, TLS inspection, IDPS" },
  { name: "Azure Bastion", desc: "Zero-trust admin access to spoke workloads" },
  { name: "Private DNS Zones", desc: "privatelink.* zones linked to hub and spoke" },
  { name: "ExpressRoute / VPN", desc: "Enterprise on-prem connectivity" },
  { name: "NAT Gateway", desc: "Deterministic outbound IPs where required" },
  { name: "DDoS Protection", desc: "Network-tier DDoS coverage" },
];

export const azurePaasServices = [
  { id: "foundry", name: "Azure AI Foundry", cat: "AI",   desc: "Agent platform, model catalog, evaluations" },
  { id: "openai",  name: "Azure OpenAI",     cat: "AI",   desc: "GPT-4o, o-series, embeddings" },
  { id: "search",  name: "Azure AI Search",  cat: "AI",   desc: "Hybrid vector + semantic retrieval" },
  { id: "cosmos",  name: "Azure Cosmos DB",  cat: "Data", desc: "Agent memory, session, vector store" },
  { id: "sql",     name: "Azure SQL",        cat: "Data", desc: "Operational data, agent registry" },
  { id: "storage", name: "Azure Storage",    cat: "Data", desc: "Docs, artifacts, prompt / response logs" },
  { id: "kv",      name: "Azure Key Vault",  cat: "Sec",  desc: "Secrets, keys, certificates" },
  { id: "sb",      name: "Azure Service Bus",cat: "Msg",  desc: "Reliable workflow messaging" },
  { id: "purview", name: "Microsoft Purview",cat: "Gov",  desc: "Data classification, lineage" },
];

export const externalSystems = [
  { name: "ServiceNow", kind: "ITSM",       via: "REST + OAuth (OBO)" },
  { name: "SAP S/4HANA", kind: "ERP",       via: "OData + SP" },
  { name: "Salesforce",  kind: "CRM",        via: "REST + JWT bearer" },
  { name: "Workday",     kind: "HR",         via: "REST + OAuth" },
  { name: "Microsoft 365", kind: "Productivity", via: "Graph API + OBO" },
  { name: "On-prem DBs", kind: "Legacy",    via: "ExpressRoute + Managed Identity" },
];

export const observabilityStack = [
  "Azure Monitor", "Log Analytics", "Application Insights", "Managed Prometheus",
  "Managed Grafana", "OpenTelemetry", "Microsoft Sentinel", "Cost Management",
];

export const govFoundation = [
  "Azure Policy", "Defender for Cloud", "Microsoft Purview", "Entra ID Governance",
  "Managed Identity", "Customer-Managed Keys", "Backup / DR", "Cost Alerts",
];

export const devsecops = [
  "GitHub / Azure DevOps", "Azure Container Registry", "Bicep / Terraform",
  "CI/CD Pipelines", "Helm", "Environment Promotion", "SAST / DAST", "Supply-Chain Scan",
];

export const deploymentPatterns = [
  { id: "aks",    label: "Enterprise AKS",         desc: "Full control, best for large enterprises with a platform team" },
  { id: "aca",    label: "Azure Container Apps",   desc: "Serverless containers, faster time-to-value, less control" },
  { id: "vm",     label: "VM-based",               desc: "Regulated workloads that need strict image pinning" },
  { id: "hybrid", label: "Hybrid / ExpressRoute",  desc: "On-prem control plane, Azure AI services over Private Link" },
];

/* -------------------------------------------------------------------------- */
/*  Agents — kept for Multi-Agent Runtime                                      */
/* -------------------------------------------------------------------------- */

export const agents = [
  { id: "coord", name: "Coordinator Agent", role: "Plans multi-agent workflows, arbitrates handoffs", risk: "Medium",
    inputs: ["User intent", "Policy context", "Agent registry"], tools: ["Planner", "Router", "Policy check"],
    data: ["Session memory", "Agent capabilities"], approval: "Optional",
    useCases: ["Cross-domain incidents", "Multi-step service requests"], signals: ["Plan depth", "Handoff count"] },
  { id: "sd", name: "Service Desk Agent", role: "Triage, categorize, and resolve L1/L2 tickets", risk: "Low",
    inputs: ["Ticket text", "User profile", "KB articles"], tools: ["ServiceNow API", "Knowledge search"],
    data: ["Ticket history", "KB"], approval: "For destructive actions",
    useCases: ["Password reset", "Access request", "Knowledge answer"], signals: ["FCR", "AHT", "Deflection %"] },
  { id: "itops", name: "ITOps Agent", role: "Operates infrastructure with guardrails", risk: "High",
    inputs: ["Alerts", "Runbooks", "CMDB"], tools: ["Ansible", "Terraform", "kubectl (read)"],
    data: ["Metrics", "Logs", "Change calendar"], approval: "Required for writes",
    useCases: ["Incident triage", "Auto-remediation proposal", "Capacity planning"], signals: ["MTTR", "Auto-fix rate"] },
  { id: "sec", name: "SecOps Agent", role: "Detects, enriches, and proposes response to security events", risk: "High",
    inputs: ["Sentinel alerts", "Threat intel"], tools: ["Sentinel", "Defender", "SOAR"],
    data: ["Audit logs", "IAM state"], approval: "Required",
    useCases: ["Vuln remediation", "Cert lifecycle", "Access review"], signals: ["Alert coverage", "FP rate"] },
  { id: "know", name: "Knowledge Agent", role: "Retrieves, summarizes, and cites enterprise knowledge", risk: "Low",
    inputs: ["Query", "Persona"], tools: ["Azure AI Search", "SharePoint connector"],
    data: ["Documents", "Wiki", "Runbooks"], approval: "No",
    useCases: ["Policy Q&A", "Procedure lookup"], signals: ["Groundedness", "Citation rate"] },
  { id: "fin", name: "Finance Ops Agent", role: "Automates finance operations tasks", risk: "Medium",
    inputs: ["Invoice", "PO"], tools: ["SAP API", "Coupa"], data: ["GL", "Vendor master"],
    approval: "Required over threshold", useCases: ["Invoice matching", "Vendor onboarding"], signals: ["Cycle time"] },
  { id: "hr", name: "HR Ops Agent", role: "Handles HR service requests", risk: "Medium",
    inputs: ["Employee request"], tools: ["Workday API"], data: ["Employee record"],
    approval: "Required for PII changes", useCases: ["Leave request", "Onboarding checklist"], signals: ["Satisfaction"] },
  { id: "custom", name: "Custom Domain Agent", role: "Customer-specific business logic and skills", risk: "Varies",
    inputs: ["Domain-specific"], tools: ["Custom connectors"], data: ["Domain systems"],
    approval: "Per policy", useCases: ["Claims triage", "Order management"], signals: ["Domain KPIs"] },
];

/* -------------------------------------------------------------------------- */
/*  Data flow — swimlane                                                        */
/* -------------------------------------------------------------------------- */

export type FlowLane = "user" | "edge" | "control" | "agent" | "data" | "gov";

export const flowLanes: { id: FlowLane; label: string; tone: string }[] = [
  { id: "user",    label: "User / Channel",      tone: "indigo"  },
  { id: "edge",    label: "Edge & Identity",     tone: "rose"    },
  { id: "control", label: "Control Plane",       tone: "violet"  },
  { id: "agent",   label: "Agent Mesh",          tone: "teal"    },
  { id: "data",    label: "Data & AI Services",  tone: "amber"   },
  { id: "gov",     label: "Governance & Ops",    tone: "slate"   },
];

export const flowSteps: {
  n: number; lane: FlowLane; title: string; detail: string;
}[] = [
  { n: 1,  lane: "user",    title: "User submits request",    detail: "Web, Teams, Slack, email, mobile, voice, or API." },
  { n: 2,  lane: "edge",    title: "Secure edge",             detail: "Front Door, WAF, DDoS Protection filter the request." },
  { n: 3,  lane: "edge",    title: "Identity & policy",       detail: "Entra ID, Conditional Access, RBAC evaluated." },
  { n: 4,  lane: "control", title: "Route to control plane",  detail: "APIM forwards to the orchestrator inside the Spoke VNet." },
  { n: 5,  lane: "control", title: "Planner decomposes intent", detail: "Plan is authored, versioned, and dispatched." },
  { n: 6,  lane: "agent",   title: "Specialist agent picks up", detail: "Domain agent with least-privilege scope executes the step." },
  { n: 7,  lane: "data",    title: "Retrieval & memory",       detail: "AI Search + Cosmos memory over Private Endpoints." },
  { n: 8,  lane: "data",    title: "Model inference",          detail: "Azure OpenAI over Private Link; content safety on both sides." },
  { n: 9,  lane: "agent",   title: "Tool gateway call",        detail: "Typed, audited call into ServiceNow / SAP / Jira / Workday." },
  { n: 10, lane: "gov",     title: "Human approval",           detail: "HITL step for high-risk or high-value actions." },
  { n: 11, lane: "gov",     title: "Action written back",      detail: "Result committed to system of record; user notified." },
  { n: 12, lane: "gov",     title: "Telemetry & governance",   detail: "Prompts, responses, decisions, costs, and traces captured." },
];

/* -------------------------------------------------------------------------- */
/*  Security & governance — layered                                             */
/* -------------------------------------------------------------------------- */

export const securityLayers = [
  { id: "iam", title: "Identity & Access", icon: Key,
    ciso: "Every user, workload and agent has a strong, verifiable identity.",
    items: ["Microsoft Entra ID (SSO)", "MFA + Conditional Access", "RBAC + Privileged Identity Mgmt", "Managed Identities per workload", "Just-in-time access"] },
  { id: "net", title: "Network Security", icon: Network,
    ciso: "Zero-trust network — nothing is reachable from the public internet by default.",
    items: ["Azure Front Door + WAF", "Azure Firewall Premium (egress)", "Private Endpoints on every PaaS", "NSGs + route tables", "DDoS Protection Standard"] },
  { id: "data", title: "Data Protection", icon: Lock,
    ciso: "Enterprise data stays encrypted, classified, and never leaves your boundary.",
    items: ["Encryption at rest with CMK", "TLS 1.2+ everywhere", "Key Vault + HSM-backed keys", "Purview classification + labelling", "Retention & legal hold policies"] },
  { id: "ai", title: "AI Safety & Trust", icon: ShieldCheck,
    ciso: "Model outputs are grounded, filtered, and human-approved where the risk demands it.",
    items: ["Prompt-injection defence", "Content Safety filters (in + out)", "Groundedness scoring", "PII detection & redaction", "Human-in-the-Loop approvals"] },
  { id: "gov", title: "Governance & Assurance", icon: FileCheck,
    ciso: "Every model, agent, tool and decision is registered, audited, and reversible.",
    items: ["Policy-as-code (Azure Policy / OPA)", "Model & agent registry", "Tool registry + typed schemas", "Immutable audit trail", "Compliance mapping"] },
];

export const complianceFrameworks = [
  { name: "HIPAA",         status: "Ready patterns" },
  { name: "SOC 2 Type II", status: "Aligned" },
  { name: "ISO 27001",     status: "Aligned" },
  { name: "NIST AI RMF",   status: "Aligned" },
  { name: "EU AI Act",     status: "Aligned" },
  { name: "GDPR",          status: "Ready" },
];

/* -------------------------------------------------------------------------- */
/*  Roadmap, maturity, readiness, ops — unchanged shape, refined copy           */
/* -------------------------------------------------------------------------- */

export const roadmapPhases = [
  { id: 1, name: "Discover & Assess", duration: "4–6 wks", status: "Planned",
    items: ["Use case discovery", "Data readiness", "Security review", "Landing zone assessment", "Integration inventory"] },
  { id: 2, name: "Foundation Build", duration: "6–10 wks", status: "Planned",
    items: ["Azure landing zone", "Networking", "Identity", "Observability", "DevSecOps pipeline"] },
  { id: 3, name: "Platform MVP", duration: "8–12 wks", status: "Planned",
    items: ["Agent runtime", "Model gateway", "Knowledge pipeline", "Tool gateway", "Initial agents"] },
  { id: 4, name: "Pilot", duration: "6–8 wks", status: "Planned",
    items: ["Business use case onboarding", "HITL workflows", "Evaluation", "Security validation", "User feedback"] },
  { id: 5, name: "Production", duration: "6–10 wks", status: "Planned",
    items: ["HA / DR", "Monitoring", "Runbooks", "Compliance validation", "Operational handover"] },
  { id: 6, name: "Scale", duration: "Ongoing", status: "Planned",
    items: ["Additional agents", "More integrations", "Multi-region", "Cost optimization", "Platform governance"] },
];

export const maturityStages = [
  { id: 1, name: "Assisted AI",                desc: "Copilots assist humans on individual tasks" },
  { id: 2, name: "Knowledge Agents",           desc: "Retrieval-grounded Q&A across enterprise knowledge" },
  { id: 3, name: "Workflow Agents",            desc: "Automated multi-step workflows with HITL" },
  { id: 4, name: "Multi-Agent Operations",     desc: "Coordinated specialist agents across domains" },
  { id: 5, name: "Autonomous Digital Workforce", desc: "Governed autonomy with continuous learning" },
];

export const readinessCategories = [
  { id: "biz", name: "Business Use Case Readiness",
    questions: ["Prioritized use cases identified", "Business value quantified", "Executive sponsorship in place", "Success metrics defined"] },
  { id: "data", name: "Data Readiness",
    questions: ["Knowledge sources inventoried", "Data quality acceptable", "Access rights documented", "Sensitivity classification complete"] },
  { id: "int", name: "Integration Readiness",
    questions: ["Target systems have APIs", "Auth model defined", "Rate limits understood", "Non-prod environments available"] },
  { id: "lz", name: "Cloud Landing Zone Readiness",
    questions: ["Azure landing zone deployed", "Networking / Private Link ready", "Hub-spoke pattern in place", "Governance policies applied"] },
  { id: "sec", name: "Identity & Security Readiness",
    questions: ["Entra ID enterprise-ready", "Conditional Access enforced", "PIM enabled", "Key Vault standard adopted"] },
  { id: "gov", name: "Governance Readiness",
    questions: ["AI policy defined", "Model governance process", "HITL policy defined", "Audit trail requirements documented"] },
  { id: "ops", name: "Operations Readiness",
    questions: ["SRE model in place", "Observability standardized", "Incident process defined", "Cost management practices"] },
  { id: "change", name: "Change Management Readiness",
    questions: ["Communication plan", "Training model", "Adoption metrics", "Feedback loops"] },
];

export const opsMetrics = [
  { label: "Agent Health",       value: "98.6%",  tone: "emerald" },
  { label: "Workflow Success",   value: "94.2%",  tone: "emerald" },
  { label: "Avg Response",       value: "2.4s",   tone: "indigo"  },
  { label: "Approval Queue",     value: "12",     tone: "amber"   },
  { label: "Tokens Today",       value: "18.4M",  tone: "violet"  },
  { label: "Cost Trend",         value: "-6.1%",  tone: "emerald" },
  { label: "Failed Tools",       value: "0.8%",   tone: "amber"   },
  { label: "Policy Violations",  value: "0",      tone: "emerald" },
  { label: "Retrieval Quality",  value: "0.87",   tone: "indigo"  },
  { label: "SLO Status",         value: "In SLO", tone: "emerald" },
];

export const chartExecutions = [
  { day: "Mon", success: 2140, failed: 92 },
  { day: "Tue", success: 2380, failed: 78 },
  { day: "Wed", success: 2510, failed: 104 },
  { day: "Thu", success: 2620, failed: 88 },
  { day: "Fri", success: 2790, failed: 96 },
  { day: "Sat", success: 1180, failed: 40 },
  { day: "Sun", success: 980,  failed: 32 },
];

export const chartTokensByAgent = [
  { agent: "Service Desk", tokens: 5.8 },
  { agent: "ITOps",        tokens: 3.9 },
  { agent: "SecOps",       tokens: 2.6 },
  { agent: "Knowledge",    tokens: 3.1 },
  { agent: "Finance",      tokens: 1.4 },
  { agent: "HR",           tokens: 1.0 },
  { agent: "Coordinator",  tokens: 0.6 },
];

export const chartCostByLayer = [
  { name: "AI Services",   value: 42 },
  { name: "Compute",       value: 21 },
  { name: "Data",          value: 14 },
  { name: "Networking",    value: 9  },
  { name: "Observability", value: 8  },
  { name: "Security",      value: 6  },
];

export const chartLatency = [
  { workflow: "Password reset",   p50: 1.8, p95: 3.4 },
  { workflow: "Incident triage",  p50: 2.4, p95: 5.1 },
  { workflow: "Knowledge Q&A",    p50: 1.2, p95: 2.6 },
  { workflow: "Change impact",    p50: 3.6, p95: 7.2 },
  { workflow: "Vuln remediation", p50: 4.1, p95: 8.4 },
];

/* legacy re-exports kept for other tabs that still reference them */
export const crossCutting = {
  governance: govFoundation,
  observability: observabilityStack,
  deployment: ["Kubernetes / AKS", "Container Apps", "Object Storage", "Databases", "Message Broker", "CI/CD"],
};
