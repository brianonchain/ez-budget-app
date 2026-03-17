import PageGlow from "../_components/PageGlow";

export default function SettingsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="appPageContainer scrollbar-stable overflow-x-clip">
      <div className="relative z-10 xs:pt-4 portrait:sm:pt-8 landscape:lg:pt-8 desktop:!pt-4 xs:pb-10 xs:px-4 w-full max-w-150 desktop:max-w-130 space-y-4 portrait:sm:space-y-8 landscape:lg:space-y-8 desktop:!space-y-4">
        {children}
      </div>
    </div>
  );
}
