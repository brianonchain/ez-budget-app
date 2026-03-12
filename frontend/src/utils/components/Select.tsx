import { FaChevronDown } from "react-icons/fa";
import { SelectHTMLAttributes } from "react";

type SelectProps = {
  children: React.ReactNode;
  variant: "primary" | "transparent";
  selectSize: "xs" | "sm" | "base";
  className?: string;
  fullWidth?: boolean;
} & SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({
  children,
  variant = "primary",
  selectSize = "base",
  className = "",
  fullWidth = false,
  ...props
}: SelectProps) {
  const variants = {
    primary: "input1Color",
    transparent: "inputTransColor",
  };
  const sizes = {
    xs: "h-11 desktop:h-8 pl-3 desktop:pl-2.5 pr-8 desktop:pr-6.5 textSmApp rounded-lg", // used in DetailsModal.tsx
    sm: "h-12 desktop:h-9 pl-3 desktop:pl-2.5 pr-8 desktop:pr-6.5 textBaseApp rounded-lg",
    base: "h-13 desktop:h-10 pl-3.5 desktop:pl-3 pr-9 desktop:pr-7.5 textBaseApp rounded-lg",
  };
  const iconSizes = {
    xs: "right-3 desktop:right-2.5 text-sm desktop:text-[0.625rem]", // used in DetailsModal.tsx
    sm: "right-3 desktop:right-2.5 text-sm desktop:text-[0.625rem]",
    base: "right-3.5 desktop:right-3 text-sm desktop:text-[0.625rem]",
  };

  return (
    <div className={`relative ${fullWidth ? "flex-1" : ""}`}>
      <select
        className={`appearance-none font-medium ${fullWidth ? "w-full" : ""} ${variants[variant]} ${sizes[selectSize]} ${className}`}
        {...props}
      >
        {children}
      </select>

      <FaChevronDown className={`absolute top-1/2 -translate-y-1/2 opacity-80 pointer-events-none ${iconSizes[selectSize]}`} />
    </div>
  );
}
