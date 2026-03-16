import { ImSpinner2 } from "react-icons/im";

type ButtonProps = {
  label?: string;
  variant?: "primary" | "transparent" | "danger" | "dangerTrans";
  size?: "pill" | "sm" | "base";
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
      "text-buttonPrimaryText bg-buttonPrimaryBg desktop:hover:bg-buttonPrimaryBgHover active:bg-buttonPrimaryBgHover disabled:opacity-80 [transition:background-color_200ms]",
    transparent:
      "text-button2Text bg-transparent desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover disabled:opacity-80 border border-inputOutlineBorder [transition:background-color_200ms]",
    danger:
      "text-buttonDangerText bg-buttonDangerBg desktop:hover:bg-buttonDangerBgHover active:bg-buttonDangerBgHover disabled:opacity-80 [transition:background-color_200ms]",
    dangerTrans:
      "text-textError hover:text-textErrorHover bg-transparent desktop:hover:bg-buttonOutlineBgHover active:bg-buttonOutlineBgHover disabled:opacity-80 border border-inputOutlineBorder [transition:background-color_200ms]",
  };

  const sizes = {
    pill: "h-11 desktop:h-8 px-4 desktop:px-3.5 textSmApp rounded-full font-normal gap-2", // used in DetailsModal.tsx
    sm: "h-12 desktop:h-9 px-3 desktop:px-2.5 textBaseApp rounded-lg", // same height and px as input(sm) and select(sm)
    base: "h-14 desktop:h-10 px-4 desktop:px-3 textBaseApp rounded-lg",
  };

  // consider adding "inline-flex" to base className
  return (
    <button
      {...props}
      className={`flex-none font-medium flex items-center justify-center gap-1 desktop:cursor-pointer disabled:cursor-default ${variants[variant]} ${sizes[size]} ${className}`}
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
