"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { useEditorRef, useEditorSelector } from "platejs/react";
import { RangeApi, type TRange } from "platejs";

import { Button } from "@heiso/core/components/ui/button";
import { useEditorShellContext } from "@heiso/core/components/editor-v2/shell/editor-shell.context";

import { DiffPreview } from "./diff-preview";

type ActionKey = "improve" | "shorter" | "longer" | "rephrase";

const ACTIONS: Array<{ key: ActionKey; label: string }> = [
  { key: "improve", label: "改善寫作" },
  { key: "shorter", label: "精簡" },
  { key: "longer", label: "展開" },
  { key: "rephrase", label: "換個說法" },
];

type DiffState = {
  original: string;
  modified: string;
  savedSelection: TRange;
  position: { top: number; left: number };
};

export function AiToolbar({ scrollContainer }: { scrollContainer?: HTMLElement | null }) {
  const editor = useEditorRef();
  const { simulators } = useEditorShellContext();
  const selection = useEditorSelector((e) => e.selection, []);

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  const [diff, setDiff] = useState<DiffState | null>(null);
  const isMouseDown = useRef(false);

  const updatePosition = useCallback(() => {
    if (isMouseDown.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setVisible(false);
      return;
    }
    const text = sel.toString().trim();
    if (!text) {
      setVisible(false);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setVisible(false);
      return;
    }
    const containerRect = scrollContainer?.getBoundingClientRect();
    const topRel = scrollContainer
      ? rect.top - containerRect!.top + scrollContainer.scrollTop
      : rect.top + window.scrollY;
    const leftRel = scrollContainer
      ? rect.left - containerRect!.left + rect.width / 2
      : rect.left + rect.width / 2;
    setPosition({ top: topRel - 48, left: leftRel });
    setVisible(true);
  }, [scrollContainer]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(".diff-preview") || t.closest(".ai-toolbar")) return;
      isMouseDown.current = true;
      if (diff) setDiff(null);
    };
    const onUp = () => {
      isMouseDown.current = false;
      setTimeout(updatePosition, 50);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
    };
  }, [updatePosition, diff]);

  useEffect(() => {
    if (isMouseDown.current || diff) return;
    const t = setTimeout(updatePosition, 120);
    return () => clearTimeout(t);
  }, [selection, updatePosition, diff]);

  const getSelectedText = (): string => {
    if (!selection || RangeApi.isCollapsed(selection)) return "";
    return editor.api.string(selection);
  };

  const handleAction = async (key: ActionKey) => {
    const text = getSelectedText();
    if (!text || !selection) return;
    const savedSelection = JSON.parse(JSON.stringify(selection)) as TRange;
    const savedPosition = { ...position };
    setVisible(false);
    setLoading(true);
    try {
      const fn =
        key === "improve"
          ? simulators.inlineImprove
          : key === "shorter"
            ? simulators.inlineShorter
            : key === "longer"
              ? simulators.inlineLonger
              : simulators.inlineRephrase;
      const { result } = await fn({ text });
      setDiff({
        original: text,
        modified: result,
        savedSelection,
        position: { top: savedPosition.top + 48, left: savedPosition.left },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIllustrate = async () => {
    const text = getSelectedText();
    if (!text || !selection) return;
    const blockIndex = selection.anchor.path[0];
    setVisible(false);
    setLoading(true);
    try {
      const { url, alt } = await simulators.inlineIllustrate({ text });
      const insertAt = Math.min(blockIndex + 1, editor.children.length);
      editor.tf.insertNodes(
        {
          type: "img",
          url,
          alt,
          width: 80,
          children: [{ text: "" }],
        },
        { at: [insertAt] },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!diff) return;
    editor.tf.select(diff.savedSelection);
    editor.tf.delete();
    editor.tf.insertText(diff.modified);
    setDiff(null);
  };

  const handleReject = () => setDiff(null);

  if (loading) {
    return (
      <div
        className="ai-toolbar absolute z-30 flex -translate-x-1/2 items-center gap-2 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow"
        style={{ top: position.top, left: position.left }}
      >
        <Loader2 className="size-3 animate-spin" />
        AI 處理中⋯
      </div>
    );
  }

  if (diff) {
    return (
      <DiffPreview
        original={diff.original}
        modified={diff.modified}
        position={diff.position}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    );
  }

  if (!visible) return null;

  return (
    <div
      className="ai-toolbar absolute z-30 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-popover px-1.5 py-1 text-popover-foreground shadow-lg"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {ACTIONS.map((a) => (
        <Button
          key={a.key}
          variant="ghost"
          size="sm"
          onClick={() => handleAction(a.key)}
        >
          {a.label}
        </Button>
      ))}
      <span className="mx-1 h-4 w-px bg-border" />
      <Button variant="ghost" size="sm" onClick={handleIllustrate}>
        <ImageIcon className="size-3.5" /> 配圖
      </Button>
    </div>
  );
}
