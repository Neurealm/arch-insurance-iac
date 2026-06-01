import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Building2,
  LayoutGrid,
  Smile,
  Network as NetworkIcon,
  Activity,
  Boxes,
  Bot,
  BarChart3,
  Target,
  ShieldCheck,
  Workflow,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  PartyPopper,
  FileCheck2,
  Rocket,
  type LucideIcon,
} from "lucide-react";

type FieldType = "short" | "long" | "single" | "multi";

type Question = {
  id: string;
  label: string;
  hint?: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
};

type Section = {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string; // tailwind gradient classes
  questions: Question[];
};

/**
 * HHAX Future State Program — Session #1 discussion questions.
 * Each question is rendered as a long-form response with guidance
 * combining "Why We Are Asking" + "Follow Up and Answer Context".
 */
const mkQ = (
  id: string,
  label: string,
  why: string,
  followUp: string,
): Question => ({
  id,
  label,
  type: "long",
  hint: `Why we're asking: ${why}\nConsider: ${followUp}`,
});

const SECTIONS: Section[] = [
  {
    id: "business",
    title: "Business Priorities & Strategic Outcomes",
    subtitle: "Align future-state operations to HHAX's growth, customer, and enterprise value goals.",
    icon: Target,
    accent: "from-indigo-500 to-violet-600",
    questions: [
      mkQ("1.1", "What are the top business priorities for HHAX over the next 12, 24, and 36 months?", "Future state technology operations must align to HHAX's business strategy, growth, acquisition integration, customer commitments, and enterprise value goals.", "Customer retention, new market growth, acquisition integration, platform consolidation, margin improvement, transaction readiness, product modernization, customer experience, or operational efficiency."),
      mkQ("1.2", "Which business outcomes are most dependent on reliable, scalable, secure, and responsive technology operations?", "Connects SRE, infrastructure, cloud, security, and managed services directly to business value rather than treating them as back-office functions.", "Customer commitments, revenue streams, state program obligations, payer/provider expectations, availability requirements, or workflows that must not fail."),
      mkQ("1.3", "What are the most important customer or market expectations HHAX must meet today?", "HHAX operates customer-facing platforms — technology operations must be evaluated by how well they support customers, caregivers, providers, payers, and state programs.", "Uptime, performance, responsiveness, compliance, billing accuracy, visit verification, reporting, support experience, and trust."),
      mkQ("1.4", "Where does HHAX believe technology operations currently create friction for growth, scalability, or customer experience?", "Identifies operational constraints that a future managed services and modernization partner must help solve.", "Incident volume, manual processes, slow deployments, platform instability, unclear ownership, technical debt, security gaps, cost inefficiency, or limited automation."),
      mkQ("1.5", "What would have to be true for HHAX leadership to say the future state program was successful?", "Creates a clear success lens for workshops, RFP response, managed services model, and transformation roadmap.", "Reduced customer-impacting incidents, improved MTTR, stronger service ownership, faster deployments, better cyber posture, lower run cost, improved visibility, or a clearer operating model."),
      mkQ("1.6", "What are the business consequences when critical platforms are unavailable, degraded, or slow?", "Ensures reliability discussions are tied to business impact, customer trust, regulatory exposure, and revenue risk.", "Impacts to caregiver workflows, visit documentation, EVV, claims, billing, state reporting, provider operations, customer escalations, contractual obligations, and executive visibility."),
      mkQ("1.7", "Are there board-level, investor, or PE value-creation objectives technology operations should support?", "HHAX's future operating model should support both operational execution and enterprise value creation.", "Cost takeout, EBITDA improvement, scalability, customer retention, reduced risk, diligence posture, modernization narrative, or platform integration maturity."),
    ],
  },
  {
    id: "platforms",
    title: "Platform Portfolio & Strategic Role",
    subtitle: "Scope the managed services and modernization model against the actual platform portfolio.",
    icon: LayoutGrid,
    accent: "from-sky-500 to-cyan-500",
    questions: [
      mkQ("2.1", "What are the primary platforms, products, and environments that should be included in the future state discussion?", "The managed services and modernization model must be scoped against the actual platform portfolio, not just infrastructure components.", "HHA Exchange, Sandata, Pavilio, Generations, Self Direction, and any other customer-facing or operationally significant platforms."),
      mkQ("2.2", "Which platforms are strategic growth platforms, which are in sustain mode, and which are expected to be sunset or consolidated?", "The operating model, staffing, investment plan, modernization roadmap, and transition strategy will differ based on the future role of each platform.", "Grow, modernize, stabilize, sustain, consolidate, sunset, or evaluate."),
      mkQ("2.3", "How does each platform map to customer segments, revenue streams, and business-critical workflows?", "Helps prioritize operational focus based on business value and customer impact.", "For each platform: primary customer type, business function, critical workflows, revenue relevance, and risk profile."),
      mkQ("2.4", "Where do the acquired platforms operate independently today, and where are they already integrated?", "Acquisition integration is a major driver of operational complexity, ownership ambiguity, and future state planning.", "Application architecture, infrastructure, cloud environments, data center footprint, support teams, security controls, observability, DevOps practices, and customer support models."),
      mkQ("2.5", "What platform-level decisions have already been made, and what decisions remain open?", "Prevents workshops from reopening settled decisions while identifying areas where Veersa/Neurealm can help shape future direction.", "Cloud direction, AWS consolidation, data center strategy, application rationalization, containerization, CI/CD standardization, observability tooling, or platform retirement plans."),
      mkQ("2.6", "Are there platforms or environments with contractual, regulatory, customer, or technical constraints that limit modernization options?", "Some environments may require different operating assumptions because of customer commitments, state requirements, legacy dependencies, or commercial constraints.", "Self-hosted customer environments, state-specific obligations, Citrix dependencies, data residency, legacy licensing, database constraints, or customer approval requirements."),
      mkQ("2.7", "What are the highest-risk platform dependencies that must be understood before proposing a future managed services model?", "Identifies dependencies that could affect transition risk, solution design, staffing, automation, and pricing.", "Databases, middleware, interfaces, identity, network connectivity, batch processing, third-party integrations, security controls, monitoring, and release dependencies."),
    ],
  },
  {
    id: "cx",
    title: "Customer Experience & Service Impact",
    subtitle: "Connect operational performance to customer outcomes, escalations, and trust.",
    icon: Smile,
    accent: "from-emerald-500 to-teal-500",
    questions: [
      mkQ("3.1", "Who are the most important user and customer personas supported by HHAX platforms?", "A future state operating model must be built around customer and user impact, not only internal support categories.", "Caregivers, providers, state agencies, MCOs, payers, internal operations, customer support, billing, and implementation teams."),
      mkQ("3.2", "What are the most critical customer journeys that technology operations must protect?", "Identifies workflows where reliability, performance, security, and support responsiveness matter most.", "Caregiver clock in/out, visit verification, care documentation, authorization, billing submission, claims processing, customer reporting, provider onboarding, and mobile access."),
      mkQ("3.3", "Which workflows create the greatest business impact when they are delayed, unavailable, or inaccurate?", "Helps prioritize SRE, monitoring, incident response, automation, and resiliency investments based on measurable value.", "Visit completion, payment, claims, compliance reporting, customer satisfaction, contractual commitments, and state program obligations."),
      mkQ("3.4", "What are the most common service-impacting issues customers experience today?", "Identifies operational patterns that may be improved through better observability, incident management, automation, problem management, or platform modernization.", "Application slowness, failed transactions, login problems, mobile connectivity, reporting delays, deployment defects, interface failures, or delayed support."),
      mkQ("3.5", "What types of issues typically become executive escalations?", "Executive escalations reveal where operational issues carry reputational, financial, contractual, or strategic risk.", "Customer escalations, payer/state complaints, repeated incidents, major availability issues, missed commitments, security concerns, or high-visibility support failures."),
      mkQ("3.6", "How does HHAX currently measure customer experience and service impact?", "Determines whether the future model should introduce stronger service-level, experience-level, or business-outcome metrics.", "Uptime, SLA, MTTR, ticket volume, escalations, NPS, CSAT, complaints, severity reports, state issue logs, account health, or support trends."),
      mkQ("3.7", "Where are customer complaints or service issues currently difficult to correlate back to technology causes?", "Identifies gaps in observability, telemetry, service mapping, ownership, and problem management.", "Performance degradation without clear root cause, mobile experience issues, intermittent failures, unclear infra vs app ownership, or limited end-to-end monitoring."),
      mkQ("3.8", "What customer outcomes should be visible in a future executive operations dashboard?", "A strategic managed services model should provide leaders with transparency into business impact, not only operational activity.", "Customer-impacting incidents, critical workflow health, MTTR by platform, deployment impact, escalations, risk posture, availability, performance, change success, and automation value."),
    ],
  },
  {
    id: "opmodel",
    title: "Current Operating Model & Ownership",
    subtitle: "Map retained, partner, and joint responsibilities across the technology estate.",
    icon: NetworkIcon,
    accent: "from-amber-500 to-orange-500",
    questions: [
      mkQ("4.1", "How is the current technology operating model structured across HHAX teams and external partners?", "A future managed services model must complement retained HHAX capabilities and avoid creating unclear ownership.", "Internal HHAX teams, current partner responsibilities, platform engineering, SRE, cloud ops, infrastructure, database, security, DevOps, release, observability, and app teams."),
      mkQ("4.2", "What responsibilities are retained by HHAX today, and what is currently handled by partners?", "Establishes the current scope baseline and identifies what may transition, remain retained, or be jointly operated.", "Operations, engineering, monitoring, incident response, infrastructure, database, security, release support, DevOps, cloud, data center, and service management."),
      mkQ("4.3", "Where are ownership boundaries clear today, and where are they ambiguous?", "Ambiguous ownership often drives slower resolution, repeated escalations, poor service experience, and operational risk.", "App vs infrastructure issues, security vs operations, cloud vs data center boundaries, DevOps vs SRE responsibilities, or platform-specific support models."),
      mkQ("4.4", "How are L0, L1, L2, L3, engineering, and architecture responsibilities currently separated?", "Supports RFP sizing, future support model design, escalation flow, and staffing strategy.", "Which teams handle monitoring, triage, remediation, customer communication, RCA, automation, release support, engineering fixes, and architecture decisions."),
      mkQ("4.5", "How does work currently flow from alert, ticket, customer complaint, or incident through resolution?", "Identifies operational handoffs, delays, tooling gaps, and automation opportunities.", "Intake channels, triage ownership, routing, escalation, communications, resolution, closure, after-action review, and problem management."),
      mkQ("4.6", "What aspects of the current operating model work well and should be preserved?", "The future model should retain strengths, institutional knowledge, and effective practices.", "Strong onshore leaders, specific platform knowledge, stable processes, effective tools, security relationships, or reliable support patterns."),
      mkQ("4.7", "Where does the current operating model slow down modernization or responsiveness?", "Defines what must change in the future state, beyond simply changing who performs the work.", "Resistance to change, manual processes, skill gaps, fragmented tooling, unclear decision rights, limited automation, partner rigidity, or lack of proactive improvement."),
      mkQ("4.8", "What does HHAX expect from a strategic partner versus a traditional managed services vendor?", "Defines the future partnership model and differentiates steady-state support from strategic modernization partnership.", "Thought leadership, SRE maturity, automation, AI, cloud strategy, transformation execution, proactive recommendations, service ownership, and measurable value creation."),
      mkQ("4.9", "How should HHAX and its partner jointly govern operations, modernization, service performance, and continuous improvement?", "A $20M annual partnership requires disciplined governance across operational, executive, financial, risk, and transformation dimensions.", "Weekly operations, monthly service reviews, QBRs, roadmap governance, executive steering, risk reviews, innovation backlog, and value realization tracking."),
    ],
  },
  {
    id: "demand",
    title: "Operational Demand, Service Management & Volume Baseline",
    subtitle: "Baseline operational profile, demand sources, and service management maturity.",
    icon: Activity,
    accent: "from-rose-500 to-pink-500",
    questions: [
      mkQ("5.1", "What are the primary sources of operational demand across HHAX today?", "Where work originates helps establish the operational profile of the environment.", "Incidents, service requests, alerts, changes, releases, customer escalations, security events, platform monitoring, maintenance, and project-driven work."),
      mkQ("5.2", "What support volumes are experienced across the major platforms and environments?", "Operational demand is a key input to support model design, staffing assumptions, and service alignment.", "Ticket volumes, incident volumes, alert volumes, service requests, changes, and platform-specific support requirements."),
      mkQ("5.3", "Which platforms, applications, or services generate the highest operational effort today?", "High-effort platforms often represent opportunities for modernization, automation, standardization, or operational improvement.", "Recurring incidents, manual activities, complex support requirements, technical debt, customer escalations, or specialized skill dependencies."),
      mkQ("5.4", "What types of issues most frequently result in operational disruption or customer impact?", "Understanding recurring service-impacting events helps prioritize reliability and resiliency improvements.", "Application performance, deployment issues, infrastructure failures, database issues, authentication problems, network disruptions, or third-party dependencies."),
      mkQ("5.5", "How are incidents classified, prioritized, escalated, and resolved today?", "Incident management maturity is critical to operational effectiveness and customer experience.", "Severity definitions, escalation paths, response expectations, communications, incident command structure, and after-action reviews."),
      mkQ("5.6", "What are the most common recurring operational problems that consume team capacity?", "Recurring issues often indicate opportunities for problem management, automation, engineering improvements, or architectural remediation.", "Repetitive alerts, manual maintenance, recurring incidents, release failures, capacity issues, or recurring customer escalations."),
      mkQ("5.7", "What operational activities require after-hours, weekend, or 24x7 support coverage?", "Shapes future support models, staffing requirements, and automation opportunities.", "Monitoring, incident response, releases, patching, maintenance windows, database activities, customer support, and operational handoffs."),
      mkQ("5.8", "What service management processes are currently in place, and where do they perform well or create friction?", "Service management maturity directly impacts operational efficiency, customer experience, and organizational scalability.", "Incident, problem, change, release, service request fulfillment, knowledge management, and service reporting."),
      mkQ("5.9", "What operational metrics are currently used to measure service performance and ops effectiveness?", "Provides insight into how success is measured today and where future-state reporting may evolve.", "SLA attainment, MTTR, availability, incident trends, change success rate, backlog volume, CSAT, escalation trends, and operational efficiency."),
      mkQ("5.10", "What operational data, reporting, and reference materials are available to support future-state planning and managed services design?", "Supporting data enables more accurate operational assessment, service design, staffing analysis, and roadmap development.", "Ticket reports, incident reports, service-level reporting, org data, staffing info, platform inventories, monitoring reports, dashboards, and support docs."),
    ],
  },
  {
    id: "sre",
    title: "Reliability, Resiliency & SRE Maturity",
    subtitle: "SRE definition, SLOs, observability, incident command, and DR posture.",
    icon: ShieldCheck,
    accent: "from-blue-500 to-indigo-500",
    questions: [
      mkQ("6.1", "How does HHAX define SRE today, and what does the desired SRE model look like?", "SRE can mean different things across organizations. Alignment is needed before designing the future operating model.", "Whether SRE includes incident command, observability, reliability engineering, release support, automation, DevEx, capacity, performance, resilience, and production readiness."),
      mkQ("6.2", "Which services or platforms have defined SLOs or reliability targets today?", "SLOs help prioritize operational work based on customer impact and business criticality.", "Availability targets, performance targets, error budgets, latency, transaction completion, RTO, RPO, and customer-specific commitments."),
      mkQ("6.3", "Where does HHAX have the highest reliability risk today?", "Focuses modernization, resiliency engineering, and managed services improvement on the most critical areas.", "Legacy architecture, non-resilient infra, manual deployment, incomplete observability, database concentration, DR uncertainty, or operational knowledge gaps."),
      mkQ("6.4", "How are major incidents currently declared, managed, communicated, and reviewed?", "Incident command maturity is central to customer trust, executive confidence, and reduced MTTR.", "Roles, severity definitions, command structure, comms, customer updates, bridge management, decisions, escalation, after-action reviews, and corrective actions."),
      mkQ("6.5", "What typically causes customer-impacting incidents?", "Understanding failure patterns allows the future state model to target the right remediation levers.", "Product releases, rollback failures, infra events, DB issues, network issues, security controls, monitoring misses, capacity, human error, or third-party dependencies."),
      mkQ("6.6", "How mature is current observability across platforms and environments?", "Modern SRE requires telemetry-driven operations, not only manual monitoring.", "Datadog, Uptrends, logs, metrics, traces, synthetics, alert quality, customer journey monitoring, dashboards, dependency mapping, and business service visibility."),
      mkQ("6.7", "What parts of the environment are not yet visible enough to operate proactively?", "Visibility gaps create incident delays, unclear ownership, and reactive support behavior.", "Legacy environments, acquired platforms, data center dependencies, DB workloads, customer-specific environments, Citrix, batch, integrations, and mobile experience."),
      mkQ("6.8", "What is the current state of disaster recovery, business continuity, and operational resiliency?", "Resiliency strategy is a major input to future state design, customer trust, compliance, and modernization planning.", "RTO, RPO, DR testing, confidence level, failover, data replication, AZ resilience, region strategy, backup, restore, tabletops, and customer commitments."),
      mkQ("6.9", "What reliability improvements would create the greatest measurable impact in the first 6 to 12 months?", "Early value is important for transition confidence, executive alignment, and transformation momentum.", "Incident command, observability improvements, patch automation, golden images, backup validation, DR readiness, alert rationalization, service ownership."),
      mkQ("6.10", "What cultural or organizational barriers make SRE adoption difficult today?", "SRE transformation depends on people, operating model, incentives, ownership, and adoption — not only tools.", "Offshore resistance, unclear ownership, limited engineering engagement, lack of service ownership, legacy habits, skill gaps, or insufficient automation."),
    ],
  },
  {
    id: "cloud",
    title: "Cloud, Infrastructure & Platform Modernization Direction",
    subtitle: "Cloud strategy, data center direction, IaC, containerization, and cost optimization.",
    icon: Boxes,
    accent: "from-cyan-500 to-blue-500",
    questions: [
      mkQ("7.1", "What is HHAX's current cloud strategy across AWS, GCP, data center, and acquired platforms?", "The future operating model must support the current hybrid reality while enabling the desired cloud direction.", "Primary cloud direction, GCP sustain/migration plans, data center role, acquired platform differences, and cloud consolidation preferences."),
      mkQ("7.2", "What is the intended future role of the Virginia data center?", "Significant strategic and operational decision point because of SQL Server, cost, performance, and resiliency considerations.", "Sustain, optimize, partially migrate, fully migrate, modernize in place, or use as part of a hybrid resilience model."),
      mkQ("7.3", "Which workloads are currently the strongest candidates for cloud migration, optimization, containerization, or modernization?", "Helps sequence modernization based on feasibility, value, risk, and dependencies.", "Application architecture, database size, licensing, network dependency, customer criticality, platform roadmap, technical debt, and operational effort."),
      mkQ("7.4", "What are the most important modernization initiatives already underway?", "Existing work should be incorporated into the future roadmap rather than duplicated or disrupted.", "GitHub Actions migration, golden image strategy, Terraform maturity, patch automation, EKS adoption, SQL modernization, and observability improvements."),
      mkQ("7.5", "Where are manual infrastructure processes still creating operational risk or delay?", "Strong candidates for standardization, automation, runbook improvement, and digital workforce enablement.", "Scaling, cluster buildout, node configuration, patching, release support, environment provisioning, backup validation, or access requests."),
      mkQ("7.6", "How mature is Infrastructure as Code across the environment?", "IaC maturity influences repeatability, resilience, security, transition quality, and automation readiness.", "What is managed in Terraform/other tools, what is still manually configured, what varies by platform, and what needs standardization."),
      mkQ("7.7", "What are the current constraints to containerization or more modern deployment models?", "Containerization depends on app readiness, pipeline maturity, team skills, observability, security, and ops ownership.", "Legacy Windows workloads, database dependencies, stored procedures, SSIS, release practices, engineering readiness, architecture constraints, and customer risk."),
      mkQ("7.8", "How does HHAX currently manage capacity, performance, and scalability?", "Capacity and scalability affect customer experience, cost, and resilience.", "Scaling patterns, overprovisioning, peak periods, async workloads, database performance, performance testing, synthetics, and cloud cost tradeoffs."),
      mkQ("7.9", "Where does HHAX see the biggest cost optimization opportunities without increasing customer risk?", "A future partner should help improve cost efficiency while protecting reliability and customer experience.", "Cloud commitments, EC2 optimization, storage tiering, DB licensing, backup optimization, observability rationalization, data center cost, tool consolidation, and automation."),
    ],
  },
  {
    id: "security",
    title: "Cybersecurity, Risk & Operational Controls",
    subtitle: "Embed security, compliance, and risk reduction into the future operating model.",
    icon: ShieldCheck,
    accent: "from-red-500 to-rose-600",
    questions: [
      mkQ("8.1", "What are the most important security and risk priorities for HHAX over the next 12 months?", "Security priorities must influence operating model, staffing, tooling, automation, patching, identity, and compliance design.", "Vulnerability management, patch automation, PAM, IAM, cloud security posture, customer security requests, audit readiness, incident response, and data protection."),
      mkQ("8.2", "Where do security requirements most directly impact SRE, infrastructure, cloud, and platform operations?", "Security work creates operational demand and must be planned into the managed services model.", "Patching, image hardening, encryption, access control, logging, vulnerability remediation, endpoint controls, firewall changes, customer audits, and evidence requests."),
      mkQ("8.3", "What customer, payer, state, or regulatory security expectations create the greatest operational burden?", "Customer and compliance obligations can drive service demand, documentation needs, control evidence, and escalation patterns.", "Customer security questionnaires, SOC reporting, HIPAA controls, data handling, state requirements, contractual security language, and audit evidence."),
      mkQ("8.4", "What is the current maturity of identity, access, privilege, and administrative controls for PRD ops?", "Privileged access is a critical control point for managed services, risk reduction, and transition readiness.", "MFA, SSO, Microsoft Entra, least privilege, PAM, shared accounts, service accounts, admin access, access reviews, JML process, and break-glass procedures."),
      mkQ("8.5", "How are vulnerabilities, patching, and remediation currently prioritized and executed?", "Vulnerability and patch management are core managed services responsibilities and major indicators of operational maturity.", "Patch coverage, automation maturity, vulnerability backlog, exception process, emergency patching, reporting cadence, ownership, and business impact."),
      mkQ("8.6", "How are security events, infrastructure incidents, and operational incidents coordinated today?", "Security and operations must work together during incidents, especially where availability, customer impact, or compliance risk is involved.", "SOC interaction, incident command, escalation paths, evidence collection, customer communication, threat response, and post-incident remediation."),
      mkQ("8.7", "What operational controls are most important to standardize across HHA, Sandata, and acquired platforms?", "Standardized controls reduce risk, improve auditability, and make operations more scalable.", "Logging, encryption, patching, access control, backup, vulnerability scanning, change management, image standards, IaC guardrails, and monitoring."),
      mkQ("8.8", "Where does HHAX need stronger reporting or evidence for security, risk, and compliance?", "A future managed services partner should improve control transparency and reduce manual reporting burden.", "Executive reporting, customer evidence packages, patch dashboards, vulnerability reports, access reviews, incident reports, change evidence, and audit artifacts."),
      mkQ("8.9", "What level of operational security responsibility should a future partner own versus support?", "Clear responsibility boundaries are essential for RFP scope, staffing, governance, service levels, and liability management.", "Security operations, vulnerability remediation, patching, IAM execution, cloud security posture, log management, evidence generation, control operations, and incident response support."),
    ],
  },
  {
    id: "ai",
    title: "AI, Automation & Digital Workforce Opportunities",
    subtitle: "Practical opportunities where AI and digital coworkers create measurable operational value.",
    icon: Bot,
    accent: "from-violet-500 to-fuchsia-500",
    questions: [
      mkQ("9.1", "Where does HHAX see the greatest opportunity for AI or automation in technology operations?", "AI-enabled operations should focus on measurable operational outcomes, not generic tooling.", "Alert triage, incident summarization, runbook execution, patch coordination, cloud optimization, release readiness, ticket routing, knowledge generation, vulnerability prioritization, and executive reporting."),
      mkQ("9.2", "Which manual or repetitive activities consume the most time across SRE, cloud, infrastructure, security, and DevOps teams?", "High-volume repetitive work is often the best starting point for automation and digital coworker deployment.", "Ticket updates, evidence gathering, monitoring checks, capacity review, access validation, patch tracking, deployment readiness, change documentation, and recurring health checks."),
      mkQ("9.3", "Which operational decisions require better data correlation before teams can act?", "AI and automation can add value by correlating alerts, logs, tickets, changes, platform health, and customer impact.", "Incident root cause, customer impact assessment, change risk, alert noise reduction, capacity prediction, vulnerability risk, and service dependency mapping."),
      mkQ("9.4", "What guardrails would HHAX require before allowing automation to take action in production?", "Trust, control, auditability, and human oversight are essential for safe AI-enabled operations.", "Approval workflows, RBAC, change controls, rollback, audit logs, segregation of duties, production access, security review, and human-in-the-loop requirements."),
      mkQ("9.5", "Which activities should remain human-led, which could be human-approved, and which could eventually become fully automated?", "Helps define a responsible automation maturity model.", "Advisory only, draft and recommend, human-approved execution, supervised automation, fully automated remediation."),
      mkQ("9.6", "What operational knowledge exists today in people's heads rather than documented runbooks, SOPs, or knowledge articles?", "AI-enabled operations require usable operational knowledge, documented procedures, and clear decision paths.", "Where institutional knowledge is concentrated, undocumented, inconsistent, or difficult for new team members to learn."),
      mkQ("9.7", "Where would automated reporting or executive summarization create value?", "AI can reduce manual reporting burden and improve leadership visibility.", "Incident summaries, daily ops briefs, weekly risk reports, customer impact summaries, change performance, security posture, cloud cost insights, and roadmap progress."),
      mkQ("9.8", "What would HHAX consider a successful first wave of AI-enabled operations?", "Early wins should be specific, measurable, safe, and aligned to current pain points.", "Reduced alert noise, faster incident triage, improved patch visibility, automated change readiness, reduced manual reporting, improved ticket classification, or faster customer comms drafts."),
    ],
  },
  {
    id: "future",
    title: "Future State Operating Model & Partnership Expectations",
    subtitle: "Define partner expectations, transition, stabilization, modernization, and continuous improvement.",
    icon: Workflow,
    accent: "from-teal-500 to-emerald-600",
    questions: [
      mkQ("10.1", "What does HHAX want to retain internally, and where does HHAX want partner leverage?", "The future model should strengthen retained HHAX leadership while providing scalable execution, modernization, and operational depth.", "Retained architecture, strategy, platform ownership, decision making, security leadership, vendor governance, ops execution, engineering support, and modernization delivery."),
      mkQ("10.2", "What are the most important gaps HHAX expects a future partner to fill?", "Defines the service lines, roles, skills, and transformation capabilities required in the proposal.", "SRE maturity, data center operations, cloud operations, DevOps, observability, database operations, security operations support, Citrix expertise, automation, AI, transition execution, or governance."),
      mkQ("10.3", "What has worked well in the current partner model, and what must improve?", "A future proposal should be pragmatic and respectful of current operations while clearly addressing improvement opportunities.", "Institutional knowledge, coverage, cost, staffing, responsiveness, modernization support, automation, service quality, cultural fit, governance, transparency, and strategic contribution."),
      mkQ("10.4", "What would have to be true for HHAX to confidently transition or rebalance scope to a new strategic partner?", "Clarifies decision criteria, transition confidence requirements, risk concerns, and trust factors.", "Proven transition plan, strong governance, knowledge transfer, retained talent strategy, continuity of service, security readiness, platform understanding, executive alignment, and modernization capability."),
      mkQ("10.5", "How should transition, stabilization, and modernization be sequenced?", "A strong operating model embeds transformation into the operating journey rather than treating modernization as a separate future promise.", "Day-zero readiness, transition, knowledge capture, stabilization, service quality improvement, automation, modernization roadmap, and continuous optimization."),
      mkQ("10.6", "What are the most important transition risks HHAX wants to avoid?", "Transition risk management is essential for customer-facing platforms and confidential partner evaluation.", "Knowledge loss, service interruption, customer impact, incumbent reaction, security exposure, poor documentation, access delays, or unclear ownership."),
      mkQ("10.7", "What level of onsite, nearshore, offshore, and US-based engagement does HHAX expect?", "Delivery location strategy affects coverage, trust, cost, responsiveness, and stakeholder collaboration.", "Leadership presence, US-based architects, SRE leads, security engagement, offshore operations, nearshore coverage, after-hours support, and onsite workshops."),
      mkQ("10.8", "What governance cadence would create the right level of transparency and control?", "A multi-year strategic MSP partnership needs structured governance covering operations, modernization, financials, risk, and exec alignment.", "Daily operations, weekly service reviews, monthly performance reviews, monthly transformation reviews, QBRs, and executive steering."),
      mkQ("10.9", "How should improvement opportunities be funded, prioritized, and measured during the partnership?", "Continuous improvement should be part of the operating model, not an informal side activity.", "Value backlog, automation backlog, modernization roadmap, business case development, funding model, value tracking, and risk reduction scorecards."),
    ],
  },
  {
    id: "rfp",
    title: "RFP Scope, Service Lines & Commercial Inputs",
    subtitle: "Inputs to shape the managed services proposal, transition plan, and commercial model.",
    icon: FileCheck2,
    accent: "from-slate-600 to-zinc-700",
    questions: [
      mkQ("11.1", "Which service lines should be included in the managed services proposal?", "Scope clarity is required to build a complete, accurate, and outcome-aligned RFP response.", "SRE, NOC, data center operations, cloud operations, infrastructure, database operations, DevOps, release support, observability, service management, security operations support, vulnerability remediation, and automation."),
      mkQ("11.2", "Which service lines should be considered optional, phased, or future scope?", "Some services may be better sequenced after transition, stabilization, or deeper technical assessment.", "App support, expanded security ops, FinOps, full DR modernization, app modernization, data platform ops, or customer support integration."),
      mkQ("11.3", "What current staffing exists by role, location, shift, platform, and service line?", "Staffing baseline is required for service model design, knowledge transfer planning, cost modeling, and transition risk analysis.", "Current partner roles, HHAX retained roles, contractor roles, onshore/offshore split, shift coverage, platform assignment, and specialized skills."),
      mkQ("11.4", "What service levels, response targets, resolution targets, and coverage expectations exist today?", "Service levels define the operational commitments and commercial assumptions for the proposal.", "P1–P4 response and resolution targets, availability targets, support hours, after-hours coverage, escalation commitments, and customer-facing expectations."),
      mkQ("11.5", "What service levels does HHAX want in the future?", "Future-state service levels may need to be stronger, more business-aligned, or more platform-specific.", "Business criticality, customer impact, SLOs, platform tiers, service tiers, experience metrics, and executive reporting needs."),
      mkQ("11.6", "What contractual, confidentiality, transition, or incumbent-related constraints should be considered?", "Proposal and transition planning must respect confidentiality, timing, existing contractual commitments, and continuity of operations.", "Renewal timelines, notice periods, data access, knowledge transfer constraints, communication controls, access limitations, and transition windows."),
      mkQ("11.7", "What financial outcomes matter most to HHAX?", "Commercial design should support measurable value, not only labor replacement.", "Run cost reduction, cost avoidance, cloud optimization, reduced incident cost, reduced downtime, reduced tool cost, improved productivity, and modernization funded through efficiency."),
      mkQ("11.8", "How should HHAX evaluate the business case for a future strategic partnership?", "Shapes the proposal around decision criteria that matter to leadership.", "Service quality, modernization capability, cost, risk reduction, AI enablement, transition confidence, healthcare experience, scalability, governance, and enterprise value creation."),
      mkQ("11.9", "What proposal outputs would be most useful for HHAX leadership and stakeholders?", "The final response should be designed around how HHAX will make decisions.", "Future state operating model, transition plan, staffing model, service catalog, governance model, modernization roadmap, automation roadmap, commercial model, risk register, and value realization plan."),
    ],
  },
  {
    id: "success",
    title: "Success Measures & Value Realization",
    subtitle: "How HHAX will measure the success of the program, partnership, and modernization roadmap.",
    icon: BarChart3,
    accent: "from-green-500 to-emerald-600",
    questions: [
      mkQ("12.1", "What are the most important outcomes HHAX wants to achieve in the first 90 days of a partnership?", "The first 90 days should create confidence, stabilize the operating model, protect service continuity, and establish momentum.", "Transition readiness, knowledge capture, service continuity, governance launch, reporting baseline, incident command improvement, and early automation candidates."),
      mkQ("12.2", "What outcomes should be achieved within the first 6 months?", "Six-month outcomes should show measurable operational improvement and early modernization value.", "Improved MTTR, reduced alert noise, better patch visibility, improved change success, stronger observability, reduced escalations, and platform risk reduction."),
      mkQ("12.3", "What outcomes should be achieved within the first 12 months?", "Twelve-month outcomes should demonstrate strategic value, not only operational continuity.", "SRE maturity uplift, AZ resilience improvement, expanded automation, cloud optimization, data center roadmap progress, DevOps maturity, improved security posture, and measurable cost efficiency."),
      mkQ("12.4", "What metrics should be used to measure operational performance?", "Clear metrics are required for governance, continuous improvement, service level management, and value realization.", "MTTA, MTTR, incident volume, P1/P2 trends, alert quality, change success rate, deployment failure rate, patch compliance, vulnerability aging, backlog, uptime, and customer escalations."),
      mkQ("12.5", "What metrics should be used to measure customer experience impact?", "Technology operations should be measured by customer impact, not only internal productivity.", "Critical workflow availability, customer-impacting incidents, support responsiveness, executive escalations, service degradation duration, complaint trends, and platform performance."),
      mkQ("12.6", "What metrics should be used to measure modernization progress?", "Modernization must be tracked as a managed roadmap with visible progress and business value.", "Containerization progress, IaC coverage, golden image adoption, pipeline migration, patch automation, observability maturity, DR test confidence, and automation deployment."),
      mkQ("12.7", "What metrics should be used to measure financial and enterprise value?", "A strategic partnership should produce measurable cost, productivity, risk, and value outcomes.", "Run cost reduction, avoided downtime, cloud savings, tool rationalization, productivity improvement, automation hours returned, risk reduction, and improved scalability."),
      mkQ("12.8", "What does HHAX want to be able to say to customers, the board, or investors after year one?", "Frames the transformation narrative in business terms.", "Stronger reliability, improved resilience, better security posture, AI-enabled operations, improved customer experience, reduced operational risk, and a clearer path to scalable growth."),
    ],
  },
];

