import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "./AuthLayout";
import { friendlyAuthError } from "@/lib/authErrors";

// Same policy as Signup / Change Password.
const passwordSchema = z
  .string()
  .min(12, "At least 12 characters")
  .max(72, "Max 72 characters")
  .regex(/[A-Z]/, "At least one uppercase letter")
  .regex(/[a-z]/, "At least one lowercase letter")
  .regex(/[0-9]/, "At least one number")
  .regex(/[^A-Za-z0-9]/, "At least one symbol");

/**
 * Reset password with a resilient dual path:
 *  - If the emailed magic link established a session (link wasn't scanned/expired),
 *    just show the new-password field — the classic one-click experience.
 *  - If there is NO session (link consumed by an email scanner or expired), fall
 *    back to the 6-digit code from the email: verifyOtp() establishes the session
 *    in-browser, then updateUser() sets the password. No redirect dependency.
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // null = still checking; true = link gave us a session; false = need the code.
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("error")) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const desc = params.get("error_description");
      if (desc) toast.error(decodeURIComponent(desc.replace(/\+/g, " ")));
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setHasSession(!!data.session);
    });
    // A valid link fires PASSWORD_RECOVERY slightly after mount — catch it.
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (["PASSWORD_RECOVERY", "SIGNED_IN", "USER_UPDATED", "TOKEN_REFRESHED"].includes(event)) {
        setHasSession(!!s);
      }
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const needCode = hasSession === false;

  const checks = [
    { ok: password.length >= 12, label: "12+ characters" },
    { ok: /[A-Z]/.test(password), label: "Uppercase" },
    { ok: /[a-z]/.test(password), label: "Lowercase" },
    { ok: /[0-9]/.test(password), label: "Number" },
    { ok: /[^A-Za-z0-9]/.test(password), label: "Symbol" },
  ];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted) return;
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setLoading(true);

    // No session → verify the emailed code first to establish one.
    if (!hasSession) {
      if (!email.trim() || code.trim().length < 6) {
        setLoading(false);
        return toast.error("Enter your email and the 6-digit code from the email.");
      }
      const { error: vErr } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "recovery",
      });
      if (vErr) {
        setLoading(false);
        return toast.error(friendlyAuthError(vErr.message));
      }
    }

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      const isSession =
        (error as any)?.name === "AuthSessionMissingError" || /session/i.test(error.message);
      toast.error(
        isSession
          ? "Your reset link or code was invalid or has expired. Please request a new reset link."
          : friendlyAuthError(error.message)
      );
      if (isSession) navigate("/forgot-password", { replace: true });
      return;
    }

    setSubmitted(true);
    toast.success("Password updated.");
    if (typeof window !== "undefined") {
      history.replaceState(null, "", window.location.pathname);
    }
    navigate("/app", { replace: true });
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle={needCode ? "Enter the code from your email, then choose a new password" : "Choose something secure"}
      footer={
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="text-indigo font-semibold hover:underline"
        >
          Request a new reset link
        </button>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {needCode && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                disabled={submitted}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">6-digit code</Label>
              <Input
                id="code"
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="h-11 font-mono tracking-[0.3em]"
                disabled={submitted}
              />
              <p className="text-[11px] text-muted-foreground">
                Use the code from the password-reset email — it works even if the link didn't.
              </p>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
            disabled={submitted}
          />
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
            {checks.map((c) => (
              <span key={c.label} className={`text-[11px] ${c.ok ? "text-status-healthy" : "text-muted-foreground"}`}>
                {c.ok ? "✓" : "○"} {c.label}
              </span>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || submitted || hasSession === null}
          className="w-full h-11 bg-primary hover:bg-primary/90"
        >
          {hasSession === null ? "Verifying…" : loading ? "Updating…" : submitted ? "Redirecting…" : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
