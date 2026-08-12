import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["SQL Evidence", "AWS Evidence", "Windows Evidence", "Telemetry", "Policy"] as const;
type Tab = (typeof TABS)[number];

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-[11px] leading-relaxed text-slate-700">
      {children}
    </pre>
  );
}

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-[#E2E8F0] rounded-md border border-[#E2E8F0]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-3 px-2.5 py-1.5 text-[11.5px]">
          <dt className="text-slate-500">{k}</dt>
          <dd className="text-right font-medium text-slate-800">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Read-only technical evidence drawer. Nothing here executes. */
export function TechnicalEvidenceDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("SQL Evidence");
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-label="Technical evidence"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col border-l border-[#E2E8F0] bg-white shadow-xl"
      >
        <header className="flex items-center gap-2 border-b border-[#E2E8F0] px-4 py-3">
          <div>
            <div className="text-[13px] font-semibold text-slate-900">Technical Evidence</div>
            <div className="text-[11px] text-slate-500">SQL-PROD-07 / OrdersDB — read-only diagnostics</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="ml-auto grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex flex-wrap gap-1 border-b border-[#E2E8F0] px-3 py-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded border px-2 py-0.5 text-[11px]",
                tab === t ? "border-[#1B4F91] bg-[#EFF4FB] text-[#1B4F91]" : "border-[#E2E8F0] text-slate-600 hover:bg-slate-50",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {tab === "SQL Evidence" && (
            <>
              <Code>{`SELECT
    name,
    recovery_model_desc,
    log_reuse_wait_desc
FROM sys.databases
WHERE name = 'OrdersDB';`}</Code>
              <Rows rows={[["name", "OrdersDB"], ["recovery_model_desc", "FULL"], ["log_reuse_wait_desc", "LOG_BACKUP"]]} />
              <Code>{`SELECT *
FROM sys.dm_db_log_space_usage;`}</Code>
              <Rows
                rows={[
                  ["total_log_size_in_bytes", "483,183,820,800 (450 GB)"],
                  ["used_log_space_in_bytes", "444,529,116,672 (414 GB)"],
                  ["used_log_space_in_percent", "92.0"],
                  ["log_space_in_bytes_since_last_backup", "58,720,256,000"],
                ]}
              />
              <p className="text-[11px] text-slate-500">Statements are shown for evidence only. No SQL is executed from this screen.</p>
            </>
          )}

          {tab === "AWS Evidence" && (
            <Rows
              rows={[
                ["Instance ID", "i-0f1a2b3c4d5e6f789"],
                ["Instance Type", "m5.2xlarge"],
                ["Volume ID", "vol-0a81f2c4e7b9d1234"],
                ["Volume Type", "gp3"],
                ["Capacity", "500 GB"],
                ["IOPS", "6,000"],
                ["Throughput", "500 MB/s"],
                ["Attachment State", "attached (xvdl)"],
                ["Modification Eligibility", "Eligible — online modification supported"],
                ["Region / AZ", "us-east-1 / us-east-1a"],
              ]}
            />
          )}

          {tab === "Windows Evidence" && (
            <Rows
              rows={[
                ["Disk Number", "3"],
                ["Volume", "MSSQL_LOG"],
                ["Drive Letter", "L:"],
                ["Filesystem", "NTFS"],
                ["Capacity", "500 GB"],
                ["Free Space", "38 GB"],
                ["Health", "Healthy"],
                ["Allocation Unit", "64 KB"],
              ]}
            />
          )}

          {tab === "Telemetry" && (
            <Rows
              rows={[
                ["Log Growth Rate", "+7.8 GB/hour"],
                ["Write Throughput", "78.4 MB/sec"],
                ["Disk Latency (avg)", "2.1 ms"],
                ["Disk Queue Depth", "1.4"],
                ["Backup Status", "Degraded — last success 2h 14m ago"],
                ["Checkpoint Age", "16 min"],
              ]}
            />
          )}

          {tab === "Policy" && (
            <Rows
              rows={[
                ["Production Tier", "Tier 1"],
                ["Autonomy Level", "Assisted — recommend and generate"],
                ["SQL Backup Execution", "Policy approved"],
                ["EBS Modification", "Human approval required"],
                ["Windows Volume Extend", "Approval inherited from change package"],
                ["SQL Restart", "Prohibited without incident commander approval"],
                ["Change Window", "Standard production window / emergency path available"],
              ]}
            />
          )}
        </div>
      </aside>
    </>
  );
}
