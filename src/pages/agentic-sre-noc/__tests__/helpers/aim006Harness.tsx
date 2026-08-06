/**
 * AIM-006 — shared test harness for scenario, explainability and comparison
 * components. Renders a single component against the real `useScenarioState`
 * hook so integration tests avoid the cost of a full page render.
 */

import * as React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useScenarioState, type ScenarioContext, type ScenarioStateValue } from "../../scenario/useScenarioState";
import { SCENARIO_LINK_ID } from "../../scenario/scenarioFixtures";

export const defaultScenarioContext: ScenarioContext = Object.freeze({
  selectedLinkId: SCENARIO_LINK_ID,
  region: "India and South Asia",
  product: "Taara Lightbridge",
  horizon: "6 hours",
  modelVersion: "v2.4.1",
  thresholdPct: 70,
});

export interface HarnessHandle {
  /** Latest state value, for reading derived data in assertions only. */
  current: ScenarioStateValue | null;
}

function Harness({
  render: renderChild,
  handle,
  context,
}: {
  render: (state: ScenarioStateValue) => React.ReactNode;
  handle: HarnessHandle;
  context: ScenarioContext;
}) {
  const state = useScenarioState(context);
  handle.current = state;
  return <div>{renderChild(state)}</div>;
}

/** Renders one AIM-006 component with live scenario state and a user-event instance. */
export function renderWithScenarioState(
  renderChild: (state: ScenarioStateValue) => React.ReactNode,
  context: ScenarioContext = defaultScenarioContext,
) {
  const handle: HarnessHandle = { current: null };
  const user = userEvent.setup();
  const utils = render(<Harness render={renderChild} handle={handle} context={context} />);
  return { ...utils, handle, user };
}

/** Advances the scenario using the real Next Stage control. */
export async function clickNextStage(
  user: ReturnType<typeof userEvent.setup>,
  scope: { getByRole: (role: string, opts: { name: RegExp }) => HTMLElement },
  times: number,
) {
  for (let i = 0; i < times; i += 1) {
    await user.click(scope.getByRole("button", { name: /^next stage$/i }));
  }
}

/** jsdom does not implement object URLs; local CSV export needs them. */
if (typeof URL.createObjectURL !== "function") {
  (URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL = () => "blob:aim006";
  (URL as unknown as { revokeObjectURL: (u: string) => void }).revokeObjectURL = () => {};
}
