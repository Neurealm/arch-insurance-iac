/**
 * Object-Oriented Runbook Builder
 * Route: /runops/runbooks/:runbookId/builder
 *
 * A narrative, demo-friendly builder that shows how a governed SRE change is
 * assembled from reusable domain objects — Resource → Operation → Plan → Run.
 *
 * The page is a story in six acts. Each step swaps the center canvas so the
 * viewer can *see* the object model come together: services compose resources,
 * resources expose typed methods, operations bind parameters, and the plan is
 * generated from those objects — not hand-written scripts.
 */

import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Cloud, Database, Server,
  ShieldCheck, Sparkles, Play, FileCheck2, Info, Users, MapPin, Boxes,
  Code2, GitBranch, Lock, Layers, Zap, Activity, Copy, Package, Workflow,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type StepId = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS: {
  id: StepId; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>;
  story: string;
}[] = [
  { id: 1, title: "Bind Business Service", subtitle: "E-Commerce Platform",     icon: Boxes,    story: "Every change begins with the business object it serves — not an instance ID." },
  { id: 2, title: "Compose Resources",     subtitle: "3 tiers · 7 typed assets", icon: Layers,   story: "The service is composed of typed Resource objects with declared relationships." },
  { id: 3, title: "Select Target Object",  subtitle: "EC2Instance · EBSVolume",  icon: Server,   story: "Pick the instance & volume. Their class exposes the safe methods available." },
  { id: 4, title: "Instantiate Operation", subtitle: "ExpandVolumeOperation",    icon: Workflow, story: "The operation is an object — parameters, invariants, and rollback in one place." },
  { id: 5, title: "Generate Plan",         subtitle: "Python · CLI · IaC",       icon: Code2,    story: "Same object model, four renderings. The code is derived, not written." },
  { id: 6, title: "Validate & Execute",    subtitle: "Approvals · Digital Twin", icon: ShieldCheck, story: "Twin simulates. Governance approves. Executor runs. All against the same object." },
];

const RUNBOOK_CODE = `from runops import Service, ExpandVolumeOperation

# Objects — not scripts. Composed, typed, reusable.
service = Service.load("ecom-platform", env="prod", region="us-east-1")
instance = service.web_tier.instance("i-0ab12c34d56ef7890")
volume   = instance.attached_volume("/dev/xvdf")

op = ExpandVolumeOperation(
    target      = volume,
    new_size_gb = 300,
    grow_fs     = True,          # invariant: FS must match block device
    snapshot    = True,          # rollback contract
)

# Governance is a first-class attribute of the object
op.require_approval(from_="platform-team")
op.dry_run().assert_no_downtime()

# Same object → any renderer
op.execute()                     # boto3
op.render("cli")                 # aws ec2 modify-volume ...
op.render("terraform")           # aws_ebs_volume.size = 300
op.render("cloudformation")      # Resources.WebVolume.Size: 300`;

const CLI_CODE = `# Rendered from the same ExpandVolumeOperation object
aws ec2 modify-volume \\
  --volume-id vol-0f1234567890abcd0 \\
  --size 300 \\
  --region us-east-1

aws ec2 wait volume-in-use --volume-ids vol-0f1234567890abcd0
ssh ec2-user@web-01 "sudo growpart /dev/xvdf 1 && sudo xfs_growfs /data"`;

const TF_CODE = `# terraform/ebs.tf — derived from op.render("terraform")
resource "aws_ebs_volume" "web_data" {
  availability_zone = "us-east-1a"
  size              = 300           # was 200
  type              = "gp3"
  encrypted         = true
  tags = {
    Service = "ecom-platform"
    Owner   = "platform-team"
  }
}`;

const CF_CODE = `# cloudformation/web.yaml — derived from op.render("cloudformation")
Resources:
  WebDataVolume:
    Type: AWS::EC2::Volume
    Properties:
      Size: 300                    # was 200
      VolumeType: gp3
      Encrypted: true
      AvailabilityZone: us-east-1a`;

