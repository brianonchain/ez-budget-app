import { FaArrowUp, FaArrowDown, FaX } from "react-icons/fa6";

type Subcategory = { id: string; value: string };

export default function EditButtons({
  setSubcategories,
  validationError,
  setValidationError,
  index,
  subcategories,
  isPending,
  status,
  setStatus,
  rowId,
}: {
  setSubcategories: React.Dispatch<React.SetStateAction<Subcategory[]>>;
  validationError: string;
  setValidationError: React.Dispatch<React.SetStateAction<string>>;
  index: number;
  subcategories: Subcategory[];
  isPending: boolean;
  status: "initial" | "adding" | "editing" | "deleting";
  setStatus: React.Dispatch<React.SetStateAction<"initial" | "adding" | "editing" | "deleting">>;
  rowId: string;
}) {
  function moveRow(from: number, to: number) {
    setSubcategories((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    if (validationError) setValidationError("");
  }

  function moveUp() {
    moveRow(index, index - 1);
  }
  function moveDown() {
    moveRow(index, index + 1);
  }
  function deleteSubcategory() {
    setSubcategories((prev) => prev.filter((r) => r.id !== rowId));
    if (validationError) setValidationError("");
  }

  return (
    <>
      <button
        className="ml-[4px] flex-none w-[36px] h-[36px] text-[20px] desktop:w-[32px] desktop:h-[32px] desktop:text-[18px] flex justify-center items-center hover:bg-blue-400/10 desktop:cursor-pointer rounded-md text-slate-400"
        type="button"
        onClick={moveUp}
        disabled={index === 0 || isPending || status !== "initial"}
        aria-label="Move up"
      >
        <FaArrowUp />
      </button>
      <button
        className="ml-[4px] flex-none w-[36px] h-[36px] text-[20px] desktop:w-[32px] desktop:h-[32px] desktop:text-[18px] flex justify-center items-center hover:bg-blue-400/10 desktop:cursor-pointer rounded-md text-slate-400"
        type="button"
        onClick={moveDown}
        disabled={index === subcategories.length - 1 || isPending || status !== "initial"}
        aria-label="Move down"
      >
        <FaArrowDown />
      </button>
      <button
        className="ml-[12px] flex-none w-[36px] h-[36px] text-[20px] desktop:w-[32px] desktop:h-[32px] desktop:text-[18px] flex justify-center items-center hover:bg-blue-400/10 desktop:cursor-pointer rounded-md errorText"
        type="button"
        onClick={deleteSubcategory}
        disabled={isPending || status !== "initial"}
        aria-label="Delete subcategory"
      >
        <FaX />
      </button>
    </>
  );
}
