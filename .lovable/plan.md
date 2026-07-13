## Remove the "Agentic Data Foundation" module

Scope is narrow: one page plus its route and sidebar entry. Sibling AI Engineering items (Backlog, Answers & Actions) stay.

### Changes

1. **Delete file**
   - `src/pages/ai-engineering/AgenticDataFoundation.tsx`

2. **`src/App.tsx`**
   - Remove import at line 11: `import AgenticDataFoundation from "./pages/ai-engineering/AgenticDataFoundation.tsx";`
   - Remove route at line 514: `/ai-engineering/agentic-data-foundation`

3. **`src/components/eoc/Sidebar.tsx`**
   - Remove the `ai-eng-adf` entry at line 157 (Agentic Data Foundation link under the AI Engineering group).
   - Leave the `ai-engineering` group and its remaining children intact.

### Verification
- Confirm no remaining references via `rg -i "agentic.data.foundation|AgenticDataFoundation"`.
- Since the user is currently on `/ai-engineering/agentic-data-foundation`, that URL will now fall through to NotFound — expected.

No other modules, routes, or data are touched.