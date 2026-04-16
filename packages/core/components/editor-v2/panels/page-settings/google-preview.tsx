"use client";

import { useEditorShellContext } from "@heiso/core/components/editor-v2/shell/editor-shell.context";

export function GooglePreview() {
  const { state } = useEditorShellContext();
  const title = state.meta.title || state.articleTitle || "文章標題";
  const description = state.meta.description || "文章摘要會顯示在這裡⋯";

  return (
    <section>
      <div className="mb-3 text-sm font-semibold">Google 搜尋預覽</div>
      <div className="rounded-md border bg-background p-3">
        <div className="truncate text-base text-blue-600">{title}</div>
        <div className="text-[11px] text-emerald-700">https://example.com/articles/{state.articleId}</div>
        <div
          className="mt-1 text-xs text-muted-foreground"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </div>
      </div>
    </section>
  );
}
