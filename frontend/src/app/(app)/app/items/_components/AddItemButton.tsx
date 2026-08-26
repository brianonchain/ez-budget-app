import { FaPlus } from "react-icons/fa6";

export default function AddItemButton({ ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="absolute z-[3] left-1/2 -translate-x-1/2 bottom-4  w-50 h-15 desktop:w-32 desktop:h-12 flex items-center gap-2 justify-center rounded-full buttonPrimaryColorGlass touch-none"
      aria-label="Add item"
      {...props}
    >
      <FaPlus className="size-[1.25rem] desktop:size-[1rem]" aria-hidden="true" />
      <p className="textLg font-medium">Item</p>
    </button>
  );
}
