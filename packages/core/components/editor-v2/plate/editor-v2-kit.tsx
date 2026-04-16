"use client";

import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  HorizontalRulePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from "@platejs/code-block/react";
import { LinkPlugin } from "@platejs/link/react";
import { ListPlugin } from "@platejs/list/react";
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@platejs/table/react";
import { all, createLowlight } from "lowlight";
import { KEYS, TrailingBlockPlugin } from "platejs";
import { createPlatePlugin, ParagraphPlugin } from "platejs/react";

import { BlockquoteElement } from "@heiso/core/components/ui/blockquote-node";
import {
  CodeLineElement,
  CodeSyntaxLeaf,
} from "@heiso/core/components/ui/code-block-node";
import { H1Element } from "@heiso/core/components/ui/heading-node";
import { HrElement } from "@heiso/core/components/ui/hr-node";
import { LinkElement } from "@heiso/core/components/ui/link-node";
import { ParagraphElement } from "@heiso/core/components/ui/paragraph-node";
import {
  TableCellElement,
  TableCellHeaderElement,
  TableElement,
  TableRowElement,
} from "@heiso/core/components/ui/table-node";

import { CalloutNode } from "@heiso/core/components/editor-v2/custom-nodes/callout/callout.node";
import {
  DataCardItemNode,
  DataCardLabelNode,
  DataCardNode,
  DataCardValueNode,
} from "@heiso/core/components/editor-v2/custom-nodes/data-card/data-card.node";
import { H2Node } from "@heiso/core/components/editor-v2/custom-nodes/h2-bg/h2-bg.node";
import { HighlightBlockNode } from "@heiso/core/components/editor-v2/custom-nodes/highlight-block/highlight-block.node";
import { ImageNode } from "@heiso/core/components/editor-v2/custom-nodes/image/image.node";
import { ImageGalleryNode } from "@heiso/core/components/editor-v2/custom-nodes/image-gallery/image-gallery.node";
import { VideoNode } from "@heiso/core/components/editor-v2/custom-nodes/video/video.node";
import { CodeBlockMermaidAwareElement } from "./code-block-mermaid-node";
import { H3DowngradeElement } from "./h3-downgrade-node";

const lowlight = createLowlight(all);

const CalloutElPlugin = createPlatePlugin({
  key: "callout",
  node: { isElement: true, component: CalloutNode },
});

const DataCardElPlugin = createPlatePlugin({
  key: "data-card",
  node: { isElement: true, component: DataCardNode },
});
const DataCardItemElPlugin = createPlatePlugin({
  key: "data-card-item",
  node: { isElement: true, component: DataCardItemNode },
});
const DataCardLabelElPlugin = createPlatePlugin({
  key: "data-card-label",
  node: { isElement: true, component: DataCardLabelNode },
});
const DataCardValueElPlugin = createPlatePlugin({
  key: "data-card-value",
  node: { isElement: true, component: DataCardValueNode },
});

const HighlightBlockElPlugin = createPlatePlugin({
  key: "highlight-block",
  node: { isElement: true, component: HighlightBlockNode },
});

const ImageElPlugin = createPlatePlugin({
  key: "img",
  node: { isElement: true, isVoid: true, component: ImageNode },
});
const ImageGalleryElPlugin = createPlatePlugin({
  key: "image-gallery",
  node: { isElement: true, isVoid: true, component: ImageGalleryNode },
});
const VideoElPlugin = createPlatePlugin({
  key: "video",
  node: { isElement: true, isVoid: true, component: VideoNode },
});

export const EditorV2Kit = [
  // Paragraph baseline (must be early to be the catch-all)
  ParagraphPlugin.withComponent(ParagraphElement),

  // Headings (H3 plugin registered but rendered as bold paragraph)
  H1Plugin.configure({ node: { component: H1Element } }),
  H2Plugin.configure({ node: { component: H2Node } }),
  H3Plugin.configure({ node: { component: H3DowngradeElement } }),

  // Other blocks
  BlockquotePlugin.configure({ node: { component: BlockquoteElement } }),
  HorizontalRulePlugin.withComponent(HrElement),

  // Code
  CodeBlockPlugin.configure({
    node: { component: CodeBlockMermaidAwareElement },
    options: { lowlight },
  }),
  CodeLinePlugin.withComponent(CodeLineElement),
  CodeSyntaxPlugin.withComponent(CodeSyntaxLeaf),

  // Table
  TablePlugin.withComponent(TableElement),
  TableRowPlugin.withComponent(TableRowElement),
  TableCellPlugin.withComponent(TableCellElement),
  TableCellHeaderPlugin.withComponent(TableCellHeaderElement),

  // Link
  LinkPlugin.configure({ render: { node: LinkElement } }),

  // Marks
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin,

  // List
  ListPlugin.configure({
    inject: {
      targetPlugins: [...KEYS.heading, KEYS.p, KEYS.blockquote],
    },
  }),

  // Custom v2 nodes
  CalloutElPlugin,
  DataCardElPlugin,
  DataCardItemElPlugin,
  DataCardLabelElPlugin,
  DataCardValueElPlugin,
  HighlightBlockElPlugin,
  ImageElPlugin,
  ImageGalleryElPlugin,
  VideoElPlugin,

  TrailingBlockPlugin,
];
