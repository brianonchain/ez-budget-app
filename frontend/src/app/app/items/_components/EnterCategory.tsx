import Header from "./Header";
import { useState } from "react";
import { Item } from "@/db/UserModel";
import { useItemsMutation } from "@/utils/hooks";

export default function EnterCat({
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

  const [labelType, setLabelType] = useState<keyof Item>("category");
  const [labelOptions, setLabelOptions] = useState(Object.keys(data.settings.category));

  return (
    <>
      <Header title="Choose Labels" page={page} setPage={setPage} />

      <div className="hidden pb-[16px] w-[400px] desktop:hidden flex-col items-center">
        <div className="flex-none h-[80px] flex items-center justify-center text-2xl desktop:text-2xl font-bold text-light-button1">Enter New Item</div>

        <div className="w-full grid grid-cols-[auto_1fr] gap-[12px] items-center">
          <div>Cost</div>
          <input className="input !w-[120px]" />
          <div>Item Name</div>
          <input className="input" />
        </div>
      </div>

      {/*--- label type ---*/}
      <div className="w-[350px] grid grid-cols-3 gap-[4px]">
        {(["category", "subcategory", "tags"] as const).map((i: keyof Item, index) => (
          <div
            key={index}
            className={`${
              labelType === i ? "bg-light-button1 text-white" : ""
            } p-[8px] desktop:p-[4px] h-[64px] desktop:h-[52px] flex flex-col justify-between border-2 border-light-button1 rounded-[8px] relative desktop:cursor-pointer desktop:hover:brightness-[1.2]`}
            onClick={() => {
              setLabelType(i);
              if (i === "category") {
                setLabelOptions(Object.keys(data.settings.category));
              } else if (i === "subcategory") {
                setLabelOptions(data.settings.category[newItem.category]);
              } else if (i === "tags") {
                setLabelOptions(data.settings.tags);
              }
            }}
          >
            <p className="text-base desktop:text-sm font-medium text-center">{i.charAt(0).toUpperCase() + i.slice(1)}</p>
            <p className="text-sm text-center tracking-tighter truncate">{newItem[i]}</p>
            <div className={`${labelType === i ? "" : "invisible"} absolute top-[calc(100%+12px)] left-[36px] w-[40px] h-[40px] rotate-45 bg-slate-200`}></div>
          </div>
        ))}
      </div>

      {/*--- label choices ---*/}
      <div className="grow mt-[20px] py-[20px] w-[350px] flex justify-center overflow-hidden bg-slate-200 rounded-[12px] relative">
        <div className="w-full px-[20px] h-full flex flex-col gap-[4px] overflow-y-auto">
          {labelOptions.map((i, index) => (
            <div
              key={index}
              className={`${
                newItem[labelType] === i ? "border-light-button1" : "border-slate-300"
              } flex-none px-[12px] w-full h-[56px] desktop:h-[40px] flex items-center justify-between text-lg desktop:text-sm font-medium border-2 rounded-[8px] desktop:cursor-pointer bg-white desktop:hover:bg-slate-100`}
              onClick={() => {
                if (labelType === "category") {
                  setLabelType("subcategory");
                  setLabelOptions(data.settings.category[i]);
                  setNewItem({ ...newItem, category: i, subcategory: "none" });
                } else if (labelType === "subcategory") {
                  setLabelType("tags");
                  setLabelOptions(data.settings.tags);
                  setNewItem({ ...newItem, [labelType]: i });
                } else if (labelType === "tags") {
                  setNewItem({ ...newItem, [labelType]: i });
                }
              }}
            >
              <p>{i.charAt(0).toUpperCase() + i.slice(1)}</p>
            </div>
          ))}
        </div>
      </div>

      {/*--- button ---*/}
      <div className="w-[350px] pt-[20px] pb-[20px] desktop:pt-[40px] desktop:pb-[90px]">
        <button
          className="w-full button1 text-xl desktop:text-lg"
          onClick={async () => {
            const date = new Date();
            const newItemTemp = { ...newItem, date };
            await mutateItemsAsync(newItemTemp);
            setPage("list");
          }}
          disabled={isPending}
        >
          {isPending ? "Adding..." : "Done"}
        </button>
      </div>
    </>
  );
}
