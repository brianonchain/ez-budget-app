import LoginLogo from "./_components/LoginLogo";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="login textBase relative w-full h-dvh overflow-y-auto scrollbar-stable">
      {/*--- glow ---*/}
      <div
        className="z-0 fixed bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 w-full h-full xs:w-[70%] xs:h-[90%] rounded-full bg-white dark:bg-[#0444B7] blur-[200px] dark:blur-[200px] xs:dark:blur-[300px] pointer-events-none dark:block hidden"
        aria-hidden
      />
      {/*--- content ---*/}
      <div className="relative z-[1] mx-auto pt-[100px] pb-[50px] px-3 desktop:px-0 w-full max-w-96 desktop:w-90 flex flex-col items-center">
        <LoginLogo />
        {children}
      </div>
    </div>
  );
}
