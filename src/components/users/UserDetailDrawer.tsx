import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AccessEditor } from "./AccessEditor";
import { LoginHistoryList } from "./LoginHistoryList";
import { Check, X, RotateCcw, User as UserIcon, Mail, Calendar } from "lucide-react";

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
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
