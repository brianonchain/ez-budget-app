import Menu from "./_components/Menu";
import ContextProvider from "./_components/ContextProvider";
import PageGlow from "./_components/PageGlow";
import SplashScreen from "./_components/SplashScreen";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative">
      {/* <SplashScreen /> */}
      <PageGlow />
      <Menu />
      <ContextProvider>
        <main className="z-10 relative h-[calc(100dvh-var(--menuHeight))] w-[calc(100%-var(--menuWidth))] ml-[var(--menuWidth)] flex flex-col items-center overflow-y-auto overscroll-contain">
          {children}
        </main>
      </ContextProvider>
    </div>
  );
}
