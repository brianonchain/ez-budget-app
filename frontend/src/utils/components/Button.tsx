import Spinner from "./Spinner";

const variants = {
  primary: "buttonPrimaryColorGlass",
  outline:
    "hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover border border-buttonOutlineBorder [transition:background-color_300ms]",
  danger: "buttonDangerColorGlass",
  dangerOutline:
    "text-textDanger hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover border border-buttonOutlineBorder [transition:background-color_300ms]",
  input: "justify-start inputPrimaryColor font-normal",
  // custom variants
  keypad: "keypadColor",
} as const;

const sizes = {
  xxsPill: "h-10 desktop:h-8 px-3.5 desktop:px-3 textSm rounded-full",
  xs: "h-11 desktop:h-8 px-3 desktop:px-2.5 textSm roundedButtonSm font-medium",
  sm: "h-12 desktop:h-9 px-3 desktop:px-2.5 roundedButtonSm font-medium",
  base: "h-13 desktop:h-10 px-4 desktop:px-3 roundedButton font-medium",
  login: "h-13 desktop:h-12 px-4 desktop:px-3.5 roundedButton font-medium",
  // custom sizes
  icon: "flex-none size-9 desktop:size-8 roundedButtonSm",
  pill: "h-11 desktop:h-8 px-4 desktop:px-3.5 textXs rounded-full gap-2 font-normal",
  keypad: "w-20 h-20 desktop:w-12 desktop:h-12 textXl font-semibold rounded-full",
} as const;

type ButtonProps = {
  label?: React.ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  isSelected?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  label = "",
  variant = "primary",
  size = "base",
  isLoading = false,
  icon,
  iconRight,
  isSelected = false,
  // destructured button props
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`flex items-center justify-center gap-1 select-none ${variants[variant]} ${sizes[size]} ${
        isSelected && variant === "outline" ? "bg-buttonOutlineBgHover" : ""
      } ${className}`}
      disabled={isLoading || disabled}
      type={type}
    >
      {isLoading ? (
        <Spinner buttonVariant={variant} />
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
