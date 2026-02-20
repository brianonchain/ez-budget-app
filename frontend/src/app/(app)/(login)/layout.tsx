import LoginLogo from "./_components/LoginLogo";
import LoginGlow from "./_components/LoginGlow";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-dvh relative">
      <LoginGlow />
      <div className="z-[1] pt-[100px] w-full h-dvh flex flex-col items-center overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
        <div className="pb-[50px] px-[0px] w-full max-w-[360px] desktop:max-w-[320px] flex flex-col items-center">
          <LoginLogo />
          {children}
        </div>
      </div>
    </div>
  );
}
