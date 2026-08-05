/* Shared seed data for the Auto Ticket Categorization digital coworker.
   All pages reuse these arrays so tickets, agents, categories, SLAs, and
   integrations stay consistent across the section. */

export type Priority = "P1" | "P2" | "P3" | "P4";

export const CATEGORIES = [
  "Network / VPN",
  "Email / Collaboration",
  "Access / Permissions",
  "Hardware / Devices",
  "Software / Applications",
  "Performance / System",
  "Collaboration / Teams",
  "Security",
  "Service Requests",
  "Clinical Systems",
] as const;

export const ASSIGNMENT_GROUPS = [
  { id: "AG-001", name: "Service Desk L1", members: 12, avgHandle: "00:18:22", queue: 42 },
  { id: "AG-002", name: "Network Support", members: 6, avgHandle: "00:32:11", queue: 18 },
  { id: "AG-003", name: "Identity and Access", members: 5, avgHandle: "00:24:07", queue: 26 },
  { id: "AG-004", name: "Microsoft 365", members: 4, avgHandle: "00:21:44", queue: 15 },
  { id: "AG-005", name: "Desktop Support", members: 8, avgHandle: "00:26:33", queue: 22 },
  { id: "AG-006", name: "Application Support", members: 7, avgHandle: "00:29:18", queue: 19 },
  { id: "AG-007", name: "Clinical Systems", members: 4, avgHandle: "00:34:52", queue: 8 },
  { id: "AG-008", name: "Security Operations", members: 3, avgHandle: "00:41:07", queue: 4 },
  { id: "AG-009", name: "Endpoint Engineering", members: 4, avgHandle: "00:37:15", queue: 2 },
  { id: "AG-010", name: "Executive Support", members: 2, avgHandle: "00:12:04", queue: 0 },
];

export const BUSINESS_SERVICES = [
  { id: "BS-001", name: "Clinical Messaging", tier: "Tier 1", health: "Degraded", tickets: 84, owner: "Clinical Systems" },
  { id: "BS-002", name: "Corporate Productivity", tier: "Tier 2", health: "Healthy", tickets: 312, owner: "Microsoft 365" },
  { id: "BS-003", name: "Identity and Access", tier: "Tier 1", health: "Warning", tickets: 141, owner: "Identity and Access" },
  { id: "BS-004", name: "Network Connectivity", tier: "Tier 1", health: "Healthy", tickets: 197, owner: "Network Support" },
  { id: "BS-005", name: "Revenue Applications", tier: "Tier 1", health: "Healthy", tickets: 62, owner: "Application Support" },
  { id: "BS-006", name: "Customer Portal", tier: "Tier 2", health: "Warning", tickets: 45, owner: "Application Support" },
  { id: "BS-007", name: "Endpoint Fleet", tier: "Tier 3", health: "Healthy", tickets: 128, owner: "Desktop Support" },
  { id: "BS-008", name: "Security Services", tier: "Tier 1", health: "Healthy", tickets: 31, owner: "Security Operations" },
];

