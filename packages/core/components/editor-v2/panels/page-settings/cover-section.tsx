"use client";

import { useState } from "react";
import { Search, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@heiso/core/components/ui/button";
import { Input } from "@heiso/core/components/ui/input";
import { useEditorShellContext } from "@heiso/core/components/editor-v2/shell/editor-shell.context";
import type { Photo } from "@heiso/core/components/editor-v2/types";

export function CoverSection() {
  const { state, dispatch, simulators } = useEditorShellContext();
  const [aiLoading, setAiLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Photo[]>([]);

  const handleAi = async () => {
    setAiLoading(true);
    try {
      const { url } = await simulators.coverGenerate({ title: state.articleTitle });
      dispatch({ type: "SET_COVER", payload: url });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    setResults([]);
    try {
      const q = query.trim() || state.articleTitle || "technology";
      const { photos } = await simulators.searchPhotos({ query: q });
      setResults(photos);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePick = (p: Photo) => {
    dispatch({ type: "SET_COVER", payload: p.src });
    setResults([]);
  };

  return (
    <section>
      <div className="mb-3 text-sm font-semibold">封面圖</div>
      {state.coverImage ? (
        <div className="relative mb-3">
          <img
            src={state.coverImage}
            alt="封面圖"
            className="w-full rounded-md border"
          />
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_COVER", payload: null })}
            className="absolute top-2 right-2 rounded-md border bg-background/90 px-2 py-0.5 text-xs hover:bg-muted"
          >
            <Trash2 className="mr-1 inline size-3" />
            移除
          </button>
        </div>
      ) : (
        <div className="mb-3 rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
          尚無封面圖
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={handleAi} disabled={aiLoading}>
          <Sparkles className="size-3.5" />
          {aiLoading ? "生成中⋯" : "AI 生成"}
        </Button>
        <div className="flex items-center gap-1 rounded-md border bg-background pr-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={state.articleTitle || "搜尋關鍵字"}
            className="h-7 w-32 border-0 text-xs focus-visible:ring-0"
          />
          <Button
            variant="ghost"
            size="icon_sm"
            onClick={handleSearch}
            disabled={searchLoading}
          >
            <Search className="size-3" />
          </Button>
        </div>
      </div>
      {results.length > 0 && (
        <div className="mt-3 space-y-1">
          <div className="grid grid-cols-3 gap-2">
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePick(p)}
                className="overflow-hidden rounded-md border-2 border-transparent hover:border-primary"
              >
                <img
                  src={p.thumb}
                  alt={p.alt}
                  className="block aspect-[3/2] w-full object-cover"
                />
              </button>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground">Photos by Unsplash</div>
        </div>
      )}
    </section>
  );
}
