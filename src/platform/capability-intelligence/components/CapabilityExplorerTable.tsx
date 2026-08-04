import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/platform/components/States";
import { PagedDataTable, type PagedColumn } from "@/platform/components/PagedDataTable";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { GRAPH_NODE_TYPES, type GraphNode, type GraphNodeType } from "@/modules/graph/types";
import type { GraphQueryEngine, NodeQueryFilters } from "@/modules/graph/query/index";

const ANY = "__any__";
const PAGE_SIZE = 25;

type SortKey = "label" | "type" | "moduleId" | "ownership" | "confidence";

const REGISTRATION_OPTIONS = ["registered", "unregistered"] as const;
const CONFIDENCE_OPTIONS = ["high", "medium", "low", "unable-to-verify"] as const;

const registrationOf = (n: GraphNode): string =>
  n.attributes.registered === false ? "unregistered" : n.attributes.registered === true ? "registered" : "n/a";

/**
 * Read-only capability explorer. Consumes the Stage 3.5.3.1 query engine for
 * matching, then paginates in memory (the graph is bounded at ~1.3k nodes).
 */
export function CapabilityExplorerTable({
  engine,
  onSelect,
}: {
  engine: GraphQueryEngine;
  onSelect: (nodeId: string) => void;
}) {
  const [text, setText] = useState("");
  const [nodeType, setNodeType] = useState<string>(ANY);
  const [owner, setOwner] = useState<string>(ANY);
  const [ownership, setOwnership] = useState<string>(ANY);
  const [capability, setCapability] = useState<string>(ANY);
  const [registration, setRegistration] = useState<string>(ANY);
  const [confidence, setConfidence] = useState<string>(ANY);
  const [sortKey, setSortKey] = useState<SortKey>("label");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const owners = useMemo(() => {
    const set = new Set<string>();
    for (const n of engine.source.nodes) if (n.moduleId) set.add(n.moduleId);
    return [...set].sort();
  }, [engine]);

  const capabilities = useMemo(
    () =>
      engine.source.nodes
        .filter((n) => n.type === "capability" || n.type === "shared-capability" || n.type === "platform-capability")
        .map((n) => ({ id: n.id, label: n.label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [engine],
  );

  const capabilityScope = useMemo(() => {
    if (capability === ANY) return null;
    const ids = new Set<string>([capability]);
    for (const hit of engine.getNeighbors(capability, { maxDepth: 2 }).results) ids.add(hit.node.id);
    return ids;
  }, [engine, capability]);

  const matched = useMemo(() => {
    const filters: NodeQueryFilters = {
      ...(text.trim() ? { text: text.trim() } : {}),
      ...(nodeType !== ANY ? { nodeTypes: [nodeType as GraphNodeType] } : {}),
      ...(owner !== ANY ? { owners: [owner] } : {}),
      ...(ownership !== ANY ? { ownership: [ownership as GraphNode["ownership"]] } : {}),
    };
    let rows = [...engine.findNodes(filters).results];
    if (capabilityScope) rows = rows.filter((n) => capabilityScope.has(n.id));
    if (registration !== ANY) rows = rows.filter((n) => registrationOf(n) === registration);
    if (confidence !== ANY) rows = rows.filter((n) => n.confidence === confidence);
    const dir = sortDirection === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      return (av.localeCompare(bv) || a.id.localeCompare(b.id)) * dir;
    });
    return rows;
  }, [engine, text, nodeType, owner, ownership, capabilityScope, registration, confidence, sortKey, sortDirection]);

  const safePage = Math.min(page, Math.max(0, Math.ceil(matched.length / PAGE_SIZE) - 1));
  const rows = matched.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const columns: readonly PagedColumn<GraphNode>[] = [
    {
      key: "label",
      header: "Entity",
      sortable: true,
      render: (n) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">{n.label}</div>
          <div className="truncate font-mono text-[11px] text-muted-foreground">{n.id}</div>
        </div>
      ),
    },
    { key: "type", header: "Type", sortable: true, render: (n) => <StatusBadge value={n.type} tone="info" /> },
    { key: "moduleId", header: "Owner", sortable: true, render: (n) => n.moduleId ?? "—" },
    { key: "ownership", header: "Ownership", sortable: true, render: (n) => <StatusBadge value={n.ownership} /> },
    {
      key: "registration",
      header: "Registration",
      render: (n) => <StatusBadge value={registrationOf(n)} />,
    },
    { key: "confidence", header: "Confidence", sortable: true, render: (n) => <StatusBadge value={n.confidence} /> },
  ];

  const reset = () => {
    setText("");
    setNodeType(ANY);
    setOwner(ANY);
    setOwnership(ANY);
    setCapability(ANY);
    setRegistration(ANY);
    setConfidence(ANY);
    setPage(0);
  };

  const onSortChange = (key: string) => {
    if (key === sortKey) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key as SortKey);
      setSortDirection("asc");
    }
    setPage(0);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-4">
        <Input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setPage(0);
          }}
          placeholder="Search entities…"
          aria-label="Search entities"
        />
        <Picker label="Node type" value={nodeType} onChange={setNodeType} options={[...GRAPH_NODE_TYPES]} reset={() => setPage(0)} />
        <Picker label="Owner" value={owner} onChange={setOwner} options={owners} reset={() => setPage(0)} />
        <Picker
          label="Module ownership"
          value={ownership}
          onChange={setOwnership}
          options={["module-owned", "shared", "platform-owned", "customer-owned", "unassigned"]}
          reset={() => setPage(0)}
        />
        <Picker
          label="Capability"
          value={capability}
          onChange={setCapability}
          options={capabilities.map((c) => c.id)}
          labels={Object.fromEntries(capabilities.map((c) => [c.id, c.label]))}
          reset={() => setPage(0)}
        />
        <Picker
          label="Registration"
          value={registration}
          onChange={setRegistration}
          options={[...REGISTRATION_OPTIONS]}
          reset={() => setPage(0)}
        />
        <Picker
          label="Confidence"
          value={confidence}
          onChange={setConfidence}
          options={[...CONFIDENCE_OPTIONS]}
          reset={() => setPage(0)}
        />
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={reset}>
            Clear filters
          </Button>
        </div>
      </div>

      <PagedDataTable
        rows={rows}
        columns={columns}
        rowKey={(n) => n.id}
        page={safePage}
        pageSize={PAGE_SIZE}
        total={matched.length}
        onPageChange={setPage}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        onRowClick={(n) => onSelect(n.id)}
        caption="Capability graph entities"
        emptyState={<EmptyState title="No entities match these filters" description="Adjust or clear the filters to see results." />}
      />
    </div>
  );
}

function Picker({
  label,
  value,
  onChange,
  options,
  labels,
  reset,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  labels?: Record<string, string>;
  reset?: () => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        onChange(v);
        reset?.();
      }}
    >
      <SelectTrigger aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value={ANY}>{label}: any</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {labels?.[o] ?? o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
