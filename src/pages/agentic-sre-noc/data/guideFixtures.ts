/**
 * Presentation-only fixtures for the Global Link Health Operating Guide.
 *
 * These records describe the operating method of the Global Link Health Twin.
 * They contain no operational records: every metric, risk, coworker and
 * scenario value shown in the guide is read from the existing page data.
 */

export interface GuideStage {
  index: number;
  key: string;
  title: string;
  oneLine: string;
  description: string;
  purpose: string;
  inputs: string[];
  processing: string;
  output: string;
  pageEvidence: string;
  coworker: string;
  status: "Complete" | "Active" | "Upcoming";
  latestResult: string;
}

export const guideStages: GuideStage[] = [
  {
    index: 1,
    key: "observe",
    title: "Observe",
    oneLine: "Collect terminal, optical, network, service and environmental telemetry",
    description:
      "Continuously collect terminal, optical, network, service, environmental, fallback, and platform telemetry.",
    purpose: "Maintain a current, trustworthy signal set for every optical link and customer service.",
    inputs: [
      "Beam lock", "Received optical power", "Link margin", "Optical attenuation", "Throughput",
      "Latency", "Packet loss", "Terminal health", "Weather conditions", "Telemetry freshness",
    ],
    processing: "Normalise and timestamp telemetry per terminal pair, then check collection freshness.",
    output: "A current signal set per link, with collection confidence.",
    pageEvidence: "Global Link Health Map and last telemetry timestamp in the page header.",
    coworker: "Telemetry Collection Agent",
    status: "Complete",
    latestResult: "Telemetry current for all monitored regions.",
  },
  {
    index: 2,
    key: "context",
    title: "Build Context",
    oneLine: "Connect each signal to the customer, route, terminals, fallback and SLO",
    description:
      "Connect each signal to the customer service, optical route, terminal pair, network handoff, fallback path, region, owner, and SLO that depend on it.",
    purpose: "Make each signal interpretable in customer and service terms rather than device terms.",
    inputs: [
      "Customer", "Customer service", "Service route", "Terminal A", "Optical path", "Terminal B",
      "Network handoff", "RF or fiber fallback", "Operating partner", "Service owner", "SLO", "Error budget",
    ],
    processing: "Resolve the dependency chain from signal to customer service and its objective.",
    output: "A service-aware view of every link and its dependants.",
    pageEvidence: "Top Link Risks table columns for route, region and customer impact.",
    coworker: "Service Context Agent",
    status: "Complete",
    latestResult: "Chennai links mapped to affected customer services and owners.",
  },
  {
    index: 3,
    key: "detect",
    title: "Detect Change",
    oneLine: "Identify deviation from link-specific baseline before threshold breach",
    description: "Identify deviations from normal behavior before they become threshold-based incidents.",
    purpose: "Surface drift early enough that preventive action is still possible.",
    inputs: [
      "Declining link margin", "Falling received optical power", "Increasing attenuation", "Alignment drift",
      "Repeated reacquisition", "Capacity pressure", "Fallback saturation", "Telemetry delay",
      "Regional pattern changes", "Deviation from link-specific baseline",
    ],
    processing: "Compare current behaviour against the per-link baseline and regional pattern.",
    output: "Ranked deviations with direction and rate of change.",
    pageEvidence: "Trend charts and the at-risk state filter on the KPI row.",
    coworker: "Anomaly Detection Agent",
    status: "Active",
    latestResult: "Chennai link margin trending downward with visibility decline.",
  },
  {
    index: 4,
    key: "predict",
    title: "Predict Risk",
    oneLine: "Estimate likely degradation, cause, time to impact and confidence",
    description:
      "Estimate which links are likely to degrade, the probable cause, expected time to impact, and confidence in the prediction.",
    purpose: "Give operations a defensible time window in which to act.",
    inputs: [
      "Risk probability", "Confidence", "Expected impact time", "Likely cause", "Links exposed",
      "Capacity exposed", "Services exposed", "Recommended intervention window",
    ],
    processing: "Project deviation forward against forecast conditions and historical degradation patterns.",
    output: "Per-link risk prediction with confidence and intervention window.",
    pageEvidence: "Top Link Risks, Next Six Hours panel.",
    coworker: "Risk Prediction Agent",
    status: "Active",
    latestResult: "Three Chennai links at high predicted risk within the next six hours.",
  },
  {
    index: 5,
    key: "impact",
    title: "Determine Impact",
    oneLine: "Calculate customer, capacity, SLO and operational consequence",
    description:
      "Calculate the customer, capacity, route, SLO, error-budget, and operational consequences of the condition.",
    purpose: "Prioritise by consequence rather than by alarm count.",
    inputs: [
      "Customers exposed", "Services exposed", "Committed capacity at risk", "Downstream sites affected",
      "SLO exposure", "Error-budget impact", "Service-credit exposure", "Field-service risk",
    ],
    processing: "Roll link risk up through the service dependency chain to customer and SLO exposure.",
    output: "Quantified customer and capacity exposure per condition.",
    pageEvidence: "Digital Twin Assessment and KPI capacity protected value.",
    coworker: "Impact Assessment Agent",
    status: "Active",
    latestResult: "Customer services remain available; committed capacity exposure quantified.",
  },
  {
    index: 6,
    key: "recommend",
    title: "Recommend Action",
    oneLine: "Compare actions on outcome, risk, policy, fallback readiness and reversibility",
    description:
      "Compare available actions using expected outcome, technical risk, customer impact, policy, fallback readiness, and reversibility.",
    purpose: "Present the smallest safe action that protects the customer outcome.",
    inputs: [
      "Increase monitoring frequency", "Open an investigation", "Validate fallback capacity",
      "Hold traffic on optical", "Move priority traffic to fallback", "Reacquire the beam",
      "Use an alternate route", "Restrict planned changes", "Escalate to engineering", "Dispatch field service",
    ],
    processing: "Score candidate actions against policy, guardrails and fallback headroom.",
    output: "Ranked recommendations with approval requirement and rollback path.",
    pageEvidence: "Recommended Actions, Next Six Hours in the Digital Twin Assessment.",
    coworker: "Action Recommendation Agent",
    status: "Active",
    latestResult: "Monitoring increase and fallback validation recommended; traffic move held.",
  },
  {
    index: 7,
    key: "validate",
    title: "Validate Recovery",
    oneLine: "Confirm service, route, terminal and SLO state after an action",
    description:
      "Confirm the customer service, optical route, terminals, fallback path, throughput, latency, packet loss, and SLO state after an action.",
    purpose: "Prove that the action worked before the situation is closed.",
    inputs: [
      "Service reachable", "Throughput restored", "Latency within objective", "Packet loss within threshold",
      "Beam lock stable", "Link margin recovered", "Fallback headroom sufficient", "Customer impact resolved",
      "Error budget updated", "Rollback remains available",
    ],
    processing: "Re-run service checks after execution and compare against pre-action state.",
    output: "Validation result with rollback availability.",
    pageEvidence: "Recent Outcomes panel and validation entries in Recent Activity.",
    coworker: "Recovery Validation Agent",
    status: "Upcoming",
    latestResult: "Awaiting execution of the preventive action.",
  },
  {
    index: 8,
    key: "learn",
    title: "Learn",
    oneLine: "Retain cause, evidence, successful action and environmental signature",
    description:
      "Capture the cause, evidence, successful action, failed alternatives, recovery sequence, validation results, and environmental signature for future use.",
    purpose: "Make the next occurrence faster to detect and cheaper to resolve.",
    inputs: [
      "Confirmed cause", "Signal pattern", "Similar incidents", "Successful runbook", "Eliminated causes",
      "Recovery timing", "Threshold effectiveness", "Customer outcome", "Product or fleet pattern",
      "Recommended future watch",
    ],
    processing: "Write the confirmed pattern and runbook result back into the twin knowledge base.",
    output: "Updated detection thresholds and reusable runbook.",
    pageEvidence: "Monthly metrics for preventive actions and outage minutes avoided.",
    coworker: "Knowledge Retention Agent",
    status: "Upcoming",
    latestResult: "Fog degradation signature queued for retention after validation.",
  },
];

