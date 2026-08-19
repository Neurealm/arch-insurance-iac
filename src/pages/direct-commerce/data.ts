/**
 * Direct Commerce Fulfillment — canonical mock estate.
 *
 * The module models a marketplace-independent commercial transaction that is
 * still translated into a Microsoft Lifter entitlement + fulfillment obligation
 * downstream. Direct commerce is DECOUPLED from Microsoft fulfillment; it is
 * never bypassed.
 */

export type Tone = "healthy" | "pending" | "failed" | "info" | "blocked" | "neutral";

export type CommercialStatus = "Booked" | "Invoiced" | "Pending Approval" | "Cancelled" | "Draft";
export type EntitlementStatus =
  | "Active" | "Pending" | "Suspended" | "Expiring Soon" | "Failed Fulfillment" | "Reconciliation Mismatch" | "Not Created";
export type LifterStatus =
  | "Confirmed" | "Submitted" | "Retrying" | "Failed" | "Mapping Error" | "Not Submitted" | "Cancelled";
export type DeploymentStatus =
  | "Deployed" | "Ready to Deploy" | "Validating" | "Blocked" | "Not Started" | "Suspended";

export const STAGES = [
  "Order Accepted",
  "Entitlement Created",
  "Lifter Submitted",
  "Lifter Confirmed",
  "Azure Validated",
  "Ready to Deploy",
  "Deployed",
] as const;
export type Stage = (typeof STAGES)[number];

export interface AuditEvent {
  at: string;
  actor: string;
  event: string;
  detail: string;
  traceId: string;
  status: Tone;
  response?: string;
}

export interface Order {
  id: string;
  customer: string;
  customerId: string;
  product: string;
  sku: string;
  contractValue: number;
  tenantId: string;
  subscriptionId: string;
  region: string;
  orderDate: string;
  contractStart: string;
  contractEnd: string;
  commercial: CommercialStatus;
  entitlement: EntitlementStatus;
  lifter: LifterStatus;
  deployment: DeploymentStatus;
  stage: Stage;
  /** Furthest stage reached; stalled orders sit at `stage` with a reason. */
  blockedReason?: string;
  owner: string;
  capacityTb: number;
  elapsedHours: number;
  revenueAtRisk?: number;
  customerImpact: string;
  commercialImpact: string;
  procurementNote: string;
  timeline: AuditEvent[];
}

const t = (at: string, actor: string, event: string, detail: string, traceId: string, status: Tone, response?: string): AuditEvent =>
  ({ at, actor, event, detail, traceId, status, response });

