import { FaPlus } from "react-icons/fa6";

type SettingsAddButtonProps = {
  label: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function SettingsAddButton({ label, className, ...props }: SettingsAddButtonProps) {
  return (
    <button className={`h-7 font-medium linkColor flex items-center justify-center gap-1 cursor-pointer ${className}`} {...props}>
      <FaPlus /> New {label}
    </button>
  );
}
