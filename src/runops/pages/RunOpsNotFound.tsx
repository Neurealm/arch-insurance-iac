import { Link, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RunOpsNotFound() {
  const { pathname } = useLocation();
  return (
    <div className="mx-auto max-w-lg p-10">
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500">
          <Compass className="h-4 w-4" />
        </div>
        <h1 className="mt-3 text-[18px] font-semibold text-slate-900">Route not found</h1>
        <p className="mt-1 text-[12.5px] text-slate-600">
          The path <span className="font-mono text-slate-800">{pathname}</span> is not registered in the RunOps route table.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button size="sm" variant="outline" asChild><Link to="/runops">Command Center</Link></Button>
          <Button size="sm" asChild><Link to="/runops/runbooks">Runbooks</Link></Button>
        </div>
      </div>
    </div>
  );
}
