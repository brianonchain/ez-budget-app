import Menu from "./_components/Menu";
import ContextProvider from "./_components/ContextProvider";
import PageGlow from "./_components/PageGlow";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-primaryBg relative">
      <PageGlow />
      <Menu />
      <ContextProvider>
        <div className="z-10 relative h-[calc(100dvh-var(--menuHeight))] portrait:w-full landscape:w-[calc(100%-120px)] landscape:lg:w-[calc(100%-160px)] landscape:ml-[120px] landscape:lg:ml-[160px] flex flex-col items-center overflow-y-auto scrollbar-stable">
          {children}
        </div>
      </ContextProvider>
    </div>
  );
}
