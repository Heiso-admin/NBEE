"use client";

import { PlateElement, type PlateElementProps } from "platejs/react";

import { VideoView } from "./video.view";

export function VideoNode(props: PlateElementProps) {
  const url = (props.element.url as string) || "";
  return (
    <PlateElement {...props} as="div">
      <div contentEditable={false}>
        <VideoView url={url} />
      </div>
      <span className="hidden">{props.children}</span>
    </PlateElement>
  );
}
