"use client";

import { useState } from "react";
import {
  Bold,
  Code,
  Italic,
  Link,
  List as ListIcon,
  ListOrdered,
  Minus,
  Plus,
  Quote,
  Strikethrough,
  Table as TableIcon,
  Underline,
} from "lucide-react";
import { useEditorRef } from "platejs/react";
import { KEYS } from "platejs";

import { Button } from "@heiso/core/components/ui/button";

import { useEditorShellContext } from "@heiso/core/components/editor-v2/shell/editor-shell.context";
import { AlignDropdown } from "./align-dropdown";
import { ColorPicker } from "./color-picker";
import { FontFamilyDropdown } from "./font-family-dropdown";
import { HeadingDropdown } from "./heading-dropdown";
import { InsertDropdown } from "./insert-dropdown";
import { TypographyPanel } from "./typography-panel";

const FONT_SIZE_BOUND = { min: 8, max: 72, step: 2 };

export function Toolbar() {
  const editor = useEditorRef();
  const { dispatch } = useEditorShellContext();
  const [fontSize, setFontSize] = useState(16);

  const toggleMark = (key: string) => {
    editor.tf.toggleMark(key);
    editor.tf.focus();
  };

  const applyFontSize = (next: number) => {
    const clamped = Math.max(FONT_SIZE_BOUND.min, Math.min(FONT_SIZE_BOUND.max, next));
    setFontSize(clamped);
    editor.tf.addMark("fontSize", `${clamped}px`);
    editor.tf.focus();
  };

  const insertLink = () => {
    const url = window.prompt("輸入連結 URL：");
    if (!url) return;
    editor.tf.insertNodes({
      type: "a",
      url,
      children: [{ text: url }],
    });
    editor.tf.focus();
  };

  const toggleList = (type: typeof KEYS.ul | typeof KEYS.ol) => {
    editor.tf.toggleBlock(type);
    editor.tf.focus();
  };

  const insertBlock = (type: string) => {
    editor.tf.insertNodes({ type, children: [{ text: "" }] });
    editor.tf.focus();
  };

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b bg-background px-4 py-2 text-foreground">
      {/* 字級 -/N/+ */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon_sm"
          title="縮小字體"
          onClick={() => applyFontSize(fontSize - FONT_SIZE_BOUND.step)}
        >
          <Minus className="size-3" />
        </Button>
        <span className="w-8 text-center text-xs font-semibold tabular-nums">{fontSize}</span>
        <Button
          variant="ghost"
          size="icon_sm"
          title="放大字體"
          onClick={() => applyFontSize(fontSize + FONT_SIZE_BOUND.step)}
        >
          <Plus className="size-3" />
        </Button>
      </div>

      <div className="mx-1 h-5 w-px bg-border" />

      {/* Marks */}
      <Button variant="ghost" size="icon_sm" title="Bold" onClick={() => toggleMark("bold")}>
        <Bold className="size-4" />
      </Button>
      <Button variant="ghost" size="icon_sm" title="Italic" onClick={() => toggleMark("italic")}>
        <Italic className="size-4" />
      </Button>
      <Button variant="ghost" size="icon_sm" title="Underline" onClick={() => toggleMark("underline")}>
        <Underline className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon_sm"
        title="Strikethrough"
        onClick={() => toggleMark("strikethrough")}
      >
        <Strikethrough className="size-4" />
      </Button>
      <Button variant="ghost" size="icon_sm" title="Inline code" onClick={() => toggleMark("code")}>
        <Code className="size-4" />
      </Button>

      <div className="mx-1 h-5 w-px bg-border" />

      <ColorPicker />
      <FontFamilyDropdown />
      <AlignDropdown />

      <div className="mx-1 h-5 w-px bg-border" />

      {/* Block tools */}
      <Button variant="ghost" size="icon_sm" title="連結" onClick={insertLink}>
        <Link className="size-4" />
      </Button>
      <Button variant="ghost" size="icon_sm" title="無序清單" onClick={() => toggleList(KEYS.ul)}>
        <ListIcon className="size-4" />
      </Button>
      <Button variant="ghost" size="icon_sm" title="有序清單" onClick={() => toggleList(KEYS.ol)}>
        <ListOrdered className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon_sm"
        title="引言"
        onClick={() => editor.tf.toggleBlock(KEYS.blockquote)}
      >
        <Quote className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon_sm"
        title="表格"
        onClick={() => insertBlock("table")}
      >
        <TableIcon className="size-4" />
      </Button>

      <div className="mx-1 h-5 w-px bg-border" />

      <InsertDropdown />
      <TypographyPanel />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => dispatch({ type: "TOGGLE_OUTLINE_PANEL" })}
        title="段落導航"
      >
        ¶ 導航
      </Button>

      <div className="ml-auto" />
      <HeadingDropdown />
    </div>
  );
}
