import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

/**
 * Small back/home navigation shown at the top of every Digital Coworker
 * category landing page so users can return to the main Digital Coworkers
 * hub without depending on the sidebar.
 */
export const CoworkersBackLink = () => (
  <div className="bg-card border-b border-border">
    <div className="px-8 py-2 flex items-center gap-3 text-[12px]">
      <Link
        to="/coworkers"
        className="inline-flex items-center gap-1.5 font-semibold text-indigo hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Digital Coworkers
      </Link>
      <span className="text-muted-foreground" aria-hidden>·</span>
      <Link
        to="/app"
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        Command Center
      </Link>
    </div>
  </div>
);

export default CoworkersBackLink;
