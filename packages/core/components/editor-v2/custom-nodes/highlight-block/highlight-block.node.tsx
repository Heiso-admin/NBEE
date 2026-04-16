"use client";

import { PlateElement, type PlateElementProps } from "platejs/react";

import { type HighlightColor, HighlightBlockView } from "./highlight-block.view";

export function HighlightBlockNode(props: PlateElementProps) {
  const color = (props.element.color as HighlightColor | undefined) || "yellow";
  return (
    <PlateElement {...props}>
      <HighlightBlockView color={color}>{props.children}</HighlightBlockView>
    </PlateElement>
  );
}
