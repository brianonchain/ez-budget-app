import { ImSpinner2 } from "react-icons/im";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isLoading?: boolean;
  className?: string;
}

export default function Button({ label, isLoading = false, className = "", ...props }: ButtonProps) {
  return (
    <button className={`button1 w-full ${className}`} {...props}>
      {isLoading ? <ImSpinner2 className="animate-spin text-[32px] desktop:text-[24px]" /> : label}
    </button>
  );
}
