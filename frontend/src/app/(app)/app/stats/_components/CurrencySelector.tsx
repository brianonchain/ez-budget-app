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
          className={`px-3 h-9 desktop:h-8 rounded-full textSm border border-buttonOutlineBorder ${
            selected === i ? "bg-buttonOutlineBgHover" : "desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover"
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
