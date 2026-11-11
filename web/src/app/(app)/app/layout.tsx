import Menu from "./_components/Menu";
import ContextProvider from "./_components/ContextProvider";
import PageGlow from "@/utils/components/glows/PageGlow";
import SplashScreen from "./_components/SplashScreen";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* <SplashScreen /> */}
      <Menu />
      <ContextProvider>
        {/* z-0, y-centered on screen (not content page) but looks better that way */}
        <PageGlow />
        {/* z-10; overscroll-cotain possibly prevents scroll locking when scrolled to end */}
        <main className="relative z-10 pt-[env(safe-area-inset-top)] w-[calc(100%-var(--menuWidth))] h-[calc(100vh-var(--menuHeight))] ml-(--menuWidth) flex flex-col items-center overflow-y-auto overscroll-contain scrollbar-gutter-stable">
          {children}
        </main>
      </ContextProvider>
    </>
  );
}