type Answers = Record<string, string | string[]>;

function isAnswered(q: Question, a: Answers): boolean {
  const v = a[q.id];
  if (Array.isArray(v)) return v.length > 0;
  return typeof v === "string" && v.trim().length > 0;
}

function sectionProgress(s: Section, a: Answers) {
  const total = s.questions.length;
  const done = s.questions.filter((q) => isAnswered(q, a)).length;
  return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export default function Questionnaires() {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0); // 0..SECTIONS.length-1 = sections, SECTIONS.length = review, +1 = submitted
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const totalSteps = SECTIONS.length;
  const isReview = step === totalSteps;
  const isDone = step === totalSteps + 1;

  const overall = useMemo(() => {
    const all = SECTIONS.flatMap((s) => s.questions);
    const done = all.filter((q) => isAnswered(q, answers)).length;
    return { done, total: all.length, pct: Math.round((done / all.length) * 100) };
  }, [answers]);

  const setAnswer = (id: string, v: string | string[]) =>
    setAnswers((p) => ({ ...p, [id]: v }));

  const toggleMulti = (id: string, opt: string) => {
    const cur = Array.isArray(answers[id]) ? (answers[id] as string[]) : [];
    setAnswer(id, cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]);
  };

  const current = !isReview && !isDone ? SECTIONS[step] : null;
  const currentProgress = current ? sectionProgress(current, answers) : null;

  const canContinue = current
    ? current.questions.filter((q) => q.required).every((q) => isAnswered(q, answers))
    : true;

  const go = (next: number) => {
    setStep(Math.max(0, Math.min(totalSteps + 1, next)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppShell>
      <main className="flex-1 px-4 md:px-8 py-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white grid place-items-center shadow-lg">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">HHAX Future State Program — Session #1</h1>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" /> Guided
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl mt-1">
                A guided journey to capture your requirements. Move through sections at your own pace —
                your progress is saved automatically as you go.
              </p>
            </div>
          </div>

          <div className="md:min-w-[260px]">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Overall completion</span>
              <span className="font-semibold text-foreground">{overall.pct}%</span>
            </div>
            <Progress value={overall.pct} className="h-2" />
            <div className="text-[11px] text-muted-foreground mt-1">
              {overall.done} of {overall.total} questions answered
            </div>
          </div>
        </div>

        {/* Timeline */}
        <Card className="p-4 md:p-5 mb-6 overflow-hidden">
          <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
            {SECTIONS.map((s, idx) => {
              const p = sectionProgress(s, answers);
              const isActive = idx === step;
              const isComplete = p.done === p.total;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => go(idx)}
                  className={cn(
                    "group flex-1 min-w-[140px] text-left rounded-lg border p-3 transition-all",
                    isActive
                      ? "border-foreground/40 bg-accent shadow-sm scale-[1.01]"
                      : "border-border hover:border-foreground/20 hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn("h-8 w-8 rounded-lg grid place-items-center text-white bg-gradient-to-br", s.accent)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {p.done}/{p.total}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Step {idx + 1}
                  </div>
                  <div className={cn("text-sm font-semibold leading-tight mt-0.5", isActive ? "text-foreground" : "text-foreground/80")}>
                    {s.title}
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full bg-gradient-to-r transition-all duration-500", s.accent)}
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
            <button
              onClick={() => go(totalSteps)}
              className={cn(
                "min-w-[140px] text-left rounded-lg border p-3 transition-all",
                isReview
                  ? "border-foreground/40 bg-accent shadow-sm"
                  : "border-dashed border-border hover:border-foreground/20 hover:bg-muted/50",
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-lg grid place-items-center bg-foreground text-background">
                  <FileCheck2 className="h-4 w-4" />
                </div>
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Final</div>
              <div className="text-sm font-semibold leading-tight mt-0.5">Review & Submit</div>
            </button>
          </div>
        </Card>

        {/* Body */}
        {current && (
          <div key={current.id} className="animate-fade-in">
            <Card className="overflow-hidden border-0 shadow-md">
              <div className={cn("p-6 md:p-8 text-white bg-gradient-to-br", current.accent)}>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur grid place-items-center">
                    <current.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-white/80">
                      Section {step + 1} of {totalSteps}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold leading-tight">{current.title}</h2>
                    <p className="text-sm text-white/85 mt-0.5">{current.subtitle}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${currentProgress?.pct ?? 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold tabular-nums">
                    {currentProgress?.done}/{currentProgress?.total}
                  </span>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-5">
                {current.questions.map((q, qi) => {
                  const answered = isAnswered(q, answers);
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "rounded-xl border p-4 md:p-5 transition-all animate-fade-in",
                        answered ? "border-emerald-500/40 bg-emerald-500/[0.03]" : "border-border bg-card",
                      )}
                      style={{ animationDelay: `${qi * 60}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {answered ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <span className="text-muted-foreground tabular-nums text-xs">Q{qi + 1}.</span>
                            {q.label}
                            {q.required && <span className="text-rose-500">*</span>}
                          </label>
                          {q.hint && (
                            <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{q.hint}</p>
                          )}

                          <div className="mt-3">
                            {q.type === "short" && (
                              <Input
                                value={(answers[q.id] as string) ?? ""}
                                onChange={(e) => setAnswer(q.id, e.target.value)}
                                placeholder="Type your answer…"
                              />
                            )}
                            {q.type === "long" && (
                              <Textarea
                                value={(answers[q.id] as string) ?? ""}
                                onChange={(e) => setAnswer(q.id, e.target.value)}
                                placeholder="Share as much detail as you like…"
                                className="min-h-[110px]"
                              />
                            )}
                            {q.type === "single" && (
                              <div className="grid sm:grid-cols-2 gap-2">
                                {q.options?.map((opt) => {
                                  const selected = answers[q.id] === opt;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setAnswer(q.id, opt)}
                                      className={cn(
                                        "text-left text-sm px-3 py-2.5 rounded-lg border transition-all hover:scale-[1.01]",
                                        selected
                                          ? "border-foreground bg-foreground text-background font-medium"
                                          : "border-border hover:border-foreground/40 bg-card",
                                      )}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                            {q.type === "multi" && (
                              <div className="flex flex-wrap gap-2">
                                {q.options?.map((opt) => {
                                  const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
                                  const selected = cur.includes(opt);
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => toggleMulti(q.id, opt)}
                                      className={cn(
                                        "text-sm px-3 py-1.5 rounded-full border transition-all",
                                        selected
                                          ? "border-foreground bg-foreground text-background"
                                          : "border-border hover:border-foreground/40 bg-card hover:bg-muted",
                                      )}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-6 md:px-8 py-4 border-t bg-muted/30 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => go(step - 1)}
                  disabled={step === 0}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {canContinue ? "Looks good — ready to continue." : "Please answer required questions to continue."}
                </div>
                <Button onClick={() => go(step + 1)} disabled={!canContinue}>
                  {step === totalSteps - 1 ? "Review" : "Continue"} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Review */}
        {isReview && (
          <div className="animate-fade-in">
            <Card className="p-6 md:p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-foreground text-background grid place-items-center">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Review your responses</h2>
                  <p className="text-sm text-muted-foreground">
                    Expand any section to confirm or edit answers before submitting.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {SECTIONS.map((s, idx) => {
                  const p = sectionProgress(s, answers);
                  const open = expanded[s.id];
                  return (
                    <div key={s.id} className="border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpanded((e) => ({ ...e, [s.id]: !e[s.id] }))}
                        className="w-full p-4 flex items-center gap-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className={cn("h-9 w-9 rounded-lg text-white grid place-items-center bg-gradient-to-br", s.accent)}>
                          <s.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-semibold">{s.title}</div>
                          <div className="text-xs text-muted-foreground">{p.done} of {p.total} answered</div>
                        </div>
                        <Badge variant={p.done === p.total ? "default" : "secondary"} className="gap-1">
                          {p.done === p.total ? <CheckCircle2 className="h-3 w-3" /> : null}
                          {p.pct}%
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            go(idx);
                          }}
                        >
                          Edit
                        </Button>
                        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {open && (
                        <div className="px-4 pb-4 space-y-3 animate-fade-in">
                          {s.questions.map((q) => {
                            const v = answers[q.id];
                            const display = Array.isArray(v) ? v.join(", ") : (v as string) || "—";
                            return (
                              <div key={q.id} className="text-sm border-l-2 border-border pl-3">
                                <div className="text-muted-foreground text-xs">{q.label}</div>
                                <div className={cn("mt-0.5", display === "—" && "text-muted-foreground italic")}>
                                  {display}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <Button variant="outline" onClick={() => go(totalSteps - 1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={() => go(totalSteps + 1)}
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90"
                >
                  <Rocket className="h-4 w-4" /> Submit questionnaire
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Done */}
        {isDone && (
          <Card className="p-10 text-center animate-fade-in">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white grid place-items-center shadow-lg animate-scale-in">
              <PartyPopper className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-2xl font-bold">Thank you — your responses are in.</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Our team will review your questionnaire and reach out shortly with a tailored discovery
              summary and next steps.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {overall.done} answers captured across {SECTIONS.length} sections
            </div>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setAnswers({});
                  setStep(0);
                }}
              >
                Start a new questionnaire
              </Button>
            </div>
          </Card>
        )}
      </main>
    </AppShell>
  );
}