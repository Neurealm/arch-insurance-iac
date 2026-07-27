## Goal

Today the spoken words are a hardcoded default in `PlayIntroductionButton.tsx` ("Hello, my name is Ryan."), sent straight to the `tts-speak` edge function. You want the script (plus voice/tone settings) stored in the database, pulled at click time, and you want to see which database record drives a given button.

## What gets built

### 1. Narration table

New table `commercial_narrations`, tenant-scoped like the other commercial tables:

| Field | Purpose |
| --- | --- |
| `narration_key` | Stable handle a button references, e.g. `commercial.overview.introduction` |
| `title` | Human label for the future admin module |
| `script` | The full spoken text |
| `voice` | TTS voice (default `onyx`) |
| `instructions` | Delivery/tone prompt (e.g. "warm, professional, unhurried") |
| `speed` | Playback rate |
| `is_active`, `version` | Lets you retire or revise scripts without deleting |

Access rules: members of the workspace can read active narrations; only Commercial writers/admins can create or edit them. The edge function reads with elevated access.

Seed one row containing the current introduction script — the exact wording is yours to give me; otherwise I'll seed the existing line and you can edit the record.

### 2. Button pulls from the database

- `PlayIntroductionButton` takes a `narrationKey` instead of raw `text`, and loads the record via a new `useNarration` hook.
- On click it sends the narration record's id to `tts-speak`; the function looks the row up server-side and uses its `script`, `voice`, `instructions`, and `speed`. This keeps the script authoritative in the database rather than trusting whatever the browser sends.
- If no record is found the button is disabled with a tooltip explaining that no narration is configured.

### 3. "Record ID" hover affordance

Hovering the listen button shows a tooltip with:

```text
Narration: Workspace Introduction
Key:    commercial.overview.introduction
Table:  commercial_narrations
Record: 8f2c1a9e-…  (click to copy)
Voice:  onyx · v1
```

Clicking the id copies the UUID so you can find the row directly in the backend. Shown to Commercial admins/platform admins only, so end users don't see internals.

### 4. Groundwork for the admin module

The table, key convention, and versioning fields are designed so a later "Narration Studio" screen can list, edit, preview, and version scripts with no schema change. No admin UI is built in this pass.

## Technical notes

- Migration creates `commercial_narrations` with GRANTs, RLS, tenant-isolation trigger, and `updated_at` trigger, matching existing `commercial_*` patterns.
- `tts-speak` gains input validation (`narration_id` UUID or `narration_key` + tenant), a service-role lookup, and returns 404 when the narration is missing or inactive. Raw `text` input is dropped so scripts can't be injected client-side.
- Tooltip uses the existing shadcn `Tooltip` primitives; admin check reuses `useCommercialAccess`.
- No change to audio playback (still MP3 blob fetch, which is already verified working).

## Open item

Send me the full narration script and any voice direction, and I'll seed it as the first record; otherwise the existing one-liner is seeded as a placeholder.
