export default function SettingsField({ children, label, className }: { children: React.ReactNode; label: string; className?: string }) {
  return (
    <div
      className={`flex-none w-full py-3 desktop:py-3 flex items-center justify-between gap-2 desktop:gap-12 border-b-[1.5px] border-borderFaint ${className}`}
    >
      <p className="settingsLabel">{label}</p>
      {children}
    </div>
  );
}
