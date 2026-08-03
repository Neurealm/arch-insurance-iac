/**
 * Stage 3.5.3.1 — composable, typed filters.
 *
 * Filters read only fields that exist in the Stage 3.5.2 schema. Logical query
 * fields with no schema backing are declared unsupported and reported as
 * warnings; they never silently match.
 */

import type { GraphAttributeValue, GraphNode } from "../types";
import type {
  MatchMode,
  NodeQueryFilters,
  PropertyFilter,
  QueryAttributeField,
  TextMatchOperator,
} from "./QueryTypes";
import { UNSUPPORTED_ATTRIBUTE_FIELDS } from "./QueryTypes";

export const normalize = (value: string): string => value.trim().toLowerCase();

export const tokenize = (value: string): readonly string[] =>
  normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);

const attr = (node: GraphNode, key: string): GraphAttributeValue | undefined => node.attributes[key];

const stringify = (value: GraphAttributeValue | undefined | null): string | null =>
  value === undefined || value === null ? null : String(value);

/**
 * Attribute selectors. Each logical field resolves to the concrete schema keys
 * that actually carry it, in a fixed precedence order.
 */
const ATTRIBUTE_SELECTORS: Readonly<Record<string, (node: GraphNode) => readonly (string | null)[]>> = {
  owner: (n) => [
    n.moduleId,
    stringify(attr(n, "primaryOwner")),
    stringify(attr(n, "productOwner")),
    stringify(attr(n, "technicalOwner")),
  ],
  application: (n) => [n.moduleId, stringify(attr(n, "claimedBy"))],
  domain: (n) => [
    stringify(attr(n, "domain")),
    stringify(attr(n, "businessDomain")),
    stringify(attr(n, "subdomain")),
  ],
  category: (n) => [
    n.type,
    stringify(attr(n, "classification")),
    stringify(attr(n, "implementationType")),
    stringify(attr(n, "level")),
    stringify(attr(n, "ownershipClass")),
  ],
  status: (n) => [
    stringify(attr(n, "status")),
    stringify(attr(n, "implementationStatus")),
    stringify(attr(n, "implementationClassification")),
    stringify(attr(n, "declaredMaturity")),
    stringify(attr(n, "maturity")),
    stringify(attr(n, "validationState")),
  ],
  route: (n) => [
    stringify(attr(n, "routeRef")),
    n.type === "route" ? n.id.slice("route:".length) : null,
    n.type === "route" ? n.label : null,
  ],
};

/** Distinct, normalized, non-empty values a node carries for a logical field. */
export function selectorValues(node: GraphNode, field: string): readonly string[] {
  const selector = ATTRIBUTE_SELECTORS[field];
  if (!selector) return [];
  const out: string[] = [];
  for (const raw of selector(node)) {
    if (raw === null || raw === undefined) continue;
    const value = normalize(String(raw));
    if (value && !out.includes(value)) out.push(value);
  }
  return out;
}

export const isSupportedField = (field: QueryAttributeField): boolean =>
  !UNSUPPORTED_ATTRIBUTE_FIELDS.includes(field);

/* -------------------------------------------------------------------------- */
/* Text matching                                                               */
/* -------------------------------------------------------------------------- */

export function matchText(
  haystack: string,
  needle: string,
  operator: TextMatchOperator,
  caseSensitive = false,
): boolean {
  const a = caseSensitive ? haystack : normalize(haystack);
  const b = caseSensitive ? needle : normalize(needle);
  switch (operator) {
    case "exact":
      return haystack === needle;
    case "iexact":
      return a === b;
    case "startsWith":
      return a.startsWith(b);
    case "endsWith":
      return a.endsWith(b);
    case "token":
      return tokenize(haystack).includes(normalize(needle));
    case "contains":
    default:
      return a.includes(b);
  }
}

const nodeField = (node: GraphNode, property: string): GraphAttributeValue | undefined => {
  switch (property) {
    case "id":
      return node.id;
    case "label":
      return node.label;
    case "description":
      return node.description ?? null;
    case "filePath":
      return node.filePath ?? null;
    case "type":
      return node.type;
    case "moduleId":
      return node.moduleId;
    case "ownership":
      return node.ownership;
    case "source":
      return node.source;
    case "confidence":
      return node.confidence;
    default:
      return node.attributes[property];
  }
};

export function matchProperty(node: GraphNode, filter: PropertyFilter): {
  matched: boolean;
  actual: GraphAttributeValue | null;
} {
  const actual = nodeField(node, filter.property) ?? null;
  if (actual === null) return { matched: false, actual: null };
  if (filter.operator === "equals") {
    return { matched: String(actual) === String(filter.value), actual };
  }
  return {
    matched: matchText(String(actual), String(filter.value), filter.operator),
    actual,
  };
}

