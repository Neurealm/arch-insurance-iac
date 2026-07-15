/**
 * Object-Oriented Runbook Builder
 * Route: /runops/runbooks/:runbookId/builder
 *
 * Guided builder that lets an SRE / cloud / FinOps / change engineer:
 *  1. Select a business service
 *  2. Review dependent infra
 *  3. Select EC2 + attached EBS volume
 *  4. Define an EBS resize operation
 *  5. Generate reusable object-oriented automation code
 *  6. Validate, dry-run, or execute the governed change
 *
 * Presentation is deterministic and fixture-backed — no destructive calls.
 */

import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Cloud, Database, Server,
  ShieldCheck, Sparkles, Play, FileCheck2, Info, Users, MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type StepId = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS: { id: StepId; title: string; subtitle: string }[] = [
  { id: 1, title: "Select Business Service", subtitle: "E-Commerce Platform" },
  { id: 2, title: "Review Infra Assets",     subtitle: "3 tiers, 7 assets" },
  { id: 3, title: "Select EC2 Instance",     subtitle: "i-0ab12c34d56ef7890" },
  { id: 4, title: "Define Operation",        subtitle: "Expand EBS Volume" },
  { id: 5, title: "Generate & Review Plan",  subtitle: "Python + IaC" },
  { id: 6, title: "Validate & Execute",      subtitle: "Approvals + Run" },
];

const RUNBOOK_CODE = `import boto3
import time

ec2 = boto3.client('ec2')

instance_id = 'i-0ab12c34d56ef7890'
volume_id   = 'vol-0f1234567890abcd0'
new_size    = 300  # GiB

# 1. Modify EBS volume size
ec2.modify_volume(
    VolumeId=volume_id,
    Size=new_size,
)

# 2. Wait for volume modification to complete
waiter = ec2.get_waiter('volume_modification_completed')
waiter.wait(VolumeIds=[volume_id])`;

const RISK_FACTORS = [
  { name: "Volume Modification Failure",    impact: "Low",    tone: "text-status-healthy" },
  { name: "Filesystem Resize Failure",      impact: "Low",    tone: "text-status-healthy" },
  { name: "Space Exhaustion During Resize", impact: "Medium", tone: "text-status-warning" },
  { name: "AWS API Throttling",             impact: "Low",    tone: "text-status-healthy" },
  { name: "Snapshot Failure (if added)",    impact: "Low",    tone: "text-status-healthy" },
];

const AI_RECOMMENDATIONS = [
  "Volume modification is non-disruptive",
  "Instance remains running",
  "Filesystem is grown online",
];

const RESOURCES_IN_SCOPE = [
  { icon: Server,   label: "EC2 Instance",      id: "i-0ab12c34d56ef7890" },
  { icon: Database, label: "EBS Volume",        id: "vol-0f1234567890abcd0" },
  { icon: Cloud,    label: "Auto Scaling Group", id: "Web-ASG" },
];

