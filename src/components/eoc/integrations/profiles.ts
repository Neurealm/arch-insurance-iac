// Integration connection profiles — 14 applications, each with product-specific
// connection interfaces, auth models, scopes, event configuration, agent
// operating authority, validation steps, and audit history. Nothing here is a
// real credential; every secret value is a synthetic placeholder.

export type IntegrationStatus =
  | "Connected"
  | "In Progress"
  | "Not Connected"
  | "Degraded"
  | "Authentication Failed"
  | "Permission Failed"
  | "Validation Required"
  | "Disabled";

export type Environment = "Production" | "Preproduction" | "Test" | "Development";
export type AgentMode =
  | "Observe"
  | "Recommend"
  | "Execute with Approval"
  | "Autonomous Execute";

export type Direction = "Inbound" | "Outbound" | "Bidirectional";

export interface FieldSpec {
  label: string;
  value?: string;
  mono?: boolean;
  secret?: boolean;
  masked?: string;    // e.g. "…a3f2"
  hint?: string;
  risk?: "info" | "warn" | "high";
}

export interface Group {
  title: string;
  hint?: string;
  fields: FieldSpec[];
}

export interface Scope {
  name: string;
  granted: boolean;
  requested: boolean;
  risk?: "info" | "warn" | "high";
  boundary?: string;
}

export interface EventSub {
  interface: string;
  eventType: string;
  callback?: string;
  enabled: boolean;
  lastEventAt?: string;
  lastStatus?: "OK" | "Retrying" | "Failed" | "Idle";
}

export interface ValidationStep {
  label: string;
  status: "Pending" | "Running" | "Passed" | "Warning" | "Failed";
  detail?: string;
  latencyMs?: number;
}

export interface AuditEntry {
  ts: string;
  actor: string;
  action: string;
  result: "OK" | "Warning" | "Failed";
  changed?: string[];
  correlation?: string;
  approval?: string;
}

export interface Profile {
  key: string;
  app: string;
  category: string;
  status: IntegrationStatus;
  environment: Environment;
  profileName: string;
  connectorType: string;
  direction: Direction;
  agentMode: AgentMode;
  businessOwner: string;
  technicalOwner: string;
  supportGroup: string;
  dataClassification: "Public" | "Internal" | "Confidential" | "Restricted";
  description: string;
  lastValidatedAt: string;
  lastSuccessfulAt: string;
  connectorVersion: string;
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;

  // Sections — omitted sections simply won't render.
  connectionGroups: Group[];
  authenticationGroups: Group[];
  scopes: Scope[];
  scopesNote?: string;
  events: EventSub[];
  eventNotes?: string[];
  agentAuthority: {
    allowedActions: string[];
    prohibitedActions: string[];
    resourceBoundary: string;
    approvalPolicy: string;
    maxActionsPerHour: number;
    changeWindow: string;
    rollbackMethod: string;
    postActionValidation: string;
    executionCredential: string;
  };
  validation: ValidationStep[];
  audit: AuditEntry[];
}

const mask = (last4: string) => `Stored securely · …${last4}`;

// -- Shared defaults ---------------------------------------------------------

const defaultAgent = (mode: AgentMode = "Observe"): Profile["agentAuthority"] => ({
  allowedActions: mode === "Observe" ? [] : ["read.*", "list.*"],
  prohibitedActions: ["delete.*", "purge.*", "rotate.credentials"],
  resourceBoundary: "Tenant scope only",
  approvalPolicy: mode === "Autonomous Execute" ? "Policy-bounded, reversible only" : "Two-person approval for writes",
  maxActionsPerHour: mode === "Autonomous Execute" ? 25 : 5,
  changeWindow: "Mon–Fri 08:00–18:00 ET",
  rollbackMethod: "Snapshot revert / prior version restore",
  postActionValidation: "Read-back and diff",
  executionCredential: mode === "Observe" ? "N/A — read-only identity" : "svc-neugain-exec@tenant",
});

const auditBase: AuditEntry[] = [
  { ts: "2026-05-14 10:30:02Z", actor: "svc-neugain@platform", action: "Connection tested", result: "OK", correlation: "corr_9f21ab" },
  { ts: "2026-05-14 10:28:44Z", actor: "sarah.mitchell@neugain.io", action: "Configuration changed", result: "OK", changed: ["connection.timeout", "scopes"], correlation: "corr_44e0b1" },
  { ts: "2026-05-10 14:02:17Z", actor: "sarah.mitchell@neugain.io", action: "Credential replaced", result: "OK", changed: ["auth.clientSecret"], approval: "CHG-2026-0492" },
  { ts: "2026-04-28 09:11:00Z", actor: "platform.bootstrap", action: "Profile created", result: "OK" },
];

// -- Profiles ----------------------------------------------------------------

