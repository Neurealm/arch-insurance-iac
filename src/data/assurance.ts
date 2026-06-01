import {
  Globe, Lock, User, ShieldCheck, Image as ImageIcon, Grid3x3,
  MessageSquare, Pencil, Send, CheckCircle2, KeyRound, Calendar,
  FlaskConical, Receipt, UserCircle, LogOut,
} from "lucide-react";

export type AppItem = {
  id: string;
  name: string;
  sub: string;
  monogram: string;
  bg: string; // tailwind classes for tile bg
  text: string; // tile text color classes
  active: boolean;
};

export const applications: AppItem[] = [
  { id: "epic-mychart",  name: "Epic MyChart",     sub: "Patient Portal",      monogram: "Epic", bg: "bg-red-600",     text: "text-white", active: true },
  { id: "epic-hyper",    name: "Epic Hyperspace",  sub: "Provider EHR",        monogram: "Epic", bg: "bg-red-700",     text: "text-white", active: true },
  { id: "ms365",         name: "Microsoft 365",    sub: "Productivity Suite",  monogram: "M",    bg: "bg-orange-500",  text: "text-white", active: true },
  { id: "salesforce",    name: "Salesforce",       sub: "CRM Platform",        monogram: "SF",   bg: "bg-sky-500",     text: "text-white", active: true },
  { id: "workday",       name: "Workday",          sub: "HCM Platform",        monogram: "W",    bg: "bg-amber-500",   text: "text-white", active: true },
  { id: "servicenow",    name: "ServiceNow",       sub: "IT Service Management", monogram: "now", bg: "bg-emerald-600", text: "text-white", active: true },
];

export type WorkflowItem = {
  id: string;
  name: string;
  sub: string;
  active: boolean;
};

export const workflowsByApp: Record<string, WorkflowItem[]> = {
  "epic-mychart": [
    { id: "patient-login",   name: "Patient Login Health Check", sub: "Login and land on patient dashboard", active: true },
    { id: "appt-scheduling", name: "Appointment Scheduling",     sub: "Schedule a new appointment",          active: true },
    { id: "test-results",    name: "Test Results Retrieval",     sub: "View lab/test results",               active: true },
    { id: "rx-refill",       name: "Prescription Refill",        sub: "Request a prescription refill",       active: true },
    { id: "secure-message",  name: "Secure Message to Provider", sub: "Send a secure message to provider",   active: true },
  ],
};

// 14-step preview / live execution sequence for "Secure Message to Provider"
export type ExecStep = {
  n: number;
  name: string;
  type: string;
  url: string;
  icon: any;
  thoughts: string[];
};

export const executionSteps: ExecStep[] = [
  { n: 1,  name: "Open MyChart.com",                  type: "Web Navigation",  url: "https://www.mychart.com",            icon: Globe,
    thoughts: ["Resolving DNS for mychart.com…", "Opening secure browser session…", "Navigating to landing page…", "✓ Page rendered (200 OK)"] },
  { n: 2,  name: "Select Log In",                     type: "Page Load",       url: "https://www.mychart.com/login",      icon: Lock,
    thoughts: ["Locating Sign In CTA…", "Following login route…", "Awaiting form render…", "✓ Login form detected"] },
  { n: 3,  name: "Enter Username and Password",       type: "Data Entry",      url: "https://www.mychart.com/login",      icon: User,
    thoughts: ["Retrieving PATIENT_SYN_01 from secure vault…", "Typing username at human pace…", "Typing password (masked)…", "✓ Credentials submitted"] },
  { n: 4,  name: "Multi-Factor Authentication",       type: "Auth Check",      url: "https://www.mychart.com/auth/mfa",   icon: ShieldCheck,
    thoughts: ["Analyzing MFA prompt…", "Requesting OTP from synthetic identity broker…", "Inputting secure token…", "✓ MFA challenge passed"] },
  { n: 5,  name: "Load MyChart Dashboard",            type: "Page Load",       url: "https://www.mychart.com/dashboard",  icon: ImageIcon,
    thoughts: ["Awaiting dashboard widgets…", "Validating session cookie…", "Verifying patient banner present…", "✓ Dashboard fully loaded"] },
  { n: 6,  name: "Navigate to Visits",                type: "Menu Navigation", url: "https://www.mychart.com/Visits",     icon: Calendar,
    thoughts: ["Clicking Visits tab in main navigation…", "Loading upcoming appointments…", "Verifying schedule renders…", "✓ Visits page reachable"] },
  { n: 7,  name: "View Test Results",                 type: "Menu Navigation", url: "https://www.mychart.com/test-results", icon: FlaskConical,
    thoughts: ["Opening Test Results module…", "Fetching latest lab panels…", "Validating result table…", "✓ Test results visible"] },
  { n: 8,  name: "View Billing Summary",              type: "Menu Navigation", url: "https://www.mychart.com/billing",    icon: Receipt,
    thoughts: ["Loading billing summary…", "Reconciling outstanding balance…", "Verifying statement render…", "✓ Billing page healthy"] },
  { n: 9,  name: "View Profile",                      type: "Menu Navigation", url: "https://www.mychart.com/profile",    icon: UserCircle,
    thoughts: ["Opening patient profile…", "Loading personal information…", "Validating contact details…", "✓ Profile page healthy"] },
  { n: 10, name: "Navigate to Messages",              type: "Menu Navigation", url: "https://www.mychart.com/messages",   icon: MessageSquare,
    thoughts: ["Routing to /messages…", "Validating inbox connectivity…", "Counting unread items…", "✓ Inbox responsive"] },
  { n: 11, name: "Compose New Message",               type: "Data Entry",      url: "https://www.mychart.com/messages/new", icon: Pencil,
    thoughts: ["Selecting provider recipient…", "Typing subject and body…", "Attaching synthetic context…", "✓ Draft validated"] },
  { n: 12, name: "Send Test Message",                 type: "Action",          url: "https://www.mychart.com/messages/new", icon: Send,
    thoughts: ["Submitting POST /messages…", "Awaiting server acknowledgement…", "Capturing message ID…", "✓ Message accepted"] },
  { n: 13, name: "Confirm Message Sent",              type: "Validation",      url: "https://www.mychart.com/messages/sent", icon: CheckCircle2,
    thoughts: ["Verifying delivered state…", "Cross-checking sent folder…", "Validating timestamp…", "✓ Message confirmed sent"] },
  { n: 14, name: "End Session / Log Out",             type: "Session",         url: "https://www.mychart.com/logout",     icon: LogOut,
    thoughts: ["Initiating sign-out…", "Clearing session cookies…", "Validating logout confirmation…", "✓ Functional health check passed"] },
];

