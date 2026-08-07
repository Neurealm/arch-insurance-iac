export default function SyntheticFooter({
  refreshed = "2 minutes ago",
  tagline,
  left = "Agentic FinOps Digital Twin",
}: { refreshed?: string; tagline?: string; left?: string }) {
  return (
    <div className="space-y-2 border-t border-slate-200 pt-3">
      {tagline && <p className="text-center text-[12.5px] font-semibold text-slate-700">{tagline}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">{left}</span>
        <p className="flex-1 text-center text-[11.5px] text-slate-500">
          Demonstration environment. Financial and operational values are synthetic.
        </p>
        <span className="text-[11px] text-slate-500">Data refreshed: {refreshed}</span>
      </div>
    </div>
  );
}
