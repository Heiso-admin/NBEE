"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

import { Button } from "@heiso/core/components/ui/button";
import { useEditorShellContext } from "@heiso/core/components/editor-v2/shell/editor-shell.context";
import type { AgentMessage } from "@heiso/core/components/editor-v2/types";

import { AgentInput } from "./agent-input";
import { AgentMessageList } from "./agent-message-list";

const INITIAL_MESSAGES: AgentMessage[] = [
  {
    id: "init",
    role: "assistant",
    content: "你好，我是寫作助理。輸入指令或 @ 觸發 skill 即可開始協作。",
    intent: "chat",
  },
];

export function AgentPanelShell() {
  const { state, dispatch, simulators, skills } = useEditorShellContext();
  const [messages, setMessages] = useState<AgentMessage[]>(INITIAL_MESSAGES);
  const [pending, setPending] = useState(false);

  const handleSend = async (text: string) => {
    const userMsg: AgentMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setPending(true);
    try {
      const res = await simulators.agentChat({ message: text, history: messages });
      const assistantMsg: AgentMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: res.reply,
        intent: res.intent,
        debug: res.debug,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setPending(false);
    }
  };

  if (!state.agentPanelOpen) {
    return (
      <button
        type="button"
        onClick={() => dispatch({ type: "SET_AGENT_PANEL", payload: true })}
        className="flex w-9 shrink-0 cursor-pointer items-center justify-center border-l bg-sidebar text-muted-foreground hover:text-amber-500"
      >
        <Sparkles className="size-4" />
      </button>
    );
  }

  return (
    <div className="flex w-96 shrink-0 flex-col border-l bg-sidebar text-sidebar-foreground">
      <div className="flex h-12 items-center justify-between border-b px-4">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4 text-amber-500" />
          AI Agent
        </span>
        <Button
          variant="ghost"
          size="icon_sm"
          onClick={() => dispatch({ type: "SET_AGENT_PANEL", payload: false })}
        >
          <X className="size-4" />
        </Button>
      </div>
      <AgentMessageList messages={messages} pending={pending} />
      <AgentInput skills={skills} pending={pending} onSend={handleSend} />
    </div>
  );
}
