import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "./AuthLayout";
import { friendlyAuthError } from "@/lib/authErrors";

// Same policy as Signup / Change / Reset Password.
const passwordSchema = z
  .string()
  .min(12, "At least 12 characters")
  .max(72, "Max 72 characters")
  .regex(/[A-Z]/, "At least one uppercase letter")
  .regex(/[a-z]/, "At least one lowercase letter")
  .regex(/[0-9]/, "At least one number")
  .regex(/[^A-Za-z0-9]/, "At least one symbol");

type Step = "request" | "verify" | "reset";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const checks = [
    { ok: password.length >= 12, label: "12+ characters" },
    { ok: /[A-Z]/.test(password), label: "Uppercase" },
    { ok: /[a-z]/.test(password), label: "Lowercase" },
    { ok: /[0-9]/.test(password), label: "Number" },
    { ok: /[^A-Za-z0-9]/.test(password), label: "Symbol" },
  ];

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.functions.invoke("forgot-password", {
      body: { email: email.trim() },
    });
    setLoading(false);
    if (error) return toast.error(friendlyAuthError(error.message));
    toast.success("If an account exists for that email, we've sent a 6-digit code.");
    setStep("verify");
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) return toast.error("Enter the 6-digit code from the email.");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "recovery",
    });
    setLoading(false);
    if (error) return toast.error(friendlyAuthError(error.message));
    toast.success("Code verified. Choose a new password.");
    setStep("reset");
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (password !== confirm) return toast.error("Passwords don't match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(friendlyAuthError(error.message));
    toast.success("Password updated.");
    navigate("/app", { replace: true });
  };

  const subtitle =
    step === "request"
      ? "We'll email you a 6-digit code"
      : step === "verify"
        ? `Enter the 6-digit code sent to ${email}`
        : "Choose a new secure password";

  return (
    <AuthLayout
      title="Reset password"
      subtitle={subtitle}
      footer={
        step === "request" ? (
          <Link to="/login" className="text-indigo font-semibold hover:underline">
            Back to sign in
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              setStep("request");
              setCode("");
              setPassword("");
              setConfirm("");
            }}
            className="text-indigo font-semibold hover:underline"
          >
            Use a different email
          </button>
        )
      }
    >
      {step === "request" && (
        <form onSubmit={requestOtp} className="space-y-4">
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
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90">
            {loading ? "Sending…" : "Send code"}
          </Button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={verifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">6-digit code</Label>
            <Input
              id="code"
              inputMode="numeric"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="h-11 font-mono tracking-[0.3em] text-center text-lg"
            />
          </div>
          <Button type="submit" disabled={loading || code.length < 6} className="w-full h-11 bg-primary hover:bg-primary/90">
            {loading ? "Verifying…" : "Verify code"}
          </Button>
          <button
            type="button"
            onClick={requestOtp as any}
            disabled={loading}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            Didn't get it? Resend code
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={updatePassword} className="space-y-4">
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
            />
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
              {checks.map((c) => (
                <span
                  key={c.label}
                  className={`text-[11px] ${c.ok ? "text-status-healthy" : "text-muted-foreground"}`}
                >
                  {c.ok ? "✓" : "○"} {c.label}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
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
          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90">
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
