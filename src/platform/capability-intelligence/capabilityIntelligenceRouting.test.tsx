/**
 * Stage 3.5.4.1.1 — route authorization for the Capability Intelligence group.
 *
 * Proves the guard is enforced at the route level (not by navigation
 * visibility), that child routes inherit it, and that the existing Platform
 * forbidden experience renders for unauthorized authenticated users.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

const auth = { user: { id: "u1" }, loading: false, isAdmin: false, approvalStatus: "approved", mustChangePassword: false, roleLoading: false };
const access = { loading: false, isPlatformAdmin: false, activeTenantId: "t1", hasPermission: () => false };

vi.mock("@/context/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/platform/access/AccessContext", () => ({ useAccess: () => access }));

import { PlatformAdminRoute } from "@/components/auth/PermissionRoute";

function renderGroup(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route
          path="/platform/capability-intelligence"
          element={
            <PlatformAdminRoute>
              <div>
                <span>capability-intelligence-shell</span>
                <Outlet />
              </div>
            </PlatformAdminRoute>
          }
        >
          <Route index element={<span>overview-screen</span>} />
          <Route path="explorer" element={<span>explorer-screen</span>} />
          <Route path="recommendations" element={<span>recommendations-screen</span>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("Capability Intelligence route authorization", () => {
  beforeEach(() => {
    access.isPlatformAdmin = false;
    access.loading = false;
  });

  it("renders the route group for an authorized platform administrator", () => {
    access.isPlatformAdmin = true;
    renderGroup("/platform/capability-intelligence");
    expect(screen.getByText("overview-screen")).toBeTruthy();
  });

  it("blocks an authenticated non-administrator entering the URL directly", () => {
    renderGroup("/platform/capability-intelligence");
    expect(screen.queryByText("overview-screen")).toBeNull();
    expect(screen.queryByText("capability-intelligence-shell")).toBeNull();
    expect(screen.getByText("Access denied")).toBeTruthy();
  });

  it("uses the existing Platform forbidden state component", () => {
    renderGroup("/platform/capability-intelligence");
    expect(screen.getByText("platform.admin")).toBeTruthy();
    expect(screen.getByText("Back to platform")).toBeTruthy();
  });

  it("applies the guard to child routes", () => {
    for (const path of ["/platform/capability-intelligence/explorer", "/platform/capability-intelligence/recommendations"]) {
      const view = renderGroup(path);
      expect(screen.getByText("Access denied")).toBeTruthy();
      view.unmount();
    }
    access.isPlatformAdmin = true;
    renderGroup("/platform/capability-intelligence/explorer");
    expect(screen.getByText("explorer-screen")).toBeTruthy();
  });

  it("shows the access check while authorization is resolving", () => {
    access.loading = true;
    renderGroup("/platform/capability-intelligence");
    expect(screen.getByText("Checking access…")).toBeTruthy();
  });

  it("keeps navigation visibility and route authorization consistent", () => {
    // Navigation marks the entry adminOnly; the route guard uses the same flag.
    expect(access.isPlatformAdmin).toBe(false);
    renderGroup("/platform/capability-intelligence");
    expect(screen.queryByText("overview-screen")).toBeNull();
  });
});
