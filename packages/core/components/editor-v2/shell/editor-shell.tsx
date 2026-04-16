"use client";

import { useCallback, useRef } from "react";
import type { Value } from "platejs";

import type { AgentSkill, AiSimulators, ArticleData, SocialPost } from "@heiso/core/components/editor-v2/types";
import { ContentPanel } from "@heiso/core/components/editor-v2/panels/content-panel";
import { MediaPublishPanel } from "@heiso/core/components/editor-v2/panels/media-publish-panel";
import { PageSettingsPanel } from "@heiso/core/components/editor-v2/panels/page-settings-panel";
import { AgentPanelShell } from "@heiso/core/components/editor-v2/agent-panel/agent-panel";

import { EditorShellProvider, useEditorShellContext } from "./editor-shell.context";
import { useDirtyGuard } from "./hooks/use-dirty-guard";
import { useH1TitleSync } from "./hooks/use-h1-title-sync";
import { useSaveShortcut } from "./hooks/use-save-shortcut";
import { LeftNav } from "./left-nav";
import { Topbar } from "./topbar";

type EditorShellProps = {
  article: ArticleData;
  simulators: AiSimulators;
  skills: AgentSkill[];
  socialPosts: SocialPost[];
  onBack?: () => void;
  previewHref: string;
};

function ShellInner({ article, onBack, previewHref }: EditorShellProps) {
  const { state, dispatch, simulators } = useEditorShellContext();
  const editorValueRef = useRef<Value | undefined>(undefined);
  const setEditorValue = useCallback((v: Value | undefined) => {
    editorValueRef.current = v;
  }, []);
  const getEditorValue = useCallback(() => editorValueRef.current, []);

  const handleSave = useCallback(() => {
    dispatch({ type: "SET_SAVE_STATUS", payload: "saving" });
    // 模擬儲存延遲；同時觸發 autoTag simulator 並覆寫 tags
    setTimeout(() => {
      void simulators
        .autoTag({ articleText: state.articleTitle })
        .then(({ tags }) => dispatch({ type: "SET_TAGS", payload: tags }))
        .catch(() => undefined);
      dispatch({ type: "SET_SAVE_STATUS", payload: "saved" });
      dispatch({ type: "SET_DIRTY", payload: false });
      setTimeout(() => dispatch({ type: "SET_SAVE_STATUS", payload: "idle" }), 1800);
    }, 600);
  }, [dispatch, simulators, state.articleTitle]);

  useDirtyGuard(state.isDirty);
  useSaveShortcut(handleSave);
  useH1TitleSync(getEditorValue, state.articleTitle, (next) =>
    dispatch({ type: "SET_TITLE", payload: next }),
  );

  const handlePreview = () => {
    window.open(previewHref, "_blank");
  };
  const handlePublish = () => {
    if (typeof window !== "undefined" && window.confirm("確定要發布嗎？（模擬）")) {
      dispatch({ type: "SET_SAVE_STATUS", payload: "saved" });
      setTimeout(() => dispatch({ type: "SET_SAVE_STATUS", payload: "idle" }), 1800);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <Topbar
        onBack={onBack}
        onPreview={handlePreview}
        onSave={handleSave}
        onPublish={handlePublish}
      />
      <div className="flex min-h-0 flex-1">
        <LeftNav />
        <div className="flex min-w-0 flex-1 flex-col">
          {state.activeTab === "content" && (
            <ContentPanel article={article} onValueChange={setEditorValue} />
          )}
          {state.activeTab === "settings" && <PageSettingsPanel />}
          {state.activeTab === "social" && <MediaPublishPanel />}
        </div>
        <AgentPanelShell />
      </div>
    </div>
  );
}

export function EditorShell(props: EditorShellProps) {
  return (
    <EditorShellProvider
      article={props.article}
      simulators={props.simulators}
      skills={props.skills}
      socialPosts={props.socialPosts}
    >
      <ShellInner {...props} />
    </EditorShellProvider>
  );
}
