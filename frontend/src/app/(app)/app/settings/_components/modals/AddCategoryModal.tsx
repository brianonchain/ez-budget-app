import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa6";
import Modal from "@/utils/components/Modal";
import EditButtons from "./EditButtons";
import { useSettingsMutation } from "@/utils/hooks";
import { UserData } from "@/utils/types";

export type SubcategoryWithId = { value: string; isNew: boolean };
export type AddCategoryModalStatus = "initial" | "adding" | "editing" | "deleting" | `deletingSubcategory${number}`;

export default function AddCategoryModal({
  setAddCategoryModal,
  data,
  clickedCategory,
  setClickedCategory,
}: {
  setAddCategoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  data: UserData | null | undefined;
  clickedCategory: string | null;
  setClickedCategory: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const isEdit = !!clickedCategory;

  // Form state
  const [category, setCategory] = useState(clickedCategory ?? "");
  const [subcategoriesWithId, setSubcategoriesWithId] = useState<SubcategoryWithId[]>(() => {
    if (isEdit) {
      const subs = data?.settings.categoryObjects.find((i) => i.category === clickedCategory)?.subcategories ?? [];
      return subs.filter((i) => i && i !== "none").map((i) => ({ value: i, isNew: false }));
    } else {
      return [
        { value: "", isNew: true },
        { value: "", isNew: true },
      ];
    }
  });
  const [validationError, setValidationError] = useState("");
  const [status, setStatus] = useState<AddCategoryModalStatus>("initial"); // need status because we have 2 buttons; tanstack query isPending not enough

  const { mutateAsync: settingsMutateAsync, error, isError, isPending } = useSettingsMutation();

  // sync UI states with server state
  useEffect(() => {
    if (!isEdit || !data || status !== "initial" || isPending) return;
    // sync category
    const obj = data.settings.categoryObjects.find((c) => c.category === clickedCategory);
    if (!obj) return;
    setCategory(obj.category);
    // sync subcategories
    setSubcategoriesWithId(obj.subcategories.filter((s) => s && s !== "none").map((s) => ({ value: s, isNew: false })));
  }, [data?.settings.categoryObjects, clickedCategory]);

  // add category (not optimistic)
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data || status !== "initial" || isPending || isEdit) return;
    const _category = category.trim();
    if (!_category) {
      setValidationError("Please enter a category");
      return;
    }
    if (data.settings.categoryObjects.some((i) => i.category.toLowerCase() === _category.toLowerCase())) {
      setValidationError("Category already exists.");
      return;
    }
    if (_category.toLowerCase() === "none" || subcategoriesWithId.some((i) => i.value.trim().toLowerCase() === "none")) {
      setValidationError(`Cannot use "none" as a category or subcategory.`);
      return;
    }
    const normalizedSubs = subcategoriesWithId.map((i) => i.value.trim().toLowerCase()).filter((i) => i !== "");
    if (new Set(normalizedSubs).size !== normalizedSubs.length) {
      setValidationError("Subcategories cannot contain duplicates.");
      return;
    }

    setValidationError("");
    setStatus("adding");

    // dedupe subcategories and remove "none"
    const cleaned = Array.from(
      new Set(
        subcategoriesWithId
          .map((i) => i.value.trim())
          .filter((i) => i !== "")
          .filter((i) => i.toLowerCase() !== "none")
      )
    );
    const _subcategories = ["none", ...cleaned];

    try {
      await settingsMutateAsync({ type: "addCategoryObject", categoryObject: { category: _category, subcategories: _subcategories } });
      setAddCategoryModal(false);
    } catch {
      setStatus("initial");
    }
  }

  // partly optimistic (value is immediately updated and reverts if error; but data.settings is not updated immediately)
  async function renameCategory() {
    if (!data || status !== "initial" || isPending || !isEdit) return;
    const from = clickedCategory;
    const to = category.trim();
    if (!to) {
      setCategory(from);
      if (validationError) setValidationError("");
      return;
    }
    if (to.toLowerCase() === "none") {
      setValidationError(`Cannot use "none" as a category.`);
      return;
    }
    if (from === to) return;
    if (
      from.toLowerCase() !== to.toLowerCase() &&
      data.settings.categoryObjects.some((i) => i.category.toLowerCase() === to.toLowerCase())
    ) {
      setValidationError("Category already exists."); // allows food => Food
      return;
    }

    setValidationError("");
    setStatus("editing");

    try {
      await settingsMutateAsync({ type: "renameCategory", from, to });
      setClickedCategory(to); // update clickedCategory
    } catch {} // error will show on UI
    setStatus("initial");
  }

  // not optimistic
  async function deleteCategoryObject() {
    if (!data || status !== "initial" || isPending || !isEdit) return;
    setValidationError(""); // is-being-used validation done on backend
    setStatus("deleting");

    try {
      await settingsMutateAsync({ type: "deleteCategoryObject", category: clickedCategory });
      setAddCategoryModal(false);
    } catch {
      setStatus("initial"); // error will show on UI
    }
  }

  async function addSubcategory(index: number) {
    if (!data || !isEdit || status !== "initial" || isPending || !subcategoriesWithId[index].isNew) return;
    const subcategory = subcategoriesWithId[index].value.trim();
    if (!subcategory) return;
    if (subcategory.toLowerCase() === "none") {
      setValidationError(`Cannot use "none" as a subcategory.`);
      return;
    }
    if (subcategoriesWithId.some((j, index2) => index !== index2 && j.value.toLowerCase() === subcategory.toLowerCase())) {
      setValidationError("Subcategory already exists.");
      return;
    }

    setValidationError("");
    setStatus("adding");

    try {
      await settingsMutateAsync({ type: "addSubcategory", category: clickedCategory, subcategory });
      setSubcategoriesWithId((prev) => prev.map((r, i) => (i === index ? { ...r, isNew: false, value: subcategory } : r))); // optimistic update
    } catch {} // error will show on UI
    setStatus("initial");
  }

  async function renameSubcategory(index: number) {
    if (!data || !isEdit || status !== "initial" || isPending) return;
    const from = data.settings.categoryObjects.find((i) => i.category === clickedCategory)?.subcategories[index + 1];
    const to = subcategoriesWithId[index].value.trim();
    if (!from) {
      setValidationError("Unknown error.");
      return;
    }
    if (!to) {
      setSubcategoriesWithId((prev) => prev.map((j, index2) => (index2 === index ? { ...j, value: from } : j)));
      if (validationError) setValidationError("");
      return;
    }
    if (to.toLowerCase() === "none") {
      setSubcategoriesWithId((prev) => prev.map((j, index2) => (index2 === index ? { ...j, value: from } : j)));
      setValidationError(`Cannot use "none" as a subcategory.`);
      return;
    }
    if (from === to) return;
    if (
      from.toLowerCase() !== to.toLowerCase() &&
      subcategoriesWithId.some((j, index2) => index2 !== index && j.value.trim().toLowerCase() === to.toLowerCase())
    ) {
      setValidationError("Subcategories contain duplicates.");
      return;
    } // allows groceries => Groceries

    setValidationError("");
    setStatus("editing");

    try {
      await settingsMutateAsync({ type: "renameSubcategory", category: clickedCategory, from, to });
    } catch {} // error will show on UI
    setStatus("initial");
  }

  async function addSubcategoryField() {
    if (status !== "initial" || isPending) return;
    setSubcategoriesWithId((prev) => {
      if (prev.some((r) => r.isNew && r.value.trim() === "")) {
        setValidationError("Please first add a subcategory above.");
        return prev;
      } else {
        setValidationError("");
        return [...prev, { value: "", isNew: true }];
      }
    });
  }

  return (
    <Modal
      title={isEdit ? "Edit Category" : "Add A Category With Subcategories"}
      setIsOpen={setAddCategoryModal}
      disableCloseButton={isPending}
    >
      <form className="mx-auto pt-[16px] w-full max-w-[400px] min-h-full flex flex-col" onSubmit={onSubmit}>
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
            onBlur={isEdit ? renameCategory : undefined}
          />
        </div>

        {/*--- subcategory ---*/}
        <label className="block mt-6 pb-1.5 inputLabel w-full">Subcategories{isEdit ? "" : " (e.g., restaurants, groceries)"}</label>
        <div className="space-y-2">
          {subcategoriesWithId.map((i, index) => (
            <div key={index} className="w-full flex items-center">
              <input
                className="input w-full"
                value={i.value}
                onChange={(e) => {
                  setSubcategoriesWithId((prev) => prev.map((j, index2) => (index2 === index ? { ...j, value: e.target.value } : j))); // or use id
                  if (validationError) setValidationError("");
                }}
                onBlur={isEdit ? (i.isNew ? () => addSubcategory(index) : () => renameSubcategory(index)) : undefined}
                disabled={status !== "initial" || isPending}
              />
              {isEdit && (
                <EditButtons
                  setSubcategoriesWithId={setSubcategoriesWithId}
                  validationError={validationError}
                  setValidationError={setValidationError}
                  status={status}
                  setStatus={setStatus}
                  subcategoriesWithId={subcategoriesWithId}
                  rowIndex={index}
                  clickedCategory={clickedCategory}
                />
              )}
            </div>
          ))}
        </div>

        {/*--- add subcategory field ---*/}
        <button
          className="mt-4 link flex items-center justify-center gap-1 font-medium"
          type="button"
          onClick={addSubcategoryField}
          disabled={isPending || status !== "initial"}
        >
          <FaPlus />
          Add Subcategory Field
        </button>

        {/*--- validation error ---*/}
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="errorText min-h-[100px] flex items-center justify-center">
            {validationError ? validationError : isError ? error?.message : ""}
          </div>
        </div>

        {/*--- button ---*/}
        {isEdit ? (
          <button className="buttonRed w-full" type="button" onClick={deleteCategoryObject} disabled={isPending || status !== "initial"}>
            {status === "deleting" ? "Deleting..." : "Delete Category"}
          </button>
        ) : (
          <button className="button1 w-full" type="submit" disabled={isPending || status !== "initial"}>
            {isPending ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save" : "Add"}
          </button>
        )}
      </form>
    </Modal>
  );
}