/* -------------------------------------------------------------------------- */
/* Criterion model                                                             */
/* -------------------------------------------------------------------------- */

export interface Criterion {
  field: string;
  operator: string;
  expected: unknown;
  /** Returns the matched value when the node satisfies the criterion. */
  test: (node: GraphNode) => { matched: boolean; actual: unknown };
}

export interface RelationalLookup {
  personaMembers: (value: string) => ReadonlySet<string>;
  serviceMembers: (value: string) => ReadonlySet<string>;
}

const anyValueMatches = (node: GraphNode, field: string, expected: readonly string[]) => {
  const actual = selectorValues(node, field);
  const wanted = expected.map(normalize);
  const hit = actual.find((value) => wanted.includes(value));
  return { matched: hit !== undefined, actual: hit ?? actual };
};

/** Compiles a filter object into an ordered, explainable criterion list. */
export function compileCriteria(
  filters: NodeQueryFilters,
  lookup: RelationalLookup,
): { criteria: readonly Criterion[]; ignoredFields: readonly string[] } {
  const criteria: Criterion[] = [];
  const ignoredFields: string[] = [];

  const addSelector = (field: QueryAttributeField, values?: readonly string[]) => {
    if (!values || values.length === 0) return;
    if (!isSupportedField(field)) {
      ignoredFields.push(field);
      return;
    }
    criteria.push({
      field,
      operator: "in",
      expected: [...values],
      test: (node) => anyValueMatches(node, field, values),
    });
  };

  if (filters.nodeTypes?.length) {
    criteria.push({
      field: "nodeType",
      operator: "in",
      expected: [...filters.nodeTypes],
      test: (node) => ({ matched: filters.nodeTypes!.includes(node.type), actual: node.type }),
    });
  }
  if (filters.ownership?.length) {
    criteria.push({
      field: "ownership",
      operator: "in",
      expected: [...filters.ownership],
      test: (node) => ({ matched: filters.ownership!.includes(node.ownership), actual: node.ownership }),
    });
  }

  addSelector("owner", filters.owners);
  addSelector("application", filters.applications);
  addSelector("domain", filters.domains);
  addSelector("category", filters.categories);
  addSelector("status", filters.statuses);
  addSelector("route", filters.routes);
  addSelector("technology", filters.technologies);
  addSelector("tag", filters.tags);

  if (filters.personas?.length) {
    const ids = new Set<string>();
    for (const persona of filters.personas) for (const id of lookup.personaMembers(normalize(persona))) ids.add(id);
    criteria.push({
      field: "persona",
      operator: "related-to",
      expected: [...filters.personas],
      test: (node) => ({ matched: ids.has(node.id), actual: node.id }),
    });
  }
  if (filters.services?.length) {
    const ids = new Set<string>();
    for (const service of filters.services) for (const id of lookup.serviceMembers(normalize(service))) ids.add(id);
    criteria.push({
      field: "service",
      operator: "related-to",
      expected: [...filters.services],
      test: (node) => ({ matched: ids.has(node.id), actual: node.id }),
    });
  }

  if (filters.text) {
    const needle = filters.text;
    criteria.push({
      field: "text",
      operator: "contains",
      expected: needle,
      test: (node) => {
        const haystack = `${node.id} ${node.label} ${node.description ?? ""}`;
        return { matched: matchText(haystack, needle, "contains"), actual: node.label };
      },
    });
  }

  for (const property of filters.properties ?? []) {
    criteria.push({
      field: `property:${property.property}`,
      operator: property.operator,
      expected: property.value,
      test: (node) => matchProperty(node, property),
    });
  }

  return { criteria, ignoredFields };
}

export function evaluateCriteria(
  node: GraphNode,
  criteria: readonly Criterion[],
  matchMode: MatchMode,
): { matched: boolean; matches: readonly { field: string; operator: string; expected: unknown; actual: unknown }[] } {
  const matches: { field: string; operator: string; expected: unknown; actual: unknown }[] = [];
  let all = true;
  let any = false;
  for (const criterion of criteria) {
    const outcome = criterion.test(node);
    if (outcome.matched) {
      any = true;
      matches.push({
        field: criterion.field,
        operator: criterion.operator,
        expected: criterion.expected,
        actual: outcome.actual,
      });
    } else {
      all = false;
    }
  }
  if (criteria.length === 0) return { matched: true, matches };
  return { matched: matchMode === "any" ? any : all, matches };
}
