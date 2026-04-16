"use client";

import { cn } from "@heiso/core/lib/utils";
import { FileEdit, Megaphone, Settings2 } from "lucide-react";

import { type ActiveTab, useEditorShellContext } from "./editor-shell.context";

const TABS: Array<{ key: ActiveTab; label: string; Icon: typeof FileEdit }> = [
  { key: "content", label: "內容編輯", Icon: FileEdit },
  { key: "settings", label: "頁面設定", Icon: Settings2 },
  { key: "social", label: "社群發布", Icon: Megaphone },
];

export function LeftNav() {
  const { state, dispatch } = useEditorShellContext();

  return (
    <div className="flex w-44 shrink-0 flex-col gap-1 border-r bg-sidebar p-3 text-sidebar-foreground">
      {TABS.map(({ key, label, Icon }) => {
        const active = state.activeTab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => dispatch({ type: "SET_TAB", payload: key })}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
