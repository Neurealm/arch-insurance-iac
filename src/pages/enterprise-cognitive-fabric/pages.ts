export interface EcfPageDef {
  slug: string;
  title: string;
  group: string;
  purpose: string;
  duration: string;
}

export const ecfGroups = [
  "Overview",
  "Discovery & Understanding",
  "Modeling & Memory",
  "Evaluation & Decision",
  "Learning & Health",
  "Advanced Administration",
];

export const ecfModule = {
  title: "Enterprise Cognitive Fabric",
  subtitle: "A continuously learning enterprise operating model built on organizational intelligence.",
  description:
    "Placeholder module description. Enterprise Cognitive Fabric walks through discovering organizational knowledge, modelling it into approved team personas, remembering it, and using it to evaluate, decide, and learn.",
  duration: "≈ 75 min",
  objectives: [
    "Learning objective placeholder one",
    "Learning objective placeholder two",
    "Learning objective placeholder three",
    "Learning objective placeholder four",
  ],
};

export const ecfPages: EcfPageDef[] = [
  {
    slug: "enterprise-overview",
    title: "Enterprise Overview",
    group: "Overview",
    purpose: "Introduce Enterprise Cognitive Fabric and explain the business problem.",
    duration: "5 min",
  },
  {
    slug: "enterprise-source-discovery",
    title: "Enterprise Source Discovery",
    group: "Discovery & Understanding",
    purpose: "Discover organizational knowledge.",
    duration: "5 min",
  },
  {
    slug: "artifact-ingestion",
    title: "Artifact Ingestion",
    group: "Discovery & Understanding",
    purpose: "Collect enterprise artifacts.",
    duration: "5 min",
  },
  {
    slug: "artifact-normalization",
    title: "Artifact Normalization",
    group: "Discovery & Understanding",
    purpose: "Normalize enterprise artifacts into a machine-readable representation.",
    duration: "5 min",
  },
  {
    slug: "business-condition-extraction",
    title: "Business Condition Extraction",
    group: "Discovery & Understanding",
    purpose: "Extract business requirements, constraints, KPIs, dependencies, and decision rules.",
    duration: "5 min",
  },
  {
    slug: "team-persona-construction",
    title: "Team Persona Construction",
    group: "Modeling & Memory",
    purpose: "Compile discovered knowledge into an approved Team Persona.",
    duration: "5 min",
  },
  {
    slug: "enterprise-cognitive-memory",
    title: "Enterprise Cognitive Memory",
    group: "Modeling & Memory",
    purpose: "Store approved knowledge in the enterprise memory layer.",
    duration: "5 min",
  },
  {
    slug: "cognitive-intake",
    title: "Cognitive Intake",
    group: "Evaluation & Decision",
    purpose: "Receive new work before engineering begins.",
    duration: "5 min",
  },
  {
    slug: "cognitive-readiness-assessment",
    title: "Cognitive Readiness Assessment",
    group: "Evaluation & Decision",
    purpose: "Validate incoming work.",
    duration: "5 min",
  },
  {
    slug: "persona-impact-analysis",
    title: "Persona Impact Analysis",
    group: "Evaluation & Decision",
    purpose: "Evaluate proposed work against Team Personas.",
    duration: "5 min",
  },
  {
    slug: "cross-team-impact-matrix",
    title: "Cross-Team Impact Matrix",
    group: "Evaluation & Decision",
    purpose: "Compare the proposed work across multiple Team Personas.",
    duration: "5 min",
  },
  {
    slug: "decision-intelligence",
    title: "Decision Intelligence",
    group: "Evaluation & Decision",
    purpose: "Generate recommendations, approvals, and impact scores.",
    duration: "5 min",
  },
  {
    slug: "organizational-learning",
    title: "Organizational Learning",
    group: "Learning & Health",
    purpose: "Compare predicted outcomes against actual operational outcomes.",
    duration: "5 min",
  },
  {
    slug: "enterprise-cognitive-health",
    title: "Enterprise Cognitive Health",
    group: "Learning & Health",
    purpose: "Display enterprise-wide health, drift, confidence, and organizational intelligence.",
    duration: "5 min",
  },
  {
    slug: "discovery-configuration",
    title: "Discovery Configuration",
    group: "Advanced Administration",
    purpose: "Configure the Discovery Agent. Administrator function, presented as an advanced capability.",
    duration: "5 min",
  },
];
