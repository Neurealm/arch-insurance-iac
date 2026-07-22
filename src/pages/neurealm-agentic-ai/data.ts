import {
  Users, ShieldCheck, Cpu, Database, Cloud, Activity, Bot, Wrench,
  Globe, Layers, GitBranch, Lock, Eye, DollarSign, Zap, Server,
  Network, Key, FileCheck, AlertTriangle, Workflow, Search, Brain,
  MessageSquare, Mail, Phone, Smartphone, Code2, LineChart,
  type LucideIcon,
} from "lucide-react";

export type Layer = {
  id: string;
  title: string;
  icon: LucideIcon;
  tone: "indigo" | "violet" | "teal" | "blue" | "amber" | "rose" | "slate" | "emerald";
  capabilities: string[];
  what: string;
  why: string;
  tech: string[];
  decisions: string[];
  notes: string[];
};

export const experienceChannels = [
  { id: "web", label: "Web Portal", icon: Globe },
  { id: "teams", label: "Microsoft Teams", icon: MessageSquare },
  { id: "slack", label: "Slack / Collab", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
  { id: "mobile", label: "Mobile App", icon: Smartphone },
  { id: "api", label: "APIs / SDKs", icon: Code2 },
  { id: "voice", label: "Voice / IVR", icon: Phone },
];

export const accessSecurity = [
  "WAF / DDoS Protection", "API Gateway", "Identity / SSO",
  "Rate Limiting", "Secrets Management",
];

export const platformLayers: Layer[] = [
  {
    id: "experience",
    title: "Experience Layer",
    icon: Users, tone: "indigo",
    capabilities: ["Conversational UI", "Agent Workspace", "Dashboards", "Task Inbox"],
    what: "User-facing surfaces where humans interact with digital coworkers across channels.",
    why: "Determines adoption. Consistent, low-friction UX drives measurable business outcomes.",
    tech: ["React", "Microsoft Teams Apps", "Slack Bolt", "Copilot Studio front-ends"],
    decisions: ["Which channels launch first?", "Native app vs embedded?", "Branding and tenancy model"],
    notes: ["Ship channel adapters, not per-channel UIs", "Instrument every interaction"],
  },
  {
    id: "orchestration",
    title: "Orchestration & Control",
    icon: Workflow, tone: "violet",
    capabilities: ["Agent Registry", "Planner / Router", "Workflow Engine", "Policy Engine", "Human-in-the-Loop"],
    what: "Routes intents to the right agent, enforces policy, and coordinates multi-step plans with approvals.",
    why: "The control plane is where trust, safety, and governance are enforced at runtime.",
    tech: ["LangGraph", "Semantic Kernel", "Temporal", "OPA / Cedar"],
    decisions: ["Central planner vs decentralized handoff?", "Approval SLA windows", "Retry & escalation policies"],
    notes: ["Version every plan graph", "Treat HITL as a first-class step, not an exception"],
  },
  {
    id: "agents",
    title: "Specialist Agent Mesh",
    icon: Bot, tone: "teal",
    capabilities: ["Coordinator", "Service Desk", "ITOps", "SecOps", "Finance Ops", "HR Ops", "Knowledge", "Custom Domain"],
    what: "Domain-scoped agents that own a bounded set of skills, tools, and data access rights.",
    why: "Specialization improves accuracy, safety, and auditability compared to a single monolithic agent.",
    tech: ["LangChain", "Autogen", "Azure AI Foundry Agents", "Custom Python runtimes"],
    decisions: ["Skill boundaries per agent", "Which agents get write access?", "Model choice per agent"],
    notes: ["One tool registry per agent", "Constrain scope tightly to reduce blast radius"],
  },
  {
    id: "knowledge",
    title: "Knowledge & Integration",
    icon: Database, tone: "blue",
    capabilities: ["Memory", "RAG / Retrieval", "Enterprise Connectors", "Tool Gateway", "API Connectors"],
    what: "Grounds agents in enterprise reality via retrieval, memory, and governed tool invocation.",
    why: "Prevents hallucination and makes agents useful for actual business work.",
    tech: ["Azure AI Search", "Cosmos DB", "MCP servers", "APIM Tool Gateway"],
    decisions: ["Chunking / embedding strategy", "Freshness SLAs", "Tool auth model (OBO vs service principal)"],
    notes: ["Every tool call must be typed and audited", "RAG quality is a product, not a feature"],
  },
  {
    id: "ai",
    title: "AI & Data Services",
    icon: Brain, tone: "amber",
    capabilities: ["Model Gateway", "Foundation Models", "Embeddings", "Operational Data", "Knowledge Store"],
    what: "Model routing, embeddings, evaluation, and the operational data plane underneath the platform.",
    why: "A model gateway is what makes model portability, cost control, and safety practical.",
    tech: ["Azure OpenAI", "OpenAI", "Anthropic", "Gemini", "Llama", "PTU / provisioned throughput"],
    decisions: ["Which models per task?", "PTU vs consumption?", "Evaluation harness"],
    notes: ["Route by task, not by team", "Track cost per outcome, not per token"],
  },
];

export const enterpriseSystems = [
  "ServiceNow", "Jira", "SAP / ERP", "CRM / HR Systems",
  "Microsoft 365 / SharePoint", "Databases / Data Warehouses",
];

export const modelEcosystem = [
  "Azure OpenAI", "OpenAI", "Anthropic", "Google Gemini", "Meta Llama", "Open-source Models",
];

export const crossCutting = {
  governance: ["Zero Trust", "RBAC / ABAC", "Encryption", "Content Safety", "Compliance", "Data Privacy"],
  observability: ["Logs", "Metrics", "Traces", "Agent Health", "Cost Monitoring", "Audit Trails"],
  deployment: ["Kubernetes / Containers", "VM-based Deployment", "Object Storage", "Databases", "Message Broker", "CI/CD"],
};

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

export const azurePaasServices = [
  { id: "foundry", name: "Azure AI Foundry", cat: "AI", desc: "Agent platform, model catalog, evaluation" },
  { id: "openai", name: "Azure OpenAI", cat: "AI", desc: "GPT-4o, o-series, embeddings via Private Endpoint" },
  { id: "search", name: "Azure AI Search", cat: "AI", desc: "Hybrid vector + keyword retrieval" },
  { id: "cosmos", name: "Azure Cosmos DB", cat: "Data", desc: "Session state, agent memory, vector store" },
  { id: "sql", name: "Azure SQL Database", cat: "Data", desc: "Operational data, agent registry" },
  { id: "storage", name: "Azure Storage", cat: "Data", desc: "Documents, artifacts, prompt/response logs" },
  { id: "kv", name: "Azure Key Vault", cat: "Sec", desc: "Secrets, keys, certificates" },
  { id: "redis", name: "Azure Cache for Redis", cat: "Data", desc: "Rate limiting, session cache" },
  { id: "eh", name: "Azure Event Hubs", cat: "Msg", desc: "High-throughput event ingest" },
  { id: "sb", name: "Azure Service Bus", cat: "Msg", desc: "Reliable messaging for agent handoff" },
  { id: "purview", name: "Microsoft Purview", cat: "Gov", desc: "Data classification, lineage, compliance" },
  { id: "aml", name: "Azure Machine Learning", cat: "AI", desc: "Custom models, evaluation pipelines (optional)" },
];

export const observabilityStack = [
  "Azure Monitor", "Log Analytics", "Application Insights", "Managed Prometheus",
  "Managed Grafana", "OpenTelemetry", "Microsoft Sentinel", "Alerts / SLA monitoring", "Audit logs",
];

export const govFoundation = [
  "Zero Trust", "RBAC / PIM", "Policy-as-Code", "Defender for Cloud", "Encryption",
  "Secrets Management", "Content Safety", "Prompt Injection Defense", "Compliance & Audit",
  "Data Privacy", "Backup & DR", "Cost Controls",
];

export const devsecops = [
  "GitHub / Azure DevOps", "Azure Container Registry", "Bicep / Terraform",
  "CI/CD Pipelines", "Helm", "Release Management", "Environment Promotion",
  "Automated Testing", "Security Scanning",
];

export const deploymentPatterns = [
  { id: "aks", label: "Enterprise AKS", desc: "Full control, best for large enterprises with platform teams" },
  { id: "aca", label: "Azure Container Apps", desc: "Serverless containers, faster time-to-value" },
  { id: "vm", label: "VM-based", desc: "For regulated workloads with strict pinning requirements" },
  { id: "hybrid", label: "Hybrid", desc: "On-prem control plane with Azure AI services via ExpressRoute" },
];

export const flowSteps = [
  { n: 1, title: "User submits request", detail: "Web, Teams, Slack, email, mobile, voice, or API", kind: "user" },
  { n: 2, title: "Secure edge", detail: "Front Door, WAF, DDoS Protection", kind: "user" },
  { n: 3, title: "Identity & policy", detail: "Entra ID, Conditional Access, RBAC evaluation", kind: "gov" },
  { n: 4, title: "Route to control plane", detail: "APIM to agent orchestrator", kind: "user" },
  { n: 5, title: "Planner decomposes", detail: "Break intent into steps and assign to agents", kind: "user" },
  { n: 6, title: "Retrieval & context", detail: "AI Search + Cosmos memory over Private Link", kind: "data" },
  { n: 7, title: "Tool gateway", detail: "Typed, audited calls into enterprise systems", kind: "tool" },
  { n: 8, title: "AI reasoning", detail: "Azure OpenAI via Private Endpoint; embeddings & models", kind: "data" },
  { n: 9, title: "Human approval", detail: "HITL step for high-risk actions", kind: "gov" },
  { n: 10, title: "Action executed", detail: "Write-back to ServiceNow, SAP, Jira, etc.", kind: "tool" },
  { n: 11, title: "Telemetry captured", detail: "Prompts, responses, decisions, costs, traces", kind: "telemetry" },
  { n: 12, title: "Continuous governance", detail: "Sentinel, Purview, audit trail, evaluations", kind: "gov" },
];

export const securityLayers = [
  { id: "iam", title: "Identity & Access", icon: Key,
    items: ["Entra ID", "SSO", "MFA", "Conditional Access", "RBAC", "PIM"] },
  { id: "net", title: "Network Security", icon: Network,
    items: ["Front Door", "WAF", "Firewall", "Private Link", "NSGs", "Route Tables"] },
  { id: "ai", title: "AI Safety", icon: ShieldCheck,
    items: ["Prompt injection defense", "Content safety", "PII detection", "Grounding validation", "Response filtering", "Human approvals"] },
  { id: "data", title: "Data Protection", icon: Lock,
    items: ["Encryption at rest", "Encryption in transit", "Key Vault", "Secrets management", "Data classification", "Retention policies"] },
  { id: "gov", title: "Governance", icon: FileCheck,
    items: ["Policy-as-code", "Model governance", "Agent registry", "Tool registry", "Audit trails", "Compliance mapping"] },
];

export const complianceFrameworks = [
  { name: "HIPAA", status: "Ready patterns" },
  { name: "SOC 2", status: "Aligned" },
  { name: "ISO 27001", status: "Aligned" },
  { name: "NIST AI RMF", status: "Aligned" },
  { name: "Enterprise Audit", status: "Ready" },
];

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
  { id: 1, name: "Assisted AI", desc: "Copilots assist humans on individual tasks" },
  { id: 2, name: "Knowledge Agents", desc: "Retrieval-grounded Q&A across enterprise knowledge" },
  { id: 3, name: "Workflow Agents", desc: "Automated multi-step workflows with HITL" },
  { id: 4, name: "Multi-Agent Operations", desc: "Coordinated specialist agents across domains" },
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
  { label: "Agent Health", value: "98.6%", tone: "emerald" },
  { label: "Workflow Success", value: "94.2%", tone: "emerald" },
  { label: "Avg Response", value: "2.4s", tone: "indigo" },
  { label: "Approval Queue", value: "12", tone: "amber" },
  { label: "Tokens Today", value: "18.4M", tone: "violet" },
  { label: "Cost Trend", value: "-6.1%", tone: "emerald" },
  { label: "Failed Tools", value: "0.8%", tone: "amber" },
  { label: "Policy Violations", value: "0", tone: "emerald" },
  { label: "Retrieval Quality", value: "0.87", tone: "indigo" },
  { label: "SLO Status", value: "In SLO", tone: "emerald" },
];

