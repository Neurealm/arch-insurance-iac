# Arch Insurance IAC

create project Neugain, i need to connect that to my git hub

This project was built with [Lovable](https://lovable.dev).

## Engineering handoff

For the governed Azure VM Terraform pilot, start with the
[current implementation status and next milestones](docs/implementation-status-2026-09-06.md).
It distinguishes completed code, unfinished governance work and unverified
deployment state. The [September 4 handoff](docs/hcp-terraform-pilot-history.md)
is historical and must not be treated as current deployment status.

The active application starts in `src/App.tsx`; Terraform execution is handled
by `supabase/functions/terraform-orchestrator/` using HCP Terraform, not the
legacy custom runner. Never run an apply as part of setup or code inspection.

Run the cloud-free orchestrator authorization regression suite with Node 24:

```sh
node --test supabase/functions/terraform-orchestrator/request-handler.test.ts supabase/functions/terraform-orchestrator/plan-digest.test.ts
```

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f5f4b495-b12d-41eb-89db-c28cdf1bbe08).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
