/**
 * Page 47 · Artifact Supply Chain & Git Security
 * Route: /runops/supply-chain
 *
 * Protects scripts, packages, containers, binaries, and automation artifacts
 * used by runbooks. Traces source → commit → build → artifact → release →
 * execution and enforces policy on provenance, signatures, vulnerabilities,
 * licenses, and registry approval.
 *
 * Persistence (localStorage):
 *   runops.supply.repos.v1
 *   runops.supply.commits.v1
 *   runops.supply.builds.v1
 *   runops.supply.artifacts.v1
 *   runops.supply.sboms.v1
 *   runops.supply.deps.v1
 *   runops.supply.vulns.v1
 *   runops.supply.licenses.v1
 *   runops.supply.signatures.v1
 *   runops.supply.provenance.v1
 *   runops.supply.registries.v1
 *   runops.supply.quarantine.v1
 *   runops.audit.events.v1
 *   runops.domain.events.v1
 *   runops.launch.blocklist.v1         → Launch Center preflight cross-screen
 *   runops.operations.tasks.v1         → Operations Queue cross-screen
 *   runops.release.artifacts.v1        → Runbook Release cross-screen
 *   runops.evidence.artifacts.v1       → Evidence Replay cross-screen
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Ban, Boxes, CheckCircle2, FileSearch, GitCommit, GitBranch,
  Hammer, Lock, Package, PlayCircle, ScrollText, ShieldAlert, ShieldCheck,
  Sparkles, Undo2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* --------------------------------- Types -------------------------------- */

type ArtifactType = "script" | "package" | "container" | "binary" | "helm-chart" | "terraform-module";

type ArtifactState =
  | "Trusted"
  | "Unverified"
  | "Unsigned"
  | "Vulnerable"
  | "Quarantined"
  | "Blocked"
  | "Approved with exception";

type VulnSeverity = "low" | "medium" | "high" | "critical";
type LicenseState = "compliant" | "review" | "restricted" | "forbidden";
type SignatureState = "valid" | "invalid" | "missing" | "expired";
type ProvenanceState = "slsa-l3" | "slsa-l2" | "slsa-l1" | "none";
type RegistryApproval = "approved" | "pending" | "denied";

interface Repository {
  id: string;                 // REPO-XXXX
  name: string;               // owner/name
  provider: "github" | "gitlab" | "bitbucket";
  defaultBranch: string;
  protectedBranches: string[];
  requiredReviews: number;
  signedCommitsRequired: boolean;
  codeownersEnforced: boolean;
  lastPushAt: string;
  owner: string;
}

interface Commit {
  id: string;                 // 12-char sha
  repoId: string;
  author: string;
  message: string;
  signed: boolean;
  verified: boolean;
  at: string;
  branch: string;
}

interface Build {
  id: string;                 // BLD-XXXX
  repoId: string;
  commit: string;             // sha
  pipeline: string;           // e.g. "gha/release.yml"
  runner: string;             // e.g. "hosted-linux-x64"
  state: "success" | "failed" | "running";
  provenance: ProvenanceState;
  reproducibility: "verified" | "unverified" | "n/a";
  startedAt: string;
  durationSec: number;
}

interface Artifact {
  id: string;                 // ART-XXXX
  name: string;               // e.g. runops/payments-failover
  type: ArtifactType;
  repoId: string;
  commit: string;
  buildId: string;
  version: string;            // semver / tag
  digest: string;             // sha256:...
  signature: SignatureState;
  provenance: ProvenanceState;
  vulnState: "clean" | "advisory" | "vulnerable";
  licenseState: LicenseState;
  registryId: string;
  state: ArtifactState;
  reason: string;             // why blocked/quarantined (if applicable)
  recentExecutions: string[]; // execution ids
  createdAt: string;
  exceptionUntil: string | null;
}

interface SbomEntry {
  artifactId: string;
  format: "cyclonedx-1.5" | "spdx-2.3";
  componentCount: number;
  topComponents: Array<{ name: string; version: string; license: string }>;
  generatedAt: string;
}

interface Dependency {
  id: string;                 // DEP-XXXX
  artifactId: string;
  name: string;
  version: string;
  pinned: boolean;
  ecosystem: "npm" | "pypi" | "maven" | "go" | "oci";
  source: "registry" | "vendored" | "mirror";
  license: string;
}

interface Vulnerability {
  id: string;                 // CVE-XXXX-YYYY
  artifactId: string;
  component: string;
  severity: VulnSeverity;
  fixedIn: string | null;
  exploitInWild: boolean;
  advisoryUrl: string;
  taskId: string | null;      // linked operations task
}

interface LicenseFinding {
  id: string;                 // LIC-XXXX
  artifactId: string;
  component: string;
  license: string;            // SPDX id
  state: LicenseState;
  policyNote: string;
}

interface SignatureRecord {
  artifactId: string;
  signer: string;             // e.g. "keyless: gha://runops/release"
  method: "cosign-keyless" | "cosign-key" | "pgp";
  keyFingerprint: string;
  verifiedAt: string;
  state: SignatureState;
}

interface ProvenanceRecord {
  artifactId: string;
  buildId: string;
  builder: string;            // e.g. "github-actions"
  materials: number;
  slsaLevel: ProvenanceState;
  attestationDigest: string;
}

interface Registry {
  id: string;                 // REG-XXXX
  name: string;
  kind: "oci" | "npm" | "pypi" | "maven" | "generic";
  url: string;
  approval: RegistryApproval;
  owner: string;
  lastAuditAt: string;
}

interface QuarantineEntry {
  artifactId: string;
  reason: string;
  since: string;
  affectedExecutions: string[];
  affectedRunbooks: string[];
  requestedBy: string;
  releaseApprovedBy: string | null;
  releasedAt: string | null;
}

interface AuditEvent {
  id: string; at: string; kind: string; actor: string; target: string;
  detail: Record<string, string | number | boolean | string[] | null>;
}
interface DomainEvent {
  id: string; at: string; kind: string;
  payload: Record<string, string | number | boolean | string[] | null>;
}

type Tab =
  | "repositories" | "commits" | "builds" | "artifacts" | "sboms"
  | "dependencies" | "vulnerabilities" | "licenses" | "signatures"
  | "provenance" | "registries" | "quarantine";

/* --------------------------- Keys / constants --------------------------- */

const K_REPOS = "runops.supply.repos.v1";
const K_COMMITS = "runops.supply.commits.v1";
const K_BUILDS = "runops.supply.builds.v1";
const K_ARTIFACTS = "runops.supply.artifacts.v1";
const K_SBOMS = "runops.supply.sboms.v1";
const K_DEPS = "runops.supply.deps.v1";
const K_VULNS = "runops.supply.vulns.v1";
const K_LIC = "runops.supply.licenses.v1";
const K_SIGS = "runops.supply.signatures.v1";
const K_PROV = "runops.supply.provenance.v1";
const K_REG = "runops.supply.registries.v1";
const K_QUAR = "runops.supply.quarantine.v1";
const K_AUD = "runops.audit.events.v1";
const K_DOM = "runops.domain.events.v1";
const K_LAUNCH_BLOCK = "runops.launch.blocklist.v1";
const K_OPS_TASKS = "runops.operations.tasks.v1";
const K_REL_ART = "runops.release.artifacts.v1";
const K_EV_ART = "runops.evidence.artifacts.v1";

const ARTIFACT_STATES: readonly ArtifactState[] = [
  "Trusted", "Unverified", "Unsigned", "Vulnerable",
  "Quarantined", "Blocked", "Approved with exception",
] as const;

