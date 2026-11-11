import { heights } from "./heights";

const variants = {
  primary: "inputColor",
  login: "inputLoginColor", // only used for login form
} as const;

const sizes = {
  xs: `${heights.xs} px-3 desktop:px-2.5 textSm`, // used in DetailsModal.tsx
  sm: `${heights.sm} px-3 desktop:px-2.5`, // not used anywhere yet
  default: `${heights.default} px-3.5 desktop:px-3`,
  login: `${heights.login} px-3.5 desktop:px-3.5`, // login form uses 16px text for desktop
} as const;

type InputProps = {
  variant?: keyof typeof variants;
  inputSize?: keyof typeof sizes;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ inputSize = "default", variant = "primary", className = "", ...props }: InputProps) {
  return <input className={`${variants[variant]} ${sizes[inputSize]} ${className}`} {...props} />;
}
