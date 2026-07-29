import type { RaciGuide } from "./types";
import { GuidePending } from "./CommercialGuideSection";

const RACI_LABEL: Record<string, string> = {
  R: "Responsible",
  A: "Accountable",
  C: "Consulted",
  I: "Informed",
};

export function CommercialGuideRaci({ raci }: { raci: RaciGuide[] }) {
  if (raci.length === 0) return <GuidePending label="RACI pending validation" />;
  const roles = Array.from(new Set(raci.flatMap((r) => r.assignments.map((a) => a.role))));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-xs">
        <caption className="sr-only">Mini RACI by activity and role</caption>
        <thead>
          <tr className="border-b border-border text-left">
            <th scope="col" className="py-1.5 pr-2 font-medium text-foreground">Activity</th>
            {roles.map((role) => (
              <th key={role} scope="col" className="py-1.5 pr-2 font-medium text-foreground">{role}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {raci.map((row) => (
            <tr key={row.activity} className="border-b border-border/60">
              <th scope="row" className="py-1.5 pr-2 text-left font-normal text-muted-foreground">{row.activity}</th>
              {roles.map((role) => {
                const a = row.assignments.find((x) => x.role === role);
                return (
                  <td key={role} className="py-1.5 pr-2 text-foreground">
                    {a ? <abbr title={RACI_LABEL[a.raci]}>{a.raci}</abbr> : <span aria-hidden>—</span>}
                    {!a && <span className="sr-only">Not assigned</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
