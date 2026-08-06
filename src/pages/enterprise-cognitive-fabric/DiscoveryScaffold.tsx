import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TITLES: Record<string, string> = {
  "ingestion-normalization": "Artifact Ingestion & Normalization",
  "configuration": "Discovery Configuration",
  "pipelines": "Discovery Pipelines",
  "source-registry": "Source Registry",
  "connector-health": "Connector Health",
};

/**
 * Safe scaffold for Discovery destination routes that are not yet implemented.
 * Uses the existing module template and always offers a way back.
 */
export default function DiscoveryScaffold() {
  const { pathname } = useLocation();
  const slug = pathname.split("/").pop() ?? "";
  const title = TITLES[slug] ?? "Discovery";

  return (
    <div className="min-h-full bg-slate-50 px-5 py-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Link to="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</Link>
        <span aria-hidden>/</span>
        <span>Discovery</span>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-700">{title}</span>
      </nav>
      <h1 className="mt-1 text-[19px] font-bold text-slate-900">{title}</h1>
      <p className="text-[12px] text-slate-500">
        This stage is scaffolded. Discovered and qualified artifacts arrive here from Enterprise Source Discovery.
      </p>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[12.5px] text-slate-600">No implementation yet for this stage.</p>
        <Link
          to="/enterprise-cognitive-fabric/discovery/source-discovery"
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Return to Enterprise Source Discovery
        </Link>
      </div>
    </div>
  );
}
