/**
 * Registry mapping an Azure resource type to the detail ("Digital Twin") page that
 * knows how to render it, if one exists. Today only Virtual Machines have a twin
 * page; adding support for another resource type (storage accounts, disks, etc.)
 * is meant to be: build the page + route, then add one entry here — nothing in
 * AzureResources.tsx or a twin page's breadcrumb should need to change.
 */
export interface ResourceKind {
  /** The Azure resource `type` this kind matches, e.g. "Microsoft.Compute/virtualMachines". */
  azureType: string;
  /** Friendly plural label, used in breadcrumbs and as the resource-tree search term. */
  label: string;
  /** Route segment for this kind's detail page: /agentic-iac-engineering/resources/<segment>/:name */
  routeSegment: string;
}

export const RESOURCE_KINDS: ResourceKind[] = [
  { azureType: "Microsoft.Compute/virtualMachines", label: "Virtual Machines", routeSegment: "virtual-machines" },
];

export function resourceKindFor(azureType: string): ResourceKind | undefined {
  return RESOURCE_KINDS.find((kind) => kind.azureType.toLowerCase() === azureType.toLowerCase());
}

export function detailPathFor(kind: ResourceKind, resourceName: string): string {
  return `/agentic-iac-engineering/resources/${kind.routeSegment}/${encodeURIComponent(resourceName)}`;
}

/** Link target for a breadcrumb crumb that returns to the resource list, pre-filtered to this kind. */
export function resourceListFilterLink(kind: ResourceKind): { pathname: string; search: string } {
  return { pathname: "/agentic-iac-engineering/resources", search: `?q=${encodeURIComponent(kind.label)}` };
}