export const orders: Order[] = [
  {
    id: "DCO-2026-1041", customer: "Northstar Health", customerId: "CUST-40128",
    product: "Azure-Native Data Platform", sku: "NG-ADP-ENT-500",
    contractValue: 1_248_000, tenantId: "3f9a2c71-…-8c41", subscriptionId: "a71c-…-9d02",
    region: "East US 2", orderDate: "2026-07-14", contractStart: "2026-08-01", contractEnd: "2029-07-31",
    commercial: "Invoiced", entitlement: "Active", lifter: "Confirmed", deployment: "Deployed",
    stage: "Deployed", owner: "M. Ruiz", capacityTb: 500, elapsedHours: 19,
    customerImpact: "Platform is live in the customer tenant; no customer action outstanding.",
    commercialImpact: "Revenue recognised. Metering flowing to billing.",
    procurementNote: "Customer procurement policy prohibits marketplace transactions; purchased on direct paper.",
    timeline: [
      t("2026-07-14 09:12Z", "Commerce API", "Order Accepted", "Direct order booked against MSA-4471, PO 88231.", "trc-0a41f2", "healthy"),
      t("2026-07-14 09:14Z", "Entitlement Service", "Entitlement Created", "ENT-88214 created, 500 TB, 3-year term.", "trc-0a41f3", "healthy"),
      t("2026-07-14 09:15Z", "Mapping Engine", "SKU Mapped", "NG-ADP-ENT-500 → lifter plan adp-ent-cap-500.", "trc-0a41f4", "healthy"),
      t("2026-07-14 09:16Z", "License Service", "License Artifact Generated", "Activation artifact LIC-7741A issued.", "trc-0a41f5", "healthy"),
      t("2026-07-14 09:18Z", "Lifter API", "Lifter API Submitted", "POST /fulfillment/entitlements accepted.", "trc-0a41f6", "healthy", "202 Accepted"),
      t("2026-07-14 09:31Z", "Microsoft", "Microsoft Response Received", "Entitlement acknowledged by fulfillment service.", "trc-0a41f7", "healthy", "200 OK"),
      t("2026-07-14 09:33Z", "Lifter API", "Entitlement Confirmed", "Fulfillment state = Subscribed.", "trc-0a41f8", "healthy"),
      t("2026-07-14 11:02Z", "Azure RM", "Azure Validation Completed", "Tenant, subscription, region, quota all validated.", "trc-0a4204", "healthy"),
      t("2026-07-15 04:20Z", "Provisioning", "Deployed", "Managed deployment complete, 3 clusters healthy.", "trc-0a4290", "healthy"),
    ],
  },
  {
    id: "DCO-2026-1042", customer: "Meridian Financial", customerId: "CUST-40219",
    product: "Azure-Native Data Platform", sku: "NG-ADP-ENT-250",
    contractValue: 684_000, tenantId: "8b21d904-…-1f77", subscriptionId: "c204-…-4411",
    region: "West Europe", orderDate: "2026-08-02", contractStart: "2026-08-15", contractEnd: "2028-08-14",
    commercial: "Booked", entitlement: "Active", lifter: "Confirmed", deployment: "Ready to Deploy",
    stage: "Ready to Deploy", owner: "P. Iyer", capacityTb: 250, elapsedHours: 26,
    customerImpact: "Environment validated and awaiting the customer's approved change window.",
    commercialImpact: "$684K booked; recognition begins at deployment.",
    procurementNote: "Bank governance forbids third-party marketplace billing. Direct paper, Lifter obligation fulfilled downstream.",
    timeline: [
      t("2026-08-02 13:40Z", "Commerce API", "Order Accepted", "Direct order booked, EMEA entity.", "trc-1b7701", "healthy"),
      t("2026-08-02 13:42Z", "Entitlement Service", "Entitlement Created", "ENT-88301, 250 TB.", "trc-1b7702", "healthy"),
      t("2026-08-02 13:47Z", "Lifter API", "Lifter API Submitted", "Submission accepted.", "trc-1b7706", "healthy", "202 Accepted"),
      t("2026-08-02 14:05Z", "Microsoft", "Entitlement Confirmed", "Fulfillment state = Subscribed.", "trc-1b7709", "healthy", "200 OK"),
      t("2026-08-03 08:11Z", "Azure RM", "Azure Validation Completed", "All prerequisites met in West Europe.", "trc-1b7740", "healthy"),
      t("2026-08-03 08:12Z", "Provisioning", "Ready to Deploy", "Awaiting customer change window 2026-08-15 02:00 CET.", "trc-1b7741", "info"),
    ],
  },
  {
    id: "DCO-2026-1043", customer: "Apex Manufacturing", customerId: "CUST-40307",
    product: "Azure-Native Data Platform", sku: "NG-ADP-STD-100",
    contractValue: 219_500, tenantId: "5c40ba11-…-77a9", subscriptionId: "9911-…-b0c3",
    region: "Central US", orderDate: "2026-08-11", contractStart: "2026-08-20", contractEnd: "2027-08-19",
    commercial: "Booked", entitlement: "Failed Fulfillment", lifter: "Failed", deployment: "Blocked",
    stage: "Lifter Submitted", blockedReason: "Lifter API rejected the submission: plan `adp-std-cap-100` is not published in the customer's billing geography.",
    owner: "D. Okafor", capacityTb: 100, elapsedHours: 61, revenueAtRisk: 219_500,
    customerImpact: "The customer has paid but cannot yet deploy. Go-live commitment of 20 Aug is at risk.",
    commercialImpact: "$219.5K of booked revenue cannot be recognised until fulfillment confirms.",
    procurementNote: "Direct order accepted. Microsoft fulfillment obligation still outstanding — resolution in progress.",
    timeline: [
      t("2026-08-11 10:02Z", "Commerce API", "Order Accepted", "Direct order booked, PO 55120.", "trc-2c9101", "healthy"),
      t("2026-08-11 10:03Z", "Entitlement Service", "Entitlement Created", "ENT-88377, 100 TB.", "trc-2c9102", "healthy"),
      t("2026-08-11 10:05Z", "Mapping Engine", "SKU Mapped", "NG-ADP-STD-100 → adp-std-cap-100.", "trc-2c9103", "pending"),
      t("2026-08-11 10:07Z", "Lifter API", "Lifter API Submitted", "POST /fulfillment/entitlements.", "trc-2c9104", "pending", "202 Accepted"),
      t("2026-08-11 10:21Z", "Microsoft", "Microsoft Response Received", "PlanNotAvailableInGeo — plan not published for billing geography US-GOV overlay.", "trc-2c9105", "failed", "409 Conflict"),
      t("2026-08-12 06:00Z", "Fulfillment Engine", "Retry Attempted", "Attempt 3 of 5, same response.", "trc-2c9131", "failed", "409 Conflict"),
      t("2026-08-13 23:15Z", "Operations", "Escalated", "Plan publication request raised with the partner team.", "trc-2c9188", "pending"),
    ],
  },
  {
    id: "DCO-2026-1044", customer: "Horizon Energy", customerId: "CUST-40411",
    product: "Azure-Native Data Platform", sku: "NG-ADP-ENT-1000",
    contractValue: 2_140_000, tenantId: "1d77e830-…-5b12", subscriptionId: "7f0a-…-2c88",
    region: "North Europe", orderDate: "2026-08-05", contractStart: "2026-09-01", contractEnd: "2031-08-31",
    commercial: "Booked", entitlement: "Active", lifter: "Retrying", deployment: "Validating",
    stage: "Lifter Submitted", blockedReason: "Transient 503 from the fulfillment endpoint; automatic retry 2 of 5 scheduled.",
    owner: "L. Hartmann", capacityTb: 1000, elapsedHours: 7, revenueAtRisk: 0,
    customerImpact: "No customer-visible effect yet. Provisioning continues in parallel with the retry queue.",
    commercialImpact: "$2.14M booked. Recognition unaffected if confirmation lands inside the 72-hour window.",
    procurementNote: "Framework agreement excludes marketplace procurement; direct paper with downstream Lifter fulfillment.",
    timeline: [
      t("2026-08-05 07:55Z", "Commerce API", "Order Accepted", "Five-year enterprise agreement.", "trc-3d0201", "healthy"),
      t("2026-08-05 07:57Z", "Entitlement Service", "Entitlement Created", "ENT-88402, 1 PB.", "trc-3d0202", "healthy"),
      t("2026-08-05 08:00Z", "Lifter API", "Lifter API Submitted", "Submission attempt 1.", "trc-3d0204", "pending", "503 Service Unavailable"),
      t("2026-08-05 08:30Z", "Fulfillment Engine", "Retry Scheduled", "Exponential backoff, next attempt 09:00Z.", "trc-3d0205", "pending"),
      t("2026-08-05 09:00Z", "Lifter API", "Lifter API Submitted", "Submission attempt 2 in flight.", "trc-3d0206", "pending"),
    ],
  },
  {
    id: "DCO-2026-1045", customer: "Atlas Retail", customerId: "CUST-40522",
    product: "Azure-Native Analytics Engine", sku: "NG-AAE-STD-050",
    contractValue: 96_000, tenantId: "6a03cf19-…-4d31", subscriptionId: "2b41-…-77e0",
    region: "East US", orderDate: "2026-08-17", contractStart: "2026-08-25", contractEnd: "2027-08-24",
    commercial: "Pending Approval", entitlement: "Pending", lifter: "Not Submitted", deployment: "Not Started",
    stage: "Order Accepted", owner: "S. Whitfield", capacityTb: 50, elapsedHours: 3,
    customerImpact: "Nothing is committed to the customer environment until the order clears credit review.",
    commercialImpact: "$96K pending approval; no revenue impact yet.",
    procurementNote: "Direct order pending finance approval before entitlement creation.",
    timeline: [
      t("2026-08-17 15:20Z", "Commerce API", "Order Accepted", "Order received, credit review triggered.", "trc-4e1101", "pending"),
      t("2026-08-17 15:22Z", "Finance", "Approval Requested", "Awaiting credit desk sign-off.", "trc-4e1102", "pending"),
    ],
  },
  {
    id: "DCO-2026-1046", customer: "Northstar Health", customerId: "CUST-40128",
    product: "Azure-Native Analytics Engine", sku: "NG-AAE-ENT-200",
    contractValue: 412_000, tenantId: "3f9a2c71-…-8c41", subscriptionId: "a71c-…-9d02",
    region: "East US 2", orderDate: "2026-08-09", contractStart: "2026-09-01", contractEnd: "2028-08-31",
    commercial: "Booked", entitlement: "Reconciliation Mismatch", lifter: "Confirmed", deployment: "Deployed",
    stage: "Deployed", blockedReason: "Deployed capacity (300 TB) exceeds the entitled capacity (200 TB).",
    owner: "M. Ruiz", capacityTb: 200, elapsedHours: 22, revenueAtRisk: 148_000,
    customerImpact: "Service is fully operational. The customer is currently consuming more capacity than they are entitled to.",
    commercialImpact: "$148K of unbilled consumption. Either a true-up order or a capacity reduction is required.",
    procurementNote: "Direct expansion order on the existing MSA.",
    timeline: [
      t("2026-08-09 11:00Z", "Commerce API", "Order Accepted", "Expansion order, 200 TB analytics.", "trc-5f2201", "healthy"),
      t("2026-08-09 11:03Z", "Entitlement Service", "Entitlement Created", "ENT-88455, 200 TB.", "trc-5f2202", "healthy"),
      t("2026-08-09 11:20Z", "Microsoft", "Entitlement Confirmed", "Fulfillment state = Subscribed.", "trc-5f2209", "healthy", "200 OK"),
      t("2026-08-10 02:41Z", "Provisioning", "Deployed", "Deployed with 300 TB pool — operator override applied.", "trc-5f2260", "pending"),
      t("2026-08-18 01:00Z", "Reconciliation", "Mismatch Detected", "Metered capacity 300 TB vs entitled 200 TB.", "trc-5f2310", "failed"),
    ],
  },
  {
    id: "DCO-2026-1047", customer: "Meridian Financial", customerId: "CUST-40219",
    product: "Azure-Native Data Platform", sku: "NG-ADP-STD-100",
    contractValue: 198_000, tenantId: "8b21d904-…-1f77", subscriptionId: "c204-…-8890",
    region: "UK South", orderDate: "2026-08-14", contractStart: "2026-08-22", contractEnd: "2027-08-21",
    commercial: "Booked", entitlement: "Active", lifter: "Confirmed", deployment: "Blocked",
    stage: "Azure Validated", blockedReason: "Managed identity is missing the Contributor assignment on the target resource group.",
    owner: "P. Iyer", capacityTb: 100, elapsedHours: 44, revenueAtRisk: 198_000,
    customerImpact: "Deployment cannot start until the customer grants the required role assignment. Go-live slips day for day.",
    commercialImpact: "$198K of booked revenue held at the last mile.",
    procurementNote: "Direct order; Lifter obligation already confirmed.",
    timeline: [
      t("2026-08-14 08:30Z", "Commerce API", "Order Accepted", "UK entity order.", "trc-6a3301", "healthy"),
      t("2026-08-14 08:33Z", "Entitlement Service", "Entitlement Created", "ENT-88501.", "trc-6a3302", "healthy"),
      t("2026-08-14 08:52Z", "Microsoft", "Entitlement Confirmed", "Fulfillment confirmed.", "trc-6a3309", "healthy", "200 OK"),
      t("2026-08-14 10:15Z", "Azure RM", "Azure Validation Completed", "Tenant and subscription valid.", "trc-6a3340", "healthy"),
      t("2026-08-14 10:16Z", "Provisioning", "Blocked", "AuthorizationFailed on rg-ngp-uks-prod.", "trc-6a3341", "failed", "403 Forbidden"),
    ],
  },
  {
    id: "DCO-2026-1048", customer: "Apex Manufacturing", customerId: "CUST-40307",
    product: "Azure-Native Analytics Engine", sku: "NG-AAE-STD-050",
    contractValue: 88_500, tenantId: "5c40ba11-…-77a9", subscriptionId: "9911-…-b0c3",
    region: "Central US", orderDate: "2026-06-01", contractStart: "2026-06-10", contractEnd: "2026-09-09",
    commercial: "Invoiced", entitlement: "Expiring Soon", lifter: "Confirmed", deployment: "Deployed",
    stage: "Deployed", owner: "D. Okafor", capacityTb: 50, elapsedHours: 16, revenueAtRisk: 88_500,
    customerImpact: "Service continues normally. Without a renewal the entitlement lapses on 9 Sep and access is suspended.",
    commercialImpact: "$88.5K annualised renewal at risk in 21 days.",
    procurementNote: "Direct renewal quote issued; marketplace route unavailable to this customer.",
    timeline: [
      t("2026-06-01 09:00Z", "Commerce API", "Order Accepted", "Initial 90-day term.", "trc-7b4401", "healthy"),
      t("2026-06-01 09:30Z", "Microsoft", "Entitlement Confirmed", "Fulfillment confirmed.", "trc-7b4409", "healthy"),
      t("2026-06-02 03:00Z", "Provisioning", "Deployed", "Deployment complete.", "trc-7b4460", "healthy"),
      t("2026-08-19 00:05Z", "Entitlement Service", "Expiry Warning", "21 days to contract end; renewal not booked.", "trc-7b4501", "pending"),
    ],
  },
  {
    id: "DCO-2026-1049", customer: "Horizon Energy", customerId: "CUST-40411",
    product: "Azure-Native Data Platform", sku: "NG-ADP-STD-250",
    contractValue: 505_000, tenantId: "1d77e830-…-5b12", subscriptionId: "7f0a-…-9931",
    region: "Sweden Central", orderDate: "2026-08-15", contractStart: "2026-09-01", contractEnd: "2028-08-31",
    commercial: "Booked", entitlement: "Pending", lifter: "Mapping Error", deployment: "Not Started",
    stage: "Entitlement Created", blockedReason: "No Lifter plan is mapped for NG-ADP-STD-250 in Sweden Central.",
    owner: "L. Hartmann", capacityTb: 250, elapsedHours: 52, revenueAtRisk: 505_000,
    customerImpact: "The customer's onboarding has not started. They are unaware of the internal mapping gap.",
    commercialImpact: "$505K blocked at the catalog layer — the cheapest exception in the queue to fix.",
    procurementNote: "Direct order accepted; downstream fulfillment mapping must be completed before submission.",
    timeline: [
      t("2026-08-15 12:10Z", "Commerce API", "Order Accepted", "Nordics expansion.", "trc-8c5501", "healthy"),
      t("2026-08-15 12:12Z", "Entitlement Service", "Entitlement Created", "ENT-88566, 250 TB.", "trc-8c5502", "healthy"),
      t("2026-08-15 12:13Z", "Mapping Engine", "SKU Mapping Failed", "No active mapping row for region Sweden Central.", "trc-8c5503", "failed", "422 Unprocessable"),
    ],
  },
  {
    id: "DCO-2026-1050", customer: "Atlas Retail", customerId: "CUST-40522",
    product: "Azure-Native Data Platform", sku: "NG-ADP-ENT-250",
    contractValue: 640_000, tenantId: "6a03cf19-…-4d31", subscriptionId: "2b41-…-1120",
    region: "West US 3", orderDate: "2026-05-20", contractStart: "2026-06-01", contractEnd: "2026-08-01",
    commercial: "Cancelled", entitlement: "Suspended", lifter: "Cancelled", deployment: "Suspended",
    stage: "Deployed", blockedReason: "Order cancelled but Azure resources remain running in the customer subscription.",
    owner: "S. Whitfield", capacityTb: 250, elapsedHours: 430, revenueAtRisk: 41_000,
    customerImpact: "Cancelled service is still consuming customer Azure capacity, which the customer is paying Microsoft for.",
    commercialImpact: "$41K of unrecoverable infrastructure cost accruing; also a compliance exposure.",
    procurementNote: "Direct contract terminated for convenience on 1 Aug.",
    timeline: [
      t("2026-05-20 10:00Z", "Commerce API", "Order Accepted", "Two-month pilot.", "trc-9d6601", "healthy"),
      t("2026-06-01 04:00Z", "Provisioning", "Deployed", "Pilot deployed.", "trc-9d6660", "healthy"),
      t("2026-08-01 17:00Z", "Commerce API", "Order Cancelled", "Termination for convenience processed.", "trc-9d6701", "pending"),
      t("2026-08-01 17:05Z", "Lifter API", "Entitlement Cancelled", "Fulfillment cancellation confirmed.", "trc-9d6702", "healthy", "200 OK"),
      t("2026-08-18 02:00Z", "Reconciliation", "Orphaned Resources Detected", "12 resources still active in subscription 2b41-…-1120.", "trc-9d6790", "failed"),
    ],
  },
  {
    id: "DCO-2026-1051", customer: "Northstar Health", customerId: "CUST-40128",
    product: "Azure-Native Data Platform", sku: "NG-ADP-ENT-500",
    contractValue: 1_310_000, tenantId: "3f9a2c71-…-8c41", subscriptionId: "a71c-…-4407",
    region: "South Central US", orderDate: "2026-08-18", contractStart: "2026-09-15", contractEnd: "2029-09-14",
    commercial: "Booked", entitlement: "Active", lifter: "Confirmed", deployment: "Validating",
    stage: "Lifter Confirmed", owner: "M. Ruiz", capacityTb: 500, elapsedHours: 11,
    customerImpact: "Validation of the customer's Azure environment is in progress; nothing is required from the customer yet.",
    commercialImpact: "$1.31M booked, tracking to plan.",
    procurementNote: "Second-region expansion on the direct agreement.",
    timeline: [
      t("2026-08-18 06:40Z", "Commerce API", "Order Accepted", "Expansion into South Central US.", "trc-ae7701", "healthy"),
      t("2026-08-18 06:42Z", "Entitlement Service", "Entitlement Created", "ENT-88611.", "trc-ae7702", "healthy"),
      t("2026-08-18 06:49Z", "Lifter API", "Lifter API Submitted", "Submission accepted.", "trc-ae7706", "healthy", "202 Accepted"),
      t("2026-08-18 07:04Z", "Microsoft", "Entitlement Confirmed", "Fulfillment state = Subscribed.", "trc-ae7709", "healthy", "200 OK"),
      t("2026-08-18 07:10Z", "Azure RM", "Validation Started", "Quota and network prerequisite checks running.", "trc-ae7740", "pending"),
    ],
  },
  {
    id: "DCO-2026-1052", customer: "Meridian Financial", customerId: "CUST-40219",
    product: "Azure-Native Analytics Engine", sku: "NG-AAE-ENT-200",
    contractValue: 388_000, tenantId: "8b21d904-…-1f77", subscriptionId: "c204-…-4411",
    region: "West Europe", orderDate: "2026-07-28", contractStart: "2026-08-05", contractEnd: "2029-08-04",
    commercial: "Invoiced", entitlement: "Active", lifter: "Confirmed", deployment: "Deployed",
    stage: "Deployed", owner: "P. Iyer", capacityTb: 200, elapsedHours: 21,
    customerImpact: "Live and metering normally.",
    commercialImpact: "Revenue recognised; usage tracking 4% above forecast.",
    procurementNote: "Direct paper under the EMEA framework.",
    timeline: [
      t("2026-07-28 09:00Z", "Commerce API", "Order Accepted", "Analytics add-on.", "trc-bf8801", "healthy"),
      t("2026-07-28 09:26Z", "Microsoft", "Entitlement Confirmed", "Fulfillment confirmed.", "trc-bf8809", "healthy"),
      t("2026-07-29 06:00Z", "Provisioning", "Deployed", "Deployment complete, metering active.", "trc-bf8860", "healthy"),
    ],
  },
  {
    id: "DCO-2026-1053", customer: "Apex Manufacturing", customerId: "CUST-40307",
    product: "Azure-Native Data Platform", sku: "NG-ADP-ENT-500",
    contractValue: 1_090_000, tenantId: "5c40ba11-…-77a9", subscriptionId: "9911-…-5540",
    region: "East US", orderDate: "2026-08-16", contractStart: "2026-09-01", contractEnd: "2029-08-31",
    commercial: "Booked", entitlement: "Active", lifter: "Confirmed", deployment: "Ready to Deploy",
    stage: "Ready to Deploy", owner: "D. Okafor", capacityTb: 500, elapsedHours: 30,
    customerImpact: "All prerequisites met. Deployment can be approved at any time.",
    commercialImpact: "$1.09M ready to convert to recognised revenue.",
    procurementNote: "Direct order; marketplace prohibited by the customer's supplier-of-record policy.",
    timeline: [
      t("2026-08-16 07:20Z", "Commerce API", "Order Accepted", "Direct order booked.", "trc-c09901", "healthy"),
      t("2026-08-16 07:44Z", "Microsoft", "Entitlement Confirmed", "Fulfillment confirmed.", "trc-c09909", "healthy"),
      t("2026-08-17 12:00Z", "Azure RM", "Azure Validation Completed", "All checks green.", "trc-c09940", "healthy"),
    ],
  },
  {
    id: "DCO-2026-1054", customer: "Horizon Energy", customerId: "CUST-40411",
    product: "Azure-Native Analytics Engine", sku: "NG-AAE-STD-050",
    contractValue: 74_000, tenantId: "1d77e830-…-5b12", subscriptionId: "7f0a-…-2c88",
    region: "North Europe", orderDate: "2026-08-12", contractStart: "2026-08-20", contractEnd: "2027-08-19",
    commercial: "Booked", entitlement: "Active", lifter: "Confirmed", deployment: "Deployed",
    stage: "Deployed", blockedReason: "Metered usage has not reported for 36 hours.",
    owner: "L. Hartmann", capacityTb: 50, elapsedHours: 18, revenueAtRisk: 6_100,
    customerImpact: "No effect on service. The customer's invoice may under-report consumption.",
    commercialImpact: "~$6.1K of usage-based revenue unmetered so far.",
    procurementNote: "Direct order.",
    timeline: [
      t("2026-08-12 08:00Z", "Commerce API", "Order Accepted", "Analytics starter.", "trc-d1aa01", "healthy"),
      t("2026-08-12 08:22Z", "Microsoft", "Entitlement Confirmed", "Fulfillment confirmed.", "trc-d1aa09", "healthy"),
      t("2026-08-13 05:00Z", "Provisioning", "Deployed", "Deployment complete.", "trc-d1aa60", "healthy"),
      t("2026-08-18 09:00Z", "Metering", "Usage Gap Detected", "No metering events since 2026-08-16 21:00Z.", "trc-d1ab10", "failed"),
    ],
  },
];

