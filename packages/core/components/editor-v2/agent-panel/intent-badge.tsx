"use client";

import { cn } from "@heiso/core/lib/utils";

const STYLE: Record<string, { label: string; bg: string; text: string }> = {
  FORMAT: { label: "排版", bg: "bg-blue-100", text: "text-blue-800" },
  URL_MERGE: { label: "整合", bg: "bg-green-100", text: "text-green-800" },
  BEAUTIFY: { label: "美化", bg: "bg-purple-100", text: "text-purple-800" },
  STRUCTURE: { label: "整理", bg: "bg-amber-100", text: "text-amber-800" },
  chat: { label: "對話", bg: "bg-slate-200", text: "text-slate-700" },
};

export function IntentBadge({ intent }: { intent?: string }) {
  if (!intent) return null;
  const s = STYLE[intent] ?? STYLE.chat;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
        s.bg,
        s.text,
      )}
    >
      {s.label} · {intent}
    </span>
  );
}
