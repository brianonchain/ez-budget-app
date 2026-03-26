import PageGlow from "../_components/PageGlow";

// portrait:sm and landscape:lg shows list container
export default function ItemsShell({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <>
      <div className="portrait:sm:my-6 landscape:lg:my-6 w-full max-w-142 desktop:max-w-132 portrait:sm:rounded-2xl landscape:lg:rounded-2xl overflow-hidden shadow-[0px_0px_12px_0px_rgba(0,0,0,0.0.08)] dark:shadow-none">
        {/*--- header, scrollbar-stable also applied ---*/}
        <div className="px-[3%] h-[var(--listHeaderHeight)] listHeaderColor flex items-center font-semibold portrait:sm:overflow-y-auto landscape:lg:overflow-y-auto thinScrollbar scrollbar-stable">
          <p className="w-[50%]">Item</p>
          <p className="w-[25%]">Cost</p>
          <p className="w-[25%] text-end">Category</p>
        </div>
        {/*--- list container (either items or skeleton) ---*/}
        <div className="listFade w-full listTotalHeight text-base desktop:text-sm listContainerColor overscroll-none overflow-y-auto select-none relative portrait:sm:thinScrollbar landscape:lg:thinScrollbar scrollbar-stable">
          {children}
        </div>
      </div>
      {/*--- addItemButton container, h-80px/110px ---*/}
      <div className="z-10 absolute bottom-0 left-0 flex-none w-full h-[var(--listButtonContainerHeight)] flex items-center justify-center listButtonContainerColor">
        {footer}
      </div>
    </>
  );
}
