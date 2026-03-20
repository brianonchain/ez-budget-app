import PageGlow from "../_components/PageGlow";

export default function SettingsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="appPageContainer relative z-10 scrollbar-stable overflow-x-clip">
      <div className="pt-4 portrait:sm:pt-8 landscape:lg:pt-8 desktop:!pt-4 pb-10 w-full pageContentMaxWidth space-y-4 portrait:sm:space-y-8 landscape:lg:space-y-8 desktop:!space-y-4">
        {children}
      </div>
    </div>
  );
}
