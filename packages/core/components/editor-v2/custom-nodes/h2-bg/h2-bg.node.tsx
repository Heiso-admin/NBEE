"use client";

import { PlateElement, type PlateElementProps } from "platejs/react";

import { type H2BgColor, H2BgWrapper } from "./h2-bg.view";

export function H2Node(props: PlateElementProps) {
  const bgColor = (props.element.bgColor as H2BgColor) || undefined;
  return (
    <PlateElement {...props} as="div">
      <H2BgWrapper bgColor={bgColor}>{props.children}</H2BgWrapper>
    </PlateElement>
  );
}
