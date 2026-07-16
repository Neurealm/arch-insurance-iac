// Root layout for /silicon: top bar, palette, drawer, URL sync, focus styles.

import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SiliconTopBar } from "@/silicon/shell/SiliconTopBar";
import { CommandPalette } from "@/silicon/shell/CommandPalette";
import { EntityDetailDrawer } from "@/silicon/shell/EntityDetailDrawer";
import { useUrlSync } from "@/silicon/state/urlSync";
import { useSiliconStore } from "@/silicon/state/SiliconStore";

export const SiliconLayout: React.FC = () => {
  useUrlSync();
  const setReducedMotion = useSiliconStore(s => s.setReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const h = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [setReducedMotion]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 [--tw-ring-color:theme(colors.sky.400)] [&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-offset-1 [&_input:focus-visible]:ring-2 [&_a:focus-visible]:ring-2">
      <SiliconTopBar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <CommandPalette />
      <EntityDetailDrawer />
    </div>
  );
};
