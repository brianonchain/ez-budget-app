import { FaPlus, FaTag } from "react-icons/fa6";
import { Item } from "@/db/UserModel";
import Spinner from "@/utils/components/Spinner";

export default function List({ setPage, setErrorModal, data, setNewItem }: { setPage: any; setErrorModal: any; data: any; setNewItem: any }) {
  return (
    <>
      <div className="portrait:sm:pt-[16px] landscape:lg:pt-[16px] w-full portrait:sm:max-w-[540px] landscape:lg:max-w-[540px]">
        <div className="portrait:sm:pb-[16px] landscape:lg:pb-[16px] w-full bg-lightBg1 dark:bg-blue-400/6 portrait:sm:rounded-[16px] landscape:lg:rounded-[16px] portrait:sm:border-1 landscape:lg:border-1 border-white/10 overflow-hidden">
          {/*--- header, h=50px, use 2 divs to make scrollbar space aligned with list ---*/}
          <div className="text-slate-700 dark:text-slate-400 bg-lightBg3 dark:bg-blue-400/14 thinScrollbar overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
            <div className="px-[3%] listHeaderHeight grid grid-cols-[50%_20%_30%] items-center font-bold">
              <p>Item</p>
              <p>Cost</p>
              <p className="justify-self-end">Category</p>
            </div>
          </div>

          {/*--- items ---*/}
          {data ? (
            <div
              className="w-full listAllHeight itemText overscroll-none overflow-y-auto overflow-x-hidden select-none relative portrait:sm:thinScrollbar landscape:lg:thinScrollbar"
              style={{ scrollbarGutter: "stable" }}
            >
              {data.items.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">No items yet</div>
              ) : (
                <>
                  {data.items.map((item: Item, index: number) => (
                    <div
                      key={index}
                      className="px-[3%] w-full listItemHeight grid grid-cols-[50%_20%_30%] items-center border-b-[1.5px] border-slate-200 dark:border-white/5 desktop:cursor-pointer desktop:hover:bg-lightBg2 dark:desktop:hover:bg-blue-500/10"
                      onClick={() => {
                        setNewItem(item);
                        setPage("details");
                      }}
                    >
                      <div className="">{item.description}</div>
                      <div className="">{item.cost}</div>
                      <div className="flex flex-col justify-self-end text-end">
                        {item.category !== "none" && <p className="font-medium leading-tight">{item.category}</p>}
                        {item.subcategory !== "none" && <p className="italic text-sm desktop:text-xs leading-tight text-slate-500 dark:text-slate-400">{item.subcategory}</p>}
                        {item.tags !== "none" && <div className="text-sm desktop:text-xs leading-tight text-lightButton1Bg dark:text-darkButton1Bg truncate">{item.tags}</div>}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="w-full listAllHeight flex items-center justify-center">
              <Spinner />
            </div>
          )}
        </div>
      </div>

      {/*--- add item h-80px/110px ---*/}
      <div className="flex-none w-full listButtonContainerHeight flex items-center justify-center">
        <div
          className="button1Color w-[200px] h-[60px] rounded-full flex items-center gap-[8px] justify-center desktop:cursor-pointer"
          onClick={() => {
            setNewItem({ date: "", cost: 0, description: "", category: "none", subcategory: "none", tags: "none" }); // reset item to default
            setPage("cost");
          }}
        >
          <FaPlus className="text-[20px]" />
          <p className="text-lg font-semibold">Item</p>
        </div>
      </div>
    </>
  );
}
