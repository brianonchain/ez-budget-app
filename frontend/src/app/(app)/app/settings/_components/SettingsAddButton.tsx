import { FaPlus } from "react-icons/fa6";

type SettingsAddButtonProps = {
  label: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function SettingsAddButton({ label, className, ...props }: SettingsAddButtonProps) {
  return (
    <button className={`font-medium link flex items-center gap-1 ${className}`} {...props}>
      <FaPlus /> New {label}
    </button>
  );
}
