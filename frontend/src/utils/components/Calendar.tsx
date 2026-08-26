"use client";

import { useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import { motion } from "framer-motion";
import { desktopModalTransition } from "@/utils/motions";

const MINUTES_MAX = 23 * 60 + 59; // 23:59; slider scale is 0–24
const HOUR_TICKS = Array.from({ length: 25 }, (_, hour) => hour); // 0 through 24
const HOUR_LABELS = [0, 12, 24];

const positions = {
  right: "top-[calc(100%+0.375rem)] right-0",
  center: "top-[calc(100%+0.375rem)] left-1/2",
  left: "top-[calc(100%+0.375rem)] left-0",
};

function minutesFromDate(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function withMinutes(base: Date, minutes: number) {
  const next = new Date(base);
  next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return next;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function Calendar({
  // "selected" is like value, while "onSelect" is like onChange
  selected,
  onSelect,
  onClose,
  className,
  position = "right",
  showTime = true,
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  onClose: () => void;
  className?: string;
  position?: keyof typeof positions;
  showTime?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const minutes = selected ? minutesFromDate(selected) : 0;

  function onDaySelect(date: Date | undefined) {
    if (!date) return;
    onSelect(withMinutes(date, selected ? minutesFromDate(selected) : 0));
  }

  function onTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nextMinutes = Number(e.currentTarget.value);
    onSelect(withMinutes(selected ?? new Date(), nextMinutes));
  }

  return (
    <motion.div
      ref={rootRef}
      inherit={false}
      className={`absolute z-20 p-2 w-full flex flex-col items-center roundedButton bg-inputPrimaryBg border border-inputPrimaryBorderHover ring-2 ring-inputPrimaryRing ${positions[position]} shadow-[0_4px_16px_rgba(20,38,52,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.55)] ${className}`}
      style={{ transformOrigin: "top center" }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={desktopModalTransition}
    >
      <DayPicker
        className="myCalendar"
        navLayout="around"
        mode="single"
        required // so when user clicks the selected date, onSelect won't return undefined
        endMonth={new Date()}
        disabled={{ after: new Date() }}
        selected={selected}
        onSelect={onDaySelect}
      />
      {showTime && (
        <div className="w-full px-2 pt-4 pb-1.5 border-t border-borderFaint">
          <div className="mb-2 flex items-center justify-center">
            <span className="textLg font-medium">{selected ? formatTime(selected) : "12:00 AM"}</span>
          </div>
          {/* half-thumb inset so the track ends sit on ticks 0 and 24 (native thumbs travel inset from the input box) */}
          <div className="mx-[0.625rem]">
            <input
              className="timeSlider"
              type="range"
              min={0}
              max={MINUTES_MAX}
              step={1}
              value={minutes}
              onChange={onTimeChange}
              aria-label="Time"
            />
            <div className="relative mt-1 h-2.5" aria-hidden>
              {HOUR_TICKS.map((hour) => (
                <span
                  key={hour}
                  className={`absolute top-0 w-px -translate-x-1/2 ${hour % 6 === 0 ? "h-2.5 bg-textPrimary" : "h-2 bg-textTertiary"}`}
                  style={{ left: `${(hour / 24) * 100}%` }}
                />
              ))}
            </div>
            <div className="relative mt-1 h-5 textBase">
              {HOUR_LABELS.map((hour) => (
                <span key={hour} className="absolute top-0 -translate-x-1/2" style={{ left: `${(hour / 24) * 100}%` }}>
                  {hour}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