export const AGENTS = [
  { id: "A-01", name: "Jessica Miller", group: "Service Desk L1", status: "Online",  assigned: 18, resolved: 22, reopened: 1, handle: "00:18:32", sla: "98%", role: "Lead" },
  { id: "A-02", name: "Michael Chen",   group: "Service Desk L1", status: "Online",  assigned: 21, resolved: 25, reopened: 0, handle: "00:16:47", sla: "97%", role: "Agent" },
  { id: "A-03", name: "Priya Patel",    group: "Application Support", status: "Online", assigned: 16, resolved: 19, reopened: 2, handle: "00:21:15", sla: "94%", role: "Agent" },
  { id: "A-04", name: "David Johnson",  group: "Network Support", status: "Away",   assigned: 12, resolved: 15, reopened: 1, handle: "00:19:41", sla: "96%", role: "Agent" },
  { id: "A-05", name: "Sarah Williams", group: "Identity and Access", status: "Online", assigned: 17, resolved: 20, reopened: 1, handle: "00:17:58", sla: "99%", role: "Senior" },
  { id: "A-06", name: "Alex Rodriguez", group: "Desktop Support", status: "Busy",   assigned: 22, resolved: 18, reopened: 3, handle: "00:24:11", sla: "89%", role: "Agent" },
  { id: "A-07", name: "Emily Thompson", group: "Microsoft 365", status: "Online",   assigned: 14, resolved: 21, reopened: 0, handle: "00:15:03", sla: "99%", role: "Senior" },
  { id: "A-08", name: "Daniel Kim",     group: "Clinical Systems", status: "Online",assigned: 11, resolved: 12, reopened: 1, handle: "00:28:47", sla: "92%", role: "Agent" },
  { id: "A-09", name: "Olivia Martinez",group: "Service Desk L1", status: "Offline",assigned: 0,  resolved: 0,  reopened: 0, handle: "—",       sla: "—",   role: "Agent" },
  { id: "A-10", name: "James O'Neill",  group: "Security Operations", status: "Online",assigned: 6, resolved: 7, reopened: 0, handle: "00:38:12", sla: "100%", role: "Senior" },
];

export type Ticket = {
  id: string;
  desc: string;
  priority: Priority;
  category: string;
  subcategory: string;
  service: string;
  status: "Auto-Categorized" | "Manual Review" | "In Progress" | "Resolved" | "Escalated";
  confidence: number;
  wait: string;
  agent: string;
  group: string;
  source: "Portal" | "Email" | "Phone" | "Chat" | "Monitoring" | "API";
  created: string;
  slaState: "On Track" | "At Risk" | "Breached";
};

