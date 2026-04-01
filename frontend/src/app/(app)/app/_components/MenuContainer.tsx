export default function MenuContainer({ children }: { children: React.ReactNode }) {
  const menuSize = "landscape:w-[120px] landscape:lg:w-[160px] landscape:h-dvh portrait:w-dvw portrait:h-[80px] portrait:sm:h-[120px]";
  const menuBg =
    "bg-card dark:bg-bgPrimary dark:portrait:bg-gradient-to-b dark:landscape:bg-gradient-to-l dark:from-card dark:to-transparent dark:to-60%";
  const menuShadow = "shadow-[0px_0px_16px_0px_rgba(0,0,0,0.1)] dark:shadow-none";
  const menuPbSafeArea = "portrait:pb-[26px] portrait:sm:pb-[40px]";

  return (
    <div
      className={`fixed z-20 portrait:bottom-0 landscape:left-0 flex portrait:items-end landscape:items-center justify-center ${menuSize} ${menuBg} ${menuShadow}`}
    >
      <div
        className={`landscape:w-full landscape:h-[70%] landscape:max-h-100 portrait:w-[80%] portrait:max-w-140 ${menuPbSafeArea} flex landscape:flex-col items-center justify-between`}
      >
        {children}
      </div>
    </div>
  );
}
