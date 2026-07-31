import * as React from "react";
import { useLocation } from "react-router-dom";
import { CommercialGuideProvider } from "./CommercialGuideProvider";
import { CommercialGuideDrawer } from "./CommercialGuideDrawer";
import { CommercialGuideEdgeTab } from "./CommercialGuideEdgeTab";
import { CommercialWalkthrough } from "./CommercialWalkthrough";
import { resolveGuideForRoute } from "./content";


/**
 * Mounts the Commercial Guide framework for the current route.
 * Wrap the Commercial shell with this; render `CommercialGuideButton` in the header.
 */
export function CommercialGuideRoot({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const guide = React.useMemo(() => resolveGuideForRoute(pathname), [pathname]);

  return (
    <CommercialGuideProvider guide={guide}>
      {children}
      <CommercialGuideDrawer />
      <CommercialWalkthrough />
    </CommercialGuideProvider>
  );
}
