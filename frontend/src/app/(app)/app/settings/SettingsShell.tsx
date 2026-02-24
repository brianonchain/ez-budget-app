import PageGlow from "../_components/PageGlow";

export default function SettingsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="appPageContainer" style={{ scrollbarGutter: "stable" }}>
      <PageGlow />
      <div className="relative z-10 pb-[40px] px-[12px] w-full max-w-[500px] desktop:max-w-[400px]">{children}</div>
    </div>
  );
}
