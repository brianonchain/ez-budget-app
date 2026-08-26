"use client";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { formatPeriodLabel } from "./chartHelpers";
import Select from "@/utils/components/Select";
import Button from "@/utils/components/Button";
// utils
import { StatsPeriod } from "@/utils/types";
import { CategoryObject } from "@/db/WorkspaceModel";

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
          <FaChevronLeft className="size-[1.125rem] desktop:size-[0.9375rem] text-textSecondary" />
        </button>
        <span className="w-65 desktop:w-50 textXl font-semibold text-center">{formatPeriodLabel(period, anchorDate)}</span>
        <button onClick={onNext} className="flex items-center justify-center" type="button" aria-label="Next period">
          <FaChevronRight className="size-[1.125rem] desktop:size-[0.9375rem] text-textSecondary" />
        </button>
      </div>

      {/* --- FILTERS --- */}
      <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-2 select-none">
        {/* --- period filter (can't have overflow-hidden on container or outline will be cut off) --- */}
        <div
          className="h-10 desktop:h-8 grid grid-cols-3 border border-buttonOutlineBorder rounded-full divide-x divide-buttonOutlineBorder"
          role="group"
          aria-label="Time period"
        >
          {PERIODS.map((p, index) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3.5 desktop:px-3 h-full textXs [transition:background-color_300ms] ${
                period === p.value ? "bg-buttonOutlineBgHover" : "hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover"
              } ${index === 0 ? "rounded-l-full" : index === PERIODS.length - 1 ? "rounded-r-full" : ""}`}
              type="button"
              aria-pressed={period === p.value}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* --- category and tag filters --- */}
        <div className="flex items-center justify-center gap-3 lg:gap-2">
          <Select variant="outline" selectSize="xxsPill" value={selectedCategory} onChange={(e) => onSelectCategory(e.target.value)}>
            <option value="all">All categories</option>
            {categoryObjects?.map((co) => (
              <option key={co.category} value={co.category}>
                {co.category === "none" ? "uncategorized" : co.category}
              </option>
            ))}
          </Select>
          <Select variant="outline" selectSize="xxsPill" value={selectedTag} onChange={(e) => onSelectTag(e.target.value)}>
            <option value="all">All tags</option>
            {tags?.map((tag) => (
              <option key={tag} value={tag}>
                {tag === "none" ? "none" : tag}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {/* --- currency selector --- */}
      {currencies.length > 1 && (
        <div className="mx-auto flex items-center gap-2 flex-wrap">
          {currencies.map((i) => (
            <Button
              key={i}
              label={i}
              variant="outline"
              size="xxsPill"
              onClick={() => onSelectCurrency(i)}
              isSelected={activeCurrency === i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
