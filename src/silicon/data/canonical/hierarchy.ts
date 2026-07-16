import { asId, Tenant, TenantId, Portfolio, PortfolioId, Program, ProgramId, Ip, IpId } from "@/silicon/domain/types";

export const tenants: Tenant[] = [
  { id: asId<TenantId>("tenant-panw-demo"), name: "PANW Silicon Demo" },
];

export const portfolios: Portfolio[] = [
  { id: asId<PortfolioId>("portfolio-nsse"), tenantId: asId<TenantId>("tenant-panw-demo"), name: "Networking & Security Silicon Engineering" },
];

export const programs: Program[] = [
  { id: asId<ProgramId>("program-aegis-240"), portfolioId: asId<PortfolioId>("portfolio-nsse"), name: "Aegis 240", tapeoutDate: "2026-11-30" },
];

export const ips: Ip[] = [
  { id: asId<IpId>("ip-ddmac-240"), programId: asId<ProgramId>("program-aegis-240"), name: "DDMAC 240", description: "Descriptor-driven MAC controller, 240 Gbps" },
];
