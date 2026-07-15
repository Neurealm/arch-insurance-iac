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
  DollarSign, LifeBuoy, TrendingUp, TrendingDown, AlertTriangle, Briefcase, Cpu, Gauge,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const STEPS: {
  id: StepId; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>;
  story: string;
}[] = [
  { id: 1, title: "Bind Business Service", subtitle: "E-Commerce Platform",     icon: Boxes,       story: "Every change begins with the business object it serves — not an instance ID." },
  { id: 2, title: "Compose Resources",     subtitle: "3 tiers · 7 typed assets", icon: Layers,      story: "The service is composed of typed Resource objects with declared relationships." },
  { id: 3, title: "Select Target Object",  subtitle: "EC2Instance · EBSVolume",  icon: Server,      story: "Pick the instance & volume. Their class exposes the safe methods available." },
  { id: 4, title: "Instantiate Operation", subtitle: "ExpandVolumeOperation",    icon: Workflow,    story: "The operation is an object — parameters, invariants, and rollback in one place." },
  { id: 5, title: "Generate Plan",         subtitle: "Python · CLI · IaC",       icon: Code2,       story: "Same object model, four renderings. The code is derived, not written." },
  { id: 6, title: "Model Cross-Domain Impact", subtitle: "Business · Tech · SRE · Support · FinOps · Cyber", icon: Activity, story: "Before we execute, project the operation into every stakeholder domain and quantify the delta." },
  { id: 7, title: "Validate & Execute",    subtitle: "Approvals · Digital Twin", icon: ShieldCheck, story: "Twin simulates. Governance approves. Executor runs. All against the same object." },
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
  const progressPct = (step / 7) * 100;

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

/* ---------- Isometric 3D architecture (Cloudcraft-style) ---------- */

const ISO_COS = 0.8660254; // cos(30°)
const ISO_SIN = 0.5;       // sin(30°)
const ISO_U = 22;          // pixels per grid unit

type IsoColor = { top: string; right: string; left: string; edge: string; glow?: string };

const ISO_PALETTE: Record<string, IsoColor> = {
  internet: { top: "#94a3b8", right: "#64748b", left: "#475569", edge: "#e2e8f0" },
  alb:      { top: "#a78bfa", right: "#7c3aed", left: "#5b21b6", edge: "#ede9fe" },
  ec2:      { top: "#fbbf24", right: "#f59e0b", left: "#b45309", edge: "#fef3c7" },
  ebs:      { top: "#f87171", right: "#dc2626", left: "#991b1b", edge: "#fee2e2", glow: "#ef4444" },
  aurora:   { top: "#60a5fa", right: "#2563eb", left: "#1e3a8a", edge: "#dbeafe" },
  redis:    { top: "#fb7185", right: "#e11d48", left: "#881337", edge: "#ffe4e6" },
};

function isoProject(x: number, y: number, z: number, cx: number, cy: number, u = ISO_U) {
  return { sx: cx + (x - y) * u * ISO_COS, sy: cy + (x + y) * u * ISO_SIN - z * u };
}

function IsoBlock({
  gx, gy, w, d, h, cx, cy, color, label, sub, glyph, active, u = ISO_U,
}: {
  gx: number; gy: number; w: number; d: number; h: number;
  cx: number; cy: number; color: IsoColor;
  label: string; sub?: string; glyph?: string; active?: boolean; u?: number;
}) {
  const p = (x: number, y: number, z: number) => isoProject(gx + x, gy + y, z, cx, cy, u);
  // corners
  const A = p(0, 0, 0), B = p(w, 0, 0), C = p(w, d, 0), D = p(0, d, 0);
  const E = p(0, 0, h), F = p(w, 0, h), G = p(w, d, h), H = p(0, d, h);
  const pts = (arr: { sx: number; sy: number }[]) => arr.map((q) => `${q.sx},${q.sy}`).join(" ");
  // label anchor = top-center
  const topCenter = p(w / 2, d / 2, h);
  // ground shadow (project base to z=0, softened)
  const shadow = `${A.sx},${A.sy + 4} ${B.sx},${B.sy + 4} ${C.sx},${C.sy + 4} ${D.sx},${D.sy + 4}`;
  return (
    <g className={cn("iso-block", active && "iso-block--active")}>
      <polygon points={shadow} fill="#000" opacity="0.18" filter="url(#isoShadowBlur)" />
      {/* left/front face (y = d) */}
      <polygon points={pts([D, C, G, H])} fill={color.left} stroke={color.edge} strokeWidth="0.6" strokeOpacity="0.5" />
      {/* right face (x = w) */}
      <polygon points={pts([B, C, G, F])} fill={color.right} stroke={color.edge} strokeWidth="0.6" strokeOpacity="0.5" />
      {/* top face */}
      <polygon points={pts([E, F, G, H])} fill={color.top} stroke={color.edge} strokeWidth="0.7" strokeOpacity="0.7" />
      {active && color.glow && (
        <polygon points={pts([E, F, G, H])} fill="none" stroke={color.glow} strokeWidth="2.2" opacity="0.9">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
        </polygon>
      )}
      {glyph && (
        <text x={topCenter.sx} y={topCenter.sy + 4} textAnchor="middle"
              fontSize="14" fontWeight="800" fill="#fff" opacity="0.92"
              style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.35)" }}>
          {glyph}
        </text>
      )}
      {/* label above block */}
      <g transform={`translate(${topCenter.sx}, ${topCenter.sy - h * u * 0.15 - 18})`}>
        <rect x={-((label.length * 5.4 + 12) / 2)} y="-9" rx="4" ry="4"
              width={label.length * 5.4 + 12} height={sub ? 26 : 16}
              fill="rgba(15, 23, 42, 0.88)" stroke={active ? color.glow ?? color.top : color.top}
              strokeWidth={active ? 1.4 : 0.8} strokeOpacity="0.7" />
        <text x="0" y="2" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#f8fafc"
              letterSpacing="0.02em">{label}</text>
        {sub && (
          <text x="0" y="13" textAnchor="middle" fontSize="7.5" fill="#94a3b8"
                fontFamily="ui-monospace, monospace">{sub}</text>
        )}
      </g>
    </g>
  );
}

