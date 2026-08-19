const menuSize = "w-(--menuWidth) h-(--menuHeight) landscape:h-dvh portrait:w-dvw";
const menuBg =
  "bg-card dark:bg-bgPrimary dark:portrait:bg-gradient-to-b dark:landscape:bg-gradient-to-l dark:from-card dark:to-transparent dark:to-60%";
const menuShadow = "shadow-[0px_0px_16px_0px_rgba(0,0,0,0.1)] dark:shadow-none";
const pbSafeArea = "pb-[24px]";

export default function MenuContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`fixed z-20 portrait:bottom-0 landscape:left-0 tablet:portrait:px-[5%] tablet:landscape:py-[3%] flex portrait:items-end landscape:items-center justify-center ${menuSize} ${pbSafeArea} ${menuBg} ${menuShadow}`}
    >
      <div
        className={`landscape:w-full landscape:h-full landscape:max-h-190 portrait:w-full portrait:max-w-220 flex landscape:flex-col items-center justify-evenly`}
      >
        {children}
      </div>
    </div>
  );
}