export const guideOutcome = {
  primary:
    "Protect optical transport availability worldwide while maintaining customer service commitments and minimizing unnecessary use of fallback transport.",
  supporting: [
    "Keep customer connectivity available",
    "Identify link degradation before customer impact",
    "Reduce time to isolate the source of service risk",
    "Protect committed capacity and service-level objectives",
    "Use RF, fiber, or alternate optical routes only when required",
    "Restore traffic safely to the preferred optical path",
    "Reduce avoidable field dispatches",
    "Improve reliability from every incident and recovery",
  ],
  successStatement:
    "The Twin is successful when customer services remain healthy, risks are identified early, recovery actions are controlled, and optical transport is restored with minimal operational and customer impact.",
};

export const guideObjective = {
  primary:
    "Protect Chennai customer services from predicted fog-related optical degradation while preserving capacity and keeping RF fallback ready.",
  conditions: [
    "Six Chennai links under watch",
    "Three links at high predicted risk",
    "Visibility forecast declining",
    "Link margin trending downward",
    "Customer services still available",
    "RF fallback capacity validated",
    "No terminal hardware issue detected",
    "Preventive action window remains open",
  ],
  nextAction:
    "Increase monitoring frequency, validate fallback headroom, restrict nonessential changes, and prepare governed traffic movement if risk thresholds are reached.",
};
