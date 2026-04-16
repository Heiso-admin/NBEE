"use client";

import { type KeyboardEvent, useState } from "react";
import { X } from "lucide-react";

import { Input } from "@heiso/core/components/ui/input";
import { useEditorShellContext } from "@heiso/core/components/editor-v2/shell/editor-shell.context";

export function TagsSection() {
  const { state, dispatch } = useEditorShellContext();
  const [draft, setDraft] = useState("");

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const v = draft.trim();
    if (!v) return;
    dispatch({ type: "ADD_TAG", payload: v });
    setDraft("");
  };

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">Tags</div>
        <span className="text-[10px] text-muted-foreground">儲存時 AI 自動萃取</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {state.tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-xs"
          >
            {t}
            <button
              type="button"
              onClick={() => dispatch({ type: "REMOVE_TAG", payload: t })}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder="新增 tag 後 Enter"
          className="h-7 w-32 text-xs"
        />
      </div>
    </section>
  );
}
