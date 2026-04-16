"use client";

import type { Value } from "platejs";

import type { ArticleData } from "@heiso/core/components/editor-v2/types";
import { PlateSurface } from "@heiso/core/components/editor-v2/plate/plate-surface";

type ContentPanelProps = {
  article: ArticleData;
  onValueChange?: (v: Value | undefined) => void;
};

export function ContentPanel({ article, onValueChange }: ContentPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <PlateSurface article={article} onValueChange={onValueChange} />
    </div>
  );
}
