import { supabase } from "@/integrations/supabase/client";

/**
 * Azure credentials stay in the Azure control-plane Function App. The browser
 * sends only the signed-in Supabase user's JWT to the protected API.
 */
export const azureControlPlaneUrl = (
  import.meta.env.VITE_AZURE_CONTROL_PLANE_URL ??
  "https://arch-iac-pilot-api-dev-01-fvdscfc5gmgkgfev.eastus-01.azurewebsites.net"
).replace(/\/$/, "");

export type AzureVirtualMachine = {
  id: string;
  name: string;
  resourceGroup: string;
  subscriptionId: string;
  location: string;
  powerState: string;
  provisioningState: string;
  vmSize: string;
  osType: string;
  tags: Record<string, string>;
  raw: Record<string, unknown>;
};

export class AzureControlPlaneError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "AzureControlPlaneError";
  }
}

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function text(value: unknown, fallback = "Not reported"): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function nested(source: UnknownRecord, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => record(current)[key], source);
}

function first(source: UnknownRecord, paths: string[], fallback?: string): string {
  for (const path of paths) {
    const value = nested(source, path);
    if (typeof value === "string" && value.trim()) return value;
  }
  return fallback ?? "Not reported";
}

function nameFromResourceId(id: string): string {
  const parts = id.split("/").filter(Boolean);
  return parts.at(-1) ?? id;
}

function normalizeTags(value: unknown): Record<string, string> {
  return Object.fromEntries(Object.entries(record(value)).map(([key, tagValue]) => [key, String(tagValue)]));
}

function normalizeVm(value: unknown): AzureVirtualMachine {
  const raw = record(value);
  const id = first(raw, ["id", "resourceId", "resource_id"], "unknown-resource");
  const tags = normalizeTags(raw.tags ?? nested(raw, "properties.tags"));
  return {
    id,
    name: first(raw, ["name"], nameFromResourceId(id)),
    resourceGroup: first(raw, ["resourceGroup", "resource_group"], id.match(/resourceGroups\/([^/]+)/i)?.[1] ?? "Not reported"),
    subscriptionId: first(raw, ["subscriptionId", "subscription_id"], id.match(/subscriptions\/([^/]+)/i)?.[1] ?? "Not reported"),
    location: first(raw, ["location", "region"], "Not reported"),
    powerState: first(raw, ["powerState", "power_state", "instanceView.powerState", "properties.powerState"], "Unknown"),
    provisioningState: first(raw, ["provisioningState", "provisioning_state", "properties.provisioningState"], "Unknown"),
    vmSize: first(raw, ["vmSize", "vm_size", "hardwareProfile.vmSize", "properties.hardwareProfile.vmSize"], "Not reported"),
    osType: first(raw, ["osType", "os_type", "storageProfile.osDisk.osType", "properties.storageProfile.osDisk.osType"], "Not reported"),
    tags,
    raw,
  };
}

function responseItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const body = record(payload);
  for (const key of ["value", "items", "resources", "vms", "virtualMachines", "virtual_machines", "data"]) {
    if (Array.isArray(body[key])) return body[key] as unknown[];
  }
  return [];
}

async function authenticatedGet(path: string): Promise<unknown> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new AzureControlPlaneError("Sign in to load Azure resources.", 401);

  const response = await fetch(`${azureControlPlaneUrl}${path}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const body = record(payload);
    throw new AzureControlPlaneError(text(body.error ?? body.message, `Azure control plane returned ${response.status}.`), response.status);
  }
  return payload;
}

export async function listAzureVirtualMachines(): Promise<AzureVirtualMachine[]> {
  return responseItems(await authenticatedGet("/api/v1/virtual-machines")).map(normalizeVm);
}

export async function getAzureScopes(): Promise<Record<string, unknown>> {
  return record(await authenticatedGet("/api/azure/scopes"));
}

export function vmDiskName(vm: AzureVirtualMachine): string | null {
  const disk = nested(vm.raw, "storageProfile.osDisk.name") ?? nested(vm.raw, "properties.storageProfile.osDisk.name");
  return typeof disk === "string" && disk.trim() ? disk : null;
}

export function vmNicName(vm: AzureVirtualMachine): string | null {
  const interfaces = nested(vm.raw, "networkProfile.networkInterfaces") ?? nested(vm.raw, "properties.networkProfile.networkInterfaces");
  const firstInterface = Array.isArray(interfaces) ? record(interfaces[0]) : {};
  return typeof firstInterface.id === "string" ? nameFromResourceId(firstInterface.id) : null;
}
