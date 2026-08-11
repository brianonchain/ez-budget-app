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
    <div className="py-3 w-full flex flex-col items-center gap-3">
      <div className="w-full flex items-center justify-between">
        <p className="settingsLabel">{label}</p>
        <SettingsAddButton onClick={onClickAdd} />
      </div>
      <div className="p-3 w-full border border-buttonOutlineBorder roundedButton">{children}</div>
    </div>
  );
}
