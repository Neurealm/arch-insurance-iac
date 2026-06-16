import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, X, ChevronRight, Target, Users, Wrench, Layers,
  ShieldCheck, BarChart3, Cloud, GitBranch, Database, KeyRound, Code2,
  Network, Gauge, AlertTriangle, FileText, Headphones, Sparkles, Compass,
  MessageSquare, Smile, Megaphone, Boxes, Workflow, ServerCog, Activity,
  DollarSign, TrendingUp, HeartPulse, BookOpen, Eye, Zap, CheckCircle2,
} from "lucide-react";

/* ---------- Types ---------- */
type Pane =
  | { kind: "kpi"; id: string }
  | { kind: "domain"; id: string }
  | { kind: "capability"; id: string }
  | { kind: "path"; id: string }
  | { kind: "outcome"; id: string };

/* ---------- Data ---------- */
const KPIS = [
  { id: "adoption", label: "Platform Adoption", value: "78%", target: "> 75%", icon: Users, trend: [62,66,70,72,74,76,78] },
  { id: "csat", label: "Developer Satisfaction", value: "4.4 / 5", target: "> 4.2", icon: Smile, trend: [3.8,3.9,4.0,4.1,4.2,4.3,4.4] },
  { id: "prov", label: "Provisioning Time", value: "< 30 min", target: "< 30 min", icon: Gauge, trend: [240,180,120,90,60,40,28] },
  { id: "self", label: "Self-Service Usage", value: "82%", target: "> 75%", icon: Zap, trend: [40,50,60,68,72,78,82] },
  { id: "tix", label: "Support Tickets", value: "-35%", target: "< -30%", icon: Headphones, trend: [100,92,84,78,72,68,65] },
];

const DOMAINS: {
  id: string; n: number; name: string; desc: string; color: string; band: string; icon: any;
  caps: { id: string; name: string; desc: string; icon: any }[];
}[] = [
  {
    id: "strategy", n: 1, name: "Strategy & Product Management",
    desc: "Define direction, build roadmap, and drive adoption.",
    color: "violet", band: "from-violet-50/80 to-white", icon: Target,
    caps: [
      { id: "vision", name: "Platform Vision & Strategy", desc: "Define purpose, scope, and target outcomes.", icon: Compass },
      { id: "roadmap", name: "Roadmap Management", desc: "Prioritize investments based on customer value and impact.", icon: BookOpen },
      { id: "portfolio", name: "Portfolio Management", desc: "Manage services and investments as a cohesive portfolio.", icon: Layers },
      { id: "lifecycle", name: "Product Lifecycle", desc: "Operate platform through lifecycle: build, run, evolve, retire.", icon: Workflow },
      { id: "adoption", name: "Adoption Planning", desc: "Plan adoption, onboarding, and change management.", icon: TrendingUp },
    ],
  },
  {
    id: "cx", n: 2, name: "Internal Customer Experience",
    desc: "Deeply understand and serve developer customers.",
    color: "sky", band: "from-sky-50/80 to-white", icon: Users,
    caps: [
      { id: "research", name: "Customer Research", desc: "Gather insights from developers and platform users.", icon: Eye },
      { id: "personas", name: "Persona Development", desc: "Create personas to align platform capabilities to user needs.", icon: Users },
      { id: "feedback", name: "Feedback Programs", desc: "Collect continuous feedback through multiple channels.", icon: MessageSquare },
      { id: "csat-cap", name: "Satisfaction Measurement", desc: "Measure NPS, CSAT, and customer effort regularly.", icon: Smile },
      { id: "advocacy", name: "Advocacy Programs", desc: "Build champions and promote platform success stories.", icon: Megaphone },
    ],
  },
  {
    id: "ss", n: 3, name: "Self-Service Engineering",
    desc: "Enable developers to get what they need without waiting.",
    color: "emerald", band: "from-emerald-50/80 to-white", icon: Zap,
    caps: [
      { id: "env", name: "Environment Provisioning", desc: "Self-service creation of environments in minutes.", icon: Boxes },
      { id: "infra-ss", name: "Infrastructure Self-Service", desc: "Provision compute, networking, storage on demand.", icon: ServerCog },
      { id: "deploy-ss", name: "App Deployment Self-Service", desc: "Deploy applications with approved patterns.", icon: GitBranch },
      { id: "db-ss", name: "Database Self-Service", desc: "Self-service databases with guardrails and standards.", icon: Database },
      { id: "id-ss", name: "Identity Self-Service", desc: "Self-service access requests and role management.", icon: KeyRound },
      { id: "api-ss", name: "API Self-Service", desc: "Discover and consume APIs through a self-service catalog.", icon: Code2 },
    ],
  },
  {
    id: "svc", n: 4, name: "Platform Services & Golden Paths",
    desc: "Provide reusable services and proven patterns.",
    color: "indigo", band: "from-indigo-50/80 to-white", icon: Layers,
    caps: [
      { id: "cloud", name: "Cloud Platform Services", desc: "Standardized cloud foundations and landing zones.", icon: Cloud },
      { id: "dev", name: "Developer Platform Services", desc: "CI/CD, repos, artifacts, templates, and pipelines.", icon: GitBranch },
      { id: "data", name: "Data Platform Services", desc: "Databases, streaming, cache, and data services.", icon: Database },
      { id: "sec", name: "Security Platform Services", desc: "Identity, secrets, policies, and security services.", icon: ShieldCheck },
      { id: "rel", name: "Reliability Platform Services", desc: "Observability, SLOs, alerts, and runbook services.", icon: Activity },
      { id: "int", name: "Integration Platform Services", desc: "Eventing, APIs, and integration building blocks.", icon: Network },
    ],
  },
  {
    id: "gov", n: 5, name: "Reliability, Security & Governance",
    desc: "Ensure the platform is secure, reliable, and well governed.",
    color: "amber", band: "from-amber-50/80 to-white", icon: ShieldCheck,
    caps: [
      { id: "slo", name: "SLO & Reliability Management", desc: "Define SLOs, error budgets, and reliability standards.", icon: Gauge },
      { id: "cap", name: "Capacity Planning", desc: "Right-size and plan capacity for predictable growth.", icon: TrendingUp },
      { id: "res", name: "Resilience Engineering", desc: "Design for failure, perform chaos tests, improve recovery.", icon: HeartPulse },
      { id: "secdef", name: "Security by Default", desc: "Bake in security controls, policies, and guardrails.", icon: ShieldCheck },
      { id: "pac", name: "Policy as Code", desc: "Automate policies and compliance as code.", icon: Code2 },
      { id: "own", name: "Service Ownership & Governance", desc: "Define ownership, standards, and decision rights.", icon: Users },
    ],
  },
  {
    id: "val", n: 6, name: "Analytics & Value Realization",
    desc: "Measure impact and drive continuous improvement.",
    color: "rose", band: "from-rose-50/80 to-white", icon: BarChart3,
    caps: [
      { id: "adopt-an", name: "Adoption Analytics", desc: "Track usage, active teams, and customer engagement.", icon: TrendingUp },
      { id: "prod-an", name: "Dev Productivity Analytics", desc: "Measure lead time, DORA metrics, and flow efficiency.", icon: Activity },
      { id: "cons-an", name: "Service Consumption Analytics", desc: "Understand usage trends and top consumed services.", icon: BarChart3 },
      { id: "cost-an", name: "Cost Analytics", desc: "Track cost, unit economics, and cost efficiency.", icon: DollarSign },
      { id: "val-an", name: "Value Realization Analytics", desc: "Connect platform usage to business outcomes and ROI.", icon: Sparkles },
      { id: "health-an", name: "Platform Health Analytics", desc: "Monitor platform health, quality, and experience KPIs.", icon: HeartPulse },
    ],
  },
];