const AI_RECOMMENDATION = {
  id: "REC-SC-1",
  title: "Block ART-3004 from production execution",
  conclusion:
    "ART-3004 (runops/legacy-remediator:0.9.2) fails three enforcement gates: signature is missing, provenance is SLSA L1 (below the L2 minimum for prod), and it ships log4j-core@2.14.1 (CVE-2021-45046, high, exploited in wild). It is referenced by RB-1044 which is scheduled to run in 04:12. Recommend Block state and open a remediation task pinning log4j-core >= 2.17.1.",
  confidence: 91,
  uncertainty:
    "Confidence interval 86–95%. The signature could be re-generated within the SLA if the release pipeline is re-run against the same commit; if that happens the block auto-lifts once cosign verification and SLSA L2 attestation succeed.",
  supportingEvidence: [
    "signatures store: ART-3004 signature state = missing (last verify attempt 3h ago).",
    "provenance store: attestation reports SLSA L1, tenant policy `supply-chain-1.3` requires ≥ L2 for prod.",
    "SBOM: log4j-core@2.14.1 present; CVE-2021-45046 exploit-in-wild = true; fixedIn = 2.17.1.",
    "Runbook binding: RB-1044 v3.1 references ART-3004 as step 4 (bash-runner image).",
  ],
  contradictoryEvidence: [
    "ART-3004 has 42 successful staging executions in the last 30 days; no production incident history — a temporary exception is available if release timing is critical.",
  ],
  sources: [
    "policy://supply-chain/1.3",
    "sbom://ART-3004",
    "advisory://nvd/CVE-2021-45046",
    "audit://runops.audit.events (ART-3004)",
  ],
};

/* ------------------------------ Utilities ------------------------------- */

const now = () => new Date().toISOString();
const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function writeJSON<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

function shortDigest(d: string): string {
  return d.length > 19 ? `${d.slice(0, 19)}…` : d;
}

/* --------------------------- Deterministic seed ------------------------- */

function seedRepos(scenario: string): Repository[] {
  const base: Array<Omit<Repository, "lastPushAt">> = [
    { id: "REPO-01", name: "runops/payments-runbooks", provider: "github",
      defaultBranch: "main", protectedBranches: ["main", "release/*"], requiredReviews: 2,
      signedCommitsRequired: true, codeownersEnforced: true, owner: "payments-eng" },
    { id: "REPO-02", name: "runops/platform-actions", provider: "github",
      defaultBranch: "main", protectedBranches: ["main"], requiredReviews: 2,
      signedCommitsRequired: true, codeownersEnforced: true, owner: "platform-eng" },
    { id: "REPO-03", name: "runops/legacy-scripts", provider: "gitlab",
      defaultBranch: "master", protectedBranches: ["master"], requiredReviews: 1,
      signedCommitsRequired: false, codeownersEnforced: false, owner: "platform-eng" },
    { id: "REPO-04", name: "runops/worker-images", provider: "github",
      defaultBranch: "main", protectedBranches: ["main"], requiredReviews: 2,
      signedCommitsRequired: true, codeownersEnforced: true, owner: "platform-ai" },
  ];
  return base.map((r) => ({ ...r, lastPushAt: ago((hash(r.id + scenario) % 72) + 1) }));
}

function seedCommits(scenario: string): Commit[] {
  const rows: Array<Omit<Commit, "at">> = [
    { id: "a1b2c3d4e5f6", repoId: "REPO-01", author: "alex@payments", branch: "main",
      message: "Pin log4j-core to 2.17.1; regenerate SBOM", signed: true, verified: true },
    { id: "b2c3d4e5f6a1", repoId: "REPO-01", author: "priya@payments", branch: "release/1.4",
      message: "Cut release/1.4 for RB-1001", signed: true, verified: true },
    { id: "c3d4e5f6a1b2", repoId: "REPO-02", author: "mo@platform", branch: "main",
      message: "Rotate cosign keyless identity to gha://runops/release", signed: true, verified: true },
    { id: "d4e5f6a1b2c3", repoId: "REPO-03", author: "unknown@legacy", branch: "master",
      message: "hotfix bash-runner (unsigned)", signed: false, verified: false },
    { id: "e5f6a1b2c3d4", repoId: "REPO-04", author: "sam@platform-ai", branch: "main",
      message: "Rebuild worker-base image on hardened base", signed: true, verified: true },
  ];
  return rows.map((r) => ({ ...r, at: ago((hash(r.id + scenario) % 96) + 1) }));
}

function seedBuilds(scenario: string): Build[] {
  const rows: Array<Omit<Build, "startedAt">> = [
    { id: "BLD-9001", repoId: "REPO-01", commit: "a1b2c3d4e5f6", pipeline: "gha/release.yml",
      runner: "hosted-linux-x64", state: "success", provenance: "slsa-l3",
      reproducibility: "verified", durationSec: 412 },
    { id: "BLD-9002", repoId: "REPO-01", commit: "b2c3d4e5f6a1", pipeline: "gha/release.yml",
      runner: "hosted-linux-x64", state: "success", provenance: "slsa-l3",
      reproducibility: "verified", durationSec: 398 },
    { id: "BLD-9003", repoId: "REPO-02", commit: "c3d4e5f6a1b2", pipeline: "gha/release.yml",
      runner: "hosted-linux-x64", state: "success", provenance: "slsa-l2",
      reproducibility: "unverified", durationSec: 271 },
    { id: "BLD-9004", repoId: "REPO-03", commit: "d4e5f6a1b2c3", pipeline: "gitlab-ci.yml",
      runner: "self-hosted-legacy", state: "success", provenance: "slsa-l1",
      reproducibility: "n/a", durationSec: 88 },
    { id: "BLD-9005", repoId: "REPO-04", commit: "e5f6a1b2c3d4", pipeline: "gha/image.yml",
      runner: "hosted-linux-x64", state: "success", provenance: "slsa-l3",
      reproducibility: "verified", durationSec: 604 },
  ];
  return rows.map((r) => ({ ...r, startedAt: ago((hash(r.id + scenario) % 120) + 2) }));
}

function seedArtifacts(scenario: string): Artifact[] {
  const rows: Array<Omit<Artifact, "createdAt" | "digest">> = [
    { id: "ART-3001", name: "runops/payments-failover", type: "container",
      repoId: "REPO-01", commit: "a1b2c3d4e5f6", buildId: "BLD-9001", version: "1.4.2",
      signature: "valid", provenance: "slsa-l3", vulnState: "clean",
      licenseState: "compliant", registryId: "REG-01",
      state: "Trusted", reason: "",
      recentExecutions: ["EX-8891", "EX-8912", "EX-8933"], exceptionUntil: null },
    { id: "ART-3002", name: "runops/payments-runbook", type: "package",
      repoId: "REPO-01", commit: "b2c3d4e5f6a1", buildId: "BLD-9002", version: "1.4.0",
      signature: "valid", provenance: "slsa-l3", vulnState: "advisory",
      licenseState: "compliant", registryId: "REG-02",
      state: "Trusted", reason: "",
      recentExecutions: ["EX-8801"], exceptionUntil: null },
    { id: "ART-3003", name: "runops/platform-actions", type: "package",
      repoId: "REPO-02", commit: "c3d4e5f6a1b2", buildId: "BLD-9003", version: "0.7.1",
      signature: "valid", provenance: "slsa-l2", vulnState: "clean",
      licenseState: "review", registryId: "REG-02",
      state: "Unverified", reason: "Reproducible-build check has not completed for this version.",
      recentExecutions: [], exceptionUntil: null },
    { id: "ART-3004", name: "runops/legacy-remediator", type: "container",
      repoId: "REPO-03", commit: "d4e5f6a1b2c3", buildId: "BLD-9004", version: "0.9.2",
      signature: "missing", provenance: "slsa-l1", vulnState: "vulnerable",
      licenseState: "review", registryId: "REG-03",
      state: "Blocked",
      reason: "No cosign signature; provenance SLSA L1 below prod minimum L2; ships log4j-core 2.14.1 (CVE-2021-45046, high).",
      recentExecutions: [], exceptionUntil: null },
    { id: "ART-3005", name: "runops/worker-base", type: "container",
      repoId: "REPO-04", commit: "e5f6a1b2c3d4", buildId: "BLD-9005", version: "2.1.0",
      signature: "valid", provenance: "slsa-l3", vulnState: "clean",
      licenseState: "compliant", registryId: "REG-01",
      state: "Trusted", reason: "",
      recentExecutions: ["EX-8710", "EX-8721"], exceptionUntil: null },
    { id: "ART-3006", name: "runops/db-restore", type: "script",
      repoId: "REPO-03", commit: "d4e5f6a1b2c3", buildId: "BLD-9004", version: "1.0.4",
      signature: "invalid", provenance: "slsa-l1", vulnState: "clean",
      licenseState: "restricted", registryId: "REG-03",
      state: "Quarantined",
      reason: "Signature does not chain to any approved signer; license (GPL-3.0-only) forbidden in this tenant policy.",
      recentExecutions: [], exceptionUntil: null },
    { id: "ART-3007", name: "runops/terraform-guardrails", type: "terraform-module",
      repoId: "REPO-02", commit: "c3d4e5f6a1b2", buildId: "BLD-9003", version: "3.2.0",
      signature: "valid", provenance: "slsa-l2", vulnState: "clean",
      licenseState: "compliant", registryId: "REG-04",
      state: "Approved with exception",
      reason: "SLSA L2 accepted with time-boxed exception; L3 attestation targeted next release.",
      recentExecutions: ["EX-8600"], exceptionUntil: ago(-24 * 14) },
  ];
  return rows.map((r) => {
    const s = hash(`${r.id}::${scenario}`);
    const hex = (s.toString(16) + "0".repeat(64)).slice(0, 64);
    return { ...r, digest: `sha256:${hex}`, createdAt: ago((s % 360) + 6) };
  });
}

