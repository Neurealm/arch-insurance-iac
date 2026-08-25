/**
 * Operational Workflow Overview — canonical mock estate.
 *
 * Models direct customer commerce (Direct Marketplace -> Commercial Order ->
 * Entitlement) with Microsoft Lifter fulfillment obligations satisfied
 * automatically downstream, followed by Azure authorization, provisioning,
 * active service and metering/billing.
 *
 * Lifter fulfillment is never bypassed — it is orchestrated behind the scenes.
 */

export type StageId =
  | "order"
  | "entitlement"
  | "lifterSubmit"
  | "lifterConfirm"
  | "azureAuth"
  | "provision"
  | "active";

export type StageState = "complete" | "inProgress" | "pending" | "failed" | "waiting";

export type ExceptionCategory =
  | "Invalid Subscription"
  | "Quota / Capacity"
  | "SKU Mapping Error"
  | "API Timeout"
  | "Permission Error"
  | "Lifter Confirmation Timeout";

export type TxnHealth =
  | "Healthy"
  | "Processing"
  | "Pending Lifter Confirmation"
  | "Lifter API Failure"
  | "SKU Mapping Error"
  | "Entitlement Failure"
  | "Azure Authorization Failure"
  | "Provisioning Failure"
  | "Reconciliation Mismatch"
  | "Completed";

export interface StageEvent {
  stage: StageId;
  state: StageState;
  at?: string;
  /** seconds spent in this stage */
  durationSec?: number;
  note?: string;
}

export interface Txn {
  id: string;
  customer: string;
  customerId: string;
  product: string;
  sku: string;
  lifterPlan: string;
  arr: number;
  capacityTb: number;
  region: string;
  tenantId: string;
  subscriptionId: string;
  entitlementId: string;
  licenseId?: string;
  deploymentId?: string;
  meteringId?: string;
  health: TxnHealth;
  /** current stage the transaction sits at */
  stage: StageId;
  stalledMinutes: number;
  revenueAtRisk: number;
  exception?: {
    category: ExceptionCategory;
    stage: StageId;
    whatHappened: string;
    customerExperience: string;
    customerImpact: string;
    rootCause: string;
    remediation: string;
    automationConfidence: number;
    humanApproval: boolean;
    evidence: { label: string; value: string }[];
  };
  reconciliation: {
    commercialOrder: string;
    internalEntitlement: string;
    lifterEntitlement: string;
    azureDeployment: string;
    metering: string;
    billing: string;
    verdict: "MATCH" | "MISMATCH" | "CRITICAL MISMATCH" | "CAPACITY MISMATCH";
  };
  events: StageEvent[];
}

export const STAGE_ORDER: StageId[] = [
  "order", "entitlement", "lifterSubmit", "lifterConfirm", "azureAuth", "provision", "active",
];

export const STAGE_LABEL: Record<StageId, string> = {
  order: "Order Received",
  entitlement: "Entitlement Created",
  lifterSubmit: "Submitted to Lifter",
  lifterConfirm: "Lifter Confirmed",
  azureAuth: "Azure Authorized",
  provision: "Provisioned",
  active: "Active & Monitored",
};

export const STAGE_DESCRIPTION: Record<StageId, string> = {
  order: "Customer places order through Direct Marketplace",
  entitlement: "Canonical customer entitlement created and validated",
  lifterSubmit: "Entitlement translated and submitted to Lifter",
  lifterConfirm: "Lifter confirms entitlement and fulfillment state",
  azureAuth: "Azure validates entitlement and deployment eligibility",
  provision: "Resources deployed into customer's Azure environment",
  active: "Service active, metered, monitored and commercially reconciled",
};

/** Baseline stage counters for the selected period (Last 24 Hours). */
export interface StageCounters {
  primary: number;
  primaryLabel: string;
  secondary: number;
  secondaryLabel: string;
  avgTime: string;
}

export const BASE_COUNTERS: Record<StageId, StageCounters> = {
  order: { primary: 128, primaryLabel: "Received", secondary: 0, secondaryLabel: "Failed", avgTime: "18 sec" },
  entitlement: { primary: 127, primaryLabel: "Created", secondary: 1, secondaryLabel: "Failed", avgTime: "32 sec" },
  lifterSubmit: { primary: 124, primaryLabel: "Submitted", secondary: 4, secondaryLabel: "Failed", avgTime: "1.2 min" },
  lifterConfirm: { primary: 119, primaryLabel: "Confirmed", secondary: 5, secondaryLabel: "Pending", avgTime: "2.6 min" },
  azureAuth: { primary: 117, primaryLabel: "Authorized", secondary: 2, secondaryLabel: "Failed", avgTime: "1.1 min" },
  provision: { primary: 115, primaryLabel: "Completed", secondary: 2, secondaryLabel: "Failed", avgTime: "4.8 min" },
  active: { primary: 115, primaryLabel: "Active", secondary: 0, secondaryLabel: "Issues", avgTime: "—" },
};

/** Data exchanged between stages, surfaced by the Data Flow view. */
export const STAGE_PAYLOAD: Record<StageId, string[]> = {
  order: ["Order ID", "Customer ID", "Tenant ID", "SKU"],
  entitlement: ["Entitlement ID", "Subscription ID", "Capacity", "Term"],
  lifterSubmit: ["Lifter Plan", "Offer ID", "Quantity", "Entitlement ID"],
  lifterConfirm: ["License ID", "Fulfillment State", "Plan Version"],
  azureAuth: ["Tenant ID", "Subscription ID", "Role Assignment", "Eligibility Token"],
  provision: ["Deployment ID", "Resource Group", "Region", "Capacity"],
  active: ["Metering ID", "Usage Stream", "Billing Account"],
};

