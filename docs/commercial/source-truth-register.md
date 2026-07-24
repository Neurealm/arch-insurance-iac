# Commercial Source Truth Register (BP2.0)

Purpose: Enumerate every source document that BP2.x may draw from, with confidentiality, coverage, and confidence declared. Conflicts are recorded, not reconciled.

Handling rule: source documents are confidential metadata references. They are never rendered as browser-readable attachments; only their register entries and derived facts are exposed in the app, and always with a `source_id` + `confidence` label.

Precedence: contractual > latest dated financial model in matching scope > validated master list > third-party account intelligence > meeting materials / transcripts.

---

## SRC-001 — Project Momentous MOU (draft)

- Source title: `Project_Momentous_MOU_vDRAFT_Nitin_Vidur.docx`
- Source type: Draft memorandum of understanding
- Source date: Not present in file metadata verified in BP2.0; to be confirmed at ingest
- Confidentiality: Confidential — restricted to Commercial Program Lead and Executive Sponsor
- Topics supported: Deal structure intent, party obligations, high-level commercial terms for Project Momentous
- Topics not supported: Account-level lists, per-account revenue, partner/rebate math, gate criteria
- Directional or validated: Directional (draft, not countersigned)
- Known conflicts / variances: May diverge from financial models SRC-002 / SRC-003 on deal structure assumptions until countersigned
- Account-level validation pending: N/A (no account-level content)

## SRC-002 — Neurealm × Citrix P&L Model, revised

- Source title: `Neurealm_Citrix_Deal_PL_Model-revised.xlsx`
- Source type: Financial model
- Source date: Version tagged "revised"; exact revision date to be confirmed at ingest
- Confidentiality: Confidential — Commercial Program Lead, Analyst, Executive Sponsor
- Topics supported: Revenue, cost, margin projections including partner and rebate assumptions
- Topics not supported: Legal commitments, ICP fit, third-party account intelligence
- Directional or validated: Directional
- Known conflicts / variances: Uses partner + rebate assumptions absent from SRC-003; account-scope alignment with SRC-004/SRC-005 is not asserted
- Account-level validation pending: Yes

## SRC-003 — Neurealm × Citrix P&L Model, no partner, no rebate

- Source title: `Neurealm_Citrix_Deal_PL_Model-noPartner-noRebate.xlsx`
- Source type: Financial model (constrained scope variant)
- Source date: To be confirmed at ingest
- Confidentiality: Confidential — Commercial Program Lead, Analyst, Executive Sponsor
- Topics supported: Revenue, cost, margin projections for the **104-account** no-partner scope
- Topics not supported: Partner economics, rebate math, ICP fit, broader 338-account universe
- Directional or validated: Directional
- Known conflicts / variances: Deliberately narrower than SRC-002; the 104-account scope must remain distinct from the 338-account universe in SRC-004
- Account-level validation pending: Yes

## SRC-004 — Healthcare Account Master List with ICP Fit

- Source title: `Healthcare Account Master List_With ICP Fit.xlsx`
- Source type: Account master list with ICP fit scoring
- Source date: To be confirmed at ingest
- Confidentiality: Confidential — Commercial Program Lead, Analyst
- Topics supported: The broader **338-account** healthcare ICP universe, ICP fit per account
- Topics not supported: Deal-specific financials, partner/rebate math, contract terms
- Directional or validated: Validated for identity of accounts; ICP fit is directional
- Known conflicts / variances: Superset of SRC-003's 104-account scope; must never be merged or conflated
- Account-level validation pending: Fit scores pending validation; account identities considered validated

## SRC-005 — Draup Neurealm Targeted Account Details

- Source title: `Draup_Neurealm_Targeted Details_Requested Accounts_Consolidated Version_21Jul2026.xlsx`
- Source type: Third-party account intelligence (Draup)
- Source date: 2026-07-21
- Confidentiality: Confidential — Commercial Program Lead, Analyst
- Topics supported: Account-level intelligence (org structure, spend signals, tech stack) for requested accounts
- Topics not supported: Contractual terms, internal financials, ICP scoring
- Directional or validated: Directional (third-party assertions)
- Known conflicts / variances: May disagree with SRC-004 on account attributes; treat as lower precedence than SRC-004 for identity, higher precedence for intelligence attributes
- Account-level validation pending: Yes, per account

## SRC-006 — Project Momentous deal sheet, meeting materials, transcripts

- Source title: Project Momentous deal sheet + meeting materials + transcripts (project context)
- Source type: Working materials
- Source date: Rolling
- Confidentiality: Confidential — Commercial team
- Topics supported: Narrative context, intent, verbal commitments, action items
- Topics not supported: Anything requiring signed or numerically validated backing
- Directional or validated: Indicative only
- Known conflicts / variances: May contradict SRC-001..SRC-005; always lowest precedence
- Account-level validation pending: N/A

---

## Cross-source variance ledger (opened, not resolved)

| Variance ID | Sources involved | Nature |
|---|---|---|
| VAR-001 | SRC-002 vs SRC-003 | Partner + rebate economics present in one, absent in the other |
| VAR-002 | SRC-003 (104) vs SRC-004 (338) | Account-scope size and composition differ by design |
| VAR-003 | SRC-004 vs SRC-005 | Account attributes may diverge between internal master and Draup |
| VAR-004 | SRC-001 vs SRC-002/003 | Deal structure intent may differ from modeled assumptions |
| VAR-005 | SRC-006 vs any of SRC-001..SRC-005 | Meeting notes may contradict documented positions |

Resolution of variances is a BP2.4/BP2.5 responsibility; BP2.0 only records them.
