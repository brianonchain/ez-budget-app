import { FaPlus } from "react-icons/fa6";

export default function AddItemButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`buttonPrimaryColor w-[200px] h-[60px] rounded-full flex items-center gap-2 justify-center desktop:cursor-pointer ${
        className ?? ""
      }`}
    >
      <FaPlus className="text-[20px]" />
      <p className="text-lg font-semibold">Item</p>
    </button>
  );
}
