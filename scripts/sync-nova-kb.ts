#!/usr/bin/env node
/**
 * Nova KB catalog sync.
 *
 * Detects top-level route domains that don't have a nova_knowledge_base entry
 * yet, drafts a title + description for each via the Lovable AI Gateway
 * (reading the landing page's own source for context), and inserts them
 * directly (ON CONFLICT (route) DO NOTHING — is_active defaults true, so new
 * entries are live immediately; there is no review-gate by design).
 *
 * Reuses the existing route/component extractor in extract-route-table.mjs
 * rather than re-parsing src/App.tsx — that script already resolves each
 * <Route> to its component file, handling wrappers, nesting, and lazy
 * imports correctly.
 *
 * Run via: bun run scripts/sync-nova-kb.ts
 * Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LOVABLE_API_KEY
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { extractRoutes } from "./extract-route-table.mjs";

const ROOT = process.cwd();
const LOVABLE_MODEL = "google/gemini-2.5-flash";

/** Route segments that are auth/system flows, not customer-facing features. */
const SKIP_SEGMENTS = new Set([
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "pending-approval",
  "no-access",
  "set-password",
  "complete-profile",
  "profile",
  "q",
  "app",
  "_dev",
  "invitations",
]);

interface RouteInfo {
  path: string;
  component: string | null;
  componentFile: string | null;
  isDynamic: boolean;
  isCatchAll: boolean;
  isIndex: boolean;
}

interface LandingCandidate {
  segment: string;
  route: string;
  componentFile: string | null;
}

function topLevelSegment(path: string): string | null {
  if (!path.startsWith("/")) return null;
  const seg = path.slice(1).split("/")[0];
  return seg || null;
}

/** Pick one landing route per top-level segment: prefer the bare "/segment"
 *  route; otherwise the shortest path under that segment. */
function pickLandingRoutes(routes: RouteInfo[]): LandingCandidate[] {
  const bySegment = new Map<string, RouteInfo[]>();
  for (const r of routes) {
    if (r.isDynamic || r.isCatchAll || !r.component) continue;
    const seg = topLevelSegment(r.path);
    if (!seg || SKIP_SEGMENTS.has(seg)) continue;
    const list = bySegment.get(seg) ?? [];
    list.push(r);
    bySegment.set(seg, list);
  }

  const out: LandingCandidate[] = [];
  for (const [seg, list] of bySegment) {
    const bare = list.find((r) => r.path === `/${seg}`);
    const chosen = bare ?? [...list].sort((a, b) => a.path.length - b.path.length)[0];
    out.push({ segment: seg, route: chosen.path, componentFile: chosen.componentFile });
  }
  return out.sort((a, b) => a.segment.localeCompare(b.segment));
}

async function draftCatalogEntry(
  candidate: LandingCandidate,
  existingSample: { title: string; route: string; description: string }[],
  lovableApiKey: string,
): Promise<{ title: string; description: string } | null> {
  let sourceExcerpt = "";
  if (candidate.componentFile) {
    try {
      sourceExcerpt = readFileSync(join(ROOT, candidate.componentFile), "utf8").slice(0, 6000);
    } catch {
      sourceExcerpt = "";
    }
  }

  const sampleBlock = existingSample
    .map((s) => `- ${s.title} (${s.route}): ${s.description}`)
    .join("\n");

  const systemPrompt = `You write concise catalog entries for NeuGAIN's platform knowledge base, used by an AI guidance agent to route customer questions to the right page. Given a route and its page component's source, write a "title" (short, matches the existing style) and a "description" (1-3 sentences, dense with the terms a customer would actually search for — capabilities, outcomes, practice areas — not just a restatement of the title).

Existing entries for style reference:
${sampleBlock}

Respond with ONLY a JSON object: {"title": "string", "description": "string"}. No markdown fences, no other text.`;

  const userPrompt = `Route: ${candidate.route}\nComponent file: ${candidate.componentFile ?? "unknown"}\n\nSource excerpt:\n${sourceExcerpt || "(source unavailable — infer from the route path and component name only)"}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LOVABLE_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    console.error(`sync-nova-kb: gateway error for ${candidate.route}: ${res.status} ${await res.text()}`);
    return null;
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed.title === "string" && typeof parsed.description === "string") {
      return { title: parsed.title.slice(0, 200), description: parsed.description.slice(0, 1000) };
    }
  } catch {
    // fall through
  }
  return null;
}

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY || !LOVABLE_API_KEY) {
    console.error("sync-nova-kb: missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or LOVABLE_API_KEY");
    process.exit(1);
  }
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  const { data: existingRows, error: fetchError } = await admin
    .from("nova_knowledge_base")
    .select("title, route, description, sort_order")
    .order("sort_order", { ascending: true });
  if (fetchError) {
    console.error("sync-nova-kb: failed to load existing catalog:", fetchError.message);
    process.exit(1);
  }
  const existing = existingRows ?? [];
  const coveredSegments = new Set(
    existing.map((r) => topLevelSegment(r.route)).filter((s): s is string => !!s),
  );

  const routes = extractRoutes() as RouteInfo[];
  const landings = pickLandingRoutes(routes);
  const newCandidates = landings.filter((c) => !coveredSegments.has(c.segment));

  if (newCandidates.length === 0) {
    console.log("sync-nova-kb: no new top-level domains — catalog is current.");
    return;
  }

  console.log(`sync-nova-kb: ${newCandidates.length} new domain(s) to catalog: ${newCandidates.map((c) => c.segment).join(", ")}`);

  const sample = existing.slice(0, 8).map((r) => ({ title: r.title, route: r.route, description: r.description }));
  let nextSortOrder = (existing.at(-1)?.sort_order ?? 0) + 1;
  let inserted = 0;

  for (const candidate of newCandidates) {
    const drafted = await draftCatalogEntry(candidate, sample, LOVABLE_API_KEY);
    if (!drafted) {
      console.warn(`sync-nova-kb: could not draft an entry for ${candidate.route} — skipping`);
      continue;
    }
    const { error: insertError } = await admin
      .from("nova_knowledge_base")
      .insert({
        title: drafted.title,
        route: candidate.route,
        description: drafted.description,
        is_active: true,
        sort_order: nextSortOrder,
      })
      .select("id")
      .single();
    // Unique-violation on `route` (another run inserted it concurrently, or it
    // was added since we fetched) is expected and not an error to fail the job on.
    if (insertError && !insertError.message.includes("duplicate key")) {
      console.error(`sync-nova-kb: failed to insert ${candidate.route}:`, insertError.message);
      continue;
    }
    if (!insertError) {
      console.log(`sync-nova-kb: added "${drafted.title}" -> ${candidate.route}`);
      inserted += 1;
      nextSortOrder += 1;
    }
  }

  console.log(`sync-nova-kb: done — ${inserted}/${newCandidates.length} new entries added.`);
}

main().catch((err) => {
  console.error("sync-nova-kb: unhandled error", err);
  process.exit(1);
});
