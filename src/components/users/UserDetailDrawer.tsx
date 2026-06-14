import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccessEditor } from "./AccessEditor";
import { LoginHistoryList } from "./LoginHistoryList";
import { Check, X, RotateCcw, User as UserIcon, Mail, Calendar, Trash2, Loader2, KeyRound, Send } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";


export type UserRow = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at: string | null;
  avatar_url?: string | null;
};

export function UserDetailDrawer({
  row,
  onClose,
  onStatus,
  onChanged,
}: {
  row: UserRow | null;
  onClose: () => void;
  onStatus: (row: UserRow, status: "approved" | "rejected" | "pending") => Promise<void> | void;
  onChanged?: () => void;
}) {
  const { isAdmin, user: currentUser } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwValue, setPwValue] = useState("");
  const [pwBusy, setPwBusy] = useState<"email" | "set" | null>(null);

  const handleDelete = async () => {
    if (!row) return;
    setDeleting(true);
    const { data, error } = await supabase.functions.invoke("admin-delete-user", {
      body: { userId: row.user_id },
    });
    setDeleting(false);
    if (error || (data as any)?.error) {
      toast.error(error?.message || (data as any)?.error || "Failed to delete user");
      return;
    }
    toast.success(`Deleted ${row.email ?? "user"}`);
    setConfirmOpen(false);
    onChanged?.();
    onClose();
  };

  const sendResetEmail = async () => {
    if (!row) return;
    setPwBusy("email");
    const { data, error } = await supabase.functions.invoke("admin-reset-password", {
      body: { userId: row.user_id, mode: "email" },
    });
    setPwBusy(null);
    if (error || (data as any)?.error) {
      toast.error(error?.message || (data as any)?.error || "Failed to send reset email");
      return;
    }
    toast.success(`Password reset email sent to ${row.email}`);
  };

  const setPasswordDirect = async () => {
    if (!row) return;
    if (pwValue.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPwBusy("set");
    const { data, error } = await supabase.functions.invoke("admin-reset-password", {
      body: { userId: row.user_id, mode: "set", password: pwValue },
    });
    setPwBusy(null);
    if (error || (data as any)?.error) {
      toast.error(error?.message || (data as any)?.error || "Failed to set password");
      return;
    }
    toast.success(`Password updated for ${row.email}`);
    setPwValue("");
    setPwOpen(false);
  };

  const canManage = isAdmin && !!row;
  const canDelete = isAdmin && row && currentUser?.id !== row.user_id;

  return (
    <Sheet open={!!row} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        {row && (
          <>
            <SheetHeader className="space-y-3">
              <div className="flex items-center gap-3">
                {row.avatar_url ? (
                  <img src={row.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover border" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-accent grid place-items-center text-indigo">
                    <UserIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <SheetTitle className="truncate">{row.full_name || row.display_name || "—"}</SheetTitle>
                  <SheetDescription className="truncate flex items-center gap-1 text-xs">
                    <Mail className="h-3 w-3" /> {row.email}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge
                  variant={
                    row.approval_status === "approved"
                      ? "default"
                      : row.approval_status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                  className="capitalize"
                >
                  {row.approval_status}
                </Badge>
                <span className="text-muted-foreground inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Signed up {new Date(row.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2">
                {row.approval_status !== "approved" && (
                  <Button size="sm" onClick={() => onStatus(row, "approved")} className="gap-1">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                )}
                {row.approval_status !== "rejected" && (
                  <Button size="sm" variant="outline" onClick={() => onStatus(row, "rejected")} className="gap-1">
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                )}
                {row.approval_status !== "pending" && (
                  <Button size="sm" variant="ghost" onClick={() => onStatus(row, "pending")} className="gap-1">
                    <RotateCcw className="h-3.5 w-3.5" /> Reset to pending
                  </Button>
                )}
              </div>
            </SheetHeader>

            <Separator className="my-5" />

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Roles & workspace access</h3>
              <AccessEditor userId={row.user_id} onChanged={onChanged} />
            </section>

            <Separator className="my-5" />

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Recent sign-in activity</h3>
              <LoginHistoryList userId={row.user_id} email={row.email} />
            </section>

            {canDelete && (
              <>
                <Separator className="my-5" />
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-destructive">Danger zone</h3>
                  <p className="text-xs text-muted-foreground">
                    Permanently deletes the auth account, profile, roles, workspace memberships,
                    tool/agent assignments, and sign-in history. This cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete user
                  </Button>
                </section>
              </>
            )}
          </>
        )}
      </SheetContent>
      <AlertDialog open={confirmOpen} onOpenChange={(o) => !deleting && setConfirmOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-medium">{row?.email ?? "the account"}</span>{" "}
              and all of their roles, workspace memberships, and assignments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