const GOLDEN_PATHS = [
  { id: "gp-arch", name: "Architecture Patterns" },
  { id: "gp-dep", name: "Deployment Patterns" },
  { id: "gp-obs", name: "Observability Patterns" },
  { id: "gp-db", name: "Database Patterns" },
  { id: "gp-api", name: "API Patterns" },
];

const OUTCOMES = [
  { id: "faster", name: "Developers Move Faster", desc: "Self-service, golden paths, and automation remove friction.", icon: Zap },
  { id: "scale", name: "Platform Scales Reliably", desc: "Standardized services and SRE practices ensure stability at scale.", icon: TrendingUp },
  { id: "secure", name: "Security Is Built In", desc: "Guardrails and policy as code reduce risk by default.", icon: ShieldCheck },
  { id: "cost", name: "Costs Are Optimized", desc: "Visibility and unit economics align engineering with business value.", icon: DollarSign },
  { id: "love", name: "Teams Love The Platform", desc: "High adoption, satisfaction, and advocacy drive sustainable growth.", icon: HeartPulse },
];

/* ---------- helpers ---------- */
const colorMap: Record<string, { ring: string; text: string; bg: string; chip: string; dot: string }> = {
  violet: { ring: "ring-violet-200", text: "text-violet-700", bg: "bg-violet-50", chip: "border-violet-200 bg-violet-50/70 text-violet-700", dot: "bg-violet-500" },
  sky:    { ring: "ring-sky-200",    text: "text-sky-700",    bg: "bg-sky-50",    chip: "border-sky-200 bg-sky-50/70 text-sky-700",       dot: "bg-sky-500" },
  emerald:{ ring: "ring-emerald-200",text: "text-emerald-700",bg: "bg-emerald-50",chip: "border-emerald-200 bg-emerald-50/70 text-emerald-700", dot: "bg-emerald-500" },
  indigo: { ring: "ring-indigo-200", text: "text-indigo-700", bg: "bg-indigo-50", chip: "border-indigo-200 bg-indigo-50/70 text-indigo-700",  dot: "bg-indigo-500" },
  amber:  { ring: "ring-amber-200",  text: "text-amber-700",  bg: "bg-amber-50",  chip: "border-amber-200 bg-amber-50/70 text-amber-700",     dot: "bg-amber-500" },
  rose:   { ring: "ring-rose-200",   text: "text-rose-700",   bg: "bg-rose-50",   chip: "border-rose-200 bg-rose-50/70 text-rose-700",        dot: "bg-rose-500" },
};

function Sparkline({ values, color = "#6366f1" }: { values: number[]; color?: string }) {
  const w = 64, h = 18;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
    </svg>
  );
}

/* ---------- Content for the right pane ---------- */
type CapContent = {
  definition: string;
  responsibilities: string[];
  competencies: string[];
  metrics: string[];
  artifacts: string[];
  risks: string[];
  ownership?: string;
  related?: string[];
};

