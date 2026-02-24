import { useState, useRef, useMemo, useEffect } from "react";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { useSettingsMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
import { UserData } from "@/utils/types";
import { CategoryObject } from "@/db/UserModel";

type Subcategory = { id: string; value: string };

export default function AddCategoryModal({
  setAddCategoryModal,
  data,
  clickedCategoryObject,
}: {
  setAddCategoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  data: UserData | null | undefined;
  clickedCategoryObject: CategoryObject | null;
}) {
  const isEdit = !!clickedCategoryObject;
  const initialSubcategories = useMemo(() => {
    const subs = clickedCategoryObject?.subcategories ?? [];
    return subs.filter((i) => i && i !== "none");
  }, [clickedCategoryObject]);

  // Form state
  const [category, setCategory] = useState(clickedCategoryObject?.category ?? "");
  const [subcategories, setSubcategories] = useState<Subcategory[]>(() => {
    const initial = initialSubcategories.length ? initialSubcategories : ["", ""];
    return initial.map((i) => addId(i));
  });
  const [validationError, setValidationError] = useState("");
  const [status, setStatus] = useState<"initial" | "saving" | "deleting">("initial"); // need status because we have 2 buttons; tanstack query isPending not enough

  const { mutateAsync: settingsMutateAsync, error, isError, isPending } = useSettingsMutation();

  // helper functions
  function addId(value = ""): Subcategory {
    return { id: crypto.randomUUID(), value };
  }

  function moveRow(from: number, to: number) {
    setSubcategories((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    if (validationError) setValidationError("");
  }

  // mutation functions
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const _category = category.trim();

    // validation
    if (!data) return;
    if (!_category) {
      setValidationError("Please enter a category");
      return;
    }
    // if adding a new category and it already exists
    if (!isEdit && data.settings.categoryObjects.some((i: any) => i.category.toLowerCase() === _category.toLowerCase())) {
      setValidationError("Category already exists");
      return;
    }
    // if editing a category and it has been changed to one that already exists
    if (
      isEdit &&
      _category.toLowerCase() !== clickedCategoryObject?.category.toLowerCase() &&
      data.settings.categoryObjects.some((i: any) => i.category.toLowerCase() === _category.toLowerCase())
    ) {
      setValidationError("Category already exists");
      return;
    }
    setValidationError("");
    setStatus("saving");

    // dedepe subcategories and remove "none"
    const cleaned = Array.from(
      new Set(
        subcategories
          .map((i) => i.value.trim())
          .filter((i) => i !== "")
          .filter((i) => i.toLowerCase() !== "none")
      )
    );
    const _subcategories = ["none", ...cleaned];

    const newCategoryObjects = isEdit
      ? data.settings.categoryObjects.map((categoryObject) =>
          categoryObject.category === clickedCategoryObject!.category
            ? { category: _category, subcategories: _subcategories }
            : categoryObject
        )
      : [...data.settings.categoryObjects, { category: _category, subcategories: _subcategories }];
    try {
      await settingsMutateAsync({ changes: { "settings.categoryObjects": newCategoryObjects } });
      setAddCategoryModal(false);
    } catch {
      setStatus("initial");
    }
  }

  async function onDelete() {
    if (!data || !clickedCategoryObject) return;
    if (status !== "initial" || isPending) return;

    const original = clickedCategoryObject.category;

    // Optional safety: if user typed something different, force them to save first
    if (category.trim() !== original) {
      setValidationError("Category has been changed. Please save changes before deleting.");
      return;
    }

    // Frontend guard: block if any item uses it
    const used = data.items.some((item) => item.category === original);
    if (used) {
      setValidationError("This category is being used in at least one item. Remove it from all items before deleting.");
      return;
    }

    setValidationError("");
    setStatus("deleting");

    try {
      await settingsMutateAsync({
        ops: [{ type: "deleteCategory", category: original }],
      });
      setAddCategoryModal(false);
    } catch {
      setStatus("initial");
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit Category" : "Add A Category With Subcategories"}
      setIsOpen={setAddCategoryModal}
      disableCloseButton={isPending}
    >
      <div className="mx-auto w-full max-w-[400px] flex flex-col items-center">
        <form className="w-full" onSubmit={onSubmit}>
          {/*--- category ---*/}
          <label className="block pb-1.5 w-full inputLabel">Category{isEdit ? "" : " (e.g., Food)"}</label>
          <div className="w-full flex gap-4">
            <input
              className="input"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (validationError) setValidationError("");
              }}
            />
          </div>
          {/*--- subcategory ---*/}
          <label className="block mt-6 pb-1.5 inputLabel w-full">Subcategories{isEdit ? "" : " (e.g., restaurants, groceries)"}</label>
          <div className="space-y-2">
            {subcategories.map((row, index) => (
              <div key={row.id} className="w-full flex gap-4">
                <input
                  className="input w-full"
                  value={row.value}
                  onChange={(e) => {
                    setSubcategories((prev) => {
                      const next = [...prev];
                      next[index] = { ...next[index], value: e.target.value };
                      return next;
                    });
                    if (validationError) setValidationError("");
                  }}
                />
                <button
                  className="flex-none button2 w-[2.5em]"
                  type="button"
                  onClick={() => moveRow(index, index - 1)}
                  disabled={index === 0 || isPending || status !== "initial"}
                  aria-label="Move up"
                >
                  <FaArrowUp />
                </button>
                <button
                  className="flex-none button2 w-[2.5em]"
                  type="button"
                  onClick={() => moveRow(index, index + 1)}
                  disabled={index === subcategories.length - 1 || isPending || status !== "initial"}
                  aria-label="Move down"
                >
                  <FaArrowDown />
                </button>
                <button
                  className="flex-none button2 w-[2.5em]"
                  type="button"
                  onClick={() => {
                    setSubcategories((prev) => prev.filter((r) => r.id !== row.id));
                    if (validationError) setValidationError("");
                  }}
                  disabled={isPending || status !== "initial"}
                  aria-label="Delete subcategory"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          {/*--- add subcategory field ---*/}
          <button
            className="mt-4 link flex items-center justify-center gap-1 textSmApp font-medium"
            type="button"
            onClick={() => setSubcategories((prev) => [...prev, addId("")])}
            disabled={isPending || status !== "initial"}
          >
            <FaPlus />
            Add Subcategory Field
          </button>
          {/*--- button ---*/}
          <button className="mt-[32px] button1 w-full" type="submit" disabled={isPending || status !== "initial"}>
            {isPending ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save" : "Add"}
          </button>
        </form>
        <div className="errorText mt-5 desktop:mt-3 min-h-[1.3rem]">
          {validationError ? validationError : isError ? error?.message : ""}
        </div>
        {isEdit && (
          <div className="w-full grow flex flex-col justify-end">
            <button className="mt-[80px] buttonRed w-full" type="button" onClick={onDelete} disabled={isPending || status !== "initial"}>
              {status === "deleting" ? "Deleting..." : "Delete Category"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