export const TICKETS: Ticket[] = [
  { id: "INC0012358", desc: "VPN connection dropping",             priority: "P2", category: "Network / VPN",           subcategory: "Tunnel drop",       service: "Network Connectivity",    status: "Auto-Categorized", confidence: 96, wait: "00:02:14", agent: "Unassigned",     group: "Network Support",       source: "Portal",     created: "10:22 AM", slaState: "On Track" },
  { id: "INC0012359", desc: "Email not syncing on mobile",         priority: "P3", category: "Email / Collaboration",   subcategory: "ActiveSync",        service: "Corporate Productivity",  status: "Auto-Categorized", confidence: 93, wait: "00:03:45", agent: "Unassigned",     group: "Microsoft 365",         source: "Email",      created: "10:20 AM", slaState: "On Track" },
  { id: "INC0012360", desc: "Cannot access shared drive",          priority: "P2", category: "Access / Permissions",    subcategory: "File share",        service: "Identity and Access",     status: "Manual Review",    confidence: 62, wait: "00:05:22", agent: "—",              group: "Identity and Access",   source: "Portal",     created: "10:18 AM", slaState: "At Risk"  },
  { id: "INC0012361", desc: "Printer not responding",              priority: "P4", category: "Hardware / Devices",      subcategory: "Printer",           service: "Endpoint Fleet",          status: "Auto-Categorized", confidence: 91, wait: "00:06:11", agent: "Unassigned",     group: "Desktop Support",       source: "Phone",      created: "10:17 AM", slaState: "On Track" },
  { id: "INC0012362", desc: "Application error on login",          priority: "P2", category: "Software / Applications", subcategory: "Auth error",        service: "Revenue Applications",    status: "Manual Review",    confidence: 71, wait: "00:07:33", agent: "—",              group: "Application Support",   source: "Portal",     created: "10:15 AM", slaState: "At Risk"  },
  { id: "INC0012363", desc: "Request for software access",         priority: "P3", category: "Access / Permissions",    subcategory: "License",           service: "Corporate Productivity",  status: "Auto-Categorized", confidence: 88, wait: "00:08:41", agent: "Unassigned",     group: "Identity and Access",   source: "Portal",     created: "10:14 AM", slaState: "On Track" },
  { id: "INC0012364", desc: "Slow performance on portal",          priority: "P4", category: "Performance / System",    subcategory: "Latency",           service: "Customer Portal",         status: "Auto-Categorized", confidence: 84, wait: "00:09:18", agent: "Unassigned",     group: "Application Support",   source: "Chat",       created: "10:12 AM", slaState: "On Track" },
  { id: "INC0012365", desc: "Teams unable to join meeting",        priority: "P3", category: "Collaboration / Teams",   subcategory: "Client error",      service: "Corporate Productivity",  status: "Auto-Categorized", confidence: 90, wait: "00:11:02", agent: "Unassigned",     group: "Microsoft 365",         source: "Portal",     created: "10:10 AM", slaState: "On Track" },
  { id: "INC0012366", desc: "Password reset request",              priority: "P4", category: "Access / Permissions",    subcategory: "Password",          service: "Identity and Access",     status: "Auto-Categorized", confidence: 99, wait: "00:00:42", agent: "Emily Thompson", group: "Identity and Access",   source: "Portal",     created: "10:24 AM", slaState: "On Track" },
  { id: "INC0012367", desc: "Clinical interface message delayed",  priority: "P1", category: "Clinical Systems",        subcategory: "HL7 backlog",       service: "Clinical Messaging",      status: "Escalated",        confidence: 82, wait: "00:14:22", agent: "Daniel Kim",     group: "Clinical Systems",      source: "Monitoring", created: "10:08 AM", slaState: "Breached" },
  { id: "INC0012368", desc: "User locked out after MFA change",    priority: "P2", category: "Access / Permissions",    subcategory: "MFA",               service: "Identity and Access",     status: "In Progress",      confidence: 95, wait: "00:03:11", agent: "Sarah Williams", group: "Identity and Access",   source: "Phone",      created: "10:19 AM", slaState: "At Risk"  },
  { id: "INC0012369", desc: "Shared workstation not authenticating", priority: "P3", category: "Hardware / Devices",    subcategory: "Domain join",       service: "Endpoint Fleet",          status: "In Progress",      confidence: 79, wait: "00:04:55", agent: "Alex Rodriguez", group: "Desktop Support",       source: "Portal",     created: "10:16 AM", slaState: "On Track" },
  { id: "INC0012370", desc: "Suspicious login from foreign IP",    priority: "P1", category: "Security",                subcategory: "Impossible travel", service: "Security Services",       status: "In Progress",      confidence: 97, wait: "00:01:12", agent: "James O'Neill",  group: "Security Operations",   source: "Monitoring", created: "10:23 AM", slaState: "On Track" },
  { id: "INC0012371", desc: "Payroll app returns 500 error",       priority: "P1", category: "Software / Applications", subcategory: "Server error",      service: "Revenue Applications",    status: "Escalated",        confidence: 88, wait: "00:22:03", agent: "Priya Patel",    group: "Application Support",   source: "API",        created: "10:02 AM", slaState: "Breached" },
  { id: "INC0012372", desc: "OneDrive sync stuck",                 priority: "P4", category: "Email / Collaboration",   subcategory: "Sync",              service: "Corporate Productivity",  status: "Auto-Categorized", confidence: 87, wait: "00:07:44", agent: "Unassigned",     group: "Microsoft 365",         source: "Email",      created: "10:16 AM", slaState: "On Track" },
];

export const KPIS = [
  { id: "new",    label: "New Tickets",             suffix: "(Today)", value: "342", delta: "12%",  up: true,  sub: "vs yesterday (305)",   spark: [280, 295, 310, 290, 305, 320, 342] },
  { id: "auto",   label: "Auto-Categorized",        suffix: "",        value: "294", ring: 86,      sub: "vs total tickets",     tone: "emerald" as const },
  { id: "manual", label: "Manual Review",           suffix: "",        value: "48",  ring: 14,      sub: "Requires agent review", tone: "amber" as const },
  { id: "time",   label: "Avg. Categorization Time",suffix: "",        value: "2.3", unit: "sec",   delta: "18%", up: false, sub: "vs last 7 days (2.8s)" },
  { id: "acc",    label: "Categorization Accuracy", suffix: "",        value: "94.7",unit: "%",     delta: "3.6%",up: true,  sub: "vs last 7 days (91.1%)" },
  { id: "res",    label: "Tickets Resolved",        suffix: "(Today)", value: "218", delta: "9%",   up: true,  sub: "vs yesterday (200)",   spark: [180, 190, 205, 195, 208, 212, 218] },
];

