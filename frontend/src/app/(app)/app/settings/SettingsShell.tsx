export default function SettingsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full pageContentMaxWidth px-4 py-4 portrait:sm:py-6 landscape:lg:py-6 flex flex-col items-center gap-4">
      {children}
    </div>
  );
}
