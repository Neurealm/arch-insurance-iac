import { app } from "@azure/functions";

const managementResource = "https://management.azure.com/";
const controlPlaneAuthUrl = process.env.CONTROL_PLANE_AUTH_URL;
const supabaseUrl = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

let cachedToken = null;

class AzureRequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function response(body, status = 200, request) {
  const origin = request?.headers.get("origin");
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
  if (origin && allowedOrigins.has(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers.vary = "Origin";
  }
  return { status, headers, jsonBody: body };
}

function preflight(request) {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins.has(origin)) {
    return response({ message: "This application origin is not allowed to call the Azure operations API." }, 403, request);
  }
  return {
    // Azure Functions' Linux host strips custom headers from a 204 response.
    // A successful empty 200 response preserves the CORS headers browsers need
    // before sending the authenticated GET request.
    status: 200,
    headers: {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "authorization, content-type",
      "access-control-max-age": "600",
      vary: "Origin",
    },
    body: "",
  };
}

function isValidSegment(value, expression) {
  return typeof value === "string" && expression.test(value);
}

function nameFromId(id) {
  return typeof id === "string" ? id.split("/").filter(Boolean).at(-1) ?? null : null;
}

function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isoNow() {
  return new Date().toISOString();
}

function errorStatus(error) {
  return error instanceof AzureRequestError ? error.status : undefined;
}

async function getManagementToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const identityEndpoint = process.env.IDENTITY_ENDPOINT ?? process.env.MSI_ENDPOINT;
  if (!identityEndpoint) throw new Error("Managed identity is not available to this Function App.");

  const endpoint = new URL(identityEndpoint);
  endpoint.searchParams.set("api-version", "2019-08-01");
  endpoint.searchParams.set("resource", managementResource);

  const headers = { Metadata: "true" };
  if (process.env.IDENTITY_HEADER) headers["X-IDENTITY-HEADER"] = process.env.IDENTITY_HEADER;
  if (process.env.MSI_SECRET) headers.Secret = process.env.MSI_SECRET;

  const tokenResponse = await fetch(endpoint, { headers });
  if (!tokenResponse.ok) throw new Error("Could not acquire the managed identity token.");
  const token = await tokenResponse.json();
  const expiresOn = Number(token.expires_on);
  cachedToken = {
    value: token.access_token,
    expiresAt: Number.isFinite(expiresOn) ? expiresOn * 1000 : Date.now() + 5 * 60_000,
  };
  return cachedToken.value;
}

