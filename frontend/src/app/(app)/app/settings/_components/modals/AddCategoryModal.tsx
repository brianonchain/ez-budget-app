import { useState, useRef, useMemo, useEffect } from "react";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaX } from "react-icons/fa6";
import { useSettingsMutation } from "@/utils/hooks";
import Modal from "@/utils/components/Modal";
import { UserData } from "@/utils/types";
import { CategoryObject } from "@/db/UserModel";
import EditButtons from "./EditButtons";

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
  const [status, setStatus] = useState<"initial" | "adding" | "editing" | "deleting">("initial"); // need status because we have 2 buttons; tanstack query isPending not enough

  const { mutateAsync: settingsMutateAsync, error, isError, isPending } = useSettingsMutation();

  // helper functions
  function addId(value = ""): Subcategory {
    return { id: crypto.randomUUID(), value };
  }

  // mutation functions
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const _category = category.trim();

    // validation
    if (!data || status !== "initial" || isPending || isEdit) return;
    if (!_category) {
      setValidationError("Please enter a category");
      return;
    }
    if (data.settings.categoryObjects.some((i) => i.category.toLowerCase() === _category.toLowerCase())) {
      setValidationError("Category already exists.");
      return;
    }
    if (_category.toLowerCase() === "none" || subcategories.some((i) => i.value.trim().toLowerCase() === "none")) {
      setValidationError("Cannot use 'none' as a category or subcategory.");
      return;
    }
    const normalizedSubs = subcategories.map((i) => i.value.trim().toLowerCase()).filter((i) => i !== "");
    if (new Set(normalizedSubs).size !== normalizedSubs.length) {
      setValidationError("Subcategories cannot contain duplicates.");
      return;
    }

    setValidationError("");
    setStatus("adding");

    // dedupe subcategories and remove "none"
    const cleaned = Array.from(
      new Set(
        subcategories
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

  async function onDeleteCategory() {
    if (!data || !clickedCategoryObject || status !== "initial" || isPending) return;
    setValidationError("");
    setStatus("deleting");
    try {
      await settingsMutateAsync({ type: "deleteCategory", category: clickedCategoryObject.category });
      setAddCategoryModal(false);
    } catch {
      setStatus("initial"); // error will show on UI
    }
  }

  async function onRenameCategory() {
    // TODO
  }

  async function onAddSubcategory() {
    // TODO
  }

  async function onDeleteSubcategory() {
    // TODO
  }

  async function onRenameSubcategory() {
    // TODO
  }

  return (
    <Modal
      title={isEdit ? "Edit Category" : "Add A Category With Subcategories"}
      setIsOpen={setAddCategoryModal}
      disableCloseButton={isPending}
    >
      <form className="mx-auto w-full max-w-[400px] min-h-full flex flex-col" onSubmit={onSubmit}>
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
            <div key={row.id} className="w-full flex items-center">
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
              <EditButtons
                setSubcategories={setSubcategories}
                validationError={validationError}
                setValidationError={setValidationError}
                status={status}
                setStatus={setStatus}
                index={index}
                subcategories={subcategories}
                isPending={isPending}
                rowId={row.id}
              />
            </div>
          ))}
        </div>

        {/*--- add subcategory field ---*/}
        <button
          className="mt-4 link flex items-center justify-center gap-1 font-medium"
          type="button"
          onClick={() => setSubcategories((prev) => [...prev, addId("")])}
          disabled={isPending || status !== "initial"}
        >
          <FaPlus />
          Add Subcategory Field
        </button>

        {/*--- button ---*/}
        <div className="mt-auto pt-[50px] w-full flex flex-col items-center">
          <div className="mb-[20px] errorText min-h-[1.3rem]">{validationError ? validationError : isError ? error?.message : ""}</div>
          {isEdit ? (
            <button className="buttonRed w-full" type="button" onClick={onDeleteCategory} disabled={isPending || status !== "initial"}>
              {status === "deleting" ? "Deleting..." : "Delete Category"}
            </button>
          ) : (
            <button className="button1 w-full" type="submit" disabled={isPending || status !== "initial"}>
              {isPending ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save" : "Add"}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
