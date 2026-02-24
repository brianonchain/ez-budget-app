export default function SettingsCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="settingsCard">
      <div className="settingsTitle">{title}</div>
      {children}
    </div>
  );
}
