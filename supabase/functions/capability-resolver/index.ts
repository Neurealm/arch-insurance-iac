import { directNamesUnder, fetchTree, resolveRevision } from "../_shared/github.ts";
import { addGapEvent, adminClient, corsHeaders, isPlatformAuthorized, jsonReply, obj, resolvePrincipal, str, type Json } from "../_shared/platform-function.ts";

const REPOSITORY = "Neurealm/arch-insurance-iac";
const MODULE_ROOT = "terraform/modules";

const admin = adminClient;
const reply = jsonReply;
const addEvent = addGapEvent;

/**
 * This function runs unattended (a scheduled GitHub Actions workflow or
 * pg_net trigger calling in, no end user in the loop), so it authenticates
 * the caller as either the service role itself (`Authorization: Bearer
 * <service_role_key>`) or an interactively authenticated platform admin (for
 * a manual "resolve now" trigger from the admin UI) -- never an ordinary
 * user.
 */
async function authorized(request: Request, db: ReturnType<typeof admin>) {
  return isPlatformAuthorized(await resolvePrincipal(request, db));
}

/**
 * Loose keyword match: an action_type like "create_vm" must find a module
 * directory name containing "create" AND a VM-ish token ("vm", "virtual",
 * "machine"). Intentionally conservative -- a false positive would surface
 * a wrong module for human review, not auto-catalog anything, so leaning
 * toward "found nothing" when in doubt is the safer failure mode here.
 */
function candidateModules(actionType: string, moduleNames: string[]) {
  const tokens = actionType.toLowerCase().split(/[_-]+/).filter(Boolean);
  const vmSynonyms = ["vm", "vms", "virtual", "machine", "machines"];
  const verb = tokens.find((token) => !vmSynonyms.includes(token)) ?? tokens[0];
  const hasVerb = (name: string) => name.includes(verb);
  const hasVmToken = (name: string) => vmSynonyms.some((synonym) => name.split("-").includes(synonym));
  return moduleNames.filter((name) => hasVerb(name) && hasVmToken(name));
}

async function resolveGap(db: ReturnType<typeof admin>["client"], gap: Json) {
  const provider = str(gap.provider);
  const resourceType = str(gap.resource_type);
  const actionType = str(gap.action_type);

  // Race guard: another actor (a human catalog edit, or a previous run)
  // may have already produced a usable capability for this exact action
  // since the gap was opened.
  const { data: capability } = await db.from("iac_automation_capabilities").select("id, lifecycle_status, module_source").eq("provider", provider).eq("resource_type", resourceType).eq("action_type", actionType).in("lifecycle_status", ["approved", "draft", "testing"]).order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (capability?.lifecycle_status === "approved") {
    await db.from("iac_engineering_gaps").update({ status: "capability_approved", linked_capability_id: capability.id }).eq("id", gap.id);
    await addEvent(db, str(gap.id), "capability_already_approved", { capabilityId: capability.id, moduleSource: capability.module_source });
    return "capability_approved";
  }
  if (capability) {
    await db.from("iac_engineering_gaps").update({ status: "ready_for_review", linked_capability_id: capability.id }).eq("id", gap.id);
    await addEvent(db, str(gap.id), "existing_capability_found", { capabilityId: capability.id, lifecycleStatus: capability.lifecycle_status, moduleSource: capability.module_source });
    return "ready_for_review";
  }

  const secret = str(Deno.env.get("GITHUB_TERRAFORM_SOURCE_TOKEN"));
  if (secret) {
    try {
      const ref = str(Deno.env.get("HCP_TERRAFORM_SOURCE_REF")) || "main";
      const revision = await resolveRevision(REPOSITORY, ref, secret, "Unable to resolve Terraform source revision");
      const tree = await fetchTree(REPOSITORY, revision, secret, "Unable to read repository tree");
      const moduleNames = directNamesUnder(tree, MODULE_ROOT);
      const candidates = candidateModules(actionType, moduleNames);
      if (candidates.length) {
        const discovered = `${MODULE_ROOT}/${candidates[0]}`;
        await db.from("iac_engineering_gaps").update({ status: "ready_for_review", discovered_module_source: discovered, notes: candidates.length > 1 ? `Other candidates found: ${candidates.slice(1).join(", ")}` : null }).eq("id", gap.id);
        await addEvent(db, str(gap.id), "existing_module_discovered", { candidates, chosen: discovered, revision });
        return "ready_for_review";
      }
      await addEvent(db, str(gap.id), "github_search_completed", { moduleCount: moduleNames.length, revision, found: false });
    } catch (cause) {
      await addEvent(db, str(gap.id), "github_search_failed", { message: cause instanceof Error ? cause.message : String(cause) });
    }
  }

  await db.from("iac_engineering_gaps").update({ status: "drafting" }).eq("id", gap.id);
  await addEvent(db, str(gap.id), "drafting_queued", { action: actionType });
  return "drafting";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return reply(request, { error: "method not allowed" }, 405);
  const db = admin();
  if (!await authorized(request, db)) return reply(request, { error: "unauthorized" }, 401);
  let body: Json;
  try { body = obj(await request.json().catch(() => ({}))); } catch { body = {}; }
  const gapId = str(body.gapId);

  let query = db.client.from("iac_engineering_gaps").select("*").eq("status", "open").order("created_at", { ascending: true }).limit(20);
  if (gapId) query = db.client.from("iac_engineering_gaps").select("*").eq("id", gapId).eq("status", "open").limit(1);
  const { data: gaps, error } = await query;
  if (error) return reply(request, { error: error.message }, 500);

  const results: Json[] = [];
  for (const gap of gaps ?? []) {
    try { results.push({ gapId: gap.id, outcome: await resolveGap(db.client, gap as Json) }); }
    catch (cause) { results.push({ gapId: gap.id, outcome: "error", message: cause instanceof Error ? cause.message : String(cause) }); }
  }
  return reply(request, { processed: results.length, results }, 200);
});
