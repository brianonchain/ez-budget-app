type ButtonProps = {
  label: string;
  isLoading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ label, isLoading = false, className = "", icon, color = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`flex items-center gap-1 font-medium h-12 desktop:h-9 px-3 desktop:px-2.5 rounded-lg desktop:cursor-pointer ${
        color === "primary" ? "button1Color" : color === "secondary" ? "button2Color" : "buttonRed2Color"
      } ${className}`}
      {...props}
    >
      {icon}
      {label}
    </button>
  );
}
