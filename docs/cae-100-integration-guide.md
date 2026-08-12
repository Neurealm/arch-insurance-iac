# Contextual Audio Enrichment — Module Integration Guide (CAE.100)

Contextual Audio Enrichment (CAE) is a **shared platform capability**. It is mounted once,
globally, and every NeuGAIN.io module consumes it through one import path. Modules never
implement speech, resolution, caching, or authorisation logic of their own.

## 1. Global mount (already done — do not duplicate)

`src/App.tsx` mounts the capability once, inside the router and the auth provider:

```tsx
<BrowserRouter>
  <AuthProvider>
    <ContextualAudioRoot>
      <Routes>…</Routes>
    </ContextualAudioRoot>

  </AuthProvider>
</BrowserRouter>
```

- **One controller for the whole application.** Only one narrative can speak anywhere.
- **Inside the router** so route changes reach the provider and stop playback.
- **Inside the auth provider** so sign in / sign out / tenant changes tear playback down.
- **Wrapped by an error boundary.** If the audio subtree faults, speech is cancelled and the
  app re-renders with an inert audio controller — pages keep working without narration.

Never mount a second `ContextualAudioProvider` in a module shell or layout.

## 2. Adding a placement to a page — the approved pattern

```tsx
import { AudioEnrichmentButton } from "@/platform/cae";

export function CommercialEbitdaCard() {
  return (
    <CardHeader>
      <CardTitle>EBITDA</CardTitle>
      <AudioEnrichmentButton
        callId="CAE.COMMERCIAL.EBITDA.001"
        label="Hear More"
        displayVariant="outline"   // "default" | "outline" | "ghost" | "compact"
        showTranscript              // renders the accessible transcript dialog
      />
    </CardHeader>
  );
}
```

That is the entire integration. The button resolves the narrative server-side, respects
permissions and tenancy, stops any other narrative, exposes pause/resume/stop, and offers a
transcript fallback for unsupported browsers.

Optional pieces, same import path:

```tsx
import { AudioPlaybackControls, TranscriptPanel, useContextualAudio, useCaeCallState } from "@/platform/cae";
```

- `AudioPlaybackControls` — a persistent transport bar for a page or module header.
- `TranscriptPanel` — standalone transcript rendering.
- `useContextualAudio()` — the controller, for bespoke affordances.
- `useCaeCallState(callId)` — the user-facing state of one call ID.

## 3. Rules

1. **Import only from `@/platform/cae`.** Deep imports into `runtime`, `speech.ts`, or the
   `audio_*` tables are not allowed; they bypass the single-playback and authorisation guarantees.
2. **Never call `window.speechSynthesis` in a module.**
3. **Never invent a call ID in code.** Call IDs are created by an author in the CAE Manager
   (`/platform/audio`) and match `CAE.<MODULE>.<TOPIC>.<NNN>`. A call ID is immutable after creation.
4. **Do not gate the button on your own permission checks.** Authorisation is decided by the
   `audio_resolve_call` SECURITY DEFINER function; an unauthorised user simply sees an
   "unavailable" state, and no restricted content is ever spoken or transcribed.
5. **Do not pass tenant, user, or role values.** The client sends the call ID and optional
   placement key only.
6. **No narrative content in code.** Text, speech profile, and pronunciation live in the database
   and are versioned, approved, and published through the governed lifecycle.

## 4. Getting a narrative to exist

1. Open **Platform → Contextual Audio → Narrative Library**.
2. Create the narrative, choosing module, topic, audience, and scope. The call ID is generated
   and locked at creation.
3. Author the draft version; use `{{module.variable_name}}` tokens for dynamic values and check
   the resolved preview.
4. Submit for review, approve, then publish. Only the published version is ever spoken.
5. Register the placement in **Placement Map** so analytics and the placement key line up with
   the page you added the button to.

## 5. Deployment control

CAE follows the existing Vite env convention.

| Control | Value | Effect |
| --- | --- | --- |
| `VITE_CAE_ENABLED` | `false` | Capability off for the deployment: affordances render nothing, no requests are issued. |
| `localStorage["cae:enabled"]` | `"true"` / `"false"` | Per-session override for support and QA; takes precedence over the env value. |

Check it in code with `isContextualAudioEnabled()` / `useContextualAudioEnabled()` if a module
needs to hide a surrounding container as well as the button.

## 6. Route and lifecycle behaviour you can rely on

| Event | Behaviour |
| --- | --- |
| Route change | Active speech is cancelled and the controller resets to idle. No overlapping speech. |
| Second button clicked | The first narrative is hard-stopped before the second begins. |
| Tenant switch | Full teardown (`platform:tenant-changed` event and storage listener). |
| Sign in / sign out / session change | Full teardown. |
| Provider unmount | Speech cancelled, pending resolutions invalidated by request token. |
| Audio subtree fault | Boundary cancels speech and supplies an inert controller; the module renders normally. |
| Browser without SpeechSynthesis | Button shows an unsupported state; the transcript remains readable. |

## 7. Validation

`src/platform/cae/globalIntegration.test.tsx` is the regression suite for the points above. Any
change to the global mount, the boundary, or the flag must keep it green.
