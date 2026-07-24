import { useAccess } from "@/platform/access/AccessContext";

export const COMMERCIAL_VIEW = "commercial.view";
export const COMMERCIAL_TENANT_SLUG = "neugain-commercial";

/**
 * Canonical commercial access snapshot. All commercial UI reads from here so
 * permission and tenant scoping stay consistent.
 */
export function useCommercialAccess() {
  const access = useAccess();
  const canView = access.hasPermission(COMMERCIAL_VIEW);
  const canManageProgram = access.hasPermission("commercial.program.manage");
  const canManageScenario = access.hasPermission("commercial.scenario.manage");
  const canManageAccount = access.hasPermission("commercial.account.manage");
  const canManageSource = access.hasPermission("commercial.source.manage");
  const canAdmin = access.hasPermission("commercial.admin");
  return {
    ...access,
    tenantId: access.activeTenantId,
    canView,
    canManageProgram,
    canManageScenario,
    canManageAccount,
    canManageSource,
    canAdmin,
  };
}

/** Query key factory — every commercial query MUST use this. */
export function commercialQueryKey(tenantId: string | null, ...rest: unknown[]) {
  return ["commercial", tenantId, ...rest] as const;
}
