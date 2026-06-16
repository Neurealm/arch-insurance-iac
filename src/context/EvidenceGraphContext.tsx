import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  EVIDENCE_GRAPHS,
  type EvidenceGraph,
  type EvidenceGraphMode,
  getEvidenceGraphForScenario,
} from "@/data/evidenceGraphData";

interface EvidenceGraphContextValue {
  open: boolean;
  mode: EvidenceGraphMode;
  graph: EvidenceGraph | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedHypothesisId: string | null;
  /** open the panel (optionally jump to a mode and/or focus a node) */
  openGraph: (opts?: { mode?: EvidenceGraphMode; nodeId?: string; hypothesisId?: string }) => void;
  closeGraph: () => void;
  setMode: (m: EvidenceGraphMode) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setSelectedHypothesisId: (id: string | null) => void;
}

const Ctx = createContext<EvidenceGraphContextValue | null>(null);

export function EvidenceGraphProvider({
  scenarioId,
  children,
}: {
  scenarioId: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<EvidenceGraphMode>("causal");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string | null>(null);

  const graph = useMemo<EvidenceGraph | null>(() => {
    return getEvidenceGraphForScenario(scenarioId) ?? EVIDENCE_GRAPHS[0] ?? null;
  }, [scenarioId]);

  const openGraph = useCallback(
    (opts?: { mode?: EvidenceGraphMode; nodeId?: string; hypothesisId?: string }) => {
      if (opts?.mode) setMode(opts.mode);
      if (opts?.nodeId !== undefined) setSelectedNodeId(opts.nodeId);
      if (opts?.hypothesisId !== undefined) setSelectedHypothesisId(opts.hypothesisId);
      setOpen(true);
    },
    [],
  );

  const closeGraph = useCallback(() => setOpen(false), []);

  const value: EvidenceGraphContextValue = {
    open, mode, graph,
    selectedNodeId, selectedEdgeId, selectedHypothesisId,
    openGraph, closeGraph, setMode,
    setSelectedNodeId, setSelectedEdgeId, setSelectedHypothesisId,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEvidenceGraph() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEvidenceGraph must be used within EvidenceGraphProvider");
  return ctx;
}