export const chartExecutions = [
  { day: "Mon", success: 2140, failed: 92 },
  { day: "Tue", success: 2380, failed: 78 },
  { day: "Wed", success: 2510, failed: 104 },
  { day: "Thu", success: 2620, failed: 88 },
  { day: "Fri", success: 2790, failed: 96 },
  { day: "Sat", success: 1180, failed: 40 },
  { day: "Sun", success: 980, failed: 32 },
];

export const chartTokensByAgent = [
  { agent: "Service Desk", tokens: 5.8 },
  { agent: "ITOps", tokens: 3.9 },
  { agent: "SecOps", tokens: 2.6 },
  { agent: "Knowledge", tokens: 3.1 },
  { agent: "Finance", tokens: 1.4 },
  { agent: "HR", tokens: 1.0 },
  { agent: "Coordinator", tokens: 0.6 },
];

export const chartCostByLayer = [
  { name: "AI Services", value: 42 },
  { name: "Compute", value: 21 },
  { name: "Data", value: 14 },
  { name: "Networking", value: 9 },
  { name: "Observability", value: 8 },
  { name: "Security", value: 6 },
];

export const chartLatency = [
  { workflow: "Password reset", p50: 1.8, p95: 3.4 },
  { workflow: "Incident triage", p50: 2.4, p95: 5.1 },
  { workflow: "Knowledge Q&A", p50: 1.2, p95: 2.6 },
  { workflow: "Change impact", p50: 3.6, p95: 7.2 },
  { workflow: "Vuln remediation", p50: 4.1, p95: 8.4 },
];