/* ------------------------------- entitlements ------------------------------- */

export interface Entitlement {
  id: string;
  orderId: string;
  customer: string;
  customerId: string;
  tenantId: string;
  subscriptionId: string;
  product: string;
  sku: string;
  capacityTb: number;
  region: string;
  contractStart: string;
  contractEnd: string;
  status: EntitlementStatus;
  lifter: LifterStatus;
  deployment: DeploymentStatus;
}

export const entitlements: Entitlement[] = orders
  .filter((o) => o.entitlement !== "Not Created")
  .map((o, i) => ({
    id: `ENT-${88214 + i * 47}`,
    orderId: o.id,
    customer: o.customer,
    customerId: o.customerId,
    tenantId: o.tenantId,
    subscriptionId: o.subscriptionId,
    product: o.product,
    sku: o.sku,
    capacityTb: o.capacityTb,
    region: o.region,
    contractStart: o.contractStart,
    contractEnd: o.contractEnd,
    status: o.entitlement,
    lifter: o.lifter,
    deployment: o.deployment,
  }));

/* ------------------------------- lifter records ----------------------------- */

export interface Fulfillment {
  id: string;
  orderId: string;
  customer: string;
  internalSku: string;
  lifterPlan: string;
  artifact: string;
  submittedAt: string;
  confirmedAt: string | null;
  status: LifterStatus;
  retries: number;
  lastError: string | null;
  whatFailed?: string;
  technicalCause?: string;
  recommendedAction?: string;
  retryEligible?: boolean;
  relatedEvent?: string;
}

