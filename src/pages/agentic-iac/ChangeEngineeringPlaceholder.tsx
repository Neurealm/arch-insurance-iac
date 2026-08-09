import { Link } from "react-router-dom";
import { GitPullRequest } from "lucide-react";

/** Placeholder for Screen 03 — Change Engineering Workspace. */
export default function ChangeEngineeringPlaceholder() {
  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[12px] text-slate-500">
        <span>Assets</span><span>/</span><span>SQL Servers</span><span>/</span><span>SQL-PROD-07</span><span>/</span>
        <span className="font-medium text-slate-800">Change Engineering</span>
      </nav>
      <div className="mx-auto max-w-xl rounded-md border border-[#E2E8F0] bg-white p-8 text-center">
        <GitPullRequest className="mx-auto h-8 w-8 text-[#1B4F91]" />
        <h1 className="mt-3 text-[16px] font-semibold text-slate-900">Change Engineering Workspace</h1>
        <p className="mt-1.5 text-[12.5px] text-slate-600">
          The prepared remediation intent for SQL-PROD-07 / OrdersDB will be engineered into infrastructure-as-code
          artifacts here. This workspace is available in a later release.
        </p>
        <Link
          to="/agentic-iac-engineering/remediation-intelligence/sql-prod-07"
          className="mt-4 inline-block rounded-md border border-[#1B4F91] px-3 py-1.5 text-[12px] font-semibold text-[#1B4F91] hover:bg-[#EFF4FB]"
        >
          Back to Remediation Intelligence
        </Link>
      </div>
    </div>
  );
}
