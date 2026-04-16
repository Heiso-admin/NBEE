"use client";

import type { CSSProperties, ReactNode } from "react";

export type H2BgColor = "blue" | "dark" | "gradient" | undefined;

const STYLES: Record<NonNullable<H2BgColor>, CSSProperties> = {
  blue: {
    background: "linear-gradient(135deg, #1e40af, #3b82f6)",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "8px",
  },
  dark: {
    background: "linear-gradient(135deg, #1e293b, #334155)",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "8px",
  },
  gradient: {
    background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "8px",
  },
};

export function H2BgWrapper({ bgColor, children }: { bgColor?: H2BgColor; children: ReactNode }) {
  const style: CSSProperties = {
    fontSize: "var(--ev2-h2-size, 28px)",
    fontWeight: "var(--ev2-h2-weight, 700)" as unknown as number,
    margin: "28px 0 16px",
    ...(bgColor ? STYLES[bgColor] : {}),
  };
  return <div style={style}>{children}</div>;
}
