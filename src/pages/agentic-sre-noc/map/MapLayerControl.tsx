/**
 * GLHM-MAP-002 — layer visibility control.
 *
 * Session-scoped toggles for the operational layer groups. Keyboard
 * accessible, no persistent storage.
 */

import { Check } from "lucide-react";
import { LAYER_GROUPS, LAYER_GROUP_LABELS, type LayerGroup } from "./layers";

export function MapLayerControl({
  open, visibility, onToggle, onClose,
}: {
  open: boolean;
  visibility: Record<LayerGroup, boolean>;
  onToggle: (group: LayerGroup) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="group"
      aria-label="Map layers"
      className="pointer-events-auto w-[190px] rounded-lg border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur-sm"
    >
      <div className="mb-1 flex items-center justify-between px-0.5">
        <span className="text-[11px] font-semibold text-slate-700">Layers</span>
        <button
          type="button"
          onClick={onClose}
          className="text-[10px] text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Close
        </button>
      </div>
      <ul className="space-y-0.5">
        {LAYER_GROUPS.map((group) => (
          <li key={group}>
            <button
              type="button"
              role="switch"
              aria-checked={visibility[group]}
              onClick={() => onToggle(group)}
              className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-left text-[10.5px] text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span
                aria-hidden
                className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded border ${
                  visibility[group] ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300 bg-white"
                }`}
              >
                {visibility[group] && <Check className="h-2.5 w-2.5" />}
              </span>
              {LAYER_GROUP_LABELS[group]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MapLayerControl;
