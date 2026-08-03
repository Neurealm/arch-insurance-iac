/**
 * Runtime module registry.
 *
 * Manifests are discovered automatically from `src/modules/** /module.manifest.ts`
 * via Vite's `import.meta.glob`, so there is no second list for developers to
 * maintain. A module is registered by creating its manifest file — nothing else.
 */

import { validateManifests, type KnownReferences } from "./validate";
import type {
  CapabilityDeclaration,
  ModuleManifest,
  RegistryValidationReport,
} from "./types";

type ManifestModule = { default?: unknown; manifest?: unknown } & Record<string, unknown>;

const isManifest = (value: unknown): value is ModuleManifest => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ModuleManifest>;
  return (
    typeof candidate.schemaVersion === "string" &&
    !!candidate.identity &&
    typeof candidate.identity.moduleId === "string" &&
    !!candidate.boundaries &&
    Array.isArray(candidate.capabilities)
  );
};

function discover(): ModuleManifest[] {
  const modules = import.meta.glob<ManifestModule>("./**/module.manifest.ts", {
    eager: true,
  });
  const found: ModuleManifest[] = [];
  for (const mod of Object.values(modules)) {
    for (const exported of Object.values(mod ?? {})) {
      if (isManifest(exported)) found.push(exported);
    }
  }
  return found.sort((a, b) => a.identity.moduleId.localeCompare(b.identity.moduleId));
}

let cache: ModuleManifest[] | null = null;

/** All discovered module manifests. */
export function getModules(): readonly ModuleManifest[] {
  cache ??= discover();
  return cache;
}

export function getModule(moduleId: string): ModuleManifest | undefined {
  return getModules().find((m) => m.identity.moduleId === moduleId);
}

/** Every capability across every registered module. */
export function getCapabilities(): readonly (CapabilityDeclaration & { moduleId: string })[] {
  return getModules().flatMap((m) =>
    m.capabilities.map((c) => ({ ...c, moduleId: m.identity.moduleId })),
  );
}

/** Which module claims a given route, if any. Exact match wins over prefix. */
export function resolveRouteOwner(path: string): string | null {
  const modules = getModules();
  const exact = modules.find((m) => m.boundaries.routes.includes(path));
  if (exact) return exact.identity.moduleId;
  const prefixed = modules.find((m) =>
    m.boundaries.routePrefixes.some((p) => path === p || path.startsWith(`${p}/`)),
  );
  return prefixed?.identity.moduleId ?? null;
}

/** Validate the discovered registry. Pass known references to sharpen results. */
export function validateRegistry(known: KnownReferences = {}): RegistryValidationReport {
  return validateManifests(getModules(), known);
}

/** Test-only: reset the discovery cache. */
export function __resetRegistryCache(): void {
  cache = null;
}

export type { ModuleManifest, RegistryValidationReport };
export { validateManifests } from "./validate";
export * from "./types";
