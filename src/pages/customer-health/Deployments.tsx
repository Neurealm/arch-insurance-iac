import { deployments } from "./data";
import { PageHeader } from "./primitives";
import { DeploymentCards } from "./DeploymentCardGrid";

export default function CustomerHealthDeployments() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Your Deployments"
        subtitle="Every environment running your workloads, led by the health your users actually experience."
      />
      <DeploymentCards items={deployments} />
      <p className="text-[11px] leading-snug text-slate-500">
        Infrastructure conditions underneath a deployment are reported separately from your experience. A deployment is
        only shown as degraded when telemetry demonstrates impact to your users.
      </p>
    </div>
  );
}
