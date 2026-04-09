import { ImSpinner2 } from "react-icons/im";

type ButtonProps = {
  label?: string | React.ReactNode;
  variant?: "primary" | "outline" | "danger" | "dangerOutline" | "ghost" | "input";
  size?: "xs" | "sm" | "base" | "pill" | "icon" | "hug" | "login";
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
      "text-textDanger hover:text-textDangerHover bg-transparent desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover border border-inputOutlineBorder [transition:background-color_200ms]",
    ghost: "desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover",
    input: "text-left justify-start inputPrimaryColor !font-normal", // globals.css removes outline from inputPrimaryColor
  };

  const sizes = {
    xs: "h-11 desktop:h-8 px-3 desktop:px-2.5 textSm rounded-lg font-medium", // used in DetailsModal.tsx
    sm: "h-12 desktop:h-9 px-3 desktop:px-2.5 rounded-lg font-medium",
    base: "h-13 desktop:h-10 px-4 desktop:px-3 rounded-lg font-medium",
    login: "h-13 desktop:h-12 px-3.5 rounded-xl font-medium",
    // special sizes
    icon: "flex-none aspect-square w-9 desktop:w-8 rounded-lg",
    pill: "h-11 desktop:h-8 px-4 desktop:px-3.5 textXs rounded-full gap-2 font-normal",
    hug: "",
  };

  // consider adding "inline-flex" to base className
  return (
    <button
      {...props}
      className={`flex items-center justify-center gap-1 disabled:cursor-default select-none ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      type={props.type ?? "button"}
    >
      {isLoading ? (
        <ImSpinner2 className={`animate-spin text-[32px] desktop:text-[24px] ${variant === "outline" ? "text-textSecondary" : ""}`} />
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
