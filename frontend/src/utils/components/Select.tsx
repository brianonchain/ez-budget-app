import { FaChevronDown } from "react-icons/fa";
import { SelectHTMLAttributes } from "react";

type SelectProps = {
  children: React.ReactNode;
  variant: "primary" | "outline";
  selectSize: "xxs" | "xs" | "sm" | "base";
  className?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ children, variant = "primary", selectSize = "base", className = "", ...props }: SelectProps) {
  const variants = {
    primary: "inputPrimaryColor",
    outline: "inputOutlineColor",
  };
  const sizes = {
    xxs: "h-9 desktop:h-8 pl-3 desktop:pl-2.5 pr-6 desktop:pr-5 textXs rounded-lg",
    xs: "h-11 desktop:h-8 pl-3 desktop:pl-2.5 pr-8 desktop:pr-6.5 textSm rounded-lg", // used in DetailsModal.tsx
    sm: "h-12 desktop:h-9 pl-3 desktop:pl-2.5 pr-8 desktop:pr-6.5 rounded-lg",
    base: "h-13 desktop:h-10 pl-3.5 desktop:pl-3 pr-9 desktop:pr-7.5 rounded-lg",
  };
  const iconSizes = {
    xxs: "right-3 desktop:right-2.5 text-xs desktop:text-[0.625rem]",
    xs: "right-3 desktop:right-2.5 text-sm desktop:text-[0.625rem]", // used in DetailsModal.tsx
    sm: "right-3 desktop:right-2.5 text-sm desktop:text-[0.625rem]",
    base: "right-3.5 desktop:right-3 text-sm desktop:text-[0.625rem]",
  };

  return (
    <div className={`relative ${className}`}>
      <select className={`appearance-none w-full ${variants[variant]} ${sizes[selectSize]}`} {...props}>
        {children}
      </select>
      <FaChevronDown className={`absolute top-1/2 -translate-y-1/2 opacity-80 pointer-events-none ${iconSizes[selectSize]}`} />
    </div>
  );
}
