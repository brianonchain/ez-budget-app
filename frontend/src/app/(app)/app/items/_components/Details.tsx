import Header from "./Header";
import { useState } from "react";
import { Item } from "@/db/UserModel";
import { useItemsMutation } from "@/utils/hooks";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

export default function Details({ setPage, setErrorModal, data, newItem, setNewItem }: { setPage: any; setErrorModal: any; data: any; newItem: Item; setNewItem: any }) {
  const { mutateAsync: mutateItemsAsync, isPending } = useItemsMutation();
  const [showCalendar, setShowCalendar] = useState(false);
  const defaultClassNames = getDefaultClassNames();
  return (
    <>
      <Header text="Item Info" setPage={setPage} page="list" />

      {/*--- date, name, cost ---*/}
      <div className="w-[94%] max-w-[400px] flex flex-col gap-[6px]">
        <div className="w-full grid grid-cols-[auto_1fr] gap-y-[6px] gap-x-[12px] items-center">
          <div className="font-semibold">Date</div>
          <div className="inputCondensed w-full flex items-center relative z-[100]" onClick={() => setShowCalendar(true)}>
            {new Date(newItem.date).toLocaleString("en-US")}
            {showCalendar && (
              <div className="absolute right-0 top-[calc(100%+8px)] px-[8px] py-[8px] desktop:py-[4px] rounded-lg bg-lightBg1 dark:bg-slate-900 border-[1.5px] border-slate-300 dark:border-slate-800">
                <DayPicker
                  className="textSmApp"
                  classNames={{
                    month_caption: `${defaultClassNames.month_caption} text-lg desktop:!text-base font-bold`,
                    nav: `${defaultClassNames.nav} gap-[4px]`,
                    button_previous: `${defaultClassNames.button_previous} w-[40px] h-[40px] desktop:w-[30px] desktop:h-[30px] border-[1.5px] border-slate-200 dark:border-slate-800 bg-none hover:bg-slate-200 dark:hover:bg-slate-700 slate-300 transition-all duration-300`,
                    button_next: `${defaultClassNames.button_next} w-[40px] h-[40px] desktop:w-[30px] desktop:h-[30px] border-[1.5px] border-slate-200 dark:border-slate-800 bg-none hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300`,
                    chevron: `${defaultClassNames.chevron} w-[16px] h-[16px] fill-lightText1 dark:fill-darkText1`,
                    weekday: "",
                    day: `${defaultClassNames.day} w-[44px] h-[44px] desktop:w-[30px] desktop:h-[30px] [&:not(.rdp-selected):hover]:bg-slate-200 dark:[&:not(.rdp-selected):hover]:bg-slate-700`,
                    day_button: `${defaultClassNames.day_button} w-[44px] h-[44px] desktop:w-[30px] desktop:h-[30px] cursor-pointer`,
                    selected: `${defaultClassNames.selected} bg-lightButton1Bg dark:bg-darkButton1Bg text-lightButton1Text dark:text-darkButton1Text`,
                    today: `${defaultClassNames.today} [&:not(.rdp-selected)]:bg-slate-200 dark:[&:not(.rdp-selected)]:bg-slate-700`,
                  }}
                  mode="single"
                  endMonth={new Date()}
                  selected={newItem?.date}
                  onSelect={(selected) => setNewItem({ ...newItem, date: selected })}
                />
              </div>
            )}
          </div>
          {showCalendar && <div className="fixed w-screen bg-black/80 h-screen left-0 top-0 z-[99]" onClick={() => setShowCalendar(false)}></div>}
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
          <div className="labelOptionContainer thinScrollbar">
            {Object.keys(data.settings.category).map((i) => (
              <div
                key={i}
                className={`labelOption ${newItem.category === i ? "!bg-lightButton1Bg dark:!bg-darkButton1Bg text-lightButton1Text dark:text-darkButton1Text" : ""} `}
                onClick={() => setNewItem({ ...newItem, category: i })}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
        {/*--- Subcategory ---*/}
        <div className="overflow-hidden flex flex-col">
          <p className="text-center font-semibold">Subcategory</p>
          <div className="labelOptionContainer thinScrollbar">
            {data.settings.category[newItem.category].map((i: string) => (
              <div
                key={i}
                className={`labelOption ${newItem.subcategory === i ? "!bg-lightButton1Bg dark:!bg-darkButton1Bg text-lightButton1Text dark:text-darkButton1Text" : ""} `}
                onClick={() => setNewItem({ ...newItem, subcategory: i })}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
        {/*--- Tags ---*/}
        <div className="overflow-hidden flex flex-col">
          <p className="text-center font-semibold">Tags</p>
          <div className="labelOptionContainer thinScrollbar">
            {data.settings.tags.map((i: string) => (
              <div
                key={i}
                className={`labelOption ${newItem.tags === i ? "!bg-lightButton1Bg dark:!bg-darkButton1Bg text-lightButton1Text dark:text-darkButton1Text" : ""} `}
                onClick={() => setNewItem({ ...newItem, tags: i })}
              >
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
