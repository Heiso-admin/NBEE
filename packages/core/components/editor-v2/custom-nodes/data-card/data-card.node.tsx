"use client";

import { PlateElement, type PlateElementProps } from "platejs/react";

import {
  DataCardItemView,
  DataCardLabelView,
  type DataCardLayout,
  DataCardValueView,
  DataCardView,
} from "./data-card.view";

export function DataCardNode(props: PlateElementProps) {
  const layout = (props.element.layout as DataCardLayout | undefined) || "grid-3";
  return (
    <PlateElement {...props}>
      <DataCardView layout={layout}>{props.children}</DataCardView>
    </PlateElement>
  );
}

export function DataCardItemNode(props: PlateElementProps) {
  return (
    <PlateElement {...props}>
      <DataCardItemView>{props.children}</DataCardItemView>
    </PlateElement>
  );
}

export function DataCardValueNode(props: PlateElementProps) {
  return (
    <PlateElement {...props}>
      <DataCardValueView>{props.children}</DataCardValueView>
    </PlateElement>
  );
}

export function DataCardLabelNode(props: PlateElementProps) {
  return (
    <PlateElement {...props}>
      <DataCardLabelView>{props.children}</DataCardLabelView>
    </PlateElement>
  );
}
