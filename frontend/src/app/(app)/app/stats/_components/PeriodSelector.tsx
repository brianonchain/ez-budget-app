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
  { value: "week", label: "7D" },
  { value: "month", label: "1M" },
  { value: "year", label: "1Y" },
];

export default function PeriodSelector({ period, setPeriod, anchorDate, onPrev, onNext }: PeriodSelectorProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* nav arrows + label */}
      <div className="flex items-center justify-center">
        <button
          onClick={onPrev}
          className="aspect-square w-9 desktop:w-9 flex items-center justify-center rounded-lg border border-inputOutlineBorder desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover cursor-pointer transition-colors"
        >
          <FaChevronLeft className="text-lg text-textSecondary" />
        </button>
        <span className="w-46 desktop:w-42 textXl font-semibold text-center">{formatPeriodLabel(period, anchorDate)}</span>
        <button
          onClick={onNext}
          className="aspect-square w-9 desktop:w-9 flex items-center justify-center rounded-lg border border-inputOutlineBorder desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover cursor-pointer transition-colors"
        >
          <FaChevronRight className="text-lg text-textSecondary" />
        </button>
      </div>

      {/* --- week, month, year --- */}
      <div className="flex justify-center gap-4">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`aspect-square w-10 rounded-full textSm font-medium cursor-pointer transition-colors duration-200 ${
              period === p.value
                ? "bg-buttonPrimaryBg text-buttonPrimaryText"
                : "bg-transparent text-textSecondary desktop:hover:bg-buttonOutlineBgHover border border-inputOutlineBorder"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
