"use client";

import type { ReactNode } from "react";
import { CommandBar } from "@/components/shell/command-bar";
import { Sidebar } from "@/components/shell/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-canvas">
      <div
        className="shell-ambient pointer-events-none fixed inset-0"
        aria-hidden
      />
      <div className="shell-grid pointer-events-none fixed inset-0 opacity-[0.35]" aria-hidden />

      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <CommandBar />
        <main className="type-page flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}