import { createContext, useContext, useState, ReactNode } from "react";
import type { Persona } from "@/data/eoc";

type Ctx = { persona: Persona; setPersona: (p: Persona) => void };
const PersonaCtx = createContext<Ctx>({ persona: "executive", setPersona: () => {} });

export const PersonaProvider = ({ children }: { children: ReactNode }) => {
  const [persona, setPersona] = useState<Persona>("executive");
  return <PersonaCtx.Provider value={{ persona, setPersona }}>{children}</PersonaCtx.Provider>;
};

export const usePersona = () => useContext(PersonaCtx);