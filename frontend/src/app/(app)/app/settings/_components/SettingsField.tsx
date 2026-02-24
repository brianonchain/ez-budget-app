export default function SettingsField({ children, label, className }: { children: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={`settingsField ${className}`}>
      <p className="settingsLabel">{label}</p>
      {children}
    </div>
  );
}
