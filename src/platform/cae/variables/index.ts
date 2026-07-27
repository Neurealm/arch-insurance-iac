/**
 * Contextual Audio Enrichment — dynamic variable framework.
 *
 * Narratives may reference values only as `{{module.variable_name}}` tokens
 * backed by the governed registry. No expression evaluation of any kind is
 * supported or possible.
 */
export * from "./types";
export * from "./format";
export * from "./registry";
export * from "./resolve";
export { useVariableRegistry, useRegistryMap, caeVariableRegistryKey } from "./useVariableRegistry";
export { platformAdapter } from "./adapters/platform";
export { commercialAdapter, ratioToPercent } from "./adapters/commercial";
export { runopsAdapter } from "./adapters/runops";
export { avepAdapter } from "./adapters/avep";
