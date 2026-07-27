import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) } } }));
import { ContextualAudioErrorBoundary } from "./ContextualAudioErrorBoundary";
function Boom() { const [x] = React.useState(() => { throw new Error("boom"); }); return <div>{String(x)}</div>; }
describe("b", () => { it("catches", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(<ContextualAudioErrorBoundary><Boom /><div>KID</div></ContextualAudioErrorBoundary>);
  expect(screen.getByText("KID")).toBeInTheDocument();
}); });
