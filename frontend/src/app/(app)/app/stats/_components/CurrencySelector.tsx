"use client";
import { SYMBOLS } from "@/utils/constants";

interface CurrencySelectorProps {
  currencies: string[];
  selected: string;
  onSelect: (currency: string) => void;
}

export default function CurrencySelector({ currencies, selected, onSelect }: CurrencySelectorProps) {
  if (currencies.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {currencies.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`px-3 py-1.5 desktop:py-1 rounded-full text-sm desktop:text-xs font-medium cursor-pointer transition-colors duration-200 border ${
            selected === c
              ? "bg-buttonPrimaryBg text-buttonPrimaryText border-buttonPrimaryBg"
              : "bg-transparent text-textSecondary border-borderFaint desktop:hover:bg-buttonOutlineBgHover"
          }`}
        >
          {SYMBOLS[c] ?? ""} {c}
        </button>
      ))}
    </div>
  );
}
