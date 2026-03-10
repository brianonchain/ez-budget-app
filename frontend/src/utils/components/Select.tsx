import { FaChevronDown } from "react-icons/fa";
import { SelectHTMLAttributes } from "react";

type SelectProps = {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
} & SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ children, className = "", fullWidth = false, ...props }: SelectProps) {
  return (
    <div className={`relative ${fullWidth ? "flex-1" : ""}`}>
      <select
        className={`appearance-none h-12 desktop:h-9 pl-3 desktop:pl-2.5 pr-8 desktop:pr-6.5 rounded-lg textBaseApp font-medium input2Color outline-none ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      <FaChevronDown className="absolute right-3 desktop:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-sm desktop:text-[0.625rem]" />
    </div>
  );
}
