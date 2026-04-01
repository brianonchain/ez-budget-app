import { FaPlus } from "react-icons/fa6";

export default function AddItemButton({ ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="buttonPrimaryColor w-50 h-15 rounded-full flex items-center gap-2 justify-center" aria-label="Add item" {...props}>
      <FaPlus className="text-[20px]" aria-hidden="true" />
      <p className="text-lg font-semibold">Item</p>
    </button>
  );
}
