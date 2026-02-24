import PageGlow from "../_components/PageGlow";

export default function ItemsShell({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="appPageContainer">
      <PageGlow />
      <div className="z-10 portrait:sm:mt-[16px] landscape:lg:mt-[16px] w-full portrait:sm:max-w-[500px] landscape:lg:max-w-[500px] portrait:sm:pb-[16px] landscape:lg:pb-[16px] bg-lightBg1 dark:bg-blue-400/10 portrait:sm:rounded-2xl landscape:lg:rounded-2xl portrait:sm:border-1 landscape:lg:border-1 border-white dark:border-white/10 overflow-hidden shadow-[0px_0px_12px_0px_rgba(0,0,0,0.0.08)] dark:shadow-none">
        {/*--- header, scrollbar-stable also applied ---*/}
        <div className="px-[3%] listHeaderHeight grid grid-cols-[50%_20%_30%] items-center font-semibold bg-lightBg2 text-slate-700 dark:bg-darkBg1 dark:portrait:sm:bg-blue-400/10 dark:landscape:lg:bg-blue-400/10 dark:text-slate-400 portrait:sm:overflow-y-auto landscape:lg:overflow-y-auto thinScrollbar scrollbar-stable">
          <p>Item</p>
          <p>Cost</p>
          <p className="justify-self-end">Category</p>
        </div>
        {/*--- list container (either items or skeleton) ---*/}
        <div className="w-full listAllHeight itemText overscroll-none overflow-y-auto overflow-x-hidden select-none relative portrait:sm:thinScrollbar landscape:lg:thinScrollbar scrollbar-stable">
          {children}
        </div>
      </div>
      {/*--- addItemButton container, h-80px/110px ---*/}
      <div className="z-10 flex-none w-full listButtonContainerHeight flex items-center justify-center">{footer}</div>
    </div>
  );
}
