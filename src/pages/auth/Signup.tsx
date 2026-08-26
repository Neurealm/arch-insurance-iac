import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthLayout } from "./AuthLayout";
import { z } from "zod";
import { friendlyAuthError } from "@/lib/authErrors";

const PUBLIC_DOMAINS = new Set([
  "gmail.com","googlemail.com","yahoo.com","yahoo.co.uk","yahoo.co.in","ymail.com","rocketmail.com",
  "hotmail.com","outlook.com","live.com","msn.com","passport.com",
  "aol.com","icloud.com","me.com","mac.com","proton.me","protonmail.com","pm.me",
  "zoho.com","gmx.com","gmx.net","mail.com","yandex.com","yandex.ru","tutanota.com",
  "fastmail.com","hey.com","duck.com","qq.com","163.com","126.com","sina.com","naver.com","rediffmail.com",
]);

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(255)
    .refine((v) => {
      const d = v.split("@")[1];
      return d && !PUBLIC_DOMAINS.has(d);
    }, "Please use your work email — personal email domains aren't allowed"),
  password: z.string()
    .min(12, "At least 12 characters")
    .max(72, "Max 72 characters")
    .regex(/[A-Z]/, "At least one uppercase letter")
    .regex(/[a-z]/, "At least one lowercase letter")
    .regex(/[0-9]/, "At least one number")
    .regex(/[^A-Za-z0-9]/, "At least one symbol"),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ email, password, confirm });
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0].message);
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: window.location.origin + "/connections" },
    });
    setLoading(false);
    if (error) return toast.error(friendlyAuthError(error.message));
    toast.success("Check your email to verify your account. An administrator will approve your access.");
    navigate("/login");
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/connections" });
    if (result.error) toast.error("Google sign-in failed");
  };

  const checks = [
    { ok: password.length >= 12, label: "12+ characters" },
    { ok: /[A-Z]/.test(password), label: "Uppercase" },
    { ok: /[a-z]/.test(password), label: "Lowercase" },
    { ok: /[0-9]/.test(password), label: "Number" },
    { ok: /[^A-Za-z0-9]/.test(password), label: "Symbol" },
  ];

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start running operations smarter"
      footer={<>Already have an account? <Link to="/login" className="text-indigo font-semibold hover:underline">Sign in</Link></>}
    >
      <Button type="button" variant="outline" className="w-full h-11" onClick={onGoogle}>
        <span>Continue with Google</span>
      </Button>
      <div className="relative my-2"><div className="h-px bg-border" /></div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-11" autoComplete="email" />
          <p className="text-[11px] text-muted-foreground">Personal email domains (gmail, yahoo, outlook, etc.) are not permitted.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" autoComplete="new-password" />
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
          <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11" autoComplete="new-password" />
          {confirm && confirm !== password && (
            <p className="text-[11px] text-destructive">Passwords don't match</p>
          )}
        </div>
        <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}