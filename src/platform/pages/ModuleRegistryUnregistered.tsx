import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { buildUnregisteredReport } from "@/modules/inventory";

/**
 * Unregistered-implementation panel for the module registry diagnostics view.
 * Split out so the (large) implementation inventory is code-split away from the
 * platform shell bundle.
 */
export default function ModuleRegistryUnregistered() {
  const report = useMemo(() => buildUnregisteredReport(), []);
  const [filter, setFilter] = useState("");

  const items = report.items.filter((i) =>
    filter ? i.ref.toLowerCase().includes(filter.toLowerCase()) : true,
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {report.items.length} unregistered items of {report.scannedItemCount} scanned ·{" "}
        {report.registeredItemCount} covered by a manifest. Recommendations are advisory; nothing is
        moved or deleted automatically.
      </p>
      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by path or route…"
        className="max-w-sm"
      />
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Reference</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Likely module</th>
              <th className="px-3 py-2">Activity</th>
              <th className="px-3 py-2">Recommended action</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 400).map((i) => (
              <tr key={`${i.implementationType}-${i.ref}`} className="border-t border-border">
                <td className="px-3 py-1.5 font-mono text-xs">{i.ref}</td>
                <td className="px-3 py-1.5 text-xs">{i.implementationType}</td>
                <td className="px-3 py-1.5 text-xs">{i.likelyModuleId ?? "—"}</td>
                <td className="px-3 py-1.5">
                  <Badge variant={i.activity === "active" ? "secondary" : "outline"}>
                    {i.activity}
                  </Badge>
                </td>
                <td className="px-3 py-1.5 text-xs text-muted-foreground">{i.recommendedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
