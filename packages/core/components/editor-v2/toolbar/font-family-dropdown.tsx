"use client";

import { useState } from "react";
import { CaseUpper } from "lucide-react";
import { useEditorRef } from "platejs/react";

import { Button } from "@heiso/core/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heiso/core/components/ui/popover";
import { cn } from "@heiso/core/lib/utils";

const FONT_FAMILIES = [
  { label: "預設", value: "" },
  { label: "Noto Sans TC", value: "'Noto Sans TC', sans-serif" },
  { label: "Noto Serif TC", value: "'Noto Serif TC', serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Fira Code", value: "'Fira Code', monospace" },
];

export function FontFamilyDropdown() {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);

  const apply = (value: string) => {
    if (value) {
      editor.tf.addMark("fontFamily", value);
    } else {
      editor.tf.removeMark("fontFamily");
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
          title="字體"
          className={cn(open && "bg-accent")}
        >
          <CaseUpper className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44 p-1">
        {FONT_FAMILIES.map((f) => (
          <button
            key={f.value || "default"}
            type="button"
            onClick={() => apply(f.value)}
            className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            style={{ fontFamily: f.value || undefined }}
          >
            {f.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
