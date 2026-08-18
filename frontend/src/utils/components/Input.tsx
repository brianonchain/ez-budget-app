const variants = {
  primary: "inputPrimaryColor",
  danger: "inputDangerColor",
  login: "inputLoginColor", // only used for login form
} as const;

const sizes = {
  xs: "h-11 desktop:h-8 px-3 desktop:px-2.5 textSm roundedButtonSm", // used in DetailsModal.tsx
  sm: "h-12 desktop:h-9 px-3 desktop:px-2.5 roundedButton", // not used anywhere yet
  base: "h-13 desktop:h-10 px-3.5 desktop:px-3 roundedButton",
  login: "h-13 desktop:h-12 px-3.5 desktop:px-3.5 roundedButton", // login form uses 16px text for desktop
} as const;

type InputProps = {
  variant?: keyof typeof variants;
  inputSize?: keyof typeof sizes;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ inputSize = "base", variant = "primary", className = "", ...props }: InputProps) {
  return <input className={`${variants[variant]} ${sizes[inputSize]} ${className}`} {...props} />;
}