function seedSboms(arts: Artifact[]): SbomEntry[] {
  return arts.map((a) => ({
    artifactId: a.id,
    format: "cyclonedx-1.5",
    componentCount: 40 + (hash(a.id) % 260),
    generatedAt: a.createdAt,
    topComponents:
      a.id === "ART-3004"
        ? [
            { name: "log4j-core", version: "2.14.1", license: "Apache-2.0" },
            { name: "bash", version: "5.1", license: "GPL-3.0-or-later" },
            { name: "curl", version: "7.68.0", license: "MIT" },
          ]
        : a.id === "ART-3006"
        ? [
            { name: "postgres-client", version: "14.9", license: "PostgreSQL" },
            { name: "gpg-tools", version: "2.2.27", license: "GPL-3.0-only" },
          ]
        : [
            { name: "runops-runtime", version: "1.4.2", license: "Apache-2.0" },
            { name: "openssl", version: "3.0.13", license: "Apache-2.0" },
            { name: "node", version: "20.11.1", license: "MIT" },
          ],
  }));
}

function seedDeps(arts: Artifact[]): Dependency[] {
  const out: Dependency[] = [];
  for (const a of arts) {
    const base: Array<Omit<Dependency, "id" | "artifactId">> = a.id === "ART-3004"
      ? [
          { name: "log4j-core", version: "2.14.1", pinned: false, ecosystem: "maven", source: "registry", license: "Apache-2.0" },
          { name: "bash", version: "5.1", pinned: true, ecosystem: "oci", source: "registry", license: "GPL-3.0-or-later" },
        ]
      : a.id === "ART-3006"
      ? [
          { name: "postgres-client", version: "14.9", pinned: true, ecosystem: "oci", source: "registry", license: "PostgreSQL" },
          { name: "gpg-tools", version: "2.2.27", pinned: false, ecosystem: "oci", source: "mirror", license: "GPL-3.0-only" },
        ]
      : [
          { name: "runops-runtime", version: "1.4.2", pinned: true, ecosystem: "npm", source: "registry", license: "Apache-2.0" },
          { name: "openssl", version: "3.0.13", pinned: true, ecosystem: "oci", source: "registry", license: "Apache-2.0" },
        ];
    base.forEach((d, i) => out.push({ id: `DEP-${a.id.slice(4)}-${i + 1}`, artifactId: a.id, ...d }));
  }
  return out;
}

