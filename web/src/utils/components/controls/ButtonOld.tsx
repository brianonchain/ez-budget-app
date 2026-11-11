import { heights } from "./heights";
import Spinner from "../Spinner";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primaryHover active:bg-primaryHover active:scale-107 dark:border border-primaryBorder [transition:background-color_300ms,scale_200ms] dark:buttonWhiteGradient",
  outline: "hover:bg-muted active:bg-muted border border-borderStrong [transition:background-color_300ms]",
  dangerOutline: "text-destructive hover:bg-muted active:bg-muted border border-borderStrong [transition:background-color_300ms]",
  dangerOutline2: "text-destructive hover:bg-muted active:bg-muted border border-destructive [transition:background-color_300ms]",
  input: "inputColor", // this variant also forces label to have "justify-start font-normal"
  // custom variants
  keypad: "bg-[#D6DEE9] dark:bg-primary/40 active:bg-slate-300 dark:active:bg-primary/80 transition-all duration-150",
} as const;

const sizes = {
  xs: `${heights.xs} px-3 desktop:px-2.5 textSm font-semibold`,
  sm: `${heights.sm} px-3 desktop:px-2.5 font-semibold`,
  default: `${heights.default} px-4 desktop:px-3 font-semibold`,
  login: `${heights.login} px-4 desktop:px-3.5 font-semibold`,
  // custom sizes
  xxsPill: `${heights.xxsPill} px-3.5 desktop:px-3 textSm`,
  xsPill: `${heights.xsPill} px-4 desktop:px-3.5 textXs gap-2 font-normal`,
  icon: "flex-none size-9 desktop:size-8 roundedButtonSm",
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

export default function ButtonOld({
  label = "",
  variant = "primary",
  size = "default",
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
      className={`relative flex items-center justify-center select-none ${variants[variant]} ${sizes[size]} ${
        isSelected && variant === "outline" ? "bg-muted" : ""
      } ${className}`}
      disabled={isLoading || disabled}
      type={type}
    >
      <span
        className={`w-full flex items-center gap-1 ${variant === "input" ? "justify-start font-normal" : "justify-center"} ${isLoading ? "invisible" : ""}`}
      >
        {icon}
        {label}
        {iconRight}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner color={variant === "primary" ? "white" : "default"} />
        </span>
      )}
    </button>
  );
}
