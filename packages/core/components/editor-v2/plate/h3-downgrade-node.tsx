"use client";

import { PlateElement, type PlateElementProps } from "platejs/react";

/**
 * H3 在 editor-v2 被禁用：plugin 仍註冊以保留舊資料 type，
 * 但渲染時降級為粗體段落。
 */
export function H3DowngradeElement(props: PlateElementProps) {
  return (
    <PlateElement {...props} as="p" className="my-3 font-bold text-slate-900">
      {props.children}
    </PlateElement>
  );
}
