import Menu from "./_components/Menu";
import ContextProvider from "./_components/ContextProvider";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className={`w-full h-screen flex portrait:flex-col-reverse landscape:flex-row bg-lightBg2 dark:bg-darkBg1`}>
      <Menu />
      <ContextProvider>{children}</ContextProvider>
    </div>
  );
}
