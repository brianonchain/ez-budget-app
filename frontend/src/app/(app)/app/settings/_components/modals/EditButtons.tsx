import { useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaX, FaCircleNotch } from "react-icons/fa6";
import { useSettingsMutation } from "@/utils/hooks";
import { SubcategoryWithId, AddCategoryModalStatus } from "./AddCategoryModal";

export default function EditButtons({
  setSubcategoriesWithId,
  validationError,
  setValidationError,
  subcategoriesWithId,
  status,
  setStatus,
  rowIndex,
  clickedCategory,
}: {
  setSubcategoriesWithId: React.Dispatch<React.SetStateAction<SubcategoryWithId[]>>;
  validationError: string;
  setValidationError: React.Dispatch<React.SetStateAction<string>>;
  subcategoriesWithId: SubcategoryWithId[];
  status: AddCategoryModalStatus;
  setStatus: React.Dispatch<React.SetStateAction<AddCategoryModalStatus>>;
  rowIndex: number;
  clickedCategory: string;
}) {
  const { mutateAsync: settingsMutateAsync, error, isError, isPending } = useSettingsMutation();

  useEffect(() => {
    if (error) {
      setValidationError(error.message);
    }
  }, [error]);

  function moveRow(from: number, to: number) {
    setSubcategoriesWithId((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    if (validationError) setValidationError("");
  }

  async function moveUp() {
    moveRow(rowIndex, rowIndex - 1);
    setStatus("editing");
    try {
      await settingsMutateAsync({
        type: "reorderSubcategory",
        category: clickedCategory,
        fromIndex: rowIndex,
        toIndex: rowIndex - 1,
      });
    } catch {}

    setStatus("initial");
  }
  async function moveDown() {
    if (status !== "initial" || isPending || rowIndex === subcategoriesWithId.length - 1) return;
    setValidationError("");

    moveRow(rowIndex, rowIndex + 1);
    setStatus("editing");

    try {
      await settingsMutateAsync({
        type: "reorderSubcategory",
        category: clickedCategory,
        fromIndex: rowIndex,
        toIndex: rowIndex + 1,
      });
    } catch {}

    setStatus("initial");
  }

  // not optimistic
  async function deleteSubcategory(index: number) {
    if (status !== "initial" || isPending) return;
    const subcategory = subcategoriesWithId[index].value.trim();
    // delete empty category without mutation (for new fields)
    if (!subcategory) {
      setSubcategoriesWithId((prev) => prev.filter((_, index2) => index2 !== index));
      return;
    }
    // is-being-used validation done on backend
    setValidationError("");
    setStatus(`deletingSubcategory${index}`);
    try {
      await settingsMutateAsync({ type: "deleteSubcategory", category: clickedCategory, subcategory });
    } catch {
      // error will show on UI
    }
    setStatus("initial");
  }

  return (
    <>
      <button
        className="ml-[4px] flex-none w-[36px] h-[36px] text-[20px] desktop:w-[32px] desktop:h-[32px] desktop:text-[18px] flex justify-center items-center hover:bg-blue-400/10 desktop:cursor-pointer rounded-md text-slate-400"
        type="button"
        onClick={moveUp}
        disabled={rowIndex === 0 || isPending || status !== "initial"}
        aria-label="Move up"
      >
        <FaArrowUp />
      </button>
      <button
        className="ml-[4px] flex-none w-[36px] h-[36px] text-[20px] desktop:w-[32px] desktop:h-[32px] desktop:text-[18px] flex justify-center items-center hover:bg-blue-400/10 desktop:cursor-pointer rounded-md text-slate-400"
        type="button"
        onClick={moveDown}
        disabled={rowIndex === subcategoriesWithId.length - 1 || isPending || status !== "initial"}
        aria-label="Move down"
      >
        <FaArrowDown />
      </button>
      <button
        className="ml-[12px] flex-none w-[36px] h-[36px] text-[20px] desktop:w-[32px] desktop:h-[32px] desktop:text-[18px] flex justify-center items-center hover:bg-blue-400/10 desktop:cursor-pointer rounded-md errorText"
        type="button"
        onClick={() => deleteSubcategory(rowIndex)}
        disabled={isPending || status !== "initial"}
        aria-label="Delete subcategory"
      >
        {status === `deletingSubcategory${rowIndex}` ? <FaCircleNotch className="animate-spin" /> : <FaX />}
      </button>
    </>
  );
}
