import { asId, AiAnalysis, AiAnalysisId, EngineeringChange, ChangeId, Milestone, MilestoneId, SignoffGate, SignoffId, ProgramId, IpId, ModuleId, PersonId } from "@/silicon/domain/types";

const PROG = asId<ProgramId>("program-aegis-240");
const IP = asId<IpId>("ip-ddmac-240");
const M = (s: string) => asId<ModuleId>(s);

export const aiAnalyses: AiAnalysis[] = [
  {
    id: asId<AiAnalysisId>("ai-ring-boundary-rc"),
    targetKind: "defect", targetId: "DEF-DDMAC-101",
    trigger: "Regression cluster fc-ring-boundary spiked to 7 fails in nightly-2026-07-14.",
    facts: [
      "Failing tests all exercise wrap at ring_size boundary with back-pressure ≥ 64 cycles.",
      "committed_head increments 1 cycle behind producer on wrap.",
      "Inconclusive formal property fp-ring-wrap identifies the same window.",
    ],
    evidence: [
      { id: "ev-1", kind: "regression", label: "regr-nightly-2026-07-14 cluster fc-ring-boundary" },
      { id: "ev-2", kind: "waveform",   label: "ring_wrap_boundary_edge waveform (synthetic)" },
      { id: "ev-3", kind: "formal",     label: "fp-ring-wrap inconclusive after 60m" },
    ],
    inference: "Pointer wrap in ring_manager updates committed_head using stale producer value when fetch back-pressure exceeds the pipe depth.",
    alternatives: [
      "AXI fetch reordering (excluded by fp-wr-rsp-bound proof).",
      "Completion coalescer skew (excluded by fp-completion-once proof).",
    ],
    confidence: { value: 0.82, band: "high" },
    recommendation: "Tighten committed_head update to observe fetch-in-flight counter; extend fp-ring-wrap with fetch-depth cover.",
    expectedEffect: "Cluster fc-ring-boundary drops to 0; fp-ring-wrap moves proven.",
    risk: "Change touches ring_manager arbitration — schedule short block regression before nightly.",
    humanReviewerId: asId<PersonId>("person-priya-nair"),
    approvalStatus: "pending",
    createdAt: "2026-07-14T15:28:00Z",
  },
];

export const changes: EngineeringChange[] = [
  { id: asId<ChangeId>("chg-2401"), ipId: IP, title: "Fix committed_head update on ring wrap", author: asId<PersonId>("person-ben-cohen"),   createdAt: "2026-07-14T15:35:00Z", filesChanged: 2, linesAdded: 34, linesRemoved: 12, impactedModuleIds: [M("mod-ring-mgr")], state: "review" },
  { id: asId<ChangeId>("chg-2398"), ipId: IP, title: "Add 2FF sync on cmpl_valid CDC path",    author: asId<PersonId>("person-noor-abbasi"), createdAt: "2026-07-13T20:15:00Z", filesChanged: 1, linesAdded: 8,  linesRemoved: 2,  impactedModuleIds: [M("mod-completion")], state: "approved" },
  { id: asId<ChangeId>("chg-2395"), ipId: IP, title: "Guard IRQ_MASK reset value",             author: asId<PersonId>("person-linh-tran"),   createdAt: "2026-07-12T16:44:00Z", filesChanged: 1, linesAdded: 4,  linesRemoved: 4,  impactedModuleIds: [M("mod-irq")],       state: "merged" },
];

export const milestones: Milestone[] = [
  { id: asId<MilestoneId>("ms-arch-freeze"),   programId: PROG, name: "Architecture Freeze",  targetDate: "2026-05-10", status: "green"  },
  { id: asId<MilestoneId>("ms-rtl-freeze"),    programId: PROG, name: "RTL Freeze",            targetDate: "2026-07-31", status: "yellow" },
  { id: asId<MilestoneId>("ms-verif-close"),   programId: PROG, name: "Verification Close",    targetDate: "2026-09-30", status: "yellow" },
  { id: asId<MilestoneId>("ms-tape-out"),      programId: PROG, name: "Tape-out",              targetDate: "2026-11-30", status: "gray"   },
  { id: asId<MilestoneId>("ms-si-back"),       programId: PROG, name: "Silicon Back",          targetDate: "2027-02-15", status: "gray"   },
  { id: asId<MilestoneId>("ms-launch"),        programId: PROG, name: "Product Launch",        targetDate: "2027-06-01", status: "gray"   },
];

export const signoffs: SignoffGate[] = [
  { id: asId<SignoffId>("so-func"),     programId: PROG, name: "Functional Sign-off",    state: "in-review",   ownerId: asId<PersonId>("person-priya-nair"), criteria: [
    { label: "Coverage ≥ 90%",                 passing: false },
    { label: "Zero open critical defects",     passing: false },
    { label: "All formal properties resolved", passing: false },
  ]},
  { id: asId<SignoffId>("so-formal"),   programId: PROG, name: "Formal Sign-off",        state: "conditional", ownerId: asId<PersonId>("person-diane-okafor"), criteria: [
    { label: "No failed properties",           passing: false },
    { label: "No vacuous proofs on P0",        passing: true  },
  ]},
  { id: asId<SignoffId>("so-perf"),     programId: PROG, name: "Performance Sign-off",   state: "not-started", ownerId: asId<PersonId>("person-arjun-shah"),  criteria: [
    { label: "Line-rate 64B ≥ spec",           passing: false },
  ]},
  { id: asId<SignoffId>("so-security"), programId: PROG, name: "Security Review",        state: "in-review",   ownerId: asId<PersonId>("person-sam-brooks"),  criteria: [
    { label: "CDC paths reviewed",             passing: false },
    { label: "Register access classes correct",passing: true  },
  ]},
];
