"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@heiso/core/lib/utils";
import type { AgentMessage } from "@heiso/core/components/editor-v2/types";

import { DebugPanel } from "./debug-panel";
import { IntentBadge } from "./intent-badge";

export function AgentMessageList({
  messages,
  pending,
}: {
  messages: AgentMessage[];
  pending: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-3">
      {messages.map((m) => {
        const isUser = m.role === "user";
        return (
          <div
            key={m.id}
            className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}
          >
            {!isUser && m.intent && <IntentBadge intent={m.intent} />}
            <div
              className={cn(
                "max-w-[88%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                isUser
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-muted text-foreground",
              )}
            >
              {m.content}
            </div>
            {!isUser && m.debug && <DebugPanel debug={m.debug} />}
          </div>
        );
      })}
      {pending && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          assistant 打字中⋯
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