export const fulfillments: Fulfillment[] = [
  { id: "LFT-99120", orderId: "DCO-2026-1041", customer: "Northstar Health", internalSku: "NG-ADP-ENT-500", lifterPlan: "adp-ent-cap-500", artifact: "LIC-7741A", submittedAt: "2026-07-14 09:18Z", confirmedAt: "2026-07-14 09:33Z", status: "Confirmed", retries: 0, lastError: null },
  { id: "LFT-99131", orderId: "DCO-2026-1042", customer: "Meridian Financial", internalSku: "NG-ADP-ENT-250", lifterPlan: "adp-ent-cap-250", artifact: "LIC-7752B", submittedAt: "2026-08-02 13:47Z", confirmedAt: "2026-08-02 14:05Z", status: "Confirmed", retries: 0, lastError: null },
  {
    id: "LFT-99144", orderId: "DCO-2026-1043", customer: "Apex Manufacturing", internalSku: "NG-ADP-STD-100", lifterPlan: "adp-std-cap-100", artifact: "LIC-7760C",
    submittedAt: "2026-08-11 10:07Z", confirmedAt: null, status: "Failed", retries: 3, lastError: "409 PlanNotAvailableInGeo",
    whatFailed: "The fulfillment submission was rejected because the mapped plan is not published in the customer's billing geography.",
    technicalCause: "Plan `adp-std-cap-100` is published for the US billing geography but the customer's Azure billing account resolves to a government-community overlay, which requires a separately published plan.",
    recommendedAction: "Publish `adp-std-cap-100-gcc` and repoint the catalog mapping, then resubmit. No commercial change is required — the direct order stands.",
    retryEligible: false, relatedEvent: "Microsoft Response Received · trc-2c9105",
  },
  {
    id: "LFT-99150", orderId: "DCO-2026-1044", customer: "Horizon Energy", internalSku: "NG-ADP-ENT-1000", lifterPlan: "adp-ent-cap-1000", artifact: "LIC-7771D",
    submittedAt: "2026-08-05 08:00Z", confirmedAt: null, status: "Retrying", retries: 2, lastError: "503 Service Unavailable",
    whatFailed: "The fulfillment endpoint returned a transient service error.",
    technicalCause: "Upstream fulfillment service availability dip; the request never reached the entitlement store.",
    recommendedAction: "No manual action. Exponential backoff continues to attempt 5; escalate only if unconfirmed after 72 hours.",
    retryEligible: true, relatedEvent: "Retry Scheduled · trc-3d0205",
  },
  {
    id: "LFT-99163", orderId: "DCO-2026-1049", customer: "Horizon Energy", internalSku: "NG-ADP-STD-250", lifterPlan: "— unmapped —", artifact: "not generated",
    submittedAt: "—", confirmedAt: null, status: "Mapping Error", retries: 0, lastError: "422 NoActiveMappingForRegion",
    whatFailed: "The internal SKU could not be translated into a Lifter plan for the ordered region, so nothing was submitted.",
    technicalCause: "Catalog has no active mapping row for NG-ADP-STD-250 with region eligibility covering Sweden Central.",
    recommendedAction: "Add the Sweden Central region to the `adp-std-cap-250` mapping in Catalog & SKU Mapping, revalidate, then trigger submission.",
    retryEligible: true, relatedEvent: "SKU Mapping Failed · trc-8c5503",
  },
  { id: "LFT-99170", orderId: "DCO-2026-1046", customer: "Northstar Health", internalSku: "NG-AAE-ENT-200", lifterPlan: "aae-ent-cap-200", artifact: "LIC-7788E", submittedAt: "2026-08-09 11:06Z", confirmedAt: "2026-08-09 11:20Z", status: "Confirmed", retries: 0, lastError: null },
  { id: "LFT-99181", orderId: "DCO-2026-1047", customer: "Meridian Financial", internalSku: "NG-ADP-STD-100", lifterPlan: "adp-std-cap-100", artifact: "LIC-7791F", submittedAt: "2026-08-14 08:36Z", confirmedAt: "2026-08-14 08:52Z", status: "Confirmed", retries: 1, lastError: null },
  { id: "LFT-99190", orderId: "DCO-2026-1051", customer: "Northstar Health", internalSku: "NG-ADP-ENT-500", lifterPlan: "adp-ent-cap-500", artifact: "LIC-7803G", submittedAt: "2026-08-18 06:49Z", confirmedAt: "2026-08-18 07:04Z", status: "Confirmed", retries: 0, lastError: null },
  { id: "LFT-99195", orderId: "DCO-2026-1053", customer: "Apex Manufacturing", internalSku: "NG-ADP-ENT-500", lifterPlan: "adp-ent-cap-500", artifact: "LIC-7810H", submittedAt: "2026-08-16 07:26Z", confirmedAt: "2026-08-16 07:44Z", status: "Confirmed", retries: 0, lastError: null },
  { id: "LFT-99199", orderId: "DCO-2026-1054", customer: "Horizon Energy", internalSku: "NG-AAE-STD-050", lifterPlan: "aae-std-cap-050", artifact: "LIC-7815J", submittedAt: "2026-08-12 08:06Z", confirmedAt: "2026-08-12 08:22Z", status: "Confirmed", retries: 0, lastError: null },
  { id: "LFT-99201", orderId: "DCO-2026-1052", customer: "Meridian Financial", internalSku: "NG-AAE-ENT-200", lifterPlan: "aae-ent-cap-200", artifact: "LIC-7820K", submittedAt: "2026-07-28 09:08Z", confirmedAt: "2026-07-28 09:26Z", status: "Confirmed", retries: 0, lastError: null },
  { id: "LFT-99205", orderId: "DCO-2026-1050", customer: "Atlas Retail", internalSku: "NG-ADP-ENT-250", lifterPlan: "adp-ent-cap-250", artifact: "LIC-7601M", submittedAt: "2026-05-20 10:12Z", confirmedAt: "2026-05-20 10:29Z", status: "Cancelled", retries: 0, lastError: null },
];

