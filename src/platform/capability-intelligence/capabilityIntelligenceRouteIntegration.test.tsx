/**
 * Stage 3.5.4.1.2 — integration coverage against the real application route
 * configuration.
 *
 * These tests mount `capabilityIntelligenceRoutes`, the exact element rendered
 * by `src/App.tsx` inside the `/platform` shell. There is no duplicated route
 * tree and no test-only route definition, so removing the administrative guard
 * or moving the provider below the child routes fails here.
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { Suspense } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

const auth = {
  user: { id: "u1" },
  loading: false,
  isAdmin: false,
  approvalStatus: "approved",
  mustChangePassword: false,
  roleLoading: false,
};
const access = { loading: false, isPlatformAdmin: false, activeTenantId: "t1", hasPermission: () => false };

vi.mock("@/context/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/platform/access/AccessContext", () => ({ useAccess: () => access }));

import { capabilityIntelligenceRoutes } from "@/platform/capability-intelligence/routes";
import {
  __capabilityIntelligenceComputeCount,
  __resetCapabilityIntelligenceCache,
} from "@/platform/capability-intelligence/CapabilityIntelligenceProvider";

beforeAll(() => {
  const proto = window.HTMLElement.prototype as unknown as Record<string, unknown>;
  proto.hasPointerCapture = () => false;
  proto.setPointerCapture = () => {};
  proto.releasePointerCapture = () => {};
  proto.scrollIntoView = () => {};
});

/** Mirrors the `/platform` parent route from App.tsx: shell + <Outlet />. */
function renderApp(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Suspense fallback={<span>route-loading</span>}>
        <Routes>
          <Route path="/platform" element={<Outlet />}>
            {capabilityIntelligenceRoutes}
          </Route>
        </Routes>
      </Suspense>
    </MemoryRouter>,
  );
}

describe("Stage 3.5.4.1.2 — real route wiring authorization", () => {
  beforeEach(() => {
    access.isPlatformAdmin = false;
  });

  it.each([
    "/platform/capability-intelligence",
    "/platform/capability-intelligence/explorer",
    "/platform/capability-intelligence/recommendations",
  ])("blocks an authenticated non-administrator at %s", async (path) => {
    const view = renderApp(path);
    expect(await screen.findByText("Access denied")).toBeTruthy();
    expect(screen.queryByText("Capability Intelligence")).toBeNull();
    expect(screen.queryByLabelText("Search entities")).toBeNull();
    expect(screen.queryByLabelText("Search recommendations")).toBeNull();
    view.unmount();
  });

  it("allows a platform administrator into the route group", async () => {
    access.isPlatformAdmin = true;
    renderApp("/platform/capability-intelligence");
    expect(await screen.findByRole("heading", { name: "Capability Intelligence" })).toBeTruthy();
    await waitFor(() => expect(screen.getByText("Graph scale")).toBeTruthy());
  });
});

describe("Stage 3.5.4.1.2 — provider lifecycle across real route navigation", () => {
  it("computes the intelligence snapshot once across overview → explorer → recommendations → overview", async () => {
    __resetCapabilityIntelligenceCache();
    access.isPlatformAdmin = true;
    const user = userEvent.setup();

    renderApp("/platform/capability-intelligence");

    await waitFor(() => expect(screen.getByText("Graph scale")).toBeTruthy());
    expect(__capabilityIntelligenceComputeCount()).toBe(1);
    const hash = screen.getByTestId("graph-hash").textContent;
    expect(hash).toBe("e889b604");

    await user.click(screen.getByRole("link", { name: "Capability Explorer" }));
    await waitFor(() => expect(screen.getByLabelText("Search entities")).toBeTruthy());
    expect(__capabilityIntelligenceComputeCount()).toBe(1);

    await user.click(screen.getByRole("link", { name: "Recommendation Center" }));
    await waitFor(() => expect(screen.getByLabelText("Search recommendations")).toBeTruthy());
    expect(__capabilityIntelligenceComputeCount()).toBe(1);

    await user.click(screen.getByRole("link", { name: "Overview" }));
    await waitFor(() => expect(screen.getByText("Graph scale")).toBeTruthy());
    expect(__capabilityIntelligenceComputeCount()).toBe(1);
    expect(screen.getByTestId("graph-hash").textContent).toBe(hash);

    // No loading loop: the shell settled on content, not the analysing state.
    expect(screen.queryByText("Analysing capability graph…")).toBeNull();
  });
});
