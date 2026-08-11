import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { createPortal } from "react-dom";

export default function Calendar({
  // "selected" is like value, while "onSelect" is like onChange
  selected,
  onSelect,
  className,
  position = "right",
  onClose,
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  className?: string;
  position?: "right" | "left" | "center";
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const positions = {
    right: "right-0 top-[calc(100%+0.5rem)]",
    center: "left-1/2 -translate-x-1/2 top-[calc(100%+0.5rem)]",
    left: "left-0 top-[calc(100%+0.5rem)]",
  };

  return (
    <>
      {/* --- use 2 backdrops so clicking outside calendar will close it --- */}
      {/* --- FocusTrap options allows outside clicks of elements with data-allow-click --- */}
      {/* --- portaled backdrop's z-index is in between modal content (110) and modal backdrop (100) --- */}
      {mounted &&
        createPortal(
          <div className="absolute top-0 left-0 w-dvw h-dvh z-[105]" onClick={onClose} aria-hidden="true" data-allow-click="true" />,
          document.body,
        )}
      <div className="fixed inset-0 z-10 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        className={`z-20 absolute p-2 rounded-xl bg-inputPrimaryBg border border-inputPrimaryBorderHover ${positions[position]} ${className}`}
      >
        <DayPicker
          className="myCalendar"
          navLayout="around"
          mode="single"
          required // so when user clicks the selected date, onSelect won't return undefined
          endMonth={new Date()}
          disabled={{ after: new Date() }}
          selected={selected}
          onSelect={onSelect}
        />
      </div>
    </>
  );
}