const CAP_CONTENT: Record<string, CapContent> = {
  vision: {
    definition: "Sets the platform purpose, customer segments, value proposition, principles, and business outcomes.",
    responsibilities: ["Define mission and target customers","Set service scope and investment themes","Publish principles","Define success measures","Set adoption goals"],
    competencies: ["Platform product management","Cloud strategy","Internal developer platform knowledge","Stakeholder alignment","Financial reasoning","SRE literacy"],
    metrics: ["Platform adoption","Active consuming teams","NPS","Roadmap completion","Business value delivered"],
    artifacts: ["Platform charter","Strategy brief","Investment themes","Platform principles","Target personas"],
    risks: ["Vision too generic","Technology-led roadmap","Unclear customers","No outcome measures"],
    ownership: "Platform Product Lead",
    related: ["roadmap","portfolio","adoption"],
  },
  roadmap: {
    definition: "Prioritizes platform investments based on developer pain, operational risk, reliability needs, and business value.",
    responsibilities: ["Build and sequence roadmap","Prioritize backlog","Publish commitments","Manage dependencies"],
    competencies: ["Product management","Prioritization","Dependency management","Release planning","Stakeholder management"],
    metrics: ["Roadmap delivery","Adoption by release","Backlog age","Feature usage","Time to value"],
    artifacts: ["Roadmap","Release plan","Backlog","Dependency map","Quarterly planning board"],
    risks: ["Roadmap becomes a wish list","Over-indexing on infra requests","No adoption plan"],
    ownership: "Platform PM",
    related: ["vision","lifecycle","adoption"],
  },
  portfolio: {
    definition: "Manages platform services as a portfolio so the org knows what to build, operate, retire, standardize, and invest in.",
    responsibilities: ["Catalog services","Rationalize tools","Retire duplicates","Manage lifecycle","Track cost and usage"],
    competencies: ["Service portfolio management","Platform operations","FinOps","Architecture governance"],
    metrics: ["Duplicate tools reduced","Service adoption","Retired services","Cost per service","Utilization"],
    artifacts: ["Portfolio register","Service catalog","Lifecycle register","Rationalization plan"],
    risks: ["Too many services","No retirement discipline","Unclear ownership"],
    ownership: "Platform Portfolio Lead",
    related: ["lifecycle","cost-an","own"],
  },
  lifecycle: {
    definition: "Manages platform services from discovery through launch, operation, improvement, and retirement.",
    responsibilities: ["Define lifecycle stages","Publish release notes","Manage maturity","Gather feedback","Retire obsolete services"],
    competencies: ["Product lifecycle","Release management","Service ownership","Operational readiness"],
    metrics: ["Lifecycle compliance","Service maturity","Support volume","Retirement progress"],
    artifacts: ["Lifecycle policy","Maturity score","Release notes","Retirement plan"],
    risks: ["Every service lives forever","No lifecycle ownership","Poor communication"],
    ownership: "Service Owners",
    related: ["portfolio","feedback","own"],
  },
  adoption: {
    definition: "Turns platform capability into actual usage by product teams.",
    responsibilities: ["Define adoption targets","Identify early adopters","Train teams","Publish enablement","Measure uptake"],
    competencies: ["Change enablement","Developer advocacy","Training","Stakeholder management","Analytics"],
    metrics: ["Adoption rate","Active users","Onboarding completion","Support requests","Usage growth"],
    artifacts: ["Adoption plan","Enablement calendar","Training content","Champions list"],
    risks: ["Build-it-and-they-will-come","No onboarding","No feedback loop"],
    ownership: "Developer Advocacy",
    related: ["advocacy","feedback","adopt-an"],
  },
  research: {
    definition: "Discovers what developers, SREs, security, data, and QA teams need from the platform.",
    responsibilities: ["Interview users","Map friction","Analyze tickets","Observe workflows","Identify high-value use cases"],
    competencies: ["User research","Developer experience","Journey mapping","Technical discovery"],
    metrics: ["Research coverage","Pain points validated","Journey maps","Opportunities prioritized"],
    artifacts: ["Interview notes","Developer journey map","Friction inventory","Opportunity backlog"],
    risks: ["Assuming needs","Listening only to loudest teams"],
    ownership: "DX Research",
    related: ["personas","feedback","csat-cap"],
  },
  personas: {
    definition: "Defines different platform customer types and what each needs from the platform.",
    responsibilities: ["Define personas (App Dev, SRE, Data Eng, Security, QA, PO, Eng Lead)","Map needs","Map service fit"],
    competencies: ["UX research","DX strategy","Service mapping"],
    metrics: ["Persona coverage","Service fit","Onboarding success","Support reduction"],
    artifacts: ["Persona cards","Needs matrix","Service mapping"],
    risks: ["One-size-fits-all experience"],
    ownership: "DX Research",
    related: ["research","adoption","csat-cap"],
  },
  feedback: {
    definition: "Creates continuous feedback loops from platform users.",
    responsibilities: ["Run office hours, surveys, embedded feedback","Mine support tickets","Run user councils & champions"],
    competencies: ["Community management","DX research","Service design"],
    metrics: ["Feedback volume","Response rate","Closed feedback items","Satisfaction improvement"],
    artifacts: ["Feedback backlog","Survey dashboard","Office hours notes","Release feedback"],
    risks: ["Feedback collected but not acted on"],
    ownership: "Platform PM",
    related: ["research","csat-cap","advocacy"],
  },
  "csat-cap": {
    definition: "Measures whether platform users find the platform useful, reliable, understandable, and easy to consume.",
    responsibilities: ["Run developer NPS, CSAT, CES","Track onboarding satisfaction","Track docs quality"],
    competencies: ["Survey design","Analytics","Service measurement"],
    metrics: ["Developer NPS","CSAT","Customer Effort Score","Onboarding satisfaction","Docs quality"],
    artifacts: ["Survey dashboard","Satisfaction trend","Experience scorecard"],
    risks: ["Measuring only uptime, not experience"],
    ownership: "Platform PM",
    related: ["feedback","research","health-an"],
  },
  advocacy: {
    definition: "Builds champions who help teams adopt platform services and share success stories.",
    responsibilities: ["Identify champions","Run enablement","Publish wins","Build internal community"],
    competencies: ["Developer advocacy","Community","Storytelling"],
    metrics: ["Champion coverage","Adoption by team","Enablement attendance","Success stories"],
    artifacts: ["Champion roster","Community hub","Internal case studies"],
    risks: ["Platform perceived as mandate rather than value"],
    ownership: "Developer Advocacy",
    related: ["adoption","feedback","love"],
  },
  env: {
    definition: "Allows teams to create approved environments quickly through self-service workflows.",
    responsibilities: ["Provide dev/test/staging/sandbox/ephemeral","Provide production-ready patterns"],
    competencies: ["IaC","Cloud foundations","Workflow automation"],
    metrics: ["Provisioning time","Approval time","Environment drift","Self-service usage"],
    artifacts: ["Provisioning workflow","Environment template","Landing zone policy"],
    risks: ["Hidden manual approvals","Snowflake environments"],
    ownership: "Platform Engineering",
    related: ["infra-ss","cloud","deploy-ss"],
  },
  "infra-ss": {
    definition: "Allows teams to provision compute, network, storage, and runtime services through approved templates.",
    responsibilities: ["Publish Terraform modules","Manage policy controls","Run request workflows"],
    competencies: ["IaC","Cloud architecture","Policy"],
    metrics: ["Self-service completion","Infra drift","Policy compliance","Provisioning failures"],
    artifacts: ["Terraform modules","Infra templates","Request forms","Policy controls"],
    risks: ["Self-service without guardrails","Cloud sprawl"],
    ownership: "Cloud Platform",
    related: ["cloud","env","pac"],
  },
  "deploy-ss": {
    definition: "Allows teams to deploy applications through supported pipelines and approved patterns.",
    responsibilities: ["Provide CI/CD templates","Publish release checklists","Provide rollback patterns"],
    competencies: ["CI/CD","Release engineering","DevOps"],
    metrics: ["Deployment frequency","Lead time","Rollback success","Change failure rate"],
    artifacts: ["CI/CD templates","Deployment guide","Release checklist","Rollback plan"],
    risks: ["Teams bypass pipelines","Release quality drops"],
    ownership: "Developer Platform",
    related: ["dev","gp-dep","slo"],
  },
  "db-ss": {
    definition: "Provides approved database provisioning, access, backup, monitoring, and lifecycle patterns.",
    responsibilities: ["Provide DB templates","Govern access","Manage backups","Monitor health"],
    competencies: ["Database engineering","SRE","Security"],
    metrics: ["DB provisioning time","Backup coverage","Access request time","DB incidents"],
    artifacts: ["DB templates","Backup policy","Access model","Monitoring standard"],
    risks: ["DB sprawl","Weak backups","Inconsistent access"],
    ownership: "Data Platform",
    related: ["data","gp-db","secdef"],
  },
  "id-ss": {
    definition: "Provides governed access requests, role management, service identities, secrets, and least-privilege patterns.",
    responsibilities: ["Publish role catalog","Run access workflows","Manage secrets","Run access reviews"],
    competencies: ["IAM","PAM","Security engineering"],
    metrics: ["Access cycle time","PAM coverage","Orphaned accounts","Review completion"],
    artifacts: ["Role catalog","Access workflows","Secrets standards","IAM patterns"],
    risks: ["Privilege sprawl","Manual reviews","Unclear ownership"],
    ownership: "Security Platform",
    related: ["sec","secdef","pac"],
  },
  "api-ss": {
    definition: "Helps teams discover, consume, publish, and govern APIs through a self-service catalog.",
    responsibilities: ["Run API catalog","Set API standards","Manage versioning","Provide sample code"],
    competencies: ["API design","API governance","Developer experience"],
    metrics: ["API adoption","API reuse","Onboarding time","API incidents"],
    artifacts: ["API catalog","API standards","Sample code","Versioning policy"],
    risks: ["Duplicate APIs","Poor docs","Breaking changes"],
    ownership: "Integration Platform",
    related: ["int","gp-api","dev"],
  },
  cloud: {
    definition: "Provides standardized cloud foundations for AWS, GCP, and future cloud environments.",
    responsibilities: ["Landing zones","Account vending","Networking","IAM","Tagging","Backup","Policy controls"],
    competencies: ["Cloud architecture","Network","IAM","FinOps"],
    metrics: ["Account standardization","Compliance rate","Provisioning time","Cost variance","Policy drift"],
    artifacts: ["Landing zone architecture","Account factory","Cloud standards","Tagging policy"],
    risks: ["Cloud inconsistency","Unmanaged accounts","Manual setup"],
    ownership: "Cloud Platform",
    related: ["infra-ss","secdef","cost-an"],
  },
  dev: {
    definition: "Provides CI/CD, source control standards, artifact management, templates, environments, and developer workflows.",
    responsibilities: ["GitHub standards","CI/CD templates","Release workflows","Developer portal"],
    competencies: ["DevOps","Developer experience","Release engineering"],
    metrics: ["Pipeline adoption","Repo standardization","Deployment frequency","Lead time","Dev satisfaction"],
    artifacts: ["GitHub standards","CI/CD templates","Release workflows","Developer portal"],
    risks: ["Tooling without adoption","Inconsistent pipelines","Poor DX"],
    ownership: "Developer Platform",
    related: ["deploy-ss","gp-dep","prod-an"],
  },
  data: {
    definition: "Provides reusable data services, databases, streaming, governance, and shared patterns.",
    responsibilities: ["Postgres / SQL Server / Oracle migration patterns","Kafka","Data APIs","Analytics enablement"],
    competencies: ["Data engineering","DBA","Governance"],
    metrics: ["Data freshness","Data platform availability","Pipeline success","DB incidents"],
    artifacts: ["Data service catalog","DB standards","Streaming patterns","Governance model"],
    risks: ["DB complexity hidden","Inconsistent controls"],
    ownership: "Data Platform",
    related: ["db-ss","gp-db","gp-obs"],
  },
  sec: {
    definition: "Provides reusable security controls that teams consume by default.",
    responsibilities: ["IAM, PAM, secrets","Vulnerability workflows","Security scanning","Policy as code"],
    competencies: ["Security engineering","DevSecOps","Compliance"],
    metrics: ["Control coverage","Vuln SLA","Secrets adoption","Misconfiguration reduction"],
    artifacts: ["Security guardrails","Policy library","Secrets pattern","Vuln workflow"],
    risks: ["Security remains ticket based","Controls bypassed","Unclear remediation ownership"],
    ownership: "Security Platform",
    related: ["secdef","pac","id-ss"],
  },
  rel: {
    definition: "Provides reusable observability, alerting, incident, runbook, SLO, and service health capabilities.",
    responsibilities: ["Observability standards","Dashboards","SLO templates","Runbooks","Incident model"],
    competencies: ["SRE","Observability","Incident response"],
    metrics: ["SLO coverage","Actionable alert rate","Monitoring coverage","MTTR","Repeat incidents"],
    artifacts: ["Observability standards","Datadog dashboards","SLO templates","Runbooks","Incident model"],
    risks: ["Monitoring without ownership","Alert noise","Runbooks that create tickets"],
    ownership: "Reliability Platform",
    related: ["slo","gp-obs","res"],
  },
  int: {
    definition: "Provides reusable integration patterns for APIs, events, streaming, third-party, and internal workflows.",
    responsibilities: ["Integration catalog","Event standards","API gateway patterns","Integration runbooks"],
    competencies: ["Integration architecture","Event-driven design"],
    metrics: ["Integration reuse","Onboarding time","Failed integrations","API error rate"],
    artifacts: ["Integration catalog","Event standards","API gateway pattern","Integration runbooks"],
    risks: ["Point-to-point sprawl","Hidden dependencies","Brittle interfaces"],
    ownership: "Integration Platform",
    related: ["api-ss","gp-api","dev"],
  },
  slo: {
    definition: "Defines reliability targets and tracks whether platform services meet user expectations.",
    responsibilities: ["Define SLOs","Track error budgets","Publish service health"],
    competencies: ["SRE","Observability"],
    metrics: ["SLO compliance","Error budget burn","Availability","Latency","Incidents"],
    artifacts: ["SLO catalog","Error budget report","Service health dashboard"],
    risks: ["SLOs created but not used in decisions"],
    ownership: "Reliability Platform",
    related: ["rel","cap","res"],
  },
  cap: {
    definition: "Plans platform capacity based on usage, growth, seasonality, and business demand.",
    responsibilities: ["Forecast capacity","Monitor saturation","Plan scaling and reservations"],
    competencies: ["Capacity engineering","FinOps","SRE"],
    metrics: ["Forecast accuracy","Saturation risk","Scaling events","Reserved coverage"],
    artifacts: ["Capacity plan","Utilization dashboard","Scaling model"],
    risks: ["Manual scaling","Surprise demand","Overprovisioning"],
    ownership: "Reliability Platform",
    related: ["slo","cost-an","cloud"],
  },
  res: {
    definition: "Designs and tests failure recovery for platform services.",
    responsibilities: ["Design resilience patterns","Run failover and chaos tests","Close resilience gaps"],
    competencies: ["Chaos engineering","SRE","Resilience design"],
    metrics: ["Recovery time","Recovery point","Failover test completion","Gaps closed"],
    artifacts: ["Resilience plan","Failover runbook","Test results","Fault injection plan"],
    risks: ["Tabletop only","Untested recovery paths"],
    ownership: "Reliability Platform",
    related: ["slo","rel","cap"],
  },
  secdef: {
    definition: "Bakes controls into services so teams inherit secure patterns automatically.",
    responsibilities: ["Provide secure baselines","Hardening standards","Access patterns","Compliance evidence"],
    competencies: ["Security engineering","Compliance","Platform design"],
    metrics: ["Secure pattern adoption","Misconfig reduction","Vuln closure","Exception rate"],
    artifacts: ["Security baseline","Hardening standard","Access pattern","Compliance evidence"],
    risks: ["Security gates added too late","Too many exceptions"],
    ownership: "Security Platform",
    related: ["sec","pac","secure"],
  },
  pac: {
    definition: "Automates governance and compliance through version-controlled policies.",
    responsibilities: ["Author policies","Enforce via guardrails","Manage exceptions"],
    competencies: ["Policy engineering","DevSecOps","Compliance automation"],
    metrics: ["Policy coverage","Blocked misconfigs","Drift reduction","Exceptions"],
    artifacts: ["Policy library","Compliance rules","Guardrail dashboard"],
    risks: ["Policies not tied to dev workflows","False positives"],
    ownership: "Security Platform",
    related: ["secdef","sec","own"],
  },
  own: {
    definition: "Clarifies who owns each platform service, who consumes it, and who is accountable for outcomes.",
    responsibilities: ["Maintain ownership matrix","Run service reviews","Clarify escalation"],
    competencies: ["Service ownership","Operating model design"],
    metrics: ["Services with owners","Review completion","Support accountability","Escalation clarity"],
    artifacts: ["Ownership matrix","Service catalog","RACI","Decision rights"],
    risks: ["Shared services become nobody's services"],
    ownership: "Platform Leadership",
    related: ["lifecycle","portfolio","pac"],
  },
  "adopt-an": {
    definition: "Tracks who is using platform services, how often, and where adoption is lagging.",
    responsibilities: ["Publish adoption dashboards","Spot gaps","Trigger enablement"],
    competencies: ["Product analytics","DX measurement"],
    metrics: ["Active teams","Active users","Usage by service","Adoption by product line"],
    artifacts: ["Adoption dashboard","Usage report","Team heatmap"],
    risks: ["No visibility into platform usage"],
    ownership: "Platform PM",
    related: ["adoption","cons-an","val-an"],
  },
  "prod-an": {
    definition: "Measures whether the platform improves flow and reduces friction.",
    responsibilities: ["Publish DORA & flow metrics","Track friction","Inform roadmap"],
    competencies: ["DX analytics","SRE","DevOps measurement"],
    metrics: ["Lead time","Deployment frequency","Change failure rate","Onboarding time","Dev satisfaction"],
    artifacts: ["Dev productivity dashboard","DORA metrics","Friction report"],
    risks: ["Measuring output instead of flow"],
    ownership: "Platform PM",
    related: ["dev","deploy-ss","faster"],
  },
  "cons-an": {
    definition: "Tracks consumption of platform services by product, team, environment, and business capability.",
    responsibilities: ["Publish consumption dashboards","Identify unused services","Drive rationalization"],
    competencies: ["Analytics","Service management"],
    metrics: ["Service usage","Top consumers","Growth rate","Unused services","Service cost"],
    artifacts: ["Consumption dashboard","Service usage map","Showback report"],
    risks: ["No connection between usage and value"],
    ownership: "Platform Ops",
    related: ["adopt-an","cost-an","portfolio"],
  },
  "cost-an": {
    definition: "Connects platform consumption to cost transparency, unit economics, and optimization.",
    responsibilities: ["Publish FinOps views","Run showback/chargeback","Track savings"],
    competencies: ["FinOps","Cloud cost engineering"],
    metrics: ["Cost by service","Cost by team","Unit cost","Waste","Forecast variance"],
    artifacts: ["FinOps dashboard","Showback report","Savings plan tracker"],
    risks: ["Cost reports without ownership or action"],
    ownership: "FinOps",
    related: ["cloud","cap","cost"],
  },
  "val-an": {
    definition: "Connects platform investments to business and engineering outcomes.",
    responsibilities: ["Publish value scorecard","Maintain ROI model","Brief executives"],
    competencies: ["Business analysis","Outcome modeling"],
    metrics: ["Time saved","Incidents reduced","Release velocity","Tickets reduced","Cost avoided","Adoption driven"],
    artifacts: ["Value scorecard","ROI model","Executive readout"],
    risks: ["Platform seen only as cost center"],
    ownership: "Platform Leadership",
    related: ["adopt-an","cost-an","cost"],
  },
  "health-an": {
    definition: "Measures the reliability, performance, supportability, and usability of the platform itself.",
    responsibilities: ["Publish platform health dashboards","Track support analytics","Drive improvements"],
    competencies: ["SRE","Service ops","Analytics"],
    metrics: ["Platform availability","Latency","Support volume","Incident rate","Satisfaction"],
    artifacts: ["Platform health dashboard","Service scorecards","Support analytics"],
    risks: ["Platform team monitors everyone except itself"],
    ownership: "Reliability Platform",
    related: ["slo","csat-cap","scale"],
  },
};

