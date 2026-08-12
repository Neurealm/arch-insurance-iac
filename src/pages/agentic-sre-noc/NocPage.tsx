import { nocPages } from "./pages";

/**
 * Shared empty page shell for Agentic SRE NOC.
 * Renders the module page header and an empty content container only.
 */
export default function NocPage({ slug }: { slug: string }) {
  const page = nocPages.find((p) => p.slug === slug);
  if (!page) return null;

  return (
    <div className="px-6 py-6 space-y-6 max-w-[1400px]">
      <header className="rounded-xl bg-gradient-to-br from-white to-indigo-50/40 border border-slate-200 p-5 shadow-sm">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">{page.group}</div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">{page.title}</h1>
      </header>

      <section
        className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm min-h-[240px]"
        aria-label={`${page.title} content`}
      />
    </div>
  );
}