const evt = (stage: StageId, state: StageState, at?: string, durationSec?: number, note?: string): StageEvent =>
  ({ stage, state, at, durationSec, note });

/** Standard fully-healthy journey generator. */
function healthyEvents(base: string): StageEvent[] {
  const [h, m] = base.split(":").map(Number);
  const start = h * 3600 + m * 60;
  const offsets = [0, 32, 59, 214, 280, 568, 590];
  const fmt = (s: number) =>
    `${String(Math.floor(s / 3600) % 24).padStart(2, "0")}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return STAGE_ORDER.map((stage, i) =>
    evt(stage, "complete", fmt(start + offsets[i]), i === 0 ? 18 : offsets[i] - offsets[i - 1]),
  );
}

function partialEvents(upTo: number, base: string, failStage?: StageId, failNote?: string): StageEvent[] {
  const all = healthyEvents(base);
  return STAGE_ORDER.map((stage, i) => {
    if (i < upTo) return all[i];
    if (stage === failStage) return { ...all[i], state: "failed", note: failNote };
    if (i === upTo) return evt(stage, "waiting", undefined, undefined, "Waiting");
    return evt(stage, "waiting");
  });
}

const match = (extra?: Partial<Txn["reconciliation"]>): Txn["reconciliation"] => ({
  commercialOrder: "Active",
  internalEntitlement: "Active",
  lifterEntitlement: "Active",
  azureDeployment: "Active",
  metering: "Streaming",
  billing: "Invoiced",
  verdict: "MATCH",
  ...extra,
});

export const transactions: Txn[] = [
  {
    id: "ORD-42891",
    customer: "Northstar Health", customerId: "CUST-40128",
    product: "Enterprise Cloud Storage", sku: "ENT-500TB", lifterPlan: "lifter-ent-storage-500",
    arr: 186_000, capacityTb: 500, region: "East US 2",
    tenantId: "3f9a2c71-6b18-4d21-9a77-118c41e0b8c4",
    subscriptionId: "a71c9d02-4411-45ba-9f3e-70cc21d9b310",
    entitlementId: "ENT-2026-8841",
    licenseId: "LIC-MS-772104",
    health: "Azure Authorization Failure", stage: "azureAuth",
    stalledMinutes: 32, revenueAtRisk: 186_000,
    exception: {
      category: "Permission Error", stage: "azureAuth",
      whatHappened: "Azure rejected the deployment authorization request with HTTP 403 (AuthorizationFailed).",
      customerExperience: "Customer sees the order as confirmed but the environment has not appeared in their Azure subscription.",
      customerImpact: "Customer cannot proceed with deployment until Azure subscription authorization succeeds.",
      rootCause: "Service principal does not have required permissions within the target Azure subscription.",
      remediation: "Grant the required role assignment to the deployment service principal and retry Azure authorization.",
      automationConfidence: 94, humanApproval: false,
      evidence: [
        { label: "Tenant ID", value: "3f9a2c71-6b18-4d21-9a77-118c41e0b8c4" },
        { label: "Subscription ID", value: "a71c9d02-4411-45ba-9f3e-70cc21d9b310" },
        { label: "API response", value: "AuthorizationFailed: client does not have authorization to perform action 'Microsoft.Resources/deployments/write'" },
        { label: "HTTP response code", value: "403 Forbidden" },
        { label: "Trace ID", value: "trace-8f21ac09b7" },
        { label: "Timestamp", value: "09:45:12 UTC" },
      ],
    },
    reconciliation: match({ azureDeployment: "Not deployed", metering: "Not started", billing: "Pending", verdict: "MISMATCH" }),
    events: [
      evt("order", "complete", "09:41:02", 18),
      evt("entitlement", "complete", "09:41:34", 32),
      evt("lifterSubmit", "complete", "09:42:01", 27),
      evt("lifterConfirm", "complete", "09:44:36", 155),
      evt("azureAuth", "failed", "09:45:12", 36, "AuthorizationFailed (403)"),
      evt("provision", "waiting"),
      evt("active", "waiting"),
    ],
  },
  {
    id: "ORD-42902",
    customer: "Meridian Financial", customerId: "CUST-40219",
    product: "Data Intelligence Platform", sku: "ANQ-ENT-500TB", lifterPlan: "unmapped",
    arr: 126_000, capacityTb: 500, region: "West Europe",
    tenantId: "b120f8ac-91d4-4a11-a9c2-52dd41f70a12",
    subscriptionId: "cc31de70-9a12-4b0c-b3aa-1189f7a20c55",
    entitlementId: "ENT-2026-8846",
    health: "SKU Mapping Error", stage: "lifterSubmit",
    stalledMinutes: 61, revenueAtRisk: 126_000,
    exception: {
      category: "SKU Mapping Error", stage: "lifterSubmit",
      whatHappened: "Internal SKU ANQ-ENT-500TB has no active mapping to a Lifter fulfillment plan, so the submission was rejected.",
      customerExperience: "Order shows as accepted; fulfillment has not progressed and no deployment invitation has been issued.",
      customerImpact: "Customer's entitlement cannot be fulfilled through Lifter until the catalog mapping is corrected.",
      rootCause: "Catalog entry ANQ-ENT-500TB was published without a corresponding Lifter plan binding after the Q3 SKU rename.",
      remediation: "Bind ANQ-ENT-500TB to Lifter plan lifter-ent-analytics-500 and resubmit the entitlement.",
      automationConfidence: 91, humanApproval: false,
      evidence: [
        { label: "Internal SKU", value: "ANQ-ENT-500TB (Data Intelligence Platform, 500 TB)" },
        { label: "Expected Lifter plan", value: "lifter-ent-analytics-500" },
        { label: "Resolved Lifter plan", value: "null" },
        { label: "API response", value: "PlanNotFound: no fulfillment plan resolved for offer binding" },
        { label: "HTTP response code", value: "422 Unprocessable Entity" },
        { label: "Trace ID", value: "trace-11c7de4420" },
        { label: "Timestamp", value: "08:52:41 UTC" },
      ],
    },
    reconciliation: match({ lifterEntitlement: "Missing", azureDeployment: "Not deployed", metering: "Not started", billing: "Pending", verdict: "MISMATCH" }),
    events: partialEvents(2, "08:51", "lifterSubmit", "PlanNotFound (422)"),
  },
  {
    id: "ORD-42877",
    customer: "Apex Manufacturing", customerId: "CUST-40077",
    product: "Industrial Telemetry Suite", sku: "IND-TEL-250", lifterPlan: "lifter-ind-telemetry-250",
    arr: 98_500, capacityTb: 250, region: "Central US",
    tenantId: "77aa1b02-3e5f-4c88-9d61-2b03cc19f004",
    subscriptionId: "3f7b21aa-0c14-4d99-8ac1-77e5b1220ff9",
    entitlementId: "ENT-2026-8830",
    health: "Lifter API Failure", stage: "lifterSubmit",
    stalledMinutes: 18, revenueAtRisk: 98_500,
    exception: {
      category: "API Timeout", stage: "lifterSubmit",
      whatHappened: "Lifter fulfillment API did not respond within the 30 second submission window; the request is queued for retry.",
      customerExperience: "No visible change yet — the order remains in fulfillment processing.",
      customerImpact: "Fulfillment confirmation is delayed; deployment cannot start until Lifter accepts the submission.",
      rootCause: "Elevated latency on the Lifter marketplace API (p95 at 4.2s, timeouts above threshold).",
      remediation: "Resubmit through the retry queue with exponential backoff; escalate if the third attempt fails.",
      automationConfidence: 88, humanApproval: false,
      evidence: [
        { label: "Tenant ID", value: "77aa1b02-3e5f-4c88-9d61-2b03cc19f004" },
        { label: "API response", value: "GatewayTimeout: upstream fulfillment service did not respond" },
        { label: "HTTP response code", value: "504 Gateway Timeout" },
        { label: "Retry attempt", value: "2 of 5" },
        { label: "Trace ID", value: "trace-9a02b71cc3" },
        { label: "Timestamp", value: "09:58:22 UTC" },
      ],
    },
    reconciliation: match({ lifterEntitlement: "Pending", azureDeployment: "Not deployed", metering: "Not started", billing: "Pending", verdict: "MISMATCH" }),
    events: partialEvents(2, "09:56", "lifterSubmit", "GatewayTimeout (504)"),
  },
  {
    id: "ORD-42868",
    customer: "Horizon Energy", customerId: "CUST-40044",
    product: "Grid Analytics", sku: "GRD-AN-1PB", lifterPlan: "lifter-grid-analytics-1pb",
    arr: 240_000, capacityTb: 1000, region: "North Europe",
    tenantId: "58c1d9e0-77b2-4a35-8811-9f2b7c0341aa",
    subscriptionId: "de91f3c8-2211-4a70-8de3-40ba91cc7712",
    entitlementId: "ENT-2026-8812", licenseId: "LIC-MS-771988",
    health: "Pending Lifter Confirmation", stage: "lifterConfirm",
    stalledMinutes: 24, revenueAtRisk: 0,
    exception: {
      category: "Lifter Confirmation Timeout", stage: "lifterConfirm",
      whatHappened: "Lifter accepted the submission but has not returned a fulfillment confirmation within the expected 5 minute SLA.",
      customerExperience: "Customer sees fulfillment in progress; no error is surfaced to them.",
      customerImpact: "Deployment eligibility cannot be established until Lifter confirms the entitlement.",
      rootCause: "Lifter confirmation callbacks are running behind due to marketplace-side processing latency.",
      remediation: "Poll the Lifter fulfillment status endpoint directly and reconcile the confirmation state.",
      automationConfidence: 82, humanApproval: false,
      evidence: [
        { label: "Entitlement ID", value: "ENT-2026-8812" },
        { label: "Lifter plan", value: "lifter-grid-analytics-1pb" },
        { label: "API response", value: "Status: PendingFulfillmentConfirmation" },
        { label: "HTTP response code", value: "202 Accepted" },
        { label: "Trace ID", value: "trace-4471bb90ea" },
        { label: "Timestamp", value: "09:34:08 UTC" },
      ],
    },
    reconciliation: match({ lifterEntitlement: "Pending confirmation", azureDeployment: "Not deployed", metering: "Not started", billing: "Pending", verdict: "MISMATCH" }),
    events: partialEvents(3, "09:30"),
  },
  {
    id: "ORD-42860",
    customer: "Atlas Retail", customerId: "CUST-40166",
    product: "Commerce Data Lake", sku: "CDL-ENT-750", lifterPlan: "lifter-commerce-lake-750",
    arr: 164_000, capacityTb: 750, region: "East US",
    tenantId: "9911acbf-4d02-4bb1-9c0e-51ff7b98a201",
    subscriptionId: "70dd1122-88fa-4a03-9931-0b71cd45ee10",
    entitlementId: "ENT-2026-8805", licenseId: "LIC-MS-771904",
    health: "Provisioning Failure", stage: "provision",
    stalledMinutes: 47, revenueAtRisk: 164_000,
    exception: {
      category: "Quota / Capacity", stage: "provision",
      whatHappened: "Deployment failed because the customer subscription does not have sufficient regional storage quota.",
      customerExperience: "Customer's environment is partially created and shows as still deploying.",
      customerImpact: "Customer cannot use the purchased capacity until quota is increased in East US.",
      rootCause: "Requested 750 TB exceeds remaining subscription quota of 512 TB in East US.",
      remediation: "Raise an Azure quota increase request for the subscription and re-run the deployment.",
      automationConfidence: 68, humanApproval: true,
      evidence: [
        { label: "Subscription ID", value: "70dd1122-88fa-4a03-9931-0b71cd45ee10" },
        { label: "Requested capacity", value: "750 TB" },
        { label: "Remaining quota", value: "512 TB (East US)" },
        { label: "API response", value: "QuotaExceeded: operation could not be completed as it results in exceeding approved quota" },
        { label: "HTTP response code", value: "409 Conflict" },
        { label: "Trace ID", value: "trace-6620ffa118" },
        { label: "Timestamp", value: "09:12:55 UTC" },
      ],
    },
    reconciliation: match({ azureDeployment: "Partial", metering: "Not started", billing: "Pending", verdict: "MISMATCH" }),
    events: partialEvents(5, "08:59", "provision", "QuotaExceeded (409)"),
  },
  {
    id: "ORD-42855",
    customer: "Summit Insurance", customerId: "CUST-40311",
    product: "Claims Intelligence", sku: "CLM-INT-300", lifterPlan: "lifter-claims-intel-300",
    arr: 112_000, capacityTb: 300, region: "West US 2",
    tenantId: "2200bd11-7a44-4dc3-9821-fe0032aa1188",
    subscriptionId: "18ce4477-b201-4e6a-9c00-aa71bb220e31",
    entitlementId: "ENT-2026-8798",
    health: "Reconciliation Mismatch", stage: "active",
    stalledMinutes: 0, revenueAtRisk: 0,
    reconciliation: {
      commercialOrder: "Active", internalEntitlement: "Active", lifterEntitlement: "Active",
      azureDeployment: "Active", metering: "Streaming", billing: "Invoiced",
      verdict: "CAPACITY MISMATCH",
    },
    events: healthyEvents("07:22"),
  },
  {
    id: "ORD-42849",
    customer: "Vertex Logistics", customerId: "CUST-40208",
    product: "Fleet Telemetry", sku: "FLT-TEL-120", lifterPlan: "lifter-fleet-telemetry-120",
    arr: 74_000, capacityTb: 120, region: "Central US",
    tenantId: "4a0b7712-1f39-4bb0-a9d1-77c211ee0034",
    subscriptionId: "5511aabb-3c22-4b1d-8f22-99ee11cc7700",
    entitlementId: "ENT-2026-8781",
    health: "Azure Authorization Failure", stage: "azureAuth",
    stalledMinutes: 12, revenueAtRisk: 74_000,
    exception: {
      category: "Invalid Subscription", stage: "azureAuth",
      whatHappened: "The target Azure subscription is disabled, so deployment eligibility could not be established.",
      customerExperience: "Customer has completed purchase but cannot start deployment.",
      customerImpact: "No deployment can occur until the customer re-enables or nominates a valid subscription.",
      rootCause: "Subscription state is 'Disabled' following a customer-side billing suspension.",
      remediation: "Contact the customer to nominate an active subscription, then re-run Azure authorization.",
      automationConfidence: 41, humanApproval: true,
      evidence: [
        { label: "Subscription ID", value: "5511aabb-3c22-4b1d-8f22-99ee11cc7700" },
        { label: "Subscription state", value: "Disabled" },
        { label: "API response", value: "SubscriptionNotFound: subscription is not in an enabled state" },
        { label: "HTTP response code", value: "400 Bad Request" },
        { label: "Trace ID", value: "trace-330fa17cd2" },
        { label: "Timestamp", value: "10:04:19 UTC" },
      ],
    },
    reconciliation: match({ azureDeployment: "Not deployed", metering: "Not started", billing: "Pending", verdict: "MISMATCH" }),
    events: partialEvents(4, "09:56", "azureAuth", "SubscriptionNotFound (400)"),
  },
  {
    id: "ORD-42841",
    customer: "Evergreen Medical", customerId: "CUST-40402",
    product: "Clinical Data Exchange", sku: "CDX-ENT-400", lifterPlan: "lifter-clinical-exchange-400",
    arr: 132_000, capacityTb: 400, region: "East US 2",
    tenantId: "6612ffab-2210-4c0a-9911-88ad220e0011",
    subscriptionId: "aa03be77-1122-4c31-8fe0-7711ac902200",
    entitlementId: "ENT-2026-8770",
    health: "Entitlement Failure", stage: "entitlement",
    stalledMinutes: 9, revenueAtRisk: 132_000,
    exception: {
      category: "Invalid Subscription", stage: "entitlement",
      whatHappened: "Entitlement validation failed because the supplied subscription identifier does not belong to the customer tenant.",
      customerExperience: "Order is accepted but the entitlement has not been issued.",
      customerImpact: "Fulfillment cannot begin until the correct subscription is associated with the order.",
      rootCause: "Subscription/tenant pairing mismatch captured during checkout.",
      remediation: "Correct the subscription association on the order and re-run entitlement creation.",
      automationConfidence: 76, humanApproval: false,
      evidence: [
        { label: "Tenant ID", value: "6612ffab-2210-4c0a-9911-88ad220e0011" },
        { label: "Subscription ID", value: "aa03be77-1122-4c31-8fe0-7711ac902200" },
        { label: "API response", value: "TenantSubscriptionMismatch" },
        { label: "HTTP response code", value: "409 Conflict" },
        { label: "Trace ID", value: "trace-77b1c30a91" },
        { label: "Timestamp", value: "10:07:44 UTC" },
      ],
    },
    reconciliation: match({ internalEntitlement: "Not created", lifterEntitlement: "Missing", azureDeployment: "Not deployed", metering: "Not started", billing: "Pending", verdict: "MISMATCH" }),
    events: partialEvents(1, "10:06", "entitlement", "TenantSubscriptionMismatch (409)"),
  },
  {
    id: "ORD-42836",
    customer: "Pioneer Bank", customerId: "CUST-40155",
    product: "Risk Modelling Suite", sku: "RSK-MOD-600", lifterPlan: "lifter-risk-model-600",
    arr: 208_000, capacityTb: 600, region: "West Europe",
    tenantId: "1d9a4400-cc11-4d55-8802-aa9911002200",
    subscriptionId: "8f22ee11-4a03-4bb2-9010-cc4411220099",
    entitlementId: "ENT-2026-8762", licenseId: "LIC-MS-771802",
    health: "Pending Lifter Confirmation", stage: "lifterConfirm",
    stalledMinutes: 7, revenueAtRisk: 0,
    reconciliation: match({ lifterEntitlement: "Pending confirmation", azureDeployment: "Not deployed", metering: "Not started", billing: "Pending", verdict: "MISMATCH" }),
    events: partialEvents(3, "10:02"),
  },
  {
    id: "ORD-42830",
    customer: "Sterling Industries", customerId: "CUST-40099",
    product: "Enterprise Cloud Storage", sku: "ENT-250TB", lifterPlan: "lifter-ent-storage-250",
    arr: 96_000, capacityTb: 250, region: "Central US",
    tenantId: "70bb1122-9911-4a0c-8dd1-002200aa1133",
    subscriptionId: "44cc0011-77aa-4b12-9e30-1102bb445500",
    entitlementId: "ENT-2026-8755", licenseId: "LIC-MS-771744",
    deploymentId: "DEP-2026-3391", meteringId: "MTR-88120",
    health: "Completed", stage: "active", stalledMinutes: 0, revenueAtRisk: 0,
    reconciliation: match(), events: healthyEvents("06:14"),
  },
  {
    id: "ORD-42824", customer: "Northstar Health", customerId: "CUST-40128",
    product: "Clinical Data Exchange", sku: "CDX-ENT-200", lifterPlan: "lifter-clinical-exchange-200",
    arr: 88_000, capacityTb: 200, region: "East US 2",
    tenantId: "3f9a2c71-6b18-4d21-9a77-118c41e0b8c4",
    subscriptionId: "a71c9d02-4411-45ba-9f3e-70cc21d9b310",
    entitlementId: "ENT-2026-8749", licenseId: "LIC-MS-771700",
    deploymentId: "DEP-2026-3385", meteringId: "MTR-88114",
    health: "Completed", stage: "active", stalledMinutes: 0, revenueAtRisk: 0,
    reconciliation: match(), events: healthyEvents("05:41"),
  },
  {
    id: "ORD-42818", customer: "Meridian Financial", customerId: "CUST-40219",
    product: "Risk Modelling Suite", sku: "RSK-MOD-300", lifterPlan: "lifter-risk-model-300",
    arr: 118_000, capacityTb: 300, region: "West Europe",
    tenantId: "b120f8ac-91d4-4a11-a9c2-52dd41f70a12",
    subscriptionId: "cc31de70-9a12-4b0c-b3aa-1189f7a20c55",
    entitlementId: "ENT-2026-8742", licenseId: "LIC-MS-771688",
    deploymentId: "DEP-2026-3380", meteringId: "MTR-88109",
    health: "Completed", stage: "active", stalledMinutes: 0, revenueAtRisk: 0,
    reconciliation: match(), events: healthyEvents("05:02"),
  },
  {
    id: "ORD-42812", customer: "Horizon Energy", customerId: "CUST-40044",
    product: "Grid Analytics", sku: "GRD-AN-500", lifterPlan: "lifter-grid-analytics-500",
    arr: 142_000, capacityTb: 500, region: "North Europe",
    tenantId: "58c1d9e0-77b2-4a35-8811-9f2b7c0341aa",
    subscriptionId: "de91f3c8-2211-4a70-8de3-40ba91cc7712",
    entitlementId: "ENT-2026-8736", licenseId: "LIC-MS-771640",
    deploymentId: "DEP-2026-3372", meteringId: "MTR-88101",
    health: "Completed", stage: "active", stalledMinutes: 0, revenueAtRisk: 0,
    reconciliation: match(), events: healthyEvents("04:28"),
  },
  {
    id: "ORD-42906", customer: "Atlas Retail", customerId: "CUST-40166",
    product: "Commerce Data Lake", sku: "CDL-ENT-250", lifterPlan: "lifter-commerce-lake-250",
    arr: 84_000, capacityTb: 250, region: "East US",
    tenantId: "9911acbf-4d02-4bb1-9c0e-51ff7b98a201",
    subscriptionId: "70dd1122-88fa-4a03-9931-0b71cd45ee10",
    entitlementId: "ENT-2026-8852",
    health: "Processing", stage: "entitlement", stalledMinutes: 1, revenueAtRisk: 0,
    reconciliation: match({ internalEntitlement: "Creating", lifterEntitlement: "Not submitted", azureDeployment: "Not deployed", metering: "Not started", billing: "Pending", verdict: "MISMATCH" }),
    events: partialEvents(1, "10:11"),
  },
  {
    id: "ORD-42907", customer: "Vertex Logistics", customerId: "CUST-40208",
    product: "Fleet Telemetry", sku: "FLT-TEL-60", lifterPlan: "lifter-fleet-telemetry-60",
    arr: 46_000, capacityTb: 60, region: "Central US",
    tenantId: "4a0b7712-1f39-4bb0-a9d1-77c211ee0034",
    subscriptionId: "5511aabb-3c22-4b1d-8f22-99ee11cc7700",
    entitlementId: "ENT-2026-8853",
    health: "Processing", stage: "lifterSubmit", stalledMinutes: 1, revenueAtRisk: 0,
    reconciliation: match({ lifterEntitlement: "Submitting", azureDeployment: "Not deployed", metering: "Not started", billing: "Pending", verdict: "MISMATCH" }),
    events: partialEvents(2, "10:12"),
  },
  {
    id: "ORD-42908", customer: "Summit Insurance", customerId: "CUST-40311",
    product: "Claims Intelligence", sku: "CLM-INT-150", lifterPlan: "lifter-claims-intel-150",
    arr: 62_000, capacityTb: 150, region: "West US 2",
    tenantId: "2200bd11-7a44-4dc3-9821-fe0032aa1188",
    subscriptionId: "18ce4477-b201-4e6a-9c00-aa71bb220e31",
    entitlementId: "ENT-2026-8854",
    health: "Processing", stage: "azureAuth", stalledMinutes: 2, revenueAtRisk: 0,
    reconciliation: match({ azureDeployment: "Authorizing", metering: "Not started", billing: "Pending", verdict: "MISMATCH" }),
    events: partialEvents(4, "10:09"),
  },
  {
    id: "ORD-42799", customer: "Apex Manufacturing", customerId: "CUST-40077",
    product: "Industrial Telemetry Suite", sku: "IND-TEL-500", lifterPlan: "lifter-ind-telemetry-500",
    arr: 154_000, capacityTb: 500, region: "Central US",
    tenantId: "77aa1b02-3e5f-4c88-9d61-2b03cc19f004",
    subscriptionId: "3f7b21aa-0c14-4d99-8ac1-77e5b1220ff9",
    entitlementId: "ENT-2026-8721", licenseId: "LIC-MS-771590",
    deploymentId: "DEP-2026-3360", meteringId: "MTR-88090",
    health: "Healthy", stage: "active", stalledMinutes: 0, revenueAtRisk: 0,
    reconciliation: match(), events: healthyEvents("03:47"),
  },
  {
    id: "ORD-42788", customer: "Evergreen Medical", customerId: "CUST-40402",
    product: "Clinical Data Exchange", sku: "CDX-ENT-600", lifterPlan: "lifter-clinical-exchange-600",
    arr: 178_000, capacityTb: 600, region: "East US 2",
    tenantId: "6612ffab-2210-4c0a-9911-88ad220e0011",
    subscriptionId: "aa03be77-1122-4c31-8fe0-7711ac902200",
    entitlementId: "ENT-2026-8710", licenseId: "LIC-MS-771540",
    deploymentId: "DEP-2026-3351", meteringId: "MTR-88081",
    health: "Healthy", stage: "active", stalledMinutes: 0, revenueAtRisk: 0,
    reconciliation: match(), events: healthyEvents("03:05"),
  },
  {
    id: "ORD-42774", customer: "Pioneer Bank", customerId: "CUST-40155",
    product: "Enterprise Cloud Storage", sku: "ENT-1PB", lifterPlan: "lifter-ent-storage-1pb",
    arr: 264_000, capacityTb: 1000, region: "West Europe",
    tenantId: "1d9a4400-cc11-4d55-8802-aa9911002200",
    subscriptionId: "8f22ee11-4a03-4bb2-9010-cc4411220099",
    entitlementId: "ENT-2026-8698", licenseId: "LIC-MS-771488",
    deploymentId: "DEP-2026-3340", meteringId: "MTR-88070",
    health: "Healthy", stage: "active", stalledMinutes: 0, revenueAtRisk: 0,
    reconciliation: match(), events: healthyEvents("02:31"),
  },
  {
    id: "ORD-42760", customer: "Sterling Industries", customerId: "CUST-40099",
    product: "Grid Analytics", sku: "GRD-AN-250", lifterPlan: "lifter-grid-analytics-250",
    arr: 79_000, capacityTb: 250, region: "North Europe",
    tenantId: "70bb1122-9911-4a0c-8dd1-002200aa1133",
    subscriptionId: "44cc0011-77aa-4b12-9e30-1102bb445500",
    entitlementId: "ENT-2026-8684", licenseId: "LIC-MS-771430",
    deploymentId: "DEP-2026-3331", meteringId: "MTR-88061",
    health: "Healthy", stage: "active", stalledMinutes: 0, revenueAtRisk: 0,
    reconciliation: match(), events: healthyEvents("01:52"),
  },
  {
    id: "ORD-42744", customer: "Atlas Retail", customerId: "CUST-40166",
    product: "Commerce Data Lake", sku: "CDL-ENT-100", lifterPlan: "lifter-commerce-lake-100",
    arr: 42_000, capacityTb: 100, region: "East US",
    tenantId: "9911acbf-4d02-4bb1-9c0e-51ff7b98a201",
    subscriptionId: "70dd1122-88fa-4a03-9931-0b71cd45ee10",
    entitlementId: "ENT-2026-8670", licenseId: "LIC-MS-771388",
    deploymentId: "DEP-2026-3320", meteringId: "MTR-88050",
    health: "Healthy", stage: "active", stalledMinutes: 0, revenueAtRisk: 0,
    reconciliation: match(), events: healthyEvents("01:14"),
  },
  {
    id: "ORD-42731", customer: "Meridian Financial", customerId: "CUST-40219",
    product: "Data Intelligence Platform", sku: "ANQ-ENT-250TB", lifterPlan: "lifter-ent-analytics-250",
    arr: 92_000, capacityTb: 250, region: "West Europe",
    tenantId: "b120f8ac-91d4-4a11-a9c2-52dd41f70a12",
    subscriptionId: "cc31de70-9a12-4b0c-b3aa-1189f7a20c55",
    entitlementId: "ENT-2026-8659", licenseId: "LIC-MS-771330",
    deploymentId: "DEP-2026-3311", meteringId: "MTR-88041",
    health: "Healthy", stage: "active", stalledMinutes: 0, revenueAtRisk: 0,
    reconciliation: match(), events: healthyEvents("00:38"),
  },
];

export const REGIONS = Array.from(new Set(transactions.map((t) => t.region))).sort();
export const CUSTOMERS = Array.from(new Set(transactions.map((t) => t.customer))).sort();
export const SKUS = Array.from(new Set(transactions.map((t) => t.sku))).sort();

/* ------------------------------ connected systems ------------------------------ */

export interface SystemNode {
  id: string;
  name: string;
  status: "Operational" | "Degraded" | "Down";
  latencyMs: number;
  errorRate: string;
  lastTxn: string;
  availability: string;
  tpm: number;
  recentErrors: { at: string; code: string; message: string }[];
  dependsOn: string[];
  lastDeployment: string;
  version: string;
  incidents: { at: string; title: string; status: string }[];
}

export const systems: SystemNode[] = [
  {
    id: "marketplace", name: "Direct Marketplace", status: "Operational", latencyMs: 84, errorRate: "0.00%",
    lastTxn: "12 sec ago", availability: "99.99%", tpm: 21, recentErrors: [],
    dependsOn: ["Order Service", "CRM / Billing"], lastDeployment: "2026-08-17 04:12 UTC", version: "4.18.2",
    incidents: [],
  },
  {
    id: "order", name: "Order Service", status: "Operational", latencyMs: 96, errorRate: "0.00%",
    lastTxn: "14 sec ago", availability: "99.98%", tpm: 21, recentErrors: [],
    dependsOn: ["Entitlement Service"], lastDeployment: "2026-08-16 22:40 UTC", version: "3.9.7", incidents: [],
  },
  {
    id: "entitlement", name: "Entitlement Service", status: "Operational", latencyMs: 132, errorRate: "0.79%",
    lastTxn: "22 sec ago", availability: "99.95%", tpm: 20,
    recentErrors: [{ at: "10:07:44", code: "409", message: "TenantSubscriptionMismatch — ORD-42841" }],
    dependsOn: ["License Service", "Lifter / Marketplace API"], lastDeployment: "2026-08-18 01:05 UTC", version: "2.31.0",
    incidents: [],
  },
  {
    id: "license", name: "License Service", status: "Operational", latencyMs: 108, errorRate: "0.00%",
    lastTxn: "48 sec ago", availability: "99.97%", tpm: 18, recentErrors: [],
    dependsOn: ["Lifter / Marketplace API"], lastDeployment: "2026-08-14 18:22 UTC", version: "1.22.4", incidents: [],
  },
  {
    id: "lifter", name: "Lifter / Marketplace API", status: "Degraded", latencyMs: 4210, errorRate: "3.20%",
    lastTxn: "1 min ago", availability: "99.41%", tpm: 17,
    recentErrors: [
      { at: "09:58:22", code: "504", message: "GatewayTimeout on submission — ORD-42877" },
      { at: "09:34:08", code: "202", message: "PendingFulfillmentConfirmation beyond SLA — ORD-42868" },
      { at: "08:52:41", code: "422", message: "PlanNotFound — ORD-42902" },
    ],
    dependsOn: ["Azure API"], lastDeployment: "external", version: "marketplace-v2",
    incidents: [{ at: "09:31 UTC", title: "Elevated fulfillment confirmation latency", status: "Investigating" }],
  },
  {
    id: "azure", name: "Azure API", status: "Operational", latencyMs: 168, errorRate: "1.60%",
    lastTxn: "36 sec ago", availability: "99.96%", tpm: 16,
    recentErrors: [
      { at: "10:04:19", code: "400", message: "SubscriptionNotFound — ORD-42849" },
      { at: "09:45:12", code: "403", message: "AuthorizationFailed — ORD-42891" },
    ],
    dependsOn: ["Provisioning Orchestrator"], lastDeployment: "external", version: "arm-2026-04-01", incidents: [],
  },
  {
    id: "provisioning", name: "Provisioning Orchestrator", status: "Operational", latencyMs: 240, errorRate: "1.70%",
    lastTxn: "2 min ago", availability: "99.93%", tpm: 15,
    recentErrors: [{ at: "09:12:55", code: "409", message: "QuotaExceeded — ORD-42860" }],
    dependsOn: ["Monitoring & Metering"], lastDeployment: "2026-08-18 06:30 UTC", version: "5.4.1", incidents: [],
  },
  {
    id: "monitoring", name: "Monitoring & Metering", status: "Operational", latencyMs: 74, errorRate: "0.00%",
    lastTxn: "8 sec ago", availability: "99.99%", tpm: 15, recentErrors: [],
    dependsOn: ["CRM / Billing"], lastDeployment: "2026-08-15 12:00 UTC", version: "6.0.3", incidents: [],
  },
  {
    id: "billing", name: "CRM / Billing", status: "Operational", latencyMs: 190, errorRate: "0.10%",
    lastTxn: "41 sec ago", availability: "99.94%", tpm: 14, recentErrors: [],
    dependsOn: [], lastDeployment: "2026-08-12 09:14 UTC", version: "11.7.0", incidents: [],
  },
];

/* --------------------------------- alerts --------------------------------- */

export interface AlertItem {
  id: string;
  severity: "critical" | "warning" | "info" | "success";
  title: string;
  ago: string;
  body: string;
  txnId?: string;
  systemId?: string;
}

export const alerts: AlertItem[] = [
  { id: "AL-01", severity: "critical", title: "High Lifter API Latency", ago: "2 minutes ago", body: "Lifter confirmation taking longer than threshold.", systemId: "lifter" },
  { id: "AL-02", severity: "warning", title: "Entitlement Mapping Issue", ago: "15 minutes ago", body: "SKU ANQ-ENT-500TB not mapped to expected fulfillment plan.", txnId: "ORD-42902" },
  { id: "AL-03", severity: "warning", title: "Azure Authorization Failed", ago: "32 minutes ago", body: "Insufficient permissions in customer subscription.", txnId: "ORD-42891" },
  { id: "AL-04", severity: "success", title: "Provisioning Completed", ago: "1 hour ago", body: "Order ORD-42830 successfully provisioned.", txnId: "ORD-42830" },
];

/* ------------------------------ business KPIs ------------------------------ */

export interface BizKpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  dir: "up" | "down";
  tone: "positive" | "negative";
  compare: string;
  spark: number[];
}

export const businessKpis: BizKpi[] = [
  { id: "arr", label: "Total ARR Booked", value: "$2.47M", delta: "22%", dir: "up", tone: "positive", compare: "vs prior period $2.02M", spark: [1.7, 1.8, 1.9, 2.0, 2.05, 2.2, 2.31, 2.47] },
  { id: "new", label: "New Customers", value: "23", delta: "28%", dir: "up", tone: "positive", compare: "vs prior period 18", spark: [12, 14, 15, 17, 18, 20, 21, 23] },
  { id: "exp", label: "Expansion ARR", value: "$1.12M", delta: "35%", dir: "up", tone: "positive", compare: "vs prior period $0.83M", spark: [0.6, 0.7, 0.74, 0.81, 0.9, 0.98, 1.04, 1.12] },
  { id: "cons", label: "Consumption", value: "8,642 TB", delta: "18%", dir: "up", tone: "positive", compare: "vs prior period 7,323 TB", spark: [6.1, 6.5, 6.9, 7.1, 7.4, 7.9, 8.2, 8.64] },
  { id: "churn", label: "Churn Rate", value: "1.2%", delta: "0.4%", dir: "down", tone: "positive", compare: "vs prior period 1.6%", spark: [2.1, 2.0, 1.9, 1.7, 1.6, 1.5, 1.3, 1.2] },
  { id: "risk", label: "Revenue at Risk", value: "$86K", delta: "31%", dir: "down", tone: "positive", compare: "vs prior period $124K", spark: [124, 118, 110, 104, 99, 94, 90, 86] },
];

/* ------------------------------- throughput ------------------------------- */

export const throughputSeries = {
  labels: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "24:00"],
  series: [
    { key: "Orders", color: "#2563EB", data: [8, 21, 42, 61, 84, 99, 116, 124, 128] },
    { key: "Entitlements", color: "#059669", data: [8, 20, 41, 60, 83, 98, 115, 123, 127] },
    { key: "Lifter Submitted", color: "#7C3AED", data: [7, 19, 39, 58, 80, 95, 112, 120, 124] },
    { key: "Lifter Confirmed", color: "#D97706", data: [6, 17, 36, 55, 76, 91, 107, 115, 119] },
    { key: "Provisioned", color: "#0D9488", data: [5, 15, 33, 51, 72, 87, 103, 111, 115] },
  ],
};