const KPI_CONTENT: Record<string, { definition: string; formula: string; sources: string[]; healthy: string; atRisk: string; poor: string; levers: string[]; owner: string }> = {
  adoption: {
    definition: "Percentage of eligible teams actively using core platform services in the last 30 days.",
    formula: "(Active consuming teams ÷ Total eligible teams) × 100",
    sources: ["Service catalog telemetry","CI/CD usage","Cloud account activity"],
    healthy: "> 75%", atRisk: "60–75%", poor: "< 60%",
    levers: ["Adoption planning","Champions","Golden paths","Onboarding"],
    owner: "Platform PM",
  },
  csat: {
    definition: "Average developer satisfaction with the platform measured via quarterly NPS/CSAT.",
    formula: "Mean of CSAT scores across responding developers",
    sources: ["DX survey","Embedded feedback","Office hours"],
    healthy: "> 4.2", atRisk: "3.8–4.2", poor: "< 3.8",
    levers: ["DX research","Docs","Support model","Self-service"],
    owner: "Platform PM",
  },
  prov: {
    definition: "Time from request to a usable environment for a developer.",
    formula: "p50 minutes from request submission to environment ready",
    sources: ["Provisioning workflow","Ticket data"],
    healthy: "< 30 min", atRisk: "30–120 min", poor: "> 2 hrs",
    levers: ["Self-service workflows","Landing zones","Templates","Policy as code"],
    owner: "Cloud Platform",
  },
  self: {
    definition: "Share of platform interactions completed via self-service rather than tickets.",
    formula: "(Self-service actions ÷ Total platform actions) × 100",
    sources: ["IDP telemetry","Ticketing system","CI/CD"],
    healthy: "> 75%", atRisk: "60–75%", poor: "< 60%",
    levers: ["Golden paths","Templates","Approvals automation"],
    owner: "Platform Engineering",
  },
  tix: {
    definition: "Year-over-year change in platform support tickets per active team.",
    formula: "((Current period tickets − Prior period) ÷ Prior period) × 100",
    sources: ["ServiceNow","Slack support channels"],
    healthy: "< -30%", atRisk: "-30% to 0%", poor: "Increasing",
    levers: ["Self-service","Better docs","Champions","Defect reduction"],
    owner: "Platform Ops",
  },
};

