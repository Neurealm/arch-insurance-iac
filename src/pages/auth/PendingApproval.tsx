import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Navigate, useNavigate } from "react-router-dom";
import { Clock, LogOut, UserCog } from "lucide-react";

export default function PendingApproval() {
  const { signOut, user, approvalStatus, isAdmin, loading, roleLoading } = useAuth();
  const navigate = useNavigate();

  if (loading || roleLoading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin || approvalStatus === "approved") return <Navigate to="/connections" replace />;

  const rejected = approvalStatus === "rejected";

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background to-muted/30 px-6">
      <div className="max-w-md w-full rounded-2xl border bg-card shadow-lg p-8 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-status-warning-soft text-status-warning grid place-items-center mb-4">
          <Clock className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          {rejected ? "Access denied" : "Awaiting approval"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {rejected
            ? "Your account request was not approved. Please contact your administrator if you believe this is a mistake."
            : `Thanks for signing up${user?.email ? `, ${user.email}` : ""}. Your account is pending approval by a platform administrator. You'll get access once it's approved.`}
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={() => navigate("/profile")} className="w-full gap-2">
            <UserCog className="h-4 w-4" /> Update Profile
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}