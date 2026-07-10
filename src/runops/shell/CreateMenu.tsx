// Global Create menu. Fixed set of creation entry points.

import { Link } from "react-router-dom";
import { Plus, Siren, BookText, Play, Wrench, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
  { label: "Incident",             to: "/runops/incidents/INC-10482",       icon: Siren   },
  { label: "Runbook",              to: "/runops/runbooks/new",              icon: BookText },
  { label: "Execution request",    to: "/runops/runbooks/RB-0042/launch",   icon: Play    },
  { label: "Corrective action",    to: "/runops/problems/actions",          icon: Wrench  },
  { label: "Automation candidate", to: "/runops/automation",                icon: Bot     },
];

export function CreateMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">
          <Plus className="mr-1 h-3 w-3" /> Create
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-slate-500">Create new</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((it) => (
          <DropdownMenuItem key={it.label} asChild>
            <Link to={it.to} className="flex items-center gap-2 text-[12.5px]">
              <it.icon className="h-3.5 w-3.5 text-slate-500" />
              {it.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
