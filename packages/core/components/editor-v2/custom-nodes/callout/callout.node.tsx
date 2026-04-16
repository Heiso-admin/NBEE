"use client";

import { PlateElement, type PlateElementProps } from "platejs/react";

import { CalloutView, type CalloutVariant } from "./callout.view";

export function CalloutNode(props: PlateElementProps) {
  const variant = (props.element.variant as CalloutVariant | undefined) || "info";
  return (
    <PlateElement {...props}>
      <CalloutView variant={variant}>{props.children}</CalloutView>
    </PlateElement>
  );
}
