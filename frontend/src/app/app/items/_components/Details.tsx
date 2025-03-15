import Header from "./Header";
import { Item } from "@/db/UserModel";
import { useItemsMutation } from "@/utils/hooks";

export default function Details({
  page,
  setPage,
  setErrorModal,
  data,
  newItem,
  setNewItem,
}: {
  page: string;
  setPage: any;
  setErrorModal: any;
  data: any;
  newItem: Item;
  setNewItem: any;
}) {
  const { mutateAsync: mutateItemsAsync, isPending } = useItemsMutation();

  return (
    <>
      {/*--- title ---*/}
      <div className="pageHeader">
        Item Info
        {/*--- close ---*/}
        <div className="pageXButton" onClick={() => setPage("list")}>
          &#10005;
        </div>
      </div>

      {/*--- item & cost ---*/}
      <div className="w-[94%] max-w-[400px] flex flex-col">
        <div className="w-full grid grid-cols-[auto_1fr] gap-y-[6px] gap-x-[12px] items-center">
          <div className="font-semibold">Date</div>
          <input className="inputCondensed w-full flex items-center" value={new Date(newItem.date).toLocaleString("en-US")} disabled={true} />
          <div className="font-semibold">Item</div>
          <input className="inputCondensed w-full" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.currentTarget.value })} />
          <div className="font-semibold">Cost</div>
          <input className="inputCondensed !w-[100px]" value={newItem.cost} onChange={(e) => setNewItem({ ...newItem, cost: e.currentTarget.value })} />
        </div>
      </div>

      {/*--- label options ---*/}
      <div className="grow min-h-[300px] mt-[24px] w-[94%] max-w-[400px] grid grid-cols-3 gap-[6px]">
        {/*--- Category ---*/}
        <div className="overflow-hidden flex flex-col">
          <p className="text-center font-semibold">Category</p>
          <div className="mt-[4px] grid grid-cols-1 rounded-[6px] border-[1.5px] bg-white divide-y-[1.5px] divide-slate-300 border-slate-300 overflow-y-auto thinScrollbar">
            {Object.keys(data.settings.category).map((i) => (
              <div key={i} className={`${newItem.category === i ? "!bg-light-button1 text-white" : ""} labelChip`} onClick={() => setNewItem({ ...newItem, category: i })}>
                {i}
              </div>
            ))}
          </div>
        </div>
        {/*--- Subcategory ---*/}
        <div className="overflow-hidden flex flex-col">
          <p className="text-center font-semibold">Subcategory</p>
          <div className="mt-[4px] grid grid-cols-1 rounded-[6px] border-[1.5px] bg-white divide-y-[1.5px] divide-slate-300 border-slate-300 overflow-y-auto">
            {data.settings.category[newItem.category].map((i: string) => (
              <div key={i} className={`${newItem.subcategory === i ? "!bg-light-button1 text-white" : ""} labelChip`} onClick={() => setNewItem({ ...newItem, subcategory: i })}>
                {i}
              </div>
            ))}
          </div>
        </div>
        {/*--- Tags ---*/}
        <div className="overflow-hidden flex flex-col">
          <p className="text-center font-semibold">Tags</p>
          <div className="mt-[4px] grid grid-cols-1 rounded-[6px] border-[1.5px] bg-white divide-y-[1.5px] divide-slate-300 border-slate-300 overflow-y-auto">
            {data.settings.tags.map((i: string) => (
              <div key={i} className={`${newItem.tags === i ? "!bg-light-button1 text-white" : ""} labelChip`} onClick={() => setNewItem({ ...newItem, tags: i })}>
                {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/*--- button ---*/}
      <div className="w-[94%] max-w-[400px] pt-[24px] pb-[24px] desktop:pt-[30px] desktop:pb-[50px]">
        <button
          className="w-full button1 text-xl desktop:text-lg"
          onClick={async () => {
            console.log(newItem);
            await mutateItemsAsync(newItem);
            setPage("list");
          }}
          disabled={isPending}
        >
          {isPending ? "Adding..." : "Save"}
        </button>
      </div>
    </>
  );
}
