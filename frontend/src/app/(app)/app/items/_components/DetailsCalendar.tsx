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
      <button className="z-10 fixed w-screen bg-black/30 h-screen left-0 top-0" onClick={() => setShowCalendar(false)} />
      <div className="z-20 absolute right-0 top-[calc(100%+0.25rem)] px-2 py-2 desktop:py-1 rounded-lg bg-inputPrimaryBg border border-inputPrimaryBorderFocus">
        <DayPicker
          className="myCalendar"
          classNames={{
            // month and nav buttons
            month_caption: `${defaultClassNames.month_caption}`,
            caption_label: `${defaultClassNames.caption_label} textXl font-semibold`,
            nav: `${defaultClassNames.nav}`,
            button_previous: `${defaultClassNames.button_previous}`,
            button_next: `${defaultClassNames.button_next}`,
            chevron: `${defaultClassNames.chevron} w-7 h-7 desktop:w-5 desktop:h-5 !fill-textPrimary desktop:hover:!fill-textSecondary`,
            // day of week label
            weekday: `${defaultClassNames.weekday} !textBase !font-medium`,
            // days
            day: `${defaultClassNames.day}`,
            day_button: `${defaultClassNames.day_button} !font-medium [&:not(.rdp-selected):hover]:!bg-surface2Solid [transition:background-color_0.3s_ease] select-none`,
            // selected
            selected: `${defaultClassNames.selected} !font-medium !textBase bg-buttonPrimaryBg text-buttonPrimaryText rounded-lg`,
            // today: `${defaultClassNames.today} [&:not(.rdp-selected)]:bg-transparent dark:[&:not(.rdp-selected)]:bg-transparent`,
          }}
          navLayout="around"
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
