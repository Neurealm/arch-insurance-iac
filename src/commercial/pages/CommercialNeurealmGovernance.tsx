import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createInitialGovernanceData,
  EXECUTIVE_UPDATE_TEXT,
  type GovernanceDecision,
  type GovernanceForum,
  type GovernanceKpi,
  type GovernanceRisk,
  type GovernanceSummary,
  type GovernanceTier,
  type NeurealmGovernanceData,
} from "@/data/neurealmGovernanceMockData";
import { GovernanceHeader } from "@/commercial/governance/GovernanceHeader";
import { GovernanceSummaryCards } from "@/commercial/governance/GovernanceSummaryCards";
import {
  GovernanceOperatingModel,
  GovernanceTierDrawer,
} from "@/commercial/governance/GovernanceOperatingModel";
import {
  OperationalPhaseCards,
  OperationalPhaseDetail,
} from "@/commercial/governance/OperationalPhaseCards";
import {
  GovernanceForumsTable,
  GovernanceForumDrawer,
} from "@/commercial/governance/GovernanceForumsTable";
import { RaciSnapshot } from "@/commercial/governance/RaciSnapshot";
import {
  GovernanceRisksTable,
  GovernanceRiskDrawer,
} from "@/commercial/governance/GovernanceRisksTable";
import {
  GovernanceDecisionsTable,
  GovernanceDecisionDrawer,
} from "@/commercial/governance/GovernanceDecisionsTable";
import { GovernanceKpiTable } from "@/commercial/governance/GovernanceKpiTable";
import { ExecutiveAttentionPanel } from "@/commercial/governance/ExecutiveAttentionPanel";
import {
  GovernanceCalendar,
  GovernanceMeetingDialog,
} from "@/commercial/governance/GovernanceCalendar";
import { GovernanceActivityFeed } from "@/commercial/governance/GovernanceActivityFeed";
import { GovernancePrototypeNotice } from "@/commercial/governance/GovernancePrototypeNotice";

let localId = 0;
const nextId = (prefix: string) => `${prefix}-local-${++localId}`;

