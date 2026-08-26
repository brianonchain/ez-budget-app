import { FaChevronDown } from "react-icons/fa";

const variants = {
  primary: "inputPrimaryColor",
  outline: "selectOutlineColor",
} as const;

const sizes = {
  xxsPill: "h-10 desktop:h-8 pl-3.5 desktop:pl-3 pr-8.5 desktop:pr-7.5 textXs rounded-full",
  xs: "h-11 desktop:h-8 pl-3 desktop:pl-2.5 pr-8 desktop:pr-6.5 textSm roundedButtonSm", // used in DetailsModal.tsx
  sm: "h-12 desktop:h-9 pl-3 desktop:pl-2.5 pr-8 desktop:pr-6.5 roundedButton",
  base: "h-13 desktop:h-10 pl-3.5 desktop:pl-3 pr-9 desktop:pr-7.5 roundedButton",
} as const;

const iconSizes = {
  xxsPill: "right-3.5 desktop:right-3 size-[0.75rem] desktop:size-[0.625rem]",
  xs: "right-3 desktop:right-2.5 size-[0.875rem] desktop:size-[0.625rem]", // used in DetailsModal.tsx
  sm: "right-3 desktop:right-2.5 size-[0.875rem] desktop:size-[0.625rem]",
  base: "right-3.5 desktop:right-3 size-[0.875rem] desktop:size-[0.625rem]",
} as const;

type SelectProps = {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  selectSize?: keyof typeof sizes;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ children, variant = "primary", selectSize = "base", className = "", ...props }: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select className={`appearance-none w-full select-none ${variants[variant]} ${sizes[selectSize]}`} {...props}>
        {children}
      </select>
      <FaChevronDown className={`absolute top-1/2 -translate-y-1/2 opacity-80 pointer-events-none ${iconSizes[selectSize]}`} />
    </div>
  );
}
