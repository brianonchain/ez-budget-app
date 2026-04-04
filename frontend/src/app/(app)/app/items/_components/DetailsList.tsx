import { CategoryObject } from "@/db/WorkspaceModel";

type DetailsListProps<T extends string | CategoryObject> = {
  label: string;
  items: T[];
  selectedItem: string;
  onClick: (item: T) => void;
};

export default function DetailsList<T extends string | CategoryObject>({ label, items, selectedItem, onClick }: DetailsListProps<T>) {
  return (
    <div className="flex-1 flex flex-col">
      <p className="detailsLabel pb-1.5 desktop:pb-1 text-center">{label}</p>

      <div className="grid grid-cols-1 rounded-lg border bg-inputPrimaryBg border-inputPrimaryBorder divide-y-1 divide-borderFaint overflow-y-auto thinScrollbar">
        {items.map((i) => {
          const item = typeof i === "string" ? i : i.category;
          const isSelected = selectedItem === item;

          return (
            <button
              className={`outlineInside flex-none w-full px-2 h-10 desktop:h-7 flex items-center truncate select-none ${
                isSelected ? "bg-buttonPrimaryBg text-buttonPrimaryText" : "desktop:hover:bg-buttonOutlineBgHover"
              }`}
              onClick={() => onClick(i)} // 👈 pass item up
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
