import VerifyUserClient from "./VerifyUserClient";
import LoginLogo from "../_components/LoginLogo";
import LoginGlow from "../_components/LoginGlow";

export default function page() {
  console.log("(app)/register/page.tsx");

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white dark:bg-darkBg1 overflow-y-auto relative">
      <div className="pt-[40px] w-[350px] desktop:w-[290px] h-[800px] desktop:h-[660px] flex flex-col items-center z-10">
        <LoginLogo />
        <VerifyUserClient />
      </div>
      <LoginGlow />
    </div>
  );
}
