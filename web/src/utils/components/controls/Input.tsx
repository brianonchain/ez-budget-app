import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
// custom
import { heights } from "./heights";

const inputVariants = cva(
  "w-full min-w-0 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", // removed: h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-input/50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80; colors/focus/transition come from inputColor / inputLoginColor
  {
    variants: {
      variant: {
        // custom — replace shadcn border-input / bg-transparent / focus-visible:ring-*
        default: "inputColor",
        login: "inputLoginColor", // only used for login form
      },
      inputSize: {
        // custom — replace shadcn h-8 px-2.5 py-1 text-base md:text-sm rounded-lg
        xs: `${heights.xs} px-3 desktop:px-2.5 textSm`, // used in DetailsPage.tsx
        sm: `${heights.sm} px-3 desktop:px-2.5`, // not used anywhere yet
        default: `${heights.default} px-3.5 desktop:px-3`,
        login: `${heights.login} px-3.5 desktop:px-3.5`, // login form uses 16px text for desktop
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  },
);

function Input({
  className,
  type,
  variant = "default",
  inputSize = "default",
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return <InputPrimitive type={type} data-slot="input" className={cn(inputVariants({ variant, inputSize, className }))} {...props} />;
}

export { Input, inputVariants };
export default Input;
