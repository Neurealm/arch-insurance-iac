// Global notification center popover. Uses shared OperationsProvider state.
// Supports acknowledge, snooze, open, mark all read.

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useOperations } from "@/runops/state/RunOpsProviders";

const kindDot: Record<string, string> = {
  critical: "bg-red-600",
  warning: "bg-amber-500",
  info: "bg-sky-500",
};

export function NotificationCenter() {
  const {
    notifications, unreadNotifications, markAllNotificationsRead,
    acknowledgeNotification, snoozeNotification,
  } = useOperations();

  const visible = useMemo(
    () => notifications.filter((n) => !n.snoozedUntil || Date.parse(n.snoozedUntil) < Date.now()),
    [notifications],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative grid h-7 w-7 place-items-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label={`Notifications, ${unreadNotifications} unread`}
        >
          <Bell className="h-3.5 w-3.5" />
          {unreadNotifications > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[9px] font-semibold text-white">
              {unreadNotifications}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
          <div className="text-[12.5px] font-semibold text-slate-900">Notifications</div>
          <button
            type="button" onClick={markAllNotificationsRead}
            className="text-[11px] text-slate-600 hover:text-slate-900"
          >Mark all read</button>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {visible.length === 0 && (
            <div className="px-3 py-6 text-center text-[12px] text-slate-500">No active notifications.</div>
          )}
          {visible.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-2 border-b border-slate-100 px-3 py-2 last:border-0",
                !n.read && "bg-sky-50/40",
              )}
            >
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", kindDot[n.kind])} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[12px] font-medium text-slate-900">{n.title}</span>
                  <span className="ml-auto text-[10px] text-slate-500">{n.at}</span>
                </div>
                {n.detail && <div className="mt-0.5 text-[11.5px] text-slate-600">{n.detail}</div>}
                <div className="mt-1.5 flex items-center gap-1.5">
                  {n.route && (
                    <Link
                      to={n.route}
                      className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] text-slate-700 hover:bg-slate-50"
                    >
                      <ExternalLink className="h-3 w-3" /> Open
                    </Link>
                  )}
                  {!n.acknowledged && (
                    <button
                      type="button"
                      onClick={() => acknowledgeNotification(n.id)}
                      className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] text-slate-700 hover:bg-slate-50"
                    >
                      <Check className="h-3 w-3" /> Acknowledge
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => snoozeNotification(n.id, 15)}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] text-slate-700 hover:bg-slate-50"
                    aria-label="Snooze 15 minutes"
                  >
                    <Clock className="h-3 w-3" /> Snooze 15m
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
