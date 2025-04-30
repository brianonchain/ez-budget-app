import RegisterClient from "./RegisterClient";
import LoginLogo from "../_components/LoginLogo";
import LoginGlow from "../_components/LoginGlow";

export default async function page() {
  console.log("(app)/register/page.tsx");

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white dark:bg-darkBg1 overflow-y-auto relative">
      <div className="pt-[30px] pb-[50px] w-[350px] desktop:w-[290px] flex flex-col items-center z-10">
        <LoginLogo />
        <RegisterClient />
      </div>
      <LoginGlow />
    </div>
  );
}
