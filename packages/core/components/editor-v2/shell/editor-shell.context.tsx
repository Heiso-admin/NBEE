"use client";

import { createContext, type Dispatch, type ReactNode, useContext, useMemo, useReducer } from "react";

import {
  type AgentSkill,
  type AiSimulators,
  type ArticleData,
  DEFAULT_TYPOGRAPHY,
  type Photo,
  type SocialPost,
  type Typography,
} from "@heiso/core/components/editor-v2/types";

export type ActiveTab = "content" | "settings" | "social";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type ImagePopoverState = {
  open: boolean;
  nodeId: string | null;
  searchPhotos: Photo[];
};

export type InlineAiState = {
  visible: boolean;
  loading: boolean;
  position: { top: number; left: number };
  diff: { original: string; modified: string } | null;
};

export type ShellState = {
  articleId: string;
  articleTitle: string;
  language: string;
  activeTab: ActiveTab;
  coverImage: string | null;
  meta: { title: string; description: string };
  tags: string[];
  typography: Typography;
  agentPanelOpen: boolean;
  outlinePanelOpen: boolean;
  saveStatus: SaveStatus;
  isDirty: boolean;
  inlineAi: InlineAiState;
  imagePopover: ImagePopoverState;
};

export type ShellAction =
  | { type: "SET_TAB"; payload: ActiveTab }
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_COVER"; payload: string | null }
  | { type: "SET_META"; payload: Partial<{ title: string; description: string }> }
  | { type: "SET_TAGS"; payload: string[] }
  | { type: "ADD_TAG"; payload: string }
  | { type: "REMOVE_TAG"; payload: string }
  | { type: "SET_TYPOGRAPHY"; payload: Typography }
  | { type: "RESET_TYPOGRAPHY" }
  | { type: "TOGGLE_AGENT_PANEL" }
  | { type: "SET_AGENT_PANEL"; payload: boolean }
  | { type: "TOGGLE_OUTLINE_PANEL" }
  | { type: "SET_SAVE_STATUS"; payload: SaveStatus }
  | { type: "SET_DIRTY"; payload: boolean }
  | { type: "SET_INLINE_AI"; payload: Partial<InlineAiState> }
  | { type: "SET_IMAGE_POPOVER"; payload: Partial<ImagePopoverState> };

function reducer(state: ShellState, action: ShellAction): ShellState {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_TITLE":
      return { ...state, articleTitle: action.payload };
    case "SET_COVER":
      return { ...state, coverImage: action.payload, isDirty: true };
    case "SET_META":
      return { ...state, meta: { ...state.meta, ...action.payload }, isDirty: true };
    case "SET_TAGS":
      return { ...state, tags: action.payload };
    case "ADD_TAG":
      if (state.tags.includes(action.payload)) return state;
      return { ...state, tags: [...state.tags, action.payload] };
    case "REMOVE_TAG":
      return { ...state, tags: state.tags.filter((t) => t !== action.payload) };
    case "SET_TYPOGRAPHY":
      return { ...state, typography: action.payload };
    case "RESET_TYPOGRAPHY":
      return { ...state, typography: DEFAULT_TYPOGRAPHY };
    case "TOGGLE_AGENT_PANEL":
      return { ...state, agentPanelOpen: !state.agentPanelOpen };
    case "SET_AGENT_PANEL":
      return { ...state, agentPanelOpen: action.payload };
    case "TOGGLE_OUTLINE_PANEL":
      return { ...state, outlinePanelOpen: !state.outlinePanelOpen };
    case "SET_SAVE_STATUS":
      return { ...state, saveStatus: action.payload };
    case "SET_DIRTY":
      return { ...state, isDirty: action.payload };
    case "SET_INLINE_AI":
      return { ...state, inlineAi: { ...state.inlineAi, ...action.payload } };
    case "SET_IMAGE_POPOVER":
      return { ...state, imagePopover: { ...state.imagePopover, ...action.payload } };
    default:
      return state;
  }
}

function createInitialState(article: ArticleData): ShellState {
  return {
    articleId: article.id,
    articleTitle: article.title,
    language: article.language,
    activeTab: "content",
    coverImage: article.cover_image,
    meta: { title: article.meta_title, description: article.meta_description },
    tags: article.tags,
    typography: article.typography,
    agentPanelOpen: true,
    outlinePanelOpen: false,
    saveStatus: "idle",
    isDirty: false,
    inlineAi: { visible: false, loading: false, position: { top: 0, left: 0 }, diff: null },
    imagePopover: { open: false, nodeId: null, searchPhotos: [] },
  };
}

type ShellContextValue = {
  state: ShellState;
  dispatch: Dispatch<ShellAction>;
  simulators: AiSimulators;
  skills: AgentSkill[];
  socialPosts: SocialPost[];
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function EditorShellProvider({
  article,
  simulators,
  skills,
  socialPosts,
  children,
}: {
  article: ArticleData;
  simulators: AiSimulators;
  skills: AgentSkill[];
  socialPosts: SocialPost[];
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, article, createInitialState);
  const value = useMemo(
    () => ({ state, dispatch, simulators, skills, socialPosts }),
    [state, simulators, skills, socialPosts],
  );
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useEditorShellContext() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useEditorShellContext must be used inside EditorShellProvider");
  return ctx;
}