const CLASS_MODEL = [
  {
    name: "Resource", kind: "abstract", color: "indigo",
    props: ["id: string", "tags: Map", "owner: Team"],
    methods: ["snapshot()", "audit()", "cost()"],
  },
  {
    name: "EC2Instance", kind: "class", color: "indigo", extends: "Resource",
    props: ["type: t3.large", "az: us-east-1a", "asg: Web-ASG"],
    methods: ["reboot()", "attached_volume(dev)", "drain()"],
  },
  {
    name: "EBSVolume", kind: "class", color: "healthy", extends: "Resource",
    props: ["size_gb: 200", "type: gp3", "device: /dev/xvdf"],
    methods: ["modify_size(n)", "grow_fs()", "snapshot()"],
    highlight: true,
  },
  {
    name: "ExpandVolumeOperation", kind: "operation", color: "crimson",
    props: ["target: EBSVolume", "new_size_gb: 300", "snapshot: true"],
    methods: ["dry_run()", "execute()", "rollback()", "render(fmt)"],
  },
];

const RISK_FACTORS = [
  { name: "Volume Modification Failure",    impact: "Low",    tone: "text-status-healthy" },
  { name: "Filesystem Resize Failure",      impact: "Low",    tone: "text-status-healthy" },
  { name: "Space Exhaustion During Resize", impact: "Medium", tone: "text-status-warning" },
  { name: "AWS API Throttling",             impact: "Low",    tone: "text-status-healthy" },
  { name: "Snapshot Failure (if added)",    impact: "Low",    tone: "text-status-healthy" },
];

const RESOURCES_IN_SCOPE = [
  { icon: Server,   label: "EC2Instance",  id: "i-0ab12c34d56ef7890", tone: "indigo" },
  { icon: Database, label: "EBSVolume",    id: "vol-0f1234567890abcd0", tone: "healthy" },
  { icon: Cloud,    label: "AutoScalingGroup", id: "Web-ASG", tone: "muted" },
];

