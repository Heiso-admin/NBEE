"use client";

import type { ReactNode } from "react";

import { cn } from "@heiso/core/lib/utils";

export type DataCardLayout = "grid-2" | "grid-3" | "grid-4";

const COLS: Record<DataCardLayout, string> = {
  "grid-2": "grid-cols-2",
  "grid-3": "grid-cols-3",
  "grid-4": "grid-cols-4",
};

export function DataCardView({ layout = "grid-3", children }: { layout?: DataCardLayout; children: ReactNode }) {
  return <div className={cn("my-4 grid gap-3", COLS[layout])}>{children}</div>;
}

export function DataCardItemView({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-slate-800">
      {children}
    </div>
  );
}

export function DataCardValueView({ children }: { children: ReactNode }) {
  return <div className="text-2xl font-extrabold text-slate-900">{children}</div>;
}

export function DataCardLabelView({ children }: { children: ReactNode }) {
  return <div className="mt-1 text-xs text-slate-500">{children}</div>;
}
