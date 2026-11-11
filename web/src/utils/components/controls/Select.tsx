import { FaChevronDown } from "react-icons/fa";
import { heights } from "./heights";

const variants = {
  primary: "inputColor",
  outline: "selectOutlineColor",
} as const;

const sizes = {
  xxsPill: `${heights.xxsPill} pl-3.5 desktop:pl-3 pr-8.5 desktop:pr-7.5 textXs`,
  xs: `${heights.xs} pl-3.5 desktop:pl-3 pr-9 desktop:pr-7.5 textSm`, // used in DetailsPage.tsx
  sm: `${heights.sm} pl-3.5 desktop:pl-3 pr-9 desktop:pr-7.5`,
  default: `${heights.default} pl-3.5 desktop:pl-3 pr-9 desktop:pr-7.5`,
} as const;

const iconSizes = {
  xxsPill: "right-3.5 desktop:right-3 size-3 desktop:size-2.5",
  xs: "right-3.5 desktop:right-3 size-3.5 desktop:size-3", // used in DetailsPage.tsx
  sm: "right-3.5 desktop:right-3 size-3.5 desktop:size-3",
  default: "right-3.5 desktop:right-3 size-3.5 desktop:size-3",
} as const;

type SelectProps = {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  selectSize?: keyof typeof sizes;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ children, variant = "primary", selectSize = "default", className = "", ...props }: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select className={`appearance-none w-full select-none ${variants[variant]} ${sizes[selectSize]}`} {...props}>
        {children}
      </select>
      <FaChevronDown className={`absolute top-1/2 -translate-y-1/2 opacity-80 pointer-events-none ${iconSizes[selectSize]}`} />
    </div>
  );
}
