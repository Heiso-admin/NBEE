"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Highlighter,
  Image as ImageIcon,
  Images,
  Palette,
  Plus,
  Quote,
  Video,
  Workflow,
} from "lucide-react";
import { useEditorRef } from "platejs/react";
import type { TElement } from "platejs";

import { Button } from "@heiso/core/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heiso/core/components/ui/popover";
import { cn } from "@heiso/core/lib/utils";

type InsertItem = {
  key: string;
  label: string;
  Icon: typeof ImageIcon;
  build: () => TElement;
};

const ITEMS: InsertItem[] = [
  {
    key: "callout",
    label: "提示框 (Callout)",
    Icon: AlertTriangle,
    build: () => ({ type: "callout", variant: "info", children: [{ text: "重要提醒" }] } as TElement),
  },
  {
    key: "data-card",
    label: "數據卡片 (Data Card)",
    Icon: BarChart3,
    build: () =>
      ({
        type: "data-card",
        layout: "grid-3",
        children: [1, 2, 3].map((i) => ({
          type: "data-card-item",
          children: [
            { type: "data-card-value", children: [{ text: `${i * 10}%` }] },
            { type: "data-card-label", children: [{ text: `指標 ${i}` }] },
          ],
        })),
      } as TElement),
  },
  {
    key: "highlight-block",
    label: "螢光標記",
    Icon: Highlighter,
    build: () =>
      ({
        type: "highlight-block",
        color: "yellow",
        children: [{ text: "金句或重點" }],
      } as TElement),
  },
  {
    key: "h2-bg",
    label: "H2 + 背景色",
    Icon: Palette,
    build: () =>
      ({
        type: "h2",
        bgColor: "blue",
        children: [{ text: "章節標題" }],
      } as TElement),
  },
  {
    key: "img",
    label: "圖片",
    Icon: ImageIcon,
    build: () =>
      ({
        type: "img",
        url: "https://picsum.photos/seed/inserted/1200/800",
        alt: "圖片",
        width: 80,
        children: [{ text: "" }],
      } as unknown as TElement),
  },
  {
    key: "image-gallery",
    label: "圖片輪播",
    Icon: Images,
    build: () =>
      ({
        type: "image-gallery",
        images: [1, 2, 3].map((i) =>
          `https://picsum.photos/seed/inserted-gallery-${i}/1200/800`,
        ),
        children: [{ text: "" }],
      } as unknown as TElement),
  },
  {
    key: "video",
    label: "影片",
    Icon: Video,
    build: () =>
      ({
        type: "video",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        children: [{ text: "" }],
      } as unknown as TElement),
  },
  {
    key: "mermaid",
    label: "Mermaid 圖表",
    Icon: Workflow,
    build: () =>
      ({
        type: "code_block",
        lang: "mermaid",
        children: [
          { type: "code_line", children: [{ text: "flowchart LR" }] },
          { type: "code_line", children: [{ text: "  A[Start] --> B[End]" }] },
        ],
      } as unknown as TElement),
  },
  {
    key: "blockquote",
    label: "引言",
    Icon: Quote,
    build: () => ({ type: "blockquote", children: [{ text: "引言內容" }] } as TElement),
  },
];

export function InsertDropdown() {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);

  const insert = (item: InsertItem) => {
    editor.tf.insertNodes(item.build());
    editor.tf.focus();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn(open && "bg-accent")}>
          <Plus className="size-4" />
          插入
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        {ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => insert(item)}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
          >
            <item.Icon className="size-4 text-muted-foreground" />
            {item.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
