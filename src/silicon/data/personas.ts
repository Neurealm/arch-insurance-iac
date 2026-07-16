import type { PersonaId, FilterKey } from "@/silicon/domain/types";

export interface PersonaDescriptor {
  id: PersonaId; label: string; role: string; emphasis: string[];
  defaultFilters: Partial<Record<FilterKey, string | string[]>>;
  approvalActions: string[];
  contextualHint: string;
}

export const PERSONAS: readonly PersonaDescriptor[] = [
  { id: "priya-nair",       label: "Priya Nair",       role: "Verification Lead",
    emphasis: ["regression", "coverage", "formal", "defect"],
    defaultFilters: { severity: ["high", "critical"], status: "open" },
    approvalActions: ["approve-ai-recommendation", "approve-change"],
    contextualHint: "You see coverage gaps, failure clusters, and AI root-cause first." },

  { id: "chip-architect",   label: "Arjun Shah",       role: "Chip Architect",
    emphasis: ["requirement", "specification", "interface"],
    defaultFilters: { requirementCategory: "Ordering" },
    approvalActions: ["approve-specification-change"],
    contextualHint: "Spec-to-RTL traceability leads. Regression detail is secondary." },

  { id: "dv-engineer",      label: "Marco Rossi",      role: "DV Engineer",
    emphasis: ["test", "regression", "coverage"],
    defaultFilters: { verificationMethod: "sim" },
    approvalActions: [],
    contextualHint: "Test-level detail and failure clusters emphasized." },

  { id: "program-manager",  label: "Elena Morales",    role: "Program Manager",
    emphasis: ["milestone", "signoff", "defect"],
    defaultFilters: {},
    approvalActions: ["approve-milestone-slip"],
    contextualHint: "Milestones and sign-off gates prioritized; deep RTL detail suppressed." },

  { id: "signoff-reviewer", label: "Sam Brooks",       role: "Sign-off Reviewer",
    emphasis: ["signoff", "formal", "static"],
    defaultFilters: { signoffState: "in-review" },
    approvalActions: ["approve-signoff-gate", "block-signoff-gate"],
    contextualHint: "Sign-off criteria evidence takes precedence." },
];
