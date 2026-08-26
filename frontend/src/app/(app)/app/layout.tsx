import Menu from "./_components/Menu";
import ContextProvider from "./_components/ContextProvider";
import PageGlow from "@/utils/components/glows/PageGlow";
import SplashScreen from "./_components/SplashScreen";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative d ">
      {/* <SplashScreen /> */}
      <Menu />
      <ContextProvider>
        {/* z-0, y-centered on screen (not content page) but looks better that way */}
        <PageGlow />
        {/* z-10; overscroll-cotain possibly prevents scroll locking when scrolled to end */}
        <main className="z-10 relative pt-[env(safe-area-inset-top)] h-[calc(100vh-var(--menuHeight))] w-[calc(100%-var(--menuWidth))] ml-(--menuWidth) flex flex-col items-center overflow-y-auto overscroll-contain scrollbar-gutter-stable">
          {children}
        </main>
      </ContextProvider>
    </div>
  );
}
