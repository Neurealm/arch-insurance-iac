import { asId, Person, PersonId, Team, TeamId } from "@/silicon/domain/types";

export const teams: Team[] = [
  { id: asId<TeamId>("team-arch"),   name: "Architecture",  charter: "Micro-architecture & specification" },
  { id: asId<TeamId>("team-rtl"),    name: "RTL Design",    charter: "RTL implementation & integration" },
  { id: asId<TeamId>("team-dv"),     name: "Verification",  charter: "Simulation, formal, coverage" },
  { id: asId<TeamId>("team-pm"),     name: "Program Mgmt",  charter: "Milestones, sign-off, cross-team" },
];

export const people: Person[] = [
  { id: asId<PersonId>("person-priya-nair"),    name: "Priya Nair",       role: "Verification Lead",   teamId: asId<TeamId>("team-dv"),   email: "priya.nair@example.com" },
  { id: asId<PersonId>("person-arjun-shah"),    name: "Arjun Shah",       role: "Chip Architect",       teamId: asId<TeamId>("team-arch"), email: "arjun.shah@example.com" },
  { id: asId<PersonId>("person-linh-tran"),     name: "Linh Tran",        role: "RTL Lead",             teamId: asId<TeamId>("team-rtl"),  email: "linh.tran@example.com" },
  { id: asId<PersonId>("person-marco-rossi"),   name: "Marco Rossi",      role: "DV Engineer",          teamId: asId<TeamId>("team-dv"),   email: "marco.rossi@example.com" },
  { id: asId<PersonId>("person-diane-okafor"),  name: "Diane Okafor",     role: "Formal Verification",  teamId: asId<TeamId>("team-dv"),   email: "diane.okafor@example.com" },
  { id: asId<PersonId>("person-hiro-tanaka"),   name: "Hiro Tanaka",      role: "RTL Engineer",         teamId: asId<TeamId>("team-rtl"),  email: "hiro.tanaka@example.com" },
  { id: asId<PersonId>("person-elena-morales"), name: "Elena Morales",    role: "Program Manager",      teamId: asId<TeamId>("team-pm"),   email: "elena.morales@example.com" },
  { id: asId<PersonId>("person-sam-brooks"),    name: "Sam Brooks",       role: "Sign-off Reviewer",    teamId: asId<TeamId>("team-pm"),   email: "sam.brooks@example.com" },
  { id: asId<PersonId>("person-kai-zhou"),      name: "Kai Zhou",         role: "DV Engineer",          teamId: asId<TeamId>("team-dv"),   email: "kai.zhou@example.com" },
  { id: asId<PersonId>("person-noor-abbasi"),   name: "Noor Abbasi",      role: "Static Analysis Lead", teamId: asId<TeamId>("team-dv"),   email: "noor.abbasi@example.com" },
  { id: asId<PersonId>("person-ben-cohen"),     name: "Ben Cohen",        role: "RTL Engineer",         teamId: asId<TeamId>("team-rtl"),  email: "ben.cohen@example.com" },
  { id: asId<PersonId>("person-mira-fields"),   name: "Mira Fields",      role: "Architect",            teamId: asId<TeamId>("team-arch"), email: "mira.fields@example.com" },
];
