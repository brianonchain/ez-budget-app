export default function SettingsField({ children, label, className }: { children: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={`w-full py-3 flex items-center justify-between gap-4 border-b border-borderFaint ${className}`}>
      <p className="settingsLabel">{label}</p>
      {children}
    </div>
  );
}
