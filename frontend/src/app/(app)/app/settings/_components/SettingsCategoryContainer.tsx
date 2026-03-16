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
    <div className="w-full flex flex-col items-center gap-3">
      <div className="w-full flex items-center justify-between">
        <p className="settingsLabel">{label}</p>
        <SettingsAddButton onClick={onClickAdd} label={addButtonLabel} />
      </div>
      {children}
    </div>
  );
}
