import { supabase } from "@/integrations/supabase/client";

/**
 * Azure credentials stay in the Azure control-plane Function App. The browser
 * sends only the signed-in Supabase user's JWT to the protected API.
 */
export const azureControlPlaneUrl = (
  import.meta.env.VITE_AZURE_CONTROL_PLANE_URL ??
  "https://arch-iac-pilot-api-dev-01-fvdscfc5gmgkgfev.eastus-01.azurewebsites.net"
).replace(/\/$/, "");

/**
 * VM operations run in a separate, read-only Function App. Keeping it
 * separate lets the existing control plane keep serving its current API while
 * this higher-volume Azure monitoring endpoint evolves independently.
 */
export const azureVmOperationsUrl = (
  import.meta.env.VITE_AZURE_VM_OPERATIONS_URL ??
  "https://arch-iac-vm-operations-dev-01.azurewebsites.net"
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

export type AzureResource = {
  id: string;
  name: string;
  type: string;
  kind: string | null;
  location: string;
  subscriptionId: string;
  subscriptionName: string;
  resourceGroup: string;
  tags: Record<string, string>;
};

/**
 * Read-only VM operations data assembled by the protected Azure control plane.
 * The Function App is responsible for querying Azure Monitor, Backup, Update
 * Manager, and Resource Graph with its Managed Identity; the browser never
 * receives Azure credentials or calls Azure management APIs directly.
 */
export type AzureVmOperations = {
  observedAt: string | null;
  configuration: {
    vmSize: string | null;
    osType: string | null;
    zones: string[];
    availabilitySet: string | null;
    priority: string | null;
    securityType: string | null;
    encryptionAtHost: boolean | null;
    imageReference: string | null;
    identityType: string | null;
    vmAgentVersion: string | null;
    vmAgentStatus: string | null;
    extensions: string[];
    osDisk: {
      name: string | null;
      sizeGB: number | null;
      storageSku: string | null;
      caching: string | null;
    };
    dataDisks: Array<{
      name: string;
      sizeGB: number | null;
      storageSku: string | null;
      lun: number | null;
    }>;
    networkInterfaces: string[];
  };
  monitoring: {
    state: "available" | "not_configured" | "unavailable";
    cpuPercent: number | null;
    memoryPercent: number | null;
    diskUsedPercent: number | null;
  };
  bootDiagnostics: {
    state: "enabled" | "disabled" | "unavailable";
    screenshotAvailable: boolean;
    consoleLogAvailable: boolean;
  };
  backup: {
    state: "protected" | "not_protected" | "unavailable";
    vaultName: string | null;
    lastSuccessfulBackup: string | null;
  };
  patching: {
    state: "compliant" | "updates_available" | "not_configured" | "unavailable";
    assessment: string | null;
    updatesAvailable: number | null;
  };
  network: {
    networkInterface: string | null;
    privateIps: string[];
    publicIps: string[];
    subnet: string | null;
    networkSecurityGroups: string[];
    loadBalancers: string[];
  };
  history: {
    state: "available" | "unavailable";
    changes: Array<{
      timestamp: string;
      changeType: string;
      fields: Array<{ field: string; before: string | null; after: string | null }>;
    }>;
  };
  alerts: {
    state: "available" | "unavailable";
    alerts: Array<{
      name: string;
      severity: string;
      state: string;
      startedAt: string | null;
      monitorService: string | null;
    }>;
  };
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

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nullableBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function textList(value: unknown): string[] {
  return Array.isArray(value) ? value.flatMap((item) => typeof item === "string" && item.trim() ? [item] : []) : [];
}

function state<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? value as T : fallback;
}

function normalizeVmOperations(value: unknown, vm: AzureVirtualMachine): AzureVmOperations {
  const raw = record(value);
  const monitoring = record(raw.monitoring);
  const bootDiagnostics = record(raw.bootDiagnostics ?? raw.boot_diagnostics);
  const backup = record(raw.backup);
  const patching = record(raw.patching ?? raw.patch);
  const network = record(raw.network);
  const history = record(raw.history);
  const alerts = record(raw.alerts);
  const configuration = record(raw.configuration);
  const osDisk = record(configuration.osDisk ?? configuration.os_disk);
  const dataDisks = Array.isArray(configuration.dataDisks ?? configuration.data_disks)
    ? (configuration.dataDisks ?? configuration.data_disks) as unknown[]
    : [];

  return {
    observedAt: nullableText(raw.observedAt ?? raw.observed_at),
    configuration: {
      vmSize: nullableText(configuration.vmSize ?? configuration.vm_size),
      osType: nullableText(configuration.osType ?? configuration.os_type),
      zones: textList(configuration.zones),
      availabilitySet: nullableText(configuration.availabilitySet ?? configuration.availability_set),
      priority: nullableText(configuration.priority),
      securityType: nullableText(configuration.securityType ?? configuration.security_type),
      encryptionAtHost: nullableBoolean(configuration.encryptionAtHost ?? configuration.encryption_at_host),
      imageReference: nullableText(configuration.imageReference ?? configuration.image_reference),
      identityType: nullableText(configuration.identityType ?? configuration.identity_type),
      vmAgentVersion: nullableText(configuration.vmAgentVersion ?? configuration.vm_agent_version),
      vmAgentStatus: nullableText(configuration.vmAgentStatus ?? configuration.vm_agent_status),
      extensions: textList(configuration.extensions),
      osDisk: {
        name: nullableText(osDisk.name),
        sizeGB: nullableNumber(osDisk.sizeGB ?? osDisk.size_gb),
        storageSku: nullableText(osDisk.storageSku ?? osDisk.storage_sku),
        caching: nullableText(osDisk.caching),
      },
      dataDisks: dataDisks.flatMap((value) => {
        const disk = record(value);
        const name = nullableText(disk.name);
        return name ? [{
          name,
          sizeGB: nullableNumber(disk.sizeGB ?? disk.size_gb),
          storageSku: nullableText(disk.storageSku ?? disk.storage_sku),
          lun: nullableNumber(disk.lun),
        }] : [];
      }),
      networkInterfaces: textList(configuration.networkInterfaces ?? configuration.network_interfaces),
    },
    monitoring: {
      state: state(monitoring.state, ["available", "not_configured", "unavailable"], "unavailable"),
      cpuPercent: nullableNumber(monitoring.cpuPercent ?? monitoring.cpu_percent),
      memoryPercent: nullableNumber(monitoring.memoryPercent ?? monitoring.memory_percent),
      diskUsedPercent: nullableNumber(monitoring.diskUsedPercent ?? monitoring.disk_used_percent),
    },
    bootDiagnostics: {
      state: state(bootDiagnostics.state, ["enabled", "disabled", "unavailable"], "unavailable"),
      screenshotAvailable: bootDiagnostics.screenshotAvailable === true || bootDiagnostics.screenshot_available === true,
      consoleLogAvailable: bootDiagnostics.consoleLogAvailable === true || bootDiagnostics.console_log_available === true,
    },
    backup: {
      state: state(backup.state, ["protected", "not_protected", "unavailable"], "unavailable"),
      vaultName: nullableText(backup.vaultName ?? backup.vault_name),
      lastSuccessfulBackup: nullableText(backup.lastSuccessfulBackup ?? backup.last_successful_backup),
    },
    patching: {
      state: state(patching.state, ["compliant", "updates_available", "not_configured", "unavailable"], "unavailable"),
      assessment: nullableText(patching.assessment),
      updatesAvailable: nullableNumber(patching.updatesAvailable ?? patching.updates_available),
    },
    network: {
      networkInterface: nullableText(network.networkInterface ?? network.network_interface) ?? vmNicName(vm),
      privateIps: textList(network.privateIps ?? network.private_ips),
      publicIps: textList(network.publicIps ?? network.public_ips),
      subnet: nullableText(network.subnet),
      networkSecurityGroups: textList(network.networkSecurityGroups ?? network.network_security_groups),
      loadBalancers: textList(network.loadBalancers ?? network.load_balancers),
    },
    history: {
      state: state(history.state, ["available", "unavailable"], "unavailable"),
      changes: Array.isArray(history.changes) ? history.changes.flatMap((value) => {
        const change = record(value);
        const timestamp = nullableText(change.timestamp);
        if (!timestamp) return [];
        const fields = Array.isArray(change.fields) ? change.fields.flatMap((fieldValue) => {
          const field = record(fieldValue);
          const name = nullableText(field.field);
          return name ? [{ field: name, before: nullableText(field.before), after: nullableText(field.after) }] : [];
        }) : [];
        return [{ timestamp, changeType: text(change.changeType, "Update"), fields }];
      }) : [],
    },
    alerts: {
      state: state(alerts.state, ["available", "unavailable"], "unavailable"),
      alerts: Array.isArray(alerts.alerts) ? alerts.alerts.flatMap((value) => {
        const alert = record(value);
        const name = nullableText(alert.name);
        return name ? [{
          name,
          severity: text(alert.severity, "Unknown"),
          state: text(alert.state, "Unknown"),
          startedAt: nullableText(alert.startedAt ?? alert.started_at),
          monitorService: nullableText(alert.monitorService ?? alert.monitor_service),
        }] : [];
      }) : [],
    },
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

async function authenticatedGet(path: string, baseUrl = azureControlPlaneUrl): Promise<unknown> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new AzureControlPlaneError("Sign in to load Azure resources.", 401);

  const response = await fetch(`${baseUrl}${path}`, {
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

export async function listAzureResources(): Promise<AzureResource[]> {
  return responseItems(await authenticatedGet("/api/v1/resources")).flatMap((value) => {
    const raw = record(value);
    if (typeof raw.id !== "string" || typeof raw.name !== "string" || typeof raw.type !== "string") return [];
    return [{
      id: raw.id,
      name: raw.name,
      type: raw.type,
      kind: typeof raw.kind === "string" ? raw.kind : null,
      location: text(raw.location),
      subscriptionId: text(raw.subscriptionId),
      subscriptionName: text(raw.subscriptionName),
      resourceGroup: text(raw.resourceGroup),
      tags: normalizeTags(raw.tags),
    }];
  });
}

export async function getAzureScopes(): Promise<Record<string, unknown>> {
  return record(await authenticatedGet("/api/azure/scopes"));
}

/**
 * The endpoint is read-only and uses a managed identity in Azure. The browser
 * provides only the signed-in user's Supabase session token.
 */
export async function getAzureVmOperations(vm: AzureVirtualMachine): Promise<AzureVmOperations> {
  const subscription = encodeURIComponent(vm.subscriptionId);
  const resourceGroup = encodeURIComponent(vm.resourceGroup);
  const name = encodeURIComponent(vm.name);
  const payload = await authenticatedGet(
    `/api/v1/virtual-machines/${subscription}/${resourceGroup}/${name}/operations`,
    azureVmOperationsUrl,
  );
  return normalizeVmOperations(payload, vm);
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
