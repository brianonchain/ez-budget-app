import LoginLogo from "./_components/LoginLogo";
import LoginGlow from "./_components/LoginGlow";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-[100px] w-full min-h-screen flex flex-col items-center bg-white dark:bg-darkBg1 overflow-y-auto relative z-0">
      <div className="pb-[50px] px-[0px] w-full max-w-[360px] desktop:max-w-[320px] flex flex-col items-center">
        <LoginLogo />
        {children}
      </div>
      <LoginGlow />
    </div>
  );
}
