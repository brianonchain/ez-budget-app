export default function SettingsShell({ children }: { children: React.ReactNode }) {
  return <div className="w-full pageContentMaxWidth px-4 py-(--pageYPadding) flex flex-col items-center gap-4">{children}</div>;
}
