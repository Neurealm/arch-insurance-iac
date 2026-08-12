import { supabase } from "@/integrations/supabase/client";

export interface GuidanceSource {
  catalogId: string;
  label: string;
  route: string;
}

export interface GuidanceAnswer {
  interactionId: string | null;
  answer: string;
  sources: GuidanceSource[];
  followUps: string[];
  confidence: number;
  escalate: boolean;
}

export interface GuidanceHistoryTurn {
  role: "user" | "assistant";
  text: string;
}

export async function askGuidanceAgent(
  question: string,
  conversationHistory: GuidanceHistoryTurn[],
): Promise<GuidanceAnswer> {
  const { data, error } = await supabase.functions.invoke("guidance-agent", {
    body: { action: "ask", question, conversationHistory },
  });
  if (error) throw error;
  return data as GuidanceAnswer;
}

export async function escalateGuidanceInteraction(interactionId: string, note?: string): Promise<void> {
  const { error } = await supabase.functions.invoke("guidance-agent", {
    body: { action: "escalate", interactionId, note },
  });
  if (error) throw error;
}
