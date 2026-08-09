import { useParams, Link } from "react-router-dom";

/** Lightweight placeholder — the full Execution Center is out of scope here. */
export default function ExecutionCenterPlaceholder() {
  const { packageId } = useParams();
  const pkgId = packageId ?? "CP-2026-01842";
  return (
    <div className="mx-auto max-w-[900px] px-4 py-10">
      <h1 className="text-[20px] font-semibold text-slate-900">Execution Center</h1>
      <p className="mt-2 text-[13px] text-slate-600">
        Execution Center will receive approved package {pkgId}.
      </p>
      <Link
        to="/intelligent-iac/change-review/CP-2026-01842"
        className="mt-4 inline-flex h-8 items-center rounded-md border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
      >
        Back to Change Review &amp; Approval
      </Link>
    </div>
  );
}
