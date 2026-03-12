import PageGlow from "../_components/PageGlow";

export default function SettingsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="appPageContainer scrollbar-stable overflow-x-clip">
      <div className="relative z-10 pb-[40px] px-[12px] w-full max-w-150 desktop:max-w-130">{children}</div>
    </div>
  );
}
