"use client";

import { Button } from "@heiso/core/components/ui/button";
import { ChevronLeft, Eye } from "lucide-react";

import { useEditorShellContext } from "./editor-shell.context";

type TopbarProps = {
  onBack?: () => void;
  onPreview?: () => void;
  onSave?: () => void;
  onPublish?: () => void;
};

const SAVE_LABEL: Record<string, string> = {
  idle: "Save",
  saving: "儲存中⋯",
  saved: "✓ 已儲存",
  error: "✕ 失敗",
};

export function Topbar({ onBack, onPreview, onSave, onPublish }: TopbarProps) {
  const { state } = useEditorShellContext();

  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b bg-card px-4 text-foreground">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ChevronLeft className="size-4" />
        Articles
      </Button>
      <div className="h-5 w-px bg-border" />
      <span className="truncate text-sm font-medium" title={state.articleTitle}>
        {state.articleTitle || "Edit Article"}
      </span>
      <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-amber-400" />
        Draft
      </span>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onPreview}>
          <Eye className="size-4" />
          Preview
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          disabled={state.saveStatus === "saving"}
        >
          {SAVE_LABEL[state.saveStatus]}
        </Button>
        <Button size="sm" onClick={onPublish}>
          Publish
        </Button>
      </div>
    </div>
  );
}
