import { Item } from "@/db/UserModel";
import React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

export default function DetailsCalendar({
  setShowCalendar,
  newItem,
  setNewItem,
}: {
  setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  newItem: Item;
  setNewItem: React.Dispatch<React.SetStateAction<Item>>;
}) {
  const defaultClassNames = getDefaultClassNames();
  return (
    <>
      <button className="z-[0] fixed w-screen bg-black/30 h-screen left-0 top-0" onClick={() => setShowCalendar(false)} />
      <div className="z-[1] absolute right-0 top-[calc(100%+4px)] px-[8px] py-[8px] desktop:py-[4px] rounded-lg bg-lightBg1 dark:bg-darkInput border-[1.5px] border-lightInputBorderFocus dark:border-darkInputBorderFocus">
        <DayPicker
          className="textSmApp"
          classNames={{
            month_caption: `${defaultClassNames.month_caption} text-lg desktop:!text-base font-bold`,
            nav: `${defaultClassNames.nav} gap-[4px]`,
            button_previous: `${defaultClassNames.button_previous} w-[42px] h-[42px] desktop:w-[32px] desktop:h-[32px] bg-none hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300`,
            button_next: `${defaultClassNames.button_next} w-[42px] h-[42px] desktop:w-[32px] desktop:h-[32px] border-none bg-none hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300`,
            chevron: `${defaultClassNames.chevron} w-[16px] h-[16px] fill-lightText1 dark:fill-darkText1`,
            weekday: "",
            day: `${defaultClassNames.day} font-medium w-[45px] h-[45px] desktop:w-[34px] desktop:h-[35px] [&:not(.rdp-selected):hover]:bg-slate-200 dark:[&:not(.rdp-selected):hover]:bg-white/10`,
            day_button: `${defaultClassNames.day_button} w-[45px] h-[45px] desktop:w-[34px] desktop:h-[35px] cursor-pointer`,
            selected: `${defaultClassNames.selected} bg-lightButton1Bg dark:bg-darkButton1Bg text-lightButton1Text dark:text-darkButton1Text`,
            today: `${defaultClassNames.today} [&:not(.rdp-selected)]:bg-transparent dark:[&:not(.rdp-selected)]:bg-transparent`,
          }}
          mode="single"
          endMonth={new Date()}
          selected={newItem?.date}
          onSelect={(selected) => {
            if (!selected) return;
            setNewItem((prev) => ({ ...prev, date: selected }));
            setShowCalendar(false);
          }}
        />
      </div>
    </>
  );
}
