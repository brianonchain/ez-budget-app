// Semantic color tokens shared by web and mobile.
// Values are hex (#RRGGBB or #RRGGBBAA) converted from the oklch values in web/src/styles/globals.css,
// because oklch is not reliably supported in React Native.

export const lightColors = {
  background: "#f8f3fa",
  card: "#ffffff",
  foreground: "#0a0a0a",
  accentForeground: "#647987",
  mutedForeground: "#8f9faa",
  primary: "#0084d1",
  primaryForeground: "#fafafa",
  secondary: "#cad5e2",
  destructive: "#dd5259",
  border: "#e2e8f0",
  borderStrong: "#d6dee9",
  accent: "#d6dee959",
  muted: "#d6dee933",
  link: "#007cc5",
} as const;

export const darkColors = {
  background: "#0a051f",
  card: "#51a2ff12",
  foreground: "#fafafa",
  accentForeground: "#f0f2fab3",
  mutedForeground: "#f0f2fa73",
  primary: "#0f6bffa6",
  primaryForeground: "#fafafa",
  secondary: "#262626",
  destructive: "#ff6467",
  border: "#51a2ff14",
  borderStrong: "#51a2ff36",
  accent: "#51a2ff24",
  muted: "#51a2ff12",
  link: "#2072f6",
} as const;

export type ColorToken = keyof typeof lightColors;

export const colors = { light: lightColors, dark: darkColors } as const;
