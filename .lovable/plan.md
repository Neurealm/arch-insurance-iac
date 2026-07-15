Remove three top-level sidebar entries under **ADMIN WORKSPACE**: Questionnaires, Business Services, and Auth Orchestration.

## Changes (src/components/eoc/Sidebar.tsx)

1. Delete these three tree nodes:
   - Line 279: `{ key: "questionnaires", ... to: "/questionnaires" }`
   - Line 280: `{ key: "services", label: "Business Services", ... }`
   - Line 284: `{ key: "auth-orch", label: "Auth Orchestration", ... }`
2. Update the ADMIN WORKSPACE group `keys` array (line 605) to remove `"questionnaires"`, `"services"`, and `"auth-orch"`.
3. Update `ADMIN_ONLY_KEYS` (line 608) to remove `"questionnaires"`.

## Out of scope

- Route registrations in `App.tsx` and the underlying pages remain intact (URLs still work if visited directly). Say the word if you'd like those removed too.
- The "Business Services (Service Portfolio & Health)" child under Executive & Business Operations (line 74) stays — it's a different, nested entry.
