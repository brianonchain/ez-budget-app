// portrait:sm and landscape:lg shows list container
export default function ItemsShell({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="w-full pageContentMaxWidth portrait:sm:px-4 landscape:lg:px-4 portrait:sm:py-6 landscape:lg:py-6">
      <div className="w-full textSm portrait:sm:rounded-2xl landscape:lg:rounded-2xl overflow-hidden shadow-[0px_0px_12px_0px_rgba(0,0,0,0.0.08)] dark:shadow-none">
        {/*--- header, scrollbar-stable also applied ---*/}
        <div className="px-[3%] h-[var(--listHeaderHeight)] listHeaderColor flex items-center font-semibold text-textSecondary border-b border-borderFaint portrait:sm:overflow-y-auto landscape:lg:overflow-y-auto thinScrollbar scrollbar-stable">
          <p className="w-[50%]">Item</p>
          <p className="w-[25%]">Cost</p>
          <p className="w-[25%] text-end">Category</p>
        </div>
        {/*--- list container ---*/}
        <div className="relative w-full listTotalHeight listContainerColor">
          {/*--- list ---*/}
          <div className="w-full h-full overscroll-none overflow-y-auto select-none portrait:sm:thinScrollbar landscape:lg:thinScrollbar scrollbar-stable">
            {children}
          </div>
          {/*--- fade overlay ---*/}
          <div className="absolute z-[2] left-0 bottom-0 w-full h-[calc(var(--listButtonContainerHeight)+1rem)] bg-gradient-to-b from-transparent via-white/60 dark:via-[#141542]/60 via-40% to-white dark:to-[#141542]" />
          {/*--- + item button ---*/}
          <div className="z-[3] absolute left-0 bottom-0 w-full h-[var(--listButtonContainerHeight)] flex items-center justify-center">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
