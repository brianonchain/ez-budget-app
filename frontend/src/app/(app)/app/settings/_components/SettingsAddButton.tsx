import { FaPlus } from "react-icons/fa6";

export default function SettingsAddButton({
  onClickAdd,
  label,
  className,
}: {
  onClickAdd?: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button className={`h-7 font-medium linkColor flex items-center justify-center gap-1 cursor-pointer ${className}`} onClick={onClickAdd}>
      <FaPlus /> New {label}
    </button>
  );
}
