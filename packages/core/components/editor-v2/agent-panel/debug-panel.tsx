"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@heiso/core/lib/utils";
import type { AgentDebug } from "@heiso/core/components/editor-v2/types";

function Section({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded border bg-background">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-2 py-1 text-left text-[11px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <span>{title}</span>
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
      </button>
      {open && (
        <pre className="max-h-32 overflow-auto whitespace-pre-wrap border-t px-2 py-1.5 font-mono text-[11px] text-foreground/80">
          {body}
        </pre>
      )}
    </div>
  );
}

export function DebugPanel({ debug }: { debug: AgentDebug }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground",
        )}
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        Debug · {debug.model}
      </button>
      {open && (
        <div className="mt-1.5 space-y-1.5 rounded-md border bg-muted/50 p-2">
          <Section title="L0 排版" body={debug.l0} />
          <Section title="L1 基礎" body={debug.l1} />
          <Section title="L2 Agent" body={debug.l2} />
          <Section title="Actual Prompt" body={debug.actualPrompt} />
          <Section title="Actual Reply" body={debug.actualReply} />
        </div>
      )}
    </div>
  );
}
