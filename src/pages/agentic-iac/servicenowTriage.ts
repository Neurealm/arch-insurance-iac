import type { AzureVirtualMachine } from "./azureControlPlane";

export type IntakeAction =
  | "start_vm"
  | "stop_vm"
  | "restart_vm"
  | "resize_vm"
  | "increase_os_disk"
  | "configure_backup"
  | "enable_monitoring"
  | "assess_patches"
  | "create_vm"
  | "unknown";

export type ActionSelection = IntakeAction | "auto";

export type TriageInput = {
  ticketNumber: string;
  requester: string;
  application: string;
  environment: string;
  actionSelection: ActionSelection;
  description: string;
  maintenanceWindow: string;
  businessImpact: string;
  applicationOwner: string;
  rollbackPlan: string;
  selectedVm?: AzureVirtualMachine;
  vms: AzureVirtualMachine[];
};

export type TriageResult = {
  action: IntakeAction;
  actionLabel: string;
  confidence: number;
  confidenceLabel: "High" | "Medium" | "Low";
  reasoning: string;
  extractedTarget: string | null;
  missing: string[];
  conflicts: string[];
  clarificationQuestions: string[];
  readyForEngineering: boolean;
};

const ACTION_LABELS: Record<IntakeAction, string> = {
  start_vm: "Start Azure VM",
  stop_vm: "Stop Azure VM",
  restart_vm: "Restart Azure VM",
  resize_vm: "Change VM size",
  increase_os_disk: "Increase OS disk capacity",
  configure_backup: "Configure Azure Backup",
  enable_monitoring: "Enable Azure Monitor / VM Insights",
  assess_patches: "Run patch assessment",
  create_vm: "Create Azure VM",
  unknown: "Unable to classify request",
};

const ACTION_RULES: Array<{ action: IntakeAction; terms: string[] }> = [
  { action: "restart_vm", terms: ["restart", "reboot", "re-boot", "cycle the vm", "cycle vm"] },
  { action: "start_vm", terms: ["start the vm", "start vm", "power on", "turn on", "boot the vm"] },
  { action: "stop_vm", terms: ["stop the vm", "stop vm", "power off", "turn off", "deallocate"] },
  { action: "resize_vm", terms: ["resize", "vm size", "sku", "scale up", "scale down", "change capacity"] },
  { action: "increase_os_disk", terms: ["os disk", "disk size", "disk capacity", "storage expansion", "expand disk", "increase disk"] },
  { action: "configure_backup", terms: ["backup", "recovery vault", "backup protection"] },
  { action: "enable_monitoring", terms: ["azure monitor", "vm insights", "monitoring", "telemetry", "diagnostics"] },
  { action: "assess_patches", terms: ["patch", "patches", "update manager", "security updates", "updates"] },
  { action: "create_vm", terms: ["create a vm", "create vm", "new vm", "provision a vm", "provision vm", "build a vm"] },
];

