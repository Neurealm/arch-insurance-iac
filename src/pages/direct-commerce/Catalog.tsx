import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  ActionButton, DataTable, Drawer, DrawerSection, Field, FieldGrid, PageHeader, Section, StatusChip, type Column,
} from "./primitives";
import { catalog as seedCatalog, type CatalogRow } from "./data";

const empty: CatalogRow = {
  id: "", product: "Azure-Native Data Platform", internalSku: "", packageName: "", capacity: "",
  regions: "", lifterOffer: "", lifterPlan: "", meteringDimension: "capacity_tb_hour",
  status: "Draft", lastValidated: "—",
};

export default function DcfCatalog() {
  const [rows, setRows] = useState<CatalogRow[]>(seedCatalog);
  const [editing, setEditing] = useState<CatalogRow | null>(null);
  const [isNew, setIsNew] = useState(false);

  const cols: Column<CatalogRow>[] = [
    { key: "product", header: "Internal product" },
    { key: "internalSku", header: "Internal SKU", render: (r) => <span className="font-medium text-slate-900">{r.internalSku}</span> },
    { key: "packageName", header: "Commercial package" },
    { key: "capacity", header: "Capacity" },
    { key: "regions", header: "Region eligibility" },
    { key: "lifterOffer", header: "Lifter offer" },
    { key: "lifterPlan", header: "Lifter plan", render: (r) => <span className="font-mono text-[11.5px] text-indigo-800">{r.lifterPlan}</span> },
    { key: "meteringDimension", header: "Metering dimension" },
    { key: "status", header: "Status", render: (r) => <StatusChip status={r.status} /> },
    { key: "lastValidated", header: "Last validated" },
  ];

  const save = () => {
    if (!editing) return;
    const row = { ...editing, id: editing.id || `MAP-${String(rows.length + 1).padStart(3, "0")}` };
    setRows((r) => (isNew ? [...r, row] : r.map((x) => (x.id === row.id ? row : x))));
    toast.success(`${isNew ? "Created" : "Updated"} mapping ${row.id}: ${row.internalSku} → ${row.lifterPlan || "(unmapped)"}.`);
    setEditing(null);
  };

  const input = (label: string, key: keyof CatalogRow) => (
    <label className="block">
      <span className="text-[10.5px] uppercase tracking-wide text-slate-500">{label}</span>
      <input
        value={String(editing?.[key] ?? "")}
        onChange={(e) => setEditing((s) => (s ? { ...s, [key]: e.target.value } : s))}
        className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-[12.5px] outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Direct Commerce Fulfillment"
        title="Catalog & SKU Mapping"
        description="The translation layer between the commercial packages a customer buys directly and the Lifter offers, plans and metering dimensions used to satisfy the Microsoft fulfillment obligation."
        actions={
          <button
            onClick={() => { setEditing({ ...empty }); setIsNew(true); }}
            className="inline-flex items-center gap-1.5 rounded-md border border-indigo-600 bg-indigo-600 px-2.5 py-1.5 text-[12px] font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" /> New mapping
          </button>
        }
      />
      <div className="p-6">
        <Section title="Mappings" hint="Select a row to edit the mapping. Changes take effect on the next fulfillment submission.">
          <DataTable<CatalogRow>
            rows={rows}
            columns={cols}
            onRowClick={(r) => { setEditing({ ...r }); setIsNew(false); }}
            selectedId={editing && !isNew ? editing.id : null}
            searchPlaceholder="Search SKU, package, plan, region…"
          />
        </Section>
      </div>

      {editing && (
        <Drawer
          open
          onClose={() => setEditing(null)}
          title={isNew ? "New SKU mapping" : `Edit mapping ${editing.id}`}
          subtitle="Internal commercial SKU → Lifter offer and plan"
          badge={!isNew ? <StatusChip status={editing.status} /> : undefined}
          footer={
            <div className="flex flex-wrap gap-2">
              <ActionButton label={isNew ? "Create Mapping" : "Save Mapping"} tone="primary" onClick={save} />
              <ActionButton label="Validate Against Lifter" onClick={() => toast.success(`Validation requested for ${editing.internalSku || "the new mapping"}.`)} />
              {!isNew && <ActionButton label="Retire Mapping" tone="danger" onClick={() => { setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, status: "Retired" } : x))); toast.success(`${editing.id} retired.`); setEditing(null); }} />}
            </div>
          }
        >
          <DrawerSection title="Commercial side">
            <div className="grid grid-cols-2 gap-2">
              {input("Internal product", "product")}
              {input("Internal SKU", "internalSku")}
              {input("Commercial package", "packageName")}
              {input("Capacity", "capacity")}
              {input("Region eligibility", "regions")}
            </div>
          </DrawerSection>
          <DrawerSection title="Fulfillment side">
            <div className="grid grid-cols-2 gap-2">
              {input("Lifter offer", "lifterOffer")}
              {input("Lifter plan", "lifterPlan")}
              {input("Metering dimension", "meteringDimension")}
              <label className="block">
                <span className="text-[10.5px] uppercase tracking-wide text-slate-500">Status</span>
                <select
                  value={editing.status}
                  onChange={(e) => setEditing((s) => (s ? { ...s, status: e.target.value as CatalogRow["status"] } : s))}
                  className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-[12.5px] outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                >
                  {["Active", "Draft", "Needs Validation", "Retired"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
          </DrawerSection>
          {!isNew && (
            <DrawerSection title="Governance">
              <FieldGrid>
                <Field label="Mapping ID" value={editing.id} />
                <Field label="Last validated" value={editing.lastValidated} />
              </FieldGrid>
            </DrawerSection>
          )}
        </Drawer>
      )}
    </div>
  );
}