export const apiEventFeed = [
  { at: "09:12:04Z", event: "Entitlement Received", system: "Entitlement Service", detail: "ENT-88611 handed to fulfillment engine", trace: "trc-ae7702", status: "healthy" as Tone },
  { at: "09:12:06Z", event: "SKU Mapped", system: "Mapping Engine", detail: "NG-ADP-ENT-500 → adp-ent-cap-500 (v4, validated 2026-08-01)", trace: "trc-ae7703", status: "healthy" as Tone },
  { at: "09:12:09Z", event: "License Artifact Generated", system: "License Service", detail: "LIC-7803G signed, 3-year term, 500 TB", trace: "trc-ae7704", status: "healthy" as Tone },
  { at: "09:12:11Z", event: "Lifter API Submitted", system: "Lifter API", detail: "POST /fulfillment/entitlements · 202 Accepted", trace: "trc-ae7706", status: "healthy" as Tone },
  { at: "09:12:44Z", event: "Microsoft Response Received", system: "Microsoft", detail: "operationId 7f31…9c02 · state = InProgress", trace: "trc-ae7707", status: "info" as Tone },
  { at: "09:13:58Z", event: "Entitlement Confirmed", system: "Lifter API", detail: "state = Subscribed · confirmed in 1m 47s", trace: "trc-ae7709", status: "healthy" as Tone },
  { at: "09:19:22Z", event: "Azure Validation Completed", system: "Azure RM", detail: "Tenant, subscription, quota and network prerequisites validated", trace: "trc-ae7740", status: "healthy" as Tone },
  { at: "10:21:07Z", event: "Microsoft Response Received", system: "Microsoft", detail: "409 PlanNotAvailableInGeo for LFT-99144", trace: "trc-2c9105", status: "failed" as Tone },
  { at: "10:41:02Z", event: "Retry Scheduled", system: "Fulfillment Engine", detail: "LFT-99150 attempt 3 at 11:00Z (backoff 30m)", trace: "trc-3d0205", status: "pending" as Tone },
];

/* --------------------------------- catalog ---------------------------------- */

export interface CatalogRow {
  id: string;
  product: string;
  internalSku: string;
  packageName: string;
  capacity: string;
  regions: string;
  lifterOffer: string;
  lifterPlan: string;
  meteringDimension: string;
  status: "Active" | "Draft" | "Needs Validation" | "Retired";
  lastValidated: string;
}

export const catalog: CatalogRow[] = [
  { id: "MAP-001", product: "Azure-Native Data Platform", internalSku: "NG-ADP-ENT-500", packageName: "Enterprise 500", capacity: "500 TB", regions: "US, EU, UK, APAC", lifterOffer: "neugain-adp", lifterPlan: "adp-ent-cap-500", meteringDimension: "capacity_tb_hour", status: "Active", lastValidated: "2026-08-01" },
  { id: "MAP-002", product: "Azure-Native Data Platform", internalSku: "NG-ADP-ENT-1000", packageName: "Enterprise 1 PB", capacity: "1,000 TB", regions: "US, EU", lifterOffer: "neugain-adp", lifterPlan: "adp-ent-cap-1000", meteringDimension: "capacity_tb_hour", status: "Active", lastValidated: "2026-08-01" },
  { id: "MAP-003", product: "Azure-Native Data Platform", internalSku: "NG-ADP-ENT-250", packageName: "Enterprise 250", capacity: "250 TB", regions: "US, EU, UK", lifterOffer: "neugain-adp", lifterPlan: "adp-ent-cap-250", meteringDimension: "capacity_tb_hour", status: "Active", lastValidated: "2026-07-19" },
  { id: "MAP-004", product: "Azure-Native Data Platform", internalSku: "NG-ADP-STD-100", packageName: "Standard 100", capacity: "100 TB", regions: "US, UK", lifterOffer: "neugain-adp", lifterPlan: "adp-std-cap-100", meteringDimension: "capacity_tb_hour", status: "Needs Validation", lastValidated: "2026-05-04" },
  { id: "MAP-005", product: "Azure-Native Data Platform", internalSku: "NG-ADP-STD-250", packageName: "Standard 250", capacity: "250 TB", regions: "US, UK", lifterOffer: "neugain-adp", lifterPlan: "adp-std-cap-250", meteringDimension: "capacity_tb_hour", status: "Needs Validation", lastValidated: "2026-04-28" },
  { id: "MAP-006", product: "Azure-Native Analytics Engine", internalSku: "NG-AAE-ENT-200", packageName: "Analytics Enterprise", capacity: "200 TB", regions: "US, EU", lifterOffer: "neugain-aae", lifterPlan: "aae-ent-cap-200", meteringDimension: "query_unit_hour", status: "Active", lastValidated: "2026-08-05" },
  { id: "MAP-007", product: "Azure-Native Analytics Engine", internalSku: "NG-AAE-STD-050", packageName: "Analytics Standard", capacity: "50 TB", regions: "US, EU, UK", lifterOffer: "neugain-aae", lifterPlan: "aae-std-cap-050", meteringDimension: "query_unit_hour", status: "Active", lastValidated: "2026-08-05" },
  { id: "MAP-008", product: "Azure-Native Data Platform", internalSku: "NG-ADP-GOV-100", packageName: "Government 100", capacity: "100 TB", regions: "US Gov", lifterOffer: "neugain-adp-gcc", lifterPlan: "adp-std-cap-100-gcc", meteringDimension: "capacity_tb_hour", status: "Draft", lastValidated: "—" },
];

