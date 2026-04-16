"use client";

import type { ReactNode } from "react";

import { cn } from "@heiso/core/lib/utils";

export type CalloutVariant = "info" | "success" | "warning" | "tip";

const STYLES: Record<CalloutVariant, { border: string; bg: string; icon: string }> = {
  info: { border: "border-l-blue-500", bg: "bg-blue-50", icon: "ℹ️" },
  success: { border: "border-l-green-500", bg: "bg-green-50", icon: "✅" },
  warning: { border: "border-l-amber-500", bg: "bg-amber-50", icon: "⚠️" },
  tip: { border: "border-l-purple-500", bg: "bg-purple-50", icon: "💡" },
};

export function CalloutView({ variant, children }: { variant: CalloutVariant; children: ReactNode }) {
  const s = STYLES[variant] ?? STYLES.info;
  return (
    <div
      className={cn(
        "my-4 flex gap-3 rounded-r-md border-l-4 px-4 py-3 text-slate-800",
        s.border,
        s.bg,
      )}
    >
      <span className="select-none text-lg leading-none" contentEditable={false}>
        {s.icon}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
