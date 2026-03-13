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
              ? "bg-button1Bg text-button1Text border-button1Bg"
              : "bg-transparent text-text2 border-borderFaint desktop:hover:bg-buttonTransBgHover"
          }`}
        >
          {SYMBOLS[c] ?? ""} {c}
        </button>
      ))}
    </div>
  );
}
