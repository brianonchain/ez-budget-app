import PageGlow from "../_components/PageGlow";

export default function ItemsShell({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="appPageContainer">
      <div className="z-10 portrait:sm:mt-6 landscape:lg:mt-6 w-full portrait:sm:max-w-125 landscape:lg:max-w-125 portrait:sm:pb-4 landscape:lg:pb-4 bg-card portrait:sm:rounded-2xl landscape:lg:rounded-2xl portrait:sm:border-1 landscape:lg:border-1 border-white dark:border-white/10 overflow-hidden shadow-[0px_0px_12px_0px_rgba(0,0,0,0.0.08)] dark:shadow-none">
        {/*--- header, scrollbar-stable also applied ---*/}
        <div className="px-[3%] h-[var(--listHeaderHeight)] grid grid-cols-[50%_20%_30%] listHeaderColor items-center font-semibold portrait:sm:overflow-y-auto landscape:lg:overflow-y-auto thinScrollbar scrollbar-stable">
          <p>Item</p>
          <p>Cost</p>
          <p className="justify-self-end">Category</p>
        </div>
        {/*--- list container (either items or skeleton) ---*/}
        <div className="w-full listTotalHeight text-base desktop:text-sm overscroll-none overflow-y-auto overflow-x-hidden select-none relative portrait:sm:thinScrollbar landscape:lg:thinScrollbar scrollbar-stable">
          {children}
        </div>
      </div>
      {/*--- addItemButton container, h-80px/110px ---*/}
      <div className="z-10 flex-none w-full h-[var(--listButtonContainerHeight)] flex items-center justify-center">{footer}</div>
    </div>
  );
}
