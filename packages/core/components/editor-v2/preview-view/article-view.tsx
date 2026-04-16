"use client";

import type { ReactNode } from "react";
import type { TElement } from "platejs";

import type { Typography } from "@heiso/core/components/editor-v2/types";
import { DEFAULT_TYPOGRAPHY } from "@heiso/core/components/editor-v2/types";
import { applyTypographyToCssVariables, TYPO_VAR_KEYS } from "@heiso/core/components/editor-v2/plate/typography";

import { CalloutView, type CalloutVariant } from "@heiso/core/components/editor-v2/custom-nodes/callout/callout.view";
import { DataCardItemView, DataCardLabelView, DataCardValueView, DataCardView, type DataCardLayout } from "@heiso/core/components/editor-v2/custom-nodes/data-card/data-card.view";
import { HighlightBlockView, type HighlightColor } from "@heiso/core/components/editor-v2/custom-nodes/highlight-block/highlight-block.view";
import { H2BgWrapper, type H2BgColor } from "@heiso/core/components/editor-v2/custom-nodes/h2-bg/h2-bg.view";
import { ImageView } from "@heiso/core/components/editor-v2/custom-nodes/image/image.view";
import { ImageGalleryView } from "@heiso/core/components/editor-v2/custom-nodes/image-gallery/image-gallery.view";
import { VideoView } from "@heiso/core/components/editor-v2/custom-nodes/video/video.view";
import { MermaidView } from "@heiso/core/components/editor-v2/custom-nodes/mermaid/mermaid.view";

import { useEffect, useRef } from "react";

type NodeLike = Record<string, unknown> & { type?: string; children?: NodeLike[] };

function renderInline(node: NodeLike): ReactNode {
  if ("text" in node && typeof node.text === "string") {
    let el: ReactNode = node.text;
    if (node.bold) el = <strong>{el}</strong>;
    if (node.italic) el = <em>{el}</em>;
    if (node.underline) el = <u>{el}</u>;
    if (node.strikethrough) el = <s>{el}</s>;
    if (node.code)
      el = (
        <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.9em]">{el}</code>
      );
    return el;
  }
  if (node.type === "a") {
    return (
      <a href={node.url as string} className="text-blue-600 underline" target="_blank" rel="noreferrer">
        {(node.children || []).map((c, i) => <span key={i}>{renderInline(c)}</span>)}
      </a>
    );
  }
  return <>{(node.children || []).map((c, i) => <span key={i}>{renderInline(c)}</span>)}</>;
}

function renderChildren(node: NodeLike): ReactNode {
  return (node.children || []).map((c, i) => <RenderNode key={i} node={c} />);
}

function RenderNode({ node }: { node: NodeLike }) {
  // Text leaf — 走 inline 路徑，不產生 block 元素
  if ("text" in node) return <>{renderInline(node)}</>;

  const type = node.type || "p";
  const children = renderChildren(node);

  switch (type) {
    case "h1":
      return <h1 style={{ fontSize: `var(${TYPO_VAR_KEYS.h1Size}, 36px)`, fontWeight: `var(${TYPO_VAR_KEYS.h1Weight}, 900)`, margin: "24px 0 16px", lineHeight: 1.3 }}>{children}</h1>;
    case "h2":
      return <H2BgWrapper bgColor={node.bgColor as H2BgColor}>{children}</H2BgWrapper>;
    case "h3":
      return <p style={{ fontWeight: "bold", fontSize: `var(${TYPO_VAR_KEYS.pSize}, 16px)`, margin: "16px 0 8px" }}>{children}</p>;
    case "blockquote":
      return <blockquote className="my-3 border-l-4 border-slate-300 pl-4 text-slate-500 italic">{children}</blockquote>;
    case "ul":
      return <ul className="my-2 list-disc pl-6">{children}</ul>;
    case "ol":
      return <ol className="my-2 list-decimal pl-6">{children}</ol>;
    case "li":
      return <li className="my-1">{children}</li>;
    case "callout":
      return <CalloutView variant={(node.variant as CalloutVariant) || "info"}>{children}</CalloutView>;
    case "data-card":
      return <DataCardView layout={(node.layout as DataCardLayout) || "grid-3"}>{children}</DataCardView>;
    case "data-card-item":
      return <DataCardItemView>{children}</DataCardItemView>;
    case "data-card-value":
      return <DataCardValueView>{children}</DataCardValueView>;
    case "data-card-label":
      return <DataCardLabelView>{children}</DataCardLabelView>;
    case "highlight-block":
      return <HighlightBlockView color={(node.color as HighlightColor) || "yellow"}>{children}</HighlightBlockView>;
    case "img":
      return <ImageView url={node.url as string} alt={node.alt as string} width={(node.width as number) || 80} />;
    case "image-gallery":
      return <ImageGalleryView images={(node.images as string[]) || []} />;
    case "video":
      return <VideoView url={node.url as string} />;
    case "code_block": {
      const lang = (node.lang as string) || "";
      if (lang === "mermaid") {
        const source = (node.children || [])
          .map((line) => (line.children || []).map((c) => (c.text as string) || "").join(""))
          .join("\n")
          .trim();
        return <MermaidView source={source} />;
      }
      return <pre className="my-3 overflow-x-auto rounded-md bg-slate-900 p-4 font-mono text-[13px] text-slate-100">{children}</pre>;
    }
    case "code_line":
      return <>{children}{"\n"}</>;
    case "table":
      return <table className="my-4 w-full border-collapse"><tbody>{children}</tbody></table>;
    case "tr":
      return <tr>{children}</tr>;
    case "th":
      return <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold">{children}</th>;
    case "td":
      return <td className="border border-slate-200 px-3 py-2">{children}</td>;
    default:
      return <p style={{ fontSize: `var(${TYPO_VAR_KEYS.pSize}, 16px)`, lineHeight: `var(${TYPO_VAR_KEYS.pHeight}, 1.6)`, margin: "8px 0" }}>{(node.children || []).map((c, i) => <span key={i}>{renderInline(c)}</span>)}</p>;
  }
}

export function ArticleView({
  content,
  typography,
  cover,
  title,
}: {
  content: TElement[];
  typography?: Typography;
  cover?: string | null;
  title?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const typo = typography || DEFAULT_TYPOGRAPHY;

  useEffect(() => {
    if (ref.current) applyTypographyToCssVariables(ref.current, typo);
  }, [typo]);

  return (
    <article ref={ref} style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px", color: "#1e293b" }}>
      {cover && (
        <div className="mb-8">
          <img src={cover} alt={title || ""} className="w-full rounded-xl" />
        </div>
      )}
      {content.map((node, i) => (
        <RenderNode key={i} node={node as unknown as NodeLike} />
      ))}
    </article>
  );
}
