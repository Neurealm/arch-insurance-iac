import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AuthLayout } from "./AuthLayout";
import { Eye, EyeOff } from "lucide-react";
// AuthVerificationOverlay archived — see src/components/auth/AuthVerificationOverlay.tsx (unused).

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dest = (location.state as any)?.from || "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [workspace, setWorkspace] = useState("neurealm");
  const [showPassword, setShowPassword] = useState(false);
  const [tenants, setTenants] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("tenants")
        .select("id,name,slug")
        .eq("status", true)
        .order("name");
      setTenants(data ?? []);
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    const uid = signInData.user?.id;
    try {
      if (workspace === "neurealm") {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid!);
        if (!roles || roles.length === 0) {
          navigate("/no-access", { replace: true, state: { workspace: "NeuRealm" } });
          return;
        }
      } else {
        const tenant = tenants.find((t) => t.slug === workspace);
        if (!tenant) {
          await supabase.auth.signOut();
          toast.error("Selected workspace not found.");
          return;
        }
        const { data: m } = await supabase
          .from("tenant_memberships")
          .select("id")
          .eq("user_id", uid!)
          .eq("tenant_id", tenant.id)
          .maybeSingle();
        if (!m) {
          navigate("/no-access", { replace: true, state: { workspace: tenant.name } });
          return;
        }
      }
      sessionStorage.setItem("active_workspace", workspace);
      window.dispatchEvent(new Event("workspace-change"));
      navigate(dest, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
    if (result.error) toast.error("Google sign-in failed");
  };

  const workspaceLabel =
    workspace === "neurealm"
      ? "NeuRealm"
      : tenants.find((t) => t.slug === workspace)?.name ?? workspace;

  return (
    <>
    <AuthVerificationOverlay
      open={verifying}
      authComplete={authComplete}
      userEmail={email}
      workspaceLabel={workspaceLabel}
      onFinished={() => {
        const nav = pendingNav;
        setVerifying(false);
        setPendingNav(null);
        nav?.();
      }}
    />
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your NeuGain workspace"
      footer={null}
    >
      <Button type="button" variant="outline" className="w-full h-11" onClick={onGoogle}>
        <GoogleIcon /> <span className="ml-2">Continue with Google</span>
      </Button>
      <div className="relative my-2"><div className="h-px bg-border" /><span className="absolute inset-0 -top-2.5 text-center text-xs text-muted-foreground"><span className="bg-background px-2">or</span></span></div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="workspace">Workspace</Label>
          <Select value={workspace} onValueChange={setWorkspace}>
            <SelectTrigger id="workspace" className="h-11">
              <SelectValue placeholder="Select workspace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="neurealm">NeuRealm</SelectItem>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.slug}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-11" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-indigo hover:underline">Forgot?</Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.4 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13.1-5l-6.1-5c-1.9 1.3-4.3 2.1-7 2.1-5.2 0-9.6-3.1-11.3-7.4l-6.6 5.1C9.5 39.1 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.1 5C40.7 35.5 43.5 30.2 43.5 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
  );
}