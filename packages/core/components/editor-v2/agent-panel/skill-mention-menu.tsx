"use client";

import { useEffect, useRef } from "react";

import type { AgentSkill } from "@heiso/core/components/editor-v2/types";

export function SkillMentionMenu({
  skills,
  query,
  onSelect,
  onClose,
  anchorRect,
}: {
  skills: AgentSkill[];
  query: string;
  onSelect: (skill: AgentSkill) => void;
  onClose: () => void;
  anchorRect: DOMRect | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  const filtered = query
    ? skills.filter(
        (s) =>
          s.key.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase()),
      )
    : skills;

  if (filtered.length === 0) return null;
  if (!anchorRect) return null;

  return (
    <div
      ref={ref}
      className="fixed z-40 w-60 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg"
      style={{
        top: anchorRect.top - 8,
        left: anchorRect.left,
        transform: "translateY(-100%)",
      }}
    >
      <div className="border-b bg-muted/40 px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        @ Skill
      </div>
      {filtered.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => onSelect(s)}
          className="flex w-full items-start gap-2 px-2 py-1.5 text-left hover:bg-accent"
        >
          <span
            className="mt-1 size-2 shrink-0 rounded-full"
            style={{ background: s.color }}
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{s.name}</div>
            <div className="truncate text-[11px] text-muted-foreground">{s.description}</div>
          </div>
          <span className="shrink-0 text-[10px] font-mono text-muted-foreground">
            {s.key}
          </span>
        </button>
      ))}
    </div>
  );
}
