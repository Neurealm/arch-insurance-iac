import { asId, RtlModule, ModuleId, IpId, PersonId, Interface, InterfaceId, Register, RegisterId } from "@/silicon/domain/types";

const IP = asId<IpId>("ip-ddmac-240");
const M = (s: string) => asId<ModuleId>(s);

export const modules: RtlModule[] = [
  { id: M("mod-top"),        ipId: IP, name: "ddmac_top",           fileRef: "rtl/ddmac_top.sv",           linesOfCode: 850,  interfaceIds: [], ownerId: asId<PersonId>("person-linh-tran") },
  { id: M("mod-desc-fetch"), ipId: IP, name: "descriptor_fetch",    parentId: M("mod-top"), fileRef: "rtl/descriptor_fetch.sv",  linesOfCode: 1240, interfaceIds: [asId<InterfaceId>("if-axi-fetch")], ownerId: asId<PersonId>("person-hiro-tanaka") },
  { id: M("mod-ring-mgr"),   ipId: IP, name: "ring_manager",        parentId: M("mod-top"), fileRef: "rtl/ring_manager.sv",      linesOfCode: 980,  interfaceIds: [asId<InterfaceId>("if-ring-cfg")], ownerId: asId<PersonId>("person-ben-cohen") },
  { id: M("mod-completion"), ipId: IP, name: "completion_engine",   parentId: M("mod-top"), fileRef: "rtl/completion_engine.sv", linesOfCode: 1520, interfaceIds: [asId<InterfaceId>("if-axi-cmpl")], ownerId: asId<PersonId>("person-linh-tran") },
  { id: M("mod-irq"),        ipId: IP, name: "irq_coalescer",       parentId: M("mod-top"), fileRef: "rtl/irq_coalescer.sv",     linesOfCode: 610,  interfaceIds: [asId<InterfaceId>("if-irq")],      ownerId: asId<PersonId>("person-hiro-tanaka") },
  { id: M("mod-mac-tx"),     ipId: IP, name: "mac_tx",              parentId: M("mod-top"), fileRef: "rtl/mac_tx.sv",            linesOfCode: 2100, interfaceIds: [], ownerId: asId<PersonId>("person-ben-cohen") },
  { id: M("mod-mac-rx"),     ipId: IP, name: "mac_rx",              parentId: M("mod-top"), fileRef: "rtl/mac_rx.sv",            linesOfCode: 2050, interfaceIds: [], ownerId: asId<PersonId>("person-linh-tran") },
  { id: M("mod-csr"),        ipId: IP, name: "csr_block",           parentId: M("mod-top"), fileRef: "rtl/csr_block.sv",         linesOfCode: 720,  interfaceIds: [], ownerId: asId<PersonId>("person-hiro-tanaka") },
];

const IF = (s: string) => asId<InterfaceId>(s);
export const interfaces: Interface[] = [
  { id: IF("if-axi-fetch"), moduleId: M("mod-desc-fetch"), name: "axi_fetch",   protocol: "AXI4",   width: 512 },
  { id: IF("if-axi-cmpl"),  moduleId: M("mod-completion"), name: "axi_cmpl",    protocol: "AXI4",   width: 512 },
  { id: IF("if-ring-cfg"),  moduleId: M("mod-ring-mgr"),   name: "ring_cfg",    protocol: "APB",    width: 32  },
  { id: IF("if-irq"),       moduleId: M("mod-irq"),        name: "irq_bus",     protocol: "Custom", width: 16  },
];

const R = (s: string) => asId<RegisterId>(s);
export const registers: Register[] = [
  { id: R("reg-ctrl"),        moduleId: M("mod-csr"),      name: "CTRL",        offset: "0x000", access: "RW",  resetValue: "0x00000000", description: "Global enable/soft-reset" },
  { id: R("reg-status"),      moduleId: M("mod-csr"),      name: "STATUS",      offset: "0x004", access: "RO",  resetValue: "0x00000001", description: "Ready + error flags" },
  { id: R("reg-int-clr"),     moduleId: M("mod-csr"),      name: "INT_CLR",     offset: "0x010", access: "W1C", resetValue: "0x00000000", description: "Write-1-clear interrupt latches" },
  { id: R("reg-ring-base"),   moduleId: M("mod-ring-mgr"), name: "RING_BASE",   offset: "0x100", access: "RW",  resetValue: "0x00000000", description: "Descriptor ring base pointer" },
  { id: R("reg-ring-head"),   moduleId: M("mod-ring-mgr"), name: "RING_HEAD",   offset: "0x104", access: "RW",  resetValue: "0x00000000", description: "Producer head pointer" },
  { id: R("reg-ring-tail"),   moduleId: M("mod-ring-mgr"), name: "RING_TAIL",   offset: "0x108", access: "RO",  resetValue: "0x00000000", description: "Consumer tail pointer" },
  { id: R("reg-cmpl-thresh"), moduleId: M("mod-completion"), name: "CMPL_THRESH", offset: "0x200", access: "RW",  resetValue: "0x00000020", description: "Completion coalescing threshold" },
  { id: R("reg-irq-mask"),    moduleId: M("mod-irq"),      name: "IRQ_MASK",    offset: "0x300", access: "RW",  resetValue: "0xFFFFFFFF", description: "Interrupt mask" },
];
