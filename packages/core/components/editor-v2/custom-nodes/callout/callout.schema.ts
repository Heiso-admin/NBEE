export const CALLOUT_TYPE = "callout";

export type CalloutVariant = "info" | "success" | "warning" | "tip";

export type CalloutElement = {
  type: typeof CALLOUT_TYPE;
  variant?: CalloutVariant;
  children: Array<{ text: string }>;
};
