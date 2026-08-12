import { ReactNode, useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  trigger, open, onOpenChange, title, description,
  confirmLabel = "Confirm", cancelLabel = "Cancel", destructive, onConfirm,
}: Props) {
  const [pending, setPending] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolled;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setUncontrolled;

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <span onClick={() => setOpen(true)}>{trigger}</span>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription asChild><div>{description}</div></AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={destructive ? "destructive" : "default"}
              disabled={pending}
              onClick={async (e) => {
                e.preventDefault();
                try {
                  setPending(true);
                  await onConfirm();
                  setOpen(false);
                } finally {
                  setPending(false);
                }
              }}
            >
              {pending ? "Working…" : confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
