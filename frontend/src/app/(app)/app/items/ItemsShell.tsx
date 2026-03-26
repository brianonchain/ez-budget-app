// portrait:sm and landscape:lg shows list container
export default function ItemsShell({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="w-full pageContentMaxWidth portrait:sm:py-6 landscape:lg:py-6">
      <div className="w-full textSm portrait:sm:rounded-2xl landscape:lg:rounded-2xl overflow-hidden shadow-[0px_0px_12px_0px_rgba(0,0,0,0.0.08)] dark:shadow-none">
        {/*--- header, scrollbar-stable also applied ---*/}
        <div className="px-[3%] h-[var(--listHeaderHeight)] listHeaderColor flex items-center font-semibold text-textSecondary border-b border-borderFaint portrait:sm:overflow-y-auto landscape:lg:overflow-y-auto thinScrollbar scrollbar-stable">
          <p className="w-[50%]">Item</p>
          <p className="w-[25%]">Cost</p>
          <p className="w-[25%] text-end">Category</p>
        </div>
        {/*--- list container (either items or skeleton) ---*/}
        <div className="relative w-full listTotalHeight listContainerColor">
          <div className="listFade w-full h-full overscroll-none overflow-y-auto select-none portrait:sm:thinScrollbar landscape:lg:thinScrollbar scrollbar-stable">
            {children}
          </div>
          <div className="z-10 left-0 bottom-0 absolute w-full h-[var(--listButtonContainerHeight)] flex items-center justify-center">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
