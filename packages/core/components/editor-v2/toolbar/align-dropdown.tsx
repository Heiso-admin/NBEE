"use client";

import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { useEditorRef } from "platejs/react";

import { Button } from "@heiso/core/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heiso/core/components/ui/popover";
import { cn } from "@heiso/core/lib/utils";

const ALIGN_BLOCKS = ["p", "h1", "h2", "blockquote"];

const ITEMS = [
  { value: "left", Icon: AlignLeft, label: "靠左" },
  { value: "center", Icon: AlignCenter, label: "置中" },
  { value: "right", Icon: AlignRight, label: "靠右" },
];

export function AlignDropdown() {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);

  const apply = (value: string) => {
    editor.tf.setNodes(
      { align: value } as Record<string, unknown>,
      {
        match: (n) => {
          const type = (n as { type?: string }).type;
          return typeof type === "string" && ALIGN_BLOCKS.includes(type);
        },
      },
    );
    editor.tf.focus();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon_sm"
          title="對齊"
          className={cn(open && "bg-accent")}
        >
          <AlignLeft className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-32 p-1">
        {ITEMS.map(({ value, Icon, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => apply(value)}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
