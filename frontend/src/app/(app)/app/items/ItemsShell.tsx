// tablet & desktop shows list container
export default function ItemsShell({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="w-full pageContentMaxWidth tablet:py-6">
      <div className="w-full tablet:roundedModal overflow-hidden border-none border-blue-100/16 shadow-[0px_0px_12px_0px_rgba(0,0,0,0.0.08)] dark:shadow-none">
        {/*--- HEADER ---*/}
        <div className="px-[3%] h-(--listHeaderHeight) bg-bgPrimary tablet:bg-card text-buttonPrimaryBg dark:text-textPrimary flex items-center font-semibold border-b border-borderFaint tablet:overflow-y-auto thinScroll scrollbar-gutter-stable">
          <p className="w-[50%]">Item</p>
          <p className="w-[25%]">Cost</p>
          <p className="w-[25%] text-end">Category</p>
        </div>
        {/*--- ITEMS ---*/}
        <div className="relative w-full h-[calc(100dvh-var(--menuHeight)-var(--listHeaderHeight)-var(--listPadding))] bg-card">
          {/*--- items container ---*/}
          <div className="w-full h-full overscroll-none overflow-y-auto select-none tablet:thinScroll scrollbar-gutter-stable">
            {children}
          </div>
          {/*--- fade overlay ---*/}
          <div className="absolute z-[2] left-0 bottom-0 w-full h-[calc(var(--listFadeHeight)+1rem)] bg-gradient-to-b from-transparent via-white/60 dark:via-[#141542]/60 via-40% to-white dark:to-[#141542]" />
          {/*--- + item button ---*/}
          <div className="z-[3] absolute left-0 bottom-0 w-full h-(--listFadeHeight) flex items-center justify-center">{footer}</div>
        </div>
      </div>
    </div>
  );
}
