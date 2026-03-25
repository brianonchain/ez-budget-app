import React from "react";
import { FaCalendar } from "react-icons/fa6";

const FORMAT_OPTS: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

type Props = {
  isElevated: boolean;
  date: Date | undefined;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function SelectDateButton({ isElevated, date, ...props }: Props) {
  return (
    <button
      className={`flex-1 text-left inputPrimaryColor ring-0 h-12 desktop:h-9 px-3 desktop:px-2.5 rounded-lg desktop:cursor-pointer truncate ${
        isElevated ? "z-20" : ""
      }`}
      aria-haspopup="dialog"
      {...props}
    >
      {date ? (
        date.toLocaleDateString("en-US", FORMAT_OPTS)
      ) : (
        <div className="w-full flex items-center justify-between">
          Select date <FaCalendar className="inline-block text-textSecondary textSm" />
        </div>
      )}
    </button>
  );
}
