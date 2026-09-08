import { Link } from "react-router-dom";
import { FileInput } from "lucide-react";
import type { TicketPrefill } from "./ticketPrefill";

/**
 * Shown whenever a change form arrived carrying values from an intake ticket.
 * The point is that a reviewer can never mistake extracted values for values a
 * person typed and checked, so the banner names the ticket and stays put.
 */
export default function PrefilledFromTicket({ prefill, note, onClear }: { prefill: TicketPrefill; note?: string; onClear?: () => void }) {
  return (
    <div className="mb-3 flex flex-wrap items-start gap-2 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[12px] text-[#1B4F91]">
      <FileInput className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="min-w-0">
        <p>
          <b>Prefilled from {prefill.ticketNumber}.</b> Check every value before submitting — nothing is validated differently because it came from a ticket.
        </p>
        {note && <p className="mt-1 text-[11.5px] text-slate-600">{note}</p>}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Link to={`/servicenow-intake?requestId=${encodeURIComponent(prefill.intakeRequestId)}`} className="font-medium underline hover:no-underline">
          View ticket
        </Link>
        {onClear && (
          <button type="button" onClick={onClear} className="rounded-md border border-[#CFE0F3] bg-white px-2 py-0.5 font-medium text-slate-700 hover:bg-slate-50">
            Clear and start blank
          </button>
        )}
      </div>
    </div>
  );
}

/** Small marker on a field whose value came from the ticket and is untouched. */
export function FromTicketTag({ shown }: { shown: boolean }) {
  if (!shown) return null;
  return <span className="ml-1.5 rounded border border-[#CFE0F3] bg-[#EFF4FB] px-1 py-px align-middle text-[9.5px] font-medium text-[#1B4F91]">from ticket</span>;
}
