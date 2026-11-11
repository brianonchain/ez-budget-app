// height dictates button roundness
export const heights = {
  xs: "h-11 desktop:h-9 roundedButtonSm",
  sm: "h-12 desktop:h-10 roundedButton",
  default: "h-13 desktop:h-11 roundedButton", // app base uses 14px text
  login: "h-13 desktop:h-12 roundedButton", // login uses 16px text
  xxsPill: "h-10 desktop:h-8 rounded-full",
  xsPill: "h-11 desktop:h-9 rounded-full",
} as const;

export type Height = keyof typeof heights;
