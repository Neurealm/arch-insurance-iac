import { asId, FormalProperty, FormalId, ModuleId, StaticFinding, StaticId, Defect, DefectId, IpId, PersonId, TestId } from "@/silicon/domain/types";

const M = (s: string) => asId<ModuleId>(s);
const F = (s: string) => asId<FormalId>(s);
const IP = asId<IpId>("ip-ddmac-240");

export const formalProperties: FormalProperty[] = [
  { id: F("fp-no-underflow"),     moduleId: M("mod-irq"),        name: "irq_coalesce_hit_no_underflow",     status: "proven",       runtimeSec: 42 },
  { id: F("fp-desc-monotonic"),   moduleId: M("mod-ring-mgr"),   name: "descriptor_seq_monotonic",          status: "proven",       runtimeSec: 118 },
  { id: F("fp-wr-rsp-bound"),     moduleId: M("mod-desc-fetch"), name: "wr_rsp_pending_bounded",            status: "proven",       runtimeSec: 96 },
  { id: F("fp-completion-once"),  moduleId: M("mod-completion"), name: "completion_valid_once_per_desc",    status: "proven",       runtimeSec: 71 },
  { id: F("fp-ring-wrap"),        moduleId: M("mod-ring-mgr"),   name: "ring_wrap_committed_head_ok",       status: "inconclusive", runtimeSec: 3600 },
  { id: F("fp-mask-vs-clear"),    moduleId: M("mod-irq"),        name: "mask_update_before_clear",          status: "failed",       runtimeSec: 210 },
  { id: F("fp-reset-ready"),      moduleId: M("mod-csr"),        name: "status_ready_after_reset",          status: "proven",       runtimeSec: 12 },
  { id: F("fp-vacuous-1"),        moduleId: M("mod-mac-tx"),     name: "tx_phy_handshake_ge12",             status: "vacuous",      runtimeSec: 8 },
];

const S = (s: string) => asId<StaticId>(s);
export const staticFindings: StaticFinding[] = [
  { id: S("sf-1"), moduleId: M("mod-ring-mgr"),   rule: "LATCH_INFER",  severity: "high",     line: 412, message: "Inferred latch on committed_head_next path",     state: "open" },
  { id: S("sf-2"), moduleId: M("mod-desc-fetch"), rule: "WIDTH_MISMATCH", severity: "medium", line: 88,  message: "Implicit truncation from 34 to 32 bits",           state: "waived" },
  { id: S("sf-3"), moduleId: M("mod-irq"),        rule: "UNREACHABLE",  severity: "low",      line: 231, message: "Unreachable case branch when mask=0",              state: "fixed" },
  { id: S("sf-4"), moduleId: M("mod-completion"), rule: "CDC_META",     severity: "critical", line: 507, message: "Missing 2FF sync on cmpl_valid crossing to axi_clk", state: "open" },
];

const D = (s: string) => asId<DefectId>(s);
const T = (s: string) => asId<TestId>(s);
export const defects: Defect[] = [
  { id: D("DEF-DDMAC-101"), ipId: IP, title: "Ring wrap boundary desync under back-pressure", severity: "critical", state: "in-progress", ownerId: asId<PersonId>("person-priya-nair"),  moduleId: M("mod-ring-mgr"), linkedTestIds: [T("test-ring-wrap-boundary-01")], createdAt: "2026-07-14T15:26:00Z" },
  { id: D("DEF-DDMAC-102"), ipId: IP, title: "irq_coalesce_hit off-by-one when mask writes race", severity: "high",  state: "triaged",     ownerId: asId<PersonId>("person-diane-okafor"), moduleId: M("mod-irq"),      linkedTestIds: [],                                createdAt: "2026-07-13T09:12:00Z" },
  { id: D("DEF-DDMAC-103"), ipId: IP, title: "cmpl_valid CDC missing 2FF sync",                 severity: "critical", state: "new",        ownerId: asId<PersonId>("person-noor-abbasi"),  moduleId: M("mod-completion"), linkedTestIds: [],                              createdAt: "2026-07-13T18:40:00Z" },
  { id: D("DEF-DDMAC-104"), ipId: IP, title: "STATUS.ready glitches 1 cycle post-reset",        severity: "medium",   state: "verify",     ownerId: asId<PersonId>("person-marco-rossi"),  moduleId: M("mod-csr"),      linkedTestIds: [T("test-reset-01")], createdAt: "2026-07-11T13:05:00Z" },
  { id: D("DEF-DDMAC-105"), ipId: IP, title: "Width truncation warning in descriptor_fetch",    severity: "low",      state: "closed",     ownerId: asId<PersonId>("person-hiro-tanaka"), moduleId: M("mod-desc-fetch"), linkedTestIds: [], createdAt: "2026-07-09T08:22:00Z" },
  { id: D("DEF-DDMAC-106"), ipId: IP, title: "Latch inferred on committed_head_next",          severity: "high",     state: "in-progress", ownerId: asId<PersonId>("person-ben-cohen"),  moduleId: M("mod-ring-mgr"), linkedTestIds: [],                                createdAt: "2026-07-14T11:00:00Z" },
  { id: D("DEF-DDMAC-107"), ipId: IP, title: "IRQ_MASK reset value mismatch vs spec",           severity: "medium",   state: "triaged",     ownerId: asId<PersonId>("person-linh-tran"),  moduleId: M("mod-irq"),      linkedTestIds: [],                                createdAt: "2026-07-12T15:19:00Z" },
  { id: D("DEF-DDMAC-108"), ipId: IP, title: "Regression infra flake: docker pull timeout",     severity: "low",      state: "closed",     ownerId: asId<PersonId>("person-kai-zhou"),   linkedTestIds: [],                                                        createdAt: "2026-07-10T04:00:00Z" },
  { id: D("DEF-DDMAC-109"), ipId: IP, title: "Perf regression: 64B line-rate below spec by 2%", severity: "medium",   state: "in-progress", ownerId: asId<PersonId>("person-arjun-shah"),  moduleId: M("mod-mac-tx"),   linkedTestIds: [T("test-perf-64b-01")], createdAt: "2026-07-13T22:10:00Z" },
  { id: D("DEF-DDMAC-110"), ipId: IP, title: "Vacuous formal proof on tx_phy_handshake_ge12",  severity: "low",      state: "new",         ownerId: asId<PersonId>("person-diane-okafor"), moduleId: M("mod-mac-tx"),   linkedTestIds: [],                              createdAt: "2026-07-14T10:05:00Z" },
];