function IsoWire({
  from, to, cx, cy, dashed, animated, color = "#64748b",
}: {
  from: [number, number, number]; to: [number, number, number];
  cx: number; cy: number; dashed?: boolean; animated?: boolean; color?: string;
}) {
  const a = isoProject(from[0], from[1], from[2], cx, cy);
  const b = isoProject(to[0], to[1], to[2], cx, cy);
  const mx = (a.sx + b.sx) / 2;
  const my = Math.min(a.sy, b.sy) - 14;
  return (
    <g>
      <path d={`M ${a.sx} ${a.sy} Q ${mx} ${my} ${b.sx} ${b.sy}`}
            fill="none" stroke={color} strokeWidth="1.4"
            strokeDasharray={dashed ? "4 3" : undefined} opacity="0.75" />
      {animated && (
        <circle r="2.4" fill={color}>
          <animateMotion dur="2.2s" repeatCount="indefinite"
            path={`M ${a.sx} ${a.sy} Q ${mx} ${my} ${b.sx} ${b.sy}`} />
        </circle>
      )}
    </g>
  );
}

function ArchitectureCanvas({ step }: { step: StepId }) {
  const highlight = step === 3;
  const cx = 460, cy = 210;

  // grid coords: (gx, gy) — increasing gx pushes down-right; gy down-left.
  // Layout tuned so items read roughly left→right on screen.
  const blocks = [
    { key: "internet", gx: -8,  gy: -2, w: 2.4, d: 2.4, h: 1.2, color: ISO_PALETTE.internet, label: "Internet",       sub: "0.0.0.0/0",           glyph: "☁" },
    { key: "alb",      gx: -4,  gy: -1, w: 2.2, d: 2.2, h: 1.4, color: ISO_PALETTE.alb,      label: "ALB",            sub: "prod-alb",            glyph: "⇄" },
    { key: "ec2a",     gx:  0,  gy: -2.5, w: 2, d: 2, h: 1.8, color: ISO_PALETTE.ec2,      label: "WebServer-01",   sub: "i-0ab12…7890",        glyph: "▶", active: highlight },
    { key: "ec2b",     gx:  0,  gy:  0.8, w: 2, d: 2, h: 1.8, color: ISO_PALETTE.ec2,      label: "WebServer-02",   sub: "i-0bc23…8901",        glyph: "▶" },
    { key: "ebs",      gx:  3.6, gy: -0.9, w: 1.8, d: 1.8, h: 0.9, color: ISO_PALETTE.ebs,   label: "EBSVolume",      sub: "vol-0f12 · 200 GiB",  glyph: "◈", active: highlight },
    { key: "aurora",   gx:  7,  gy: -2.2, w: 2.2, d: 2.2, h: 2.0, color: ISO_PALETTE.aurora,label: "Aurora",         sub: "mysql · primary",     glyph: "◉" },
    { key: "redis",    gx:  7,  gy:  1,   w: 2.2, d: 2.2, h: 1.6, color: ISO_PALETTE.redis, label: "ElastiCache",    sub: "redis · cluster",     glyph: "◎" },
  ];

  // Wires: source → target (grid-coord midpoints, elevated slightly)
  const wires: Array<{ from: [number, number, number]; to: [number, number, number]; animated?: boolean; color?: string }> = [
    { from: [-6.8, -0.8, 0.6], to: [-2.9, 0.1, 0.7],  animated: true },
    { from: [-2, 0.1, 0.7],    to: [1, -1.5, 0.9],    animated: true },
    { from: [-2, 0.1, 0.7],    to: [1, 1.8, 0.9],     animated: true },
    { from: [2, -1.5, 0.5],    to: [4.5, 0, 0.5],     animated: highlight, color: highlight ? "#ef4444" : "#64748b" },
    { from: [2, 1.8, 0.5],     to: [4.5, 0, 0.5],     color: "#64748b" },
    { from: [5.4, 0, 0.5],     to: [8.1, -1.1, 1.0],  animated: true },
    { from: [5.4, 0, 0.5],     to: [8.1, 2.1, 0.8],   animated: true },
  ];

  // Draw order: back-to-front by (gx+gy) ascending
  const sorted = [...blocks].sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Composition · Isometric Digital Twin
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-status-healthy animate-pulse" />
              live
            </Badge>
            <Badge variant="outline" className="text-[10px]">7 assets · 3 tiers</Badge>
          </div>
        </div>
        <div className="relative rounded-lg border border-border overflow-hidden"
             style={{ background: "radial-gradient(ellipse at 30% 20%, #1e293b 0%, #0b1220 55%, #05070d 100%)" }}>
          <svg viewBox="0 0 920 420" className="w-full h-[380px]" role="img" aria-label="Isometric architecture of ecom-platform">
            <defs>
              <pattern id="isoGrid" width="38" height="22" patternUnits="userSpaceOnUse">
                <path d="M 0 11 L 19 0 L 38 11 L 19 22 Z" fill="none" stroke="#1f2a44" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.4" />
              </linearGradient>
              <filter id="isoShadowBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            {/* iso ground plane */}
            <polygon
              points={(() => {
                const c = [
                  isoProject(-10, -6, 0, cx, cy),
                  isoProject( 12, -6, 0, cx, cy),
                  isoProject( 12,  6, 0, cx, cy),
                  isoProject(-10,  6, 0, cx, cy),
                ];
                return c.map((q) => `${q.sx},${q.sy}`).join(" ");
              })()}
              fill="url(#floorGrad)" stroke="#1e293b" strokeWidth="0.6"
            />
            <rect x="0" y="0" width="920" height="420" fill="url(#isoGrid)" opacity="0.22" />

            {/* VPC boundary label */}
            <g opacity="0.75">
              {(() => {
                const a = isoProject(-9, -5, 0, cx, cy);
                const b = isoProject(11, -5, 0, cx, cy);
                const c = isoProject(11, 5, 0, cx, cy);
                const d = isoProject(-9, 5, 0, cx, cy);
                return (
                  <>
                    <polygon points={`${a.sx},${a.sy} ${b.sx},${b.sy} ${c.sx},${c.sy} ${d.sx},${d.sy}`}
                             fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="4 3" />
                    <text x={a.sx + 8} y={a.sy + 12} fontSize="9" fill="#64748b" letterSpacing="0.14em">
                      VPC · us-east-1 · 10.0.0.0/16
                    </text>
                  </>
                );
              })()}
            </g>

            {/* wires (draw behind blocks that are in front, but on top of ground) */}
            {wires.map((w, i) => (
              <IsoWire key={i} {...w} cx={cx} cy={cy} />
            ))}

            {/* blocks back-to-front */}
            {sorted.map((b) => (
              <IsoBlock key={b.key} {...b} cx={cx} cy={cy} />
            ))}

            {/* compass */}
            <g transform="translate(28,380)" opacity="0.55">
              <circle r="12" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
              <path d="M 0 -8 L 3 0 L 0 8 L -3 0 Z" fill="#60a5fa" />
              <text x="0" y="-14" textAnchor="middle" fontSize="8" fill="#94a3b8">N</text>
            </g>

            {/* legend */}
            <g transform="translate(720, 24)" fontSize="9" fill="#cbd5e1">
              <rect x="-6" y="-14" width="180" height="90" rx="4" fill="rgba(15,23,42,0.75)" stroke="#1e293b" />
              <text x="0" y="0" fontWeight="700" fill="#e2e8f0" letterSpacing="0.08em">TIER LEGEND</text>
              {[
                { c: ISO_PALETTE.alb.top,    t: "Edge · ALB" },
                { c: ISO_PALETTE.ec2.top,    t: "Compute · EC2" },
                { c: ISO_PALETTE.ebs.top,    t: "Storage · EBS" },
                { c: ISO_PALETTE.aurora.top, t: "Data · Aurora" },
                { c: ISO_PALETTE.redis.top,  t: "Cache · Redis" },
              ].map((r, i) => (
                <g key={r.t} transform={`translate(0, ${14 + i * 12})`}>
                  <rect x="0" y="-6" width="9" height="9" fill={r.c} />
                  <text x="14" y="2">{r.t}</text>
                </g>
              ))}
            </g>
          </svg>

          {highlight && (
            <div className="absolute left-3 bottom-3 right-3 rounded-md border border-crimson/40 bg-slate-950/85 backdrop-blur px-3 py-2 text-[11.5px] flex items-center gap-2 text-slate-200">
              <Zap className="h-3.5 w-3.5 text-crimson animate-pulse" />
              <span>Target object bound: <span className="font-mono font-semibold text-crimson">EBSVolume vol-0f12…abcd0</span> attached to <span className="font-mono">i-0ab12…7890</span></span>
              <Badge className="ml-auto text-[9.5px] bg-crimson/20 text-crimson border-crimson/40 border">blast-radius: 1</Badge>
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
