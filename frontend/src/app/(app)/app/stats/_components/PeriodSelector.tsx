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
  // lg: all buttons become single row
  return (
    <div className="w-full flex flex-col items-center gap-3 lg:gap-4">
      {/* --- nav arrows + period label --- */}
      <div className="flex items-center justify-center">
        <button onClick={onPrev} className="flex items-center justify-center" type="button" aria-label="Previous period">
          <FaChevronLeft className="text-lg desktop:text-[0.9375rem] text-textSecondary" />
        </button>
        <span className="w-65 desktop:w-50 textXl font-semibold text-center">{formatPeriodLabel(period, anchorDate)}</span>
        <button onClick={onNext} className="flex items-center justify-center" type="button" aria-label="Next period">
          <FaChevronRight className="text-lg desktop:text-[0.9375rem] text-textSecondary" />
        </button>
      </div>

      {/* --- week / month / year + category and tag selectors --- */}
      <div className="w-full flex flex-col lg:flex-row items-center gap-3 lg:gap-2">
        {/* --- week / month / year (can't have overflow-hidden on container or outline will be cut off) --- */}
        <div className="shrink-0 h-9 desktop:h-8 grid grid-cols-3 border border-inputOutlineBorder rounded-lg divide-x divide-inputOutlineBorder">
          {PERIODS.map((p, index) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-2 h-full textXs font-medium [transition:background-color_200ms] ${
                period === p.value ? "bg-selected" : "desktop:hover:bg-selected"
              } ${index === 0 ? "rounded-l-lg" : index === 2 ? "rounded-r-lg" : ""}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* --- category and tag selectors --- */}
        <div className="w-full max-w-88 flex items-center justify-center gap-3 lg:gap-2">
          <Select
            className="flex-1"
            variant="outline"
            selectSize="xxs"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {categoryObjects?.map((co) => (
              <option key={co.category} value={co.category}>
                {co.category === "none" ? '"none"' : co.category}
              </option>
            ))}
          </Select>
          <Select className="flex-1" variant="outline" selectSize="xxs" value={selectedTag} onChange={(e) => onSelectTag(e.target.value)}>
            <option value="all">All tags</option>
            {tags?.map((tag) => (
              <option key={tag} value={tag}>
                {tag === "none" ? '"none"' : tag}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {currencies.length > 1 && <CurrencySelector currencies={currencies} selected={activeCurrency} onSelect={onSelectCurrency} />}
    </div>
  );
}
