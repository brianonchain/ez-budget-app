// tablet & desktop shows list container
export default function ItemsShell({ children, addItemButton }: { children: React.ReactNode; addItemButton: React.ReactNode }) {
  return (
    <div className="w-full h-full pageContentMaxWidth tablet:py-(--pageYPadding) select-none">
      {/*--- ITEMS CARD ---*/}
      <div className="relative isolate w-full h-full flex flex-col tablet:roundedModal overflow-hidden shadow-[0px_0px_12px_0px_rgba(0,0,0,0.0.08)] dark:shadow-none">
        {/*--- header ---*/}
        <div className="shrink-0 px-[3%] h-12 tablet:h-14 tablet:bg-card text-buttonPrimaryBg dark:text-textPrimary flex items-center font-semibold border-b border-borderFaint tablet:overflow-y-auto thinScroll scrollbar-gutter-stable">
          <span className="w-1/2">Item</span>
          <span className="w-1/4">Cost</span>
          <span className="w-1/4 text-end">Category</span>
        </div>
        {/*--- items ---*/}
        <div className="w-full flex-1 min-h-0 bg-card overscroll-contain overflow-y-auto tablet:thinScroll scrollbar-gutter-stable">
          {children}
        </div>
        {/*--- fade overlay (z-2) ---*/}
        <div className="absolute z-[2] left-0 bottom-0 w-full h-28 bg-gradient-to-b from-transparent via-white/60 dark:via-[#141542]/60 via-40% to-white dark:to-[#141542] pointer-events-none" />
        {/*--- add items button (z-3) ---*/}
        {addItemButton}
      </div>
    </div>
  );
}