export const PERF_SERIES = [
  { d: "Jun 3", accuracy: 91, time: 2.9, autoRate: 82 },
  { d: "Jun 4", accuracy: 92, time: 2.8, autoRate: 83 },
  { d: "Jun 5", accuracy: 93, time: 2.6, autoRate: 84 },
  { d: "Jun 6", accuracy: 92, time: 2.7, autoRate: 85 },
  { d: "Jun 7", accuracy: 94, time: 2.4, autoRate: 85 },
  { d: "Jun 8", accuracy: 94, time: 2.3, autoRate: 86 },
  { d: "Jun 9", accuracy: 95, time: 2.3, autoRate: 86 },
];

export const CATEGORY_DIST = [
  { name: "Network / VPN",           value: 5338, pct: 28.6, color: "#4f46e5", group: "Network Support" },
  { name: "Email / Collaboration",   value: 4221, pct: 22.4, color: "#22c55e", group: "Microsoft 365" },
  { name: "Access / Permissions",    value: 3353, pct: 17.8, color: "#f59e0b", group: "Identity and Access" },
  { name: "Hardware / Devices",      value: 2280, pct: 12.1, color: "#0ea5e9", group: "Desktop Support" },
  { name: "Software / Applications", value: 1941, pct: 10.3, color: "#a855f7", group: "Application Support" },
  { name: "Other",                   value: 1659, pct: 8.8,  color: "#94a3b8", group: "Service Desk L1" },
];

export const CONFIDENCE_BUCKETS = [
  { name: "0-20%",   value: 312,   review: 100, correction: 24 },
  { name: "21-40%",  value: 842,   review: 92,  correction: 18 },
  { name: "41-60%",  value: 1926,  review: 74,  correction: 12 },
  { name: "61-80%",  value: 5743,  review: 22,  correction: 5  },
  { name: "81-100%", value: 10019, review: 3,   correction: 1  },
];

export const ALERTS = [
  { id: "AL-1041", time: "10:21 AM", title: "AI Model Performance Degraded",  body: "Accuracy below 90% for 15 min", tone: "warning"  as const, owner: "AI Ops" },
  { id: "AL-1040", time: "10:15 AM", title: "High Ticket Volume Detected",    body: "156 tickets in queue",           tone: "info"     as const, owner: "Service Desk" },
  { id: "AL-1039", time: "10:05 AM", title: "Integration: Email System",       body: "Connection restored",             tone: "resolved" as const, owner: "Integrations" },
  { id: "AL-1038", time: "09:58 AM", title: "SLA Breach Alert",                body: "12 breaches in last 15 min",     tone: "critical" as const, owner: "Service Desk" },
  { id: "AL-1037", time: "09:41 AM", title: "Category Drift: Identity",        body: "Drift score 0.18 (target < 0.10)", tone: "warning" as const, owner: "AI Ops" },
  { id: "AL-1036", time: "09:12 AM", title: "ServiceNow API Latency Elevated", body: "p95 780ms (target < 500ms)",      tone: "warning" as const, owner: "Integrations" },
];

export const SLA_AT_RISK = [
  { id: "INC0012340", pri: "P1", time: "00:14:22", label: "Network Outage",    group: "Network Support",    reason: "Peer engagement pending" },
  { id: "INC0012345", pri: "P2", time: "00:18:47", label: "Email Down",         group: "Microsoft 365",      reason: "Awaiting vendor confirmation" },
  { id: "INC0012351", pri: "P2", time: "00:22:13", label: "VPN Critical",       group: "Network Support",    reason: "Firewall rule review" },
  { id: "INC0012353", pri: "P3", time: "00:29:04", label: "SSO login errors",   group: "Identity and Access",reason: "Reproduction pending" },
  { id: "INC0012355", pri: "P2", time: "00:31:58", label: "Payroll app 500s",   group: "Application Support",reason: "Escalated to L3" },
];

