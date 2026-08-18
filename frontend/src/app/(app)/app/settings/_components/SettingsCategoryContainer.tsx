import SettingsAddButton from "./SettingsAddButton";

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
    <div className="py-3 flex flex-col items-center gap-3 border-b border-borderFaint">
      <div className="w-full flex items-center justify-between">
        <p className="settingsLabel">{label}</p>
        <SettingsAddButton onClick={onClickAdd} />
      </div>
      <div className="w-[90%] border border-borderFaint roundedButton overflow-hidden bg-blue-400/5">{children}</div>
    </div>
  );
}
