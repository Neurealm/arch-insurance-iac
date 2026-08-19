import DependencyHealthPanel from "./DependencyHealthPanel";
import { PageHeader } from "./primitives";

export default function CustomerHealthDependencies() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Service Dependencies"
        subtitle="The layers supporting your services — infrastructure condition is always shown separately from customer impact."
      />
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <DependencyHealthPanel />
      </div>
    </div>
  );
}
