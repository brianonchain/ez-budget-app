"use client";
import { StatsPeriod } from "@/utils/types";
import { CategoryObject } from "@/db/WorkspaceModel";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { formatPeriodLabel } from "./chartHelpers";
import CurrencySelector from "./CurrencySelector";
import Select from "@/utils/components/Select";

interface PeriodSelectorProps {
  period: StatsPeriod;
  setPeriod: (p: StatsPeriod) => void;
  anchorDate: Date;
  onPrev: () => void;
  onNext: () => void;
  currencies: string[];
  activeCurrency: string;
  onSelectCurrency: (c: string) => void;
  categoryObjects?: CategoryObject[];
  tags?: string[];
  selectedCategory: string;
  onSelectCategory: (c: string) => void;
  selectedTag: string;
  onSelectTag: (t: string) => void;
}

const PERIODS: { value: StatsPeriod; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

export default function PeriodSelector({
  period,
  setPeriod,
  anchorDate,
  onPrev,
  onNext,
  currencies,
  activeCurrency,
  onSelectCurrency,
  categoryObjects,
  tags,
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
}: PeriodSelectorProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* nav arrows + label */}
      <div className="flex items-center justify-center">
        <button onClick={onPrev} className="flex items-center justify-center cursor-pointer">
          <FaChevronLeft className="textLg text-textSecondary" />
        </button>
        <span className="w-50 desktop:w-43 textXl font-semibold text-center">{formatPeriodLabel(period, anchorDate)}</span>
        <button onClick={onNext} className="flex items-center justify-center cursor-pointer">
          <FaChevronRight className="textLg text-textSecondary" />
        </button>
      </div>

      <div className="mx-auto flex items-center">
        {PERIODS.map((p, index) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3.5 h-9 desktop:h-8 textSm font-medium cursor-pointer transition-colors duration-200 ${
              index === 0 ? "rounded-l-lg" : ""
            } ${index === 2 ? "rounded-r-lg" : ""} ${
              period === p.value
                ? "bg-buttonPrimaryBg text-buttonPrimaryText"
                : "bg-transparent text-textSecondary desktop:hover:bg-buttonOutlineBgHover border border-inputOutlineBorder"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* filters + period buttons */}
      <div className="flex items-center justify-center gap-3 textSm">
        {categoryObjects && (
          <Select fullWidth variant="outline" selectSize="xxs" value={selectedCategory} onChange={(e) => onSelectCategory(e.target.value)}>
            <option value="all">All categories</option>
            {categoryObjects.map((co) => (
              <option key={co.category} value={co.category}>
                {co.category === "none" ? '"none"' : co.category}
              </option>
            ))}
          </Select>
        )}
        {tags && (
          <Select fullWidth variant="outline" selectSize="xxs" value={selectedTag} onChange={(e) => onSelectTag(e.target.value)}>
            <option value="all">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag === "none" ? '"none"' : tag}
              </option>
            ))}
          </Select>
        )}
      </div>
      {currencies.length > 1 && <CurrencySelector currencies={currencies} selected={activeCurrency} onSelect={onSelectCurrency} />}
    </div>
  );
}
