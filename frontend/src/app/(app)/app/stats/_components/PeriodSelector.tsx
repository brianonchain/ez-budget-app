"use client";
import { StatsPeriod } from "@/utils/types";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { formatPeriodLabel } from "./chartHelpers";

interface PeriodSelectorProps {
  period: StatsPeriod;
  setPeriod: (p: StatsPeriod) => void;
  anchorDate: Date;
  onPrev: () => void;
  onNext: () => void;
}

const PERIODS: { value: StatsPeriod; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

export default function PeriodSelector({ period, setPeriod, anchorDate, onPrev, onNext }: PeriodSelectorProps) {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* period tabs */}
      <div className="flex rounded-lg overflow-hidden border border-borderFaint">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`flex-1 py-2 text-sm desktop:text-xs font-medium cursor-pointer transition-colors duration-200 ${
              period === p.value ? "bg-button1Bg text-button1Text" : "bg-transparent text-text2 desktop:hover:bg-buttonTransBgHover"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {/* date navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="w-9 h-9 desktop:w-7 desktop:h-7 flex items-center justify-center rounded-lg desktop:hover:bg-buttonTransBgHover active:bg-buttonTransBgHover cursor-pointer transition-colors"
        >
          <FaChevronLeft className="text-sm text-text2" />
        </button>
        <span className="textBaseApp font-semibold">{formatPeriodLabel(period, anchorDate)}</span>
        <button
          onClick={onNext}
          className="w-9 h-9 desktop:w-7 desktop:h-7 flex items-center justify-center rounded-lg desktop:hover:bg-buttonTransBgHover active:bg-buttonTransBgHover cursor-pointer transition-colors"
        >
          <FaChevronRight className="text-sm text-text2" />
        </button>
      </div>
    </div>
  );
}