/* ------------------------------- integrations ------------------------------- */

export interface Integration {
  id: string;
  name: string;
  role: string;
  health: Tone;
  latencyMs: number;
  lastTxn: string;
  errorRate: string;
  incidents: { at: string; note: string; tone: Tone }[];
  customerImpact: string;
}

export const integrations: Integration[] = [
  { id: "int-dm", name: "Direct Marketplace", role: "Customer-facing commerce storefront and quote-to-order", health: "healthy", latencyMs: 118, lastTxn: "2 min ago", errorRate: "0.02%", incidents: [], customerImpact: "Customers can transact directly without touching the Azure Commercial Marketplace." },
  { id: "int-crm", name: "CRM", role: "Opportunity, account, and contract system of engagement", health: "healthy", latencyMs: 240, lastTxn: "6 min ago", errorRate: "0.10%", incidents: [{ at: "2026-08-11", note: "Bulk account sync backlog cleared after 41 min.", tone: "pending" }], customerImpact: "Account and contract context stays aligned with the commercial order." },
  { id: "int-erp", name: "Billing / ERP", role: "Invoicing, revenue recognition, and credit control", health: "pending", latencyMs: 910, lastTxn: "38 min ago", errorRate: "1.4%", incidents: [{ at: "2026-08-18", note: "Invoice posting queue depth elevated (218 items).", tone: "pending" }], customerImpact: "Invoices may post up to an hour late; service delivery is unaffected." },
  { id: "int-ent", name: "Entitlement Service", role: "Canonical entitlement system of record", health: "healthy", latencyMs: 62, lastTxn: "just now", errorRate: "0.00%", incidents: [], customerImpact: "Every direct order is recorded as a durable, auditable entitlement." },
  { id: "int-idp", name: "Identity Provider", role: "Tenant identity, consent, and managed identity issuance", health: "healthy", latencyMs: 145, lastTxn: "4 min ago", errorRate: "0.05%", incidents: [], customerImpact: "Customer tenants can be validated and consented without manual steps." },
  { id: "int-lifter", name: "Lifter API", role: "Microsoft fulfillment and entitlement confirmation", health: "failed", latencyMs: 2_410, lastTxn: "12 min ago", errorRate: "6.8%", incidents: [{ at: "2026-08-18", note: "Elevated 503s from the fulfillment endpoint; retry queue at 2 items.", tone: "failed" }, { at: "2026-08-11", note: "PlanNotAvailableInGeo rejections for GCC billing accounts.", tone: "failed" }], customerImpact: "Two customers cannot complete onboarding until fulfillment confirms. Direct commerce is unaffected." },
  { id: "int-arm", name: "Azure Resource Manager", role: "Tenant, subscription, quota, and deployment control", health: "healthy", latencyMs: 320, lastTxn: "1 min ago", errorRate: "0.30%", incidents: [], customerImpact: "Customer environments can be validated and provisioned on demand." },
  { id: "int-meter", name: "Metering", role: "Usage emission to Microsoft and to internal billing", health: "pending", latencyMs: 480, lastTxn: "36 h ago (Horizon Energy)", errorRate: "0.9%", incidents: [{ at: "2026-08-18", note: "Metering gap on subscription 7f0a-…-2c88.", tone: "pending" }], customerImpact: "One customer's consumption is under-reported; no service impact." },
  { id: "int-bus", name: "Event Bus", role: "Asynchronous choreography across commerce and fulfillment", health: "healthy", latencyMs: 28, lastTxn: "just now", errorRate: "0.01%", incidents: [], customerImpact: "Lifecycle transitions propagate in near real time." },
  { id: "int-audit", name: "Audit Store", role: "Immutable evidence for every commercial and fulfillment action", health: "healthy", latencyMs: 74, lastTxn: "just now", errorRate: "0.00%", incidents: [], customerImpact: "Every state change is defensible in a customer or Microsoft audit." },
];

/* ------------------------------- provisioning ------------------------------- */

export interface ProvisioningCheck {
  id: string;
  label: string;
  status: Tone;
  detail: string;
  impact: string;
  dependency: string;
  evidence: string;
  remediation: string;
}

export interface ProvisioningRecord {
  orderId: string;
  customer: string;
  region: string;
  tenantId: string;
  subscriptionId: string;
  score: number;
  state: DeploymentStatus;
  checks: ProvisioningCheck[];
  outputs: { label: string; value: string }[];
}

const ok = (id: string, label: string, detail: string, evidence: string): ProvisioningCheck => ({
  id, label, status: "healthy", detail,
  impact: "No customer impact — this prerequisite is satisfied.",
  dependency: "Azure Resource Manager", evidence,
  remediation: "None required.",
});