export const MANUAL_REVIEW = [
  { id: "INC0012360", desc: "Cannot access shared drive",       pri: "P2", conf: 62, reason: "Confidence below threshold" },
  { id: "INC0012362", desc: "Application error on login",       pri: "P2", conf: 71, reason: "Multiple categories within tolerance" },
  { id: "INC0012375", desc: "Multiple issues reported",         pri: "P3", conf: 48, reason: "Insufficient description" },
  { id: "INC0012380", desc: "Unclear description",              pri: "P3", conf: 51, reason: "Insufficient description" },
  { id: "INC0012385", desc: "Access request urgent",            pri: "P2", conf: 66, reason: "VIP requester" },
  { id: "INC0012388", desc: "Suspected phishing report",        pri: "P2", conf: 73, reason: "Potential security event" },
  { id: "INC0012390", desc: "New app: 'Kairos Analytics' fails",pri: "P3", conf: 42, reason: "New category pattern detected" },
];

export const INTEGRATIONS = [
  { id: "IN-01", name: "ServiceNow ITSM",         type: "System of Record", status: "Connected",  lastSync: "10:24:12 AM", direction: "Bi-directional", events: 18842, err: 0  },
  { id: "IN-02", name: "Microsoft 365 (Email)",   type: "Ticket Source",    status: "Connected",  lastSync: "10:23:57 AM", direction: "Inbound",        events: 4210,  err: 0  },
  { id: "IN-03", name: "Genesys Cloud (Voice)",   type: "Ticket Source",    status: "Connected",  lastSync: "10:24:04 AM", direction: "Inbound",        events: 1188,  err: 2  },
  { id: "IN-04", name: "Azure AD / Entra",        type: "Identity",         status: "Connected",  lastSync: "10:20:00 AM", direction: "Reference",      events: 2455,  err: 0  },
  { id: "IN-05", name: "CrowdStrike Falcon",      type: "Security Feed",    status: "Connected",  lastSync: "10:23:41 AM", direction: "Inbound",        events: 312,   err: 0  },
  { id: "IN-06", name: "Datadog Monitoring",      type: "Observability",    status: "Connected",  lastSync: "10:24:18 AM", direction: "Inbound",        events: 8802,  err: 0  },
  { id: "IN-07", name: "Confluence Knowledge",    type: "Knowledge",        status: "Degraded",   lastSync: "09:58:07 AM", direction: "Reference",      events: 1044,  err: 14 },
  { id: "IN-08", name: "Slack Notifications",     type: "Communication",    status: "Connected",  lastSync: "10:23:22 AM", direction: "Outbound",       events: 641,   err: 0  },
  { id: "IN-09", name: "Nova AI Gateway",         type: "AI Model",         status: "Connected",  lastSync: "10:24:18 AM", direction: "Reference",      events: 18842, err: 3  },
  { id: "IN-10", name: "Meridian HL7 Bridge",     type: "Clinical",         status: "Degraded",   lastSync: "09:41:12 AM", direction: "Bi-directional", events: 320,   err: 22 },
];

export const CATEGORIZATION_RULES = [
  { id: "R-101", name: "VPN keyword expansion",           category: "Network / VPN",         group: "Network Support",       priority: "P2", enabled: true,  matches: 1204, precision: 97 },
  { id: "R-102", name: "MFA / lockout pattern",           category: "Access / Permissions",  group: "Identity and Access",   priority: "P2", enabled: true,  matches: 812,  precision: 96 },
  { id: "R-103", name: "Password reset intent",           category: "Access / Permissions",  group: "Identity and Access",   priority: "P4", enabled: true,  matches: 2988, precision: 99 },
  { id: "R-104", name: "HL7 clinical interface",          category: "Clinical Systems",      group: "Clinical Systems",      priority: "P1", enabled: true,  matches: 121,  precision: 95 },
  { id: "R-105", name: "Impossible travel signal",        category: "Security",              group: "Security Operations",   priority: "P1", enabled: true,  matches: 47,   precision: 100 },
  { id: "R-106", name: "Printer/plotter routing",         category: "Hardware / Devices",    group: "Desktop Support",       priority: "P4", enabled: true,  matches: 604,  precision: 94 },
  { id: "R-107", name: "Payroll app 5xx",                 category: "Software / Applications",group: "Application Support",  priority: "P1", enabled: true,  matches: 22,   precision: 92 },
  { id: "R-108", name: "Teams call quality",              category: "Collaboration / Teams", group: "Microsoft 365",         priority: "P3", enabled: false, matches: 108,  precision: 88 },
  { id: "R-109", name: "New app allowlist",               category: "Software / Applications",group: "Application Support",  priority: "P3", enabled: true,  matches: 55,   precision: 82 },
  { id: "R-110", name: "Executive VIP intent",            category: "Service Requests",      group: "Executive Support",     priority: "P2", enabled: true,  matches: 34,   precision: 100 },
];

