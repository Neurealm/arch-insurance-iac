## No changes required

The user asked where to add/edit/delete Domains after selecting a Technology. This is a navigation question, not an implementation request.

**Location of the feature (already implemented):**

1. `Settings → Technology Taxonomy` → click a Technology row
2. On the Technology Profile page, open the **Domains** tab (hidden only on the "New Technology" screen until the record is saved)
3. Available actions on that tab:
   - **Add Domain** button (top-right, and empty-state CTA)
   - Per-row **⋯ menu**: View, Edit, Clone, Activate/Deactivate, Delete (soft)
   - Drag handle to reorder (persists via `etdm_reorder_domains` RPC)

A global list also exists at `Settings → Domains` (`/admin/technology-taxonomy/domains`) with a Technology filter.

The user confirmed via follow-up that they found it and want no changes.

**Action:** none. Close out.