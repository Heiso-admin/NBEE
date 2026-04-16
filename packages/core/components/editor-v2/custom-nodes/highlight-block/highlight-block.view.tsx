"use client";

import type { ReactNode } from "react";

import { cn } from "@heiso/core/lib/utils";

export type HighlightColor = "yellow" | "blue" | "green" | "pink";

const STYLES: Record<HighlightColor, string> = {
  yellow: "bg-yellow-100 border-l-yellow-500",
  blue: "bg-blue-100 border-l-blue-500",
  green: "bg-green-100 border-l-green-500",
  pink: "bg-pink-100 border-l-pink-500",
};

export function HighlightBlockView({ color = "yellow", children }: { color?: HighlightColor; children: ReactNode }) {
  return (
    <div className={cn("my-3 rounded-md border-l-4 px-4 py-3 text-slate-800", STYLES[color])}>
      {children}
    </div>
  );
}
