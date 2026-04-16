import type { TElement } from "platejs";

export type Typography = {
  h1Size: number;
  h1Weight: 500 | 700 | 900;
  h2Size: number;
  h2Weight: 500 | 700 | 900;
  pSize: number;
  pHeight: number;
  accent: string;
};

export const DEFAULT_TYPOGRAPHY: Typography = {
  h1Size: 36,
  h1Weight: 900,
  h2Size: 28,
  h2Weight: 700,
  pSize: 16,
  pHeight: 1.6,
  accent: "#3b82f6",
};

export type ArticleData = {
  id: string;
  title: string;
  language: string;
  cover_image: string | null;
  meta_title: string;
  meta_description: string;
  tags: string[];
  typography: Typography;
  content: TElement[];
};

export type Photo = {
  id: string;
  src: string;
  thumb: string;
  alt: string;
};

export type AgentMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  debug?: AgentDebug;
};

export type AgentDebug = {
  model: string;
  l0: string;
  l1: string;
  l2: string;
  actualPrompt: string;
  actualReply: string;
};

export type AgentSkill = {
  key: string;
  name: string;
  description: string;
  color: string;
};

export type SocialPlatform = "threads" | "facebook" | "line";

export type SocialPost = {
  platform: SocialPlatform;
  label: string;
  content: string;
  hint: string;
};

export type AiSimulator<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

export type InlineAiInput = { text: string; agentStyle?: string };
export type InlineAiOutput = { result: string };

export type IllustrateInput = { text: string };
export type IllustrateOutput = { url: string; alt: string };

export type CoverGenerateInput = { title: string };
export type CoverGenerateOutput = { url: string };

export type SearchPhotosInput = { query: string };
export type SearchPhotosOutput = { photos: Photo[]; searchQuery: string };

export type SeoGenerateInput = { articleText: string; title: string };
export type SeoGenerateOutput = { title: string; description: string };

export type AutoTagInput = { articleText: string };
export type AutoTagOutput = { tags: string[] };

export type MermaidRegenerateInput = { context?: string };
export type MermaidRegenerateOutput = { source: string };

export type AgentChatInput = { message: string; history: AgentMessage[] };
export type AgentChatOutput = { reply: string; intent: string; debug: AgentDebug };

export type AiSimulators = {
  inlineImprove: AiSimulator<InlineAiInput, InlineAiOutput>;
  inlineShorter: AiSimulator<InlineAiInput, InlineAiOutput>;
  inlineLonger: AiSimulator<InlineAiInput, InlineAiOutput>;
  inlineRephrase: AiSimulator<InlineAiInput, InlineAiOutput>;
  inlineIllustrate: AiSimulator<IllustrateInput, IllustrateOutput>;
  coverGenerate: AiSimulator<CoverGenerateInput, CoverGenerateOutput>;
  searchPhotos: AiSimulator<SearchPhotosInput, SearchPhotosOutput>;
  seoGenerate: AiSimulator<SeoGenerateInput, SeoGenerateOutput>;
  autoTag: AiSimulator<AutoTagInput, AutoTagOutput>;
  mermaidRegenerate: AiSimulator<MermaidRegenerateInput, MermaidRegenerateOutput>;
  agentChat: AiSimulator<AgentChatInput, AgentChatOutput>;
};
