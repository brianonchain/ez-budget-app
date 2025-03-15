import { FaPlus, FaTag } from "react-icons/fa6";
import { Item } from "@/db/UserModel";

export default function List({ setPage, setErrorModal, data, setNewItem }: { setPage: any; setErrorModal: any; data: any; setNewItem: any }) {
  return (
    <>
      {/*--- headers h-50px, use double containers and scrollbarGutter to mimic list width ---*/}
      <div className="flex-none w-full flex justify-center listHeaderHeight overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
        <div className="px-[8px] w-[94%] max-w-[500px] grid grid-cols-[50%_20%_30%] items-center font-bold">
          <p>Item</p>
          <p>Cost</p>
          <p className="justify-self-end">Category</p>
        </div>
      </div>

      {/*--- items ---*/}
      <div
        className={`itemText w-full listAllHeight flex flex-col items-center text-black overscroll-none overflow-y-auto overflow-x-hidden select-none relative`}
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="w-[94%] max-w-[500px]">
          {data &&
            data.items.map((item: Item, index: number) => (
              <div
                key={index}
                className="flex-none px-[8px] w-full listItemHeight grid grid-cols-[50%_20%_30%] items-center border-t border-slate-400 desktop:cursor-pointer desktop:hover:bg-slate-200"
                onClick={() => {
                  setNewItem(item);
                  setPage("details");
                }}
              >
                <div className="">{item.description}</div>
                <div className="">{item.cost}</div>
                <div className="flex flex-col justify-self-end text-end">
                  {item.category !== "none" && <p className="font-medium leading-tight">{item.category}</p>}
                  {item.subcategory !== "none" && <p className="italic text-sm desktop:text-xs leading-tight text-slate-500">{item.subcategory}</p>}
                  {item.tags !== "none" && <div className="text-sm desktop:text-xs leading-tight text-light-button1 truncate">{item.tags}</div>}
                </div>
              </div>
            ))}
        </div>
      </div>
      {/*--- add item h-90px/110px ---*/}
      <div className="flex-none w-full listButtonHeight flex items-center justify-center">
        <div
          className="border border-light-button1 w-[200px] h-[60px] rounded-full flex items-center gap-[8px] justify-center desktop:cursor-pointer desktop:hover:brightness-[1.5]"
          onClick={() => {
            setNewItem({ date: "", cost: 0, description: "", category: "none", subcategory: "none", tags: "none" }); // reset item to default
            setPage("cost");
          }}
        >
          <FaPlus className="text-[20px] text-light-button1" />
          <p className="text-lg font-semibold text-light-button1">Item</p>
        </div>
      </div>
    </>
  );
}
