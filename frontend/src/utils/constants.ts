import { Currency } from "@/utils/types";

export const CURRENCIES = ["USD", "EUR", "TWD", "JPY", "VND", "KRW"] as const;
export const DECIMALS: Record<Currency, number> = { USD: 2, EUR: 2, TWD: 0, JPY: 0, VND: 0, KRW: 0 };
export const MULTIPLIER: Record<Currency, number> = { USD: 1, EUR: 1, TWD: 1, JPY: 1, VND: 1000, KRW: 1000 };
