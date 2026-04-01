import React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

export default function Calendar({
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
  const defaultClassNames = getDefaultClassNames();
  const positions = {
    right: "right-0 top-[calc(100%+0.5rem)]",
    center: "left-1/2 -translate-x-1/2 top-[calc(100%+0.5rem)]",
    left: "left-0 top-[calc(100%+0.5rem)]",
  };
  return (
    <>
      <div className="z-10 fixed inset-0 bg-black/30" onClick={onClose} />
      <div
        className={`z-20 absolute p-2 rounded-xl bg-inputPrimaryBg border border-inputPrimaryBorderFocus ${positions[position]} ${className}`}
      >
        <DayPicker
          className="myCalendar"
          classNames={{
            // month and nav buttons
            month_caption: `${defaultClassNames.month_caption}`,
            caption_label: `${defaultClassNames.caption_label} textLg font-semibold`,
            nav: `${defaultClassNames.nav}`,
            button_previous: `${defaultClassNames.button_previous}`,
            button_next: `${defaultClassNames.button_next}`,
            chevron: `${defaultClassNames.chevron} w-7 h-7 desktop:w-5 desktop:h-5 !fill-textPrimary desktop:hover:!fill-textSecondary`,
            // day of week label
            weekday: `${defaultClassNames.weekday} !textBase !font-medium`,
            // days
            day: `${defaultClassNames.day} rounded-lg hover:!bg-buttonOutlineBgHover [.rdp-selected]:hover:!bg-buttonPrimaryBg [transition:background-color_0.3s_ease]`,
            day_button: `${defaultClassNames.day_button} !textBase select-none`,
            // selected
            selected: `${defaultClassNames.selected} !font-semibold bg-buttonPrimaryBg !text-buttonPrimaryText`,
            // today: `${defaultClassNames.today} [&:not(.rdp-selected)]:bg-transparent dark:[&:not(.rdp-selected)]:bg-transparent`,
          }}
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
