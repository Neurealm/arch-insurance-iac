/**
 * Stage 3.5.4.2.1 — backward-compatibility regression coverage for the shared
 * RunOps graph canvas (`src/runops/components/graphs.tsx`).
 *
 * The Graph Explorer added two optional props (`animateHighlights`,
 * `selectedEdgeIds`). These tests prove existing RunOps consumers are
 * unaffected: existing props still render, the new props are optional, and the
 * canvas never mutates the node or edge objects handed to it.
 *
 * Assertions are made against the props the shared canvas hands to React Flow
 * rather than against rendered pixels, so they stay stable and meaningful.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const captured: { props: Record<string, unknown> | null } = { props: null };

vi.mock("reactflow", () => {
  const Passthrough = (name: string) => (p: Record<string, unknown>) => (
    <div data-testid={`rf-${name}`} data-props={JSON.stringify(Object.keys(p ?? {}))} />
  );
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => {
      captured.props = props;
      return <div data-testid="rf-canvas">{props.children as React.ReactNode}</div>;
    },
    Background: Passthrough("background"),
    Controls: Passthrough("controls"),
    MiniMap: Passthrough("minimap"),
    Handle: () => null,
    Position: { Left: "left", Right: "right", Top: "top", Bottom: "bottom" },
  };
});

vi.mock("reactflow/dist/style.css", () => ({}));

import { TopologyCanvas, WorkflowCanvas, CausalGraph, type GraphEdge, type GraphNode } from "@/runops/components/graphs";

const nodes: GraphNode[] = [
  { id: "a", label: "Service A", sublabel: "api", tone: "ok" },
  { id: "b", label: "Service B", tone: "warn" },
  { id: "c", label: "Service C" },
];

const edges: GraphEdge[] = [
  { id: "a->b", source: "a", target: "b", label: "calls" },
  { id: "b->c", source: "b", target: "c", dashed: true },
];

type RFNode = { id: string; position: { x: number; y: number }; style?: Record<string, unknown> };
type RFEdge = { id: string; animated: boolean; style?: Record<string, unknown> };

const rfNodes = () => (captured.props?.nodes as RFNode[]) ?? [];
const rfEdges = () => (captured.props?.edges as RFEdge[]) ?? [];

beforeEach(() => {
  captured.props = null;
});

describe("RunOps shared graph canvas — existing consumer contract", () => {
  it("renders TopologyCanvas with only the original props", () => {
    render(<TopologyCanvas nodes={nodes} edges={edges} />);
    expect(screen.getByRole("img")).toBeTruthy();
    expect(rfNodes().map((n) => n.id)).toEqual(["a", "b", "c"]);
    expect(rfEdges().map((e) => e.id)).toEqual(["a->b", "b->c"]);
  });

  it("renders WorkflowCanvas with only the original props", () => {
    render(<WorkflowCanvas nodes={nodes} edges={edges} height={240} />);
    expect(rfNodes()).toHaveLength(3);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("workflow graph");
  });

  it("renders CausalGraph with only the original props", () => {
    render(<CausalGraph nodes={nodes} edges={edges} />);
    expect(rfNodes()).toHaveLength(3);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("causal graph");
  });

  it("renders the background, controls and minimap chrome", () => {
    render(<TopologyCanvas nodes={nodes} edges={edges} />);
    expect(screen.getByTestId("rf-background")).toBeTruthy();
    expect(screen.getByTestId("rf-controls")).toBeTruthy();
    expect(screen.getByTestId("rf-minimap")).toBeTruthy();
  });

  it("keeps nodes non-draggable and non-connectable for every consumer", () => {
    render(<TopologyCanvas nodes={nodes} edges={edges} />);
    expect(captured.props?.nodesDraggable).toBe(false);
    expect(captured.props?.nodesConnectable).toBe(false);
    expect(captured.props?.elementsSelectable).toBe(true);
    expect(captured.props?.fitView).toBe(true);
  });

  it("keeps the new props optional and inert when omitted", () => {
    render(<TopologyCanvas nodes={nodes} edges={edges} highlightEdgeIds={new Set(["a->b"])} />);
    // animateHighlights defaults to true, preserving existing RunOps animation.
    expect(rfEdges().find((e) => e.id === "a->b")?.animated).toBe(true);
    expect(rfEdges().find((e) => e.id === "b->c")?.animated).toBe(false);
  });

  it("disables highlight animation when reduced motion is requested", () => {
    render(
      <TopologyCanvas
        nodes={nodes}
        edges={edges}
        highlightEdgeIds={new Set(["a->b"])}
        animateHighlights={false}
      />,
    );
    expect(rfEdges().find((e) => e.id === "a->b")?.animated).toBe(false);
    // Highlight styling still applies; only the animation is suppressed.
    expect(rfEdges().find((e) => e.id === "a->b")?.style?.strokeWidth).toBe(2);
  });

  it("applies selectedEdgeIds to the selected edge only", () => {
    render(<TopologyCanvas nodes={nodes} edges={edges} selectedEdgeIds={new Set(["b->c"])} />);
    expect(rfEdges().find((e) => e.id === "b->c")?.style?.strokeWidth).toBe(3);
    expect(rfEdges().find((e) => e.id === "b->c")?.animated).toBe(false);
    expect(rfEdges().find((e) => e.id === "a->b")?.style?.strokeWidth).toBeUndefined();
  });

  it("still highlights and dims nodes for existing consumers", () => {
    render(<TopologyCanvas nodes={nodes} edges={edges} selectedNodeId="a" highlightNodeIds={new Set(["b"])} />);
    expect(rfNodes().find((n) => n.id === "a")?.style?.outline).toContain("2px solid");
    expect(rfNodes().find((n) => n.id === "c")?.style?.opacity).toBe(0.35);
  });

  it("fires node and edge callbacks with the original payloads", async () => {
    const onNodeClick = vi.fn();
    const onEdgeClick = vi.fn();
    render(
      <TopologyCanvas nodes={nodes} edges={edges} onNodeClick={onNodeClick} onEdgeClick={onEdgeClick} />,
    );
    (captured.props?.onNodeClick as (e: unknown, n: { id: string }) => void)(null, { id: "a" });
    (captured.props?.onEdgeClick as (e: unknown, n: { id: string }) => void)(null, { id: "b->c" });
    expect(onNodeClick).toHaveBeenCalledWith("a");
    expect(onEdgeClick).toHaveBeenCalledWith(edges[1]);
    await userEvent.click(screen.getByTestId("rf-canvas"));
  });

  it("does not mutate the node or edge objects it is given", () => {
    const nodeSnapshot = JSON.stringify(nodes);
    const edgeSnapshot = JSON.stringify(edges);
    render(
      <TopologyCanvas
        nodes={nodes}
        edges={edges}
        selectedNodeId="a"
        highlightNodeIds={new Set(["b"])}
        highlightEdgeIds={new Set(["a->b"])}
        selectedEdgeIds={new Set(["b->c"])}
        animateHighlights={false}
      />,
    );
    expect(JSON.stringify(nodes)).toBe(nodeSnapshot);
    expect(JSON.stringify(edges)).toBe(edgeSnapshot);
  });
});