function containsTerm(text: string, term: string) {
  return text.includes(term);
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function classify(input: TriageInput): { action: IntakeAction; confidence: number; reasoning: string } {
  if (input.actionSelection !== "auto") {
    return {
      action: input.actionSelection,
      confidence: 100,
      reasoning: "The requested action was explicitly selected by the intake operator.",
    };
  }

  const text = input.description.trim().toLowerCase();
  if (!text) return { action: "unknown", confidence: 0, reasoning: "A request description is required before the agent can classify the ticket." };

  const matches = ACTION_RULES
    .map((rule) => ({ ...rule, hits: rule.terms.filter((term) => containsTerm(text, term)) }))
    .filter((rule) => rule.hits.length > 0)
    .sort((a, b) => b.hits.length - a.hits.length);

  if (!matches.length) return { action: "unknown", confidence: 20, reasoning: "No supported Azure VM operation was found in the request description." };
  if (matches.length > 1 && matches[0].hits.length === matches[1].hits.length) {
    return { action: "unknown", confidence: 35, reasoning: `The request matches multiple operations (${matches.slice(0, 2).map((match) => ACTION_LABELS[match.action]).join(" and ")}).` };
  }

  const winner = matches[0];
  const confidence = winner.hits.length > 1 ? 96 : matches.length > 1 ? 74 : 86;
  return { action: winner.action, confidence, reasoning: `Matched request language: ${winner.hits.map((hit) => `“${hit}”`).join(", ")}.` };
}

function findTarget(input: TriageInput) {
  const text = input.description.toLowerCase();
  return input.vms.find((vm) => text.includes(vm.name.toLowerCase()) || text.includes(vm.id.toLowerCase())) ?? input.selectedVm;
}

function actionRequirements(action: IntakeAction) {
  const required = ["ServiceNow ticket number", "Requester", "Request description", "Maintenance window", "Business impact", "Application owner", "Rollback plan"];
  if (action !== "create_vm") required.push("Target Azure VM");
  if (action === "resize_vm") required.push("Requested VM size in the ticket");
  if (action === "increase_os_disk") required.push("Requested disk capacity in the ticket");
  if (action === "configure_backup") required.push("Recovery objective or backup policy");
  if (action === "create_vm") required.push("Subscription, resource group, region, size, image, and network requirements");
  return required;
}

export function analyzeServiceNowRequest(input: TriageInput): TriageResult {
  const classification = classify(input);
  const target = findTarget(input);
  const text = input.description.trim().toLowerCase();
  const missing: string[] = [];
  const conflicts: string[] = [];

  if (!input.ticketNumber.trim()) missing.push("ServiceNow ticket number");
  if (!input.requester.trim()) missing.push("Requester");
  if (!input.application.trim()) missing.push("Application / service");
  if (!input.environment.trim()) missing.push("Environment");
  if (input.description.trim().length < 10) missing.push("Request description");
  if (!input.maintenanceWindow.trim()) missing.push("Maintenance window");
  if (!input.businessImpact.trim()) missing.push("Business impact");
  if (!input.applicationOwner.trim()) missing.push("Application owner");
  if (input.rollbackPlan.trim().length < 10) missing.push("Rollback plan");
  if (classification.action !== "create_vm" && !input.selectedVm) missing.push("Target Azure VM confirmation");
  if (classification.action === "unknown") missing.push("Supported Azure VM action");

  if (["resize_vm", "increase_os_disk"].includes(classification.action) && !/\b\d+\s*(gb|tb|v?cpu|core|cores)\b|standard_[a-z0-9_]+/i.test(text)) {
    missing.push(classification.action === "resize_vm" ? "Requested VM size in the ticket" : "Requested disk capacity in the ticket");
  }
  if (classification.action === "configure_backup" && !/\b(rpo|rto|hour|daily|weekly|retention|backup policy)\b/i.test(text)) missing.push("Recovery objective or backup policy");
  if (classification.action === "create_vm" && !/\b(subscription|resource group|region|eastus|westus|size|sku|image|subnet|network)\b/i.test(text)) missing.push("Resource group ARM ID, subnet ARM ID, region, VM names, size, admin username, SSH public key and OS image publisher/offer/SKU/version");

  if (target && classification.action === "start_vm" && /running/i.test(target.powerState)) conflicts.push("The selected VM is already running; confirm that a start operation is still required.");
  if (target && classification.action === "stop_vm" && !/running/i.test(target.powerState)) conflicts.push("The selected VM is not running; confirm that a stop operation is required.");
  if (target && classification.action === "restart_vm" && !/running/i.test(target.powerState)) conflicts.push("Restart normally requires a running VM; confirm the requested state or use Start Azure VM.");

  const clarificationQuestions = unique([
    ...missing.map((field) => `Please provide ${field.toLowerCase()}.`),
    ...conflicts.map((conflict) => `Please resolve this validation issue: ${conflict}`),
  ]);

  const confidenceLabel = classification.confidence >= 85 ? "High" : classification.confidence >= 60 ? "Medium" : "Low";
  return {
    action: classification.action,
    actionLabel: ACTION_LABELS[classification.action],
    confidence: classification.confidence,
    confidenceLabel,
    reasoning: classification.reasoning,
    extractedTarget: target?.name ?? null,
    missing: unique(missing),
    conflicts: unique(conflicts),
    clarificationQuestions,
    // create_vm is no longer permanently excluded: it is an approved
    // capability now, and the authoritative decision is made server-side in
    // servicenow-intake against the capability catalog. This browser-side
    // preview must agree with it or the console contradicts the ticket.
    readyForEngineering: classification.action !== "unknown" && missing.length === 0 && conflicts.length === 0,
  };
}

export function buildClarificationNote(ticketNumber: string, result: TriageResult) {
  const heading = `Infrastructure intake review for ${ticketNumber || "this request"}`;
  if (!result.missing.length && !result.conflicts.length) return `${heading}\n\nThe request is complete for initial infrastructure review. The platform will enrich the target from Azure and route it to Change Engineering for approval.`;
  return [
    heading,
    "",
    "The request cannot move to infrastructure engineering yet. Please update the ticket with:",
    ...result.clarificationQuestions.map((question) => `- ${question}`),
    "",
    `Detected request type: ${result.actionLabel} (${result.confidenceLabel} confidence, ${result.confidence}%).`,
    "No Azure action was performed by this analysis.",
  ].join("\n");
}

export function requiredFieldsForAction(action: IntakeAction) {
  return actionRequirements(action);
}

export const intakeActionLabels = ACTION_LABELS;
