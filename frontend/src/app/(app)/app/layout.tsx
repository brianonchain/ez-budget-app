import Menu from "./_components/Menu";
import ContextProvider from "./_components/ContextProvider";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-lightBg2 dark:bg-darkBg1 relative">
      <Menu />
      <ContextProvider>{children}</ContextProvider>
    </div>
  );
}
