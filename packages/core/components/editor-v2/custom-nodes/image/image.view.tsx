"use client";

export function ImageView({ url, alt, width = 80 }: { url: string; alt?: string; width?: number }) {
  return (
    <div className="my-4 flex justify-center">
      <img
        src={url}
        alt={alt || ""}
        style={{ width: `${width}%`, borderRadius: 8 }}
        className="block"
      />
    </div>
  );
}
