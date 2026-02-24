import { FaPlus } from "react-icons/fa6";

export default function AddItemButton({ onClick }: { onClick?: () => void }) {
  return (
    <div className="z-10 flex-none w-full listButtonContainerHeight flex items-center justify-center">
      <button
        className="button1Color w-[200px] h-[60px] rounded-full flex items-center gap-[8px] justify-center desktop:cursor-pointer"
        onClick={onClick}
      >
        <FaPlus className="text-[20px]" />
        <p className="text-lg font-semibold">Item</p>
      </button>
    </div>
  );
}
