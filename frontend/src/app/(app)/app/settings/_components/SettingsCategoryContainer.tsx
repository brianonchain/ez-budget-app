import { FaPlus } from "react-icons/fa6";

export default function SettingsCategoryContainer({
  children,
  label,
  onClickAdd,
}: {
  children: React.ReactNode;
  label: string;
  onClickAdd?: () => void;
}) {
  return (
    <div className="py-4 w-full flex flex-col items-center gap-4 border-b-[1.5px] borderColorFaint border-none">
      <div className="w-full flex items-center gap-4">
        <p className="settingsLabel">{label}</p>
        <button className="buttonSettings" onClick={onClickAdd}>
          <FaPlus /> New
        </button>
      </div>
      {children}
    </div>
  );
}