export default function RunbookObjectBuilder() {
  const navigate = useNavigate();
  const { runbookId } = useParams<{ runbookId: string }>();
  const [step, setStep] = useState<StepId>(1);
  const [codeTab, setCodeTab] = useState("python");

  const currentStep = useMemo(() => STEPS.find((s) => s.id === step)!, [step]);
  const progressPct = (step / 6) * 100;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-background">
      {/* Header bar */}
      <div className="border-b border-border bg-gradient-to-r from-card via-card to-accent/40 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/runops/runbooks/${runbookId ?? "RB-0042"}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Runbook
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/runops/runbooks" className="hover:text-foreground">Runbooks</Link>
              <span>›</span>
              <span>Storage Operations</span>
              <span>›</span>
              <span className="text-foreground font-medium">Expand EBS Volume (Zero Downtime)</span>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo to-primary grid place-items-center shrink-0">
                <Boxes className="h-4 w-4 text-indigo-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Object-Oriented Runbook Builder</h1>
                <p className="text-[11px] text-muted-foreground -mt-0.5">
                  Compose changes from typed domain objects · reusable, governed, twin-simulated
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-status-healthy/40 bg-status-healthy/10 text-status-healthy">
              <Activity className="h-3 w-3" /> Twin Ready
            </Badge>
            <Button variant="outline" size="sm"><CheckCircle2 className="h-4 w-4 mr-1" /> Validate</Button>
            <Button variant="outline" size="sm"><FileCheck2 className="h-4 w-4 mr-1" /> Dry Run</Button>
            <Button size="sm" className="bg-crimson hover:bg-crimson/90 text-crimson-foreground shadow-md">
              <Play className="h-4 w-4 mr-1" /> Execute Plan
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo via-primary to-crimson transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[280px_1fr_320px] gap-0">
        {/* Left rail — wizard steps + operation summary */}
        <aside className="border-r border-border bg-card/40 p-4 space-y-4 overflow-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
            Story · Act {step} of 6
          </div>
          <ol className="space-y-1.5">
            {STEPS.map((s) => {
              const done = s.id < step;
              const active = s.id === step;
              const StepIcon = s.icon;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setStep(s.id)}
                    className={cn(
                      "w-full text-left rounded-lg p-2.5 flex items-start gap-2.5 border transition-all",
                      active ? "bg-gradient-to-r from-indigo/10 to-transparent border-indigo/40 shadow-sm"
                             : done ? "bg-status-healthy/5 border-transparent hover:bg-secondary/60"
                             : "border-transparent hover:bg-secondary/60"
                    )}
                  >
                    <div className={cn(
                      "h-7 w-7 rounded-lg grid place-items-center shrink-0 transition-colors",
                      active ? "bg-indigo text-indigo-foreground shadow-sm"
                             : done ? "bg-status-healthy/15 text-status-healthy"
                             : "bg-secondary text-muted-foreground"
                    )}>
                      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <StepIcon className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn(
                        "text-[12px] font-semibold leading-tight",
                        active && "text-indigo"
                      )}>{s.title}</div>
                      <div className="text-[10.5px] text-muted-foreground mt-0.5 truncate">{s.subtitle}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="rounded-lg border border-border bg-gradient-to-br from-secondary/60 to-secondary/20 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              <Package className="h-3 w-3" /> Operation Object
            </div>
            <dl className="text-[11.5px] space-y-1.5 font-mono">
              {[
                ["class",       "ExpandVolume"],
                ["target",      "vol-0f12…abcd0"],
                ["current",     "200 GiB"],
                ["new_size_gb", "300"],
                ["snapshot",    "true"],
                ["grow_fs",     "true"],
                ["downtime",    "0s"],
                ["eta",         "~2 min"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-right text-foreground">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-2 pt-1 font-sans">
                <dt className="text-muted-foreground">impact</dt>
                <dd><Badge variant="outline" className="bg-status-healthy/10 text-status-healthy border-status-healthy/30">Low</Badge></dd>
              </div>
            </dl>
          </div>
        </aside>

        {/* Center — narrative canvas */}
        <main className="overflow-auto p-6 space-y-4 min-w-0">
          {/* Narrative headline */}
          <div className="rounded-xl border border-indigo/20 bg-gradient-to-r from-indigo/5 via-transparent to-crimson/5 p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo/10 grid place-items-center shrink-0">
              <currentStep.icon className="h-5 w-5 text-indigo" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo">Act {step}</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{currentStep.title}</span>
              </div>
              <p className="text-sm text-foreground mt-1 leading-snug">{currentStep.story}</p>
            </div>
          </div>

          {/* Context chips */}
          <div className="grid grid-cols-4 gap-3">
            <ContextChip icon={Users} label="Business Service" value="E-Commerce Platform" tone="Healthy" />
            <ContextChip icon={Cloud} label="Environment" value="Production" />
            <ContextChip icon={MapPin} label="Region" value="us-east-1" hint="aws" />
            <ContextChip icon={Users} label="Owner" value="Platform Team" />
          </div>

          {/* Step-specific canvas */}
          {step <= 3 && <ArchitectureCanvas step={step} />}
          {step === 4 && <ClassModelCanvas />}
          {(step === 5 || step === 6) && (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_320px]">
                  <div className="border-r border-border">
                    <Tabs value={codeTab} onValueChange={setCodeTab}>
                      <div className="flex items-center justify-between px-3 pt-3">
                        <TabsList>
                          <TabsTrigger value="python"><Code2 className="h-3.5 w-3.5 mr-1" />Python</TabsTrigger>
                          <TabsTrigger value="cli">CLI</TabsTrigger>
                          <TabsTrigger value="tf">Terraform</TabsTrigger>
                          <TabsTrigger value="cf">CloudFormation</TabsTrigger>
                        </TabsList>
                        <Button variant="ghost" size="sm" className="text-[11px] h-7">
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                      </div>
                      <TabsContent value="python" className="px-3 pb-3 mt-2">
                        <CodeBlock code={RUNBOOK_CODE} />
                      </TabsContent>
                      <TabsContent value="cli" className="px-3 pb-3 mt-2">
                        <CodeBlock code={CLI_CODE} />
                      </TabsContent>
                      <TabsContent value="tf" className="px-3 pb-3 mt-2">
                        <CodeBlock code={TF_CODE} />
                      </TabsContent>
                      <TabsContent value="cf" className="px-3 pb-3 mt-2">
                        <CodeBlock code={CF_CODE} />
                      </TabsContent>
                    </Tabs>
                  </div>

                  <aside className="p-4 space-y-3 bg-gradient-to-b from-accent/30 to-transparent">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-ai" />
                      <span className="text-sm font-semibold">AI Code Assistant</span>
                      <Badge variant="outline" className="text-[10px] border-ai/30 bg-ai/10 text-ai">Preview</Badge>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      One <span className="font-mono text-foreground">ExpandVolumeOperation</span> object
                      renders to four formats — same invariants, same rollback contract.
                    </p>
                    <ul className="space-y-1.5">
                      {[
                        "Volume modification is non-disruptive",
                        "Instance remains running",
                        "Filesystem is grown online",
                        "Snapshot committed before mutation",
                      ].map((r) => (
                        <li key={r} className="flex items-start gap-2 text-[12px]">
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-status-healthy shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                    <div className="rounded-md border border-ai/20 bg-ai-soft p-2.5 text-[11.5px]">
                      <div className="font-semibold mb-1 text-ai flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Suggestion
                      </div>
                      <span className="text-foreground/80">
                        Bind the operation to change window <span className="font-mono">CW-2076-11</span> for automatic freeze compliance.
                      </span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      <GitBranch className="h-3.5 w-3.5 mr-1" /> Save as Reusable Op
                    </Button>
                  </aside>
                </div>

                {/* Gate strip */}
                <div className="grid grid-cols-5 border-t border-border text-xs">
                  {[
                    ["Syntax Check", "Passed", true],
                    ["Security Scan", "Passed", true],
                    ["Best Practices", "Passed", true],
                    ["Cost Impact", "+$0.02/mo", false],
                    ["Rollback Ready", "Yes", true],
                  ].map(([k, v, ok], i) => (
                    <div key={k as string} className={cn("p-3", i < 4 && "border-r border-border")}>
                      <div className="text-muted-foreground text-[10.5px] uppercase tracking-wider">{k}</div>
                      <div className={cn(
                        "font-semibold mt-1 flex items-center gap-1",
                        ok ? "text-status-healthy" : "text-foreground"
                      )}>
                        {ok && <CheckCircle2 className="h-3 w-3" />}
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 6 && <ExecutionTimeline />}

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              disabled={step === 1}
              onClick={() => setStep((s) => (Math.max(1, s - 1) as StepId))}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button
              disabled={step === 6}
              onClick={() => setStep((s) => (Math.min(6, s + 1) as StepId))}
              className="bg-indigo hover:bg-indigo/90 text-indigo-foreground"
            >
              Next: {STEPS[Math.min(step, 5)].title} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </main>

        {/* Right rail — risk twin */}
        <aside className="border-l border-border bg-card/40 p-4 space-y-4 overflow-auto">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-indigo" />
            <div className="text-sm font-semibold">Digital Twin & Risk</div>
          </div>

          <Tabs defaultValue="risk">
            <TabsList className="w-full">
              <TabsTrigger value="risk" className="flex-1">Risk</TabsTrigger>
              <TabsTrigger value="sim" className="flex-1">Simulation</TabsTrigger>
              <TabsTrigger value="gov" className="flex-1">Gov</TabsTrigger>
            </TabsList>
            <TabsContent value="risk" className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <RiskGauge value={23} />
                <div>
                  <div className="text-lg font-bold text-status-healthy leading-tight">Low Risk</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Low potential blast radius.
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Risk Factors
                </div>
                <ul className="space-y-1">
                  {RISK_FACTORS.map((r) => (
                    <li key={r.name} className="flex justify-between items-center text-[11.5px] px-2 py-1.5 rounded hover:bg-secondary/60">
                      <span className="truncate pr-2">{r.name}</span>
                      <span className={cn("inline-flex items-center gap-1 shrink-0", r.tone)}>
                        <Circle className="h-2 w-2 fill-current" />
                        {r.impact}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-border p-3 bg-gradient-to-br from-indigo/5 to-transparent">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Blast Radius
                </div>
                <div className="flex items-center justify-around text-[11px]">
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo">1</div>
                    <div className="text-muted-foreground text-[10px]">Direct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-muted-foreground text-[10px]">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-ai">2</div>
                    <div className="text-muted-foreground text-[10px]">Indirect</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Resources in Scope
                </div>
                <ul className="space-y-1.5">
                  {RESOURCES_IN_SCOPE.map((r) => (
                    <li key={r.label} className="flex items-center gap-2 rounded-md border border-border p-2 bg-card hover:border-indigo/40 transition-colors">
                      <div className={cn(
                        "h-7 w-7 rounded-md grid place-items-center shrink-0",
                        r.tone === "indigo"   && "bg-indigo/10 text-indigo",
                        r.tone === "healthy"  && "bg-status-healthy/10 text-status-healthy",
                        r.tone === "muted"    && "bg-secondary text-muted-foreground",
                      )}>
                        <r.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-mono font-medium truncate">{r.label}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{r.id}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="sim" className="mt-3 space-y-2">
              <div className="rounded-lg border border-border p-3 bg-card">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Synthetic Journeys
                </div>
                {[
                  ["Checkout",   "No degradation"],
                  ["Cart",       "No degradation"],
                  ["Search",     "No degradation"],
                  ["Product PDP", "No degradation"],
                ].map(([j, r]) => (
                  <div key={j} className="flex justify-between text-[11.5px] py-1">
                    <span>{j}</span>
                    <span className="text-status-healthy inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {r}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Twin re-runs journeys pre / mid / post change.
              </div>
            </TabsContent>
            <TabsContent value="gov" className="mt-3 space-y-2">
              {[
                { label: "Change Window", value: "CW-2076-11", icon: Lock },
                { label: "Approver", value: "platform-team", icon: Users },
                { label: "Policy", value: "storage.expand.v3", icon: ShieldCheck },
                { label: "Audit Trail", value: "immutable", icon: FileCheck2 },
              ].map((g) => (
                <div key={g.label} className="flex items-center gap-2 rounded-md border border-border p-2 bg-card">
                  <g.icon className="h-3.5 w-3.5 text-indigo shrink-0" />
                  <div className="text-[11px] text-muted-foreground">{g.label}</div>
                  <div className="text-[11.5px] font-medium ml-auto">{g.value}</div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      {/* Environment footer */}
      <div className="border-t border-border bg-card px-6 py-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-healthy animate-pulse" />
          Environment
        </span>
        <span className="font-semibold text-status-healthy">Production</span>
        <span className="text-muted-foreground/70">·</span>
        <span>Governed by <span className="font-mono">storage.expand.v3</span></span>
        <span className="ml-auto">Act {step} of 6 · {currentStep.title}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────── Sub-components ────────────────────────────── */

function ContextChip({
  icon: Icon, label, value, tone, hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; tone?: string; hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3 hover:border-indigo/40 transition-colors">
      <div className="h-9 w-9 rounded-md bg-gradient-to-br from-indigo/10 to-indigo/5 grid place-items-center">
        <Icon className="h-4 w-4 text-indigo" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          {hint && <span className="text-[9.5px] font-semibold text-indigo">{hint}</span>}
          {label}
        </div>
        <div className="text-sm font-semibold truncate flex items-center gap-2">
          {value}
          {tone && (
            <Badge variant="outline" className="text-[9.5px] bg-status-healthy/10 text-status-healthy border-status-healthy/30 h-4 px-1">
              {tone}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function ArchitectureCanvas({ step }: { step: StepId }) {
  const highlight = step === 3;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Composition · Service → Resources
          </div>
          <Badge variant="outline" className="text-[10px]">7 assets · 3 tiers</Badge>
        </div>
        <div className="rounded-lg border border-dashed border-border bg-gradient-to-br from-secondary/30 to-transparent p-5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Boxes className="h-3 w-3" /> Service.ecom-platform
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-between text-[12px]">
            <Node icon={Cloud} label="Internet" />
            <Arrow />
            <Node icon={Server} label="ALB" sub="prod-alb" />
            <Arrow />
            <div className="flex flex-col gap-2">
              <Node icon={Server} label="WebServer-01" sub="i-0ab12…7890" active={highlight} />
              <Node icon={Server} label="WebServer-02" sub="i-0bc23…8901" />
            </div>
            <Arrow />
            <Node icon={Database} label="EBSVolume" sub="vol-0f12… · 200 GiB" tone="crimson" active={highlight} />
            <Arrow />
            <div className="flex flex-col gap-2">
              <Node icon={Database} label="Aurora" sub="mysql · primary" />
              <Node icon={Database} label="ElastiCache" sub="redis · cluster" />
            </div>
          </div>
          {highlight && (
            <div className="mt-4 rounded-md border border-crimson/30 bg-crimson-soft p-2.5 text-[11.5px] flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-crimson" />
              <span>Target object bound: <span className="font-mono font-semibold">EBSVolume vol-0f12…abcd0</span> attached to <span className="font-mono">i-0ab12…7890</span></span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ClassModelCanvas() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Object Model · Types the Operation binds against
          </div>
          <Badge variant="outline" className="text-[10px] border-crimson/30 bg-crimson-soft text-crimson">
            ExpandVolumeOperation
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {CLASS_MODEL.map((c) => (
            <div
              key={c.name}
              className={cn(
                "rounded-lg border p-3 bg-card transition-all",
                c.highlight && "ring-2 ring-crimson/40 border-crimson/40",
                c.color === "crimson" && "bg-gradient-to-br from-crimson-soft to-transparent border-crimson/30",
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                    c.kind === "abstract"  && "bg-muted text-muted-foreground",
                    c.kind === "class"     && "bg-indigo/10 text-indigo",
                    c.kind === "operation" && "bg-crimson/10 text-crimson",
                  )}>
                    {c.kind}
                  </span>
                  <span className="font-mono text-sm font-bold">{c.name}</span>
                </div>
                {c.extends && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ⤴ {c.extends}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 font-mono text-[11px]">
                {c.props.map((p) => (
                  <div key={p} className="text-muted-foreground">
                    <span className="text-status-info">·</span> {p}
                  </div>
                ))}
                <div className="pt-1.5 mt-1.5 border-t border-border/60">
                  {c.methods.map((m) => (
                    <div key={m} className="text-foreground/90">
                      <span className="text-status-healthy">ƒ</span> {m}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-md border border-indigo/20 bg-indigo/5 p-2.5 text-[11.5px] flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-indigo mt-0.5 shrink-0" />
          <span>
            <span className="font-semibold">Encapsulation:</span> The operation carries its own invariants,
            approvals, and rollback. Any renderer (Python, CLI, Terraform, CloudFormation) is a projection
            of the same object — the story doesn't drift between formats.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-slate-950 text-slate-100 text-[12px] rounded-md p-3 overflow-auto font-mono leading-relaxed max-h-[380px]">
      {code.split("\n").map((line, i) => {
        const isComment = line.trimStart().startsWith("#");
        return (
          <div key={i} className="flex gap-3">
            <span className="text-slate-600 select-none w-6 text-right shrink-0">{i + 1}</span>
            <span className={cn(isComment && "text-slate-500 italic")}>{line || " "}</span>
          </div>
        );
      })}
    </pre>
  );
}

function ExecutionTimeline() {
  const events = [
    { t: "T+0s",    label: "op.dry_run()",           status: "done", note: "invariants passed" },
    { t: "T+2s",    label: "snapshot committed",     status: "done", note: "snap-0a1b2c3d" },
    { t: "T+4s",    label: "ec2.modify_volume(300)", status: "done", note: "API accepted" },
    { t: "T+72s",   label: "volume optimizing",      status: "active", note: "AWS async" },
    { t: "T+118s",  label: "grow_fs on /dev/xvdf",   status: "pending", note: "xfs_growfs" },
    { t: "T+120s",  label: "op.assert_health()",     status: "pending", note: "twin verify" },
  ];
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Execution Timeline · Live
          </div>
          <Badge variant="outline" className="text-[10px] border-status-healthy/30 bg-status-healthy/10 text-status-healthy gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-status-healthy animate-pulse" />
            Running
          </Badge>
        </div>
        <ol className="relative border-l-2 border-border ml-2 space-y-3">
          {events.map((e) => (
            <li key={e.label} className="ml-4">
              <span className={cn(
                "absolute -left-[7px] h-3 w-3 rounded-full border-2 border-background",
                e.status === "done"    && "bg-status-healthy",
                e.status === "active"  && "bg-indigo animate-pulse",
                e.status === "pending" && "bg-secondary",
              )} />
              <div className="flex items-baseline gap-3">
                <span className="text-[10.5px] font-mono text-muted-foreground w-14 shrink-0">{e.t}</span>
                <span className="text-[12.5px] font-mono font-medium">{e.label}</span>
                <span className="text-[11px] text-muted-foreground ml-auto">{e.note}</span>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function Node({
  icon: Icon, label, sub, active, tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; sub?: string; active?: boolean; tone?: "indigo" | "crimson";
}) {
  return (
    <div className={cn(
      "rounded-lg border bg-card px-3 py-2 min-w-[120px] transition-all",
      active ? "border-crimson ring-2 ring-crimson/30 shadow-md" :
      tone === "crimson" ? "border-crimson/40 bg-crimson-soft" :
      tone === "indigo" ? "border-indigo/40 bg-indigo/5" : "border-border"
    )}>
      <div className="flex items-center gap-1.5">
        <Icon className={cn(
          "h-3.5 w-3.5",
          tone === "crimson" ? "text-crimson" : "text-indigo",
        )} />
        <div className="text-[12px] font-semibold">{label}</div>
      </div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{sub}</div>}
    </div>
  );
}

function Arrow() {
  return <ArrowRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />;
}

function RiskGauge({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const stroke = pct < 34 ? "hsl(var(--status-healthy))" : pct < 67 ? "hsl(var(--status-warning))" : "hsl(var(--status-critical))";
  const c = 2 * Math.PI * 30;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
      <circle cx="40" cy="40" r="30" stroke="hsl(var(--border))" strokeWidth="8" fill="none" />
      <circle
        cx="40" cy="40" r="30" stroke={stroke} strokeWidth="8" fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
        strokeLinecap="round" transform="rotate(-90 40 40)"
      />
      <text x="40" y="44" textAnchor="middle" className="fill-foreground" fontSize="16" fontWeight="700">
        {value}
      </text>
      <text x="40" y="58" textAnchor="middle" className="fill-muted-foreground" fontSize="8">/100</text>
    </svg>
  );
}