export const profiles: Record<string, Profile> = {
  ServiceNow: {
    key: "ServiceNow",
    app: "ServiceNow",
    category: "ITSM",
    status: "Connected",
    environment: "Production",
    profileName: "servicenow-prod-itsm",
    connectorType: "Table API + Scripted REST",
    direction: "Bidirectional",
    agentMode: "Execute with Approval",
    businessOwner: "Priya Raman (Head of ITSM)",
    technicalOwner: "Marcus Chen (Platform Eng)",
    supportGroup: "svc-itsm-platform",
    dataClassification: "Confidential",
    description: "ServiceNow ITSM integration for incident, change, problem, and CMDB reconciliation.",
    lastValidatedAt: "2026-05-14 10:30:02Z",
    lastSuccessfulAt: "2026-05-14 10:30:02Z",
    connectorVersion: "3.7.1",
    createdBy: "platform.bootstrap",
    createdAt: "2026-01-04",
    modifiedBy: "sarah.mitchell@neugain.io",
    modifiedAt: "2026-05-14",
    connectionGroups: [
      {
        title: "Instance",
        fields: [
          { label: "Instance URL", value: "https://neugain.service-now.com", mono: true },
          { label: "API version", value: "v2" },
          { label: "Application scope", value: "x_neugain_agent", mono: true },
          { label: "Scripted REST namespace", value: "/api/x_neugain_agent/agent", mono: true },
          { label: "MID Server required", value: "No" },
          { label: "Connection timeout", value: "30s" },
          { label: "Page size", value: "250" },
          { label: "Display values", value: "false" },
          { label: "Exclude reference links", value: "true" },
        ],
      },
      {
        title: "Query restrictions",
        fields: [
          { label: "Table allowlist", value: "incident, change_request, problem, cmdb_ci, cmdb_rel_ci", mono: true },
          { label: "Encoded query restriction", value: "active=true^sys_class_nameSTARTSWITHcmdb_ci", mono: true },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "OAuth 2.0 client credentials",
        fields: [
          { label: "Token endpoint", value: "https://neugain.service-now.com/oauth_token.do", mono: true },
          { label: "OAuth registry", value: "neugain_agent_oauth_app", mono: true },
          { label: "Client ID", value: "8f0e…a3f2", mono: true },
          { label: "Client secret", secret: true, masked: mask("f81c") },
          { label: "Integration user", value: "svc.neugain.agent", mono: true },
        ],
      },
    ],
    scopes: [
      { name: "table.incident.read", granted: true, requested: true },
      { name: "table.incident.write", granted: true, requested: true, risk: "warn" },
      { name: "table.change_request.read", granted: true, requested: true },
      { name: "table.change_request.write", granted: true, requested: true, risk: "warn" },
      { name: "table.cmdb_ci.read", granted: true, requested: true },
      { name: "table.cmdb_ci.write", granted: false, requested: true, risk: "high", boundary: "Blocked by ACL sn_cmdb_write" },
      { name: "role: itil", granted: true, requested: true },
      { name: "role: cmdb_read", granted: true, requested: true },
    ],
    scopesNote: "1 permission is requested but not granted. ACL sn_cmdb_write requires domain-separated approval.",
    events: [
      { interface: "Business Rule", eventType: "incident.insert", callback: "https://api.neugain.io/hooks/snow/incident", enabled: true, lastEventAt: "2026-05-14 10:28Z", lastStatus: "OK" },
      { interface: "Flow Designer", eventType: "change_request.approved", callback: "https://api.neugain.io/hooks/snow/change", enabled: true, lastEventAt: "2026-05-14 09:41Z", lastStatus: "OK" },
      { interface: "REST poller", eventType: "cmdb_ci.updated (sys_updated_on)", enabled: true, lastEventAt: "2026-05-14 10:25Z", lastStatus: "OK" },
    ],
    agentAuthority: {
      ...defaultAgent("Execute with Approval"),
      allowedActions: ["incident.create", "incident.update.state", "change_request.attach_evidence"],
      prohibitedActions: ["cmdb_ci.write", "user.impersonate", "table.delete"],
      resourceBoundary: "Assignment group ∈ {svc-itsm-platform, svc-sre}",
      executionCredential: "svc.neugain.agent (separate from read identity)",
    },
    validation: [
      { label: "Resolve instance DNS + TLS", status: "Passed", latencyMs: 84, detail: "TLS 1.3 · ECDSA · SAN validated" },
      { label: "Obtain OAuth token", status: "Passed", latencyMs: 210, detail: "Token TTL 1800s" },
      { label: "Read /now/table/sys_user (self)", status: "Passed", latencyMs: 92, detail: "sys_id=6b3e… user_name=svc.neugain.agent" },
      { label: "Validate table access — incident", status: "Passed", latencyMs: 141 },
      { label: "Validate table access — cmdb_ci (write)", status: "Failed", detail: "ACL sn_cmdb_write denied. Authentication succeeded; authorization denied." },
      { label: "Sample query — incidentSTATE=1^assignment_group=svc-sre", status: "Passed", latencyMs: 178 },
    ],
    audit: auditBase,
  },

  Datadog: {
    key: "Datadog",
    app: "Datadog",
    category: "Monitoring & Observability",
    status: "Connected",
    environment: "Production",
    profileName: "datadog-us1-prod",
    connectorType: "REST API + Webhook",
    direction: "Bidirectional",
    agentMode: "Recommend",
    businessOwner: "Elena Ruiz (Head of SRE)",
    technicalOwner: "Marcus Chen",
    supportGroup: "svc-observability",
    dataClassification: "Confidential",
    description: "Datadog monitors, incidents, events, SLOs, and service catalog. Metrics submit is disabled.",
    lastValidatedAt: "2026-05-14 10:30Z",
    lastSuccessfulAt: "2026-05-14 10:30Z",
    connectorVersion: "2.4.0",
    createdBy: "platform.bootstrap",
    createdAt: "2026-02-01",
    modifiedBy: "marcus.chen@neugain.io",
    modifiedAt: "2026-05-12",
    connectionGroups: [
      {
        title: "Site & organization",
        fields: [
          { label: "Datadog site", value: "us1.datadoghq.com" },
          { label: "API base URL", value: "https://api.datadoghq.com", mono: true },
          { label: "Organization", value: "neugain-prod (org_id 4021)" },
          { label: "Service account", value: "svc-neugain-agent@neugain-prod.dd", mono: true },
          { label: "Default service filter", value: "env:prod service:clinical-*", mono: true },
          { label: "Team filters", value: "team:sre, team:itsm-platform", mono: true },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "API + Application key (current)",
        fields: [
          { label: "API key", secret: true, masked: mask("6d11") },
          { label: "Application key", secret: true, masked: mask("aa02") },
          { label: "Rotation due", value: "2026-08-01" },
        ],
      },
      {
        title: "OAuth 2.0 integration (available, not enabled)",
        hint: "Personal access tokens are not recommended for enterprise agent workloads.",
        fields: [
          { label: "OAuth client", value: "Not configured" },
        ],
      },
    ],
    scopes: [
      { name: "monitors_read", granted: true, requested: true },
      { name: "monitors_write", granted: true, requested: true, risk: "warn" },
      { name: "incidents_read", granted: true, requested: true },
      { name: "incidents_write", granted: true, requested: true, risk: "warn" },
      { name: "events_read", granted: true, requested: true },
      { name: "events_write", granted: true, requested: true },
      { name: "metrics_read", granted: true, requested: true },
      { name: "metrics_submit", granted: false, requested: false, boundary: "Not requested — submit disabled" },
      { name: "logs_read", granted: true, requested: true },
      { name: "slo_read", granted: true, requested: true },
      { name: "service_catalog_read", granted: true, requested: true },
    ],
    scopesNote: "Restriction policy 'neugain-agent-restricted' applies to monitors_write and incidents_write.",
    events: [
      { interface: "Datadog webhook", eventType: "monitor.state.change (Alert)", callback: "https://api.neugain.io/hooks/dd/monitor", enabled: true, lastEventAt: "2026-05-14 10:12Z", lastStatus: "OK" },
      { interface: "Datadog webhook", eventType: "monitor.state.change (Recovery)", callback: "https://api.neugain.io/hooks/dd/monitor", enabled: true, lastEventAt: "2026-05-14 09:57Z", lastStatus: "OK" },
      { interface: "Datadog webhook", eventType: "incidents.updated", callback: "https://api.neugain.io/hooks/dd/incident", enabled: true, lastEventAt: "2026-05-14 08:03Z", lastStatus: "OK" },
    ],
    eventNotes: ["Webhooks authenticated with OAuth 2.0 client credentials against api.neugain.io."],
    agentAuthority: defaultAgent("Recommend"),
    validation: [
      { label: "Validate API + Application key pair", status: "Passed", latencyMs: 132 },
      { label: "Resolve organization (org_id 4021)", status: "Passed", latencyMs: 90 },
      { label: "GET /api/v1/monitor (count)", status: "Passed", latencyMs: 244, detail: "1,247 monitors visible in scope" },
      { label: "GET /api/v1/events (last 15m)", status: "Passed", latencyMs: 168, detail: "83 events" },
      { label: "Validate webhook auth (OAuth 2.0 client_credentials)", status: "Passed", latencyMs: 210 },
      { label: "Rate limit header", status: "Warning", detail: "X-RateLimit-Remaining: 43/300 · reset in 42s" },
    ],
    audit: auditBase,
  },

  "Splunk Enterprise": {
    key: "Splunk Enterprise",
    app: "Splunk Enterprise",
    category: "SIEM & Analytics",
    status: "Connected",
    environment: "Production",
    profileName: "splunk-shc-prod-sec",
    connectorType: "Management API (search) + HEC (ingest)",
    direction: "Bidirectional",
    agentMode: "Recommend",
    businessOwner: "Rahul Kapoor (CISO Delegate)",
    technicalOwner: "Aiko Tanaka (Detection Eng)",
    supportGroup: "svc-siem",
    dataClassification: "Restricted",
    description: "Splunk Enterprise search head cluster. Search interface is bearer JWT; HEC ingest uses a separate token.",
    lastValidatedAt: "2026-05-14 10:29Z",
    lastSuccessfulAt: "2026-05-14 10:29Z",
    connectorVersion: "1.9.0",
    createdBy: "platform.bootstrap",
    createdAt: "2026-01-22",
    modifiedBy: "aiko.tanaka@neugain.io",
    modifiedAt: "2026-05-09",
    connectionGroups: [
      {
        title: "Search head",
        fields: [
          { label: "Deployment", value: "Enterprise (self-hosted SHC)" },
          { label: "Search head URL", value: "https://splunk-shc.neugain.internal", mono: true },
          { label: "Management API port", value: "8089" },
          { label: "Search head cluster", value: "shc-east-01" },
          { label: "App namespace", value: "neugain_agent_app", mono: true },
          { label: "Owner namespace", value: "nobody", mono: true },
          { label: "TLS validation", value: "Enabled (internal CA bundle 'neugain-root-2025')" },
        ],
      },
      {
        title: "Search bounds",
        fields: [
          { label: "Default indexes", value: "wineventlog, aws_cloudtrail, k8s_audit, o365_audit", mono: true },
          { label: "Max search window", value: "24h" },
          { label: "Max results", value: "50000" },
          { label: "Search concurrency", value: "4" },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "Splunk JWT bearer token (search)",
        fields: [
          { label: "Splunk user", value: "svc_neugain_agent", mono: true },
          { label: "Splunk role", value: "neugain_agent_reader", mono: true },
          { label: "Bearer token", secret: true, masked: mask("7c3d") },
          { label: "Token expiration", value: "2026-11-01" },
        ],
      },
      {
        title: "HEC token (ingest only)",
        hint: "An HEC token can ingest events but cannot authorize Splunk searches.",
        fields: [
          { label: "HEC enabled", value: "Yes" },
          { label: "HEC endpoint", value: "https://splunk-hec.neugain.internal:8088/services/collector", mono: true },
          { label: "HEC token", secret: true, masked: mask("b210") },
          { label: "Default index", value: "neugain_agent_events", mono: true },
          { label: "Default sourcetype", value: "neugain:agent:action", mono: true },
          { label: "Acknowledgment", value: "Enabled" },
        ],
      },
    ],
    scopes: [
      { name: "index: wineventlog (read)", granted: true, requested: true },
      { name: "index: aws_cloudtrail (read)", granted: true, requested: true },
      { name: "index: k8s_audit (read)", granted: true, requested: true },
      { name: "savedsearch: neugain_agent_* (dispatch)", granted: true, requested: true },
      { name: "SPL command allowlist", granted: true, requested: true, boundary: "search, stats, table, eval, where, fields, dedup" },
      { name: "SPL command denylist", granted: true, requested: true, risk: "high", boundary: "| delete, | outputlookup, | script, | run" },
    ],
    events: [
      { interface: "HEC", eventType: "neugain:agent:action (outbound)", enabled: true, lastEventAt: "2026-05-14 10:29Z", lastStatus: "OK" },
    ],
    agentAuthority: defaultAgent("Recommend"),
    validation: [
      { label: "Resolve search head + TLS", status: "Passed", latencyMs: 61 },
      { label: "Authenticate management API (JWT)", status: "Passed", latencyMs: 118 },
      { label: "GET /services/server/info", status: "Passed", latencyMs: 74, detail: "version=9.2.1 · cluster=shc-east-01" },
      { label: "Submit restricted search (search index=wineventlog | head 1)", status: "Passed", latencyMs: 812, detail: "sid=1747293002.4471" },
      { label: "Retrieve results by SID", status: "Passed", latencyMs: 92 },
      { label: "HEC health probe", status: "Passed", latencyMs: 58 },
      { label: "HEC synthetic event", status: "Passed", latencyMs: 71, detail: "ack_id=e9f2 · index=neugain_agent_events" },
    ],
    audit: auditBase,
  },

  Okta: {
    key: "Okta",
    app: "Okta",
    category: "Identity & Access",
    status: "Connected",
    environment: "Production",
    profileName: "okta-neugain-prod",
    connectorType: "OAuth 2.0 service application (private_key_jwt)",
    direction: "Bidirectional",
    agentMode: "Execute with Approval",
    businessOwner: "Rahul Kapoor",
    technicalOwner: "Diego Alvarez (IAM Eng)",
    supportGroup: "svc-iam",
    dataClassification: "Restricted",
    description: "Okta service application for user, group, application, and System Log read; group membership writes are approval-gated.",
    lastValidatedAt: "2026-05-14 10:27Z",
    lastSuccessfulAt: "2026-05-14 10:27Z",
    connectorVersion: "2.1.3",
    createdBy: "platform.bootstrap",
    createdAt: "2026-02-14",
    modifiedBy: "diego.alvarez@neugain.io",
    modifiedAt: "2026-05-01",
    connectionGroups: [
      {
        title: "Organization",
        fields: [
          { label: "Okta org URL", value: "https://neugain.okta.com", mono: true },
          { label: "Cell", value: "US · Cell OK1" },
          { label: "Authorization server", value: "default", mono: true },
          { label: "Token endpoint", value: "https://neugain.okta.com/oauth2/default/v1/token", mono: true },
          { label: "Service application", value: "NeuGAIN Agent (0oa1x9j…)" },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "OAuth 2.0 · private_key_jwt",
        fields: [
          { label: "Client ID", value: "0oa1x9j5f2ZQpKX7d5d7", mono: true },
          { label: "Key ID (kid)", value: "kid_2026_04_neugain_agent", mono: true },
          { label: "Private key reference", secret: true, masked: "vault://okta/private_keys/neugain-agent#kid_2026_04" },
          { label: "SSWS token", value: "Not configured (not preferred)", hint: "Available but discouraged." },
        ],
      },
    ],
    scopes: [
      { name: "okta.users.read", granted: true, requested: true },
      { name: "okta.groups.read", granted: true, requested: true },
      { name: "okta.apps.read", granted: true, requested: true },
      { name: "okta.logs.read", granted: true, requested: true },
      { name: "okta.users.manage", granted: false, requested: true, risk: "high", boundary: "Requires super-admin grant" },
      { name: "okta.groups.manage", granted: true, requested: true, risk: "warn", boundary: "Restricted to groups under 'agent-managed/*'" },
      { name: "okta.sessions.manage", granted: false, requested: false, risk: "high" },
      { name: "Admin role", granted: true, requested: true, boundary: "Group Membership Administrator" },
    ],
    scopesNote: "okta.users.manage is not granted — write actions on user profiles are blocked.",
    events: [
      { interface: "Event Hook", eventType: "user.lifecycle.deactivate", callback: "https://api.neugain.io/hooks/okta/lifecycle", enabled: true, lastEventAt: "2026-05-13 22:04Z", lastStatus: "OK" },
      { interface: "Event Hook", eventType: "group.user_membership.add", callback: "https://api.neugain.io/hooks/okta/membership", enabled: true, lastEventAt: "2026-05-14 07:11Z", lastStatus: "OK" },
      { interface: "System Log polling", eventType: "since cursor 2026-05-14T10:00Z", enabled: true, lastEventAt: "2026-05-14 10:27Z", lastStatus: "OK" },
    ],
    agentAuthority: {
      ...defaultAgent("Execute with Approval"),
      allowedActions: ["group.assign(agent-managed/*)", "group.unassign(agent-managed/*)"],
      prohibitedActions: ["user.deactivate", "user.reset_password", "policy.write", "session.revoke"],
      resourceBoundary: "Groups under 'agent-managed/*' · Users under 'clinical-ops/*'",
      executionCredential: "Same service app; approval flow via ChangeGate",
    },
    validation: [
      { label: "Sign client assertion (private_key_jwt)", status: "Passed", latencyMs: 42 },
      { label: "Exchange for scoped access token", status: "Passed", latencyMs: 188 },
      { label: "GET /api/v1/org", status: "Passed", latencyMs: 96, detail: "subdomain=neugain · status=ACTIVE" },
      { label: "GET /api/v1/apps/{self}", status: "Passed", latencyMs: 78 },
      { label: "Retrieve sample users (limit=5)", status: "Passed", latencyMs: 132 },
      { label: "Retrieve System Log entries (last 15m)", status: "Passed", latencyMs: 214, detail: "127 events" },
      { label: "Event Hook verification", status: "Warning", detail: "One-time verification pending on user.lifecycle.deactivate (last verify 26 days ago)" },
    ],
    audit: auditBase,
  },

  CrowdStrike: {
    key: "CrowdStrike",
    app: "CrowdStrike Falcon",
    category: "Security Operations",
    status: "In Progress",
    environment: "Production",
    profileName: "falcon-us2-prod",
    connectorType: "OAuth 2.0 client credentials (Bearer)",
    direction: "Bidirectional",
    agentMode: "Recommend",
    businessOwner: "Rahul Kapoor",
    technicalOwner: "Aiko Tanaka",
    supportGroup: "svc-secops",
    dataClassification: "Restricted",
    description: "CrowdStrike Falcon API client for hosts, detections, incidents, and Spotlight. Host containment and RTR are disabled.",
    lastValidatedAt: "2026-05-14 09:41Z",
    lastSuccessfulAt: "2026-05-13 22:12Z",
    connectorVersion: "1.3.0",
    createdBy: "platform.bootstrap",
    createdAt: "2026-03-04",
    modifiedBy: "aiko.tanaka@neugain.io",
    modifiedAt: "2026-05-14",
    connectionGroups: [
      {
        title: "Falcon cloud",
        fields: [
          { label: "Regional cloud", value: "us-2" },
          { label: "API base URL", value: "https://api.us-2.crowdstrike.com", mono: true },
          { label: "Customer ID (CID)", value: "1a2b3c4d5e6f7g8h9i0j-40", mono: true },
          { label: "Member CID", value: "Not applicable" },
          { label: "Flight Control", value: "Disabled" },
          { label: "API client name", value: "neugain-agent-readonly", mono: true },
          { label: "Bearer token TTL", value: "1800s (auto-renew enabled)" },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "OAuth 2.0 client credentials",
        fields: [
          { label: "Token endpoint", value: "https://api.us-2.crowdstrike.com/oauth2/token", mono: true },
          { label: "Client ID", value: "cs_client_9f2b…", mono: true },
          { label: "Client secret", secret: true, masked: mask("11ee") },
        ],
      },
    ],
    scopes: [
      { name: "Hosts (read)", granted: true, requested: true },
      { name: "Detections (read)", granted: true, requested: true },
      { name: "Detections (write)", granted: false, requested: true, risk: "warn", boundary: "Denied by API client policy" },
      { name: "Incidents (read)", granted: true, requested: true },
      { name: "Spotlight (read)", granted: true, requested: true },
      { name: "Discover (read)", granted: false, requested: false },
      { name: "Identity Protection (read)", granted: false, requested: false },
      { name: "Host groups (read)", granted: true, requested: true },
      { name: "Host containment", granted: false, requested: false, risk: "high", boundary: "High-risk · not requested" },
      { name: "Real Time Response", granted: false, requested: false, risk: "high", boundary: "High-risk · not requested" },
    ],
    scopesNote: "High-risk write scopes (containment, RTR, process termination, file deletion) are intentionally not requested.",
    events: [
      { interface: "Streaming API", eventType: "DetectionSummaryEvent", enabled: true, lastEventAt: "2026-05-14 09:38Z", lastStatus: "OK" },
      { interface: "Streaming API", eventType: "IncidentSummaryEvent", enabled: true, lastEventAt: "2026-05-14 09:12Z", lastStatus: "Retrying" },
    ],
    agentAuthority: defaultAgent("Recommend"),
    validation: [
      { label: "POST /oauth2/token", status: "Passed", latencyMs: 202 },
      { label: "Resolve CID from token", status: "Passed", latencyMs: 74 },
      { label: "GET /devices/queries/devices/v1 (count)", status: "Passed", latencyMs: 188, detail: "12,481 hosts visible" },
      { label: "GET /detects/queries/detects/v1 (last 24h)", status: "Passed", latencyMs: 246, detail: "417 detections" },
      { label: "Scope check — Detections (write)", status: "Failed", detail: "403 access_denied. Authentication succeeded; scope not granted." },
      { label: "Containment / RTR probe", status: "Warning", detail: "Skipped by policy — never exercised during connection testing." },
    ],
    audit: auditBase,
  },

  "Microsoft Azure": {
    key: "Microsoft Azure",
    app: "Microsoft Azure",
    category: "Cloud Platform",
    status: "Connected",
    environment: "Production",
    profileName: "azure-prod-hub",
    connectorType: "Workload identity federation → Entra",
    direction: "Bidirectional",
    agentMode: "Execute with Approval",
    businessOwner: "Elena Ruiz",
    technicalOwner: "Marcus Chen",
    supportGroup: "svc-cloud-platform",
    dataClassification: "Confidential",
    description: "Azure Resource Manager + Log Analytics via workload identity federation. No long-lived secrets.",
    lastValidatedAt: "2026-05-14 10:30Z",
    lastSuccessfulAt: "2026-05-14 10:30Z",
    connectorVersion: "4.0.2",
    createdBy: "platform.bootstrap",
    createdAt: "2026-01-11",
    modifiedBy: "marcus.chen@neugain.io",
    modifiedAt: "2026-05-13",
    connectionGroups: [
      {
        title: "Cloud & tenant",
        fields: [
          { label: "Azure cloud", value: "Public (AzureCloud)" },
          { label: "Entra tenant ID", value: "3f5a7b2c-9d40-4b1e-8a11-a7c9e8f1b204", mono: true },
          { label: "Application (client) ID", value: "a1e2c9d0-77b3-4e4c-8b12-6b4f2a11c3d0", mono: true },
          { label: "Authority", value: "https://login.microsoftonline.com/3f5a7b2c-…", mono: true },
        ],
      },
      {
        title: "Scope",
        fields: [
          { label: "Subscription allowlist", value: "sub_prod_core (2f…), sub_prod_data (8a…)", mono: true },
          { label: "Management group", value: "mg-neugain-prod", mono: true },
          { label: "Resource group allowlist", value: "rg-clinical-*, rg-observability-*", mono: true },
          { label: "Region filters", value: "eastus, eastus2, westus2" },
          { label: "Tag filters", value: "env=prod, owner=neugain-agent", mono: true },
          { label: "Resource Graph", value: "Enabled" },
          { label: "Log Analytics workspaces", value: "law-prod-obs (b2…), law-prod-sec (7d…)", mono: true },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "Workload identity federation (recommended)",
        fields: [
          { label: "Federated credential subject", value: "system:serviceaccount:neugain-agent:runtime", mono: true },
          { label: "OIDC issuer", value: "https://oidc.neugain.io", mono: true },
          { label: "Audience", value: "api://AzureADTokenExchange", mono: true },
        ],
      },
      {
        title: "Fallback (disabled)",
        fields: [
          { label: "Client secret", value: "Not configured", hint: "Fallback only." },
          { label: "Client certificate", value: "Not configured" },
        ],
      },
    ],
    scopes: [
      { name: "Reader (subscription)", granted: true, requested: true, boundary: "sub_prod_core, sub_prod_data" },
      { name: "Monitoring Reader", granted: true, requested: true },
      { name: "Log Analytics Reader", granted: true, requested: true },
      { name: "Resource Graph Reader (data-plane)", granted: true, requested: true },
      { name: "Tag Contributor", granted: true, requested: true, risk: "warn", boundary: "RG rg-clinical-* only" },
      { name: "Contributor", granted: false, requested: false, risk: "high" },
    ],
    events: [
      { interface: "Event Grid", eventType: "Microsoft.Resources.ResourceWriteSuccess", callback: "eventgrid://neugain-agent-topic", enabled: true, lastEventAt: "2026-05-14 10:28Z", lastStatus: "OK" },
      { interface: "Azure Monitor Alert", eventType: "Metric alert (webhook)", callback: "https://api.neugain.io/hooks/azure/monitor", enabled: true, lastEventAt: "2026-05-14 09:47Z", lastStatus: "OK" },
      { interface: "Activity Log", eventType: "policyEvaluation", enabled: true, lastStatus: "OK" },
    ],
    agentAuthority: {
      ...defaultAgent("Execute with Approval"),
      allowedActions: ["Microsoft.Resources/tags/write", "Microsoft.Resources/subscriptions/resourceGroups/read"],
      prohibitedActions: ["*/write on Microsoft.Compute/*", "*/delete on *", "Microsoft.KeyVault/*/write"],
      resourceBoundary: "rg-clinical-* in sub_prod_core (Contributor deny-list applied)",
    },
    validation: [
      { label: "Federated token exchange with Entra", status: "Passed", latencyMs: 244 },
      { label: "Resolve tenant", status: "Passed", latencyMs: 88 },
      { label: "Enumerate allowed subscriptions", status: "Passed", latencyMs: 172, detail: "2 subscriptions in scope" },
      { label: "Resource Graph query (Resources | count)", status: "Passed", latencyMs: 316, detail: "4,207 resources" },
      { label: "ARM: GET /providers/Microsoft.Insights/…", status: "Passed", latencyMs: 214 },
      { label: "Log Analytics KQL (Heartbeat | take 1)", status: "Passed", latencyMs: 402, detail: "workspace=law-prod-obs" },
      { label: "Data-plane check (Key Vault)", status: "Warning", detail: "Skipped — no Key Vault RBAC role assigned (by design)." },
    ],
    audit: auditBase,
  },

  "Amazon Web Services": {
    key: "Amazon Web Services",
    app: "Amazon Web Services",
    category: "Cloud Platform",
    status: "Connected",
    environment: "Production",
    profileName: "aws-prod-orgunit-core",
    connectorType: "OIDC federation → AssumeRoleWithWebIdentity",
    direction: "Bidirectional",
    agentMode: "Execute with Approval",
    businessOwner: "Elena Ruiz",
    technicalOwner: "Marcus Chen",
    supportGroup: "svc-cloud-platform",
    dataClassification: "Confidential",
    description: "AWS cross-account access via OIDC federation. No long-lived keys. Region-restricted, tag-scoped.",
    lastValidatedAt: "2026-05-14 10:30Z",
    lastSuccessfulAt: "2026-05-14 10:30Z",
    connectorVersion: "3.1.4",
    createdBy: "platform.bootstrap",
    createdAt: "2026-01-11",
    modifiedBy: "marcus.chen@neugain.io",
    modifiedAt: "2026-05-06",
    connectionGroups: [
      {
        title: "Accounts",
        fields: [
          { label: "Partition", value: "aws" },
          { label: "Account IDs", value: "401293847561, 401293847562", mono: true },
          { label: "Regions", value: "us-east-1, us-east-2, us-west-2" },
          { label: "STS regional endpoint", value: "Preferred (regional)" },
          { label: "Service allowlist", value: "ec2, s3, rds, cloudwatch, cloudtrail, eventbridge, sqs, sns, iam:List*", mono: true },
        ],
      },
      {
        title: "Role assumption",
        fields: [
          { label: "Role ARN", value: "arn:aws:iam::401293847561:role/NeuGAINAgentReadWriteTags", mono: true },
          { label: "Role session name", value: "neugain-agent-{corr}", mono: true },
          { label: "Session duration", value: "3600s" },
          { label: "External ID", value: "extid-neugain-prod-9f2b (stored)" },
          { label: "Tag filter", value: "env=prod, owner=neugain-agent", mono: true },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "OIDC federation (recommended)",
        fields: [
          { label: "OIDC issuer", value: "https://oidc.neugain.io", mono: true },
          { label: "Subject condition", value: "system:serviceaccount:neugain-agent:runtime", mono: true },
          { label: "Audience condition", value: "sts.amazonaws.com", mono: true },
        ],
      },
    ],
    scopes: [
      { name: "ec2:Describe*", granted: true, requested: true },
      { name: "s3:GetObject / s3:ListBucket", granted: true, requested: true, boundary: "s3://neugain-clinical-* only" },
      { name: "cloudwatch:GetMetricData", granted: true, requested: true },
      { name: "cloudtrail:LookupEvents", granted: true, requested: true },
      { name: "eventbridge:PutEvents", granted: true, requested: true },
      { name: "ec2:CreateTags", granted: true, requested: true, risk: "warn", boundary: "Resource tag env=prod required" },
      { name: "iam:*", granted: false, requested: false, risk: "high" },
      { name: "s3:DeleteObject", granted: false, requested: false, risk: "high" },
      { name: "Permission boundary", granted: true, requested: true, boundary: "arn:aws:iam::401293847561:policy/NeuGAINAgentBoundary" },
    ],
    events: [
      { interface: "EventBridge", eventType: "aws.ec2 · EC2 Instance State-change", callback: "arn:aws:events:us-east-1:401293847561:rule/neugain-agent", enabled: true, lastEventAt: "2026-05-14 10:29Z", lastStatus: "OK" },
      { interface: "SQS", eventType: "neugain-agent-events (DLQ: neugain-agent-dlq)", enabled: true, lastEventAt: "2026-05-14 10:28Z", lastStatus: "OK" },
      { interface: "CloudTrail", eventType: "Data events (S3 · neugain-clinical-*)", enabled: true, lastStatus: "OK" },
    ],
    agentAuthority: {
      ...defaultAgent("Execute with Approval"),
      allowedActions: ["ec2:CreateTags", "eventbridge:PutEvents"],
      prohibitedActions: ["iam:*", "*:Delete*", "kms:Decrypt (outside neugain-agent CMKs)"],
      resourceBoundary: "Resources with tag env=prod AND owner=neugain-agent",
    },
    validation: [
      { label: "sts:AssumeRoleWithWebIdentity", status: "Passed", latencyMs: 198 },
      { label: "sts:GetCallerIdentity", status: "Passed", latencyMs: 62, detail: "Arn=arn:aws:sts::401293847561:assumed-role/NeuGAINAgentReadWriteTags/…" },
      { label: "ec2:DescribeRegions (allowed regions)", status: "Passed", latencyMs: 141 },
      { label: "s3:ListBucket · neugain-clinical-primary", status: "Passed", latencyMs: 208 },
      { label: "eventbridge:PutEvents (dry via Events probe rule)", status: "Passed", latencyMs: 154 },
      { label: "iam:ListRoles", status: "Failed", detail: "AccessDenied. Explicit deny in permission boundary NeuGAINAgentBoundary." },
    ],
    audit: auditBase,
  },

  "Jira Software": {
    key: "Jira Software",
    app: "Jira Software",
    category: "Project & Issue Tracking",
    status: "In Progress",
    environment: "Production",
    profileName: "jira-cloud-neugain",
    connectorType: "OAuth 2.0 (3LO)",
    direction: "Bidirectional",
    agentMode: "Execute with Approval",
    businessOwner: "Priya Raman",
    technicalOwner: "Diego Alvarez",
    supportGroup: "svc-itsm-platform",
    dataClassification: "Confidential",
    description: "Jira Cloud (Atlassian) 3LO OAuth integration for read/write on selected projects.",
    lastValidatedAt: "2026-05-14 09:11Z",
    lastSuccessfulAt: "2026-05-13 22:00Z",
    connectorVersion: "1.6.0",
    createdBy: "diego.alvarez@neugain.io",
    createdAt: "2026-03-18",
    modifiedBy: "diego.alvarez@neugain.io",
    modifiedAt: "2026-05-14",
    connectionGroups: [
      {
        title: "Deployment",
        fields: [
          { label: "Deployment", value: "Jira Cloud" },
          { label: "Atlassian site", value: "https://neugain.atlassian.net", mono: true },
          { label: "Cloud ID", value: "6f0e2a91-3b8c-4a5f-9d12-8e0b1c2d3e4f", mono: true },
          { label: "REST base URL", value: "https://api.atlassian.com/ex/jira/{cloudId}/rest/api/3", mono: true },
        ],
      },
      {
        title: "Scope",
        fields: [
          { label: "Project allowlist", value: "OPS, SEC, CLIN, PLAT", mono: true },
          { label: "Issue-type allowlist", value: "Incident, Change, Task, Bug", mono: true },
          { label: "JQL restriction", value: "project in (OPS,SEC,CLIN,PLAT) AND security = \"Restricted\"", mono: true },
          { label: "Board IDs", value: "42, 108" },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "OAuth 2.0 (3LO)",
        fields: [
          { label: "Client ID", value: "atl_3lo_9f2b…", mono: true },
          { label: "Client secret", secret: true, masked: mask("9c11") },
          { label: "Redirect URI", value: "https://app.neugain.io/oauth/atlassian/callback", mono: true },
          { label: "Authorization URL", value: "https://auth.atlassian.com/authorize", mono: true },
          { label: "Token URL", value: "https://auth.atlassian.com/oauth/token", mono: true },
          { label: "Granted scopes", value: "read:jira-user read:jira-work write:jira-work manage:jira-webhook", mono: true },
          { label: "Refresh token", value: "Present · rotates every 90 days" },
        ],
      },
    ],
    scopes: [
      { name: "read:jira-work", granted: true, requested: true },
      { name: "write:jira-work", granted: true, requested: true, risk: "warn" },
      { name: "read:jira-user", granted: true, requested: true },
      { name: "manage:jira-webhook", granted: true, requested: true },
      { name: "manage:jira-configuration", granted: false, requested: false, risk: "high" },
      { name: "Transition allowlist", granted: true, requested: true, boundary: "OPS: To Triage, In Progress, Resolved · SEC: Contained, Closed" },
    ],
    scopesNote: "Jira transition IDs differ per project/workflow — resolved at runtime, not cached across tenants.",
    events: [
      { interface: "Webhook", eventType: "jira:issue_created", callback: "https://api.neugain.io/hooks/jira/issue", enabled: true, lastEventAt: "2026-05-14 08:48Z", lastStatus: "OK" },
      { interface: "Webhook", eventType: "jira:issue_updated (JQL: project in (OPS,SEC))", callback: "https://api.neugain.io/hooks/jira/issue", enabled: true, lastEventAt: "2026-05-14 10:05Z", lastStatus: "Retrying" },
    ],
    agentAuthority: {
      ...defaultAgent("Execute with Approval"),
      allowedActions: ["issue.create(OPS,SEC)", "issue.comment", "issue.transition(allowlisted)"],
      prohibitedActions: ["project.write", "workflow.edit", "issue.delete"],
      resourceBoundary: "Projects OPS, SEC, CLIN, PLAT",
    },
    validation: [
      { label: "OAuth 3LO exchange", status: "Passed", latencyMs: 302 },
      { label: "GET /oauth/token/accessible-resources", status: "Passed", latencyMs: 141 },
      { label: "GET /rest/api/3/myself", status: "Passed", latencyMs: 88, detail: "accountId=712020:… name=svc.neugain.agent" },
      { label: "GET /rest/api/3/project (allowlist)", status: "Passed", latencyMs: 172 },
      { label: "JQL search (restricted)", status: "Passed", latencyMs: 214, detail: "31 issues" },
      { label: "GET workflow transitions for issue OPS-1042", status: "Warning", detail: "Transition 'Resolved' has id=51 in OPS but id=61 in SEC — resolve per project." },
      { label: "Webhook registration read-back", status: "Failed", detail: "manage:jira-webhook was granted but webhook not yet reachable from Atlassian egress (HTTP 000). Retrying." },
    ],
    audit: auditBase,
  },

  "CMDB / Asset Inventory": {
    key: "CMDB / Asset Inventory",
    app: "CMDB / Asset Inventory",
    category: "Configuration Management",
    status: "Connected",
    environment: "Production",
    profileName: "cmdb-servicenow-federated",
    connectorType: "Federated CI + Asset resolver",
    direction: "Bidirectional",
    agentMode: "Recommend",
    businessOwner: "Priya Raman",
    technicalOwner: "Marcus Chen",
    supportGroup: "svc-cmdb",
    dataClassification: "Confidential",
    description: "Configurable CMDB connector. Direct DB writes prohibited; all writes go through the reconciliation engine.",
    lastValidatedAt: "2026-05-14 10:30Z",
    lastSuccessfulAt: "2026-05-14 10:30Z",
    connectorVersion: "2.2.0",
    createdBy: "platform.bootstrap",
    createdAt: "2026-02-01",
    modifiedBy: "marcus.chen@neugain.io",
    modifiedAt: "2026-05-04",
    connectionGroups: [
      {
        title: "Product",
        fields: [
          { label: "Product", value: "ServiceNow CMDB" },
          { label: "Product version", value: "Washington DC" },
          { label: "Tenant / base URL", value: "https://neugain.service-now.com/api/now/cmdb", mono: true },
          { label: "API version", value: "v1" },
          { label: "Authentication", value: "OAuth 2.0 (shared with ServiceNow ITSM profile)" },
        ],
      },
      {
        title: "CI + Asset classes",
        fields: [
          { label: "CI classes", value: "cmdb_ci_server, cmdb_ci_vm_instance, cmdb_ci_appl, cmdb_ci_service_discovered", mono: true },
          { label: "Relationship classes", value: "cmdb_rel_ci (Hosted on, Runs on, Depends on)", mono: true },
          { label: "Page size", value: "500" },
          { label: "Incremental field", value: "sys_updated_on", mono: true },
          { label: "Cursor", value: "2026-05-14T10:29:41Z" },
          { label: "Deletion handling", value: "Tombstone via sys_domain + install_status=7" },
        ],
      },
      {
        title: "Reconciliation",
        fields: [
          { label: "Authoritative source ranking", value: "1) ServiceNow Discovery  2) AWS Config  3) Azure Resource Graph", mono: true },
          { label: "CI identification key", value: "serial_number → mac_address → asset_tag", mono: true },
          { label: "Duplicate handling", value: "Merge on identifier match; quarantine otherwise" },
          { label: "Lifecycle-state mapping", value: "install_status → {In Stock, Deployed, Retired}", mono: true },
          { label: "Write-through reconciliation", value: "Enabled" },
          { label: "Dry-run mode", value: "Enabled for this environment" },
        ],
      },
    ],
    authenticationGroups: [],
    scopes: [
      { name: "CI read", granted: true, requested: true },
      { name: "Relationship read", granted: true, requested: true },
      { name: "Ownership + Business service read", granted: true, requested: true },
      { name: "Propose updates (via IRE)", granted: true, requested: true, risk: "warn" },
      { name: "Direct DB writes", granted: false, requested: false, risk: "high", boundary: "Prohibited by policy" },
    ],
    events: [],
    agentAuthority: defaultAgent("Recommend"),
    validation: [
      { label: "Authenticate (shared OAuth token)", status: "Passed", latencyMs: 140 },
      { label: "GET product version", status: "Passed", latencyMs: 84 },
      { label: "Retrieve CI class cmdb_ci_server", status: "Passed", latencyMs: 288, detail: "1,204 CIs in scope" },
      { label: "Validate identifiers (serial_number)", status: "Passed", latencyMs: 96, detail: "99.7% populated" },
      { label: "Relationship sample (cmdb_rel_ci)", status: "Passed", latencyMs: 174, detail: "312 relations" },
      { label: "Duplicate analysis", status: "Warning", detail: "12 candidate duplicates on mac_address — awaiting steward review." },
      { label: "Reconciliation dry run (Identity Reconciliation Engine)", status: "Passed", latencyMs: 402 },
    ],
    audit: auditBase,
  },

  PagerDuty: {
    key: "PagerDuty",
    app: "PagerDuty",
    category: "Incident Management",
    status: "Not Connected",
    environment: "Production",
    profileName: "pagerduty-neugain",
    connectorType: "REST API + Events API v2 + V3 Webhook",
    direction: "Bidirectional",
    agentMode: "Recommend",
    businessOwner: "Elena Ruiz",
    technicalOwner: "Diego Alvarez",
    supportGroup: "svc-oncall",
    dataClassification: "Confidential",
    description: "PagerDuty REST API for incident + service metadata; Events API v2 for trigger; V3 webhook for change notifications.",
    lastValidatedAt: "—",
    lastSuccessfulAt: "—",
    connectorVersion: "1.0.0",
    createdBy: "diego.alvarez@neugain.io",
    createdAt: "2026-05-14",
    modifiedBy: "diego.alvarez@neugain.io",
    modifiedAt: "2026-05-14",
    connectionGroups: [
      {
        title: "Account",
        fields: [
          { label: "Subdomain", value: "neugain.pagerduty.com", mono: true },
          { label: "REST API base URL", value: "https://api.pagerduty.com", mono: true },
          { label: "App name", value: "NeuGAIN Agent" },
          { label: "Team allowlist", value: "SRE, Clinical Ops, SecOps" },
          { label: "Service allowlist", value: "Clinical Integration, Identity, Payments", mono: true },
          { label: "Escalation policy allowlist", value: "EP-Clinical-P1, EP-SRE-P1", mono: true },
          { label: "Urgency filter", value: "high" },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "OAuth 2.0 scoped App token (REST)",
        fields: [
          { label: "Client ID", value: "Pending user consent" },
          { label: "Client secret", value: "Not stored" },
          { label: "Scopes", value: "incidents.read incidents.write services.read schedules.read escalation_policies.read teams.read", mono: true },
        ],
      },
      {
        title: "Events API v2 (routing, separate)",
        hint: "The Events API routing key is not a REST API credential and cannot query incidents.",
        fields: [
          { label: "Service", value: "Clinical Integration Platform" },
          { label: "Integration name", value: "NeuGAIN Agent Events" },
          { label: "Routing key", secret: true, masked: "Not yet generated" },
          { label: "Default severity", value: "warning" },
          { label: "Dedup key strategy", value: "sha256({service_id}:{alert.fingerprint})", mono: true },
        ],
      },
    ],
    scopes: [
      { name: "incidents.read", granted: false, requested: true },
      { name: "incidents.write", granted: false, requested: true, risk: "warn" },
      { name: "services.read", granted: false, requested: true },
      { name: "schedules.read", granted: false, requested: true },
      { name: "escalation_policies.read", granted: false, requested: true },
      { name: "teams.read", granted: false, requested: true },
      { name: "automation_actions", granted: false, requested: false, risk: "high" },
    ],
    events: [
      { interface: "V3 Webhook", eventType: "incident.acknowledged", callback: "https://api.neugain.io/hooks/pd/incident", enabled: false, lastStatus: "Idle" },
      { interface: "V3 Webhook", eventType: "incident.resolved", callback: "https://api.neugain.io/hooks/pd/incident", enabled: false, lastStatus: "Idle" },
    ],
    agentAuthority: defaultAgent("Recommend"),
    validation: [
      { label: "OAuth consent", status: "Pending", detail: "Awaiting admin approval from admin@neugain.pagerduty.com" },
      { label: "GET /abilities", status: "Pending" },
      { label: "GET /services (allowlist)", status: "Pending" },
      { label: "GET /incidents (limit=5)", status: "Pending" },
      { label: "Webhook subscription probe", status: "Pending" },
      { label: "Events API v2 synthetic trigger", status: "Pending", detail: "Requires explicit user confirmation; synthetic incident will be resolved after test." },
    ],
    audit: [{ ts: "2026-05-14 07:00Z", actor: "diego.alvarez@neugain.io", action: "Profile created", result: "OK" }],
  },

  Slack: {
    key: "Slack",
    app: "Slack",
    category: "Collaboration",
    status: "Connected",
    environment: "Production",
    profileName: "slack-neugain-app",
    connectorType: "Slack App · OAuth 2.0 + Events API",
    direction: "Bidirectional",
    agentMode: "Recommend",
    businessOwner: "Priya Raman",
    technicalOwner: "Diego Alvarez",
    supportGroup: "svc-collab",
    dataClassification: "Confidential",
    description: "NeuGAIN Slack App with bot scopes, Events API subscriptions, and Socket Mode disabled in production.",
    lastValidatedAt: "2026-05-14 10:26Z",
    lastSuccessfulAt: "2026-05-14 10:26Z",
    connectorVersion: "2.0.1",
    createdBy: "platform.bootstrap",
    createdAt: "2026-02-20",
    modifiedBy: "diego.alvarez@neugain.io",
    modifiedAt: "2026-05-02",
    connectionGroups: [
      {
        title: "Workspace",
        fields: [
          { label: "Workspace", value: "neugain (T01ABCDEFG)" },
          { label: "Enterprise Grid org", value: "E09HJKL0912" },
          { label: "Slack App ID", value: "A03NEUGAIN01", mono: true },
          { label: "Client ID", value: "1122334455.66778899", mono: true },
          { label: "Approved channels", value: "#ops-bridge, #sec-triage, #clinical-integration", mono: true },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "OAuth 2.0 · Bot installation",
        fields: [
          { label: "Bot token", secret: true, masked: mask("k9m2") },
          { label: "User token", value: "Not used" },
          { label: "App-level token (Socket Mode)", value: "Not enabled in prod" },
          { label: "Signing secret", secret: true, masked: mask("d10a") },
          { label: "Token rotation", value: "Enabled" },
        ],
      },
      {
        title: "Incoming webhook (separate mode)",
        hint: "Incoming webhooks can post messages but cannot read Slack.",
        fields: [
          { label: "Webhook URL", secret: true, masked: "Stored securely" },
          { label: "Default channel", value: "#ops-bridge" },
        ],
      },
    ],
    scopes: [
      { name: "chat:write (bot)", granted: true, requested: true },
      { name: "channels:read (bot)", granted: true, requested: true },
      { name: "channels:history (bot)", granted: true, requested: true },
      { name: "files:read (bot)", granted: true, requested: true },
      { name: "reactions:write (bot)", granted: true, requested: true },
      { name: "users:read (bot)", granted: true, requested: true },
      { name: "commands", granted: true, requested: true, boundary: "/neugain, /investigate" },
      { name: "chat:write.customize", granted: false, requested: false },
      { name: "admin.*", granted: false, requested: false, risk: "high" },
    ],
    events: [
      { interface: "Events API", eventType: "app_mention", callback: "https://api.neugain.io/hooks/slack/events", enabled: true, lastEventAt: "2026-05-14 10:20Z", lastStatus: "OK" },
      { interface: "Events API", eventType: "message.channels (allowlist only)", callback: "https://api.neugain.io/hooks/slack/events", enabled: true, lastEventAt: "2026-05-14 10:24Z", lastStatus: "OK" },
      { interface: "Slash command", eventType: "/investigate", callback: "https://api.neugain.io/hooks/slack/commands", enabled: true, lastEventAt: "2026-05-14 09:33Z", lastStatus: "OK" },
    ],
    eventNotes: ["Signing secret validated on every request. Timestamp replay window = 300s."],
    agentAuthority: defaultAgent("Recommend"),
    validation: [
      { label: "auth.test", status: "Passed", latencyMs: 84, detail: "team=neugain · bot_user=U03NEUGAIN01" },
      { label: "conversations.info (approved channels)", status: "Passed", latencyMs: 106 },
      { label: "Verify request signing (Events API)", status: "Passed", latencyMs: 22 },
      { label: "Socket Mode", status: "Warning", detail: "Not enabled in production (by policy)." },
    ],
    audit: auditBase,
  },

  "Webhook Endpoints": {
    key: "Webhook Endpoints",
    app: "Webhook Endpoints",
    category: "Custom Integrations",
    status: "Not Connected",
    environment: "Production",
    profileName: "webhook-inbound-generic",
    connectorType: "Configurable webhook (inbound)",
    direction: "Inbound",
    agentMode: "Observe",
    businessOwner: "Marcus Chen",
    technicalOwner: "Marcus Chen",
    supportGroup: "svc-integrations",
    dataClassification: "Confidential",
    description: "Generic authenticated webhook endpoint template. No unauthenticated webhooks in Production.",
    lastValidatedAt: "—",
    lastSuccessfulAt: "—",
    connectorVersion: "1.0.0",
    createdBy: "marcus.chen@neugain.io",
    createdAt: "2026-05-10",
    modifiedBy: "marcus.chen@neugain.io",
    modifiedAt: "2026-05-14",
    connectionGroups: [
      {
        title: "Endpoint",
        fields: [
          { label: "Direction", value: "Inbound" },
          { label: "Endpoint URL", value: "https://ingest.neugain.io/hooks/{profile}", mono: true },
          { label: "HTTP method", value: "POST" },
          { label: "Content type", value: "application/json" },
          { label: "Schema", value: "neugain.event.v1" },
          { label: "Max payload size", value: "1 MiB" },
          { label: "Timeout", value: "10s" },
          { label: "Retry policy", value: "5 attempts, exponential backoff (2s, 4s, 8s, 16s, 32s)" },
          { label: "Dead-letter", value: "sqs://neugain-webhook-dlq" },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "Authentication (must select one — 'None' is blocked in Production)",
        fields: [
          { label: "HMAC SHA-256", value: "Selected · header X-NeuGAIN-Signature" },
          { label: "Timestamp header", value: "X-NeuGAIN-Timestamp", mono: true },
          { label: "Event ID header", value: "X-NeuGAIN-Event-Id", mono: true },
          { label: "Timestamp tolerance", value: "300s" },
          { label: "HMAC secret", secret: true, masked: "Not yet generated" },
          { label: "mTLS", value: "Available" },
          { label: "OAuth 2.0 client_credentials", value: "Available" },
          { label: "Signed JWT", value: "Available" },
          { label: "Static bearer token", value: "Available (fallback)" },
        ],
      },
    ],
    scopes: [
      { name: "Source IP allowlist", granted: false, requested: true, boundary: "10.42.0.0/16 (VPC endpoint)" },
      { name: "Replay protection window", granted: true, requested: true, boundary: "300s" },
      { name: "Idempotency-key header required", granted: true, requested: true, boundary: "X-Idempotency-Key" },
      { name: "Schema validation", granted: true, requested: true },
      { name: "Quarantine invalid messages", granted: true, requested: true },
    ],
    events: [],
    agentAuthority: defaultAgent("Observe"),
    validation: [
      { label: "DNS + TLS on endpoint", status: "Pending" },
      { label: "Authentication test (HMAC signature)", status: "Pending" },
      { label: "Timestamp / replay test", status: "Pending" },
      { label: "Schema validation (neugain.event.v1)", status: "Pending" },
      { label: "Idempotency-key test", status: "Pending" },
      { label: "Retry + backoff simulation", status: "Pending" },
      { label: "Dead-letter simulation", status: "Pending" },
    ],
    audit: [{ ts: "2026-05-14 07:20Z", actor: "marcus.chen@neugain.io", action: "Profile created", result: "OK" }],
  },

  SolarWinds: {
    key: "SolarWinds",
    app: "SolarWinds",
    category: "Network & Infra Monitoring",
    status: "In Progress",
    environment: "Production",
    profileName: "solarwinds-platform-orion",
    connectorType: "SolarWinds Platform · SWIS over HTTPS",
    direction: "Inbound",
    agentMode: "Observe",
    businessOwner: "Elena Ruiz",
    technicalOwner: "Marcus Chen",
    supportGroup: "svc-network",
    dataClassification: "Confidential",
    description: "SolarWinds Platform (self-hosted Orion) SWIS integration. SWIS and SolarWinds Observability REST API are separate interfaces.",
    lastValidatedAt: "2026-05-14 09:00Z",
    lastSuccessfulAt: "—",
    connectorVersion: "1.0.0",
    createdBy: "marcus.chen@neugain.io",
    createdAt: "2026-05-08",
    modifiedBy: "marcus.chen@neugain.io",
    modifiedAt: "2026-05-14",
    connectionGroups: [
      {
        title: "SolarWinds Platform server",
        fields: [
          { label: "Product", value: "SolarWinds Platform (Orion self-hosted)" },
          { label: "Server FQDN", value: "orion-prod.neugain.internal", mono: true },
          { label: "SWIS port", value: "17778" },
          { label: "SWIS endpoint", value: "https://orion-prod.neugain.internal:17778/SolarWinds/InformationService/v3/Json/", mono: true },
          { label: "Orion SDK version", value: "2024.2" },
          { label: "TLS validation", value: "Enabled (custom CA 'neugain-root-2025')" },
        ],
      },
      {
        title: "Query bounds",
        fields: [
          { label: "SWQL allowlist", value: "Orion.Nodes, Orion.NPM.Interfaces, Orion.Volumes, Orion.APM.Application, Orion.AlertActive, Orion.Events", mono: true },
          { label: "Node filter", value: "CustomProperties.Environment = 'Prod'", mono: true },
          { label: "SWIS verbs allowed", value: "Query, Read" },
          { label: "SWIS verbs prohibited", value: "Create, Update, Delete, Invoke", mono: true },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "Dedicated SolarWinds account (Basic auth over TLS)",
        fields: [
          { label: "Account", value: "svc_neugain_orion", mono: true },
          { label: "Account rights", value: "Node Management: Read · Report: Read · Alerts: Read" },
          { label: "Password", secret: true, masked: mask("q7v9") },
        ],
      },
    ],
    scopes: [
      { name: "Orion.Nodes (read)", granted: true, requested: true },
      { name: "Orion.NPM.Interfaces (read)", granted: true, requested: true },
      { name: "Orion.Volumes (read)", granted: true, requested: true },
      { name: "Orion.APM.Application (read)", granted: true, requested: true },
      { name: "Orion.AlertActive (read)", granted: true, requested: true },
      { name: "Orion.Events (read)", granted: true, requested: true },
      { name: "Custom properties (read)", granted: true, requested: true },
      { name: "SWIS Invoke", granted: false, requested: false, risk: "high" },
      { name: "Direct Orion SQL database access", granted: false, requested: false, risk: "high", boundary: "Prohibited by policy" },
    ],
    events: [],
    agentAuthority: defaultAgent("Observe"),
    validation: [
      { label: "Resolve SWIS endpoint + TLS", status: "Passed", latencyMs: 66 },
      { label: "Authenticate (Basic over TLS)", status: "Passed", latencyMs: 112 },
      { label: "SWQL: SELECT COUNT(*) FROM Orion.Nodes", status: "Passed", latencyMs: 208, detail: "3,412 nodes" },
      { label: "SWQL: entity Orion.NPM.Interfaces (limit 5)", status: "Passed", latencyMs: 174 },
      { label: "Validate SWIS verb 'Invoke' is refused", status: "Passed", detail: "403 as expected" },
      { label: "Mutating verb probe", status: "Warning", detail: "Skipped — never executed during connection testing." },
    ],
    audit: [{ ts: "2026-05-08 15:22Z", actor: "marcus.chen@neugain.io", action: "Profile created", result: "OK" }],
  },

  Cribl: {
    key: "Cribl",
    app: "Cribl",
    category: "Data Pipeline",
    status: "In Progress",
    environment: "Production",
    profileName: "cribl-cloud-primary",
    connectorType: "Cribl.Cloud Management API (OAuth 2.0 client_credentials)",
    direction: "Bidirectional",
    agentMode: "Recommend",
    businessOwner: "Aiko Tanaka",
    technicalOwner: "Marcus Chen",
    supportGroup: "svc-data-pipeline",
    dataClassification: "Confidential",
    description: "Cribl.Cloud workspace management. Commit and Deploy are separate rights; runtime deployment status is distinct from API success.",
    lastValidatedAt: "2026-05-14 08:20Z",
    lastSuccessfulAt: "—",
    connectorVersion: "1.0.0",
    createdBy: "aiko.tanaka@neugain.io",
    createdAt: "2026-05-05",
    modifiedBy: "marcus.chen@neugain.io",
    modifiedAt: "2026-05-14",
    connectionGroups: [
      {
        title: "Cribl.Cloud workspace",
        fields: [
          { label: "Deployment", value: "Cribl.Cloud" },
          { label: "Organization ID", value: "neugain-prod-org", mono: true },
          { label: "Workspace ID", value: "main", mono: true },
          { label: "Product", value: "Stream" },
          { label: "API base URL", value: "https://main.neugain-prod-org.cribl.cloud/api/v1", mono: true },
          { label: "Bearer token TTL", value: "24h (auto-renew)" },
        ],
      },
      {
        title: "Configuration scope",
        fields: [
          { label: "Worker groups", value: "wg-edge-collectors, wg-siem-fanout", mono: true },
          { label: "Sources", value: "in_splunk_hec_ingest, in_syslog_udp_514", mono: true },
          { label: "Destinations", value: "out_splunk_hec_shc, out_s3_neugain_archive", mono: true },
          { label: "Routes / Pipelines", value: "route-cloudtrail-normalize, pipeline-pii-mask", mono: true },
          { label: "Commit permission", value: "Enabled" },
          { label: "Deploy permission", value: "Disabled (requires approval)" },
        ],
      },
    ],
    authenticationGroups: [
      {
        title: "OAuth 2.0 client credentials",
        fields: [
          { label: "Token URL", value: "https://login.cribl.cloud/oauth/token", mono: true },
          { label: "Audience", value: "https://api.cribl.cloud", mono: true },
          { label: "Client ID", value: "cribl_ci_9f2b…", mono: true },
          { label: "Client secret", secret: true, masked: mask("z4t8") },
        ],
      },
    ],
    scopes: [
      { name: "workergroups:read", granted: true, requested: true },
      { name: "sources:read", granted: true, requested: true },
      { name: "destinations:read", granted: true, requested: true },
      { name: "pipelines:read", granted: true, requested: true },
      { name: "config:write (draft)", granted: true, requested: true, risk: "warn" },
      { name: "commit", granted: true, requested: true, risk: "warn" },
      { name: "deploy", granted: false, requested: true, risk: "high", boundary: "Requires approval via ChangeGate" },
    ],
    events: [
      { interface: "HTTP Source", eventType: "in_splunk_hec_ingest", enabled: true, lastEventAt: "2026-05-14 10:29Z", lastStatus: "OK" },
      { interface: "Destination", eventType: "out_splunk_hec_shc", enabled: true, lastEventAt: "2026-05-14 10:29Z", lastStatus: "OK" },
    ],
    agentAuthority: defaultAgent("Recommend"),
    validation: [
      { label: "POST /oauth/token (client_credentials)", status: "Passed", latencyMs: 288 },
      { label: "GET /organizations/neugain-prod-org", status: "Passed", latencyMs: 92 },
      { label: "GET /workspaces/main/groups", status: "Passed", latencyMs: 141, detail: "2 worker groups" },
      { label: "GET /workspaces/main/pipelines (read)", status: "Passed", latencyMs: 172 },
      { label: "Write probe: draft PUT (no commit)", status: "Passed", latencyMs: 198, detail: "ETag preserved; config unchanged." },
      { label: "commit right", status: "Passed" },
      { label: "deploy right", status: "Failed", detail: "403 forbidden — deploy scope not granted." },
      { label: "Runtime deployment verification", status: "Warning", detail: "API success does not imply runtime deploy — worker fleet last deployed 2026-05-13T18:22Z." },
    ],
    audit: [{ ts: "2026-05-05 11:44Z", actor: "aiko.tanaka@neugain.io", action: "Profile created", result: "OK" }],
  },
};

export const profileKeyByCardName: Record<string, string> = {
  "ServiceNow": "ServiceNow",
  "Datadog": "Datadog",
  "Splunk Enterprise": "Splunk Enterprise",
  "Okta": "Okta",
  "CrowdStrike": "CrowdStrike",
  "Microsoft Azure": "Microsoft Azure",
  "Amazon Web Services": "Amazon Web Services",
  "Jira Software": "Jira Software",
  "CMDB / Asset Inventory": "CMDB / Asset Inventory",
  "PagerDuty": "PagerDuty",
  "Slack": "Slack",
  "Webhook Endpoints": "Webhook Endpoints",
  "SolarWinds": "SolarWinds",
  "Cribl": "Cribl",
};
