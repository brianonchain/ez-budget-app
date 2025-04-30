import LoginLogo from "../_components/LoginLogo";
import LoginClient from "./LoginClient";
import LoginGlow from "../_components/LoginGlow";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export default async function page() {
  console.log("(app)/login/page.tsx");

  const session = await getServerSession();
  if (session?.user) redirect("/app/items");

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white dark:bg-darkBg1 overflow-y-auto relative">
      <div className="pt-[40px] w-[350px] desktop:w-[290px] h-[800px] desktop:h-[660px] flex flex-col items-center z-10">
        <LoginLogo />
        <LoginClient />
      </div>
      <LoginGlow />
    </div>
  );
}
