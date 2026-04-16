"use client";

import { useState } from "react";
import { Eraser, Palette } from "lucide-react";
import { useEditorRef } from "platejs/react";

import { Button } from "@heiso/core/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heiso/core/components/ui/popover";
import { cn } from "@heiso/core/lib/utils";

const COLORS = [
  "#000000",
  "#334155",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#64748b",
  "#f43f5e",
];

export function ColorPicker() {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);

  const apply = (color: string | null) => {
    if (color === null) {
      editor.tf.removeMark("color");
    } else {
      editor.tf.addMark("color", color);
    }
    editor.tf.focus();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon_sm"
          title="文字顏色"
          className={cn(open && "bg-accent")}
        >
          <Palette className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44 p-2">
        <div className="grid grid-cols-5 gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => apply(c)}
              className="size-6 rounded border border-border hover:scale-110"
              style={{ background: c }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => apply(null)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded border bg-muted py-1 text-xs text-muted-foreground hover:bg-accent"
        >
          <Eraser className="size-3" />
          清除
        </button>
      </PopoverContent>
    </Popover>
  );
}
