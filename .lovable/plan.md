## Goal

Make every code example on `src/avep/pages/RtlGenerationStudio.tsx` technically correct and consistent with the canonical DDMAC scenario in `src/avep/data/canonical.ts` (defect DEF-DV-219: baseline used `length >= max_transfer_length`; fix changes it to `>`).

## Issues found (verified against file)

1. **Baseline/Proposed diff is inverted.** `BaselineDiff` (lines ~918-942) shows the *baseline* using the already-fixed `desc_length > max_transfer_length` and the *proposed* branch without the comparison at all. Per canonical: baseline must use the buggy `>=`, and the proposed must use the fixed `>` inside the VALIDATE state — that's the whole point of the DEF-DV-219 story this platform tells.

2. **Baseline/proposed versions wrong.** Diff headers say `rtl_baseline_3.2.16` and `3.2.17-rc1`. Canonical baseline is `rtl_3.2.18` on `feature/descriptor-ring-fix` off `release/2.4`, run 4471. Update to `rtl_baseline_3.2.17` (pre-fix) → `3.2.18-rc1` (post-fix, matching `IP.ipVersion = "3.2.18"`), and note the branch.

3. **`error_code` deasserts when `desc_error` asserts** (real RTL bug in the shown module). `error_code` is only assigned inside the `VALIDATE` branch of `always_comb`; on the next cycle in `REJECT`, the top-of-block default `error_code = 3'b000` wins, so consumers see `desc_error=1` with `error_code=000`. Fix by either (a) registering `error_code` into a `err_code_q` and driving it in `REJECT`, or (b) re-asserting the appropriate `error_code` inside the `REJECT` branch based on registered `length_error_q` / `privilege_error_q`. Choose (a) — smaller, matches the "error latch" pattern already listed in `REUSED_PATTERNS`.

4. **`LINE_BADGES` line numbers don't match the RTL snippet.** Badges claim REQ-DDMAC-142 lives on snippet lines 21/22/23/41/43 — those are `} validator_state_e;`, blanks, and internal state lines. Correct mapping against the actual `RTL_CODE` split:
   - REQ-DDMAC-142 (length compare) → snippet lines 28-30 (`assign length_error = desc_valid && (desc_length > max_transfer_length);`) and the VALIDATE branch that consumes it.
   - REQ-SEC-088 (priv_mode) → port line 10 and `privilege_error` assign lines 32-35.
   - REQ-DDMAC-143 (desc_error timing) → port line 12 and the `REJECT` branch that drives `desc_error`.
   - ARCH-FSM-04 → typedef lines 16-21 and the `unique case` at line ~37.
   - CLK-RST-01 → the `always_ff` reset block near lines 80-87.
   Recompute after any RTL edits from item 3 so line numbers still match.

5. **Traceability chain uses invented IDs.** `TraceabilityView` shows `ASSERT_DESC_LENGTH_001`, `TEST_DESC_OVERSIZE_017`, `COVER_DESC_ERROR_004`. Canonical names are `p_max_legal_length_accepted` (formal property), `test_desc_len_boundary_017` (directed test), `cg_len_boundary.cross_at_max` (coverage bin). Replace to match `HEADLINE_REQ.linkedFormal`, `linkedTests`, `linkedCoverBins` in `canonical.ts`.

6. **`unique case` + `default` is technically legal but redundant** and Verilator/DC will warn. Since every enum value is enumerated, drop the `default` arm and keep `unique case` (or switch to `unique0 case` if we want a safe fallback). Prefer: keep `default: state_d = IDLE;` but change `unique case` → `unique case` remains — actually cleanest is `case (state_q) inside` with `unique` prefix retained and default kept; document that this is intentional. Small polish, not a correctness bug.

7. **Findings referencing lines that don't exist.** `F-006` points to line 78, which in the snippet is inside `endmodule`/EOF. Remap to the actual `always_ff` reset block after code changes.

8. **Spec citations drift.** REQ text sources cite `FRS 3.2 §4.7.1` / `§4.7.4`; canonical uses `DDMAC MAS §4.7.3`. Update `REQUIREMENTS[].source` to match `HEADLINE_REQ.source` and `AMBIGUOUS_REQ` context.

9. **`GENERATED_FILES` missing `ddmac_descriptor_guard.sv`** (called out as added in 3.2.15 in `canonical.MODULES`). Add a row so the file list is consistent with the module hierarchy the rest of the platform shows.

## Edits (all in `src/avep/pages/RtlGenerationStudio.tsx`)

- Rewrite the two `<pre>` blocks in `BaselineDiff` so the left is the pre-fix `>=` snippet inside a VALIDATE state, and the right is the post-fix `>` snippet with the SEC-088 priv branch; update the two title strings and version chips.
- Update `RTL_CODE` to register `error_code` (`err_code_q`) and drive it from `REJECT`, keeping the `>` comparison. Add a one-line comment tagging `// REQ-DDMAC-142 — strict >, fixes DEF-DV-219`.
- Recompute `LINE_BADGES` against the new `RTL_CODE` line numbers and update `REQUIREMENTS[].lines` and `FINDINGS[].lines` to match.
- Rename traceability chain nodes in `TraceabilityView` to `p_max_legal_length_accepted`, `test_desc_len_boundary_017`, `cg_len_boundary.cross_at_max`, and set the anchor RTL file to `rtl/ddmac_descriptor_validator.sv` (already correct).
- Update `REQUIREMENTS[].source` values to `DDMAC MAS §4.7.3` / `§4.7.4` per canonical.
- Add `rtl/ddmac_descriptor_guard.sv` to `GENERATED_FILES`.
- No changes to layout, styling, tabs, or interactions.

## Out of scope

- Other AVEP pages (only this file was requested).
- Canonical data file — treat it as source of truth; do not edit.