function seedVulns(): Vulnerability[] {
  return [
    { id: "CVE-2021-45046", artifactId: "ART-3004", component: "log4j-core",
      severity: "high", fixedIn: "2.17.1", exploitInWild: true,
      advisoryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2021-45046", taskId: null },
    { id: "GHSA-4wf5-vphf-c2xc", artifactId: "ART-3002", component: "lodash",
      severity: "medium", fixedIn: "4.17.21", exploitInWild: false,
      advisoryUrl: "https://github.com/advisories/GHSA-4wf5-vphf-c2xc", taskId: null },
    { id: "CVE-2023-4863", artifactId: "ART-3005", component: "libwebp",
      severity: "low", fixedIn: "1.3.2", exploitInWild: false,
      advisoryUrl: "https://nvd.nist.gov/vuln/detail/CVE-2023-4863", taskId: null },
  ];
}

function seedLicenses(): LicenseFinding[] {
  return [
    { id: "LIC-01", artifactId: "ART-3006", component: "gpg-tools", license: "GPL-3.0-only",
      state: "forbidden", policyNote: "Copyleft GPL forbidden for prod-distributed artifacts per policy license-2.1." },
    { id: "LIC-02", artifactId: "ART-3003", component: "ffmpeg", license: "LGPL-2.1-or-later",
      state: "review", policyNote: "LGPL requires dynamic-linking review before prod release." },
    { id: "LIC-03", artifactId: "ART-3004", component: "bash", license: "GPL-3.0-or-later",
      state: "restricted", policyNote: "Permitted only for internal-execution containers, not redistributed." },
    { id: "LIC-04", artifactId: "ART-3001", component: "openssl", license: "Apache-2.0",
      state: "compliant", policyNote: "OK." },
  ];
}

function seedSignatures(arts: Artifact[]): SignatureRecord[] {
  return arts.map((a) => ({
    artifactId: a.id,
    signer: a.signature === "missing" ? "—" :
            a.signature === "invalid" ? "keyless: gha://legacy/unknown" :
            "keyless: gha://runops/release",
    method: a.signature === "missing" ? "cosign-keyless" : "cosign-keyless",
    keyFingerprint: a.signature === "missing" ? "—" :
      `SHA256:${(hash(a.id + "sig")).toString(16).padStart(16, "0").slice(0, 16)}…`,
    verifiedAt: a.createdAt,
    state: a.signature,
  }));
}

function seedProvenance(arts: Artifact[]): ProvenanceRecord[] {
  return arts.map((a) => ({
    artifactId: a.id,
    buildId: a.buildId,
    builder: a.buildId.startsWith("BLD-900") ? "github-actions" : "gitlab-ci",
    materials: 6 + (hash(a.id + "prov") % 40),
    slsaLevel: a.provenance,
    attestationDigest: `sha256:${(hash(a.id + "att").toString(16) + "0".repeat(64)).slice(0, 64)}`,
  }));
}

function seedRegistries(): Registry[] {
  return [
    { id: "REG-01", name: "acme-oci", kind: "oci", url: "oci://reg.acme.internal",
      approval: "approved", owner: "platform-eng", lastAuditAt: ago(24 * 3) },
    { id: "REG-02", name: "acme-npm-internal", kind: "npm", url: "https://npm.acme.internal",
      approval: "approved", owner: "platform-eng", lastAuditAt: ago(24 * 6) },
    { id: "REG-03", name: "legacy-nexus", kind: "generic", url: "https://nexus.legacy.acme",
      approval: "pending", owner: "platform-eng", lastAuditAt: ago(24 * 30) },
    { id: "REG-04", name: "acme-terraform", kind: "generic", url: "https://tf.acme.internal",
      approval: "approved", owner: "platform-eng", lastAuditAt: ago(24 * 9) },
    { id: "REG-05", name: "pypi-public-mirror", kind: "pypi", url: "https://pypi-mirror.acme.internal",
      approval: "denied", owner: "security-eng", lastAuditAt: ago(24 * 45) },
  ];
}

function seedQuarantine(arts: Artifact[]): QuarantineEntry[] {
  return arts
    .filter((a) => a.state === "Quarantined" || a.state === "Blocked")
    .map((a) => ({
      artifactId: a.id,
      reason: a.reason,
      since: ago(6),
      affectedExecutions: a.id === "ART-3004" ? ["EX-9001 (scheduled)"] : [],
      affectedRunbooks: a.id === "ART-3004" ? ["RB-1044"] : a.id === "ART-3006" ? ["RB-1180"] : [],
      requestedBy: "supply-chain.policy",
      releaseApprovedBy: null,
      releasedAt: null,
    }));
}

/* --------------------------- Cross-screen keys -------------------------- */

interface LaunchBlock {
  artifactId: string; reason: string; state: ArtifactState; at: string;
}
interface OpsTask {
  id: string; kind: string; artifactId: string; title: string; severity: VulnSeverity | "policy";
  at: string; state: "open" | "in_progress" | "done";
}
interface ReleaseArtifactLink {
  artifactId: string; version: string; state: ArtifactState; digest: string;
}
interface EvidenceArtifactLink {
  artifactId: string; digest: string; state: ArtifactState; provenance: ProvenanceState;
}

function projectLaunchBlocklist(arts: Artifact[]): LaunchBlock[] {
  return arts
    .filter((a) => a.state === "Blocked" || a.state === "Quarantined")
    .map((a) => ({ artifactId: a.id, reason: a.reason, state: a.state, at: now() }));
}
function projectReleaseArtifacts(arts: Artifact[]): ReleaseArtifactLink[] {
  return arts.map((a) => ({ artifactId: a.id, version: a.version, state: a.state, digest: a.digest }));
}
function projectEvidenceArtifacts(arts: Artifact[]): EvidenceArtifactLink[] {
  return arts.map((a) => ({ artifactId: a.id, digest: a.digest, state: a.state, provenance: a.provenance }));
}

/* -------------------------- Audit / domain events ----------------------- */

function appendAudit(kind: string, actor: string, target: string, detail: AuditEvent["detail"]): void {
  const prev = readJSON<AuditEvent[]>(K_AUD, []);
  const evt: AuditEvent = { id: `AUD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: now(), kind, actor, target, detail };
  writeJSON(K_AUD, [evt, ...prev].slice(0, 500));
}
function appendDomain(kind: string, payload: DomainEvent["payload"]): void {
  const prev = readJSON<DomainEvent[]>(K_DOM, []);
  const evt: DomainEvent = { id: `DOM-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: now(), kind, payload };
  writeJSON(K_DOM, [evt, ...prev].slice(0, 500));
}

/* -------------------------------- Badges -------------------------------- */

function StateBadge({ state }: { state: ArtifactState }) {
  const map: Record<ArtifactState, string> = {
    Trusted: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Unverified: "bg-slate-100 text-slate-700 border-slate-200",
    Unsigned: "bg-amber-100 text-amber-800 border-amber-200",
    Vulnerable: "bg-orange-100 text-orange-800 border-orange-200",
    Quarantined: "bg-rose-100 text-rose-800 border-rose-200",
    Blocked: "bg-red-100 text-red-800 border-red-200",
    "Approved with exception": "bg-indigo-100 text-indigo-800 border-indigo-200",
  };
  return <Badge className={cn("border text-[10px]", map[state])} variant="outline">{state}</Badge>;
}

function SigBadge({ s }: { s: SignatureState }) {
  const map: Record<SignatureState, string> = {
    valid: "bg-emerald-100 text-emerald-800 border-emerald-200",
    invalid: "bg-red-100 text-red-800 border-red-200",
    missing: "bg-amber-100 text-amber-800 border-amber-200",
    expired: "bg-orange-100 text-orange-800 border-orange-200",
  };
  return <Badge variant="outline" className={cn("border text-[10px]", map[s])}>{s}</Badge>;
}

function ProvBadge({ p }: { p: ProvenanceState }) {
  const label = p === "none" ? "no provenance" : p.toUpperCase();
  const map: Record<ProvenanceState, string> = {
    "slsa-l3": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "slsa-l2": "bg-teal-100 text-teal-800 border-teal-200",
    "slsa-l1": "bg-amber-100 text-amber-800 border-amber-200",
    none: "bg-red-100 text-red-800 border-red-200",
  };
  return <Badge variant="outline" className={cn("border text-[10px]", map[p])}>{label}</Badge>;
}

function SevBadge({ s }: { s: VulnSeverity }) {
  const map: Record<VulnSeverity, string> = {
    critical: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return <Badge variant="outline" className={cn("border text-[10px]", map[s])}>{s}</Badge>;
}

/* ================================ Page ================================= */

export default function SupplyChain() {
  const ops = useOperations();
  const scenario = String(ops.stageIndex ?? "0");
  const role = ops.role;
  const tenantName = ops.tenant?.name ?? "tenant";

  const [tab, setTab] = useState<Tab>("artifacts");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<ArtifactState | "all">("all");

  const [repos, setRepos] = useState<Repository[]>(() =>
    readJSON<Repository[] | null>(K_REPOS, null) ?? seedRepos(scenario));
  const [commits, setCommits] = useState<Commit[]>(() =>
    readJSON<Commit[] | null>(K_COMMITS, null) ?? seedCommits(scenario));
  const [builds, setBuilds] = useState<Build[]>(() =>
    readJSON<Build[] | null>(K_BUILDS, null) ?? seedBuilds(scenario));
  const [artifacts, setArtifacts] = useState<Artifact[]>(() =>
    readJSON<Artifact[] | null>(K_ARTIFACTS, null) ?? seedArtifacts(scenario));
  const [sboms] = useState<SbomEntry[]>(() =>
    readJSON<SbomEntry[] | null>(K_SBOMS, null) ?? seedSboms(seedArtifacts(scenario)));
  const [deps] = useState<Dependency[]>(() =>
    readJSON<Dependency[] | null>(K_DEPS, null) ?? seedDeps(seedArtifacts(scenario)));
  const [vulns, setVulns] = useState<Vulnerability[]>(() =>
    readJSON<Vulnerability[] | null>(K_VULNS, null) ?? seedVulns());
  const [licenses] = useState<LicenseFinding[]>(() =>
    readJSON<LicenseFinding[] | null>(K_LIC, null) ?? seedLicenses());
  const [signatures, setSignatures] = useState<SignatureRecord[]>(() =>
    readJSON<SignatureRecord[] | null>(K_SIGS, null) ?? seedSignatures(seedArtifacts(scenario)));
  const [provenance] = useState<ProvenanceRecord[]>(() =>
    readJSON<ProvenanceRecord[] | null>(K_PROV, null) ?? seedProvenance(seedArtifacts(scenario)));
  const [registries, setRegistries] = useState<Registry[]>(() =>
    readJSON<Registry[] | null>(K_REG, null) ?? seedRegistries());
  const [quarantine, setQuarantine] = useState<QuarantineEntry[]>(() =>
    readJSON<QuarantineEntry[] | null>(K_QUAR, null) ?? seedQuarantine(seedArtifacts(scenario)));

  // Dialog state
  const [inspect, setInspect] = useState<Artifact | null>(null);
  const [compareA, setCompareA] = useState<string>("ART-3001");
  const [compareB, setCompareB] = useState<string>("ART-3002");
  const [showCompare, setShowCompare] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [exceptionOpen, setExceptionOpen] = useState<Artifact | null>(null);
  const [exceptionNote, setExceptionNote] = useState("");
  const [remediationOpen, setRemediationOpen] = useState<Vulnerability | null>(null);
  const [remediationNote, setRemediationNote] = useState("");

  /* ---------------------- Cross-screen sync effects --------------------- */

  useEffect(() => { writeJSON(K_REPOS, repos); }, [repos]);
  useEffect(() => { writeJSON(K_COMMITS, commits); }, [commits]);
  useEffect(() => { writeJSON(K_BUILDS, builds); }, [builds]);
  useEffect(() => {
    writeJSON(K_ARTIFACTS, artifacts);
    writeJSON(K_LAUNCH_BLOCK, projectLaunchBlocklist(artifacts));
    writeJSON(K_REL_ART, projectReleaseArtifacts(artifacts));
    writeJSON(K_EV_ART, projectEvidenceArtifacts(artifacts));
  }, [artifacts]);
  useEffect(() => { writeJSON(K_VULNS, vulns); }, [vulns]);
  useEffect(() => { writeJSON(K_SIGS, signatures); }, [signatures]);
  useEffect(() => { writeJSON(K_REG, registries); }, [registries]);
  useEffect(() => { writeJSON(K_QUAR, quarantine); }, [quarantine]);

  /* ------------------------------ Helpers ------------------------------- */

  const filteredArtifacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return artifacts.filter((a) => {
      if (stateFilter !== "all" && a.state !== stateFilter) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.version.toLowerCase().includes(q) ||
        a.commit.toLowerCase().includes(q)
      );
    });
  }, [artifacts, stateFilter, search]);

  const counts = useMemo(() => {
    const c: Record<ArtifactState, number> = {
      Trusted: 0, Unverified: 0, Unsigned: 0, Vulnerable: 0,
      Quarantined: 0, Blocked: 0, "Approved with exception": 0,
    };
    for (const a of artifacts) c[a.state]++;
    return c;
  }, [artifacts]);

  /* ------------------------------ Actions ------------------------------- */

  const setArtifactState = useCallback((id: string, next: ArtifactState, reason: string, kind: string) => {
    setArtifacts((prev) => prev.map((a) => a.id === id ? { ...a, state: next, reason } : a));
    appendAudit(kind, `${role}@${tenantName}`, id, { from: "state", to: next, reason });
    appendDomain(kind, { artifactId: id, state: next, reason });
  }, [role, tenantName]);

  const onVerifySignature = useCallback((a: Artifact) => {
    // Deterministic simulation: only signatures already `valid` or `expired` re-verify to valid.
    const verified: SignatureState = a.signature === "valid" || a.signature === "expired" ? "valid"
      : a.signature === "invalid" ? "invalid" : "missing";
    setSignatures((prev) => prev.map((s) => s.artifactId === a.id ? { ...s, state: verified, verifiedAt: now() } : s));
    setArtifacts((prev) => prev.map((x) => x.id === a.id ? { ...x, signature: verified } : x));
    appendAudit("supply.signature.verify", `${role}@${tenantName}`, a.id, { result: verified, method: "cosign-keyless" });
    appendDomain("supply.signature.verify", { artifactId: a.id, result: verified });
  }, [role, tenantName]);

  const onQuarantine = useCallback((a: Artifact, reason: string) => {
    setArtifactState(a.id, "Quarantined", reason, "supply.artifact.quarantine");
    setQuarantine((prev) => {
      if (prev.some((q) => q.artifactId === a.id)) return prev;
      return [...prev, {
        artifactId: a.id, reason, since: now(),
        affectedExecutions: a.recentExecutions,
        affectedRunbooks: [],
        requestedBy: `${role}@${tenantName}`,
        releaseApprovedBy: null, releasedAt: null,
      }];
    });
  }, [role, tenantName, setArtifactState]);

  const onBlock = useCallback((a: Artifact, reason: string) => {
    setArtifactState(a.id, "Blocked", reason, "supply.artifact.block");
  }, [setArtifactState]);

  const onRelease = useCallback((a: Artifact) => {
    setArtifactState(a.id, "Trusted", "Released after approval", "supply.artifact.release");
    setQuarantine((prev) => prev.map((q) => q.artifactId === a.id
      ? { ...q, releaseApprovedBy: `${role}@${tenantName}`, releasedAt: now() } : q));
  }, [role, tenantName, setArtifactState]);

  const onApproveException = useCallback((a: Artifact, note: string) => {
    const until = new Date(Date.now() + 14 * 86_400_000).toISOString();
    setArtifacts((prev) => prev.map((x) => x.id === a.id
      ? { ...x, state: "Approved with exception", reason: note || "Time-boxed exception (14 days).", exceptionUntil: until } : x));
    appendAudit("supply.artifact.exception", `${role}@${tenantName}`, a.id, { until, note });
    appendDomain("supply.artifact.exception", { artifactId: a.id, until, note });
  }, [role, tenantName]);

  const onPinDep = useCallback((d: Dependency) => {
    // Persist pin via a compact record on domain events (deps store is derived).
    appendAudit("supply.dependency.pin", `${role}@${tenantName}`, d.id,
      { artifactId: d.artifactId, name: d.name, version: d.version });
    appendDomain("supply.dependency.pin", { artifactId: d.artifactId, dependency: d.name, version: d.version });
  }, [role, tenantName]);

  const onCreateRemediation = useCallback((v: Vulnerability, note: string) => {
    const taskId = `TASK-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    setVulns((prev) => prev.map((x) => x.id === v.id ? { ...x, taskId } : x));
    const tasksPrev = readJSON<OpsTask[]>(K_OPS_TASKS, []);
    const task: OpsTask = {
      id: taskId, kind: "supply.remediation", artifactId: v.artifactId,
      title: `Remediate ${v.component} ${v.id} in ${v.artifactId}${v.fixedIn ? ` (upgrade to ${v.fixedIn})` : ""}`,
      severity: v.severity, at: now(), state: "open",
    };
    writeJSON(K_OPS_TASKS, [task, ...tasksPrev].slice(0, 200));
    appendAudit("supply.remediation.create", `${role}@${tenantName}`, v.id, { taskId, artifactId: v.artifactId, note });
    appendDomain("supply.remediation.create", { taskId, artifactId: v.artifactId, cve: v.id, note });
  }, [role, tenantName]);

  const onApproveRegistry = useCallback((r: Registry) => {
    setRegistries((prev) => prev.map((x) => x.id === r.id
      ? { ...x, approval: "approved", lastAuditAt: now() } : x));
    appendAudit("supply.registry.approve", `${role}@${tenantName}`, r.id, { name: r.name });
    appendDomain("supply.registry.approve", { registryId: r.id, name: r.name });
  }, [role, tenantName]);

  const openInspect = useCallback((a: Artifact) => setInspect(a), []);

  /* ------------------------------ Render -------------------------------- */

  const totalArtifacts = artifacts.length;
  const dependentRunbooks = (aId: string): string[] =>
    quarantine.find((q) => q.artifactId === aId)?.affectedRunbooks ??
    (aId === "ART-3001" ? ["RB-1001"] :
      aId === "ART-3002" ? ["RB-1001", "RB-1008"] :
      aId === "ART-3005" ? ["RB-1101", "RB-1102"] : []);

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <EntityHeader
        eyebrow="Governance · Integrations"
        title="Artifact Supply Chain & Git Security"
        subtitle="Every executable artifact traced from source, through build, to release and execution."
        status={{ label: `${counts.Trusted} trusted · ${counts.Blocked + counts.Quarantined} restricted`, tone: counts.Blocked > 0 ? "critical" : "healthy" }}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAI(true)}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI recommendation
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowCompare(true)}>
              Compare versions
            </Button>
          </div>
        }
        meta={
          <>
            <span>tenant · <strong>{tenantName}</strong></span>
            <span>·</span>
            <span>env · <strong>{ops.environment}</strong></span>
            <span>·</span>
            <span>role · <strong>{role}</strong></span>
            <span>·</span>
            <span>scenario stage · <strong>{scenario}</strong></span>
            <span>·</span>
            <span>{totalArtifacts} artifacts · {vulns.length} vulnerabilities · {registries.length} registries</span>
          </>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-3 mt-2 flex w-fit flex-wrap justify-start bg-white">
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="commits">Commits</TabsTrigger>
          <TabsTrigger value="builds">Builds</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
          <TabsTrigger value="sboms">SBOMs</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
          <TabsTrigger value="provenance">Provenance</TabsTrigger>
          <TabsTrigger value="registries">Registries</TabsTrigger>
          <TabsTrigger value="quarantine">Quarantine</TabsTrigger>
        </TabsList>

        {/* ============================ ARTIFACTS ============================ */}
        <TabsContent value="artifacts" className="mx-3 my-3 min-h-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search by name, ID, version, or commit"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 max-w-sm"
            />
            <Select value={stateFilter} onValueChange={(v) => setStateFilter(v as ArtifactState | "all")}>
              <SelectTrigger className="h-8 w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                {ARTIFACT_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s} ({counts[s]})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
              {ARTIFACT_STATES.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5">
                  <StateBadge state={s} /> <span className="tabular-nums">{counts[s]}</span>
                </span>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Artifact</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Source · Commit</th>
                    <th className="px-3 py-2">Build</th>
                    <th className="px-3 py-2">Version</th>
                    <th className="px-3 py-2">Signature</th>
                    <th className="px-3 py-2">Provenance</th>
                    <th className="px-3 py-2">Vuln</th>
                    <th className="px-3 py-2">License</th>
                    <th className="px-3 py-2">Registry</th>
                    <th className="px-3 py-2">State</th>
                    <th className="px-3 py-2">Recent</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArtifacts.map((a) => {
                    const repo = repos.find((r) => r.id === a.repoId);
                    const reg = registries.find((r) => r.id === a.registryId);
                    return (
                      <tr key={a.id} className="border-t border-slate-100 align-top hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <div className="font-medium text-slate-900">{a.name}</div>
                          <div className="text-[10px] text-slate-500">{a.id} · <span className="font-mono">{shortDigest(a.digest)}</span></div>
                        </td>
                        <td className="px-3 py-2">{a.type}</td>
                        <td className="px-3 py-2">
                          <div>{repo?.name ?? a.repoId}</div>
                          <div className="font-mono text-[10px] text-slate-500">{a.commit.slice(0, 12)}</div>
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] text-slate-600">{a.buildId}</td>
                        <td className="px-3 py-2 font-mono">{a.version}</td>
                        <td className="px-3 py-2"><SigBadge s={a.signature} /></td>
                        <td className="px-3 py-2"><ProvBadge p={a.provenance} /></td>
                        <td className="px-3 py-2">
                          {a.vulnState === "clean" && <span className="text-emerald-700">clean</span>}
                          {a.vulnState === "advisory" && <span className="text-amber-700">advisory</span>}
                          {a.vulnState === "vulnerable" && <span className="text-red-700">vulnerable</span>}
                        </td>
                        <td className="px-3 py-2">{a.licenseState}</td>
                        <td className="px-3 py-2">
                          {reg?.name ?? a.registryId}
                          <div className="text-[10px] text-slate-500">{reg?.approval}</div>
                        </td>
                        <td className="px-3 py-2"><StateBadge state={a.state} /></td>
                        <td className="px-3 py-2 text-[10px] text-slate-600">
                          {a.recentExecutions.length ? a.recentExecutions.join(", ") : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            <Button size="sm" variant="outline" onClick={() => openInspect(a)}>Inspect</Button>
                            <Button size="sm" variant="outline" onClick={() => onVerifySignature(a)}>
                              <ShieldCheck className="mr-1 h-3 w-3" /> Verify
                            </Button>
                            {a.state !== "Quarantined" && a.state !== "Blocked" && (
                              <Button size="sm" variant="outline" onClick={() => onQuarantine(a, `Quarantined by ${role}`)}>
                                <Ban className="mr-1 h-3 w-3" /> Quarantine
                              </Button>
                            )}
                            {(a.state === "Quarantined") && (
                              <Button size="sm" variant="outline" onClick={() => onRelease(a)}>
                                <Undo2 className="mr-1 h-3 w-3" /> Release
                              </Button>
                            )}
                            {(a.state === "Blocked" || a.state === "Quarantined" || a.state === "Vulnerable" || a.state === "Unsigned") && (
                              <Button size="sm" variant="outline"
                                onClick={() => { setExceptionOpen(a); setExceptionNote(""); }}>
                                Grant exception
                              </Button>
                            )}
                            {a.state !== "Blocked" && a.vulnState === "vulnerable" && (
                              <Button size="sm" variant="destructive"
                                onClick={() => onBlock(a, "Manual block: production execution not permitted while vulnerable.")}>
                                Block
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredArtifacts.length === 0 && (
                    <tr><td colSpan={13} className="px-3 py-6 text-center text-slate-500">
                      No artifacts match the current filter.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================ REPOSITORIES ============================ */}
        <TabsContent value="repositories" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600"><tr>
                <th className="px-3 py-2">Repository</th><th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Default branch</th><th className="px-3 py-2">Protected</th>
                <th className="px-3 py-2">Required reviews</th><th className="px-3 py-2">Signed commits</th>
                <th className="px-3 py-2">CODEOWNERS</th><th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Last push</th>
              </tr></thead>
              <tbody>
                {repos.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2">{r.provider}</td>
                    <td className="px-3 py-2 font-mono">{r.defaultBranch}</td>
                    <td className="px-3 py-2">{r.protectedBranches.join(", ")}</td>
                    <td className="px-3 py-2">{r.requiredReviews}</td>
                    <td className="px-3 py-2">{r.signedCommitsRequired ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" /> : "—"}</td>
                    <td className="px-3 py-2">{r.codeownersEnforced ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" /> : "—"}</td>
                    <td className="px-3 py-2">{r.owner}</td>
                    <td className="px-3 py-2 text-slate-500">{new Date(r.lastPushAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ============================ COMMITS ============================ */}
        <TabsContent value="commits" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600"><tr>
                <th className="px-3 py-2">SHA</th><th className="px-3 py-2">Repository</th>
                <th className="px-3 py-2">Branch</th><th className="px-3 py-2">Author</th>
                <th className="px-3 py-2">Message</th><th className="px-3 py-2">Signed</th>
                <th className="px-3 py-2">Verified</th><th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Actions</th>
              </tr></thead>
              <tbody>
                {commits.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono">{c.id}</td>
                    <td className="px-3 py-2">{repos.find((r) => r.id === c.repoId)?.name ?? c.repoId}</td>
                    <td className="px-3 py-2 font-mono">{c.branch}</td>
                    <td className="px-3 py-2">{c.author}</td>
                    <td className="px-3 py-2">{c.message}</td>
                    <td className="px-3 py-2">{c.signed ? "yes" : <span className="text-amber-700">no</span>}</td>
                    <td className="px-3 py-2">{c.verified ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600 inline" />}</td>
                    <td className="px-3 py-2 text-slate-500">{new Date(c.at).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        appendAudit("supply.commit.open", `${role}@${tenantName}`, c.id, { repoId: c.repoId, branch: c.branch });
                      }}>
                        <GitCommit className="mr-1 h-3 w-3" /> Open source
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ============================ BUILDS ============================ */}
        <TabsContent value="builds" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600"><tr>
                <th className="px-3 py-2">Build</th><th className="px-3 py-2">Repository</th>
                <th className="px-3 py-2">Commit</th><th className="px-3 py-2">Pipeline</th>
                <th className="px-3 py-2">Runner</th><th className="px-3 py-2">State</th>
                <th className="px-3 py-2">Provenance</th><th className="px-3 py-2">Reproducible</th>
                <th className="px-3 py-2">Duration</th><th className="px-3 py-2">Started</th>
              </tr></thead>
              <tbody>
                {builds.map((b) => (
                  <tr key={b.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono">{b.id}</td>
                    <td className="px-3 py-2">{repos.find((r) => r.id === b.repoId)?.name ?? b.repoId}</td>
                    <td className="px-3 py-2 font-mono">{b.commit.slice(0, 12)}</td>
                    <td className="px-3 py-2">{b.pipeline}</td>
                    <td className="px-3 py-2">{b.runner}</td>
                    <td className="px-3 py-2">{b.state}</td>
                    <td className="px-3 py-2"><ProvBadge p={b.provenance} /></td>
                    <td className="px-3 py-2">{b.reproducibility}</td>
                    <td className="px-3 py-2 tabular-nums">{b.durationSec}s</td>
                    <td className="px-3 py-2 text-slate-500">{new Date(b.startedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ============================ SBOMS ============================ */}
        <TabsContent value="sboms" className="mx-3 my-3 space-y-3">
          {sboms.map((s) => {
            const a = artifacts.find((x) => x.id === s.artifactId);
            return (
              <Card key={s.artifactId}><CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{a?.name} <span className="text-slate-500 font-normal">· {a?.version}</span></div>
                    <div className="text-[10px] text-slate-500">{s.format} · {s.componentCount} components · generated {new Date(s.generatedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {a && <StateBadge state={a.state} />}
                    <Button size="sm" variant="outline" onClick={() => a && openInspect(a)}>Review</Button>
                  </div>
                </div>
                <table className="mt-2 w-full text-xs">
                  <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600"><tr>
                    <th className="px-2 py-1">Component</th><th className="px-2 py-1">Version</th><th className="px-2 py-1">License</th>
                  </tr></thead>
                  <tbody>
                    {s.topComponents.map((c) => (
                      <tr key={c.name} className="border-t border-slate-100">
                        <td className="px-2 py-1">{c.name}</td>
                        <td className="px-2 py-1 font-mono">{c.version}</td>
                        <td className="px-2 py-1">{c.license}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent></Card>
            );
          })}
        </TabsContent>

        {/* ============================ DEPENDENCIES ============================ */}
        <TabsContent value="dependencies" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600"><tr>
                <th className="px-3 py-2">Dependency</th><th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Ecosystem</th><th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">License</th><th className="px-3 py-2">Artifact</th>
                <th className="px-3 py-2">Pinned</th><th className="px-3 py-2">Actions</th>
              </tr></thead>
              <tbody>
                {deps.map((d) => (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{d.name}</td>
                    <td className="px-3 py-2 font-mono">{d.version}</td>
                    <td className="px-3 py-2">{d.ecosystem}</td>
                    <td className="px-3 py-2">{d.source}</td>
                    <td className="px-3 py-2">{d.license}</td>
                    <td className="px-3 py-2 font-mono">{d.artifactId}</td>
                    <td className="px-3 py-2">{d.pinned ? "yes" : <span className="text-amber-700">no</span>}</td>
                    <td className="px-3 py-2">
                      {!d.pinned && (
                        <Button size="sm" variant="outline" onClick={() => onPinDep(d)}>
                          <Lock className="mr-1 h-3 w-3" /> Pin
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ============================ VULNS ============================ */}
        <TabsContent value="vulnerabilities" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600"><tr>
                <th className="px-3 py-2">Advisory</th><th className="px-3 py-2">Artifact</th>
                <th className="px-3 py-2">Component</th><th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Fixed in</th><th className="px-3 py-2">Exploited</th>
                <th className="px-3 py-2">Task</th><th className="px-3 py-2">Actions</th>
              </tr></thead>
              <tbody>
                {vulns.map((v) => (
                  <tr key={v.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono">{v.id}</td>
                    <td className="px-3 py-2 font-mono">{v.artifactId}</td>
                    <td className="px-3 py-2">{v.component}</td>
                    <td className="px-3 py-2"><SevBadge s={v.severity} /></td>
                    <td className="px-3 py-2">{v.fixedIn ?? "—"}</td>
                    <td className="px-3 py-2">{v.exploitInWild ? <span className="text-red-700">yes</span> : "no"}</td>
                    <td className="px-3 py-2 font-mono text-[10px]">{v.taskId ?? "—"}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" disabled={!!v.taskId}
                        onClick={() => { setRemediationOpen(v); setRemediationNote(""); }}>
                        {v.taskId ? "Task created" : "Create remediation"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ============================ LICENSES ============================ */}
        <TabsContent value="licenses" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600"><tr>
                <th className="px-3 py-2">Finding</th><th className="px-3 py-2">Artifact</th>
                <th className="px-3 py-2">Component</th><th className="px-3 py-2">License</th>
                <th className="px-3 py-2">State</th><th className="px-3 py-2">Policy note</th>
              </tr></thead>
              <tbody>
                {licenses.map((l) => (
                  <tr key={l.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono">{l.id}</td>
                    <td className="px-3 py-2 font-mono">{l.artifactId}</td>
                    <td className="px-3 py-2">{l.component}</td>
                    <td className="px-3 py-2">{l.license}</td>
                    <td className="px-3 py-2">{l.state}</td>
                    <td className="px-3 py-2 text-slate-600">{l.policyNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ============================ SIGNATURES ============================ */}
        <TabsContent value="signatures" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600"><tr>
                <th className="px-3 py-2">Artifact</th><th className="px-3 py-2">Signer</th>
                <th className="px-3 py-2">Method</th><th className="px-3 py-2">Key fingerprint</th>
                <th className="px-3 py-2">State</th><th className="px-3 py-2">Verified</th>
                <th className="px-3 py-2">Actions</th>
              </tr></thead>
              <tbody>
                {signatures.map((s) => {
                  const a = artifacts.find((x) => x.id === s.artifactId);
                  if (!a) return null;
                  return (
                    <tr key={s.artifactId} className="border-t border-slate-100">
                      <td className="px-3 py-2"><div className="font-medium">{a.name}</div><div className="text-[10px] text-slate-500">{a.id}</div></td>
                      <td className="px-3 py-2">{s.signer}</td>
                      <td className="px-3 py-2">{s.method}</td>
                      <td className="px-3 py-2 font-mono text-[10px]">{s.keyFingerprint}</td>
                      <td className="px-3 py-2"><SigBadge s={s.state} /></td>
                      <td className="px-3 py-2 text-slate-500">{new Date(s.verifiedAt).toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant="outline" onClick={() => onVerifySignature(a)}>
                          <ShieldCheck className="mr-1 h-3 w-3" /> Verify
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ============================ PROVENANCE ============================ */}
        <TabsContent value="provenance" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600"><tr>
                <th className="px-3 py-2">Artifact</th><th className="px-3 py-2">Build</th>
                <th className="px-3 py-2">Builder</th><th className="px-3 py-2">Materials</th>
                <th className="px-3 py-2">SLSA</th><th className="px-3 py-2">Attestation</th>
                <th className="px-3 py-2">Actions</th>
              </tr></thead>
              <tbody>
                {provenance.map((p) => {
                  const a = artifacts.find((x) => x.id === p.artifactId);
                  return (
                    <tr key={p.artifactId} className="border-t border-slate-100">
                      <td className="px-3 py-2"><div className="font-medium">{a?.name}</div><div className="text-[10px] text-slate-500">{p.artifactId}</div></td>
                      <td className="px-3 py-2 font-mono">{p.buildId}</td>
                      <td className="px-3 py-2">{p.builder}</td>
                      <td className="px-3 py-2 tabular-nums">{p.materials}</td>
                      <td className="px-3 py-2"><ProvBadge p={p.slsaLevel} /></td>
                      <td className="px-3 py-2 font-mono text-[10px]">{shortDigest(p.attestationDigest)}</td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant="outline" onClick={() => a && openInspect(a)}>
                          <FileSearch className="mr-1 h-3 w-3" /> Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ============================ REGISTRIES ============================ */}
        <TabsContent value="registries" className="mx-3 my-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600"><tr>
                <th className="px-3 py-2">Registry</th><th className="px-3 py-2">Kind</th>
                <th className="px-3 py-2">URL</th><th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Approval</th><th className="px-3 py-2">Last audit</th>
                <th className="px-3 py-2">Actions</th>
              </tr></thead>
              <tbody>
                {registries.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2">{r.kind}</td>
                    <td className="px-3 py-2 font-mono text-[10px]">{r.url}</td>
                    <td className="px-3 py-2">{r.owner}</td>
                    <td className="px-3 py-2">{r.approval}</td>
                    <td className="px-3 py-2 text-slate-500">{new Date(r.lastAuditAt).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      {r.approval !== "approved" && (
                        <Button size="sm" variant="outline" onClick={() => onApproveRegistry(r)}>
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        {/* ============================ QUARANTINE ============================ */}
        <TabsContent value="quarantine" className="mx-3 my-3 space-y-3">
          {quarantine.length === 0 && (
            <Card><CardContent className="p-4 text-sm text-slate-600">
              Nothing in quarantine. All artifacts are in an executable or exception state.
            </CardContent></Card>
          )}
          {quarantine.map((q) => {
            const a = artifacts.find((x) => x.id === q.artifactId);
            if (!a) return null;
            return (
              <Card key={q.artifactId}><CardContent className="p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Package className="h-4 w-4" /> {a.name} <span className="text-slate-500 font-normal">· {a.version}</span>
                      <StateBadge state={a.state} />
                    </div>
                    <div className="mt-1 text-xs text-slate-700"><strong>Why:</strong> {q.reason}</div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      Since {new Date(q.since).toLocaleString()} · requested by {q.requestedBy}
                    </div>
                    <div className="mt-1 text-[11px]">
                      Affected runbooks: {q.affectedRunbooks.length ? q.affectedRunbooks.join(", ") : "none"}
                      {" · "}
                      Active or scheduled executions: {q.affectedExecutions.length ? q.affectedExecutions.join(", ") : "none"}
                    </div>
                    {q.releasedAt && (
                      <div className="mt-1 text-[10px] text-emerald-700">
                        Released by {q.releaseApprovedBy} at {new Date(q.releasedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => openInspect(a)}>Inspect</Button>
                    {a.state === "Quarantined" && (
                      <Button size="sm" variant="outline" onClick={() => onRelease(a)}>
                        <Undo2 className="mr-1 h-3 w-3" /> Release after approval
                      </Button>
                    )}
                    {a.state !== "Blocked" && (
                      <Button size="sm" variant="destructive"
                        onClick={() => onBlock(a, `Blocked from quarantine: ${q.reason}`)}>
                        Block execution
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent></Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* ============================ Inspect dialog ============================ */}
      <Dialog open={!!inspect} onOpenChange={(o) => !o && setInspect(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Inspect provenance · {inspect?.name}</DialogTitle></DialogHeader>
          {inspect && (() => {
            const repo = repos.find((r) => r.id === inspect.repoId);
            const build = builds.find((b) => b.id === inspect.buildId);
            const sig = signatures.find((s) => s.artifactId === inspect.id);
            const prov = provenance.find((p) => p.artifactId === inspect.id);
            const sbom = sboms.find((s) => s.artifactId === inspect.id);
            const artVulns = vulns.filter((v) => v.artifactId === inspect.id);
            const artLic = licenses.filter((l) => l.artifactId === inspect.id);
            const runbooks = dependentRunbooks(inspect.id);
            return (
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap gap-2">
                  <StateBadge state={inspect.state} />
                  <SigBadge s={inspect.signature} />
                  <ProvBadge p={inspect.provenance} />
                </div>
                {inspect.reason && (
                  <div className="rounded border border-amber-200 bg-amber-50 p-2 text-amber-900">
                    <strong>Why this state:</strong> {inspect.reason}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Source</div>
                    <div>{repo?.name}</div>
                    <div className="font-mono text-[10px] text-slate-500">commit {inspect.commit}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Build</div>
                    <div className="font-mono">{build?.id}</div>
                    <div className="text-slate-500">{build?.pipeline} · {build?.runner}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Digest</div>
                    <div className="font-mono">{inspect.digest}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Registry</div>
                    <div>{registries.find((r) => r.id === inspect.registryId)?.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Signature</div>
                    <div>{sig?.signer}</div>
                    <div className="font-mono text-[10px] text-slate-500">{sig?.keyFingerprint}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Provenance</div>
                    <div>{prov?.builder} · {prov?.slsaLevel.toUpperCase()}</div>
                    <div className="font-mono text-[10px] text-slate-500">{prov ? shortDigest(prov.attestationDigest) : ""}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500">SBOM top components</div>
                  <ul className="mt-1 list-disc pl-4">
                    {sbom?.topComponents.map((c) => (
                      <li key={c.name}><span className="font-mono">{c.name}@{c.version}</span> — {c.license}</li>
                    ))}
                  </ul>
                </div>
                {artVulns.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Vulnerabilities</div>
                    <ul className="mt-1 list-disc pl-4">
                      {artVulns.map((v) => (
                        <li key={v.id}>
                          {v.id} · {v.component} · <SevBadge s={v.severity} /> · fixed in {v.fixedIn ?? "—"}
                          {v.exploitInWild && <span className="ml-1 text-red-700">(exploited in wild)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {artLic.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Licenses</div>
                    <ul className="mt-1 list-disc pl-4">
                      {artLic.map((l) => (
                        <li key={l.id}>{l.component} · {l.license} · {l.state}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Dependent runbooks</div>
                  <div>{runbooks.length ? runbooks.join(", ") : "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Recent executions</div>
                  <div>{inspect.recentExecutions.length ? inspect.recentExecutions.join(", ") : "—"}</div>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInspect(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================ Compare dialog ============================ */}
      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Compare artifact versions</DialogTitle></DialogHeader>
          <div className="mb-3 flex items-center gap-2 text-xs">
            <Select value={compareA} onValueChange={setCompareA}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{artifacts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} · {a.version}</SelectItem>)}</SelectContent>
            </Select>
            <span>vs.</span>
            <Select value={compareB} onValueChange={setCompareB}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{artifacts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} · {a.version}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {(() => {
            const a = artifacts.find((x) => x.id === compareA);
            const b = artifacts.find((x) => x.id === compareB);
            if (!a || !b) return null;
            const rows: Array<[string, React.ReactNode, React.ReactNode]> = [
              ["Version", a.version, b.version],
              ["State", <StateBadge state={a.state} />, <StateBadge state={b.state} />],
              ["Signature", <SigBadge s={a.signature} />, <SigBadge s={b.signature} />],
              ["Provenance", <ProvBadge p={a.provenance} />, <ProvBadge p={b.provenance} />],
              ["Vulnerability", a.vulnState, b.vulnState],
              ["License", a.licenseState, b.licenseState],
              ["Commit", <span className="font-mono">{a.commit.slice(0, 12)}</span>, <span className="font-mono">{b.commit.slice(0, 12)}</span>],
              ["Digest", <span className="font-mono">{shortDigest(a.digest)}</span>, <span className="font-mono">{shortDigest(b.digest)}</span>],
            ];
            return (
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-left text-[10px] uppercase tracking-wide text-slate-600">
                  <tr><th className="px-2 py-1">Field</th><th className="px-2 py-1">A · {a.id}</th><th className="px-2 py-1">B · {b.id}</th></tr>
                </thead>
                <tbody>
                  {rows.map(([label, av, bv], i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-2 py-1 font-medium">{label}</td>
                      <td className="px-2 py-1">{av}</td>
                      <td className="px-2 py-1">{bv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
          <DialogFooter><Button variant="outline" onClick={() => setShowCompare(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================ Exception dialog ============================ */}
      <Dialog open={!!exceptionOpen} onOpenChange={(o) => !o && setExceptionOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Grant time-boxed exception</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <p>Exceptions are recorded in the audit log with a 14-day expiry and require a justification.</p>
            <Textarea placeholder="Reason for exception (visible in audit, evidence, release)…"
              value={exceptionNote} onChange={(e) => setExceptionNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExceptionOpen(null)}>Cancel</Button>
            <Button disabled={!exceptionNote.trim()}
              onClick={() => { if (exceptionOpen) { onApproveException(exceptionOpen, exceptionNote.trim()); setExceptionOpen(null); } }}>
              Approve exception
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================ Remediation dialog ============================ */}
      <Dialog open={!!remediationOpen} onOpenChange={(o) => !o && setRemediationOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create remediation task</DialogTitle></DialogHeader>
          {remediationOpen && (
            <div className="space-y-2 text-xs">
              <div>{remediationOpen.id} · {remediationOpen.component} in {remediationOpen.artifactId}</div>
              <div className="text-slate-600">Fixed in {remediationOpen.fixedIn ?? "—"} · severity {remediationOpen.severity}</div>
              <Textarea placeholder="Additional context for the task…"
                value={remediationNote} onChange={(e) => setRemediationNote(e.target.value)} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemediationOpen(null)}>Cancel</Button>
            <Button onClick={() => { if (remediationOpen) { onCreateRemediation(remediationOpen, remediationNote.trim()); setRemediationOpen(null); } }}>
              Create task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================ AI recommendation dialog ============================ */}
      <Dialog open={showAI} onOpenChange={setShowAI}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> {AI_RECOMMENDATION.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[10px] uppercase text-slate-500">Conclusion</div>
              <p className="mt-0.5">{AI_RECOMMENDATION.conclusion}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800 border border-emerald-200">
                Confidence · {AI_RECOMMENDATION.confidence}%
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500">Uncertainty</div>
              <p className="mt-0.5 text-slate-700">{AI_RECOMMENDATION.uncertainty}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500">Supporting evidence</div>
              <ul className="mt-0.5 list-disc pl-4">
                {AI_RECOMMENDATION.supportingEvidence.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500">Contradictory evidence</div>
              <ul className="mt-0.5 list-disc pl-4">
                {AI_RECOMMENDATION.contradictoryEvidence.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500">Sources</div>
              <ul className="mt-0.5 list-disc pl-4 font-mono text-[10px]">
                {AI_RECOMMENDATION.sources.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAI(false)}>Dismiss</Button>
            <Button onClick={() => {
              const target = artifacts.find((x) => x.id === "ART-3004");
              if (target && target.state !== "Blocked") {
                onBlock(target, "Applied AI recommendation REC-SC-1: missing signature, SLSA L1 < L2, log4j-core CVE-2021-45046.");
              }
              const v = vulns.find((x) => x.id === "CVE-2021-45046");
              if (v && !v.taskId) onCreateRemediation(v, "Auto-created from AI recommendation REC-SC-1.");
              setShowAI(false);
            }}>
              Apply recommendation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer context strip */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-white px-3 py-1.5 text-[10px] text-slate-500">
        <ShieldAlert className="h-3 w-3" />
        <span>Blocked and quarantined artifacts are exported to Launch Center preflight, Release, and Evidence Replay.</span>
        <span className="ml-auto">Boxes {counts.Trusted + counts["Approved with exception"]} executable · {counts.Blocked} blocked · {counts.Quarantined} quarantined</span>
        <Boxes className="h-3 w-3" />
        <Hammer className="h-3 w-3" />
        <GitBranch className="h-3 w-3" />
        <ScrollText className="h-3 w-3" />
        <PlayCircle className="h-3 w-3" />
      </div>
    </div>
  );
}
