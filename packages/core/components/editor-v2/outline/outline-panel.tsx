"use client";

import { useMemo } from "react";
import { ChevronRight, X } from "lucide-react";
import { useEditorSelector } from "platejs/react";

import { Button } from "@heiso/core/components/ui/button";
import { cn } from "@heiso/core/lib/utils";
import { useEditorShellContext } from "@heiso/core/components/editor-v2/shell/editor-shell.context";

type OutlineItem = {
  level: 1 | 2;
  text: string;
  index: number;
};

function extractOutline(value: unknown): OutlineItem[] {
  if (!Array.isArray(value)) return [];
  const items: OutlineItem[] = [];
  value.forEach((node, index) => {
    if (!node || typeof node !== "object") return;
    const type = (node as { type?: string }).type;
    if (type === "h1" || type === "h2") {
      const children = (node as { children?: Array<{ text?: string }> }).children || [];
      const text = children.map((c) => c.text || "").join("").trim();
      if (text) items.push({ level: type === "h1" ? 1 : 2, text, index });
    }
  });
  return items;
}

export function OutlinePanel() {
  const { state, dispatch } = useEditorShellContext();
  const value = useEditorSelector((e) => e.children, []);

  const items = useMemo(() => extractOutline(value), [value]);

  if (!state.outlinePanelOpen) return null;

  const handleJump = (index: number) => {
    // 找到對應 DOM 節點：Plate render 後 data-slate-node 對應 children
    const root = document.querySelector(".editor-v2-canvas");
    if (!root) return;
    const blocks = root.querySelectorAll<HTMLElement>("[data-slate-node='element']");
    // top-level blocks 是直接 children — 但 plate 可能 wrap，過濾出深度相符
    const topBlocks = Array.from(blocks).filter(
      (el) => el.closest("[data-slate-node='element'] [data-slate-node='element']") !== el,
    );
    const target = topBlocks[index];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.style.transition = "background 0.5s";
      target.style.background = "rgba(251, 191, 36, 0.3)";
      setTimeout(() => {
        target.style.background = "";
      }, 600);
    }
  };

  return (
    <div className="absolute top-12 right-4 z-30 w-64 rounded-lg border bg-popover text-popover-foreground shadow-lg">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-semibold">段落導航</span>
        <Button
          variant="ghost"
          size="icon_sm"
          onClick={() => dispatch({ type: "TOGGLE_OUTLINE_PANEL" })}
        >
          <X className="size-3" />
        </Button>
      </div>
      <div className="max-h-80 overflow-y-auto p-1">
        {items.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-muted-foreground">
            尚未有 H1 / H2 標題
          </div>
        ) : (
          items.map((item, i) => (
            <button
              key={`${item.index}-${i}`}
              type="button"
              onClick={() => handleJump(item.index)}
              className={cn(
                "flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
                item.level === 2 && "pl-6 text-muted-foreground",
              )}
            >
              <ChevronRight className="size-3 shrink-0" />
              <span className="truncate">{item.text}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
