import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";

export default function CommercialAdministration() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Administration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administrative controls for the Commercial Digital Twin module.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Module Listening</CardTitle>
          <CardDescription>
            Manage narration and audio listening configuration for this module.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <Headphones className="mr-2 h-4 w-4" />
            Module Listening
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
