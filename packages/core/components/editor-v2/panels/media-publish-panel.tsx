"use client";

import { useState } from "react";
import { Check, Copy, Megaphone } from "lucide-react";

import { Button } from "@heiso/core/components/ui/button";
import { cn } from "@heiso/core/lib/utils";
import { useEditorShellContext } from "@heiso/core/components/editor-v2/shell/editor-shell.context";
import type { SocialPost } from "@heiso/core/components/editor-v2/types";

const PLATFORM_STYLE: Record<SocialPost["platform"], { ring: string; chip: string }> = {
  threads: { ring: "ring-slate-400", chip: "bg-slate-200 text-slate-700" },
  facebook: { ring: "ring-blue-400", chip: "bg-blue-100 text-blue-700" },
  line: { ring: "ring-green-400", chip: "bg-green-100 text-green-700" },
};

function PostCard({ post }: { post: SocialPost }) {
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const style = PLATFORM_STYLE[post.platform];

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopied("ok");
    } catch {
      setCopied("fail");
    } finally {
      setTimeout(() => setCopied("idle"), 2000);
    }
  };

  return (
    <div className={cn("flex flex-col rounded-lg border bg-card p-4 ring-1", style.ring)}>
      <div className="mb-3 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
            style.chip,
          )}
        >
          <Megaphone className="size-3" />
          {post.label}
        </span>
        <Button size="sm" variant="outline" onClick={onCopy}>
          {copied === "ok" ? (
            <>
              <Check className="size-3" /> 已複製
            </>
          ) : copied === "fail" ? (
            <span className="text-destructive">複製失敗</span>
          ) : (
            <>
              <Copy className="size-3" /> 複製
            </>
          )}
        </Button>
      </div>
      <p className="flex-1 whitespace-pre-wrap text-sm text-foreground">{post.content}</p>
      <div className="mt-3 text-[11px] text-muted-foreground">{post.hint}</div>
    </div>
  );
}

export function MediaPublishPanel() {
  const { socialPosts } = useEditorShellContext();

  return (
    <div className="flex-1 overflow-y-auto bg-background px-12 py-8 text-foreground">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="mb-1 text-lg font-semibold">社群發布</h2>
          <p className="text-xs text-muted-foreground">
            發布後可從這裡取得各平台適合長度的文案。GUI 階段固定示範三個平台。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {socialPosts.map((p) => (
            <PostCard key={p.platform} post={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
