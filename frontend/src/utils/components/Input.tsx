import React from "react";

type InputProps = {
  inputSize?: "xs" | "sm" | "base" | "login";
  variant?: "primary" | "transparent";
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ inputSize = "base", variant = "primary", className = "", ...props }: InputProps) {
  const variants = {
    primary: "inputPrimaryColor",
    transparent: "inputOutlineColor",
  };

  const sizes = {
    xs: "h-11 desktop:h-8 px-3 desktop:px-2.5 textSm rounded-lg", // used in DetailsModal.tsx
    sm: "h-12 desktop:h-9 px-3 desktop:px-2.5 rounded-lg", // not used anywhere yet
    base: "h-13 desktop:h-10 px-3.5 desktop:px-3 rounded-lg",
    login: "h-13 desktop:h-12 px-3.5 rounded-xl", // uses 16px text size
  };

  return <input className={`w-full ${variants[variant]} ${sizes[inputSize]} ${className}`} {...props} />;
}
