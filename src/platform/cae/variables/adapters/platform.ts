/**
 * Platform module resolver adapter.
 *
 * Sees only the `platform` context slice. It cannot read commercial, RunOps,
 * or AVEP data.
 */
import type { CaeModuleSlice, CaeResolverOutcome, CaeVariableAdapter } from "../types";

function text(slice: CaeModuleSlice, key: string): CaeResolverOutcome {
  const value = slice[key];
  if (typeof value !== "string" || value.trim() === "") return { status: "missing" };
  return { status: "ok", value: value.trim() };
}

export const platformAdapter: CaeVariableAdapter = {
  moduleKey: "platform",
  resolverKeys: ["platform.tenant_name", "platform.module_name", "platform.current_page_name"],
  resolve(resolverKey, slice) {
    switch (resolverKey) {
      case "platform.tenant_name":
        return text(slice, "tenantName");
      case "platform.module_name":
        return text(slice, "moduleName");
      case "platform.current_page_name":
        return text(slice, "pageName");
      default:
        return { status: "unsupported_resolver" };
    }
  },
};
