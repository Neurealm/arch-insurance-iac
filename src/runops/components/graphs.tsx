// Graph surfaces built on reactflow. WorkflowCanvas is oriented left-to-right
// for step sequences. TopologyCanvas is oriented for service/component
// dependencies. CausalGraph is a directed acyclic layout for hypothesis and
// evidence graphs. All three share the same node contract.

import { cn } from "@/lib/utils";
import ReactFlow, {
  Background, Controls, Handle, MiniMap, Position,
  type Edge, type Node, type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { tones, type StatusTone } from "./variants";

export interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  tone?: StatusTone;
  kind?: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  dashed?: boolean;
}

/* ------------------------------ Node types ---------------------------- */

function BaseNode({ data }: NodeProps<{ node: GraphNode; showHandles: boolean }>) {
  const { node, showHandles } = data;
  const spec = tones[node.tone ?? "neutral"];
  return (
    <div
      role="group"
      aria-label={`${node.label}${node.sublabel ? ` — ${node.sublabel}` : ""}`}
      className={cn("min-w-[140px] rounded border bg-white px-2 py-1.5 shadow-sm", spec.chip)}
    >
      {showHandles && <Handle type="target" position={Position.Left} className="!bg-slate-400" />}
      <div className="flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full", spec.dot)} aria-hidden />
        <div className="min-w-0">
          <div className="truncate text-[11px] font-semibold text-slate-900">{node.label}</div>
          {node.sublabel && <div className="truncate text-[10px] text-slate-600">{node.sublabel}</div>}
        </div>
      </div>
      {showHandles && <Handle type="source" position={Position.Right} className="!bg-slate-400" />}
    </div>
  );
}

/**
 * Presentational, stateless node — safe to embed outside a reactflow canvas.
 */
export function WorkflowNode({ node, className }: { node: GraphNode; className?: string }) {
  const spec = tones[node.tone ?? "neutral"];
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded border bg-white px-2 py-1 text-[11px]", spec.chip, className)}>
      <span className={cn("h-2 w-2 rounded-full", spec.dot)} aria-hidden />
      <span className="font-semibold">{node.label}</span>
      {node.sublabel && <span className="text-slate-600">· {node.sublabel}</span>}
    </div>
  );
}

export function TopologyNode(props: { node: GraphNode; className?: string }) {
  return <WorkflowNode {...props} />;
}

/* ---------------------------- Layout helpers -------------------------- */

const nodeTypes = { runopsNode: BaseNode };

function toRFNodes(nodes: GraphNode[], mode: "workflow" | "topology" | "causal"): Node[] {
  const columns = new Map<number, number>();
  return nodes.map((n, i) => {
    let x = n.x ?? 0;
    let y = n.y ?? 0;
    if (n.x === undefined || n.y === undefined) {
      if (mode === "workflow") {
        x = i * 200; y = 40;
      } else if (mode === "topology") {
        const col = i % 4;
        const row = Math.floor(i / 4);
        x = col * 220; y = row * 120;
      } else {
        // causal: distribute by depth heuristic — same as topology grid
        const col = i % 3;
        const cnt = columns.get(col) ?? 0;
        columns.set(col, cnt + 1);
        x = col * 240; y = cnt * 110;
      }
    }
    return {
      id: n.id,
      position: { x, y },
      data: { node: n, showHandles: true },
      type: "runopsNode",
    };
  });
}

function toRFEdges(edges: GraphEdge[]): Edge[] {
  return edges.map((e, i) => ({
    id: e.id ?? `${e.source}->${e.target}-${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: false,
    style: e.dashed ? { strokeDasharray: "4 4" } : undefined,
  }));
}

/* ------------------------------ Canvases ------------------------------ */

interface CanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  height?: number | string;
  className?: string;
  ariaLabel?: string;
}

function Canvas({ nodes, edges, height = 320, className, ariaLabel, mode }:
  CanvasProps & { mode: "workflow" | "topology" | "causal" }) {
  return (
    <div
      className={cn("rounded border border-slate-200 bg-white", className)}
      style={{ height }}
      role="img"
      aria-label={ariaLabel ?? `${mode} graph with ${nodes.length} nodes and ${edges.length} connections`}
    >
      <ReactFlow
        nodes={toRFNodes(nodes, mode)}
        edges={toRFEdges(edges)}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
      >
        <Background gap={16} color="#e2e8f0" />
        <Controls showInteractive={false} className="!border !border-slate-200 !bg-white" />
        <MiniMap pannable zoomable className="!bg-white" maskColor="rgba(15,23,42,0.05)" />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas(p: CanvasProps) { return <Canvas {...p} mode="workflow" />; }
export function TopologyCanvas(p: CanvasProps) { return <Canvas {...p} mode="topology" />; }
export function CausalGraph(p: CanvasProps)    { return <Canvas {...p} mode="causal" />; }
