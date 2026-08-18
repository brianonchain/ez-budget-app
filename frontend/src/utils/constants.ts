import { DraftItem } from "@/utils/types";

export const CURRENCIES: string[] = ["USD", "EUR", "TWD", "JPY", "VND", "KRW"];
export const SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", TWD: "NT$", JPY: "¥", VND: "₫", KRW: "₩" };
export const DECIMALS: Record<string, number> = { USD: 2, EUR: 2, TWD: 0, JPY: 0, VND: 0, KRW: 0 };
export const MULTIPLIER: Record<string, number> = { USD: 1, EUR: 1, TWD: 1, JPY: 1, VND: 1000, KRW: 1000 };
export const CURRENCY_NAMES: Record<string, string> = {
  USD: "U.S. Dollar ($)",
  EUR: "Euro (€)",
  TWD: "New Taiwan Dollar (NT$)",
  JPY: "Japanese Yen (¥)",
  VND: "Vietnamese Dong (₫)",
  KRW: "South Korean Won (₩)",
};

export const emptyItem: DraftItem = {
  date: new Date().toISOString(),
  cost: 0,
  currency: "USD",
  description: "",
  category: "none",
  subcategory: "none",
  tag: "none",
};

export const TABLET_MQ = "(orientation: landscape) and (min-height: 600px), " + "(orientation: portrait) and (min-width: 600px)";

export const DESKTOP_MQ =
  "(hover: hover) and (pointer: fine) and (orientation: landscape) and (min-width: 1000px), " +
  "(hover: hover) and (pointer: fine) and (orientation: landscape) and (min-height: 600px), " +
  "(hover: hover) and (pointer: fine) and (orientation: portrait) and (min-width: 600px), " +
  "(hover: hover) and (pointer: fine) and (orientation: portrait) and (min-height: 1000px)";
