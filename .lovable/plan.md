## Change

In `src/pages/coworkers/HealthcarePayer.tsx`, add a `to` route on item #22 ("Cyber Resilience & Ransomware Readiness Coworker") so the card becomes a navigable link instead of an inert button.

### Edit

Line 66 — add `to`:
```ts
{ n: 22, title: "Cyber Resilience & Ransomware Readiness Coworker", desc: "Strengthen cybersecurity posture and recovery readiness", to: "/practice-library/cyber-security/resilience-ir" },
```

### Why this works

`CategoryCard` already renders a `<Link>` automatically when `it.to` is set (line 132–145). The route `/practice-library/cyber-security/resilience-ir` is already wired in `src/App.tsx` to `ResilienceDashboard`. No new routes or components required.

### Out of scope

No styling, copy, or other card changes.