export default function RunbookObjectBuilder() {
  const navigate = useNavigate();
  const { runbookId } = useParams<{ runbookId: string }>();
  const [step, setStep] = useState<StepId>(4);
  const [codeTab, setCodeTab] = useState("python");

  const currentStep = useMemo(() => STEPS.find((s) => s.id === step)!, [step]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-background">
      {/* Header bar */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center gap-4">
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
          <div className="flex items-center gap-2 mt-1">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h1 className="text-lg font-bold tracking-tight uppercase">
              Object Oriented Code Builder
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><CheckCircle2 className="h-4 w-4 mr-1" /> Validate</Button>
          <Button variant="outline" size="sm"><FileCheck2 className="h-4 w-4 mr-1" /> Dry Run</Button>
          <Button size="sm" className="bg-indigo hover:bg-indigo/90 text-indigo-foreground">
            <Play className="h-4 w-4 mr-1" /> Execute Plan
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[280px_1fr_320px] gap-0">
        {/* Left rail — wizard steps + operation summary */}
        <aside className="border-r border-border bg-card/40 p-4 space-y-4 overflow-auto">
          <ol className="space-y-2">
            {STEPS.map((s) => {
              const done = s.id < step;
              const active = s.id === step;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setStep(s.id)}
                    className={cn(
                      "w-full text-left rounded-lg p-2.5 flex items-start gap-2.5 border transition-colors",
                      active ? "bg-indigo/10 border-indigo/30"
                             : done ? "bg-status-healthy/5 border-transparent hover:bg-secondary/60"
                             : "border-transparent hover:bg-secondary/60"
                    )}
                  >
                    <div className={cn(
                      "h-6 w-6 rounded-full grid place-items-center text-[11px] font-bold shrink-0",
                      active ? "bg-indigo text-indigo-foreground"
                             : done ? "bg-status-healthy text-white"
                             : "bg-secondary text-muted-foreground"
                    )}>
                      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.id}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold leading-tight">{s.title}</div>
                      <div className="text-[10.5px] text-muted-foreground mt-0.5 truncate">{s.subtitle}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Operation Summary
            </div>
            <dl className="text-[11.5px] space-y-1.5">
              {[
                ["Operation",     "Expand EBS Volume"],
                ["Instance",      "i-0ab12c34d56ef7890"],
                ["Volume",        "vol-0f1234567890abcd0 /dev/xvdf"],
                ["Current Size",  "200 GiB"],
                ["New Size",      "300 GiB"],
                ["Increase By",   "100 GiB"],
                ["Estimated Time", "~2 minutes"],
                ["Downtime",      "None"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-right">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-2 pt-1">
                <dt className="text-muted-foreground">Impact</dt>
                <dd><Badge variant="outline" className="bg-status-healthy/10 text-status-healthy border-status-healthy/30">Low</Badge></dd>
              </div>
            </dl>
          </div>
        </aside>

        {/* Center — context + code */}
        <main className="overflow-auto p-6 space-y-4 min-w-0">
          {/* Context chips */}
          <div className="grid grid-cols-4 gap-3">
            <ContextChip icon={Users} label="Business Service" value="E-Commerce Platform" tone="Healthy" />
            <ContextChip icon={Cloud} label="Environment" value="Production" />
            <ContextChip icon={MapPin} label="Region" value="us-east-1" hint="aws" />
            <ContextChip icon={Users} label="Owner" value="Platform Team" />
          </div>

          {/* Architecture / assets */}
          <Card>
            <CardHeader className="pb-2">
              <Tabs defaultValue="arch">
                <TabsList>
                  <TabsTrigger value="arch">Architecture View</TabsTrigger>
                  <TabsTrigger value="infra">Infrastructure Assets</TabsTrigger>
                  <TabsTrigger value="deps">Dependencies</TabsTrigger>
                  <TabsTrigger value="data">Data Flow</TabsTrigger>
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                </TabsList>
                <TabsContent value="arch" className="mt-3">
                  <ArchitectureDiagram />
                </TabsContent>
                <TabsContent value="infra" className="mt-3 text-sm text-muted-foreground">
                  7 assets across web, app, and data tiers.
                </TabsContent>
                <TabsContent value="deps" className="mt-3 text-sm text-muted-foreground">
                  Downstream: Aurora (MySQL), ElastiCache (Redis).
                </TabsContent>
                <TabsContent value="data" className="mt-3 text-sm text-muted-foreground">
                  Read/write traffic remains on primary during resize.
                </TabsContent>
                <TabsContent value="tags" className="mt-3 text-sm text-muted-foreground">
                  env=prod · tier=web · owner=platform
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          {/* Code + AI panel */}
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-[1fr_320px]">
                <div className="border-r border-border">
                  <Tabs value={codeTab} onValueChange={setCodeTab}>
                    <TabsList className="m-3">
                      <TabsTrigger value="python">Runbook Code (Python)</TabsTrigger>
                      <TabsTrigger value="cli">CLI Commands</TabsTrigger>
                      <TabsTrigger value="tf">Terraform (HCL)</TabsTrigger>
                      <TabsTrigger value="cf">CloudFormation (YAML)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="python" className="px-3 pb-3">
                      <pre className="bg-slate-950 text-slate-100 text-[12px] rounded-md p-3 overflow-auto font-mono leading-relaxed">
                        {RUNBOOK_CODE.split("\n").map((line, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="text-slate-500 select-none w-6 text-right">{i + 1}</span>
                            <span>{line || " "}</span>
                          </div>
                        ))}
                      </pre>
                    </TabsContent>
                    <TabsContent value="cli" className="px-3 pb-3 text-sm text-muted-foreground">
                      aws ec2 modify-volume --volume-id vol-0f1234567890abcd0 --size 300
                    </TabsContent>
                    <TabsContent value="tf" className="px-3 pb-3 text-sm text-muted-foreground">
                      resource "aws_ebs_volume" "web" {`{ size = 300 }`}
                    </TabsContent>
                    <TabsContent value="cf" className="px-3 pb-3 text-sm text-muted-foreground">
                      Resources.WebVolume.Properties.Size: 300
                    </TabsContent>
                  </Tabs>
                </div>

                <aside className="p-4 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo" />
                    <span className="text-sm font-semibold">AI Code Assistant</span>
                    <Badge variant="outline" className="text-[10px]">Preview</Badge>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    This runbook expands the EBS volume and resizes the filesystem online without
                    stopping the instance.
                  </p>
                  <ul className="space-y-1.5">
                    {AI_RECOMMENDATIONS.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-[12px]">
                        <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-status-healthy shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-md border border-border bg-secondary/40 p-2.5 text-[11.5px]">
                    <div className="font-semibold mb-1">Recommendations</div>
                    Consider taking a snapshot before modification for rollback protection.
                  </div>
                  <Button size="sm" variant="outline" className="w-full">+ Add Snapshot Step</Button>
                </aside>
              </div>

              {/* Gate strip */}
              <div className="grid grid-cols-5 border-t border-border text-xs">
                {[
                  ["Syntax Check", "Passed"],
                  ["Security Scan", "Passed"],
                  ["Best Practices", "Passed"],
                  ["Estimated Cost Impact", "$0.02 / month"],
                  ["Rollback Ready", "Yes"],
                ].map(([k, v], i) => (
                  <div key={k} className={cn("p-3", i < 4 && "border-r border-border")}>
                    <div className="text-muted-foreground">{k}</div>
                    <div className={cn(
                      "font-semibold mt-0.5",
                      v === "Passed" || v === "Yes" ? "text-status-healthy" : ""
                    )}>{v}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
            >
              Next: {STEPS[Math.min(step, 5)].title} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </main>

        {/* Right rail — risk twin */}
        <aside className="border-l border-border bg-card/40 p-4 space-y-4 overflow-auto">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-indigo" />
            <div className="text-sm font-semibold">Digital Twin & Risk Analysis</div>
          </div>

          <Tabs defaultValue="risk">
            <TabsList className="w-full">
              <TabsTrigger value="risk" className="flex-1">Risk Twin</TabsTrigger>
              <TabsTrigger value="sim" className="flex-1">Simulation</TabsTrigger>
            </TabsList>
            <TabsContent value="risk" className="mt-3 space-y-3">
              <div className="text-[11px] text-muted-foreground">Risk Score</div>
              <div className="flex items-center gap-3">
                <RiskGauge value={23} />
                <div>
                  <div className="text-lg font-bold text-status-healthy">Low Risk</div>
                  <div className="text-[11px] text-muted-foreground">
                    Operation has low potential impact to the environment.
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Risk Factors
                </div>
                <div className="text-[11px] flex justify-between text-muted-foreground px-1 mb-1">
                  <span>Factor</span><span>Impact</span>
                </div>
                <ul className="space-y-1">
                  {RISK_FACTORS.map((r) => (
                    <li key={r.name} className="flex justify-between items-center text-[11.5px] px-1 py-1 rounded hover:bg-secondary/60">
                      <span>{r.name}</span>
                      <span className={cn("inline-flex items-center gap-1", r.tone)}>
                        <Circle className="h-2 w-2 fill-current" />
                        {r.impact}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-border p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Blast Radius <span className="font-normal normal-case">(What could be impacted)</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo" /> Direct 1</span>
                  <span className="mx-auto text-center">
                    <div className="text-xl font-bold">3</div>
                    <div className="text-muted-foreground">Total</div>
                  </span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Indirect 2</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Resources in Scope
                  </div>
                  <button className="text-[11px] text-indigo hover:underline">View All</button>
                </div>
                <ul className="space-y-1.5">
                  {RESOURCES_IN_SCOPE.map((r) => (
                    <li key={r.label} className="flex items-center gap-2 rounded-md border border-border p-2">
                      <r.icon className="h-4 w-4 text-indigo" />
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium">{r.label}</div>
                        <div className="text-[10.5px] text-muted-foreground truncate">{r.id}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="sim" className="mt-3 text-sm text-muted-foreground">
              Run synthetic user journeys before, during, and after the change. No degradation
              predicted on checkout, cart, or search journeys.
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      {/* Environment footer */}
      <div className="border-t border-border bg-card px-6 py-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Environment</span>
        <span className="font-semibold text-status-healthy">Production</span>
        <span className="ml-auto">Step {step} of 6 · {currentStep.title}</span>
      </div>
    </div>
  );
}

function ContextChip({
  icon: Icon, label, value, tone, hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; tone?: string; hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-md bg-secondary grid place-items-center">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          {hint && <span className="text-[10px] font-semibold text-indigo">{hint}</span>}
          {label}
        </div>
        <div className="text-sm font-semibold truncate flex items-center gap-2">
          {value}
          {tone && (
            <Badge variant="outline" className="text-[10px] bg-status-healthy/10 text-status-healthy border-status-healthy/30">
              {tone}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="rounded-md border border-dashed border-border bg-secondary/20 p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
        Auto Scaling Group
      </div>
      <div className="flex items-center gap-3 flex-wrap justify-between text-[12px]">
        <Node icon={Cloud} label="Internet" />
        <Arrow />
        <Node icon={Server} label="ALB" />
        <Arrow />
        <div className="flex flex-col gap-2">
          <Node icon={Server} label="WebServer-01" sub="i-0ab12c34d56ef7890" active />
          <Node icon={Server} label="WebServer-02" sub="i-0bc23d45e67fg8901" />
        </div>
        <Arrow />
        <Node icon={Database} label="EBS" sub="vol-0f1234... 200 GiB" tone="indigo" />
        <Arrow />
        <div className="flex flex-col gap-2">
          <Node icon={Database} label="Aurora" sub="(MySQL)" />
          <Node icon={Database} label="ElastiCache" sub="(Redis)" />
        </div>
      </div>
    </div>
  );
}

function Node({
  icon: Icon, label, sub, active, tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; sub?: string; active?: boolean; tone?: "indigo";
}) {
  return (
    <div className={cn(
      "rounded-lg border bg-card px-3 py-2 min-w-[110px]",
      active ? "border-indigo ring-1 ring-indigo/40" :
      tone === "indigo" ? "border-indigo/40 bg-indigo/5" : "border-border"
    )}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-indigo" />
        <div className="text-[12px] font-semibold">{label}</div>
      </div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function Arrow() {
  return <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />;
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
