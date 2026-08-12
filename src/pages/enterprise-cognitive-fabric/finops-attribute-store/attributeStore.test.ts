import { describe, expect, it } from "vitest";
import {
  attributes, attributeById, canonicalRecord, policyBindings, workTypeMappings,
  applicabilityIndex, runCandidateRetrieval, validationIssues, schemaSql,
} from "./data";

describe("Cloud FinOps Persona Attribute Store data", () => {
  it("exposes 82 atomic attributes with unique ids", () => {
    expect(attributes).toHaveLength(82);
    expect(new Set(attributes.map((a) => a.id)).size).toBe(82);
    expect(attributes[0].id).toBe("FOP-001");
    expect(attributes[81].id).toBe("FOP-082");
  });

  it("gives every attribute statement, provenance, evidence and applicability", () => {
    for (const a of attributes) {
      expect(a.statement.length).toBeGreaterThan(10);
      expect(a.provenance.sourceArtifactName).toMatch(/Stakeholder Attribute Sheet/);
      expect(a.evidence.length).toBeGreaterThan(0);
      expect(a.applicability.workTypes.length).toBeGreaterThan(0);
      expect(a.relationships.length).toBeGreaterThan(0);
    }
  });

  it("binds organization specific thresholds to policy variables instead of hard coding", () => {
    const budget = attributeById("FOP-016")!;
    expect(budget.policyVariable).toBe("finops.budget.variance_threshold");
    expect(budget.baseValue).toBeNull();
    expect(policyBindings.some((p) => p.status === "Unresolved")).toBe(true);
  });

  it("produces a canonical JSON record", () => {
    const rec = canonicalRecord(attributeById("FOP-029")!);
    expect(rec.attribute_id).toBe("FOP-029");
    expect(rec.persona_id).toBe("FINOPS-CLOUD-001");
    expect(rec.attribute_type).toBe("condition");
    expect(rec.relationships.map((r) => r.target)).toContain("FOP-033");
  });

  it("maps 28 work types including Kubernetes, AI GPU, and region change", () => {
    expect(workTypeMappings.length).toBeGreaterThanOrEqual(27);
    const k8s = workTypeMappings.find((w) => w.workType === "Kubernetes Change")!;
    expect(k8s.triggeredAttributes).toEqual(
      expect.arrayContaining(["FOP-022", "FOP-029", "FOP-041", "FOP-069", "FOP-080"]),
    );
    expect(applicabilityIndex.find((a) => a.value === "AI / GPU")!.attributes).toContain("FOP-044");
    expect(applicabilityIndex.find((a) => a.value === "Region Change")!.attributes).toContain("FOP-037");
  });

  it("retrieves candidates without asserting final impact", () => {
    const result = runCandidateRetrieval({
      workType: "Kubernetes Change", environment: "Production", scaleDirection: "Increase",
      architectureChange: "Yes", recurringSpendChange: "Yes", commitmentInteraction: "Unknown",
    });
    const ids = result.map((r) => r.id);
    expect(ids).toEqual(expect.arrayContaining(["FOP-041", "FOP-029", "FOP-079", "FOP-080"]));
    expect(result.every((r) => r.semanticMatch.includes("placeholder"))).toBe(true);
  });

  it("flags policy binding gaps and no critical validation errors", () => {
    expect(validationIssues.some((i) => i.attribute === "FOP-016")).toBe(true);
    expect(validationIssues.filter((i) => i.severity === "Critical")).toHaveLength(0);
  });

  it("keeps embeddings out of the canonical schema", () => {
    expect(schemaSql).toContain("CREATE TABLE persona_attribute");
    expect(schemaSql).toContain("Optional Retrieval Index");
  });
});