export const CHANGES = [
  { id: "CHG0004411", title: "SSO certificate rotation",         window: "Jun 10, 22:00 – 23:30", risk: "Medium", state: "Approved",  service: "Identity and Access",   owner: "Sarah Williams" },
  { id: "CHG0004412", title: "Datacenter core switch firmware",  window: "Jun 11, 01:00 – 04:00", risk: "High",   state: "Scheduled", service: "Network Connectivity",  owner: "David Johnson" },
  { id: "CHG0004413", title: "Payroll app hotfix 2.14.3",         window: "Jun 12, 18:00 – 19:00", risk: "Low",    state: "Approved",  service: "Revenue Applications",  owner: "Priya Patel" },
  { id: "CHG0004414", title: "HL7 bridge queue tuning",           window: "Jun 12, 22:00 – 23:00", risk: "Medium", state: "Pending",   service: "Clinical Messaging",    owner: "Daniel Kim" },
  { id: "CHG0004415", title: "Endpoint patching wave 24",         window: "Jun 13, 00:00 – 06:00", risk: "Low",    state: "Approved",  service: "Endpoint Fleet",        owner: "Alex Rodriguez" },
  { id: "CHG0004416", title: "M365 tenant policy update",         window: "Jun 14, 12:00 – 13:00", risk: "Medium", state: "Draft",     service: "Corporate Productivity",owner: "Emily Thompson" },
];

export const ON_CALL = [
  { group: "Service Desk L1",       primary: "Jessica Miller",  secondary: "Michael Chen",   escalation: "Ryan Blackwell",  shift: "07:00 – 19:00" },
  { group: "Network Support",       primary: "David Johnson",   secondary: "Priya Patel",    escalation: "Ryan Blackwell",  shift: "07:00 – 19:00" },
  { group: "Identity and Access",   primary: "Sarah Williams",  secondary: "Emily Thompson", escalation: "Ryan Blackwell",  shift: "07:00 – 19:00" },
  { group: "Microsoft 365",         primary: "Emily Thompson",  secondary: "Michael Chen",   escalation: "Ryan Blackwell",  shift: "07:00 – 19:00" },
  { group: "Application Support",   primary: "Priya Patel",     secondary: "Alex Rodriguez", escalation: "Ryan Blackwell",  shift: "07:00 – 19:00" },
  { group: "Clinical Systems",      primary: "Daniel Kim",      secondary: "Priya Patel",    escalation: "Ryan Blackwell",  shift: "07:00 – 19:00" },
  { group: "Security Operations",   primary: "James O'Neill",   secondary: "Sarah Williams", escalation: "Ryan Blackwell",  shift: "24 x 7" },
];

