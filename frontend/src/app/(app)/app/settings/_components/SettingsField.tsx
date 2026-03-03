export default function SettingsField({ children, label, className }: { children: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={`flex-none w-full h-[2.8em] flex items-center justify-between gap-2 border-b-[1.5px] borderColorFaint ${className}`}>
      <p className="settingsLabel">{label}</p>
      {children}
    </div>
  );
}
