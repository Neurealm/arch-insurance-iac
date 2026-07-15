import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { friendlyAuthError } from "@/lib/authErrors";

// Same policy as Signup / Change Password / Reset Password.
const passwordSchema = z
  .string()
  .min(12, "At least 12 characters")
  .max(72, "Max 72 characters")
  .regex(/[A-Z]/, "At least one uppercase letter")
  .regex(/[a-z]/, "At least one lowercase letter")
  .regex(/[0-9]/, "At least one number")
  .regex(/[^A-Za-z0-9]/, "At least one symbol");

/**
 * First-login screen for invited users. They signed in with a temporary
 * password (real session already established), so `updateUser` always works —
 * no magic link, no recovery token, no "auth session missing".
 */
export default function SetInitialPassword() {
  const navigate = useNavigate();
  const { user, refreshRole, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const checks = [
    { ok: password.length >= 12, label: "12+ characters" },
    { ok: /[A-Z]/.test(password), label: "Uppercase" },
    { ok: /[a-z]/.test(password), label: "Lowercase" },
    { ok: /[0-9]/.test(password), label: "Number" },
    { ok: /[^A-Za-z0-9]/.test(password), label: "Symbol" },
  ];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords don't match");
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!user) return;

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setBusy(false);
      return toast.error(friendlyAuthError(error.message));
    }
    // Clear the forced-change flag now that they've set their own password.
    const { error: pErr } = await supabase
      .from("profiles")
      .update({ must_change_password: false } as any)
      .eq("user_id", user.id);
    if (pErr) console.warn("could not clear must_change_password", pErr.message);

    await refreshRole();

    // Check if this invited user still needs to fill in the optional profile.
    // This is a one-shot redirect on the success path — it never blocks routing.
    const { data: prof } = await supabase
      .from("profiles")
      .select("profile_completed_at")
      .eq("user_id", user.id)
      .maybeSingle();

    setBusy(false);
    toast.success("Password set. Welcome to neuGAIN!");
    if (prof && !(prof as any).profile_completed_at) {
      navigate("/complete-profile", { replace: true });
    } else {
      navigate("/app", { replace: true });
    }
  };

  return (
    <AuthLayout
      title="Set your password"
      subtitle="Create a password to finish setting up your account"
      footer={
        <button
          type="button"
          onClick={async () => { await signOut(); navigate("/login"); }}
          className="text-indigo font-semibold hover:underline"
        >
          Sign out
        </button>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email ?? ""} disabled className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
          />
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
            {checks.map((c) => (
              <span key={c.label} className={`text-[11px] ${c.ok ? "text-status-healthy" : "text-muted-foreground"}`}>
                {c.ok ? "✓" : "○"} {c.label}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-11"
          />
          {confirm && confirm !== password && (
            <p className="text-[11px] text-destructive">Passwords don't match</p>
          )}
        </div>
        <Button type="submit" disabled={busy} className="w-full h-11 bg-primary hover:bg-primary/90">
          {busy ? "Saving…" : "Set password & continue"}
        </Button>
      </form>
    </AuthLayout>
  );
}
