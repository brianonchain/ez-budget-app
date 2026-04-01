"use client";

interface CurrencySelectorProps {
  currencies: string[];
  selected: string;
  onSelect: (currency: string) => void;
}

export default function CurrencySelector({ currencies, selected, onSelect }: CurrencySelectorProps) {
  if (currencies.length <= 1) return null;

  return (
    <div className="mx-auto flex items-center gap-2 flex-wrap">
      {currencies.map((i) => (
        <button
          key={i}
          className={`px-3 py-1.5 desktop:py-1 rounded-full text-sm desktop:text-xs font-medium transition-colors duration-200 border ${
            selected === i
              ? "bg-buttonPrimaryBg text-buttonPrimaryText border-buttonPrimaryBg"
              : "bg-transparent text-textSecondary border-borderFaint desktop:hover:bg-buttonOutlineBgHover"
          }`}
          onClick={() => onSelect(i)}
          type="button"
          aria-label={`Select currency ${i}`}
        >
          {i}
        </button>
      ))}
    </div>
  );
}
