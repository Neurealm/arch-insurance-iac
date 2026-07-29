import type { CommercialGuidePageRegistration } from "../../types";

/**
 * Verified Commercial Module page registry.
 *
 * Derived from the route table in `src/App.tsx` and the sidebar in
 * `src/commercial/shell/CommercialLayout.tsx`. Detail routes reuse their
 * parent guide via `match: "prefix"` until they get their own content file.
 *
 * Page-specific content files live alongside this file (one file per page)
 * and are wired up in `../index.ts`.
 */
export const COMMERCIAL_GUIDE_PAGES: CommercialGuidePageRegistration[] = [
  { pageId: "commercial-overview", route: "/commercial", match: "exact", pageTitle: "Overview", navLabel: "Overview" },
  { pageId: "commercial-program", route: "/commercial/program", pageTitle: "Program", navLabel: "Program" },
  {
    pageId: "commercial-program-timeline",
    route: "/commercial/program-timeline",
    pageTitle: "Timelines",
    navLabel: "Program & Timeline / Timelines",
  },
  { pageId: "commercial-scenarios", route: "/commercial/scenarios", pageTitle: "Scenarios", navLabel: "Scenarios" },
  { pageId: "commercial-portfolio", route: "/commercial/portfolio", pageTitle: "Portfolio", navLabel: "Portfolio" },
  { pageId: "commercial-sources", route: "/commercial/sources", pageTitle: "Sources", navLabel: "Sources" },
  { pageId: "commercial-revenue", route: "/commercial/model/revenue", pageTitle: "Revenue", navLabel: "Revenue" },
  { pageId: "commercial-pnl", route: "/commercial/model/pnl", pageTitle: "P&L (Cost & EBITDA)", navLabel: "P&L (Cost & EBITDA)" },
  { pageId: "commercial-cash", route: "/commercial/model/cash", pageTitle: "Cash & Sustainability", navLabel: "Cash & Sustainability" },
  {
    pageId: "commercial-assumptions",
    route: "/commercial/model/assumptions",
    match: "prefix",
    pageTitle: "Assumptions & Change Sets",
    navLabel: "Assumptions & Change Sets",
  },
  {
    pageId: "commercial-compare",
    route: "/commercial/model/compare",
    match: "prefix",
    pageTitle: "Scenario Comparison",
    navLabel: "Scenario Comparison",
  },
  {
    pageId: "commercial-sensitivity",
    route: "/commercial/model/sensitivity",
    match: "prefix",
    pageTitle: "Sensitivity Analysis",
    navLabel: "Sensitivity Analysis",
  },
  {
    pageId: "commercial-release",
    route: "/commercial/model/release",
    match: "prefix",
    pageTitle: "Release & Activation",
    navLabel: "Release & Activation",
  },
  {
    pageId: "commercial-governance",
    route: "/commercial/neurealm-governance",
    pageTitle: "Governance",
    navLabel: "Governance",
  },
  {
    pageId: "commercial-staffing-resources",
    route: "/commercial/staffing-resources",
    pageTitle: "Staffing & Resources",
    navLabel: "Staffing & Resources",
  },
];