export const provisioning: ProvisioningRecord[] = [
  {
    orderId: "DCO-2026-1053", customer: "Apex Manufacturing", region: "East US", tenantId: "5c40ba11-…-77a9", subscriptionId: "9911-…-5540",
    score: 100, state: "Ready to Deploy",
    checks: [
      ok("tenant", "Azure Tenant validation", "Tenant verified and consent granted for the managed application.", "consent grant 2026-08-16 07:51Z · trc-c09931"),
      ok("sub", "Subscription validation", "Subscription active, EA billing, not suspended.", "ARM GET /subscriptions · 200 OK"),
      ok("region", "Region eligibility", "East US is an eligible region for adp-ent-cap-500.", "catalog MAP-001 region set"),
      ok("capacity", "Capacity validation", "Quota for 500 TB and 96 vCPU confirmed with 22% headroom.", "quota API snapshot 2026-08-17 11:58Z"),
      ok("identity", "Identity / permission checks", "Managed identity holds Contributor on rg-ngp-eus-prod.", "role assignment 4c21…8f"),
      ok("network", "Network prerequisites", "Private endpoint subnet and DNS zone present.", "network validation trc-c09940"),
    ],
    outputs: [
      { label: "Managed resource group", value: "rg-ngp-eus-prod-apex" },
      { label: "Planned clusters", value: "3 (zonal)" },
      { label: "Estimated deployment time", value: "42 min" },
    ],
  },
  {
    orderId: "DCO-2026-1047", customer: "Meridian Financial", region: "UK South", tenantId: "8b21d904-…-1f77", subscriptionId: "c204-…-8890",
    score: 83, state: "Blocked",
    checks: [
      ok("tenant", "Azure Tenant validation", "Tenant verified, consent granted.", "consent grant 2026-08-14 08:40Z"),
      ok("sub", "Subscription validation", "Subscription active under the UK billing profile.", "ARM GET /subscriptions · 200 OK"),
      ok("region", "Region eligibility", "UK South eligible for adp-std-cap-100.", "catalog MAP-004 region set"),
      ok("capacity", "Capacity validation", "Quota confirmed for 100 TB.", "quota API snapshot 2026-08-14 10:02Z"),
      {
        id: "identity", label: "Identity / permission checks", status: "failed",
        detail: "The deployment managed identity has Reader, not Contributor, on rg-ngp-uks-prod.",
        impact: "Deployment cannot start. The customer's 22 Aug go-live slips one day for every day this is unresolved.",
        dependency: "Customer-controlled Azure RBAC · Identity Provider",
        evidence: "ARM PUT /deployments → 403 AuthorizationFailed · trc-6a3341 · 2026-08-14 10:16Z",
        remediation: "Ask the customer's Azure administrator to assign Contributor to the managed identity on rg-ngp-uks-prod, then re-run validation. A pre-approved change request template is attached to the order.",
      },
      {
        id: "network", label: "Network prerequisites", status: "pending",
        detail: "Private DNS zone exists; the private endpoint subnet has not been delegated.",
        impact: "Would fail later in deployment even once permissions are fixed.",
        dependency: "Customer network team",
        evidence: "subnet snet-ngp-uks · delegation = none · trc-6a3344",
        remediation: "Delegate snet-ngp-uks to Microsoft.Network/privateEndpoints as part of the same change.",
      },
    ],
    outputs: [
      { label: "Managed resource group", value: "rg-ngp-uks-prod (blocked)" },
      { label: "Deployment attempts", value: "2 (both 403)" },
    ],
  },
  {
    orderId: "DCO-2026-1051", customer: "Northstar Health", region: "South Central US", tenantId: "3f9a2c71-…-8c41", subscriptionId: "a71c-…-4407",
    score: 67, state: "Validating",
    checks: [
      ok("tenant", "Azure Tenant validation", "Tenant verified.", "consent grant 2026-08-18 06:58Z"),
      ok("sub", "Subscription validation", "Subscription active.", "ARM GET /subscriptions · 200 OK"),
      ok("region", "Region eligibility", "South Central US eligible.", "catalog MAP-001"),
      {
        id: "capacity", label: "Capacity validation", status: "pending",
        detail: "Quota request for an additional 240 vCPU is in flight with the platform capacity team.",
        impact: "No customer impact yet; validation completes when quota is granted.",
        dependency: "Azure quota service",
        evidence: "quota request QR-77219 raised 2026-08-18 07:12Z",
        remediation: "Automatic — the check re-runs every 30 minutes until quota is granted.",
      },
      {
        id: "identity", label: "Identity / permission checks", status: "pending",
        detail: "Awaiting managed identity propagation (typically under 10 minutes).",
        impact: "None.", dependency: "Identity Provider",
        evidence: "identity 9c02…41a created 07:11Z",
        remediation: "Automatic.",
      },
      ok("network", "Network prerequisites", "Subnet delegated, DNS zone linked.", "trc-ae7742"),
    ],
    outputs: [{ label: "Managed resource group", value: "rg-ngp-scus-prod-northstar (pending)" }],
  },
  {
    orderId: "DCO-2026-1042", customer: "Meridian Financial", region: "West Europe", tenantId: "8b21d904-…-1f77", subscriptionId: "c204-…-4411",
    score: 100, state: "Ready to Deploy",
    checks: [
      ok("tenant", "Azure Tenant validation", "Tenant verified, EU data boundary attested.", "consent grant 2026-08-03 07:55Z"),
      ok("sub", "Subscription validation", "Subscription active.", "ARM GET /subscriptions · 200 OK"),
      ok("region", "Region eligibility", "West Europe eligible for adp-ent-cap-250.", "catalog MAP-003"),
      ok("capacity", "Capacity validation", "250 TB quota confirmed.", "quota snapshot 2026-08-03 08:02Z"),
      ok("identity", "Identity / permission checks", "Contributor assignment verified.", "role assignment 7710…2b"),
      ok("network", "Network prerequisites", "All prerequisites met.", "trc-1b7740"),
    ],
    outputs: [
      { label: "Managed resource group", value: "rg-ngp-weu-prod-meridian" },
      { label: "Change window", value: "2026-08-15 02:00 CET (customer approved)" },
    ],
  },
];

/* ---------------------------- reconciliation -------------------------------- */

export type ExceptionCategory =
  | "Internal entitlement active but Lifter inactive"
  | "Lifter active but deployment missing"
  | "Customer cancelled but Azure resources still running"
  | "SKU mismatch"
  | "Capacity mismatch"
  | "Tenant / subscription mismatch"
  | "Metering mismatch"
  | "Contract expiration approaching";

export interface ReconException {
  id: string;
  category: ExceptionCategory;
  orderId: string;
  customer: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  detectedAt: string;
  revenueImpact: number;
  customerImpact: string;
  commercialImpact: string;
  systems: { system: string; state: string; tone: Tone }[];
  rootCause: string;
  remediation: string;
  automationConfidence: number;
  approvalRequired: boolean;
  evidence: string[];
}

