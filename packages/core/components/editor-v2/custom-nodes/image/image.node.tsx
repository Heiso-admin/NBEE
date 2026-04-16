"use client";

import { useState } from "react";
import { PlateElement, type PlateElementProps, useEditorRef } from "platejs/react";

import { ImagePopover } from "./image.popover";
import { ImageView } from "./image.view";

export function ImageNode(props: PlateElementProps) {
  const editor = useEditorRef();
  const url = (props.element.url as string) || "";
  const alt = (props.element.alt as string) || "";
  const initialWidth = (props.element.width as number) || 80;
  const [width, setWidth] = useState(initialWidth);

  const update = (patch: Partial<{ url: string; width: number }>) => {
    if (patch.url !== undefined) {
      editor.tf.setNodes({ url: patch.url } as Record<string, unknown>, { at: props.path });
    }
    if (patch.width !== undefined) {
      setWidth(patch.width);
      editor.tf.setNodes({ width: patch.width } as Record<string, unknown>, { at: props.path });
    }
  };

  // Drag handle for width adjustment
  const onHandlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    const containerWidth = (e.currentTarget.parentElement?.parentElement?.clientWidth || 720);
    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientX - startX;
      const next = Math.max(20, Math.min(100, startWidth + (delta / containerWidth) * 100));
      setWidth(Math.round(next));
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      update({ width });
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  return (
    <PlateElement {...props} as="div">
      <div contentEditable={false} className="my-4 flex justify-center">
        <ImagePopover element={props.element} alt={alt} onChange={update}>
          <div className="relative" style={{ width: `${width}%` }}>
            <ImageView url={url} alt={alt} width={100} />
            <button
              type="button"
              onPointerDown={onHandlePointerDown}
              title="調整寬度"
              className="-translate-y-1/2 absolute top-1/2 right-[-6px] z-10 h-12 w-1.5 cursor-ew-resize rounded bg-foreground/60 opacity-0 transition hover:bg-primary group-hover:opacity-100"
            />
          </div>
        </ImagePopover>
      </div>
      <span className="hidden">{props.children}</span>
    </PlateElement>
  );
}