function nowLabel() {
  return new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function CommercialNeurealmGovernance() {
  const [data, setData] = useState<NeurealmGovernanceData>(() => createInitialGovernanceData());
  const [dirty, setDirty] = useState(false);
  const [view, setView] = useState("executive");
  const [announcement, setAnnouncement] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const [tierId, setTierId] = useState<string | null>(null);
  const [forumId, setForumId] = useState<string | null>(null);
  const [riskId, setRiskId] = useState<string | null>(null);
  const [decisionId, setDecisionId] = useState<string | null>(null);
  const [phaseId, setPhaseId] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);

  const liveRef = useRef<HTMLDivElement>(null);

  const notify = useCallback((message: string) => {
    toast.success(message);
    setAnnouncement(message);
  }, []);

  const mutate = useCallback(
    (fn: (draft: NeurealmGovernanceData) => NeurealmGovernanceData) => {
      setData((prev) => fn(structuredClone(prev)));
      setDirty(true);
    },
    [],
  );

  /* ---------------- Header actions ---------------- */

  const handleExport = (option: string) => {
    if (option === "Copy Executive Update") {
      void navigator.clipboard?.writeText(EXECUTIVE_UPDATE_TEXT).catch(() => undefined);
      notify("Executive update copied to the clipboard");
      return;
    }
    notify(`${option} generated (prototype only)`);
  };

  const handleReset = () => {
    setData(createInitialGovernanceData());
    setDirty(false);
    notify("Mock governance data restored to the initial state");
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSummarySelect = (card: GovernanceSummary) => {
    setSelectedCard((prev) => (prev === card.id ? null : card.id));
    scrollTo(card.target);
    setAnnouncement(`${card.label}: ${card.value}. ${card.supportingText}`);
  };

  /* ---------------- Tier ---------------- */

  const saveTier = (id: string, patch: Partial<GovernanceTier>) => {
    mutate((d) => {
      d.tiers = d.tiers.map((t) => (t.id === id ? { ...t, ...patch } : t));
      return d;
    });
    notify("Governance tier updated locally");
  };

  /* ---------------- Phases ---------------- */

  const toggleActivity = (pId: string, activityId: string) => {
    mutate((d) => {
      d.phases = d.phases.map((p) => {
        if (p.id !== pId) return p;
        const activities = p.activities.map((a) =>
          a.id === activityId ? { ...a, complete: !a.complete } : a,
        );
        const readiness = Math.round(
          (activities.filter((a) => a.complete).length / activities.length) * 100,
        );
        return { ...p, activities, readiness };
      });
      return d;
    });
  };

  /* ---------------- Forums ---------------- */

  const saveForum = (id: string, patch: Partial<GovernanceForum>) => {
    mutate((d) => {
      d.forums = d.forums.map((f) => (f.id === id ? { ...f, ...patch } : f));
      return d;
    });
    notify("Governance forum updated locally");
  };

  const scheduleMeeting = (forum: GovernanceForum) => {
    notify(`Meeting request drafted for ${forum.name} (prototype only)`);
  };

  const addForumAction = (forum: GovernanceForum) => {
    mutate((d) => {
      d.forums = d.forums.map((f) => (f.id === forum.id ? { ...f, openActions: f.openActions + 1 } : f));
      return d;
    });
    notify(`Action item added to ${forum.name}`);
  };

  /* ---------------- Risks ---------------- */

  const addRisk = (risk: Omit<GovernanceRisk, "id" | "notes">) => {
    mutate((d) => {
      d.risks = [...d.risks, { ...risk, id: nextId("risk"), notes: [] }];
      return d;
    });
    notify("Risk added to the local register");
  };

  const saveRisk = (id: string, patch: Partial<GovernanceRisk>) => {
    mutate((d) => {
      d.risks = d.risks.map((r) => (r.id === id ? { ...r, ...patch } : r));
      return d;
    });
    notify("Risk updated locally");
  };

  const addRiskNote = (id: string, note: string) => {
    mutate((d) => {
      d.risks = d.risks.map((r) =>
        r.id === id ? { ...r, notes: [...r.notes, `${nowLabel()} — ${note}`] } : r,
      );
      return d;
    });
    notify("Mitigation note added");
  };

  const closeRisk = (id: string) => {
    mutate((d) => {
      d.risks = d.risks.map((r) => (r.id === id ? { ...r, status: "Closed" } : r));
      return d;
    });
    notify("Risk closed locally");
  };

  const escalateRisk = (id: string) => {
    mutate((d) => {
      d.risks = d.risks.map((r) => (r.id === id ? { ...r, status: "Escalated", severity: "High" } : r));
      return d;
    });
    notify("Risk escalated to the Executive Steering Committee");
  };

  /* ---------------- Decisions ---------------- */

  const addDecision = (dec: Omit<GovernanceDecision, "id">) => {
    mutate((d) => {
      d.decisions = [...d.decisions, { ...dec, id: nextId("dec") }];
      return d;
    });
    notify("Decision added to the local register");
  };

  const saveDecision = (id: string, patch: Partial<GovernanceDecision>) => {
    mutate((d) => {
      d.decisions = d.decisions.map((x) => (x.id === id ? { ...x, ...patch } : x));
      return d;
    });
    notify("Decision updated locally");
  };

  const approveDecision = (id: string) => {
    mutate((d) => {
      d.decisions = d.decisions.map((x) => (x.id === id ? { ...x, status: "Approved" } : x));
      return d;
    });
    const title = data.decisions.find((x) => x.id === id)?.title ?? "Decision";
    notify(`${title} approved locally`);
  };

  const escalateDecision = (id: string) => {
    mutate((d) => {
      d.decisions = d.decisions.map((x) => (x.id === id ? { ...x, status: "Escalated" } : x));
      return d;
    });
    notify("Decision escalated for executive review");
  };

  /* ---------------- KPIs ---------------- */

  const updateKpi = (id: string, patch: Partial<GovernanceKpi>) => {
    mutate((d) => {
      d.kpis = d.kpis.map((k) => (k.id === id ? { ...k, ...patch, updatedAt: nowLabel() } : k));
      return d;
    });
    notify("KPI updated locally");
  };

  /* ---------------- Meetings ---------------- */

  const addAgendaItem = (id: string, item: string) => {
    mutate((d) => {
      d.meetings = d.meetings.map((m) => (m.id === id ? { ...m, agenda: [...m.agenda, item] } : m));
      return d;
    });
    notify("Agenda item added");
  };

  const reschedule = (id: string) => {
    const m = data.meetings.find((x) => x.id === id);
    notify(`Reschedule request drafted for ${m?.forum ?? "the forum"} (prototype only)`);
  };

  /* ---------------- Derived ---------------- */

  const executiveUpdate = useMemo(() => {
    const openRisks = data.risks.filter((r) => r.status !== "Closed");
    const openDecisions = data.decisions.filter((d) => d.status !== "Approved");
    const day0 = data.phases.find((p) => p.id === "day0");
    return [
      EXECUTIVE_UPDATE_TEXT,
      "",
      `Open risks: ${openRisks.length} (${openRisks.filter((r) => r.severity === "High").length} High).`,
      `Open decisions: ${openDecisions.length}, of which ${
        openDecisions.filter((d) => d.status === "Attention Required" || d.status === "Escalated").length
      } require leadership attention.`,
      `Day 0 readiness: ${day0?.readiness ?? 0}% — ${day0?.status ?? "In Progress"}.`,
      `Governance forums operating: ${data.forums.length}, with ${data.forums.reduce(
        (sum, f) => sum + f.openActions,
        0,
      )} open actions.`,
    ].join("\n");
  }, [data]);

  const notificationCount = useMemo(
    () =>
      data.risks.filter((r) => r.severity === "High" && r.status !== "Closed").length +
      data.decisions.filter((d) => d.status === "Attention Required").length,
    [data],
  );

  const selectedTier = data.tiers.find((t) => t.id === tierId) ?? null;
  const selectedForum = data.forums.find((f) => f.id === forumId) ?? null;
  const selectedRisk = data.risks.find((r) => r.id === riskId) ?? null;
  const selectedDecision = data.decisions.find((d) => d.id === decisionId) ?? null;
  const selectedPhase = data.phases.find((p) => p.id === phaseId) ?? null;
  const selectedMeeting = data.meetings.find((m) => m.id === meetingId) ?? null;

  return (
    <div className="space-y-6">
      <div ref={liveRef} aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>

      <GovernanceHeader
        view={view}
        onViewChange={(v) => {
          setView(v);
          setAnnouncement(`Switched to the ${v} governance view`);
        }}
        onExport={handleExport}
        onReset={handleReset}
        onNotifications={() => notify(`${notificationCount} governance items require attention`)}
        notificationCount={notificationCount}
        hasLocalChanges={dirty}
      />

      <GovernanceSummaryCards
        cards={data.summary}
        selectedId={selectedCard}
        onSelect={handleSummarySelect}
      />

      <GovernanceOperatingModel
        tiers={data.tiers}
        selectedTierId={tierId}
        onSelectTier={(id) => setTierId(id)}
      />

      <OperationalPhaseCards
        phases={data.phases}
        onToggleActivity={toggleActivity}
        onOpenDetail={(id) => setPhaseId(id)}
      />

      <GovernanceForumsTable
        forums={data.forums}
        onOpenForum={(id) => setForumId(id)}
        onScheduleMeeting={scheduleMeeting}
        onAddActionItem={addForumAction}
      />

      <RaciSnapshot raci={data.raci} />

      <GovernanceRisksTable
        risks={data.risks}
        onOpenRisk={(id) => setRiskId(id)}
        onAddRisk={addRisk}
        onCloseRisk={closeRisk}
        onEscalateRisk={escalateRisk}
      />

      <GovernanceDecisionsTable
        decisions={data.decisions}
        onOpenDecision={(id) => setDecisionId(id)}
        onApprove={approveDecision}
        onEscalate={escalateDecision}
        onAdd={addDecision}
      />

      <GovernanceKpiTable kpis={data.kpis} onUpdate={updateKpi} />

      <ExecutiveAttentionPanel
        items={data.attention}
        summaryText={executiveUpdate}
        onNavigate={scrollTo}
        onCopySummary={(text) => {
          void navigator.clipboard?.writeText(text).catch(() => undefined);
          notify("Executive update copied to the clipboard");
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <GovernanceCalendar meetings={data.meetings} onOpenMeeting={(id) => setMeetingId(id)} />
        <GovernanceActivityFeed activity={data.activity} />
      </div>

      <GovernancePrototypeNotice />

      {/* Drawers and dialogs */}
      <GovernanceTierDrawer
        tier={selectedTier}
        risks={data.risks}
        decisions={data.decisions}
        open={!!selectedTier}
        onOpenChange={(v) => !v && setTierId(null)}
        onSave={saveTier}
      />
      <GovernanceForumDrawer
        forum={selectedForum}
        open={!!selectedForum}
        onOpenChange={(v) => !v && setForumId(null)}
        onSave={saveForum}
      />
      <GovernanceRiskDrawer
        risk={selectedRisk}
        open={!!selectedRisk}
        onOpenChange={(v) => !v && setRiskId(null)}
        onSave={saveRisk}
        onAddNote={addRiskNote}
      />
      <GovernanceDecisionDrawer
        decision={selectedDecision}
        open={!!selectedDecision}
        onOpenChange={(v) => !v && setDecisionId(null)}
        onSave={saveDecision}
      />
      <OperationalPhaseDetail
        phase={selectedPhase}
        open={!!selectedPhase}
        onOpenChange={(v) => !v && setPhaseId(null)}
      />
      <GovernanceMeetingDialog
        meeting={selectedMeeting}
        risks={data.risks}
        decisions={data.decisions}
        onOpenChange={(v) => !v && setMeetingId(null)}
        onReschedule={reschedule}
        onAddAgendaItem={addAgendaItem}
      />
    </div>
  );
}
