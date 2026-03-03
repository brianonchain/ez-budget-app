import LoginLogo from "./_components/LoginLogo";
import LoginGlow from "./_components/LoginGlow";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-dvh">
      {/*--- glow: must be outside scrollbar ---*/}
      <LoginGlow />
      {/*--- content ---*/}
      <div className="relative z-[1] h-dvh overflow-y-auto scrollbar-stable">
        <div className="mx-auto pt-[100px] pb-[50px] px-3 desktop:px-0 w-full max-w-96 desktop:w-75 flex flex-col items-center">
          <LoginLogo />
          {children}
        </div>
      </div>
    </div>
  );
}
