import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthLayout } from "./AuthLayout";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Guard against the recovery token being re-consumed (browser back/refresh
  // after success), which would trigger a noisy "Email link is invalid or has
  // expired" 403 loop from /verify.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash.includes("error")) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const desc = params.get("error_description");
      if (desc) toast.error(decodeURIComponent(desc.replace(/\+/g, " ")));
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      const msg = (error as any)?.name === "AuthSessionMissingError" || /session/i.test(error.message)
        ? "Your reset link was already used or has expired. Please sign in or request a new reset link."
        : error.message;
      toast.error(msg);
      if ((error as any)?.name === "AuthSessionMissingError") {
        navigate("/login", { replace: true });
      }
      return;
    }

    setSubmitted(true);
    toast.success("Password updated.");
    // Clear the recovery hash so a refresh/back-nav can't re-hit /verify with
    // the consumed one-time token.
    if (typeof window !== "undefined") {
      history.replaceState(null, "", window.location.pathname);
    }
    navigate("/app", { replace: true });
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose something secure">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" disabled={submitted} />
        </div>
        <Button type="submit" disabled={loading || submitted} className="w-full h-11 bg-primary hover:bg-primary/90">
          {loading ? "Updating…" : submitted ? "Redirecting…" : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
