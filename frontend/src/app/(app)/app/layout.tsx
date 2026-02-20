import Menu from "./_components/Menu";
import ContextProvider from "./_components/ContextProvider";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  console.log("/(app)/app/layout.tsx");

  return (
    <div className="bg-lightBg2 dark:bg-darkBg1">
      <Menu />
      <ContextProvider>{children}</ContextProvider>
    </div>
  );
}