const PATH_CONTENT: Record<string, { overview: string; pattern: string; dx: string; gov: string; metrics: string[] }> = {
  "gp-arch": {
    overview: "Reference architecture patterns for common system shapes (web service, batch, event-driven, data product).",
    pattern: "Approved patterns embed networking, IAM, observability, and resilience defaults.",
    dx: "Cookiecutter templates, IDP scaffolds, and reference repos.",
    gov: "Exceptions logged, versioning per pattern, deprecation lifecycle.",
    metrics: ["Pattern adoption","Exception rate","Time to first commit"],
  },
  "gp-dep": {
    overview: "Standard CI/CD deployment patterns: trunk-based, progressive delivery, blue/green.",
    pattern: "Pipelines enforce policy as code, security scans, and rollback hooks.",
    dx: "Templates in IDP, one-click promote to prod, on-call hand-off built in.",
    gov: "Mandatory checks, approved exceptions, audit trail.",
    metrics: ["Deployment frequency","Change failure rate","Rollback success"],
  },
  "gp-obs": {
    overview: "Standard observability patterns: structured logs, RED/USE dashboards, SLOs.",
    pattern: "Datadog dashboards-as-code, alert routing by service ownership.",
    dx: "Library + templates, sample dashboards, on-call ready alert presets.",
    gov: "SLO templates, alert review cadence, noise budgets.",
    metrics: ["SLO coverage","Actionable alert rate","MTTR"],
  },
  "gp-db": {
    overview: "Database patterns for Postgres, SQL Server, and managed alternatives.",
    pattern: "Provisioning, backup, monitoring, access, and migration baked in.",
    dx: "Self-service DB creation with guardrails and one-click backups.",
    gov: "Approved engines, lifecycle, exception process.",
    metrics: ["Provisioning time","Backup coverage","DB incidents"],
  },
  "gp-api": {
    overview: "API patterns for design, versioning, gateway, and consumer onboarding.",
    pattern: "OpenAPI-first, gateway-enforced auth, rate limits, versioning standards.",
    dx: "API catalog, sample clients, contract tests in CI.",
    gov: "Lifecycle stages, breaking change policy, exceptions.",
    metrics: ["API adoption","API reuse","Error rate"],
  },
};

const OUTCOME_CONTENT: Record<string, { biz: string; eng: string; cust: string; domains: string[]; capabilities: string[]; kpis: string[] }> = {
  faster: {
    biz: "Faster time to market, more business experiments per quarter.",
    eng: "Lower lead time, higher deployment frequency, less toil.",
    cust: "New features arrive sooner and more reliably.",
    domains: ["Self-Service Engineering","Platform Services & Golden Paths"],
    capabilities: ["deploy-ss","env","dev","gp-dep"],
    kpis: ["Lead time","Deployment frequency","Provisioning time"],
  },
  scale: {
    biz: "Platform supports growth and acquisitions without operations breaking.",
    eng: "Standardized services, SRE practices, predictable capacity.",
    cust: "Stable, performant services even under demand spikes.",
    domains: ["Platform Services & Golden Paths","Reliability, Security & Governance"],
    capabilities: ["slo","cap","res","rel"],
    kpis: ["SLO compliance","Availability","MTTR"],
  },
  secure: {
    biz: "Lower regulatory risk, fewer incidents, protected PHI.",
    eng: "Guardrails and policy-as-code reduce misconfiguration risk.",
    cust: "Trust in data handling and platform integrity.",
    domains: ["Reliability, Security & Governance"],
    capabilities: ["secdef","pac","sec","id-ss"],
    kpis: ["Misconfig reduction","Vuln SLA","Control coverage"],
  },
  cost: {
    biz: "Unit economics improve; platform investments are justified.",
    eng: "Visibility into cost drivers; right-sized environments.",
    cust: "Sustainable pricing and reinvestment in capability.",
    domains: ["Analytics & Value Realization","Reliability, Security & Governance"],
    capabilities: ["cost-an","cap","portfolio"],
    kpis: ["Cost by service","Unit cost","Waste"],
  },
  love: {
    biz: "High adoption sustains the platform investment thesis.",
    eng: "Teams pull from the platform instead of building around it.",
    cust: "Internal advocates drive better customer-facing outcomes.",
    domains: ["Internal Customer Experience","Analytics & Value Realization"],
    capabilities: ["advocacy","csat-cap","feedback"],
    kpis: ["NPS","CSAT","Champion coverage"],
  },
};

