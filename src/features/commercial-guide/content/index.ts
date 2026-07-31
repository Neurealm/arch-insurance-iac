import type { CommercialGuideContent } from "../types";
import { buildFallbackGuide } from "./fallback";
import { COMMERCIAL_GUIDE_PAGES } from "./pages/registry";
import { commercialOverviewGuide } from "./pages/commercialOverview";
import { commercialProgramGuide } from "./pages/commercialProgram";
import { commercialPortfolioGuide } from "./pages/commercialPortfolio";
import { commercialSourcesGuide } from "./pages/commercialSources";
import { commercialAssumptionsGuide } from "./pages/commercialAssumptions";
import { commercialScenariosGuide } from "./pages/commercialScenarios";
import { commercialSensitivityGuide } from "./pages/commercialSensitivity";
import { commercialRevenueGuide } from "./pages/commercialRevenue";
import { commercialPnlGuide } from "./pages/commercialPnl";
import { commercialCompareGuide } from "./pages/commercialCompare";
import { commercialCashGuide } from "./pages/commercialCash";

/**
 * Central typed guide registry.
 *
 * Page-specific content files are added one at a time to `./pages/*` and
 * registered in `PAGE_CONTENT`. Anything not present here resolves to the
 * safe fallback guide.
 */
const PAGE_CONTENT: Record<string, CommercialGuideContent> = {
  "commercial-overview": commercialOverviewGuide,
  "commercial-program": commercialProgramGuide,
  "commercial-portfolio": commercialPortfolioGuide,
  "commercial-sources": commercialSourcesGuide,
  "commercial-assumptions": commercialAssumptionsGuide,
  "commercial-scenarios": commercialScenariosGuide,
  "commercial-sensitivity": commercialSensitivityGuide,
  "commercial-revenue": commercialRevenueGuide,
  "commercial-pnl": commercialPnlGuide,
  "commercial-compare": commercialCompareGuide,
  "commercial-cash": commercialCashGuide,
};




export const COMMERCIAL_GUIDE_REGISTRY: CommercialGuideContent[] = COMMERCIAL_GUIDE_PAGES.map(
  (page) => PAGE_CONTENT[page.pageId] ?? buildFallbackGuide(page),
);

export { COMMERCIAL_GUIDE_PAGES };

function scoreMatch(guide: CommercialGuideContent, pathname: string): number {
  const route = guide.route;
  if (pathname === route) return route.length + 1;
  if ((guide.match ?? "exact") === "prefix" && pathname.startsWith(route + "/")) return route.length;
  return -1;
}

/** Resolve the guide for a pathname. Falls back to the closest prefix match. */
export function resolveGuideForRoute(pathname: string): CommercialGuideContent | null {
  let best: CommercialGuideContent | null = null;
  let bestScore = -1;
  for (const guide of COMMERCIAL_GUIDE_REGISTRY) {
    const score = scoreMatch(guide, pathname);
    if (score > bestScore) {
      bestScore = score;
      best = guide;
    }
  }
  if (best) return best;

  // Unregistered commercial sub-route: derive a fallback from the nearest parent.
  const parent = COMMERCIAL_GUIDE_PAGES.find((p) => pathname.startsWith(p.route + "/"));
  return parent ? buildFallbackGuide(parent) : null;
}

export function getGuideByPageId(pageId: string): CommercialGuideContent | null {
  return COMMERCIAL_GUIDE_REGISTRY.find((g) => g.pageId === pageId) ?? null;
}
