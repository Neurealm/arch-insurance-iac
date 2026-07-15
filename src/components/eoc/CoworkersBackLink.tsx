import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

/**
 * Prominent back / home navigation shown at the top of every Digital Coworker
 * category landing page so users can return to the main Digital Coworkers
 * hub without depending on the sidebar.
 */
export const CoworkersBackLink = () => (
  <div className="bg-card border-b-2 border-indigo/30">
    <div className="px-8 py-3 flex items-center gap-3 text-sm">
      <Link
        to="/coworkers"
        className="inline-flex items-center gap-2 font-bold text-indigo bg-indigo/10 hover:bg-indigo/15 ring-1 ring-indigo/30 rounded-md px-3 py-1.5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
        Back to Digital Coworkers
      </Link>
      <span className="text-muted-foreground" aria-hidden>·</span>
      <Link
        to="/app"
        className="inline-flex items-center gap-1.5 font-semibold text-foreground/80 hover:text-indigo"
      >
        <Home className="h-4 w-4" />
        Command Center
      </Link>
    </div>
  </div>
);

export default CoworkersBackLink;
