import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { DraftItem } from "@/utils/types";

export default function DetailsCalendar({
  setShowCalendar,
  draftItem,
  setDraftItem,
}: {
  setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  draftItem: DraftItem;
  setDraftItem: React.Dispatch<React.SetStateAction<DraftItem>>;
}) {
  const defaultClassNames = getDefaultClassNames();
  return (
    <>
      <button className="z-[0] fixed w-screen bg-black/30 h-screen left-0 top-0" onClick={() => setShowCalendar(false)} />
      <div className="z-[1] absolute right-0 top-[calc(100%+0.25rem)] px-2 py-2 desktop:py-1 rounded-lg bg-inputPrimaryBg border-[1.5px] border-inputPrimaryBorderFocus">
        <DayPicker
          className="textSmApp"
          classNames={{
            month_caption: `${defaultClassNames.month_caption} text-lg desktop:!text-base font-bold`,
            nav: `${defaultClassNames.nav} gap-[4px]`,
            button_previous: `${defaultClassNames.button_previous} w-10 h-10 desktop:w-8 desktop:h-8 bg-none hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300`,
            button_next: `${defaultClassNames.button_next} w-10 h-10 desktop:w-8 desktop:h-8 border-none bg-none hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300`,
            chevron: `${defaultClassNames.chevron} w-4 h-4 fill-textPrimary`,
            weekday: "",
            day: `${defaultClassNames.day} font-medium w-11 h-11 desktop:w-8 desktop:h-8 [&:not(.rdp-selected):hover]:bg-slate-200 dark:[&:not(.rdp-selected):hover]:bg-white/20 transition-all duration-300`,
            day_button: `${defaultClassNames.day_button} w-11 h-11 desktop:w-8 desktop:h-8 cursor-pointer`,
            selected: `${defaultClassNames.selected} bg-buttonPrimaryBg text-buttonPrimaryText`,
            today: `${defaultClassNames.today} [&:not(.rdp-selected)]:bg-transparent dark:[&:not(.rdp-selected)]:bg-transparent`,
          }}
          mode="single"
          endMonth={new Date()}
          selected={new Date(draftItem?.date)}
          onSelect={(selected) => {
            if (!selected) return;
            setDraftItem((prev) => ({ ...prev, date: selected.toISOString() }));
            setShowCalendar(false);
          }}
        />
      </div>
    </>
  );
}
