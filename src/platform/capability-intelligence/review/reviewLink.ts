/**
 * Stage 3.5.4.4 — Change Review Readiness navigation contract.
 *
 * Kept in its own tiny module so the Remediation Workspace can link to the
 * review screen without importing it, preserving the lazy boundary between the
 * two route children.
 */

import { RECOMMENDATION_PARAM } from "../RemediationWorkspaceProvider";

export const REMEDIATION_PATH = "/platform/capability-intelligence/remediation";
export const REVIEW_PATH = `${REMEDIATION_PATH}/review`;

/** Review URL, preserving the recommendation deep-link parameter when known. */
export function reviewLink(recommendationId: string | null | undefined): string {
  return recommendationId
    ? `${REVIEW_PATH}?${RECOMMENDATION_PARAM}=${encodeURIComponent(recommendationId)}`
    : REVIEW_PATH;
}

/** Remediation Workspace URL, preserving the recommendation parameter. */
export function remediationLink(recommendationId: string | null | undefined): string {
  return recommendationId
    ? `${REMEDIATION_PATH}?${RECOMMENDATION_PARAM}=${encodeURIComponent(recommendationId)}`
    : REMEDIATION_PATH;
}
