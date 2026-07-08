import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Tenant = { id: string; name: string; slug: string; logo_url: string | null; status: boolean };

export default function TenantAuthPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await (supabase as any)
        .from("tenants")
        .select("id,name,slug,logo_url,status")
        .eq("slug", slug)
        .maybeSingle();
      if (mounted) {
        setTenant(data as Tenant | null);
        setLoading(false);
        // If a stale session belongs to a different tenant, sign it out.
        if (data) {
          const { data: sess } = await supabase.auth.getSession();
          const uid = sess.session?.user?.id;
          if (uid) {
            const { data: m } = await (supabase as any)
              .from("tenant_memberships")
              .select("id")
              .eq("user_id", uid)
              .eq("tenant_id", (data as Tenant).id)
              .maybeSingle();
            if (!m) await supabase.auth.signOut();
          }
        }
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setSubmitting(true);
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const uid = signInData.user?.id;
      const { data: m } = await (supabase as any)
        .from("tenant_memberships")
        .select("id")
        .eq("user_id", uid!)
        .eq("tenant_id", tenant.id)
        .maybeSingle();
      if (!m) {
        await supabase.auth.signOut();
        toast({
          title: "Access denied",
          description: `You are not a member of ${tenant.name}.`,
          variant: "destructive",
        });
        return;
      }
      // Check approval status — pending users cannot enter.
      const { data: prof } = await supabase
        .from("profiles")
        .select("approval_status")
        .eq("user_id", uid!)
        .maybeSingle();
      if (prof?.approval_status !== "approved") {
        await supabase.auth.signOut();
        toast({
          title: "Pending approval",
          description: "Your access request is awaiting administrator approval.",
          variant: "destructive",
        });
        return;
      }
      sessionStorage.setItem("active_tenant_slug", slug);
      navigate(`/app`);
    } catch (err: unknown) {
      toast({
        title: err instanceof Error ? err.message : "Sign-in failed",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("tenant-signup", {
        body: { email, password, fullName, tenantSlug: slug },
      });
      if (error) throw error;
      if (data && typeof data === "object" && "error" in data && data.error) {
        throw new Error(String((data as { error: string }).error));
      }
      toast({
        title: "Request submitted",
        description: "An administrator must approve your access before you can sign in.",
      });
      setMode("signin");
    } catch (err: unknown) {
      toast({
        title: err instanceof Error ? err.message : "Sign-up failed",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading...</div>;
  }
  if (!tenant) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Workspace not found</CardTitle>
            <CardDescription>The tenant URL "{slug}" does not exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  if (!tenant.status) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>{tenant.name}</CardTitle>
            <CardDescription>This workspace is currently inactive. Contact your NeuGain administrator.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-primary via-indigo to-ai p-12 text-white flex-col justify-between">
        <div className="flex items-center gap-3">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="h-10 w-10 rounded-lg object-cover bg-white/10" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-white/15 grid place-items-center">
              <Building2 className="h-5 w-5" />
            </div>
          )}
          <span className="text-2xl font-bold tracking-tight">{tenant.name}</span>
        </div>
        <div className="space-y-4 max-w-md">
          <h2 className="text-4xl font-bold leading-tight">Your secure workspace, powered by NeuGain.</h2>
          <p className="text-white/80">Access your agents, tools, and dashboards in one place.</p>
        </div>
        <div className="text-xs text-white/60">© {new Date().getFullYear()} {tenant.name} · Powered by NeuGain</div>
        <div className="absolute -bottom-40 -right-40 w-[480px] h-[480px] rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <div className="lg:hidden flex items-center gap-2 text-xl font-bold text-primary">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="h-8 w-8 rounded-md object-cover" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
              {tenant.name}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {mode === "signin" ? "Welcome back" : "Request access"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? `Sign in to your ${tenant.name} workspace`
                : `Create your ${tenant.name} account — an administrator will approve it.`}
            </p>
          </div>

          <form onSubmit={mode === "signin" ? signIn : signUp} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-11" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-11" />
            </div>
            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={submitting}>
              {submitting
                ? (mode === "signin" ? "Signing in…" : "Creating account…")
                : (mode === "signin" ? "Sign in" : "Request access")}
            </Button>
          </form>

          <div className="text-sm text-center text-muted-foreground">
            {mode === "signin" ? (
              <>Don't have an account?{" "}
                <button type="button" className="text-indigo font-semibold hover:underline" onClick={() => setMode("signup")}>
                  Request access
                </button>
              </>
            ) : (
              <>Already a member?{" "}
                <button type="button" className="text-indigo font-semibold hover:underline" onClick={() => setMode("signin")}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}