import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
class B extends React.Component<{children: React.ReactNode}, {e:boolean}> {
  state = { e: false };
  static getDerivedStateFromError() { return { e: true }; }
  render() { return this.state.e ? <div>FB</div> : this.props.children; }
}
function Boom() { const [x] = React.useState(() => { throw new Error("boom"); }); return <div>{String(x)}</div>; }
describe("b", () => { it("catches", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(<B><Boom /></B>);
  expect(screen.getByText("FB")).toBeInTheDocument();
}); });
