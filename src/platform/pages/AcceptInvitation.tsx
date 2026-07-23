import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AcceptInvitation() {
  const { token } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "accepting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate(`/login?next=/invitations/${token}`, { replace: true });
      return;
    }
    if (!token || status !== "idle") return;
    setStatus("accepting");
    supabase.rpc("accept_invitation", { p_token: token }).then(({ data, error }) => {
      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        setStatus("success");
        setMessage("Invitation accepted. Redirecting…");
        setTimeout(() => navigate("/platform", { replace: true }), 1200);
      }
    });
  }, [loading, user, token, status, navigate]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Accept invitation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {status === "accepting" && <p className="text-sm text-muted-foreground">Accepting invitation…</p>}
          {status === "success" && <p className="text-sm text-foreground">{message}</p>}
          {status === "error" && (
            <>
              <p className="text-sm text-destructive">{message}</p>
              <Button variant="outline" onClick={() => navigate("/platform")}>Go to workspace</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
