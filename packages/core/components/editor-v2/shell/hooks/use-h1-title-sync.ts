"use client";

import { useEffect } from "react";
import type { Value } from "platejs";

type Node = { type?: string; children?: Array<Node | { text?: string }> };

function extractH1(value: Value): string | null {
  for (const node of value as Node[]) {
    if (node.type === "h1") {
      const text = (node.children || [])
        .map((c) => ("text" in c ? c.text || "" : ""))
        .join("")
        .trim();
      if (text) return text;
    }
  }
  return null;
}

/**
 * 每 2 秒掃 Plate value 抽 H1，若有變化則回呼 onChange。
 * Editor controller 必須提供 children getter。
 */
export function useH1TitleSync(
  getValue: () => Value | undefined,
  currentTitle: string,
  onChange: (title: string) => void,
) {
  useEffect(() => {
    const interval = setInterval(() => {
      const value = getValue();
      if (!value) return;
      const h1 = extractH1(value);
      if (h1 && h1 !== currentTitle) {
        onChange(h1);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [getValue, currentTitle, onChange]);
}
