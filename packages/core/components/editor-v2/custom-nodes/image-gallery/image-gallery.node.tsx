"use client";

import { PlateElement, type PlateElementProps } from "platejs/react";

import { ImageGalleryView } from "./image-gallery.view";

export function ImageGalleryNode(props: PlateElementProps) {
  const images = (props.element.images as string[]) || [];
  return (
    <PlateElement {...props} as="div">
      <div contentEditable={false}>
        <ImageGalleryView images={images} />
      </div>
      <span className="hidden">{props.children}</span>
    </PlateElement>
  );
}
