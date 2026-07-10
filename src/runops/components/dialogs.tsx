// CommandPalette, NotificationCenter, ConfirmationDialog.

import { useState } from "react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { tones, type StatusTone } from "./variants";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

/* --------------------------- CommandPalette --------------------------- */

export interface CommandPaletteItem {
  id: string;
  label: string;
  hint?: string;
  group?: string;
  onSelect: () => void;
}

export function CommandPalette({
  open, onOpenChange, items, placeholder = "Search runbooks, services, workers…",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: CommandPaletteItem[];
  placeholder?: string;
}) {
  const grouped = items.reduce<Record<string, CommandPaletteItem[]>>((acc, i) => {
    const k = i.group ?? "Actions";
    (acc[k] ||= []).push(i);
    return acc;
  }, {});
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        {Object.entries(grouped).map(([group, entries]) => (
          <CommandGroup key={group} heading={group}>
            {entries.map((i) => (
              <CommandItem
                key={i.id}
                onSelect={() => { i.onSelect(); onOpenChange(false); }}
              >
                <span className="flex-1">{i.label}</span>
                {i.hint && <span className="text-[10px] text-muted-foreground">{i.hint}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

/* -------------------------- NotificationCenter ------------------------ */

export interface AppNotificationItem {
  id: string;
  at: string;
  tone: StatusTone;
  title: string;
  detail?: string;
  read: boolean;
}

export function NotificationCenter({
  open, onOpenChange, notifications, onMarkAllRead,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  notifications: AppNotificationItem[];
  onMarkAllRead?: () => void;
}) {
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:max-w-[380px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><Bell className="h-4 w-4" aria-hidden /> Notifications</span>
            {unread > 0 && <span className="rounded bg-rose-600 px-1.5 text-[10px] font-semibold text-white" aria-label={`${unread} unread`}>{unread}</span>}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
          <span>{notifications.length} total</span>
          {onMarkAllRead && (
            <button
              type="button" onClick={onMarkAllRead}
              className="rounded px-1 text-[11px] font-medium text-indigo-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Mark all read
            </button>
          )}
        </div>
        <ul className="mt-3 space-y-1.5">
          {notifications.map((n) => {
            const spec = tones[n.tone];
            return (
              <li key={n.id} className={cn("rounded border p-2 text-xs", n.read ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50")}>
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("rounded border px-1 text-[10px] font-semibold uppercase tracking-wide", spec.chip)}>{spec.label}</span>
                  <span className="font-mono text-[10px] text-slate-500">{n.at}</span>
                </div>
                <div className="mt-1 font-semibold text-slate-900">{n.title}</div>
                {n.detail && <div className="text-slate-600">{n.detail}</div>}
              </li>
            );
          })}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------- ConfirmationDialog ------------------------ */

export function ConfirmationDialog({
  open, onOpenChange, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel",
  destructive, onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={destructive ? "bg-rose-600 hover:bg-rose-700" : undefined}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Convenience hook — trivial local open/close state for demo pages. */
export function useDialogState(initial = false) {
  const [open, setOpen] = useState(initial);
  return { open, setOpen };
}
