/**
 * Tenant profile registry — the single source of truth for tenant records
 * consumed by DemoOperationsProvider.
 */

import { atlasCloudRecord, atlasCloudTenant } from "./atlasCloudProfile";
import { apexFabRecord, apexFabTenant } from "./apexFabProfile";
import { contosoRecord, contosoTenant } from "./contosoProfile";
import { meridianRecord, meridianTenant } from "./meridianProfile";
import { industryProfiles, getIndustryProfile } from "./industryProfiles";
import { resolvePresentation } from "./presentation";
import { validateTenantProfile } from "./validate";
import type {
  IndustryProfile, TenantFixtureBundle, TenantOperationalProfile,
  TenantPresentationProfile, TenantProfileRecord,
} from "./types";
import type { Tenant } from "@/runops/data/scenario";

export type { IndustryProfile, TenantFixtureBundle, TenantOperationalProfile,
  TenantPresentationProfile, TenantProfileRecord };
export { industryProfiles, getIndustryProfile, resolvePresentation, validateTenantProfile };

export const tenantRecords: readonly TenantProfileRecord[] = [
  contosoRecord,
  meridianRecord,
  atlasCloudRecord,
  apexFabRecord,
];

export const registeredTenants: readonly Tenant[] = [
  contosoTenant,
  meridianTenant,
  atlasCloudTenant,
  apexFabTenant,
];

export function getTenantRecord(tenantId: string): TenantProfileRecord {
  const found = tenantRecords.find((r) => r.profile.tenantId === tenantId);
  return found ?? contosoRecord;
}

export function getTenantProfile(tenantId: string): TenantOperationalProfile {
  return getTenantRecord(tenantId).profile;
}

export function getTenantBundle(tenantId: string): TenantFixtureBundle {
  return getTenantRecord(tenantId).bundle;
}

export function getPresentation(tenantId: string): TenantPresentationProfile {
  const r = getTenantRecord(tenantId);
  return resolvePresentation(r.profile, r.industry);
}
