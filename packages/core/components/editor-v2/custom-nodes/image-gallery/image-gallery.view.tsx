"use client";

import { useState } from "react";

import { cn } from "@heiso/core/lib/utils";

export function ImageGalleryView({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  if (!images || images.length === 0) return null;
  const safeIndex = Math.max(0, Math.min(index, images.length - 1));
  const current = images[safeIndex];

  return (
    <div className="my-4 mx-auto max-w-[480px]">
      <div className="relative overflow-hidden rounded-lg">
        <img src={current} alt="" className="block aspect-[4/3] w-full object-cover" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              className="-translate-y-1/2 absolute top-1/2 left-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              className="-translate-y-1/2 absolute top-1/2 right-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              ›
            </button>
            <div className="absolute right-2 bottom-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
              {safeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-1 overflow-x-auto">
          {images.map((url, i) => (
            <button
              type="button"
              key={url}
              onClick={() => setIndex(i)}
              className={cn(
                "size-14 shrink-0 overflow-hidden rounded border-2",
                i === safeIndex ? "border-blue-500 opacity-100" : "border-transparent opacity-50",
              )}
            >
              <img src={url} alt="" className="block size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
