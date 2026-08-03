/**
 * Stage 3.5.3.1 — deterministic lexical search.
 *
 * No fuzzy matching, no scoring heuristics that could reorder between runs:
 * matches are classified into a fixed ladder and ties are broken by node id.
 */

import type { GraphNode } from "../types";
import type { SearchField, SearchMatchType, SearchOptions } from "./QueryTypes";
import { SEARCH_FIELDS } from "./QueryTypes";
import { matchText, normalize, tokenize } from "./QueryFilters";

/** Fixed rank ladder. Lower rank sorts first. */
const MATCH_RANK: Readonly<Record<SearchMatchType, number>> = {
  "exact-id": 0,
  "exact-label": 1,
  prefix: 2,
  token: 3,
  suffix: 4,
  contains: 5,
  property: 6,
};

export interface SearchMatchDetail {
  field: string;
  matchType: SearchMatchType;
  score: number;
}

export interface SearchHit {
  node: GraphNode;
  rank: number;
  matches: readonly SearchMatchDetail[];
}

const fieldValue = (node: GraphNode, field: SearchField): string | null => {
  switch (field) {
    case "id":
      return node.id;
    case "label":
      return node.label;
    case "description":
      return node.description ?? null;
    case "filePath":
      return node.filePath ?? null;
    default:
      return null;
  }
};

function classify(
  field: SearchField,
  value: string,
  term: string,
  caseSensitive: boolean,
): SearchMatchType | null {
  const a = caseSensitive ? value : normalize(value);
  const b = caseSensitive ? term : normalize(term);
  if (a === b) return field === "id" ? "exact-id" : field === "label" ? "exact-label" : "contains";
  if (a.startsWith(b)) return "prefix";
  if (tokenize(value).includes(normalize(term))) return "token";
  if (a.endsWith(b)) return "suffix";
  if (a.includes(b)) return "contains";
  return null;
}

/**
 * Ranked search across the requested fields. Results are sorted by best match
 * rank, then by node type, then by node id — fully deterministic.
 */
export function searchNodes(
  nodes: readonly GraphNode[],
  term: string,
  options: SearchOptions = {},
): { hits: readonly SearchHit[]; scannedNodeCount: number } {
  const trimmed = term.trim();
  if (!trimmed) return { hits: [], scannedNodeCount: 0 };

  const fields = options.fields?.length ? options.fields : SEARCH_FIELDS;
  const caseSensitive = options.caseSensitive === true;
  const nodeTypes = options.nodeTypes?.length ? new Set(options.nodeTypes) : null;
  const hits: SearchHit[] = [];
  let scanned = 0;

  for (const node of nodes) {
    if (nodeTypes && !nodeTypes.has(node.type)) continue;
    scanned += 1;
    const matches: SearchMatchDetail[] = [];

    for (const field of fields) {
      const value = fieldValue(node, field);
      if (value === null) continue;
      if (options.operator) {
        if (matchText(value, trimmed, options.operator, caseSensitive)) {
          matches.push({ field, matchType: "contains", score: MATCH_RANK.contains });
        }
        continue;
      }
      const matchType = classify(field, value, trimmed, caseSensitive);
      if (matchType) matches.push({ field, matchType, score: MATCH_RANK[matchType] });
    }

    for (const property of options.properties ?? []) {
      const raw = node.attributes[property];
      if (raw === undefined || raw === null) continue;
      if (matchText(String(raw), trimmed, options.operator ?? "contains", caseSensitive)) {
        matches.push({ field: `property:${property}`, matchType: "property", score: MATCH_RANK.property });
      }
    }

    if (matches.length === 0) continue;
    matches.sort((a, b) => a.score - b.score || a.field.localeCompare(b.field));
    hits.push({ node, rank: matches[0].score, matches });
  }

  hits.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.node.type.localeCompare(b.node.type) ||
      a.node.id.localeCompare(b.node.id),
  );
  return { hits, scannedNodeCount: scanned };
}
