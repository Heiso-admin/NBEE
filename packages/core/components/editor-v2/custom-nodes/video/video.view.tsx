"use client";

import { useState } from "react";

function parseEmbed(url: string): { type: "youtube" | "vimeo" | "raw"; embedUrl: string } {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vm[1]}` };
  return { type: "raw", embedUrl: url };
}

export function VideoView({ url }: { url: string }) {
  const [active, setActive] = useState(false);
  const { type, embedUrl } = parseEmbed(url);
  const thumb =
    type === "youtube"
      ? `https://img.youtube.com/vi/${embedUrl.split("/embed/")[1]}/hqdefault.jpg`
      : "";

  return (
    <div className="my-4 mx-auto max-w-[560px]">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
        {!active ? (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="absolute inset-0 flex items-center justify-center bg-cover bg-center"
            style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-white/95 text-2xl text-slate-800 shadow-lg">
              ▶
            </span>
          </button>
        ) : type === "raw" ? (
          <video src={embedUrl} controls className="absolute inset-0 size-full object-contain" />
        ) : (
          <iframe
            src={embedUrl}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video"
          />
        )}
      </div>
    </div>
  );
}
