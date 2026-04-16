import type { Typography } from "@heiso/core/components/editor-v2/types";

export const TYPO_VAR_KEYS = {
  h1Size: "--ev2-h1-size",
  h1Weight: "--ev2-h1-weight",
  h2Size: "--ev2-h2-size",
  h2Weight: "--ev2-h2-weight",
  pSize: "--ev2-p-size",
  pHeight: "--ev2-p-height",
  accent: "--ev2-accent",
} as const;

export function applyTypographyToCssVariables(target: HTMLElement, typo: Typography) {
  target.style.setProperty(TYPO_VAR_KEYS.h1Size, `${typo.h1Size}px`);
  target.style.setProperty(TYPO_VAR_KEYS.h1Weight, String(typo.h1Weight));
  target.style.setProperty(TYPO_VAR_KEYS.h2Size, `${typo.h2Size}px`);
  target.style.setProperty(TYPO_VAR_KEYS.h2Weight, String(typo.h2Weight));
  target.style.setProperty(TYPO_VAR_KEYS.pSize, `${typo.pSize}px`);
  target.style.setProperty(TYPO_VAR_KEYS.pHeight, String(typo.pHeight));
  target.style.setProperty(TYPO_VAR_KEYS.accent, typo.accent);
}
