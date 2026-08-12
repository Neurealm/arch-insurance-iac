// Lazy-loaded synthetic waveform bundle. Never import from this file at
// module top level in the app — use `import("./waveformSamples")` from the
// WaveformPreview component. All traces are labeled synthetic.

export interface WaveTrace { name: string; samples: (0 | 1)[]; note: string; }

const seed = (pattern: (0 | 1)[], len = 64): (0 | 1)[] => {
  const out: (0 | 1)[] = [];
  for (let i = 0; i < len; i++) out.push(pattern[i % pattern.length]);
  return out;
};

export const syntheticWaveforms: Record<string, WaveTrace> = {
  ring_wrap:          { name: "ring_wrap",          samples: seed([0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0]), note: "synthetic — pulse marks wrap boundary" },
  wr_rsp_pending:     { name: "wr_rsp_pending",     samples: seed([0,0,1,1,1,1,0,0]),                  note: "synthetic — outstanding writes envelope" },
  completion_accept:  { name: "completion_accept",  samples: seed([1,0,1,0,1,0,1,0]),                  note: "synthetic — accept pulses" },
  irq_coalesce_hit:   { name: "irq_coalesce_hit",   samples: seed([0,0,0,1,0,0,0,0]),                  note: "synthetic — coalescing hit counter tick" },
  fetch_head:         { name: "fetch_head",         samples: seed([0,1,1,0,0,1,1,0]),                  note: "synthetic — producer head toggles" },
  committed_head:     { name: "committed_head",     samples: seed([0,0,1,1,0,0,1,1]),                  note: "synthetic — consumer head (lags fetch_head on wrap)" },
  descriptor_seq:     { name: "descriptor_seq",     samples: seed([1,0,1,1,0,1,0,1]),                  note: "synthetic — descriptor sequence tag LSB" },
  completion_valid:   { name: "completion_valid",   samples: seed([0,1,0,0,1,0,0,1]),                  note: "synthetic — completion valid strobe" },
};

export const SYNTHETIC_LABEL = "Synthetic preview data — not from a real simulation run.";
