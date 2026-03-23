import Menu from "./_components/Menu";
import ContextProvider from "./_components/ContextProvider";
import PageGlow from "./_components/PageGlow";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-primaryBg relative">
      <PageGlow />
      <Menu />
      <ContextProvider>
        <div className="appPageContainer">{children}</div>
      </ContextProvider>
    </div>
  );
}
