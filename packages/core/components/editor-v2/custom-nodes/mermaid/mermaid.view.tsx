"use client";

import { useEffect, useId, useState } from "react";

export function MermaidView({ source }: { source: string }) {
  const reactId = useId();
  const id = `mermaid-${reactId.replace(/[:]/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(null);
    if (!source.trim()) return;
    void import("mermaid").then(async (mod) => {
      const mermaid = mod.default;
      try {
        mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
        const res = await mermaid.render(`${id}-svg`, source);
        if (!cancelled) setSvg(res.svg);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "render failed");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, source]);

  if (error) {
    return (
      <div className="my-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        圖表無法渲染，請請 AI 重新生成。
      </div>
    );
  }

  return (
    <div className="my-4 flex justify-center">
      {svg ? (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid SVG output
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="text-sm text-slate-400">圖表載入中⋯</div>
      )}
    </div>
  );
}
