import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
// custom
import { heights } from "./heights";
import Spinner from "@/utils/components/Spinner";

const buttonVariants = cva(
  "relative group/button inline-flex shrink-0 items-center justify-center transition-all outline-none select-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0", // removed: rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap active:not-aria-[haspopup]:translate-y-px focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40; added relative
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-medium hover:bg-primaryHover active:bg-primaryHover active:scale-107 dark:border border-primaryBorder [transition:background-color_300ms,scale_200ms] dark:buttonWhiteGradient", // removed hover:bg-primary/80
        outline: "bg-transparent hover:bg-accent border border-borderStrong aria-expanded:bg-accent [transition:background-color_300ms]", // removed dark:bg-input/30
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground dark:hover:bg-accent/50",
        destructive: "text-destructive hover:bg-destructive/10 border border-destructive/60 [transition:background-color_300ms]",
        link: "text-primary underline-offset-4 hover:underline",
        // custom
        keypad: "bg-[#D6DEE9] dark:bg-primary/40 active:bg-slate-300 dark:active:bg-primary/80 transition-all duration-150",
        input: "inputColor",
      },
      size: {
        xs: `${heights.xs} px-3 desktop:px-2.5 textSm [&_svg:not([class*='size-'])]:size-3`, //removed h-6 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5
        sm: `${heights.sm} px-3 desktop:px-2.5 [&_svg:not([class*='size-'])]:size-3.5`, // removed h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5
        default: `${heights.default} px-4 desktop:px-3 [&_svg:not([class*='size-'])]:size-4`, // removed h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2
        "icon-xs": "size-11 desktop:size-10 roundedButtonSm [&_svg:not([class*='size-'])]:size-3", // removed rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg
        "icon-sm": "size-12 desktop:size-11 roundedButton [&_svg:not([class*='size-'])]:size-3.5", // removed rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg
        icon: "size-13 desktop:size-11 roundedButton [&_svg:not([class*='size-'])]:size-4", // removed size-8
        // custom
        login: `${heights.login} px-4 desktop:px-3.5`,
        xxsPill: `${heights.xxsPill} px-3.5 desktop:px-3 textSm font-normal`,
        xsPill: `${heights.xsPill} px-4 desktop:px-3.5 textXs font-normal`,
        addItem: "w-40 h-15 desktop:w-32 desktop:h-12 rounded-full",
        keypad: "w-20 h-20 desktop:w-12 desktop:h-12 textXl rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  variant = "default",
  size = "default",
  // destructured from button props
  className,
  disabled,
  // custom
  text,
  iconLeft,
  iconRight,
  labelClassName,
  isLoading = false,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    text?: React.ReactNode;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    labelClassName?: string;
    isLoading?: boolean;
  }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      disabled={isLoading || disabled}
    >
      <span
        className={cn(
          `flex items-center justify-center gap-1 whitespace-nowrap`,
          labelClassName,
          isLoading && "invisible",
          variant === "input" && "w-full justify-start font-normal",
        )}
      >
        {iconLeft && <span className="-ml-0.5">{iconLeft}</span>}
        {text}
        {iconRight && <span className="-mr-0.5">{iconRight}</span>}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner color={variant === "default" ? "white" : "default"} />
        </span>
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