export const KB_ARTICLES = [
  { id: "KB0010211", title: "VPN client troubleshooting playbook", category: "Network / VPN",           views: 3812, useful: 92, updated: "Jun 4, 2026" },
  { id: "KB0010214", title: "Reset password via self-service portal", category: "Access / Permissions", views: 9422, useful: 96, updated: "May 28, 2026" },
  { id: "KB0010219", title: "MFA re-enrollment steps",                category: "Access / Permissions", views: 4211, useful: 94, updated: "Jun 1, 2026" },
  { id: "KB0010222", title: "OneDrive sync stuck – client repair",    category: "Email / Collaboration",views: 2184, useful: 91, updated: "May 22, 2026" },
  { id: "KB0010228", title: "HL7 message replay procedure",           category: "Clinical Systems",     views: 512,  useful: 98, updated: "Jun 6, 2026" },
  { id: "KB0010231", title: "Suspected phishing – triage",            category: "Security",             views: 1024, useful: 97, updated: "Jun 8, 2026" },
  { id: "KB0010234", title: "Payroll app 500 error – known workaround",category:"Software / Applications",views:301,useful: 89, updated: "Jun 9, 2026" },
  { id: "KB0010240", title: "Printer routing – campus map",           category: "Hardware / Devices",   views: 1811, useful: 88, updated: "May 15, 2026" },
];

export const REPORT_CATALOG = [
  { id: "RP-01", name: "Daily Operations Report",           cadence: "Daily",   audience: "Manager",   last: "Jun 9, 08:00" },
  { id: "RP-02", name: "Shift Handoff Report",              cadence: "Shift",   audience: "Leads",     last: "Jun 9, 07:00" },
  { id: "RP-03", name: "Weekly Service Desk Review",        cadence: "Weekly",  audience: "Director",  last: "Jun 8, 17:00" },
  { id: "RP-04", name: "Categorization Quality Report",     cadence: "Weekly",  audience: "AI Ops",    last: "Jun 8, 17:00" },
  { id: "RP-05", name: "SLA Risk Report",                   cadence: "Daily",   audience: "Manager",   last: "Jun 9, 09:00" },
  { id: "RP-06", name: "Agent Workload Report",             cadence: "Daily",   audience: "Manager",   last: "Jun 9, 09:00" },
  { id: "RP-07", name: "AI Performance Report",             cadence: "Weekly",  audience: "AI Ops",    last: "Jun 8, 17:00" },
  { id: "RP-08", name: "Business Value Report",             cadence: "Monthly", audience: "Executive", last: "Jun 1, 09:00" },
];

export const MAJOR_INCIDENTS = [
  { id: "MI-2026-0417", title: "Clinical interface queue saturation", severity: "P1", opened: "Jun 9, 10:08 AM", service: "Clinical Messaging",   commander: "Daniel Kim",   status: "Escalated", impact: "3 hospitals affected", bridge: "Bridge #7 (12 participants)" },
  { id: "MI-2026-0416", title: "Payroll app HTTP 500 wave",           severity: "P1", opened: "Jun 9, 10:02 AM", service: "Revenue Applications", commander: "Priya Patel",  status: "In Progress", impact: "Payroll cycle at risk",  bridge: "Bridge #4 (8 participants)" },
  { id: "MI-2026-0415", title: "SSO login errors (partial)",           severity: "P2", opened: "Jun 9, 09:30 AM", service: "Identity and Access",  commander: "Sarah Williams",status:"In Progress", impact: "12% of sign-ins failing", bridge: "Bridge #3 (5 participants)" },
];

export const ESCALATIONS = [
  { id: "ESC-2231", ticket: "INC0012367", from: "Service Desk L1", to: "Clinical Systems",    reason: "Category confidence + business criticality", at: "10:12 AM", ack: true },
  { id: "ESC-2230", ticket: "INC0012371", from: "Application Support", to: "L3 Engineering", reason: "SLA breach imminent",                          at: "10:10 AM", ack: true },
  { id: "ESC-2229", ticket: "INC0012340", from: "Network Support", to: "Vendor (Cisco TAC)", reason: "Peer engagement required",                     at: "09:57 AM", ack: false },
  { id: "ESC-2228", ticket: "INC0012388", from: "Service Desk L1", to: "Security Operations",reason: "Potential phishing event",                     at: "09:44 AM", ack: true },
  { id: "ESC-2227", ticket: "INC0012355", from: "Application Support", to: "Executive Support",reason:"VIP requester impacted",                       at: "09:30 AM", ack: true },
];
