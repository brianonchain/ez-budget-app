import Menu from "./_components/Menu";
import ContextProvider from "./_components/ContextProvider";
import PageGlow from "./_components/PageGlow";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-dvh overflow-hidden grid portrait:grid-rows-[1fr_80px] portrait:sm:grid-rows-[1fr_120px] landscape:grid-cols-[120px_1fr] landscape:lg:grid-cols-[160px_1fr]">
      <div className="relative order-1 landscape:order-2 min-h-0 min-w-0 bg-primaryBg flex flex-col items-center overflow-y-auto scrollbar-stable">
        <PageGlow />
        <ContextProvider>{children}</ContextProvider>
      </div>
      <Menu className="order-2 landscape:order-1" />
    </div>
  );
}
