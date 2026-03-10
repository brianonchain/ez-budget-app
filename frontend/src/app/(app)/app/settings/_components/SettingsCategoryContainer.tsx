import { FaPlus } from "react-icons/fa6";
import SettingsAddButton from "./SettingsAddButton";

export default function SettingsCategoryContainer({
  children,
  label,
  addButtonLabel,
  onClickAdd,
}: {
  children: React.ReactNode;
  label: string;
  addButtonLabel: string;
  onClickAdd?: () => void;
}) {
  return (
    <div className="py-4 w-full flex flex-col items-center gap-4">
      <div className="w-full flex items-center justify-between">
        <p className="settingsLabel">{label}</p>
        <SettingsAddButton onClickAdd={onClickAdd} label={addButtonLabel} />
      </div>
      {children}
    </div>
  );
}
