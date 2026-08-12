import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MailWarning, CheckCircle2, Clock, XCircle, Ban } from "lucide-react";

type State =
  | { kind: "loading" }
  | { kind: "auth_required" }
  | { kind: "success"; tenantId?: string }
  | { kind: "email_mismatch"; expected?: string }
  | { kind: "expired" }
  | { kind: "cancelled" }
  | { kind: "already_accepted" }
  | { kind: "not_found" }
  | { kind: "error"; message: string };

function classifyError(msg: string): State {
  const m = msg.toLowerCase();
  if (m.includes("expired")) return { kind: "expired" };
  if (m.includes("cancel")) return { kind: "cancelled" };
  if (m.includes("already") || m.includes("accepted")) return { kind: "already_accepted" };
  if (m.includes("email") && (m.includes("match") || m.includes("mismatch") || m.includes("differ")))
    return { kind: "email_mismatch" };
  if (m.includes("not found") || m.includes("invalid token")) return { kind: "not_found" };
  return { kind: "error", message: msg };
}

export default function AcceptInvitation() {
  const { token } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (loading) return;
    if (!user) { setState({ kind: "auth_required" }); return; }
    if (!token) { setState({ kind: "not_found" }); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("accept_invitation", { _token: token });
      if (cancelled) return;
      if (error) setState(classifyError(error.message));
      else setState({ kind: "success", tenantId: (data as any)?.tenant_id });
    })();
    return () => { cancelled = true; };
  }, [loading, user, token]);

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Accept invitation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {state.kind === "loading" && (
            <Row icon={<Loader2 className="h-5 w-5 animate-spin" />} title="Verifying invitation…"
              description="One moment while we confirm your access." />
          )}
          {state.kind === "auth_required" && (
            <>
              <Row icon={<MailWarning className="h-5 w-5" />} title="Sign in required"
                description="Sign in with the email address the invitation was sent to." />
              <Button onClick={() => navigate(`/login?next=/invitations/${token}`, { replace: true })}>Sign in</Button>
            </>
          )}
          {state.kind === "success" && (
            <>
              <Row icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} title="Invitation accepted"
                description="Your workspace access has been granted." />
              <Button onClick={async () => {
                try { window.localStorage.setItem("platform:activeTenant", state.tenantId ?? ""); } catch {}
                navigate("/platform", { replace: true });
              }}>Go to workspace</Button>
            </>
          )}
          {state.kind === "email_mismatch" && (
            <Fail icon={<MailWarning className="h-5 w-5" />} title="Email doesn't match"
              description="The signed-in account doesn't match the invited email address. Sign out and sign in with the invited email."
              onGo={() => navigate("/")} />
          )}
          {state.kind === "expired" && (
            <Fail icon={<Clock className="h-5 w-5" />} title="Invitation expired"
              description="Ask your administrator to resend the invitation." onGo={() => navigate("/app")} />
          )}
          {state.kind === "cancelled" && (
            <Fail icon={<Ban className="h-5 w-5" />} title="Invitation cancelled"
              description="This invitation has been cancelled by an administrator." onGo={() => navigate("/app")} />
          )}
          {state.kind === "already_accepted" && (
            <Fail icon={<CheckCircle2 className="h-5 w-5" />} title="Already accepted"
              description="You've already joined this workspace." onGo={() => navigate("/platform")} label="Go to workspace" />
          )}
          {state.kind === "not_found" && (
            <Fail icon={<XCircle className="h-5 w-5" />} title="Invitation not found"
              description="The invitation link is invalid. Double-check the URL." onGo={() => navigate("/app")} />
          )}
          {state.kind === "error" && (
            <Fail icon={<XCircle className="h-5 w-5" />} title="Something went wrong"
              description={state.message} onGo={() => navigate("/app")} />
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function Row({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground" aria-hidden="true">{icon}</div>
      <div><div className="text-sm font-medium text-foreground">{title}</div>
        <p className="text-xs text-muted-foreground">{description}</p></div>
    </div>
  );
}
function Fail({ icon, title, description, onGo, label = "Back" }: {
  icon: React.ReactNode; title: string; description: string; onGo: () => void; label?: string;
}) {
  return (<><Row icon={icon} title={title} description={description} /><Button variant="outline" onClick={onGo}>{label}</Button></>);
}
