import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { CaeFaultContext } from "@/platform/cae/featureFlags";
import { ContextualAudioErrorBoundary } from "@/platform/cae/ContextualAudioErrorBoundary";

function Probe() { const f = React.useContext(CaeFaultContext); return <div>{`f:${String(f)}`}</div>; }
let boom = true;
function Ex() { if (boom) { boom = false; throw new Error("x"); } return <Probe />; }

describe("ctx", () => { it("works", () => {
  render(<ContextualAudioErrorBoundary><Ex /></ContextualAudioErrorBoundary>);
  screen.debug();
  expect(true).toBe(true);
}); });
