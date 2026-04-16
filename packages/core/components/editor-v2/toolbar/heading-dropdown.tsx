"use client";

import { useState } from "react";
import { Heading1, Heading2, Pilcrow } from "lucide-react";
import { useEditorRef } from "platejs/react";
import { KEYS } from "platejs";

import { Button } from "@heiso/core/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heiso/core/components/ui/popover";
import { cn } from "@heiso/core/lib/utils";

type HeadingKey = "p" | "h1" | "h2";

const ITEMS: Array<{ key: HeadingKey; label: string; Icon: typeof Pilcrow; type: string }> = [
  { key: "p", label: "段落", Icon: Pilcrow, type: KEYS.p },
  { key: "h1", label: "標題 1", Icon: Heading1, type: "h1" },
  { key: "h2", label: "標題 2", Icon: Heading2, type: "h2" },
];

export function HeadingDropdown() {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);

  const apply = (type: string) => {
    editor.tf.toggleBlock(type);
    editor.tf.focus();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn(open && "bg-accent")}>
          段落樣式
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1">
        {ITEMS.map(({ key, label, Icon, type }) => (
          <button
            key={key}
            type="button"
            onClick={() => apply(type)}
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