async function arm(path, { method = "GET", body } = {}) {
  const token = await getManagementToken();
  const request = await fetch(`${managementResource.replace(/\/$/, "")}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await request.json().catch(() => ({}));
  if (!request.ok) {
    const message = record(record(payload).error).message ?? `Azure management request returned ${request.status}.`;
    throw new AzureRequestError(request.status, message);
  }
  return payload;
}

async function requireAuthorizedUser(request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;
  if (!controlPlaneAuthUrl) throw new Error("CONTROL_PLANE_AUTH_URL is not configured.");

  const authResponse = await fetch(controlPlaneAuthUrl, { headers: { authorization } });
  return authResponse.ok;
}

async function supabaseRpc(functionName, authorization, body) {
  if (!supabaseUrl || !supabasePublishableKey) throw new Error("Supabase execution validation is not configured.");
  const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: supabasePublishableKey,
      authorization,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await rpcResponse.json().catch(() => ({}));
  if (!rpcResponse.ok) {
    const message = record(payload).message ?? record(payload).error ?? `Package validation returned ${rpcResponse.status}.`;
    throw new AzureRequestError(rpcResponse.status === 401 || rpcResponse.status === 403 ? 403 : 409, String(message));
  }
  return Array.isArray(payload) ? payload[0] ?? {} : payload;
}

function powerState(instanceView) {
  const status = asArray(record(instanceView).statuses).find((item) => String(record(item).code ?? "").startsWith("PowerState/"));
  return typeof record(status).code === "string" ? record(status).code : null;
}

function delay(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }

async function waitForRunning(vmPath) {
  for (let attempt = 0; attempt < 18; attempt += 1) {
    const instanceView = await arm(`${vmPath}/instanceView?api-version=2024-07-01`);
    const state = powerState(instanceView);
    if (state === "PowerState/running") return { running: true, state };
    await delay(5_000);
  }
  return { running: false, state: "PowerState/starting" };
}

function lastMetricAverage(metrics) {
  const timeSeries = asArray(record(metrics).value?.[0]?.timeseries);
  const data = asArray(timeSeries[0]?.data);
  const values = data
    .map((point) => point?.average)
    .filter((value) => typeof value === "number" && Number.isFinite(value));
  return values.at(-1) ?? null;
}

async function monitoring(vmId) {
  const end = new Date();
  const start = new Date(end.getTime() - 6 * 60 * 60 * 1000);
  const path = `${vmId}/providers/microsoft.insights/metrics?api-version=2018-01-01&metricnames=${encodeURIComponent("Percentage CPU")}&timespan=${encodeURIComponent(`${start.toISOString()}/${end.toISOString()}`)}&interval=PT1H&aggregation=Average`;
  try {
    const cpuPercent = lastMetricAverage(await arm(path));
    return {
      state: cpuPercent === null ? "not_configured" : "available",
      cpuPercent,
      // Guest memory and disk require Azure Monitor Agent + VM Insights/DCR.
      memoryPercent: null,
      diskUsedPercent: null,
    };
  } catch (error) {
    return { state: errorStatus(error) === 404 ? "not_configured" : "unavailable", cpuPercent: null, memoryPercent: null, diskUsedPercent: null };
  }
}

function bootDiagnostics(vm, instanceView) {
  const enabled = record(record(vm).properties).diagnosticsProfile?.bootDiagnostics?.enabled;
  if (typeof enabled !== "boolean") return { state: "unavailable", screenshotAvailable: false, consoleLogAvailable: false };
  const details = record(record(instanceView).bootDiagnostics);
  return {
    state: enabled ? "enabled" : "disabled",
    screenshotAvailable: Boolean(details.consoleScreenshotBlobUri),
    consoleLogAvailable: Boolean(details.serialConsoleLogBlobUri),
  };
}

function firstStatus(statuses) {
  const status = record(asArray(statuses)[0]);
  return typeof status.displayStatus === "string"
    ? status.displayStatus
    : typeof status.code === "string" ? status.code : null;
}

function diskAttachmentConfiguration(disk) {
  const values = record(disk);
  const managedDisk = record(values.managedDisk);
  return {
    name: typeof values.name === "string" ? values.name : null,
    sizeGB: typeof values.diskSizeGB === "number" ? values.diskSizeGB : null,
    storageSku: typeof managedDisk.storageAccountType === "string" ? managedDisk.storageAccountType : null,
    caching: typeof values.caching === "string" ? values.caching : null,
    lun: typeof values.lun === "number" ? values.lun : null,
  };
}

async function diskConfiguration(disk) {
  const attachment = diskAttachmentConfiguration(disk);
  const managedDiskId = record(record(disk).managedDisk).id;
  if (typeof managedDiskId !== "string") return attachment;

  try {
    const managedDisk = record(await arm(`${managedDiskId}?api-version=2024-03-02`));
    const properties = record(managedDisk.properties);
    const sku = record(managedDisk.sku);
    return {
      ...attachment,
      sizeGB: typeof properties.diskSizeGB === "number" ? properties.diskSizeGB : attachment.sizeGB,
      storageSku: typeof sku.name === "string" ? sku.name : attachment.storageSku,
    };
  } catch {
    // Disk metadata is optional enrichment; retain the VM attachment details.
    return attachment;
  }
}

function imageReference(storageProfile) {
  const image = record(record(storageProfile).imageReference);
  const parts = [image.publisher, image.offer, image.sku, image.version]
    .filter((value) => typeof value === "string" && value.trim());
  return parts.length ? parts.join(" / ") : null;
}

async function vmConfiguration(vm, instanceView, topology) {
  const properties = record(record(vm).properties);
  const hardware = record(properties.hardwareProfile);
  const storage = record(properties.storageProfile);
  const security = record(properties.securityProfile);
  const agent = record(record(instanceView).vmAgent);
  const extensions = asArray(record(instanceView).extensions).flatMap((extension) => {
    const details = record(extension);
    const name = typeof details.name === "string" ? details.name : null;
    if (!name) return [];
    const status = firstStatus(details.statuses);
    return [status ? `${name} (${status})` : name];
  });

  const osDisk = await diskConfiguration(storage.osDisk);
  const dataDisks = (await Promise.all(asArray(storage.dataDisks).map(diskConfiguration)))
    .flatMap((disk) => disk.name ? [disk] : []);

  return {
    vmSize: typeof hardware.vmSize === "string" ? hardware.vmSize : null,
    osType: typeof record(storage.osDisk).osType === "string" ? record(storage.osDisk).osType : null,
    zones: asArray(vm.zones).filter((zone) => typeof zone === "string"),
    availabilitySet: nameFromId(record(properties.availabilitySet).id),
    priority: typeof properties.priority === "string" ? properties.priority : null,
    securityType: typeof security.securityType === "string" ? security.securityType : null,
    encryptionAtHost: typeof security.encryptionAtHost === "boolean" ? security.encryptionAtHost : null,
    imageReference: imageReference(storage),
    identityType: typeof record(vm.identity).type === "string" ? record(vm.identity).type : null,
    vmAgentVersion: typeof agent.vmAgentVersion === "string" ? agent.vmAgentVersion : null,
    vmAgentStatus: firstStatus(agent.statuses),
    extensions,
    osDisk,
    dataDisks,
    networkInterfaces: topology.networkInterfaces,
  };
}

async function backup(subscriptionId, location, vm) {
  const vmId = vm.id;
  const vmName = vm.name;
  const resourceGroup = record(vm).resourceGroup ?? vmId.match(/resourceGroups\/([^/]+)/i)?.[1];
  if (!vmId || !vmName || !resourceGroup || !location) {
    return { state: "unavailable", vaultName: null, lastSuccessfulBackup: null };
  }
  try {
    const result = record(await arm(
      `/subscriptions/${subscriptionId}/providers/Microsoft.RecoveryServices/locations/${encodeURIComponent(location)}/backupStatus?api-version=2025-02-01`,
      {
        method: "POST",
        body: {
          resourceId: vmId,
          resourceType: "VM",
          resourceName: vmName,
          resourceGroupName: resourceGroup,
          resourceLocation: location,
        },
      },
    ));
    const properties = record(result.properties);
    const protectionStatus = String(properties.protectionStatus ?? result.protectionStatus ?? "").toLowerCase();
    const state = protectionStatus.includes("protected") && !protectionStatus.includes("not")
      ? "protected"
      : protectionStatus ? "not_protected" : "unavailable";
    return {
      state,
      vaultName: nameFromId(properties.vaultId ?? result.vaultId),
      lastSuccessfulBackup: typeof properties.lastBackupStatus === "string" ? properties.lastBackupStatus : null,
    };
  } catch {
    return { state: "unavailable", vaultName: null, lastSuccessfulBackup: null };
  }
}

async function patching(vmId) {
  try {
    const assessment = record(await arm(`${vmId}/patchAssessmentResults/latest?api-version=2024-07-01`));
    const properties = record(assessment.properties);
    const counts = Object.values(record(properties.availablePatchCountByClassification));
    const updatesAvailable = counts.reduce((total, count) => total + (typeof count === "number" ? count : 0), 0);
    return {
      state: updatesAvailable > 0 ? "updates_available" : "compliant",
      assessment: typeof properties.lastModifiedDateTime === "string" ? properties.lastModifiedDateTime : null,
      updatesAvailable,
    };
  } catch (error) {
    return {
      state: errorStatus(error) === 404 ? "not_configured" : "unavailable",
      assessment: null,
      updatesAvailable: null,
    };
  }
}

function printable(value) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}

function propertyLabel(path) {
  return path
    .replace(/^properties\./, "")
    .replace(/\.([A-Z])/g, " $1")
    .replace(/\./g, " · ");
}

async function history(vmId) {
  try {
    const result = record(await arm(`${vmId}/providers/Microsoft.Resources/changes?api-version=2022-05-01&$top=20`));
    const changes = asArray(result.value).flatMap((entry) => {
      const properties = record(record(entry).properties);
      const attributes = record(properties.ChangeAttributes);
      const changedProperties = record(properties.Changes);
      const fields = Object.entries(changedProperties).flatMap(([path, values]) => {
        const change = record(values);
        const before = printable(change.PreviousValue);
        const after = printable(change.NewValue);
        return before || after ? [{ field: propertyLabel(path), before, after }] : [];
      });
      const timestamp = typeof attributes.Timestamp === "string" ? attributes.Timestamp : null;
      const changeType = typeof properties.ChangeType === "string" ? properties.ChangeType : "Update";
      return timestamp ? [{ timestamp, changeType, fields }] : [];
    }).sort((left, right) => right.timestamp.localeCompare(left.timestamp));
    return { state: "available", changes };
  } catch {
    return { state: "unavailable", changes: [] };
  }
}

async function alerts(subscriptionId, vmId) {
  try {
    const result = record(await arm(
      `/subscriptions/${subscriptionId}/providers/Microsoft.AlertsManagement/alerts?api-version=2019-03-01&targetResource=${encodeURIComponent(vmId)}&monitorCondition=Fired&timeRange=7d&pageCount=25`,
    ));
    const items = asArray(result.value).flatMap((entry) => {
      const essentials = record(record(record(entry).properties).essentials);
      const name = typeof essentials.alertRule === "string"
        ? essentials.alertRule
        : typeof essentials.alertRuleName === "string" ? essentials.alertRuleName : null;
      if (!name) return [];
      return [{
        name,
        severity: typeof essentials.severity === "string" ? essentials.severity : "Unknown",
        state: typeof essentials.alertState === "string" ? essentials.alertState : "Unknown",
        startedAt: typeof essentials.startDateTime === "string" ? essentials.startDateTime : null,
        monitorService: typeof essentials.monitorService === "string" ? essentials.monitorService : null,
      }];
    });
    return { state: "available", alerts: items };
  } catch {
    return { state: "unavailable", alerts: [] };
  }
}

function addUnique(target, value) {
  if (typeof value === "string" && value.trim() && !target.includes(value)) target.push(value);
}

function loadBalancerName(id) {
  const match = typeof id === "string" ? id.match(/\/loadBalancers\/([^/]+)/i) : null;
  return match?.[1] ?? null;
}

async function network(vm) {
  const properties = record(record(vm).properties);
  const interfaces = asArray(record(properties.networkProfile).networkInterfaces);
  const privateIps = [];
  const publicIps = [];
  const networkSecurityGroups = [];
  const loadBalancers = [];
  const networkInterfaces = [];
  let subnet = null;
  let networkInterface = null;

  for (const interfaceReference of interfaces) {
    const interfaceId = record(interfaceReference).id;
    if (typeof interfaceId !== "string") continue;
    const nic = record(await arm(`${interfaceId}?api-version=2024-05-01`));
    networkInterface ??= nic.name ?? nameFromId(interfaceId);
    addUnique(networkInterfaces, nic.name ?? nameFromId(interfaceId));
    const nicProperties = record(nic.properties);
    addUnique(networkSecurityGroups, nameFromId(record(nicProperties.networkSecurityGroup).id));

    for (const configuration of asArray(nicProperties.ipConfigurations)) {
      const configProperties = record(record(configuration).properties);
      addUnique(privateIps, configProperties.privateIPAddress);
      const subnetId = record(configProperties.subnet).id;
      if (!subnet && typeof subnetId === "string") subnet = nameFromId(subnetId);
      for (const pool of asArray(configProperties.loadBalancerBackendAddressPools)) addUnique(loadBalancers, loadBalancerName(record(pool).id));
      for (const rule of asArray(configProperties.loadBalancerInboundNatRules)) addUnique(loadBalancers, loadBalancerName(record(rule).id));

      const publicIpId = record(configProperties.publicIPAddress).id;
      if (typeof publicIpId === "string") {
        try {
          const publicIp = record(await arm(`${publicIpId}?api-version=2024-05-01`));
          addUnique(publicIps, record(publicIp.properties).ipAddress);
          addUnique(loadBalancers, loadBalancerName(record(record(publicIp.properties).ipConfiguration).id));
        } catch {
          // The NIC remains useful even when a public IP relationship cannot be read.
        }
      }

      if (typeof subnetId === "string") {
        try {
          const subnetResource = record(await arm(`${subnetId}?api-version=2024-05-01`));
          addUnique(networkSecurityGroups, nameFromId(record(record(subnetResource).properties).networkSecurityGroup?.id));
        } catch {
          // A subnet-level NSG is optional; keep the rest of the topology.
        }
      }
    }
  }

  return { networkInterface, networkInterfaces, privateIps, publicIps, subnet, networkSecurityGroups, loadBalancers };
}

async function vmOperations(request) {
  if (request.method === "OPTIONS") return preflight(request);
  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins.has(origin)) {
    return response({ message: "This application origin is not allowed to call the Azure operations API." }, 403, request);
  }

  try {
    if (!await requireAuthorizedUser(request)) return response({ message: "A valid user session is required." }, 401, request);

    const subscriptionId = request.params.subscriptionId;
    const resourceGroup = request.params.resourceGroup;
    const vmName = request.params.vmName;
    if (!isValidSegment(subscriptionId, /^[0-9a-fA-F-]{36}$/) || !isValidSegment(resourceGroup, /^[\w.()_-]{1,90}$/) || !isValidSegment(vmName, /^[\w.()_-]{1,80}$/)) {
      return response({ message: "Invalid virtual machine route parameters." }, 400, request);
    }

    const vmPath = `/subscriptions/${subscriptionId}/resourceGroups/${encodeURIComponent(resourceGroup)}/providers/Microsoft.Compute/virtualMachines/${encodeURIComponent(vmName)}`;
    const [vm, instanceView] = await Promise.all([
      arm(`${vmPath}?api-version=2024-07-01`),
      arm(`${vmPath}/instanceView?api-version=2024-07-01`),
    ]);
    const vmRecord = record(vm);
    const location = vmRecord.location;
    const [monitoringResult, backupResult, patchingResult, networkResult, historyResult, alertsResult] = await Promise.all([
      monitoring(vmRecord.id),
      backup(subscriptionId, location, vmRecord),
      patching(vmRecord.id),
      network(vmRecord).catch(() => ({ networkInterface: null, networkInterfaces: [], privateIps: [], publicIps: [], subnet: null, networkSecurityGroups: [], loadBalancers: [] })),
      history(vmRecord.id),
      alerts(subscriptionId, vmRecord.id),
    ]);

    return response({
      observedAt: isoNow(),
      configuration: await vmConfiguration(vmRecord, instanceView, networkResult),
      monitoring: monitoringResult,
      bootDiagnostics: bootDiagnostics(vmRecord, instanceView),
      backup: backupResult,
      patching: patchingResult,
      network: networkResult,
      history: historyResult,
      alerts: alertsResult,
    }, 200, request);
  } catch (error) {
    const status = errorStatus(error);
    if (status === 404) return response({ message: "The requested virtual machine was not found." }, 404, request);
    console.error("VM operations request failed", { status, message: error instanceof Error ? error.message : "Unknown error" });
    return response({ message: "Azure VM operations data is temporarily unavailable." }, 503, request);
  }
}

async function executeApprovedVmPackage(request) {
  if (request.method === "OPTIONS") return preflight(request);
  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins.has(origin)) return response({ message: "This application origin is not allowed to call the Azure execution API." }, 403, request);

  let packageStarted = false;
  let packageId = null;
  let authorization = null;
  try {
    authorization = request.headers.get("authorization");
    if (!await requireAuthorizedUser(request)) return response({ message: "A valid user session is required." }, 401, request);
    packageId = request.params.packageId;
    if (!isValidSegment(packageId, /^[0-9a-fA-F-]{36}$/)) return response({ message: "Invalid change package identifier." }, 400, request);

    const packageRecord = record(await supabaseRpc("begin_iac_vm_execution", authorization, { p_package_id: packageId }));
    packageStarted = true;
    const subscriptionId = packageRecord.subscription_id;
    const resourceGroup = packageRecord.resource_group;
    const vmName = packageRecord.target_name;
    if (packageRecord.action_type !== "start_vm" || !isValidSegment(subscriptionId, /^[0-9a-fA-F-]{36}$/) || !isValidSegment(resourceGroup, /^[\w.()_-]{1,90}$/) || !isValidSegment(vmName, /^[\w.()_-]{1,80}$/)) {
      throw new AzureRequestError(409, "The approved package is not a valid start-VM request.");
    }

    const vmPath = `/subscriptions/${subscriptionId}/resourceGroups/${encodeURIComponent(resourceGroup)}/providers/Microsoft.Compute/virtualMachines/${encodeURIComponent(vmName)}`;
    await arm(`${vmPath}/start?api-version=2024-07-01`, { method: "POST" });
    const observed = await waitForRunning(vmPath);
    const message = observed.running ? "Azure reports the VM is running." : "Azure accepted the start request; the VM is still transitioning.";
    await supabaseRpc("complete_iac_vm_execution", authorization, { p_package_id: packageId, p_success: true, p_message: message });
    return response({ packageId, executionStatus: "executed", azurePowerState: observed.state, message }, 200, request);
  } catch (error) {
    if (packageStarted && packageId && authorization) {
      try {
        await supabaseRpc("complete_iac_vm_execution", authorization, {
          p_package_id: packageId,
          p_success: false,
          p_message: error instanceof Error ? error.message : "Azure execution failed.",
        });
      } catch (completionError) {
        console.error("Unable to record VM execution failure", { message: completionError instanceof Error ? completionError.message : "Unknown error" });
      }
    }
    const status = errorStatus(error) ?? 503;
    console.error("VM package execution failed", { status, message: error instanceof Error ? error.message : "Unknown error" });
    return response({ message: error instanceof Error ? error.message : "Azure VM execution failed." }, status, request);
  }
}

app.http("get-vm-operations", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "v1/virtual-machines/{subscriptionId}/{resourceGroup}/{vmName}/operations",
  handler: vmOperations,
});

app.http("execute-approved-vm-package", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  route: "v1/change-packages/{packageId}/execute",
  handler: executeApprovedVmPackage,
});