export const exceptions: ReconException[] = [
  {
    id: "EXC-3301", category: "Internal entitlement active but Lifter inactive", orderId: "DCO-2026-1043", customer: "Apex Manufacturing",
    severity: "Critical", detectedAt: "2026-08-11 10:21Z", revenueImpact: 219_500,
    customerImpact: "The customer has completed a direct purchase and expects a 20 Aug go-live, but their environment cannot be provisioned until the Microsoft fulfillment obligation is confirmed.",
    commercialImpact: "$219.5K booked and un-recognisable. Renewal sentiment risk on a first-year account.",
    systems: [
      { system: "Commercial Order", state: "Booked · PO 55120", tone: "healthy" },
      { system: "Internal Entitlement", state: "Active · ENT-88377", tone: "healthy" },
      { system: "Lifter Entitlement", state: "Failed · 409 PlanNotAvailableInGeo", tone: "failed" },
      { system: "Azure Deployment", state: "Blocked · not started", tone: "failed" },
      { system: "Usage / Metering", state: "No usage", tone: "neutral" },
      { system: "Billing State", state: "Invoice held", tone: "pending" },
    ],
    rootCause: "The customer's billing account resolves to a government-community geography for which the mapped plan has never been published. The catalog mapping assumed a single US publication.",
    remediation: "Publish the GCC plan variant, repoint catalog mapping MAP-004, and resubmit the fulfillment request. The direct commercial order requires no change.",
    automationConfidence: 42, approvalRequired: true,
    evidence: ["trc-2c9105 · 409 response payload", "MAP-004 mapping version history", "Order DCO-2026-1043 commercial record"],
  },
  {
    id: "EXC-3302", category: "Customer cancelled but Azure resources still running", orderId: "DCO-2026-1050", customer: "Atlas Retail",
    severity: "Critical", detectedAt: "2026-08-18 02:00Z", revenueImpact: 41_000,
    customerImpact: "A cancelled service is still consuming the customer's Azure capacity and generating infrastructure charges they did not agree to.",
    commercialImpact: "$41K of unrecoverable cost plus a contractual exposure on termination obligations.",
    systems: [
      { system: "Commercial Order", state: "Cancelled 2026-08-01", tone: "failed" },
      { system: "Internal Entitlement", state: "Suspended", tone: "pending" },
      { system: "Lifter Entitlement", state: "Cancelled · confirmed", tone: "healthy" },
      { system: "Azure Deployment", state: "12 resources still active", tone: "failed" },
      { system: "Usage / Metering", state: "Emitting · 250 TB", tone: "failed" },
      { system: "Billing State", state: "Closed", tone: "neutral" },
    ],
    rootCause: "The decommission workflow completed the fulfillment cancellation but the resource teardown job failed on a resource lock and was never retried.",
    remediation: "Remove the CanNotDelete lock on rg-ngp-wus3-atlas and re-run the decommission runbook with evidence capture. Notify the customer before teardown.",
    automationConfidence: 88, approvalRequired: true,
    evidence: ["trc-9d6790 · orphan scan", "teardown job 88214 failure log", "Termination notice 2026-08-01"],
  },
  {
    id: "EXC-3303", category: "Capacity mismatch", orderId: "DCO-2026-1046", customer: "Northstar Health",
    severity: "High", detectedAt: "2026-08-18 01:00Z", revenueImpact: 148_000,
    customerImpact: "None today — the customer is receiving more capacity than they purchased. Correcting it downward without notice would degrade their service.",
    commercialImpact: "$148K of unbilled consumption per annum if left uncorrected.",
    systems: [
      { system: "Commercial Order", state: "Booked · 200 TB", tone: "healthy" },
      { system: "Internal Entitlement", state: "Active · 200 TB", tone: "healthy" },
      { system: "Lifter Entitlement", state: "Confirmed · 200 TB", tone: "healthy" },
      { system: "Azure Deployment", state: "Deployed · 300 TB", tone: "failed" },
      { system: "Usage / Metering", state: "Metering 300 TB", tone: "pending" },
      { system: "Billing State", state: "Invoicing 200 TB", tone: "failed" },
    ],
    rootCause: "An operator override during deployment provisioned a 300 TB pool without a corresponding commercial amendment.",
    remediation: "Raise a true-up order for 100 TB and amend the entitlement, or schedule a capacity reduction in the customer's next change window. Commercial route is recommended.",
    automationConfidence: 61, approvalRequired: true,
    evidence: ["trc-5f2260 · deployment manifest", "metering rollup 2026-08-17", "entitlement ENT-88455"],
  },
  {
    id: "EXC-3304", category: "Lifter active but deployment missing", orderId: "DCO-2026-1047", customer: "Meridian Financial",
    severity: "High", detectedAt: "2026-08-14 10:16Z", revenueImpact: 198_000,
    customerImpact: "Fulfillment is complete on the Microsoft side, but the customer's environment is not deployed because a permission is missing in their tenant.",
    commercialImpact: "$198K held at the last mile; every day of delay pushes recognition into the next period.",
    systems: [
      { system: "Commercial Order", state: "Booked", tone: "healthy" },
      { system: "Internal Entitlement", state: "Active · ENT-88501", tone: "healthy" },
      { system: "Lifter Entitlement", state: "Confirmed", tone: "healthy" },
      { system: "Azure Deployment", state: "Blocked · 403 AuthorizationFailed", tone: "failed" },
      { system: "Usage / Metering", state: "None", tone: "neutral" },
      { system: "Billing State", state: "Invoice scheduled", tone: "pending" },
    ],
    rootCause: "The managed identity was granted Reader instead of Contributor on the target resource group during customer onboarding.",
    remediation: "Send the pre-approved RBAC change request to the customer's Azure administrator and re-run provisioning validation on completion.",
    automationConfidence: 74, approvalRequired: false,
    evidence: ["trc-6a3341 · 403 payload", "role assignment snapshot", "onboarding checklist v3"],
  },
  {
    id: "EXC-3305", category: "SKU mismatch", orderId: "DCO-2026-1049", customer: "Horizon Energy",
    severity: "High", detectedAt: "2026-08-15 12:13Z", revenueImpact: 505_000,
    customerImpact: "Onboarding has not begun. The customer is not yet aware, but the 1 Sep contract start is at risk.",
    commercialImpact: "$505K blocked by a missing catalog row — the lowest-effort, highest-value fix in the queue.",
    systems: [
      { system: "Commercial Order", state: "Booked · NG-ADP-STD-250", tone: "healthy" },
      { system: "Internal Entitlement", state: "Pending · ENT-88566", tone: "pending" },
      { system: "Lifter Entitlement", state: "Not submitted · mapping error", tone: "failed" },
      { system: "Azure Deployment", state: "Not started", tone: "neutral" },
      { system: "Usage / Metering", state: "None", tone: "neutral" },
      { system: "Billing State", state: "Not invoiced", tone: "neutral" },
    ],
    rootCause: "Catalog mapping MAP-005 has region eligibility of US and UK only; the order was taken for Sweden Central.",
    remediation: "Extend MAP-005 region eligibility to the EU set, validate the mapping, then trigger fulfillment submission. Fully automatable once the catalog change is approved.",
    automationConfidence: 93, approvalRequired: false,
    evidence: ["trc-8c5503 · 422 payload", "MAP-005 current definition", "Order DCO-2026-1049"],
  },
  {
    id: "EXC-3306", category: "Metering mismatch", orderId: "DCO-2026-1054", customer: "Horizon Energy",
    severity: "Medium", detectedAt: "2026-08-18 09:00Z", revenueImpact: 6_100,
    customerImpact: "No service impact. The customer's invoice will under-report their actual consumption.",
    commercialImpact: "~$6.1K of usage revenue unreported and growing at roughly $170 per hour.",
    systems: [
      { system: "Commercial Order", state: "Booked", tone: "healthy" },
      { system: "Internal Entitlement", state: "Active", tone: "healthy" },
      { system: "Lifter Entitlement", state: "Confirmed", tone: "healthy" },
      { system: "Azure Deployment", state: "Deployed · healthy", tone: "healthy" },
      { system: "Usage / Metering", state: "No events for 36 h", tone: "failed" },
      { system: "Billing State", state: "Under-reporting", tone: "pending" },
    ],
    rootCause: "The metering agent lost its managed identity token after a platform certificate rotation and did not re-authenticate.",
    remediation: "Restart the metering agent on the customer deployment and backfill the 36-hour gap from local usage records.",
    automationConfidence: 96, approvalRequired: false,
    evidence: ["trc-d1ab10 · gap detection", "cert rotation 2026-08-16 20:40Z", "local usage buffer 36 h retained"],
  },
  {
    id: "EXC-3307", category: "Contract expiration approaching", orderId: "DCO-2026-1048", customer: "Apex Manufacturing",
    severity: "Medium", detectedAt: "2026-08-19 00:05Z", revenueImpact: 88_500,
    customerImpact: "Service continues until 9 Sep. Without a renewal the entitlement lapses and access is suspended on that date.",
    commercialImpact: "$88.5K annualised renewal at risk in 21 days.",
    systems: [
      { system: "Commercial Order", state: "Invoiced · ends 2026-09-09", tone: "pending" },
      { system: "Internal Entitlement", state: "Expiring Soon", tone: "pending" },
      { system: "Lifter Entitlement", state: "Confirmed · term-bound", tone: "healthy" },
      { system: "Azure Deployment", state: "Deployed", tone: "healthy" },
      { system: "Usage / Metering", state: "Normal", tone: "healthy" },
      { system: "Billing State", state: "Current", tone: "healthy" },
    ],
    rootCause: "Initial 90-day term reaching its end with no renewal order booked.",
    remediation: "Issue the direct renewal quote and, on acceptance, extend both the entitlement term and the Lifter fulfillment record.",
    automationConfidence: 55, approvalRequired: false,
    evidence: ["contract record MSA-4471-A", "renewal quote Q-2026-8891 (draft)"],
  },
  {
    id: "EXC-3308", category: "Tenant / subscription mismatch", orderId: "DCO-2026-1045", customer: "Atlas Retail",
    severity: "Low", detectedAt: "2026-08-17 15:31Z", revenueImpact: 0,
    customerImpact: "None. The order has not been provisioned, so the customer sees nothing.",
    commercialImpact: "Will block entitlement creation if not corrected before credit approval clears.",
    systems: [
      { system: "Commercial Order", state: "Pending approval", tone: "pending" },
      { system: "Internal Entitlement", state: "Not created", tone: "neutral" },
      { system: "Lifter Entitlement", state: "Not submitted", tone: "neutral" },
      { system: "Azure Deployment", state: "Not started", tone: "neutral" },
      { system: "Usage / Metering", state: "None", tone: "neutral" },
      { system: "Billing State", state: "Not invoiced", tone: "neutral" },
    ],
    rootCause: "The subscription on the order belongs to the customer's sandbox tenant, not the production tenant recorded in CRM.",
    remediation: "Confirm the intended subscription with the account team and correct the order before entitlement creation.",
    automationConfidence: 30, approvalRequired: false,
    evidence: ["CRM account record CUST-40522", "order subscription 2b41-…-77e0"],
  },
];

/* ---------------------------------- KPIs ------------------------------------ */

export const fmtMoney = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

export const stageCounts = () => {
  const idx = (s: Stage) => STAGES.indexOf(s);
  return STAGES.map((s) => {
    const reached = orders.filter((o) => idx(o.stage) >= idx(s));
    const at = orders.filter((o) => o.stage === s);
    const stalled = at.filter((o) => !!o.blockedReason);
    return {
      stage: s,
      count: reached.length,
      pct: Math.round((reached.length / orders.length) * 100),
      dwell: ["1.2 h", "0.3 h", "14 m", "18 m", "3.1 h", "9.4 h", "2.6 d"][STAGES.indexOf(s)],
      stalled: stalled.length,
      here: at.length,
    };
  });
};
