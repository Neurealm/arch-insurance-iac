import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/** Safe scaffold for Persona Studio destination routes that are not yet built. */
export default function PersonaStudioScaffold({ title, purpose }: { title: string; purpose: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-full bg-slate-50 px-5 py-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Link to="/enterprise-cognitive-fabric" className="hover:text-blue-700">Enterprise Cognitive Fabric</Link>
        <span aria-hidden>/</span>
        <span>Persona Studio</span>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-700">{title}</span>
      </nav>
      <h1 className="mt-1 text-[19px] font-bold text-slate-900">{title}</h1>
      <p className="text-[12px] text-slate-500">{purpose}</p>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[12.5px] text-slate-600">
          This destination is scaffolded. Approved Team Personas published by Team Persona Construction arrive here.
        </p>
        <button
          type="button"
          onClick={() => navigate("/enterprise-cognitive-fabric/persona-studio/team-persona-construction")}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Return to Team Persona Construction
        </button>
      </div>
    </div>
  );
}
