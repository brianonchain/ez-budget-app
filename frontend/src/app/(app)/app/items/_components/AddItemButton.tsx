import { FaPlus } from "react-icons/fa6";

export default function AddItemButton({ ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="buttonPrimaryColorGlass w-50 h-15 desktop:w-32 desktop:h-12 rounded-full flex items-center gap-2 justify-center"
      aria-label="Add item"
      {...props}
    >
      <FaPlus className="text-[1.25rem] desktop:text-[1rem]" aria-hidden="true" />
      <p className="textLg font-medium">Item</p>
    </button>
  );
}
