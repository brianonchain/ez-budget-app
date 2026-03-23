import { ImSpinner2 } from "react-icons/im";

type ButtonProps = {
  label?: string;
  variant?: "primary" | "outline" | "danger" | "dangerOutline" | "ghost";
  size?: "pill" | "icon" | "sm" | "base" | "hug" | "statsIcon";
  isLoading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  label = "",
  variant = "primary",
  size = "base",
  isLoading = false,
  className = "",
  icon,
  iconRight,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "text-buttonPrimaryText bg-buttonPrimaryBg desktop:hover:bg-buttonPrimaryBgHover active:bg-buttonPrimaryBgHover [transition:background-color_200ms]",
    outline:
      "text-button2Text bg-transparent desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover border border-inputOutlineBorder [transition:background-color_200ms]",
    danger:
      "text-buttonPrimaryText bg-buttonDangerBg desktop:hover:bg-buttonDangerBgHover active:bg-buttonDangerBgHover [transition:background-color_200ms]",
    dangerOutline:
      "text-textError hover:text-textErrorHover bg-transparent desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover border border-inputOutlineBorder [transition:background-color_200ms]",
    ghost: "desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover",
  };

  const sizes = {
    pillSm: "h-9 desktop:h-8 px-3.5 textSm rounded-full font-medium gap-2",
    pill: "h-11 desktop:h-8 px-4 desktop:px-3.5 textSm rounded-full font-normal gap-2", // used in DetailsModal.tsx
    icon: "w-9 h-9 desktop:w-9 desktop:h-9 rounded-lg",
    sm: "h-12 desktop:h-9 px-3 desktop:px-2.5 textBase rounded-lg", // same height and px as input(sm) and select(sm)
    base: "h-14 desktop:h-10 px-4 desktop:px-3 textBase rounded-lg",
    hug: "",
    statsIcon: "aspect-square w-9 desktop:w-8 rounded-lg text-textTertiary",
  };

  // consider adding "inline-flex" to base className
  return (
    <button
      {...props}
      className={`flex-none font-medium flex items-center justify-center gap-1 desktop:cursor-pointer disabled:cursor-default select-none ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
    >
      {isLoading ? (
        <ImSpinner2 className="animate-spin text-[32px] desktop:text-[24px]" />
      ) : (
        <>
          {icon}
          {label}
          {iconRight}
        </>
      )}
    </button>
  );
}
