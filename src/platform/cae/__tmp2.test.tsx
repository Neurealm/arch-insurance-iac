import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
vi.mock("./speech", () => ({
  getSpeechSynthesis: () => null,
  isSpeechSupported: () => { throw new Error("probe fail"); },
  loadVoices: async () => [],
  prepareSpeechText: (t: string) => t,
  selectVoice: () => null,
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) } } }));
import { MemoryRouter } from "react-router-dom";
import { ContextualAudioRoot } from "./ContextualAudioErrorBoundary";
describe("b", () => { it("catches", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(<MemoryRouter><ContextualAudioRoot><h1>Hi</h1></ContextualAudioRoot></MemoryRouter>);
  expect(screen.getByText("Hi")).toBeInTheDocument();
}); });
