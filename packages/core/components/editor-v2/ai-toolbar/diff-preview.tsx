"use client";

import { useMemo } from "react";
import { diffWords } from "diff";
import { Check, X } from "lucide-react";

import { Button } from "@heiso/core/components/ui/button";

export function DiffPreview({
  original,
  modified,
  onAccept,
  onReject,
  position,
}: {
  original: string;
  modified: string;
  onAccept: () => void;
  onReject: () => void;
  position: { top: number; left: number };
}) {
  const segments = useMemo(() => diffWords(original, modified), [original, modified]);

  return (
    <div
      className="diff-preview absolute z-30 w-[420px] max-w-[80vw] -translate-x-1/2 rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="mb-2 text-xs font-semibold text-muted-foreground">AI 改寫預覽</div>
      <div className="max-h-48 overflow-y-auto rounded-md border bg-background p-2 text-sm leading-relaxed">
        {segments.map((seg, i) => {
          if (seg.added) {
            return (
              <span key={i} className="bg-emerald-100 text-emerald-900">
                {seg.value}
              </span>
            );
          }
          if (seg.removed) {
            return (
              <span key={i} className="bg-red-100 text-red-700 line-through">
                {seg.value}
              </span>
            );
          }
          return (
            <span key={i} className="text-foreground">
              {seg.value}
            </span>
          );
        })}
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onReject}>
          <X className="size-3" /> 取消
        </Button>
        <Button size="sm" onClick={onAccept}>
          <Check className="size-3" /> 接受
        </Button>
      </div>
    </div>
  );
}
