import { asId, Specification, SpecId, IpId, PersonId } from "@/silicon/domain/types";

const IP = asId<IpId>("ip-ddmac-240");
const S = (s: string) => asId<SpecId>(s);

export const specifications: Specification[] = [
  { id: S("spec-arch-1"), ipId: IP, section: "1", title: "DDMAC 240 Architecture Overview", version: "1.4",  ownerId: asId<PersonId>("person-arjun-shah") },
  { id: S("spec-desc-1"), ipId: IP, section: "2", title: "Descriptor Ring & Fetch",         version: "1.7",  ownerId: asId<PersonId>("person-arjun-shah") },
  { id: S("spec-cmpl-1"), ipId: IP, section: "3", title: "Completion Engine",               version: "1.3",  ownerId: asId<PersonId>("person-mira-fields") },
  { id: S("spec-irq-1"),  ipId: IP, section: "4", title: "Interrupt Coalescing",            version: "1.1",  ownerId: asId<PersonId>("person-mira-fields") },
  { id: S("spec-mac-1"),  ipId: IP, section: "5", title: "MAC TX / RX",                     version: "1.6",  ownerId: asId<PersonId>("person-arjun-shah") },
  { id: S("spec-csr-1"),  ipId: IP, section: "6", title: "CSR Map & Reset",                 version: "1.2",  ownerId: asId<PersonId>("person-mira-fields") },
];