/* ---------- Page ---------- */
export default function PlatformAsAProduct() {
  const navigate = useNavigate();
  const [pane, setPane] = useState<Pane | null>(null);
  const [hoverDomain, setHoverDomain] = useState<string | null>(null);
  const [hoverCap, setHoverCap] = useState<string | null>(null);

  // flat lists for prev/next navigation
  const allCaps = useMemo(() => DOMAINS.flatMap(d => d.caps.map(c => c.id)), []);

  const openPane = (p: Pane) => setPane(p);
  const closePane = () => setPane(null);

  const navPane = (dir: -1 | 1) => {
    if (!pane) return;
    if (pane.kind === "kpi") {
      const i = KPIS.findIndex(k => k.id === pane.id);
      const n = (i + dir + KPIS.length) % KPIS.length;
      setPane({ kind: "kpi", id: KPIS[n].id });
    } else if (pane.kind === "domain") {
      const i = DOMAINS.findIndex(d => d.id === pane.id);
      const n = (i + dir + DOMAINS.length) % DOMAINS.length;
      setPane({ kind: "domain", id: DOMAINS[n].id });
    } else if (pane.kind === "capability") {
      const i = allCaps.indexOf(pane.id);
      const n = (i + dir + allCaps.length) % allCaps.length;
      setPane({ kind: "capability", id: allCaps[n] });
    } else if (pane.kind === "path") {
      const i = GOLDEN_PATHS.findIndex(g => g.id === pane.id);
      const n = (i + dir + GOLDEN_PATHS.length) % GOLDEN_PATHS.length;
      setPane({ kind: "path", id: GOLDEN_PATHS[n].id });
    } else if (pane.kind === "outcome") {
      const i = OUTCOMES.findIndex(o => o.id === pane.id);
      const n = (i + dir + OUTCOMES.length) % OUTCOMES.length;
      setPane({ kind: "outcome", id: OUTCOMES[n].id });
    }
  };

  // dim helpers
  const dimCap = (capId: string, domainId: string) => {
    if (hoverDomain && hoverDomain !== domainId) return true;
    if (hoverCap && hoverCap !== capId) return true;
    if (pane?.kind === "capability" && pane.id !== capId) return true;
    if (pane?.kind === "domain" && pane.id !== domainId) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900">
      <div className={`transition-all duration-300 ${pane ? "mr-[40%]" : ""}`}>
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/reliability-foundations")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Reliability Foundations
            </button>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Principles <ChevronRight className="inline w-3 h-3" /> Core Principles <ChevronRight className="inline w-3 h-3" /> <span className="text-slate-700">Platform As A Product</span>
            </div>
          </div>

          {/* Hero */}
          <header className="flex items-start gap-5 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center text-white shadow-md">
              <Boxes className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform As A Product</h1>
              <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
                Treat the internal platform like a product used by developers. Own the roadmap, measure adoption,
                and continuously improve based on feedback and outcomes.
              </p>
            </div>
          </header>

          {/* KPI strip */}
          <div className="grid grid-cols-5 gap-3 mb-8">
            {KPIS.map(k => {
              const Icon = k.icon;
              const active = pane?.kind === "kpi" && pane.id === k.id;
              return (
                <button
                  key={k.id}
                  onClick={() => openPane({ kind: "kpi", id: k.id })}
                  className={`text-left rounded-xl border bg-white px-4 py-3 transition-all hover:shadow-md hover:-translate-y-px ${active ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-200"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-[11px] font-semibold text-slate-500">{k.label}</span>
                    </div>
                    <Sparkline values={k.trend} />
                  </div>
                  <div className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">{k.value}</div>
                  <div className="text-[10px] font-medium text-slate-400 mt-0.5">Target: {k.target}</div>
                </button>
              );
            })}
          </div>

          {/* Capability Model */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-900">Platform As A Product Capability Model</h2>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                {DOMAINS.map(d => (
                  <span key={d.id} className="inline-flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${colorMap[d.color].dot}`} />
                    {d.name.split("&")[0].trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {DOMAINS.map(d => {
                const cm = colorMap[d.color];
                const Icon = d.icon;
                const domainDim = (hoverCap && !d.caps.some(c => c.id === hoverCap)) || (pane?.kind === "capability" && !d.caps.some(c => c.id === pane.id) && pane);
                return (
                  <div
                    key={d.id}
                    onMouseEnter={() => setHoverDomain(d.id)}
                    onMouseLeave={() => setHoverDomain(null)}
                    className={`rounded-2xl border border-slate-200 bg-gradient-to-r ${d.band} p-3 transition-opacity ${domainDim ? "opacity-60" : "opacity-100"}`}
                  >
                    <div className="grid grid-cols-12 gap-3 items-stretch">
                      {/* Domain card */}
                      <button
                        onClick={() => openPane({ kind: "domain", id: d.id })}
                        className={`col-span-2 text-left rounded-xl bg-white border border-slate-200 p-4 hover:shadow-md transition-all ${pane?.kind === "domain" && pane.id === d.id ? `ring-2 ${cm.ring}` : ""}`}
                      >
                        <Icon className={`w-5 h-5 ${cm.text}`} />
                        <div className={`mt-2 text-[13px] font-bold ${cm.text}`}>{d.n}. {d.name}</div>
                        <div className="mt-1.5 text-[11px] text-slate-500 leading-snug">{d.desc}</div>
                      </button>

                      {/* Capability cards */}
                      <div className={`col-span-10 grid gap-2 ${d.caps.length === 5 ? "grid-cols-5" : "grid-cols-6"}`}>
                        {d.caps.map(c => {
                          const CIcon = c.icon;
                          const active = pane?.kind === "capability" && pane.id === c.id;
                          const dim = dimCap(c.id, d.id);
                          return (
                            <button
                              key={c.id}
                              onClick={() => openPane({ kind: "capability", id: c.id })}
                              onMouseEnter={() => setHoverCap(c.id)}
                              onMouseLeave={() => setHoverCap(null)}
                              className={`text-left rounded-xl bg-white border p-3 transition-all hover:shadow-md hover:-translate-y-px ${active ? `border-transparent ring-2 ${cm.ring}` : "border-slate-200"} ${dim ? "opacity-50" : "opacity-100"}`}
                            >
                              <div className="flex items-start gap-2">
                                <CIcon className={`w-4 h-4 ${cm.text} mt-0.5 flex-shrink-0`} />
                                <div>
                                  <div className="text-[12px] font-semibold text-slate-800 leading-tight">{c.name}</div>
                                  <div className="text-[10.5px] text-slate-500 mt-1 leading-snug">{c.desc}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Golden paths row inside domain 4 */}
                    {d.id === "svc" && (
                      <div className="mt-2 grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-2 text-[11px] font-semibold text-slate-500 pl-2">Golden Paths (Examples)</div>
                        <div className="col-span-10 flex flex-wrap gap-2">
                          {GOLDEN_PATHS.map(g => {
                            const active = pane?.kind === "path" && pane.id === g.id;
                            return (
                              <button
                                key={g.id}
                                onClick={() => openPane({ kind: "path", id: g.id })}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${active ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"}`}
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                {g.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Outcomes */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">What Success Looks Like</h2>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {OUTCOMES.map(o => {
                const Icon = o.icon;
                const active = pane?.kind === "outcome" && pane.id === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => openPane({ kind: "outcome", id: o.id })}
                    className={`text-left rounded-xl border p-4 transition-all hover:shadow-md hover:-translate-y-px ${active ? "border-indigo-300 ring-2 ring-indigo-100 bg-indigo-50/30" : "border-slate-200 bg-slate-50/40"}`}
                  >
                    <Icon className="w-5 h-5 text-indigo-600" />
                    <div className="mt-2 text-[13px] font-bold text-slate-900">{o.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-snug">{o.desc}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="h-12" />
        </div>
      </div>

      {pane && <RightPane pane={pane} onClose={closePane} onNav={navPane} onJump={(p) => setPane(p)} />}
    </div>
  );
}

/* ---------- Right Pane ---------- */
function RightPane({
  pane, onClose, onNav, onJump,
}: { pane: Pane; onClose: () => void; onNav: (d: -1 | 1) => void; onJump: (p: Pane) => void }) {
  const [tab, setTab] = useState<string>("Overview");

  // Resolve title + meta
  let title = "", category = "", subtitle = "", IconC: any = Sparkles, accent = "indigo";
  let tabs: string[] = ["Overview","Responsibilities","Competencies","Metrics","Artifacts","Risks","Growth Path"];
  let related: { id: string; label: string; jump: Pane }[] = [];

  if (pane.kind === "kpi") {
    const k = KPIS.find(x => x.id === pane.id)!;
    title = k.label; category = "Key Performance Indicator"; subtitle = `${k.value} • Target ${k.target}`;
    IconC = k.icon; accent = "indigo";
    tabs = ["Definition","Measurement","Ownership","Interpretation","Improvement Levers"];
  } else if (pane.kind === "domain") {
    const d = DOMAINS.find(x => x.id === pane.id)!;
    title = d.name; category = "Capability Domain"; subtitle = d.desc;
    IconC = d.icon; accent = d.color;
    tabs = ["Overview","Responsibilities","Operating Model","Capabilities","Metrics","Artifacts","Risks","Growth Path"];
    related = d.caps.slice(0, 6).map(c => ({ id: c.id, label: c.name, jump: { kind: "capability", id: c.id } }));
  } else if (pane.kind === "capability") {
    const dom = DOMAINS.find(d => d.caps.some(c => c.id === pane.id))!;
    const c = dom.caps.find(x => x.id === pane.id)!;
    title = c.name; category = `${dom.name} • Capability`; subtitle = c.desc;
    IconC = c.icon; accent = dom.color;
    tabs = ["Overview","How It Works","Ownership","Competencies","Metrics","Artifacts","Risks","Growth Path"];
    const content = CAP_CONTENT[c.id];
    if (content?.related) {
      related = content.related.map(rid => {
        // try capability
        const inCap = DOMAINS.flatMap(d => d.caps).find(x => x.id === rid);
        if (inCap) return { id: rid, label: inCap.name, jump: { kind: "capability", id: rid } as Pane };
        const inPath = GOLDEN_PATHS.find(g => g.id === rid);
        if (inPath) return { id: rid, label: inPath.name, jump: { kind: "path", id: rid } as Pane };
        const inOut = OUTCOMES.find(o => o.id === rid);
        if (inOut) return { id: rid, label: inOut.name, jump: { kind: "outcome", id: rid } as Pane };
        return { id: rid, label: rid, jump: { kind: "capability", id: rid } as Pane };
      });
    }
  } else if (pane.kind === "path") {
    const g = GOLDEN_PATHS.find(x => x.id === pane.id)!;
    title = g.name; category = "Golden Path"; subtitle = "Reusable, supported pattern for product teams";
    IconC = CheckCircle2; accent = "emerald";
    tabs = ["Overview","Pattern","Developer Experience","Governance","Metrics"];
  } else if (pane.kind === "outcome") {
    const o = OUTCOMES.find(x => x.id === pane.id)!;
    title = o.name; category = "Business Outcome"; subtitle = o.desc;
    IconC = o.icon; accent = "indigo";
    tabs = ["Outcome Summary","Capability Drivers","Measurement","Value Story","Evidence"];
    const oc = OUTCOME_CONTENT[o.id];
    related = oc.capabilities.map(cid => {
      const cap = DOMAINS.flatMap(d => d.caps).find(x => x.id === cid);
      return { id: cid, label: cap?.name ?? cid, jump: { kind: "capability", id: cid } as Pane };
    });
  }

  const cm = colorMap[accent] ?? colorMap.indigo;

  // ensure tab valid when pane changes
  if (!tabs.includes(tab)) setTab(tabs[0]);

  return (
    <aside className="fixed top-0 right-0 h-screen w-[40%] bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl ${cm.bg} ${cm.text} grid place-items-center`}>
              <IconC className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{category}</div>
              <div className="text-lg font-bold text-slate-900 leading-tight">{title}</div>
              <div className="text-[12px] text-slate-500 mt-0.5">{subtitle}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex items-center gap-1 overflow-x-auto -mx-1 px-1 pb-0.5">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap text-[11.5px] font-semibold px-2.5 py-1.5 rounded-md transition-colors ${tab === t ? `${cm.bg} ${cm.text}` : "text-slate-500 hover:text-slate-800"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 text-[13px] text-slate-700 leading-relaxed">
        <PaneBody pane={pane} tab={tab} />
      </div>

      {/* Related + Nav */}
      <div className="border-t border-slate-100 px-6 py-3">
        {related.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Related</div>
            <div className="flex flex-wrap gap-1.5">
              {related.map(r => (
                <button
                  key={r.id}
                  onClick={() => onJump(r.jump)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${cm.chip} hover:opacity-80`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button onClick={() => onNav(-1)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-3.5 h-3.5" /> Previous
          </button>
          <button onClick={() => onNav(1)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800">
            Next <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ---------- Pane bodies ---------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">{title}</div>
      <div>{children}</div>
    </div>
  );
}
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((i, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}
function KVTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full text-[12px]">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b border-slate-100 last:border-0">
            <td className="py-1.5 pr-3 text-slate-500 font-medium w-1/3">{k}</td>
            <td className="py-1.5 text-slate-800">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PaneBody({ pane, tab }: { pane: Pane; tab: string }) {
  // KPI
  if (pane.kind === "kpi") {
    const k = KPIS.find(x => x.id === pane.id)!;
    const c = KPI_CONTENT[k.id];
    if (tab === "Definition") return (
      <>
        <Section title="What this metric means"><p>{c.definition}</p></Section>
        <Section title="Formula"><code className="text-[12px] bg-slate-50 border border-slate-200 rounded px-2 py-1">{c.formula}</code></Section>
        <Section title="What it does NOT mean">
          <Bullets items={["A vanity number","A substitute for qualitative feedback","A team-level performance score"]} />
        </Section>
      </>
    );
    if (tab === "Measurement") return (
      <>
        <Section title="Data sources"><Bullets items={c.sources} /></Section>
        <Section title="Cadence"><p>Reviewed monthly with platform leadership; reported quarterly to executives.</p></Section>
      </>
    );
    if (tab === "Ownership") return (
      <KVTable rows={[["Metric owner", c.owner], ["Influencers", "Platform teams, service owners, product teams"], ["Consumers", "Engineering leadership, CTO, business sponsors"]]} />
    );
    if (tab === "Interpretation") return (
      <>
        <Section title="Healthy"><span className="inline-block px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[12px] font-semibold">{c.healthy}</span></Section>
        <Section title="At risk"><span className="inline-block px-2 py-1 rounded bg-amber-50 text-amber-700 text-[12px] font-semibold">{c.atRisk}</span></Section>
        <Section title="Poor"><span className="inline-block px-2 py-1 rounded bg-rose-50 text-rose-700 text-[12px] font-semibold">{c.poor}</span></Section>
        <Section title="False positives / negatives"><Bullets items={["Spikes from a single large team can mask gaps","Survey response bias from highly engaged teams"]} /></Section>
      </>
    );
    if (tab === "Improvement Levers") return <Section title="Levers"><Bullets items={c.levers} /></Section>;
  }

  // DOMAIN
  if (pane.kind === "domain") {
    const d = DOMAINS.find(x => x.id === pane.id)!;
    if (tab === "Overview") return (
      <>
        <Section title="What this domain means"><p>{d.desc}</p></Section>
        <Section title="Why it exists">
          <p>This domain anchors a critical capability cluster needed to treat the platform like a product and deliver consistent outcomes across reliability, security, cost, and developer productivity.</p>
        </Section>
        <Section title="How it supports SRE and Team Topologies">
          <Bullets items={["Reduces toil and cognitive load","Enables stream-aligned teams to own outcomes","Supports SRE error budgets and reliability practices"]} />
        </Section>
      </>
    );
    if (tab === "Responsibilities") return (
      <KVTable rows={[
        ["Owner", `${d.name} Lead`],
        ["Owns", "Strategy, services, standards, and roadmap for this domain"],
        ["Influences", "Adoption, governance, and engineering practices org-wide"],
        ["Does not own", "Application code or business product roadmaps"],
      ]} />
    );
    if (tab === "Operating Model") return (
      <>
        <Section title="How work flows"><Bullets items={["Intake from research & feedback","Roadmap prioritization","Build / improve services","Publish & enable","Measure & iterate"]} /></Section>
        <Section title="Cadence">
          <KVTable rows={[["Quarterly", "Roadmap & investment review"], ["Monthly", "Service health & adoption review"], ["Weekly", "Backlog grooming & customer office hours"]]} />
        </Section>
      </>
    );
    if (tab === "Capabilities") return (
      <div className="grid grid-cols-2 gap-2">
        {d.caps.map(c => (
          <div key={c.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/40">
            <div className="text-[12.5px] font-semibold text-slate-800">{c.name}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{c.desc}</div>
            <div className="mt-2 text-[10px] text-slate-400">Maturity: <span className="text-emerald-600 font-semibold">Managed</span></div>
          </div>
        ))}
      </div>
    );
    if (tab === "Metrics") return (
      <KVTable rows={[
        ["Adoption", "Capability adoption across consuming teams"],
        ["Maturity", "Average capability maturity in this domain"],
        ["Satisfaction", "Domain-level CSAT from internal customers"],
        ["Cycle time", "Time to deliver new capability or improvement"],
      ]} />
    );
    if (tab === "Artifacts") return <Bullets items={["Domain charter","Service catalog entries","Roadmap & release notes","Dashboards & reports","Runbooks & standards"]} />;
    if (tab === "Risks") return <Bullets items={["Domain becomes a silo","Capabilities not adopted","Standards not enforced","Unclear ownership"]} />;
    if (tab === "Growth Path") return (
      <KVTable rows={[
        ["30 days", "Stand up domain charter, ownership, and baseline metrics"],
        ["90 days", "Ship first 2–3 productized capabilities with enablement"],
        ["180 days", "Adoption KPIs trending; feedback loop operating"],
        ["12 months", "Domain at Productized maturity with measurable outcomes"],
      ]} />
    );
  }

  // CAPABILITY
  if (pane.kind === "capability") {
    const c = CAP_CONTENT[pane.id];
    if (!c) return <p className="text-slate-500">Content coming soon.</p>;
    if (tab === "Overview") return (
      <>
        <Section title="Definition"><p>{c.definition}</p></Section>
        <Section title="Why it matters"><p>Directly improves developer productivity, reliability, security, or cost — and removes friction created by ticket-driven operations.</p></Section>
        <Section title="Client relevance"><p>Supports standardizing across acquired product lines, the AWS/GCP footprint, Virginia data center transition, GitHub standardization, Datadog observability, and the move from ITIL-style operations toward SRE-aligned, self-service platform engineering — while protecting caregiver visits, claims, payroll, and PHI.</p></Section>
      </>
    );
    if (tab === "How It Works") return (
      <KVTable rows={[
        ["Inputs", "Customer needs, telemetry, roadmap priorities"],
        ["Activities", "Design, build, publish, enable, measure, iterate"],
        ["Outputs", "Productized capability with docs, templates, and SLOs"],
        ["Consumers", "Stream-aligned product teams, SREs, security teams"],
        ["Tools", "IDP, IaC, CI/CD, observability, policy as code"],
      ]} />
    );
    if (tab === "Ownership") return (
      <KVTable rows={[
        ["Primary owner", c.ownership ?? "Platform Engineering"],
        ["Contributors", "SRE, Security, Data, Architecture"],
        ["Decision rights", "Owner sets standards; exceptions logged and reviewed"],
        ["Escalation", "Platform leadership → CTO"],
      ]} />
    );
    if (tab === "Competencies") return <Bullets items={c.competencies} />;
    if (tab === "Metrics") return (
      <>
        <Section title="Primary KPIs"><Bullets items={c.metrics} /></Section>
        <Section title="Warning signals"><Bullets items={["Falling adoption","Rising support volume","Exception rate growing"]} /></Section>
        <Section title="Success signals"><Bullets items={["Self-service usage rising","CSAT trending up","Ticket volume falling"]} /></Section>
      </>
    );
    if (tab === "Artifacts") return <Bullets items={c.artifacts} />;
    if (tab === "Risks") return <Bullets items={c.risks} />;
    if (tab === "Growth Path") return (
      <KVTable rows={[
        ["Basic", "Capability exists, manual, inconsistent"],
        ["Managed", "Owned, documented, baseline metrics"],
        ["Productized", "Self-service, golden paths, SLOs, adoption tracked"],
        ["Optimized", "Continuously improved, automated, value measured"],
      ]} />
    );
  }

  // PATH
  if (pane.kind === "path") {
    const p = PATH_CONTENT[pane.id]!;
    if (tab === "Overview") return (
      <>
        <Section title="What it is"><p>{p.overview}</p></Section>
        <Section title="When to use"><Bullets items={["You are building a new service of this type","You are modernizing a legacy service","You want supported reliability and security defaults"]} /></Section>
        <Section title="When not to use"><Bullets items={["Highly unusual constraints requiring an exception","Experimental research workloads with no production target"]} /></Section>
      </>
    );
    if (tab === "Pattern") return <p>{p.pattern}</p>;
    if (tab === "Developer Experience") return <p>{p.dx}</p>;
    if (tab === "Governance") return <p>{p.gov}</p>;
    if (tab === "Metrics") return <Bullets items={p.metrics} />;
  }

  // OUTCOME
  if (pane.kind === "outcome") {
    const o = OUTCOME_CONTENT[pane.id]!;
    if (tab === "Outcome Summary") return (
      <KVTable rows={[["Business outcome", o.biz], ["Engineering outcome", o.eng], ["Customer outcome", o.cust]]} />
    );
    if (tab === "Capability Drivers") return (
      <>
        <Section title="Driving domains"><Bullets items={o.domains} /></Section>
        <Section title="Key capabilities"><Bullets items={o.capabilities.map(cid => DOMAINS.flatMap(d => d.caps).find(c => c.id === cid)?.name ?? cid)} /></Section>
      </>
    );
    if (tab === "Measurement") return <Bullets items={o.kpis} />;
    if (tab === "Value Story") return <p>{o.biz} {o.eng} {o.cust}</p>;
    if (tab === "Evidence") return <Bullets items={["Quarterly value scorecard","Adoption dashboard","SLO and incident trend","FinOps savings report"]} />;
  }

  return null;
}
