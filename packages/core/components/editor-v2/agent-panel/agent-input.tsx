"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@heiso/core/components/ui/button";
import type { AgentSkill } from "@heiso/core/components/editor-v2/types";

import { SkillMentionMenu } from "./skill-mention-menu";

export function AgentInput({
  skills,
  pending,
  onSend,
}: {
  skills: AgentSkill[];
  pending: boolean;
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionAnchor, setMentionAnchor] = useState<DOMRect | null>(null);

  const submit = () => {
    const text = value.trim();
    if (!text || pending) return;
    onSend(text);
    setValue("");
    setMentionQuery(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // Detect @mention
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    const caret = ta.selectionStart;
    const before = value.slice(0, caret);
    const m = before.match(/@([\w-]*)$/);
    if (m) {
      setMentionQuery(m[1] || "");
      const rect = ta.getBoundingClientRect();
      setMentionAnchor(rect);
    } else {
      setMentionQuery(null);
    }
  }, [value]);

  const insertSkill = (s: AgentSkill) => {
    const ta = taRef.current;
    if (!ta) return;
    const caret = ta.selectionStart;
    const before = value.slice(0, caret).replace(/@([\w-]*)$/, "");
    const after = value.slice(caret);
    setValue(`${before}@${s.key} ${after}`);
    setMentionQuery(null);
    requestAnimationFrame(() => ta.focus());
  };

  return (
    <div className="border-t bg-card p-2">
      <div className="relative flex items-end gap-2">
        <textarea
          ref={taRef}
          rows={3}
          value={value}
          disabled={pending}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="輸入訊息（Enter 送出，Shift+Enter 換行，@ 觸發 skill）"
          className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 disabled:opacity-50"
        />
        <Button size="sm" onClick={submit} disabled={pending || !value.trim()}>
          <Send className="size-4" />
        </Button>
      </div>
      {mentionQuery !== null && (
        <SkillMentionMenu
          skills={skills}
          query={mentionQuery}
          anchorRect={mentionAnchor}
          onClose={() => setMentionQuery(null)}
          onSelect={insertSkill}
        />
      )}
    </div>
  );
}
