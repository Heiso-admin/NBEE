"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@heiso/core/components/ui/button";
import { Input } from "@heiso/core/components/ui/input";
import { Textarea } from "@heiso/core/components/ui/textarea";
import { useEditorShellContext } from "@heiso/core/components/editor-v2/shell/editor-shell.context";

const TITLE_MAX = 60;
const DESC_MAX = 155;

export function SeoSection() {
  const { state, dispatch, simulators } = useEditorShellContext();
  const [aiLoading, setAiLoading] = useState(false);

  const handleAi = async () => {
    setAiLoading(true);
    try {
      // 假 articleText：實際 GUI 階段沒接 Plate value 出來，這裡只用 title 摘要
      const articleText = `${state.articleTitle}\n${state.meta.description}`.slice(0, 500);
      const { title, description } = await simulators.seoGenerate({
        articleText,
        title: state.articleTitle,
      });
      dispatch({ type: "SET_META", payload: { title, description } });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">SEO 設定</div>
        <Button size="sm" variant="outline" onClick={handleAi} disabled={aiLoading}>
          <Sparkles className="size-3" />
          {aiLoading ? "生成中⋯" : "AI 生成"}
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Meta Title（{TITLE_MAX} 字以內）
          </label>
          <Input
            value={state.meta.title}
            maxLength={TITLE_MAX}
            onChange={(e) => dispatch({ type: "SET_META", payload: { title: e.target.value } })}
            placeholder={state.articleTitle || "文章標題"}
          />
          <div className="mt-1 text-right text-[11px] text-muted-foreground">
            {state.meta.title.length}/{TITLE_MAX}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Meta Description（{DESC_MAX} 字以內）
          </label>
          <Textarea
            value={state.meta.description}
            maxLength={DESC_MAX}
            rows={3}
            onChange={(e) =>
              dispatch({ type: "SET_META", payload: { description: e.target.value } })
            }
            placeholder="文章摘要"
          />
          <div className="mt-1 text-right text-[11px] text-muted-foreground">
            {state.meta.description.length}/{DESC_MAX}
          </div>
        </div>
      </div>
    </section>
  );
}
