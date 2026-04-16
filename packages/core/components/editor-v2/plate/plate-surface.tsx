"use client";

import { useEffect, useRef, useState } from "react";
import { Plate, usePlateEditor } from "platejs/react";
import type { Value } from "platejs";

import { Editor, EditorContainer } from "@heiso/core/components/ui/editor";
import { AiToolbar } from "@heiso/core/components/editor-v2/ai-toolbar/ai-toolbar";
import { OutlinePanel } from "@heiso/core/components/editor-v2/outline/outline-panel";
import { Toolbar } from "@heiso/core/components/editor-v2/toolbar/toolbar";
import type { ArticleData } from "@heiso/core/components/editor-v2/types";
import { useEditorShellContext } from "@heiso/core/components/editor-v2/shell/editor-shell.context";

import { EditorV2Kit } from "./editor-v2-kit";
import { applyTypographyToCssVariables } from "./typography";

type PlateSurfaceProps = {
  article: ArticleData;
  onValueChange?: (value: Value | undefined) => void;
};

export function PlateSurface({ article, onValueChange }: PlateSurfaceProps) {
  const { state } = useEditorShellContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  const editor = usePlateEditor({
    plugins: EditorV2Kit,
    value: article.content as Value,
  });

  useEffect(() => {
    if (containerRef.current) {
      applyTypographyToCssVariables(containerRef.current, state.typography);
    }
  }, [state.typography]);

  useEffect(() => {
    setScrollEl(containerRef.current?.closest("[class*='overflow-y']") as HTMLElement ?? null);
  }, []);

  return (
    <Plate
      editor={editor}
      onChange={({ value }) => {
        onValueChange?.(value);
      }}
    >
      <Toolbar />
      <div ref={containerRef} className="relative flex-1 overflow-y-auto px-12 py-8">
        <div className="editor-v2-canvas mx-auto max-w-3xl rounded-lg bg-white text-slate-900 shadow-sm ring-1 ring-border">
          <div className="px-10 py-8">
            <EditorContainer className="min-h-[600px]">
              <Editor variant="default" />
            </EditorContainer>
          </div>
        </div>
        <AiToolbar scrollContainer={scrollEl} />
        <OutlinePanel />
      </div>
    </Plate>
  );
}
