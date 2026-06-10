import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function NoAccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const workspace = (location.state as { workspace?: string } | null)?.workspace ?? "this workspace";

  const signOutAndBack = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-3">
          <div className="h-12 w-12 rounded-full bg-amber-100 grid place-items-center">
            <ShieldAlert className="h-6 w-6 text-amber-700" />
          </div>
          <CardTitle>Your account isn't assigned yet</CardTitle>
          <CardDescription>
            Your sign-in succeeded, but your account hasn't been granted access to{" "}
            <strong>{workspace}</strong>. This is <em>not</em> a password problem — please contact
            your administrator to be added to the right workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full" onClick={signOutAndBack}>
            Sign out and try a different account
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Resetting your password will not change this — your administrator must assign you to a
            workspace.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