// 14-step authoring sequence shown on the workflow detail page
export const workflowSteps14 = [
  { n: 1,  name: "Open MyChart.com",                       type: "Web Navigation"  },
  { n: 2,  name: "Select Log In",                          type: "Page Load"       },
  { n: 3,  name: "Enter Username",                         type: "Data Entry"      },
  { n: 4,  name: "Enter Password",                         type: "Data Entry"      },
  { n: 5,  name: "Multi-Factor Authentication (if prompted)", type: "Auth Check"   },
  { n: 6,  name: "Load MyChart Dashboard",                 type: "Page Load"       },
  { n: 7,  name: "Navigate to Visits",                     type: "Menu Navigation" },
  { n: 8,  name: "View Test Results",                      type: "Menu Navigation" },
  { n: 9,  name: "View Billing Summary",                   type: "Menu Navigation" },
  { n: 10, name: "View Profile",                           type: "Menu Navigation" },
  { n: 11, name: "Navigate to Messages",                   type: "Menu Navigation" },
  { n: 12, name: "Compose New Message",                    type: "Data Entry"      },
  { n: 13, name: "Send Test Message",                      type: "Action"          },
  { n: 14, name: "Confirm Message Sent",                   type: "Validation"      },
];

export const baseline = {
  realAvg: 142, realP95: 231, realSuccess: 91.8, realFailed: 8.2,
  synthAvg: 88, synthP95: 131, synthSuccess: 99.2, synthFailed: 0.8,
};

export const stepSnapshot = [
  { group: "Authentication (1-5)",    real: 42.6, synth: 23.4, variance: -45.1 },
  { group: "Dashboard Load (6)",      real: 18.7, synth: 12.3, variance: -34.2 },
  { group: "Navigation (7-10)",       real: 37.2, synth: 22.1, variance: -40.6 },
  { group: "Message Workflow (11-14)",real: 43.5, synth: 30.2, variance: -30.6 },
];

export const goals = [
  { label: "Goal: Avg Journey Time",   value: "< 90 sec",  tone: "healthy" as const },
  { label: "Goal: Success Rate",       value: "≥ 95%",     tone: "healthy" as const },
  { label: "P95 Journey Time Threshold", value: "< 150 sec", tone: "muted" as const },
  { label: "Step Failure Threshold",   value: "< 1%",      tone: "muted" as const },
  { label: "Alert Condition",          value: "Breach for 2 consecutive runs", tone: "muted" as const },
  { label: "Measurement Frequency",    value: "Every 15 minutes", tone: "muted" as const },
];

export const riskSignals = [
  { text: "Authentication latency is highest contributor to user delay", level: "Medium" as const },
  { text: "Billing page shows intermittent slowness",                    level: "Medium" as const },
  { text: "Message send failures observed during peak hours",            level: "High"   as const },
  { text: "Overall workflow stability is within acceptable range",       level: "Low"    as const },
];

export const headlineMetrics = {
  realUserAvg: 142,
  syntheticAvg: 88,
  successRate: 96.3,
  trendPct: 11,
  varianceToGoal: -38.7,
};