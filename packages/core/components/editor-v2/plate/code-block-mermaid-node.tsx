"use client";

import { PlateElement, type PlateElementProps } from "platejs/react";

import { MermaidView } from "@heiso/core/components/editor-v2/custom-nodes/mermaid/mermaid.view";

/**
 * 取代預設 CodeBlockElement：當 lang='mermaid' 時改渲染 MermaidView，
 * 其餘走預設 pre/code 樣式。
 */
export function CodeBlockMermaidAwareElement(props: PlateElementProps) {
  const lang = (props.element.lang as string | undefined) || "";

  if (lang === "mermaid") {
    const source = (props.element.children as Array<{ children?: Array<{ text?: string }> }>)
      .map((line) => (line.children || []).map((c) => c.text || "").join(""))
      .join("\n")
      .trim();
    return (
      <PlateElement {...props} as="div">
        <div contentEditable={false}>
          <MermaidView source={source} />
        </div>
        <span className="hidden">{props.children}</span>
      </PlateElement>
    );
  }

  return (
    <PlateElement
      {...props}
      as="pre"
      className="my-3 overflow-x-auto rounded-md bg-slate-900 p-4 font-mono text-[13px] text-slate-100"
    >
      {props.children}
    </PlateElement>
  );
}
