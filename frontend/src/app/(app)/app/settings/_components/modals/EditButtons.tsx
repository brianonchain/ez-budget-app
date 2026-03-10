import { useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaX, FaCircleNotch } from "react-icons/fa6";
import { useSettingsMutation } from "@/utils/hooks";
import { SubcategoryWithId, AddCategoryModalStatus } from "./AddCategoryModal";
import DeleteRowButton from "@/utils/components/DeleteRowButton";

export default function EditButtons({
  setSubcategoriesWithId,
  validationError,
  setValidationError,
  subcategoriesWithId,
  status,
  setStatus,
  rowIndex,
  clickedCategory,
  workspaceId,
}: {
  setSubcategoriesWithId: React.Dispatch<React.SetStateAction<SubcategoryWithId[]>>;
  validationError: string;
  setValidationError: React.Dispatch<React.SetStateAction<string>>;
  subcategoriesWithId: SubcategoryWithId[];
  status: AddCategoryModalStatus;
  setStatus: React.Dispatch<React.SetStateAction<AddCategoryModalStatus>>;
  rowIndex: number;
  clickedCategory: string;
  workspaceId: string;
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
        workspaceId,
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
        workspaceId,
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
    setValidationError("");
    const subcategory = subcategoriesWithId[index].value.trim();
    // delete empty category without mutation (for new fields)
    if (!subcategory) {
      setSubcategoriesWithId((prev) => prev.filter((_, index2) => index2 !== index));
      return;
    }
    // is-being-used validation done on backend
    setStatus(`deletingSubcategory${index}`);
    try {
      await settingsMutateAsync({ type: "deleteSubcategory", workspaceId, category: clickedCategory, subcategory });
    } catch {
      // error will show on UI
    }
    setStatus("initial");
  }

  return (
    <>
      <button
        className="ml-1 desktop:ml-2 flex-none w-10 h-10 text-2xl desktop:w-auto desktop:h-8 desktop:text-lg flex justify-center items-center desktop:cursor-pointer linkGrayColor"
        type="button"
        onClick={moveUp}
        disabled={rowIndex === 0 || isPending || status !== "initial"}
        aria-label="Move up"
      >
        <FaArrowUp />
      </button>
      <button
        className="ml-0 desktop:ml-2 flex-none w-10 h-10 text-2xl desktop:w-auto desktop:h-8 desktop:text-lg flex justify-center items-center desktop:cursor-pointer linkGrayColor"
        type="button"
        onClick={moveDown}
        disabled={rowIndex === subcategoriesWithId.length - 1 || isPending || status !== "initial"}
        aria-label="Move down"
      >
        <FaArrowDown />
      </button>
      <DeleteRowButton
        className=""
        onClick={() => deleteSubcategory(rowIndex)}
        isLoading={status === `deletingSubcategory${rowIndex}`}
        disabled={isPending || status !== "initial"}
        aria-label="Delete subcategory"
      />
    </>
  );
}
